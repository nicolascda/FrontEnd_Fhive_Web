import styles from './styles.module.css';
import PessoasSentadas from '../../imagens/PessoasSentadas.jpg';
import { LabelPadrao } from "../../componentes/LabelPadrao.tsx";
import { BotaoPadrao } from "../../componentes/BotaoPadrao.tsx";
import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export function TelaDeLogin() {
  return (
    <main className={styles['tela-de-login']}>

      {/* Formulário */}
      <section className={styles['container-formulario']}>
        {/* <span className={styles['teste']}><Home /></span> */}
        <div className={`${styles.div}`}>

          <h1 className={styles['Titulo']}>
            Bem-vindo de volta!
          </h1>

          <LabelPadrao  
            id="text"
            textoLabel="Higor"
            textoTitulo= "Nome ou Email"
            tipo="text"
          />

          <LabelPadrao  
            id="senha"
            textoLabel="1234"
            textoTitulo= "Senha"
            tipo="password"
          />

          <span className={`${styles['EsqueceuASenha']} ${styles['group']}`}>
              <a>Esqueceu a senha?</a>
          </span>

          <BotaoPadrao textoBotao="Entrar"/>

          <p className={styles['NaoTenhoConta']}>
            <span className={styles.span}>
              Não tem conta?{' '}
            </span>

            <Link to="/registrar">
              <a type="button" className={styles['CriarConta']}>
                Crie uma agora
              </a>
            </Link>
            
          </p>

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