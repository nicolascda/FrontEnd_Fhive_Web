import { useState, type SubmitEvent } from "react";
import styles from "./styles.module.css";
import PessoasSentadas from "../../imagens/PessoasSentadas.jpg";
import { LabelPadrao } from "../../componentes/LabelPadrao/index.tsx";
import { BotaoPadrao } from "../../componentes/BotaoPadrao/index.tsx";
import { useNotificacao } from "../../componentes/ModalMensagem/index.tsx";
import { Link, useNavigate } from "react-router-dom";

type RespostaLogin = {
  mensagem?: string;
  erro?: string;
  token?: string;
  usuario?: unknown;
};

export function TelaDeLogin() {
  const navigate = useNavigate();
  const { mostrarMensagem } = useNotificacao();

  const [usuarioDados, setUsuarioDados] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async (
    evento: SubmitEvent<HTMLFormElement>
  ) => {
    evento.preventDefault();

    if (!usuarioDados.trim() || !senha) {
      mostrarMensagem({
        tipo: "erro",
        titulo: "Campos obrigatórios",
        mensagem: "Preencha o nome ou e-mail e a senha.",
      });
      return;
    }

    try {
      setCarregando(true);

      const resposta = await fetch("/usuarios/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: usuarioDados.trim(),
          senha,
        }),
      });

      const dados = (await resposta
        .json()
        .catch(() => ({}))) as RespostaLogin;

      if (!resposta.ok) {
        mostrarMensagem({
          tipo: "erro",
          titulo: "Não foi possível entrar",
          mensagem:
            dados.mensagem ||
            dados.erro ||
            "Nome, e-mail ou senha inválidos.",
        });
        return;
      }

      localStorage.setItem("token", dados.token ?? "");
      localStorage.setItem(
        "usuario",
        JSON.stringify(dados.usuario ?? {})
      );

      setUsuarioDados("");
      setSenha("");

      mostrarMensagem({
        tipo: "sucesso",
        titulo: "Login realizado!",
        mensagem:
          dados.mensagem ||
          "Acesso realizado com sucesso. Seja bem-vindo ao Fhive!",
        textoBotao: "Continuar",
        aoFechar: () => navigate("/configuracoes-equipe"),
      });
    } catch (error) {
      console.error("Erro ao realizar login:", error);

      mostrarMensagem({
        tipo: "erro",
        titulo: "Falha na conexão",
        mensagem:
          "Não foi possível conectar ao servidor. Verifique se o backend está funcionando e tente novamente.",
        textoBotao: "Entendi",
      });
    } finally {
      setCarregando(false);
    }
  };

  return (
    <main className={styles["tela-de-login"]}>
      <section className={styles["container-formulario"]}>
        <form
          className={styles.div}
          onSubmit={handleLogin}
        >
          <h1 className={styles["Titulo"]}>
            Bem-vindo de volta!
          </h1>

          <LabelPadrao
            id="email"
            textoLabel="Nome ou Email"
            textoTitulo="Email"
            tipo="email"
            value={usuarioDados}
            onChange={(evento) =>
              setUsuarioDados(evento.target.value)
            }
          />

          <LabelPadrao
            id="senha"
            textoLabel="Digite sua senha"
            textoTitulo="Senha"
            tipo="password"
            value={senha}
            onChange={(evento) =>
              setSenha(evento.target.value)
            }
          />

          <span
            className={`${styles["EsqueceuASenha"]} ${styles["group"]}`}
          >
            <Link
              to="/recuperar-senha"
              className={styles["link-recuperar-senha"]}
            >
              Esqueceu a senha?
            </Link>
          </span>

          <BotaoPadrao
            textoBotao={carregando ? "Entrando..." : "Entrar"}
            onClick={(evento) => {
              evento.preventDefault();
              evento.currentTarget.form?.requestSubmit();
            }}
            disabled={carregando}
          />

          <p className={styles["NaoTenhoConta"]}>
            <span className={styles.span}>
              Não tem conta?{" "}
            </span>

            <Link
              to="/registrar"
              className={styles["CriarConta"]}
            >
              Crie uma agora
            </Link>
          </p>
        </form>
      </section>

      <section className={styles["container-visual"]}>
        <img
          src={PessoasSentadas}
          alt="Pessoas em uma reunião"
          className={styles["image-colorized"]}
        />
      </section>
    </main>
  );
}