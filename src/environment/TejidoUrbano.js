/**
 * CAPA 2: TEJIDO URBANO (Revisión Final de Textura y Dinamismo)
 * - Hipotenusa diagonal limpia sin olas/crespas antinaturales.
 * - Deshilachado rico en toda la ladera superior (Hipotenusa).
 * - Alta variación de escalas (Micro-puntos de grano / Macro de volumen).
 */
import * as THREE from "three";
import { ArtDirection } from "../ArtDirection.js";
import { ColorPalette } from "../ColorPalette.js";

export class TejidoUrbano {
  constructor(scene) {
    this.scene = scene;
    this.config = ArtDirection.tejidoUrbano;

    this.colors = ColorPalette.getThreeColors("tejidoUrbano");

    this.dummy = new THREE.Object3D();
    this.init();
  }

  /**
   * Hipotenusa diagonal pura con micro-rugosidad (sin olas ni crestas marcadas)
   */
  getDiagonalRidgeY(x, layerIndex, baseY) {
    const direction = layerIndex % 2 === 0 ? 1 : -1;

    // 1. Inclinación diagonal suave de la ladera
    const slope = 0.52;
    const linearSlope = direction * (slope * x);

    // 2. Micro-rugosidad de grano (evitamos senos de baja frecuencia que crean "olas")
    const microRuggedness =
      Math.sin(x * 0.45 + layerIndex) * 1.1 + Math.cos(x * 0.9) * 0.6;

    // 3. Leve atenuación suave al acercarse a los extremos
    const edgeDrop = Math.pow(Math.abs(x) / 46, 2.0) * -1.8;

    return baseY + linearSlope + microRuggedness + edgeDrop;
  }

  getLayerColorIndex(layerIndex, tLocal, x, y) {
    const layerRanges = [
      [0, 6], // Capa 0
      [0, 11], // Capa 1
      [3, 14], // Capa 2
      [7, 18], // Capa 3
      [12, 19], // Capa 4
    ];

    const [minIdx, maxIdx] = layerRanges[layerIndex];

    const noiseShift = Math.sin(x * 0.15 + y * 0.2) * 0.12;
    const adjustedT = THREE.MathUtils.clamp(tLocal + noiseShift, 0, 1);

    let idx = Math.floor(THREE.MathUtils.lerp(minIdx, maxIdx, adjustedT));
    idx += Math.floor((Math.random() - 0.5) * 2.2);

    return THREE.MathUtils.clamp(idx, 0, this.colors.length - 1);
  }

