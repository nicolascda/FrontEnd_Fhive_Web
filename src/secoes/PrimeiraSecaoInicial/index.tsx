import styles from "./styles.module.css";
import { useState } from "react";
import { dadosGestao } from "../../dados/dadoMockado.tsx";
import { BotaoMutavel } from "../../componentes/BotaoMutavel";

export function PrimeiraSecaoInicial() {

    const [botaoSelecionado, setBotaoSelecionado] = useState(0);
      const [itemAtivo, setItemAtivo] = useState<number | null>(1);
    
      const alternarItem = (id: number) => {
        setItemAtivo(itemAtivo === id ? null : id);
      };
    
      const dadosAtuais = dadosGestao[botaoSelecionado];

    return (
        <>
            <section className={styles.SecaoGestao}>

                <div className={styles.TextoGestao}>

                    <h2 className={styles.TituloCard}>
                        Gestão inteligente de aparelhos e produtos IoT
                    </h2>

                    <p className={styles.SubtituloCard}>
                        Libere seus dados na borda, proteja e gerencie com a eficiência,
                        ajudando a sua empresa com a melhor gestão do planeta
                    </p>

                    <div className={styles.BotoesGestao}>

                        <BotaoMutavel
                            textoBotao="Os benefícios da gestão da Internet das Coisas"
                            pressionado={botaoSelecionado === 0}
                            onClick={() => setBotaoSelecionado(0)}
                        />

                        <BotaoMutavel
                            textoBotao="Arquitetura do sistema do Fhive"
                            pressionado={botaoSelecionado === 1}
                            onClick={() => setBotaoSelecionado(1)}
                        />

                    </div>

                </div>


                {/* Conteudo dos botões */}
                {dadosAtuais && (

                    <div className={styles.CardMutavel}>
                        <div className={styles.CardMutavelTexto}>

                            {dadosAtuais.itens.map((item, index) => (
                                <div
                                    key={item.id}
                                    className={itemAtivo === item.id ? styles.itemAberto : styles.itemFechado}
                                >
                                    <div className={styles.CardMutavelTitulo} onClick={() => alternarItem(item.id)}>
                                        <h2>{item.titulo}</h2>
                                        <span className={`${styles.seta} ${itemAtivo === item.id ? styles.setaCima : styles.setaBaixo}`} />
                                    </div>

                                    {itemAtivo === item.id && (
                                        <p className={styles.TextoAnimado}>{item.texto}</p>
                                    )}

                                    {index < dadosAtuais.itens.length - 1 && <hr />}
                                </div>
                            ))}
                        </div>

                        <img
                            className={styles.ImagemMutavel}
                            src={dadosAtuais.imagem}
                            alt="Pessoa no computador"
                        />
                    </div>
                )}

            </section>
        </>
    )
}