/* Looping calm cyberpunk ambient audio + Web Audio API tactile HUD SFX.
   Enabled by default; unlocks automatically on the first user gesture if blocked by browser autoplay rules. */

const MUTE_STORAGE_KEY = "zrwlx-sound-muted";
const BGM_SRC = "./assets/audio/cyberpunk-ambient.mp3";
const BGM_TARGET_VOL = 0.28;

class SoundEngine {
  private ctx: AudioContext | null = null;
  private bgm: HTMLAudioElement | null = null;
  private fadeTimer: number | null = null;
  private unlockHandler: (() => void) | null = null;
  public enabled = true;

  constructor() {
    if (typeof window === "undefined") return;
    try {
      this.enabled = localStorage.getItem(MUTE_STORAGE_KEY) !== "1";
    } catch {
      this.enabled = true;
    }

    if (this.enabled) {
      this.bindAutoplayUnlock();
      // Attempt immediate playback for browsers/profiles permitting autoplay
      window.setTimeout(() => {
        if (this.enabled) this.startBgm();
      }, 60);
    }
  }

  private bindAutoplayUnlock() {
    if (this.unlockHandler || typeof window === "undefined") return;

    const unlock = () => {
      if (!this.enabled) return;
      this.ensure();
      this.startBgm();
    };
    this.unlockHandler = unlock;

    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("keydown", unlock, { passive: true });
    window.addEventListener("touchstart", unlock, { passive: true });
    window.addEventListener("click", unlock, { passive: true });
  }

  private unbindAutoplayUnlock() {
    if (!this.unlockHandler || typeof window === "undefined") return;
    const fn = this.unlockHandler;
    this.unlockHandler = null;
    window.removeEventListener("pointerdown", fn);
    window.removeEventListener("keydown", fn);
    window.removeEventListener("touchstart", fn);
    window.removeEventListener("click", fn);
  }

  private ensureBgm(): HTMLAudioElement | null {
    if (typeof window === "undefined") return null;
    if (!this.bgm) {
      const audio = new Audio(BGM_SRC);
      audio.loop = true;
      audio.preload = "auto";
      audio.volume = 0;
      this.bgm = audio;
    }
    return this.bgm;
  }

  private fadeBgmTo(target: number, durationMs: number, pauseAtEnd = false) {
    const audio = this.bgm;
    if (!audio) return;
    if (this.fadeTimer !== null) {
      window.clearInterval(this.fadeTimer);
      this.fadeTimer = null;
    }
    const startVol = audio.volume;
    const steps = Math.max(1, Math.round(durationMs / 25));
    let step = 0;
    this.fadeTimer = window.setInterval(() => {
      step += 1;
      const p = Math.min(1, step / steps);
      audio.volume = Math.max(0, Math.min(1, startVol + (target - startVol) * p));
      if (p >= 1) {
        if (this.fadeTimer !== null) {
          window.clearInterval(this.fadeTimer);
          this.fadeTimer = null;
        }
        if (pauseAtEnd) audio.pause();
      }
    }, 25);
  }

