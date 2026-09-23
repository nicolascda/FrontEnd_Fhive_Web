import styles from "./styles.module.css";
import { BarraNavegacao } from "../../componentes/BarraNavegacao/index.tsx";
import { Link } from 'react-router-dom';
import { ProdutosPrimeiraSecao } from "../../secoes/Produtos/PrimeiraSecao";
import { SegundaSecaoProdutos } from "../../secoes/Produtos/SegundaSecao/index.tsx";
import { FooterBar } from "../../componentes/FooterBar/index.tsx";
import { CardComposto } from "../../componentes/CardComposto/index.tsx";
import PessoaOlhandoTablet from "../../imagens/PessoaOlhandoTablet.jpg";

export function TelaProdutos() {
    return (

        <>
            <BarraNavegacao />

            <section className={styles.FundoMarrom}>

                <div className={styles.FundoMarromTexto}>

                    <h1>FHIVE IOT</h1>

                    <p>
                        Fhive é um aplicativo de controle de aparelhos IoT,
                        servindo para a automação e controle de forma manual desses aparelhos,
                        de forma eficiente, e tratamento dos dados.
                    </p>

                    <Link
                        to="/tutorial"
                        className={styles.botaoInicial}
                    >
                        Entrar no Fhive
                    </Link>

                </div>

            </section>

            <ProdutosPrimeiraSecao />

            <SegundaSecaoProdutos/>

            <CardComposto
                titulo="Próximos Passos"
                subtitulo="Após escolher o plano que vai ser utilizado, é necessário saber como utilizar as funções presentes do Fhive"
                textoPequeno="Guia" 
                img={PessoaOlhandoTablet}
                botaoTexto="Tutorial ao Fhive"
                caminhoBotao="/rota"
                isTrue={false}
            />


            <FooterBar/>
        </>

    )
}