
import { useRef } from "react";
import { ImageDown } from "lucide-react";
import styles from "./styles.module.css";

export type SerieGrafico = {
  id: string;
  nome: string;
  cor: string;
  valores: number[];
};

export type ItemPizza = {
  nome: string;
  valor: number;
  cor: string;
};

type GraficoEnergiaProps = {
  tipo: "area" | "pizza";
  rotuloPeriodo: string;
  rotulos: string[];
  series: SerieGrafico[];
  itensPizza: ItemPizza[];
  unidade?: string;
};

/** Converte coordenadas polares em uma posição no SVG para desenhar fatias de pizza. */
function pontoPolar(cx: number, cy: number, raio: number, angulo: number) {
  const radianos = ((angulo - 90) * Math.PI) / 180;
  return {
    x: cx + raio * Math.cos(radianos),
    y: cy + raio * Math.sin(radianos),
  };
}

/** Gera o caminho SVG de uma fatia, sem precisar de biblioteca extra de gráficos. */
function caminhoFatia(
  cx: number,
  cy: number,
  raio: number,
  inicio: number,
  fim: number
) {
  if (fim - inicio >= 359.999) return "";

  const pontoInicio = pontoPolar(cx, cy, raio, fim);
  const pontoFim = pontoPolar(cx, cy, raio, inicio);
  const arcoGrande = fim - inicio <= 180 ? "0" : "1";

  return `M ${cx} ${cy} L ${pontoInicio.x} ${pontoInicio.y} A ${raio} ${raio} 0 ${arcoGrande} 0 ${pontoFim.x} ${pontoFim.y} Z`;
}

