'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { TaskExtractorUpload } from '@/components/TaskExtractorUpload';

const QuantumTaskBoard = dynamic(() => import('@/components/QuantumTaskBoard'), { ssr: false });

export default function TasksPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-600 bg-clip-text text-transparent">
          Quantum Task Management
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-slate-900/50 rounded-xl p-6 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-200">
              Extract Tasks from Files
            </h2>
            <TaskExtractorUpload />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900/50 rounded-xl p-6 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-200">
              Task Visualization
            </h2>
            <QuantumTaskBoard />
          </div>
        </div>
      </div>
    </div>
  );
} 