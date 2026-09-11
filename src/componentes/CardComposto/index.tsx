import styles from "./styles.module.css";

import { Link } from 'react-router-dom';

type CardCompostoProps = {
    textoPequeno: string;
    titulo: string;
    subtitulo: string;
    img: string;
    botaoTexto: string;
    caminhoBotao: string;
    isTrue: boolean;
}

export function CardComposto({
    textoPequeno, 
    titulo, 
    subtitulo, 
    botaoTexto, 
    caminhoBotao, 
    img, 
    isTrue,
    ...props
    }: CardCompostoProps) {
    return (
        <>
            <section {...props}>
                <div className={isTrue ? ` ${styles.TerceiraSecaoCardTrue}` : ` ${styles.TerceiraSecaoCardFalse}`}>
                    <div className={isTrue ? styles.TerceiraSecaoTextoTrue : styles.TerceiraSecaoTextoFalse}>
                        <p> {textoPequeno} </p>

                        <div className={isTrue ? styles.TerceiraSecaoTextoCardTrue : styles.TerceiraSecaoTextoCardFalse}>

                            <h1> {titulo} </h1>
                            <h2> {subtitulo} </h2>
                            <Link
                                to={caminhoBotao}
                                className={styles.botaoInicialTerceiraSection}
                            >
                                {botaoTexto}
                            </Link>
                        </div>

                    </div>

                    <img src={img} alt={titulo} className={`${styles.TerceiraSecaoImg}`}></img>
                </div>

            
            </section>
        </>
    )
}