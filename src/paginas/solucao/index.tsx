import { Link } from "react-router-dom";
import styles from "./styles.module.css";
import { FooterBar } from "../../componentes/FooterBar";
import Solucoes from "../../imagens/Solucoes_sem_borda.png";
import FundoMarromV2 from "../../imagens/FundomarromV2.png";
import AutomatizacaoImagem from "../../imagens/AutomatizacaoImagem.jpg";
import PessoaOlhandoTablet from "../../imagens/PessoaOlhandoTablet.jpg";
import PessoaEscrevendo from "../../imagens/PessoaEscrevendo.png";
import PessoasSentadas from "../../imagens/PessoasSentadas.jpg";

/**
 * Página pública que apresenta as principais soluções da Fhive.
 * As imagens são importadas da pasta do próprio projeto para garantir
 * que o Vite as inclua corretamente na versão de produção.
 */
export function TelaSolucao() {
  return (
    <div className={styles.page}>

      <main>
        {/* Apresentação principal da página. */}
        <section
          className={styles.hero}
          id="solucao"
          style={{ backgroundImage: `url(${FundoMarromV2})` }}
        >
          <div className={styles.heroCard}>
            <h1>Soluções</h1>
            <p>Tecnologia inteligente para tornar o dia a dia mais simples.</p>
          </div>

          <div className={styles.heroImage}>
            <img
              className={styles.ImagemSolucao}
              src={Solucoes}
              alt="Casa inteligente e aplicativo Fhive conectados"
            />
          </div>
        </section>

        {/* Cada seção apresenta uma solução, alternando imagem e texto. */}
        <section className={`${styles.featureSection} ${styles.cream}`}>
          <div className={styles.visual}>
            <img src={AutomatizacaoImagem} alt="Tecnologia conectada sendo usada em um ambiente automatizado" />
          </div>
          <article className={`${styles.featureCard} ${styles.cardWhite}`}>
            <h2>Automação residencial</h2>
            <p>
              Controle iluminação, temperatura, segurança, tomadas e aparelhos
              conectados de maneira simples e centralizada.
            </p>
            <p>
              A proposta é reunir os principais controles em um só lugar e
              facilitar o acompanhamento da casa no dia a dia.
            </p>
            <ul className={styles.featureList}>
              <li>Iluminação</li>
              <li>Temperatura</li>
              <li>Segurança</li>
              <li>Tomadas e aparelhos</li>
            </ul>
          </article>
        </section>

        <section className={`${styles.featureSection} ${styles.white} ${styles.reverse}`}>
          <article className={`${styles.featureCard} ${styles.cardYellow}`}>
            <h2>Aplicativo Fhive</h2>
            <p>
              Uma interface simples para controlar e acompanhar seus dispositivos
              IoT em um único lugar.
            </p>
            <p>
              Consulte as informações disponíveis e encontre os controles dos
              aparelhos de forma organizada, com uma experiência intuitiva mesmo
              para quem não tem familiaridade com termos técnicos.
            </p>
          </article>
          <div className={styles.visual}>
            <img src={PessoaOlhandoTablet} alt="Pessoa usando um dispositivo para acompanhar informações" />
          </div>
        </section>

        <section className={`${styles.featureSection} ${styles.cream}`}>
          <div className={styles.visual}>
            <img src={PessoaEscrevendo} alt="Pessoa configurando e acompanhando informações em um dispositivo" />
          </div>
          <article className={`${styles.featureCard} ${styles.cardWhite}`}>
            <h2>Configuração simplificada</h2>
            <p>
              A Fhive busca facilitar a instalação e a configuração dos
              dispositivos, deixando a tecnologia mais acessível para todos.
            </p>
            <p>
              A proposta é tornar a preparação dos aparelhos mais clara, com
              informações organizadas e etapas mais fáceis de entender.
            </p>
          </article>
        </section>

        <section className={`${styles.featureSection} ${styles.white} ${styles.reverse} ${styles.lastFeature}`}>
          <article className={`${styles.featureCard} ${styles.cardYellow}`}>
            <h2>Tecnologia acessível</h2>
            <p>
              A experiência foi pensada para pessoas com diferentes níveis de
              familiaridade com tecnologia.
            </p>
            <p>
              Com textos claros, controles diretos e informações organizadas, a
              proposta é facilitar o uso dos dispositivos conectados por
              diferentes perfis de pessoas.
            </p>
          </article>
          <div className={styles.visual}>
            <img src={PessoasSentadas} alt="Pessoas conversando e compartilhando experiências" />
          </div>
        </section>
      </main>

      <div className={styles.footerWrap}>
        <FooterBar />
      </div>
    </div>
  );
}