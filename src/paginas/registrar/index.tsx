import { useState, type SubmitEvent } from "react";
import styles from "./styles.module.css";
import PessoasSentadas from "../../imagens/PessoasSentadas.jpg";
import { LabelPadrao } from "../../componentes/LabelPadrao/index.tsx";
import { BotaoPadrao } from "../../componentes/BotaoPadrao/index.tsx";
import { useNotificacao } from "../../componentes/ModalMensagem/index.tsx";
import { Link, useNavigate } from "react-router-dom";

type EtapaCadastro = "dados" | "codigo" | "concluido";

type RespostaAPI = {
  mensagem?: string;
  erro?: string;
};

export function TelaDeRegistrar() {
  const navigate = useNavigate();
  const { mostrarMensagem } = useNotificacao();

  const [etapa, setEtapa] = useState<EtapaCadastro>("dados");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [codigo, setCodigo] = useState("");
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const enviarRequisicao = async (
    rota: string,
    corpo: Record<string, string>
  ): Promise<RespostaAPI> => {
    const resposta = await fetch(rota, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(corpo),
    });

    const dados = (await resposta
      .json()
      .catch(() => ({}))) as RespostaAPI;

    if (!resposta.ok) {
      throw new Error(
        dados.mensagem ||
          dados.erro ||
          "Não foi possível concluir o cadastro."
      );
    }

    return dados;
  };

  const handleRegistrar = async () => {
    if (!nome.trim() || !email.trim() || !senha) {
      mostrarMensagem({
        tipo: "erro",
        titulo: "Campos obrigatórios",
        mensagem: "Preencha o nome, o e-mail e a senha.",
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      mostrarMensagem({
        tipo: "erro",
        titulo: "E-mail inválido",
        mensagem: "Confira o endereço de e-mail informado.",
      });
      return;
    }

    if (!aceitouTermos) {
      mostrarMensagem({
        tipo: "erro",
        titulo: "Termos de uso",
        mensagem:
          "Você precisa concordar com os termos para continuar.",
      });
      return;
    }

    try {
      setCarregando(true);

      const dados = await enviarRequisicao("/usuarios", {
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        senha,
      });

      setEtapa("codigo");

      mostrarMensagem({
        tipo: "sucesso",
        titulo: "Código enviado!",
        mensagem:
          dados.mensagem ||
          "Enviamos um código de confirmação para seu e-mail. Confira sua caixa de entrada.",
        textoBotao: "Continuar",
      });
    } catch (error) {
      mostrarMensagem({
        tipo: "erro",
        titulo: "Não foi possível iniciar o cadastro",
        mensagem:
          error instanceof Error
            ? error.message
            : "Ocorreu um erro ao tentar realizar seu cadastro.",
      });
    } finally {
      setCarregando(false);
    }
  };

  const handleConfirmarCodigo = async () => {
    if (!/^\d{6}$/.test(codigo.trim())) {
      mostrarMensagem({
        tipo: "erro",
        titulo: "Código inválido",
        mensagem:
          "Digite o código de confirmação de 6 dígitos recebido por e-mail.",
      });
      return;
    }

    try {
      setCarregando(true);

      const dados = await enviarRequisicao(
        "/usuarios/confirmarEmail",
        {
          email: email.trim().toLowerCase(),
          codigo: codigo.trim(),
        }
      );

      setEtapa("concluido");
      setSenha("");
      setCodigo("");

      mostrarMensagem({
        tipo: "sucesso",
        titulo: "Cadastro confirmado!",
        mensagem:
          dados.mensagem ||
          "Seu e-mail foi confirmado e sua conta está pronta para ser acessada.",
        textoBotao: "Ir para o login",
        aoFechar: () => navigate("/login"),
      });
    } catch (error) {
      mostrarMensagem({
        tipo: "erro",
        titulo: "Não foi possível confirmar",
        mensagem:
          error instanceof Error
            ? error.message
            : "O código de confirmação não é válido.",
      });
    } finally {
      setCarregando(false);
    }
  };

  const handleSubmit = async (
    evento: SubmitEvent<HTMLFormElement>
  ) => {
    evento.preventDefault();

    if (carregando) return;

    if (etapa === "dados") {
      await handleRegistrar();
    } else if (etapa === "codigo") {
      await handleConfirmarCodigo();
    } else {
      navigate("/login");
    }
  };

  const titulo = {
    dados: "Registrar",
    codigo: "Confirmar e-mail",
    concluido: "Cadastro concluído",
  }[etapa];

  return (
    <main className={styles["tela-de-registrar"]}>
      <section className={styles["container-formulario"]}>
        <form
          className={styles.div}
          onSubmit={handleSubmit}
          noValidate
        >
          <h1 className={styles.Titulo}>{titulo}</h1>

          {etapa === "dados" && (
            <>
              <LabelPadrao
                id="nome"
                textoLabel="Digite seu nome"
                textoTitulo="Nome"
                tipo="text"
                value={nome}
                onChange={(evento) =>
                  setNome(evento.target.value)
                }
                maxLength={100}
                autoComplete="name"
                required
              />

              <LabelPadrao
                id="email"
                textoLabel="Digite seu e-mail"
                textoTitulo="Email"
                tipo="email"
                value={email}
                onChange={(evento) =>
                  setEmail(evento.target.value)
                }
                maxLength={150}
                autoComplete="email"
                required
              />

              <LabelPadrao
                id="senha"
                textoLabel="Crie uma senha"
                textoTitulo="Senha"
                tipo="password"
                value={senha}
                onChange={(evento) =>
                  setSenha(evento.target.value)
                }
                autoComplete="new-password"
                required
              />

              <label className={styles.divCheckBox}>
                <input
                  className={styles.checkBoxRegistrar}
                  type="checkbox"
                  checked={aceitouTermos}
                  onChange={(evento) =>
                    setAceitouTermos(evento.target.checked)
                  }
                />

                <p>Concordo com os termos</p>
              </label>
            </>
          )}

          {etapa === "codigo" && (
            <>
              <p className={styles.textoEtapa}>
                Informe o código de 6 dígitos enviado para{" "}
                <strong>{email}</strong>. O código expira em 10 minutos.
              </p>

              <label
                className={styles.grupoCodigo}
                htmlFor="codigo-confirmacao"
              >
                Código de confirmação

                <input
                  id="codigo-confirmacao"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  placeholder="000000"
                  value={codigo}
                  onChange={(evento) =>
                    setCodigo(
                      evento.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6)
                    )
                  }
                  required
                />
              </label>

              <button
                type="button"
                className={styles.linkEtapa}
                onClick={() => setEtapa("dados")}
                disabled={carregando}
              >
                Voltar e revisar os dados
              </button>
            </>
          )}

          {etapa === "concluido" && (
            <p className={styles.textoEtapa}>
              Seu e-mail foi confirmado. Agora você pode entrar na sua conta.
            </p>
          )}

          {etapa !== "concluido" ? (
            <BotaoPadrao
              textoBotao={
                carregando
                  ? "Aguarde..."
                  : etapa === "dados"
                    ? "Enviar código"
                    : "Confirmar código"
              }
              type="submit"
              disabled={carregando}
            />
          ) : (
            <BotaoPadrao
              textoBotao="Ir para o login"
              onClick={() => navigate("/login")}
            />
          )}

          <p className={styles.NaoTenhoConta}>
            <Link
              to="/login"
              className={styles.CriarConta}
            >
              Voltar ao login
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