import styles from "./styles.module.css"

type BotaoPadraoProps = {
    textoBotao: string;
    cor?: "Marrom" | "MarromClaro"
} & React.ComponentProps<'button'>


export function BotaoPadrao({
    textoBotao,
    color = 'Marrom',
    ...props
}: BotaoPadraoProps) {
    return (
        <>
            <button type="button" className={`${styles.BotaoEntrar} ${styles.Marrom}`} {...props}>
                {textoBotao}
            </button>
        </>
    );
}