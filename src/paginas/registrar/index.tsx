import styles from './styles.module.css';
import PessoasSentadas from '../../imagens/PessoasSentadas.jpg';
import { LabelPadrao } from "../../componentes/LabelPadrao.tsx";
import { BotaoPadrao } from "../../componentes/BotaoPadrao.tsx";
import { Link } from 'react-router-dom';

export function TelaDeRegistrar() {
  return (
    <main className={styles['tela-de-registrar']}>

      {/* Formulário */}
      <section className={styles['container-formulario']}>
        <div className={`${styles.div}`}>

          <h1 className={styles['Titulo']}>
            Registrar
          </h1>

          <LabelPadrao  
            id="text"
            textoLabel=""
            textoTitulo= "Nome"
            tipo="text"
          />

          <LabelPadrao  
            id="text"
            textoLabel=""
            textoTitulo= "Email"
            tipo="text"
          />

          <LabelPadrao  
            id="senha"
            textoLabel=""
            textoTitulo= "Senha"
            tipo="password"
          />

          <label className={`${styles.divCheckBox}`}>
            <input className={`${styles.checkBoxRegistrar}`} type="checkbox"></input>
            <p> Concordo com os termos</p>
          </label>
          

          <BotaoPadrao textoBotao="Criar Conta"/>


          <Link to="/">

            <p className={`${styles.NaoTenhoConta}`}>
              <a type="button" className={`${styles.CriarConta}`}>
                Voltar ao login
              </a>
            </p>
          </Link>

          

        </div>
      </section>

      <section className={styles['container-visual']}>

        <img
          src={PessoasSentadas}
          alt="Pessoas em uma reunião"
          className={styles['image-colorized']}
        />

      </section>

    </main>
  );
}