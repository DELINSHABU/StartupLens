"use client";

import { motion } from "motion/react";
import { useRef, useEffect } from "react";
import gsap from "gsap";

// Fade in from below — use on any section/card
export function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Stagger children — wrap a grid/list container
export function StaggerContainer({
  children,
  className = "",
  stagger = 0.08,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Individual stagger item — use as direct children of StaggerContainer
export function StaggerItem({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.4, 0.25, 1] } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Slide in from left — good for sidebar items
export function SlideIn({
  children,
  delay = 0,
  className = "",
  direction = "left",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  direction?: "left" | "right";
}) {
  const x = direction === "left" ? -20 : 20;
  return (
    <motion.div
      initial={{ opacity: 0, x }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Page wrapper with fade transition
export function PageTransition({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.4, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// GSAP: Glowing pulse effect — attach to a ref
export function GsapPulse({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    tl.to(ref.current, {
      boxShadow: "0 0 20px rgba(0, 98, 255, 0.4), 0 0 40px rgba(180, 197, 255, 0.15)",
      scale: 1.05,
      duration: 1.5,
      ease: "sine.inOut",
    });
    return () => { tl.kill(); };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

// GSAP: Count-up number animation
export function CountUp({
  target,
  duration = 1.2,
  className = "",
}: {
  target: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const prevTarget = useRef(0);

  useEffect(() => {
    if (!ref.current) return;
    const obj = { val: prevTarget.current };
    gsap.to(obj, {
      val: target,
      duration,
      ease: "power2.out",
      onUpdate: () => {
        if (ref.current) ref.current.textContent = Math.round(obj.val).toString();
      },
    });
    prevTarget.current = target;
  }, [target, duration]);

  return <span ref={ref} className={className}>0</span>;
}