  private startBgm() {
    if (!this.enabled) return;
    const audio = this.ensureBgm();
    if (!audio) return;
    if (!audio.paused) {
      if (audio.volume < BGM_TARGET_VOL) this.fadeBgmTo(BGM_TARGET_VOL, 650);
      return;
    }
    audio.volume = 0;
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.then === "function") {
      playPromise
        .then(() => {
          this.unbindAutoplayUnlock();
          if (this.enabled) {
            this.fadeBgmTo(BGM_TARGET_VOL, 900);
          } else {
            audio.pause();
          }
        })
        .catch(() => {
          // Blocked by browser autoplay policy until first user gesture
          this.bindAutoplayUnlock();
        });
    } else {
      this.unbindAutoplayUnlock();
      this.fadeBgmTo(BGM_TARGET_VOL, 900);
    }
  }

  private stopBgm() {
    this.unbindAutoplayUnlock();
    if (!this.bgm) return;
    this.fadeBgmTo(0, 320, true);
  }

  private ensure(): AudioContext | null {
    if (!this.enabled) return null;
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  setEnabled(on: boolean) {
    this.enabled = on;
    try {
      if (on) localStorage.removeItem(MUTE_STORAGE_KEY);
      else localStorage.setItem(MUTE_STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    if (on) {
      this.ensure();
      this.startBgm();
      this.playTick(540, 0.045);
    } else {
      this.stopBgm();
    }
  }

  playTick(freq = 640, gainPeak = 0.036) {
    const ctx = this.ensure();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.42, now + 0.038);
    gain.gain.setValueAtTime(gainPeak, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.042);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.045);

    const thump = ctx.createOscillator();
    const tGain = ctx.createGain();
    thump.type = "sine";
    thump.frequency.setValueAtTime(140, now);
    thump.frequency.exponentialRampToValueAtTime(55, now + 0.035);
    tGain.gain.setValueAtTime(gainPeak * 0.65, now);
    tGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
    thump.connect(tGain);
    tGain.connect(ctx.destination);
    thump.start(now);
    thump.stop(now + 0.045);
  }

  playGlitch() {
    const ctx = this.ensure();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(155, now);
    osc.frequency.exponentialRampToValueAtTime(48, now + 0.18);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  playBugSpawn() {
    const ctx = this.ensure();
    if (!ctx) return;
    const now = ctx.currentTime;
    [880, 1120, 740, 1280].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      const t0 = now + idx * 0.042;
      osc.frequency.setValueAtTime(freq, t0);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.65, t0 + 0.03);
      gain.gain.setValueAtTime(0.03, t0);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.034);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.038);
    });
  }

  playBugGrab() {
    const ctx = this.ensure();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.22);
    gain.gain.setValueAtTime(0.095, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.27);

    const snap = ctx.createOscillator();
    const sGain = ctx.createGain();
    snap.type = "triangle";
    snap.frequency.setValueAtTime(1600, now);
    snap.frequency.exponentialRampToValueAtTime(280, now + 0.045);
    sGain.gain.setValueAtTime(0.07, now);
    sGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
    snap.connect(sGain);
    sGain.connect(ctx.destination);
    snap.start(now);
    snap.stop(now + 0.055);
  }

  playScatter() {
    const ctx = this.ensure();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.exponentialRampToValueAtTime(190, now + 0.11);
    gain.gain.setValueAtTime(0.042, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  playScreenCrack() {
    const ctx = this.ensure();
    if (!ctx) return;
    const now = ctx.currentTime;

    const punch = ctx.createOscillator();
    const pGain = ctx.createGain();
    punch.type = "sawtooth";
    punch.frequency.setValueAtTime(220, now);
    punch.frequency.exponentialRampToValueAtTime(55, now + 0.16);
    pGain.gain.setValueAtTime(0.095, now);
    pGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    punch.connect(pGain);
    pGain.connect(ctx.destination);
    punch.start(now);
    punch.stop(now + 0.2);

    const sampleRate = ctx.sampleRate;
    const len = Math.floor(sampleRate * 0.28);
    const buf = ctx.createBuffer(1, len, sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      const env = Math.exp((-i / sampleRate) * 14);
      data[i] = (Math.random() * 2 - 1) * env * (Math.random() > 0.45 ? 1 : 0.2);
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;

    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.setValueAtTime(2800, now);
    bp.Q.setValueAtTime(0.9, now);

    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.16, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.27);
    src.connect(bp);
    bp.connect(nGain);
    nGain.connect(ctx.destination);
    src.start(now);
  }

  playHeart() {
    const ctx = this.ensure();
    if (!ctx) return;
    const now = ctx.currentTime;
    [392, 523.25].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      gain.gain.setValueAtTime(0.055, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.18);
    });
  }
}

export const soundEngine = new SoundEngine();
