import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Activity, Check, Clock3, ListOrdered, Cog, Factory, Gauge, Info, Plus, RotateCcw, Trash2, X, Zap, Boxes, Truck, Wrench } from "lucide-react";
import { CardRotina } from "../../componentes/CardRotina";
import { CHAVE_AMBIENTE, CHAVE_EQUIPE, lerRotinasEquipe, normalizarRotinasDasMaquinas, salvarRotinasEquipe, criarRotinaDemonstracao, listarRotinasDaEquipe } from "../../dados/rotinasEquipe";
import { CenaIndustrial, type AmbienteVisual } from "./CenaIndustrial";
import type { AcaoRotinaLocal, EquipeAmbiente, MaquinaLocal, RotinaLocal, StatusMaquina } from "./tipos";
import styles from "./styles.module.css";

// Controla quais painéis estão abertos sobre a visualização 3D.
type PainelLateral = "detalhes" | "adicionar" | null;

// Cada toque em E/Q desloca o equipamento 25 cm na escala do ambiente 3D.
const PASSO_ALTURA_MAQUINA = 0.25;
const ALTURA_MAXIMA_MAQUINA = 4.5;

// Cada toque em R gira o equipamento 15° no eixo Y (Shift + R gira no sentido contrário).
const PASSO_ROTACAO_MAQUINA = Math.PI / 12;
const VOLTA_COMPLETA = Math.PI * 2;

type FormularioMaquina = {
  nome: string;
  tipo: string;
  funcao: string;
  potenciaKw: string;
};

