/**
 * MÓDULO 2: Motor de Simulación Temporal (Voltaje - Prioridad 2)
 * Generación de estrés discontinuo basado en Ruido Celular Voronoi y Saltos Tectónicos.
 * Compatible con la iteración de datos climáticos original.
 */

export class SimulationEngine {
  constructor(totalSeconds = 300) {
    // Propiedades originales de la arquitectura
    this.totalSeconds = totalSeconds;
    this.weatherData = [];
    this.currentIndex = 0;
    this.currentStress = 0.0;
    this.targetStress = 0.0;
    this.framesPerStep = 60;

    // Nuevas propiedades de simulación tectónica (Prioridad 2)
    this.baseRawStress = 0.0;
    this.snapTriggered = false;
    this.lastSnapFrame = 0;
    this.quantizationSteps = 7;
    this.voronoiScale = 0.02; // Escala ajustada para operar sobre frameCount
  }

  init(data) {
    this.weatherData = data;
    // Cálculo seguro del número de frames que dura cada registro del clima
    this.framesPerStep = Math.floor(
      (this.totalSeconds * 60) / this.weatherData.length,
    );
  }

  /**
   * Generador de Ruido Celular / Voronoi 1D para límites de grano mineral
   */
  getVoronoiDiscontinuity(t) {
    const scaledT = t * this.voronoiScale;
    const cell = Math.floor(scaledT);
    const frac = scaledT - cell;

    // Pseudo-randomización determinista por celda
    const p1 = Math.abs(Math.sin(cell * 17.123 + 43.12) * 43758.5453) % 1;
    const p2 = Math.abs(Math.sin((cell + 1) * 17.123 + 43.12) * 43758.5453) % 1;

    const dist1 = Math.abs(frac - p1);
    const dist2 = Math.abs(1.0 + frac - p2);

    // Retorna la proximidad al borde de la celda Voronoi
    return Math.min(dist1, dist2) * 2.0;
  }

  update(frameCount) {
    if (!this.weatherData.length) return;

    // Lógica original conservada: Calcular el registro actual
    let stepIndex =
      Math.floor(frameCount / this.framesPerStep) % this.weatherData.length;

    if (stepIndex !== this.currentIndex) {
      this.currentIndex = stepIndex;
      this.targetStress = this.calculateStress(this.getCurrentRecord());
    }

    // 1. Aproximación suave primaria (Flujo de presión climática a largo plazo)
    this.baseRawStress = this.lerp(this.baseRawStress, this.targetStress, 0.04);

    // 2. Modulación mediante Ruido Voronoi (Microrrupturas internas)
    const vNoise = this.getVoronoiDiscontinuity(frameCount);
    const modulatedStress = Math.max(
      0.0,
      Math.min(1.0, this.baseRawStress + (vNoise - 0.5) * 0.25),
    );

    // 3. CIZALLAMIENTO TECTÓNICO: Cuantización en saltos discretos
    const previousQuantized = this.currentStress;

    if (modulatedStress > 0.2) {
      // A mayor estrés, la rejilla colapsa en peldaños más grandes (Staccato Snap)
      const activeSteps = Math.max(
        3,
        Math.floor(this.quantizationSteps * (1.1 - modulatedStress)),
      );
      this.currentStress =
        Math.round(modulatedStress * activeSteps) / activeSteps;
    } else {
      // En reposo absoluto, mantiene cierta linealidad inactiva
      this.currentStress = modulatedStress;
    }

    // 4. EMISIÓN DE EVENTO DE FRACTURA (Snap) para sincronía futura
    const stressDelta = Math.abs(this.currentStress - previousQuantized);

    // Evita gatillar múltiples micro-snaps seguidos (cooldown de ~10 frames)
    if (stressDelta >= 0.1 && frameCount - this.lastSnapFrame > 10) {
      this.snapTriggered = true;
      this.lastSnapFrame = frameCount;
    } else {
      this.snapTriggered = false;
    }
  }

  getCurrentRecord() {
    return this.weatherData[this.currentIndex] || {};
  }

  calculateStress(record) {
    // Algoritmo original de ponderación climática preservado
    if (!record.precipitation_probability) return 0;

    let pFactor = record.precipitation_probability / 100.0;
    let rawWFactor = record.wind_speed_180m / 45.0;
    let wFactor = Math.min(Math.max(rawWFactor, 0.0), 1.0);
    let hFactor = Math.abs(50 - record.relative_humidity_2m) / 50.0;

    return pFactor * 0.4 + wFactor * 0.4 + hFactor * 0.2;
  }

  lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
  }
}
