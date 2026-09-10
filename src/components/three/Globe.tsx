"use client";

import * as React from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";

// -----------------------------------------------------------------------------
// A genuine WebGL globe (real geometry, lighting and depth), not a CSS
// transform standing in for 3D. Deliberately stylised rather than
// photo-textured — a "digital tech globe" (wire lattice + glowing dots + a
// fresnel atmosphere) needs no earth-texture asset, stays on-brand, and is
// cheap enough to run on a phone.
// -----------------------------------------------------------------------------

export type GlobePin = {
  id: string;
  label: string;
  lat: number;
  lng: number;
};

/** Converts geographic coordinates to a point on a unit sphere. */
function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

// --- Fresnel atmosphere shader ---------------------------------------------
// A thin glowing rim around the sphere's silhouette — the one shader in the
// scene, everything else uses stock materials.
const atmosphereVertex = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const atmosphereFragment = `
  uniform vec3 uColor;
  varying vec3 vNormal;
  void main() {
    float intensity = pow(0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.4);
    gl_FragColor = vec4(uColor, intensity);
  }
`;

function Atmosphere({ radius, color }: { radius: number; color: string }) {
  const uniforms = React.useMemo(() => ({ uColor: { value: new THREE.Color(color) } }), [color]);
  return (
    <mesh scale={1.14}>
      <sphereGeometry args={[radius, 48, 48]} />
      <shaderMaterial
        vertexShader={atmosphereVertex}
        fragmentShader={atmosphereFragment}
        uniforms={uniforms}
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

/** A single glowing marker, pulsing gently, that grows on hover/active. */
function Pin({
  position,
  active,
  onClick,
}: {
  position: THREE.Vector3;
  active: boolean;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
}) {
  const ref = React.useRef<THREE.Mesh>(null);
  const ringRef = React.useRef<THREE.Mesh>(null);
  // A lazy useState initialiser, not useRef(Math.random()), because the
  // latter still evaluates its argument on every render even though it only
  // keeps the first result — React's purity rule flags that as an impure
  // call during render. The lazy form only ever runs once, at mount.
  const [phase] = React.useState(() => Math.random() * Math.PI * 2);

  useFrame((state) => {
    const t = state.clock.elapsedTime + phase;
    const pulse = 1 + Math.sin(t * 2.2) * 0.12;
    if (ref.current) ref.current.scale.setScalar((active ? 1.9 : 1) * pulse);
    if (ringRef.current) {
      const ringPulse = ((t * 0.6) % 1) + 0.001;
      ringRef.current.scale.setScalar(1 + ringPulse * 2.2);
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.5 - ringPulse * 0.5);
    }
  });

  // Orient the marker's local "up" to point away from the globe centre, so
  // the flat ring lies flush against the sphere's surface at its latitude.
  const quaternion = React.useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), position.clone().normalize());
    return q;
  }, [position]);

  return (
    <group position={position} quaternion={quaternion}>
      <mesh
        ref={ref}
        onClick={onClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[0.028, 12, 12]} />
        <meshBasicMaterial color={active ? "#ffb454" : "#ffffff"} toneMapped={false} />
      </mesh>
      {/* Expanding ripple ring, the "this is alive" cue */}
      <mesh ref={ringRef} rotation={[0, 0, 0]}>
        <ringGeometry args={[0.03, 0.04, 24]} />
        <meshBasicMaterial color={active ? "#ffb454" : "#7dd3c8"} transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/** Thin dotted lattice standing in for a wireframe globe (no earth texture required). */
function Lattice({ radius }: { radius: number }) {
  const points = React.useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const rings = 22;
    for (let i = 1; i < rings; i++) {
      const lat = -90 + (180 / rings) * i;
      const count = Math.max(6, Math.round(28 * Math.cos((lat * Math.PI) / 180)));
      for (let j = 0; j < count; j++) {
        const lng = (360 / count) * j;
        pts.push(latLngToVector3(lat, lng, radius));
      }
    }
    return pts;
  }, [radius]);

  const geometry = React.useMemo(() => {
    const g = new THREE.BufferGeometry();
    const arr = new Float32Array(points.length * 3);
    points.forEach((p, i) => {
      arr[i * 3] = p.x;
      arr[i * 3 + 1] = p.y;
      arr[i * 3 + 2] = p.z;
    });
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  }, [points]);

  return (
    <points geometry={geometry}>
      <pointsMaterial color="#5fb8b0" size={0.014} sizeAttenuation transparent opacity={0.85} />
    </points>
  );
}

