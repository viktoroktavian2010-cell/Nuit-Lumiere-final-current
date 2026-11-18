import { useEffect, useRef } from "react";
import "./GoldenDustCursor.css";

type DustParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  age: number;
  lifetime: number;
};

/** Subtle, decorative golden particle trail that follows a mouse or pen pointer. */
export default function GoldenDustCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(pointer: fine)");
    if (reducedMotion.matches || !finePointer.matches) return;

    const particles: DustParticle[] = [];
    let animationFrame = 0;
    let animationRunning = false;
    let previousFrameTime: number | null = null;
    let previousPoint: { x: number; y: number } | null = null;

    const resizeCanvas = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * ratio);
      canvas.height = Math.round(window.innerHeight * ratio);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const addParticle = (x: number, y: number) => {
      particles.push({
        x: x + (Math.random() - 0.5) * 5,
        y: y + (Math.random() - 0.5) * 5,
        vx: (Math.random() - 0.5) * 0.34,
        vy: -Math.random() * 0.48 - 0.08,
        radius: Math.random() * 1.45 + 0.45,
        age: 0,
        lifetime: 520 + Math.random() * 440,
      });
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const point = { x: event.clientX, y: event.clientY };
      if (!previousPoint) {
        addParticle(point.x, point.y);
        addParticle(point.x, point.y);
      } else {
        const distance = Math.hypot(
          point.x - previousPoint.x,
          point.y - previousPoint.y
        );
        const steps = Math.min(8, Math.max(1, Math.ceil(distance / 12)));
        for (let step = 0; step < steps; step += 1) {
          const progress = (step + 1) / steps;
          addParticle(
            previousPoint.x + (point.x - previousPoint.x) * progress,
            previousPoint.y + (point.y - previousPoint.y) * progress
          );
        }
      }
      previousPoint = point;
      if (particles.length > 320) particles.splice(0, particles.length - 320);
      if (!animationRunning) {
        animationRunning = true;
        animationFrame = window.requestAnimationFrame(drawFrame);
      }
    };

    const drawFrame = (timestamp: number) => {
      const elapsed =
        previousFrameTime === null
          ? 16
          : Math.min(timestamp - previousFrameTime, 40);
      previousFrameTime = timestamp;
      const width = window.innerWidth;
      const height = window.innerHeight;
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = "lighter";

      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index];
        particle.age += elapsed;
        particle.x += particle.vx;
        particle.y += particle.vy;
        const progress = Math.min(1, particle.age / particle.lifetime);
        const opacity = (1 - progress) * 0.62;
        const glow = context.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.radius * 3.2
        );
        glow.addColorStop(0, `rgba(255, 235, 174, ${opacity})`);
        glow.addColorStop(0.38, `rgba(229, 193, 88, ${opacity * 0.72})`);
        glow.addColorStop(1, "rgba(229, 193, 88, 0)");
        context.fillStyle = glow;
        context.beginPath();
        context.arc(
          particle.x,
          particle.y,
          particle.radius * 3.2,
          0,
          Math.PI * 2
        );
        context.fill();
        if (progress >= 1) particles.splice(index, 1);
      }

      context.globalCompositeOperation = "source-over";
      if (particles.length > 0) {
        animationFrame = window.requestAnimationFrame(drawFrame);
      } else {
        animationRunning = false;
        previousFrameTime = null;
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    animationFrame = window.requestAnimationFrame(drawFrame);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("pointermove", handlePointerMove);
      context.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="golden-dust-canvas" aria-hidden="true" />
  );
}
