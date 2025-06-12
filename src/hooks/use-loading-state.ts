"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { globalConfig } from "@/config/globalConfig";

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

  // Get config values
  const { 
    minimumDisplayTime, 
    transitionDelay, 
    domReadyDelay, 
    initializationDelay 
  } = globalConfig.loadingOverlay;

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
        }, domReadyDelay);
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
  }, [domReadyDelay]);

  // Check if we should hide loading overlay
  useEffect(() => {
    if (isAllComponentsLoaded() && domReadyRef.current) {
      const timer = setTimeout(() => {
        setIsAppLoading(false);
      }, transitionDelay);
      
      return () => clearTimeout(timer);
    }
  }, [isAllComponentsLoaded, transitionDelay]);

  // Fallback timeout to ensure minimum display time
  useEffect(() => {
    initialLoadTimeoutRef.current = setTimeout(() => {
      console.log('Minimum loading time reached, allowing app to show');
      domReadyRef.current = true;
      setIsAppLoading(false);
    }, minimumDisplayTime * 1000); // Convert seconds to milliseconds

    return () => {
      if (initialLoadTimeoutRef.current) {
        clearTimeout(initialLoadTimeoutRef.current);
      }
    };
  }, [minimumDisplayTime]);

  // Auto-register core components on mount
  useEffect(() => {
    registerComponent('app-initialization');
    
    // Mark initialization as complete with configured delay
    const timer = setTimeout(() => {
      markComponentLoaded('app-initialization');
    }, initializationDelay);

    return () => clearTimeout(timer);
  }, [registerComponent, markComponentLoaded, initializationDelay]);

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