  init() {
    const geometry = new THREE.CircleGeometry(1.0, 14);
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.91,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const TOTAL_LAYERS = 5;

    // Alturas imbricadas de base
    const baseHeights = [-32, -30, -26, -22, -18];

    const basePointSize = 1.75;
    const minPointSizeLimit = 0.7;
    const baseCountPerLayer = 1700; // Incrementado para sostener los micro-puntos sin perder opacidad

    const layerParticleCounts = new Array(TOTAL_LAYERS);
    let totalParticles = 0;

    for (let k = 0; k < TOTAL_LAYERS; k++) {
      const layerProgress = k / (TOTAL_LAYERS - 1);
      const calculatedScale = basePointSize * (1.0 - layerProgress * 0.35);
      const layerScale = Math.max(minPointSizeLimit, calculatedScale);

      const areaRatio = Math.pow(basePointSize / layerScale, 1.98);
      const count = Math.round(baseCountPerLayer * areaRatio);

      layerParticleCounts[k] = count;
      totalParticles += count;
    }

    this.particleCount = totalParticles;
    this.mesh = new THREE.InstancedMesh(geometry, material, this.particleCount);

    this.baseScales = new Float32Array(this.particleCount);
    this.phases = new Float32Array(this.particleCount);

    let particleIndex = 0;

    for (let k = TOTAL_LAYERS - 1; k >= 0; k--) {
      const layerProgress = k / (TOTAL_LAYERS - 1);
      const baseY = baseHeights[k];
      const countForThisLayer = layerParticleCounts[k];

      const layerZ = THREE.MathUtils.lerp(8, -12, layerProgress);
      const calculatedScale = basePointSize * (1.0 - layerProgress * 0.35);
      const currentLayerBaseScale = Math.max(
        minPointSizeLimit,
        calculatedScale,
      );

      for (let i = 0; i < countForThisLayer; i++) {
        if (particleIndex >= this.particleCount) break;

        const xFactor = (Math.random() + Math.random() - 1) * 0.5;
        const x = xFactor * 88;

        const ridgeY = this.getDiagonalRidgeY(x, k, baseY);
        const triangleBaseY = baseY - (k === 0 ? 7.0 : 10.0);
        const maxLaderaHeight = Math.max(2.0, ridgeY - triangleBaseY);

        // Permite que algunos puntos superen ligeramente la ridgeY para deshilachar la hipotenusa
        const hFactor = Math.pow(Math.random(), 1.05) * 1.08;
        const y = triangleBaseY + hFactor * maxLaderaHeight;

        const tLocal = THREE.MathUtils.clamp(
          (y - triangleBaseY) / maxLaderaHeight,
          0,
          1,
        );

        // --- DISTANCIA A LA HIPOTENUSA Y ZONA DE DESHILACHADO ---
        const distToHypotenuse = Math.abs(y - ridgeY);
        const isNearHypotenuse = distToHypotenuse < 5.5; // Franja amplia en la ladera superior

        // RANGOS HETEROGÉNEOS DE TAMAÑO (Macro / Medio / Micro)
        const randSize = Math.random();
        let finalSize = currentLayerBaseScale;
        let isMicroDetail = false;

        if (isNearHypotenuse && Math.random() < 0.65) {
          // Deshilachado activo en la hipotenusa
          isMicroDetail = true;
          finalSize *= 0.28 + Math.random() * 0.35;
        } else if (randSize < 0.35) {
          // Puntos micro/grano repartidos en el cuerpo
          isMicroDetail = true;
          finalSize *= 0.35 + Math.random() * 0.3;
        } else if (randSize < 0.8) {
          // Puntos medios de estructura
          finalSize *= 0.85 + Math.random() * 0.35;
        } else {
          // Bloques macro de fondo
          finalSize *= 1.2 + Math.random() * 0.4;
        }

        // Puntos de textura/deshilachado flotan ligeramente hacia adelante en Z
        const z =
          layerZ + (isMicroDetail ? 0.42 : 0.0) + (Math.random() - 0.5) * 1.0;

        this.baseScales[particleIndex] = finalSize;
        this.phases[particleIndex] = Math.random() * Math.PI * 2;

        this.dummy.position.set(x, y, z);
        this.dummy.scale.set(finalSize, finalSize, 1.0);
        this.dummy.rotation.set(-Math.PI * 0.06, 0, 0);
        this.dummy.updateMatrix();

        this.mesh.setMatrixAt(particleIndex, this.dummy.matrix);

        // LUMINOSIDAD Y PUNTOS JOYA
        const colorIndex = this.getLayerColorIndex(k, tLocal, x, y);
        const baseColor = this.colors[colorIndex].clone();

        const layerLuminosityBoost = 1.0 + (4 - k) * 0.07;
        baseColor.multiplyScalar(layerLuminosityBoost);

        const randJoya = Math.random();
        if ((k === 0 || k === 1) && randJoya < 0.15) {
          baseColor.multiplyScalar(1.45); // Punto Joya deslumbrante
        } else if (isMicroDetail) {
          baseColor.multiplyScalar(1.22);
        } else if (randJoya > 0.82) {
          baseColor.multiplyScalar(0.7);
        }

        this.mesh.setColorAt(particleIndex, baseColor);

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

      const pulse =
        Math.sin(frameCount * 0.016 + this.phases[i]) * 0.025 * (1.0 + stress);
      const currentScale = this.baseScales[i] * (1.0 + pulse);

      this.dummy.scale.set(currentScale, currentScale, 1.0);
      this.dummy.updateMatrix();

      this.mesh.setMatrixAt(i, this.dummy.matrix);
    }

    this.mesh.instanceMatrix.needsUpdate = true;
  }

  /**
   * Exporta la matriz de partículas para que la BaseRefractaria o sceneContext
   * puedan realizar el muestreo óptico del espejo.
   */
  getParticlesData() {
    const data = [];
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const color = new THREE.Color();

    for (let i = 0; i < this.particleCount; i++) {
      this.mesh.getMatrixAt(i, matrix);
      position.setFromMatrixPosition(matrix);
      this.mesh.getColorAt(i, color);

      data.push({
        x: position.x,
        y: position.y,
        z: position.z,
        color: color.clone(),
        layer: "tejidoUrbano",
      });
    }

    return data;
  }
}
