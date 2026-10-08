// Synthesized Web Audio API sound effects engine for PlateUp! Web
// Zero external network dependencies, instant zero-latency feedback

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.6;
  private lastCookSoundTime: number = 0;
  private lastWashSoundTime: number = 0;

  constructor() {
    // Initialized lazily on first user interaction to comply with browser autoplay policies
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.volume;
  }

  // Plays a synthesized tone
  private tone(freq: number, type: OscillatorType, duration: number, gainLevel: number = 0.1, freqEnd?: number) {
    if (this.isMuted || this.volume <= 0) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      if (freqEnd !== undefined) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), now + duration);
      }

      const peak = gainLevel * this.volume;
      gain.gain.setValueAtTime(peak, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // AudioContext safe fail
    }
  }

  // Play a brief noise burst (for frying / washing / chopping)
  private noise(duration: number, filterFreq: number, gainLevel: number = 0.08) {
    if (this.isMuted || this.volume <= 0) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(filterFreq, now);

      const gain = this.ctx.createGain();
      const peak = gainLevel * this.volume;
      gain.gain.setValueAtTime(peak, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noiseSource.start(now);
    } catch {
      // AudioContext safe fail
    }
  }

  // Tactile item pickup
  public sfxPick() {
    this.tone(580, 'triangle', 0.07, 0.12, 760);
  }

  // Item drop / place on counter
  public sfxDrop() {
    this.tone(420, 'sine', 0.08, 0.1, 280);
  }

  // Sizzle sound from frying pan (throttled)
  public sfxCook() {
    const now = performance.now();
    if (now - this.lastCookSoundTime < 180) return;
    this.lastCookSoundTime = now;
    this.noise(0.12, 1200, 0.06);
    this.tone(140, 'sawtooth', 0.08, 0.03, 110);
  }

  // Chopping board knife tap
  public sfxChop() {
    this.tone(480, 'square', 0.04, 0.08, 160);
    this.noise(0.05, 2400, 0.06);
  }

  // Water splashing in sink (throttled)
  public sfxWash() {
    const now = performance.now();
    if (now - this.lastWashSoundTime < 140) return;
    this.lastWashSoundTime = now;
    this.noise(0.1, 800, 0.05);
    this.tone(360, 'sine', 0.07, 0.05, 480);
  }

  // Serving dish complete chime
  public sfxServe() {
    this.tone(523.25, 'sine', 0.12, 0.15); // C5
    setTimeout(() => this.tone(659.25, 'sine', 0.12, 0.15), 60); // E5
    setTimeout(() => this.tone(783.99, 'sine', 0.2, 0.18), 120); // G5
    setTimeout(() => this.tone(1046.5, 'sine', 0.35, 0.22), 180); // C6
  }

  // Gold coins collected
  public sfxCoin() {
    this.tone(987.77, 'sine', 0.08, 0.14); // B5
    setTimeout(() => this.tone(1318.51, 'sine', 0.2, 0.16), 70); // E6
  }

  // Throwing into bin
  public sfxTrash() {
    this.tone(200, 'triangle', 0.1, 0.12, 100);
  }

  // Golden service bell chime (rich resonant brass chime)
  public sfxBell() {
    this.tone(1174.66, 'sine', 0.8, 0.22, 1170); // D6
    setTimeout(() => this.tone(1760, 'sine', 0.7, 0.18), 30); // A6
    setTimeout(() => this.tone(2349.32, 'sine', 0.6, 0.12), 60); // D7
  }

  // Rush hour alert siren
  public sfxRushHour() {
    this.tone(440, 'sawtooth', 0.12, 0.15, 660);
    setTimeout(() => this.tone(660, 'sawtooth', 0.15, 0.18, 880), 120);
    setTimeout(() => this.tone(880, 'sawtooth', 0.25, 0.2, 1100), 240);
  }

  // Mission Completed celebratory trumpet flourish
  public sfxMissionComplete() {
    const notes = [587.33, 739.99, 880, 1174.66]; // D-F#-A-D
    notes.forEach((freq, idx) => {
      setTimeout(() => this.tone(freq, 'triangle', 0.3, 0.18), idx * 80);
    });
  }

  // Crisp vegetable chop
  public sfxChopVegetable() {
    this.tone(620, 'square', 0.03, 0.08, 200);
    this.noise(0.04, 3200, 0.07);
  }

  // Customer impatient or angry / life lost
  public sfxFail() {
    this.tone(260, 'sawtooth', 0.2, 0.16, 120);
    setTimeout(() => this.tone(180, 'sawtooth', 0.3, 0.2, 90), 120);
  }

  // Food burnt warning buzzer
  public sfxBurn() {
    this.tone(330, 'square', 0.12, 0.15, 220);
  }

  // Day clear fanfare
  public sfxDayClear() {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    notes.forEach((freq, i) => {
      setTimeout(() => this.tone(freq, 'triangle', 0.25, 0.16), i * 90);
    });
  }

  // Game over slow chord
  public sfxGameOver() {
    this.tone(349.23, 'sawtooth', 0.4, 0.15, 220); // F
    setTimeout(() => this.tone(311.13, 'sawtooth', 0.5, 0.16, 180), 200); // Eb
    setTimeout(() => this.tone(261.63, 'sawtooth', 0.8, 0.2, 130), 450); // C
  }

  // Upgrade purchased
  public sfxUpgrade() {
    this.tone(784, 'triangle', 0.12, 0.15);
    setTimeout(() => this.tone(1046.5, 'triangle', 0.25, 0.18), 80);
    setTimeout(() => this.tone(1568, 'sine', 0.3, 0.2), 160);
  }
}

export const sound = new SoundEngine();
