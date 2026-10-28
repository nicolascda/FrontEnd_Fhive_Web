import { CalendarDays, Clock3, ListOrdered, Pencil, Trash2, CheckCircle2, Layers3 } from "lucide-react";
import type { RotinaLocal } from "../../paginas/rotinaAparelhos/tipos";
import styles from "./styles.module.css";

type CardRotinaProps = {
  rotina: RotinaLocal;
  maquinasAssociadas?: number;
  selecionada?: boolean;
  modoSelecao?: boolean;
  aoSelecionar?: (rotina: RotinaLocal) => void;
  aoEditar?: (rotina: RotinaLocal) => void;
  aoExcluir?: (rotina: RotinaLocal) => void;
};

/**
 * Card reutilizável de rotina.
 * Na página de rotinas, exibe resumo e ações de gerenciamento.
 * No ambiente 3D, o mesmo componente aparece em modo de seleção para aplicar
 * uma rotina existente à máquina escolhida, sem criar uma rotina dentro da cena.
 */
export function CardRotina({
  rotina,
  maquinasAssociadas = 0,
  selecionada = false,
  modoSelecao = false,
  aoSelecionar,
  aoEditar,
  aoExcluir,
}: CardRotinaProps) {
  const dias = rotina.diasSemana?.length ? rotina.diasSemana.join(" · ") : "Sem dias definidos";
  const quantidadeAcoes = rotina.acoes?.length ?? 0;

  const selecionar = () => aoSelecionar?.(rotina);

  return (
    <article className={`${styles.cardRotina} ${selecionada ? styles.cardSelecionado : ""} ${modoSelecao ? styles.cardModoSelecao : ""}`}>
      {modoSelecao ? (
        <button
          type="button"
          className={styles.superficieSelecionar}
          onClick={selecionar}
          aria-pressed={selecionada}
          aria-label={`Aplicar rotina ${rotina.nome}`}
        >
          <span className={styles.cabecalhoCard}>
            <span className={styles.iconeRotina}><Layers3 size={17} /></span>
            <span className={styles.tituloCard}>{rotina.nome}</span>
            {selecionada && <CheckCircle2 className={styles.iconeSelecionado} size={19} />}
          </span>
          {rotina.descricao && <span className={styles.descricaoCard}>{rotina.descricao}</span>}
          <span className={styles.metaRotina}><Clock3 size={14} /> {rotina.horarioInicial} – {rotina.horarioFinal}</span>
          <span className={styles.metaRotina}><CalendarDays size={14} /> {dias}</span>
          <span className={styles.rodapeCard}>
            <span><ListOrdered size={14} /> {quantidadeAcoes} {quantidadeAcoes === 1 ? "ação" : "ações"}</span>
            <strong>{selecionada ? "Selecionada" : "Selecionar rotina"}</strong>
          </span>
        </button>
      ) : (
        <>
          <div className={styles.cabecalhoCard}>
            <span className={styles.iconeRotina}><Layers3 size={17} /></span>
            <div className={styles.tituloDescricao}>
              <h3 className={styles.tituloCard}>{rotina.nome}</h3>
              {rotina.descricao && <p className={styles.descricaoCard}>{rotina.descricao}</p>}
            </div>
            <span className={styles.contadorAcoes}>{quantidadeAcoes} {quantidadeAcoes === 1 ? "ação" : "ações"}</span>
          </div>

          <div className={styles.detalhesCard}>
            <span className={styles.metaRotina}><Clock3 size={14} /> {rotina.horarioInicial} – {rotina.horarioFinal}</span>
            <span className={styles.metaRotina}><CalendarDays size={14} /> {dias}</span>
          </div>

          {quantidadeAcoes > 0 && (
            <ol className={styles.resumoAcoes}>
              {rotina.acoes.slice(0, 3).map((acao, indice) => (
                <li key={acao.id}>
                  <span>{indice + 1}</span>
                  <time>{acao.horario}</time>
                  <strong>{acao.nome}</strong>
                </li>
              ))}
              {quantidadeAcoes > 3 && <li className={styles.maisAcoes}>+ {quantidadeAcoes - 3} etapas adicionais</li>}
            </ol>
          )}

          <div className={styles.rodapeGerenciamento}>
            <span className={styles.maquinasAssociadas}>{maquinasAssociadas} {maquinasAssociadas === 1 ? "máquina vinculada" : "máquinas vinculadas"}</span>
            <div className={styles.acoesCard}>
              {aoEditar && (
                <button type="button" className={styles.botaoEditar} onClick={() => aoEditar(rotina)} aria-label={`Editar rotina ${rotina.nome}`}>
                  <Pencil size={15} /> Editar
                </button>
              )}
              {aoExcluir && (
                <button type="button" className={styles.botaoExcluir} onClick={() => aoExcluir(rotina)} aria-label={`Excluir rotina ${rotina.nome}`}>
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </article>
  );
}