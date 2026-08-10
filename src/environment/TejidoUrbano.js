/**
 * CAPA 2: TEJIDO URBANO (Espuelas Diagonales en Espejo & Gradiente Porcentual)
 * Construye 5 capas en forma de triángulos rectángulos alternados (zig-zag).
 * Render en orden posterior-a-frontal (k=4 a k=0) para jerarquía Z real en Three.js.
 */
import * as THREE from "three";
import { ArtDirection } from "../ArtDirection.js";
import { ColorPalette } from "../ColorPalette.js";

export class TejidoUrbano {
  constructor(scene) {
    this.scene = scene;
    this.config = ArtDirection.tejidoUrbano;

    // Carga los 20 colores tipeados desde ColorPalette
    this.colors = ColorPalette.getThreeColors("tejidoUrbano");

    this.particleCount = 7500;
    this.dummy = new THREE.Object3D();

    this.baseScales = new Float32Array(this.particleCount);
    this.phases = new Float32Array(this.particleCount);

    this.init();
  }

  /**
   * Calcula la altura de la cumbre en diagonal con mayor inclinación descendente
   */
  getDiagonalRidgeY(x, layerIndex, baseY) {
    // Alternancia de pendiente: par sube a la derecha (+1), impar sube a la izquierda (-1)
    const direction = layerIndex % 2 === 0 ? 1 : -1;

    // 1. Inclinación del cateto opuesto
    const slope = 0.6;
    const linearSlope = direction * (slope * x);

    // 2. INCLINACIÓN MÁS PRONUNCIADA HACIA LA CAPA INFERIOR
    const normalizedX = x / 43;
    const peakProximity = Math.max(0, direction * normalizedX);

    // Aumentamos de -4.5 a -8.5 para inclinar con más fuerza y sellar vacíos
    const leanTilt = Math.pow(peakProximity, 1.4) * -4.5;

    // 3. Micro-ondulación orgánica
    const wave =
      Math.sin(x * 0.048 + layerIndex * 1.5) * 3.8 +
      Math.cos(x * 0.1 - layerIndex) * 1.8;

    return baseY + linearSlope + leanTilt + wave;
  }

  /**
   * Mapea el índice cromático según la matriz de porcentajes de la capa k
   */
  getLayerColorIndex(layerIndex, tLocal) {
    // Rangos de la paleta [minIdx, maxIdx] asignados a cada capa según la matriz:
    // Capa 0: [0, 6]   -> 80% Rojo / 20% Ocre
    // Capa 1: [0, 11]  -> 50% Rojo / 40% Ocre / 10% Verde
    // Capa 2: [3, 14]  -> 20% Rojo / 50% Ocre / 30% Verde
    // Capa 3: [7, 18]  -> 5%  Rojo / 35% Ocre / 60% Verde
    // Capa 4: [12, 19] -> 0%  Rojo / 15% Ocre / 85% Verde
    const layerRanges = [
      [0, 6], // Capa 0 (Base terrenal)
      [0, 11], // Capa 1
      [3, 14], // Capa 2 (Centro)
      [7, 18], // Capa 3
      [12, 19], // Capa 4 (Cúspide / Encuentro Tectónico)
    ];

    const [minIdx, maxIdx] = layerRanges[layerIndex];

    // Mapeo dentro del rango de la capa (tLocal: 0 = base del triángulo, 1 = cumbre)
    let idx = Math.floor(THREE.MathUtils.lerp(minIdx, maxIdx, tLocal));

    // Micro-variación de pigmento (±1 tono)
    idx += Math.floor((Math.random() - 0.5) * 2.2);

    return THREE.MathUtils.clamp(idx, 0, this.colors.length - 1);
  }

