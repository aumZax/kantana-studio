// src/components/NetworkCanvas.tsx
import { useEffect, useRef } from 'react';

export default function NetworkCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const overlayRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const overlay = overlayRef.current;
        if (!canvas || !overlay) return;

        const ctx = canvas.getContext('2d')!;
        const octx = overlay.getContext('2d')!;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            overlay.width = window.innerWidth;
            overlay.height = window.innerHeight;
        };
        resize();

        // ─── Types ──────────────────────────────────────────────────────────
        type Node = {
            x: number; y: number; r: number;
            vx: number; vy: number;
            pulse: number; pulseSpeed: number;
            tier: 0 | 1 | 2;
            burstT: number;
            label: string;
        };

        type Edge = { a: number; b: number; len: number; flowDir: 1 | -1; arrowT: number };

        type Packet = {
            edge: number; t: number; speed: number; dir: 1 | -1;
            alpha: number; hue: number; size: number; trail: { x: number; y: number }[];
        };

        type Nebula = { x: number; y: number; r: number; hue: number; alpha: number };

        // ─── Nebula clouds ───────────────────────────────────────────────────
        const NEBULAE: Nebula[] = Array.from({ length: 7 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: 180 + Math.random() * 260,
            hue: [210, 225, 200, 240, 195][Math.floor(Math.random() * 5)],
            alpha: 0.018 + Math.random() * 0.022,
        }));

        const STAGE_LABELS = ['Asset', 'Shot', 'Task', 'Version', 'Sequence', 'Pipline', 'People', 'Chapter'];

        // ─── Build nodes ────────────────────────────────────────────────────
        const buildNodes = (): Node[] =>
            Array.from({ length: 24 }, (_, i) => {
                const tier = (i % 3) as 0 | 1 | 2;
                return {
                    x: 80 + Math.random() * (canvas.width - 160),
                    y: 80 + Math.random() * (canvas.height - 160),
                    r: tier === 0 ? 10 + Math.random() * 4 : tier === 1 ? 6 + Math.random() * 3 : 3 + Math.random() * 2,
                    vx: (Math.random() - 0.5) * 0.12,
                    vy: (Math.random() - 0.5) * 0.12,
                    pulse: Math.random() * Math.PI * 2,
                    pulseSpeed: 0.006 + Math.random() * 0.01,
                    tier,
                    burstT: 0,
                    label: STAGE_LABELS[i % STAGE_LABELS.length],
                };
            });

        // ─── Build edges ────────────────────────────────────────────────────
        const buildEdges = (nodes: Node[]): Edge[] => {
            const out: Edge[] = [];
            const MAX_DIST = Math.min(canvas.width, canvas.height) * 0.38;
            for (let i = 0; i < nodes.length; i++) {
                let conn = 0;
                for (let j = i + 1; j < nodes.length && conn < 4; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const len = Math.sqrt(dx * dx + dy * dy);
                    if (len < MAX_DIST) {
                        out.push({ a: i, b: j, len, flowDir: Math.random() > 0.5 ? 1 : -1, arrowT: Math.random() });
                        conn++;
                    }
                }
            }
            return out;
        };

        let nodes = buildNodes();
        let edges = buildEdges(nodes);

        // ─── Packets ────────────────────────────────────────────────────────
        const packets: Packet[] = [];
        const spawnPacket = () => {
            if (!edges.length) return;
            packets.push({
                edge: Math.floor(Math.random() * edges.length),
                t: Math.random(),
                speed: 0.0006 + Math.random() * 0.0012,
                dir: Math.random() > 0.5 ? 1 : -1,
                alpha: 0.7 + Math.random() * 0.3,
                hue: [205, 215, 190, 230, 170][Math.floor(Math.random() * 5)],
                size: 1.5 + Math.random() * 2,
                trail: [],
            });
        };
        for (let i = 0; i < 38; i++) spawnPacket();
        const spawnInterval = setInterval(spawnPacket, 420);

        // ─── Hex grid ───────────────────────────────────────────────────────
        const drawHexGrid = () => {
            const size = 38;
            const w = size * 2;
            const h = Math.sqrt(3) * size;
            ctx.strokeStyle = 'rgba(30,80,200,0.032)';
            ctx.lineWidth = 0.5;
            for (let row = -1; row < canvas.height / h + 1; row++) {
                for (let col = -1; col < canvas.width / (w * 0.75) + 1; col++) {
                    const cx = col * w * 0.75;
                    const cy = row * h + (col % 2 === 0 ? 0 : h / 2);
                    ctx.beginPath();
                    for (let k = 0; k < 6; k++) {
                        const angle = (Math.PI / 3) * k - Math.PI / 6;
                        const hx = cx + size * Math.cos(angle);
                        const hy = cy + size * Math.sin(angle);
                        k === 0 ? ctx.moveTo(hx, hy) : ctx.lineTo(hx, hy);
                    }
                    ctx.closePath();
                    ctx.stroke();
                }
            }
        };

        // ─── Scanline overlay (once) ────────────────────────────────────────
        const drawScanlines = () => {
            octx.clearRect(0, 0, overlay.width, overlay.height);
            for (let y = 0; y < overlay.height; y += 3) {
                octx.fillStyle = 'rgba(0,0,0,0.045)';
                octx.fillRect(0, y, overlay.width, 1);
            }
            // Vignette
            const vg = octx.createRadialGradient(
                overlay.width / 2, overlay.height / 2, overlay.width * 0.2,
                overlay.width / 2, overlay.height / 2, overlay.width * 0.82
            );
            vg.addColorStop(0, 'transparent');
            vg.addColorStop(1, 'rgba(0,2,10,0.62)');
            octx.fillStyle = vg;
            octx.fillRect(0, 0, overlay.width, overlay.height);
        };
        drawScanlines();

        let frame = 0;
        let animId: number;

        // ─── Main draw loop ──────────────────────────────────────────────────
        const draw = () => {
            frame++;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // ── Deep space background ──
            ctx.fillStyle = '#020510';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // ── Nebula blobs ──
            for (const nb of NEBULAE) {
                const grad = ctx.createRadialGradient(nb.x, nb.y, 0, nb.x, nb.y, nb.r);
                grad.addColorStop(0, `hsla(${nb.hue},80%,45%,${nb.alpha * 2.2})`);
                grad.addColorStop(0.5, `hsla(${nb.hue},60%,35%,${nb.alpha})`);
                grad.addColorStop(1, 'transparent');
                ctx.beginPath();
                ctx.arc(nb.x, nb.y, nb.r, 0, Math.PI * 2);
                ctx.fillStyle = grad;
                ctx.fill();
            }

            // ── Hex grid ──
            drawHexGrid();

            // ── Horizon line (pipeline flow indicator) ──
            const midY = canvas.height * 0.5;
            for (let x = 0; x < canvas.width; x += 8) {
                const t = (x / canvas.width + frame * 0.001) % 1;
                const a = Math.sin(t * Math.PI) * 0.06;
                ctx.fillStyle = `rgba(60,140,255,${a.toFixed(3)})`;
                ctx.fillRect(x, midY - 0.5, 4, 1);
            }

            // ── Move nodes (drift) ──
            for (const n of nodes) {
                n.x += n.vx; n.y += n.vy;
                if (n.x < 40 || n.x > canvas.width - 40) n.vx *= -1;
                if (n.y < 40 || n.y > canvas.height - 40) n.vy *= -1;
                if (n.burstT > 0) n.burstT -= 0.018;
            }

            // ── Rebuild edges every ~180 frames (topology shift) ──
            if (frame % 180 === 0) edges = buildEdges(nodes);

            // ── Edges ──
            for (const e of edges) {
                const na = nodes[e.a], nb = nodes[e.b];
                const fade = Math.pow(1 - e.len / (Math.min(canvas.width, canvas.height) * 0.38), 1.4);

                // Glow halo
                ctx.beginPath(); ctx.moveTo(na.x, na.y); ctx.lineTo(nb.x, nb.y);
                ctx.strokeStyle = `rgba(10,50,160,${(0.08 * fade).toFixed(3)})`;
                ctx.lineWidth = 8; ctx.stroke();

                // Mid
                ctx.beginPath(); ctx.moveTo(na.x, na.y); ctx.lineTo(nb.x, nb.y);
                ctx.strokeStyle = `rgba(40,110,255,${(0.09 * fade).toFixed(3)})`;
                ctx.lineWidth = 1.5; ctx.stroke();

                // Core fine line
                ctx.beginPath(); ctx.moveTo(na.x, na.y); ctx.lineTo(nb.x, nb.y);
                ctx.strokeStyle = `rgba(80,160,255,${(0.16 * fade).toFixed(3)})`;
                ctx.lineWidth = 0.4; ctx.stroke();

                // Flow arrow chevron (moves along edge)
                e.arrowT = (e.arrowT + 0.003 * e.flowDir + 1) % 1;
                const at = e.arrowT;
                const ax = na.x + (nb.x - na.x) * at;
                const ay = na.y + (nb.y - na.y) * at;
                const angle = Math.atan2(nb.y - na.y, nb.x - na.x) * (e.flowDir === 1 ? 1 : -1) + (e.flowDir === -1 ? Math.PI : 0);
                ctx.save();
                ctx.translate(ax, ay);
                ctx.rotate(angle);
                ctx.beginPath();
                ctx.moveTo(-4, -3); ctx.lineTo(0, 0); ctx.lineTo(-4, 3);
                ctx.strokeStyle = `rgba(100,200,255,${(0.45 * fade).toFixed(3)})`;
                ctx.lineWidth = 0.8;
                ctx.stroke();
                ctx.restore();
            }

            // ── Packets ──
            for (const p of packets) {
                p.t += p.speed * p.dir;
                if (p.t > 1 || p.t < 0) {
                    p.dir = (-p.dir) as 1 | -1;
                    p.t = Math.max(0, Math.min(1, p.t));
                    // trigger burst on arrival node
                    const e = edges[p.edge];
                    if (e) {
                        const target = p.dir === -1 ? nodes[e.a] : nodes[e.b];
                        target.burstT = 1;
                    }
                }
                const e = edges[p.edge];
                if (!e) continue;
                const na = nodes[e.a], nb = nodes[e.b];
                const px = na.x + (nb.x - na.x) * p.t;
                const py = na.y + (nb.y - na.y) * p.t;

                // Record trail
                p.trail.push({ x: px, y: py });
                if (p.trail.length > 28) p.trail.shift();

                // Draw trail
                for (let k = 1; k < p.trail.length; k++) {
                    const ratio = k / p.trail.length;
                    ctx.beginPath();
                    ctx.moveTo(p.trail[k - 1].x, p.trail[k - 1].y);
                    ctx.lineTo(p.trail[k].x, p.trail[k].y);
                    ctx.strokeStyle = `hsla(${p.hue},90%,72%,${(ratio * p.alpha * 0.65).toFixed(3)})`;
                    ctx.lineWidth = p.size * ratio * 0.9;
                    ctx.stroke();
                }

                // Outer corona
                ctx.beginPath(); ctx.arc(px, py, p.size * 4.5, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${p.hue},80%,60%,${(p.alpha * 0.08).toFixed(3)})`; ctx.fill();

                // Mid glow
                ctx.beginPath(); ctx.arc(px, py, p.size * 2.2, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${p.hue},90%,70%,${(p.alpha * 0.25).toFixed(3)})`; ctx.fill();

                // Core
                ctx.beginPath(); ctx.arc(px, py, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${p.hue},100%,88%,${p.alpha.toFixed(3)})`; ctx.fill();
            }

            // ── Nodes ──
            for (const n of nodes) {
                n.pulse += n.pulseSpeed;
                const glow = 0.5 + 0.5 * Math.sin(n.pulse);
                const burst = Math.max(0, n.burstT);
                const r = n.r;

                const tierHue = n.tier === 0 ? 215 : n.tier === 1 ? 190 : 230;
                const tierSat = n.tier === 0 ? '85%' : n.tier === 1 ? '70%' : '60%';

                // ── Burst ring (on packet arrival) ──
                if (burst > 0) {
                    const br = r + 28 * (1 - burst);
                    ctx.beginPath(); ctx.arc(n.x, n.y, br, 0, Math.PI * 2);
                    ctx.strokeStyle = `hsla(${tierHue},90%,65%,${(burst * 0.6).toFixed(3)})`;
                    ctx.lineWidth = 1.5 * burst; ctx.stroke();
                    // Second ring
                    const br2 = r + 16 * (1 - burst);
                    ctx.beginPath(); ctx.arc(n.x, n.y, br2, 0, Math.PI * 2);
                    ctx.strokeStyle = `hsla(${tierHue},100%,80%,${(burst * 0.35).toFixed(3)})`;
                    ctx.lineWidth = 0.8 * burst; ctx.stroke();
                }

                // ── Atmosphere (tier-0 nodes get extra halo) ──
                if (n.tier === 0) {
                    ctx.beginPath(); ctx.arc(n.x, n.y, r + 22 + glow * 10, 0, Math.PI * 2);
                    ctx.fillStyle = `hsla(${tierHue},80%,40%,${(0.03 * glow).toFixed(3)})`; ctx.fill();
                }

                // ── Outer pulse ring ──
                ctx.beginPath(); ctx.arc(n.x, n.y, r + 7 + glow * 5, 0, Math.PI * 2);
                ctx.strokeStyle = `hsla(${tierHue},${tierSat},55%,${(0.08 + 0.1 * glow).toFixed(3)})`;
                ctx.lineWidth = 0.6; ctx.stroke();

                // ── Rotating dashes ring (tier-0 only) ──
                if (n.tier === 0) {
                    ctx.save();
                    ctx.translate(n.x, n.y);
                    ctx.rotate(frame * 0.008 * (n.pulseSpeed * 80));
                    ctx.beginPath(); ctx.arc(0, 0, r + 4, 0, Math.PI * 2);
                    ctx.setLineDash([3, 6]);
                    ctx.strokeStyle = `hsla(${tierHue},90%,70%,${(0.2 + 0.15 * glow).toFixed(3)})`;
                    ctx.lineWidth = 0.8; ctx.stroke();
                    ctx.setLineDash([]); ctx.restore();
                }

                // ── Body gradient ──
                const bodyGrad = ctx.createRadialGradient(n.x - r * 0.3, n.y - r * 0.3, 0, n.x, n.y, r);
                bodyGrad.addColorStop(0, `hsla(${tierHue},60%,22%,1)`);
                bodyGrad.addColorStop(1, `hsla(${tierHue},80%,8%,1)`);
                ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
                ctx.fillStyle = bodyGrad; ctx.fill();

                // ── Rim ──
                ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
                ctx.strokeStyle = `hsla(${tierHue},90%,60%,${(0.55 + 0.45 * glow).toFixed(3)})`;
                ctx.lineWidth = n.tier === 0 ? 1.4 : 0.9; ctx.stroke();

                // ── Specular highlight ──
                const spec = ctx.createRadialGradient(n.x - r * 0.4, n.y - r * 0.45, 0, n.x - r * 0.4, n.y - r * 0.45, r * 0.7);
                spec.addColorStop(0, `rgba(200,235,255,${(0.25 + 0.15 * glow).toFixed(3)})`);
                spec.addColorStop(1, 'transparent');
                ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
                ctx.fillStyle = spec; ctx.fill();

                // ── Inner core dot ──
                ctx.beginPath(); ctx.arc(n.x, n.y, r * 0.32, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${tierHue},100%,82%,${(0.6 + 0.4 * glow).toFixed(3)})`; ctx.fill();

                // ── Label ──
                if (r >= 7) {
                    ctx.font = `600 ${r >= 10 ? 9 : 8}px "SF Mono","Fira Code","Consolas",monospace`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'top';
                    ctx.fillStyle = `hsla(${tierHue},80%,75%,${(0.5 + 0.3 * glow).toFixed(3)})`;
                    ctx.fillText(n.label, n.x, n.y + r + 5);
                }
            }

            // ── Floating data labels (random sparks) ──
            if (frame % 40 === 0) {
                const labels = ['200 OK', 'ACK', 'TX', 'SYNC', 'PUSH', '3ms', 'OK', 'RX', 'EOF'];
                const lbl = labels[Math.floor(Math.random() * labels.length)];
                const lx = 80 + Math.random() * (canvas.width - 160);
                const ly = 80 + Math.random() * (canvas.height - 160);
                ctx.font = '500 8px "SF Mono","Fira Code",monospace';
                ctx.textAlign = 'center';
                ctx.fillStyle = 'rgba(100,200,255,0.22)';
                ctx.fillText(lbl, lx, ly);
            }

            animId = requestAnimationFrame(draw);
        };

        draw();

        const handleResize = () => {
            resize();
            nodes = buildNodes();
            edges = buildEdges(nodes);
            drawScanlines();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animId);
            clearInterval(spawnInterval);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: -1 }}>
            {/* Main animation canvas */}
            <canvas
                ref={canvasRef}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
            />
            {/* Scanline + vignette overlay */}
            <canvas
                ref={overlayRef}
                style={{
                    position: 'absolute', inset: 0, width: '100%', height: '100%',
                    display: 'block', pointerEvents: 'none', mixBlendMode: 'multiply',
                }}
            />
        </div>
    );
}