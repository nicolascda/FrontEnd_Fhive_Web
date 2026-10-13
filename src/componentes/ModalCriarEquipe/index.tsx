import styles from "./styles.module.css";
import { useEffect, useRef, useState } from "react";
import imagemPadrao from "../../imagens/AutomatizacaoImagem.jpg";
import bannerPadrao from "../../imagens/Empresa3D.png";
import { Camera } from 'lucide-react';


// Informações que vai ser enviadas do modal para o backend
type InformacaoEquipe = {
    nomeEquipe: string;
    descricaoEquipe?: string;
    imagemFundo: string | typeof imagemPadrao;
    Banner: string | typeof bannerPadrao;
    plano: "basico" | "tecnologico" | "armazenamento";
    setor: "industrial" | "saude" | "escola" | "outro";
}

type ModalCriarEquipeProps = {
    onFechar: () => void;
};



export function ModalCriarEquipe({
    onFechar
}: ModalCriarEquipeProps) {
    return (
        <>
            <div className={`${styles.FundoMarrom}`}>
                <h1> Criacao de Equipe</h1>

                <div className={`${styles.modalEquipe}`}>

                    <div className={`${styles.areaRolagem}`}>

                        <div className={`${styles.blocos} ${styles.NomeDescricaoEquipe}`}>

                            <h2> Nome da Equipe</h2>
                            <input type="text"></input>

                            <h2> Descrição da Equipe</h2>
                            <input type="text" className={`${styles.InputMaior}`}></input>
                        </div>

                        <div className={`${styles.blocos} ${styles.ImagemEquipe}`}>

                            <h2> Imagem de fundo</h2>
                            <div className={`${styles.ImagemEquipeDiv}`}>
                                <Camera />
                            </div>

                            {/* Linha separadora horizontal */}
                            <dl></dl>

                            <h2> Descrição da Equipe</h2>
                            <div className={`${styles.ImagemEquipeDiv}`}>
                                <Camera />
                            </div>
                        </div>

                        <div className={`${styles.blocos} ${styles.blocoFinal}`}>

                            <button
                                className={`${styles.botaoFinal}`}
                                onClick={onFechar}>
                                Cancelar
                            </button>

                            <button className={`${styles.botaoFinal}`}>Criar</button>
                        </div>

                        <div className={`${styles.blocos} ${styles.NomeDescricaoEquipe}`}>

                            <h2> Nome da Equipe</h2>
                            <input type="text"></input>

                            <h2> Descrição da Equipe</h2>
                            <input type="text" className={`${styles.InputMaior}`}></input>
                        </div>

                        <div className={`${styles.blocos} ${styles.ImagemEquipe}`}>

                            <h2> Imagem de fundo</h2>
                            <div className={`${styles.ImagemEquipeDiv}`}>
                                <Camera />
                            </div>

                            {/* Linha separadora horizontal */}
                            <dl></dl>

                            <h2> Descrição da Equipe</h2>
                            <div className={`${styles.ImagemEquipeDiv}`}>
                                <Camera />
                            </div>
                        </div>

                        <div className={`${styles.blocos} ${styles.blocoFinal}`}>

                            <button
                                className={`${styles.botaoFinal}`}
                                onClick={onFechar}>
                                Cancelar
                            </button>

                            <button className={`${styles.botaoFinal}`}>Criar</button>
                        </div>
                    </div>


                </div>
            </div>
        </>
    )
}