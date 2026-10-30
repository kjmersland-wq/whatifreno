"use client";

import { Canvas } from "@react-three/fiber";
import { Edges, Grid, OrbitControls } from "@react-three/drei";
import { useMemo } from "react";
import { ExtrudeGeometry, Shape } from "three";
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

const GARAGE = {
  wallHeight: 2.5,
  roofRise: 1.1,
  eaveOverhang: 0.4,
  doorHeight: 2.1,
  doorWidth: Math.min(4.8, GARAGE_DEPTH - 0.8),
} as const;

/**
 * Triangular gable profile extruded to unit length, centred on the origin. The mesh scales it
 * along its length to the garage width, so one geometry serves every size.
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
 * Attached low-poly garage on the east side: flat-shaded box walls, an apex (gable) roof with a
 * ridge running east-west, and a dark door panel on the east gable end. Width follows the
 * simulated floor area.
 */
function Garage({ area }: { area: number }) {
  const gable = useMemo(buildGableGeometry, []);
  if (area <= 0) return null;

  const width = area / GARAGE_DEPTH;
  const centerX = ROOM.width / 2 + width / 2;
  const { wallHeight, doorHeight, doorWidth } = GARAGE;

  return (
    <group>
      <mesh position={[centerX, wallHeight / 2, 0]}>
        <boxGeometry args={[width, wallHeight, GARAGE_DEPTH]} />
        <meshStandardMaterial color="#a1a1aa" flatShading roughness={0.9} />
        <Edges color="#e4e4e7" />
      </mesh>

      {/* Local x = span (world z), local z = length (world x): rotate a quarter turn about y. */}
      <mesh
        geometry={gable}
        position={[centerX, wallHeight, 0]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[1, 1, width + GARAGE.eaveOverhang]}
      >
        <meshStandardMaterial color="#52525b" flatShading roughness={0.8} />
        <Edges color="#d4d4d8" />
      </mesh>

      {width >= 3 && (
        <mesh position={[centerX + width / 2 + 0.02, doorHeight / 2, 0]}>
          <boxGeometry args={[0.06, doorHeight, doorWidth]} />
          <meshStandardMaterial color="#27272a" flatShading />
          <Edges color="#7dd3fc" />
        </mesh>
      )}
    </group>
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
