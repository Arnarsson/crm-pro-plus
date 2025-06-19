'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Line, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NetworkNode {
  id: string;
  name: string;
  position: [number, number, number];
  influence: number;
  type: 'self' | 'contact' | 'company' | 'opportunity';
  connectionCount: number;
  avatar?: string;
}

interface NetworkEdge {
  source: string;
  target: string;
  strength: number;
  type: 'direct' | 'mutual' | 'weak';
}

interface NetworkGraphProps {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  selectedNodeId?: string;
  onNodeClick?: (node: NetworkNode) => void;
  onNodeHover?: (node: NetworkNode | null) => void;
}

function Node({ node, isSelected, onClick, onHover }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Floating animation
      meshRef.current.position.y = node.position[1] + Math.sin(state.clock.elapsedTime + node.id) * 0.1;
      
      // Pulsing effect for selected nodes
      if (isSelected) {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
        meshRef.current.scale.setScalar(scale);
      }
    }
  });

  const getNodeColor = () => {
    switch (node.type) {
      case 'self': return '#6366F1';
      case 'contact': return '#10B981';
      case 'company': return '#F59E0B';
      case 'opportunity': return '#EC4899';
      default: return '#64748B';
    }
  };

  const nodeSize = 0.3 + (node.influence / 100) * 0.5;

  return (
    <group position={node.position}>
      <Sphere
        ref={meshRef}
        args={[nodeSize, 32, 16]}
        onClick={() => onClick(node)}
        onPointerOver={() => {
          setHovered(true);
          onHover(node);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          onHover(null);
          document.body.style.cursor = 'default';
        }}
      >
        <meshPhongMaterial
          color={getNodeColor()}
          emissive={getNodeColor()}
          emissiveIntensity={hovered || isSelected ? 0.5 : 0.2}
          transparent
          opacity={0.9}
        />
      </Sphere>
      
      {/* Node label */}
      <Text
        position={[0, nodeSize + 0.3, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {node.name}
      </Text>

      {/* Connection count indicator */}
      {node.connectionCount > 0 && (
        <Text
          position={[nodeSize + 0.2, 0, 0]}
          fontSize={0.1}
          color="#CBD5E1"
          anchorX="center"
          anchorY="middle"
        >
          {node.connectionCount}
        </Text>
      )}

      {/* Influence ring */}
      {node.influence > 50 && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[nodeSize + 0.1, nodeSize + 0.15, 32]} />
          <meshBasicMaterial color="#A855F7" transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
}

function Edge({ edge, nodes }: any) {
  const source = nodes.find((n: NetworkNode) => n.id === edge.source);
  const target = nodes.find((n: NetworkNode) => n.id === edge.target);

  if (!source || !target) return null;

  const getEdgeColor = () => {
    switch (edge.type) {
      case 'direct': return '#6366F1';
      case 'mutual': return '#10B981';
      case 'weak': return '#64748B';
      default: return '#475569';
    }
  };

  const lineWidth = edge.strength * 2;

  return (
    <Line
      points={[source.position, target.position]}
      color={getEdgeColor()}
      lineWidth={lineWidth}
      transparent
      opacity={0.6}
    />
  );
}

function ParticleField() {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 500;

  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 50;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
  }

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#6366F1" transparent opacity={0.3} />
    </points>
  );
}

export function NetworkGraph({
  nodes,
  edges,
  selectedNodeId,
  onNodeClick,
  onNodeHover
}: NetworkGraphProps) {
  const [hoveredNode, setHoveredNode] = useState<NetworkNode | null>(null);

  return (
    <div className="relative w-full h-full">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        className="bg-transparent"
      >
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#6366F1" />

        {/* Particle background */}
        <ParticleField />

        {/* Render nodes */}
        {nodes.map((node) => (
          <Node
            key={node.id}
            node={node}
            isSelected={node.id === selectedNodeId}
            onClick={onNodeClick || (() => {})}
            onHover={setHoveredNode}
          />
        ))}

        {/* Render edges */}
        {edges.map((edge, index) => (
          <Edge key={index} edge={edge} nodes={nodes} />
        ))}

        {/* Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={true}
          autoRotateSpeed={0.5}
        />
      </Canvas>

      {/* Hover Info */}
      <AnimatePresence>
        {hoveredNode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-4 left-4 glass-premium rounded-xl p-4 max-w-sm"
          >
            <h3 className="text-lg font-semibold text-white mb-2">{hoveredNode.name}</h3>
            <div className="space-y-1 text-sm text-gray-300">
              <p>Type: <span className="text-white capitalize">{hoveredNode.type}</span></p>
              <p>Connections: <span className="text-white">{hoveredNode.connectionCount}</span></p>
              <p>Influence: <span className="text-white">{hoveredNode.influence}%</span></p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 glass-premium rounded-lg p-3">
        <h4 className="text-xs font-semibold text-white mb-2">Network Legend</h4>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-indigo-500" />
            <span className="text-xs text-gray-300">You / Direct</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-xs text-gray-300">Contacts / Mutual</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-xs text-gray-300">Companies</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-pink-500" />
            <span className="text-xs text-gray-300">Opportunities</span>
          </div>
        </div>
      </div>
    </div>
  );
}