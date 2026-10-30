"use client";

import { Canvas, invalidate, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Edges, Grid, Html, OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { ExtrudeGeometry, Shape, type Group, type Mesh, type PerspectiveCamera, type Vector3 } from "three";
import type { Quantities } from "@/lib/design";

export type { Quantities };

/** Pre-formatted dimension text, so the scene stays free of unit logic. */
export interface SceneLabels {
  readonly wall: string;
  readonly garage: string;
}

interface FloorPlanSceneProps {
  readonly quantities: Quantities;
  readonly labels: SceneLabels;
}

/** Shared floor-plan dimensions in metres (x = width, z = depth). */
const ROOM = { width: 8, depth: 6, height: 2.6, wall: 0.18 } as const;
const GARAGE_DEPTH = ROOM.depth;

const GARAGE = {
  wallHeight: 2.5,
  roofRise: 1.1,
  eaveOverhang: 0.4,
  doorHeight: 2.1,
  doorWidth: Math.min(4.8, GARAGE_DEPTH - 0.8),
} as const;

/** Calm, muted palette. */
const COLOR = {
  floor: "#3f3f46",
  shell: "#a1a1aa",
  shellEdge: "#d4d4d8",
  bearing: "#d4d4d8",
  ghost: "#fbbf24",
  window: "#bae6fd",
  garageWall: "#a1a1aa",
  garageRoof: "#52525b",
  door: "#27272a",
  furniture: "#71717a",
} as const;

// ---------------------------------------------------------------------------
// Motion helpers. The canvas renders on demand, so anything animating must keep
// requesting frames until it has settled.
// ---------------------------------------------------------------------------

let reducedMotion: boolean | null = null;
const prefersReducedMotion = (): boolean => {
  reducedMotion ??= window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return reducedMotion;
};

/** Eases `ref.current` toward `target`. Returns true while it is still moving. */
function approach(ref: MutableRefObject<number>, target: number, delta: number, rate = 7): boolean {
  const diff = target - ref.current;
  if (Math.abs(diff) < 0.002 || prefersReducedMotion()) {
    ref.current = target;
    return false;
  }
  ref.current += diff * (1 - Math.exp(-rate * delta));
  return true;
}

/** Requests a frame whenever the inputs change. */
function RenderOnChange({ quantities, labels }: FloorPlanSceneProps) {
  useEffect(() => {
    invalidate();
  }, [quantities, labels]);
  return null;
}

// ---------------------------------------------------------------------------
// Building blocks
// ---------------------------------------------------------------------------

interface BoxProps {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  opacity?: number;
  edges?: string;
}

function Box({ position, size, color, opacity = 1, edges }: BoxProps) {
  const transparent = opacity < 1;
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        transparent={transparent}
        opacity={opacity}
        depthWrite={!transparent}
        roughness={0.85}
        flatShading
      />
      {edges && <Edges color={edges} />}
    </mesh>
  );
}

function DimensionLabel({ text, position }: { text: string; position: [number, number, number] }) {
  return (
    <Html center position={position} zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
      <div className="whitespace-nowrap rounded-full border border-white/10 bg-zinc-950/75 px-2.5 py-0.5 font-mono text-[11px] text-amber-200 backdrop-blur">
        {text}
      </div>
    </Html>
  );
}

/** Exterior shell, floor slab and a few pieces of furniture for a sense of scale. */
function House() {
  const { width: w, depth: d, height: h, wall: t } = ROOM;
  return (
    <group>
      <Box position={[0, -0.06, 0]} size={[w + 0.4, 0.12, d + 0.4]} color={COLOR.floor} />
      <Box position={[0, h / 2, -d / 2]} size={[w, h, t]} color={COLOR.shell} opacity={0.5} edges={COLOR.shellEdge} />
      <Box position={[-w / 2, h / 2, 0]} size={[t, h, d]} color={COLOR.shell} opacity={0.5} edges={COLOR.shellEdge} />
      <Box position={[w / 2, h / 2, 0]} size={[t, h, d]} color={COLOR.shell} opacity={0.5} edges={COLOR.shellEdge} />
      <Box position={[0, h / 2, d / 2]} size={[w, h, t]} color={COLOR.shell} opacity={0.3} edges={COLOR.shellEdge} />

      {/* Sofa */}
      <Box position={[-2.4, 0.22, 1.7]} size={[2, 0.44, 0.85]} color={COLOR.furniture} />
      <Box position={[-2.4, 0.55, 2.05]} size={[2, 0.5, 0.2]} color={COLOR.furniture} />
      {/* Dining table */}
      <Box position={[2.3, 0.72, -0.9]} size={[1.5, 0.06, 0.9]} color={COLOR.furniture} />
      <Box position={[2.3, 0.36, -0.9]} size={[0.12, 0.72, 0.12]} color={COLOR.furniture} />
    </group>
  );
}