  init() {
    const geometry = new THREE.CircleGeometry(1.0, 16);
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.88,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    this.mesh = new THREE.InstancedMesh(geometry, material, this.particleCount);

    const TOTAL_LAYERS = 5;
    const particlesPerLayer = Math.floor(this.particleCount / TOTAL_LAYERS);

    // Alturas base para los 5 estratos
    const baseHeights = [-40, -37, -27, -24, -20];

    let particleIndex = 0;

    // DIBUJO BACK-TO-FRONT: desde la Capa 4 (Fondo/Arriba) hasta la Capa 0 (Frente/Abajo)
    for (let k = TOTAL_LAYERS - 1; k >= 0; k--) {
      const layerProgress = k / (TOTAL_LAYERS - 1); // 1.0 (Fondo) -> 0.0 (Primer plano)
      const baseY = baseHeights[k];

      for (let i = 0; i < particlesPerLayer; i++) {
        if (particleIndex >= this.particleCount) break;

        // 1. Posición Horizontal X (Masa central con desgranado a bordes)
        const xFactor = (Math.random() + Math.random() - 1) * 0.5;
        const x = xFactor * 86;

        // 2. Geometría de Triángulo Rectángulo (Ladera Diagonal)
        const ridgeY = this.getDiagonalRidgeY(x, k, baseY);

        // La falda del triángulo desciende para traslaparse con la capa inferior
        const triangleBaseY = baseY - 6.0; // Un poco más ajustado a la base
        const maxLaderaHeight = Math.max(1.0, ridgeY - triangleBaseY);

        // Concentración de partículas densas en la cuenca, dispersándose a la cumbre
        const hFactor = Math.pow(Math.random(), 1.3);
        const y = triangleBaseY + hFactor * maxLaderaHeight;

        // Coordenada Z real (K=0 al frente Z=+10, K=4 al fondo Z=-10)
        const z =
          THREE.MathUtils.lerp(10, -10, layerProgress) +
          (Math.random() - 0.5) * 1.5;

        // 3. Color Local por Ladera
        const tLocal = THREE.MathUtils.clamp(
          (y - triangleBaseY) / maxLaderaHeight,
          0,
          1,
        );
        const colorIndex = this.getLayerColorIndex(k, tLocal);

        // 4. Escorzo de Perspectiva Atmosférica
        // Las capas lejanas (k=4) son hasta un 45% más pequeñas
        const distanceScale = 1.0 - layerProgress * 0.45;
        let size;
        const randType = Math.random();

        if (randType < 0.12) {
          size = (2.2 + Math.random() * 1.2) * distanceScale; // Partículas base
        } else if (randType < 0.68) {
          size = (1.0 + Math.random() * 0.6) * distanceScale; // Cuerpo principal
        } else {
          size = (0.28 + Math.random() * 0.35) * distanceScale; // Puntos finos
        }

        this.baseScales[particleIndex] = size;
        this.phases[particleIndex] = Math.random() * Math.PI * 2;

        // Matriz de Transformación
        this.dummy.position.set(x, y, z);
        this.dummy.scale.set(size, size, 1.0);
        this.dummy.rotation.set(-Math.PI * 0.08, 0, 0);
        this.dummy.updateMatrix();

        this.mesh.setMatrixAt(particleIndex, this.dummy.matrix);

        // Asignación Cromática
        const color = this.colors[colorIndex];
        this.mesh.setColorAt(particleIndex, color);

        particleIndex++;
      }
    }

    this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;

    this.scene.add(this.mesh);
  }

  update(stress, frameCount) {
    for (let i = 0; i < this.particleCount; i++) {
      this.mesh.getMatrixAt(i, this.dummy.matrix);
      this.dummy.matrix.decompose(
        this.dummy.position,
        this.dummy.quaternion,
        this.dummy.scale,
      );

      // Respiración sutil
      const pulse =
        Math.sin(frameCount * 0.016 + this.phases[i]) * 0.03 * (1.0 + stress);
      const currentScale = this.baseScales[i] * (1.0 + pulse);

      this.dummy.scale.set(currentScale, currentScale, 1.0);
      this.dummy.updateMatrix();

      this.mesh.setMatrixAt(i, this.dummy.matrix);
    }

    this.mesh.instanceMatrix.needsUpdate = true;
  }
}
