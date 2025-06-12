"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface LoadingState {
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

export function useLoadingState(): LoadingState {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [registeredComponents, setRegisteredComponents] = useState<Set<string>>(new Set());
  const [loadedComponents, setLoadedComponents] = useState<Set<string>>(new Set());
  const [errorComponents, setErrorComponents] = useState<Set<string>>(new Set());
  const domReadyRef = useRef(false);
  const initialLoadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const registerComponent = useCallback((id: string) => {
    setRegisteredComponents(prev => new Set([...prev, id]));
  }, []);

  const unregisterComponent = useCallback((id: string) => {
    setRegisteredComponents(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    setLoadedComponents(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    setErrorComponents(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  const markComponentLoaded = useCallback((id: string) => {
    setLoadedComponents(prev => new Set([...prev, id]));
    setErrorComponents(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  const markComponentError = useCallback((id: string, error?: any) => {
    setErrorComponents(prev => new Set([...prev, id]));
    console.warn(`Component ${id} failed to load:`, error);
  }, []);

  const getLoadingProgress = useCallback((): number => {
    const totalComponents = registeredComponents.size;
    const completedComponents = loadedComponents.size + errorComponents.size;
    
    if (totalComponents === 0) return 0;
    return Math.round((completedComponents / totalComponents) * 100);
  }, [registeredComponents.size, loadedComponents.size, errorComponents.size]);

  const getLoadedComponents = useCallback((): string[] => {
    return Array.from(loadedComponents);
  }, [loadedComponents]);

  const getPendingComponents = useCallback((): string[] => {
    return Array.from(registeredComponents).filter(
      id => !loadedComponents.has(id) && !errorComponents.has(id)
    );
  }, [registeredComponents, loadedComponents, errorComponents]);

  const isAllComponentsLoaded = useCallback((): boolean => {
    if (registeredComponents.size === 0) return false;
    const completedComponents = loadedComponents.size + errorComponents.size;
    return completedComponents >= registeredComponents.size && domReadyRef.current;
  }, [registeredComponents.size, loadedComponents.size, errorComponents.size]);

  const setAppLoading = useCallback((loading: boolean) => {
    setIsAppLoading(loading);
  }, []);

  // Check DOM readiness
  useEffect(() => {
    const checkDOMReady = () => {
      if (document.readyState === 'complete') {
        domReadyRef.current = true;
        return;
      }

      const handleDOMContentLoaded = () => {
        setTimeout(() => {
          domReadyRef.current = true;
        }, 50);
      };

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', handleDOMContentLoaded);
      } else {
        handleDOMContentLoaded();
      }

      return () => {
        document.removeEventListener('DOMContentLoaded', handleDOMContentLoaded);
      };
    };

    checkDOMReady();
  }, []);

  // Check if we should hide loading overlay
  useEffect(() => {
    if (isAllComponentsLoaded() && domReadyRef.current) {
      const timer = setTimeout(() => {
        setIsAppLoading(false);
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [isAllComponentsLoaded]);

  // Fallback timeout to prevent infinite loading
  useEffect(() => {
    initialLoadTimeoutRef.current = setTimeout(() => {
      console.warn('Loading timeout reached, forcing app to show');
      domReadyRef.current = true;
      setIsAppLoading(false);
    }, 1500); // 1.5 second maximum loading time

    return () => {
      if (initialLoadTimeoutRef.current) {
        clearTimeout(initialLoadTimeoutRef.current);
      }
    };
  }, []);

  // Auto-register core components on mount
  useEffect(() => {
    registerComponent('app-initialization');
    
    // Mark initialization as complete immediately
    const timer = setTimeout(() => {
      markComponentLoaded('app-initialization');
    }, 50);

    return () => clearTimeout(timer);
  }, [registerComponent, markComponentLoaded]);

  return {
    isAppLoading,
    setAppLoading,
    registerComponent,
    unregisterComponent,
    markComponentLoaded,
    markComponentError,
    getLoadingProgress,
    getLoadedComponents,
    getPendingComponents,
    isAllComponentsLoaded
  };
} 