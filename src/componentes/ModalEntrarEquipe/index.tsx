import { useEffect, useState, type FormEvent, type MouseEvent } from 'react';
import { ArrowRight, KeyRound, Users, X } from 'lucide-react';
import styles from './styles.module.css';

type RespostaAPI = {
    mensagem?: string;
    erro?: string;
    equipe?: { id: string; nome: string };
};

type ModalEntrarEquipeProps = {
    onFechar: () => void;
    onEntrou: () => Promise<void> | void;
};

/** Modal centralizado para entrar em uma equipe utilizando o código de convite. */
export function ModalEntrarEquipe({ onFechar, onEntrou }: ModalEntrarEquipeProps) {
    const [codigo, setCodigo] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [erro, setErro] = useState('');
    const [mensagem, setMensagem] = useState('');

    // Permite fechar pelo Escape e evita fechar enquanto a requisição está em andamento.
    useEffect(() => {
        const tratarTecla = (evento: KeyboardEvent) => {
            if (evento.key === 'Escape' && !enviando) onFechar();
        };

        window.addEventListener('keydown', tratarTecla);
        return () => window.removeEventListener('keydown', tratarTecla);
    }, [enviando, onFechar]);

    // Envia o código para o endpoint de entrada e atualiza a lista de equipes após o sucesso.
    const handleEntrar = async (evento: FormEvent<HTMLFormElement>) => {
        evento.preventDefault();
        setErro('');
        setMensagem('');

        const codigoNormalizado = codigo.trim().toUpperCase();
        if (!/^[A-F\d]{8}$/.test(codigoNormalizado)) {
            setErro('O código deve conter 8 caracteres: letras de A a F e números.');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            setErro('Sua sessão expirou. Entre novamente.');
            return;
        }

        try {
            setEnviando(true);
            const resposta = await fetch('/equipes/entrar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ codigo: codigoNormalizado }),
            });

            const dados = await resposta.json().catch(() => ({})) as RespostaAPI;
            if (!resposta.ok || !dados.equipe?.id) {
                throw new Error(dados.mensagem || dados.erro || 'Não foi possível entrar na equipe.');
            }

            await onEntrou();
            setMensagem(dados.mensagem || `Você entrou na equipe ${dados.equipe.nome}.`);
            setCodigo('');
        } catch (error) {
            setErro(error instanceof Error ? error.message : 'Não foi possível entrar na equipe.');
        } finally {
            setEnviando(false);
        }
    };

    // O fundo fecha o modal somente quando o clique não acontece no conteúdo.
    const fecharAoClicarNoFundo = (evento: MouseEvent<HTMLDivElement>) => {
        if (evento.target === evento.currentTarget && !enviando) onFechar();
    };

    return (
        <div className={styles.fundoModal} onMouseDown={fecharAoClicarNoFundo}>
            <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="titulo-entrar-equipe">
                <header className={styles.cabecalho}>
                    <div className={styles.tituloComIcone}>
                        <span className={styles.iconeTitulo} aria-hidden="true"><Users size={22} /></span>
                        <div>
                            <h2 id="titulo-entrar-equipe">Entrar em uma equipe</h2>
                            <p>Utilize o código de convite que recebeu.</p>
                        </div>
                    </div>
                    <button type="button" className={styles.fechar} onClick={onFechar} disabled={enviando} aria-label="Fechar modal">
                        <X size={21} />
                    </button>
                </header>

                <form className={styles.conteudo} onSubmit={handleEntrar}>
                    <div className={styles.bloco}>
                        <h3>Código da equipe</h3>
                        <p>Digite o código de oito caracteres para solicitar sua entrada na equipe.</p>
                        <label className={styles.rotulo} htmlFor="codigo-entrar-equipe">Código de convite</label>
                        <div className={styles.campoCodigo}>
                            <KeyRound size={18} aria-hidden="true" />
                            <input
                                id="codigo-entrar-equipe"
                                value={codigo}
                                onChange={(evento) => setCodigo(evento.target.value.toUpperCase().replace(/[^A-F0-9]/g, '').slice(0, 8))}
                                placeholder="Ex.: 3FA8B21C"
                                maxLength={8}
                                autoComplete="off"
                                autoFocus
                                required
                            />
                            <span className={styles.contador}>{codigo.length}/8</span>
                        </div>
                        <p className={styles.ajuda}>O código é fornecido pelo líder ou por um administrador da equipe.</p>
                    </div>

                    {erro && <p className={styles.erro} role="alert">{erro}</p>}
                    {mensagem && <p className={styles.sucesso} role="status">{mensagem}</p>}

                    <div className={styles.acoes}>
                        <button type="button" className={styles.botaoCancelar} onClick={onFechar} disabled={enviando}>
                            Cancelar
                        </button>
                        {mensagem ? (
                            <button type="button" className={styles.botaoPrincipal} onClick={onFechar}>Concluir</button>
                        ) : (
                            <button type="submit" className={styles.botaoPrincipal} disabled={enviando || codigo.length !== 8}>
                                {enviando ? 'Entrando...' : 'Entrar na equipe'}
                                <ArrowRight size={16} />
                            </button>
                        )}
                    </div>
                </form>
            </section>
        </div>
    );
}