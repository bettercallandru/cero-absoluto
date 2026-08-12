/**
 * CAPA 4: ESTRATO ATMOSFÉRICO (Ecosistema Dinámico por Datos)
 * - Oscilación Pendular con Fase Continua (Sin saltos de teletransporte al cambiar datos).
 * - Moduladores en tiempo real de velocidad por viento y opacidad por humedad.
 * - Grano y micro-vibración Browniana viva en partículas deshilachadas.
 */
import * as THREE from "three";
import { ArtDirection } from "../ArtDirection.js";
import { ColorPalette } from "../ColorPalette.js";

export class EstratoAtmosferico {
  constructor(scene) {
    this.scene = scene;
    this.config = ArtDirection.estratoAtmosferico;
    this.colors = ColorPalette.getThreeColors("estratoAtmosferico");

    this.particleCount = 5200;
    this.dummy = new THREE.Object3D();

    // Centros de nubes con movimiento pendular y fase individual
    this.cloudCenters = [
      {
        originX: -4,
        y: 38,
        z: -4,
        radiusX: 18,
        radiusY: 8,
        rangeX: 7,
        speed: 0.005,
        phase: 0.0,
      },
      {
        originX: 4,
        y: 44,
        z: 4,
        radiusX: 20,
        radiusY: 9,
        rangeX: 6,
        speed: 0.004,
        phase: 1.5,
      },
      {
        originX: -2,
        y: 30,
        z: -6,
        radiusX: 16,
        radiusY: 7,
        rangeX: 8,
        speed: 0.006,
        phase: 3.0,
      },
      {
        originX: 5,
        y: 48,
        z: 2,
        radiusX: 19,
        radiusY: 8,
        rangeX: 5,
        speed: 0.003,
        phase: 4.2,
      },
      {
        originX: 0,
        y: 22,
        z: -2,
        radiusX: 22,
        radiusY: 7,
        rangeX: 7,
        speed: 0.005,
        phase: 2.1,
      },
    ];

    // Asignamos posición inicial y estado de fase continua
    this.cloudCenters.forEach((center) => {
      center.x = center.originX;
      center.currentPhase = center.phase; // Se usará como acumulador fluido
    });

    this.offsets = [];
    this.baseScales = new Float32Array(this.particleCount);
    this.cloudAssignments = new Uint8Array(this.particleCount);
    this.isMicroDust = new Uint8Array(this.particleCount);
    this.individualPhases = new Float32Array(this.particleCount);

    this.init();
  }

  init() {
    const geometry = new THREE.CircleGeometry(1.0, 12);
    this.material = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.32,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    this.mesh = new THREE.InstancedMesh(
      geometry,
      this.material,
      this.particleCount,
    );

    for (let i = 0; i < this.particleCount; i++) {
      const cloudIdx = i % this.cloudCenters.length;
      const center = this.cloudCenters[cloudIdx];

      const angle = Math.random() * Math.PI * 2;
      const radFactor = Math.pow(Math.random(), 1.25);

      const offsetX = Math.cos(angle) * (radFactor * center.radiusX);
      const offsetY = Math.sin(angle) * (radFactor * center.radiusY);
      const offsetZ = (Math.random() - 0.5) * 10.0;

      const distFromCenter = Math.sqrt(
        Math.pow(offsetX / center.radiusX, 2) +
          Math.pow(offsetY / center.radiusY, 2),
      );

      const isEdge = distFromCenter > 0.65;
      const isDust = isEdge || Math.random() < 0.48;

      let size = 1.0;
      if (isDust) {
        size = 0.2 + Math.random() * 0.4;
        this.isMicroDust[i] = 1;
      } else {
        size = 0.8 + Math.random() * 1.1;
        this.isMicroDust[i] = 0;
      }

      this.cloudAssignments[i] = cloudIdx;
      this.offsets.push({ x: offsetX, y: offsetY, z: offsetZ });
      this.baseScales[i] = size;
      this.individualPhases[i] = Math.random() * Math.PI * 2;

      const x = center.x + offsetX;
      const y = center.y + offsetY;
      const z = center.z + offsetZ + (isDust ? 0.35 : 0.0);

      this.dummy.position.set(x, y, z);
      this.dummy.scale.set(size, size, 1.0);
      this.dummy.rotation.set(-Math.PI * 0.06, 0, 0);
      this.dummy.updateMatrix();

      this.mesh.setMatrixAt(i, this.dummy.matrix);

      const colorBase = this.colors[i % this.colors.length].clone();
      if (isDust) colorBase.multiplyScalar(1.22);

      this.mesh.setColorAt(i, colorBase);
    }

    this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;

    this.scene.add(this.mesh);
  }

