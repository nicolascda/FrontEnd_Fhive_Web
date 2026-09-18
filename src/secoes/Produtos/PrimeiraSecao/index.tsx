import styles from "./styles.module.css";
import { useState } from "react";
import { dadosProdutos } from "../../../dados/dadoMockado.tsx";
import { BotaoMutavel } from "../../../componentes/BotaoMutavel";


export function ProdutosPrimeiraSecao() {

    const [botaoSelecionado, setBotaoSelecionado] = useState(0);
    const [itemAtivo, setItemAtivo] = useState<number | null>(1);

    const alternarItem = (id: number) => {
        setItemAtivo(itemAtivo === id ? null : id);
    };

    const dadosAtuais = dadosProdutos[botaoSelecionado];

    return (
        <>
            <section className={styles.SecaoProdutos}>



                <h2 className={styles.TituloCard}>
                    Funções do Fhive
                </h2>

                <p className={styles.SubtituloCard}>
                    Um aplicativo em que os usuários podem confiar
                </p>

                <div className={styles.BotoesGestao}>

                    <BotaoMutavel
                        textoBotao="Local e privado"
                        pressionado={botaoSelecionado === 0}
                        onClick={() => setBotaoSelecionado(0)}
                    />

                    <BotaoMutavel
                        textoBotao="Apis e agente"
                        pressionado={botaoSelecionado === 1}
                        onClick={() => setBotaoSelecionado(1)}
                    />

                    <BotaoMutavel
                        textoBotao="Ferramentas"
                        pressionado={botaoSelecionado === 2}
                        onClick={() => setBotaoSelecionado(2)}
                    />

                    <BotaoMutavel
                        textoBotao="Modelo 3D"
                        pressionado={botaoSelecionado === 3}
                        onClick={() => setBotaoSelecionado(3)}
                    />

                </div>


                {/* Conteudo dos botões */}
                {dadosAtuais && (

                    <div className={styles.CardMutavel}>
                        <div className={styles.CardControleTexto}>
                            {dadosAtuais.itens.map((item) => (
                            <div
                                key={item.id}
                                className={styles.CardProtudosTexto}
                            >
                                <h3> {item.titulo}</h3>
                                <p> {item.texto} </p>
                            </div>

                            ))}

                        </div>

                        <img src={dadosAtuais.imagem} className={styles.ImgProdutos} alt="Imagem de ambientes virtuais" />
                    </div>
                )}

            </section >
        </>
    )
}