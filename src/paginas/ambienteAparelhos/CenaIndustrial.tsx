import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { useMemo, useRef, useState } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { type Group, Plane, Quaternion, Vector3 } from "three";
import styles from "./styles.module.css";

/**
 * Este arquivo contém apenas a renderização e a interação 3D.
 * Ele recebe máquinas já preparadas pela página e devolve seleção/movimento por callbacks;
 * nenhuma requisição ao backend é feita dentro da cena.
 */
type MaquinaCena = {
  id: string;
  nome: string;
  tipo: string;
  status: string;
  possuiErro: boolean;
  mensagemErro?: string | null;
  demo?: boolean;
  posicaoX?: number;
  posicaoZ?: number;
};

type Props = {
  maquinas: MaquinaCena[];
  maquinaSelecionadaId: string | null;
  aoSelecionar: (maquina: MaquinaCena) => void;
  aoMover: (maquinaId: string, posicaoX: number, posicaoZ: number) => void;
};


/** Cria uma viga entre dois pontos 3D calculando comprimento, centro e rotação. */
function VigaEntrePontos({
  inicio,
  fim,
  espessura = 0.1,
  cor = "#b9b8b5",
}: {
  inicio: [number, number, number];
  fim: [number, number, number];
  espessura?: number;
  cor?: string;
}) {
  const geometria = useMemo(() => {
    const a = new Vector3(...inicio);
    const b = new Vector3(...fim);
    const direcao = b.clone().sub(a);
    const centro = a.clone().add(b).multiplyScalar(0.5);
    const rotacao = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direcao.clone().normalize());
    return { centro: centro.toArray() as [number, number, number], rotacao, comprimento: direcao.length() };
  }, [inicio, fim]);

  return (
    <mesh position={geometria.centro} quaternion={geometria.rotacao} castShadow>
      <cylinderGeometry args={[espessura, espessura, geometria.comprimento, 5]} />
      <meshStandardMaterial color={cor} roughness={0.8} />
    </mesh>
  );
}

/**
 * Estrutura aberta do galpão: piso, colunas, vigas e treliças.
 * As paredes sólidas foram removidas para o usuário enxergar e organizar máquinas sem obstrução.
 */
