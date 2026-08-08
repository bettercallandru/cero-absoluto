/**
 * CAPA 2: TEJIDO URBANO (Geomorfología por Valles & Perspectiva Atmósfera)
 * Implementa 20 colores, funciones de onda para pliegues de terreno y gradiente de escala/opacidad.
 */
import * as THREE from "three";
import { ArtDirection } from "../ArtDirection.js";
import { ColorPalette } from "../ColorPalette.js";

export class TejidoUrbano {
  constructor(scene) {
    this.scene = scene;
    this.config = ArtDirection.tejidoUrbano;

    // Obtenemos los 20 colores convertidos a THREE.Color
    this.colors = ColorPalette.getThreeColors("tejidoUrbano");

    this.particleCount = 6500; // Incrementamos la densidad para dar riqueza a los estratos
    this.dummy = new THREE.Object3D();

    this.baseScales = new Float32Array(this.particleCount);
    this.phases = new Float32Array(this.particleCount);

    this.init();
  }

  /**
   * Genera la curvatura de valle (Onda sinusoidal en "V") según la altura y capa
   */
  getValleyOffset(x, layerIndex) {
    const wave1 = Math.cos(x * 0.05 + layerIndex * 0.8) * 4.5;
    const wave2 = Math.sin(x * 0.1 - layerIndex) * 2.0;
    // La forma en V fuerza una cuenca hacia el centro
    const vShape = Math.pow(Math.abs(x / 45), 1.8) * 3.5;

    return wave1 + wave2 + vShape;
  }

  init() {
    const geometry = new THREE.CircleGeometry(1.0, 16);

    // Usamos Vertex Colors activados para controlar color y opacidad individual si es necesario,
    // pero manejamos la opacidad general por jerarquía
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    this.mesh = new THREE.InstancedMesh(geometry, material, this.particleCount);

    const Y_MIN = -48;
    const Y_MAX = -2;
    const totalLayers = 6; // Número de estratos de valles superpuestos

    for (let i = 0; i < this.particleCount; i++) {
      // 1. Asignación a un Estrato/Capa de Valle
      const layer = Math.floor(Math.random() * totalLayers);
      const layerProgress = layer / (totalLayers - 1); // 0.0 a 1.0 (Abajo -> Arriba)

      // 2. Coordenadas X e Y basadas en las funciones de Valle
      // Distribución horizontal X acotada al centro
      const xFactor = (Math.random() + Math.random() - 1) * 0.5;
      const x = xFactor * 85;

      // Altura base del estrato + curvatura del valle + ruido aleatorio local
      const layerBaseY = THREE.MathUtils.lerp(Y_MIN, Y_MAX - 5, layerProgress);
      const valleyShape = this.getValleyOffset(x, layer);
      const randomScatter = (Math.random() - 0.5) * (6.0 + layerProgress * 4.0);

      const y = THREE.MathUtils.clamp(
        layerBaseY + valleyShape + randomScatter,
        Y_MIN - 2,
        Y_MAX + 5,
      );
      const z = THREE.MathUtils.lerp(-10, 10, Math.random()) + layer * 0.5; // Capas superiores más atrás

      // 3. Normalización Vertical para Gradiente Cromático y Escorzo (t ∈ [0, 1])
      const t = THREE.MathUtils.clamp((y - Y_MIN) / (Y_MAX - Y_MIN), 0, 1);

      // 4. Regla de Escorzo / Perspectiva Atmosférica
      // Abajo (Cerca): Partículas más grandes. Arriba (Lejos): Puntos pequeños.
      const sizeFactor = 1.0 - t * 0.58;
      let size;
      const randType = Math.random();

      if (randType < 0.15) {
        size = (2.2 + Math.random() * 1.5) * sizeFactor; // Fondo/Madre
      } else if (randType < 0.65) {
        size = (1.0 + Math.random() * 0.8) * sizeFactor; // Cuerpo
      } else {
        size = (0.25 + Math.random() * 0.4) * sizeFactor; // Micro-puntos
      }

      this.baseScales[i] = size;
      this.phases[i] = Math.random() * Math.PI * 2;

      // Matriz de Transformación
      this.dummy.position.set(x, y, z);
      this.dummy.scale.set(size, size, 1.0);
      this.dummy.rotation.set(-Math.PI * 0.1, 0, 0);
      this.dummy.updateMatrix();

      this.mesh.setMatrixAt(i, this.dummy.matrix);

      // 5. Asignación Mapeada de los 20 Colores + Sombras de Oclusión
      // Calculamos el índice exacto en el arreglo de 20 colores
      // Mapeo t [0,1] -> Indice [0, 19]
      let colorIndex = Math.floor(t * (this.colors.length - 1));

      // Sombra de oclusión: si la partícula está muy abajo en la cuenca del valle, oscurecemos 1-2 tonos
      if (valleyShape < 1.0 && colorIndex > 1) {
        colorIndex -= Math.floor(Math.random() * 2);
      }

      colorIndex = THREE.MathUtils.clamp(colorIndex, 0, this.colors.length - 1);
      const color = this.colors[colorIndex];

      this.mesh.setColorAt(i, color);
    }

    this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;

    this.scene.add(this.mesh);
  }

  /**
   * Animación de respiración orgánica diferenciada por estrato
   */
  update(stress, frameCount) {
    for (let i = 0; i < this.particleCount; i++) {
      this.mesh.getMatrixAt(i, this.dummy.matrix);
      this.dummy.matrix.decompose(
        this.dummy.position,
        this.dummy.quaternion,
        this.dummy.scale,
      );

      // Micro-pulsación sutil
      const pulse =
        Math.sin(frameCount * 0.015 + this.phases[i]) * 0.03 * (1.0 + stress);
      const currentScale = this.baseScales[i] * (1.0 + pulse);

      this.dummy.scale.set(currentScale, currentScale, 1.0);
      this.dummy.updateMatrix();

      this.mesh.setMatrixAt(i, this.dummy.matrix);
    }

    this.mesh.instanceMatrix.needsUpdate = true;
  }
}
