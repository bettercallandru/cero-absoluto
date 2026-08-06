/**
 * MÓDULO DE AUDIO: Síntesis Orgánica, Tectónica y Biológica (Tone.js)
 * Cero Absoluto - Calidad Expositiva
 */
import * as Tone from "tone";

export class AudioManager {
  constructor() {
    this.isStarted = false;
    this.lastPulseTime = 0;

    // --- 1. CADENA DE EFECTOS MAESTROS (Espacio Sordo y Orgánico) ---
    this.reverb = new Tone.Reverb({
      decay: 4.5,
      preDelay: 0.1,
      wet: 0.4,
    });

    // Un filtro maestro para opacar el sonido y darle textura de material denso
    this.masterFilter = new Tone.Filter({
      frequency: 6000, // Cortamos las frecuencias altas hirientes
      type: "lowpass",
    });

    this.limiter = new Tone.Limiter(-2);

    this.reverb.connect(this.masterFilter);
    this.masterFilter.connect(this.limiter);
    this.limiter.toDestination();

    // --- 2. DRON TECTÓNICO (Resonancia de grafito y tierra) ---
    this.droneSynth = new Tone.FMSynth({
      harmonicity: 0.5,
      modulationIndex: 2,
      oscillator: { type: "sine" },
      modulation: { type: "triangle" },
      envelope: { attack: 2.0, decay: 1.0, sustain: 0.8, release: 4.0 },
    });

    this.droneFilter = new Tone.Filter({
      frequency: 150,
      type: "lowpass",
      rolloff: -24,
    });

    // LFO para emular la respiración lenta de la masa
    this.droneLFO = new Tone.LFO({
      frequency: 0.08,
      min: 80,
      max: 250,
    }).start();

    this.droneLFO.connect(this.droneFilter.frequency);
    this.droneSynth.connect(this.droneFilter);
    this.droneFilter.connect(this.reverb);

    // --- 3. FRICCIÓN Y VIENTO (Roce sobre pergamino y polvo) ---
    // El ruido marrón (brown) tiene más cuerpo en frecuencias bajas que el rosa
    this.noise = new Tone.Noise("brown").start();

    this.noiseFilter = new Tone.Filter({
      frequency: 300,
      type: "bandpass",
      Q: 1.2, // Menos resonante, más rasgado y difuso
    });

    this.noiseVolume = new Tone.Volume(-40);
    this.noise.chain(this.noiseFilter, this.noiseVolume, this.reverb);

    // --- 4. FRACTURA DE CARBÓN / SNAP TECTÓNICO (Seco y sordo) ---
    this.carbonSnapSynth = new Tone.MembraneSynth({
      pitchDecay: 0.08,
      octaves: 3,
      oscillator: { type: "sine" },
      envelope: { attack: 0.001, decay: 0.35, sustain: 0, release: 0.4 },
    });

    this.snapVolume = new Tone.Volume(-4);
    this.carbonSnapSynth.chain(this.snapVolume, this.reverb);

    // --- 5. PULSO CARDÍACO (Latido Biológico interno) ---
    this.heartSynth = new Tone.MembraneSynth({
      pitchDecay: 0.1,
      octaves: 2,
      oscillator: { type: "triangle" },
      envelope: { attack: 0.02, decay: 0.5, sustain: 0, release: 0.5 },
    });

    // Distorsión para simular la textura rugosa del órgano bajo estrés
    this.heartDistortion = new Tone.Distortion({
      distortion: 0.1,
      wet: 0.3,
    });

    this.heartSynth.chain(this.heartDistortion, this.reverb);
  }

  async start() {
    if (!this.isStarted) {
      await Tone.start();
      await this.reverb.generate();

      console.log("🌑 Motor de sonido tectónico/biológico activado.");

      // Activar el dron base de forma continua en una nota sub-grave
      this.droneSynth.triggerAttack("C1", Tone.now(), 0.5);
      this.isStarted = true;
    }
  }

  /**
   * Disparo síncrono de fractura de grafito (Snap)
   */
  triggerTectonicSnap(magnitude = 0.2) {
    if (!this.isStarted) return;

    const now = Tone.now();
    // Ajuste de ganancia para impactos contundentes pero no hirientes
    const gainDb = -10 + Math.min(magnitude * 12, 8);
    this.snapVolume.volume.setValueAtTime(gainDb, now);

    // Frecuencia baja y seca para emular carbón/madera rompiéndose
    const freq = 50 + magnitude * 70;
    this.carbonSnapSynth.triggerAttackRelease(freq, "16n", now);
  }

  /**
   * Actualización dinámica sintonizada con el estrés y eventos Voronoi
   */
  update(stress, temperature, windSpeed, isSnap = false, snapMagnitude = 0.0) {
    if (!this.isStarted) return;

    const now = Tone.now();

    // A. MODULACIÓN DEL DRON (Respiración pesada de la tierra)
    let targetMin = 80 + stress * 100;
    let targetMax = 250 + stress * 200;
    this.droneLFO.min = targetMin;
    this.droneLFO.max = targetMax;

    // B. FRICCIÓN DE VIENTO SOBRE PERGAMINO
    let targetNoiseVol = -35 + (windSpeed / 50.0) * 10 + stress * 15;
    this.noiseVolume.volume.rampTo(targetNoiseVol, 0.3);
    this.noiseFilter.frequency.setValueAtTime(
      300 + stress * 500 + windSpeed * 6,
      now,
    );

    // C. RESPUESTA SÍNCRONA A FRACTURAS TECTÓNICAS (Voronoi Snap)
    if (isSnap) {
      this.triggerTectonicSnap(snapMagnitude);
    }

    // D. PULSO CARDÍACO BIOLÓGICO Y ARRITMIA
    this.heartDistortion.distortion = Math.min(0.1 + stress * 0.7, 0.9);

    // A mayor estrés, el corazón late más rápido, emulando taquicardia
    let pulseInterval = Tone.Time(2.2 - stress * 1.7).toSeconds();

    if (now - this.lastPulseTime >= pulseInterval) {
      // El tono del corazón se tensa ligeramente con el colapso
      let pitch = "C1";
      if (stress > 0.4) pitch = "D1";
      if (stress > 0.75) pitch = "F1";

      let velocity = 0.4 + stress * 0.6;
      this.heartSynth.triggerAttackRelease(pitch, "8n", now, velocity);
      this.lastPulseTime = now;
    }
  }
}
