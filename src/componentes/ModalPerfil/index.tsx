import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type MouseEvent
} from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Camera, Check, ChevronRight, Download, Info, KeyRound, LogOut, Mail, Monitor, Pencil, Save, Settings2, ShieldCheck, Trash2, UserRound, X
} from 'lucide-react';
import styles from './styles.module.css';

type UsuarioPerfil = {
    id?: string;
    nome?: string;
    email?: string;
    fotoPerfil?: string;
};

type SecaoPerfil = 'conta' | 'privacidade' | 'notificacao' | 'configuracoes';

type ModalPerfilProps = {
    usuario: UsuarioPerfil;
    onFechar: () => void;
    onUsuarioAtualizado: (usuario: UsuarioPerfil) => void;
};

type RespostaAPI = {
    mensagem?: string;
    erro?: string;
    usuario?: UsuarioPerfil;
};

const ROTA_PERFIL = '/usuarios/perfil';
const TEXTO_CONFIRMAR_EXCLUSAO = 'EXCLUIR';

export function ModalPerfil({
    usuario,
    onFechar,
    onUsuarioAtualizado
}: ModalPerfilProps) {
    const navigate = useNavigate();
    const campoFotoRef = useRef<HTMLInputElement>(null);

    const [secaoAtiva, setSecaoAtiva] = useState<SecaoPerfil>('conta');
    const [nome, setNome] = useState(usuario.nome ?? '');
    const [email, setEmail] = useState(usuario.email ?? '');
    const [fotoPerfil, setFotoPerfil] = useState(usuario.fotoPerfil ?? '');

    const [editarNome, setEditarNome] = useState(false);
    const [editarEmail, setEditarEmail] = useState(false);
    const [editarSenha, setEditarSenha] = useState(false);
    const [senhaAtual, setSenhaAtual] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');

    const [notificacoesEmail, setNotificacoesEmail] = useState(true);
    const [notificacoesAplicativo, setNotificacoesAplicativo] = useState(true);

    const [salvando, setSalvando] = useState(false);
    const [excluindo, setExcluindo] = useState(false);
    const [confirmarExclusao, setConfirmarExclusao] = useState(false);
    const [textoConfirmacao, setTextoConfirmacao] = useState('');
    const [erro, setErro] = useState('');
    const [mensagem, setMensagem] = useState('');

    const existemAlteracoes =
        nome.trim() !== (usuario.nome ?? '') ||
        email.trim() !== (usuario.email ?? '') ||
        fotoPerfil !== (usuario.fotoPerfil ?? '') ||
        Boolean(senhaAtual || novaSenha || confirmarSenha);

    const limparMensagens = () => {
        setErro('');
        setMensagem('');
    };

    // Busca os dados mais recentes da conta ao abrir o modal.
    useEffect(() => {
        let ativo = true;
        const token = localStorage.getItem('token');

        if (!token) {
            setErro('Sua sessão não foi encontrada. Entre novamente.');
            return;
        }

        const carregarPerfil = async () => {
            try {
                const resposta = await fetch(ROTA_PERFIL, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const dados = await resposta.json().catch(() => ({})) as RespostaAPI;

                if (!resposta.ok || !dados.usuario) {
                    throw new Error(dados.mensagem || dados.erro || 'Não foi possível carregar seu perfil.');
                }

                if (!ativo) return;

                const perfil = dados.usuario;
                setNome(perfil.nome ?? '');
                setEmail(perfil.email ?? '');
                setFotoPerfil(perfil.fotoPerfil ?? '');
                localStorage.setItem('usuario', JSON.stringify(perfil));
                onUsuarioAtualizado(perfil);
            } catch (error) {
                if (ativo) {
                    setErro(error instanceof Error ? error.message : 'Não foi possível carregar seu perfil.');
                }
            }
        };

        void carregarPerfil();
        return () => { ativo = false; };
    }, [onUsuarioAtualizado]);

    // Permite fechar a janela pela tecla Escape.
    useEffect(() => {
        const handleTecla = (evento: KeyboardEvent) => {
            if (evento.key === 'Escape' && !excluindo) onFechar();
        };

        window.addEventListener('keydown', handleTecla);
        return () => window.removeEventListener('keydown', handleTecla);
    }, [excluindo, onFechar]);

    // Valida e carrega uma imagem escolhida pelo usuário.
    const handleSelecionarFoto = (evento: ChangeEvent<HTMLInputElement>) => {
        const arquivo = evento.target.files?.[0];
        if (!arquivo) return;

        if (!arquivo.type.startsWith('image/')) {
            setErro('Selecione um arquivo de imagem válido.');
            evento.target.value = '';
            return;
        }

        if (arquivo.size > 2 * 1024 * 1024) {
            setErro('A imagem deve ter no máximo 2 MB.');
            evento.target.value = '';
            return;
        }

        const leitor = new FileReader();
        leitor.onload = () => {
            if (typeof leitor.result === 'string') {
                setFotoPerfil(leitor.result);
                limparMensagens();
            }
        };
        leitor.onerror = () => setErro('Não foi possível carregar a imagem.');
        leitor.readAsDataURL(arquivo);
    };

    // Envia as alterações de nome, e-mail, foto e senha ao backend.
    const handleSalvar = async (evento: FormEvent<HTMLFormElement>) => {
        evento.preventDefault();
        limparMensagens();

        if (!nome.trim() || !email.trim()) {
            setErro('Preencha o nome e o e-mail.');
            return;
        }

        const alterandoSenha = Boolean(senhaAtual || novaSenha || confirmarSenha);
        if (alterandoSenha) {
            if (!senhaAtual || !novaSenha || !confirmarSenha) {
                setErro('Preencha todos os campos para alterar a senha.');
                return;
            }
            if (novaSenha !== confirmarSenha) {
                setErro('A nova senha e a confirmação não coincidem.');
                return;
            }
            if (novaSenha.length < 8) {
                setErro('A nova senha deve ter pelo menos 8 caracteres.');
                return;
            }
        }

        const token = localStorage.getItem('token');
        if (!token) {
            setErro('Sua sessão não foi encontrada. Entre novamente.');
            return;
        }

        const dadosAtualizacao = {
            nome: nome.trim(),
            email: email.trim().toLowerCase(),
            fotoPerfil,
            ...(alterandoSenha ? { senhaAtual, novaSenha } : {})
        };

        try {
            setSalvando(true);
            const resposta = await fetch(ROTA_PERFIL, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(dadosAtualizacao)
            });
            const dados = await resposta.json().catch(() => ({})) as RespostaAPI;

            if (!resposta.ok) {
                throw new Error(dados.mensagem || dados.erro || 'Não foi possível salvar as alterações.');
            }

            const usuarioAtualizado: UsuarioPerfil = {
                ...usuario,
                ...(dados.usuario ?? {}),
                nome: dados.usuario?.nome ?? nome.trim(),
                email: dados.usuario?.email ?? email.trim().toLowerCase(),
                fotoPerfil: dados.usuario?.fotoPerfil ?? fotoPerfil
            };

            localStorage.setItem('usuario', JSON.stringify(usuarioAtualizado));
            onUsuarioAtualizado(usuarioAtualizado);
            setNome(usuarioAtualizado.nome ?? '');
            setEmail(usuarioAtualizado.email ?? '');
            setFotoPerfil(usuarioAtualizado.fotoPerfil ?? '');
            setSenhaAtual('');
            setNovaSenha('');
            setConfirmarSenha('');
            setEditarNome(false);
            setEditarEmail(false);
            setEditarSenha(false);
            setMensagem(dados.mensagem || 'Alterações salvas com sucesso.');
        } catch (error) {
            setErro(error instanceof Error ? error.message : 'Ocorreu um erro ao atualizar o perfil.');
        } finally {
            setSalvando(false);
        }
    };

    // Encerra somente a sessão local e retorna à tela de login.
    const handleSairDaConta = () => {
        const confirmar = window.confirm('Deseja realmente sair da sua conta?');
        if (!confirmar) return;

        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        onFechar();
        navigate('/login', { replace: true });
    };

    // Pede confirmação explícita e solicita a exclusão definitiva ao backend.
    const handleExcluirConta = async () => {
        limparMensagens();
        if (textoConfirmacao !== TEXTO_CONFIRMAR_EXCLUSAO) {
            setErro(`Digite ${TEXTO_CONFIRMAR_EXCLUSAO} para confirmar a exclusão.`);
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            setErro('Sua sessão não foi encontrada. Entre novamente.');
            return;
        }

        try {
            setExcluindo(true);
            const resposta = await fetch(ROTA_PERFIL, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const dados = await resposta.json().catch(() => ({})) as RespostaAPI;

            if (!resposta.ok) {
                if (resposta.status === 404 || resposta.status === 405) {
                    throw new Error('O backend ainda não disponibiliza a exclusão de conta (DELETE /usuarios/perfil).');
                }
                throw new Error(dados.mensagem || dados.erro || 'Não foi possível excluir a conta.');
            }

            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            onFechar();
            navigate('/login', { replace: true });
        } catch (error) {
            setErro(error instanceof Error ? error.message : 'Ocorreu um erro ao excluir a conta.');
        } finally {
            setExcluindo(false);
        }
    };

    // Gera uma cópia JSON das informações de perfil atualmente disponíveis no navegador.
    const handleBaixarDados = () => {
        const dados = {
            conta: {
                id: usuario.id ?? null,
                nome,
                email,
                fotoPerfil: fotoPerfil || null
            },
            exportadoEm: new Date().toISOString(),
            observacao: 'Este arquivo contém os dados de perfil atualmente disponíveis nesta sessão.'
        };
        const arquivo = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(arquivo);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'meus-dados-fhive.json';
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    };

    const handleFecharFundo = (evento: MouseEvent<HTMLDivElement>) => {
        if (evento.target === evento.currentTarget && !excluindo) onFechar();
    };

    return (
        <div className={styles['fundo-modal']} onMouseDown={handleFecharFundo}>
            <section
                className={styles['modal-perfil']}
                role="dialog"
                aria-modal="true"
                aria-label="Configurações da conta"
            >
                <aside className={styles['barra-lateral']}>
                    <div className={styles['perfil-resumo']}>
                        <button
                            type="button"
                            className={styles['foto-resumo']}
                            onClick={() => campoFotoRef.current?.click()}
                            aria-label="Alterar foto de perfil"
                        >
                            {fotoPerfil ? <img src={fotoPerfil} alt="Foto de perfil" /> : <Camera size={22} />}
                        </button>
                        <div className={styles['dados-resumo']}>
                            <span className={styles['nome-resumo']}>{nome || 'Seu usuário'}</span>
                            <span className={styles['email-resumo']}>{email || 'E-mail não informado'}</span>
                            <button
                                type="button"
                                className={styles['editar-perfil']}
                                onClick={() => campoFotoRef.current?.click()}
                            >
                                Alterar foto <Pencil size={12} />
                            </button>
                        </div>
                    </div>

                    <input
                        ref={campoFotoRef}
                        type="file"
                        accept="image/*"
                        className={styles['campo-arquivo']}
                        onChange={handleSelecionarFoto}
                    />

                    <nav className={styles['menu-lateral']} aria-label="Seções do perfil">
                        <button type="button" className={`${styles['item-menu']} ${secaoAtiva === 'conta' ? styles['item-menu-ativo'] : ''}`} onClick={() => { setSecaoAtiva('conta'); limparMensagens(); }}>
                            <UserRound size={18} /><span>Conta</span>
                        </button>
                        <button type="button" className={`${styles['item-menu']} ${secaoAtiva === 'privacidade' ? styles['item-menu-ativo'] : ''}`} onClick={() => { setSecaoAtiva('privacidade'); limparMensagens(); }}>
                            <ShieldCheck size={18} /><span>Dados e privacidade</span>
                        </button>
                        <button type="button" className={`${styles['item-menu']} ${secaoAtiva === 'notificacao' ? styles['item-menu-ativo'] : ''}`} onClick={() => { setSecaoAtiva('notificacao'); limparMensagens(); }}>
                            <Bell size={18} /><span>Notificações</span>
                        </button>
                    </nav>

                    <div className={styles['divisoria-lateral']} />
                    <button
                        type="button"
                        className={`${styles['item-menu']} ${styles['item-outras-config']} ${secaoAtiva === 'configuracoes' ? styles['item-menu-ativo'] : ''}`}
                        onClick={() => { setSecaoAtiva('configuracoes'); limparMensagens(); }}
                    >
                        <Settings2 size={18} /><span>Outras configurações</span>
                    </button>

                    <div className={styles['rodape-lateral']}>
                        <p>Sua conta está conectada neste navegador.</p>
                        <button type="button" className={styles['botao-sair']} onClick={handleSairDaConta}>
                            <LogOut size={16} /> Sair da conta
                        </button>
                    </div>
                </aside>

                <main className={styles['conteudo-principal']}>
                    {(erro || mensagem) && (
                        <div className={erro ? styles['mensagem-erro'] : styles['mensagem-sucesso']} role={erro ? 'alert' : 'status'}>
                            {erro || mensagem}
                        </div>
                    )}

                    {secaoAtiva === 'conta' && (
                        <form className={styles['formulario-conta']} onSubmit={handleSalvar}>
                            <header className={styles['cabecalho-secao']}>
                                <h2 className={styles['titulo-secao']}>Informações da conta</h2>
                                <p>Confira e atualize os dados utilizados no seu perfil Fhive.</p>
                            </header>

                            <section className={styles['grupo-configuracao']}>
                                <h3>Dados pessoais</h3>
                                <div className={styles['linha-configuracao']}>
                                    <div className={styles['informacao-configuracao']}>
                                        <label className={styles['rotulo-configuracao']} htmlFor="perfil-nome">Nome de usuário</label>
                                        {editarNome ? (
                                            <input id="perfil-nome" className={styles['campo-edicao']} value={nome} onChange={evento => setNome(evento.target.value)} maxLength={100} autoFocus required />
                                        ) : <span className={styles['valor-configuracao']}>{nome || 'Não informado'}</span>}
                                    </div>
                                    <button type="button" className={styles['botao-editar']} onClick={() => { if (editarNome) setNome(usuario.nome ?? ''); setEditarNome(!editarNome); limparMensagens(); }}>
                                        {editarNome ? <><X size={14} /> Cancelar</> : <><Pencil size={14} /> Editar</>}
                                    </button>
                                </div>
                                <div className={styles['linha-configuracao']}>
                                    <div className={styles['informacao-configuracao']}>
                                        <label className={styles['rotulo-configuracao']} htmlFor="perfil-email">E-mail</label>
                                        {editarEmail ? (
                                            <input id="perfil-email" className={styles['campo-edicao']} type="email" value={email} onChange={evento => setEmail(evento.target.value)} maxLength={150} autoFocus required />
                                        ) : <span className={styles['valor-configuracao']}>{email || 'Não informado'}</span>}
                                    </div>
                                    <button type="button" className={styles['botao-editar']} onClick={() => { if (editarEmail) setEmail(usuario.email ?? ''); setEditarEmail(!editarEmail); limparMensagens(); }}>
                                        {editarEmail ? <><X size={14} /> Cancelar</> : <><Pencil size={14} /> Editar</>}
                                    </button>
                                </div>
                                <div className={styles['linha-configuracao']}>
                                    <div className={styles['informacao-configuracao']}>
                                        <span className={styles['rotulo-configuracao']}>Foto de perfil</span>
                                        <span className={styles['valor-configuracao']}>{fotoPerfil ? 'Imagem personalizada adicionada' : 'Nenhuma imagem personalizada'}</span>
                                    </div>
                                    <button type="button" className={styles['botao-editar']} onClick={() => campoFotoRef.current?.click()}><Camera size={14} /> Alterar</button>
                                </div>
                                <div className={styles['linha-configuracao']}>
                                    <div className={styles['informacao-configuracao']}>
                                        <span className={styles['rotulo-configuracao']}>Identificador da conta</span>
                                        <span className={styles['valor-configuracao']}>{usuario.id || 'Não disponibilizado pelo servidor'}</span>
                                    </div>
                                </div>
                            </section>

                            <section className={styles['grupo-configuracao']}>
                                <h3>Senha e segurança</h3>
                                <div className={styles['linha-configuracao']}>
                                    <div className={styles['informacao-configuracao']}>
                                        <span className={styles['rotulo-configuracao']}>Senha</span>
                                        <span className={styles['valor-configuracao']}>{editarSenha ? 'Informe a senha atual e a nova senha abaixo' : '••••••••••••'}</span>
                                    </div>
                                    <button type="button" className={styles['botao-editar']} onClick={() => { setEditarSenha(!editarSenha); if (editarSenha) { setSenhaAtual(''); setNovaSenha(''); setConfirmarSenha(''); } limparMensagens(); }}>
                                        {editarSenha ? <><X size={14} /> Cancelar</> : <><KeyRound size={14} /> Alterar</>}
                                    </button>
                                </div>
                                {editarSenha && (
                                    <div className={styles['campos-senha']}>
                                        <label>Senha atual<input type="password" autoComplete="current-password" value={senhaAtual} onChange={evento => setSenhaAtual(evento.target.value)} required /></label>
                                        <label>Nova senha<input type="password" autoComplete="new-password" value={novaSenha} onChange={evento => setNovaSenha(evento.target.value)} minLength={8} required /></label>
                                        <label>Confirmar nova senha<input type="password" autoComplete="new-password" value={confirmarSenha} onChange={evento => setConfirmarSenha(evento.target.value)} minLength={8} required /></label>
                                    </div>
                                )}
                                <div className={styles['linha-configuracao']}>
                                    <div className={styles['informacao-configuracao']}>
                                        <span className={styles['rotulo-configuracao']}>Autenticação em duas etapas</span>
                                        <span className={styles['valor-configuracao']}>Recurso ainda não conectado ao servidor</span>
                                    </div>
                                    <span className={styles['status-indisponivel']}>Não configurada</span>
                                </div>
                            </section>

                            {existemAlteracoes && (
                                <div className={styles['acoes-formulario']}>
                                    <button type="submit" className={styles['botao-salvar']} disabled={salvando}>
                                        <Save size={16} /> {salvando ? 'Salvando...' : 'Salvar alterações'}
                                    </button>
                                </div>
                            )}
                        </form>
                    )}

                    {secaoAtiva === 'privacidade' && (
                        <section className={styles['secao-secundaria']}>
                            <header className={styles['cabecalho-secao']}>
                                <h2 className={styles['titulo-secao']}>Dados e privacidade</h2>
                                <p>Tenha controle sobre as informações associadas à sua conta.</p>
                            </header>

                            <div className={styles['cartao-informacao']}>
                                <div className={styles['titulo-cartao']}><ShieldCheck size={19} /><h3>Seus dados no Fhive</h3></div>
                                <p>Você pode consultar as informações básicas do perfil e baixar uma cópia dos dados disponíveis nesta sessão.</p>
                                <div className={styles['linha-dado']}><span>Nome</span><strong>{nome || 'Não informado'}</strong></div>
                                <div className={styles['linha-dado']}><span>E-mail</span><strong>{email || 'Não informado'}</strong></div>
                                <button type="button" className={styles['botao-secundario']} onClick={handleBaixarDados}><Download size={16} /> Baixar meus dados</button>
                            </div>

                            <div className={styles['cartao-perigo']}>
                                <div className={styles['titulo-cartao-perigo']}><Trash2 size={19} /><h3>Excluir conta</h3></div>
                                <p>A exclusão é uma ação permanente. A solicitação será enviada ao servidor e, se confirmada, você será desconectado do Fhive.</p>
                                {!confirmarExclusao ? (
                                    <button type="button" className={styles['botao-excluir']} onClick={() => { setConfirmarExclusao(true); setTextoConfirmacao(''); limparMensagens(); }}>
                                        <Trash2 size={16} /> Excluir minha conta
                                    </button>
                                ) : (
                                    <div className={styles['confirmacao-exclusao']}>
                                        <label htmlFor="confirmar-exclusao">Para continuar, digite <strong>EXCLUIR</strong>.</label>
                                        <input id="confirmar-exclusao" value={textoConfirmacao} onChange={evento => setTextoConfirmacao(evento.target.value.toUpperCase())} autoComplete="off" />
                                        <div className={styles['acoes-exclusao']}>
                                            <button type="button" className={styles['botao-cancelar']} onClick={() => { setConfirmarExclusao(false); setTextoConfirmacao(''); limparMensagens(); }} disabled={excluindo}>Cancelar</button>
                                            <button type="button" className={styles['botao-excluir']} onClick={() => void handleExcluirConta()} disabled={excluindo || textoConfirmacao !== TEXTO_CONFIRMAR_EXCLUSAO}>
                                                <Trash2 size={15} /> {excluindo ? 'Excluindo...' : 'Confirmar exclusão'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {secaoAtiva === 'notificacao' && (
                        <section className={styles['secao-secundaria']}>
                            <header className={styles['cabecalho-secao']}>
                                <h2 className={styles['titulo-secao']}>Notificações</h2>
                                <p>Escolha quais avisos você gostaria de visualizar durante o uso do Fhive.</p>
                            </header>
                            <div className={styles['grupo-configuracao']}>
                                <div className={styles['linha-configuracao']}>
                                    <div className={styles['informacao-configuracao']}>
                                        <span className={styles['rotulo-configuracao']}><Mail size={16} /> Notificações por e-mail</span>
                                        <span className={styles['valor-configuracao']}>Avisos e atualizações enviados para seu endereço de e-mail.</span>
                                    </div>
                                    <button type="button" role="switch" aria-checked={notificacoesEmail} className={`${styles['alternador']} ${notificacoesEmail ? styles['alternador-ativo'] : ''}`} onClick={() => setNotificacoesEmail(!notificacoesEmail)}><span /></button>
                                </div>
                                <div className={styles['linha-configuracao']}>
                                    <div className={styles['informacao-configuracao']}>
                                        <span className={styles['rotulo-configuracao']}><Bell size={16} /> Notificações no aplicativo</span>
                                        <span className={styles['valor-configuracao']}>Avisos exibidos enquanto você utiliza a plataforma.</span>
                                    </div>
                                    <button type="button" role="switch" aria-checked={notificacoesAplicativo} className={`${styles['alternador']} ${notificacoesAplicativo ? styles['alternador-ativo'] : ''}`} onClick={() => setNotificacoesAplicativo(!notificacoesAplicativo)}><span /></button>
                                </div>
                            </div>
                            <p className={styles['nota-configuracao']}><Info size={15} /> Essas preferências são demonstrativas e ainda não são sincronizadas com o backend.</p>
                        </section>
                    )}

                    {secaoAtiva === 'configuracoes' && (
                        <section className={styles['secao-secundaria']}>
                            <header className={styles['cabecalho-secao']}>
                                <h2 className={styles['titulo-secao']}>Outras configurações</h2>
                                <p>Informações sobre o ambiente e a sessão atual.</p>
                            </header>
                            <div className={styles['grupo-configuracao']}>
                                <div className={styles['linha-configuracao']}>
                                    <div className={styles['informacao-configuracao']}>
                                        <span className={styles['rotulo-configuracao']}>Idioma da plataforma</span>
                                        <span className={styles['valor-configuracao']}>Português (Brasil)</span>
                                    </div>
                                    <Check size={17} className={styles['icone-confirmacao']} />
                                </div>
                                <div className={styles['linha-configuracao']}>
                                    <div className={styles['informacao-configuracao']}>
                                        <span className={styles['rotulo-configuracao']}><Monitor size={16} /> Sessão atual</span>
                                        <span className={styles['valor-configuracao']}>Conectada neste navegador</span>
                                    </div>
                                    <span className={styles['status-conectado']}>Ativa</span>
                                </div>
                                <div className={styles['linha-configuracao']}>
                                    <div className={styles['informacao-configuracao']}>
                                        <span className={styles['rotulo-configuracao']}>Autenticação em duas etapas</span>
                                        <span className={styles['valor-configuracao']}>A configuração desse recurso ainda não está disponível.</span>
                                    </div>
                                    <span className={styles['status-indisponivel']}>Indisponível</span>
                                </div>
                            </div>
                            <p className={styles['nota-configuracao']}><Info size={15} /> Algumas opções serão habilitadas quando houver suporte correspondente no backend.</p>
                        </section>
                    )}
                </main>
            </section>
        </div>
    );
}
