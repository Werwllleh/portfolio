'use client';

import { FC, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const COUNT = 10000;
const RADIUS = 2.5;

const SpherePoints: FC = () => {
  const pointsRef = useRef<THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>>(null);

  const scrollRef = useRef<number>(0);
  const currentPositionsRef = useRef<Float32Array | null>(null);

  const { initialPositions, targetPositions } = useMemo(() => {
    const initial = new Float32Array(COUNT * 3);
    const target = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;

      // хаос
      initial[i3] = (Math.random() - 0.5) * 10;
      initial[i3 + 1] = (Math.random() - 0.5) * 10;
      initial[i3 + 2] = (Math.random() - 0.5) * 10;

      // сфера (Фибоначчи)
      const phi = Math.acos(-1 + (2 * i) / COUNT);
      const theta = Math.sqrt(COUNT * Math.PI) * phi;

      target[i3] = RADIUS * Math.cos(theta) * Math.sin(phi);
      target[i3 + 1] = RADIUS * Math.sin(theta) * Math.sin(phi);
      target[i3 + 2] = RADIUS * Math.cos(phi);
    }

    return { initialPositions: initial, targetPositions: target };
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

    for (let i = 0; i < COUNT; i++) {
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

      // лёгкое дыхание (как в оригинале)
      const wave = Math.sin(time * 2 + x + y + z) * 0.05 * scroll;

      pos[i3] = x + wave;
      pos[i3 + 1] = y + wave;
      pos[i3 + 2] = z + wave;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;

    pointsRef.current.rotation.y += 0.001;
    pointsRef.current.rotation.x += 0.0005;
  });

  // @ts-ignore
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={initialPositions.slice()}
          count={COUNT}
          // args={}
          itemSize={3}
        />
      </bufferGeometry>

      <pointsMaterial
        color={0xff4d00}
        size={0.02}
        transparent
        opacity={0.8}
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