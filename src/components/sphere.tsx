'use client';

import { FC, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '@/context/theme-context';

/* =========================================================================
   1. ASHIMA ARTS SIMPLEX NOISE GLSL
   ========================================================================= */
const NOISE_GLSL = `
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
vec4 permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float permute(float x) { return floor(mod(((x * 34.0) + 1.0) * x, 289.0)); }

vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float taylorInvSqrt(float r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 1.0 / 7.0;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;

/* =========================================================================
   2. 1D VALUE NOISE (FOR NATURAL IDLE FLOATING DRIFT)
   ========================================================================= */
class ValueNoise1D {
  private r: number[] = [];
  private mask = 255;
  private scale = 1;

  constructor() {
    for (let i = 0; i < 256; i++) {
      this.r.push(Math.random());
    }
  }

  getVal(x: number): number {
    const t = x * this.scale;
    const n = Math.floor(t);
    const frac = t - n;
    const smooth = frac * frac * (3 - 2 * frac);
    const a = n & this.mask;
    const b = (a + 1) & this.mask;
    return this.r[a] * (1 - smooth) + this.r[b] * smooth;
  }
}

/* =========================================================================
   3. FAST POISSON DISK SAMPLING (2D)
   ========================================================================= */
function generatePoissonPoints(
  width: number,
  height: number,
  density: number
): Float32Array {
  // Density mapping matching Antigravity:
  // density: [0, 300] -> minDistance: [10, 2], maxDistance: [11, 3]
  const mapRange = (val: number, inMin: number, inMax: number, outMin: number, outMax: number) =>
    ((val - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;

  const minDistance = mapRange(density, 0, 300, 10, 2);
  const maxDistance = mapRange(density, 0, 300, 11, 3);
  const maxTries = 20;

  const cellSize = minDistance / Math.SQRT2;
  const gridW = Math.ceil(width / cellSize);
  const gridH = Math.ceil(height / cellSize);
  const grid = new Int32Array(gridW * gridH).fill(-1);

  const points: [number, number][] = [];
  const active: [number, number][] = [];

  function addPoint(x: number, y: number) {
    const p: [number, number] = [x, y];
    const idx = points.length;
    points.push(p);
    active.push(p);
    const gx = Math.floor(x / cellSize);
    const gy = Math.floor(y / cellSize);
    if (gx >= 0 && gx < gridW && gy >= 0 && gy < gridH) {
      grid[gy * gridW + gx] = idx;
    }
    return p;
  }

  addPoint(width * 0.5, height * 0.5);

  const minSq = minDistance * minDistance;
  const delta = maxDistance - minDistance;

  while (active.length > 0) {
    const randIdx = Math.floor(Math.random() * active.length);
    const [px, py] = active[randIdx];
    let found = false;

    for (let t = 0; t < maxTries; t++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = minDistance + Math.random() * delta;
      const nx = px + Math.cos(angle) * dist;
      const ny = py + Math.sin(angle) * dist;

      if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;

      const gx = Math.floor(nx / cellSize);
      const gy = Math.floor(ny / cellSize);

      let ok = true;
      const minGx = Math.max(0, gx - 2);
      const maxGx = Math.min(gridW - 1, gx + 2);
      const minGy = Math.max(0, gy - 2);
      const maxGy = Math.min(gridH - 1, gy + 2);

      for (let y = minGy; y <= maxGy && ok; y++) {
        for (let x = minGx; x <= maxGx; x++) {
          const neighborIdx = grid[y * gridW + x];
          if (neighborIdx !== -1) {
            const [ox, oy] = points[neighborIdx];
            const dx = ox - nx;
            const dy = oy - ny;
            if (dx * dx + dy * dy < minSq) {
              ok = false;
              break;
            }
          }
        }
      }

      if (ok) {
        addPoint(nx, ny);
        found = true;
        break;
      }
    }

    if (!found) {
      active[randIdx] = active[active.length - 1];
      active.pop();
    }
  }

  // Convert to centered array [-250, 250]
  const data = new Float32Array(points.length * 2);
  const halfW = width * 0.5;
  const halfH = height * 0.5;
  for (let i = 0; i < points.length; i++) {
    data[i * 2 + 0] = points[i][0] - halfW;
    data[i * 2 + 1] = points[i][1] - halfH;
  }
  return data;
}

/* =========================================================================
   4. ANTIGRAVITY PARTICLES COMPONENT
   ========================================================================= */
const AntigravityParticles: FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const themeRef = useRef(theme);
  themeRef.current = theme;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.offsetWidth || window.innerWidth;
    const height = container.offsetHeight || window.innerHeight;

    const isMobile = window.innerWidth <= 768;
    const density = isMobile ? 130 : 230;
    const particlesScale = isMobile ? 0.65 : 0.59;
    const ringWidth = 0.011;
    const ringWidth2 = 0.107;
    const ringDisplacement = 0.53;

    // 1. Three.js Renderer
    const canvas = document.createElement('canvas');
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
      stencil: false,
      precision: 'highp',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(pixelRatio);
    renderer.setClearColor(0x000000, 0);

    // 2. Camera & Raycaster
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.z = 3.1;

    const scene = new THREE.Scene();

    const raycastPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(12.5, 12.5),
      new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide })
    );
    scene.add(raycastPlane);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const intersectionPoint = new THREE.Vector3();
    let isIntersecting = false;

    // 3. Poisson Points & Texture Generation
    const pointsData = generatePoissonPoints(500, 500, density);
    const count = pointsData.length / 2;
    const texSize = 256;
    const texLength = texSize * texSize;

    const posInitData = new Float32Array(texLength * 4);
    for (let i = 0; i < count; i++) {
      const idx = i * 4;
      posInitData[idx + 0] = pointsData[i * 2 + 0] * (1 / 250);
      posInitData[idx + 1] = pointsData[i * 2 + 1] * (1 / 250);
      posInitData[idx + 2] = 0;
      posInitData[idx + 3] = 0;
    }

    const posTex = new THREE.DataTexture(
      posInitData,
      texSize,
      texSize,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    posTex.needsUpdate = true;

    // 4. Ping-Pong Render Targets
    const rtOptions = {
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      depthBuffer: false,
      stencilBuffer: false,
    };

    let rt1 = new THREE.WebGLRenderTarget(texSize, texSize, rtOptions);
    let rt2 = new THREE.WebGLRenderTarget(texSize, texSize, rtOptions);

    renderer.setRenderTarget(rt1);
    renderer.clear();
    renderer.setRenderTarget(rt2);
    renderer.clear();
    renderer.setRenderTarget(null);

    // 5. GPGPU Simulation Scene & Material
    const simScene = new THREE.Scene();
    const simCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const ringPos = new THREE.Vector2(0, 0);
    const cursorPos = new THREE.Vector2(0, 0);
    const noise1D = new ValueNoise1D();

    const simMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uPosition: { value: posTex },
        uPosRefs: { value: posTex },
        uRingPos: { value: new THREE.Vector2(0, 0) },
        uRingRadius: { value: 0.2 },
        uDeltaTime: { value: 0 },
        uRingWidth: { value: ringWidth },
        uRingWidth2: { value: ringWidth2 },
        uRingDisplacement: { value: ringDisplacement },
        uTime: { value: 0 },
      },
      vertexShader: `
        void main() {
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;
        uniform sampler2D uPosition;
        uniform sampler2D uPosRefs;
        uniform vec2 uRingPos;
        uniform float uTime;
        uniform float uDeltaTime;
        uniform float uRingRadius;
        uniform float uRingWidth;
        uniform float uRingWidth2;
        uniform float uRingDisplacement;

        ${NOISE_GLSL}

        void main() {
          vec2 simTexCoords = gl_FragCoord.xy / vec2(${texSize.toFixed(1)}, ${texSize.toFixed(1)});
          vec4 pFrame = texture2D(uPosition, simTexCoords);

          float scale = pFrame.z;
          float velocity = pFrame.w;
          vec2 refPos = texture2D(uPosRefs, simTexCoords).xy;

          float time = uTime * 0.5;
          vec2 curentPos = refPos;

          vec2 pos = pFrame.xy;
          pos *= 0.8;

          float dist = distance(curentPos.xy, uRingPos);
          float noise0 = snoise(vec3(curentPos.xy * 0.2 + vec2(18.4924, 72.9744), time * 0.5));
          float dist1 = distance(curentPos.xy + (noise0 * 0.005), uRingPos);

          float t = smoothstep(uRingRadius - (uRingWidth * 2.0), uRingRadius, dist) - smoothstep(uRingRadius, uRingRadius + uRingWidth, dist1);
          float t2 = smoothstep(uRingRadius - (uRingWidth2 * 2.0), uRingRadius, dist) - smoothstep(uRingRadius, uRingRadius + uRingWidth2, dist1);
          float t3 = smoothstep(uRingRadius + uRingWidth2, uRingRadius, dist);

          t = pow(t, 2.0);
          t2 = pow(t2, 3.0);

          t += t2 * 3.0;
          t += t3 * 0.4;
          t += snoise(vec3(curentPos.xy * 30.0 + vec2(11.4924, 12.9744), time * 0.5)) * t3 * 0.5;

          float nS = snoise(vec3(curentPos.xy * 2.0 + vec2(18.4924, 72.9744), time * 0.5));
          t += pow((nS + 1.5) * 0.5, 2.0) * 0.6;

          // Mid scale noise
          float noise1 = snoise(vec3(curentPos.xy * 4.0 + vec2(88.494, 32.4397), time * 0.35));
          float noise2 = snoise(vec3(curentPos.xy * 4.0 + vec2(50.904, 120.947), time * 0.35));

          // Close scale noise
          float noise3 = snoise(vec3(curentPos.xy * 20.0 + vec2(18.4924, 72.9744), time * 0.5));
          float noise4 = snoise(vec3(curentPos.xy * 20.0 + vec2(50.904, 120.947), time * 0.5));

          vec2 disp = vec2(noise1, noise2) * 0.03;
          disp += vec2(noise3, noise4) * 0.005;

          // Sin wave
          disp.x += sin((refPos.x * 20.0) + (time * 4.0)) * 0.02 * clamp(dist, 0.0, 1.0);
          disp.y += cos((refPos.y * 20.0) + (time * 3.0)) * 0.02 * clamp(dist, 0.0, 1.0);

          pos -= (uRingPos - (curentPos + disp)) * pow(t2, 0.75) * uRingDisplacement;

          // Add scale
          float scaleDiff = t - scale;
          scaleDiff *= 0.2;
          scale += scaleDiff;

          // Final position
          vec2 finalPos = curentPos + disp + (pos * 0.25);

          velocity *= 0.5;
          velocity += scale * 0.25;

          vec4 frame = vec4(finalPos, scale, velocity);
          gl_FragColor = frame;
        }
      `,
    });

    const simQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), simMaterial);
    simScene.add(simQuad);

    // 6. Points Mesh & Render Material
    const renderGeometry = new THREE.BufferGeometry();
    const uvs = new Float32Array(count * 2);
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count * 4);

    for (let i = 0; i < count; i++) {
      const u = (i % texSize) / texSize;
      const v = Math.floor(i / texSize) / texSize;
      uvs[i * 2 + 0] = u;
      uvs[i * 2 + 1] = v;

      seeds[i * 4 + 0] = Math.random();
      seeds[i * 4 + 1] = Math.random();
      seeds[i * 4 + 2] = Math.random();
      seeds[i * 4 + 3] = Math.random();
    }

    renderGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    renderGeometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    renderGeometry.setAttribute('seeds', new THREE.BufferAttribute(seeds, 4));

    const initialTheme = themeRef.current;
    const isDark = initialTheme === 'dark';

    const color1Dark = new THREE.Color('#7189ff');
    const color2Dark = new THREE.Color('#387aff');
    const color3Dark = new THREE.Color('#253f9e');

    const color1Light = new THREE.Color('#2c64ed');
    const color2Light = new THREE.Color('#f84242');
    const color3Light = new THREE.Color('#ffcf03');

    let particleScale = (width / pixelRatio / 2000.0) * particlesScale;

    const renderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uPosition: { value: posTex },
        uTime: { value: 0 },
        uColor1: { value: isDark ? color1Dark.clone() : color1Light.clone() },
        uColor2: { value: isDark ? color2Dark.clone() : color2Light.clone() },
        uColor3: { value: isDark ? color3Dark.clone() : color3Light.clone() },
        uAlpha: { value: 1.0 },
        uRingPos: { value: ringPos },
        uRez: { value: new THREE.Vector2(canvas.width, canvas.height) },
        uParticleScale: { value: particleScale },
        uPixelRatio: { value: pixelRatio },
        uColorScheme: { value: isDark ? 0 : 1 },
      },
      vertexShader: `
        precision highp float;
        attribute vec4 seeds;

        uniform sampler2D uPosition;
        uniform float uTime;
        uniform float uParticleScale;
        uniform float uPixelRatio;
        uniform int uColorScheme;

        varying vec4 vSeeds;
        varying float vVelocity;
        varying vec2 vLocalPos;
        varying vec2 vScreenPos;
        varying float vScale;

        void main() {
          vec4 pos = texture2D(uPosition, uv);
          vSeeds = seeds;

          vVelocity = pos.w;
          vScale = pos.z;
          vLocalPos = pos.xy;
          vec4 viewSpace = modelViewMatrix * vec4(vec3(pos.xy, 0.0), 1.0);

          gl_Position = projectionMatrix * viewSpace;
          vScreenPos = gl_Position.xy;

          gl_PointSize = ((vScale * 7.0) * (uPixelRatio * 0.5) * uParticleScale);
        }
      `,
      fragmentShader: `
        precision highp float;

        varying vec4 vSeeds;
        varying vec2 vScreenPos;
        varying vec2 vLocalPos;
        varying float vScale;
        varying float vVelocity;

        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec3 uColor3;

        uniform vec2 uRingPos;
        uniform vec2 uRez;

        uniform float uAlpha;
        uniform float uTime;

        uniform int uColorScheme;

        ${NOISE_GLSL}

        #define PI 3.1415926535897932384626433832795

        float sdRoundBox(in vec2 p, in vec2 b, in vec4 r) {
          r.xy = (p.x > 0.0) ? r.xy : r.zw;
          r.x  = (p.y > 0.0) ? r.x  : r.y;
          vec2 q = abs(p) - b + r.x;
          return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r.x;
        }

        vec2 rotate(vec2 v, float a) {
          float s = sin(a);
          float c = cos(a);
          mat2 m = mat2(c, s, -s, c);
          return m * v;
        }

        void main() {
          float uBorderSize = 0.2;
          float ratio = uRez.x / uRez.y;

          // Noise
          float noiseAngle = snoise(vec3(vLocalPos * 10.0 + vec2(18.4924, 72.9744), uTime * 0.85));
          float noiseColor = snoise(vec3(vLocalPos * 2.0 + vec2(74.664, 91.556), uTime * 0.5));
          noiseColor = (noiseColor + 1.0) * 0.5;

          // Angle between particle and ring center
          float angle = atan(vLocalPos.y - uRingPos.y, vLocalPos.x - uRingPos.x);

          vec2 uv = gl_PointCoord.xy;
          uv -= vec2(0.5);
          uv.y *= -1.0;
          uv = rotate(uv, -angle + (noiseAngle * 0.5));

          float h = 0.8;
          float progress = smoothstep(0.0, 0.75, pow(noiseColor, 2.0));
          vec3 col = mix(
            mix(uColor1, uColor2, progress / h),
            mix(uColor2, uColor3, (progress - h) / (1.0 - h)),
            step(h, progress)
          );
          vec3 color = col;

          float dist = sqrt(dot(uv, uv));
          float dr = 0.5;
          float t = smoothstep(dr + (uBorderSize + 0.0001), dr - uBorderSize, dist);
          t = clamp(t, 0.0, 1.0);

          float rounded = sdRoundBox(uv, vec2(0.5, 0.2), vec4(0.25));
          rounded = smoothstep(0.1, 0.0, rounded);

          float a = uAlpha * rounded * smoothstep(0.1, 0.2, vScale);

          if (a < 0.01) {
            discard;
          }

          color = clamp(color, 0.0, 1.0);
          color = mix(color, color * clamp(vVelocity, 0.0, 1.0), float(uColorScheme));

          gl_FragColor = vec4(color, clamp(a, 0.0, 1.0));
        }
      `,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    const pointsMesh = new THREE.Points(renderGeometry, renderMaterial);
    pointsMesh.position.set(0, 0, 0);
    pointsMesh.scale.set(5, 5, 5);
    scene.add(pointsMesh);

    // 7. Interactive Mouse / Pointer Tracking
    const onPointerMove = (e: MouseEvent | PointerEvent) => {
      const clientX = e.clientX;
      const clientY = e.clientY;
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const normX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -((clientY - rect.top) / rect.height) * 2 + 1;

      if (normX >= -1.1 && normX <= 1.1 && normY >= -1.1 && normY <= 1.1) {
        mouse.set(normX, normY);
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObject(raycastPlane);
        if (hits.length > 0) {
          intersectionPoint.copy(hits[0].point);
          isIntersecting = true;
          return;
        }
      }
      isIntersecting = false;
    };

    const onPointerLeave = () => {
      isIntersecting = false;
    };

    window.addEventListener('mousemove', onPointerMove, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('mouseleave', onPointerLeave, { passive: true });

    // 8. Resize Handler
    const onResize = () => {
      if (!container) return;
      const newW = container.offsetWidth || window.innerWidth;
      const newH = container.offsetHeight || window.innerHeight;

      renderer.setSize(newW, newH);
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();

      particleScale = (newW / pixelRatio / 2000.0) * particlesScale;
      renderMaterial.uniforms.uRez.value.set(canvas.width, canvas.height);
      renderMaterial.uniforms.uPixelRatio.value = pixelRatio;
    };

    window.addEventListener('resize', onResize, { passive: true });

    // 9. Animation Loop
    let animationFrameId: number | null = null;
    let lastTime = performance.now() * 0.001;
    let simTime = 0;
    let everRendered = false;

    const render = () => {
      const now = performance.now() * 0.001;
      const dt = Math.min(Math.max(now - lastTime, 0), 0.1);
      lastTime = now;
      simTime += dt;

      // Update Theme Uniforms dynamically
      const currentTheme = themeRef.current;
      const curDark = currentTheme === 'dark';
      const targetC1 = curDark ? color1Dark : color1Light;
      const targetC2 = curDark ? color2Dark : color2Light;
      const targetC3 = curDark ? color3Dark : color3Light;
      const targetScheme = curDark ? 0 : 1;

      renderMaterial.uniforms.uColor1.value.lerp(targetC1, 0.08);
      renderMaterial.uniforms.uColor2.value.lerp(targetC2, 0.08);
      renderMaterial.uniforms.uColor3.value.lerp(targetC3, 0.08);
      renderMaterial.uniforms.uColorScheme.value = targetScheme;

      // Smoothly adapt ring parameters to theme
      const targetRingW = curDark ? 0.08 : 0.011;
      const targetRingW2 = curDark ? 0.06 : 0.107;
      const targetDisp = curDark ? 0.38 : 0.53;

      simMaterial.uniforms.uRingWidth.value = THREE.MathUtils.lerp(
        simMaterial.uniforms.uRingWidth.value,
        targetRingW,
        0.05
      );
      simMaterial.uniforms.uRingWidth2.value = THREE.MathUtils.lerp(
        simMaterial.uniforms.uRingWidth2.value,
        targetRingW2,
        0.05
      );
      simMaterial.uniforms.uRingDisplacement.value = THREE.MathUtils.lerp(
        simMaterial.uniforms.uRingDisplacement.value,
        targetDisp,
        0.05
      );

      // Gentle orbital drift
      const n = (noise1D.getVal(simTime * 0.66 + 94.234) - 0.5) * 2;
      const r = (noise1D.getVal(simTime * 0.75 + 21.028) - 0.5) * 2;

      if (isIntersecting) {
        cursorPos.set(
          intersectionPoint.x * 0.175 + n * 0.1,
          intersectionPoint.y * 0.175 + r * 0.1
        );
        ringPos.x += (cursorPos.x - ringPos.x) * 0.035;
        ringPos.y += (cursorPos.y - ringPos.y) * 0.035;
      } else {
        cursorPos.set(n * 0.2, r * 0.1);
        ringPos.x += (cursorPos.x - ringPos.x) * 0.015;
        ringPos.y += (cursorPos.y - ringPos.y) * 0.015;
      }

      // Update GPGPU Sim uniforms
      simMaterial.uniforms.uPosition.value = everRendered ? rt1.texture : posTex;
      simMaterial.uniforms.uTime.value = simTime;
      simMaterial.uniforms.uDeltaTime.value = dt;
      simMaterial.uniforms.uRingRadius.value =
        0.175 + Math.sin(simTime * 1.0) * 0.03 + Math.cos(simTime * 3.0) * 0.02;
      simMaterial.uniforms.uRingPos.value.copy(ringPos);

      // Render Sim step to rt2
      renderer.setRenderTarget(rt2);
      renderer.render(simScene, simCamera);
      renderer.setRenderTarget(null);

      // Render Points Mesh
      renderMaterial.uniforms.uPosition.value = everRendered ? rt2.texture : posTex;
      renderMaterial.uniforms.uTime.value = simTime;
      renderMaterial.uniforms.uRingPos.value.copy(ringPos);
      renderMaterial.uniforms.uParticleScale.value = particleScale;

      renderer.clear();
      renderer.render(scene, camera);

      // Swap ping-pong render targets
      const temp = rt1;
      rt1 = rt2;
      rt2 = temp;
      everRendered = true;

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    // 10. Pause on background tab to conserve energy
    const onVisibilityChange = () => {
      if (document.hidden) {
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      } else {
        if (animationFrameId === null) {
          lastTime = performance.now() * 0.001;
          animationFrameId = requestAnimationFrame(render);
        }
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    // 11. Cleanup
    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('mouseleave', onPointerLeave);
      window.removeEventListener('resize', onResize);

      raycastPlane.geometry.dispose();
      (raycastPlane.material as THREE.Material).dispose();

      simQuad.geometry.dispose();
      simMaterial.dispose();

      renderGeometry.dispose();
      renderMaterial.dispose();

      posTex.dispose();
      rt1.dispose();
      rt2.dispose();

      renderer.dispose();
      if (canvas.parentElement) {
        canvas.parentElement.removeChild(canvas);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: -1,
        overflow: 'hidden',
      }}
    />
  );
};

export default AntigravityParticles;
