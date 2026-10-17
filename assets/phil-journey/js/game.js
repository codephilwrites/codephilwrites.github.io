* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  min-height: 100%;
  background: #0b1220;
  color: #edf4ff;
  font-family: Verdana, Arial, sans-serif;
}

body.phil-layout {
  background: #0b1220;
}

button, input, textarea {
  font: inherit;
}

.journey-shell {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at top, rgba(94, 128, 255, 0.18), transparent 38%),
    linear-gradient(180deg, #0b1220 0%, #141d2f 100%);
  padding: 16px;
}

.game-shell {
  position: relative;
  width: min(100%, 1400px);
  aspect-ratio: 16 / 9;
  max-height: calc(100vh - 24px);
  border: 3px solid rgba(191, 216, 255, 0.5);
  border-radius: 16px;
  overflow: hidden;
  background: #0c1024;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.45);
}

#journey-canvas {
  display: block;
  width: 100%;
  height: 100%;
  background: #08111d;
  image-rendering: pixelated;
}

.overlay,
.story-dialog,
.timeline-panel,
.hud,
.top-bar,
.touch-controls {
  position: absolute;
}

.overlay,
.story-dialog,
.timeline-panel {
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(8, 13, 24, 0.56);
  backdrop-filter: blur(4px);
  z-index: 20;
}

.overlay.hidden,
.story-dialog.hidden,
.timeline-panel.hidden,
.top-bar:not(.visible),
.touch-controls.hidden,
.hud.hidden {
  display: none;
}

.title-card,
.dialog-card {
  width: min(90%, 760px);
  background: linear-gradient(180deg, rgba(15, 20, 38, 0.85), rgba(18, 26, 48, 0.95));
  border: 3px solid rgba(123, 188, 255, 0.8);
  border-radius: 18px;
  box-shadow: 0 0 0 4px rgba(10, 15, 31, 0.52), 0 26px 55px rgba(0, 0, 0, 0.35);
  padding: 28px 26px 20px;
}

.pixel-tag {
  letter-spacing: 0.2em;
  color: #8bd0ff;
  font-size: 0.72rem;
  margin-bottom: 8px;
  font-weight: 700;
}

.title-card h1,
.title-card h2 {
  margin: 0 0 12px;
  font-size: clamp(2rem, 3.8vw, 4.2rem);
  line-height: 1;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #f4f8ff;
}

.subtitle {
  margin: 0 0 20px;
  color: #d8e6ff;
  font-size: clamp(1rem, 1.7vw, 1.3rem);
  line-height: 1.5;
}

