/**
 * CAPA: MASA TECTÓNICA (Versión MVP Final)
 * - Alta densidad de grano y micro-detalles (40% de micro-puntos en capa superior Z).
 * - Volumen masivo e impenetrable con base de puntos macro.
 * - Sin presencia de rojos en cúpulas y con puntos joya en el frente.
 */
import * as THREE from "three";
import { ColorPalette } from "../ColorPalette.js";

export class MasaTectonica {
  constructor(scene) {
    this.scene = scene;
    this.colorsTectonica = ColorPalette.getThreeColors("masaTectonica");

    this.dummy = new THREE.Object3D();
    this.init();
  }

  generateLayerClusters(config, layerIndex) {
    const clusterCount = 26;
    const clusters = [];
    const colorOffset = layerIndex * 20;

    for (let c = 0; c < clusterCount; c++) {
      const normX = (Math.random() - 0.5) * 1.9;
      const x = config.peakX + normX * (config.width / 2.0);

      const xAdjusted = normX - config.skew * (1.0 - Math.abs(normX));
      const domeCurve = Math.max(0, 1.0 - Math.pow(xAdjusted, 2.0));
      const maxMountainY = config.baseY + config.height * domeCurve;

      const y = config.baseY + Math.random() * (maxMountainY - config.baseY);

      let colorSubIndex = Math.floor(Math.random() * 20);

      if (layerIndex === 0) {
        const heightRatio = (y - config.baseY) / config.height;
        if (heightRatio > 0.18) {
          colorSubIndex = 7 + Math.floor(Math.random() * 13);
        } else {
          colorSubIndex = Math.floor(Math.random() * 7);
        }
      }

      const finalIdx = colorOffset + colorSubIndex;

      clusters.push({
        x: x,
        y: y,
        colorIdx: THREE.MathUtils.clamp(
          finalIdx,
          0,
          this.colorsTectonica.length - 1,
        ),
      });
    }

    return clusters;
  }

  getClusterColor(x, y, clusters, isMicroDetail, layerIndex) {
    let minDist = Infinity;
    let closestCluster = clusters[0];

    for (let i = 0; i < clusters.length; i++) {
      const dx = x - clusters[i].x;
      const dy = y - clusters[i].y;
      const dist = dx * dx * 0.75 + dy * dy * 1.25;

      if (dist < minDist) {
        minDist = dist;
        closestCluster = clusters[i];
      }
    }

    let finalColorIdx = closestCluster.colorIdx;

    if (isMicroDetail) {
      finalColorIdx = THREE.MathUtils.clamp(
        finalColorIdx + 1,
        0,
        this.colorsTectonica.length - 1,
      );
    }

    const baseColor = this.colorsTectonica[finalColorIdx].clone();

    // Boost por profundidad y destellos
    const layerLuminosityBoost = 1.0 + (3 - layerIndex) * 0.08;
    baseColor.multiplyScalar(layerLuminosityBoost);

    const randJoya = Math.random();
    if ((layerIndex === 0 || layerIndex === 1) && randJoya < 0.14) {
      baseColor.multiplyScalar(1.48); // Destello mineral
    } else if (isMicroDetail) {
      baseColor.multiplyScalar(1.28);
    } else if (randJoya > 0.82) {
      baseColor.multiplyScalar(0.65);
    }

    return baseColor;
  }

