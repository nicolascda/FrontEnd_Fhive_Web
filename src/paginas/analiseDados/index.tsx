import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Activity, CalendarDays, Clock3, Download, Info, PieChart, SlidersHorizontal, TrendingUp, Zap } from "lucide-react";
import { BarraNavegacaoLogado } from "../../componentes/BarraNavegacaoLogado";
import { FooterBar } from "../../componentes/FooterBar";
import { GraficoEnergia, type ItemPizza, type SerieGrafico } from "../../componentes/GraficoEnergia";
import { ModalSelecaoMaquinas, type ModoComparacao } from "../../componentes/ModalAnalise";
import { CHAVE_AMBIENTE, CHAVE_EQUIPE } from "../../dados/rotinasEquipe";
import type { MaquinaLocal, StatusMaquina } from "../rotinaAparelhos/tipos";
import imagemAutomacao from "../../imagens/AutomatizacaoImagem.jpg";
import imagemIndustria from "../../imagens/Empresa3D.png";
import styles from "./styles.module.css";

type Periodo = "diario" | "semanal" | "anual";
type TipoGrafico = "area" | "pizza";

const CORES = ["#55cdb4", "#b951d4", "#e5a24e", "#4f86d9", "#d86b70", "#899b46", "#50a7bd", "#8c76cf"];
const ROTULOS_PERIODOS: Record<Periodo, string> = {
  diario: "Diário",
  semanal: "Semanal",
  anual: "Anual",
};
const ROTULOS_X: Record<Periodo, string[]> = {
  diario: Array.from({ length: 24 }, (_, indice) => `${String(indice).padStart(2, "0")}h`),
  semanal: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
  anual: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
};

function hashTexto(texto: string) {
  return [...texto].reduce((soma, letra) => (soma * 31 + letra.charCodeAt(0)) % 997, 7);
}

/** Usa a telemetria local existente quando disponível; caso contrário, monta dados de demonstração. */
function lerMaquinasAnalise(equipeId: string): MaquinaLocal[] {
  try {
    const salvo = window.localStorage.getItem(`${CHAVE_AMBIENTE}${equipeId}`);
    if (salvo !== null) {
      const dados: unknown = JSON.parse(salvo);
      if (Array.isArray(dados)) {
        return dados.filter((maquina): maquina is MaquinaLocal =>
          Boolean(maquina && typeof maquina === "object" && maquina.equipeId === equipeId && maquina.id && maquina.nome),
        );
      }
    }
  } catch (erro) {
    console.warn("Não foi possível ler os equipamentos locais para análise.", erro);
  }

  const agora = new Date().toISOString();
  return [
    {
      id: `${equipeId}-analise-robo`,
      equipeId,
      nome: "Braço robótico 01",
      tipo: "Robô industrial",
      funcao: "Fabricação de materiais metálicos",
      status: "erro",
      potenciaKw: 5,
      energiaHojeKwh: 18.4,
      horasHoje: 5.2,
      horasTotais: 120,
      rotina: null,
      erro: "Alerta demonstrativo",
      criadaEm: agora,
    },
    {
      id: `${equipeId}-analise-cnc`,
      equipeId,
      nome: "Centro CNC 02",
      tipo: "CNC",
      funcao: "Usinagem de peças",
      status: "online",
      potenciaKw: 7.5,
      energiaHojeKwh: 24.8,
      horasHoje: 6.1,
      horasTotais: 231,
      rotina: null,
      erro: null,
      criadaEm: agora,
    },
  ];
}

/** Lê o nome da equipe pela chave que o ambiente 3D já usa. */
function lerNomeEquipe(equipeId: string) {
  try {
    const salvo = window.localStorage.getItem(`${CHAVE_EQUIPE}${equipeId}`);
    if (!salvo) return equipeId === "demo-equipe" ? "Equipe de demonstração" : `Equipe ${equipeId}`;
    const equipe = JSON.parse(salvo) as { id?: string; nome?: string };
    return equipe.id === equipeId && equipe.nome ? equipe.nome : `Equipe ${equipeId}`;
  } catch {
    return `Equipe ${equipeId}`;
  }
}

