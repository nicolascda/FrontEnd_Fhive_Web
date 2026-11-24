import { useCallback, useEffect, useMemo, useState, type FormEvent, type MouseEvent } from 'react';
import {
    Check,
    Circle,
    Copy,
    Plus,
    RefreshCw,
    ShieldCheck,
    Trash2,
    Users,
    X,
} from 'lucide-react';
import styles from './styles.module.css';

type Equipe = {
    id: string;
    nome: string;
    limiteIntegrantes: number;
    limitePlano?: number;
    codigo?: string;
};

type Permissoes = Record<string, boolean>;

type Cargo = {
    id: string;
    nome: string;
    descricao: string;
    cor: string;
    sistema: boolean;
    permissoes: Permissoes;
};

type Integrante = {
    id: string;
    usuarioId: string;
    nome: string;
    email: string;
    fotoPerfil?: string | null;
    cargo: Cargo;
    lider: boolean;
};

type RespostaAPI = {
    mensagem?: string;
    erro?: string;
    integrantes?: Integrante[];
    cargos?: Cargo[];
    codigo?: string;
    quantidadeIntegrantes?: number;
    limiteIntegrantes?: number;
    permissoes?: Permissoes;
    permissoesDisponiveis?: Record<string, string>;
    permissoesAtuais?: Permissoes;
    podeGerenciarCargos?: boolean;
    podeGerenciarIntegrantes?: boolean;
    souDono?: boolean;
    integrante?: Integrante;
    cargo?: Cargo;
};

type ModalGerenciarIntegrantesProps = {
    equipe: Equipe;
    onFechar: () => void;
};

const rotaEquipe = (equipeId: string) => `/equipes/${encodeURIComponent(equipeId)}`;
const CORES_CARGOS = ['#C85C0A', '#3975A8', '#3F875B', '#8060A8', '#B34C68', '#64748B', '#9B7A20'];
const PERMISSOES_PADRAO: Permissoes = {
    visualizarAmbiente: true,
    visualizarDados: true,
    gerenciarMaquinas: false,
    gerenciarRotinas: false,
    executarAcoes: false,
    gerenciarIntegrantes: false,
    gerenciarCargos: false,
    configurarEquipe: false,
};

function normalizarIntegrantes(valor: unknown): Integrante[] {
    if (!Array.isArray(valor)) return [];

    return valor.map((item, indice) => {
        const registro = item && typeof item === 'object' ? item as Record<string, unknown> : {};
        const usuario = registro.usuario && typeof registro.usuario === 'object'
            ? registro.usuario as Record<string, unknown>
            : registro;
        const cargoRegistro = registro.cargo && typeof registro.cargo === 'object'
            ? registro.cargo as Record<string, unknown>
            : {};

        const cargo: Cargo = {
            id: String(cargoRegistro.id ?? ''),
            nome: String(cargoRegistro.nome ?? 'Operador'),
            descricao: String(cargoRegistro.descricao ?? ''),
            cor: String(cargoRegistro.cor ?? '#3F875B'),
            sistema: cargoRegistro.sistema === true,
            permissoes: cargoRegistro.permissoes && typeof cargoRegistro.permissoes === 'object'
                ? cargoRegistro.permissoes as Permissoes
                : PERMISSOES_PADRAO,
        };

        return {
            id: String(registro.id ?? registro.integranteId ?? `integrante-${indice}`),
            usuarioId: String(registro.usuarioId ?? usuario.id ?? ''),
            nome: String(registro.nome ?? usuario.nome ?? 'Integrante'),
            email: String(registro.email ?? usuario.email ?? ''),
            fotoPerfil: typeof (registro.fotoPerfil ?? usuario.fotoPerfil) === 'string'
                ? String(registro.fotoPerfil ?? usuario.fotoPerfil)
                : null,
            cargo,
            lider: registro.lider === true,
        };
    });
}

function normalizarCargos(valor: unknown): Cargo[] {
    if (!Array.isArray(valor)) return [];

    return valor.map((item) => {
        const cargo = item as Record<string, unknown>;
        return {
            id: String(cargo.id ?? ''),
            nome: String(cargo.nome ?? 'Cargo'),
            descricao: String(cargo.descricao ?? ''),
            cor: String(cargo.cor ?? '#8060A8'),
            sistema: cargo.sistema === true,
            permissoes: cargo.permissoes && typeof cargo.permissoes === 'object'
                ? cargo.permissoes as Permissoes
                : PERMISSOES_PADRAO,
        };
    });
}

