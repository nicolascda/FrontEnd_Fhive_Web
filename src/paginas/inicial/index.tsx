import styles from "./styles.module.css";
import { CardInicial } from "../../componentes/CardInicial";
import { Link } from "react-router-dom";
import { PrimeiraSecaoInicial } from "../../secoes/Inicial/PrimeiraSecao";
import { SegundaSecaoInicial } from "../../secoes/Inicial/SegundaSecaoInicial";
import PessoaEscrevendo from "../../imagens/PessoaEscrevendo.png";
import { CardComposto } from "../../componentes/CardComposto";
import { FooterBar } from "../../componentes/FooterBar";

export function TelaInicial() {
  return (
    <div className={styles.telaInicial}>
      <section className={styles.FundoMarrom}>
        <div className={styles.FundoMarromTexto}>
          <h1>FHIVE IoT</h1>
          <p>
            Centralize dispositivos conectados, acompanhe informações e organize
            rotinas de automação em um único ambiente.
          </p>
          <Link to="/solucaoFhive" className={styles.botaoInicial}>
            Conheça a solução
          </Link>
        </div>

        <div className={styles.CardGiratorio}>
          <CardInicial
            texto="Garagem"
            icone={
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path
                  fill="#ffffff"
                  d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99ZM6.85 7h10.29l1.04 3H5.81l1.04-3ZM5 15v-3h14v3H5Zm2.5 2c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17Zm9 0c-.83 0-1.5-.67-1.5-1.5S15.67 14 16.5 14s1.5.67 1.5 1.5S17.33 17 16.5 17Z"
                />
              </svg>
            }
          />
        </div>
      </section>

      <PrimeiraSecaoInicial />
      <SegundaSecaoInicial />

      <CardComposto
        titulo="Seus dispositivos, informações e rotinas em um só lugar"
        subtitulo="Conheça os recursos da Fhive e veja como eles podem ajudar a organizar o acompanhamento dos equipamentos conectados."
        textoPequeno="Conheça a plataforma"
        img={PessoaEscrevendo}
        botaoTexto="Ver produtos"
        caminhoBotao="/produtos"
        isTrue={true}
      />

      <section className={styles.QuartaSection}>
        <h1>Uma experiência conectada, organizada em três frentes</h1>

        <div className={styles.QuartaSectionDiv}>
          <div className={styles.QuartaSectionMiniDiv}>
            <h2>Centralização</h2>
            <p>
              Reúna equipamentos e informações em uma interface organizada por equipe.
            </p>
          </div>
          <div className={styles.QuartaSectionMiniDiv}>
            <h2>Automação</h2>
            <p>
              Estruture rotinas, horários e etapas para apoiar as atividades do dia a dia.
            </p>
          </div>
          <div className={styles.QuartaSectionMiniDiv}>
            <h2>Análise</h2>
            <p>
              Consulte indicadores e gráficos para compreender melhor os dados disponíveis.
            </p>
          </div>
        </div>
      </section>

      <FooterBar />
    </div>
  );
}
