import styles from "./styles.module.css";
import type { IconType } from "react-icons/lib";
import { FaRobot } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import ColmeiaLogo from "../../imagens/Logo.png";

type CardCompraProps = {
    icone?: IconType;
    tituloCompra: string;
    textoCompra1: string;
    textoCompra2: string;
    textoCompra3: string;
    preco: number;
    corIcone?: string;
} 

export function CardCompra({
    icone: IconeDinamico,
    tituloCompra,
    textoCompra1,
    textoCompra2,
    textoCompra3,
    preco,
    corIcone,
    ...props
    }:CardCompraProps ) {
    return (
        <>
            <div className={styles.CardCompra} {...props}>
                <div className={styles.CardCompraIcone}>

                    <div className={ styles.CardCompraFhive}>
                         <img src={ColmeiaLogo} className={ IconeDinamico ? styles.IconeColmeia : styles.IconeColmeiaMaior} /> 
                         <span className={IconeDinamico ? styles.FhivePequeno : styles.FhiveMaior}> Fhive</span> 
                    </div>

                    {IconeDinamico && (
                        <>
                            <FaPlus className={styles.IconeMais} />
                            <IconeDinamico className={styles.Icones} color={corIcone} />
                        </>
                    )}
                </div>

                <div className={styles.CardCompraTexto}>
                    <h2> {tituloCompra} </h2>
                    <p> {textoCompra1} </p>
                    <p> {textoCompra2} </p>
                    <p> {textoCompra3} </p>

                    <button className={styles.CardCompraBotao}> R$ {preco} </button>

                </div>
            </div>
        </>
    )
}