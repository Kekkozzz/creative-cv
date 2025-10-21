'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import FloatingShape from './FloatingShape';

export default function Scene3D() {
  return (
    <div className="w-full h-full">
      <Canvas
        dpr={[1, 2]} // Device pixel ratio (performance vs quality)
        gl={{
          antialias: true,
          alpha: true,
        }}
      >
        {/* Camera */}
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={60} />

        {/* Lights */}
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#6366f1" />

        {/* Environment lighting (HDRI) */}
        <Environment preset="city" />

        {/* 3D Object - Retro Computer */}
        <FloatingShape />

        {/* Controls (opzionali - rimuovi se vuoi solo auto-rotate) */}
        
      </Canvas>
    </div>
  );
}
