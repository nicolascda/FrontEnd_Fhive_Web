import { useCallback, useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Empresa3D from '../../imagens/Empresa3D.png';
import QualquerImagem from '../../imagens/AutomatizacaoImagem.jpg';
import { BarraNavegacaoLogado } from '../../componentes/BarraNavegacaoLogado';
import { FooterBar } from '../../componentes/FooterBar';
import styles from './styles.module.css';
import { CardEquipe } from '../../componentes/CardEquipe';
import { ModalCriarEquipe } from '../../componentes/ModalCriarEquipe';
import { ModalConfigurarEquipe } from '../../componentes/ModalConfigurarEquipe';
import { ModalGerenciarIntegrantes } from '../../componentes/ModalGerenciarIntegrantes';
import { ModalEntrarEquipe } from '../../componentes/ModalEntrarEquipe';

type Permissoes = Record<string, boolean>;

type Equipe = {
    id: string;
    nome: string;
    descricao?: string | null;
    setor: string;
    limiteIntegrantes: number;
    limitePlano?: number;
    quantidadeIntegrantes?: number;
    imagemFundo?: string | null;
    logo?: string | null;
    plano: string;
    codigo: string;
    souDono?: boolean;
    meuCargo?: string;
    minhasPermissoes?: Permissoes;
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
    const [modalEntrarEquipeAberto, setModalEntrarEquipeAberto] = useState(false);
    const [modalEquipe, setModalEquipe] = useState<{
        tipo: 'configurar' | 'integrantes';
        equipe: Equipe;
    } | null>(null);
    const [equipes, setEquipes] = useState<Equipe[]>([]);
    const [carregandoEquipes, setCarregandoEquipes] = useState(true);

    // Busca as equipes do usuário e também é reutilizada após entrar por código.
    const carregarEquipes = useCallback(async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            navigate('/login', { replace: true });
            setCarregandoEquipes(false);
            return;
        }

        try {
            const resposta = await fetch('/equipes', {
                headers: { Authorization: `Bearer ${token}` },
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
    }, [navigate]);

    useEffect(() => {
        void carregarEquipes();
    }, [carregarEquipes]);

    // Abre o modal de entrada por código; não adiciona um card permanente à página.
    const abrirModalEntrarEquipe = () => {
        setMenuConfiguracaoAberto(false);
        setModalEntrarEquipeAberto(true);
    };

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
            const resposta = await fetch(`/equipes/${encodeURIComponent(id)}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            const dados = await resposta.json().catch(() => ({})) as RespostaAPI;

            if (!resposta.ok) {
                throw new Error(dados.mensagem || dados.erro || 'Não foi possível excluir a equipe.');
            }

            setEquipes((atuais) => atuais.filter((equipe) => equipe.id !== id));
            localStorage.removeItem(`fhive:rotinas-equipe:${id}`);
            localStorage.removeItem(`fhive:equipe-ambiente:${id}`);
        } catch (error) {
            window.alert(error instanceof Error ? error.message : 'Não foi possível excluir a equipe.');
        }
    };

    return (
        <div className={styles['pagina-equipe']}>
            <BarraNavegacaoLogado />

            <section className={styles['barra-titulo']}>
                <h1>Configurações de Equipe</h1>

                <div className={styles['configuracao-container']}>
                    <button
                        type="button"
                        className={styles.configuracao}
                        aria-label="Abrir menu de configurações"
                        aria-expanded={menuConfiguracaoAberto}
                        onClick={() => setMenuConfiguracaoAberto((aberto) => !aberto)}
                    >
                        <Settings size={32} strokeWidth={2} />
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
                                onClick={() => setMenuConfiguracaoAberto(false)}
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
                            <button type="button" onClick={abrirModalEntrarEquipe}>
                                Entrar numa equipe
                            </button>
                        </div>
                    )}
                </div>
            </section>

            <main className={styles.conteudo}>
                {carregandoEquipes ? (
                    <section className={`${styles['estado-vazio']} ${styles['estado-vazio-compacto']}`}>
                        <div className={styles['estado-vazio-conteudo']}>
                            <h2>Carregando equipes...</h2>
                        </div>
                    </section>
                ) : (
                    <>
                        {equipes.length === 0 && (
                            <section className={`${styles['estado-vazio']} ${styles['estado-vazio-compacto']}`}>
                                <div className={styles['estado-vazio-conteudo']}>
                                    <h2>Você ainda não possui uma equipe</h2>
                                    <p>Crie uma equipe ou entre em uma existente usando o código de convite.</p>
                                    <button type="button" onClick={() => setModalCriarEquipeAberto(true)}>
                                        Criar minha equipe
                                    </button>
                                    <button type="button" onClick={abrirModalEntrarEquipe}>
                                        Entrar com código
                                    </button>
                                </div>
                            </section>
                        )}

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
                                    equipeIntegrantes={equipe.quantidadeIntegrantes ?? 0}
                                    onEntrar={(id) => {
                                        const equipeSelecionada = equipes.find((item) => item.id === id);
                                        if (!equipeSelecionada) return;

                                        navigate(`/rotina-aparelhos/${encodeURIComponent(id)}`, {
                                            state: { equipe: equipeSelecionada },
                                        });
                                    }}
                                    onConfiguracoes={(id) => {
                                        const equipeSelecionada = equipes.find((item) => item.id === id);
                                        if (!equipeSelecionada) return;

                                        const podeConfigurar =
                                            equipeSelecionada.souDono === true ||
                                            equipeSelecionada.minhasPermissoes?.configurarEquipe === true;

                                        if (!podeConfigurar) {
                                            window.alert('Seu cargo não permite configurar esta equipe.');
                                            return;
                                        }

                                        setModalEquipe({ tipo: 'configurar', equipe: equipeSelecionada });
                                    }}
                                    onGerenciarIntegrantes={(id) => {
                                        const equipeSelecionada = equipes.find((item) => item.id === id);
                                        if (!equipeSelecionada) return;

                                        const podeGerenciar =
                                            equipeSelecionada.souDono === true ||
                                            equipeSelecionada.minhasPermissoes?.gerenciarIntegrantes === true ||
                                            equipeSelecionada.minhasPermissoes?.gerenciarCargos === true;

                                        if (!podeGerenciar) {
                                            window.alert('Seu cargo não permite gerenciar os integrantes desta equipe.');
                                            return;
                                        }

                                        setModalEquipe({ tipo: 'integrantes', equipe: equipeSelecionada });
                                    }}
                                    onExcluir={(id) => {
                                        const equipeSelecionada = equipes.find((item) => item.id === id);
                                        if (!equipeSelecionada) return;

                                        if (equipeSelecionada.souDono !== true) {
                                            window.alert('Somente o líder pode excluir a equipe.');
                                            return;
                                        }

                                        const confirmar = window.confirm(
                                            `Deseja excluir a equipe ${equipeSelecionada.nome}?`
                                        );

                                        if (confirmar) void removerEquipeModelo(id);
                                    }}
                                />
                            ))}
                        </section>
                    </>
                )}
            </main>

            {modalCriarEquipeAberto && (
                <ModalCriarEquipe
                    onFechar={() => setModalCriarEquipeAberto(false)}
                    onCriada={adicionarEquipe}
                />
            )}

            {modalEntrarEquipeAberto && (
                <ModalEntrarEquipe
                    onFechar={() => setModalEntrarEquipeAberto(false)}
                    onEntrou={carregarEquipes}
                />
            )}

            {modalEquipe?.tipo === 'configurar' && (
                <ModalConfigurarEquipe
                    equipe={modalEquipe.equipe}
                    onFechar={() => setModalEquipe(null)}
                    onAtualizada={(equipeAtualizada) => {
                        setEquipes((atuais) =>
                            atuais.map((item) =>
                                item.id === equipeAtualizada.id
                                    ? { ...item, ...equipeAtualizada }
                                    : item
                            )
                        );
                        setModalEquipe(null);
                    }}
                />
            )}

            {modalEquipe?.tipo === 'integrantes' && (
                <ModalGerenciarIntegrantes
                    equipe={modalEquipe.equipe}
                    onFechar={() => setModalEquipe(null)}
                />
            )}

            <FooterBar />
        </div>
    );
}
