/**
 * AETHER CINEMATICS - FRAME SCRUBBER & SPLIT COLOR GRADE COMPARISON
 * Comparador interactivo de metraje RAW LOG vs. Final Color Grade (Rec.709)
 */

class SplitGradeSlider {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) return;

    this.gradedLayer = this.container.querySelector('.layer-graded');
    this.gradedImg = this.gradedLayer ? this.gradedLayer.querySelector('img') : null;
    this.handle = this.container.querySelector('.split-handle');
    this.isDragging = false;

    this.init();
  }

  init() {
    if (!this.gradedLayer || !this.handle) return;

    // Sync image width on resize so it doesn't distort when layer width changes
    this.syncImageWidth();
    window.addEventListener('resize', () => this.syncImageWidth());

    // Mouse Events
    this.container.addEventListener('mousedown', (e) => this.startDrag(e));
    window.addEventListener('mousemove', (e) => this.onDrag(e));
    window.addEventListener('mouseup', () => this.stopDrag());

    // Touch Events
    this.container.addEventListener('touchstart', (e) => this.startDrag(e), { passive: true });
    window.addEventListener('touchmove', (e) => this.onDrag(e), { passive: false });
    window.addEventListener('touchend', () => this.stopDrag());
  }

  syncImageWidth() {
    if (this.gradedImg) {
      const containerWidth = this.container.offsetWidth;
      this.gradedImg.style.width = `${containerWidth}px`;
    }
  }

  startDrag(e) {
    this.isDragging = true;
    this.updatePosition(e);
  }

  onDrag(e) {
    if (!this.isDragging) return;
    if (e.cancelable && e.type === 'touchmove') e.preventDefault();
    this.updatePosition(e);
  }

  stopDrag() {
    this.isDragging = false;
  }

  updatePosition(e) {
    const rect = this.container.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    let percentage = ((clientX - rect.left) / rect.width) * 100;

    // Clamp between 2% and 98%
    percentage = Math.max(2, Math.min(98, percentage));

    this.gradedLayer.style.width = `${percentage}%`;
    this.handle.style.left = `${percentage}%`;
  }
}

window.SplitGradeSlider = SplitGradeSlider;
