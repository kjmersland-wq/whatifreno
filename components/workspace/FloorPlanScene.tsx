"use client";

import { Canvas } from "@react-three/fiber";
import { Grid, OrbitControls } from "@react-three/drei";
import type { Quantities } from "@/lib/design";

export type { Quantities };

/** Shared floor-plan dimensions in metres (x = width, z = depth). */
const ROOM = { width: 8, depth: 6, height: 2.6, wall: 0.18 } as const;
const GARAGE_DEPTH = ROOM.depth;

interface BoxProps {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  opacity?: number;
  wireframe?: boolean;
}

function Box({ position, size, color, opacity = 1, wireframe = false }: BoxProps) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        transparent={opacity < 1}
        opacity={opacity}
        wireframe={wireframe}
        roughness={0.7}
      />
    </mesh>
  );
}

/** Exterior shell plus floor slab. */
function Shell() {
  const { width: w, depth: d, height: h, wall: t } = ROOM;
  const color = "#52525b";
  return (
    <group>
      <Box position={[0, -0.05, 0]} size={[w, 0.1, d]} color="#27272a" />
      <Box position={[0, h / 2, -d / 2]} size={[w, h, t]} color={color} opacity={0.55} />
      <Box position={[-w / 2, h / 2, 0]} size={[t, h, d]} color={color} opacity={0.55} />
      <Box position={[w / 2, h / 2, 0]} size={[t, h, d]} color={color} opacity={0.55} />
      <Box position={[0, h / 2, d / 2]} size={[w, h, t]} color={color} opacity={0.35} />
    </group>
  );
}

/** Interior load-bearing wall along z at x=0. Removed length is shown as an amber ghost. */
function BearingWall({ removedMeters }: { removedMeters: number }) {
  const { depth: d, height: h, wall: t } = ROOM;
  const removed = Math.min(removedMeters, d);
  const standing = d - removed;
  return (
    <group>
      {standing > 0 && (
        <Box position={[0, h / 2, -d / 2 + standing / 2]} size={[t, h, standing]} color="#a1a1aa" />
      )}
      {removed > 0 && (
        <Box
          position={[0, h / 2, d / 2 - removed / 2]}
          size={[t, h, removed]}
          color="#fbbf24"
          opacity={0.35}
          wireframe
        />
      )}
    </group>
  );
}

/** New windows spaced evenly along the south wall. */
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
            <meshStandardMaterial color="#7dd3fc" emissive="#38bdf8" emissiveIntensity={0.6} transparent opacity={0.8} />
          </mesh>
        );
      })}
    </group>
  );
}

/** Attached garage on the east side; width follows the simulated floor area. */
function Garage({ area }: { area: number }) {
  if (area <= 0) return null;
  const width = area / GARAGE_DEPTH;
  const height = 2.8;
  return (
    <Box
      position={[ROOM.width / 2 + width / 2, height / 2, 0]}
      size={[width, height, GARAGE_DEPTH]}
      color="#38bdf8"
      opacity={0.45}
    />
  );
}

/**
 * Placeholder marking where a real GLTF asset (furniture, fixtures, existing-home scan)
 * will be loaded, e.g. via drei's useGLTF.
 */
function AssetSlot({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[1.2, 0.8, 0.6]} />
      <meshBasicMaterial color="#71717a" wireframe />
    </mesh>
  );
}

export default function FloorPlanScene({ quantities }: { quantities: Quantities }) {
  return (
    <Canvas
      shadows
      camera={{ position: [9, 8, 11], fov: 45 }}
      gl={{ antialias: true }}
      className="touch-none"
    >
      <color attach="background" args={["#09090b"]} />
      <fog attach="fog" args={["#09090b", 20, 45]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[8, 12, 6]} intensity={1.1} castShadow />

      <Shell />
      <BearingWall removedMeters={quantities["load-bearing-wall-removal"]} />
      <Windows count={quantities["window-addition"]} />
      <Garage area={quantities["garage-addition"]} />
      <AssetSlot position={[-2.5, 0.4, -1.5]} />

      <Grid
        position={[0, -0.11, 0]}
        args={[40, 40]}
        cellSize={1}
        sectionSize={5}
        cellColor="#27272a"
        sectionColor="#3f3f46"
        fadeDistance={30}
        infiniteGrid
      />

      {/* WebXR hit-testing will attach here: see XRHitTestPlaceholder. */}
      <OrbitControls makeDefault maxPolarAngle={Math.PI / 2.05} minDistance={6} maxDistance={28} />
    </Canvas>
  );
}
