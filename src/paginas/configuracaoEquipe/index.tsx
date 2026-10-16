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
    descricao?: string | null;
    setor: string;
    limiteIntegrantes: number;
    imagemFundo?: string | null;
    logo?: string | null;
    plano: string;
    codigo: string;
};

type RespostaAPI = {
    mensagem?: string;
    erro?: string;
    equipe?: Equipe;
};

export function TelaConfiguracoesEquipe() {
    const navigate = useNavigate();

    const [menuConfiguracaoAberto, setMenuConfiguracaoAberto] = useState(false);
    const [modalCriarEquipeAberto, setModalCriarEquipeAberto] = useState(false);

    const [equipes, setEquipes] = useState<Equipe[]>([]);
    const [carregandoEquipes, setCarregandoEquipes] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            navigate('/login', { replace: true });
            return;
        }

        const carregarEquipes = async () => {
            try {
                const resposta = await fetch('/equipes', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const dados = await resposta.json().catch(() => []);

                if (!resposta.ok) {
                    const mensagem = Array.isArray(dados)
                        ? 'Não foi possível carregar suas equipes.'
                        : dados.mensagem || dados.erro || 'Não foi possível carregar suas equipes.';
                    throw new Error(mensagem);
                }

                setEquipes(Array.isArray(dados) ? dados : []);
            } catch (error) {
                console.error('Erro ao carregar equipes:', error);
            } finally {
                setCarregandoEquipes(false);
            }
        };

        void carregarEquipes();
    }, [navigate]);

    const adicionarEquipe = (equipe: Equipe) => {
        setEquipes((atuais) => [equipe, ...atuais]);
    };

    const removerEquipeModelo = async (id: string) => {
        const token = localStorage.getItem('token');

        if (!token) {
            navigate('/login', { replace: true });
            return;
        }

        try {
            const resposta = await fetch(`/equipes/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const dados = await resposta.json().catch(() => ({})) as RespostaAPI;

            if (!resposta.ok) {
                throw new Error(dados.mensagem || dados.erro || 'Não foi possível excluir a equipe.');
            }

            setEquipes((atuais) => atuais.filter((equipe) => equipe.id !== id));
        } catch (error) {
            window.alert(error instanceof Error ? error.message : 'Não foi possível excluir a equipe.');
        }
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

                {carregandoEquipes ? (
                    <section className={styles['estado-vazio']}>
                        <div className={styles['estado-vazio-conteudo']}>
                            <h2>Carregando equipes...</h2>
                        </div>
                    </section>
                ) : equipes.length === 0 ? (

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
                                onClick={() => setModalCriarEquipeAberto(true)}
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
                                imagem={equipe.imagemFundo || Empresa3D}
                                imagemalt="Ambiente da equipe"
                                imagemLogo={equipe.logo || QualquerImagem}
                                equipeNome={equipe.nome}
                                equipeSetor={equipe.setor}
                                equipeIntegrantes={equipe.limiteIntegrantes}

                                onEntrar={(id) => {
                                    const equipeSelecionada = equipes.find((item) => item.id === id);
                                    if (!equipeSelecionada) return;

                                    navigate(`/rotina-aparelhos/${encodeURIComponent(id)}`, {
                                        state: { equipe: equipeSelecionada },
                                    });
                                }}

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
                    onCriada={adicionarEquipe}
                />
            )}


            <FooterBar />

        </div>
    );
}