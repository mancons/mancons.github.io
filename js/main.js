/**
 * AETHER CINEMATICS - MAIN APPLICATION CONTROLLER
 * Orquestador principal: Cursor dinámico, HUD Timecode, Filtros, Modal & Animaciones
 */

document.addEventListener('DOMContentLoaded', () => {
  // 0. Initialize Atmospheric Bokeh & Projection Dust Canvas
  new CinemaAtmosphereCanvas('ambientDustCanvas');

  // 1. Initialize 3D Perspective Card Tilt & Glare
  new CardTiltEffect();

  // 2. Initialize Video Player & Ambilight Engine
  const player = new CinematicPlayer({
    container: '#showreelPlayer'
  });

  // 3. Initialize Procedural Ambient Audio Engine
  const audio = new AudioAmbienceEngine();

  // 4. Initialize Color Grading Split-Screen Slider
  new SplitGradeSlider('#gradeSplitSlider');

  // 5. Custom Cinematic Cursor
  initCinematicCursor();

  // 6. Live HUD Telemetry & REC Timecode Generator
  initHudTimecode();

  // 7. Live Camera HUD Audio VU Meters
  initAudioVuMeters();

  // 8. Top Scroll Progress Tracker
  initScrollProgressBar();

  // 9. Portfolio Filter System
  initPortfolioFilters();

  // 10. Video Card Hover Previews
  initCardVideoPreviews();

  // 11. Project Details Modal Lightbox
  initProjectModal();

  // 12. Animated Metric Counters
  initMetricsCounter();

  // 13. Contact Form with Toast Alerts
  initContactForm();

  // 14. Navigation Scroll State & Mobile Menu
  initNavigation();

  // 15. Global Keyboard Shortcuts
  initKeyboardShortcuts(player);
});

/**
 * Custom Cinematic Fluid Cursor with Lerp (Linear Interpolation)
 */
function initCinematicCursor() {
  const dot = document.querySelector('.cursor-dot');
  const follower = document.querySelector('.cursor-follower');
  if (!dot || !follower) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let followerX = mouseX;
  let followerY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });

  function renderCursor() {
    followerX += (mouseX - followerX) * 0.15;
    followerY += (mouseY - followerY) * 0.15;
    follower.style.transform = `translate(${followerX}px, ${followerY}px)`;
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Contextual Hover States
  document.querySelectorAll('a, button, .filter-btn, .playlist-item, input, textarea, select').forEach(el => {
    el.addEventListener('mouseenter', () => follower.classList.add('hover-link'));
    el.addEventListener('mouseleave', () => follower.classList.remove('hover-link'));
  });

  document.querySelectorAll('.video-frame, .card-media-wrapper').forEach(el => {
    el.addEventListener('mouseenter', () => {
      follower.classList.add('hover-play');
      follower.textContent = 'PLAY';
    });
    el.addEventListener('mouseleave', () => {
      follower.classList.remove('hover-play');
      follower.textContent = '';
    });
  });
}

/**
 * Live HUD REC Timecode Generator (Simulates Cinema Camera Frame Counter)
 */
