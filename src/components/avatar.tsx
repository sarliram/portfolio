import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { avatarColors } from "@data";

const colors = avatarColors;

const headRadius = 0.85;
const headScale = new THREE.Vector3(1, 1.06, 0.96);
const upAxis = new THREE.Vector3(0, 1, 0);

const faceDepth = (x: number, y: number, lift = 0) => {
  const inside = headRadius ** 2 - (x / headScale.x) ** 2 - (y / headScale.y) ** 2;
  return Math.sqrt(Math.max(inside, 0)) * headScale.z + lift;
};

const torsoProfile = new THREE.SplineCurve([
  new THREE.Vector2(0.001, -0.8),
  new THREE.Vector2(0.42, -0.84),
  new THREE.Vector2(0.88, -0.98),
  new THREE.Vector2(1.12, -1.3),
  new THREE.Vector2(1.18, -1.9),
  new THREE.Vector2(1.13, -2.45),
  new THREE.Vector2(1.0, -2.78),
  new THREE.Vector2(0.001, -2.84),
])
  .getPoints(48)
  .reverse();

const hairClumps = [
  { position: [-0.5, 0.5, 0.46], rotation: [0.35, 0, 1.35], scale: [0.9, 1.05, 0.75] },
  { position: [-0.2, 0.6, 0.54], rotation: [0.45, 0, 1.25], scale: [1.05, 1.25, 0.8] },
  { position: [0.16, 0.6, 0.53], rotation: [0.45, 0, 1.1], scale: [1.05, 1.2, 0.8] },
  { position: [0.46, 0.46, 0.44], rotation: [0.35, 0, 0.75], scale: [0.85, 1, 0.72] },
  { position: [-0.05, 0.8, 0.3], rotation: [0.9, 0, 1.2], scale: [1.1, 1.3, 0.9] },
] as const;

function createScreenTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 320;
  const context = canvas.getContext("2d");
  if (context) {
    context.fillStyle = "#0d0c14";
    context.fillRect(0, 0, canvas.width, canvas.height);
    const palette = ["#d4ff4f", "#7c6cff", "#ecebe6", "#8b8b98"];
    for (let line = 0; line < 12; line++) {
      let x = 28 + (line % 4) * 22;
      const y = 28 + line * 23;
      const pieces = 2 + ((line * 7) % 4);
      for (let piece = 0; piece < pieces; piece++) {
        const width = 30 + ((line * 31 + piece * 57) % 110);
        context.fillStyle = palette[(line + piece) % palette.length];
        context.globalAlpha = 0.85;
        context.fillRect(x, y, width, 10);
        x += width + 12;
      }
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

type AvatarProps = {
  progressRef: RefObject<number>;
  screenXRef: RefObject<number>;
  reduceMotion: boolean;
};

const lidOpen = -0.55;
const lidClosed = 1.45;

export default function Avatar({ progressRef, screenXRef, reduceMotion }: AvatarProps) {
  const head = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const eyeballs = useRef<THREE.Group[]>([]);
  const lids = useRef<THREE.Mesh[]>([]);
  const arms = useRef<THREE.Mesh[]>([]);
  const hands = useRef<THREE.Mesh[]>([]);
  const laptop = useRef<THREE.Group>(null);
  const chair = useRef<THREE.Group>(null);
  const screen = useRef<THREE.MeshBasicMaterial>(null);
  const nextBlinkAt = useRef(2);
  const screenTexture = useMemo(() => createScreenTexture(), []);

  const shoulder = useMemo(() => new THREE.Vector3(), []);
  const hand = useMemo(() => new THREE.Vector3(), []);
  const restHand = useMemo(() => new THREE.Vector3(), []);
  const typingHand = useMemo(() => new THREE.Vector3(), []);
  const direction = useMemo(() => new THREE.Vector3(), []);

  const skin = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: colors.skin,
        roughness: 0.55,
        sheen: 0.6,
        sheenColor: new THREE.Color("#ffc2a6"),
        sheenRoughness: 0.6,
      }),
    [],
  );
  const skinShade = useMemo(
    () => new THREE.MeshStandardMaterial({ color: colors.skinShade, roughness: 0.6 }),
    [],
  );
  const hair = useMemo(
    () => new THREE.MeshStandardMaterial({ color: colors.hair, roughness: 0.55 }),
    [],
  );
  const hoodie = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: colors.hoodie,
        roughness: 0.9,
        sheen: 1,
        sheenColor: new THREE.Color("#6b5fb0"),
        sheenRoughness: 0.8,
      }),
    [],
  );
  const accent = useMemo(
    () => new THREE.MeshStandardMaterial({ color: colors.accent, roughness: 0.35, metalness: 0.2 }),
    [],
  );

  useFrame((state, delta) => {
    const progress = progressRef.current ?? 0;
    const time = state.clock.elapsedTime;
    const pointerX = THREE.MathUtils.clamp(state.pointer.x - (screenXRef.current ?? 0), -1, 1);
    const pointerY = state.pointer.y;
    const attention = 1 - progress;

    if (head.current) {
      const targetYaw = pointerX * 0.5 * attention - progress * 0.15;
      const targetPitch = -pointerY * 0.25 * attention + progress * 0.4;
      head.current.rotation.y = THREE.MathUtils.damp(head.current.rotation.y, targetYaw, 5, delta);
      head.current.rotation.x = THREE.MathUtils.damp(
        head.current.rotation.x,
        targetPitch,
        5,
        delta,
      );
      head.current.rotation.z = THREE.MathUtils.damp(
        head.current.rotation.z,
        -pointerX * 0.06 * attention,
        4,
        delta,
      );
      if (!reduceMotion) head.current.position.y = 0.3 + Math.sin(time * 1.6) * 0.012;
    }

    if (body.current) {
      if (!reduceMotion) body.current.scale.y = 1 + Math.sin(time * 1.6) * 0.008;
      body.current.rotation.y = THREE.MathUtils.damp(
        body.current.rotation.y,
        pointerX * 0.1 * attention,
        3,
        delta,
      );
    }

    eyeballs.current.forEach((eyeball) => {
      const gazeYaw = THREE.MathUtils.clamp(pointerX * attention, -1, 1) * 0.35;
      const gazePitch = THREE.MathUtils.clamp(-pointerY * attention + progress * 0.9, -1, 1) * 0.3;
      eyeball.rotation.y = THREE.MathUtils.damp(eyeball.rotation.y, gazeYaw, 12, delta);
      eyeball.rotation.x = THREE.MathUtils.damp(eyeball.rotation.x, gazePitch, 12, delta);
    });

    let lidTarget = lidOpen + progress * 0.35;
    if (!reduceMotion) {
      if (time > nextBlinkAt.current + 0.13) nextBlinkAt.current = time + 2.4 + Math.random() * 2.6;
      if (time > nextBlinkAt.current) lidTarget = lidClosed;
    }
    lids.current.forEach((lid) => {
      lid.rotation.x = THREE.MathUtils.damp(lid.rotation.x, lidTarget, 32, delta);
    });

    if (laptop.current) {
      laptop.current.position.y = THREE.MathUtils.lerp(-4.4, -1.6, progress);
      laptop.current.rotation.x = THREE.MathUtils.lerp(0.6, 0, progress);
      laptop.current.visible = progress > 0.02;
    }
    if (chair.current) chair.current.visible = progress > 0.2;
    if (screen.current)
      screen.current.opacity = THREE.MathUtils.clamp((progress - 0.4) * 2.5, 0, 1);

    arms.current.forEach((arm, index) => {
      const side = index === 0 ? -1 : 1;
      shoulder.set(side * 1.0, -1.28, 0);
      restHand.set(side * 1.2, -2.85, 0.15);
      const typingPhase = reduceMotion
        ? 0
        : Math.max(Math.sin(time * 14 + index * Math.PI), 0) * 0.07;
      typingHand.set(side * 0.42, -1.42 + typingPhase, 1.22);
      hand.lerpVectors(restHand, typingHand, THREE.MathUtils.smoothstep(progress, 0.25, 0.85));

      direction.subVectors(hand, shoulder);
      const length = Math.max(direction.length() - 0.2, 0.1);
      arm.position.copy(shoulder).addScaledVector(direction, 0.45);
      arm.scale.set(1, length / 0.9, 1);
      arm.quaternion.setFromUnitVectors(upAxis, direction.normalize());

      const handMesh = hands.current[index];
      if (handMesh) handMesh.position.copy(hand);
    });
  });

  return (
    <group>
      <group ref={body}>
        <mesh scale={[1, 1, 0.74]} material={hoodie}>
          <latheGeometry args={[torsoProfile, 64]} />
        </mesh>
        <group ref={chair} position={[0, -2.95, -0.05]} visible={false}>
          <mesh>
            <boxGeometry args={[1.9, 0.22, 1.5]} />
            <meshStandardMaterial color={colors.chair} roughness={0.7} />
          </mesh>
          <mesh position={[0, 1.15, -0.78]} rotation={[-0.08, 0, 0]}>
            <boxGeometry args={[1.8, 2.1, 0.2]} />
            <meshStandardMaterial color={colors.chair} roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.75, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 1.3, 12]} />
            <meshStandardMaterial color="#3a3650" metalness={0.6} roughness={0.35} />
          </mesh>
          {[0, 1, 2, 3, 4].map((spoke) => (
            <mesh
              key={`spoke-${spoke}`}
              position={[0, -1.38, 0]}
              rotation={[0, (spoke / 5) * Math.PI * 2, 0]}
            >
              <mesh position={[0.45, 0, 0]}>
                <boxGeometry args={[0.9, 0.08, 0.12]} />
                <meshStandardMaterial color="#3a3650" metalness={0.6} roughness={0.35} />
              </mesh>
            </mesh>
          ))}
        </group>
        <mesh
          position={[0, -0.86, -0.02]}
          rotation={[Math.PI / 2 - 0.12, 0, 0]}
          scale={[1, 1, 0.8]}
          material={hoodie}
        >
          <torusGeometry args={[0.42, 0.16, 20, 48]} />
        </mesh>
        <mesh position={[0, -0.78, -0.5]} scale={[1.05, 0.62, 0.55]} material={hoodie}>
          <sphereGeometry args={[0.6, 32, 24]} />
        </mesh>
        {[-0.13, 0.13].map((x) => (
          <group key={x} position={[x, -1.05, 0.8]} rotation={[0.12, 0, x * 0.4]}>
            <mesh position={[0, -0.2, 0]} material={accent}>
              <cylinderGeometry args={[0.018, 0.018, 0.4, 8]} />
            </mesh>
            <mesh position={[0, -0.42, 0]} material={accent}>
              <capsuleGeometry args={[0.03, 0.05, 4, 8]} />
            </mesh>
          </group>
        ))}
        <mesh position={[0.5, -1.65, 0.8]} rotation={[0.05, 0.42, 0]}>
          <torusGeometry args={[0.085, 0.024, 12, 32]} />
          <meshStandardMaterial
            color={colors.accent}
            emissive={colors.accent}
            emissiveIntensity={0.25}
          />
        </mesh>
        <mesh position={[0, -0.6, 0]} material={skinShade}>
          <cylinderGeometry args={[0.26, 0.29, 0.4, 24]} />
        </mesh>
        {[0, 1].map((index) => (
          <mesh
            key={`arm-${index}`}
            material={hoodie}
            ref={(mesh) => {
              if (mesh) arms.current[index] = mesh;
            }}
          >
            <capsuleGeometry args={[0.21, 0.9, 8, 16]} />
          </mesh>
        ))}
        {[0, 1].map((index) => (
          <mesh
            key={`hand-${index}`}
            material={skin}
            scale={[1, 0.85, 1.1]}
            ref={(mesh) => {
              if (mesh) hands.current[index] = mesh;
            }}
          >
            <sphereGeometry args={[0.17, 24, 24]} />
          </mesh>
        ))}
      </group>

      <group ref={head} position={[0, 0.3, 0]}>
        <mesh scale={headScale} material={skin}>
          <sphereGeometry args={[headRadius, 64, 64]} />
        </mesh>
        {[-1, 1].map((side) => (
          <group
            key={`ear-${side}`}
            position={[side * 0.82, 0.0, -0.04]}
            rotation={[0, side * 0.35, 0]}
          >
            <mesh scale={[0.45, 0.85, 0.7]} material={skin}>
              <sphereGeometry args={[0.2, 24, 24]} />
            </mesh>
            <mesh position={[side * 0.03, 0, 0.04]} scale={[0.25, 0.55, 0.4]} material={skinShade}>
              <sphereGeometry args={[0.2, 16, 16]} />
            </mesh>
          </group>
        ))}

        <mesh rotation={[-0.42, 0, 0]} scale={[1.05, 1.1, 1.05]} material={hair}>
          <sphereGeometry args={[headRadius, 48, 32, 0, Math.PI * 2, 0, Math.PI * 0.46]} />
        </mesh>
        <mesh rotation={[-1.25, 0, 0]} scale={[1.04, 1.08, 1.04]} material={hair}>
          <sphereGeometry args={[headRadius, 48, 32, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        </mesh>
        <mesh position={[0, 0.5, -0.05]} scale={[1.02, 0.6, 1]} material={hair}>
          <sphereGeometry args={[0.82, 40, 24]} />
        </mesh>
        {hairClumps.map((clump, index) => (
          <mesh
            key={`hair-${index}`}
            position={clump.position as unknown as [number, number, number]}
            rotation={clump.rotation as unknown as [number, number, number]}
            scale={clump.scale as unknown as [number, number, number]}
            material={hair}
          >
            <capsuleGeometry args={[0.2, 0.34, 10, 20]} />
          </mesh>
        ))}
        {[-1, 1].map((side) => (
          <mesh
            key={`sideburn-${side}`}
            position={[side * 0.76, 0.12, 0.22]}
            rotation={[0, 0, side * -0.15]}
            material={hair}
          >
            <capsuleGeometry args={[0.07, 0.22, 6, 12]} />
          </mesh>
        ))}

        {[-1, 1].map((side) => {
          const x = side * 0.28;
          const y = 0.02;
          return (
            <group key={`eye-${side}`} position={[x, y, faceDepth(x, y, -0.1)]}>
              <group
                ref={(group) => {
                  if (group) eyeballs.current[side < 0 ? 0 : 1] = group;
                }}
              >
                <mesh>
                  <sphereGeometry args={[0.165, 32, 32]} />
                  <meshPhysicalMaterial color="#fbfaf7" roughness={0.15} clearcoat={1} />
                </mesh>
                <mesh position={[0, 0, 0.13]} scale={[1, 1, 0.45]}>
                  <sphereGeometry args={[0.095, 32, 32]} />
                  <meshPhysicalMaterial color={colors.iris} roughness={0.2} clearcoat={1} />
                </mesh>
                <mesh position={[0, 0, 0.165]} scale={[1, 1, 0.4]}>
                  <sphereGeometry args={[0.05, 24, 24]} />
                  <meshBasicMaterial color="#0b0a0d" />
                </mesh>
                <mesh position={[0.035, 0.04, 0.175]}>
                  <sphereGeometry args={[0.018, 12, 12]} />
                  <meshBasicMaterial color="#ffffff" />
                </mesh>
              </group>
              <mesh
                rotation={[lidOpen, 0, 0]}
                material={skinShade}
                ref={(mesh) => {
                  if (mesh) lids.current[side < 0 ? 0 : 1] = mesh;
                }}
              >
                <sphereGeometry args={[0.178, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
              </mesh>
            </group>
          );
        })}

        {[-1, 1].map((side) => {
          const x = side * 0.3;
          const y = 0.25;
          return (
            <mesh
              key={`brow-${side}`}
              position={[x, y, faceDepth(x, y, 0.02)]}
              rotation={[-0.35, side * 0.25, side * -0.08]}
              material={hair}
            >
              <torusGeometry args={[0.16, 0.042, 10, 24, Math.PI * 0.55]} />
            </mesh>
          );
        })}

        {[-1, 1].map((side) => {
          const x = side * 0.46;
          const y = -0.22;
          return (
            <mesh
              key={`blush-${side}`}
              position={[x, y, faceDepth(x, y, -0.02)]}
              rotation={[0, side * 0.55, 0]}
              scale={[1, 0.6, 0.25]}
            >
              <sphereGeometry args={[0.12, 24, 16]} />
              <meshStandardMaterial
                color={colors.blush}
                roughness={0.7}
                transparent
                opacity={0.55}
              />
            </mesh>
          );
        })}

        <mesh
          position={[0, -0.13, faceDepth(0, -0.13, -0.02)]}
          scale={[0.85, 0.9, 1.1]}
          material={skin}
        >
          <sphereGeometry args={[0.095, 24, 24]} />
        </mesh>

        <group position={[0, -0.36, faceDepth(0, -0.36, -0.035)]} rotation={[-0.38, 0, 0]}>
          <mesh rotation={[0, 0, Math.PI]}>
            <torusGeometry args={[0.13, 0.03, 10, 32, Math.PI]} />
            <meshStandardMaterial color={colors.lips} roughness={0.5} />
          </mesh>
        </group>

        {[-1, 1].map((side) => {
          const x = side * 0.28;
          const y = 0.02;
          return (
            <group key={`lens-${side}`} position={[x, y, faceDepth(x, y, 0.1)]}>
              <mesh material={accent}>
                <torusGeometry args={[0.2, 0.022, 12, 48]} />
              </mesh>
              <mesh>
                <circleGeometry args={[0.2, 40]} />
                <meshPhysicalMaterial color="#ffffff" transparent opacity={0.08} roughness={0} />
              </mesh>
            </group>
          );
        })}
        <mesh
          position={[0, 0.05, faceDepth(0, 0.05, 0.12)]}
          rotation={[0, 0, Math.PI / 2]}
          material={accent}
        >
          <cylinderGeometry args={[0.016, 0.016, 0.17, 8]} />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh
            key={`temple-${side}`}
            position={[side * 0.63, 0.05, 0.42]}
            rotation={[0, -side * 0.75, 0]}
            material={accent}
          >
            <boxGeometry args={[0.025, 0.025, 0.5]} />
          </mesh>
        ))}
      </group>

      <group ref={laptop} position={[0, -4.4, 1.25]} visible={false}>
        <group position={[0, -0.075, 0.3]}>
          <mesh>
            <boxGeometry args={[3.8, 0.08, 1.3]} />
            <meshStandardMaterial color={colors.desk} roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.005, 0.652]}>
            <boxGeometry args={[3.8, 0.03, 0.01]} />
            <meshStandardMaterial
              color={colors.accent}
              emissive={colors.accent}
              emissiveIntensity={0.8}
            />
          </mesh>
          {[-1.75, 1.75].flatMap((x) =>
            [-0.5, 0.5].map((z) => (
              <mesh key={`leg-${x}-${z}`} position={[x, -1.05, z]}>
                <cylinderGeometry args={[0.035, 0.035, 2.05, 10]} />
                <meshStandardMaterial color={colors.desk} roughness={0.6} />
              </mesh>
            )),
          )}
        </group>
        <mesh>
          <boxGeometry args={[1.7, 0.07, 1.05]} />
          <meshStandardMaterial color={colors.laptop} metalness={0.3} roughness={0.35} />
        </mesh>
        <group position={[0, 0.03, 0.5]} rotation={[0.28, 0, 0]}>
          <mesh position={[0, 0.55, 0]}>
            <boxGeometry args={[1.7, 1.1, 0.05]} />
            <meshStandardMaterial color={colors.laptop} metalness={0.3} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.55, -0.03]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[1.56, 0.96]} />
            <meshBasicMaterial
              ref={screen}
              map={screenTexture}
              transparent
              opacity={0}
              toneMapped={false}
            />
          </mesh>
          <mesh position={[0, 0.58, 0.03]}>
            <torusGeometry args={[0.1, 0.025, 12, 32]} />
            <meshStandardMaterial
              color={colors.accentAlt}
              emissive={colors.accentAlt}
              emissiveIntensity={1.2}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
}
