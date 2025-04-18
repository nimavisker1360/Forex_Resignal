"use client";

import { motion } from "framer-motion";
import { ReactNode, CSSProperties } from "react";

// Animation variants
export const fadeInFromLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
};

// Simple fade in animation variant without horizontal movement
export const justFadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
    },
  },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 0.3,
    transition: {
      duration: 1.2,
      ease: "easeInOut",
    },
  },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

interface MotionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  style?: CSSProperties;
}

export const MotionDiv = ({
  children,
  className,
  delay = 0,
  style,
}: MotionProps) => {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
    >
      {children}
    </motion.div>
  );
};

export const MotionImage = ({
  children,
  className,
  delay = 0,
  style,
}: MotionProps) => {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.1 }}
      transition={{
        duration: 1.5,
        delay,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
};

export const MotionStaggerContainer = ({
  children,
  className,
  style,
}: MotionProps) => {
  return (
    <motion.div
      className={className}
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={staggerContainer}
    >
      {children}
    </motion.div>
  );
};

export const MotionStaggerItem = ({
  children,
  className,
  style,
}: MotionProps) => {
  return (
    <motion.div className={className} style={style} variants={justFadeIn}>
      {children}
    </motion.div>
  );
};

export const MotionHeading = ({ children, className, style }: MotionProps) => {
  return (
    <motion.h2 className={className} style={style} variants={fadeInFromLeft}>
      {children}
    </motion.h2>
  );
};

export const MotionParagraph = ({
  children,
  className,
  style,
}: MotionProps) => {
  return (
    <motion.p className={className} style={style} variants={fadeInFromLeft}>
      {children}
    </motion.p>
  );
};
