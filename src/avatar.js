// src/avatar.js
import * as THREE from "three";

export class AvatarEngine {
  constructor() {
    this.particlesCount = 35;
    this.particlePositions = new Float32Array(this.particlesCount * 3);
    this.particleVelocities = [];

    for (let i = 0; i < this.particlesCount; i++) {
      this.particlePositions[i * 3] = (Math.random() - 0.5) * 8;
      this.particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 8 - 4;
      this.particlePositions[i * 3 + 2] = 0.2;

      this.particleVelocities.push({
        x: (Math.random() - 0.5) * 0.05,
        y: Math.random() * 0.08 + 0.02,
      });
    }
  }

  /**
   * Genera un desplazamiento tembloroso (jitter) proporcional al estrés
   */
  applyJitter(x, y, index, stress, frameCount) {
    if (stress < 0.05) return { x, y };

    const freq = frameCount * 0.25 + index * 1.7;
    const amp = stress * 0.35; // Intensidad del temblor
    const jitterX = (Math.sin(freq) + Math.cos(freq * 1.3)) * amp;
    const jitterY = (Math.cos(freq * 0.9) + Math.sin(freq * 1.5)) * amp;

    return { x: x + jitterX, y: y + jitterY };
  }

  /**
   * Silueta principal de la Túnica Arrodillada estilo GRIS
   */
  getTunicPath(stress, frameCount) {
    const rawPoints = [
      // Cuello / Hombro alto
      { x: -0.8, y: 5.5 },
      { x: 0.2, y: 5.2 },
      // Espalda y caída fluida de la manta
      { x: 1.5, y: 3.0 },
      { x: 3.2, y: 0.0 },
      { x: 5.8, y: -3.2 },
      { x: 7.2, y: -4.8 }, // Arrastre en suelo (derecha)
      // Base apoyada en el suelo
      { x: 4.0, y: -5.0 },
      { x: 0.0, y: -5.0 },
      { x: -2.8, y: -4.8 }, // Rodilla apoya (base izquierda)
      // Vientre y pecho subiendo hacia la barbilla
      { x: -2.2, y: -1.8 },
      { x: -1.5, y: 1.8 },
      { x: -1.2, y: 4.2 },
    ];

    return rawPoints.map((p, i) => {
      const j = this.applyJitter(p.x, p.y, i, stress, frameCount);
      return new THREE.Vector2(j.x, j.y);
    });
  }

  /**
   * Cabeza y Cabello Estilizado Inclinado
   */
  getHeadPath(stress, frameCount) {
    const rawPoints = [
      { x: -0.8, y: 5.6 }, // Nuca
      { x: -0.2, y: 6.8 }, // Coronilla alta
      { x: 0.9, y: 6.5 }, // Cabello posterior
      { x: 1.1, y: 5.5 }, // Caída de mecha
      { x: 0.4, y: 4.8 }, // Rostro oculta/inclinado
      { x: -0.6, y: 5.0 }, // Barbilla
    ];

    return rawPoints.map((p, i) => {
      const j = this.applyJitter(p.x, p.y, i + 20, stress, frameCount);
      return new THREE.Vector2(j.x, j.y);
    });
  }

  /**
   * Pliegue Diagonal del Brazo Recogido
   */
  getArmPath(stress, frameCount) {
    const rawPoints = [
      { x: -0.6, y: 2.8 },
      { x: 1.2, y: -0.2 },
      { x: 3.2, y: -3.8 },
    ];

    return rawPoints.map((p, i) => {
      const j = this.applyJitter(p.x, p.y, i + 40, stress, frameCount);
      return new THREE.Vector3(j.x, j.y, 0.1);
    });
  }

  /**
   * Forma Vectorial de Corazón Bézier 2D
   */
  getHeartShape() {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.25);
    shape.bezierCurveTo(0, 0.45, -0.4, 0.7, -0.65, 0.35);
    shape.bezierCurveTo(-0.65, 0.05, -0.35, -0.3, 0, -0.65);
    shape.bezierCurveTo(0.35, -0.3, 0.65, 0.05, 0.65, 0.35);
    shape.bezierCurveTo(0.4, 0.7, 0, 0.45, 0, 0.25);
    return shape;
  }

  /**
   * Actualiza las motas de grafito que flotan por la tensión
   */
  updateParticles(stress) {
    for (let i = 0; i < this.particlesCount; i++) {
      if (i / this.particlesCount < stress) {
        // Mover hacia arriba
        this.particlePositions[i * 3 + 1] +=
          this.particleVelocities[i].y * (1 + stress);
        this.particlePositions[i * 3] +=
          this.particleVelocities[i].x *
          Math.sin(this.particlePositions[i * 3 + 1]);

        // Reiniciar si sube demasiado
        if (this.particlePositions[i * 3 + 1] > 8.0) {
          this.particlePositions[i * 3 + 1] = -5.0;
          this.particlePositions[i * 3] = (Math.random() - 0.5) * 6;
        }
      } else {
        // Ocultar partícula bajo el suelo
        this.particlePositions[i * 3 + 1] = -20;
      }
    }
    return this.particlePositions;
  }

  updateFrameData(stress, frameCount) {
    const tunicPoints = this.getTunicPath(stress, frameCount);
    const headPoints = this.getHeadPath(stress, frameCount);
    const armPoints = this.getArmPath(stress, frameCount);
    const particles = this.updateParticles(stress);

    // Latido orgánico del corazón
    const heartPulse = Math.sin(frameCount * (0.06 + stress * 0.12)) * 0.25;
    const heart = {
      position: { x: -0.3, y: 1.8, z: 0.15 },
      radius: 0.9 + heartPulse,
      intensidad: 1.0 + stress * 1.5,
    };

    return {
      tunicPoints,
      headPoints,
      armPoints,
      particles,
      heart,
      stressFactor: stress,
    };
  }
}
