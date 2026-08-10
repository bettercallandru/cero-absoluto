/**
 * CAPA 4: ESTRATO ATMOSFÉRICO (Ecosistema Dinámico por Datos)
 * - Oleaje Atmosférico: Turbulencia sinusoidal accionada por el viento.
 * - Condensación por Humedad: Control de opacidad, densidad y flujo descendente (orográfico).
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

    // Centros de nubes estratégicos
    this.cloudCenters = [
      { x: -50, y: 40, z: -8, radiusX: 25, radiusY: 10, baseSpeed: 1.0 },
      { x: -15, y: 46, z: 8, radiusX: 30, radiusY: 12, baseSpeed: 0.8 },
      { x: 22, y: 30, z: -15, radiusX: 22, radiusY: 9, baseSpeed: 1.2 },
      { x: 58, y: 50, z: 2, radiusX: 28, radiusY: 11, baseSpeed: 0.9 },
      { x: 2, y: 20, z: -5, radiusX: 32, radiusY: 8, baseSpeed: 1.1 },
    ];

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
      const offsetZ = (Math.random() - 0.5) * 14.0;

      const distFromCenter = Math.sqrt(
        Math.pow(offsetX / center.radiusX, 2) +
          Math.pow(offsetY / center.radiusY, 2),
      );

      const isEdge = distFromCenter > 0.65;
      const isDust = isEdge || Math.random() < 0.48;

      let size = 1.0;
      if (isDust) {
        size = 0.22 + Math.random() * 0.42;
        this.isMicroDust[i] = 1;
      } else {
        size = 0.85 + Math.random() * 1.15;
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
   * Modulador dinámico de la bruma guiado por Viento y Humedad
   * @param {number} windSpeed - Velocidad en km/h (ej: 5.0 a 35.0)
   * @param {number} humidity - Porcentaje normado (0.0 = seco, 1.0 = saturado)
   * @param {number} frameCount - Contador de fotogramas
   */
  update(windSpeed = 12.0, humidity = 0.65, frameCount = 0) {
    // 1. DINÁMICA DE HUMEDAD (Grosor y Opacidad)
    // A mayor humedad, la bruma es más opaca y las partículas se expanden suavemente
    const normHumidity = THREE.MathUtils.clamp(humidity, 0.1, 1.0);
    this.material.opacity = THREE.MathUtils.lerp(0.15, 0.48, normHumidity);

    const scaleHumidityBoost = 1.0 + (normHumidity - 0.5) * 0.35;

    // 2. DINÁMICA DE VIENTO (Oleaje y Deriva)
    const currentWind = Math.max(2.0, windSpeed);
    const speedFactor = currentWind * 0.0022;
    const waveAmplitude = Math.min(8.0, currentWind * 0.25); // Altura de las olas atmosféricas

    // Movimiento global de los centros
    for (let c = 0; c < this.cloudCenters.length; c++) {
      const center = this.cloudCenters[c];
      center.x += speedFactor * center.baseSpeed;

      // Movimiento descendente por la ladera si la humedad es muy alta
      if (normHumidity > 0.6) {
        center.y -= (normHumidity - 0.6) * 0.02; // Chorro de bruma ladera abajo
      } else if (center.y < 35) {
        center.y += 0.01; // Recupera altura suavemente
      }

      // Reciclaje continuo de horizonte
      if (center.x > 95) {
        center.x = -95;
        center.y = 30 + Math.random() * 25; // Reaparece en una cota variable
      }
    }

    // Actualización punto a punto (Oleaje + Micro-vibración)
    for (let i = 0; i < this.particleCount; i++) {
      const cloudIdx = this.cloudAssignments[i];
      const center = this.cloudCenters[cloudIdx];
      const offset = this.offsets[i];
      const phase = this.individualPhases[i];

      // OLEAJE SINE-WAVE (Viento ondulante de la Sabana)
      const globalWaveX = Math.sin(frameCount * 0.012 + center.x * 0.04) * 1.5;
      const globalWaveY =
        Math.cos(frameCount * 0.018 + center.x * 0.03) * waveAmplitude;

      // Micro-turbulencia individual
      const microVibe =
        Math.sin(frameCount * 0.03 + phase) * (0.2 + currentWind * 0.01);

      const x = center.x + offset.x + globalWaveX;
      const y = center.y + offset.y + globalWaveY + microVibe;
      const z = center.z + offset.z;

      // Insuflado de escala por humedad
      const currentScale = this.baseScales[i] * scaleHumidityBoost;

      this.dummy.position.set(x, y, z);
      this.dummy.scale.set(currentScale, currentScale, 1.0);
      this.dummy.rotation.set(-Math.PI * 0.06, 0, 0);
      this.dummy.updateMatrix();

      this.mesh.setMatrixAt(i, this.dummy.matrix);
    }

    this.mesh.instanceMatrix.needsUpdate = true;
  }

  /**
   * Exporta las partículas del Estrato Atmosférico / Bruma
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
        layer: "estratoAtmosferico",
      });
    }

    return data;
  }
}
