import styles from "./styles.module.css";
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export function SegundaSecaoInicial() {
    return (
        <>
            <section>
                <div className={`${styles.SegundaSecaoTexto}`}>
                    <h2>
                        Produtos
                    </h2>
                    <h1> Saiba mais sobre os produtos e serviços dentro do Fhive</h1>
                </div>

                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    // rewind={true}
                    loop={true}
                    // loopAdditionalSlides={7} 
                    autoplay={{
                        delay: 5000,
                        disableOnInteraction: false,
                    }}
                    navigation={true}
                    centeredSlides={true}

                    breakpoints={{
                        1024: {
                            slidesPerView: 3.2, // Mostra 4 cards inteiros e 40% do quinto card nas pontas!
                            spaceBetween: 20
                        }
                    }}
                    className={styles.Carrousel}
                >
                    {/* Cada item DEVE estar obrigatoriamente dentro de um SwiperSlide */}
                    <SwiperSlide>
                        <div className={`${styles.divCarrousel}`}>
                            <svg xmlns="http://www.w3.org/2000/svg"
                                width="24" height="24" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                color="#cf1313"
                                className="lucide lucide-wifi">
                                <path d="M12 20h.01" />
                                <path d="M2 8.82a15 15 0 0 1 20 0" />
                                <path d="M5 12.859a10 10 0 0 1 14 0" /><path d="M8.5 16.429a5 5 0 0 1 7 0" />
                            </svg>

                            <h2>Serviços de Automação</h2>

                            <p> Crie soluções de integência espacial IoT  de ultima geração replicando espaços físicos reais e criando ambientes conectados</p>

                            <Link
                                to="/tutorial"
                                className={styles.botaoInicial}
                            >
                                Saiba Mais
                            </Link>
                        </div>
                    </SwiperSlide>

                    <SwiperSlide>
                        <div className={`${styles.divCarrousel}`}>
                            <svg xmlns="http://www.w3.org/2000/svg"
                                width="24" height="24" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                color="#cf1313"
                                className="lucide lucide-wifi">
                                <path d="M12 20h.01" />
                                <path d="M2 8.82a15 15 0 0 1 20 0" />
                                <path d="M5 12.859a10 10 0 0 1 14 0" /><path d="M8.5 16.429a5 5 0 0 1 7 0" />
                            </svg>

                            <h2>Serviços de Automação</h2>

                            <p> Crie soluções de integência espacial IoT  de ultima geração replicando espaços físicos reais e criando ambientes conectados</p>

                            <Link
                                to="/tutorial"
                                className={styles.botaoInicial}
                            >
                                Saiba Mais
                            </Link>
                        </div>
                    </SwiperSlide>

                    <SwiperSlide>
                        <div className={`${styles.divCarrousel}`}>
                            <svg xmlns="http://www.w3.org/2000/svg"
                                width="24" height="24" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                color="#cf1313"
                                className="lucide lucide-wifi">
                                <path d="M12 20h.01" />
                                <path d="M2 8.82a15 15 0 0 1 20 0" />
                                <path d="M5 12.859a10 10 0 0 1 14 0" /><path d="M8.5 16.429a5 5 0 0 1 7 0" />
                            </svg>

                            <h2>Serviços de Automação</h2>

                            <p> Crie soluções de integência espacial IoT  de ultima geração replicando espaços físicos reais e criando ambientes conectados</p>

                            <Link
                                to="/tutorial"
                                className={styles.botaoInicial}
                            >
                                Saiba Mais
                            </Link>
                        </div>
                    </SwiperSlide>

                    <SwiperSlide>
                        <div className={`${styles.divCarrousel}`}>
                            <svg xmlns="http://www.w3.org/2000/svg"
                                width="24" height="24" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                color="#cf1313"
                                className="lucide lucide-wifi">
                                <path d="M12 20h.01" />
                                <path d="M2 8.82a15 15 0 0 1 20 0" />
                                <path d="M5 12.859a10 10 0 0 1 14 0" /><path d="M8.5 16.429a5 5 0 0 1 7 0" />
                            </svg>

                            <h2>Serviços de Automação</h2>

                            <p> Crie soluções de integência espacial IoT  de ultima geração replicando espaços físicos reais e criando ambientes conectados</p>

                            <Link
                                to="/tutorial"
                                className={styles.botaoInicial}
                            >
                                Saiba Mais
                            </Link>
                        </div>
                    </SwiperSlide>

                    <SwiperSlide>
                        <div className={`${styles.divCarrousel}`}>
                            <svg xmlns="http://www.w3.org/2000/svg"
                                width="24" height="24" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                color="#cf1313"
                                className="lucide lucide-wifi">
                                <path d="M12 20h.01" />
                                <path d="M2 8.82a15 15 0 0 1 20 0" />
                                <path d="M5 12.859a10 10 0 0 1 14 0" /><path d="M8.5 16.429a5 5 0 0 1 7 0" />
                            </svg>

                            <h2>Serviços de Automação</h2>

                            <p> Crie soluções de integência espacial IoT  de ultima geração replicando espaços físicos reais e criando ambientes conectados</p>

                            <Link
                                to="/tutorial"
                                className={styles.botaoInicial}
                            >
                                Saiba Mais
                            </Link>
                        </div>
                    </SwiperSlide>

                    <SwiperSlide>
                        <div className={`${styles.divCarrousel}`}>
                            <svg xmlns="http://www.w3.org/2000/svg"
                                width="24" height="24" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                color="#cf1313"
                                className="lucide lucide-wifi">
                                <path d="M12 20h.01" />
                                <path d="M2 8.82a15 15 0 0 1 20 0" />
                                <path d="M5 12.859a10 10 0 0 1 14 0" /><path d="M8.5 16.429a5 5 0 0 1 7 0" />
                            </svg>

                            <h2>Serviços de Automação</h2>

                            <p> Crie soluções de integência espacial IoT  de ultima geração replicando espaços físicos reais e criando ambientes conectados</p>

                            <Link
                                to="/tutorial"
                                className={styles.botaoInicial}
                            >
                                Saiba Mais
                            </Link>
                        </div>
                    </SwiperSlide>

                    <SwiperSlide>
                        <div className={`${styles.divCarrousel}`}>
                            <svg xmlns="http://www.w3.org/2000/svg"
                                width="24" height="24" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                color="#cf1313"
                                className="lucide lucide-wifi">
                                <path d="M12 20h.01" />
                                <path d="M2 8.82a15 15 0 0 1 20 0" />
                                <path d="M5 12.859a10 10 0 0 1 14 0" /><path d="M8.5 16.429a5 5 0 0 1 7 0" />
                            </svg>

                            <h2>Serviços de Automação</h2>

                            <p> Crie soluções de integência espacial IoT  de ultima geração replicando espaços físicos reais e criando ambientes conectados</p>

                            <Link
                                to="/tutorial"
                                className={styles.botaoInicial}
                            >
                                Saiba Mais
                            </Link>
                        </div>
                    </SwiperSlide>




                </Swiper>


            </section>
        </>
    )
}