'use client';

import { useState } from 'react';

interface DemoComponentProps {
  title?: string;
}

export function DemoComponent({ title = 'Componente de Prueba' }: DemoComponentProps) {
  const [count, setCount] = useState(0);
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        {title}
      </h2>

      <div className="space-y-4">
        {/* Counter */}
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            Contador: <span className="font-bold text-lg">{count}</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCount(count + 1)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
            >
              Incrementar
            </button>
            <button
              onClick={() => setCount(0)}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Toggle */}
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Estado: {isActive ? '✅ Activo' : '❌ Inactivo'}
            </p>
            <button
              onClick={() => setIsActive(!isActive)}
              className={`px-4 py-2 rounded transition-all ${
                isActive
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-red-500 hover:bg-red-600'
              } text-white`}
            >
              Toggle
            </button>
          </div>

          {isActive && (
            <div className="mt-3 p-3 bg-green-100 dark:bg-green-900 rounded text-green-800 dark:text-green-200 text-sm animate-in fade-in">
              ¡Panel activado! 🎉
            </div>
          )}
        </div>

        {/* Info */}
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Next.js 15 + React 19 + TypeScript + Tailwind v4
        </div>
      </div>
    </div>
  );
}
