/**
 * MÓDULO VISUAL: Niebla Atmosférica y Partículas 3D (Three.js)
 * Renderizado de partículas volumétricas aceleradas por GPU
 */

import * as THREE from "three";

export class ParticleSystem3D {
  constructor(maxParticles = 600) {
    this.maxParticles = maxParticles;
    this.bounds = { x: 500, y: 400, z: 400 };

    this.init();
  }

  init() {
    this.geometry = new THREE.BufferGeometry();
    this.positions = new Float32Array(this.maxParticles * 3);
    this.speeds = new Float32Array(this.maxParticles);
    this.densities = new Float32Array(this.maxParticles);

    for (let i = 0; i < this.maxParticles; i++) {
      const idx = i * 3;
      // Posicionamiento aleatorio en el volumen 3D
      this.positions[idx] = (Math.random() - 0.5) * this.bounds.x;
      this.positions[idx + 1] = (Math.random() - 0.5) * this.bounds.y;
      this.positions[idx + 2] = (Math.random() - 0.5) * this.bounds.z;

      this.speeds[i] = 0.5 + Math.random() * 2.0;
      this.densities[i] = 0.001 + Math.random() * 0.009;
    }

    this.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(this.positions, 3),
    );

    // Material de puntos con transparencia y mezcla aditiva
    this.material = new THREE.PointsMaterial({
      size: 2.2,
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.mesh = new THREE.Points(this.geometry, this.material);
  }

  update(record, stress, frameCount) {
    const wind = record.wind_speed_180m || 10;
    const precip = record.precipitation_probability || 0;
    const humidity = record.relative_humidity_2m || 50;

    const posAttr = this.geometry.attributes.position;
    const positions = posAttr.array;

    for (let i = 0; i < this.maxParticles; i++) {
      const idx = i * 3;

      // Turbulencia tridimensional y derivación por viento
      const driftX = Math.sin(frameCount * 0.01 + i) * 0.3 + wind * 0.06;
      const driftZ = Math.cos(frameCount * 0.01 + i * 0.5) * 0.3;
      const fallSpeed = -(this.speeds[i] * (1 + precip * 0.02) + stress * 1.5);

      positions[idx] += driftX;
      positions[idx + 1] += fallSpeed;
      positions[idx + 2] += driftZ;

      // Re-encuadre de límites (Bucle continuo en 3D)
      if (positions[idx + 1] < -this.bounds.y / 2) {
        positions[idx + 1] = this.bounds.y / 2;
        positions[idx] = (Math.random() - 0.5) * this.bounds.x;
        positions[idx + 2] = (Math.random() - 0.5) * this.bounds.z;
      }

      if (Math.abs(positions[idx]) > this.bounds.x / 2) {
        positions[idx] = -Math.sign(positions[idx]) * (this.bounds.x / 2);
      }
      if (Math.abs(positions[idx + 2]) > this.bounds.z / 2) {
        positions[idx + 2] =
          -Math.sign(positions[idx + 2]) * (this.bounds.z / 2);
      }
    }

    posAttr.needsUpdate = true;

    // Tono cromático reactivo al clima y al estrés
    const r = 0.2 + stress * 0.8;
    const g = 0.4 + (humidity / 100) * 0.4;
    const b = 0.9 - stress * 0.6;
    this.material.color.setRGB(r, g, b);
  }
}
