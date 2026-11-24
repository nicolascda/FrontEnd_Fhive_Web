import { useEffect, useState, type FormEvent, type MouseEvent } from 'react';
import { Building2, Copy, Save, X } from 'lucide-react';
import styles from './styles.module.css';

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
    equipe?: Partial<Equipe>;
};

type ModalConfigurarEquipeProps = {
    equipe: Equipe;
    onFechar: () => void;
    onAtualizada: (equipe: Equipe) => void;
};

const SETORES = ['Industrial', 'Educação', 'Saúde', 'Outros'];
const LIMITES_INTEGRANTES = [5, 10, 15, 20, 25, 30, 35];

export function ModalConfigurarEquipe({ equipe, onFechar, onAtualizada }: ModalConfigurarEquipeProps) {
    const [nome, setNome] = useState(equipe.nome ?? '');
    const [descricao, setDescricao] = useState(equipe.descricao ?? '');
    const [setor, setSetor] = useState(equipe.setor ?? 'Industrial');
    const [limiteIntegrantes, setLimiteIntegrantes] = useState(equipe.limiteIntegrantes ?? 5);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [codigoCopiado, setCodigoCopiado] = useState(false);

    // Fecha o modal com Escape, exceto enquanto uma atualização está sendo enviada.
    useEffect(() => {
        const tratarTecla = (evento: KeyboardEvent) => {
            if (evento.key === 'Escape' && !salvando) onFechar();
        };
        window.addEventListener('keydown', tratarTecla);
        return () => window.removeEventListener('keydown', tratarTecla);
    }, [onFechar, salvando]);

    // Salva somente os campos editáveis e preserva as imagens já cadastradas.
    const handleSalvar = async (evento: FormEvent<HTMLFormElement>) => {
        evento.preventDefault();
        setErro('');
        setMensagem('');

        if (!nome.trim()) {
            setErro('Informe o nome da equipe.');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            setErro('Sua sessão expirou. Entre novamente.');
            return;
        }

        const atualizacao = {
            nome: nome.trim(),
            descricao: descricao.trim(),
            setor,
            limiteIntegrantes,
            imagemFundo: equipe.imagemFundo ?? null,
            logo: equipe.logo ?? null,
        };

        try {
            setSalvando(true);
            const resposta = await fetch(`/equipes/${encodeURIComponent(equipe.id)}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(atualizacao),
            });
            const dados = await resposta.json().catch(() => ({})) as RespostaAPI;

            if (!resposta.ok) {
                throw new Error(dados.mensagem || dados.erro || 'Não foi possível atualizar a equipe.');
            }

            onAtualizada({ ...equipe, ...atualizacao, ...(dados.equipe ?? {}) });
            setMensagem(dados.mensagem || 'Configurações da equipe atualizadas.');
        } catch (error) {
            setErro(error instanceof Error ? error.message : 'Não foi possível atualizar a equipe.');
        } finally {
            setSalvando(false);
        }
    };

    // Copia o código de convite para facilitar a entrada de novos integrantes.
    const copiarCodigo = async () => {
        if (!equipe.codigo) return;
        try {
            await navigator.clipboard.writeText(equipe.codigo);
            setCodigoCopiado(true);
            window.setTimeout(() => setCodigoCopiado(false), 1800);
        } catch {
            setErro('Não foi possível copiar o código neste navegador.');
        }
    };

    const fecharAoClicarNoFundo = (evento: MouseEvent<HTMLDivElement>) => {
        if (evento.target === evento.currentTarget && !salvando) onFechar();
    };

    return (
        <div className={styles.fundoModal} onMouseDown={fecharAoClicarNoFundo}>
            <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="titulo-configurar-equipe">
                <header className={styles.cabecalho}>
                    <div className={styles.tituloComIcone}>
                        <Building2 size={21} />
                        <div>
                            <h2 id="titulo-configurar-equipe">Configurar equipe</h2>
                            <p>Atualize as informações e os limites da equipe.</p>
                        </div>
                    </div>
                    <button type="button" className={styles.fechar} onClick={onFechar} aria-label="Fechar modal" disabled={salvando}>
                        <X size={21} />
                    </button>
                </header>

                <form className={styles.conteudo} onSubmit={handleSalvar}>
                    <section className={styles.bloco}>
                        <h3>Informações da equipe</h3>
                        <label className={styles.campo}>
                            Nome da equipe
                            <input value={nome} onChange={(evento) => setNome(evento.target.value)} maxLength={80} required />
                        </label>
                        <label className={styles.campo}>
                            Descrição
                            <textarea value={descricao} onChange={(evento) => setDescricao(evento.target.value)} rows={3} maxLength={1000} />
                        </label>
                        <label className={styles.campo}>
                            Setor de atuação
                            <select value={setor} onChange={(evento) => setSetor(evento.target.value)}>
                                {SETORES.map((opcao) => <option key={opcao} value={opcao}>{opcao}</option>)}
                            </select>
                        </label>
                    </section>

                    <section className={styles.bloco}>
                        <div className={styles.linhaCabecalho}>
                            <div>
                                <h3>Limite de integrantes</h3>
                                <p>Defina quantas pessoas podem fazer parte desta equipe.</p>
                            </div>
                            <strong>{limiteIntegrantes} pessoas</strong>
                        </div>
                        <div className={styles.opcoesLimite}>
                            {LIMITES_INTEGRANTES.map((valor) => (
                                <button
                                    type="button"
                                    key={valor}
                                    className={limiteIntegrantes === valor ? styles.limiteAtivo : styles.limite}
                                    onClick={() => setLimiteIntegrantes(valor)}
                                    aria-pressed={limiteIntegrantes === valor}
                                >
                                    {valor}
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className={styles.bloco}>
                        <h3>Convite para a equipe</h3>
                        <p>Compartilhe este código com quem precisa entrar na equipe.</p>
                        <div className={styles.codigoConvite}>
                            <strong>{equipe.codigo || 'Código não disponível'}</strong>
                            <button type="button" onClick={() => void copiarCodigo()} disabled={!equipe.codigo}>
                                <Copy size={15} /> {codigoCopiado ? 'Copiado' : 'Copiar código'}
                            </button>
                        </div>
                        <div className={styles.detalhesEquipe}>
                            <span>Plano: <strong>{equipe.plano || 'Não informado'}</strong></span>
                            <span>ID: <strong>{equipe.id}</strong></span>
                        </div>
                    </section>

                    {erro && <p className={styles.erro} role="alert">{erro}</p>}
                    {mensagem && <p className={styles.sucesso} role="status">{mensagem}</p>}

                    <footer className={styles.acoes}>
                        <button type="button" className={styles.botaoCancelar} onClick={onFechar} disabled={salvando}>Cancelar</button>
                        <button type="submit" className={styles.botaoSalvar} disabled={salvando}>
                            <Save size={16} /> {salvando ? 'Salvando...' : 'Salvar alterações'}
                        </button>
                    </footer>
                </form>
            </section>
        </div>
    );
}