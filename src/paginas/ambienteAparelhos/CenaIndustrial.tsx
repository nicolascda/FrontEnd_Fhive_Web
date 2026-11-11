import { Canvas, useThree } from "@react-three/fiber";
import { Html, OrbitControls, useGLTF } from "@react-three/drei";
import { Component, Suspense, useEffect, useMemo, useRef, useState, type ErrorInfo, type ReactNode } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { Box3, DoubleSide, type Group, type Mesh, Plane, Quaternion, Raycaster, Vector2, Vector3 } from "three";
import { clone as cloneSkeleton } from "three/addons/utils/SkeletonUtils.js";
import styles from "./styles.module.css";
import modeloBracoRoboUrl from "../../dados/modelos/industria/braco_robo.glb?url";
import modeloConversorUrl from "../../dados/modelos/industria/conversor.glb?url";
import modeloArCondicionadoIndustrialUrl from "../../dados/modelos/industria/ArCondicionado_industrial.glb?url";
import modeloCadeiraUrl from "../../dados/modelos/escola/cadeira.glb?url";
import modeloLaptopUrl from "../../dados/modelos/escola/laptop.glb?url";
import modeloCamaHospitalUrl from "../../dados/modelos/saude/cama_hospital.glb?url";
import modeloMonitorMedicoUrl from "../../dados/modelos/saude/monitor.glb?url";

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
  posicaoY?: number;
  posicaoZ?: number;
};

export type AmbienteVisual = "industrial" | "escolar" | "saude";

type Props = {
  ambiente: AmbienteVisual;
  maquinas: MaquinaCena[];
  maquinaSelecionadaId: string | null;
  aoSelecionar: (maquina: MaquinaCena) => void;
  aoMover: (maquinaId: string, posicaoX: number, posicaoY: number, posicaoZ: number) => void;
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

/** Sala escolar aberta: piso, paredes laterais/traseira e quadro, sem teto para facilitar a navegação. */
function AmbienteEscolar() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]} receiveShadow>
        <planeGeometry args={[36, 36]} />
        <meshStandardMaterial color="#f3f0e8" roughness={0.94} />
      </mesh>

      <mesh position={[0, 2.45, -17.7]} castShadow receiveShadow>
        <boxGeometry args={[36, 4.9, 0.28]} />
        <meshStandardMaterial color="#e6e1d6" roughness={0.9} />
      </mesh>
      <mesh position={[-17.7, 2.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.28, 4.7, 35.4]} />
        <meshStandardMaterial color="#eeeae1" roughness={0.9} />
      </mesh>
      <mesh position={[17.7, 2.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.28, 4.7, 35.4]} />
        <meshStandardMaterial color="#eeeae1" roughness={0.9} />
      </mesh>

      {/* Quadro simples ao fundo para caracterizar a sala sem ocupar a área útil. */}
      <mesh position={[0, 2.65, -17.48]}>
        <boxGeometry args={[8.2, 2.05, 0.12]} />
        <meshStandardMaterial color="#426a59" roughness={0.75} />
      </mesh>
      {[-1, 1].map((lado) => (
        <mesh key={`moldura-quadro-lateral-${lado}`} position={[lado * 4.16, 2.65, -17.38]}>
          <boxGeometry args={[0.12, 2.24, 0.1]} />
          <meshStandardMaterial color="#b9a77f" roughness={0.7} />
        </mesh>
      ))}
      {[-1, 1].map((lado) => (
        <mesh key={`moldura-quadro-horizontal-${lado}`} position={[0, 2.65 + lado * 1.12, -17.38]}>
          <boxGeometry args={[8.42, 0.12, 0.1]} />
          <meshStandardMaterial color="#b9a77f" roughness={0.7} />
        </mesh>
      ))}

      {/* Janelas altas nas laterais: deixam o ambiente reconhecível sem fechá-lo visualmente. */}
      {[-10, -5, 0, 5, 10].map((z) => (
        <group key={`janela-escola-${z}`}>
          <mesh position={[-17.52, 3.05, z]}>
            <boxGeometry args={[0.06, 1.65, 3.3]} />
            <meshStandardMaterial color="#b9d4dc" metalness={0.08} roughness={0.3} />
          </mesh>
          <mesh position={[17.52, 3.05, z]}>
            <boxGeometry args={[0.06, 1.65, 3.3]} />
            <meshStandardMaterial color="#b9d4dc" metalness={0.08} roughness={0.3} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 0.18, -17.48]}>
        <boxGeometry args={[35.8, 0.22, 0.08]} />
        <meshStandardMaterial color="#c8bda9" roughness={0.8} />
      </mesh>
    </group>
  );
}

