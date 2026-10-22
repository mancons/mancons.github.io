/**
 * MANCONS - 3D PERSPECTIVE CARD TILT & SPECULAR GLARE
 * Efecto de profundidad 3D interactivo para tarjetas de cine
 */

class CardTiltEffect {
  constructor(selector = '.project-card, .playlist-item, .spec-item, .tiktok-reel-card') {
    this.cards = document.querySelectorAll(selector);
    if (!this.cards.length || window.matchMedia('(pointer: coarse)').matches) return;

    this.init();
  }

  init() {
    this.cards.forEach(card => {
      card.addEventListener('mousemove', (e) => this.handleMouseMove(e, card));
      card.addEventListener('mouseleave', () => this.handleMouseLeave(card));
    });
  }

  handleMouseMove(e, card) {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -6.5; // Max 6.5deg tilt
    const rotateY = ((x - centerX) / centerX) * 6.5;

    card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;

    // Update specular glare reflection
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    card.style.setProperty('--glare-x', `${glareX}%`);
    card.style.setProperty('--glare-y', `${glareY}%`);
  }

  handleMouseLeave(card) {
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
  }
}

window.CardTiltEffect = CardTiltEffect;