.controls-hint {
  margin-top: 18px;
  font-size: 0.8rem;
  color: #d6e6ff;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.primary-btn,
.secondary-btn,
.top-bar-btn,
.touch-controls button {
  appearance: none;
  border: 0;
  cursor: pointer;
  transition: transform 0.14s ease, filter 0.14s ease;
}

.primary-btn,
.secondary-btn {
  padding: 12px 18px;
  border-radius: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin: 6px 8px 0 0;
}

.primary-btn {
  background: linear-gradient(180deg, #ffd166, #ffb703);
  color: #1a1f2c;
}

.secondary-btn {
  background: rgba(112, 139, 204, 0.18);
  color: #ebf4ff;
  border: 1px solid rgba(191, 216, 255, 0.32);
}

.primary-btn:hover,
.secondary-btn:hover,
.top-bar-btn:hover,
.touch-controls button:hover {
  filter: brightness(1.05);
  transform: translateY(-1px);
}

.dialog-card {
  max-width: min(92vw, 700px);
  padding: 24px 24px 18px;
}

.dialog-title {
  font-size: clamp(1.4rem, 2.4vw, 2.5rem);
  font-weight: 800;
  color: #f9d77d;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.dialog-subtitle {
  font-weight: 700;
  color: #a8d7ff;
  margin-bottom: 12px;
}

.dialog-body {
  color: #edf5ff;
  line-height: 1.6;
  font-size: 1rem;
  margin-bottom: 12px;
}

.dialog-highlights {
  margin: 0 0 18px;
  padding-left: 18px;
  color: #dbe9ff;
  line-height: 1.8;
}

.hud {
  top: 18px;
  left: 18px;
  right: 18px;
  z-index: 12;
  pointer-events: none;
}

.hud-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: rgba(14, 21, 35, 0.48);
  border-radius: 12px;
  border: 1px solid rgba(146, 178, 245, 0.35);
}

.hud-label,
.hud-value {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #dfeaff;
}

.progress-track {
  flex: 1;
  height: 12px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.progress-fill {
  width: 0%;
  height: 100%;
  background: linear-gradient(90deg, #87d5ff, #87ffaf, #ffd166);
  border-radius: inherit;
}

.top-bar {
  top: 18px;
  right: 18px;
  z-index: 18;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.top-bar-btn {
  background: rgba(14, 25, 42, 0.72);
  color: #edf5ff;
  border: 1px solid rgba(186, 213, 255, 0.4);
  border-radius: 12px;
  padding: 8px 11px;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.timeline-panel {
  z-index: 25;
  background: rgba(7, 11, 22, 0.75);
  padding: 32px 22px 50px;
  overflow: auto;
}

.timeline-panel .timeline-item {
  display: grid;
  grid-template-columns: 32px 1fr;
  gap: 14px;
  max-width: 860px;
  margin: 0 auto 18px;
  background: rgba(19, 30, 51, 0.82);
  border: 1px solid rgba(170, 195, 255, 0.25);
  border-radius: 16px;
  padding: 18px 18px 10px;
}

.timeline-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: linear-gradient(180deg, #9ad7ff, #ffd166);
  box-shadow: 0 0 0 5px rgba(154, 215, 255, 0.18);
  margin-top: 10px;
}

.timeline-step {
  display: inline-block;
  font-size: 0.72rem;
  letter-spacing: 0.2em;
  color: #a6d2ff;
  font-weight: 700;
  margin-bottom: 8px;
}

.timeline-content h3 {
  margin: 0 0 8px;
  font-size: clamp(1.2rem, 2vw, 1.9rem);
  color: #f7fbff;
}

.timeline-subtitle {
  margin: 0 0 10px;
  color: #a6d2ff;
  font-weight: 700;
}

.timeline-content p,
.timeline-content li {
  color: #dfeaf8;
  line-height: 1.6;
}

.touch-controls {
  left: 16px;
  right: 16px;
  bottom: 16px;
  z-index: 22;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
}

.touch-cluster {
  display: flex;
  gap: 14px;
  pointer-events: auto;
}

.touch-controls button {
  width: 70px;
  height: 70px;
  border-radius: 16px;
  background: rgba(14, 21, 33, 0.52);
  border: 2px solid rgba(188, 216, 255, 0.4);
  color: #ecf5ff;
  font-weight: 700;
  font-size: 1.3rem;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.12);
}

.touch-controls button.pressed {
  background: rgba(90, 134, 255, 0.38);
  transform: scale(0.97);
}

.end-card {
  text-align: center;
}

.end-actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

@media (max-width: 760px) {
  .title-card,
  .dialog-card {
    width: min(92%, 520px);
    padding: 18px 16px 14px;
  }

  .end-actions,
  .top-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .top-bar {
    left: 12px;
    right: 12px;
    top: 10px;
  }

  .top-bar-btn {
    width: 100%;
  }

  .hud {
    left: 10px;
    right: 10px;
    top: 10px;
  }

  .hud-bar {
    padding: 8px 10px;
  }

  .dialog-highlights {
    padding-left: 14px;
  }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

@media (display-mode: fullscreen) {
  .game-shell {
    width: 100vw;
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
    border: 0;
  }
}

@media (orientation: landscape) and (max-width: 920px) {
  .gameshell {
    max-height: calc(100vh - 18px);
  }
}

