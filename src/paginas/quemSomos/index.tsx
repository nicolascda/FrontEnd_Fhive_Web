import { useState } from "react";
import { Globe, Lightbulb, Minus, Plus, Sparkles, Target, Users } from "lucide-react";
import styles from "./styles.module.css";
import { BarraNavegacao } from "../../componentes/BarraNavegacao";
import { FooterBar } from "../../componentes/FooterBar";
import FundoQuemSomos from "../../imagens/FundoQuemSomos.png";
import PessoasSentadas from "../../imagens/PessoasSentadas.jpg";
import PessoaNoComputador from "../../imagens/PessoaNoComputador.jpg";

type PerguntaFrequente = {
  pergunta: string;
  resposta: string;
};

const perguntas: PerguntaFrequente[] = [
  {
    pergunta: "O que é a Fhive?",
    resposta:
      "A Fhive é uma proposta de solução para controlar e acompanhar dispositivos conectados (IoT) de forma centralizada. A ideia é reunir os aparelhos e suas informações em uma interface simples de utilizar.",
  },
  {
    pergunta: "Quem idealizou a Fhive?",
    resposta:
      "A Fhive foi idealizada pela equipe responsável pelo projeto, que trabalha para tornar o uso da tecnologia conectada mais simples e acessível. A proposta combina automação, acompanhamento de dados e facilidade de uso.",
  },
  {
    pergunta: "De onde a ideia surgiu?",
    resposta:
      "A proposta parte de uma dificuldade comum: configurar e acompanhar diferentes dispositivos pode exigir aplicativos e passos separados. A Fhive busca aproximar esses controles em uma experiência organizada e intuitiva.",
  },
  {
    pergunta: "Qual é o nosso objetivo?",
    resposta:
      "Nosso objetivo é tornar o controle de dispositivos inteligentes mais acessível, ajudando as pessoas a configurar aparelhos, acompanhar informações e utilizar recursos de automação sem depender de conhecimentos técnicos avançados.",
  },
];

/** Página institucional com apresentação do projeto e perguntas frequentes. */
export function TelaQuemSomos() {
  const [perguntasAbertas, setPerguntasAbertas] = useState<number[]>([]);

  // Abre ou fecha uma pergunta sem afetar as outras linhas do acordeão.
  const alternarPergunta = (indice: number) => {
    setPerguntasAbertas((atuais) =>
      atuais.includes(indice)
        ? atuais.filter((item) => item !== indice)
        : [...atuais, indice],
    );
  };

  // Os controles superiores permitem expandir ou recolher toda a lista.
  const expandirTodas = () =>
    setPerguntasAbertas(perguntas.map((_, indice) => indice));
  const recolherTodas = () => setPerguntasAbertas([]);

  return (
    <div className={styles.page}>
      <BarraNavegacao />

      <main>
        {/* Faixa institucional com o fundo oficial e uma ilustração de globo e lâmpada. */}
        <section className={styles.hero}>
          {/* Fundo em uma camada própria para permitir ampliar e reposicionar a arte sem distorcer o conteúdo. */}
          <div
            className={styles.heroBackground}
            style={{ backgroundImage: `url(${FundoQuemSomos})` }}
            aria-hidden="true"
          />

          <div className={styles.heroCopy}>
            <h1>Quem somos?</h1>
            <p>
              A Fhive aproxima pessoas da tecnologia conectada. Queremos tornar
              a automação mais simples, acessível e útil no dia a dia, respeitando
              as necessidades de quem utiliza nossos recursos.
            </p>
          </div>

          <div className={styles.heroArt} aria-hidden="true">
            <span className={styles.glow} />
            <span className={styles.orbit} />
            <Globe className={styles.globe} strokeWidth={0.9} />
            <Lightbulb className={styles.bulb} strokeWidth={1.35} />
            <Sparkles className={styles.sparkleOne} strokeWidth={1.6} />
            <Sparkles className={styles.sparkleTwo} strokeWidth={1.6} />
            <span className={styles.handShape} />
          </div>
        </section>

        {/* Apresenta o propósito do projeto. O id permite abrir esta seção pelo rodapé. */}
        <section className={`${styles.infoSection} ${styles.sectionWhite}`} id="nosso-objetivo">
          <div className={styles.photoWrap}>
            <img src={PessoasSentadas} alt="Pessoas conversando e compartilhando ideias" />
          </div>
          <article className={styles.infoCopy}>
            <div className={styles.sectionTitleRow}>
              <Target aria-hidden="true" />
              <h2>Nosso objetivo?</h2>
            </div>
            <p>
              Identificamos que controlar diferentes dispositivos e acompanhar
              suas informações pode ser complicado quando cada aparelho utiliza
              um caminho diferente. A Fhive propõe reunir esse controle em uma
              experiência simples, intuitiva e acessível.
            </p>
          </article>
        </section>

        {/* Explica para quem a solução está sendo pensada. */}
        <section className={`${styles.infoSection} ${styles.sectionCream} ${styles.reverse}`}>
          <article className={styles.infoCopy}>
            <div className={styles.sectionTitleRow}>
              <Users aria-hidden="true" />
              <h2>O público que queremos atingir?</h2>
            </div>
            <p>
              Queremos atender pessoas e famílias que buscam praticidade para
              controlar aparelhos conectados, incluindo quem não tem familiaridade
              com sistemas tecnológicos complexos. Nossa proposta é oferecer
              recursos claros, informações organizadas e uma navegação intuitiva.
            </p>
          </article>
          <div className={styles.photoWrap}>
            <img src={PessoaNoComputador} alt="Pessoa utilizando um computador para acompanhar informações" />
          </div>
        </section>

        {/* FAQ acessível: cada pergunta é um botão, com estado expandido explícito. */}
        <section className={styles.faqSection} id="perguntas-frequentes">
          <div className={styles.faqHeader}>
            <h2>Perguntas frequentes</h2>
            <div className={styles.faqActions}>
              <button type="button" onClick={expandirTodas}>
                Expandir
              </button>
              <button type="button" onClick={recolherTodas}>
                Fechar
              </button>
            </div>
          </div>

          <div className={styles.faqList}>
            {perguntas.map((item, indice) => {
              const aberta = perguntasAbertas.includes(indice);
              const idResposta = `resposta-pergunta-${indice}`;

              return (
                <article className={styles.faqItem} key={item.pergunta}>
                  <h3>
                    <button
                      type="button"
                      className={styles.faqQuestion}
                      aria-expanded={aberta}
                      aria-controls={idResposta}
                      onClick={() => alternarPergunta(indice)}
                    >
                      <span>{item.pergunta}</span>
                      {aberta ? <Minus aria-hidden="true" /> : <Plus aria-hidden="true" />}
                    </button>
                  </h3>
                  <div className={styles.faqAnswer} id={idResposta} hidden={!aberta}>
                    <p>{item.resposta}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      <div className={styles.footerWrap}>
        <FooterBar />
      </div>
    </div>
  );
}
