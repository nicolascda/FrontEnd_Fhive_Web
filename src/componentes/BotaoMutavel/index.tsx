import styles from "./styles.module.css";

type BotaoMutavelProps = {
    textoBotao: string;
    pressionado?: boolean;
} & React.ComponentProps<'button'>

export function BotaoMutavel({
    textoBotao,
    pressionado = false,
    ...props
}: BotaoMutavelProps) {
    return (
        <>
            <button className={`${pressionado ? styles.BotoesMutavel : styles.BotoesMutavelAtivo}`} {...props}> {textoBotao} </button>
        </>
    )

}