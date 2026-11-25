import styles from "./styles.module.css";
import { useState } from "react";
import { dadosProdutos } from "../../../dados/dadoMockado";
import { BotaoMutavel } from "../../../componentes/BotaoMutavel";

const categorias = [
  "Gestão de dispositivos",
  "Integrações e dados",
  "Rotinas e automações",
  "Ambientes 3D",
];

export function ProdutosPrimeiraSecao() {
  const [botaoSelecionado, setBotaoSelecionado] = useState(0);
  const dadosAtuais = dadosProdutos[botaoSelecionado];

  return (
    <section className={styles.SecaoProdutos}>
      <h2 className={styles.TituloCard}>Recursos da Fhive</h2>
      <p className={styles.SubtituloCard}>
        Ferramentas para visualizar equipamentos, acompanhar informações e organizar atividades.
      </p>

      <div className={styles.BotoesGestao} aria-label="Categorias de recursos">
        {categorias.map((categoria, indice) => (
          <BotaoMutavel
            key={categoria}
            textoBotao={categoria}
            pressionado={botaoSelecionado === indice}
            onClick={() => setBotaoSelecionado(indice)}
            aria-pressed={botaoSelecionado === indice}
          />
        ))}
      </div>

      {dadosAtuais && (
        <div className={styles.CardMutavel}>
          <div className={styles.CardControleTexto}>
            {dadosAtuais.itens.map((item) => (
              <article key={item.id} className={styles.CardProtudosTexto}>
                <h3>{item.titulo}</h3>
                <p>{item.texto}</p>
              </article>
            ))}
          </div>

          <img
            src={dadosAtuais.imagem}
            className={styles.ImgProdutos}
            alt={`Ilustração relacionada a ${categorias[botaoSelecionado].toLowerCase()}`}
          />
        </div>
      )}
    </section>
  );
}
