
import {
    useEffect,
    useRef,
    useState,
    type ChangeEvent,
    type FormEvent,
    type MouseEvent
} from 'react';

import {
    Bell,
    ChevronRight,
    Pencil,
    Save,
    Settings2,
    ShieldCheck,
    UserRound
} from 'lucide-react';

import styles from './styles.module.css';

type UsuarioPerfil = {
    nome?: string;
    email?: string;
    fotoPerfil?: string;
};

type SecaoPerfil =
    | 'conta'
    | 'privacidade'
    | 'notificacao'
    | 'configuracoes';

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

export function ModalPerfil({
    usuario,
    onFechar,
    onUsuarioAtualizado
}: ModalPerfilProps) {

    const campoFotoRef = useRef<HTMLInputElement>(null);

    const [secaoAtiva, setSecaoAtiva] =
        useState<SecaoPerfil>('conta');

    const [nome, setNome] = useState(usuario.nome ?? '');
    const [email, setEmail] = useState(usuario.email ?? '');
    const [fotoPerfil, setFotoPerfil] = useState(
        usuario.fotoPerfil ?? ''
    );

    const [editarNome, setEditarNome] = useState(false);
    const [editarEmail, setEditarEmail] = useState(false);
    const [editarSenha, setEditarSenha] = useState(false);

    const [senhaAtual, setSenhaAtual] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');

    const [notificacoesAtivas, setNotificacoesAtivas] =
        useState(true);

    const [mfaAtiva, setMfaAtiva] = useState(true);

    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState('');
    const [mensagem, setMensagem] = useState('');

    const emailMascarado = email.includes('@')
        ? `*******@${email.split('@')[1]}`
        : email || 'Não informado';

    const existemAlteracoes =
        nome.trim() !== (usuario.nome ?? '') ||
        email.trim() !== (usuario.email ?? '') ||
        fotoPerfil !== (usuario.fotoPerfil ?? '') ||
        Boolean(senhaAtual || novaSenha || confirmarSenha);

    useEffect(() => {
        const handleTecla = (evento: KeyboardEvent) => {
            if (evento.key === 'Escape') {
                onFechar();
            }
        };

        window.addEventListener('keydown', handleTecla);

        return () => {
            window.removeEventListener('keydown', handleTecla);
        };
    }, [onFechar]);

    const handleSelecionarFoto = (
        evento: ChangeEvent<HTMLInputElement>
    ) => {
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
                setErro('');
                setMensagem('');
            }
        };

        leitor.onerror = () => {
            setErro('Não foi possível carregar a imagem.');
        };

        leitor.readAsDataURL(arquivo);
    };

    const handleSalvar = async (
        evento: FormEvent<HTMLFormElement>
    ) => {
        evento.preventDefault();

        setErro('');
        setMensagem('');

        if (!nome.trim() || !email.trim()) {
            setErro('Preencha o nome e o e-mail.');
            return;
        }

        const alterandoSenha = Boolean(
            senhaAtual || novaSenha || confirmarSenha
        );

        if (alterandoSenha) {
            if (!senhaAtual || !novaSenha || !confirmarSenha) {
                setErro(
                    'Preencha todos os campos para alterar a senha.'
                );
                return;
            }

            if (novaSenha !== confirmarSenha) {
                setErro(
                    'A nova senha e a confirmação não coincidem.'
                );
                return;
            }
        }

        const token = localStorage.getItem('token');

        if (!token) {
            setErro(
                'Sua sessão não foi encontrada. Entre novamente.'
            );
            return;
        }

        const dadosAtualizacao = {
            nome: nome.trim(),
            email: email.trim().toLowerCase(),
            fotoPerfil,
            ...(alterandoSenha
                ? {
                    senhaAtual,
                    novaSenha
                }
                : {})
        };

        try {
            setSalvando(true);

            const resposta = await fetch('/usuarios/perfil', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(dadosAtualizacao)
            });

            const dados = await resposta
                .json()
                .catch(() => ({})) as RespostaAPI;

            if (!resposta.ok) {
                throw new Error(
                    dados.mensagem ||
                    dados.erro ||
                    'Não foi possível salvar as alterações. Verifique a rota do backend.'
                );
            }

            const usuarioAtualizado: UsuarioPerfil = {
                ...usuario,
                ...(dados.usuario ?? {}),
                nome: dados.usuario?.nome ?? nome.trim(),
                email: dados.usuario?.email ??
                    email.trim().toLowerCase(),
                fotoPerfil: dados.usuario?.fotoPerfil ?? fotoPerfil
            };

            localStorage.setItem(
                'usuario',
                JSON.stringify(usuarioAtualizado)
            );

            onUsuarioAtualizado(usuarioAtualizado);

            setSenhaAtual('');
            setNovaSenha('');
            setConfirmarSenha('');

            setEditarNome(false);
            setEditarEmail(false);
            setEditarSenha(false);

            setMensagem(
                dados.mensagem || 'Alterações salvas com sucesso.'
            );

        } catch (error) {
            setErro(
                error instanceof Error
                    ? error.message
                    : 'Ocorreu um erro ao atualizar o perfil.'
            );

        } finally {
            setSalvando(false);
        }
    };

    const handleFecharFundo = (
        evento: MouseEvent<HTMLDivElement>
    ) => {
        if (evento.target === evento.currentTarget) {
            onFechar();
        }
    };

    return (
        <div
            className={styles['fundo-modal']}
            onMouseDown={handleFecharFundo}
        >
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
                            onClick={() =>
                                campoFotoRef.current?.click()
                            }
                            aria-label="Alterar foto de perfil"
                        >
                            {fotoPerfil ? (
                                <img
                                    src={fotoPerfil}
                                    alt="Foto de perfil"
                                />
                            ) : (
                                <UserRound size={25} />
                            )}
                        </button>

                        <div className={styles['dados-resumo']}>
                            <span className={styles['nome-resumo']}>
                                {nome || 'Seu usuário'}
                            </span>

                            <button
                                type="button"
                                className={styles['editar-perfil']}
                                onClick={() =>
                                    campoFotoRef.current?.click()
                                }
                            >
                                Editar perfil
                                <Pencil size={11} />
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

                    <nav className={styles['menu-lateral']}>

                        <button
                            type="button"
                            className={`${styles['item-menu']} ${
                                secaoAtiva === 'conta'
                                    ? styles['item-menu-ativo']
                                    : ''
                            }`}
                            onClick={() => setSecaoAtiva('conta')}
                        >
                            <UserRound size={17} />
                            <span>Conta</span>
                        </button>

                        <button
                            type="button"
                            className={`${styles['item-menu']} ${
                                secaoAtiva === 'privacidade'
                                    ? styles['item-menu-ativo']
                                    : ''
                            }`}
                            onClick={() =>
                                setSecaoAtiva('privacidade')
                            }
                        >
                            <ShieldCheck size={17} />
                            <span>Dados e privacidade</span>
                        </button>

                        <button
                            type="button"
                            className={`${styles['item-menu']} ${
                                secaoAtiva === 'notificacao'
                                    ? styles['item-menu-ativo']
                                    : ''
                            }`}
                            onClick={() =>
                                setSecaoAtiva('notificacao')
                            }
                        >
                            <Bell size={17} />
                            <span>Notificação</span>
                        </button>

                    </nav>

                    <div className={styles['divisoria-lateral']} />

                    <button
                        type="button"
                        className={`${styles['item-menu']} ${
                            styles['item-outras-config']
                        } ${
                            secaoAtiva === 'configuracoes'
                                ? styles['item-menu-ativo']
                                : ''
                        }`}
                        onClick={() =>
                            setSecaoAtiva('configuracoes')
                        }
                    >
                        <Settings2 size={17} />
                        <span>outras config.</span>
                    </button>

                </aside>

                <main className={styles['conteudo-principal']}>

                    {secaoAtiva === 'conta' && (
                        <form
                            className={styles['formulario-conta']}
                            onSubmit={handleSalvar}
                        >
                            <h2 className={styles['titulo-secao']}>
                                Informações da conta
                            </h2>

                            <div className={styles['linha-configuracao']}>

                                <label
                                    className={styles['rotulo-configuracao']}
                                    htmlFor="perfil-nome"
                                >
                                    Nome de usuário
                                </label>

                                <div className={styles['valor-configuracao']}>
                                    {editarNome ? (
                                        <input
                                            id="perfil-nome"
                                            className={styles['campo-edicao']}
                                            value={nome}
                                            onChange={(evento) =>
                                                setNome(evento.target.value)
                                            }
                                            maxLength={100}
                                            autoFocus
                                            required
                                        />
                                    ) : (
                                        <span>
                                            {nome || 'Não informado'}
                                        </span>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    className={styles['botao-editar']}
                                    onClick={() => {
                                        setEditarNome(!editarNome);
                                        setErro('');
                                        setMensagem('');
                                    }}
                                    aria-label="Editar nome de usuário"
                                >
                                    editar
                                </button>

                            </div>

                            <div className={styles['linha-configuracao']}>

                                <label
                                    className={styles['rotulo-configuracao']}
                                    htmlFor="perfil-email"
                                >
                                    Email
                                </label>

                                <div className={styles['valor-configuracao']}>
                                    {editarEmail ? (
                                        <input
                                            id="perfil-email"
                                            className={styles['campo-edicao']}
                                            type="email"
                                            value={email}
                                            onChange={(evento) =>
                                                setEmail(evento.target.value)
                                            }
                                            maxLength={150}
                                            autoFocus
                                            required
                                        />
                                    ) : (
                                        <span>{emailMascarado}</span>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    className={styles['botao-editar']}
                                    onClick={() => {
                                        setEditarEmail(!editarEmail);
                                        setErro('');
                                        setMensagem('');
                                    }}
                                    aria-label="Editar e-mail"
                                >
                                    editar
                                </button>

                            </div>

                            <div
                                className={styles['divisoria-conteudo']}
                            />

                            <h2 className={styles['titulo-secao']}>
                                Senha e segurança
                            </h2>

                            <div className={styles['linha-configuracao']}>

                                <span className={styles['rotulo-configuracao']}>
                                    Senha
                                </span>

                                <div className={styles['valor-configuracao']}>
                                    {editarSenha
                                        ? 'Alterar senha'
                                        : '••••••••'}
                                </div>

                                <button
                                    type="button"
                                    className={styles['botao-editar']}
                                    onClick={() => {
                                        setEditarSenha(!editarSenha);
                                        setErro('');
                                        setMensagem('');
                                    }}
                                    aria-label="Alterar senha"
                                >
                                    editar
                                </button>

                            </div>

                            {editarSenha && (
                                <div className={styles['campos-senha']}>

                                    <label>
                                        Senha atual
                                        <input
                                            type="password"
                                            autoComplete="current-password"
                                            value={senhaAtual}
                                            onChange={(evento) =>
                                                setSenhaAtual(
                                                    evento.target.value
                                                )
                                            }
                                            required
                                        />
                                    </label>

                                    <label>
                                        Nova senha
                                        <input
                                            type="password"
                                            autoComplete="new-password"
                                            value={novaSenha}
                                            onChange={(evento) =>
                                                setNovaSenha(
                                                    evento.target.value
                                                )
                                            }
                                            required
                                        />
                                    </label>

                                    <label>
                                        Confirmar nova senha
                                        <input
                                            type="password"
                                            autoComplete="new-password"
                                            value={confirmarSenha}
                                            onChange={(evento) =>
                                                setConfirmarSenha(
                                                    evento.target.value
                                                )
                                            }
                                            required
                                        />
                                    </label>

                                </div>
                            )}

                            <button
                                type="button"
                                className={styles['linha-seguranca']}
                                onClick={() =>
                                    setSecaoAtiva('configuracoes')
                                }
                            >
                                <span className={styles['rotulo-configuracao']}>
                                    Autentificação Multifatorial
                                </span>

                                <span className={styles['status-seguranca']}>
                                    Ativada
                                    <ChevronRight size={18} />
                                </span>
                            </button>

                            {erro && (
                                <p
                                    className={styles['mensagem-erro']}
                                    role="alert"
                                >
                                    {erro}
                                </p>
                            )}

                            {mensagem && (
                                <p
                                    className={styles['mensagem-sucesso']}
                                    role="status"
                                >
                                    {mensagem}
                                </p>
                            )}

                            {existemAlteracoes && (
                                <div className={styles['acoes-formulario']}>
                                    <button
                                        type="submit"
                                        className={styles['botao-salvar']}
                                        disabled={salvando}
                                    >
                                        <Save size={16} />

                                        {salvando
                                            ? 'Salvando...'
                                            : 'Salvar alterações'}
                                    </button>
                                </div>
                            )}

                        </form>
                    )}

                    {secaoAtiva === 'privacidade' && (
                        <section className={styles['secao-secundaria']}>
                            <h2 className={styles['titulo-secao']}>
                                Dados e privacidade
                            </h2>

                            <p>
                                Consulte e atualize os dados pessoais
                                associados à sua conta.
                            </p>

                            <button
                                type="button"
                                className={styles['botao-secundario']}
                                onClick={() => setSecaoAtiva('conta')}
                            >
                                Gerenciar informações da conta
                                <ChevronRight size={17} />
                            </button>
                        </section>
                    )}

                    {secaoAtiva === 'notificacao' && (
                        <section className={styles['secao-secundaria']}>
                            <h2 className={styles['titulo-secao']}>
                                Notificação
                            </h2>

                            <div className={styles['linha-configuracao']}>
                                <span className={styles['rotulo-configuracao']}>
                                    Notificações por e-mail
                                </span>

                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={notificacoesAtivas}
                                    className={`${styles['alternador']} ${
                                        notificacoesAtivas
                                            ? styles['alternador-ativo']
                                            : ''
                                    }`}
                                    onClick={() =>
                                        setNotificacoesAtivas(
                                            !notificacoesAtivas
                                        )
                                    }
                                >
                                    <span />
                                </button>
                            </div>

                            <p>
                                Esta preferência ainda não é salva
                                no servidor.
                            </p>
                        </section>
                    )}

                    {secaoAtiva === 'configuracoes' && (
                        <section className={styles['secao-secundaria']}>
                            <h2 className={styles['titulo-secao']}>
                                Outras configurações
                            </h2>

                            <div className={styles['linha-configuracao']}>
                                <span className={styles['rotulo-configuracao']}>
                                    Autenticação Multifatorial
                                </span>

                                <button
                                    type="button"
                                    className={styles['status-seguranca']}
                                    onClick={() => setMfaAtiva(!mfaAtiva)}
                                >
                                    {mfaAtiva
                                        ? 'Ativada'
                                        : 'Desativada'}

                                    <ChevronRight size={18} />
                                </button>
                            </div>

                            <p>
                                A autenticação multifatorial ainda não
                                está conectada ao backend.
                            </p>
                        </section>
                    )}

                </main>
            </section>
        </div>
    );
}
