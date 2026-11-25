/* Zero-dependency Web Audio API engine: continuous dark obsidian ambient drone + tactile HUD SFX.
   Starts muted until user activates the HUD audio toggle. */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private droneMaster: GainNode | null = null;
  private droneNodes: { stop: () => void }[] = [];
  public enabled = false;

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

  private startAmbient() {
    const ctx = this.ensure();
    if (!ctx || this.droneMaster) return;

    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.085, now + 0.85);
    master.connect(ctx.destination);
    this.droneMaster = master;

    // Warm resonant lowpass modulated slowly by 0.12 Hz LFO
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(320, now);
    lp.Q.setValueAtTime(1.6, now);
    lp.connect(master);

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(0.12, now);
    lfoGain.gain.setValueAtTime(110, now);
    lfo.connect(lfoGain);
    lfoGain.connect(lp.frequency);
    lfo.start(now);

    // Dual detuned obsidian sub drones (55 Hz + 58.2 Hz)
    const osc1 = ctx.createOscillator();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(55, now);
    const g1 = ctx.createGain();
    g1.gain.setValueAtTime(0.55, now);
    osc1.connect(g1);
    g1.connect(lp);
    osc1.start(now);

    const osc2 = ctx.createOscillator();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(58.2, now);
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.32, now);
    osc2.connect(g2);
    g2.connect(lp);
    osc2.start(now);

    // Procedural 2s filtered dark CRT room-air buffer
    const sampleRate = ctx.sampleRate;
    const len = sampleRate * 2;
    const buf = ctx.createBuffer(1, len, sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = buf;
    noiseSrc.loop = true;

    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.setValueAtTime(250, now);
    bp.Q.setValueAtTime(1.4, now);

    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.18, now);
    noiseSrc.connect(bp);
    bp.connect(nGain);
    nGain.connect(master);
    noiseSrc.start(now);

    this.droneNodes = [
      { stop: () => osc1.stop() },
      { stop: () => osc2.stop() },
      { stop: () => lfo.stop() },
      { stop: () => noiseSrc.stop() },
    ];
  }

  private stopAmbient() {
    if (!this.ctx || !this.droneMaster) return;
    const now = this.ctx.currentTime;
    const master = this.droneMaster;
    const nodes = this.droneNodes;
    this.droneMaster = null;
    this.droneNodes = [];

    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), now);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    window.setTimeout(() => {
      nodes.forEach((n) => {
        try {
          n.stop();
        } catch {
          /* already stopped */
        }
      });
      master.disconnect();
    }, 400);
  }

  setEnabled(on: boolean) {
    this.enabled = on;
    if (on) {
      this.startAmbient();
      this.playTick(540, 0.045);
    } else {
      this.stopAmbient();
    }
  }

  playTick(freq = 640, gainPeak = 0.032) {
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

    // Subtle mechanical key thump
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
    gain.gain.setValueAtTime(0.055, now);
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
      gain.gain.setValueAtTime(0.024, t0);
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

    // Deep impact thud 180 -> 40 Hz
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.22);
    gain.gain.setValueAtTime(0.085, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.27);

    // Crisp claw snap transient
    const snap = ctx.createOscillator();
    const sGain = ctx.createGain();
    snap.type = "triangle";
    snap.frequency.setValueAtTime(1600, now);
    snap.frequency.exponentialRampToValueAtTime(280, now + 0.045);
    sGain.gain.setValueAtTime(0.06, now);
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
    gain.gain.setValueAtTime(0.036, now);
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

    // Deep fracture punch 220 -> 55 Hz
    const punch = ctx.createOscillator();
    const pGain = ctx.createGain();
    punch.type = "sawtooth";
    punch.frequency.setValueAtTime(220, now);
    punch.frequency.exponentialRampToValueAtTime(55, now + 0.16);
    pGain.gain.setValueAtTime(0.085, now);
    pGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    punch.connect(pGain);
    pGain.connect(ctx.destination);
    punch.start(now);
    punch.stop(now + 0.2);

    // High-frequency glass fracture crackle bursts (1800-4200 Hz bandpass)
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
    nGain.gain.setValueAtTime(0.14, now);
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
      gain.gain.setValueAtTime(0.05, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.18);
    });
  }
}

export const soundEngine = new SoundEngine();
