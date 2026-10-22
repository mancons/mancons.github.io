/**
 * AETHER CINEMATICS - AUDIO AMBIENCE & PROCEDURAL SYNTHESIZER
 * Motor de Audio Cinematográfico 100% nativo mediante Web Audio API
 * Genera atmósfera binaural, drones armónicos y efectos de interfaz sin dependencias externas.
 */

class AudioAmbienceEngine {
  constructor() {
    this.audioCtx = null;
    this.isPlaying = false;
    this.masterGain = null;
    this.oscillators = [];
    this.filter = null;
    this.lfo = null;
    this.soundBtn = document.querySelector('.btn-sound');
    this.soundBtnText = document.querySelector('.btn-sound .sound-text');
    
    this.initListeners();
  }

  initListeners() {
    if (this.soundBtn) {
      this.soundBtn.addEventListener('click', () => this.toggleAmbience());
    }

    // Interactive UI sound effects on click & hover
    document.addEventListener('click', (e) => {
      if (e.target.closest('button, .project-card, .playlist-item, .nav-link')) {
        this.playUiClickSound();
      }
    });

    document.addEventListener('mouseover', (e) => {
      if (e.target.closest('button, .project-card, .filter-btn')) {
        this.playUiHoverSound();
      }
    });
  }

  setupAudioContext() {
    if (this.audioCtx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new AudioContextClass();

    // Master Gain
    this.masterGain = this.audioCtx.createGain();
    this.masterGain.gain.setValueAtTime(0, this.audioCtx.currentTime);
    this.masterGain.connect(this.audioCtx.destination);

    // Warm Low-pass Cinematic Filter
    this.filter = this.audioCtx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(320, this.audioCtx.currentTime);
    this.filter.Q.setValueAtTime(3, this.audioCtx.currentTime);
    this.filter.connect(this.masterGain);

    // Subtle LFO to breathe life into the filter
    this.lfo = this.audioCtx.createOscillator();
    const lfoGain = this.audioCtx.createGain();
    this.lfo.frequency.setValueAtTime(0.12, this.audioCtx.currentTime); // 0.12 Hz slow wave
    lfoGain.gain.setValueAtTime(140, this.audioCtx.currentTime);
    this.lfo.connect(lfoGain);
    lfoGain.connect(this.filter.frequency);
    this.lfo.start();

    // Drone Chord Frequencies (Cinematic D Minor / A atmospheric cluster: 55Hz, 110Hz, 164.8Hz, 220Hz)
    const freqs = [55.0, 110.0, 164.81, 220.0];
    freqs.forEach((freq, idx) => {
      const osc = this.audioCtx.createOscillator();
      const oscGain = this.audioCtx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      // Slight detune for analog cinematic warmth
      osc.frequency.setValueAtTime(freq + (Math.random() * 0.8 - 0.4), this.audioCtx.currentTime);

      oscGain.gain.setValueAtTime(0.15 / (idx + 1), this.audioCtx.currentTime);
      osc.connect(oscGain);
      oscGain.connect(this.filter);

      osc.start();
      this.oscillators.push(osc);
    });
  }

  toggleAmbience() {
    this.setupAudioContext();

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    if (!this.isPlaying) {
      // Fade in
      const now = this.audioCtx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(0.28, now + 1.8);

      this.isPlaying = true;
      if (this.soundBtn) this.soundBtn.classList.add('playing');
      if (this.soundBtnText) this.soundBtnText.textContent = 'AUDIO: ON';
    } else {
      // Fade out
      const now = this.audioCtx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(0, now + 0.8);

      this.isPlaying = false;
      if (this.soundBtn) this.soundBtn.classList.remove('playing');
      if (this.soundBtnText) this.soundBtnText.textContent = 'AUDIO: OFF';
    }
  }

  /**
   * Delicate organic UI Hover Sound (Tactile Pop)
   */
  playUiHoverSound() {
    if (!this.isPlaying || !this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1400, this.audioCtx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.015, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.05);
    } catch (e) {}
  }

  /**
   * Tactile Film Switch UI Click Sound
   */
  playUiClickSound() {
    if (!this.audioCtx) return;
    try {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.audioCtx.currentTime + 0.07);

      gain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.07);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.08);
    } catch (e) {}
  }
}

window.AudioAmbienceEngine = AudioAmbienceEngine;