/**
 * Interior load-bearing wall along z at x=0. Its standing length and the amber "removed"
 * ghost are driven by one eased value, so the opening grows and shrinks smoothly.
 */
function BearingWall({ removedMeters, label }: { removedMeters: number; label: string }) {
  const { depth: d, height: h, wall: t } = ROOM;
  const removed = useRef(0);
  const standing = useRef<Mesh>(null);
  const ghost = useRef<Group>(null);

  useFrame((_, delta) => {
    const moving = approach(removed, Math.min(removedMeters, d), delta);
    const len = removed.current;
    const stay = d - len;
    const s = standing.current;
    if (s) {
      s.visible = stay > 0.01;
      s.scale.set(1, 1, Math.max(stay, 0.0001));
      s.position.set(0, h / 2, -d / 2 + stay / 2);
    }
    const g = ghost.current;
    if (g) {
      g.visible = len > 0.01;
      g.scale.set(1, 1, Math.max(len, 0.0001));
      g.position.set(0, h / 2, d / 2 - len / 2);
    }
    if (moving) invalidate();
  });

  return (
    <group>
      <mesh ref={standing}>
        <boxGeometry args={[t, h, 1]} />
        <meshStandardMaterial color={COLOR.bearing} roughness={0.85} flatShading />
        <Edges color={COLOR.shellEdge} />
      </mesh>
      <group ref={ghost} visible={false}>
        <mesh>
          <boxGeometry args={[t, h, 1]} />
          <meshStandardMaterial color={COLOR.ghost} transparent opacity={0.16} depthWrite={false} />
          <Edges color={COLOR.ghost} />
        </mesh>
        {removedMeters > 0 && <DimensionLabel text={label} position={[0, h / 2 + 0.45, 0]} />}
      </group>
    </group>
  );
}

/** New windows spaced evenly along the south wall, softly lit. */
function Windows({ count }: { count: number }) {
  const { width: w, depth: d, height: h, wall: t } = ROOM;
  const n = Math.floor(count);
  return (
    <group>
      {Array.from({ length: n }, (_, i) => {
        const x = -w / 2 + (w / (n + 1)) * (i + 1);
        return (
          <mesh key={i} position={[x, h * 0.55, d / 2 + t / 2 + 0.01]}>
            <boxGeometry args={[0.9, 1.1, 0.05]} />
            <meshStandardMaterial color={COLOR.window} emissive="#38bdf8" emissiveIntensity={0.35} transparent opacity={0.85} />
            <Edges color="#e0f2fe" />
          </mesh>
        );
      })}
    </group>
  );
}

/**
 * Triangular gable profile extruded to unit length, centred on the origin. The roof mesh is
 * scaled along its length with the garage, so one geometry serves every size.
 */
function buildGableGeometry(): ExtrudeGeometry {
  const half = (GARAGE_DEPTH + GARAGE.eaveOverhang) / 2;
  const profile = new Shape();
  profile.moveTo(-half, 0);
  profile.lineTo(half, 0);
  profile.lineTo(0, GARAGE.roofRise);
  profile.closePath();
  const geometry = new ExtrudeGeometry(profile, { depth: 1, bevelEnabled: false });
  geometry.translate(0, 0, -0.5);
  return geometry;
}

/**
 * Attached low-poly garage on the east side: flat-shaded box walls, an apex roof with the
 * ridge running east-west, and a dark door on the east gable end. Its width eases toward the
 * simulated floor area; `widthOut` shares the live width with the camera rig.
 */
