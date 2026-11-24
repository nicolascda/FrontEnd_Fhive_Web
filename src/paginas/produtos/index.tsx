import styles from "./styles.module.css";
import { Link } from "react-router-dom";
import { ProdutosPrimeiraSecao } from "../../secoes/Produtos/PrimeiraSecao";
import { SegundaSecaoProdutos } from "../../secoes/Produtos/SegundaSecao";
import { FooterBar } from "../../componentes/FooterBar";
import { CardComposto } from "../../componentes/CardComposto";
import PessoaOlhandoTablet from "../../imagens/PessoaOlhandoTablet.jpg";

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

      <FooterBar />
    </>
  );
}
