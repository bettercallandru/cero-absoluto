/**
 * MÓDULO VISUAL: Niebla Atmosférica y Partículas de Textura (Cero Absoluto)
 */

export class ParticleSystem {
  constructor(maxParticles = 350) {
    this.maxParticles = maxParticles;
    this.particles = [];
  }

  init(p) {
    this.particles = [];
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push({
        x: p.random(p.width),
        y: p.random(p.height),
        size: p.random(0.8, 2.5),
        speedY: p.random(0.5, 2.5),
        alpha: p.random(30, 180),
        density: p.random(0.001, 0.01),
      });
    }
  }

  draw(p, record, stress) {
    let wind = record.wind_speed_180m || 10;
    let precip = record.precipitation_probability || 0;
    let humidity = record.relative_humidity_2m || 50;

    let activeCount = p.floor(p.map(precip, 0, 100, 80, this.maxParticles));

    for (let i = 0; i < activeCount; i++) {
      let pt = this.particles[i];

      // Ruido cinemático de movimiento
      let n = p.noise(
        pt.x * pt.density,
        pt.y * pt.density,
        p.frameCount * 0.003,
      );
      let driftX = p.map(n, 0, 1, -1.5, 1.5) + wind * 0.08;
      let fallSpeed = pt.speedY * (1 + precip * 0.02) + stress * 1.5;

      pt.x += driftX;
      pt.y += fallSpeed;

      // Color adaptativo con tono de humedad
      let r = p.map(stress, 0, 1, 80, 255);
      let g = p.map(humidity, 30, 100, 150, 220);
      let b = p.map(stress, 0, 1, 220, 100);

      // Render de partículas tipo polvo fino de escanografía
      p.noStroke();
      p.fill(r, g, b, pt.alpha);
      p.ellipse(pt.x, pt.y, pt.size, pt.size);

      // Reinicio continuo
      if (pt.y > p.height || pt.x > p.width || pt.x < 0) {
        pt.x = p.random(p.width);
        pt.y = -10;
      }
    }
  }
}
