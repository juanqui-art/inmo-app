"use client";

/**
 * AI SEARCH MODAL
 *
 * Modal onboarding con:
 * - Header con icon y descripción
 * - AISearchInput component
 * - Examples section (4-6 ejemplos clickeables)
 * - Tips para mejores resultados
 * - Animaciones smooth (Framer Motion)
 * - Dark mode support
 */

import { X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AISearchInput } from "./ai-search-input";

// Ejemplos contextualizados a Ecuador/Cuenca
const EXAMPLES = [
  "Casa moderna en Cuenca con 3 habitaciones",
  "Apartamento cerca de la universidad bajo $120k",
  "Propiedad con jardín y garaje en el norte",
  "Suite amueblada para arriendo en el centro",
  "Casa colonial con patio en Gualaceo",
  "Penthouse con vista panorámica a la ciudad",
];

interface AISearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export function AISearchModal({
  isOpen,
  onClose,
  onSearch,
  isLoading = false,
}: AISearchModalProps) {
  const handleExampleClick = (example: string) => {
    onSearch(example);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Backdrop con blur */}
          <motion.div
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative bg-white dark:bg-oslo-gray-900 rounded-2xl mt-12 p-8 max-w-2xl w-full mx-4 shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-oslo-gray-400 hover:text-oslo-gray-600 dark:hover:text-oslo-gray-200 transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-4 mb-8"
            >
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-oslo-gray-900 dark:text-white">
                  Búsqueda Inteligente
                </h2>
                <p className="text-sm text-oslo-gray-600 dark:text-oslo-gray-400 mt-1">
                  Describe lo que buscas en lenguaje natural
                </p>
              </div>
            </motion.div>

            {/* Search Input */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <AISearchInput
                autoFocus
                placeholder="Ej: Casa moderna con 3 habitaciones cerca del centro"
                onSearch={handleExampleClick}
                isLoading={isLoading}
              />
            </motion.div>

            {/* Examples Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8"
            >
              <p className="text-sm font-semibold mb-4 flex items-center gap-2 text-oslo-gray-900 dark:text-white">
                💡 Prueba con estos ejemplos:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {EXAMPLES.map((example, index) => (
                  <motion.button
                    key={example}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + index * 0.05 }}
                    onClick={() => handleExampleClick(example)}
                    disabled={isLoading}
                    className="text-left p-3 rounded-lg border-2 border-oslo-gray-200 dark:border-oslo-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <p className="text-sm text-oslo-gray-700 dark:text-oslo-gray-300">
                      {example}
                    </p>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Tips Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800"
            >
              <p className="text-sm font-semibold mb-3 text-oslo-gray-900 dark:text-white">
                🎯 Tips para mejores resultados:
              </p>
              <ul className="text-sm space-y-2 text-oslo-gray-700 dark:text-oslo-gray-300">
                <li>• Menciona la ubicación específica (Ej: "en El Ejido")</li>
                <li>
                  • Incluye características importantes (garaje, jardín, etc.)
                </li>
                <li>• Especifica tu presupuesto si lo tienes claro</li>
                <li>
                  • Describe el estilo o tipo de propiedad (moderno, colonial,
                  etc.)
                </li>
              </ul>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
