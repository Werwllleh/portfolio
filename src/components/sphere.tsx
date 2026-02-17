'use client';

import {FC, useEffect, useMemo, useRef, useState} from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const RADIUS = 16;

function createCircleTexture() {
  const size = 64; // на мобилках лучше чуть больше
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, size, size);

  const r = size / 2;

  // плавный круг (soft edge) через radial gradient
  const g = ctx.createRadialGradient(r, r, 0, r, r, r);
  g.addColorStop(0.0, "rgba(255,255,255,1)");
  g.addColorStop(0.7, "rgba(255,255,255,1)");
  g.addColorStop(1.0, "rgba(255,255,255,0)");
  ctx.fillStyle = g;

  ctx.beginPath();
  ctx.arc(r, r, r, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);

  // важные настройки для мобилок
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  return texture;
}

const SpherePoints: FC = () => {
  const pointsRef = useRef<THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>>(null);

  const scrollRef = useRef<number>(0);
  const currentPositionsRef = useRef<Float32Array | null>(null);


  const [count, setCount] = useState<number>(10000);

  const { initialPositions, targetPositions } = useMemo(() => {
    const initial = new Float32Array(count * 3);
    const target = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // хаос
      initial[i3] = (Math.random() - 0.5) * 10;
      initial[i3 + 1] = (Math.random() - 0.5) * 10;
      initial[i3 + 2] = (Math.random() - 0.5) * 10;

      // сфера (Фибоначчи)
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;

      target[i3] = RADIUS * Math.cos(theta) * Math.sin(phi);
      target[i3 + 1] = RADIUS * Math.sin(theta) * Math.sin(phi);
      target[i3 + 2] = RADIUS * Math.cos(phi);
    }

    return { initialPositions: initial, targetPositions: target };
  }, []);

  useEffect(() => {
    const setPointCount = (): void => {
      const width = window.innerWidth;

      if (width >= 768) {
        setCount(10000)
      } else {
        setCount(8000)
      }
    }

    window.addEventListener('resize', setPointCount);
    setPointCount();

    return () => window.removeEventListener('resize', setPointCount);
  }, []);

  useEffect(() => {
    const onScroll = (): void => {
      const doc = document.body;
      const max = doc.scrollHeight - window.innerHeight;

      scrollRef.current = THREE.MathUtils.clamp(
        window.scrollY / max,
        0,
        1
      );
    };

    window.addEventListener('scroll', onScroll);
    onScroll();

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;

    const scroll = scrollRef.current;
    const time = clock.elapsedTime;

    const pos =
      pointsRef.current.geometry.attributes.position
        .array as Float32Array;

    // Инициализируем currentPositions при первом вызове
    if (!currentPositionsRef.current) {
      currentPositionsRef.current = new Float32Array(pos.length);
      currentPositionsRef.current.set(pos);
    }

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Всегда интерполируем между начальным и целевым состоянием
      const x = THREE.MathUtils.lerp(
        initialPositions[i3],
        targetPositions[i3],
        scroll
      );
      const y = THREE.MathUtils.lerp(
        initialPositions[i3 + 1],
        targetPositions[i3 + 1],
        scroll
      );
      const z = THREE.MathUtils.lerp(
        initialPositions[i3 + 2],
        targetPositions[i3 + 2],
        scroll
      );

      const wave = Math.sin(time * 2 + x + y + z) * 0.05 * scroll;

      pos[i3] = x + wave;
      pos[i3 + 1] = y + wave;
      pos[i3 + 2] = z + wave;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;

    pointsRef.current.rotation.y += 0.001;
    pointsRef.current.rotation.x += 0.0005;
  });

  const circleTexture = useMemo(() => createCircleTexture(), []);

  // @ts-ignore
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        {/*@ts-ignore*/}
        <bufferAttribute
          attach="attributes-position"
          array={initialPositions.slice()}
          count={count}
          // args={}
          itemSize={3}
        />
      </bufferGeometry>

      <pointsMaterial
        color={0x9ea1ff}
        size={0.02}
        transparent
        opacity={0.8}
        alphaMap={circleTexture}
        alphaTest={0.05}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

const Sphere: FC = () => (
  <Canvas
    camera={{ position: [0, 0, 6], fov: 75 }}
    gl={{ alpha: true, antialias: true }}
    dpr={[1, 2]}
    style={{
      position: 'fixed',
      inset: 0,
      pointerEvents: 'none',
    }}
  >
    <SpherePoints />
  </Canvas>
);

export default Sphere;
