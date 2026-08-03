/**
 * MÓDULO DE AUDIO: Síntesis Cinemática Orgánica (Tone.js)
 * Cero Absoluto - Voltaje 14
 */
import * as Tone from "tone";

export class AudioManager {
  constructor() {
    this.isStarted = false;
    this.lastPulseTime = 0;

    // --- 1. CADENA DE EFECTOS MAESTROS (Ambiente Espacial) ---
    // Reverberación convolutiva amplia para dar sensación de catedral/subterráneo
    this.reverb = new Tone.Reverb({
      decay: 8, // Cola de reverberación de 8 segundos
      preDelay: 0.1,
      wet: 0.5, // 50% señal procesada
    });

    // Filtro Pasa-Altos Maestro para limpiar graves indeseados en la sala
    this.masterFilter = new Tone.Filter({
      frequency: 40,
      type: "highpass",
    });

    // Limitador para evitar saturación y proteger los parlantes de la sala
    this.limiter = new Tone.Limiter(-2); // -2dB límite

    // Conexión del bus maestro: Efectos -> Limitador -> Salida
    this.reverb.connect(this.masterFilter);
    this.masterFilter.connect(this.limiter);
    this.limiter.toDestination();

    // --- 2. CAPA AMBIENTAL 1: PolySynth Orgánico (Textura Armónica) ---
    // Un sintetizador de tonos ricos que simula instrumentos de cuerda agudos/oscuros
    this.droneSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: "fatsawtooth", // CORREGIDO: 'fatsawtooth' en lugar de 'fatfat'
        count: 3, // Apila 3 osciladores desafinados entre sí
        spread: 20, // Desafinación de 20 cents para dar textura orgánica/análoga
      },
      envelope: {
        attack: 3,
        decay: 2,
        sustain: 0.9,
        release: 4,
      },
    });

    this.droneFilter = new Tone.Filter({
      frequency: 180,
      type: "lowpass",
      rolloff: -24, // Caída suave de frecuencias
    });

    // Modulación lenta de LFO para que la atmósfera "respire" de forma orgánica
    this.droneLFO = new Tone.LFO({
      frequency: 0.08, // Ciclo muy lento (12.5 segundos)
      min: 120,
      max: 450,
    }).start();

    this.droneLFO.connect(this.droneFilter.frequency);
    this.droneSynth.connect(this.droneFilter);
    this.droneFilter.connect(this.reverb);

    // --- 3. CAPA AMBIENTAL 2: Ruido Rosa Filtro-Modulado (Presión Atmosférica) ---
    // Simula la sensación física de viento, frío y turbulencia en la montaña
    this.noise = new Tone.Noise("pink").start();

    this.noiseFilter = new Tone.AutoFilter({
      frequency: 0.05, // Velocidad del LFO (muy lenta)
      baseFrequency: 80, // Frecuencia base del filtro
      octaves: 3, // Cuántas octavas subirá a partir de la base
      filter: {
        type: "bandpass", // CORREGIDO: El tipo de filtro va dentro del objeto 'filter'
      },
    }).start();

    this.noiseVolume = new Tone.Volume(-30); // Inicia tenue en el fondo
    this.noise.chain(this.noiseFilter, this.noiseVolume, this.reverb);

    // --- 4. CAPA IMPACTO / CORAZÓN: FM Synth (Estructura Ósea/Metálica) ---
    // Síntesis FM (Frecuencia Modulada) para un impacto sombrío con armónicos metálicos
    this.impactSynth = new Tone.FMSynth({
      harmonicity: 1.5,
      modulationIndex: 3,
      oscillator: { type: "sine" },
      envelope: { attack: 0.005, decay: 0.8, sustain: 0.01, release: 2 },
      modulation: { type: "triangle" },
      modulationEnvelope: { attack: 0.01, decay: 0.5, sustain: 0, release: 1 },
    });

    this.impactDistortion = new Tone.Distortion({
      distortion: 0.1,
      wet: 0.2,
    });

    this.impactSynth.chain(this.impactDistortion, this.reverb);
  }

  /**
   * Inicialización requerida por interactividad del usuario
   */
  async start() {
    if (!this.isStarted) {
      await Tone.start();
      await this.reverb.generate(); // Generar respuesta de impulso

      console.log("🌌 Diseño sonoro cinemático iniciado.");

      // Acorde inicial atmosférico de bienvenida (Do menor abierto: C2, G2, Eb3)
      this.droneSynth.triggerAttack(["C2", "G2", "Eb3"], undefined, 0.25);
      this.isStarted = true;
    }
  }

  /**
   * Actualización dinámica sintonizada con el estrés y el clima
   */
  update(stress, temperature, windSpeed) {
    if (!this.isStarted) return;

    const now = Tone.now();

    // A. EXPANSIÓN ARMÓNICA CON EL ESTRÉS
    // Modificamos los límites del LFO en lugar del filtro directamente
    let targetMin = Tone.mtof(Tone.ftom(120) + stress * 60);
    let targetMax = Tone.mtof(Tone.ftom(450) + stress * 60);

    // Tone.js permite reasignar min y max del LFO sobre la marcha
    this.droneLFO.min = targetMin;
    this.droneLFO.max = targetMax;

    // B. TEXTURA DE VIENTO / PRESION (Noise Volume)
    // El viento físico y el estrés aumentan la presencia del ruido rosa en la sala (-28dB a -10dB)
    let targetNoiseVol = -28 + (windSpeed / 50.0) * 10 + stress * 8;
    this.noiseVolume.volume.rampTo(targetNoiseVol, 0.3);

    // C. RITMO Y DISTORSIÓN DEL IMPACTO ORGÁNICO
    // Aumenta la agresividad FM de los impactos a medida que el avatar entra en crisis
    this.impactSynth.modulationIndex.value = 1.5 + stress * 12.0;
    this.impactDistortion.distortion = Math.min(stress * 0.7, 0.85);
    this.impactDistortion.wet.value = stress * 0.6;

    // Intervalo cardíaco variable (2.2s en reposo hasta 0.35s en estrés máximo)
    let pulseInterval = Tone.Time(2.2 - stress * 1.85).toSeconds();

    if (now - this.lastPulseTime >= pulseInterval) {
      // Cambio de tono cinemático según el estrés
      let pitch = "C1";
      if (stress > 0.45) pitch = "G0";
      if (stress > 0.75) pitch = "Eb1";

      let velocity = 0.4 + stress * 0.6;
      this.impactSynth.triggerAttackRelease(pitch, "16n", now, velocity);
      this.lastPulseTime = now;
    }
  }
}
