import { useEffect, useRef } from 'react';

// Palette per condition (matches design tokens in index.css)
const PALETTES = {
  clear_day: ['#2B6BD9', '#69AEEF', '#FFC98A'],
  clear_night: ['#070B1A', '#111C3D', '#3B5BDB'],
  cloudy_day: ['#4A5A78', '#7C8CA8', '#C7D1E0'],
  cloudy_night: ['#0C1120', '#1B2340', '#374372'],
  rain: ['#0C1424', '#1E2A44', '#3B5BDB'],
  storm: ['#080B14', '#161C2E', '#2B2F52'],
  snow: ['#1B2740', '#3A4A6B', '#CBD8EC'],
  fog: ['#2A2E3C', '#464C5C', '#8891A3'],
};

function paletteFor(condition, isDay) {
  if (condition === 'clear') return isDay ? PALETTES.clear_day : PALETTES.clear_night;
  if (condition === 'cloudy') return isDay ? PALETTES.cloudy_day : PALETTES.cloudy_night;
  if (condition === 'rain') return PALETTES.rain;
  if (condition === 'storm') return PALETTES.storm;
  if (condition === 'snow') return PALETTES.snow;
  if (condition === 'fog') return PALETTES.fog;
  return isDay ? PALETTES.clear_day : PALETTES.clear_night;
}

export default function SkyBackground({ condition = 'clear', isDay = true }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({ particles: [], t: 0 });
  const targetPalette = useRef(paletteFor(condition, isDay));
  const currentPalette = useRef(paletteFor(condition, isDay).slice());

  useEffect(() => {
    targetPalette.current = paletteFor(condition, isDay);
  }, [condition, isDay]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf;
    let width, height, dpr;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles();
    }

    function initParticles() {
      const count = condition === 'rain' ? 140 : condition === 'snow' ? 90 : condition === 'storm' ? 160 : condition === 'cloudy' || condition === 'fog' ? 6 : 24;
      const particles = [];
      for (let i = 0; i < count; i++) {
        if (condition === 'rain' || condition === 'storm') {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            len: 12 + Math.random() * 18,
            speed: 6 + Math.random() * 8,
            drift: -2,
            opacity: 0.15 + Math.random() * 0.35,
          });
        } else if (condition === 'snow') {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            r: 1 + Math.random() * 2.5,
            speed: 0.4 + Math.random() * 1,
            drift: (Math.random() - 0.5) * 0.6,
            opacity: 0.3 + Math.random() * 0.5,
          });
        } else if (condition === 'cloudy' || condition === 'fog') {
          particles.push({
            x: Math.random() * width,
            y: height * 0.1 + Math.random() * height * 0.5,
            r: 60 + Math.random() * 120,
            speed: 0.08 + Math.random() * 0.15,
            opacity: 0.06 + Math.random() * 0.08,
          });
        } else {
          // clear: soft floating orbs (stars at night, light motes by day)
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            r: isDay ? 1 + Math.random() * 1.5 : 0.6 + Math.random() * 1.4,
            speed: 0.05 + Math.random() * 0.1,
            twinkle: Math.random() * Math.PI * 2,
            opacity: isDay ? 0.15 + Math.random() * 0.2 : 0.3 + Math.random() * 0.6,
          });
        }
      }
      stateRef.current.particles = particles;
    }

    function lerp(a, b, t) { return a + (b - a) * t; }
    function hexToRgb(hex) {
      const v = parseInt(hex.slice(1), 16);
      return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
    }
    function rgbToCss([r, g, b], a = 1) { return `rgba(${r|0},${g|0},${b|0},${a})`; }

    function draw() {
      const st = stateRef.current;
      st.t += 1;

      // Ease current palette toward target
      for (let i = 0; i < 3; i++) {
        const cur = hexToRgb(currentPalette.current[i]);
        const tgt = hexToRgb(targetPalette.current[i]);
        const mixed = cur.map((c, j) => lerp(c, tgt[j], 0.02));
        currentPalette.current[i] = `rgb(${mixed[0]|0},${mixed[1]|0},${mixed[2]|0})`;
      }

      const [c1, c2, c3] = currentPalette.current;
      const grad = ctx.createLinearGradient(0, 0, width * 0.3, height);
      grad.addColorStop(0, c1);
      grad.addColorStop(0.55, c2);
      grad.addColorStop(1, c3);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Sun/moon glow for clear conditions
      if (condition === 'clear') {
        const gx = width * 0.78, gy = isDay ? height * 0.22 : height * 0.16;
        const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, width * 0.35);
        glow.addColorStop(0, isDay ? 'rgba(255,210,150,0.35)' : 'rgba(180,200,255,0.18)');
        glow.addColorStop(1, 'rgba(255,210,150,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);
      }

      const particles = st.particles;
      if (condition === 'rain' || condition === 'storm') {
        ctx.strokeStyle = 'rgba(200,220,255,0.5)';
        ctx.lineWidth = 1.2;
        for (const p of particles) {
          ctx.globalAlpha = p.opacity;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.drift * 3, p.y + p.len);
          ctx.stroke();
          p.y += p.speed;
          p.x += p.drift * 0.3;
          if (p.y > height) { p.y = -p.len; p.x = Math.random() * width; }
        }
        ctx.globalAlpha = 1;
        if (condition === 'storm' && Math.random() < 0.006) {
          ctx.fillStyle = 'rgba(255,255,255,0.5)';
          ctx.fillRect(0, 0, width, height);
        }
      } else if (condition === 'snow') {
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        for (const p of particles) {
          ctx.globalAlpha = p.opacity;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
          p.y += p.speed;
          p.x += Math.sin(st.t * 0.01 + p.y * 0.01) * 0.3 + p.drift;
          if (p.y > height) { p.y = -4; p.x = Math.random() * width; }
        }
        ctx.globalAlpha = 1;
      } else if (condition === 'cloudy' || condition === 'fog') {
        for (const p of particles) {
          ctx.beginPath();
          const grad2 = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
          grad2.addColorStop(0, `rgba(255,255,255,${p.opacity})`);
          grad2.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = grad2;
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
          p.x += p.speed;
          if (p.x - p.r > width) p.x = -p.r;
        }
      } else {
        // clear
        for (const p of particles) {
          p.twinkle += 0.02;
          const tw = isDay ? 1 : 0.6 + Math.sin(p.twinkle) * 0.4;
          ctx.globalAlpha = p.opacity * tw;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
          p.y -= p.speed;
          if (p.y < -4) p.y = height + 4;
        }
        ctx.globalAlpha = 1;
      }

      if (!reduceMotion) {
        raf = requestAnimationFrame(draw);
      }
    }

    resize();
    window.addEventListener('resize', resize);
    draw();
    if (reduceMotion) {
      // Draw a couple of frames statically then stop, for a gentle static scene.
      draw(); draw();
    }

    return () => {
      window.removeEventListener('resize', resize);
      if (raf) cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [condition, isDay]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 w-full h-full"
      aria-hidden="true"
    />
  );
}