/** Gera uma série estável por máquina para que os dados demonstrativos não mudem a cada renderização. */
function gerarValores(maquina: MaquinaLocal, periodo: Periodo): number[] {
  const quantidade = periodo === "diario" ? 24 : periodo === "semanal" ? 7 : 12;
  const semente = hashTexto(maquina.id);
  const base = Math.max(1, maquina.potenciaKw || 1);
  const valores = Array.from({ length: quantidade }, (_, indice) => {
    const variacao = 0.45 + (((semente + indice * 37 + indice * indice * 13) % 100) / 100) * 0.8;
    const turno = periodo === "diario" ? (indice >= 8 && indice <= 18 ? 1.25 : 0.42) : 1;
    const sazonal = periodo === "anual" ? 0.8 + Math.sin((indice / quantidade) * Math.PI * 2) * 0.18 : 1;
    return Math.max(0.3, base * variacao * turno * sazonal);
  });
  const alvo = periodo === "diario"
    ? Math.max(maquina.energiaHojeKwh || 0, base * 4)
    : periodo === "semanal"
      ? Math.max((maquina.energiaHojeKwh || base * 4) * 5.8, base * 20)
      : Math.max((maquina.energiaHojeKwh || base * 4) * 28, base * 90);
  const soma = valores.reduce((total, valor) => total + valor, 0);
  return valores.map((valor) => Number((valor / soma * alvo).toFixed(2)));
}

function rotuloStatus(status: StatusMaquina, erro?: string | null) {
  if (status === "erro" || erro?.trim()) return "Erro";
  if (status === "offline") return "Offline";
  if (status === "atencao") return "Atenção";
  return "Operacional";
}

