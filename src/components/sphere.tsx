'use client';

import {FC, useEffect, useMemo, useRef, useState} from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTheme } from '@/context/theme-context';

const RADIUS = 4.8;

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
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const scrollRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  });

  const [count, setCount] = useState<number>(3500);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Buffer geometry positions and color array (only recomputed on count change)
  const { initialPositions, targetPositions, initialColors } = useMemo(() => {
    const initial = new Float32Array(count * 3);
    const target = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const colorTitanium = new THREE.Color("#C5CCD6");
    const colorLime = new THREE.Color("#E2F163");

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Base Fibonacci sphere (clean, structured, elegant)
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;

      const r1 = 3.0 + Math.sin(phi * 4) * 0.15;
      initial[i3] = r1 * Math.cos(theta) * Math.sin(phi);
      initial[i3 + 1] = r1 * Math.sin(theta) * Math.sin(phi);
      initial[i3 + 2] = r1 * Math.cos(phi);

      // Target state on scroll: extended vortex / quantum collider
      const r2 = 3.8 + Math.cos(theta * 3) * 0.4;
      target[i3] = r2 * Math.cos(theta * 1.5) * Math.sin(phi);
      target[i3 + 1] = (r2 * 1.3) * Math.sin(theta * 1.5) * Math.sin(phi);
      target[i3 + 2] = (r2 * 0.8) * Math.cos(phi);

      const isAccent = (i % 4) === 0;
      const c = isAccent ? colorLime : colorTitanium;
      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
    }

    return { initialPositions: initial, targetPositions: target, initialColors: colors };
  }, [count]);

  // Target theme colors for smooth lerp
  const targetColors = useMemo(() => {
    const colors = new Float32Array(count * 3);
    const colorNeutral = isLight ? new THREE.Color("#8C95A0") : new THREE.Color("#C5CCD6");
    const colorAccent = isLight ? new THREE.Color("#3662E3") : new THREE.Color("#E2F163");

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const isAccent = (i % 4) === 0;
      const c = isAccent ? colorAccent : colorNeutral;
      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
    }
    return colors;
  }, [count, isLight]);

  useEffect(() => {
    const setPointCount = (): void => {
      const width = window.innerWidth;
      setIsMobile(width < 1024);
      if (width >= 768) {
        setCount(3500);
      } else {
        setCount(1600);
      }
    };

    window.addEventListener('resize', setPointCount);
    setPointCount();

    return () => window.removeEventListener('resize', setPointCount);
  }, []);

  useEffect(() => {
    const onScroll = (): void => {
      const doc = document.body;
      const max = doc.scrollHeight - window.innerHeight;
      scrollRef.current = THREE.MathUtils.clamp(
        max > 0 ? window.scrollY / max : 0,
        0,
        1
      );
    };

    const onMouseMove = (e: MouseEvent): void => {
      mouseRef.current.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;

    const scroll = scrollRef.current;
    const time = clock.elapsedTime;

    // Smooth cursor interpolation
    mouseRef.current.x = THREE.MathUtils.lerp(mouseRef.current.x, mouseRef.current.targetX, 0.05);
    mouseRef.current.y = THREE.MathUtils.lerp(mouseRef.current.y, mouseRef.current.targetY, 0.05);

    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;

    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      const baseX = THREE.MathUtils.lerp(initialPositions[i3], targetPositions[i3], scroll);
      const baseY = THREE.MathUtils.lerp(initialPositions[i3 + 1], targetPositions[i3 + 1], scroll);
      const baseZ = THREE.MathUtils.lerp(initialPositions[i3 + 2], targetPositions[i3 + 2], scroll);

      // Quantum wave oscillation
      const wave = Math.sin(time * 1.5 + baseX * 0.2 + baseY * 0.2) * 0.08 * (0.4 + scroll * 0.6);

      // Subtle cursor perturbation
      const dx = baseX - mx * 3;
      const dy = baseY - my * 3;
      const distSq = dx * dx + dy * dy;
      const repel = distSq < 9 ? (1 - Math.sqrt(distSq) / 3) * 0.3 : 0;

      pos[i3] = baseX + wave + dx * repel;
      pos[i3 + 1] = baseY + wave + dy * repel;
      pos[i3 + 2] = baseZ + wave;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;

    // Synchronize particle colors directly with theme snapshot
    const colAttr = pointsRef.current.geometry.attributes.color;
    if (colAttr) {
      const colArr = colAttr.array as Float32Array;
      let colNeedsUpdate = false;
      for (let i = 0; i < count * 3; i++) {
        if (colArr[i] !== targetColors[i]) {
          colArr[i] = targetColors[i];
          colNeedsUpdate = true;
        }
      }
      if (colNeedsUpdate) {
        colAttr.needsUpdate = true;
      }
    }

    // Atmospheric rotation
    pointsRef.current.rotation.y = time * 0.04 + mx * 0.2;
    pointsRef.current.rotation.x = time * 0.02 + my * 0.1;
  });

  const circleTexture = useMemo(() => createCircleTexture(), []);

  return (
    <points ref={pointsRef} position={isMobile ? [0, -1.2, -0.5] : [0.8, 0, 0]}>
      <bufferGeometry>
        {/* @ts-ignore */}
        <bufferAttribute
          attach="attributes-position"
          array={initialPositions.slice()}
          count={count}
          itemSize={3}
        />
        {/* @ts-ignore */}
        <bufferAttribute
          attach="attributes-color"
          array={initialColors}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>

      <pointsMaterial
        size={isMobile ? 0.013 : 0.016}
        transparent
        opacity={isMobile ? 0.35 : 0.65}
        vertexColors
        alphaMap={circleTexture}
        alphaTest={0.02}
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
      zIndex: -1,
    }}
  >
    <SpherePoints />
  </Canvas>
);

export default Sphere;
