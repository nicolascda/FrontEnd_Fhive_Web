import { useEffect, useState } from 'react';
import { MoreVertical, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Empresa3D from '../../imagens/Empresa3D.png';
import QualquerImagem from '../../imagens/AutomatizacaoImagem.jpg';
import { BarraNavegacaoLogado } from '../../componentes/BarraNavegacaoLogado';
import { FooterBar } from '../../componentes/FooterBar';
import styles from './styles.module.css';

type Equipe = {
    id: string;
    nome: string;
    setor: string;
    integrantes: number;
    imagem: string;
    logo: string;
};

const equipeModelo: Equipe = {
    id: 'equipe-modelo',
    nome: "Nicolas's Team",
    setor: 'Industrial',
    integrantes: 20,
    imagem: Empresa3D,
    logo: QualquerImagem
};

export function TelaConfiguracoesEquipe() {
    const navigate = useNavigate();

    const [equipes, setEquipes] = useState<Equipe[]>(() => {
        const equipesSalvas = localStorage.getItem('equipes');

        if (!equipesSalvas) {
            return [];
        }

        try {
            const equipesConvertidas = JSON.parse(equipesSalvas);

            if (!Array.isArray(equipesConvertidas)) {
                return [];
            }

            return equipesConvertidas.map((equipe: Equipe) =>
                equipe.id === 'equipe-modelo'
                    ? {
                        ...equipe,
                        imagem: equipeModelo.imagem,
                        logo: equipeModelo.logo
                    }
                    : equipe
            );
        } catch {
            return [];
        }
    });

    const [menuEquipeId, setMenuEquipeId] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            navigate('/login', { replace: true });
        }
    }, [navigate]);

    useEffect(() => {
        localStorage.setItem(
            'equipes',
            JSON.stringify(equipes)
        );
    }, [equipes]);

    const criarEquipeModelo = () => {
        setEquipes((equipesAtuais) => {
            if (equipesAtuais.length > 0) {
                return equipesAtuais;
            }

            return [equipeModelo];
        });
    };

    const removerEquipeModelo = (id: string) => {
        setEquipes((equipesAtuais) =>
            equipesAtuais.filter(
                (equipe) => equipe.id !== id
            )
        );

        setMenuEquipeId(null);
    };

    return (
        <div className={styles['pagina-equipe']}>

            <BarraNavegacaoLogado />

            <section className={styles['barra-titulo']}>

                <h1>
                    Configurações de Equipe
                </h1>

                <div className={styles.configuracao}>
                    <Settings
                        size={32}
                        strokeWidth={2}
                    />
                </div>

            </section>

            <main
                className={styles.conteudo}
                onClick={() => setMenuEquipeId(null)}
            >

                {equipes.length === 0 ? (

                    <section className={styles['estado-vazio']}>

                        <div
                            className={
                                styles['estado-vazio-conteudo']
                            }
                        >

                            <h2>
                                Você ainda não possui uma equipe
                            </h2>

                            <p>
                                Crie sua primeira equipe e comece a
                                organizar seu ambiente no Fhive.
                            </p>

                            <button
                                type="button"
                                onClick={criarEquipeModelo}
                            >
                                Criar minha equipe
                            </button>

                        </div>

                    </section>

                ) : (

                    <section className={styles['lista-equipes']}>

                        {equipes.map((equipe) => (

                            <article
                                key={equipe.id}
                                className={styles['card-equipe']}
                                onClick={(evento) =>
                                    evento.stopPropagation()
                                }
                            >

                                <img
                                    src={equipe.imagem}
                                    alt="Ambiente industrial da equipe"
                                    className={
                                        styles['imagem-equipe']
                                    }
                                />

                                <img
                                    src={equipe.logo}
                                    alt={`Logo da ${equipe.nome}`}
                                    className={
                                        styles['logo-equipe']
                                    }
                                />

                                <div
                                    className={
                                        styles['informacoes-equipe']
                                    }
                                >

                                    <strong>
                                        {equipe.nome}
                                    </strong>

                                    <span>
                                        Setor: {equipe.setor}
                                    </span>

                                    <span>
                                        Integrantes:{' '}
                                        {equipe.integrantes} pessoas
                                    </span>

                                    <button
                                        type="button"
                                        className={
                                            styles['botao-ambiente']
                                        }
                                        onClick={() =>
                                            navigate('/')
                                        }
                                    >
                                        Entrar no Ambiente Virtual
                                    </button>

                                </div>

                                <div
                                    className={
                                        styles['acoes-equipe']
                                    }
                                >

                                    <button
                                        type="button"
                                        aria-label="Configurações da equipe"
                                        onClick={() =>
                                            setMenuEquipeId(
                                                (id) =>
                                                    id === equipe.id
                                                        ? null
                                                        : equipe.id
                                            )
                                        }
                                    >
                                        <Settings
                                            size={13}
                                            strokeWidth={2}
                                        />
                                    </button>

                                    <button
                                        type="button"
                                        aria-label="Mais opções"
                                        onClick={() =>
                                            setMenuEquipeId(
                                                (id) =>
                                                    id === equipe.id
                                                        ? null
                                                        : equipe.id
                                            )
                                        }
                                    >
                                        <MoreVertical
                                            size={13}
                                            strokeWidth={2}
                                        />
                                    </button>

                                </div>

                                {menuEquipeId === equipe.id && (

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
                                            onClick={() =>
                                                setMenuEquipeId(null)
                                            }
                                        >
                                            Configurações da Equipe
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setMenuEquipeId(null)
                                            }
                                        >
                                            Gerenciar integrantes
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                removerEquipeModelo(
                                                    equipe.id
                                                )
                                            }
                                        >
                                            Excluir equipe
                                        </button>

                                    </div>

                                )}

                            </article>

                        ))}

                    </section>

                )}

            </main>

            <FooterBar />

        </div>
    );
}