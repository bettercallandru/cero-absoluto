/**
 * CAPA 1: BASE REFRACTARIA (Charcos Puntillistas Refractarios)
 * - Estanques/Charcos orgánicos delimitados ubicados estrictamente debajo del Tejido Urbano.
 * - Círculos puros (escala 1:1) manteniendo la técnica puntillista de la escena.
 * - Puntos base grandes en tonos Agua/Azul Pizarra + Puntos de detalle pequeños
 *   superpuestos que reflejan los tonos cálidos del Tejido Urbano.
 */
import * as THREE from "three";
import { ArtDirection } from "../ArtDirection.js";

export class BaseRefractaria {
  constructor(scene, sceneContext = null) {
    this.scene = scene;
    this.config = ArtDirection.baseRefractaria;
    this.sceneContext = sceneContext;

    this.particleCount = 1800; // Densidad enfocada en los cuerpos de agua
    this.dummy = new THREE.Object3D();

    this.basePositions = [];
    this.baseScales = new Float32Array(this.particleCount);
    this.phases = new Float32Array(this.particleCount);

    // Paleta de Agua/Asfalto Húmedo (Azul pizarra, petróleo y noche)
    this.waterPalette = [
      new THREE.Color(0x283e4a),
      new THREE.Color(0x1e2f38),
      new THREE.Color(0x3a5a6a),
      new THREE.Color(0x233742),
    ];

    // Definición estratégica de 3 charcos independientes (Centros en X y Anchos)
    this.puddles = [
      { centerX: -22.0, width: 18.0 },
      { centerX: 2.0, width: 22.0 },
      { centerX: 26.0, width: 14.0 },
    ];

    this.init();
  }

  /**
   * Muestrea únicamente la primera capa del Tejido Urbano (rojos/naranjas)
   */
  sampleUrbanColor(x) {
    if (
      !this.sceneContext ||
      !this.sceneContext.urban ||
      this.sceneContext.urban.length === 0
    ) {
      return new THREE.Color(0xd33f21); // Fallback Tejido Urbano
    }

    const searchRadiusX = 4.0;
    const candidates = this.sceneContext.urban.filter(
      (p) => Math.abs(p.x - x) < searchRadiusX,
    );

    if (candidates.length === 0) {
      return new THREE.Color(0xd33f21);
    }

    // Seleccionamos la partícula más cercana horizontalmente
    let bestCandidate = candidates[0];
    let minDistance = Infinity;

    for (let i = 0; i < candidates.length; i++) {
      const cand = candidates[i];
      const dist = Math.abs(cand.x - x);
      if (dist < minDistance) {
        minDistance = dist;
        bestCandidate = cand;
      }
    }

    return bestCandidate.color.clone();
  }

  init() {
    // 1. Geometría: Círculos puros de 12 segmentos
    const geometry = new THREE.CircleGeometry(0.5, 12);

    this.material = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    this.mesh = new THREE.InstancedMesh(
      geometry,
      this.material,
      this.particleCount,
    );

    // 2. Cota Límite Inferior (Debajo de Y_min del Tejido Urbano)
    const yTopLimit = -45.5; // Ninguna partícula sube de esta altura
    const puddleDepth = 7.0; // Profundidad vertical del charco

    for (let i = 0; i < this.particleCount; i++) {
      // Elegimos uno de los 3 charcos al azar
      const puddle =
        this.puddles[Math.floor(Math.random() * this.puddles.length)];

      // Distribución gaussiana/concéntrica hacia el centro del charco
      const normOffsetX = (Math.random() - 0.5) * puddle.width;
      const x = puddle.centerX + normOffsetX;

      // Y estrictamente descendente desde yTopLimit
      const normY = Math.random();
      const y = yTopLimit - normY * puddleDepth;
      const z = (Math.random() - 0.5) * 4.0;

      // 3. Jerarquía Macro vs Micro (Círculos Base Agua vs Detalle Reflejo)
      const isDetailPoint = Math.random() < 0.35; // 35% puntos de detalle reflejado
      let scale;
      let finalColor;

      if (isDetailPoint) {
        // Puntos Micro (Pequeños, superpuestos, con el color reflejado de la ciudad)
        scale = 0.3 + Math.random() * 0.4;
        finalColor = this.sampleUrbanColor(x);

        // Suavizado óptico hacia el fondo de agua
        finalColor.lerp(new THREE.Color(0x1a2730), normY * 0.4);
      } else {
        // Puntos Macro (Grandes, crean el cuerpo y la base sólida de agua del charco)
        scale = 0.8 + Math.random() * 0.9;
        finalColor =
          this.waterPalette[
            Math.floor(Math.random() * this.waterPalette.length)
          ].clone();
      }

      this.baseScales[i] = scale;
      this.basePositions.push({ x, y, z, isDetailPoint });
      this.phases[i] = Math.random() * Math.PI * 2;

      this.dummy.position.set(x, y, z);
      // Garantizamos CÍRCULOS PUROS utilizando el mismo valor en X e Y
      this.dummy.scale.set(scale, scale, 1.0);
      this.dummy.rotation.set(0, 0, 0);
      this.dummy.updateMatrix();

      this.mesh.setMatrixAt(i, this.dummy.matrix);
      this.mesh.setColorAt(i, finalColor);
    }

    this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;

    this.scene.add(this.mesh);
  }

  /**
   * Animación de vaivén líquido tenue
   */
  update(stress = 0.0, frameCount = 0) {
    for (let i = 0; i < this.particleCount; i++) {
      const pos = this.basePositions[i];
      const phase = this.phases[i];
      const baseScale = this.baseScales[i];

      // Sutil ondulación de agua
      const waveX =
        Math.sin(frameCount * 0.02 + pos.y * 0.4 + phase) *
        (0.08 + stress * 0.15);
      const waveY = Math.cos(frameCount * 0.015 + pos.x * 0.3) * 0.03;

      const currentScale =
        baseScale * (1.0 + Math.sin(frameCount * 0.025 + phase) * 0.08);

      this.dummy.position.set(pos.x + waveX, pos.y + waveY, pos.z);
      // Mantenemos proporciones circulares uniformes durante la animación
      this.dummy.scale.set(currentScale, currentScale, 1.0);
      this.dummy.updateMatrix();

      this.mesh.setMatrixAt(i, this.dummy.matrix);
    }

    this.mesh.instanceMatrix.needsUpdate = true;
  }
}
