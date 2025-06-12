"use client";
import { motion, Easing } from "framer-motion";

export function Header({
  title,
  subtitle,
  children,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between py-2">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" as Easing, delay: 0.1 }}
      >
        <h1 className="text-xl font-semibold tracking-tight text-gray-900">
          {title}
        </h1>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" as Easing, delay: 0.1 }}
      >
        {children}
      </motion.div>
    </header>
  );
} 