import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Activity, Check, ChevronDown, ChevronUp, Clock3, CalendarDays, ListOrdered, Cog, Factory, Gauge, Info, Plus, RotateCcw, Save, Trash2, X, Zap, Boxes, Truck, Wrench, } 
from "lucide-react";
import { BarraNavegacaoLogado } from "../../componentes/BarraNavegacaoLogado";
import { CenaIndustrial } from "./CenaIndustrial";
import type { AcaoRotinaLocal, EquipeAmbiente, MaquinaLocal, RotinaLocal, StatusMaquina } from "./tipos";
import styles from "./styles.module.css";

// Controla quais painéis estão abertos sobre a visualização 3D.
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
  diasSemana: string[];
  acoes: AcaoRotinaLocal[];
};

// As chaves incluem o ID da equipe para que cada ambiente e suas rotinas
// permaneçam separados no localStorage durante esta etapa sem backend.
const CHAVE_AMBIENTE = "fhive:ambiente-industrial:";
const CHAVE_EQUIPE = "fhive:equipe-ambiente:";

// Abreviações usadas nos botões de seleção dos dias da semana.
const DIAS_SEMANA = [
  { valor: "Seg", nome: "Segunda-feira" },
  { valor: "Ter", nome: "Terça-feira" },
  { valor: "Qua", nome: "Quarta-feira" },
  { valor: "Qui", nome: "Quinta-feira" },
  { valor: "Sex", nome: "Sexta-feira" },
  { valor: "Sáb", nome: "Sábado" },
  { valor: "Dom", nome: "Domingo" },
];

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

