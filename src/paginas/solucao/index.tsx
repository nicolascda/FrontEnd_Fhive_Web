import styles from "./styles.module.css";
import { FooterBar } from "../../componentes/FooterBar";
import Solucoes from "../../imagens/Solucoes_sem_borda.png";
import FundoMarromV2 from "../../imagens/FundomarromV2.png";
import AutomatizacaoImagem from "../../imagens/AutomatizacaoImagem.jpg";
import PessoaOlhandoTablet from "../../imagens/PessoaOlhandoTablet.jpg";
import PessoaEscrevendo from "../../imagens/PessoaEscrevendo.png";
import AmbienteVirtualEmpresa3D from "../../imagens/Empresa3D.png";

/** Página pública que apresenta os principais recursos da plataforma Fhive. */
export function TelaSolucao() {
  return (
    <div className={styles.page}>
      <main>
        <section
          className={styles.hero}
          id="solucao"
          style={{ backgroundImage: `url(${FundoMarromV2})` }}
        >
          <div className={styles.heroCard}>
            <h1>Soluções Fhive</h1>
            <p>
              Gestão de dispositivos IoT, dados e rotinas em uma experiência integrada.
            </p>
          </div>
          <div className={styles.heroImage}>
            <img
              className={styles.ImagemSolucao}
              src={Solucoes}
              alt="Ilustração da plataforma Fhive conectando pessoas e dispositivos"
            />
          </div>
        </section>

        <section className={`${styles.featureSection} ${styles.cream}`}>
          <div className={styles.visual}>
            <img
              src={AutomatizacaoImagem}
              alt="Equipamentos conectados em um ambiente automatizado"
            />
          </div>
          <article className={`${styles.featureCard} ${styles.cardWhite}`}>
            <h2>Gestão centralizada de dispositivos</h2>
            <p>
              Organize os equipamentos vinculados à sua equipe e consulte as
              informações disponíveis em uma única área de trabalho.
            </p>
            <p>
              A visualização por ambiente ajuda a localizar aparelhos e acompanhar
              seus estados sem perder de vista o contexto da operação.
            </p>
            <ul className={styles.featureList}>
              <li>Cadastro e organização de equipamentos</li>
              <li>Visualização do status dos dispositivos</li>
              <li>Gestão por equipes e ambientes</li>
            </ul>
          </article>
        </section>

        <section className={`${styles.featureSection} ${styles.white} ${styles.reverse}`}>
          <article className={`${styles.featureCard} ${styles.cardYellow}`}>
            <h2>Análise de dados e indicadores</h2>
            <p>
              Consulte informações dos equipamentos em gráficos e acompanhe os
              registros por diferentes intervalos de tempo.
            </p>
            <p>
              A comparação entre máquinas e períodos ajuda a observar variações,
              identificar padrões e apoiar decisões com base nos dados disponíveis.
            </p>
          </article>
          <div className={styles.visual}>
            <img
              src={PessoaOlhandoTablet}
              alt="Pessoa consultando informações em um tablet"
            />
          </div>
        </section>

        <section className={`${styles.featureSection} ${styles.cream}`}>
          <div className={styles.visual}>
            <img
              src={PessoaEscrevendo}
              alt="Pessoa organizando tarefas e informações"
            />
          </div>
          <article className={`${styles.featureCard} ${styles.cardWhite}`}>
            <h2>Rotinas e automações</h2>
            <p>
              Planeje atividades recorrentes, escolha os dias e horários e divida
              cada rotina em ações organizadas por sequência.
            </p>
            <p>
              As rotinas podem ser associadas aos equipamentos da equipe para
              facilitar a consulta das tarefas previstas e das instruções de execução.
            </p>
          </article>
        </section>

        <section className={`${styles.featureSection} ${styles.white} ${styles.reverse} ${styles.lastFeature}`}>
          <article className={`${styles.featureCard} ${styles.cardYellow}`}>
            <h2>Visualização de ambientes em 3D</h2>
            <p>
              Explore representações tridimensionais de ambientes e visualize os
              equipamentos de forma contextualizada.
            </p>
            <p>
              O projeto inclui cenários demonstrativos voltados à indústria, à
              educação e à saúde, aproximando a interface digital dos espaços em
              que os dispositivos são utilizados.
            </p>
          </article>
          <div className={styles.visual}>
            <img
              src={AmbienteVirtualEmpresa3D}
              alt="Representação tridimensional de um ambiente com equipamentos"
            />
          </div>
        </section>
      </main>

      <div className={styles.footerWrap}>
        <FooterBar />
      </div>
    </div>
  );
}
