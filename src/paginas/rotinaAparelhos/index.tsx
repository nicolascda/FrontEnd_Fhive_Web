import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Activity,
  Check,
  Clock3,
  Cog,
  Factory,
  Gauge,
  Info,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  X,
  Zap,
  Boxes,
  Truck,
  Wrench,
} from "lucide-react";
import { BarraNavegacaoLogado } from "../../componentes/BarraNavegacaoLogado";
import { CenaIndustrial } from "./CenaIndustrial.tsx";
import type { EquipeAmbiente, MaquinaLocal, RotinaLocal, StatusMaquina } from "./tipos.ts";
import styles from "./styles.module.css";

type PainelLateral = "detalhes" | "adicionar" | null;

type FormularioMaquina = {
  nome: string;
  tipo: string;
  funcao: string;
  potenciaKw: string;
};

type FormularioRotina = {
  nome: string;
  descricao: string;
  horarioInicial: string;
  horarioFinal: string;
};

const CHAVE_AMBIENTE = "fhive:ambiente-industrial:";
const CHAVE_EQUIPE = "fhive:equipe-ambiente:";

const modelosDisponiveis = [
  { valor: "Robô industrial", rotulo: "Braço robótico", Icone: Cog },
  { valor: "CNC", rotulo: "Centro de usinagem", Icone: Factory },
  { valor: "Esteira", rotulo: "Esteira transportadora", Icone: Truck },
  { valor: "Prensa hidráulica", rotulo: "Prensa hidráulica", Icone: Wrench },
  { valor: "Outro", rotulo: "Outro equipamento", Icone: Boxes },
];