function GalpaoIndustrial() {
  const colunas = useMemo(() => [-13, -7.8, -2.6, 2.6, 7.8, 13], []);
  const profundidades = useMemo(() => [-12, -7, -2, 3, 8, 13], []);
  const vigasTelhado = useMemo(() => [-12, -8, -4, 0, 4, 8, 12], []);

  return (
    <group>
      {/* Piso amplo sem paredes sólidas, para permitir visualizar e organizar o maquinário. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]} receiveShadow>
        <planeGeometry args={[52, 52]} />
        <meshStandardMaterial color="#f8f7f4" roughness={0.96} />
      </mesh>

      {/* Colunas estruturais e travessas laterais que dão escala de galpão sem fechar a cena. */}
      {colunas.map((x) => (
        <group key={`coluna-${x}`}>
          {profundidades.map((z) => (
            <mesh key={`${x}-${z}`} position={[x, 3.55, z]} castShadow>
              <boxGeometry args={[0.16, 7.1, 0.16]} />
              <meshStandardMaterial color="#bdbbb7" roughness={0.7} />
            </mesh>
          ))}
          <mesh position={[x, 7.12, 0]}>
            <boxGeometry args={[0.18, 0.16, 27]} />
            <meshStandardMaterial color="#c8c6c2" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Treliças e vigas superiores formam a estrutura visível do teto aberto. */}
      {profundidades.map((z) => (
        <group key={`trelica-${z}`}>
          <VigaEntrePontos inicio={[-15, 6.3, z]} fim={[0, 8.2, z]} espessura={0.075} />
          <VigaEntrePontos inicio={[0, 8.2, z]} fim={[15, 6.3, z]} espessura={0.075} />
          <VigaEntrePontos inicio={[-15, 6.3, z]} fim={[-15, 7.1, z]} espessura={0.06} />
          <VigaEntrePontos inicio={[15, 6.3, z]} fim={[15, 7.1, z]} espessura={0.06} />
          <VigaEntrePontos inicio={[-15, 6.3, z]} fim={[0, 7.1, z]} espessura={0.045} cor="#d0ceca" />
          <VigaEntrePontos inicio={[0, 7.1, z]} fim={[15, 6.3, z]} espessura={0.045} cor="#d0ceca" />
        </group>
      ))}

      {vigasTelhado.map((z) => (
        <group key={`travessa-${z}`}>
          <VigaEntrePontos inicio={[-15, 6.3, z]} fim={[-15, 6.3, z + 0.7]} espessura={0.055} cor="#d2d0cc" />
          <VigaEntrePontos inicio={[0, 8.2, z]} fim={[0, 8.2, z + 0.7]} espessura={0.055} cor="#d2d0cc" />
          <VigaEntrePontos inicio={[15, 6.3, z]} fim={[15, 6.3, z + 0.7]} espessura={0.055} cor="#d2d0cc" />
        </group>
      ))}

      {[-12, -8, -4, 0, 4, 8, 12].map((z) => (
        <mesh key={`parede-${z}`} position={[0, 3.4, z]}>
          <boxGeometry args={[29.5, 0.035, 0.035]} />
          <meshStandardMaterial color="#d4d2ce" />
        </mesh>
      ))}

      {[-12, -8, -4, 0, 4, 8, 12].map((z) => (
        <group key={`reforco-${z}`}>
          <VigaEntrePontos inicio={[-15, 0.2, z]} fim={[-15, 6.3, z + 4]} espessura={0.035} cor="#ceccc8" />
          <VigaEntrePontos inicio={[15, 0.2, z]} fim={[15, 6.3, z + 4]} espessura={0.035} cor="#ceccc8" />
        </group>
      ))}
    </group>
  );
}

/** Base compartilhada pelos equipamentos para que todos encostem visualmente no piso. */
function BaseMaquina({ cor = "#bbb9b4" }: { cor?: string }) {
  return (
    <group>
      <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.7, 0.36, 1.25]} />
        <meshStandardMaterial color={cor} metalness={0.28} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.39, 0]} castShadow>
        <boxGeometry args={[1.48, 0.08, 1.08]} />
        <meshStandardMaterial color="#5f6263" metalness={0.35} roughness={0.45} />
      </mesh>
      {/* Pés da base: pequenas peças de contato que dão profundidade ao equipamento. */}
      {[-0.54, 0.54].map((x) => (
        <mesh key={x} position={[x, 0.05, 0.42]}>
          <boxGeometry args={[0.16, 0.1, 0.12]} />
          <meshStandardMaterial color="#777875" />
        </mesh>
      ))}
    </group>
  );
}

/** Modelo geométrico ilustrativo de braço robótico, composto por juntas e segmentos. */
function BracoRobotico() {
  return (
    <group>
      <BaseMaquina />
      {/* Coluna giratória sobre a base. */}
      <mesh position={[0, 0.74, 0]} castShadow>
        <cylinderGeometry args={[0.43, 0.48, 0.52, 20]} />
        <meshStandardMaterial color="#777a79" metalness={0.32} roughness={0.45} />
      </mesh>
      <mesh position={[0, 1.08, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.32, 0.2, 20]} />
        <meshStandardMaterial color="#c85c0a" metalness={0.22} roughness={0.5} />
      </mesh>
      {/* Primeiro segmento do braço e junta esférica. */}
      <mesh position={[0.25, 1.57, 0]} rotation={[0, 0, -0.48]} castShadow>
        <boxGeometry args={[0.36, 1.1, 0.38]} />
        <meshStandardMaterial color="#bfc0bd" metalness={0.25} roughness={0.42} />
      </mesh>
      <mesh position={[0.49, 2.06, 0]}>
        <sphereGeometry args={[0.25, 20, 16]} />
        <meshStandardMaterial color="#666a6a" metalness={0.32} roughness={0.38} />
      </mesh>
      {/* Segundo segmento articulado. */}
      <mesh position={[0.83, 2.36, 0]} rotation={[0, 0, 0.58]} castShadow>
        <boxGeometry args={[0.28, 0.88, 0.3]} />
        <meshStandardMaterial color="#e1e0dc" metalness={0.2} roughness={0.5} />
      </mesh>
      <mesh position={[1.05, 2.76, 0]}>
        <sphereGeometry args={[0.19, 18, 16]} />
        <meshStandardMaterial color="#55595a" metalness={0.3} roughness={0.4} />
      </mesh>
      {/* Garra simplificada, que representa o efetuador do robô. */}
      <mesh position={[1.22, 2.91, 0]} rotation={[0, 0, -0.55]} castShadow>
        <boxGeometry args={[0.15, 0.52, 0.17]} />
        <meshStandardMaterial color="#c85c0a" metalness={0.15} roughness={0.5} />
      </mesh>
      <mesh position={[1.38, 3.12, 0]} rotation={[0, 0, 0.5]}>
        <boxGeometry args={[0.1, 0.35, 0.13]} />
        <meshStandardMaterial color="#55595a" metalness={0.3} roughness={0.4} />
      </mesh>
    </group>
  );
}

