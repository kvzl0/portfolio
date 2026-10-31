// 3D centerpiece: a network of nodes that grows with the scroll story.
// One packet at localhost -> a small hub -> a network -> three stacked
// layers (one per skills chapter) -> a cloud -> three hackathon clusters
// -> a ring for "Let's deploy". Teal is the only color.
import * as THREE from "three";

const canvas = document.querySelector(".stage__canvas");
const story = document.querySelector(".story");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const N = 180; // nodes
const P = 40; // travelling packets
const BASE_SIZE = 0.16;
const DIM = [0.46, 0.46, 0.45];
const TEAL = [0x4d / 255, 0x95 / 255, 0xae / 255];
const TEAL_HOT = [TEAL[0] * 1.9, TEAL[1] * 1.75, TEAL[2] * 1.7];
const PACKET = [0.78, 0.95, 1.0];

// Small seeded random so the layout is the same on every visit.
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260319);

function randInSphere(r) {
  let x, y, z;
  do {
    x = rand() * 2 - 1;
    y = rand() * 2 - 1;
    z = rand() * 2 - 1;
  } while (x * x + y * y + z * z > 1);
  return [x * r, y * r, z * r];
}

function onSphere(r) {
  const u = rand() * 2 - 1;
  const a = rand() * Math.PI * 2;
  const s = Math.sqrt(1 - u * u);
  return [s * Math.cos(a) * r, u * r, s * Math.sin(a) * r];
}

function tiltX(p, ang) {
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c];
}

// A layout is a target position, size and teal amount for every node.
function makeLayout(edge, maxLen) {
  return {
    pos: new Float32Array(N * 3),
    vis: new Float32Array(N),
    hi: new Float32Array(N),
    edge,
    maxLen,
  };
}

function put(l, i, p) {
  l.pos[i * 3] = p[0];
  l.pos[i * 3 + 1] = p[1];
  l.pos[i * 3 + 2] = p[2];
}

