/**
 * MÓDULO VISUAL: Avatar con Textura de Filamentos y Entropía (Cero Absoluto)
 */

export class Avatar {
  constructor() {
    this.timeOff = 0;
    this.innerDust = [];

    // Generar polvo de textura interna
    for (let i = 0; i < 180; i++) {
      this.innerDust.push({
        angle: Math.random() * Math.PI * 2,
        distRatio: Math.random(),
        speed: 0.005 + Math.random() * 0.01,
        size: 0.8 + Math.random() * 1.5,
      });
    }
  }

  draw(p, stress, temperature) {
    p.push();
    p.translate(p.width / 2, p.height / 2);

    this.timeOff += 0.008 + stress * 0.03;

    // Colorimetría cinemática según clima y estrés
    let r = p.map(stress, 0, 1, 60, 255);
    let g = p.map(temperature, 5, 25, 180, 40);
    let b = p.map(stress, 0, 1, 240, 70);

    // --- 1. CAPA DE TEXTURA INTERNA (CENIZA / POLVO BIOLÓGICO) ---
    p.noStroke();
    for (let dust of this.innerDust) {
      dust.angle += dust.speed * (1 + stress * 2);
      let rRadius = 80 * dust.distRatio * (1 + stress * 0.4);

      let dx = rRadius * p.cos(dust.angle) * 0.7;
      let dy = rRadius * p.sin(dust.angle) * 1.6 - 20;

      // Distorsión del polvo con ruido Perlin
      let n = p.noise(dx * 0.02, dy * 0.02, this.timeOff);
      dx += p.map(n, 0, 1, -15, 15) * stress;
      dy += p.map(n, 0, 1, -15, 15) * stress;

      p.fill(r, g, b, p.map(dust.distRatio, 0, 1, 180, 20));
      p.ellipse(dx, dy, dust.size, dust.size);
    }

    // --- 2. NÚCLEO PULSANTE CON GLOW MASCARADO ---
    p.drawingContext.shadowBlur = 25 + stress * 40;
    p.drawingContext.shadowColor = `rgba(${r}, ${g}, ${b}, 0.7)`;

    let heartSize = p.map(temperature, 5, 25, 25, 50);
    let pulse =
      p.sin(p.frameCount * (0.04 + stress * 0.12)) * (8 + stress * 25);

    p.fill(r, g, b, 160);
    p.ellipse(0, -30, heartSize + pulse);
    p.drawingContext.shadowBlur = 0; // Restaurar rendimiento del canvas

    // --- 3. TEXTURA DE FILAMENTOS EXTERNO (TEXTURA DENSE/ENTRÓPICA) ---
    p.noFill();
    let strands = p.floor(p.map(stress, 0, 1, 20, 45)); // Más hilos bajo estrés

    for (let i = 0; i < strands; i++) {
      let alpha = p.map(i, 0, strands, 160, 20);
      p.stroke(r, g, b, alpha);
      p.strokeWeight(p.map(i, 0, strands, 1.2, 0.4));

      p.beginShape();
      let radiusBase = 25 + i * 3.2;

      for (let angle = 0; angle < p.TWO_PI; angle += 0.15) {
        // Coordenadas para consultar textura de ruido 3D
        let xOff = p.map(p.cos(angle), -1, 1, 0, 1.8);
        let yOff = p.map(p.sin(angle), -1, 1, 0, 1.8);

        let noiseVal = p.noise(xOff, yOff, this.timeOff + i * 0.05);

        // Deformación de textura áspera/fibrosa
        let deformation = p.map(noiseVal, 0, 1, -18, 18) * (1 + stress * 1.8);
        let currentR = radiusBase + deformation;

        // Silueta antropomórfica (Proporción vertical de torso y cabeza)
        let x = currentR * p.cos(angle) * 0.65;
        let y = currentR * p.sin(angle) * 1.5 - 20;

        // Glitch sutil en la textura de borde
        if (stress > 0.5 && p.random(1) < 0.02) {
          x += p.random(-15, 15);
        }

        p.vertex(x, y);
      }
      p.endShape(p.CLOSE);
    }

    p.pop();
  }
}
