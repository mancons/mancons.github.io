/**
 * AETHER CINEMATICS - VIDEO PLAYER ENGINE & AMBILIGHT SYSTEM
 * Control de Video Profesional, Ambilight Dinámico y Multi-Pistas
 */

class CinematicPlayer {
  constructor(options) {
    this.container = document.querySelector(options.container);
    if (!this.container) return;

    this.video = this.container.querySelector('video');
    this.videoFrame = this.container.querySelector('.video-frame');
    this.playBtn = this.container.querySelector('.big-play-btn');
    this.ctrlPlayBtn = this.container.querySelector('#ctrlPlayBtn');
    this.scrubber = this.container.querySelector('.timeline-scrubber');
    this.scrubProgress = this.container.querySelector('.scrub-progress');
    this.scrubBuffer = this.container.querySelector('.scrub-buffer');
    this.timeDisplay = this.container.querySelector('.time-display');
    this.volumeSlider = this.container.querySelector('#volumeSlider');
    this.muteBtn = this.container.querySelector('#muteBtn');
    this.fullscreenBtn = this.container.querySelector('#fullscreenBtn');
    this.scopeToggle = this.container.querySelector('#scopeToggle');
    this.cinemaModeBtn = this.container.querySelector('#cinemaModeBtn');
    this.ambilightBg = document.querySelector('.stage-ambilight');

    this.isScrubbing = false;
    this.canvas = document.createElement('canvas');
    this.canvas.width = 16;
    this.canvas.height = 9;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

    this.init();
  }

  init() {
    if (!this.video) return;

    // Play/Pause events
    if (this.playBtn) this.playBtn.addEventListener('click', () => this.togglePlay());
    if (this.ctrlPlayBtn) this.ctrlPlayBtn.addEventListener('click', () => this.togglePlay());
    this.video.addEventListener('click', () => this.togglePlay());

    // Video State Listeners
    this.video.addEventListener('play', () => this.onPlayStateChange(true));
    this.video.addEventListener('pause', () => this.onPlayStateChange(false));
    this.video.addEventListener('timeupdate', () => this.onTimeUpdate());
    this.video.addEventListener('progress', () => this.onBufferProgress());
    this.video.addEventListener('loadedmetadata', () => this.onMetadataLoaded());

    // Timeline Scrubber
    if (this.scrubber) {
      this.scrubber.addEventListener('mousedown', (e) => this.startScrub(e));
      window.addEventListener('mousemove', (e) => this.doScrub(e));
      window.addEventListener('mouseup', () => this.endScrub());
      this.scrubber.addEventListener('click', (e) => this.seekByEvent(e));
    }

    // Volume
    if (this.volumeSlider) {
      this.volumeSlider.addEventListener('input', (e) => {
        this.video.volume = e.target.value;
        this.video.muted = (this.video.volume === 0);
        this.updateVolumeIcon();
      });
    }

    if (this.muteBtn) {
      this.muteBtn.addEventListener('click', () => {
        this.video.muted = !this.video.muted;
        if (!this.video.muted && this.video.volume === 0) {
          this.video.volume = 0.8;
          if (this.volumeSlider) this.volumeSlider.value = 0.8;
        }
        this.updateVolumeIcon();
      });
    }

    // Aspect Ratio CinemaScope Toggle
    if (this.scopeToggle) {
      this.scopeToggle.addEventListener('click', () => {
        const isScope = this.videoFrame.classList.toggle('cinemascope');
        this.scopeToggle.classList.toggle('active', isScope);
        this.scopeToggle.textContent = isScope ? '2.39:1 SCOPE' : '16:9 NATIVE';
      });
    }

    // Global Cinema Mode (Letterbox Bars)
    if (this.cinemaModeBtn) {
      this.cinemaModeBtn.addEventListener('click', () => {
        document.body.classList.toggle('cinema-mode-active');
        this.cinemaModeBtn.classList.toggle('active');
      });
    }

    // Fullscreen
    if (this.fullscreenBtn) {
      this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
    }

    // Dynamic Ambilight Loop
    this.startAmbilight();

    // Playlist switcher integration
    this.initPlaylistSwitcher();
  }

  togglePlay() {
    if (this.video.paused || this.video.ended) {
      this.video.play().catch(err => {
        console.warn('Autoplay prevented or interaction required:', err);
      });
    } else {
      this.video.pause();
    }
  }

