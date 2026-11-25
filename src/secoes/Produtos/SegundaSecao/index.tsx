import styles from "./style.module.css";
import { FaRobot, FaUsers } from "react-icons/fa";
import { CardCompra } from "../../../componentes/CardCompra";

export function SegundaSecaoProdutos() {
  return (
    <section className={styles.SecaoCompraProdutos}>
      <h1>Possibilidades de uso</h1>
      <p className={styles.SubtituloPlanos}>
        Veja como os recursos da Fhive podem apoiar diferentes contextos. Os perfis abaixo são exemplos de aplicação da plataforma.
      </p>

      <div className={styles.MultiplosCardsProdutos}>
        <CardCompra
          tituloCompra="Uso pessoal"
          textoCompra1="Reúna dispositivos conectados em um só ambiente."
          textoCompra2="Consulte informações e status dos equipamentos cadastrados."
          textoCompra3="Uma forma simples de começar a explorar a gestão IoT."
          textoRodape="Perfil demonstrativo"
        />

        <CardCompra
          icone={FaUsers}
          tituloCompra="Equipes"
          textoCompra1="Organize equipamentos por equipe e ambiente."
          textoCompra2="Compartilhe a gestão com os integrantes autorizados."
          textoCompra3="Estruture rotinas e acompanhe atividades em conjunto."
          textoRodape="Perfil demonstrativo"
        />

        <CardCompra
          icone={FaRobot}
          corIcone="#a85b16"
          tituloCompra="Operações"
          textoCompra1="Acompanhe equipamentos e indicadores da operação."
          textoCompra2="Explore recursos de análise e visualização em 3D."
          textoCompra3="Adapte a organização do ambiente às necessidades do projeto."
          textoRodape="Perfil demonstrativo"
        />
      </div>
    </section>
  );
}