function buildLayouts() {
  const L = [];

  // 0. Opening: a single glowing packet at localhost.
  const l0 = makeLayout(0, 1);
  l0.vis[0] = 4.5;
  l0.hi[0] = 1;
  L.push(l0);

  // 1. The packet: a hub with six links.
  const l1 = makeLayout(0.7, 1.7);
  l1.vis[0] = 2.6;
  l1.hi[0] = 1;
  for (let i = 1; i <= 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    put(l1, i, [Math.cos(a) * 1.25, Math.sin(a) * 1.25, (rand() - 0.5) * 0.6]);
    l1.vis[i] = 1.2;
    l1.hi[i] = 0.45;
  }
  L.push(l1);

  // 2. The network: 60 nodes in a loose sphere.
  const l2 = makeLayout(0.4, 1.5);
  l2.vis[0] = 1.8;
  l2.hi[0] = 1;
  for (let i = 1; i < 60; i++) {
    const p = randInSphere(1);
    const len = Math.hypot(p[0], p[1], p[2]) || 1;
    const r = 1.0 + 1.4 * Math.sqrt(len);
    put(l2, i, [(p[0] / len) * r, (p[1] / len) * r * 0.85, (p[2] / len) * r]);
    l2.vis[i] = 1;
    l2.hi[i] = rand() < 0.25 ? 0.8 : 0.12;
  }
  L.push(l2);

  // 3-5. Skills: three stacked layers, one lit per chapter.
  for (let k = 0; k < 3; k++) {
    const l = makeLayout(0.28, 1.0);
    for (let i = 0; i < N; i++) {
      const layer = i % 3;
      const j = Math.floor(i / 3);
      const r = 0.35 + 1.95 * Math.sqrt((j + 0.5) / 60);
      const a = j * 2.39996; // golden angle
      put(l, i, tiltX([Math.cos(a) * r, 1.2 - layer * 1.2, Math.sin(a) * r], 0.42));
      const on = layer === k;
      l.vis[i] = on ? 1.25 : 0.65;
      l.hi[i] = on ? 1 : 0.06;
    }
    L.push(l);
  }

  // 6. Projects: everything forms a cloud.
  const blobs = [
    [-1.35, -0.15, 0, 1.05],
    [0, 0.4, 0, 1.45],
    [1.4, -0.1, 0, 1.0],
    [0.55, -0.5, 0.35, 0.85],
    [-0.6, -0.55, 0.3, 0.85],
  ];
  const total = blobs.reduce((s, b) => s + b[3] * b[3], 0);
  const l6 = makeLayout(0.32, 1.0);
  for (let i = 0; i < N; i++) {
    let p;
    let tries = 0;
    do {
      let pick = rand() * total;
      let b = blobs[0];
      for (const bb of blobs) {
        pick -= bb[3] * bb[3];
        if (pick <= 0) { b = bb; break; }
      }
      const s = onSphere(b[3]);
      p = [s[0] + b[0], Math.max(s[1] + b[1], -0.95), s[2] + b[2]];
      tries++;
    } while (
      tries < 30 &&
      blobs.some((b) => Math.hypot(p[0] - b[0], p[1] - b[1], p[2] - b[2]) < b[3] - 0.08)
    );
    put(l6, i, p);
    l6.vis[i] = 1;
    l6.hi[i] = 0.25 + rand() * 0.75;
  }
  L.push(l6);

  // 7. Hackathons: three clusters, the newest one lit brightest.
  const centers = [
    [0, 1.25, 0],
    [-1.7, -0.85, 0],
    [1.7, -0.85, 0],
  ];
  const l7 = makeLayout(0.4, 0.9);
  for (let i = 0; i < N; i++) {
    const c = centers[i % 3];
    const p = randInSphere(0.8);
    put(l7, i, [c[0] + p[0], c[1] + p[1], c[2] + p[2]]);
    l7.vis[i] = 1;
    l7.hi[i] = i % 3 === 0 ? 1 : 0.5;
  }
  L.push(l7);

  // 8. Contact: one ring, everything connected.
  const l8 = makeLayout(0.6, 0.6);
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const r = 2.25 + (rand() - 0.5) * 0.18;
    put(l8, i, tiltX([Math.cos(a) * r, Math.sin(a) * r, (rand() - 0.5) * 0.25], 0.45));
    l8.vis[i] = 0.9;
    l8.hi[i] = 0.9;
  }
  L.push(l8);

  return L;
}

// Edges: each node's two nearest neighbours in every layout, plus hub spokes.
// Edges fade out when they get long, so each layout only shows its own links.
function buildEdges(L) {
  const keys = new Set();
  const add = (a, b) => {
    if (a !== b) keys.add(a < b ? a * N + b : b * N + a);
  };
  for (let i = 1; i <= 6; i++) {
    add(0, i);
    add(i, (i % 6) + 1);
  }
  for (let li = 2; li < L.length; li++) {
    const l = L[li];
    const idx = [];
    for (let i = 0; i < N; i++) if (l.vis[i] > 0) idx.push(i);
    for (const i of idx) {
      let b1 = -1, b2 = -1, d1 = Infinity, d2 = Infinity;
      for (const j of idx) {
        if (i === j) continue;
        const dx = l.pos[i * 3] - l.pos[j * 3];
        const dy = l.pos[i * 3 + 1] - l.pos[j * 3 + 1];
        const dz = l.pos[i * 3 + 2] - l.pos[j * 3 + 2];
        const d = dx * dx + dy * dy + dz * dz;
        if (d < d1) { d2 = d1; b2 = b1; d1 = d; b1 = j; }
        else if (d < d2) { d2 = d; b2 = j; }
      }
      if (b1 >= 0) add(i, b1);
      if (b2 >= 0) add(i, b2);
    }
  }
  return Array.from(keys, (k) => [Math.floor(k / N), k % N]);
}

