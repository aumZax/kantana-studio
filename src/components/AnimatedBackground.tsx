import { useEffect, useRef } from "react";

export default function AnimatedBackground() {
  const glowRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const posRef = useRef({ x: -9999, y: -9999 });
  const currentRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMove);

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      currentRef.current.x = lerp(currentRef.current.x, posRef.current.x, 0.08);
      currentRef.current.y = lerp(currentRef.current.y, posRef.current.y, 0.08);

      if (glowRef.current) {
        glowRef.current.style.background = `
          radial-gradient(
            700px circle at ${currentRef.current.x}px ${currentRef.current.y}px,
            rgba(56,189,248,0.055) 0%,
            rgba(56,189,248,0.015) 35%,
            transparent 70%
          )
        `;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes bgGrid {
          0%   { opacity: 0.7; }
          50%  { opacity: 1; }
          100% { opacity: 0.7; }
        }
        @keyframes orb1 {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(60px,-40px) scale(1.08); }
          66%      { transform: translate(-30px,50px) scale(0.95); }
        }
        @keyframes orb2 {
          0%,100% { transform: translate(0,0) scale(1); }
          40%      { transform: translate(-70px,30px) scale(1.05); }
          70%      { transform: translate(50px,-60px) scale(0.92); }
        }
        @keyframes noiseDrift {
          0%   { background-position: 0% 0%; }
          100% { background-position: 100% 100%; }
        }
        .bg-root {
          position: fixed;
          inset: 0;
          background: #0a0a0c;
          z-index: 0;
          overflow: hidden;
          pointer-events: none;
        }
        /* Grid */
        .bg-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px);
          background-size: 44px 44px;
          animation: bgGrid 6s ease-in-out infinite;
        }
        /* Horizon line */
        .bg-horizon {
          position: absolute;
          left: 0; right: 0;
          top: 50%;
          height: 1px;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(56,189,248,0.07) 20%,
            rgba(56,189,248,0.12) 50%,
            rgba(56,189,248,0.07) 80%,
            transparent 100%
          );
        }
        /* Orbs */
        .bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          mix-blend-mode: screen;
        }
        .bg-orb-1 {
          width: 560px; height: 560px;
          top: -120px; left: -100px;
          background: radial-gradient(circle, rgba(14,26,40,0.95) 0%, rgba(56,189,248,0.06) 60%, transparent 100%);
          animation: orb1 20s ease-in-out infinite;
        }
        .bg-orb-2 {
          width: 480px; height: 480px;
          bottom: -100px; right: -80px;
          background: radial-gradient(circle, rgba(14,26,40,0.9) 0%, rgba(56,189,248,0.05) 55%, transparent 100%);
          animation: orb2 24s ease-in-out infinite;
        }
        .bg-orb-3 {
          width: 300px; height: 300px;
          top: 40%; left: 55%;
          background: radial-gradient(circle, rgba(56,189,248,0.03) 0%, transparent 70%);
          filter: blur(60px);
          animation: orb1 30s ease-in-out infinite reverse;
        }
        /* Film grain texture */
        .bg-noise {
          position: absolute;
          inset: -50%;
          width: 200%; height: 200%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          opacity: 0.022;
          animation: noiseDrift 8s linear infinite;
          pointer-events: none;
        }
        /* Corner accents */
        .bg-corner {
          position: absolute;
          width: 120px; height: 120px;
          pointer-events: none;
        }
        .bg-corner-tl {
          top: 24px; left: 24px;
          border-top: 1px solid rgba(56,189,248,0.12);
          border-left: 1px solid rgba(56,189,248,0.12);
        }
        .bg-corner-br {
          bottom: 24px; right: 24px;
          border-bottom: 1px solid rgba(56,189,248,0.12);
          border-right: 1px solid rgba(56,189,248,0.12);
        }
        /* Scan lines */
        .bg-scanlines {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 3px,
            rgba(0,0,0,0.03) 3px,
            rgba(0,0,0,0.03) 4px
          );
          pointer-events: none;
        }
        /* Vignette */
        .bg-vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 90% 90% at 50% 50%,
            transparent 40%,
            rgba(0,0,0,0.55) 100%
          );
        }
        /* Mouse glow layer */
        .bg-mouse-glow {
          position: absolute;
          inset: 0;
          transition: background 0.05s linear;
          pointer-events: none;
          z-index: 5;
        }
      `}</style>

      <div className="bg-root">
        {/* Base grid */}
        <div className="bg-grid" />

        {/* Animated orbs */}
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />

        {/* Horizon accent */}
        <div className="bg-horizon" />

        {/* Film grain */}
        <div className="bg-noise" />

        {/* Scanlines */}
        <div className="bg-scanlines" />

        {/* Vignette */}
        <div className="bg-vignette" />

        {/* Corner brackets */}
        <div className="bg-corner bg-corner-tl" />
        <div className="bg-corner bg-corner-br" />

        {/* Mouse-following glow — pointer-events off, sits above all bg layers */}
        <div ref={glowRef} className="bg-mouse-glow" />
      </div>
    </>
  );
}