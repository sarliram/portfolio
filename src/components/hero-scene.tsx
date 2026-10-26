import { Environment, Lightformer, Sparkles } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import * as THREE from "three";
import Avatar from "@components/avatar";
import { heroGapPx, heroWideBreakpoint } from "@/lib/hero-layout";

const prefersReducedMotion =
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type SceneProps = {
  progressRef: RefObject<number>;
  textLeftRef: RefObject<number>;
  onAvatarMove?: (centerPx: number) => void;
};

const startCameraDistance = 6;
const fieldOfView = 45;
const worldHeightAtStart =
  2 * startCameraDistance * Math.tan(THREE.MathUtils.degToRad(fieldOfView / 2));

const easeInOut = (value: number) =>
  value < 0.5 ? 2 * value * value : 1 - Math.pow(-2 * value + 2, 2) / 2;

function Rig({ progressRef, textLeftRef, onAvatarMove }: SceneProps) {
  const stage = useRef<THREE.Group>(null);
  const smoothProgress = useRef(0);
  const easedProgress = useRef(0);
  const avatarScreenX = useRef(0);
  const { camera, viewport, size } = useThree();

  useFrame((_, delta) => {
    smoothProgress.current = THREE.MathUtils.damp(
      smoothProgress.current,
      progressRef.current ?? 0,
      6,
      delta,
    );
    const progress = easeInOut(smoothProgress.current);
    easedProgress.current = progress;
    const isWide = size.width >= heroWideBreakpoint;
    const wideScale = THREE.MathUtils.clamp((viewport.width / 7.9) * 1.12, 0.82, 1.12);

    if (stage.current) {
      const worldPerPixel = worldHeightAtStart / size.height;
      const headRadiusPx = (1.0 * wideScale) / worldPerPixel;
      const gapPx = heroGapPx(size.width);
      const textLeft = textLeftRef.current ?? 0;
      const anchoredCenterPx = Math.max(textLeft - gapPx - headRadiusPx, headRadiusPx + 40);
      const startX =
        isWide && textLeft > 0
          ? (anchoredCenterPx - size.width / 2) * worldPerPixel
          : viewport.width * (isWide ? -0.15 : -0.18);
      const startY = isWide ? Math.min(-0.42, -2.6 + 2.84 * wideScale) : viewport.height * 0.26;
      stage.current.position.x = THREE.MathUtils.lerp(startX, 0, progress);
      avatarScreenX.current = stage.current.position.x / (viewport.width / 2);
      onAvatarMove?.(size.width / 2 + (stage.current.position.x / viewport.width) * size.width);
      stage.current.position.y = THREE.MathUtils.lerp(startY, 0.6, progress);
      stage.current.rotation.y = THREE.MathUtils.lerp(0, 0.55, progress);
      const endScale = isWide ? Math.min(wideScale, 1) : 0.85;
      stage.current.scale.setScalar(
        THREE.MathUtils.lerp(isWide ? wideScale : 0.6, endScale, progress),
      );
    }

    camera.position.z = THREE.MathUtils.lerp(isWide ? 6 : 7.5, isWide ? 9.5 : 12, progress);
    camera.updateProjectionMatrix();
  });

  return (
    <group ref={stage}>
      <Avatar
        progressRef={easedProgress}
        screenXRef={avatarScreenX}
        reduceMotion={prefersReducedMotion}
      />
    </group>
  );
}

export default function HeroScene({ progressRef, textLeftRef, onAvatarMove }: SceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, startCameraDistance], fov: fieldOfView }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      aria-hidden
    >
      <ambientLight intensity={0.25} />
      <directionalLight position={[2.5, 3, 5]} intensity={1.6} color="#fff1e6" />
      <pointLight position={[-3, 2, -2.5]} intensity={60} color="#7c6cff" />
      <pointLight position={[3, -1, -2]} intensity={30} color="#7c6cff" />
      <Environment resolution={256} frames={1}>
        <Lightformer
          form="rect"
          intensity={2.2}
          color="#fff4ea"
          position={[0, 3, 5]}
          scale={[6, 3, 1]}
        />
        <Lightformer
          form="rect"
          intensity={3}
          color="#7c6cff"
          position={[-5, 1, -2]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[3, 6, 1]}
        />
        <Lightformer
          form="rect"
          intensity={0.2}
          color="#d4ff4f"
          position={[5, -1, 1]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[2, 3, 1]}
        />
      </Environment>
      <Rig progressRef={progressRef} textLeftRef={textLeftRef} onAvatarMove={onAvatarMove} />
      <Sparkles count={40} scale={12} size={1.6} speed={0.25} opacity={0.25} color="#b9b0ff" />
    </Canvas>
  );
}