export function ModalGerenciarIntegrantes({ equipe, onFechar }: ModalGerenciarIntegrantesProps) {
    const [aba, setAba] = useState<'integrantes' | 'cargos'>('integrantes');
    const [integrantes, setIntegrantes] = useState<Integrante[]>([]);
    const [cargos, setCargos] = useState<Cargo[]>([]);
    const [permissoesDisponiveis, setPermissoesDisponiveis] = useState<Record<string, string>>({});
    const [permissoesAtuais, setPermissoesAtuais] = useState<Permissoes>(PERMISSOES_PADRAO);
    const [podeGerenciarCargos, setPodeGerenciarCargos] = useState(false);
    const [podeGerenciarIntegrantes, setPodeGerenciarIntegrantes] = useState(false);
    const [souDono, setSouDono] = useState(false);
    const [codigo, setCodigo] = useState(equipe.codigo ?? '');
    const [limiteAtual, setLimiteAtual] = useState(equipe.limiteIntegrantes);
    const [carregando, setCarregando] = useState(true);
    const [salvandoCargo, setSalvandoCargo] = useState(false);
    const [removendoId, setRemovendoId] = useState<string | null>(null);
    const [atualizandoCargoId, setAtualizandoCargoId] = useState<string | null>(null);
    const [nomeCargo, setNomeCargo] = useState('');
    const [descricaoCargo, setDescricaoCargo] = useState('');
    const [corCargo, setCorCargo] = useState(CORES_CARGOS[4]);
    const [permissoesCargo, setPermissoesCargo] = useState<Permissoes>(PERMISSOES_PADRAO);
    const [erro, setErro] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [codigoCopiado, setCodigoCopiado] = useState(false);

    const token = useMemo(() => localStorage.getItem('token'), []);
    const quantidade = integrantes.length;
    const limitePlano = equipe.limitePlano ?? 30;
    const processando = salvandoCargo || Boolean(removendoId) || Boolean(atualizandoCargoId);

    // Carrega integrantes e cargos usando exatamente as duas rotas do backend.
    const carregarDados = useCallback(async () => {
        if (!token) {
            setErro('Sua sessão expirou. Entre novamente.');
            setCarregando(false);
            return;
        }

        try {
            setCarregando(true);
            setErro('');

            const [respostaIntegrantes, respostaCargos] = await Promise.all([
                fetch(`${rotaEquipe(equipe.id)}/integrantes`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`${rotaEquipe(equipe.id)}/cargos`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            const [dadosIntegrantes, dadosCargos] = await Promise.all([
                respostaIntegrantes.json().catch(() => ({})) as Promise<RespostaAPI>,
                respostaCargos.json().catch(() => ({})) as Promise<RespostaAPI>,
            ]);

            if (!respostaIntegrantes.ok) {
                throw new Error(dadosIntegrantes.mensagem || dadosIntegrantes.erro || 'Não foi possível carregar os integrantes.');
            }
            if (!respostaCargos.ok) {
                throw new Error(dadosCargos.mensagem || dadosCargos.erro || 'Não foi possível carregar os cargos.');
            }

            setIntegrantes(normalizarIntegrantes(dadosIntegrantes.integrantes));
            setCargos(normalizarCargos(dadosCargos.cargos));
            setPermissoesDisponiveis(dadosCargos.permissoesDisponiveis ?? {});
            setPermissoesAtuais(dadosCargos.permissoesAtuais ?? dadosIntegrantes.permissoes ?? PERMISSOES_PADRAO);
            setPodeGerenciarCargos(dadosCargos.podeGerenciarCargos === true);
            setPodeGerenciarIntegrantes(dadosCargos.podeGerenciarIntegrantes === true);
            setSouDono(dadosIntegrantes.souDono === true);
            setCodigo(dadosIntegrantes.codigo ?? equipe.codigo ?? '');
            setLimiteAtual(dadosIntegrantes.limiteIntegrantes ?? equipe.limiteIntegrantes);
        } catch (error) {
            setErro(error instanceof Error ? error.message : 'Não foi possível carregar os dados da equipe.');
        } finally {
            setCarregando(false);
        }
    }, [equipe.codigo, equipe.id, equipe.limiteIntegrantes, token]);

    useEffect(() => {
        void carregarDados();
    }, [carregarDados]);

    // Escape fecha o modal somente quando não há uma operação em andamento.
    useEffect(() => {
        const tratarTecla = (evento: KeyboardEvent) => {
            if (evento.key === 'Escape' && !processando) onFechar();
        };
        window.addEventListener('keydown', tratarTecla);
        return () => window.removeEventListener('keydown', tratarTecla);
    }, [onFechar, processando]);

    // Atualiza somente o vínculo do integrante selecionado, sem alterar os demais.
    const handleAtribuirCargo = async (integrante: Integrante, cargoId: string) => {
        if (!token || !cargoId || integrante.lider || !podeGerenciarIntegrantes) return;

        try {
            setAtualizandoCargoId(integrante.id);
            setErro('');
            setMensagem('');

            const resposta = await fetch(
                `${rotaEquipe(equipe.id)}/integrantes/${encodeURIComponent(integrante.id)}/cargo`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ cargoId }),
                },
            );
            const dados = await resposta.json().catch(() => ({})) as RespostaAPI;
            if (!resposta.ok) throw new Error(dados.mensagem || dados.erro || 'Não foi possível alterar o cargo.');

            setMensagem(dados.mensagem || `Cargo de ${integrante.nome} atualizado.`);
            await carregarDados();
        } catch (error) {
            setErro(error instanceof Error ? error.message : 'Não foi possível alterar o cargo.');
        } finally {
            setAtualizandoCargoId(null);
        }
    };

    // Remove apenas o integrante selecionado da equipe, preservando a conta pessoal dele.
    const handleRemover = async (integrante: Integrante) => {
        if (integrante.lider || !podeGerenciarIntegrantes) return;
        if (!window.confirm(`Remover ${integrante.nome} da equipe ${equipe.nome}?`)) return;
        if (!token) {
            setErro('Sua sessão expirou. Entre novamente.');
            return;
        }

        try {
            setRemovendoId(integrante.id);
            setErro('');
            setMensagem('');

            const resposta = await fetch(
                `${rotaEquipe(equipe.id)}/integrantes/${encodeURIComponent(integrante.id)}`,
                {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` },
                },
            );
            const dados = await resposta.json().catch(() => ({})) as RespostaAPI;
            if (!resposta.ok) throw new Error(dados.mensagem || dados.erro || 'Não foi possível remover o integrante.');

            setMensagem(dados.mensagem || 'Integrante removido da equipe.');
            await carregarDados();
        } catch (error) {
            setErro(error instanceof Error ? error.message : 'Não foi possível remover o integrante.');
        } finally {
            setRemovendoId(null);
        }
    };

    // Cria um cargo personalizado. O backend não possui atualização de definição de cargo.
    const handleCriarCargo = async (evento: FormEvent<HTMLFormElement>) => {
        evento.preventDefault();
        setErro('');
        setMensagem('');

        const nome = nomeCargo.trim();
        if (nome.length < 2 || nome.length > 40) {
            setErro('O nome do cargo deve ter entre 2 e 40 caracteres.');
            return;
        }
        if (!/^#[0-9A-Fa-f]{6}$/.test(corCargo)) {
            setErro('Escolha uma cor válida para o cargo.');
            return;
        }
        if (!token) {
            setErro('Sua sessão expirou. Entre novamente.');
            return;
        }

        try {
            setSalvandoCargo(true);
            const resposta = await fetch(`${rotaEquipe(equipe.id)}/cargos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    nome,
                    descricao: descricaoCargo.trim(),
                    cor: corCargo,
                    permissoes: permissoesCargo,
                }),
            });
            const dados = await resposta.json().catch(() => ({})) as RespostaAPI;
            if (!resposta.ok) throw new Error(dados.mensagem || dados.erro || 'Não foi possível criar o cargo.');

            setNomeCargo('');
            setDescricaoCargo('');
            setCorCargo(CORES_CARGOS[4]);
            setPermissoesCargo(PERMISSOES_PADRAO);
            setMensagem(dados.mensagem || 'Cargo criado com sucesso.');
            await carregarDados();
        } catch (error) {
            setErro(error instanceof Error ? error.message : 'Não foi possível criar o cargo.');
        } finally {
            setSalvandoCargo(false);
        }
    };

    // O servidor impede a exclusão de cargos padrão ou que ainda estejam em uso.
    const handleExcluirCargo = async (cargo: Cargo) => {
        if (cargo.sistema || !podeGerenciarCargos) return;
        if (!window.confirm(`Excluir o cargo ${cargo.nome}? Ele precisa estar sem integrantes vinculados.`)) return;
        if (!token) {
            setErro('Sua sessão expirou. Entre novamente.');
            return;
        }

        try {
            setErro('');
            setMensagem('');
            const resposta = await fetch(
                `${rotaEquipe(equipe.id)}/cargos/${encodeURIComponent(cargo.id)}`,
                {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` },
                },
            );
            const dados = await resposta.json().catch(() => ({})) as RespostaAPI;
            if (!resposta.ok) throw new Error(dados.mensagem || dados.erro || 'Não foi possível excluir o cargo.');

            setMensagem(dados.mensagem || 'Cargo excluído com sucesso.');
            await carregarDados();
        } catch (error) {
            setErro(error instanceof Error ? error.message : 'Não foi possível excluir o cargo.');
        }
    };

    const copiarCodigo = async () => {
        if (!codigo) return;
        try {
            await navigator.clipboard.writeText(codigo);
            setCodigoCopiado(true);
            window.setTimeout(() => setCodigoCopiado(false), 1800);
        } catch {
            setErro('Não foi possível copiar o código neste navegador.');
        }
    };

    const fecharAoClicarNoFundo = (evento: MouseEvent<HTMLDivElement>) => {
        if (evento.target === evento.currentTarget && !processando) onFechar();
    };

    return (
        <div className={styles.fundoModal} onMouseDown={fecharAoClicarNoFundo}>
            <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="titulo-gerenciar-integrantes">
                <header className={styles.cabecalho}>
                    <div className={styles.tituloComIcone}>
                        <Users size={21} />
                        <div>
                            <h2 id="titulo-gerenciar-integrantes">Gerenciar integrantes</h2>
                            <p>{equipe.nome}</p>
                        </div>
                    </div>
                    <button type="button" className={styles.fechar} onClick={onFechar} aria-label="Fechar modal" disabled={processando}>
                        <X size={21} />
                    </button>
                </header>

                <nav className={styles.abas} aria-label="Seções do gerenciamento">
                    <button
                        type="button"
                        className={aba === 'integrantes' ? styles.abaAtiva : styles.aba}
                        onClick={() => { setAba('integrantes'); setErro(''); setMensagem(''); }}
                    >
                        <Users size={16} /> Integrantes
                    </button>
                    <button
                        type="button"
                        className={aba === 'cargos' ? styles.abaAtiva : styles.aba}
                        onClick={() => { setAba('cargos'); setErro(''); setMensagem(''); }}
                    >
                        <ShieldCheck size={16} /> Cargos
                    </button>
                </nav>

                <div className={styles.conteudo}>
                    <section className={styles.resumo}>
                        <div>
                            <span>Integrantes cadastrados</span>
                            <strong>{quantidade} <small>/ {limiteAtual}</small></strong>
                            <em>Plano {equipe.limitePlano ? `permite até ${limitePlano}` : `com limite de ${limitePlano}`} integrantes</em>
                        </div>
                        <button type="button" onClick={() => void carregarDados()} disabled={carregando}>
                            <RefreshCw size={15} className={carregando ? styles.girando : ''} /> Atualizar
                        </button>
                    </section>

                    {aba === 'integrantes' ? (
                        <>
                            <section className={styles.conviteCodigo}>
                                <div className={styles.conviteTexto}>
                                    <strong>Convide pelo código da equipe</strong>
                                    <p>Compartilhe este código. A pessoa deverá entrar em “Entrar numa equipe” e informar o código na própria conta.</p>
                                </div>
                                <div className={styles.codigoLinha}>
                                    <code>{codigo || 'Código indisponível'}</code>
                                    <button type="button" onClick={() => void copiarCodigo()} disabled={!codigo}>
                                        <Copy size={15} /> {codigoCopiado ? 'Copiado' : 'Copiar código'}
                                    </button>
                                </div>
                                {quantidade >= limiteAtual && (
                                    <p className={styles.avisoLimite}>O limite de integrantes foi atingido. Novas entradas ficarão bloqueadas até liberar uma vaga.</p>
                                )}
                            </section>

                            <section className={styles.listaBloco}>
                                <div className={styles.tituloLista}>
                                    <h3>Integrantes da equipe</h3>
                                    <span>{quantidade} pessoas</span>
                                </div>

                                {carregando ? (
                                    <p className={styles.estadoLista}>Carregando integrantes...</p>
                                ) : integrantes.length === 0 ? (
                                    <p className={styles.estadoLista}>Nenhum integrante foi retornado para esta equipe.</p>
                                ) : (
                                    <div className={styles.listaIntegrantes}>
                                        {integrantes.map((integrante) => {
                                            const cargoAtualExcedePermissoes = !souDono && Object.entries(integrante.cargo.permissoes)
                                                .some(([chave, ativa]) => ativa && permissoesAtuais[chave] !== true);
                                            const podeAdministrarEsteIntegrante = podeGerenciarIntegrantes
                                                && !integrante.lider
                                                && (souDono || integrante.cargo.nome !== 'Administrador')
                                                && !cargoAtualExcedePermissoes;
                                            const opcoesCargo = cargos.filter((cargo) => cargo.nome !== 'Líder'
                                                && (souDono || cargo.nome !== 'Administrador')
                                                && (souDono || !Object.entries(cargo.permissoes).some(([chave, ativa]) => ativa && permissoesAtuais[chave] !== true)));

                                            return (
                                                <article className={styles.integrante} key={integrante.id}>
                                                    <div className={styles.avatar}>
                                                        {integrante.fotoPerfil
                                                            ? <img src={integrante.fotoPerfil} alt="" />
                                                            : <span>{integrante.nome.trim().charAt(0).toUpperCase()}</span>}
                                                    </div>
                                                    <div className={styles.dadosIntegrante}>
                                                        <strong>{integrante.nome}</strong>
                                                        <span>{integrante.email || 'E-mail não informado'}</span>
                                                    </div>
                                                    <span className={styles.papel}>
                                                        <i style={{ backgroundColor: integrante.cargo.cor }} />
                                                        {integrante.cargo.nome}
                                                    </span>

                                                    {podeAdministrarEsteIntegrante && (
                                                        <div className={styles.acoesIntegrante}>
                                                            <select
                                                                aria-label={`Cargo de ${integrante.nome}`}
                                                                value={integrante.cargo.id}
                                                                onChange={(evento) => void handleAtribuirCargo(integrante, evento.target.value)}
                                                                disabled={atualizandoCargoId === integrante.id || opcoesCargo.length === 0}
                                                            >
                                                                {opcoesCargo.map((cargo) => (
                                                                    <option value={cargo.id} key={cargo.id}>{cargo.nome}</option>
                                                                ))}
                                                            </select>
                                                            <button
                                                                type="button"
                                                                className={styles.botaoRemover}
                                                                onClick={() => void handleRemover(integrante)}
                                                                disabled={removendoId === integrante.id}
                                                                aria-label={`Remover ${integrante.nome}`}
                                                            >
                                                                <Trash2 size={15} />
                                                                {removendoId === integrante.id ? 'Removendo...' : 'Remover'}
                                                            </button>
                                                        </div>
                                                    )}
                                                </article>
                                            );
                                        })}
                                    </div>
                                )}

                                {!podeGerenciarIntegrantes && (
                                    <p className={styles.semPermissaoCargo}>Seu cargo permite consultar os integrantes, mas não alterar cargos ou remover pessoas.</p>
                                )}
                            </section>
                        </>
                    ) : (
                        <>
                            <section className={styles.introducaoCargos}>
                                <div>
                                    <h3>Cargos da equipe</h3>
                                    <p>Cada cargo possui uma cor e permissões que definem o que o integrante pode fazer.</p>
                                </div>
                                {podeGerenciarCargos && <span className={styles.cargosQuantidade}>{cargos.length} cargos</span>}
                            </section>

                            <div className={styles.areaCargos}>
                                <section className={styles.listaCargos}>
                                    {carregando ? (
                                        <p className={styles.estadoLista}>Carregando cargos...</p>
                                    ) : cargos.length === 0 ? (
                                        <p className={styles.estadoLista}>Nenhum cargo cadastrado.</p>
                                    ) : cargos.map((cargo) => (
                                        <article className={styles.cargoItem} key={cargo.id}>
                                            <span className={styles.bolinhaCargo} style={{ backgroundColor: cargo.cor }} />
                                            <div className={styles.dadosCargo}>
                                                <strong>{cargo.nome}</strong>
                                                <p>{cargo.descricao}</p>
                                                <small>{cargo.sistema ? 'Cargo padrão' : 'Cargo personalizado'}</small>
                                            </div>
                                            {!cargo.sistema && podeGerenciarCargos && (
                                                <div className={styles.acoesCargo}>
                                                    <button
                                                        type="button"
                                                        onClick={() => void handleExcluirCargo(cargo)}
                                                        aria-label={`Excluir ${cargo.nome}`}
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            )}
                                        </article>
                                    ))}
                                </section>

                                {podeGerenciarCargos ? (
                                    <form className={styles.formularioCargo} onSubmit={handleCriarCargo}>
                                        <h3>Criar cargo personalizado</h3>
                                        <label className={styles.campoCargo}>
                                            Nome do cargo
                                            <input
                                                value={nomeCargo}
                                                onChange={(evento) => setNomeCargo(evento.target.value)}
                                                minLength={2}
                                                maxLength={40}
                                                placeholder="Ex.: Técnico de manutenção"
                                                required
                                            />
                                        </label>
                                        <label className={styles.campoCargo}>
                                            Descrição
                                            <textarea
                                                value={descricaoCargo}
                                                onChange={(evento) => setDescricaoCargo(evento.target.value)}
                                                maxLength={180}
                                                rows={2}
                                                placeholder="Descreva brevemente as responsabilidades."
                                            />
                                        </label>
                                        <div className={styles.campoCargo}>
                                            <span>Cor de identificação</span>
                                            <div className={styles.escolhaCor}>
                                                <input type="color" value={corCargo} onChange={(evento) => setCorCargo(evento.target.value)} aria-label="Cor do cargo" />
                                                <span className={styles.bolinhaPreview} style={{ backgroundColor: corCargo }} />
                                                <code>{corCargo.toUpperCase()}</code>
                                            </div>
                                        </div>
                                        <div className={styles.permissoesCargo}>
                                            <strong>Permissões</strong>
                                            {Object.entries(permissoesDisponiveis).map(([chave, descricao]) => (
                                                <label key={chave}>
                                                    <input
                                                        type="checkbox"
                                                        checked={permissoesCargo[chave] === true}
                                                        disabled={!souDono && permissoesAtuais[chave] !== true}
                                                        onChange={(evento) => setPermissoesCargo((atuais) => ({ ...atuais, [chave]: evento.target.checked }))}
                                                    />
                                                    <span>{descricao}</span>
                                                </label>
                                            ))}
                                        </div>
                                        <div className={styles.acoesFormularioCargo}>
                                            <button type="submit" className={styles.botaoPrimario} disabled={salvandoCargo}>
                                                <Check size={15} /> {salvandoCargo ? 'Criando...' : 'Criar cargo'}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className={styles.semPermissaoCargo}>
                                        Seu cargo permite consultar os cargos, mas não criar ou excluir cargos personalizados.
                                    </div>
                                )}
                            </div>
                            <p className={styles.notaCargos}>
                                <Circle size={9} fill="currentColor" /> Cargos padrão não podem ser excluídos. Para excluir um cargo personalizado, primeiro atribua outro cargo aos integrantes que o utilizam.
                            </p>
                        </>
                    )}

                    {erro && <p className={styles.erro} role="alert">{erro}</p>}
                    {mensagem && <p className={styles.sucesso} role="status">{mensagem}</p>}
                </div>

                <footer className={styles.rodape}>
                    <p>As alterações são salvas na equipe e validadas pelo servidor.</p>
                    <button type="button" onClick={onFechar} disabled={processando}>Concluir</button>
                </footer>
            </section>
        </div>
    );
}