function Scene({
  pins,
  activeId,
  onSelect,
  interactive,
  reduced,
}: {
  pins: GlobePin[];
  activeId?: string;
  onSelect?: (id: string) => void;
  interactive: boolean;
  reduced: boolean;
}) {
  const groupRef = React.useRef<THREE.Group>(null);
  const { size, viewport } = useThree();
  const pointer = React.useRef({ x: 0, y: 0 });
  const radius = 1.6;

  React.useEffect(() => {
    if (!interactive) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [interactive]);

  // Rotate to face whichever pin is active, so clicking a destination
  // visibly turns the globe toward it rather than just changing a caption.
  const targetRotation = React.useRef(new THREE.Euler());
  React.useEffect(() => {
    const active = pins.find((p) => p.id === activeId);
    if (!active) return;
    // Facing the camera (+Z) means yaw = -theta, roughly -(lng+180) in radians.
    const theta = (active.lng + 180) * (Math.PI / 180);
    targetRotation.current.y = -theta + Math.PI / 2;
    targetRotation.current.x = (active.lat * Math.PI) / 180 * 0.35;
  }, [activeId, pins]);

  useFrame((state, delta) => {
    const g = groupRef.current;
    if (!g) return;

    if (!reduced) {
      // Idle auto-rotate, slowed to near-still while a pin is actively faced.
      const idleSpeed = activeId ? 0.02 : 0.09;
      g.rotation.y += delta * idleSpeed;
    }

    if (activeId) {
      g.rotation.y = THREE.MathUtils.damp(g.rotation.y, targetRotation.current.y, 3, delta);
      g.rotation.x = THREE.MathUtils.damp(g.rotation.x, targetRotation.current.x, 3, delta);
    } else if (!reduced && interactive) {
      // Subtle pointer parallax — depth, not distraction.
      g.rotation.x = THREE.MathUtils.damp(g.rotation.x, pointer.current.y * 0.12, 2, delta);
    }
  });

  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 2, 4]} intensity={1.1} color="#eaf7f5" />
      <directionalLight position={[-3, -1, -2]} intensity={0.35} color="#8fd8cf" />

      <group ref={groupRef}>
        <mesh>
          <sphereGeometry args={[radius, 64, 64]} />
          <meshStandardMaterial color="#0f2f3d" roughness={0.55} metalness={0.15} />
        </mesh>
        <Lattice radius={radius * 1.004} />
        <Atmosphere radius={radius} color="#4fd1c5" />

        {pins.map((p) => (
          <Pin
            key={p.id}
            position={latLngToVector3(p.lat, p.lng, radius * 1.01)}
            active={p.id === activeId}
            onClick={
              interactive
                ? (e) => {
                    e.stopPropagation();
                    onSelect?.(p.id);
                  }
                : undefined
            }
          />
        ))}
      </group>

      {!reduced && (
        <Sparkles
          count={size.width < 640 ? 30 : 70}
          scale={[viewport.width * 1.4, viewport.height * 1.4, 4]}
          size={1.4}
          speed={0.2}
          opacity={0.5}
          color="#bfe9e3"
        />
      )}
    </>
  );
}

/**
 * Boundary around the Canvas: a browser without WebGL (or one where context
 * creation fails) should fall back to nothing rather than crash the page.
 * The caller is expected to render its own CSS backdrop behind this.
 */
class GlobeErrorBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

export function Globe({
  pins,
  activeId,
  onSelect,
  interactive = false,
  className,
}: {
  pins: GlobePin[];
  activeId?: string;
  onSelect?: (id: string) => void;
  interactive?: boolean;
  className?: string;
}) {
  const reduced = !!useReducedMotion();

  return (
    <div className={className}>
      <GlobeErrorBoundary>
        <Canvas
          camera={{ position: [0, 0, 4.4], fov: 42 }}
          dpr={[1, 1.75]}
          gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
          onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        >
          <Scene pins={pins} activeId={activeId} onSelect={onSelect} interactive={interactive} reduced={reduced} />
        </Canvas>
      </GlobeErrorBoundary>
    </div>
  );
}
