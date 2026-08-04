/**
 * MÓDULO 2: Motor de Simulación Temporal (JS Nativo Puro)
 */

export class SimulationEngine {
  constructor(totalSeconds = 300) {
    this.totalSeconds = totalSeconds; // 5 minutos por defecto
    this.weatherData = [];
    this.currentIndex = 0;
    this.currentStress = 0.0;
    this.targetStress = 0.0;
    this.framesPerStep = 60;
  }

  init(data) {
    this.weatherData = data;
    // 300 sec * 60 fps = 18,000 frames totales / N registros
    this.framesPerStep = Math.floor(
      (this.totalSeconds * 60) / this.weatherData.length,
    );
  }

  update(frameCount) {
    if (!this.weatherData.length) return;

    // Calcular el registro actual dentro del arreglo circular
    let stepIndex =
      Math.floor(frameCount / this.framesPerStep) % this.weatherData.length;

    if (stepIndex !== this.currentIndex) {
      this.currentIndex = stepIndex;
      this.targetStress = this.calculateStress(this.getCurrentRecord());
    }

    // Interpolación lineal matemática pura (lerp) sin depender de p5.js
    this.currentStress = this.lerp(this.currentStress, this.targetStress, 0.05);
  }

  getCurrentRecord() {
    return this.weatherData[this.currentIndex] || {};
  }

  calculateStress(record) {
    if (!record.precipitation_probability) return 0;

    let pFactor = record.precipitation_probability / 100.0;

    // Reemplazo de p.constrain por Math.min/Math.max
    let rawWFactor = record.wind_speed_180m / 45.0;
    let wFactor = Math.min(Math.max(rawWFactor, 0.0), 1.0);

    // Reemplazo de p.abs por Math.abs
    let hFactor = Math.abs(50 - record.relative_humidity_2m) / 50.0;

    return pFactor * 0.4 + wFactor * 0.4 + hFactor * 0.2;
  }

  // Método auxiliar de interpolación matemática pura
  lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
  }
}
