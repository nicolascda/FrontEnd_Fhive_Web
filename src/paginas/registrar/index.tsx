import { useState } from 'react';
import styles from './styles.module.css';
import PessoasSentadas from '../../imagens/PessoasSentadas.jpg';
import { LabelPadrao } from "../../componentes/LabelPadrao/index.tsx";
import { BotaoPadrao } from "../../componentes/BotaoPadrao/index.tsx";
import { Link, useNavigate } from 'react-router-dom';

export function TelaDeRegistrar() {
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [aceitouTermos, setAceitouTermos] = useState(false);

  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);


  const handleRegistrar = async () => {
    try {
  
      if (!nome.trim() || !email.trim() || !senha) {
        alert("Preencha todos os campos.");
        return;
      }

      if (!aceitouTermos) {
        alert("Você precisa concordar com os termos.");
        return;
      }

      setCarregando(true);

      const resposta = await fetch(
        "http://localhost:3000/usuarios",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome: nome.trim(),
            email: email.trim().toLowerCase(),
            senha: senha,
          }),
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        alert(
          `Erro ao cadastrar:\n${dados.mensagem ||
          dados.erro ||
          "Erro desconhecido."
          }`
        );

        return;
      }

      alert(
        `Sucesso!\n${dados.mensagem || "Usuário cadastrado com sucesso."}`
      );

      // Limpa os campos
      setNome("");
      setEmail("");
      setSenha("");
      setAceitouTermos(false);

      // Redireciona para o login
      navigate("/");

    }
    catch (error) {
      console.error("ERRO COMPLETO:", error);

      alert(
        `Erro ao conectar com o backend.\n\n${error}`
      );


    } finally {
      setCarregando(false);
    }
  };


  return (
    <main className={styles['tela-de-registrar']}>

      {/* Formulário */}
      <section className={styles['container-formulario']}>
        <div className={styles.div}>

          <h1 className={styles['Titulo']}>
            Registrar
          </h1>

          <LabelPadrao
            id="nome"
            textoLabel="Higor"
            textoTitulo="Nome"
            tipo="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />

          <LabelPadrao
            id="email"
            textoLabel="higor@gmail.com"
            textoTitulo="Email"
            tipo="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <LabelPadrao
            id="senha"
            textoLabel="1234"
            textoTitulo="Senha"
            tipo="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />

          <label className={styles.divCheckBox}>
            <input
              className={styles.checkBoxRegistrar}
              type="checkbox"
              checked={aceitouTermos}
              onChange={(e) => setAceitouTermos(e.target.checked)}
            />

            <p>Concordo com os termos</p>
          </label>

          {/* {mensagem && (
            <p className={styles.mensagem}>
              {mensagem}
            </p>
          )} */}

          <BotaoPadrao
            textoBotao={carregando ? "Criando..." : "Criar Conta"}
            onClick={handleRegistrar}
          />

          <p className={styles.NaoTenhoConta}>
            <Link to="/login" className={styles.CriarConta}>
              Voltar ao login
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