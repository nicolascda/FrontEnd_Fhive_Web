
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

import styles from './styles.module.css';
import PessoasSentadas from '../../imagens/PessoasSentadas.jpg';

type Etapa = 'email' | 'codigo' | 'senha' | 'concluido';

type RespostaAPI = {
    mensagem?: string;
    erro?: string;
};

export function TelaRecuperarSenha() {
    const [etapa, setEtapa] = useState<Etapa>('email');

    const [email, setEmail] = useState('');
    const [codigo, setCodigo] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');

    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState('');
    const [mensagem, setMensagem] = useState('');

    const enviarRequisicao = async (
        rota: string,
        corpo: Record<string, string>
    ): Promise<RespostaAPI> => {
        const resposta = await fetch(rota, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(corpo),
        });

        const dados = await resposta
            .json()
            .catch(() => ({})) as RespostaAPI;

        if (!resposta.ok) {
            throw new Error(
                dados.mensagem ||
                dados.erro ||
                'Não foi possível concluir a solicitação.'
            );
        }

        return dados;
    };

    const handleEnviarEmail = async () => {
        if (!email.trim()) {
            setErro('Informe seu e-mail.');
            return;
        }

        try {
            setCarregando(true);
            setErro('');
            setMensagem('');

            const dados = await enviarRequisicao(
                '/usuarios/esqueci-senha',
                {
                    email: email.trim().toLowerCase(),
                }
            );

            setEtapa('codigo');
            setMensagem(
                dados.mensagem ||
                'Informe o código que você recebeu no e-mail.'
            );
        } catch (error) {
            setErro(
                error instanceof Error
                    ? error.message
                    : 'Não foi possível enviar o código.'
            );
        } finally {
            setCarregando(false);
        }
    };

    const handleVerificarCodigo = async () => {
        if (!codigo.trim()) {
            setErro('Digite o código recebido no e-mail.');
            return;
        }

        try {
            setCarregando(true);
            setErro('');
            setMensagem('');

            const dados = await enviarRequisicao(
                '/usuarios/verificar-codigo-recuperacao',
                {
                    email: email.trim().toLowerCase(),
                    codigo: codigo.trim(),
                }
            );

            setEtapa('senha');
            setMensagem(
                dados.mensagem ||
                'Código validado. Agora cadastre sua nova senha.'
            );
        } catch (error) {
            setErro(
                error instanceof Error
                    ? error.message
                    : 'Não foi possível validar o código.'
            );
        } finally {
            setCarregando(false);
        }
    };

    const handleRedefinirSenha = async () => {
        if (!novaSenha || !confirmarSenha) {
            setErro('Preencha os dois campos de senha.');
            return;
        }

        if (novaSenha.length < 8) {
            setErro('A nova senha deve ter pelo menos 8 caracteres.');
            return;
        }

        if (novaSenha !== confirmarSenha) {
            setErro('As senhas digitadas não coincidem.');
            return;
        }

        try {
            setCarregando(true);
            setErro('');
            setMensagem('');

            const dados = await enviarRequisicao(
                '/usuarios/redefinir-senha',
                {
                    email: email.trim().toLowerCase(),
                    codigo: codigo.trim(),
                    novaSenha,
                }
            );

            setEtapa('concluido');
            setMensagem(
                dados.mensagem ||
                'Sua senha foi redefinida com sucesso.'
            );

            setNovaSenha('');
            setConfirmarSenha('');
        } catch (error) {
            setErro(
                error instanceof Error
                    ? error.message
                    : 'Não foi possível redefinir sua senha.'
            );
        } finally {
            setCarregando(false);
        }
    };

    const handleSubmit = async (
        evento: FormEvent<HTMLFormElement>
    ) => {
        evento.preventDefault();

        if (etapa === 'email') {
            await handleEnviarEmail();
        } else if (etapa === 'codigo') {
            await handleVerificarCodigo();
        } else if (etapa === 'senha') {
            await handleRedefinirSenha();
        }
    };

    const titulo = {
        email: 'Esqueceu a senha?',
        codigo: 'Verifique seu e-mail',
        senha: 'Crie uma nova senha',
        concluido: 'Senha redefinida!',
    }[etapa];

    const texto = {
        email:
            'Informe o e-mail associado à sua conta para receber um código de recuperação.',
        codigo:
            'Enviamos as instruções para o endereço informado. Digite o código que você recebeu no e-mail.',
        senha:
            'Código validado! Cadastre sua nova senha e confirme para finalizar a recuperação.',
        concluido:
            'Sua senha foi atualizada. Agora você pode entrar na sua conta usando a nova senha.',
    }[etapa];

    return (
        <main className={styles['tela-recuperar-senha']}>

            <section className={styles['container-formulario']}>

                <form
                    className={styles['formulario']}
                    onSubmit={handleSubmit}
                >
                    <h1 className={styles['titulo']}>
                        {titulo}
                    </h1>

                    <p className={styles['descricao']}>
                        {texto}
                    </p>

                    {etapa === 'email' && (
                        <div className={styles['grupo-campo']}>
                            <label htmlFor="email-recuperacao">
                                E-mail
                            </label>

                            <input
                                id="email-recuperacao"
                                type="email"
                                placeholder="Digite seu e-mail"
                                value={email}
                                onChange={(evento) =>
                                    setEmail(evento.target.value)
                                }
                                autoComplete="email"
                                required
                            />
                        </div>
                    )}

                    {etapa === 'codigo' && (
                        <div className={styles['grupo-campo']}>
                            <label htmlFor="codigo-recuperacao">
                                Código de verificação
                            </label>

                            <input
                                id="codigo-recuperacao"
                                type="text"
                                placeholder="Digite o código recebido"
                                value={codigo}
                                onChange={(evento) =>
                                    setCodigo(evento.target.value)
                                }
                                autoComplete="one-time-code"
                                inputMode="numeric"
                                maxLength={10}
                                required
                            />

                            <button
                                type="button"
                                className={styles['botao-voltar-etapa']}
                                onClick={() => {
                                    setEtapa('email');
                                    setErro('');
                                    setMensagem('');
                                }}
                            >
                                Informar outro e-mail
                            </button>
                        </div>
                    )}

                    {etapa === 'senha' && (
                        <>
                            <div className={styles['grupo-campo']}>
                                <label htmlFor="nova-senha">
                                    Nova senha
                                </label>

                                <input
                                    id="nova-senha"
                                    type="password"
                                    placeholder="Digite sua nova senha"
                                    value={novaSenha}
                                    onChange={(evento) =>
                                        setNovaSenha(evento.target.value)
                                    }
                                    autoComplete="new-password"
                                    minLength={8}
                                    required
                                />
                            </div>

                            <div className={styles['grupo-campo']}>
                                <label htmlFor="confirmar-senha">
                                    Confirmar nova senha
                                </label>

                                <input
                                    id="confirmar-senha"
                                    type="password"
                                    placeholder="Digite novamente sua senha"
                                    value={confirmarSenha}
                                    onChange={(evento) =>
                                        setConfirmarSenha(evento.target.value)
                                    }
                                    autoComplete="new-password"
                                    minLength={8}
                                    required
                                />
                            </div>
                        </>
                    )}

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

                    {etapa !== 'concluido' && (
                        <button
                            className={styles['botao-enviar']}
                            type="submit"
                            disabled={carregando}
                        >
                            {carregando
                                ? 'Aguarde...'
                                : etapa === 'email'
                                    ? 'Enviar código'
                                    : etapa === 'codigo'
                                        ? 'Verificar código'
                                        : 'Redefinir senha'}
                        </button>
                    )}

                    <p className={styles['voltar-login']}>
                        {etapa === 'concluido'
                            ? 'Sua conta está pronta para ser acessada.'
                            : 'Lembrou sua senha?'}{' '}

                        <Link to="/login">
                            Voltar para o login
                        </Link>
                    </p>

                </form>

            </section>

            <section className={styles['container-visual']}>

                <img
                    src={PessoasSentadas}
                    alt="Pessoas em uma reunião"
                    className={styles['imagem']}
                />

            </section>

        </main>
    );
}