function initHudTimecode() {
  const timecodeEl = document.querySelector('.rec-timecode');
  if (!timecodeEl) return;

  let frames = 0;
  let seconds = 18;
  let minutes = 4;
  let hours = 0;

  setInterval(() => {
    frames++;
    if (frames >= 24) { // 24 FPS standard film
      frames = 0;
      seconds++;
      if (seconds >= 60) {
        seconds = 0;
        minutes++;
        if (minutes >= 60) {
          minutes = 0;
          hours++;
        }
      }
    }

    const pad = (n) => (n < 10 ? '0' + n : n);
    timecodeEl.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad(frames)}`;
  }, 1000 / 24);
}

/**
 * Filter Portfolio Projects by Category
 */
function initPortfolioFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.dataset.filter;

      projectCards.forEach(card => {
        const category = card.dataset.category;
        if (filterValue === 'all' || category === filterValue) {
          card.style.display = 'block';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px) scale(0.96)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });
}

/**
 * Video Preview on Card Hover
 */
function initCardVideoPreviews() {
  const cards = document.querySelectorAll('.project-card, .tiktok-reel-card');

  cards.forEach(card => {
    const video = card.querySelector('video');
    if (!video) return;

    card.addEventListener('mouseenter', () => {
      video.currentTime = 0;
      video.play().catch(() => {});
    });

    card.addEventListener('mouseleave', () => {
      video.pause();
    });
  });
}

/**
 * Project Modal Inspector (Lightbox with Full Specs)
 */
function initProjectModal() {
  const modal = document.querySelector('#projectModal');
  const closeBtn = document.querySelector('#modalCloseBtn');
  const modalVideo = modal ? modal.querySelector('video') : null;
  const projectCards = document.querySelectorAll('.project-card');

  if (!modal) return;

  projectCards.forEach(card => {
    card.addEventListener('click', () => {
      const title = card.querySelector('.card-title')?.textContent;
      const category = card.querySelector('.card-category')?.textContent;
      const videoSrc = card.dataset.fullVideo || card.querySelector('video')?.src;
      const specs = card.dataset.specs || 'ARRI Alexa Mini LF | Cooke Anamorphic | DaVinci Resolve';
      const desc = card.dataset.desc || 'Pieza cinematográfica de alta fidelidad producida para distribución internacional en plataformas 4K HDR.';

      modal.querySelector('.modal-title').textContent = title;
      modal.querySelector('.modal-meta-bar').textContent = `${category} • MANCONS S.A.C.`;
      modal.querySelector('.modal-description').textContent = desc;
      
      const specsTable = modal.querySelector('.modal-specs-table');
      if (specsTable) {
        specsTable.innerHTML = `
          <tr><td>Normativa Técnica</td><td>RNE (E.020 / E.030 / E.050 / E.060) • AASHTO LRFD</td></tr>
          <tr><td>Herramientas de Diseño</td><td>Autodesk Revit BIM, ETABS, SAP2000, Python</td></tr>
          <tr><td>Estudios de Laboratorio</td><td>Mecánica de Suelos ASTM D422, D4318, D1557</td></tr>
          <tr><td>Coordinación & VDC</td><td>Compatibilización 3D e Inspección de Interferencias</td></tr>
          <tr><td>Empresa Responsable</td><td>MANCONS S.A.C. (Juliaca, Puno, Perú)</td></tr>
        `;
      }

      if (modalVideo && videoSrc) {
        modalVideo.src = videoSrc;
        modalVideo.load();
        modalVideo.play().catch(() => {});
      }

      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    if (modalVideo) {
      modalVideo.pause();
    }
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

/**
 * Animated Metric Counters (IntersectionObserver)
 */
function initMetricsCounter() {
  const numbers = document.querySelectorAll('.metric-number');
  if (!numbers.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        const prefix = el.dataset.prefix || '';
        const suffix = el.dataset.suffix || '';
        let count = 0;
        const duration = 2000;
        const stepTime = 30;
        const totalSteps = duration / stepTime;
        const increment = target / totalSteps;

        const timer = setInterval(() => {
          count += increment;
          if (count >= target) {
            count = target;
            clearInterval(timer);
          }
          el.textContent = `${prefix}${Math.floor(count)}${suffix}`;
        }, stepTime);

        observer.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  numbers.forEach(num => observer.observe(num));
}

/**
 * Contact Form & Toast Alert System
 */
function initContactForm() {
  const form = document.querySelector('#contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;

    btn.disabled = true;
    btn.innerHTML = `<span>ENVIANDO REQUERIMIENTO...</span>`;

    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = originalText;
      form.reset();
      showToast('✓ Solicitud recibida con éxito. Un ingeniero de MANCONS S.A.C. se comunicará contigo.');
    }, 1200);
  });
}

function showToast(message) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(15px)';
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

/**
 * Navigation Scroll State & Mobile Menu
 */
function initNavigation() {
  const nav = document.querySelector('.site-nav');
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-open');
      });
    });
  }
}

/**
 * Global Keyboard Shortcuts
 */
function initKeyboardShortcuts(player) {
  window.addEventListener('keydown', (e) => {
    // If typing in input or textarea, ignore shortcuts
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;

    if (e.code === 'Space') {
      e.preventDefault();
      if (player) player.togglePlay();
    } else if (e.code === 'KeyM') {
      if (player && player.video) {
        player.video.muted = !player.video.muted;
        player.updateVolumeIcon();
      }
    } else if (e.code === 'KeyF') {
      if (player) player.toggleFullscreen();
    } else if (e.code === 'Escape') {
      const modal = document.querySelector('#projectModal');
      if (modal && modal.classList.contains('active')) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        const modalVideo = modal.querySelector('video');
        if (modalVideo) modalVideo.pause();
      }
    }
  });
}

/**
 * Top Scroll Progress Bar
 */
function initScrollProgressBar() {
  const bar = document.querySelector('.scroll-progress-bar');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (totalScroll > 0) {
      const progress = (window.scrollY / totalScroll) * 100;
      bar.style.width = `${progress}%`;
    }
  }, { passive: true });
}

/**
 * Live Audio VU Meter Simulation in Camera HUD
 */
function initAudioVuMeters() {
  const leds1 = document.querySelectorAll('#vuTrack1 .vu-led');
  const leds2 = document.querySelectorAll('#vuTrack2 .vu-led');
  if (!leds1.length || !leds2.length) return;

  setInterval(() => {
    // Random natural cinema audio fluctuations (peak at around 4-6 leds, rarely hits red)
    const level1 = Math.floor(Math.random() * 4) + 3;
    const level2 = Math.floor(Math.random() * 4) + 2;

    leds1.forEach((led, i) => {
      led.classList.toggle('active', i < level1);
    });

    leds2.forEach((led, i) => {
      led.classList.toggle('active', i < level2);
    });
  }, 120);
}
