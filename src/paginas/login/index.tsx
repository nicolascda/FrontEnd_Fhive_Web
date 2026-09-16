import { useState } from 'react';
import styles from './styles.module.css';
import PessoasSentadas from '../../imagens/PessoasSentadas.jpg';
import { LabelPadrao } from "../../componentes/LabelPadrao/index.tsx";
import { BotaoPadrao } from "../../componentes/BotaoPadrao/index.tsx";
import { Link, useNavigate } from 'react-router-dom';

export function TelaDeLogin() {

  const navigate = useNavigate();

   const [usuarioDados, setUsuarioDados] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async () => {

    // Verifica se os campos foram preenchidos
    if (!usuarioDados.trim() || !senha) {
      alert("Preencha o nome ou e-mail e a senha.");
      return;
    }

    try {

      setCarregando(true);

      const resposta = await fetch(
        "/api/usuarios",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            identificador: usuarioDados.trim(),
            senha: senha,
          }),
        }
      );

      const dados = await resposta.json();

      // Backend retornou erro
      if (!resposta.ok) {

        alert(
          dados.mensagem ||
          dados.erro ||
          "Nome ou e-mail ou senha inválidos."
        );

        return;
      }

      alert(
        dados.mensagem ||
        "Login realizado com sucesso!"
      );

      // Salva o token
      localStorage.setItem(
        "token",
        dados.token
      );

      // Salva os dados do usuário
      localStorage.setItem(
        "usuario",
        JSON.stringify(dados.usuario)
      );

      // Apenas para você verificar no console
      console.log("Token:", dados.token);
      console.log("Usuário:", dados.usuario);

      // Limpa os campos
      setUsuarioDados("");
      setSenha("");

      // Vai para a página inicial
      navigate("/");

    } catch (error) {

      console.error(
        "Erro ao realizar login:",
        error
      );

      alert(
        "Não foi possível conectar ao backend.\n\n" +
        "Verifique se o servidor está rodando."
      );

    } finally {

      setCarregando(false);

    }
  };


  return (
    <main className={styles['tela-de-login']}>

      <section className={styles['container-formulario']}>

        <div className={styles.div}>

          <h1 className={styles['Titulo']}>
            Bem-vindo de volta!
          </h1>


          <LabelPadrao
            id="email"
            textoLabel="Nome ou Email"
            textoTitulo="Email"
            tipo="email"
            value={usuarioDados}
            onChange={(e) => setUsuarioDados(e.target.value)}
          />


          <LabelPadrao
            id="senha"
            textoLabel="Digite sua senha"
            textoTitulo="Senha"
            tipo="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />


          <span className={`${styles['EsqueceuASenha']} ${styles['group']}`}>
            <a>Esqueceu a senha?</a>
          </span>


          <BotaoPadrao
            textoBotao={
              carregando
                ? "Entrando..."
                : "Entrar"
            }
            onClick={handleLogin}
            disabled={carregando}
          />


          <p className={styles['NaoTenhoConta']}>

            <span className={styles.span}>
              Não tem conta?{' '}
            </span>

            <Link
              to="/registrar"
              className={styles['CriarConta']}
            >
              Crie uma agora
            </Link>

          </p>

        </div>

      </section>


      <section className={styles['container-visual']}>

        <img
          src={PessoasSentadas}
          alt="Pessoas em uma reunião"
          className={styles['image-colorized']}
        />

      </section>

    </main>
  );
}
