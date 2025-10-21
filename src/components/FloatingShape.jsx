'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

export default function FloatingShape() {
  const modelRef = useRef();

  // Carica il modello 3D
  const { scene } = useGLTF('/retro_computer.glb');

  // Animation loop - rotazione dolce e floating effect
  useFrame((state, delta) => {
    if (modelRef.current) {
      // Rotazione lenta sull'asse Y (gira orizzontalmente)
      modelRef.current.rotation.y += delta * 0.3;

      // Floating effect (su e giù)
      modelRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;

      // Lieve oscillazione sull'asse X per più dinamicità
      modelRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <primitive
      ref={modelRef}
      object={scene}
      scale={1}
      position={[0, 0, 0]}
    />
  );
}

// Preload del modello per performance ottimali
useGLTF.preload('/retro_computer.glb');
