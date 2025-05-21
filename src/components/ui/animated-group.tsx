"use client"

import React from "react";
import { motion, Variants } from "framer-motion";

import { cn } from "@/lib/utils";

interface AnimatedGroupProps {
  children: React.ReactNode;
  variants: Variants;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: "linear" | "easeIn" | "easeOut" | "easeInOut" | "circIn" | "circOut" | "circInOut" | "backIn" | "backOut" | "backInOut" | "anticipate";
}

export const AnimatedGroup: React.FC<AnimatedGroupProps> = ({
  children,
  variants,
  className,
  delay = 0.1,
  duration = 0.4,
  ease = "easeInOut",
}) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={{
        delay,
        duration,
        ease
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
};
