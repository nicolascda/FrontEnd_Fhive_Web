import styles from './style.module.css';
import PessoasSentadas from '../imagens/PessoasSentadas.jpg';

export function TelaDeLogin() {
  return (
    <main className={styles['tela-de-login']}>

      {/* Área do formulário */}
      <section className={styles['container-formulario']}>
        <div className={styles.div}>

          <h1 className={styles['text-wrapper']}>
            Bem-vindo de volta!
          </h1>

          <div className={styles['group-2']}>
            <label
              htmlFor="email"
              className={styles['text-wrapper-5']}
            >
              Nome ou Email
            </label>

            <input
              id="email"
              type="text"
              placeholder="Higor"
              className={styles['input-nativo']}
            />
          </div>

          <div className={styles['group-3']}>
            <label
              htmlFor="senha"
              className={styles['text-wrapper-7']}
            >
              Senha
            </label>

            <input
              id="senha"
              type="password"
              placeholder="1234"
              className={styles['input-nativo']}
            />
          </div>

          <button
            type="button"
            className={styles.group}
          >
            <span className={styles['text-wrapper-2']}>
              Esqueceu a senha?
            </span>

            <span className={styles.line} />
          </button>

          <button
            type="button"
            className={styles['group-4']}
          >
            Entrar
          </button>

          <p className={styles['n-o-tem-conta-crie']}>
            <span className={styles.span}>
              Não tem conta?{' '}
            </span>

            <button
              type="button"
              className={styles['text-wrapper-4']}
            >
              Crie uma agora
            </button>
          </p>

        </div>
      </section>

      {/* Área visual */}
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