/** Modelo de esteira construído com roletes, plataforma e proteções laterais. */
function EsteiraTransportadora() {
  return (
    <group>
      <BaseMaquina cor="#8d918f" />
      {/* Plataforma da esteira e superfície sobre a qual as peças transitariam. */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[2.5, 0.18, 0.9]} />
        <meshStandardMaterial color="#44494a" metalness={0.25} roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.97, 0]}>
        <boxGeometry args={[2.32, 0.05, 0.72]} />
        <meshStandardMaterial color="#a6aaa7" metalness={0.18} roughness={0.6} />
      </mesh>
      {/* Roletes repetidos ao longo da esteira. */}
      {[-1.1, -0.65, -0.2, 0.25, 0.7, 1.1].map((x) => (
        <mesh key={x} position={[x, 0.88, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.8, 12]} />
          <meshStandardMaterial color="#646866" metalness={0.55} roughness={0.38} />
        </mesh>
      ))}
      {/* Proteções laterais destacadas em laranja industrial. */}
      {[-0.85, 0.85].map((z) => (
        <mesh key={z} position={[0, 0.45, z]} castShadow>
          <boxGeometry args={[2.1, 0.7, 0.08]} />
          <meshStandardMaterial color="#c85c0a" metalness={0.12} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

/** Modelo ilustrativo de centro de usinagem/CNC, com painel frontal e detalhes. */
function CentroUsinagem() {
  return (
    <group>
      <BaseMaquina cor="#c5c6c2" />
      {/* Carenagem principal da máquina CNC. */}
      <mesh position={[0, 1.02, 0]} castShadow>
        <boxGeometry args={[1.65, 1.28, 1.2]} />
        <meshStandardMaterial color="#b5b7b4" metalness={0.22} roughness={0.48} />
      </mesh>
      {/* Porta frontal/visor escuro e pequenos detalhes do painel. */}
      <mesh position={[0, 1.08, 0.62]}>
        <boxGeometry args={[1.25, 0.76, 0.045]} />
        <meshStandardMaterial color="#555b5b" metalness={0.18} roughness={0.4} />
      </mesh>
      <mesh position={[0.36, 1.56, 0.66]}>
        <boxGeometry args={[0.42, 0.16, 0.07]} />
        <meshStandardMaterial color="#2d3333" />
      </mesh>
      <mesh position={[-0.43, 1.55, 0.66]}>
        <boxGeometry args={[0.32, 0.13, 0.07]} />
        <meshStandardMaterial color="#d4d3ce" />
      </mesh>
      <mesh position={[0.66, 1.89, 0.26]}>
        <boxGeometry args={[0.16, 0.46, 0.16]} />
        <meshStandardMaterial color="#555a59" metalness={0.25} roughness={0.4} />
      </mesh>
      <mesh position={[-0.63, 0.72, 0.25]}>
        <boxGeometry args={[0.08, 0.85, 0.1]} />
        <meshStandardMaterial color="#c85c0a" />
      </mesh>
    </group>
  );
}

/** Modelo de reserva usado quando o tipo cadastrado não possui uma geometria específica. */
function MaquinaGenerica() {
  return (
    <group>
      <BaseMaquina />
      {/* Volume neutro para equipamentos sem um tipo visual próprio. */}
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[1.25, 1.25, 0.95]} />
        <meshStandardMaterial color="#b7b9b5" metalness={0.2} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.05, 0.5]}>
        <boxGeometry args={[0.82, 0.55, 0.04]} />
        <meshStandardMaterial color="#52595a" metalness={0.18} roughness={0.45} />
      </mesh>
      <mesh position={[0, 1.7, 0]}>
        <boxGeometry args={[0.9, 0.12, 0.7]} />
        <meshStandardMaterial color="#c85c0a" />
      </mesh>
    </group>
  );
}

