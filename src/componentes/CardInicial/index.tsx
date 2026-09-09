import styles from './styles.module.css';
import type { ComponentProps, ReactNode } from 'react';

type CardInicialProps = {
  icone: ReactNode;
  texto: string;
  informacao?: string;
} & ComponentProps<"div">;

export function CardInicial({
  icone,
  texto,
  informacao = 'i',
  ...props
}: CardInicialProps) {
  return (
    <div className={`${styles.dispositivo}`} {...props}>
      <div className={`${styles.IconeCompleto}`}>
        <div className={`${styles.Icone}`}>
          {icone}
        </div>

        <div className={`${styles.IconeWifi}`}>
          <svg xmlns="http://www.w3.org/2000/svg" 
            width="24" height="24" viewBox="0 0 24 24" 
            fill="none" stroke="currentColor" 
            stroke-width="2" 
            stroke-linecap="round" 
            stroke-linejoin="round"
            color="#ffffff" 
            className="lucide lucide-wifi">
            <path d="M12 20h.01" />
            <path d="M2 8.82a15 15 0 0 1 20 0" />
            <path d="M5 12.859a10 10 0 0 1 14 0" /><path d="M8.5 16.429a5 5 0 0 1 7 0" />
          </svg>
        </div>

      </div>


      <span className={`${styles.dispositivoTexto}`}>
        {texto}
      </span>

      <span className={`${styles.dispositivoInfo}`}>
        {informacao}
      </span>
    </div>
  );
}