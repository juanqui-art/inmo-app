"use client";

/**
 * USE AI SEARCH HOOK
 *
 * Hook para manejar el estado del modal de búsqueda y queries
 * Prepara infraestructura para Sesión 2 (integración con IA)
 *
 * TODO: En Sesión 2 agregamos:
 * - Llamada a Server Action aiSearchAction()
 * - State para resultados
 * - State para errores
 * - Loading states
 */

import { useState } from "react";

interface UseAISearchReturn {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  isLoading: boolean;
  lastQuery: string | null;
  handleSearch: (query: string) => void;
}

export function useAISearch(): UseAISearchReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastQuery, setLastQuery] = useState<string | null>(null);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setLastQuery(query);

    try {
      // TODO: Sesión 2 - Llamar a Server Action
      // const result = await aiSearchAction(query);
      // if (result.success) {
      //   closeModal();
      //   // Actualizar map con resultados
      // }

      // Por ahora solo log para verificar UI
      console.log("Search query:", query);

      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // TODO: Remover este console.log en Sesión 2
      console.log("Search completed (mock)");
    } catch (error) {
      console.error("Search failed:", error);
      // TODO: Show error toast
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isOpen,
    openModal,
    closeModal,
    isLoading,
    lastQuery,
    handleSearch,
  };
}
