"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useLoadingState } from "@/hooks/use-loading-state";
import { LoadingOverlay } from "@/components/ui/loading-overlay";

interface LoadingContextType {
  isAppLoading: boolean;
  setAppLoading: (loading: boolean) => void;
  registerComponent: (id: string) => void;
  unregisterComponent: (id: string) => void;
  markComponentLoaded: (id: string) => void;
  markComponentError: (id: string, error?: any) => void;
  getLoadingProgress: () => number;
  getLoadedComponents: () => string[];
  getPendingComponents: () => string[];
  isAllComponentsLoaded: () => boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

interface LoadingProviderProps {
  children: ReactNode;
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const loadingState = useLoadingState();

  return (
    <LoadingContext.Provider value={loadingState}>
      <LoadingOverlay 
        isLoading={loadingState.isAppLoading}
        onLoadingComplete={() => {
          // Additional cleanup can be added here if needed
        }}
      />
      {children}
    </LoadingContext.Provider>
  );
} 