import { useEffect, useState } from "react";
import { Activity, BarChart3, Check, CheckCircle2, X } from "lucide-react";
import type { MaquinaLocal, StatusMaquina } from "../../paginas/rotinaAparelhos/tipos";
import styles from "./styles.module.css";

/** Define os dois modos disponíveis para a análise de máquinas. */
export type ModoComparacao = "individual" | "multipla";

type ModalSelecaoMaquinasProps = {
  aberto: boolean;
  equipeNome: string;
  maquinas: MaquinaLocal[];
  modoAtual: ModoComparacao;
  idsSelecionados: string[];
  onFechar: () => void;
  onConfirmar: (modo: ModoComparacao, ids: string[]) => void;
};

/** Traduz o status técnico para o rótulo apresentado no seletor. */
function rotuloStatus(status: StatusMaquina, erro?: string | null) {
  if (status === "erro" || erro?.trim()) return "Erro";
  if (status === "offline") return "Offline";
  if (status === "atencao") return "Atenção";
  return "Operacional";
}

/**
 * Modal independente para selecionar uma máquina ou várias.
 * A seleção em edição é temporária e só é devolvida à página quando o usuário confirma.
 */
export function ModalSelecaoMaquinas({
  aberto,
  equipeNome,
  maquinas,
  modoAtual,
  idsSelecionados,
  onFechar,
  onConfirmar,
}: ModalSelecaoMaquinasProps) {
  const [modoRascunho, setModoRascunho] = useState<ModoComparacao>(modoAtual);
  const [idsRascunho, setIdsRascunho] = useState<string[]>(idsSelecionados);

  // Toda vez que o modal abre, começa com a seleção efetivamente aplicada na página.
  // O efeito também registra Escape e remove o listener ao fechar/desmontar.
  useEffect(() => {
    if (!aberto) return;

    setModoRascunho(modoAtual);
    setIdsRascunho([...idsSelecionados]);

    const aoPressionarTecla = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") onFechar();
    };
    window.addEventListener("keydown", aoPressionarTecla);
    return () => window.removeEventListener("keydown", aoPressionarTecla);
  }, [aberto, modoAtual, idsSelecionados, onFechar]);

  if (!aberto) return null;

  // Trocar para individual mantém somente uma máquina; no modo múltiplo é possível marcar várias.
  const mudarModo = (novoModo: ModoComparacao) => {
    setModoRascunho(novoModo);
    setIdsRascunho((atuais) => {
      if (novoModo === "individual") return atuais.slice(0, 1);
      return atuais.length ? atuais : maquinas.slice(0, 1).map((maquina) => maquina.id);
    });
  };

  // No modo individual a escolha substitui a anterior; no múltiplo, alterna a marcação.
  const alternarMaquina = (id: string) => {
    setIdsRascunho((atuais) => {
      if (modoRascunho === "individual") return [id];
      return atuais.includes(id) ? atuais.filter((item) => item !== id) : [...atuais, id];
    });
  };

  const confirmar = () => {
    if (!idsRascunho.length) return;
    onConfirmar(modoRascunho, modoRascunho === "individual" ? idsRascunho.slice(0, 1) : [...idsRascunho]);
  };

  return (
    <div
      className={styles.fundoModalSelecao}
      role="presentation"
      onMouseDown={(evento) => {
        // Fechar clicando no fundo; cliques dentro do card não fecham o modal.
        if (evento.target === evento.currentTarget) onFechar();
      }}
    >
      <section className={styles.modalSelecao} role="dialog" aria-modal="true" aria-labelledby="titulo-modal-selecao">
        <div className={styles.topoModalSelecao}>
          <div>
            <span className={styles.miniTituloComparacao}>ANÁLISE DOS DADOS · {equipeNome}</span>
            <h2 id="titulo-modal-selecao">Selecionar máquinas</h2>
            <p>Escolha como quer comparar os equipamentos da equipe.</p>
          </div>
          <button type="button" className={styles.botaoFecharModal} aria-label="Fechar seletor" onClick={onFechar}>
            <X size={19} />
          </button>
        </div>

        <div className={styles.opcoesModoModal} role="group" aria-label="Tipo de comparação">
          <button
            type="button"
            className={modoRascunho === "individual" ? styles.modoModalAtivo : ""}
            onClick={() => mudarModo("individual")}
            aria-pressed={modoRascunho === "individual"}
          >
            <Activity size={16} /> Uma máquina
          </button>
          <button
            type="button"
            className={modoRascunho === "multipla" ? styles.modoModalAtivo : ""}
            onClick={() => mudarModo("multipla")}
            aria-pressed={modoRascunho === "multipla"}
          >
            <BarChart3 size={16} /> Comparar várias
          </button>
        </div>

        <div className={styles.instrucaoSelecao}>
          {modoRascunho === "individual"
            ? "Selecione uma máquina. A escolha substitui a máquina analisada atualmente."
            : "Marque todas as máquinas que deseja comparar antes de confirmar."}
        </div>

        <div className={styles.listaModalMaquinas}>
          {maquinas.map((maquina, indice) => {
            const marcada = idsRascunho.includes(maquina.id);
            const statusExibido = maquina.status === "erro" || maquina.erro?.trim() ? "erro" : maquina.status;
            return (
              <button
                type="button"
                key={maquina.id}
                className={`${styles.itemModalMaquina} ${marcada ? styles.itemModalMaquinaAtivo : ""}`}
                onClick={() => alternarMaquina(maquina.id)}
                aria-pressed={marcada}
              >
                <span className={styles.numeroMaquina}>{String(indice + 1).padStart(2, "0")}</span>
                <span className={styles.textoItemModal}>
                  <strong>{maquina.nome}</strong>
                  <small>{maquina.tipo} · {(maquina.energiaHojeKwh || 0).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} kWh hoje</small>
                </span>
                <span
                  className={`${styles.pontoStatus} ${styles[`status-${statusExibido}`]}`}
                  title={rotuloStatus(maquina.status, maquina.erro)}
                />
                <span className={`${styles.marcadorEscolha} ${marcada ? styles.marcadorEscolhaAtivo : ""}`}>
                  {marcada && <Check size={14} />}
                </span>
              </button>
            );
          })}
        </div>

        {modoRascunho === "multipla" && (
          <div className={styles.rodapeSelecaoModal}>
            <span>{idsRascunho.length} de {maquinas.length} máquinas selecionadas</span>
            <button type="button" onClick={() => setIdsRascunho(maquinas.map((maquina) => maquina.id))}>
              Selecionar todas
            </button>
          </div>
        )}

        <div className={styles.botoesModalSelecao}>
          <button type="button" className={styles.botaoCancelarModal} onClick={onFechar}>Cancelar</button>
          <button type="button" className={styles.botaoConfirmarModal} onClick={confirmar} disabled={idsRascunho.length === 0}>
            <CheckCircle2 size={16} /> Confirmar seleção
          </button>
        </div>
      </section>
    </div>
  );
}