  onPlayStateChange(isPlaying) {
    if (isPlaying) {
      this.videoFrame.classList.add('is-playing');
      if (this.ctrlPlayBtn) {
        this.ctrlPlayBtn.innerHTML = `
          <svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
        `;
      }
    } else {
      this.videoFrame.classList.remove('is-playing');
      if (this.ctrlPlayBtn) {
        this.ctrlPlayBtn.innerHTML = `
          <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        `;
      }
    }
  }

  onMetadataLoaded() {
    this.updateTimeDisplay(0, this.video.duration);
    this.onBufferProgress();
  }

  onTimeUpdate() {
    if (!this.isScrubbing && this.video.duration) {
      const percentage = (this.video.currentTime / this.video.duration) * 100;
      if (this.scrubProgress) {
        this.scrubProgress.style.width = `${percentage}%`;
      }
      this.updateTimeDisplay(this.video.currentTime, this.video.duration);
    }
  }

  onBufferProgress() {
    if (this.video.buffered.length > 0 && this.video.duration) {
      const bufferedEnd = this.video.buffered.end(this.video.buffered.length - 1);
      const percentage = (bufferedEnd / this.video.duration) * 100;
      if (this.scrubBuffer) {
        this.scrubBuffer.style.width = `${percentage}%`;
      }
    }
  }

  formatTime(seconds) {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  updateTimeDisplay(current, duration) {
    if (this.timeDisplay) {
      this.timeDisplay.innerHTML = `<span class="current-time">${this.formatTime(current)}</span> / ${this.formatTime(duration)}`;
    }
  }

  startScrub(e) {
    this.isScrubbing = true;
    this.seekByEvent(e);
  }

  doScrub(e) {
    if (this.isScrubbing) {
      this.seekByEvent(e);
    }
  }

  endScrub() {
    if (this.isScrubbing) {
      this.isScrubbing = false;
    }
  }

  seekByEvent(e) {
    if (!this.scrubber || !this.video.duration) return;
    const rect = this.scrubber.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    this.scrubProgress.style.width = `${pos * 100}%`;
    this.video.currentTime = pos * this.video.duration;
    this.updateTimeDisplay(this.video.currentTime, this.video.duration);
  }

  updateVolumeIcon() {
    if (!this.muteBtn) return;
    if (this.video.muted || this.video.volume === 0) {
      this.muteBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`;
    } else {
      this.muteBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      if (this.videoFrame.requestFullscreen) {
        this.videoFrame.requestFullscreen();
      } else if (this.videoFrame.webkitRequestFullscreen) {
        this.videoFrame.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  /**
   * Dynamic Ambilight Engine:
   * Muestra un halo de luz reactivo al color promedio del fotograma de video actual
   */
  startAmbilight() {
    if (!this.ambilightBg) return;

    const sampleFrame = () => {
      try {
        if (!this.video.paused && !this.video.ended && this.video.readyState >= 2) {
          this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
          const pixelData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height).data;

          let r = 0, g = 0, b = 0, count = 0;
          for (let i = 0; i < pixelData.length; i += 16) {
            r += pixelData[i];
            g += pixelData[i + 1];
            b += pixelData[i + 2];
            count++;
          }

          if (count > 0) {
            r = Math.min(255, Math.floor((r / count) * 1.3));
            g = Math.min(255, Math.floor((g / count) * 1.3));
            b = Math.min(255, Math.floor((b / count) * 1.3));

            this.ambilightBg.style.background = `radial-gradient(circle at center, rgba(${r}, ${g}, ${b}, 0.5) 0%, rgba(${r}, ${g}, ${b}, 0.15) 50%, transparent 75%)`;
          }
        }
      } catch (e) {
        // Fallback for CORS or canvas security restriction
      }
      requestAnimationFrame(sampleFrame);
    };

    requestAnimationFrame(sampleFrame);
  }

  /**
   * Playlist / Showreel Multi-Source Switcher
   */
  initPlaylistSwitcher() {
    const playlistItems = document.querySelectorAll('.playlist-item');
    if (!playlistItems.length) return;

    playlistItems.forEach(item => {
      item.addEventListener('click', () => {
        playlistItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        const videoSrc = item.dataset.video;
        const posterSrc = item.dataset.poster;

        if (videoSrc && this.video.src !== videoSrc) {
          this.video.style.opacity = '0';
          setTimeout(() => {
            this.video.src = videoSrc;
            if (posterSrc) this.video.poster = posterSrc;
            this.video.load();
            this.video.play().catch(() => {});
            this.video.style.opacity = '1';
          }, 300);
        }
      });
    });
  }
}

window.CinematicPlayer = CinematicPlayer;
