import styles from "./styles.module.css";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Settings } from 'lucide-react'


type CardEquipeProps = {
    id: string;
    imagem: string;
    imagemalt: string;
    imagemLogo: string;
    equipeNome: string;
    equipeSetor: string;
    equipeIntegrantes: number;

    onEntrar?: (id: string) => void;
    onConfiguracoes?: (id: string) => void;
    onGerenciarIntegrantes?: (id: string) => void;
    onExcluir?: (id: string) => void;
}

export function CardEquipe({
    id,
    imagem,
    imagemalt,
    imagemLogo,
    equipeNome,
    equipeSetor,
    equipeIntegrantes,
    onEntrar,
    onConfiguracoes,
    onGerenciarIntegrantes,
    onExcluir,
    ...props
}: CardEquipeProps) {

    const navigate = useNavigate();

    const [menuAberto, setMenuAberto] = useState(false);

    const handleEntrar = () => {
        if (onEntrar) {
            onEntrar(id);
            return;
        }

        navigate("/");
    };

    const handleConfiguracoes = () => {
        setMenuAberto(false);
        onConfiguracoes?.(id);
    };

    const handleGerenciarIntegrantes = () => {
        setMenuAberto(false);
        onGerenciarIntegrantes?.(id);
    };

    const handleExcluir = () => {
        setMenuAberto(false);
        onExcluir?.(id);
    };

    const handleMenu = () => {
        setMenuAberto((aberto) => !aberto);
    };


    return (
        <>
            <article {...props}
                key={id}
                className={styles['card-equipe']}
                onClick={(evento) =>
                    evento.stopPropagation()
                }
            >

                <img
                    src={imagem}
                    alt="Ambiente industrial da equipe"
                    className={
                        styles['imagem-equipe']
                    }
                />

                <img
                    src={imagemLogo}
                    alt={`Logo da ${equipeNome}`}
                    className={
                        styles['logo-equipe']
                    }
                />

                <div
                    className={
                        styles['informacoes-equipe']
                    }
                >

                    <h3>
                        {equipeNome}
                    </h3>

                    <p>
                        Setor: {equipeSetor}
                    </p>

                    <p>
                        Integrantes:{' '}
                        {equipeIntegrantes} pessoas
                    </p>

                    <div className={styles.Botoes}>
                        <button
                            type="button"
                            className={styles['botao-ambiente']}
                            onClick={handleEntrar}
                        >
                            Entrar no Ambiente Virtual
                        </button>

                        {/* <div
                            className={styles['acoes-equipe']}
                        >
                        </div> */}

                        <button className={`${styles.acoesEquipe}`}
                            type="button"
                            aria-label="Mais opções"
                            onClick={handleMenu}
                        >
                            <MoreVertical
                                size={20}
                                strokeWidth={3}
                            />
                        </button>

                    </div>

                </div>

                {menuAberto && (

                    <div
                        className={
                            styles['menu-acoes']
                        }
                        onClick={(evento) =>
                            evento.stopPropagation()
                        }
                    >

                        <button
                            type="button"
                            onClick={handleConfiguracoes}
                        >
                            Configurações da Equipe
                        </button>

                        <button
                            type="button"
                            onClick={handleGerenciarIntegrantes}
                        >
                            Gerenciar integrantes
                        </button>

                        <button
                            type="button"
                            onClick={handleExcluir}
                        >
                            Excluir equipe
                        </button>

                    </div>

                )}

            </article>
        </>
    )
}