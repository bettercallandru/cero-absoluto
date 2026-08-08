/**
 * CAPA 1: BASE REFRACTARIA (Asfalto Mojado, Drenaje y Reflejos)
 * Reescrito para puntillismo orgánico, óvalos estirados y alta densidad.
 */
import * as THREE from "three";
import { ArtDirection } from "../ArtDirection.js";
import { ColorPalette } from "../ColorPalette.js";

export class BaseRefractaria {
  constructor(scene) {
    this.scene = scene;
    this.config = ArtDirection.baseRefractaria;
    this.colors = ColorPalette.getThreeColors("baseRefractaria");

    // Aumento de densidad para textura puntillista fina
    this.particleCount = 4200;
    this.dummy = new THREE.Object3D();

    // Arrays para animación e individualidad
    this.speeds = new Float32Array(this.particleCount);
    this.baseY = new Float32Array(this.particleCount);
    this.rotations = new Float32Array(this.particleCount);
    this.scales = new Float32Array(this.particleCount);

    this.init();
  }

  init() {
    // Geometría ovalada/garganteada usando un Shape de 12 segmentos achatado
    const shape = new THREE.Shape();
    const radiusX = 0.25; // Delgado
    const radiusY = 0.9; // Alargado (efecto gota/chorreado)
    shape.absellipse(0, 0, radiusX, radiusY, 0, Math.PI * 2, false, 0);

    const geometry = new THREE.ShapeGeometry(shape, 8);
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.72,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    this.mesh = new THREE.InstancedMesh(geometry, material, this.particleCount);

    for (let i = 0; i < this.particleCount; i++) {
      // Distribución horizontal sobre la base proyectada
      const x = (Math.random() - 0.5) * (this.config.xWidth || 160);
      const z = (Math.random() - 0.5) * (this.config.zDepth || 80);
      const y =
        this.config.yMin +
        Math.random() * (this.config.yMax - this.config.yMin);

      this.baseY[i] = y;
      this.speeds[i] = 0.08 + Math.random() * 0.12; // Velocidades desiguales

      // Micro-rotación aleatoria para romper la rigidez perfecta (-8° a +8°)
      const rotZ = (Math.random() - 0.5) * 0.28;
      this.rotations[i] = rotZ;

      // Escala individual (puntos finos a chorreones medianos)
      const baseScale = 0.4 + Math.pow(Math.random(), 2) * 1.1;
      this.scales[i] = baseScale;

      this.dummy.position.set(x, y, z);
      this.dummy.scale.set(
        baseScale,
        baseScale * (2.2 + Math.random() * 1.8),
        1.0,
      );
      this.dummy.rotation.set(0, 0, rotZ);
      this.dummy.updateMatrix();

      this.mesh.setMatrixAt(i, this.dummy.matrix);

      // Selección aleatoria entre los 10 tonos de la paleta expandida
      const color = this.colors[i % this.colors.length];
      this.mesh.setColorAt(i, color);
    }

    this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;

    this.scene.add(this.mesh);
  }

  /**
   * Actualización de movimiento de drenaje vertical
   */
  update(stress, frameCount) {
    for (let i = 0; i < this.particleCount; i++) {
      this.mesh.getMatrixAt(i, this.dummy.matrix);
      this.dummy.matrix.decompose(
        this.dummy.position,
        this.dummy.quaternion,
        this.dummy.scale,
      );

      // Desplazamiento descendente acelerado levemente por el nivel de estrés
      const currentSpeed = this.speeds[i] * (1.0 + stress * 0.6);
      this.dummy.position.y -= currentSpeed;

      // Reciclaje continuo al llegar al fondo
      if (this.dummy.position.y < this.config.yMin) {
        this.dummy.position.y = this.config.yMax;
      }

      // Re-aplicar rotación y escala
      this.dummy.rotation.set(0, 0, this.rotations[i]);
      const baseScale = this.scales[i];
      this.dummy.scale.set(baseScale, baseScale * 2.8, 1.0);

      this.dummy.updateMatrix();
      this.mesh.setMatrixAt(i, this.dummy.matrix);
    }

    this.mesh.instanceMatrix.needsUpdate = true;
  }
}