/** Traduz o nome cadastrado pela pessoa em um dos modelos 3D internos disponíveis. */
function tipoModelo(tipo: string) {
  const valor = tipo.toLocaleLowerCase("pt-BR");
  if (valor.includes("esteira") || valor.includes("transport")) return "esteira";
  if (valor.includes("cnc") || valor.includes("torno") || valor.includes("usinagem")) return "cnc";
  if (valor.includes("robô") || valor.includes("robo") || valor.includes("braço") || valor.includes("braco")) return "robo";
  return "generica";
}

/**
 * Instância selecionável de uma máquina na cena.
 * Os eventos de ponteiro movem a máquina no plano X/Z; o clique abre seu painel lateral.
 */
function Maquina3D({
  maquina,
  posicao,
  selecionada,
  aoSelecionar,
  aoMover,
  aoIniciarArraste,
}: {
  maquina: MaquinaCena;
  posicao: [number, number, number];
  selecionada: boolean;
  aoSelecionar: (maquina: MaquinaCena) => void;
  aoMover: (maquinaId: string, posicaoX: number, posicaoZ: number) => void;
  aoIniciarArraste: (arrastando: boolean) => void;
}) {
  const [hover, setHover] = useState(false);
  const grupoRef = useRef<Group>(null);
  const planoChaoRef = useRef(new Plane(new Vector3(0, 1, 0), 0));
  const pontoIntersecaoRef = useRef(new Vector3());
  const arrasteRef = useRef<{
    pointerId: number;
    inicioMouseX: number;
    inicioMouseY: number;
    deslocamentoX: number;
    deslocamentoZ: number;
    x: number;
    z: number;
    moveu: boolean;
  } | null>(null);
  const modelo = tipoModelo(maquina.tipo);
  // Trata status e texto do erro como fontes equivalentes, incluindo dados locais antigos.
  const possuiErro = maquina.possuiErro || maquina.status === "erro" || Boolean(maquina.mensagemErro?.trim());
  // Um clique sem movimento apenas seleciona a máquina e deixa o painel cuidar dos detalhes.
  const tratarClick = (evento: ThreeEvent<MouseEvent>) => {
    evento.stopPropagation();
    aoSelecionar(maquina);
  };

  const iniciarArraste = (evento: ThreeEvent<PointerEvent>) => {
    if (evento.nativeEvent.button !== 0) return;
    evento.stopPropagation();
    evento.nativeEvent.preventDefault();
    // Não deixa o mesmo clique iniciar também a rotação da câmera.
    evento.nativeEvent.stopImmediatePropagation();

    const pontoChao = evento.ray.intersectPlane(planoChaoRef.current, pontoIntersecaoRef.current);
    if (!pontoChao) return;

    aoSelecionar(maquina);
    arrasteRef.current = {
      pointerId: evento.pointerId,
      inicioMouseX: evento.nativeEvent.clientX,
      inicioMouseY: evento.nativeEvent.clientY,
      deslocamentoX: posicao[0] - pontoChao.x,
      deslocamentoZ: posicao[2] - pontoChao.z,
      x: posicao[0],
      z: posicao[2],
      moveu: false,
    };
    // Captura o ponteiro quando o alvo DOM oferece essa API, para continuar acompanhando
    // o arraste mesmo se o cursor passar para fora da área visual da máquina.
    const alvoPonteiro = evento.target as unknown as { setPointerCapture?: (pointerId: number) => void };
    alvoPonteiro.setPointerCapture?.(evento.pointerId);
    aoIniciarArraste(true);
    document.body.style.cursor = "grabbing";
  };

  const moverDuranteArraste = (evento: ThreeEvent<PointerEvent>) => {
    const arraste = arrasteRef.current;
    if (!arraste || arraste.pointerId !== evento.pointerId || !grupoRef.current) return;

    const deslocamentoMouseX = evento.nativeEvent.clientX - arraste.inicioMouseX;
    const deslocamentoMouseY = evento.nativeEvent.clientY - arraste.inicioMouseY;
    if (!arraste.moveu && Math.hypot(deslocamentoMouseX, deslocamentoMouseY) < 4) return;
    arraste.moveu = true;

    const pontoChao = evento.ray.intersectPlane(planoChaoRef.current, pontoIntersecaoRef.current);
    if (!pontoChao) return;

    // Mantém os equipamentos dentro da área útil do piso do galpão e conserva
    // o deslocamento inicial para que o modelo não "salte" para o centro do cursor.
    arraste.x = Math.max(-13, Math.min(13, pontoChao.x + arraste.deslocamentoX));
    arraste.z = Math.max(-12, Math.min(12, pontoChao.z + arraste.deslocamentoZ));
    grupoRef.current.position.x = arraste.x;
    grupoRef.current.position.z = arraste.z;
  };

  const finalizarArraste = (evento: ThreeEvent<PointerEvent>) => {
    const arraste = arrasteRef.current;
    if (!arraste || arraste.pointerId !== evento.pointerId) return;

    if (arraste.moveu) aoMover(maquina.id, arraste.x, arraste.z);
    arrasteRef.current = null;
    aoIniciarArraste(false);
    document.body.style.cursor = "auto";
  };

  return (
    <group
      ref={grupoRef}
      position={posicao}
      scale={maquina.demo ? 0.86 : 0.92}
      onClick={tratarClick}
      onPointerDown={iniciarArraste}
      onPointerMove={moverDuranteArraste}
      onPointerUp={finalizarArraste}
      onPointerCancel={finalizarArraste}
      onPointerOver={(evento) => { evento.stopPropagation(); setHover(true); if (!arrasteRef.current) document.body.style.cursor = "grab"; }}
      onPointerOut={() => { setHover(false); if (!arrasteRef.current) document.body.style.cursor = "auto"; }}
    >
      <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.22, 1.35, 40]} />
        <meshBasicMaterial color={selecionada ? "#c85c0a" : hover ? "#e6a36c" : "#b5b2ad"} />
      </mesh>
      {modelo === "robo" ? <BracoRobotico /> : modelo === "esteira" ? <EsteiraTransportadora /> : modelo === "cnc" ? <CentroUsinagem /> : <MaquinaGenerica />}

      {/* Marcador HTML preso ao topo do modelo: alertas têm prioridade visual sobre a seleção.
          O elemento não captura o clique, então não atrapalha selecionar/arrastar o equipamento. */}
      {(possuiErro || selecionada) && (
        <Html position={[0, 3.72, 0]} center distanceFactor={10} zIndexRange={[1000, 0]} style={{ pointerEvents: "none" }}>
          {possuiErro ? (
            <div className={`${styles.indicadorMaquina} ${styles.indicadorErro}`} role="img" aria-label={maquina.mensagemErro || "Equipamento com erro"} title={maquina.mensagemErro || "Equipamento com erro"}>
              <span>!</span>
              <i aria-hidden="true" />
            </div>
          ) : (
            <div className={`${styles.indicadorMaquina} ${styles.indicadorSelecionado}`} role="img" aria-label="Equipamento selecionado"><span /></div>
          )}
        </Html>
      )}

      <Html position={[0, -0.08, 1.14]} center distanceFactor={13} zIndexRange={[30, 0]}>
        <div className={`${styles.rotuloMaquina} ${selecionada ? styles.rotuloSelecionado : ""}`}>
          <span>{maquina.nome}</span>
          {maquina.demo && <small>MODELO ILUSTRATIVO</small>}
        </div>
      </Html>
    </group>
  );
}

