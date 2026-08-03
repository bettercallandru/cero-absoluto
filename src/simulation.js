/**
 * MÓDULO 2: Motor de Simulación Temporal
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

  update(frameCount, p) {
    if (!this.weatherData.length) return;

    // Calcular el registro actual dentro del arreglo circular
    let stepIndex =
      Math.floor(frameCount / this.framesPerStep) % this.weatherData.length;

    if (stepIndex !== this.currentIndex) {
      this.currentIndex = stepIndex;
      this.targetStress = this.calculateStress(this.getCurrentRecord(), p);
    }

    // Interpolación suave (lerp) usando el método de p5
    this.currentStress = p.lerp(this.currentStress, this.targetStress, 0.05);
  }

  getCurrentRecord() {
    return this.weatherData[this.currentIndex] || {};
  }

  calculateStress(record, p) {
    if (!record.precipitation_probability) return 0;

    let pFactor = record.precipitation_probability / 100.0;
    let wFactor = p.constrain(record.wind_speed_180m / 45.0, 0.0, 1.0);
    let hFactor = p.abs(50 - record.relative_humidity_2m) / 50.0;

    return pFactor * 0.4 + wFactor * 0.4 + hFactor * 0.2;
  }
}
