"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingOverlayProps {
  isLoading: boolean;
  onLoadingComplete?: () => void;
}

export function LoadingOverlay({ isLoading, onLoadingComplete }: LoadingOverlayProps) {
  useEffect(() => {
    if (!isLoading && onLoadingComplete) {
      const timer = setTimeout(() => {
        onLoadingComplete();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, onLoadingComplete]);

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0
          }}
          transition={{ 
            duration: 0.5,
            ease: "easeOut"
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.3,
              delay: 0.1
            }}
            className="text-center space-y-6"
          >
            <h2 className="text-xl font-medium text-gray-800">
              Loading your content
            </h2>
            
            {/* Progress bar */}
            <div className="w-80 h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gray-800 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ 
                  duration: 1.2,
                  ease: "easeOut"
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 