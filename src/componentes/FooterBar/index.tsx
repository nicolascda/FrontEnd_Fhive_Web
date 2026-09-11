import styles from "./styles.module.css";
import { Link } from 'react-router-dom';
import SeloGooglePlay from "../../imagens/GooglePlay.png";
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaGlobe } from 'react-icons/fa';

export function FooterBar() {
    return (
        <>
            <footer className={styles.footerContainer}>

                <div className={styles.footerLinhaSuperior}>
                    <div className={styles.footerLogo}>
                        <h2>Fhive</h2>
                    </div>

                    <div className={styles.footerLinksGrid}>
                        <div className={styles.footerColunaLinks}>
                            <h4>Links rápidos</h4>
                            <Link to="/ajuda">Ajuda</Link>
                            <Link to="/solucoes">Soluções</Link>
                        </div>

                        <div className={styles.footerColunaLinks}>
                            <h4>Quem somos</h4>
                            <Link to="/sobre">Nossos Objetivos</Link>
                        </div>

                        <div className={styles.footerColunaLinks}>
                            <h4>Início</h4>
                            <Link to="/produtos">Produtos</Link>
                        </div>
                    </div>

                    <div className={styles.footerDireitaBloco}>
                        <div className={styles.footerRedesSociais}>
                            <a href="https://facebook.com" target="_blank" rel="noreferrer"><FaFacebook /></a>
                            <a href="https://twitter.com" target="_blank" rel="noreferrer"><FaTwitter /></a>
                            <a href="https://instagram.com" target="_blank" rel="noreferrer"><FaInstagram /></a>
                            <a href="https://youtube.com" target="_blank" rel="noreferrer"><FaYoutube /></a>
                        </div>
                        <img src={SeloGooglePlay} alt="Disponível no Google Play" className={styles.googlePlayBtn} />
                    </div>
                </div>

                <hr className={styles.footerDivisor} />

                <div className={styles.footerLinhaInferior}>
                    <div className={styles.footerDireitos}>
                        <span>@2026 Fhive. Terms Privacy Cookie</span>
                    </div>

                    <div className={styles.footerIdiomaEtermos}>
                        <div className={styles.footerIdioma}>
                            <FaGlobe />
                            <span>Português (Brasil)</span>
                        </div>
                        <Link to="/privacidade" className={`${styles.TermosEPrivacidadeFooter}`}>Termos de Privacidade</Link>
                    </div>
                </div>

            </footer >
        </>
    )
}