// A rotina demonstrativa já vem com dias úteis e etapas em ordem cronológica,
// para ilustrar como a sequência de ações aparece no painel lateral.
function criarRotinaInicial(equipeId: string): RotinaLocal {
  return {
    id: `${equipeId}-rotina-robo-inicial`,
    nome: "Fabricação de materiais metálicos",
    descricao: "Ciclo automatizado de produção e movimentação de peças.",
    horarioInicial: "08:00",
    horarioFinal: "17:00",
    diasSemana: ["Seg", "Ter", "Qua", "Qui", "Sex"],
    acoes: [
      { id: `${equipeId}-acao-iniciar`, horario: "08:00", nome: "Iniciar produção", descricao: "Verificar a área de trabalho e iniciar o ciclo." },
      { id: `${equipeId}-acao-inspecao`, horario: "12:00", nome: "Inspeção intermediária", descricao: "Pausar para conferir a qualidade das peças." },
      { id: `${equipeId}-acao-retomar`, horario: "13:00", nome: "Retomar produção", descricao: "Retomar o ciclo após a inspeção." },
      { id: `${equipeId}-acao-finalizar`, horario: "17:00", nome: "Encerrar produção", descricao: "Concluir o ciclo e preparar o equipamento." },
    ],
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

// Carrega somente máquinas cujo campo equipeId coincide com a rota atual.
// Essa validação evita misturar equipamentos pertencentes a equipes diferentes.
function lerMaquinasEquipe(equipeId: string): MaquinaLocal[] {
  if (!equipeId || typeof window === "undefined") return [];

  try {
    const salvo = window.localStorage.getItem(`${CHAVE_AMBIENTE}${equipeId}`);
    if (salvo !== null) {
      const valor: unknown = JSON.parse(salvo);
      if (Array.isArray(valor)) {
        // Normaliza dados salvos por versões anteriores do frontend: rotinas antigas
        // podem ainda não ter o array de ações e precisam continuar abrindo normalmente.
        return valor
          .filter((item): item is MaquinaLocal =>
            Boolean(item && typeof item === "object" && item.equipeId === equipeId),
          )
          .map((maquina) => {
            if (!maquina.rotina) return maquina;
            const rotinaLegada = maquina.rotina as RotinaLocal & { acoes?: AcaoRotinaLocal[]; diasSemana?: string[] };
            return {
              ...maquina,
              rotina: {
                ...rotinaLegada,
                diasSemana: Array.isArray(rotinaLegada.diasSemana) ? rotinaLegada.diasSemana : ["Seg", "Ter", "Qua", "Qui", "Sex"],
                acoes: Array.isArray(rotinaLegada.acoes) ? rotinaLegada.acoes : [],
              },
            };
          });
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
  // Estado editável da rotina: dias escolhidos e ações agendadas são mantidos
  // juntos até o usuário confirmar o salvamento da configuração local.
  const [formularioRotina, setFormularioRotina] = useState<FormularioRotina>({
    nome: "",
    descricao: "",
    horarioInicial: "08:00",
    horarioFinal: "17:00",
    diasSemana: ["Seg", "Ter", "Qua", "Qui", "Sex"],
    acoes: [{ id: criarId("acao"), horario: "08:00", nome: "", descricao: "" }],
  });
  const [mensagemFormulario, setMensagemFormulario] = useState("");

  const maquinas = estadoAmbiente.equipeId === equipeId
    ? estadoAmbiente.maquinas
    : lerMaquinasEquipe(equipeId);
  const maquinaSelecionada = maquinas.find((maquina) => maquina.id === maquinaSelecionadaId) || null;
  // Considera tanto o status quanto a mensagem salva para manter painel e marcador 3D sincronizados.
  const maquinaSelecionadaTemErro = Boolean(
    maquinaSelecionada && (maquinaSelecionada.status === "erro" || maquinaSelecionada.erro?.trim()),
  );

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

  // Projeta os dados persistidos para o componente 3D, mantendo o estado de erro
  // derivado tanto do status quanto da mensagem, para que o alerta não dependa só do texto.
  const maquinasCena = useMemo(() => maquinas.map((maquina) => ({
    id: maquina.id,
    nome: maquina.nome,
    tipo: maquina.tipo,
    status: maquina.status,
    possuiErro: maquina.status === "erro" || Boolean(maquina.erro?.trim()),
    mensagemErro: maquina.erro,
    posicaoX: maquina.posicaoX,
    posicaoZ: maquina.posicaoZ,
  })), [maquinas]);

  // Todas as alterações da cena (cadastro, posição, rotina, erro e exclusão) passam
  // por esta função para preservar a coleção da equipe ativa.
  const atualizarMaquinas = (atualizar: (atuais: MaquinaLocal[]) => MaquinaLocal[]) => {
    setEstadoAmbiente((estado) => {
      const atuais = estado.equipeId === equipeId ? estado.maquinas : lerMaquinasEquipe(equipeId);
      return { equipeId, maquinas: atualizar(atuais) };
    });
  };

  // O clique em um objeto 3D seleciona o equipamento e abre a barra lateral.
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

  // Carrega a rotina atual no editor. Para rotinas antigas, fornece valores padrão
  // quando ainda não existiam dias selecionados ou ações individuais.
  const abrirFormularioRotina = () => {
    if (!maquinaSelecionada) return;
    const rotinaAtual = maquinaSelecionada.rotina;
    setFormularioRotina({
      nome: rotinaAtual?.nome || "",
      descricao: rotinaAtual?.descricao || maquinaSelecionada.funcao,
      horarioInicial: rotinaAtual?.horarioInicial || "08:00",
      horarioFinal: rotinaAtual?.horarioFinal || "17:00",
      diasSemana: rotinaAtual?.diasSemana?.length ? [...rotinaAtual.diasSemana] : ["Seg", "Ter", "Qua", "Qui", "Sex"],
      acoes: rotinaAtual?.acoes?.length
        ? rotinaAtual.acoes.map((acao) => ({ ...acao }))
        : [{ id: criarId("acao"), horario: rotinaAtual?.horarioInicial || "08:00", nome: "", descricao: "" }],
    });
    setMensagemFormulario("");
    setModalRotinaAberto(true);
  };

  // Atualiza uma ação identificada pelo próprio ID, sem modificar as outras etapas.
  const atualizarAcaoRotina = (acaoId: string, campos: Partial<AcaoRotinaLocal>) => {
    setFormularioRotina((atual) => ({
      ...atual,
      acoes: atual.acoes.map((acao) => acao.id === acaoId ? { ...acao, ...campos } : acao),
    }));
  };

  // Adiciona uma etapa nova ao final da sequência, inicialmente no horário da etapa anterior.
  const adicionarAcaoRotina = () => {
    setFormularioRotina((atual) => {
      const ultimaAcao = atual.acoes[atual.acoes.length - 1];
      return {
        ...atual,
        acoes: [...atual.acoes, {
          id: criarId("acao"),
          horario: ultimaAcao?.horario || atual.horarioInicial,
          nome: "",
          descricao: "",
        }],
      };
    });
    setMensagemFormulario("");
  };

  // Reordena uma etapa por vez. A validação no salvamento exige horários crescentes.
  const moverAcaoRotina = (indice: number, direcao: -1 | 1) => {
    setFormularioRotina((atual) => {
      const destino = indice + direcao;
      if (destino < 0 || destino >= atual.acoes.length) return atual;
      const acoes = [...atual.acoes];
      [acoes[indice], acoes[destino]] = [acoes[destino], acoes[indice]];
      return { ...atual, acoes };
    });
  };

  // Confere os campos e a ordem temporal antes de gravar a rotina na máquina selecionada.
  const salvarRotina = () => {
    if (!maquinaSelecionada) return;
    if (!formularioRotina.nome.trim()) {
      setMensagemFormulario("Informe o nome da rotina.");
      return;
    }
    if (formularioRotina.diasSemana.length === 0) {
      setMensagemFormulario("Selecione pelo menos um dia da semana.");
      return;
    }
    if (formularioRotina.acoes.length === 0) {
      setMensagemFormulario("Adicione pelo menos uma ação à rotina.");
      return;
    }
    if (formularioRotina.horarioFinal < formularioRotina.horarioInicial) {
      setMensagemFormulario("O horário final da rotina deve ser posterior ao inicial.");
      return;
    }

    for (let indice = 0; indice < formularioRotina.acoes.length; indice += 1) {
      const acao = formularioRotina.acoes[indice];
      if (!acao.nome.trim()) {
        setMensagemFormulario(`Informe o nome da ação ${indice + 1}.`);
        return;
      }
      if (acao.horario < formularioRotina.horarioInicial || acao.horario > formularioRotina.horarioFinal) {
        setMensagemFormulario(`A ação ${indice + 1} precisa estar entre o horário inicial e o final da rotina.`);
        return;
      }
      if (indice > 0 && acao.horario < formularioRotina.acoes[indice - 1].horario) {
        setMensagemFormulario("As ações precisam estar em ordem cronológica. Use as setas para reorganizar a sequência.");
        return;
      }
    }

    const rotina: RotinaLocal = {
      id: maquinaSelecionada.rotina?.id || criarId(`${equipeId}-rotina`),
      nome: formularioRotina.nome.trim(),
      descricao: formularioRotina.descricao.trim(),
      horarioInicial: formularioRotina.horarioInicial,
      horarioFinal: formularioRotina.horarioFinal,
      // Grava os dias na ordem do calendário, não na ordem em que os botões foram clicados.
      diasSemana: DIAS_SEMANA.filter((dia) => formularioRotina.diasSemana.includes(dia.valor)).map((dia) => dia.valor),
      acoes: formularioRotina.acoes.map((acao) => ({
        ...acao,
        nome: acao.nome.trim(),
        descricao: acao.descricao.trim(),
      })),
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

  // Simula ou limpa o alerta visual enquanto a integração com sensores reais não existe.
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
            aoMover={(id, posicaoX, posicaoZ) => {
              atualizarMaquinas((atuais) => atuais.map((maquina) => (
                maquina.id === id ? { ...maquina, posicaoX, posicaoZ } : maquina
              )));
            }}
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
            <Info size={18} />
            <span>Arraste uma máquina para reposicioná-la ou arraste o espaço vazio para girar a câmera. Posições salvas por equipe neste navegador.</span>
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
                <span className={`${styles.indicadorStatus} ${styles[`status-${maquinaSelecionadaTemErro ? "erro" : maquinaSelecionada.status}`]}`} />
                <span>{rotuloStatus(maquinaSelecionadaTemErro ? "erro" : maquinaSelecionada.status)}</span>
                {maquinaSelecionadaTemErro && <AlertTriangle size={17} />}
              </div>

              {maquinaSelecionadaTemErro && (
                <section className={styles.cartaoErro}>
                  <div className={styles.tituloErro}><AlertTriangle size={18} /><strong>Alerta do equipamento</strong></div>
                  <p>{maquinaSelecionada.erro || "O equipamento está marcado com erro, mas ainda não há uma mensagem detalhada cadastrada."}</p>
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
                    <div className={styles.diasSemana} aria-label="Dias programados">
                      {maquinaSelecionada.rotina.diasSemana.map((dia) => <span key={dia}>{dia}</span>)}
                    </div>
                    {maquinaSelecionada.rotina.acoes?.length > 0 && (
                      <ol className={styles.listaAcoesResumo} aria-label="Sequência de ações da rotina">
                        {maquinaSelecionada.rotina.acoes.map((acao, indice) => (
                          <li key={acao.id}>
                            <span className={styles.numeroAcaoResumo}>{indice + 1}</span>
                            <span className={styles.detalhesAcaoResumo}>
                              <strong>{acao.nome}</strong>
                              <small>{acao.horario}{acao.descricao ? ` · ${acao.descricao}` : ""}</small>
                            </span>
                          </li>
                        ))}
                      </ol>
                    )}
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
                  {maquinaSelecionadaTemErro ? <Check size={17} /> : <AlertTriangle size={17} />}
                  {maquinaSelecionadaTemErro ? "Limpar alerta de teste" : "Simular alerta"}
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
                      <Icone className={`${styles.modeloCardIcone}`} />
                      <span className={`${styles.modeloCardRotulo}`}>{rotulo}</span>
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
                <div className={styles.avisoFormulario}><Info size={16} /> O equipamento será salvo localmente para a equipe.</div>

                <button type="submit" className={styles.botaoPrimario}>
                  <Plus size={18} /> Adicionar ao ambiente
                </button>
              </form>
            </aside>
          )}
        </section>
      </main>

      {/* Editor da rotina local: seleciona os dias de execução e define as etapas
          com horário individual. O salvamento continua limitado ao navegador/equipe. */}
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
                <textarea value={formularioRotina.descricao} onChange={(evento) => setFormularioRotina((atual) => ({ ...atual, descricao: evento.target.value }))} placeholder="Descreva o objetivo desta rotina" rows={2} maxLength={240} />
              </label>

              {/* Dias da semana: mais de um dia pode ser ativado e cada opção tem
                  estado controlado pelo formulário para ser gravada junto à rotina. */}
              <fieldset className={styles.campoDiasSemana}>
                <legend><CalendarDays size={16} /> Dias de execução</legend>
                <div className={styles.seletorDiasSemana}>
                  {DIAS_SEMANA.map((dia) => {
                    const ativo = formularioRotina.diasSemana.includes(dia.valor);
                    return (
                      <label key={dia.valor} className={`${styles.opcaoDiaSemana} ${ativo ? styles.opcaoDiaSelecionada : ""}`} title={dia.nome}>
                        <input
                          type="checkbox"
                          checked={ativo}
                          onChange={() => setFormularioRotina((atual) => ({
                            ...atual,
                            diasSemana: ativo
                              ? atual.diasSemana.filter((valor) => valor !== dia.valor)
                              : [...atual.diasSemana, dia.valor],
                          }))}
                        />
                        <span>{dia.valor}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <div className={styles.camposHorario}>
                <label className={styles.campoFormulario}>
                  Horário inicial da rotina
                  <input type="time" value={formularioRotina.horarioInicial} onChange={(evento) => setFormularioRotina((atual) => ({ ...atual, horarioInicial: evento.target.value }))} required />
                </label>
                <label className={styles.campoFormulario}>
                  Horário final da rotina
                  <input type="time" value={formularioRotina.horarioFinal} onChange={(evento) => setFormularioRotina((atual) => ({ ...atual, horarioFinal: evento.target.value }))} required />
                </label>
              </div>

              {/* Cada cartão é uma ação sequencial com horário próprio. As setas
                  permitem reordenar as ações; o salvamento confere a ordem horária. */}
              <section className={styles.editorAcoesRotina} aria-labelledby="titulo-acoes-rotina">
                <div className={styles.cabecalhoAcoesRotina}>
                  <div>
                    <h3 id="titulo-acoes-rotina"><ListOrdered size={18} /> Ações da rotina</h3>
                    <p>Defina o horário e a sequência de cada etapa.</p>
                  </div>
                  <button type="button" className={styles.botaoAdicionarAcao} onClick={adicionarAcaoRotina}>
                    <Plus size={16} /> Adicionar ação
                  </button>
                </div>

                <div className={styles.listaEditorAcoes}>
                  {formularioRotina.acoes.map((acao, indice) => (
                    <article className={styles.cartaoAcaoRotina} key={acao.id}>
                      <div className={styles.controlesOrdemAcao} aria-label={`Ordem da ação ${indice + 1}`}>
                        <span>{indice + 1}</span>
                        <button type="button" title="Mover ação para cima" aria-label={`Mover ação ${indice + 1} para cima`} disabled={indice === 0} onClick={() => moverAcaoRotina(indice, -1)}>
                          <ChevronUp size={17} />
                        </button>
                        <button type="button" title="Mover ação para baixo" aria-label={`Mover ação ${indice + 1} para baixo`} disabled={indice === formularioRotina.acoes.length - 1} onClick={() => moverAcaoRotina(indice, 1)}>
                          <ChevronDown size={17} />
                        </button>
                      </div>
                      <div className={styles.camposAcaoRotina}>
                        <label className={styles.campoFormulario}>
                          Horário
                          <input type="time" value={acao.horario} onChange={(evento) => atualizarAcaoRotina(acao.id, { horario: evento.target.value })} required />
                        </label>
                        <label className={styles.campoFormulario}>
                          Ação / etapa
                          <input value={acao.nome} onChange={(evento) => atualizarAcaoRotina(acao.id, { nome: evento.target.value })} placeholder="Ex.: Iniciar esteira" required maxLength={80} />
                        </label>
                        <label className={`${styles.campoFormulario} ${styles.descricaoAcaoRotina}`}>
                          Instrução (opcional)
                          <input value={acao.descricao} onChange={(evento) => atualizarAcaoRotina(acao.id, { descricao: evento.target.value })} placeholder="Ex.: Verificar proteção e iniciar ciclo" maxLength={160} />
                        </label>
                      </div>
                      <button type="button" className={styles.botaoRemoverAcao} title="Remover ação" aria-label={`Remover ação ${indice + 1}`} onClick={() => setFormularioRotina((atual) => ({ ...atual, acoes: atual.acoes.filter((item) => item.id !== acao.id) }))}>
                        <Trash2 size={17} />
                      </button>
                    </article>
                  ))}
                </div>
                <p className={styles.ajudaAcoesRotina}>As ações devem estar em ordem cronológica e dentro do intervalo da rotina. Elas são salvas como uma sequência local; ainda não acionam a máquina física.</p>
              </section>

              {mensagemFormulario && <p className={styles.erroFormulario} role="alert">{mensagemFormulario}</p>}
              <p className={styles.avisoFormulario}><Info size={16} /> A rotina, os dias e as ações ficarão vinculados apenas a esta máquina e equipe neste navegador.</p>
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