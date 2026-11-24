
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";
import styles from "./styles.module.css";

export type TipoMensagem = "sucesso" | "erro";

type DadosMensagem = {
  tipo: TipoMensagem;
  titulo: string;
  mensagem: string;
  textoBotao?: string;
  aoFechar?: () => void;
};

type ContextoMensagem = {
  mostrarMensagem: (dados: DadosMensagem) => void;
  limparMensagem: () => void;
};

const MensagemContexto = createContext<
  ContextoMensagem | undefined
>(undefined);

export function useNotificacao() {
  const contexto = useContext(MensagemContexto);

  if (!contexto) {
    throw new Error(
      "useNotificacao deve ser usado dentro de NotificacaoProvider."
    );
  }

  return contexto;
}

type NotificacaoProviderProps = {
  children: ReactNode;
};

export function NotificacaoProvider({
  children,
}: NotificacaoProviderProps) {
  const [notificacao, setNotificacao] =
    useState<DadosMensagem | null>(null);

  const mostrarMensagem = useCallback(
    (dados: DadosMensagem) => {
      setNotificacao(dados);
    },
    []
  );

  const limparMensagem = useCallback(() => {
    const aoFechar = notificacao?.aoFechar;

    setNotificacao(null);
    aoFechar?.();
  }, [notificacao]);

  useEffect(() => {
    if (!notificacao) return;

    const tratarTecla = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") {
        limparMensagem();
      }
    };

    window.addEventListener("keydown", tratarTecla);

    return () => {
      window.removeEventListener("keydown", tratarTecla);
    };
  }, [notificacao, limparMensagem]);

  return (
    <MensagemContexto.Provider
      value={{
        mostrarMensagem,
        limparMensagem,
      }}
    >
      {children}

      {notificacao && (
        <div className={styles.fundoModal}>
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-mensagem"
            aria-describedby="texto-mensagem"
          >
            <button
              type="button"
              className={styles.fechar}
              onClick={limparMensagem}
              aria-label="Fechar mensagem"
            >
              <X size={20} />
            </button>

            <div
              className={`${styles.icone} ${
                notificacao.tipo === "sucesso"
                  ? styles.iconeSucesso
                  : styles.iconeErro
              }`}
            >
              {notificacao.tipo === "sucesso" ? (
                <CheckCircle2
                  size={34}
                  strokeWidth={2}
                />
              ) : (
                <AlertCircle
                  size={34}
                  strokeWidth={2}
                />
              )}
            </div>

            <h2
              id="titulo-mensagem"
              className={styles.titulo}
            >
              {notificacao.titulo}
            </h2>

            <p
              id="texto-mensagem"
              className={styles.mensagem}
            >
              {notificacao.mensagem}
            </p>

            <button
              type="button"
              className={styles.botao}
              onClick={limparMensagem}
              autoFocus
            >
              {notificacao.textoBotao || "Entendi"}
            </button>
          </section>
        </div>
      )}
    </MensagemContexto.Provider>
  );
}
