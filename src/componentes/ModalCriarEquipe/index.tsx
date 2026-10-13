import styles from "./styles.module.css";
import { useEffect, useRef, useState } from "react";
import IndustriaDesenho from "../../imagens/IndustriaDesenho.jpg";
import EscolaDeseneho from "../../imagens/EscolaDesenho.jpg";
import HospitalDesenenho from "../../imagens/HospitalDesenho.jpg";
import OutrosDesenho from "../../imagens/OutroDesenho.jpg";
import { Camera, Info } from 'lucide-react';


type ModalCriarEquipeProps = {
    onFechar: () => void;
};

export function ModalCriarEquipe({
    onFechar
}: ModalCriarEquipeProps) {
    const [informacaoAberta, setInformacaoAberta] = useState(false);
    const [botaoSelecionado, setBotaoSelecionado] = useState<number | null>(1);
    const [integrantes, setIntegrantes] = useState(25);

    const valoresIntegrantes = [5, 10, 15, 20, 25, 30, 35];

    const alternarItem = (id: number) => {
        setBotaoSelecionado(botaoSelecionado === id ? null : id);
    };

    return (
        <>
            <div
                className={styles.fundoBlur}
                aria-hidden="true"
            />
            
            <div className={`${styles.FundoMarrom}`}>
                <h1> Criacao de Equipe</h1>

                <div className={`${styles.modalEquipe}`}>

                    <div className={`${styles.areaRolagem}`}>

                        <div className={`${styles.blocos} ${styles.NomeDescricaoEquipe}`}>

                            <h2> Nome da Equipe</h2>
                            <input type="text"></input>

                            <h2> Descrição da Equipe</h2>
                            <textarea cols={30} rows={3} className={`${styles.InputMaior}`}></textarea>
                        </div>

                        <div className={`${styles.blocos} ${styles.ImagemEquipe}`}>


                            <div className={`${styles.ImagemEquipeDiv}`}>
                                <h2> Imagem de fundo</h2>
                                <div className={`${styles.ImagemEquipeFotoDiv}`}>
                                    <Camera className={`${styles.ImagemEquipeFoto}`} />
                                </div>
                            </div>

                            {/* Linha separadora horizontal */}
                            <hr></hr>


                            <div className={`${styles.ImagemEquipeDiv}`}>
                                <h2> Descrição da Equipe</h2>
                                <div className={`${styles.ImagemEquipeFotoDiv}`}>
                                    <Camera className={`${styles.ImagemEquipeFoto}`} />
                                </div>

                            </div>
                        </div>

                        <div className={`${styles.blocos} ${styles.Planos}`}>

                            <div className={`${styles.TituloPlano}`}>

                                <h2> Planos</h2>
                                <button
                                    onClick={() => {
                                        setInformacaoAberta(!informacaoAberta);
                                        // setInformacaoAberta(true);
                                    }}> <Info strokeWidth={3.5} /></button>

                                {informacaoAberta && (
                                    <div className={`${styles.botaoAtivar}`}>
                                        <p> Os planos influenciam na quantidade de <br /> integrantes permitidos na equipe </p>
                                    </div>
                                )}
                            </div>


                            <div className={`${styles.PlanoComprar}`}>
                                <div className={`${styles.PlanoComprarIndividual}`}>
                                    <h3> Básico</h3>
                                    <p> Feito para iniciar projetos escolares ou esboços de modelos</p>
                                    <h3> Características</h3>
                                    <ul>
                                        <li>Todas as funções iniciais</li>
                                        <li>Acesso ao modelo de espaço 3d</li>
                                        <li>Comparação de dados</li>
                                        <li>Espaço máximo de 30 integrantes</li>
                                    </ul>

                                    <h3> Preço: R$89,90</h3>
                                </div>

                                <div className={`${styles.PlanoComprarIndividual}`}>
                                    <h3> Básico</h3>
                                    <p> Feito para iniciar projetos escolares ou esboços de modelos</p>
                                    <h3> Características</h3>
                                    <ul>
                                        <li>Todas as funções iniciais</li>
                                        <li>Acesso ao modelo de espaço 3d</li>
                                        <li>Comparação de dados</li>
                                        <li>Espaço máximo de 30 integrantes</li>
                                    </ul>

                                    <h3> Preço: R$89,90</h3>
                                </div>

                                <div className={`${styles.PlanoComprarIndividual}`}>
                                    <h3> Básico</h3>
                                    <p> Feito para iniciar projetos escolares ou esboços de modelos</p>
                                    <h3> Características</h3>
                                    <ul>
                                        <li>Todas as funções iniciais</li>
                                        <li>Acesso ao modelo de espaço 3d</li>
                                        <li>Comparação de dados</li>
                                        <li>Espaço máximo de 30 integrantes</li>
                                    </ul>

                                    <h3> Preço: R$89,90</h3>
                                </div>
                            </div>

                            <div className={styles.escolhaIntegrantes}>
                                <label htmlFor="integrantes">
                                    Total de Integrantes - Plano Básico
                                </label>

                                <div className={styles.MinimoMaximo}>
                                    <span>Mínimo</span>
                                    <span>Máximo</span>
                                </div>

                                <div className={styles.controleIntegrantes}>
                                    <div className={styles.trilhoIntegrantes} aria-hidden="true">
                                        {valoresIntegrantes.map((valor) => (
                                            <span
                                                key={valor}
                                                className={`${styles.marcadorIntegrante} ${integrantes === valor ? styles.marcadorAtivo : ""
                                                    }`}
                                                style={{
                                                    left: `${((valor - 5) / 30) * 100}%`
                                                }}
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
                                        onChange={(evento) =>
                                            setIntegrantes(Number(evento.target.value))
                                        }
                                        aria-label="Total de integrantes do plano básico"
                                    />

                                    <div className={styles.valoresMarcos} aria-hidden="true">
                                        {valoresIntegrantes.map((valor) => (
                                            <span
                                                key={valor}
                                                style={{
                                                    left: `${((valor - 5) / 30) * 100}%`
                                                }}
                                            >
                                                {valor}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={`${styles.blocos} ${styles.setores}`}>
                            <h2> Setor Escolhido</h2>

                            <div className={`${styles.setoresDiv}`}>
                                <div className={`${styles.setorIndividual}`}>
                                    <button className={`${botaoSelecionado === 1 ? `${styles.botaoSelecionado}` : `${styles.botaoNaoSelecionado}`}`}
                                        onClick={() => setBotaoSelecionado(1)}
                                    >
                                        <img src={IndustriaDesenho} />

                                        <h2> Industrial</h2>
                                    </button>
                                </div>

                                <div className={`${styles.setorIndividual}`}>
                                    <button className={`${botaoSelecionado === 2 ? `${styles.botaoSelecionado}` : `${styles.botaoNaoSelecionado}`}`}
                                        onClick={() => setBotaoSelecionado(2)}
                                    >
                                        <img src={EscolaDeseneho} />

                                        <h2> Escolar</h2>
                                    </button>
                                </div>

                                <div className={`${styles.setorIndividual}`}>
                                    <button className={`${botaoSelecionado === 3 ? `${styles.botaoSelecionado}` : `${styles.botaoNaoSelecionado}`}`}
                                        onClick={() => setBotaoSelecionado(3)}
                                    >
                                        <img src={HospitalDesenenho} />

                                        <h2> Saúde</h2>
                                    </button>
                                </div>

                                <div className={`${styles.setorIndividual}`}>
                                    <button className={`${botaoSelecionado === 4 ? `${styles.botaoSelecionado}` : `${styles.botaoNaoSelecionado}`}`}
                                        onClick={() => setBotaoSelecionado(4)}
                                    >
                                        <img src={OutrosDesenho} />

                                        <h2> Outros</h2>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className={`${styles.blocos} ${styles.InformacaoExtra}`}>
                            <h2> Informações Adicionais</h2>

                            <ul>
                                <li> O máximo de integrantes é 20, porém esse limite pode aumentar conforme mais melhorias são feitas no plano.</li>
                                <li> Quando criar a equipe, vai ser gerado um código que vai poder ser utilizado para poder entrar nessa equipe </li>
                            </ul>

                            <p> Caso enfrente algum problema, mande mensagem para nossa <span className={`${styles.centralAjuda}`}> central de ajuda. </span> </p>

                            <label className={styles.divCheckBox}>
                                <input
                                    className={styles.checkBoxRegistrar}
                                    type="checkbox"
                                />

                                <p>Concordo com os termos presentes</p>
                            </label>
                        </div>

                        <div className={`${styles.blocos} ${styles.blocoFinal}`}>

                            <button
                                className={`${styles.botaoFinal}`}
                                onClick={onFechar}>
                                Cancelar
                            </button>

                            <button className={`${styles.botaoFinal}`}>Criar</button>
                        </div>



                    </div>


                </div>
            </div>
        </>
    )
}