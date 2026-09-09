"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useTheme } from "next-themes";
import { Canvas, extend, useFrame, type ThreeEvent } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF, useTexture } from "@react-three/drei";
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint, type RapierRigidBody } from "@react-three/rapier";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import * as THREE from "three";

extend({ MeshLineGeometry, MeshLineMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    meshLineGeometry: Record<string, unknown>;
    meshLineMaterial: Record<string, unknown>;
  }
}

const CARD_GLB_PATH = "/lanyard/card.glb";

// Generates a woven-fabric-look strap texture procedurally (no extra asset
// to download) — a diagonal weave pattern so the strap reads as fabric
// rather than a flat plastic ribbon. Colors are swapped for light/dark mode:
// bright in dark mode (readable against the dark hero background), dark in
// light mode (readable against the light background).
function createStrapTexture(isDark: boolean) {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = isDark ? "#f5f4f1" : "#1a1a1d";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = isDark ? "rgba(0, 0, 0, 0.07)" : "rgba(0, 0, 0, 0.35)";
  ctx.lineWidth = 2;
  const step = 10;
  for (let offset = -canvas.height; offset < canvas.width + canvas.height; offset += step) {
    ctx.beginPath();
    ctx.moveTo(offset, 0);
    ctx.lineTo(offset - canvas.height, canvas.height);
    ctx.stroke();
  }

  ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.5)" : "rgba(255, 255, 255, 0.12)";
  for (let offset = -canvas.height + step / 2; offset < canvas.width + canvas.height; offset += step) {
    ctx.beginPath();
    ctx.moveTo(offset, 0);
    ctx.lineTo(offset - canvas.height, canvas.height);
    ctx.stroke();
  }

  // meshLineMaterial ignores scene lighting entirely, so it renders flat —
  // fake a rounded-ribbon look by darkening the edges and brightening the
  // middle across the strap's width, like light catching a curved surface.
  const shading = ctx.createLinearGradient(0, 0, canvas.width, 0);
  shading.addColorStop(0, "rgba(0, 0, 0, 0.45)");
  shading.addColorStop(0.18, "rgba(0, 0, 0, 0.08)");
  shading.addColorStop(0.5, "rgba(255, 255, 255, 0.22)");
  shading.addColorStop(0.82, "rgba(0, 0, 0, 0.08)");
  shading.addColorStop(1, "rgba(0, 0, 0, 0.45)");
  ctx.fillStyle = shading;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 1x1 transparent pixel — lets useTexture be called unconditionally when a
// front image isn't supplied.
const BLANK_PIXEL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

// The card model's front face is UV-mapped to the LEFT half of the texture
// atlas (measured from card.glb). The photo is composited into that half so
// it renders aspect-preserving (no stretching).
const FRONT_UV_RECT = { x: 0, y: 0, w: 0.5, h: 0.755 };

// Camera framing. The visible world-space extent is determined purely by
// fov + distance (not by the canvas div's CSS size), so drag "room" is tuned
// here — a bigger distance/fov reveals more space to swing/drag within.
const CAMERA_DISTANCE = 28;
const CAMERA_FOV = 20;
const CARD_SCALE = 2;

// Half the vertical world-space visible to the camera.
const FRUSTUM_HALF_HEIGHT = Math.tan((CAMERA_FOV / 2) * (Math.PI / 180)) * CAMERA_DISTANCE;

// The canvas is taller than one viewport (see CANVAS_HEIGHT_VH in hero.tsx)
// so dragging the card down doesn't hard-clip at the hero section's own
// bottom edge — the render area now extends into the section below. Because
// the camera has no rotation (it looks straight down -Z, R3F's default), its
// own Y position — not just fov/distance — sets which world-Y lands at the
// canvas's vertical center. Shifting the camera up moves that center point
// down the page, so world Y=0 (where the card rests) still lands at the
// middle of the FIRST viewport instead of the middle of the whole tall canvas.
const CANVAS_HEIGHT_VH = 160;
const REST_POSITION_VH = 50;
const CAMERA_Y = FRUSTUM_HALF_HEIGHT * (2 * (REST_POSITION_VH / CANVAS_HEIGHT_VH) - 1);

// The canvas spans the full hero section; the rig is offset slightly toward
// the right of center (the camera looks straight down -Z at x=0, which maps
// to screen center) so the card sits left-of-edge rather than dead-center.
// Scaled with the frustum so it lands at roughly the same on-screen spot if
// the camera is re-tuned later.
const ANCHOR_X = FRUSTUM_HALF_HEIGHT * 0.35;

