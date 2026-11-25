import styles from "./styles.module.css";
import type { IconType } from "react-icons/lib";
import { FaPlus } from "react-icons/fa6";
import ColmeiaLogo from "../../imagens/Logo.png";

type CardCompraProps = {
  icone?: IconType;
  tituloCompra: string;
  textoCompra1: string;
  textoCompra2: string;
  textoCompra3: string;
  textoRodape: string;
  corIcone?: string;
};

export function CardCompra({
  icone: IconeDinamico,
  tituloCompra,
  textoCompra1,
  textoCompra2,
  textoCompra3,
  textoRodape,
  corIcone,
  ...props
}: CardCompraProps) {
  return (
    <article className={styles.CardCompra} {...props}>
      <div className={styles.CardCompraIcone}>
        <div className={styles.CardCompraFhive}>
          <img
            src={ColmeiaLogo}
            className={IconeDinamico ? styles.IconeColmeia : styles.IconeColmeiaMaior}
            alt="Símbolo da Fhive"
          />
          <span className={IconeDinamico ? styles.FhivePequeno : styles.FhiveMaior}>
            Fhive
          </span>
        </div>

        {IconeDinamico && (
          <>
            <FaPlus className={styles.IconeMais} aria-hidden="true" />
            <IconeDinamico className={styles.Icones} color={corIcone} aria-hidden="true" />
          </>
        )}
      </div>

      <div className={styles.CardCompraTexto}>
        <h2>{tituloCompra}</h2>
        <p>{textoCompra1}</p>
        <p>{textoCompra2}</p>
        <p>{textoCompra3}</p>
        <span className={styles.CardCompraBotao}>{textoRodape}</span>
      </div>
    </article>
  );
}
