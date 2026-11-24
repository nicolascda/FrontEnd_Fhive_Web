import styles from "./styles.module.css";
import { Link } from "react-router-dom";
import SeloGooglePlay from "../../imagens/GooglePlay.png";
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaGlobe } from "react-icons/fa";

export function FooterBar() {
  return (
    <footer className={styles.footerContainer}>
      <div className={styles.footerLinhaSuperior}>
        <div className={styles.footerLogo}>
          <h2>Fhive</h2>
          <p>Conectando dispositivos, informações e pessoas.</p>
        </div>

        <div className={styles.footerLinksGrid}>
          <div className={styles.footerColunaLinks}>
            <h4>Explore</h4>
            <Link to="/produtos">Produtos</Link>
            <Link to="/solucaoFhive">Soluções</Link>
          </div>

          <div className={styles.footerColunaLinks}>
            <h4>Sobre a Fhive</h4>
            <Link to="/quemSomos#nosso-objetivo">Nosso objetivo</Link>
            <Link to="/quemSomos#perguntas-frequentes">Perguntas frequentes</Link>
          </div>

          <div className={styles.footerColunaLinks}>
            <h4>Comece por aqui</h4>
            <Link to="/registrar">Criar conta</Link>
            <Link to="/login">Entrar</Link>
          </div>
        </div>

        <div className={styles.footerDireitaBloco}>
          <div className={styles.footerRedesSociais} aria-label="Redes sociais">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><FaFacebook /></a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter"><FaTwitter /></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><FaInstagram /></a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube"><FaYoutube /></a>
          </div>
          <img
            src={SeloGooglePlay}
            alt="Selo Google Play"
            className={styles.googlePlayBtn}
          />
        </div>
      </div>

      <hr className={styles.footerDivisor} />

      <div className={styles.footerLinhaInferior}>
        <div className={styles.footerDireitos}>
          <span>© 2026 Fhive. Todos os direitos reservados.</span>
        </div>

        <div className={styles.footerIdiomaEtermos}>
          <div className={styles.footerIdioma}>
            <FaGlobe aria-hidden="true" />
            <span>Português (Brasil)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
