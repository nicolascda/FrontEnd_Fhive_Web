export type StatusMaquina = "online" | "offline" | "atencao" | "erro";

export type RotinaLocal = {
  id: string;
  nome: string;
  descricao: string;
  horarioInicial: string;
  horarioFinal: string;
  diasSemana: string[];
};

export type MaquinaLocal = {
  id: string;
  equipeId: string;
  nome: string;
  tipo: string;
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