/**
 * CAPA 4: ESTRATO ATMOSFÉRICO (Bancos de Nubes y Bruma de Bogotá)
 * Corregido: Geometría ovalada suave (InstancedMesh), cúmulos compactos de nube y deriva.
 */
import * as THREE from "three";
import { ArtDirection } from "../ArtDirection.js";
import { ColorPalette } from "../ColorPalette.js";

export class EstratoAtmosferico {
  constructor(scene) {
    this.scene = scene;
    this.config = ArtDirection.estratoAtmosferico;
    this.colors = ColorPalette.getThreeColors("estratoAtmosferico");

    this.particleCount = 3500;
    this.dummy = new THREE.Object3D();

    // Definición de 5 grandes bancos de nubes (Focos de bruma)
    this.cloudCenters = [
      { x: -50, y: 45, z: -10, radius: 28 },
      { x: -10, y: 65, z: 10, radius: 32 },
      { x: 35, y: 38, z: -20, radius: 25 },
      { x: 60, y: 70, z: 5, radius: 30 },
      { x: 0, y: 30, z: -35, radius: 35 }, // Nube baja abrazando los cerros
    ];

    this.offsets = [];
    this.baseScales = new Float32Array(this.particleCount);
    this.cloudAssignments = new Uint8Array(this.particleCount);

    this.init();
  }

  init() {
    // Geometría de pincelada de vapor (óvalo suave)
    const shape = new THREE.Shape();
    shape.absellipse(0, 0, 1.8, 0.9, 0, Math.PI * 2, false, 0);

    const geometry = new THREE.ShapeGeometry(shape, 8);
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.22, // Muy sutil y acuarelado
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    this.mesh = new THREE.InstancedMesh(geometry, material, this.particleCount);

    for (let i = 0; i < this.particleCount; i++) {
      // Asignar partícula a un banco de nubes específico
      const cloudIdx = i % this.cloudCenters.length;
      const center = this.cloudCenters[cloudIdx];

      // Dispersión concentrada hacia el centro del banco de nube
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.pow(Math.random(), 1.6) * center.radius;

      const offsetX = Math.cos(angle) * radius;
      const offsetY = (Math.random() - 0.5) * (center.radius * 0.5);
      const offsetZ = Math.sin(angle) * radius;

      const size = 1.2 + Math.random() * 2.2;
      const rotZ = (Math.random() - 0.5) * 0.4; // Ligeras inclinaciones horizontales

      this.cloudAssignments[i] = cloudIdx;
      this.offsets.push({ x: offsetX, y: offsetY, z: offsetZ });
      this.baseScales[i] = size;

      this.dummy.position.set(
        center.x + offsetX,
        center.y + offsetY,
        center.z + offsetZ,
      );
      this.dummy.scale.set(size, size * 0.5, 1.0);
      this.dummy.rotation.set(-Math.PI * 0.08, 0, rotZ);
      this.dummy.updateMatrix();

      this.mesh.setMatrixAt(i, this.dummy.matrix);

      // Color de bruma suave
      const color = this.colors[i % this.colors.length];
      this.mesh.setColorAt(i, color);
    }

    this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;

    this.scene.add(this.mesh);
  }

  /**
   * Deriva de los bancos de nubes impulsados por el viento real de Bogotá
   */
  update(windSpeed, frameCount) {
    const currentWind = windSpeed || 10.0;
    const speedFactor = currentWind * 0.003;

    // Desplazar los centros de las nubes
    for (let c = 0; c < this.cloudCenters.length; c++) {
      this.cloudCenters[c].x += speedFactor;
      if (this.cloudCenters[c].x > 90) {
        this.cloudCenters[c].x = -90; // Reciclar la nube al horizonte izquierdo
      }
    }

    // Actualizar matriz de las partículas
    for (let i = 0; i < this.particleCount; i++) {
      const cloudIdx = this.cloudAssignments[i];
      const center = this.cloudCenters[cloudIdx];
      const offset = this.offsets[i];

      const x = center.x + offset.x;
      const y = center.y + offset.y + Math.sin(frameCount * 0.01 + i) * 0.8; // Deformación lenta
      const z = center.z + offset.z;

      this.dummy.position.set(x, y, z);
      this.dummy.scale.set(this.baseScales[i], this.baseScales[i] * 0.5, 1.0);
      this.dummy.rotation.set(-Math.PI * 0.08, 0, 0);
      this.dummy.updateMatrix();

      this.mesh.setMatrixAt(i, this.dummy.matrix);
    }

    this.mesh.instanceMatrix.needsUpdate = true;
  }
}
