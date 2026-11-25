import styles from "./styles.module.css";
import { Link } from "react-router-dom";
import { ProdutosPrimeiraSecao } from "../../secoes/Produtos/PrimeiraSecao";
import { SegundaSecaoProdutos } from "../../secoes/Produtos/SegundaSecao";
import { FooterBar } from "../../componentes/FooterBar";
import { CardComposto } from "../../componentes/CardComposto";
import PessoaOlhandoTablet from "../../imagens/PessoaOlhandoTablet.jpg";
import celularIntro from "../../imagens/CelularIntro.png";
import celularLogado from "../../imagens/CelularLogado.png";

export function TelaProdutos() {
  return (
    <>
      <section className={styles.FundoMarrom}>
        <div className={styles.FundoMarromTexto}>
          <h1>FHIVE IoT</h1>
          <p>
            Uma plataforma para organizar dispositivos conectados, consultar
            informações, acompanhar indicadores e planejar rotinas de automação.
          </p>
          <Link to="/solucaoFhive" className={styles.botaoInicial}>
            Conhecer a solução
          </Link>
        </div>
      </section>

      <ProdutosPrimeiraSecao />
      <SegundaSecaoProdutos />

      <CardComposto
        titulo="Comece explorando os recursos da Fhive"
        subtitulo="Veja como a plataforma reúne gestão de equipamentos, análise de informações, rotinas e visualização de ambientes."
        textoPequeno="Próximos passos"
        img={PessoaOlhandoTablet}
        botaoTexto="Conhecer a solução"
        caminhoBotao="/solucaoFhive"
        isTrue={false}
      />

      <section className={styles.SecaoDownload} aria-labelledby="titulo-download-fhive">
        <h2 id="titulo-download-fhive" className={styles.TituloDownload}>
          Leve a Fhive com você <span>no dia a dia</span>
        </h2>

        <div className={styles.ConteudoDownload}>
          <div className={styles.TextoDownload}>
            <p>
              Baixe o aplicativo FHIVE para Android, acompanhe seus dispositivos
              conectados e consulte as informações disponíveis em um só lugar.
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
