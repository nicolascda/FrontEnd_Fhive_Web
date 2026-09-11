import styles from "./styles.module.css";
import { BarraNavegacao } from "../../componentes/BarraNavegacao/index.tsx";
import { CardInicial } from "../../componentes/CardInicial/index.tsx";
import { Link } from 'react-router-dom';
// import { BotaoMutavel } from "../../componentes/BotaoMutavel/index.tsx";
import { PrimeiraSecaoInicial } from "../../secoes/PrimeiraSecaoInicial/index.tsx";
import { SegundaSecaoInicial } from "../../secoes/SegundaSecaoInicial/index.tsx";
// import { useState } from "react";


// import PessoaSentadaComputador from "../../imagens/PessoaNoComputador.jpg";
// import { dadosGestao } from "../../dados/dadoMockado.tsx";

export function TelaInicial() {

  // const [botaoSelecionado, setBotaoSelecionado] = useState(0);
  // const [itemAtivo, setItemAtivo] = useState<number | null>(1);

  // const alternarItem = (id: number) => {
  //   setItemAtivo(itemAtivo === id ? null : id);
  // };

  // const dadosAtuais = dadosGestao[botaoSelecionado];

  return (
    <div className={styles.telaInicial}>

      <BarraNavegacao />

      {/* PRIMEIRA PARTE DA PÁGINA */}
      <section className={styles.FundoMarrom}>

        <div className={styles.FundoMarromTexto}>

          <h1>FHIVE IOT</h1>

          <p>
            Conecte, monitore e controle
            dispositivos e ativos com soluções
            altamente seguras da nuvem para a
            borda.
          </p>

          <Link
            to="/tutorial"
            className={styles.botaoInicial}
          >
            Tutorial ao Fhive
          </Link>

        </div>

        <div className={styles.CardGiratorio}>

          <CardInicial
            texto="Garagem"
            icone={
              <svg
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
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

      <SegundaSecaoInicial/>

      <br></br>

      

    </div>
  );
}