/**
 * Componente raiz da cena: monta o Canvas, luzes, galpão, máquinas e câmera.
 * A posição guardada em cada máquina vence a posição inicial padrão após mover/salvar.
 */
export function CenaIndustrial({ maquinas, maquinaSelecionadaId, aoSelecionar, aoMover }: Props) {
  const [controlesAtivos, setControlesAtivos] = useState(true);
  const [arrastandoMaquina, setArrastandoMaquina] = useState(false);
  // A mesma cena recebe apenas os equipamentos filtrados pela equipe na página pai.
  const exibidas = maquinas;
  // Organiza máquinas novas em uma grade; posições personalizadas são lidas depois.
  const posicoesPadrao: [number, number, number][] = exibidas.length === 1
    ? [[-4, 0, 1]]
    : exibidas.map((_, indice) => {
      const coluna = indice % 4;
      const linha = Math.floor(indice / 4);
      return [((coluna - 1.5) * 5.2), 0, 3.7 - linha * 5.2] as [number, number, number];
    });
  const posicoes = exibidas.map((maquina, indice) => ([
    maquina.posicaoX ?? posicoesPadrao[indice][0],
    0,
    maquina.posicaoZ ?? posicoesPadrao[indice][2],
  ] as [number, number, number]));

  return (
    <div className={styles.canvasIndustrial}>
      {/* Canvas é a área de renderização. A câmera começa em perspectiva elevada para
          mostrar o piso e a estrutura sem impedir que se aproxime dos equipamentos. */}
      <Canvas shadows dpr={[1, 1.8]} camera={{ position: [13, 11, 17], fov: 42, near: 0.1, far: 120 }}>
        <color attach="background" args={["#f7f6f3"]} />
        {/* Iluminação ambiente, luz direcional com sombras e luz de preenchimento. */}
        <ambientLight intensity={1.6} />
        <directionalLight position={[9, 16, 9]} intensity={2.1} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
        <directionalLight position={[-10, 8, -5]} intensity={0.7} />
        <hemisphereLight args={["#ffffff", "#d2cec7", 1.3]} />
        <GalpaoIndustrial />
        {exibidas.map((maquina, indice) => (
          <Maquina3D
            key={maquina.id}
            maquina={maquina}
            posicao={posicoes[indice]}
            selecionada={maquinaSelecionadaId === maquina.id}
            aoSelecionar={aoSelecionar}
            aoMover={aoMover}
            aoIniciarArraste={setArrastandoMaquina}
          />
        ))}
        {/* A câmera gira/ aproxima quando o usuário arrasta o piso; fica desativada
            enquanto uma máquina está sendo movida para evitar conflito de gestos. */}
        <OrbitControls
          makeDefault
          enabled={controlesAtivos && !arrastandoMaquina}
          enableDamping
          dampingFactor={0.08}
          minDistance={7}
          maxDistance={38}
          maxPolarAngle={Math.PI / 2.05}
          target={[0, 1.5, 0]}
        />
      </Canvas>
      <div className={styles.legendaCena}>
        <span className={styles.pontoLegenda} />
        {maquinas.length ? `${maquinas.length} equipamento${maquinas.length === 1 ? "" : "s"} nesta equipe` : "Nenhum equipamento cadastrado nesta equipe"}
      </div>
      <button
        type="button"
        className={styles.controlesCena}
        onClick={() => setControlesAtivos((atual) => !atual)}
        aria-pressed={controlesAtivos}
        title={controlesAtivos ? "Desativar movimento da câmera" : "Ativar movimento da câmera"}
      >
        {controlesAtivos ? "Câmera livre" : "Câmera pausada"}
      </button>
    </div>
  );
}