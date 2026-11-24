import styles from "./styles.module.css";
import { Link } from 'react-router-dom';
import { ProdutosPrimeiraSecao } from "../../secoes/Produtos/PrimeiraSecao";
import { SegundaSecaoProdutos } from "../../secoes/Produtos/SegundaSecao/index.tsx";
import { FooterBar } from "../../componentes/FooterBar/index.tsx";
import { CardComposto } from "../../componentes/CardComposto/index.tsx";
import PessoaOlhandoTablet from "../../imagens/PessoaOlhandoTablet.jpg";
import celularIntro from "../../imagens/celularIntro.png";
import celularLogado from "../../imagens/celularLogado.png";

export function TelaProdutos() {
    return (
        <>
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

            <SegundaSecaoProdutos />

            <CardComposto
                titulo="Próximos Passos"
                subtitulo="Após escolher o plano que vai ser utilizado, é necessário saber como utilizar as funções presentes do Fhive"
                textoPequeno="Guia"
                img={PessoaOlhandoTablet}
                botaoTexto="Tutorial ao Fhive"
                caminhoBotao="/rota"
                isTrue={false}
            />

            <section className={styles.SecaoDownload} aria-labelledby="titulo-download-fhive">
                <h2 id="titulo-download-fhive" className={styles.TituloDownload}>
                    Aproveite nosso produto <span>familiar</span>
                </h2>

                <div className={styles.ConteudoDownload}>
                    <div className={styles.TextoDownload}>
                        <p>
                            Tenha o FHIVE sempre com você! Baixe o aplicativo para Android,
                            acompanhe seus dispositivos, consulte os dados de consumo de energia!
                        </p>

                        <a
                            href="/downloads/FHIVE.apk"
                            download="FHIVE.apk"
                            className={styles.BotaoDownload}
                            aria-label="Baixar aplicativo FHIVE para Android"
                        >
                            Baixar aplicativo
                        </a>
                    </div>

                    <div className={styles.ImagensDownload}>
                        <img
                            src={celularIntro}
                            alt="Tela inicial do aplicativo FHIVE"
                            className={styles.ImagemCelular}
                        />
                        <img
                            src={celularLogado}
                            alt="Tela do aplicativo FHIVE após o login"
                            className={styles.ImagemCelular}
                        />
                    </div>
                </div>
            </section>

            <FooterBar />
        </>
    );
}
