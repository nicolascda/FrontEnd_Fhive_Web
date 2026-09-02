import styles from './styles.module.css';

type LabelPadraoProps = {
    id: string;
    textoLabel?: string;
    textoTitulo: string;
    tipo: string;
} & React.ComponentProps<'div'>

export function LabelPadrao({
    id,
    textoLabel,
    textoTitulo,
    tipo,
    ...rest

}: LabelPadraoProps) {
    return (
        <>
            <div className={`${styles.Campo}`} {...rest}>
                <label htmlFor={id} className={`${styles.TextoCampo}`}>
                    {textoTitulo}
                </label>

                <input
                    id={id}
                    type={tipo}
                    placeholder={textoLabel}
                    className={`${styles.CampoInput}`}
                  />
            </div>
           
        </>
    );

}