// Anchor sits just below the actual top edge of the visible frustum (which,
// with the camera shifted by CAMERA_Y above, is CAMERA_Y + half-height, not
// half-height alone), with only a small margin so the strap becomes visible
// right where the fixed navbar ends — it reads as hanging from the navbar
// rather than starting with a gap below it. The rope length + card joint
// offset below are derived so the card comes to rest vertically centered.
const ANCHOR_Y = CAMERA_Y + FRUSTUM_HALF_HEIGHT - 0.45;
const ROPE_SEGMENT_LENGTH = ANCHOR_Y * 0.21;
const CARD_JOINT_OFFSET = ANCHOR_Y - 3 * ROPE_SEGMENT_LENGTH;
// The card.glb clip loop (where the strap attaches) sits at local Y ~1.2 on
// the unscaled model. Deriving the visual group's offset from that keeps the
// clip aligned with the rope's attachment point for any scale/joint offset.
const CARD_VISUAL_Y = CARD_JOINT_OFFSET - CARD_SCALE * 1.2;
const CARD_VISUAL_Z = CARD_SCALE * -0.0222;

type GLTFResult = {
  nodes: Record<string, THREE.Mesh>;
  materials: Record<string, THREE.MeshStandardMaterial & { map?: THREE.Texture | null }>;
};

