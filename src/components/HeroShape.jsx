'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

/**
 * HeroShape Component
 * Animated 3D geometric shape for Hero section
 * - Follows mouse position with smooth lag
 * - Continuous slow rotation
 * - Wireframe + solid material with glow
 */
export default function HeroShape({ mousePosition = { x: 0, y: 0 } }) {
  const meshRef = useRef(null);
  const wireframeRef = useRef(null);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();

    // Continuous rotation
    meshRef.current.rotation.x = time * 0.2;
    meshRef.current.rotation.y = time * 0.3;

    // Follow mouse with smooth lag
    const targetX = mousePosition.x * 0.5;
    const targetY = -mousePosition.y * 0.5;

    meshRef.current.position.x += (targetX - meshRef.current.position.x) * 0.05;
    meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.05;

    // Subtle floating animation
    meshRef.current.position.z = Math.sin(time * 0.5) * 0.2;

    // Sync wireframe with mesh
    if (wireframeRef.current) {
      wireframeRef.current.rotation.copy(meshRef.current.rotation);
      wireframeRef.current.position.copy(meshRef.current.position);
    }
  });

  return (
    <group>
      {/* Main mesh with distortion */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <icosahedronGeometry args={[1.5, 4]} />
        <MeshDistortMaterial
          color="#6366f1"
          emissive="#6366f1"
          emissiveIntensity={0.4}
          roughness={0.3}
          metalness={0.8}
          distort={0.3}
          speed={1.5}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Wireframe overlay */}
      <mesh ref={wireframeRef} position={[0, 0, 0]}>
        <icosahedronGeometry args={[1.52, 4]} />
        <meshBasicMaterial
          color="#8b5cf6"
          wireframe
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Inner glow sphere */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial
          color="#06b6d4"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

/**
 * Alternative shape: Torus Knot
 */
export function HeroTorusKnot({ mousePosition = { x: 0, y: 0 } }) {
  const meshRef = useRef(null);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();

    // Rotation
    meshRef.current.rotation.x = time * 0.3;
    meshRef.current.rotation.y = time * 0.2;

    // Mouse follow
    const targetX = mousePosition.x * 0.5;
    const targetY = -mousePosition.y * 0.5;

    meshRef.current.position.x += (targetX - meshRef.current.position.x) * 0.05;
    meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.05;
  });

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[1, 0.3, 128, 16]} />
      <meshStandardMaterial
        color="#6366f1"
        emissive="#6366f1"
        emissiveIntensity={0.3}
        roughness={0.2}
        metalness={0.9}
        wireframe
      />
    </mesh>
  );
}

/**
 * Alternative shape: Abstract Cube Grid
 */
export function HeroCubeGrid({ mousePosition = { x: 0, y: 0 } }) {
  const groupRef = useRef(null);

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime();

    // Group rotation
    groupRef.current.rotation.x = time * 0.1;
    groupRef.current.rotation.y = time * 0.15;

    // Mouse follow
    const targetX = mousePosition.x * 0.3;
    const targetY = -mousePosition.y * 0.3;

    groupRef.current.position.x += (targetX - groupRef.current.position.x) * 0.05;
    groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.05;

    // Animate individual cubes
    groupRef.current.children.forEach((cube, i) => {
      cube.position.y = Math.sin(time + i * 0.5) * 0.1;
      cube.rotation.x = time * 0.5 + i;
      cube.rotation.y = time * 0.3 + i;
    });
  });

  const cubes = [];
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        if (x === 0 && y === 0 && z === 0) continue;
        cubes.push([x * 0.8, y * 0.8, z * 0.8]);
      }
    }
  }

  return (
    <group ref={groupRef}>
      {cubes.map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshStandardMaterial
            color="#6366f1"
            emissive="#8b5cf6"
            emissiveIntensity={0.2}
            wireframe={i % 2 === 0}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}
