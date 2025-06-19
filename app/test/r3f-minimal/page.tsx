'use client';
import { Canvas } from '@react-three/fiber';
import { Box, OrbitControls } from '@react-three/drei';

export default function MinimalR3FTest() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#111' }}>
      <Canvas camera={{ position: [2, 2, 2] }}>
        <ambientLight intensity={0.5} />
        <Box position={[0, 0, 0]} />
        <OrbitControls />
      </Canvas>
    </div>
  );
} 