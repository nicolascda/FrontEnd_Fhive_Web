import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { CalendarDays, Clock3, Info, ListOrdered, Plus, Save, X, ChevronUp, ChevronDown, Trash2, Factory, Layers3 } from "lucide-react";
import { BarraNavegacaoLogado } from "../../componentes/BarraNavegacaoLogado";
import { CardRotina } from "../../componentes/CardRotina";
import { CHAVE_AMBIENTE, CHAVE_EQUIPE, lerRotinasEquipe, salvarRotinasEquipe } from "../../dados/rotinasEquipe";
import type { AcaoRotinaLocal, MaquinaLocal, RotinaLocal } from "../rotinaAparelhos/tipos";
import styles from "./styles.module.css";

const DIAS = [
  { valor: "Seg", nome: "Segunda-feira" },
  { valor: "Ter", nome: "Terça-feira" },
  { valor: "Qua", nome: "Quarta-feira" },
  { valor: "Qui", nome: "Quinta-feira" },
  { valor: "Sex", nome: "Sexta-feira" },
  { valor: "Sáb", nome: "Sábado" },
  { valor: "Dom", nome: "Domingo" },
];

type FormularioRotina = Omit<RotinaLocal, "id"> & { id: string | null };

function criarId() {
  return `rotina-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Lê o nome da equipe salvo localmente; o ID da rota continua sendo a identidade principal. */
function lerNomeEquipe(equipeId: string) {
  try {
    const salvo = window.localStorage.getItem(`${CHAVE_EQUIPE}${equipeId}`);
    if (!salvo) return equipeId === "demo-equipe" ? "Equipe de demonstração" : `Equipe ${equipeId}`;
    const equipe = JSON.parse(salvo) as { id?: string; nome?: string };
    return equipe.id === equipeId && equipe.nome ? equipe.nome : `Equipe ${equipeId}`;
  } catch {
    return `Equipe ${equipeId}`;
  }
}

/** Conta quantos equipamentos da equipe têm esta rotina aplicada. */
function contarMaquinasVinculadas(equipeId: string, rotinaId: string) {
  try {
    const salvo = window.localStorage.getItem(`${CHAVE_AMBIENTE}${equipeId}`);
    if (!salvo) return 0;
    const maquinas: MaquinaLocal[] = JSON.parse(salvo);
    return maquinas.filter((maquina) => maquina.equipeId === equipeId && maquina.rotina?.id === rotinaId).length;
  } catch {
    return 0;
  }
}

/** Mantém o formulário editável e permite criar várias ações em uma sequência horária. */
function formularioVazio(): FormularioRotina {
  return {
    id: null,
    nome: "",
    descricao: "",
    horarioInicial: "08:00",
    horarioFinal: "17:00",
    diasSemana: ["Seg", "Ter", "Qua", "Qui", "Sex"],
    acoes: [{ id: criarId(), horario: "08:00", nome: "", descricao: "" }],
  };
}

export function TelaRotinas() {
  const { equipeId: parametroEquipeId } = useParams<{ equipeId: string }>();
  const equipeId = parametroEquipeId || "demo-equipe";
  const equipeNome = useMemo(() => lerNomeEquipe(equipeId), [equipeId]);

  // O estado carrega a equipe junto das rotinas para não gravar dados da equipe anterior durante a navegação.
  const [estadoRotinas, setEstadoRotinas] = useState(() => ({
    equipeId,
    rotinas: lerRotinasEquipe(equipeId),
  }));
  const [modalAberto, setModalAberto] = useState(false);
  const [formulario, setFormulario] = useState<FormularioRotina>(formularioVazio);
  const [mensagemErro, setMensagemErro] = useState("");

  const rotinas = estadoRotinas.equipeId === equipeId ? estadoRotinas.rotinas : lerRotinasEquipe(equipeId);

  useEffect(() => {
    setEstadoRotinas({ equipeId, rotinas: lerRotinasEquipe(equipeId) });
    setModalAberto(false);
    setMensagemErro("");
  }, [equipeId]);

  // Persiste a lista central e atualiza as rotinas já aplicadas às máquinas desta equipe.
  useEffect(() => {
    if (estadoRotinas.equipeId !== equipeId) return;
    salvarRotinasEquipe(equipeId, estadoRotinas.rotinas);
  }, [estadoRotinas, equipeId]);

  const atualizarRotinas = (atualizar: (atuais: RotinaLocal[]) => RotinaLocal[]) => {
    setEstadoRotinas((atual) => ({
      equipeId,
      rotinas: atualizar(atual.equipeId === equipeId ? atual.rotinas : lerRotinasEquipe(equipeId)),
    }));
  };

  const abrirCriacao = () => {
    setFormulario(formularioVazio());
    setMensagemErro("");
    setModalAberto(true);
  };

  const abrirEdicao = (rotina: RotinaLocal) => {
    setFormulario({
      ...rotina,
      id: rotina.id,
      diasSemana: [...(rotina.diasSemana || [])],
      acoes: (rotina.acoes || []).map((acao) => ({ ...acao })),
    });
    setMensagemErro("");
    setModalAberto(true);
  };

  const atualizarAcao = (id: string, campos: Partial<AcaoRotinaLocal>) => {
    setFormulario((atual) => ({
      ...atual,
      acoes: atual.acoes.map((acao) => acao.id === id ? { ...acao, ...campos } : acao),
    }));
  };

  const adicionarAcao = () => {
    setFormulario((atual) => ({
      ...atual,
      acoes: [...atual.acoes, {
        id: criarId(),
        horario: atual.acoes.at(-1)?.horario || atual.horarioInicial,
        nome: "",
        descricao: "",
      }],
    }));
    setMensagemErro("");
  };

  const moverAcao = (indice: number, direcao: -1 | 1) => {
    setFormulario((atual) => {
      const destino = indice + direcao;
      if (destino < 0 || destino >= atual.acoes.length) return atual;
      const acoes = [...atual.acoes];
      [acoes[indice], acoes[destino]] = [acoes[destino], acoes[indice]];
      return { ...atual, acoes };
    });
  };

  const salvarFormulario = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();

    if (!formulario.nome.trim()) {
      setMensagemErro("Informe um nome para a rotina.");
      return;
    }
    if (!formulario.diasSemana.length) {
      setMensagemErro("Selecione pelo menos um dia da semana.");
      return;
    }
    if (formulario.horarioFinal < formulario.horarioInicial) {
      setMensagemErro("O horário final precisa ser posterior ao inicial.");
      return;
    }
    if (!formulario.acoes.length) {
      setMensagemErro("Adicione pelo menos uma ação à rotina.");
      return;
    }

    for (let indice = 0; indice < formulario.acoes.length; indice += 1) {
      const acao = formulario.acoes[indice];
      if (!acao.nome.trim()) {
        setMensagemErro(`Informe o nome da ação ${indice + 1}.`);
        return;
      }
      if (acao.horario < formulario.horarioInicial || acao.horario > formulario.horarioFinal) {
        setMensagemErro(`A ação ${indice + 1} precisa ficar entre o início e o fim da rotina.`);
        return;
      }
      if (indice > 0 && acao.horario < formulario.acoes[indice - 1].horario) {
        setMensagemErro("As ações precisam estar em ordem cronológica. Use as setas para reorganizar.");
        return;
      }
    }

    const rotinaSalva: RotinaLocal = {
      id: formulario.id || `${equipeId}-${criarId()}`,
      nome: formulario.nome.trim(),
      descricao: formulario.descricao.trim(),
      horarioInicial: formulario.horarioInicial,
      horarioFinal: formulario.horarioFinal,
      diasSemana: DIAS.filter((dia) => formulario.diasSemana.includes(dia.valor)).map((dia) => dia.valor),
      acoes: formulario.acoes.map((acao) => ({
        ...acao,
        nome: acao.nome.trim(),
        descricao: acao.descricao.trim(),
      })),
    };

    atualizarRotinas((atuais) => {
      const existe = atuais.some((rotina) => rotina.id === rotinaSalva.id);
      return existe
        ? atuais.map((rotina) => rotina.id === rotinaSalva.id ? rotinaSalva : rotina)
        : [...atuais, rotinaSalva];
    });
    setModalAberto(false);
    setMensagemErro("");
  };

  const excluirRotina = (rotina: RotinaLocal) => {
    const confirmacao = window.confirm(`Excluir a rotina "${rotina.nome}"? Ela também será removida das máquinas em que estiver aplicada.`);
    if (!confirmacao) return;
    atualizarRotinas((atuais) => atuais.filter((item) => item.id !== rotina.id));
  };

  return (
    <div className={styles.pagina}>
      <BarraNavegacaoLogado equipeAtualNome={equipeNome} equipeAtualId={equipeId} />

      <header className={styles.cabecalho}>
        <div>
          <span className={styles.miniTitulo}>GESTÃO DE ROTINAS · {equipeId}</span>
          <h1>Rotina dos aparelhos</h1>
        </div>
        <div className={styles.acoesCabecalho}>
          <Link to={`/rotina-aparelhos/${encodeURIComponent(equipeId)}`} className={styles.botaoAmbiente}>
            <Factory size={16} /> Abrir ambiente 3D
          </Link>
          <button type="button" className={styles.botaoAdicionar} onClick={abrirCriacao} aria-label="Criar nova rotina" title="Criar nova rotina">
            <Plus size={24} />
          </button>
        </div>
      </header>

      <main className={styles.conteudo}>
        <div className={styles.introducao}>
          <div>
            <h2>Rotinas da equipe</h2>
            <p>Crie sequências de trabalho e depois selecione uma rotina para aplicá-la a cada máquina no ambiente 3D.</p>
          </div>
          <span className={styles.contadorRotinas}>{rotinas.length} {rotinas.length === 1 ? "rotina" : "rotinas"}</span>
        </div>

        {rotinas.length > 0 ? (
          <section className={styles.gradeRotinas} aria-label="Rotinas criadas para esta equipe">
            {rotinas.map((rotina) => (
              <CardRotina
                key={rotina.id}
                rotina={rotina}
                maquinasAssociadas={contarMaquinasVinculadas(equipeId, rotina.id)}
                aoEditar={abrirEdicao}
                aoExcluir={excluirRotina}
              />
            ))}
          </section>
        ) : (
          <section className={styles.estadoVazio}>
            <span className={styles.iconeVazio}><Layers3 size={30} /></span>
            <h2>Nenhuma rotina cadastrada</h2>
            <p>Crie sua primeira rotina para definir dias, horários e a ordem das ações que deverão compor o trabalho do equipamento.</p>
            <button type="button" className={styles.botaoVazio} onClick={abrirCriacao}><Plus size={18} /> Criar primeira rotina</button>
          </section>
        )}

        <div className={styles.avisoLocal}>
          <Info size={17} />
          <span>As rotinas são demonstrativas e ficam salvas neste navegador, separadas pelo ID da equipe. Elas ainda não executam comandos em máquinas físicas.</span>
        </div>
      </main>

      <footer className={styles.rodape}>
        <strong>Fhive</strong><span>©2026 Fhive · Ambiente industrial</span>
        <Link to={`/solucao/${encodeURIComponent(equipeId)}`}>Analisar dados</Link>
      </footer>

      {modalAberto && (
        <div className={styles.fundoModal} role="presentation" onMouseDown={(evento) => {
          if (evento.target === evento.currentTarget) setModalAberto(false);
        }}>
          <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="titulo-modal-rotina">
            <div className={styles.topoModal}>
              <div>
                <span className={styles.miniTituloModal}>{formulario.id ? "EDIÇÃO DE ROTINA" : "NOVA ROTINA"} · {equipeNome}</span>
                <h2 id="titulo-modal-rotina">{formulario.id ? "Editar rotina" : "Criar rotina"}</h2>
                <p>Defina quando a rotina acontece e quais ações compõem a sequência.</p>
              </div>
              <button type="button" className={styles.botaoFechar} aria-label="Fechar formulário" onClick={() => setModalAberto(false)}><X size={21} /></button>
            </div>

            <form className={styles.formulario} onSubmit={salvarFormulario}>
              <label className={styles.campo}>
                Nome da rotina
                <input value={formulario.nome} onChange={(evento) => setFormulario((atual) => ({ ...atual, nome: evento.target.value }))} placeholder="Ex.: Manufaturamento" maxLength={80} required />
              </label>
              <label className={styles.campo}>
                Descrição
                <textarea value={formulario.descricao} onChange={(evento) => setFormulario((atual) => ({ ...atual, descricao: evento.target.value }))} placeholder="Qual é o objetivo desta rotina?" maxLength={240} rows={2} />
              </label>

              <fieldset className={styles.campoDias}>
                <legend><CalendarDays size={16} /> Dias da semana</legend>
                <div className={styles.dias}>
                  {DIAS.map((dia) => {
                    const ativo = formulario.diasSemana.includes(dia.valor);
                    return (
                      <label key={dia.valor} className={`${styles.dia} ${ativo ? styles.diaAtivo : ""}`} title={dia.nome}>
                        <input type="checkbox" checked={ativo} onChange={() => setFormulario((atual) => ({
                          ...atual,
                          diasSemana: ativo ? atual.diasSemana.filter((valor) => valor !== dia.valor) : [...atual.diasSemana, dia.valor],
                        }))} />
                        <span>{dia.valor}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <div className={styles.camposHorario}>
                <label className={styles.campo}>
                  Horário inicial
                  <input type="time" value={formulario.horarioInicial} onChange={(evento) => setFormulario((atual) => ({ ...atual, horarioInicial: evento.target.value }))} required />
                </label>
                <label className={styles.campo}>
                  Horário final
                  <input type="time" value={formulario.horarioFinal} onChange={(evento) => setFormulario((atual) => ({ ...atual, horarioFinal: evento.target.value }))} required />
                </label>
              </div>

              <section className={styles.editorAcoes}>
                <div className={styles.cabecalhoAcoes}>
                  <div><h3><ListOrdered size={17} /> Ações em sequência</h3><p>Organize as etapas pela ordem e horário de execução.</p></div>
                  <button type="button" className={styles.botaoAcao} onClick={adicionarAcao}><Plus size={15} /> Ação</button>
                </div>
                {formulario.acoes.map((acao, indice) => (
                  <article className={styles.itemAcao} key={acao.id}>
                    <div className={styles.ordemAcao}>
                      <span>{indice + 1}</span>
                      <button type="button" title="Mover para cima" disabled={indice === 0} onClick={() => moverAcao(indice, -1)}><ChevronUp size={15} /></button>
                      <button type="button" title="Mover para baixo" disabled={indice === formulario.acoes.length - 1} onClick={() => moverAcao(indice, 1)}><ChevronDown size={15} /></button>
                    </div>
                    <div className={styles.camposAcao}>
                      <label className={styles.campo}>Horário<input type="time" value={acao.horario} onChange={(evento) => atualizarAcao(acao.id, { horario: evento.target.value })} required /></label>
                      <label className={styles.campo}>Nome da ação<input value={acao.nome} onChange={(evento) => atualizarAcao(acao.id, { nome: evento.target.value })} placeholder="Ex.: Iniciar esteira" maxLength={80} required /></label>
                      <label className={`${styles.campo} ${styles.campoDescricaoAcao}`}>Instrução (opcional)<input value={acao.descricao} onChange={(evento) => atualizarAcao(acao.id, { descricao: evento.target.value })} placeholder="Ex.: Conferir proteção e iniciar ciclo" maxLength={160} /></label>
                    </div>
                    <button type="button" className={styles.botaoRemoverAcao} aria-label={`Remover ação ${indice + 1}`} title="Remover ação" onClick={() => setFormulario((atual) => ({ ...atual, acoes: atual.acoes.filter((item) => item.id !== acao.id) }))}><Trash2 size={16} /></button>
                  </article>
                ))}
              </section>

              {mensagemErro && <p className={styles.erroFormulario} role="alert">{mensagemErro}</p>}
              <div className={styles.avisoFormulario}><Info size={16} /> Esta versão salva a rotina somente no navegador e não aciona máquinas físicas.</div>
              <div className={styles.botoesModal}>
                <button type="button" className={styles.botaoCancelar} onClick={() => setModalAberto(false)}>Cancelar</button>
                <button type="submit" className={styles.botaoSalvar}><Save size={17} /> Salvar rotina</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}