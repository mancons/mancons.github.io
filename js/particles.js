/**
 * MANCONS - ATMOSPHERIC CINEMA PARTICLES & BOKEH ENGINE
 * Genera polvo de proyección cinematográfica y motas de luz flotantes
 * Optimizadas con requestAnimationFrame para 60 FPS estables.
 */

class CinemaAtmosphereCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.particleCount = 28;
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    window.addEventListener('mousemove', (e) => {
      this.targetMouseX = (e.clientX / window.innerWidth - 0.5) * 40;
      this.targetMouseY = (e.clientY / window.innerHeight - 0.5) * 40;
    });

    this.createParticles();
    this.animate();
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 2.2 + 0.6,
        baseSpeedX: (Math.random() - 0.5) * 0.35,
        baseSpeedY: -Math.random() * 0.45 - 0.1,
        opacity: Math.random() * 0.5 + 0.15,
        fadeSpeed: (Math.random() * 0.008 + 0.003) * (Math.random() > 0.5 ? 1 : -1),
        hue: Math.random() > 0.65 ? (Math.random() > 0.5 ? 42 : 352) : 348, // Granate & Dorado MANCONS
        depth: Math.random() * 0.8 + 0.2
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Mouse parallax lerp
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Update position with depth parallax
      p.x += p.baseSpeedX + (this.mouseX * 0.015 * p.depth);
      p.y += p.baseSpeedY + (this.mouseY * 0.015 * p.depth);

      // Opacity breathing
      p.opacity += p.fadeSpeed;
      if (p.opacity > 0.65 || p.opacity < 0.1) {
        p.fadeSpeed = -p.fadeSpeed;
      }

      // Wrap edges
      if (p.x < -20) p.x = this.width + 20;
      if (p.x > this.width + 20) p.x = -20;
      if (p.y < -20) p.y = this.height + 20;
      if (p.y > this.height + 20) p.y = -20;

      // Render glowing soft particle
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

      const glowGrad = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
      glowGrad.addColorStop(0, `hsla(${p.hue}, 100%, 75%, ${p.opacity})`);
      glowGrad.addColorStop(0.5, `hsla(${p.hue}, 90%, 60%, ${p.opacity * 0.4})`);
      glowGrad.addColorStop(1, 'transparent');

      this.ctx.fillStyle = glowGrad;
      this.ctx.fill();
      this.ctx.restore();
    }

    requestAnimationFrame(() => this.animate());
  }
}

window.CinemaAtmosphereCanvas = CinemaAtmosphereCanvas;
