import styles from './styles.module.css';
import type { ComponentProps, ReactNode } from 'react';

type CardDispositivoProps = {
  icone: ReactNode;
  texto: string;
  informacao?: string;
} & ComponentProps<"div">;

export function CardDispositivo({
  icone,
  texto,
  informacao = 'i',
  ...props
}: CardDispositivoProps) {
  return (
    <div
      className={`${styles.dispositivo}`}
      {...props}
    >
      <div className={`${styles.dispositivoIcone}`}>
        {icone}

        <div className={`${styles.dispositivoSinal}`}>
          <svg
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 8.5C7.5 3.5 16.5 3.5 22 8.5"
              fill="none"
              stroke="#a85b16"
              strokeWidth="2"
              strokeLinecap="round"
            />

            <path
              d="M5.5 12C9 8.8 15 8.8 18.5 12"
              fill="none"
              stroke="#a85b16"
              strokeWidth="2"
              strokeLinecap="round"
            />

            <path
              d="M9 15.5C10.8 13.8 13.2 13.8 15 15.5"
              fill="none"
              stroke="#a85b16"
              strokeWidth="2"
              strokeLinecap="round"
            />

            <circle
              cx="12"
              cy="19"
              r="1.5"
              fill="#a85b16"
            />
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