function Garage({ area, label, widthOut }: { area: number; label: string; widthOut: MutableRefObject<number> }) {
  const gable = useMemo(buildGableGeometry, []);
  const { wallHeight, roofRise, doorHeight, doorWidth } = GARAGE;
  const body = useRef<Group>(null);
  const door = useRef<Mesh>(null);

  useFrame((_, delta) => {
    const moving = approach(widthOut, area / GARAGE_DEPTH, delta);
    const width = widthOut.current;
    const b = body.current;
    if (b) {
      b.visible = width > 0.02;
      b.scale.set(Math.max(width, 0.0001), 1, 1);
    }
    const dr = door.current;
    if (dr) {
      dr.visible = width >= 3;
      dr.position.set(ROOM.width / 2 + width + 0.02, doorHeight / 2, 0);
    }
    if (moving) invalidate();
  });

  return (
    <group>
      {/* Pivot at the house's east wall; local x runs 0 → 1 and is scaled to the garage width. */}
      <group ref={body} position={[ROOM.width / 2, 0, 0]} visible={false}>
        <mesh position={[0.5, wallHeight / 2, 0]}>
          <boxGeometry args={[1, wallHeight, GARAGE_DEPTH]} />
          <meshStandardMaterial color={COLOR.garageWall} flatShading roughness={0.9} />
          <Edges color={COLOR.shellEdge} />
        </mesh>
        <mesh geometry={gable} position={[0.5, wallHeight, 0]} rotation={[0, Math.PI / 2, 0]}>
          <meshStandardMaterial color={COLOR.garageRoof} flatShading roughness={0.8} />
          <Edges color="#d4d4d8" />
        </mesh>
        {area > 0 && <DimensionLabel text={label} position={[0.5, wallHeight + roofRise + 0.55, 0]} />}
      </group>
      <mesh ref={door} visible={false}>
        <boxGeometry args={[0.06, doorHeight, doorWidth]} />
        <meshStandardMaterial color={COLOR.door} flatShading />
        <Edges color="#7dd3fc" />
      </mesh>
    </group>
  );
}

/**
 * On phones the controls sit in a panel over the lower half of the screen, so shift the
 * projection up to keep the house in the visible band. No-op on wider screens.
 */
function MobileFraming() {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const size = useThree((s) => s.size);
  useEffect(() => {
    if (size.width < 768) {
      camera.setViewOffset(size.width, size.height, 0, size.height * 0.16, size.width, size.height);
    } else {
      camera.clearViewOffset();
    }
    invalidate();
    return () => camera.clearViewOffset();
  }, [camera, size.width, size.height]);
  return null;
}

/** Gently re-centres the orbit target on the house plus garage as the garage grows. */
function CameraRig({ garageWidth }: { garageWidth: MutableRefObject<number> }) {
  const controls = useThree((s) => s.controls) as unknown as { target: Vector3 } | null;
  useFrame((_, delta) => {
    if (!controls) return;
    const desired = 0.6 + garageWidth.current * 0.4;
    const diff = desired - controls.target.x;
    if (Math.abs(diff) < 0.005) return;
    controls.target.x += diff * (1 - Math.exp(-4 * delta));
    invalidate();
  });
  return null;
}

function Scene({ quantities, labels }: FloorPlanSceneProps) {
  const garageWidth = useRef(0);
  return (
    <>
      <color attach="background" args={["#09090b"]} />
      <fog attach="fog" args={["#09090b", 22, 48]} />
      <hemisphereLight args={["#f4f4f5", "#27272a", 0.85]} />
      <directionalLight position={[8, 12, 6]} intensity={0.9} />

      <House />
      <BearingWall removedMeters={quantities["load-bearing-wall-removal"]} label={labels.wall} />
      <Windows count={quantities["window-addition"]} />
      <Garage area={quantities["garage-addition"]} label={labels.garage} widthOut={garageWidth} />

      <ContactShadows position={[0, 0.001, 0]} opacity={0.4} scale={34} blur={2.8} far={5} resolution={512} />
      <Grid
        position={[0, -0.13, 0]}
        args={[40, 40]}
        cellSize={1}
        sectionSize={5}
        cellColor="#27272a"
        sectionColor="#3f3f46"
        fadeDistance={30}
        infiniteGrid
      />

      {/* WebXR hit-testing will attach here: see XRHitTestPlaceholder. */}
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        target={[0.6, 0.9, 0]}
        maxPolarAngle={Math.PI / 2.05}
        minDistance={7}
        maxDistance={30}
      />
      <CameraRig garageWidth={garageWidth} />
      <MobileFraming />
      <RenderOnChange quantities={quantities} labels={labels} />
    </>
  );
}

export default function FloorPlanScene({ quantities, labels }: FloorPlanSceneProps) {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 2]}
      camera={{ position: [13, 10, 14.5], fov: 38 }}
      gl={{ antialias: true, powerPreference: "low-power" }}
      className="touch-none"
    >
      <Scene quantities={quantities} labels={labels} />
    </Canvas>
  );
}
