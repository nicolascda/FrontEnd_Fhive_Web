import styles from "./styles.module.css";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import IndustriaDesenho from "../../imagens/IndustriaDesenho.jpg";
import EscolaDeseneho from "../../imagens/EscolaDesenho.jpg";
import HospitalDesenenho from "../../imagens/HospitalDesenho.jpg";
import OutrosDesenho from "../../imagens/OutroDesenho.jpg";
import { Camera, Info } from 'lucide-react';

type EquipeSalva = {
    id: string;
    nome: string;
    descricao?: string | null;
    imagemFundo?: string | null;
    logo?: string | null;
    plano: string;
    setor: string;
    limiteIntegrantes: number;
    codigo: string;
};

type ModalCriarEquipeProps = {
    onFechar: () => void;
    onCriada: (equipe: EquipeSalva) => void;
};

type RespostaAPI = {
    mensagem?: string;
    erro?: string;
    equipe?: EquipeSalva;
};

const setores = ["Industrial", "Educação", "Saúde", "Outros"];

export function ModalCriarEquipe({ onFechar, onCriada }: ModalCriarEquipeProps) {
    const campoImagemFundoRef = useRef<HTMLInputElement>(null);
    const campoLogoRef = useRef<HTMLInputElement>(null);

    const [informacaoAberta, setInformacaoAberta] = useState(false);
    const [botaoSelecionado, setBotaoSelecionado] = useState<number>(1);
    const [integrantes, setIntegrantes] = useState(25);
    const [nome, setNome] = useState("");
    const [descricao, setDescricao] = useState("");
    const [imagemFundo, setImagemFundo] = useState("");
    const [logo, setLogo] = useState("");
    const [aceitouTermos, setAceitouTermos] = useState(false);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [codigoCriado, setCodigoCriado] = useState("");

    const valoresIntegrantes = [5, 10, 15, 20, 25, 30, 35];

    const carregarImagem = (
        evento: ChangeEvent<HTMLInputElement>,
        atualizarImagem: (imagem: string) => void
    ) => {
        const arquivo = evento.target.files?.[0];
        if (!arquivo) return;

        if (!arquivo.type.startsWith("image/")) {
            setErro("Selecione um arquivo de imagem válido.");
            evento.target.value = "";
            return;
        }

        if (arquivo.size > 2 * 1024 * 1024) {
            setErro("Cada imagem deve ter no máximo 2 MB.");
            evento.target.value = "";
            return;
        }

        const leitor = new FileReader();
        leitor.onload = () => {
            if (typeof leitor.result === "string") {
                atualizarImagem(leitor.result);
                setErro("");
                setMensagem("");
            }
        };
        leitor.onerror = () => setErro("Não foi possível carregar a imagem.");
        leitor.readAsDataURL(arquivo);
    };

    const handleCriarEquipe = async (evento: FormEvent<HTMLFormElement>) => {
        evento.preventDefault();
        setErro("");
        setMensagem("");

        if (!nome.trim()) {
            setErro("Informe o nome da equipe.");
            return;
        }

        if (!aceitouTermos) {
            setErro("Você precisa concordar com os termos para criar a equipe.");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            setErro("Sua sessão não foi encontrada. Entre novamente.");
            return;
        }

        try {
            setCarregando(true);
            const resposta = await fetch("/equipes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    nome: nome.trim(),
                    descricao: descricao.trim(),
                    imagemFundo,
                    logo,
                    plano: "Básico",
                    setor: setores[botaoSelecionado - 1],
                    limiteIntegrantes: integrantes
                })
            });

            const dados = await resposta.json().catch(() => ({})) as RespostaAPI;
            if (!resposta.ok || !dados.equipe) {
                throw new Error(dados.mensagem || dados.erro || "Não foi possível criar a equipe.");
            }

            onCriada(dados.equipe);
            setCodigoCriado(dados.equipe.codigo);
            setMensagem(dados.mensagem || "Equipe criada com sucesso.");
        } catch (error) {
            setErro(error instanceof Error ? error.message : "Não foi possível criar a equipe.");
        } finally {
            setCarregando(false);
        }
    };

    return (
        <>
            <div className={styles.fundoBlur} aria-hidden="true" />

            <div className={styles.FundoMarrom}>
                <h1>Criação de Equipe</h1>

                <div className={styles.modalEquipe}>
                    <form className={styles.areaRolagem} onSubmit={handleCriarEquipe}>
                        <div className={`${styles.blocos} ${styles.NomeDescricaoEquipe}`}>
                            <h2>Nome da Equipe</h2>
                            <input
                                type="text"
                                value={nome}
                                onChange={(evento) => setNome(evento.target.value)}
                                maxLength={80}
                                required
                            />

                            <h2>Descrição da Equipe</h2>
                            <textarea
                                cols={30}
                                rows={3}
                                className={styles.InputMaior}
                                value={descricao}
                                onChange={(evento) => setDescricao(evento.target.value)}
                                maxLength={1000}
                            />
                        </div>

                        <div className={`${styles.blocos} ${styles.ImagemEquipe}`}>
                            <div className={styles.ImagemEquipeDiv}>
                                <h2>Imagem de fundo</h2>
                                <button
                                    type="button"
                                    className={styles.ImagemEquipeFotoDiv}
                                    onClick={() => campoImagemFundoRef.current?.click()}
                                    aria-label="Selecionar imagem de fundo"
                                >
                                    {imagemFundo ? (
                                        <img src={imagemFundo} alt="Prévia do fundo da equipe" className={styles.ImagemEquipeFoto} />
                                    ) : (
                                        <Camera className={styles.ImagemEquipeFoto} />
                                    )}
                                </button>
                                <input
                                    ref={campoImagemFundoRef}
                                    className={styles.inputImagemEscondido}
                                    type="file"
                                    accept="image/*"
                                    onChange={(evento) => carregarImagem(evento, setImagemFundo)}
                                />
                            </div>

                            <hr />

                            <div className={styles.ImagemEquipeDiv}>
                                <h2>Logo da equipe</h2>
                                <button
                                    type="button"
                                    className={styles.ImagemEquipeFotoDiv}
                                    onClick={() => campoLogoRef.current?.click()}
                                    aria-label="Selecionar logo da equipe"
                                >
                                    {logo ? (
                                        <img src={logo} alt="Prévia do logo da equipe" className={styles.ImagemEquipeFoto} />
                                    ) : (
                                        <Camera className={styles.ImagemEquipeFoto} />
                                    )}
                                </button>
                                <input
                                    ref={campoLogoRef}
                                    className={styles.inputImagemEscondido}
                                    type="file"
                                    accept="image/*"
                                    onChange={(evento) => carregarImagem(evento, setLogo)}
                                />
                            </div>
                        </div>

                        <div className={`${styles.blocos} ${styles.Planos}`}>
                            <div className={styles.TituloPlano}>
                                <h2>Planos</h2>
                                <button
                                    type="button"
                                    onClick={() => setInformacaoAberta(!informacaoAberta)}
                                    aria-label="Informações dos planos"
                                >
                                    <Info strokeWidth={3.5} />
                                </button>

                                {informacaoAberta && (
                                    <div className={styles.botaoAtivar}>
                                        <p>Os planos influenciam na quantidade de<br />integrantes permitidos na equipe</p>
                                    </div>
                                )}
                            </div>

                            <div className={styles.PlanoComprar}>
                                {[1, 2, 3].map((plano) => (
                                    <div className={styles.PlanoComprarIndividual} key={plano}>
                                        <h3>Básico</h3>
                                        <p>Feito para iniciar projetos escolares ou esboços de modelos</p>
                                        <h3>Características</h3>
                                        <ul>
                                            <li>Todas as funções iniciais</li>
                                            <li>Acesso ao modelo de espaço 3d</li>
                                            <li>Comparação de dados</li>
                                            <li>Espaço máximo de 30 integrantes</li>
                                        </ul>
                                        <h3>Preço: R$89,90</h3>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.escolhaIntegrantes}>
                                <label htmlFor="integrantes">Total de Integrantes - Plano Básico</label>
                                <div className={styles.MinimoMaximo}>
                                    <span>Mínimo</span>
                                    <span>Máximo</span>
                                </div>

                                <div className={styles.controleIntegrantes}>
                                    <div className={styles.trilhoIntegrantes} aria-hidden="true">
                                        {valoresIntegrantes.map((valor) => (
                                            <span
                                                key={valor}
                                                className={`${styles.marcadorIntegrante} ${integrantes === valor ? styles.marcadorAtivo : ""}`}
                                                style={{ left: `${((valor - 5) / 30) * 100}%` }}
                                            />
                                        ))}
                                    </div>

                                    <input
                                        type="range"
                                        id="integrantes"
                                        className={styles.sliderIntegrantes}
                                        min={5}
                                        max={35}
                                        step={5}
                                        value={integrantes}
                                        onChange={(evento) => setIntegrantes(Number(evento.target.value))}
                                        aria-label="Total de integrantes do plano básico"
                                    />

                                    <div className={styles.valoresMarcos} aria-hidden="true">
                                        {valoresIntegrantes.map((valor) => (
                                            <span key={valor} style={{ left: `${((valor - 5) / 30) * 100}%` }}>
                                                {valor}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={`${styles.blocos} ${styles.setores}`}>
                            <h2>Setor Escolhido</h2>
                            <div className={styles.setoresDiv}>
                                <div className={styles.setorIndividual}>
                                    <button type="button" className={botaoSelecionado === 1 ? styles.botaoSelecionado : styles.botaoNaoSelecionado} onClick={() => setBotaoSelecionado(1)}>
                                        <img src={IndustriaDesenho} alt="" />
                                        <h2>Industrial</h2>
                                    </button>
                                </div>
                                <div className={styles.setorIndividual}>
                                    <button type="button" className={botaoSelecionado === 2 ? styles.botaoSelecionado : styles.botaoNaoSelecionado} onClick={() => setBotaoSelecionado(2)}>
                                        <img src={EscolaDeseneho} alt="" />
                                        <h2>Educação</h2>
                                    </button>
                                </div>
                                <div className={styles.setorIndividual}>
                                    <button type="button" className={botaoSelecionado === 3 ? styles.botaoSelecionado : styles.botaoNaoSelecionado} onClick={() => setBotaoSelecionado(3)}>
                                        <img src={HospitalDesenenho} alt="" />
                                        <h2>Saúde</h2>
                                    </button>
                                </div>
                                <div className={styles.setorIndividual}>
                                    <button type="button" className={botaoSelecionado === 4 ? styles.botaoSelecionado : styles.botaoNaoSelecionado} onClick={() => setBotaoSelecionado(4)}>
                                        <img src={OutrosDesenho} alt="" />
                                        <h2>Outros</h2>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className={`${styles.blocos} ${styles.InformacaoExtra}`}>
                            <h2>Informações Adicionais</h2>
                            <ul>
                                <li>O máximo de integrantes é 20, porém esse limite pode aumentar conforme mais melhorias são feitas no plano.</li>
                                <li>Quando criar a equipe, será gerado um código que poderá ser utilizado para entrar nessa equipe.</li>
                            </ul>
                            <p>Caso enfrente algum problema, mande mensagem para nossa <span className={styles.centralAjuda}>central de ajuda.</span></p>

                            <label className={styles.divCheckBox}>
                                <input
                                    className={styles.checkBoxRegistrar}
                                    type="checkbox"
                                    checked={aceitouTermos}
                                    onChange={(evento) => setAceitouTermos(evento.target.checked)}
                                    required
                                />
                                <p>Concordo com os termos presentes</p>
                            </label>
                        </div>

                        {erro && <p className={styles.mensagemErro} role="alert">{erro}</p>}
                        {mensagem && (
                            <div className={styles.mensagemSucesso} role="status">
                                <p>{mensagem}</p>
                                {codigoCriado && <p>Código da equipe: <strong>{codigoCriado}</strong></p>}
                                {codigoCriado && <p>Guarde esse código para compartilhar com os integrantes.</p>}
                            </div>
                        )}

                        <div className={`${styles.blocos} ${styles.blocoFinal}`}>
                            <button type="button" className={styles.botaoFinal} onClick={onFechar}>Cancelar</button>
                            <button type="submit" className={styles.botaoFinal} disabled={carregando || Boolean(codigoCriado)}>
                                {carregando ? "Criando..." : codigoCriado ? "Equipe criada" : "Criar"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
