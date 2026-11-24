/** Estado operacional mostrado para cada equipamento dos ambientes 3D. */
export type StatusMaquina = "online" | "offline" | "atencao" | "erro";

/**
 * Uma ação executada como parte de uma rotina.
 * A ordem no array `acoes` representa a sequência planejada; `horario` registra
 * em que horário do dia aquela etapa deve ocorrer.
 */
export type AcaoRotinaLocal = {
  id: string;
  horario: string;
  nome: string;
  descricao: string;
};
/**
 * Configuração local da rotina de um equipamento.
 * Os campos permanecem no navegador e são separados pela equipe.
 */
export type RotinaLocal = {
  id: string;
  nome: string;
  descricao: string;
  horarioInicial: string;
  horarioFinal: string;
  diasSemana: string[];
  /** Etapas agendadas, ordenadas conforme a sequência de execução desejada. */
  acoes: AcaoRotinaLocal[];
};
/**
 * Equipamento visualizado na cena 3D.
 * `posicaoX` e `posicaoZ` guardam a posição horizontal; `posicaoY` guarda a altura.
 */
export type MaquinaLocal = {
  id: string;
  equipeId: string;
  nome: string;
  tipo: string;
  posicaoX?: number;
  posicaoY?: number;
  posicaoZ?: number;
  /** Rotação horizontal do equipamento, em radianos (eixo Y). */
  rotacaoY?: number;
  funcao: string;
  status: StatusMaquina;
  potenciaKw: number;
  energiaHojeKwh: number;
  horasHoje: number;
  horasTotais: number;
  rotina: RotinaLocal | null;
  erro: string | null;
  criadaEm: string;
};
/** Metadados da equipe usados para identificar e personalizar seu ambiente 3D. */
export type EquipeAmbiente = {
  id: string;
  nome: string;
  setor?: string | null;
  descricao?: string | null;
  imagemFundo?: string | null;
  logo?: string | null;
  limiteIntegrantes?: number;
  plano?: string;
  codigo?: string;
};