/** Exporta todos os pontos que aparecem nos gráficos para um CSV que pode ser aberto no Excel. */
function baixarDadosCsv(equipeId: string, periodo: Periodo, series: SerieGrafico[], rotulos: string[]) {
  const linhas = [
    ["equipe_id", "periodo", "ponto", "maquina", "energia_kwh"].join(";"),
    ...series.flatMap((serie) => serie.valores.map((valor, indice) =>
      [equipeId, ROTULOS_PERIODOS[periodo], rotulos[indice], serie.nome, valor.toLocaleString("pt-BR")].join(";"),
    )),
  ];
  const arquivo = new Blob(["\uFEFF" + linhas.join("\r\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(arquivo);
  const link = document.createElement("a");
  link.href = url;
  link.download = `fhive-analise-${periodo}-${equipeId}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function TelaAnaliseDados() {
  const { equipeId: parametroEquipeId } = useParams<{ equipeId: string }>();
  const equipeId = parametroEquipeId || "demo-equipe";
  const equipeNome = useMemo(() => lerNomeEquipe(equipeId), [equipeId]);
  const [estadoMaquinas, setEstadoMaquinas] = useState(() => ({ equipeId, maquinas: lerMaquinasAnalise(equipeId) }));
  const maquinas = estadoMaquinas.equipeId === equipeId ? estadoMaquinas.maquinas : lerMaquinasAnalise(equipeId);
  const [modo, setModo] = useState<ModoComparacao>("individual");
  const [modalSelecaoAberto, setModalSelecaoAberto] = useState(false);
  const [periodo, setPeriodo] = useState<Periodo>("semanal");
  const [tipoGrafico, setTipoGrafico] = useState<TipoGrafico>("area");
  const [idsSelecionados, setIdsSelecionados] = useState<string[]>(() => lerMaquinasAnalise(equipeId).slice(0, 1).map((maquina) => maquina.id));

  useEffect(() => {
    const novasMaquinas = lerMaquinasAnalise(equipeId);
    setEstadoMaquinas({ equipeId, maquinas: novasMaquinas });
    setIdsSelecionados(novasMaquinas.slice(0, 1).map((maquina) => maquina.id));
    setModo("individual");
    setModalSelecaoAberto(false);
  }, [equipeId]);

  // Se uma máquina for removida no ambiente, elimina sua seleção para evitar gráficos vazios indevidos.
  useEffect(() => {
    const idsValidos = new Set(maquinas.map((maquina) => maquina.id));
    setIdsSelecionados((atuais) => {
      const filtrados = atuais.filter((id) => idsValidos.has(id));
      return filtrados.length ? filtrados : maquinas.slice(0, 1).map((maquina) => maquina.id);
    });
  }, [maquinas]);

  const selecionadas = useMemo(() => {
    const ids = modo === "individual" ? idsSelecionados.slice(0, 1) : idsSelecionados;
    return ids.map((id) => maquinas.find((maquina) => maquina.id === id)).filter((maquina): maquina is MaquinaLocal => Boolean(maquina));
  }, [idsSelecionados, maquinas, modo]);

  const rotulos = ROTULOS_X[periodo];
  const series: SerieGrafico[] = selecionadas.map((maquina, indice) => ({
    id: maquina.id,
    nome: maquina.nome,
    cor: CORES[indice % CORES.length],
    valores: gerarValores(maquina, periodo),
  }));

  const itensPizza: ItemPizza[] = useMemo(() => {
    if (series.length > 1) {
      return series.map((serie) => ({
        nome: serie.nome,
        valor: serie.valores.reduce((total, valor) => total + valor, 0),
        cor: serie.cor,
      }));
    }
    const serie = series[0];
    if (!serie) return [];
    const grupos = periodo === "diario"
      ? [{ nome: "Madrugada", inicio: 0, fim: 5 }, { nome: "Manhã", inicio: 6, fim: 11 }, { nome: "Tarde", inicio: 12, fim: 17 }, { nome: "Noite", inicio: 18, fim: 23 }]
      : periodo === "semanal"
        ? [{ nome: "Seg–Ter", inicio: 0, fim: 1 }, { nome: "Qua–Qui", inicio: 2, fim: 3 }, { nome: "Sex", inicio: 4, fim: 4 }, { nome: "Fim de semana", inicio: 5, fim: 6 }]
        : [{ nome: "1º trimestre", inicio: 0, fim: 2 }, { nome: "2º trimestre", inicio: 3, fim: 5 }, { nome: "3º trimestre", inicio: 6, fim: 8 }, { nome: "4º trimestre", inicio: 9, fim: 11 }];
    return grupos.map((grupo, indice) => ({
      nome: grupo.nome,
      valor: serie.valores.slice(grupo.inicio, grupo.fim + 1).reduce((total, valor) => total + valor, 0),
      cor: CORES[indice],
    }));
  }, [periodo, series]);

  // A página só controla se o modal está aberto; a seleção temporária fica isolada no componente do modal.
  const abrirModalSelecao = () => setModalSelecaoAberto(true);
  const fecharModalSelecao = useCallback(() => setModalSelecaoAberto(false), []);

  // Aplica a seleção confirmada pelo modal e atualiza os gráficos da página.
  const confirmarSelecao = useCallback((novoModo: ModoComparacao, novosIds: string[]) => {
    if (!novosIds.length) return;
    setModo(novoModo);
    setIdsSelecionados(novoModo === "individual" ? novosIds.slice(0, 1) : [...novosIds]);
    setModalSelecaoAberto(false);
  }, []);

  return (
    <div className={styles.pagina}>
      <BarraNavegacaoLogado equipeAtualNome={equipeNome} equipeAtualId={equipeId} />

      <header className={styles.cabecalhoPagina}>
        <div className={`${styles.tituloCabecalho}`}><h1>Análise dos Dados</h1>  <span> - {equipeNome}</span></div>
        <Link to={`/rotina-aparelhos/${encodeURIComponent(equipeId)}`} className={styles.linkAmbiente}>Abrir ambiente 3D</Link>
      </header>

      <main className={styles.conteudo}>
        <div className={styles.gradeAnalise}>
          <aside className={styles.colunaMaquinas}>

            <div className={styles.tituloColuna}>
              <h2>{selecionadas.length > 1 ? "Máquinas comparadas" : "Máquina selecionada"}</h2>
              <span>{selecionadas.length}</span>
            </div>

            {selecionadas.length <= 2 ? (
              <div className={styles.cardsMaquinas}>
                {selecionadas.map((maquina, indice) => {
                  const statusExibido = maquina.status === "erro" || maquina.erro?.trim() ? "erro" : maquina.status;
                  return (
                    <article className={styles.cardMaquina} key={maquina.id}>
                      <img src={indice % 2 === 0 ? imagemAutomacao : imagemIndustria} alt="" />
                      <div className={styles.dadosMaquina}>
                        <span className={styles.rotuloModelo}>Equipamento</span>
                        <strong>{maquina.nome}</strong>
                        <small>{maquina.tipo}</small>
                        <span className={styles.rotuloEnergia}><Zap size={14} /> Potência nominal</span>
                        <strong>{maquina.potenciaKw.toLocaleString("pt-BR")} kW</strong>
                        <span className={styles.idMaquina}>ID: {maquina.id}</span>
                        <span className={`${styles.statusTexto} ${styles[`texto-${statusExibido}`]}`}>{rotuloStatus(maquina.status, maquina.erro)}</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <ol className={styles.listaOrdenada}>
                {selecionadas.map((maquina, indice) => (
                  <li key={maquina.id}>
                    <span className={styles.numeroMaquina}>{String(indice + 1).padStart(2, "0")}</span>
                    <span className={styles.amostraCor} style={{ backgroundColor: CORES[indice % CORES.length] }} />
                    <span className={styles.nomeMaquina}><strong>{maquina.nome}</strong><small>{maquina.tipo} · {maquina.id}</small></span>
                    <span className={styles.valorConsumo}>{(maquina.energiaHojeKwh || 0).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} kWh</span>
                  </li>
                ))}
              </ol>
            )}

            <div className={styles.resumoConsumo}>
              <span><Activity size={15} /> Consumo estimado no período</span>
              <strong>{series.reduce((total, serie) => total + serie.valores.reduce((soma, valor) => soma + valor, 0), 0).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} <small>kWh</small></strong>
            </div>
          </aside>

          <section className={styles.colunaGrafico}>
            {/* Este cabeçalho acompanha o gráfico e também permite reabrir o modal de comparação. */}
            <div className={styles.cabecalhoComparacao}>
              <div>
                <span className={styles.miniTituloComparacao}>TIPO DE COMPARAÇÃO</span>
                <h2>{modo === "individual" ? "Análise de uma máquina" : "Comparação entre máquinas"}</h2>
                <p>{selecionadas.length === 1 ? selecionadas[0].nome : `${selecionadas.length} equipamentos da equipe`}</p>
              </div>
              <button type="button" className={styles.botaoAlterarComparacao} onClick={abrirModalSelecao}>
                <SlidersHorizontal size={15} /> Alterar
              </button>
            </div>

            <div className={styles.controlesGrafico}>
              <div className={styles.abasPeriodo} role="tablist" aria-label="Período do gráfico">
                {(["anual", "semanal", "diario"] as Periodo[]).map((item) => (
                  <button type="button" role="tab" aria-selected={periodo === item} key={item} className={periodo === item ? styles.abaAtiva : ""} onClick={() => setPeriodo(item)}>
                    {item === "diario" ? <Clock3 size={14} /> : <CalendarDays size={14} />} {ROTULOS_PERIODOS[item]}
                  </button>
                ))}
              </div>
              <div className={styles.seletorGrafico} role="group" aria-label="Tipo de gráfico">
                <span>Tipo de gráfico</span>
                <button type="button" className={tipoGrafico === "area" ? styles.tipoAtivo : ""} onClick={() => setTipoGrafico("area")} aria-pressed={tipoGrafico === "area"}><TrendingUp size={15} /> Área</button>
                <button type="button" className={tipoGrafico === "pizza" ? styles.tipoAtivo : ""} onClick={() => setTipoGrafico("pizza")} aria-pressed={tipoGrafico === "pizza"}><PieChart size={15} /> Pizza</button>
              </div>
            </div>

            {selecionadas.length === 0 ? (
              <div className={styles.semMaquinas}><Info size={18} /> Selecione pelo menos uma máquina para visualizar os dados.</div>
            ) : (
              <GraficoEnergia
                tipo={tipoGrafico}
                rotuloPeriodo={ROTULOS_PERIODOS[periodo]}
                rotulos={rotulos}
                series={series}
                itensPizza={itensPizza}
              />
            )}

            <button type="button" className={styles.botaoDownloadDados} onClick={() => baixarDadosCsv(equipeId, periodo, series, rotulos)} disabled={!series.length}>
              <Download size={18} /> Baixar dados em CSV
            </button>
          </section>
        </div>
      </main>

      <FooterBar/>

      {/* O componente encapsula toda a interface e o estado temporário do seletor de máquinas. */}
      <ModalSelecaoMaquinas
        aberto={modalSelecaoAberto}
        equipeNome={equipeNome}
        maquinas={maquinas}
        modoAtual={modo}
        idsSelecionados={idsSelecionados}
        onFechar={fecharModalSelecao}
        onConfirmar={confirmarSelecao}
      />

      
    </div>
  );
}