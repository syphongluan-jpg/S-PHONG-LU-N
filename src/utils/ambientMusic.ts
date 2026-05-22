/**
 * Ambient Music & Sound Effects Generator using Web Audio API
 * Provides gentle, calm, generative background music (Lofi / Spa / Study style)
 * and satisfying acoustic feedback sound effects for the entire application.
 */

class AmbientMusicManager {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  
  private isMusicPlaying: boolean = false;
  private sfxEnabled: boolean = true;
  private schedulerInterval: number | null = null;
  
  // Custom levels for smooth volume control
  private musicVolumeLevel: number = 0.4; // 0 to 1 scaling factor
  private sfxVolumeLevel: number = 0.5;   // 0 to 1 scaling factor

  // Chord progression definitions
  // Fmaj9, Cmaj9, Am9, G6
  private chordsList = [
    [174.61, 261.63, 329.63, 440.00, 523.25], // F3, C4, E4, A4, C5 (Fmaj7/9)
    [130.81, 196.00, 246.94, 329.63, 392.00], // C3, G3, B3, E4, G4 (Cmaj7)
    [110.00, 164.81, 220.00, 293.66, 349.23], // A2, E3, A3, D4, F4 (Am11)
    [146.83, 220.00, 293.66, 392.00, 493.88]  // D3, A3, D4, G4, B4 (G6/9)
  ];
  private currentChordIndex = 0;
  private lastChordTime = 0;
  private lastChimeTime = 0;

  constructor() {
    // Lazy initialisation inside browser environment
    if (typeof window !== 'undefined') {
      try {
        const savedMusicState = localStorage.getItem('ambient_music_enabled');
        this.isMusicPlaying = savedMusicState === 'true';
        const savedSfxState = localStorage.getItem('ambient_sfx_enabled');
        this.sfxEnabled = savedSfxState !== 'false';
        const savedMusicVol = localStorage.getItem('ambient_music_vol');
        if (savedMusicVol !== null) this.musicVolumeLevel = parseFloat(savedMusicVol);
        const savedSfxVol = localStorage.getItem('ambient_sfx_vol');
        if (savedSfxVol !== null) this.sfxVolumeLevel = parseFloat(savedSfxVol);
      } catch (e) {
        // Fallback for isolated contexts
      }
    }
  }

  /**
   * Initialize AudioContext and active synthesizer graph
   */
  private init() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      
      // Set initial volume levels via master node
      this.musicGain.gain.setValueAtTime(this.isMusicPlaying ? this.musicVolumeLevel * 0.08 : 0, this.ctx.currentTime);
      this.sfxGain.gain.setValueAtTime(this.sfxEnabled ? this.sfxVolumeLevel * 0.4 : 0, this.ctx.currentTime);
      
      // Gentle lowpass filter for an underwater, warm lofi background profile
      this.filterNode = this.ctx.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.setValueAtTime(650, this.ctx.currentTime); // Soft warmth cutoff
      this.filterNode.Q.setValueAtTime(1.0, this.ctx.currentTime);
      
      // Connect nodes
      this.musicGain.connect(this.filterNode);
      this.filterNode.connect(this.ctx.destination);
      this.sfxGain.connect(this.ctx.destination);
      
