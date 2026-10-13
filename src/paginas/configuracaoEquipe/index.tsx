import { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Empresa3D from '../../imagens/Empresa3D.png';
import QualquerImagem from '../../imagens/AutomatizacaoImagem.jpg';
import { BarraNavegacaoLogado } from '../../componentes/BarraNavegacaoLogado';
import { FooterBar } from '../../componentes/FooterBar';
import styles from './styles.module.css';
import { CardEquipe } from "../../componentes/CardEquipe";
import { ModalCriarEquipe } from '../../componentes/ModalCriarEquipe';

type Equipe = {
    id: string;
    nome: string;
    setor: string;
    integrantes: number;
    imagem: string;
    logo: string;
};

const equipeModelo: Equipe[] = [
    {
        id: 'equipe-modelo',
        nome: "Nicolas's Team",
        setor: 'Industrial',
        integrantes: 20,
        imagem: Empresa3D,
        logo: QualquerImagem
    },

    {
        id: 'equipe-modelo2',
        nome: "Nicolas's Team",
        setor: 'Industrial',
        integrantes: 20,
        imagem: Empresa3D,
        logo: QualquerImagem
    },

    {
        id: 'equipe-modelo3',
        nome: "Nicolas's Team",
        setor: 'Industrial',
        integrantes: 20,
        imagem: Empresa3D,
        logo: QualquerImagem
    }
];

export function TelaConfiguracoesEquipe() {
    const navigate = useNavigate();

    const [menuConfiguracaoAberto, setMenuConfiguracaoAberto] = useState(false);
    const [modalCriarEquipeAberto, setModalCriarEquipeAberto] = useState(false);

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

            return equipesConvertidas.map((equipe: Equipe) => {
                const equipeOriginal = equipeModelo.find(
                    (modelo) => modelo.id === equipe.id
                );

                return equipeOriginal
                    ? {
                        ...equipe,
                        imagem: equipeOriginal.imagem,
                        logo: equipeOriginal.logo
                    }
                    : equipe;
            });
        } catch {
            return [];
        }
    });


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

            return equipeModelo;
        });
    };

    const removerEquipeModelo = (id: string) => {
        setEquipes((equipesAtuais) =>
            equipesAtuais.filter(
                (equipe) => equipe.id !== id
            )
        );
    };

    return (
        <div className={styles['pagina-equipe']}>

            <BarraNavegacaoLogado />

            <section className={styles['barra-titulo']}>

                <h1>
                    Configurações de Equipe
                </h1>

                <div className={styles['configuracao-container']}>

                    <button
                        type="button"
                        className={styles.configuracao}
                        aria-label="Abrir menu de configurações"
                        aria-expanded={menuConfiguracaoAberto}
                        onClick={() =>
                            setMenuConfiguracaoAberto((aberto) => !aberto)
                        }
                    >
                        <Settings
                            size={32}
                            strokeWidth={2}
                        />
                    </button>

                    {menuConfiguracaoAberto && (
                        <div
                            className={styles['menu-configuracao']}
                            onClick={(evento) => evento.stopPropagation()}
                        >
                            <button
                                type="button"
                                onClick={() => {
                                    setMenuConfiguracaoAberto(false);
                                    setModalCriarEquipeAberto(true);
                                }}
                            >
                                Criar uma Equipe
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setMenuConfiguracaoAberto(false);
                                }}
                            >
                                Configurações de Equipe
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setMenuConfiguracaoAberto(false);
                                    navigate('/automacoes');
                                }}
                            >
                                Automações
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setMenuConfiguracaoAberto(false);
                                    navigate('/entrar-equipe');
                                }}
                            >
                                Entrar numa equipe
                            </button>
                        </div>
                    )}

                </div>

            </section>

            <main
                className={styles.conteudo}
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
                            <CardEquipe
                                key={equipe.id}
                                id={equipe.id}
                                imagem={equipe.imagem}
                                imagemalt="Ambiente industrial da equipe"
                                imagemLogo={equipe.logo}
                                equipeNome={equipe.nome}
                                equipeSetor={equipe.setor}
                                equipeIntegrantes={equipe.integrantes}

                                onEntrar={() => navigate('/')}

                                onConfiguracoes={(id) => {
                                    window.alert(`Configurações da equipe: ${id}`);
                                }}

                                onGerenciarIntegrantes={(id) => {
                                    window.alert(`Gerenciar integrantes da equipe: ${id}`);
                                }}

                                onExcluir={(id) => {
                                    const equipeExcluir = equipes.find(
                                        (item) => item.id === id
                                    );

                                    if (!equipeExcluir) return;

                                    const confirmar = window.confirm(
                                        `Deseja excluir a equipe ${equipeExcluir.nome}?`
                                    );

                                    if (confirmar) {
                                        removerEquipeModelo(id);
                                    }
                                }}
                            />
                        ))}

                    </section>
                )}

            </main>

            {modalCriarEquipeAberto && (
                <ModalCriarEquipe
                    onFechar={() => setModalCriarEquipeAberto(false)}
                />
            )}


            <FooterBar />

        </div>
    );
}