import styles from "./style.module.css";
import { FaRobot } from "react-icons/fa";
import { CardCompra } from "../../../componentes/CardCompra";



export function SegundaSecaoProdutos() {
    return (
        <>
            <section className={styles.SecaoCompraProdutos}>
                <h1> Planos Disponíveis</h1>

                <div className={styles.MultiplosCardsProdutos}>
                    <CardCompra icone={FaRobot} 
                    corIcone="red" 
                    tituloCompra="123" 
                    textoCompra1="12345" 
                    textoCompra2="12345678" 
                    textoCompra3="123456789" 
                    preco={123.42} 
                    />

                    <CardCompra icone={FaRobot} 
                    corIcone="red" 
                    tituloCompra="123" 
                    textoCompra1="12345" 
                    textoCompra2="12345678" 
                    textoCompra3="123456789" 
                    preco={123.42} 
                    />

                    <CardCompra 
                    tituloCompra="123" 
                    textoCompra1="12345" 
                    textoCompra2="12345678" 
                    textoCompra3="123456789" 
                    preco={123.42} 
                    />

                </div>
            </section>
        </>
    )
}