  init() {
    const geometry = new THREE.CircleGeometry(1.0, 14);
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.94,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const TOTAL_LAYERS = 4;

    const layerConfigs = [
      { peakX: 8, height: 46, width: 108, baseY: -38, skew: 0.18 },
      { peakX: 16, height: 54, width: 110, baseY: -36, skew: 0.28 },
      { peakX: 4, height: 62, width: 116, baseY: -34, skew: 0.15 },
      { peakX: 20, height: 72, width: 124, baseY: -32, skew: 0.32 },
    ];

    const basePointSize = 1.72;
    const minPointSizeLimit = 0.82;
    const baseCount = 3400; // Incrementado para sostener el grano fino sin perder opacidad

    const layerParticleCounts = new Array(TOTAL_LAYERS);
    let totalParticles = 0;

    for (let k = 0; k < TOTAL_LAYERS; k++) {
      const layerProgress = k / (TOTAL_LAYERS - 1);
      const calculatedScale = basePointSize * (1.0 - layerProgress * 0.28);
      const layerScale = Math.max(minPointSizeLimit, calculatedScale);

      const areaRatio = Math.pow(basePointSize / layerScale, 2.2);
      const count = Math.round(baseCount * areaRatio);

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
      const config = layerConfigs[k];
      const countForThisLayer = layerParticleCounts[k];

      const layerClusters = this.generateLayerClusters(config, k);
      const layerZ = THREE.MathUtils.lerp(-10, -26, layerProgress);
      const calculatedScale = basePointSize * (1.0 - layerProgress * 0.28);
      const currentLayerBaseScale = Math.max(
        minPointSizeLimit,
        calculatedScale,
      );

      for (let i = 0; i < countForThisLayer; i++) {
        if (particleIndex >= this.particleCount) break;

        const normX = (Math.random() - 0.5) * 2.0;
        const x = config.peakX + normX * (config.width / 2.0);

        const xAdjusted = normX - config.skew * (1.0 - Math.abs(normX));
        const domeCurve = Math.max(0, 1.0 - Math.pow(xAdjusted, 2.0));

        const primaryNoise = Math.sin(x * 0.15) * 3.5;
        const secondaryNoise = Math.cos(x * 0.38) * 2.2;
        const tertiaryNoise = Math.sin(x * 0.85) * 1.1;
        const totalAccident =
          (primaryNoise + secondaryNoise + tertiaryNoise) *
          (k === 0 ? 1.3 : 1.0);

        const maxMountainY =
          config.baseY + (config.height + totalAccident) * domeCurve;

        const hFactor = Math.pow(Math.random(), 1.02);
        const y = config.baseY + hFactor * (maxMountainY - config.baseY);

        if (y < config.baseY) continue;

        const distToEdge = Math.abs(y - maxMountainY);
        const edgeThreshold = k > 0 ? 5.8 : 4.0;
        const isNearEdge = distToEdge < edgeThreshold;

        // AUMENTO A 40% DE MICRO-DETALLE
        const isMicroDetail = Math.random() < 0.4 || isNearEdge;

        const strataWave = Math.sin(y * 0.22 + x * 0.14);

        let finalSize = currentLayerBaseScale;

        if (isMicroDetail) {
          // Puntos pequeños de detalle y grano
          const microFactor = 0.35 + Math.random() * 0.38;
          finalSize *= microFactor;
        } else {
          // Bloques macizos que sostienen el volumen
          const macroFactor = 1.12 + strataWave * 0.3 + Math.random() * 0.22;
          finalSize *= macroFactor;
        }

        // Coloca el micro-detalle ligeramente por delante para flotar sobre las masas grandes
        const z =
          layerZ + (isMicroDetail ? 0.45 : 0.0) + (Math.random() - 0.5) * 1.2;

        this.baseScales[particleIndex] = finalSize;
        this.phases[particleIndex] = Math.random() * Math.PI * 2;

        this.dummy.position.set(x, y, z);
        this.dummy.scale.set(finalSize, finalSize, 1.0);
        this.dummy.rotation.set(0, 0, 0);
        this.dummy.updateMatrix();

        this.mesh.setMatrixAt(particleIndex, this.dummy.matrix);

        const color = this.getClusterColor(
          x,
          y,
          layerClusters,
          isMicroDetail,
          k,
        );
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

      const pulse =
        Math.sin(frameCount * 0.014 + this.phases[i]) * 0.02 * (1.0 + stress);
      const currentScale = this.baseScales[i] * (1.0 + pulse);

      this.dummy.scale.set(currentScale, currentScale, 1.0);
      this.dummy.updateMatrix();

      this.mesh.setMatrixAt(i, this.dummy.matrix);
    }

    this.mesh.instanceMatrix.needsUpdate = true;
  }
}