  /**
   * Modulador dinámico guiado por Viento y Humedad
   * @param {number} windSpeed - Velocidad del viento en km/h
   * @param {number} humidity - Porcentaje normado (0.0 a 1.0)
   * @param {number} frameCount - Contador de fotogramas
   */
  update(windSpeed = 12.0, humidity = 0.65, frameCount = 0) {
    // 1. DINÁMICA DE HUMEDAD (Grosor y Opacidad)
    const normHumidity = THREE.MathUtils.clamp(humidity, 0.1, 1.0);
    this.material.opacity = THREE.MathUtils.lerp(0.15, 0.48, normHumidity);

    const scaleHumidityBoost = 1.0 + (normHumidity - 0.5) * 0.35;

    // 2. DINÁMICA DE VIENTO (Modifica el ritmo de avance sin saltos de fase)
    const currentWind = Math.max(2.0, windSpeed);
    const windMultiplier = Math.max(0.5, currentWind / 12.0);
    const waveAmplitude = Math.min(6.0, currentWind * 0.2);

    // MOVIMIENTO PENDULAR CON INTEGRACIÓN CONTINUA DE FASE
    for (let c = 0; c < this.cloudCenters.length; c++) {
      const center = this.cloudCenters[c];

      // Sumamos al estado acumulado en lugar de recalcular desde el frame cero
      center.currentPhase += center.speed * windMultiplier;

      // Posición X calculada suavemente desde la fase continua
      center.x = center.originX + Math.sin(center.currentPhase) * center.rangeX;

      // Descenso/Ascenso sutil por humedad (Ladera abajo)
      if (normHumidity > 0.6) {
        center.y -= (normHumidity - 0.6) * 0.01;
      } else if (center.y < 35) {
        center.y += 0.005;
      }
    }

    // Actualización punto a punto de las partículas
    for (let i = 0; i < this.particleCount; i++) {
      const cloudIdx = this.cloudAssignments[i];
      const center = this.cloudCenters[cloudIdx];
      const offset = this.offsets[i];
      const phase = this.individualPhases[i];

      // Oleaje vertical dinámico (Onda suave)
      const globalWaveX = Math.sin(frameCount * 0.012 + center.x * 0.04) * 1.2;
      const globalWaveY =
        Math.cos(frameCount * 0.018 + center.x * 0.03) * waveAmplitude;

      // Micro-turbulencia individual
      const microVibe =
        Math.sin(frameCount * 0.03 + phase) * (0.18 + currentWind * 0.008);

      const x = center.x + offset.x + globalWaveX;
      const y = center.y + offset.y + globalWaveY + microVibe;
      const z = center.z + offset.z;

      const currentScale = this.baseScales[i] * scaleHumidityBoost;

      this.dummy.position.set(x, y, z);
      this.dummy.scale.set(currentScale, currentScale, 1.0);
      this.dummy.rotation.set(-Math.PI * 0.06, 0, 0);
      this.dummy.updateMatrix();

      this.mesh.setMatrixAt(i, this.dummy.matrix);
    }

    this.mesh.instanceMatrix.needsUpdate = true;
  }

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
        layer: "estratoAtmosferico",
      });
    }

    return data;
  }
}
