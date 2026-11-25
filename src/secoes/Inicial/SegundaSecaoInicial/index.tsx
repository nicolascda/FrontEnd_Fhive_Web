import styles from "./styles.module.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { BarChart3, Boxes, CalendarClock, Wifi, Brain} from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const recursos = [
  {
    titulo: "Gestão de dispositivos",
    descricao:
      "Organize os dispositivos cadastrados por equipe e consulte suas principais informações em uma interface centralizada.",
    Icone: Wifi,
  },
  {
    titulo: "Análise de dados",
    descricao:
      "Visualize indicadores por equipamento e período para acompanhar o consumo e comparar os dados disponíveis.",
    Icone: BarChart3,
  },
  {
    titulo: "Rotinas de automação",
    descricao:
      "Planeje atividades recorrentes, distribua as etapas e associe cada rotina aos equipamentos correspondentes.",
    Icone: CalendarClock,
  },
  {
    titulo: "Ambientes em 3D",
    descricao:
      "Explore representações tridimensionais de ambientes e visualize os equipamentos dentro de seu contexto.",
    Icone: Boxes,
  },
  {
    titulo: "Gestão inteligente",
    descricao:
      "Explore representações tridimensionais de ambientes e a partir disto crie ambientes virtuais para organizar a sua empresa para modelo da vida real",
    Icone: Brain,
  },
];

export function SegundaSecaoInicial() {
  return (
    <section aria-labelledby="titulo-recursos-fhive">
      <div className={styles.SegundaSecaoTexto}>
        <h2>Recursos</h2>
        <h1 id="titulo-recursos-fhive">
          Uma plataforma para acompanhar e organizar seus dispositivos IoT
        </h1>
      </div>

      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        loop={true}
        slidesPerView={1}
        slidesPerGroup={1}
        autoplay={{
          delay: 2000,
          disableOnInteraction: false,
        }}
        navigation={true}
        pagination={{ clickable: true }}
        centeredSlides={true}
        breakpoints={{
          640: {
            slidesPerView: 1.5,
            spaceBetween: 16,
          },
          1024: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
        }}
        className={styles.Carrousel}
      >
        {recursos.map(({ titulo, descricao, Icone }) => (
          <SwiperSlide key={titulo}>
            <article className={styles.divCarrousel}>
              <Icone size={28} strokeWidth={1.8} aria-hidden="true" />
              <h2>{titulo}</h2>
              <p>{descricao}</p>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