      // Start scheduler loop
      this.startScheduler();
    } catch (e) {
      console.error('Failed to initialize AmbientMusicManager:', e);
    }
  }

  private startScheduler() {
    if (this.schedulerInterval) clearInterval(this.schedulerInterval);
    
    // Check state and trigger new ambient segments every 250ms
    this.schedulerInterval = window.setInterval(() => {
      if (!this.ctx || this.ctx.state === 'suspended' || !this.isMusicPlaying) return;
      
      const now = this.ctx.currentTime;
      
      // Play a slow chord sweep every 6 seconds
      if (now - this.lastChordTime > 5.5) {
        this.playChordSweep(now);
        this.lastChordTime = now;
      }
      
      // Generative chimes (35% probability every 3 seconds)
      if (now - this.lastChimeTime > 2.8) {
        if (Math.random() < 0.35) {
          this.playChimeBell(now);
        }
        this.lastChimeTime = now;
      }
    }, 250);
  }

  /**
   * Synthesize a warm, slow sweep of a chord
   */
  private playChordSweep(startTime: number) {
    if (!this.ctx || !this.musicGain) return;
    
    // Progressively loop over the chords
    const chord = this.chordsList[this.currentChordIndex];
    this.currentChordIndex = (this.currentChordIndex + 1) % this.chordsList.length;
    
    // Play notes staggered by a slight arpeggiation delay for organic sound
    chord.forEach((freq, idx) => {
      if (!this.ctx || !this.musicGain) return;
      
      const noteDelay = idx * 0.15; // 150ms arpeggio
      const noteStart = startTime + noteDelay;
      
      const osc = this.ctx.createOscillator();
      const voiceGain = this.ctx.createGain();
      
      osc.type = 'triangle'; // Warm, soft tone
      osc.frequency.setValueAtTime(freq, noteStart);
      
      // Envelope setup: slow fade-in, long sustain/decay, smooth fade out (Release)
      // Gain levels are highly controlled for gentle atmosphere
      voiceGain.gain.setValueAtTime(0, noteStart);
      voiceGain.gain.linearRampToValueAtTime(0.04 * this.musicVolumeLevel, noteStart + 1.8); // 1.8 seconds attack
      
      // Sustain and release
      const sustainEnd = noteStart + 4.2;
      voiceGain.gain.setValueAtTime(0.04 * this.musicVolumeLevel, sustainEnd);
      voiceGain.gain.exponentialRampToValueAtTime(0.0001, sustainEnd + 2.0); // 2.0 seconds release
      
      osc.connect(voiceGain);
      voiceGain.connect(this.musicGain);
      
      osc.start(noteStart);
      osc.stop(noteStart + 6.5);
    });
  }

  /**
   * Synthesize a random delicate crystalline wind chime
   */
  private playChimeBell(startTime: number) {
    if (!this.ctx || !this.musicGain) return;
    
    // Pentatonic scale corresponding to C5, D5, E5, G5, A5, C6, E6
    const pentatonic = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1318.51];
    const randFreq = pentatonic[Math.floor(Math.random() * pentatonic.length)];
    
    const osc = this.ctx.createOscillator();
    const bellGain = this.ctx.createGain();
    
    osc.type = 'sine'; // Pure clean tone
    osc.frequency.setValueAtTime(randFreq, startTime);
    
    // Quick bell decay curve (0.4s fade-in, 4s decay)
    bellGain.gain.setValueAtTime(0, startTime);
    bellGain.gain.linearRampToValueAtTime(0.015 * this.musicVolumeLevel, startTime + 0.4);
    bellGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 4.0);
    
    osc.connect(bellGain);
    bellGain.connect(this.musicGain);
    
    osc.start(startTime);
    osc.stop(startTime + 4.2);
  }

  /**
   * Toggle background music state
   */
  public restartContext() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Set music toggle status
   */
  public setMusicPlaying(playing: boolean) {
    this.isMusicPlaying = playing;
    localStorage.setItem('ambient_music_enabled', playing ? 'true' : 'false');
    
    this.restartContext();
    
    if (this.musicGain && this.ctx) {
      // Fade out or fade in smoothly to prevent sudden clicks
      const now = this.ctx.currentTime;
      const targetGain = playing ? this.musicVolumeLevel * 0.08 : 0;
      this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, now);
      this.musicGain.gain.linearRampToValueAtTime(targetGain, now + 1.2); // 1.2s smooth fading
    }
  }

  /**
   * Check if music is active
   */
  public getIsMusicPlaying(): boolean {
    return this.isMusicPlaying;
  }

  /**
   * Set music volume multiplier (0.0 to 1.0)
   */
  public setMusicVolume(vol: number) {
    this.musicVolumeLevel = Math.max(0, Math.min(1, vol));
    localStorage.setItem('ambient_music_vol', this.musicVolumeLevel.toString());
    
    if (this.musicGain && this.ctx && this.isMusicPlaying) {
      const now = this.ctx.currentTime;
      this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, now);
      this.musicGain.gain.linearRampToValueAtTime(this.musicVolumeLevel * 0.08, now + 0.3);
    }
  }

  public getMusicVolume(): number {
    return this.musicVolumeLevel;
  }

  /**
   * Toggle Sound Effects state
   */
  public setSfxEnabled(enabled: boolean) {
    this.sfxEnabled = enabled;
    localStorage.setItem('ambient_sfx_enabled', enabled ? 'true' : 'false');
    
    this.restartContext();
    
    if (this.sfxGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.sfxGain.gain.setValueAtTime(enabled ? this.sfxVolumeLevel * 0.4 : 0, now);
    }
  }

  public getIsSfxEnabled(): boolean {
    return this.sfxEnabled;
  }

  /**
   * Set SFX volume multi (0.0 to 1.0)
   */
  public setSfxVolume(vol: number) {
    this.sfxVolumeLevel = Math.max(0, Math.min(1, vol));
    localStorage.setItem('ambient_sfx_vol', this.sfxVolumeLevel.toString());
    
    if (this.sfxGain && this.ctx && this.sfxEnabled) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolumeLevel * 0.4, this.ctx.currentTime);
    }
  }

  public getSfxVolume(): number {
    return this.sfxVolumeLevel;
  }

  /**
   * Play dynamic sound effect: Correct Answer
   * Pentatonic pleasant ascending clean chimes
   */
  public playCorrect() {
    this.restartContext();
    if (!this.sfxEnabled || !this.ctx || !this.sfxGain) return;
    
    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      
      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const noteStart = now + idx * 0.07;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);
        
        gain.gain.setValueAtTime(0, noteStart);
        gain.gain.linearRampToValueAtTime(0.08 * this.sfxVolumeLevel, noteStart + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.4);
        
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.start(noteStart);
        osc.stop(noteStart + 0.45);
      });
    } catch (e) {
      // Audio fallback
    }
  }

  /**
   * Play dynamic sound effect: Incorrect Answer
   * Slow, warm, non-harsh descending detuned chord
   */
  public playIncorrect() {
    this.restartContext();
    if (!this.sfxEnabled || !this.ctx || !this.sfxGain) return;
    
    try {
      const now = this.ctx.currentTime;
      const notes = [293.66, 277.18]; // D4 to C#4 descending
      
      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const noteStart = now + idx * 0.12;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteStart);
        
        gain.gain.setValueAtTime(0, noteStart);
        gain.gain.linearRampToValueAtTime(0.06 * this.sfxVolumeLevel, noteStart + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.5);
        
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.start(noteStart);
        osc.stop(noteStart + 0.55);
      });
    } catch (e) {
      // Audio fallback
    }
  }

  /**
   * Play short high-frequency tick sound (for spinners, buttons, wheel)
   */
  public playTick(pitch: number = 880) {
    this.restartContext();
    if (!this.sfxEnabled || !this.ctx || !this.sfxGain) return;
    
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, now);
      
      gain.gain.setValueAtTime(0.03 * this.sfxVolumeLevel, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
      
      osc.connect(gain);
      gain.connect(this.sfxGain);
      
      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {
      // Audio fallback
    }
  }

  /**
   * UI Click response
   */
  public playClick() {
    this.playTick(587.33); // D5 tick
  }

  /**
   * Custom Fanfare / Level up Sound
   */
  public playLevelUp() {
    this.restartContext();
    if (!this.sfxEnabled || !this.ctx || !this.sfxGain) return;
    
    try {
      const now = this.ctx.currentTime;
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C Major chord scale cascade
      
      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const noteStart = now + idx * 0.06;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, noteStart);
        
        gain.gain.setValueAtTime(0, noteStart);
        gain.gain.linearRampToValueAtTime(0.05 * this.sfxVolumeLevel, noteStart + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.6);
        
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.start(noteStart);
        osc.stop(noteStart + 0.65);
      });
    } catch (e) {
      // Audio fallback
    }
  }
}

// Create a singleton instance
export const soundManager = new AmbientMusicManager();