/** Sala hospitalar aberta: estrutura neutra com faixa clínica e piso livre para os equipamentos. */
function AmbienteSaude() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]} receiveShadow>
        <planeGeometry args={[36, 36]} />
        <meshStandardMaterial color="#edf2f0" roughness={0.95} />
      </mesh>

      <mesh position={[0, 2.5, -17.7]} castShadow receiveShadow>
        <boxGeometry args={[36, 5, 0.28]} />
        <meshStandardMaterial color="#f5f7f6" roughness={0.9} />
      </mesh>
      <mesh position={[-17.7, 2.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.28, 4.9, 35.4]} />
        <meshStandardMaterial color="#f5f7f6" roughness={0.9} />
      </mesh>
      <mesh position={[17.7, 2.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.28, 4.9, 35.4]} />
        <meshStandardMaterial color="#f5f7f6" roughness={0.9} />
      </mesh>

      {/* Faixa azul-clara e janelas horizontais, com aparência simples de unidade hospitalar. */}
      <mesh position={[0, 1.12, -17.52]}>
        <boxGeometry args={[35.5, 0.34, 0.08]} />
        <meshStandardMaterial color="#a9d2d2" roughness={0.65} />
      </mesh>
      <mesh position={[0, 3.65, -17.5]}>
        <boxGeometry args={[15.5, 1.55, 0.08]} />
        <meshStandardMaterial color="#c8e0e2" metalness={0.05} roughness={0.28} />
      </mesh>
      {[-1, 1].map((lado) => (
        <mesh key={`janela-hospital-lateral-${lado}`} position={[lado * 7.8, 3.65, -17.4]}>
          <boxGeometry args={[0.12, 1.72, 0.1]} />
          <meshStandardMaterial color="#d8e1de" roughness={0.65} />
        </mesh>
      ))}
      {[-1, 1].map((lado) => (
        <mesh key={`janela-hospital-horizontal-${lado}`} position={[0, 3.65 + lado * 0.86, -17.4]}>
          <boxGeometry args={[15.8, 0.12, 0.1]} />
          <meshStandardMaterial color="#d8e1de" roughness={0.65} />
        </mesh>
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

type ModeloGLBProps = {
  arquivo: string;
  tamanhoAlvo: number;
  deslocamentoY?: number;
};

type LimiteErroModeloProps = {
  arquivo: string;
  children: ReactNode;
  fallback: ReactNode;
};

type LimiteErroModeloState = {
  falhou: boolean;
};

/**
 * Impede que um arquivo GLB ausente ou inválido derrube todo o Canvas.
 * Enquanto o modelo carrega, Suspense mostra a geometria genérica; se o carregamento
 * falhar, este limite mantém a mesma reserva e registra o caminho que apresentou erro.
 */
class LimiteErroModelo extends Component<LimiteErroModeloProps, LimiteErroModeloState> {
  state: LimiteErroModeloState = { falhou: false };

  static getDerivedStateFromError(): LimiteErroModeloState {
    return { falhou: true };
  }

  componentDidCatch(erro: Error, _informacoes: ErrorInfo) {
    console.error(`Não foi possível carregar o modelo 3D "${this.props.arquivo}". Será usado o modelo genérico.`, erro);
  }

  render() {
    return this.state.falhou ? this.props.fallback : this.props.children;
  }
}

function ModeloComFallback(props: ModeloGLBProps) {
  return (
    <LimiteErroModelo
      key={props.arquivo}
      arquivo={props.arquivo}
      fallback={<MaquinaGenerica />}
    >
      <Suspense fallback={<MaquinaGenerica />}>
        <ModeloGLB {...props} />
      </Suspense>
    </LimiteErroModelo>
  );
}

/**
 * Carrega o GLB apenas quando o tipo de equipamento aparece na cena.
 * A geometria é normalizada para um tamanho previsível e apoiada no piso,
 * porque os arquivos recebidos usam escalas e origens diferentes.
 */
function ModeloGLB({ arquivo, tamanhoAlvo, deslocamentoY = 0 }: ModeloGLBProps) {
  const { scene } = useGLTF(arquivo);
  const transformacao = useMemo(() => {
    // O GLB do ar-condicionado possui armature/skinned meshes. Object3D.clone(true)
    // mantém referências ao esqueleto original e pode separar a malha do grupo visual.
    // SkeletonUtils.clone cria uma cópia com os bones corretamente vinculados.
    const copia = cloneSkeleton(scene);
    copia.updateMatrixWorld(true);
    const limites = new Box3().setFromObject(copia);
    const dimensoes = limites.getSize(new Vector3());
    const maiorDimensao = Math.max(dimensoes.x, dimensoes.y, dimensoes.z) || 1;
    const escala = tamanhoAlvo / maiorDimensao;
    const centro = limites.getCenter(new Vector3());

    copia.traverse((objeto) => {
      const malha = objeto as Mesh;
      if (malha.isMesh) {
        malha.castShadow = true;
        malha.receiveShadow = true;
      }
    });

    return {
      copia,
      escala,
      posicao: [
        -centro.x * escala,
        -limites.min.y * escala + deslocamentoY,
        -centro.z * escala,
      ] as [number, number, number],
    };
  }, [scene, tamanhoAlvo, deslocamentoY]);

  return (
    <group position={transformacao.posicao} scale={transformacao.escala}>
      <primitive object={transformacao.copia} dispose={null} />
    </group>
  );
}

/** Traduz o nome cadastrado em um modelo 3D do setor ou em uma geometria antiga de reserva. */
function tipoModelo(tipo: string) {
  const valor = tipo.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[-_]/g, " ").toLowerCase();
  if (valor.includes("esteira") || valor.includes("transport") || valor.includes("conveyor") || valor.includes("conversor")) return "esteira";
  if (valor.includes("cnc") || valor.includes("torno") || valor.includes("usinagem")) return "cnc";
  if (valor.includes("robo") || valor.includes("braco")) return "robo";
  if (valor.includes("ar condicionado") || valor.includes("climat") || valor === "ac") return "ar-condicionado";
  if (valor.includes("carteira") || valor.includes("cadeira") || valor.includes("desk")) return "carteira";
  if (valor.includes("notebook") || valor.includes("laptop")) return "notebook";
  if (valor.includes("cama") || valor.includes("leito") || valor.includes("hospital bed")) return "cama";
  if (valor.includes("monitor") || valor.includes("vitacore")) return "monitor";
  return "generica";
}

function ModeloDaMaquina({ tipo }: { tipo: string }) {
  const modelo = tipoModelo(tipo);

  if (modelo === "robo") {
    return <ModeloComFallback arquivo={modeloBracoRoboUrl} tamanhoAlvo={3.35} />;
  }
  if (modelo === "esteira") {
    return <ModeloComFallback arquivo={modeloConversorUrl} tamanhoAlvo={3.2} />;
  }
  if (modelo === "ar-condicionado") {
    return <ModeloComFallback arquivo={modeloArCondicionadoIndustrialUrl} tamanhoAlvo={4.5} />;
  }
  if (modelo === "carteira") {
    return <ModeloComFallback arquivo={modeloCadeiraUrl} tamanhoAlvo={2.25} />;
  }
  if (modelo === "notebook") {
    return <ModeloComFallback arquivo={modeloLaptopUrl} tamanhoAlvo={1.5} deslocamentoY={0.72} />;
  }
  if (modelo === "cama") {
    return <ModeloComFallback arquivo={modeloCamaHospitalUrl} tamanhoAlvo={4.35} />;
  }
  if (modelo === "monitor") {
    return <ModeloComFallback arquivo={modeloMonitorMedicoUrl} tamanhoAlvo={2.05} />;
  }
  if (modelo === "cnc") return <CentroUsinagem />;
  return <MaquinaGenerica />;
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
  mostrarRotulo,
}: {
  maquina: MaquinaCena;
  posicao: [number, number, number];
  selecionada: boolean;
  aoSelecionar: (maquina: MaquinaCena) => void;
  aoMover: (maquinaId: string, posicaoX: number, posicaoY: number, posicaoZ: number) => void;
  aoIniciarArraste: (arrastando: boolean) => void;
  mostrarRotulo: boolean;
}) {
  const [hover, setHover] = useState(false);
  const grupoRef = useRef<Group>(null);
  const pontoIntersecaoRef = useRef(new Vector3());
  const coordenadasPonteiroRef = useRef(new Vector2());
  const planoArrasteRef = useRef(new Plane(new Vector3(0, 1, 0), 0));
  const raycasterArrasteRef = useRef(new Raycaster());
  const { camera, gl } = useThree();

  const ehArCondicionado = tipoModelo(maquina.tipo) === "ar-condicionado";
  const possuiErro = maquina.possuiErro || maquina.status === "erro" || Boolean(maquina.mensagemErro?.trim());
  const escalaGrupo = maquina.demo ? 0.86 : 0.92;
  // Todos os equipamentos, inclusive o ar-condicionado, usam o piso como origem.
  // A altura é controlada exclusivamente por posicaoY (teclas E/Q), sem deslocamento visual fixo.
  const alturaMarcadorLocal = 0.035;
  const alturaArrasteMundo = posicao[1] + alturaMarcadorLocal * escalaGrupo;

  type EstadoArraste = {
    pointerId: number;
    deslocamentoX: number;
    deslocamentoZ: number;
    x: number;
    z: number;
    moveu: boolean;
    inicioMouseX: number;
    inicioMouseY: number;
    aoMoverPonteiro: (evento: PointerEvent) => void;
    aoFinalizarPonteiro: (evento: PointerEvent) => void;
  };
  const arrasteRef = useRef<EstadoArraste | null>(null);

  useEffect(() => {
    return () => {
      const arraste = arrasteRef.current;
      if (arraste) {
        window.removeEventListener("pointermove", arraste.aoMoverPonteiro, true);
        window.removeEventListener("pointerup", arraste.aoFinalizarPonteiro, true);
        window.removeEventListener("pointercancel", arraste.aoFinalizarPonteiro, true);
      }
      document.body.style.cursor = "auto";
    };
  }, []);

  const tratarClick = (evento: ThreeEvent<MouseEvent>) => {
    evento.stopPropagation();
    aoSelecionar(maquina);
  };

  const iniciarArraste = (evento: ThreeEvent<PointerEvent>) => {
    if (evento.nativeEvent.button !== 0 || arrasteRef.current) return;
    evento.stopPropagation();
    evento.nativeEvent.preventDefault();
    evento.nativeEvent.stopImmediatePropagation();

    // O plano é o mesmo em que o círculo é desenhado. Assim, arrastar o círculo
    // ou qualquer parte do aparelho altera uma única posição X/Z do grupo inteiro.
    planoArrasteRef.current.set(new Vector3(0, 1, 0), -alturaArrasteMundo);
    const pontoInicial = evento.ray.intersectPlane(planoArrasteRef.current, pontoIntersecaoRef.current);
    if (!pontoInicial) return;

    aoSelecionar(maquina);

    const arraste: EstadoArraste = {
      pointerId: evento.pointerId,
      inicioMouseX: evento.nativeEvent.clientX,
      inicioMouseY: evento.nativeEvent.clientY,
      deslocamentoX: posicao[0] - pontoInicial.x,
      deslocamentoZ: posicao[2] - pontoInicial.z,
      x: posicao[0],
      z: posicao[2],
      moveu: false,
      aoMoverPonteiro: () => undefined,
      aoFinalizarPonteiro: () => undefined,
    };

    // A captura e os listeners ficam no canvas/janela, e não na malha estreita do GLB.
    // Isso evita que o arraste seja interrompido quando o ponteiro sai do aparelho.
    arraste.aoMoverPonteiro = (ponteiro) => {
      if (ponteiro.pointerId !== arraste.pointerId || !grupoRef.current) return;
      const limite = gl.domElement.getBoundingClientRect();
      if (!limite.width || !limite.height) return;

      const dx = ponteiro.clientX - arraste.inicioMouseX;
      const dy = ponteiro.clientY - arraste.inicioMouseY;
      if (!arraste.moveu && Math.hypot(dx, dy) < 4) return;
      arraste.moveu = true;

      coordenadasPonteiroRef.current.set(
        ((ponteiro.clientX - limite.left) / limite.width) * 2 - 1,
        -((ponteiro.clientY - limite.top) / limite.height) * 2 + 1,
      );
      raycasterArrasteRef.current.setFromCamera(coordenadasPonteiroRef.current, camera);
      const ponto = raycasterArrasteRef.current.ray.intersectPlane(planoArrasteRef.current, pontoIntersecaoRef.current);
      if (!ponto) return;

      arraste.x = Math.max(-13, Math.min(13, ponto.x + arraste.deslocamentoX));
      arraste.z = Math.max(-12, Math.min(12, ponto.z + arraste.deslocamentoZ));
      grupoRef.current.position.x = arraste.x;
      grupoRef.current.position.z = arraste.z;
    };

    arraste.aoFinalizarPonteiro = (ponteiro) => {
      if (ponteiro.pointerId !== arraste.pointerId) return;
      window.removeEventListener("pointermove", arraste.aoMoverPonteiro, true);
      window.removeEventListener("pointerup", arraste.aoFinalizarPonteiro, true);
      window.removeEventListener("pointercancel", arraste.aoFinalizarPonteiro, true);

      if (arraste.moveu && grupoRef.current) {
        aoMover(maquina.id, arraste.x, grupoRef.current.position.y, arraste.z);
      }

      try {
        if (gl.domElement.hasPointerCapture(arraste.pointerId)) {
          gl.domElement.releasePointerCapture(arraste.pointerId);
        }
      } catch {
        // A captura pode já ter sido liberada pelo navegador.
      }
      arrasteRef.current = null;
      aoIniciarArraste(false);
      document.body.style.cursor = "auto";
    };

    arrasteRef.current = arraste;
    window.addEventListener("pointermove", arraste.aoMoverPonteiro, true);
    window.addEventListener("pointerup", arraste.aoFinalizarPonteiro, true);
    window.addEventListener("pointercancel", arraste.aoFinalizarPonteiro, true);
    try {
      gl.domElement.setPointerCapture(evento.pointerId);
    } catch {
      // Os listeners globais seguem funcionando mesmo sem captura nativa.
    }
    aoIniciarArraste(true);
    document.body.style.cursor = "grabbing";
  };

  return (
    <group
      ref={grupoRef}
      position={posicao}
      scale={escalaGrupo}
      onClick={tratarClick}
      onPointerDown={iniciarArraste}
      onPointerOver={(evento) => { evento.stopPropagation(); setHover(true); if (!arrasteRef.current) document.body.style.cursor = "grab"; }}
      onPointerOut={() => { setHover(false); if (!arrasteRef.current) document.body.style.cursor = "auto"; }}
    >
      <mesh position={[0, alturaMarcadorLocal, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={ehArCondicionado ? [0.82, 0.94, 40] : [1.22, 1.35, 40]} />
        <meshBasicMaterial color={selecionada ? "#c85c0a" : hover ? "#e6a36c" : "#b5b2ad"} />
      </mesh>
      <ModeloDaMaquina tipo={maquina.tipo} />

      {/* Área invisível acompanha o volume real do ar-condicionado em escala 3x.
          O GLB normalizado mede aproximadamente 4.5 x 1.8 x 2.42; por isso o hitbox
          fica centralizado na metade da altura, com a base apoiada no mesmo piso do grupo. */}
      {ehArCondicionado && (
        <mesh position={[0, 0.9, 0]}>
          <boxGeometry args={[4.85, 2.05, 2.65]} />
          <meshBasicMaterial transparent opacity={0} colorWrite={false} depthWrite={false} side={DoubleSide} />
        </mesh>
      )}

      {(possuiErro || selecionada) && (
        <Html position={[0, ehArCondicionado ? 2.05 : 3.72, 0]} center distanceFactor={10} zIndexRange={[1000, 0]} style={{ pointerEvents: "none" }}>
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

      {mostrarRotulo && (
        <Html position={[0, -0.08, 1.14]} center distanceFactor={13} zIndexRange={[30, 0]}>
          <div className={`${styles.rotuloMaquina} ${selecionada ? styles.rotuloSelecionado : ""}`}>
            <span>{maquina.nome}</span>
            {maquina.demo && <small>MODELO ILUSTRATIVO</small>}
          </div>
        </Html>
      )}
    </group>
  );
}

/**
 * Componente raiz da cena: monta o Canvas, estrutura do setor, equipamentos e câmera.
 * A posição guardada em cada equipamento vence a posição inicial padrão após mover/salvar.
 */
type ModoCamera = "livre" | "pausada" | "cena";

export function CenaIndustrial({ ambiente, maquinas, maquinaSelecionadaId, aoSelecionar, aoMover }: Props) {
  const [modoCamera, setModoCamera] = useState<ModoCamera>("livre");
  const [arrastandoMaquina, setArrastandoMaquina] = useState(false);
  const mostrarRotulos = modoCamera !== "cena";
  const avancarModoCamera = () => {
    setModoCamera((atual) => (
      atual === "livre" ? "pausada" : atual === "pausada" ? "cena" : "livre"
    ));
  };
  const rotuloModoCamera =
    modoCamera === "livre" ? "Câmera livre" :
    modoCamera === "pausada" ? "Câmera pausada" :
    "Câmera da cena";
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
    maquina.posicaoY ?? 0,
    maquina.posicaoZ ?? posicoesPadrao[indice][2],
  ] as [number, number, number]));

  return (
    <div className={styles.canvasIndustrial}>
      {/* Canvas é a área de renderização. A câmera começa em perspectiva elevada para
          mostrar o piso e a estrutura sem impedir que se aproxime dos equipamentos. */}
      <Canvas shadows="percentage" dpr={[1, 1.8]} camera={{ position: [13, 11, 17], fov: 42, near: 0.1, far: 120 }}>
        <color attach="background" args={["#f7f6f3"]} />
        {/* Iluminação ambiente, luz direcional com sombras e luz de preenchimento. */}
        <ambientLight intensity={1.6} />
        <directionalLight position={[9, 16, 9]} intensity={2.1} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
        <directionalLight position={[-10, 8, -5]} intensity={0.7} />
        <hemisphereLight args={["#ffffff", "#d2cec7", 1.3]} />
        {ambiente === "industrial" ? <GalpaoIndustrial /> : ambiente === "escolar" ? <AmbienteEscolar /> : <AmbienteSaude />}
        {exibidas.map((maquina, indice) => (
          <Maquina3D
            key={maquina.id}
            maquina={maquina}
            posicao={posicoes[indice]}
            selecionada={maquinaSelecionadaId === maquina.id}
            aoSelecionar={aoSelecionar}
            aoMover={aoMover}
            aoIniciarArraste={setArrastandoMaquina}
            mostrarRotulo={mostrarRotulos}
          />
        ))}
        {/* A câmera gira/ aproxima quando o usuário arrasta o piso; fica desativada
            enquanto uma máquina está sendo movida para evitar conflito de gestos. */}
        <OrbitControls
          makeDefault
          enabled={modoCamera !== "pausada" && !arrastandoMaquina}
          autoRotate={modoCamera === "cena"}
          // autoRotateSpeed={0.65}
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
        onClick={avancarModoCamera}
        aria-label={`Modo atual: ${rotuloModoCamera}. Clique para alternar o modo da câmera.`}
        aria-pressed={modoCamera !== "pausada"}
        title={
          modoCamera === "livre" ? "Próximo modo: Câmera pausada" :
          modoCamera === "pausada" ? "Próximo modo: Câmera da cena (rotação automática, sem nomes)" :
          "Próximo modo: Câmera livre"
        }
      >
        {rotuloModoCamera}
      </button>
    </div>
  );
}