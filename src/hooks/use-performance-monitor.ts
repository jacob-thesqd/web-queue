import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  fps: number;
  scrollPerformance: number;
  memoryUsage: number;
}

export function usePerformanceMonitor(enableMonitoring = false) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    scrollPerformance: 0,
    memoryUsage: 0
  });
  
  const frameRef = useRef<number>(0);
  const fpsCounterRef = useRef<number[]>([]);
  const lastTimeRef = useRef<number>(0);
  const scrollStartRef = useRef<number>(0);
  const scrollEndRef = useRef<number>(0);

  useEffect(() => {
    if (!enableMonitoring) return;

    // FPS monitoring
    const measureFPS = () => {
      const now = performance.now();
      if (lastTimeRef.current) {
        const fps = 1000 / (now - lastTimeRef.current);
        fpsCounterRef.current.push(fps);
        
        // Keep only last 60 measurements (1 second at 60fps)
        if (fpsCounterRef.current.length > 60) {
          fpsCounterRef.current.shift();
        }
        
        // Calculate average FPS
        const avgFPS = fpsCounterRef.current.reduce((a, b) => a + b, 0) / fpsCounterRef.current.length;
        
        setMetrics(prev => ({
          ...prev,
          fps: Math.round(avgFPS)
        }));
      }
      lastTimeRef.current = now;
      frameRef.current = requestAnimationFrame(measureFPS);
    };

    // Scroll performance monitoring
    const handleScrollStart = () => {
      scrollStartRef.current = performance.now();
    };

    const handleScrollEnd = () => {
      if (scrollStartRef.current) {
        scrollEndRef.current = performance.now();
        const scrollDuration = scrollEndRef.current - scrollStartRef.current;
        
        setMetrics(prev => ({
          ...prev,
          scrollPerformance: Math.round(scrollDuration)
        }));
      }
    };

    // Memory monitoring
    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usage = Math.round((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100);
        setMetrics(prev => ({
          ...prev,
          memoryUsage: usage
        }));
      }
    };

    // Throttled scroll handler
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      if (!scrollStartRef.current) {
        handleScrollStart();
      }
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScrollEnd, 150); // 150ms after scroll stops
    };

    // Start monitoring
    frameRef.current = requestAnimationFrame(measureFPS);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Update memory usage every 5 seconds
    const memoryInterval = setInterval(updateMemoryUsage, 5000);
    updateMemoryUsage(); // Initial measurement

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      window.removeEventListener('scroll', handleScroll);
      clearInterval(memoryInterval);
      clearTimeout(scrollTimeout);
    };
  }, [enableMonitoring]);

  return metrics;
} 