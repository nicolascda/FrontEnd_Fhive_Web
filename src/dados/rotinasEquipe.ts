import type { AcaoRotinaLocal, MaquinaLocal, RotinaLocal } from "../paginas/rotinaAparelhos/tipos";

/** Chaves compartilhadas pelas telas de rotinas, comparação e ambiente 3D. */
export const CHAVE_AMBIENTE = "fhive:ambiente-industrial:";
export const CHAVE_ROTINAS = "fhive:rotinas-equipe:";
export const CHAVE_EQUIPE = "fhive:equipe-ambiente:";

/** Cria uma rotina de exemplo para demonstrar a tela quando a equipe ainda não tem dados locais. */
export function criarRotinaDemonstracao(equipeId: string): RotinaLocal {
  return {
    id: `${equipeId}-rotina-robo-inicial`,
    nome: "Manufaturamento",
    descricao: "Ciclo de fabricação e movimentação de peças metálicas.",
    horarioInicial: "08:00",
    horarioFinal: "17:00",
    diasSemana: ["Seg", "Ter", "Qua", "Qui", "Sex"],
    acoes: [
      { id: `${equipeId}-acao-iniciar`, horario: "08:00", nome: "Iniciar produção", descricao: "Conferir a área e iniciar o ciclo." },
      { id: `${equipeId}-acao-inspecao`, horario: "12:00", nome: "Inspeção intermediária", descricao: "Conferir a qualidade das peças." },
      { id: `${equipeId}-acao-retomar`, horario: "13:00", nome: "Retomar produção", descricao: "Retomar o ciclo após a inspeção." },
      { id: `${equipeId}-acao-finalizar`, horario: "17:00", nome: "Encerrar produção", descricao: "Finalizar o ciclo e preparar o equipamento." },
    ],
  };
}

/** Normaliza rotinas criadas em versões anteriores, que podem não ter dias ou ações. */
function normalizarRotina(rotina: RotinaLocal): RotinaLocal {
  const rotinaLegada = rotina as RotinaLocal & { acoes?: AcaoRotinaLocal[]; diasSemana?: string[] };
  return {
    ...rotinaLegada,
    diasSemana: Array.isArray(rotinaLegada.diasSemana) ? rotinaLegada.diasSemana : ["Seg", "Ter", "Qua", "Qui", "Sex"],
    acoes: Array.isArray(rotinaLegada.acoes) ? rotinaLegada.acoes : [],
  };
}

/**
 * Lê as rotinas exclusivas de uma equipe.
 * Se a tela ainda não foi usada, migra as rotinas que já estavam salvas dentro das máquinas.
 * Para uma equipe totalmente nova, apresenta uma rotina demonstrativa inicial.
 */
export function lerRotinasEquipe(equipeId: string): RotinaLocal[] {
  if (!equipeId || typeof window === "undefined") return [];

  try {
    const salvo = window.localStorage.getItem(`${CHAVE_ROTINAS}${equipeId}`);
    if (salvo !== null) {
      const valor: unknown = JSON.parse(salvo);
      return Array.isArray(valor) ? (valor as RotinaLocal[]).filter((rotina) => rotina && rotina.id && rotina.nome).map(normalizarRotina) : [];
    }

    const ambienteSalvo = window.localStorage.getItem(`${CHAVE_AMBIENTE}${equipeId}`);
    if (ambienteSalvo !== null) {
      const maquinas: unknown = JSON.parse(ambienteSalvo);
      if (!Array.isArray(maquinas)) return [];
      const rotinas = maquinas
        .map((maquina) => maquina && typeof maquina === "object" ? (maquina as MaquinaLocal).rotina : null)
        .filter((rotina): rotina is RotinaLocal => Boolean(rotina && rotina.id && rotina.nome))
        .map(normalizarRotina);
      return rotinas.filter((rotina, indice, todas) =>
        todas.findIndex((outra) => outra.id === rotina.id) === indice,
      );
    }

    return [criarRotinaDemonstracao(equipeId)];
  } catch (erro) {
    console.warn("Não foi possível carregar as rotinas locais da equipe.", erro);
    return [];
  }
}

/** Persiste as rotinas e sincroniza referências já aplicadas às máquinas. */
export function salvarRotinasEquipe(equipeId: string, rotinas: RotinaLocal[]): void {
  if (!equipeId || typeof window === "undefined") return;

  try {
    window.localStorage.setItem(`${CHAVE_ROTINAS}${equipeId}`, JSON.stringify(rotinas));

    const ambienteSalvo = window.localStorage.getItem(`${CHAVE_AMBIENTE}${equipeId}`);
    if (ambienteSalvo === null) return;

    const maquinas: unknown = JSON.parse(ambienteSalvo);
    if (!Array.isArray(maquinas)) return;

    const sincronizadas = (maquinas as MaquinaLocal[]).map((maquina) => {
      if (!maquina.rotina) return maquina;
      const rotinaAtualizada = rotinas.find((rotina) => rotina.id === maquina.rotina?.id);
      return { ...maquina, rotina: rotinaAtualizada ? { ...normalizarRotina(rotinaAtualizada) } : null };
    });

    window.localStorage.setItem(`${CHAVE_AMBIENTE}${equipeId}`, JSON.stringify(sincronizadas));
  } catch (erro) {
    console.warn("Não foi possível salvar as rotinas locais da equipe.", erro);
  }
}

/**
 * Quando existe uma lista central de rotinas, atualiza as referências das máquinas.
 * Assim uma rotina renomeada é refletida no ambiente e uma rotina removida deixa de aparecer aplicada.
 */
export function normalizarRotinasDasMaquinas(equipeId: string, maquinas: MaquinaLocal[]): MaquinaLocal[] {
  if (!equipeId || typeof window === "undefined") return maquinas;

  try {
    const salvo = window.localStorage.getItem(`${CHAVE_ROTINAS}${equipeId}`);
    if (salvo === null) return maquinas;

    const valor: unknown = JSON.parse(salvo);
    const rotinas = Array.isArray(valor) ? valor as RotinaLocal[] : [];

    return maquinas.map((maquina) => {
      if (!maquina.rotina) return maquina;
      const rotinaAtualizada = rotinas.find((rotina) => rotina.id === maquina.rotina?.id);
      return { ...maquina, rotina: rotinaAtualizada ? { ...normalizarRotina(rotinaAtualizada) } : null };
    });
  } catch {
    return maquinas;
  }
}