function criarId(prefixo: string) {
  return `${prefixo}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function obterPosicaoPadraoMaquina(indice: number, total: number): [number, number, number] {
  if (total === 1) return [-4, 0, 1];
  const coluna = indice % 4;
  const linha = Math.floor(indice / 4);
  return [((coluna - 1.5) * 5.2), 0, 3.7 - linha * 5.2];
}

// Mantém compatibilidade com equipamentos de demonstração criados nesta tela.
function criarRotinaInicial(equipeId: string): RotinaLocal {
  return criarRotinaDemonstracao(equipeId);
}

function normalizarTexto(valor: string) {
  return valor.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

/** O setor escolhido no cadastro da equipe determina o ambiente e os modelos disponíveis. */
function identificarAmbiente(setor?: string | null): AmbienteVisual {
  const valor = normalizarTexto(setor ?? "");
  if (valor.includes("educ") || valor.includes("escol")) return "escolar";
  if (valor.includes("saud") || valor.includes("hospital") || valor.includes("medic")) return "saude";
  return "industrial";
}

function obterModelosDisponiveis(ambiente: AmbienteVisual) {
  if (ambiente === "escolar") {
    return [
      { valor: "Carteira escolar", rotulo: "Carteira e cadeira", Icone: Boxes },
      { valor: "Notebook", rotulo: "Notebook", Icone: Gauge },
      { valor: "Outro", rotulo: "Outro equipamento", Icone: Boxes },
    ];
  }

  if (ambiente === "saude") {
    return [
      { valor: "Cama hospitalar", rotulo: "Cama hospitalar", Icone: Activity },
      { valor: "Monitor médico", rotulo: "Monitor médico", Icone: Gauge },
      { valor: "Outro", rotulo: "Outro equipamento", Icone: Boxes },
    ];
  }

  return [
    { valor: "Robô industrial", rotulo: "Braço robótico", Icone: Cog },
    { valor: "CNC", rotulo: "Centro de usinagem", Icone: Factory },
    { valor: "Esteira transportadora", rotulo: "Esteira transportadora", Icone: Truck },
    { valor: "Ar-condicionado industrial", rotulo: "Ar-condicionado", Icone: Wrench },
    { valor: "Prensa hidráulica", rotulo: "Prensa hidráulica", Icone: Wrench },
    { valor: "Outro", rotulo: "Outro equipamento", Icone: Boxes },
  ];
}

function criarMaquinasDemonstracao(equipeId: string, ambiente: AmbienteVisual): MaquinaLocal[] {
  const agora = new Date().toISOString();

  if (ambiente === "escolar") {
    return [
      {
        id: `${equipeId}-carteira-demo`, equipeId, nome: "Carteira escolar 01", tipo: "Carteira escolar",
        funcao: "Estação de estudo e atividades em sala", status: "online", potenciaKw: 0,
        energiaHojeKwh: 0, horasHoje: 0, horasTotais: 0, rotina: null, erro: null, criadaEm: agora,
      },
      {
        id: `${equipeId}-notebook-demo`, equipeId, nome: "Notebook 01", tipo: "Notebook",
        funcao: "Equipamento de apoio às atividades escolares", status: "online", potenciaKw: 0.065,
        energiaHojeKwh: 0.2, horasHoje: 3.1, horasTotais: 86, rotina: null, erro: null, criadaEm: agora,
      },
    ];
  }

  if (ambiente === "saude") {
    return [
      {
        id: `${equipeId}-cama-demo`, equipeId, nome: "Leito hospitalar 01", tipo: "Cama hospitalar",
        funcao: "Leito para acomodação e atendimento de pacientes", status: "online", potenciaKw: 0.12,
        energiaHojeKwh: 0.4, horasHoje: 8, horasTotais: 420, rotina: null, erro: null, criadaEm: agora,
      },
      {
        id: `${equipeId}-monitor-demo`, equipeId, nome: "Monitor médico 01", tipo: "Monitor médico",
        funcao: "Monitoramento de sinais vitais", status: "atencao", potenciaKw: 0.08,
        energiaHojeKwh: 0.3, horasHoje: 8, horasTotais: 620, rotina: null,
        erro: "Demonstração: verifique a conexão do monitor antes de iniciar o acompanhamento.", criadaEm: agora,
      },
    ];
  }

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
    {
      id: `${equipeId}-maquina-cnc-demo`,
      equipeId,
      nome: "Centro de usinagem 02",
      tipo: "CNC",
      funcao: "Usinagem e acabamento de componentes metálicos",
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

// Carrega somente máquinas cujo campo equipeId coincide com a rota atual.
// Essa validação evita misturar equipamentos pertencentes a equipes diferentes.
function lerMaquinasEquipe(equipeId: string, ambiente: AmbienteVisual): MaquinaLocal[] {
  if (!equipeId || typeof window === "undefined") return [];

  try {
    const salvo = window.localStorage.getItem(`${CHAVE_AMBIENTE}${equipeId}`);
    if (salvo !== null) {
      const valor: unknown = JSON.parse(salvo);
      if (Array.isArray(valor)) {
        // Versões anteriores gravavam os dois equipamentos industriais de demonstração
        // para qualquer setor. Migra somente esse par padrão, sem sobrescrever máquinas editadas.
        const possuiRoboDemoAntigo = valor.some((item) =>
          Boolean(item && typeof item === "object" && "id" in item && item.id === `${equipeId}-maquina-robo-demo` && "tipo" in item && item.tipo === "Robô industrial"),
        );
        const possuiCncDemoAntigo = valor.some((item) =>
          Boolean(item && typeof item === "object" && "id" in item && item.id === `${equipeId}-maquina-cnc-demo` && "tipo" in item && item.tipo === "CNC"),
        );
        if (ambiente !== "industrial" && valor.length === 2 && possuiRoboDemoAntigo && possuiCncDemoAntigo) {
          return normalizarRotinasDasMaquinas(equipeId, criarMaquinasDemonstracao(equipeId, ambiente));
        }

        // Normaliza dados salvos por versões anteriores do frontend: rotinas antigas
        // podem ainda não ter o array de ações e precisam continuar abrindo normalmente.
        const maquinasNormalizadas = valor
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
        return normalizarRotinasDasMaquinas(equipeId, maquinasNormalizadas);
      }
    }
  } catch (erro) {
    console.warn("Não foi possível ler o ambiente local desta equipe.", erro);
  }

  return normalizarRotinasDasMaquinas(equipeId, criarMaquinasDemonstracao(equipeId, ambiente));
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
  const ambiente = identificarAmbiente(equipe.setor);
  const rotuloAmbiente = ambiente === "escolar" ? "ESCOLAR" : ambiente === "saude" ? "DE SAÚDE" : "INDUSTRIAL";
  const modelosDisponiveis = obterModelosDisponiveis(ambiente);

  const [estadoAmbiente, setEstadoAmbiente] = useState(() => ({
    equipeId,
    maquinas: lerMaquinasEquipe(equipeId, ambiente),
  }));
  const [maquinaSelecionadaId, setMaquinaSelecionadaId] = useState<string | null>(null);
  const [painelLateral, setPainelLateral] = useState<PainelLateral>(null);
  const [modalRotinaAberto, setModalRotinaAberto] = useState(false);
  // A tela 3D usa as rotinas cadastradas na tela específica de gestão de rotinas.
  const [estadoRotinas, setEstadoRotinas] = useState(() => ({
    equipeId,
    rotinas: lerRotinasEquipe(equipeId),
  }));
  const rotinasEquipe = estadoRotinas.equipeId === equipeId
    ? estadoRotinas.rotinas
    : lerRotinasEquipe(equipeId);
  const [formularioMaquina, setFormularioMaquina] = useState<FormularioMaquina>(() => ({
    nome: "",
    tipo: obterModelosDisponiveis(ambiente)[0].valor,
    funcao: "",
    potenciaKw: "5",
  }));
  const [mensagemFormulario, setMensagemFormulario] = useState("");

  const maquinas = estadoAmbiente.equipeId === equipeId
    ? estadoAmbiente.maquinas
    : lerMaquinasEquipe(equipeId, ambiente);
  const maquinaSelecionada = maquinas.find((maquina) => maquina.id === maquinaSelecionadaId) || null;
  // Considera tanto o status quanto a mensagem salva para manter painel e marcador 3D sincronizados.
  const maquinaSelecionadaTemErro = Boolean(
    maquinaSelecionada && (maquinaSelecionada.status === "erro" || maquinaSelecionada.erro?.trim()),
  );

  useEffect(() => {
    setEstadoAmbiente({ equipeId, maquinas: lerMaquinasEquipe(equipeId, ambiente) });
    setMaquinaSelecionadaId(null);
    setPainelLateral(null);
    setModalRotinaAberto(false);
    setMensagemFormulario("");
    setFormularioMaquina((atual) => ({ ...atual, tipo: obterModelosDisponiveis(ambiente)[0].valor }));
  }, [equipeId, ambiente]);

  useEffect(() => {
    let ativo = true;
    const rotinasLocais = lerRotinasEquipe(equipeId);
    setEstadoRotinas({ equipeId, rotinas: rotinasLocais });

    // Equipes reais carregam as rotinas do banco, mesmo quando o ambiente 3D é aberto diretamente.
    if (equipeId !== "demo-equipe") {
      listarRotinasDaEquipe(equipeId)
        .then((rotinasBanco) => {
          if (!ativo) return;
          setEstadoRotinas({ equipeId, rotinas: rotinasBanco });
          salvarRotinasEquipe(equipeId, rotinasBanco);
        })
        .catch((erro: unknown) => {
          console.warn("Não foi possível atualizar as rotinas pelo backend. Mantendo a cópia local.", erro);
        });
    }

    return () => { ativo = false; };
  }, [equipeId]);

  // Mantém a lista central de rotinas e sincroniza as referências aplicadas aos equipamentos.
  useEffect(() => {
    if (estadoRotinas.equipeId !== equipeId) return;
    salvarRotinasEquipe(equipeId, estadoRotinas.rotinas);
  }, [estadoRotinas, equipeId]);

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
    posicaoY: maquina.posicaoY,
    posicaoZ: maquina.posicaoZ,
    rotacaoY: maquina.rotacaoY,
  })), [maquinas]);

  // Todas as alterações da cena (cadastro, posição, rotina, erro e exclusão) passam
  // por esta função para preservar a coleção da equipe ativa.
  const atualizarMaquinas = useCallback((atualizar: (atuais: MaquinaLocal[]) => MaquinaLocal[]) => {
    setEstadoAmbiente((estado) => {
      const atuais = estado.equipeId === equipeId ? estado.maquinas : lerMaquinasEquipe(equipeId, ambiente);
      return { equipeId, maquinas: atualizar(atuais) };
    });
  }, [equipeId, ambiente]);

  // Atalhos da máquina selecionada: E sobe, Q desce e R gira (Shift + R gira ao contrário).
  // Não intercepta teclas enquanto o usuário digita em campos de formulário ou está no modal de rotina.
  useEffect(() => {
    const tratarTeclaMaquina = (evento: KeyboardEvent) => {
      const tecla = evento.key.toLocaleLowerCase();
      if (tecla !== "q" && tecla !== "e" && tecla !== "r") return;
      // Ctrl/Cmd/Alt + tecla pertencem ao navegador (ex.: Ctrl + R recarrega a página).
      if (evento.ctrlKey || evento.metaKey || evento.altKey) return;
      if (evento.repeat || !maquinaSelecionadaId || modalRotinaAberto) return;

      const alvo = evento.target;
      if (alvo instanceof HTMLElement) {
        const tag = alvo.tagName.toLocaleLowerCase();
        if (alvo.isContentEditable || tag === "input" || tag === "textarea" || tag === "select") return;
      }

      evento.preventDefault();

      if (tecla === "r") {
        const passo = evento.shiftKey ? -PASSO_ROTACAO_MAQUINA : PASSO_ROTACAO_MAQUINA;
        atualizarMaquinas((atuais) => atuais.map((maquina) => {
          if (maquina.id !== maquinaSelecionadaId) return maquina;
          // Mantém o ângulo entre 0 e 2π para o valor salvo não crescer indefinidamente.
          const novaRotacao = (((maquina.rotacaoY ?? 0) + passo) % VOLTA_COMPLETA + VOLTA_COMPLETA) % VOLTA_COMPLETA;
          return { ...maquina, rotacaoY: Number(novaRotacao.toFixed(4)) };
        }));
        return;
      }

      const deslocamento = tecla === "e" ? PASSO_ALTURA_MAQUINA : -PASSO_ALTURA_MAQUINA;

      atualizarMaquinas((atuais) => atuais.map((maquina) => {
        if (maquina.id !== maquinaSelecionadaId) return maquina;
        const alturaAtual = maquina.posicaoY ?? 0;
        const novaAltura = Math.min(
          ALTURA_MAXIMA_MAQUINA,
          Math.max(0, Number((alturaAtual + deslocamento).toFixed(2))),
        );
        if (novaAltura === alturaAtual) return maquina;
        return { ...maquina, posicaoY: novaAltura };
      }));
    };

    window.addEventListener("keydown", tratarTeclaMaquina);
    return () => window.removeEventListener("keydown", tratarTeclaMaquina);
  }, [maquinaSelecionadaId, modalRotinaAberto, atualizarMaquinas]);

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

    atualizarMaquinas((atuais) => {
      // Materializa as posições atuais antes de aumentar a lista. Sem isso, a grade
      // recalcula a posição padrão dos equipamentos antigos ao criar um novo aparelho.
      const existentesComPosicao = atuais.map((maquina, indice) => {
        const padrao = obterPosicaoPadraoMaquina(indice, atuais.length);
        return {
          ...maquina,
          posicaoX: maquina.posicaoX ?? padrao[0],
          posicaoY: maquina.posicaoY ?? padrao[1],
          posicaoZ: maquina.posicaoZ ?? padrao[2],
        };
      });
      const posicaoNova = obterPosicaoPadraoMaquina(atuais.length, atuais.length + 1);
      return [...existentesComPosicao, {
        ...novaMaquina,
        posicaoX: posicaoNova[0],
        posicaoY: posicaoNova[1],
        posicaoZ: posicaoNova[2],
      }];
    });
    setMaquinaSelecionadaId(novaMaquina.id);
    setPainelLateral("detalhes");
    setFormularioMaquina({ nome: "", tipo: modelosDisponiveis[0].valor, funcao: "", potenciaKw: "5" });
    setMensagemFormulario("");
  };

  // Abre o seletor das rotinas criadas na página "Rotina dos aparelhos".
  const abrirFormularioRotina = () => {
    setMensagemFormulario("");
    setModalRotinaAberto(true);
  };

  // Aplica uma rotina existente à máquina ativa; a criação e edição ficam na página de rotinas.
  const aplicarRotinaSelecionada = (rotina: RotinaLocal | null) => {
    if (!maquinaSelecionada) return;
    atualizarMaquinas((atuais) => atuais.map((maquina) =>
      maquina.id === maquinaSelecionada.id
        ? { ...maquina, rotina: rotina ? { ...rotina, acoes: rotina.acoes.map((acao) => ({ ...acao })), diasSemana: [...rotina.diasSemana] } : null }
        : maquina,
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
    navigate("/configuracoes-equipe");
  };

  return (
    <div className={styles.pagina}>

      <header className={styles.cabecalhoEquipe}>
        <div className={styles.tituloEquipe}>
          <span className={styles.miniTitulo}>AMBIENTE {rotuloAmbiente} · EQUIPE {equipeId}</span>
          <h1>{equipe.nome}</h1>
        </div>
        <div className={styles.indicadoresCabecalho}>
          <span><Boxes size={16} /> {maquinas.length} {maquinas.length === 1 ? "equipamento" : "equipamentos"}</span>
          <span className={styles.seloLocal}><Activity size={14} /> Modo local</span>
        </div>
      </header>

      <main className={styles.areaTrabalho}>
        <section className={styles.areaCena} aria-label={`Ambiente 3D da equipe ${equipe.nome}`}>
          <CenaIndustrial
            ambiente={ambiente}
            maquinas={maquinasCena}
            maquinaSelecionadaId={maquinaSelecionadaId}
            aoSelecionar={(maquina) => selecionarMaquina(maquina.id)}
            aoMover={(id, posicaoX, posicaoY, posicaoZ) => {
              atualizarMaquinas((atuais) => atuais.map((maquina) => (
                maquina.id === id ? { ...maquina, posicaoX, posicaoY, posicaoZ } : maquina
              )));
            }}
          />

          <div className={styles.acoesFlutuantes}>
            <button
              type="button"
              className={styles.botaoFlutuante}
              aria-label="Adicionar equipamento"
              title="Adicionar equipamento"
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
            <span>Arraste uma máquina para reposicioná-la ou arraste o espaço vazio para girar a câmera. Com uma máquina selecionada, pressione E para subir, Q para descer e R para girar (Shift + R gira ao contrário). Cada toque move 0,25 unidade ou gira 15°; altura e rotação são salvas por equipe neste navegador.</span>
          </div>

          {painelLateral === "detalhes" && maquinaSelecionada && (
            <aside className={styles.painelLateral} aria-label="Informações do equipamento">
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
                    {maquinaSelecionada.rotina ? "Trocar" : "Selecionar"}
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
            <aside className={`${styles.painelLateral} ${styles.painelAdicionar}`} aria-label="Adicionar equipamento">
              <div className={styles.topoPainel}>
                <div>
                  <span className={styles.miniTituloPainel}>AMBIENTE DA EQUIPE</span>
                  <h2>Adicionar modelos</h2>
                  <p>Escolha um modelo para posicionar no ambiente.</p>
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
                  Nome do equipamento
                  <input
                    value={formularioMaquina.nome}
                    onChange={(evento) => setFormularioMaquina((atual) => ({ ...atual, nome: evento.target.value }))}
                    placeholder={ambiente === "escolar" ? "Ex.: Notebook da sala 02" : ambiente === "saude" ? "Ex.: Monitor do leito 02" : "Ex.: Robô de soldagem 02"}
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

      {/* O modal de seleção reutiliza o mesmo CardRotina da página de gerenciamento.
          Aqui a pessoa apenas escolhe uma rotina já criada e a aplica à máquina. */}
      {modalRotinaAberto && maquinaSelecionada && (
        <div className={styles.fundoModal} role="presentation" onMouseDown={(evento) => {
          if (evento.target === evento.currentTarget) setModalRotinaAberto(false);
        }}>
          <section className={styles.modalRotina} role="dialog" aria-modal="true" aria-labelledby="titulo-modal-rotina">
            <div className={styles.topoModal}>
              <div>
                <span className={styles.miniTituloPainel}>ROTINAS DA EQUIPE</span>
                <h2 id="titulo-modal-rotina">Aplicar rotina</h2>
                <p>Escolha uma rotina existente para {maquinaSelecionada.nome}.</p>
              </div>
              <button type="button" className={styles.botaoFechar} aria-label="Fechar seletor de rotinas" onClick={() => setModalRotinaAberto(false)}><X size={22} /></button>
            </div>

            {rotinasEquipe.length > 0 ? (
              <div className={styles.listaSeletorRotinas}>
                {rotinasEquipe.map((rotina) => (
                  <CardRotina
                    key={rotina.id}
                    rotina={rotina}
                    selecionada={maquinaSelecionada.rotina?.id === rotina.id}
                    modoSelecao
                    aoSelecionar={aplicarRotinaSelecionada}
                  />
                ))}
              </div>
            ) : (
              <div className={styles.semRotinasSeletor}>
                <Info size={19} />
                <p>Esta equipe ainda não tem rotinas. Crie uma rotina na tela de gerenciamento para aplicá-la aqui.</p>
              </div>
            )}

            {maquinaSelecionada.rotina && (
              <button type="button" className={styles.botaoExcluir} onClick={() => aplicarRotinaSelecionada(null)}>
                <Trash2 size={16} /> Remover rotina desta máquina
              </button>
            )}

            <div className={styles.botoesModal}>
              <button type="button" className={styles.botaoSecundario} onClick={() => navigate(`/rotinas/${encodeURIComponent(equipeId)}`)}>
                <ListOrdered size={16} /> Gerenciar rotinas
              </button>
              <button type="button" className={styles.botaoPrimario} onClick={() => setModalRotinaAberto(false)}>Concluir</button>
            </div>
            <p className={styles.notaPainel}>As definições das rotinas são carregadas do banco de dados. Neste protótipo, a associação da rotina à máquina e a execução de comandos físicos ainda são demonstrativas e permanecem locais.</p>
          </section>
        </div>
      )}
    </div>
  );
}