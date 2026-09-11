import styles from "./styles.module.css";

type BotaoPadraoProps = {
    textoBotao: string;
    cor?: "Marrom" | "MarromClaro"
} & React.ComponentProps<'button'>


export function BotaoPadrao({
    textoBotao,
    cor = 'Marrom',
    ...props
}: BotaoPadraoProps) {
    return (
        <>
            <button type="button" className={`${styles.BotaoEntrar} ${styles[cor]}`} {...props}>
                {textoBotao}
            </button>
        </>
    );
}