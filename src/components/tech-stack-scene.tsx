import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

type Palette = { background: string; text: string };

const palettes: Palette[] = [
  { background: "#ecebe6", text: "#0a0a0c" },
  { background: "#ecebe6", text: "#0a0a0c" },
  { background: "#d4ff4f", text: "#0a0a0c" },
  { background: "#ecebe6", text: "#0a0a0c" },
  { background: "#7c6cff", text: "#ecebe6" },
];

type Ball = {
  label: string;
  radius: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  texture: THREE.CanvasTexture;
};

type PointerState = { active: boolean; burst: number };

function createLabelTexture(label: string, palette: Palette) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  if (context) {
    context.fillStyle = palette.background;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = palette.text;
    context.textAlign = "center";
    context.textBaseline = "middle";
    const words = label.split(" ");
    const lines =
      words.length > 1 && label.length > 9
        ? [
            words.slice(0, Math.ceil(words.length / 2)).join(" "),
            words.slice(Math.ceil(words.length / 2)).join(" "),
          ]
        : [label];
    let fontSize = 48;
    const maxWidth = 150;
    const widestLine = () => Math.max(...lines.map((line) => context.measureText(line).width));
    context.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;
    while (widestLine() > maxWidth && fontSize > 18) {
      fontSize -= 2;
      context.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;
    }
    const lineHeight = fontSize * 1.05;
    const centerX = canvas.width * 0.25;
    const firstLineY = canvas.height / 2 - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((line, lineIndex) =>
      context.fillText(line, centerX, firstLineY + lineIndex * lineHeight),
    );
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

const clusterScale = (viewportWidth: number) => Math.min(1, viewportWidth / 11);

function Balls({
  labels,
  pointerState,
  active,
}: {
  labels: string[];
  pointerState: RefObject<PointerState>;
  active: boolean;
}) {
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const { viewport } = useThree();
  const lastBurst = useRef(0);
  const reduceMotion = useMemo(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  const balls = useMemo<Ball[]>(
    () =>
      labels.map((label, index) => {
        const radius = 0.62 + ((index * 37) % 10) / 40;
        const angle = (index / labels.length) * Math.PI * 2;
        const start = reduceMotion
          ? new THREE.Vector3(Math.cos(angle) * 2, Math.sin(angle) * 1.5, 0)
          : new THREE.Vector3(
              (Math.random() - 0.5) * 10,
              5.5 + Math.random() * 4,
              (Math.random() - 0.5) * 2,
            );
        return {
          label,
          radius,
          position: start,
          velocity: new THREE.Vector3(),
          texture: createLabelTexture(label, palettes[index % palettes.length]),
        };
      }),
    [labels, reduceMotion],
  );

  useEffect(() => () => balls.forEach((ball) => ball.texture.dispose()), [balls]);

  const pointerWorld = useMemo(() => new THREE.Vector3(), []);
  const offset = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, frameDelta) => {
    if (!active) return;
    const delta = Math.min(frameDelta, 1 / 30);
    const pointer = pointerState.current;
    const fit = clusterScale(viewport.width);
    pointerWorld.set(
      (state.pointer.x * viewport.width) / 2 / fit,
      (state.pointer.y * viewport.height) / 2 / fit,
      0,
    );

    if (pointer && pointer.burst !== lastBurst.current) {
      lastBurst.current = pointer.burst;
      balls.forEach((ball) => {
        offset.copy(ball.position).sub(pointerWorld);
        const distance = Math.max(offset.length(), 0.3);
        ball.velocity.addScaledVector(offset.normalize(), 22 / distance);
      });
    }

    balls.forEach((ball) => {
      ball.velocity.x += -ball.position.x * 8 * delta;
      ball.velocity.y += -ball.position.y * 8 * delta;
      ball.velocity.z += -ball.position.z * 12 * delta;

      if (pointer?.active && !reduceMotion) {
        offset.copy(ball.position).sub(pointerWorld);
        offset.z = 0;
        const distance = offset.length();
        const reach = 1.8;
        if (distance < reach && distance > 0.001) {
          ball.velocity.addScaledVector(offset.normalize(), (1 - distance / reach) * 90 * delta);
        }
      }

      ball.velocity.multiplyScalar(Math.pow(0.02, delta));
    });

    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        const first = balls[i];
        const second = balls[j];
        offset.copy(second.position).sub(first.position);
        const distance = offset.length();
        const minimum = first.radius + second.radius;
        if (distance < minimum && distance > 0.0001) {
          const normal = offset.divideScalar(distance);
          const overlap = (minimum - distance) / 2;
          first.position.addScaledVector(normal, -overlap);
          second.position.addScaledVector(normal, overlap);
          const approachSpeed = second.velocity.dot(normal) - first.velocity.dot(normal);
          if (approachSpeed < 0) {
            first.velocity.addScaledVector(normal, approachSpeed * 0.9);
            second.velocity.addScaledVector(normal, -approachSpeed * 0.9);
          }
        }
      }
    }

    balls.forEach((ball, index) => {
      ball.position.addScaledVector(ball.velocity, delta);
      const mesh = meshes.current[index];
      if (!mesh) return;
      mesh.position.copy(ball.position);
      mesh.rotation.y = THREE.MathUtils.damp(
        mesh.rotation.y,
        THREE.MathUtils.clamp(ball.velocity.x * 0.12, -0.6, 0.6),
        4,
        delta,
      );
      mesh.rotation.x = THREE.MathUtils.damp(
        mesh.rotation.x,
        THREE.MathUtils.clamp(-ball.velocity.y * 0.12, -0.6, 0.6),
        4,
        delta,
      );
    });
  });

  return (
    <group scale={clusterScale(viewport.width)}>
      {balls.map((ball, index) => (
        <mesh
          key={ball.label}
          ref={(mesh) => {
            meshes.current[index] = mesh;
          }}
          position={ball.position}
          scale={ball.radius}
        >
          <sphereGeometry args={[1, 48, 48]} />
          <meshStandardMaterial map={ball.texture} roughness={0.35} metalness={0.05} />
        </mesh>
      ))}
    </group>
  );
}

export default function TechStackScene({
  labels,
  pointerState,
  active,
}: {
  labels: string[];
  pointerState: RefObject<PointerState>;
  active: boolean;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 14], fov: 35 }}
      dpr={[1, 2]}
      frameloop={active ? "always" : "demand"}
      gl={{ antialias: true, alpha: true }}
      aria-hidden
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 6, 8]} intensity={2.4} />
      <pointLight position={[-6, -4, 4]} intensity={60} color="#7c6cff" />
      <pointLight position={[6, -2, 3]} intensity={30} color="#d4ff4f" />
      <Balls labels={labels} pointerState={pointerState} active={active} />
    </Canvas>
  );
}

export type { PointerState };