const pointVertex = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  uniform float uScale;
  varying vec3 vColor;
  void main() {
    vColor = aColor;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uScale / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const pointFragment = /* glsl */ `
  varying vec3 vColor;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;
    float core = smoothstep(0.32, 0.0, d);
    float glow = pow(1.0 - d, 2.4) * 0.5;
    vec3 c = vColor * (core + glow);
    // Premultiplied output so the transparent canvas blends cleanly.
    gl_FragColor = vec4(c, clamp(max(c.r, max(c.g, c.b)), 0.0, 1.0));
  }
`;

const lineVertex = /* glsl */ `
  attribute vec4 aColor;
  varying vec4 vColor;
  void main() {
    vColor = aColor;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const lineFragment = /* glsl */ `
  varying vec4 vColor;
  void main() {
    gl_FragColor = vec4(vColor.rgb * vColor.a, vColor.a);
  }
`;

function init() {
  if (!canvas || !story) return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (e) {
    return; // No WebGL: the page keeps its gradient background.
  }
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0, 9);
  const group = new THREE.Group();
  scene.add(group);

  const layouts = buildLayouts();
  const edges = buildEdges(layouts);
  const E = edges.length;
  const last = layouts.length - 1;

  const phase = new Float32Array(N);
  for (let i = 0; i < N; i++) phase[i] = rand() * Math.PI * 2;

  // Nodes
  const nodePos = new Float32Array(N * 3);
  const nodeSize = new Float32Array(N);
  const nodeColor = new Float32Array(N * 3);
  const nodeHi = new Float32Array(N);
  const nodeVis = new Float32Array(N);
  const nodeGeo = new THREE.BufferGeometry();
  nodeGeo.setAttribute("position", new THREE.BufferAttribute(nodePos, 3).setUsage(THREE.DynamicDrawUsage));
  nodeGeo.setAttribute("aSize", new THREE.BufferAttribute(nodeSize, 1).setUsage(THREE.DynamicDrawUsage));
  nodeGeo.setAttribute("aColor", new THREE.BufferAttribute(nodeColor, 3).setUsage(THREE.DynamicDrawUsage));

  const uniforms = { uScale: { value: 1 } };
  const pointMat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: pointVertex,
    fragmentShader: pointFragment,
    transparent: true,
    premultipliedAlpha: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const nodes = new THREE.Points(nodeGeo, pointMat);
  nodes.frustumCulled = false;

  // Edges
  const linePos = new Float32Array(E * 6);
  const lineColor = new Float32Array(E * 8);
  const edgeAlpha = new Float32Array(E);
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute("position", new THREE.BufferAttribute(linePos, 3).setUsage(THREE.DynamicDrawUsage));
  lineGeo.setAttribute("aColor", new THREE.BufferAttribute(lineColor, 4).setUsage(THREE.DynamicDrawUsage));
  const lineMat = new THREE.ShaderMaterial({
    vertexShader: lineVertex,
    fragmentShader: lineFragment,
    transparent: true,
    premultipliedAlpha: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  lines.frustumCulled = false;

  // Packets travelling along visible edges
  const packets = Array.from({ length: P }, () => ({ e: -1, t: 1, s: 0, dir: 1 }));
  const pkPos = new Float32Array(P * 3);
  const pkSize = new Float32Array(P);
  const pkColor = new Float32Array(P * 3);
  for (let i = 0; i < P; i++) pkColor.set(PACKET, i * 3);
  const pkGeo = new THREE.BufferGeometry();
  pkGeo.setAttribute("position", new THREE.BufferAttribute(pkPos, 3).setUsage(THREE.DynamicDrawUsage));
  pkGeo.setAttribute("aSize", new THREE.BufferAttribute(pkSize, 1).setUsage(THREE.DynamicDrawUsage));
  pkGeo.setAttribute("aColor", new THREE.BufferAttribute(pkColor, 3));
  const pkPoints = new THREE.Points(pkGeo, pointMat);
  pkPoints.frustumCulled = false;

  group.add(lines, nodes, pkPoints);

  // Layout of the scene on the screen: right side on desktop, top on phones.
  const placement = { x: 2.4, y: 0, z: 9, scale: 1 };
  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    const pr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(pr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    uniforms.uScale.value = (h * pr) / (2 * halfH);

    if (w < 768) {
      // Phone: scene sits in the top half above the pinned text.
      placement.x = 0;
      placement.y = 2.1;
      placement.z = camera.aspect < 0.7 ? 15 : 12;
      placement.scale = 0.8;
    } else if (camera.aspect < 1.25) {
      placement.x = 1.6;
      placement.y = 0.4;
      placement.z = 11;
      placement.scale = 1;
    } else {
      placement.x = 2.3;
      placement.y = 0;
      placement.z = 9;
      placement.scale = 0.85;
    }
  }
  resize();
  window.addEventListener("resize", resize);

  let mx = 0, my = 0, tmx = 0, tmy = 0;
  window.addEventListener("pointermove", (ev) => {
    tmx = ev.clientX / window.innerWidth - 0.5;
    tmy = ev.clientY / window.innerHeight - 0.5;
  }, { passive: true });

  let cur = window.storyProgress || 0;
  let t = 0;
  let prev = performance.now();
  let shown = false;

  const lerp = (a, b, f) => a + (b - a) * f;
  const ease = (x) => x * x * (3 - 2 * x);

  function respawn(p) {
    for (let tries = 0; tries < 14; tries++) {
      const e = Math.floor(rand() * E);
      if (edgeAlpha[e] > 0.15) {
        p.e = e;
        p.t = 0;
        p.s = 0.35 + rand() * 0.65;
        p.dir = rand() < 0.5 ? 1 : -1;
        return;
      }
    }
    p.e = -1;
    p.t = 0;
    p.s = 1;
  }

  function frame(now) {
    const dt = Math.min((now - prev) / 1000, 0.05);
    prev = now;
    if (!reduceMotion) t += dt;

    const target = window.storyProgress || 0;
    cur = reduceMotion ? target : cur + (target - cur) * Math.min(1, dt * 4);
    const i0 = Math.min(Math.floor(cur), last);
    const i1 = Math.min(i0 + 1, last);
    const f = ease(Math.min(1, Math.max(0, cur - i0)));
    const A = layouts[i0];
    const B = layouts[i1];
    const edgeLevel = lerp(A.edge, B.edge, f);
    const maxLen = lerp(A.maxLen, B.maxLen, f);
    const wobble = reduceMotion ? 0 : 0.045;
    const openingPulse = Math.max(0, 1 - cur);

    for (let i = 0; i < N; i++) {
      const k = i * 3;
      const ph = phase[i];
      nodePos[k] = lerp(A.pos[k], B.pos[k], f) + Math.sin(t * 0.7 + ph) * wobble;
      nodePos[k + 1] = lerp(A.pos[k + 1], B.pos[k + 1], f) + Math.cos(t * 0.6 + ph * 1.3) * wobble;
      nodePos[k + 2] = lerp(A.pos[k + 2], B.pos[k + 2], f) + Math.sin(t * 0.5 + ph * 0.7) * wobble;
      const vis = lerp(A.vis[i], B.vis[i], f);
      const hi = lerp(A.hi[i], B.hi[i], f);
      nodeVis[i] = vis;
      nodeHi[i] = hi;
      let size = BASE_SIZE * vis * (1 + hi * 0.5);
      if (i === 0) size *= 1 + 0.25 * openingPulse * Math.sin(t * 2.2);
      nodeSize[i] = size;
      nodeColor[k] = lerp(DIM[0], TEAL_HOT[0], hi);
      nodeColor[k + 1] = lerp(DIM[1], TEAL_HOT[1], hi);
      nodeColor[k + 2] = lerp(DIM[2], TEAL_HOT[2], hi);
    }

    for (let e = 0; e < E; e++) {
      const a = edges[e][0];
      const b = edges[e][1];
      const ka = a * 3;
      const kb = b * 3;
      const dx = nodePos[ka] - nodePos[kb];
      const dy = nodePos[ka + 1] - nodePos[kb + 1];
      const dz = nodePos[ka + 2] - nodePos[kb + 2];
      const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const lenFade = Math.min(1, Math.max(0, (maxLen - len) / 0.45));
      const alpha = edgeLevel * Math.min(1, nodeVis[a], nodeVis[b]) * lenFade;
      edgeAlpha[e] = alpha;
      const o = e * 6;
      linePos[o] = nodePos[ka];
      linePos[o + 1] = nodePos[ka + 1];
      linePos[o + 2] = nodePos[ka + 2];
      linePos[o + 3] = nodePos[kb];
      linePos[o + 4] = nodePos[kb + 1];
      linePos[o + 5] = nodePos[kb + 2];
      const hi = (nodeHi[a] + nodeHi[b]) * 0.5;
      const r = lerp(DIM[0], TEAL[0] * 1.4, hi);
      const g = lerp(DIM[1], TEAL[1] * 1.4, hi);
      const bl = lerp(DIM[2], TEAL[2] * 1.4, hi);
      const c = e * 8;
      lineColor[c] = r; lineColor[c + 1] = g; lineColor[c + 2] = bl; lineColor[c + 3] = alpha;
      lineColor[c + 4] = r; lineColor[c + 5] = g; lineColor[c + 6] = bl; lineColor[c + 7] = alpha;
    }

    for (let p = 0; p < P; p++) {
      const pk = packets[p];
      if (reduceMotion) { pkSize[p] = 0; continue; }
      pk.t += dt * pk.s;
      if (pk.t >= 1) respawn(pk);
      if (pk.e < 0 || edgeAlpha[pk.e] < 0.05) { pkSize[p] = 0; continue; }
      const a = edges[pk.e][pk.dir > 0 ? 0 : 1] * 3;
      const b = edges[pk.e][pk.dir > 0 ? 1 : 0] * 3;
      pkPos[p * 3] = lerp(nodePos[a], nodePos[b], pk.t);
      pkPos[p * 3 + 1] = lerp(nodePos[a + 1], nodePos[b + 1], pk.t);
      pkPos[p * 3 + 2] = lerp(nodePos[a + 2], nodePos[b + 2], pk.t);
      pkSize[p] = BASE_SIZE * 0.85 * Math.sin(Math.PI * pk.t) * Math.min(1, edgeAlpha[pk.e] * 2.5);
    }

    nodeGeo.attributes.position.needsUpdate = true;
    nodeGeo.attributes.aSize.needsUpdate = true;
    nodeGeo.attributes.aColor.needsUpdate = true;
    lineGeo.attributes.position.needsUpdate = true;
    lineGeo.attributes.aColor.needsUpdate = true;
    pkGeo.attributes.position.needsUpdate = true;
    pkGeo.attributes.aSize.needsUpdate = true;

    // Camera and group motion
    mx += (tmx - mx) * Math.min(1, dt * 3);
    my += (tmy - my) * Math.min(1, dt * 3);
    group.position.x += (placement.x - group.position.x) * Math.min(1, dt * 4);
    group.position.y += (placement.y - group.position.y) * Math.min(1, dt * 4);
    camera.position.z += (placement.z - camera.position.z) * Math.min(1, dt * 4);
    const s = group.scale.x + (placement.scale - group.scale.x) * Math.min(1, dt * 4);
    group.scale.setScalar(s);
    // Gentle sway keeps each shape facing roughly the way it was designed.
    group.rotation.y = Math.sin(t * 0.15) * 0.35 + mx * 0.25;
    group.rotation.x = my * 0.15;

    renderer.render(scene, camera);

    if (!shown) {
      shown = true;
      story.classList.add("story--live");
    }
    requestAnimationFrame(frame);
  }

  group.position.set(placement.x, placement.y, 0);
  group.scale.setScalar(placement.scale);
  camera.position.z = placement.z;
  requestAnimationFrame(frame);
}

init();
