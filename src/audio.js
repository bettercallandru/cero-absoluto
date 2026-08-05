/**
 * MÓDULO DE AUDIO: Síntesis Mineral y Cristalina (Tone.js)
 * Cero Absoluto - Calidad Expositiva (Prioridad 3)
 */
import * as Tone from "tone";

export class AudioManager {
  constructor() {
    this.isStarted = false;
    this.lastPulseTime = 0;

    // --- 1. CADENA DE EFECTOS MAESTROS (Catedral de Hielo / Galería) ---
    this.reverb = new Tone.Reverb({
      decay: 6,
      preDelay: 0.08,
      wet: 0.45,
    });

    this.masterFilter = new Tone.Filter({
      frequency: 35,
      type: "highpass",
    });

    this.limiter = new Tone.Limiter(-1.5);

    this.reverb.connect(this.masterFilter);
    this.masterFilter.connect(this.limiter);
    this.limiter.toDestination();

    // --- 2. TEXTURA AMBIENTAL CRISTALINA: Dron Helado Resonante ---
    this.droneSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: "fatsawtooth",
        count: 3,
        spread: 15,
      },
      envelope: {
        attack: 2.5,
        decay: 2,
        sustain: 0.85,
        release: 3.5,
      },
    });

    this.droneFilter = new Tone.Filter({
      frequency: 220,
      type: "lowpass",
      rolloff: -24,
    });

    this.droneLFO = new Tone.LFO({
      frequency: 0.06,
      min: 150,
      max: 500,
    }).start();

    this.droneLFO.connect(this.droneFilter.frequency);
    this.droneSynth.connect(this.droneFilter);
    this.droneFilter.connect(this.reverb);

    // --- 3. FRICCIÓN Y PRESION ATMOSFÉRICA (Ruido Resonante) ---
    this.noise = new Tone.Noise("pink").start();

    this.noiseFilter = new Tone.Filter({
      frequency: 1200,
      type: "bandpass",
      Q: 3.0, // Alta resonancia para simular fricción cortante
    });

    this.noiseVolume = new Tone.Volume(-32);
    this.noise.chain(this.noiseFilter, this.noiseVolume, this.reverb);

    // --- 4. SÍNTESIS DE FRACTURA / SNAP CRISTALINO (Metálico / Agudo) ---
    // Sintetizador MetalSynth dedicado a los colapsos tectónicos del látice
    this.crystalSnapSynth = new Tone.MetalSynth({
      frequency: 320,
      envelope: {
        attack: 0.001,
        decay: 0.25,
        release: 0.1,
      },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5,
    });

    this.snapVolume = new Tone.Volume(-6);
    this.crystalSnapSynth.chain(this.snapVolume, this.reverb);

    // --- 5. IMPACTO DE GRAVES TECTÓNICOS (Sub-seísmo) ---
    this.impactSynth = new Tone.FMSynth({
      harmonicity: 2.0,
      modulationIndex: 4,
      oscillator: { type: "sine" },
      envelope: { attack: 0.002, decay: 0.6, sustain: 0.0, release: 1.2 },
      modulation: { type: "triangle" },
      modulationEnvelope: {
        attack: 0.005,
        decay: 0.3,
        sustain: 0,
        release: 0.5,
      },
    });

    this.impactDistortion = new Tone.Distortion({
      distortion: 0.15,
      wet: 0.25,
    });

    this.impactSynth.chain(this.impactDistortion, this.reverb);
  }

  async start() {
    if (!this.isStarted) {
      await Tone.start();
      await this.reverb.generate();

      console.log("💎 Motor de sonido cristalino activado.");

      // Acorde helado abierto en tono de cristal (C# menor / E mayor)
      this.droneSynth.triggerAttack(["C#2", "G#2", "E3", "B3"], undefined, 0.2);
      this.isStarted = true;
    }
  }

  /**
   * Disparo síncrono de fractura metálica / cuarzo
   */
  triggerTectonicSnap(magnitude = 0.2) {
    if (!this.isStarted) return;

    const now = Tone.now();
    // Volumen adaptado a la intensidad del salto discontinuo
    const gainDb = -12 + Math.min(magnitude * 15, 10);
    this.snapVolume.volume.setValueAtTime(gainDb, now);

    // Frecuencias estridentes e inarmónicas según magnitud
    const freq = 400 + magnitude * 1200;
    this.crystalSnapSynth.triggerAttackRelease(freq, "32n", now);
  }

  /**
   * Actualización dinámica sintonizada con el estrés y eventos Voronoi
   */
  update(stress, temperature, windSpeed, isSnap = false, snapMagnitude = 0.0) {
    if (!this.isStarted) return;

    const now = Tone.now();

    // A. EXPANSIÓN DE FRECUENCIAS Y REFINAMIENTO DE LFO
    let targetMin = Tone.mtof(Tone.ftom(150) + stress * 80);
    let targetMax = Tone.mtof(Tone.ftom(500) + stress * 120);
    this.droneLFO.min = targetMin;
    this.droneLFO.max = targetMax;

    // B. FRICCIÓN DE VIENTO Y REJILLA MINERAL
    let targetNoiseVol = -30 + (windSpeed / 50.0) * 8 + stress * 12;
    this.noiseVolume.volume.rampTo(targetNoiseVol, 0.2);
    this.noiseFilter.frequency.setValueAtTime(800 + stress * 2200, now);

    // C. RESPUESTA SÍNCRONA A FRACTURAS TECTÓNICAS (Voronoi Snap)
    if (isSnap) {
      this.triggerTectonicSnap(snapMagnitude);
    }

    // D. PULSO CARDÍACO / SUB-SEÍSMICO BASE
    this.impactSynth.modulationIndex.value = 1.5 + stress * 10.0;
    this.impactDistortion.distortion = Math.min(stress * 0.6, 0.8);

    let pulseInterval = Tone.Time(2.4 - stress * 1.95).toSeconds();

    if (now - this.lastPulseTime >= pulseInterval) {
      let pitch = "C#1";
      if (stress > 0.4) pitch = "G#0";
      if (stress > 0.75) pitch = "E0";

      let velocity = 0.35 + stress * 0.65;
      this.impactSynth.triggerAttackRelease(pitch, "16n", now, velocity);
      this.lastPulseTime = now;
    }
  }
}