/** Gráfico SVG responsivo. O SVG é usado para permitir exportação como arquivo de imagem. */
export function GraficoEnergia({
  tipo,
  rotuloPeriodo,
  rotulos,
  series,
  itensPizza,
  unidade = "kWh",
}: GraficoEnergiaProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const totalPizza = itensPizza
    .filter((item) => item.valor > 0)
    .reduce((soma, item) => soma + item.valor, 0);

  const totalPizzaFormatado = totalPizza.toLocaleString("pt-BR", {
    maximumFractionDigits: 1,
  });

  const baixarImagem = () => {
    const svg = svgRef.current;
    if (!svg) return;

    const copia = svg.cloneNode(true) as SVGSVGElement;

    copia.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    copia.setAttribute("width", "900");
    copia.setAttribute("height", tipo === "area" ? "370" : "420");

    // Na exportação, restaura a área completa para reservar espaço ao total acima da pizza.
    if (tipo === "pizza") {
      copia.setAttribute("viewBox", "0 0 560 330");

      const namespaceSvg = "http://www.w3.org/2000/svg";
      const resumo = document.createElementNS(namespaceSvg, "g");

      const rotuloTotal = document.createElementNS(namespaceSvg, "text");

      rotuloTotal.setAttribute("x", "178");
      rotuloTotal.setAttribute("y", "18");
      rotuloTotal.setAttribute("text-anchor", "middle");
      rotuloTotal.setAttribute("fill", "#574c42");
      rotuloTotal.setAttribute("font-size", "12");
      rotuloTotal.textContent = "Consumo total";

      const valorTotal = document.createElementNS(namespaceSvg, "text");

      valorTotal.setAttribute("x", "178");
      valorTotal.setAttribute("y", "40");
      valorTotal.setAttribute("text-anchor", "middle");
      valorTotal.setAttribute("fill", "#2e2924");
      valorTotal.setAttribute("font-size", "17");
      valorTotal.setAttribute("font-weight", "700");
      valorTotal.textContent = `${totalPizzaFormatado} ${unidade}`;

      resumo.append(rotuloTotal, valorTotal);
      copia.appendChild(resumo);
    }

    const conteudo = new XMLSerializer().serializeToString(copia);

    const arquivo = new Blob([conteudo], {
      type: "image/svg+xml;charset=utf-8",
    });

    const url = URL.createObjectURL(arquivo);
    const link = document.createElement("a");

    link.href = url;

    link.download = `grafico-energia-${tipo}-${rotuloPeriodo
      .toLowerCase()
      .replace(/\s+/g, "-")}.svg`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  // ==========================================
  // GRÁFICO DE PIZZA
  // ==========================================

  if (tipo === "pizza") {
    const itens = itensPizza.filter((item) => item.valor > 0);
    const total = totalPizza;

    let acumulado = 0;

    return (
      <section
        className={styles.graficoContainer}
        aria-label={`Gráfico de pizza de energia, ${rotuloPeriodo}`}
      >
        <div className={styles.topoGrafico}>
          <div>
            <h3>Distribuição do consumo</h3>
            <p>Consumo demonstrativo por equipamento ou período</p>
          </div>

          <button
            type="button"
            onClick={baixarImagem}
            className={styles.botaoBaixar}
            title="Baixar gráfico em SVG"
          >
            <ImageDown size={15} /> Baixar gráfico
          </button>
        </div>

        <div
          className={styles.resumoPizza}
          role="group"
          aria-label={`Consumo total de ${totalPizzaFormatado} ${unidade}`}
        >
          <span>Consumo total</span>
          <strong>
            {totalPizzaFormatado} {unidade}
          </strong>
        </div>

        <svg
          ref={svgRef}
          className={`${styles.svgGrafico} ${styles.svgPizza}`}
          viewBox="0 55 560 220"
          role="img"
          aria-label={`Pizza de consumo total de ${totalPizzaFormatado} ${unidade}`}
        >
          {/* Fundo limitado à área visível do SVG para não cobrir o título do card. */}
          <rect
            x="0"
            y="55"
            width="560"
            height="220"
            rx="12"
            fill="#fff"
          />

          {total <= 0 ? (
            <text
              x="280"
              y="165"
              textAnchor="middle"
              fill="#81776d"
              fontSize="13"
            >
              Não há consumo para representar.
            </text>
          ) : (
            <>
              {itens.map((item, index) => {
                const anguloInicial = (acumulado / total) * 360;

                acumulado += item.valor;

                const anguloFinal = (acumulado / total) * 360;

                if (anguloFinal - anguloInicial >= 359.999) {
                  return (
                    <circle
                      key={item.nome}
                      cx="178"
                      cy="158"
                      r="98"
                      fill={item.cor}
                      stroke="#fff"
                      strokeWidth="2"
                    />
                  );
                }

                return (
                  <path
                    key={`${item.nome}-${index}`}
                    d={caminhoFatia(
                      178,
                      158,
                      98,
                      anguloInicial,
                      anguloFinal
                    )}
                    fill={item.cor}
                    stroke="#fff"
                    strokeWidth="2"
                  />
                );
              })}

              {/* Legenda das fatias */}
              <g transform="translate(326 78)">
                {itens.map((item, index) => {
                  const y = index * 34;

                  const percentual = total
                    ? (item.valor / total) * 100
                    : 0;

                  return (
                    <g
                      key={item.nome}
                      transform={`translate(0 ${y})`}
                    >
                      <rect
                        width="11"
                        height="11"
                        rx="3"
                        fill={item.cor}
                        y="1"
                      />

                      <text
                        x="19"
                        y="10"
                        fontSize="10.5"
                        fill="#4f473f"
                      >
                        {item.nome.length > 23
                          ? `${item.nome.slice(0, 21)}…`
                          : item.nome}
                      </text>

                      <text
                        x="19"
                        y="24"
                        fontSize="10"
                        fill="#8b7e72"
                      >
                        {percentual.toLocaleString("pt-BR", {
                          maximumFractionDigits: 1,
                        })}
                        % ·{" "}
                        {item.valor.toLocaleString("pt-BR", {
                          maximumFractionDigits: 1,
                        })}{" "}
                        {unidade}
                      </text>
                    </g>
                  );
                })}
              </g>
            </>
          )}
        </svg>
      </section>
    );
  }

  // ==========================================
  // GRÁFICO DE ÁREA
  // ==========================================

  const largura = 900;
  const altura = 370;

  const margem = {
    cima: 22,
    direita: 24,
    baixo: 48,
    esquerda: 58,
  };

  const larguraPlot =
    largura - margem.esquerda - margem.direita;

  const alturaPlot =
    altura - margem.cima - margem.baixo;

  // No modo diário, a escala começa em 25 kWh.
  // O limite cresce em blocos de 25 caso os dados ultrapassem esse valor.
  const intervaloEscala =
    rotuloPeriodo === "Diário" ? 25 : 250;

  const maximoValor = Math.max(
    intervaloEscala,
    ...series.flatMap((serie) => serie.valores)
  );

  const topo =
    Math.ceil(maximoValor / intervaloEscala) * intervaloEscala;

  const passosY = 4;

  const x = (indice: number) =>
    margem.esquerda +
    (rotulos.length <= 1
      ? larguraPlot / 2
      : (indice / (rotulos.length - 1)) * larguraPlot);

  const y = (valor: number) =>
    margem.cima +
    alturaPlot -
    (valor / topo) * alturaPlot;

  const indicesRotulos = rotulos
    .map((_, indice) => indice)
    .filter((indice) => {
      const intervalo = Math.max(
        1,
        Math.ceil(rotulos.length / 8)
      );

      return (
        indice % intervalo === 0 ||
        indice === rotulos.length - 1
      );
    });

  return (
    <section
      className={styles.graficoContainer}
      aria-label={`Gráfico de área de energia, ${rotuloPeriodo}`}
    >
      <div className={styles.topoGrafico}>
        <div>
          <h3>Energia gasta em {unidade}</h3>
          <p>Consumo demonstrativo · {rotuloPeriodo}</p>
        </div>

        <button
          type="button"
          onClick={baixarImagem}
          className={styles.botaoBaixar}
          title="Baixar gráfico em SVG"
        >
          <ImageDown size={15} /> Baixar gráfico
        </button>
      </div>

      <svg
        ref={svgRef}
        className={styles.svgGrafico}
        viewBox={`0 0 ${largura} ${altura}`}
        role="img"
        aria-label={`Gráfico de área de energia por ${rotuloPeriodo}`}
      >
        <rect
          width={largura}
          height={altura}
          rx="12"
          fill="#fff"
        />

        {/* Linhas horizontais e valores do eixo Y */}
        {Array.from({ length: passosY + 1 }, (_, indice) => {
          const valor = (topo / passosY) * indice;
          const posY = y(valor);

          return (
            <g key={indice}>
              <line
                x1={margem.esquerda}
                y1={posY}
                x2={largura - margem.direita}
                y2={posY}
                stroke="#ece8e2"
                strokeWidth="1"
              />

              <text
                x={margem.esquerda - 10}
                y={posY + 4}
                fontSize="11"
                textAnchor="end"
                fill="#6c655d"
              >
                {Math.round(valor)}
              </text>
            </g>
          );
        })}

        {/* Valores do eixo X */}
        {indicesRotulos.map((indice) => (
          <g key={rotulos[indice]}>
            <line
              x1={x(indice)}
              y1={margem.cima}
              x2={x(indice)}
              y2={altura - margem.baixo}
              stroke="#f4f1ed"
              strokeWidth="1"
            />

            <text
              x={x(indice)}
              y={altura - margem.baixo + 23}
              textAnchor="middle"
              fontSize="11"
              fill="#5d554d"
            >
              {rotulos[indice]}
            </text>
          </g>
        ))}

        {/* Séries de consumo */}
        {series.map((serie) => {
          const pontos = serie.valores.map(
            (valor, indice) => ({
              x: x(indice),
              y: y(valor),
            })
          );

          if (!pontos.length) return null;

          const linha = pontos
            .map(
              (ponto, indice) =>
                `${indice === 0 ? "M" : "L"} ${ponto.x} ${ponto.y}`
            )
            .join(" ");

          const area = `${linha} L ${
            pontos[pontos.length - 1].x
          } ${y(0)} L ${pontos[0].x} ${y(0)} Z`;

          return (
            <g key={serie.id}>
              <path
                d={area}
                fill={serie.cor}
                fillOpacity={series.length > 2 ? 0.2 : 0.52}
              />

              <path
                d={linha}
                fill="none"
                stroke={serie.cor}
                strokeWidth="3"
                strokeLinejoin="round"
                strokeLinecap="round"
              />

              {pontos.map((ponto, indice) => (
                <circle
                  key={`${serie.id}-${indice}`}
                  cx={ponto.x}
                  cy={ponto.y}
                  r={rotulos.length > 15 ? 2.4 : 3.5}
                  fill={serie.cor}
                  stroke="#fff"
                  strokeWidth="1.5"
                />
              ))}
            </g>
          );
        })}
      </svg>

      {/* Legenda */}
      <div className={styles.legenda}>
        {series.map((serie) => (
          <span key={serie.id}>
            <i style={{ backgroundColor: serie.cor }} />
            {serie.nome}
          </span>
        ))}
      </div>
    </section>
  );
}
