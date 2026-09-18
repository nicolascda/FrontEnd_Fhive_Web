import styles from "./styles.module.css";
import { BarraNavegacao } from "../../componentes/BarraNavegacao/index.tsx";
import { Link } from 'react-router-dom';
import { ProdutosPrimeiraSecao } from "../../secoes/Produtos/PrimeiraSecao";
import { GiHoneycomb } from "react-icons/gi";
import { FaPlus } from "react-icons/fa6";
import { FaRobot } from "react-icons/fa";

export function TelaProdutos() {
    return (

        <>
            <BarraNavegacao />

            <section className={styles.FundoMarrom}>

                <div className={styles.FundoMarromTexto}>

                    <h1>FHIVE IOT</h1>

                    <p>
                        Fhive é um aplicativo de controle de aparelhos IoT,
                        servindo para a automação e controle de forma manual desses aparelhos,
                        de forma eficiente, e tratamento dos dados.
                    </p>

                    <Link
                        to="/tutorial"
                        className={styles.botaoInicial}
                    >
                        Entrar no Fhive
                    </Link>

                </div>

            </section>

            <ProdutosPrimeiraSecao />

            <section className={styles.SecaoCompraProdutos}>
                <h1> Planos Disponíveis</h1>

                <div className={styles.MultiplosCardsProdutos}>
                    <div className={styles.CardCompra}>
                        <div className={styles.CardCompraIcone}>
                            <div className={styles.CardCompraFhive}> <GiHoneycomb  className={styles.IconeColmeia}/> <span> Fhive</span> </div>
                            <FaPlus className={styles.IconeMais}/>
                            <FaRobot className={styles.IconeRobo}/>
                        </div>

                        <div className={styles.CardCompraTexto}>
                            <h2>Plano Tecnologico</h2>
                            <p>Funções extras de automação</p>
                            <p>Gerenciamento personalizado de aparelhos</p>
                            <p>Comparação autumática entre múltiplos aparelhos</p>

                            <button className={styles.CardCompraBotao}> R$ 132,92</button>

                        </div>
                    </div>

                </div>
            </section>

        </>

    )
}