function criarId(prefixo: string) {
  return `${prefixo}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function criarRotinaInicial(equipeId: string): RotinaLocal {
  return {
    id: `${equipeId}-rotina-robo-inicial`,
    nome: "Fabricação de materiais metálicos",
    descricao: "Ciclo automatizado de produção e movimentação de peças.",
    horarioInicial: "08:00",
    horarioFinal: "17:00",
    diasSemana: ["Seg", "Ter", "Qua", "Qui", "Sex"],
  };
}

function criarMaquinasDemonstracao(equipeId: string): MaquinaLocal[] {
  const agora = new Date().toISOString();

  return [
    {
      id: `${equipeId}-maquina-robo-demo`,
      equipeId,
      nome: "Braço robótico 01",
      tipo: "Robô industrial",
      funcao: "Fabricação de materiais metálicos",
      status: "erro",
      potenciaKw: 5,
      energiaHojeKwh: 18.4,
      horasHoje: 5.2,
      horasTotais: 120,
      rotina: criarRotinaInicial(equipeId),
      erro: "Temperatura do motor acima do limite recomendado. Verifique a ventilação e a lubrificação antes de retomar o ciclo.",
      criadaEm: agora,
    },
  ];
}

function lerMaquinasEquipe(equipeId: string): MaquinaLocal[] {
  if (!equipeId || typeof window === "undefined") return [];

  try {
    const salvo = window.localStorage.getItem(`${CHAVE_AMBIENTE}${equipeId}`);
    if (salvo !== null) {
      const valor: unknown = JSON.parse(salvo);
      if (Array.isArray(valor)) {
        return valor.filter((item): item is MaquinaLocal =>
          Boolean(item && typeof item === "object" && item.equipeId === equipeId),
        );
      }
    }
  } catch (erro) {
    console.warn("Não foi possível ler o ambiente local desta equipe.", erro);
  }

  return criarMaquinasDemonstracao(equipeId);
}

function lerEquipeSalva(equipeId: string): EquipeAmbiente | null {
  if (!equipeId || typeof window === "undefined") return null;
  try {
    const salvo = window.localStorage.getItem(`${CHAVE_EQUIPE}${equipeId}`);
    if (!salvo) return null;
    const equipe: unknown = JSON.parse(salvo);
    if (equipe && typeof equipe === "object" && "id" in equipe && equipe.id === equipeId) {
      return equipe as EquipeAmbiente;
    }
  } catch (erro) {
    console.warn("Não foi possível ler os dados locais da equipe.", erro);
  }
  return null;
}

function formatarNumero(valor: number, casas = 1) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

function rotuloStatus(status: StatusMaquina) {
  const rotulos: Record<StatusMaquina, string> = {
    online: "Operacional",
    offline: "Aguardando conexão",
    atencao: "Atenção",
    erro: "Erro identificado",
  };
  return rotulos[status];
}

export function TelaRotinaAparelhos() {
  const { equipeId: equipeIdParametro } = useParams<{ equipeId: string }>();
  const equipeId = equipeIdParametro || "demo-equipe";
  const location = useLocation();
  const navigate = useNavigate();

  const equipeRecebida = (location.state as { equipe?: EquipeAmbiente } | null)?.equipe;
  const equipe = useMemo<EquipeAmbiente>(() => {
    if (equipeRecebida?.id === equipeId) return equipeRecebida;
    const equipeSalva = lerEquipeSalva(equipeId);
    if (equipeSalva) return equipeSalva;
    return {
      id: equipeId,
      nome: equipeId === "demo-equipe" ? "Equipe de demonstração" : `Equipe ${equipeId}`,
      setor: "Ambiente industrial",
    };
  }, [equipeId, equipeRecebida]);

  const [estadoAmbiente, setEstadoAmbiente] = useState(() => ({
    equipeId,
    maquinas: lerMaquinasEquipe(equipeId),
  }));
  const [maquinaSelecionadaId, setMaquinaSelecionadaId] = useState<string | null>(null);
  const [painelLateral, setPainelLateral] = useState<PainelLateral>(null);
  const [modalRotinaAberto, setModalRotinaAberto] = useState(false);
  const [formularioMaquina, setFormularioMaquina] = useState<FormularioMaquina>({
    nome: "",
    tipo: "Robô industrial",
    funcao: "",
    potenciaKw: "5",
  });
  const [formularioRotina, setFormularioRotina] = useState<FormularioRotina>({
    nome: "",
    descricao: "",
    horarioInicial: "08:00",
    horarioFinal: "17:00",
  });
  const [mensagemFormulario, setMensagemFormulario] = useState("");

  const maquinas = estadoAmbiente.equipeId === equipeId
    ? estadoAmbiente.maquinas
    : lerMaquinasEquipe(equipeId);
  const maquinaSelecionada = maquinas.find((maquina) => maquina.id === maquinaSelecionadaId) || null;

  useEffect(() => {
    setEstadoAmbiente({ equipeId, maquinas: lerMaquinasEquipe(equipeId) });
    setMaquinaSelecionadaId(null);
    setPainelLateral(null);
    setModalRotinaAberto(false);
    setMensagemFormulario("");
  }, [equipeId]);

  useEffect(() => {
    if (estadoAmbiente.equipeId !== equipeId) return;
    try {
      window.localStorage.setItem(
        `${CHAVE_AMBIENTE}${equipeId}`,
        JSON.stringify(estadoAmbiente.maquinas),
      );
    } catch (erro) {
      console.warn("Não foi possível salvar as máquinas neste navegador.", erro);
    }
  }, [estadoAmbiente, equipeId]);

  useEffect(() => {
    if (equipeRecebida?.id !== equipeId) return;
    try {
      window.localStorage.setItem(`${CHAVE_EQUIPE}${equipeId}`, JSON.stringify(equipeRecebida));
    } catch (erro) {
      console.warn("Não foi possível salvar o contexto da equipe neste navegador.", erro);
    }
  }, [equipeId, equipeRecebida]);

  const maquinasCena = useMemo(() => maquinas.map((maquina) => ({
    id: maquina.id,
    nome: maquina.nome,
    tipo: maquina.tipo,
    status: maquina.status,
    possuiErro: maquina.status === "erro" || Boolean(maquina.erro),
  })), [maquinas]);

  const atualizarMaquinas = (atualizar: (atuais: MaquinaLocal[]) => MaquinaLocal[]) => {
    setEstadoAmbiente((estado) => {
      const atuais = estado.equipeId === equipeId ? estado.maquinas : lerMaquinasEquipe(equipeId);
      return { equipeId, maquinas: atualizar(atuais) };
    });
  };

  const selecionarMaquina = (id: string) => {
    setMaquinaSelecionadaId(id);
    setPainelLateral("detalhes");
    setMensagemFormulario("");
  };

  const adicionarMaquina = () => {
    const nome = formularioMaquina.nome.trim();
    const funcao = formularioMaquina.funcao.trim();
    const potenciaKw = Number(formularioMaquina.potenciaKw);

    if (!nome) {
      setMensagemFormulario("Informe um nome para o maquinário.");
      return;
    }
    if (!Number.isFinite(potenciaKw) || potenciaKw < 0) {
      setMensagemFormulario("Informe uma potência válida, igual ou maior que zero.");
      return;
    }

    const novaMaquina: MaquinaLocal = {
      id: criarId(`${equipeId}-maquina`),
      equipeId,
      nome,
      tipo: formularioMaquina.tipo,
      funcao: funcao || "Função ainda não definida",
      status: "offline",
      potenciaKw,
      energiaHojeKwh: 0,
      horasHoje: 0,
      horasTotais: 0,
      rotina: null,
      erro: null,
      criadaEm: new Date().toISOString(),
    };

    atualizarMaquinas((atuais) => [...atuais, novaMaquina]);
    setMaquinaSelecionadaId(novaMaquina.id);
    setPainelLateral("detalhes");
    setFormularioMaquina({ nome: "", tipo: "Robô industrial", funcao: "", potenciaKw: "5" });
    setMensagemFormulario("");
  };

  const abrirFormularioRotina = () => {
    if (!maquinaSelecionada) return;
    setFormularioRotina({
      nome: maquinaSelecionada.rotina?.nome || "",
      descricao: maquinaSelecionada.rotina?.descricao || maquinaSelecionada.funcao,
      horarioInicial: maquinaSelecionada.rotina?.horarioInicial || "08:00",
      horarioFinal: maquinaSelecionada.rotina?.horarioFinal || "17:00",
    });
    setMensagemFormulario("");
    setModalRotinaAberto(true);
  };

  const salvarRotina = () => {
    if (!maquinaSelecionada) return;
    if (!formularioRotina.nome.trim()) {
      setMensagemFormulario("Informe o nome da rotina.");
      return;
    }

    const rotina: RotinaLocal = {
      id: maquinaSelecionada.rotina?.id || criarId(`${equipeId}-rotina`),
      nome: formularioRotina.nome.trim(),
      descricao: formularioRotina.descricao.trim(),
      horarioInicial: formularioRotina.horarioInicial,
      horarioFinal: formularioRotina.horarioFinal,
      diasSemana: ["Seg", "Ter", "Qua", "Qui", "Sex"],
    };

    atualizarMaquinas((atuais) => atuais.map((maquina) =>
      maquina.id === maquinaSelecionada.id ? { ...maquina, rotina } : maquina,
    ));
    setModalRotinaAberto(false);
    setMensagemFormulario("");
  };

  const excluirMaquinaSelecionada = () => {
    if (!maquinaSelecionada) return;
    const idRemovido = maquinaSelecionada.id;
    atualizarMaquinas((atuais) => atuais.filter((maquina) => maquina.id !== idRemovido));
    setMaquinaSelecionadaId(null);
    setPainelLateral(null);
  };

  const alternarAlertaDemonstracao = () => {
    if (!maquinaSelecionada) return;
    const maquinaAtual = maquinaSelecionada;
    const temErro = maquinaAtual.status === "erro" || Boolean(maquinaAtual.erro);
    atualizarMaquinas((atuais) => atuais.map((maquina) => {
      if (maquina.id !== maquinaAtual.id) return maquina;
      return temErro
        ? { ...maquina, status: "online", erro: null }
        : {
            ...maquina,
            status: "erro",
            erro: "Alerta simulado para testar o painel: verifique as condições do equipamento.",
          };
    }));
  };

  const voltar = () => {
    navigate(equipeId === "demo-equipe" ? "/" : "/configuracoes-equipe");
  };

  return (
    <div className={styles.pagina}>
      <BarraNavegacaoLogado equipeAtualNome={equipe.nome} equipeAtualId={equipeId} />

      <header className={styles.cabecalhoEquipe}>
        <div className={styles.tituloEquipe}>
          <span className={styles.miniTitulo}>AMBIENTE INDUSTRIAL · EQUIPE {equipeId}</span>
          <h1>{equipe.nome}</h1>
        </div>
        <div className={styles.indicadoresCabecalho}>
          <span><Boxes size={16} /> {maquinas.length} {maquinas.length === 1 ? "maquinário" : "maquinários"}</span>
          <span className={styles.seloLocal}><Activity size={14} /> Modo local</span>
        </div>
      </header>

      <main className={styles.areaTrabalho}>
        <section className={styles.areaCena} aria-label={`Ambiente 3D da equipe ${equipe.nome}`}>
          <CenaIndustrial
            maquinas={maquinasCena}
            maquinaSelecionadaId={maquinaSelecionadaId}
            aoSelecionar={(maquina) => selecionarMaquina(maquina.id)}
          />

          <div className={styles.acoesFlutuantes}>
            <button
              type="button"
              className={styles.botaoFlutuante}
              aria-label="Adicionar maquinário"
              title="Adicionar maquinário"
              onClick={() => {
                setPainelLateral((atual) => atual === "adicionar" ? null : "adicionar");
                setMensagemFormulario("");
              }}
            >
              <Plus size={32} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              className={`${styles.botaoFlutuante} ${styles.botaoVoltar}`}
              aria-label="Voltar para equipes"
              title="Voltar para equipes"
              onClick={voltar}
            >
              <ArrowLeft size={30} strokeWidth={2.5} />
            </button>
          </div>

          <div className={styles.avisoDadosLocais}>
            <Info size={15} />
            <span>Dados demonstrativos salvos neste navegador e separados por equipe.</span>
          </div>

          {painelLateral === "detalhes" && maquinaSelecionada && (
            <aside className={styles.painelLateral} aria-label="Informações do maquinário">
              <div className={styles.topoPainel}>
                <div>
                  <span className={styles.miniTituloPainel}>DETALHES DO EQUIPAMENTO</span>
                  <h2>{maquinaSelecionada.nome}</h2>
                  <p>{maquinaSelecionada.tipo}</p>
                </div>
                <button type="button" className={styles.botaoFechar} aria-label="Fechar painel" onClick={() => setPainelLateral(null)}>
                  <X size={22} />
                </button>
              </div>

              <div className={styles.statusEquipamento}>
                <span className={`${styles.indicadorStatus} ${styles[`status-${maquinaSelecionada.status}`]}`} />
                <span>{rotuloStatus(maquinaSelecionada.status)}</span>
                {maquinaSelecionada.status === "erro" && <AlertTriangle size={17} />}
              </div>

              {maquinaSelecionada.status === "erro" && maquinaSelecionada.erro && (
                <section className={styles.cartaoErro}>
                  <div className={styles.tituloErro}><AlertTriangle size={18} /><strong>Alerta do equipamento</strong></div>
                  <p>{maquinaSelecionada.erro}</p>
                  <small>Alerta demonstrativo — ainda sem leitura de um dispositivo físico.</small>
                </section>
              )}

              <section className={styles.blocoInformacao}>
                <h3>Função sendo exercida</h3>
                <p>{maquinaSelecionada.funcao}</p>
              </section>

              <section className={styles.gradeIndicadores}>
                <article className={styles.indicadorCard}>
                  <span><Zap size={16} /> Potência atual</span>
                  <strong>{formatarNumero(maquinaSelecionada.potenciaKw)} <small>kW</small></strong>
                </article>
                <article className={styles.indicadorCard}>
                  <span><Gauge size={16} /> Energia hoje</span>
                  <strong>{formatarNumero(maquinaSelecionada.energiaHojeKwh)} <small>kWh</small></strong>
                </article>
                <article className={styles.indicadorCard}>
                  <span><Clock3 size={16} /> Horas hoje</span>
                  <strong>{formatarNumero(maquinaSelecionada.horasHoje)} <small>h</small></strong>
                </article>
                <article className={styles.indicadorCard}>
                  <span><Activity size={16} /> Horas acumuladas</span>
                  <strong>{formatarNumero(maquinaSelecionada.horasTotais)} <small>h</small></strong>
                </article>
              </section>

              <section className={styles.blocoRotina}>
                <div className={styles.tituloBloco}>
                  <div><RotateCcw size={18} /><h3>Rotina aplicada</h3></div>
                  <button type="button" onClick={abrirFormularioRotina}>
                    {maquinaSelecionada.rotina ? "Editar" : "Adicionar"}
                  </button>
                </div>
                {maquinaSelecionada.rotina ? (
                  <div className={styles.dadosRotina}>
                    <strong>{maquinaSelecionada.rotina.nome}</strong>
                    {maquinaSelecionada.rotina.descricao && <p>{maquinaSelecionada.rotina.descricao}</p>}
                    <span><Clock3 size={15} /> {maquinaSelecionada.rotina.horarioInicial} – {maquinaSelecionada.rotina.horarioFinal}</span>
                    <div className={styles.diasSemana}>
                      {maquinaSelecionada.rotina.diasSemana.map((dia) => <span key={dia}>{dia}</span>)}
                    </div>
                  </div>
                ) : (
                  <p className={styles.semRotina}>Nenhuma rotina foi aplicada a este equipamento.</p>
                )}
              </section>

              <div className={styles.acoesEquipamento}>
                <button type="button" className={styles.botaoPrimario} onClick={abrirFormularioRotina}>
                  <RotateCcw size={17} /> Aplicar rotina
                </button>
                <button type="button" className={styles.botaoSecundario} onClick={alternarAlertaDemonstracao}>
                  {maquinaSelecionada.status === "erro" ? <Check size={17} /> : <AlertTriangle size={17} />}
                  {maquinaSelecionada.status === "erro" ? "Limpar alerta de teste" : "Simular alerta"}
                </button>
                <button type="button" className={styles.botaoExcluir} onClick={excluirMaquinaSelecionada}>
                  <Trash2 size={17} /> Remover do ambiente
                </button>
              </div>

              <p className={styles.notaPainel}>Os indicadores são exemplos locais. Eles não representam telemetria real nem comandos enviados à máquina.</p>
            </aside>
          )}

          {painelLateral === "adicionar" && (
            <aside className={`${styles.painelLateral} ${styles.painelAdicionar}`} aria-label="Adicionar maquinário">
              <div className={styles.topoPainel}>
                <div>
                  <span className={styles.miniTituloPainel}>AMBIENTE DA EQUIPE</span>
                  <h2>Adicionar modelos</h2>
                  <p>Escolha um modelo para posicionar no galpão.</p>
                </div>
                <button type="button" className={styles.botaoFechar} aria-label="Fechar painel" onClick={() => setPainelLateral(null)}>
                  <X size={22} />
                </button>
              </div>

              <form className={styles.formularioEquipamento} onSubmit={(evento) => { evento.preventDefault(); adicionarMaquina(); }}>
                <div className={styles.gradeModelos}>
                  {modelosDisponiveis.map(({ valor, rotulo, Icone }) => (
                    <button
                      key={valor}
                      type="button"
                      className={`${styles.modeloCard} ${formularioMaquina.tipo === valor ? styles.modeloSelecionado : ""}`}
                      onClick={() => setFormularioMaquina((atual) => ({ ...atual, tipo: valor }))}
                      aria-pressed={formularioMaquina.tipo === valor}
                    >
                      <Icone size={24} />
                      <span>{rotulo}</span>
                    </button>
                  ))}
                </div>

                <label className={styles.campoFormulario}>
                  Nome do maquinário
                  <input
                    value={formularioMaquina.nome}
                    onChange={(evento) => setFormularioMaquina((atual) => ({ ...atual, nome: evento.target.value }))}
                    placeholder="Ex.: Robô de soldagem 02"
                    maxLength={70}
                    required
                  />
                </label>

                <label className={styles.campoFormulario}>
                  Função do equipamento
                  <input
                    value={formularioMaquina.funcao}
                    onChange={(evento) => setFormularioMaquina((atual) => ({ ...atual, funcao: evento.target.value }))}
                    placeholder="Ex.: Soldagem de estruturas metálicas"
                    maxLength={120}
                  />
                </label>

                <label className={styles.campoFormulario}>
                  Potência nominal (kW)
                  <input
                    type="number"
                    value={formularioMaquina.potenciaKw}
                    onChange={(evento) => setFormularioMaquina((atual) => ({ ...atual, potenciaKw: evento.target.value }))}
                    min="0"
                    step="0.1"
                    required
                  />
                </label>

                {mensagemFormulario && !modalRotinaAberto && <p className={styles.erroFormulario}>{mensagemFormulario}</p>}
                <div className={styles.avisoFormulario}><Info size={16} /> O equipamento será salvo localmente para a equipe <strong>{equipe.nome}</strong>. Nenhuma conexão física será feita nesta etapa.</div>

                <button type="submit" className={styles.botaoPrimario}>
                  <Plus size={18} /> Adicionar ao ambiente
                </button>
              </form>
            </aside>
          )}
        </section>
      </main>

      {modalRotinaAberto && maquinaSelecionada && (
        <div className={styles.fundoModal} role="presentation" onMouseDown={(evento) => {
          if (evento.target === evento.currentTarget) setModalRotinaAberto(false);
        }}>
          <section className={styles.modalRotina} role="dialog" aria-modal="true" aria-labelledby="titulo-modal-rotina">
            <div className={styles.topoModal}>
              <div>
                <span className={styles.miniTituloPainel}>CONFIGURAÇÃO LOCAL</span>
                <h2 id="titulo-modal-rotina">Aplicar rotina</h2>
                <p>{maquinaSelecionada.nome}</p>
              </div>
              <button type="button" className={styles.botaoFechar} aria-label="Fechar formulário" onClick={() => setModalRotinaAberto(false)}><X size={22} /></button>
            </div>

            <form className={styles.formularioRotina} onSubmit={(evento) => { evento.preventDefault(); salvarRotina(); }}>
              <label className={styles.campoFormulario}>
                Nome da rotina
                <input value={formularioRotina.nome} onChange={(evento) => setFormularioRotina((atual) => ({ ...atual, nome: evento.target.value }))} placeholder="Ex.: Produção de peças" required maxLength={80} />
              </label>
              <label className={styles.campoFormulario}>
                Descrição / função
                <textarea value={formularioRotina.descricao} onChange={(evento) => setFormularioRotina((atual) => ({ ...atual, descricao: evento.target.value }))} placeholder="Descreva o que esta rotina representa" rows={3} maxLength={240} />
              </label>
              <div className={styles.camposHorario}>
                <label className={styles.campoFormulario}>
                  Horário inicial
                  <input type="time" value={formularioRotina.horarioInicial} onChange={(evento) => setFormularioRotina((atual) => ({ ...atual, horarioInicial: evento.target.value }))} required />
                </label>
                <label className={styles.campoFormulario}>
                  Horário final
                  <input type="time" value={formularioRotina.horarioFinal} onChange={(evento) => setFormularioRotina((atual) => ({ ...atual, horarioFinal: evento.target.value }))} required />
                </label>
              </div>
              {mensagemFormulario && <p className={styles.erroFormulario}>{mensagemFormulario}</p>}
              <p className={styles.avisoFormulario}><Info size={16} /> A rotina ficará vinculada apenas a esta máquina e equipe neste navegador.</p>
              <div className={styles.botoesModal}>
                <button type="button" className={styles.botaoSecundario} onClick={() => setModalRotinaAberto(false)}>Cancelar</button>
                <button type="submit" className={styles.botaoPrimario}><Save size={17} /> Salvar rotina</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}