function Band({
  isMobile,
  photoUrl,
  isDark,
}: {
  isMobile: boolean;
  photoUrl: string;
  isDark: boolean;
}) {
  const band = useRef<THREE.Mesh>(null);
  const fixed = useRef<RapierRigidBody>(null);
  const j1 = useRef<RapierRigidBody & { lerped?: THREE.Vector3 }>(null);
  const j2 = useRef<RapierRigidBody & { lerped?: THREE.Vector3 }>(null);
  const j3 = useRef<RapierRigidBody>(null);
  const card = useRef<RapierRigidBody>(null);

  const vec = useMemo(() => new THREE.Vector3(), []);
  const ang = useMemo(() => new THREE.Vector3(), []);
  const rot = useMemo(() => new THREE.Vector3(), []);
  const dir = useMemo(() => new THREE.Vector3(), []);

  const segmentProps = {
    type: "dynamic" as const,
    canSleep: true,
    colliders: false as const,
    angularDamping: 4,
    linearDamping: 4,
  };

  const { nodes, materials } = useGLTF(CARD_GLB_PATH) as unknown as GLTFResult;
  const strapTexture = useMemo(() => createStrapTexture(isDark), [isDark]);
  const frontTex = useTexture(photoUrl || BLANK_PIXEL);

  const cardMap = useMemo(() => {
    const baseMap = materials.base.map;
    if (!photoUrl || !baseMap) return baseMap;

    const baseImg = baseMap.image as HTMLImageElement | undefined;
    if (!baseImg) return baseMap;
    const W = baseImg.width;
    const H = baseImg.height;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return baseMap;
    ctx.drawImage(baseImg, 0, 0, W, H);

    const img = frontTex.image as HTMLImageElement | undefined;
    if (img) {
      const rx = FRONT_UV_RECT.x * W;
      const ry = FRONT_UV_RECT.y * H;
      const rw = FRONT_UV_RECT.w * W;
      const rh = FRONT_UV_RECT.h * H;
      const scale = Math.max(rw / img.width, rh / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      const dx = rx + (rw - dw) / 2;
      const dy = ry + (rh - dh) / 2;
      ctx.save();
      ctx.beginPath();
      ctx.rect(rx, ry, rw, rh);
      ctx.clip();
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.restore();
    }

    const composite = new THREE.CanvasTexture(canvas);
    composite.colorSpace = THREE.SRGBColorSpace;
    composite.flipY = baseMap.flipY;
    composite.anisotropy = 16;
    composite.needsUpdate = true;
    return composite;
  }, [photoUrl, frontTex, materials.base.map]);

  const [curve] = useState(() => {
    const c = new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]);
    c.curveType = "chordal";
    return c;
  });
  const [dragged, setDragged] = useState<false | THREE.Vector3>(false);
  const [hovered, setHovered] = useState(false);

  type Ref = RefObject<RapierRigidBody>;
  useRopeJoint(fixed as Ref, j1 as Ref, [[0, 0, 0], [0, 0, 0], ROPE_SEGMENT_LENGTH]);
  useRopeJoint(j1 as Ref, j2 as Ref, [[0, 0, 0], [0, 0, 0], ROPE_SEGMENT_LENGTH]);
  useRopeJoint(j2 as Ref, j3 as Ref, [[0, 0, 0], [0, 0, 0], ROPE_SEGMENT_LENGTH]);
  useSphericalJoint(j3 as Ref, card as Ref, [
    [0, 0, 0],
    [0, CARD_JOINT_OFFSET, 0],
  ]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? "grabbing" : "grab";
      return () => {
        document.body.style.cursor = "auto";
      };
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged && card.current) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
      card.current.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z,
      });
    }

    if (fixed.current && j1.current && j2.current && j3.current && card.current && band.current) {
      [j1, j2].forEach((ref) => {
        const body = ref.current;
        if (!body) return;
        if (!body.lerped) body.lerped = new THREE.Vector3().copy(body.translation());
        const clampedDistance = Math.max(0.1, Math.min(1, body.lerped.distanceTo(body.translation())));
        body.lerped.lerp(body.translation(), delta * (0 + clampedDistance * 50));
      });

      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped ?? j2.current.translation());
      curve.points[2].copy(j1.current.lerped ?? j1.current.translation());
      curve.points[3].copy(fixed.current.translation());
      (band.current.geometry as MeshLineGeometry).setPoints(curve.getPoints(isMobile ? 16 : 32));

      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation() as unknown as THREE.Vector3);
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z }, true);
    }
  });

  function onPointerDown(e: ThreeEvent<PointerEvent>) {
    if (!card.current) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    setDragged(new THREE.Vector3().copy(e.point as THREE.Vector3).sub(vec.copy(card.current.translation() as unknown as THREE.Vector3)));
  }

  function onPointerUp(e: ThreeEvent<PointerEvent>) {
    (e.target as Element).releasePointerCapture(e.pointerId);
    setDragged(false);
  }

  return (
    <>
      <group position={[ANCHOR_X, ANCHOR_Y, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[ROPE_SEGMENT_LENGTH * 0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[ROPE_SEGMENT_LENGTH, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[ROPE_SEGMENT_LENGTH * 1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[ROPE_SEGMENT_LENGTH * 2, 0, 0]} ref={card} {...segmentProps} type={dragged ? "kinematicPosition" : "dynamic"}>
          <CuboidCollider args={[1, 1.4, 0.02]} />
          <group scale={CARD_SCALE} position={[0, CARD_VISUAL_Y, CARD_VISUAL_Z]} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)} onPointerUp={onPointerUp} onPointerDown={onPointerDown}>
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial map={cardMap} map-anisotropy={16} clearcoat={isMobile ? 0 : 1} clearcoatRoughness={0.15} roughness={0.9} metalness={0.8} />
            </mesh>
            <mesh geometry={nodes.clip.geometry}>
              <meshStandardMaterial
                color={isDark ? "#f2f2f2" : "#9a9a9e"}
                roughness={isDark ? 0.15 : 0.4}
                metalness={isDark ? 0.85 : 0.45}
              />
            </mesh>
            <mesh geometry={nodes.clamp.geometry}>
              <meshStandardMaterial
                color={isDark ? "#f2f2f2" : "#9a9a9e"}
                roughness={isDark ? 0.2 : 0.45}
                metalness={isDark ? 0.85 : 0.45}
              />
            </mesh>
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial color="white" depthTest={false} resolution={isMobile ? [1000, 2000] : [1000, 1000]} useMap={1} map={strapTexture} repeat={[1, 12]} lineWidth={1} />
      </mesh>
    </>
  );
}

export function Lanyard({ photoUrl }: { photoUrl?: string | null }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = resolvedTheme !== "light";
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);

  useEffect(() => {
    // next-themes only resolves the real theme after mount; this avoids a
    // one-frame flash of the wrong strap/clip colors for returning
    // light-mode visitors.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative h-full w-full">
      <Canvas
        camera={{ position: [0, CAMERA_Y, CAMERA_DISTANCE], rotation: [0, 0, 0], fov: CAMERA_FOV }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ alpha: true }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), 0)}
      >
        <ambientLight intensity={Math.PI} />
        <directionalLight position={[3, 5, 6]} intensity={0.6} />
        <Physics gravity={[0, -40, 0]} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          <Suspense fallback={null}>
            <Band isMobile={isMobile} photoUrl={photoUrl ?? ""} isDark={isDark} />
          </Suspense>
        </Physics>
        <Environment blur={0.75}>
          <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
        </Environment>
      </Canvas>
    </div>
  );
}

useGLTF.preload(CARD_GLB_PATH);
