/**
 * CAPA 3: MASA TECTÓNICA (Los Cerros Orientales de Bogotá)
 * Corregido: Perfil horizontal extendido, cadena montañosa suave y bordes desgranados.
 */
import * as THREE from "three";
import { ArtDirection } from "../ArtDirection.js";
import { ColorPalette } from "../ColorPalette.js";

export class MasaTectonica {
  constructor(scene) {
    this.scene = scene;
    this.config = ArtDirection.masaTectonica;
    this.colors = ColorPalette.getThreeColors("masaTectonica");

    this.particleCount = 6500;
    this.dummy = new THREE.Object3D();

    this.initPositions = [];
    this.rotations = new Float32Array(this.particleCount);
    this.baseScales = new Float32Array(this.particleCount);

    this.init();
  }

  /**
   * Perfil de Cordillera Horizontal Continua (de lado a lado)
   */
  getHillProfile(x) {
    // Pico principal desplazado sutilmente a la derecha + pico secundario suave a la izquierda
    const mainRidge = Math.exp(-Math.pow((x - 15) / 50, 2)) * 48;
    const secondaryRidge = Math.exp(-Math.pow((x + 40) / 45, 2)) * 32;
    const undulatingGround = Math.sin(x * 0.05) * 6;

    // Altura base que se mantiene a lo largo de todo X
    return mainRidge + secondaryRidge + undulatingGround - 5;
  }

  init() {
    const shape = new THREE.Shape();
    shape.absellipse(0, 0, 0.9, 0.6, 0, Math.PI * 2, false, 0);

    const geometry = new THREE.ShapeGeometry(shape, 8);
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    this.mesh = new THREE.InstancedMesh(geometry, material, this.particleCount);

    for (let i = 0; i < this.particleCount; i++) {
      // Extensión horizontal ancha para cruzar la pantalla (-100 a 100)
      const x = THREE.MathUtils.lerp(-100, 100, Math.random());
      const z = THREE.MathUtils.lerp(-60, -10, Math.random());

      const maxY = this.getHillProfile(x);

      // Asentado desde el fondo (-50) hasta la cresta ondulada
      const y = THREE.MathUtils.lerp(-50, maxY, Math.pow(Math.random(), 1.15));

      // Escala contenida para mejor definición de masa
      const size = 0.85 + Math.random() * 1.15;
      const rotZ = Math.random() * Math.PI;

      this.initPositions.push({ x, y, z });
      this.rotations[i] = rotZ;
      this.baseScales[i] = size;

      this.dummy.position.set(x, y, z);
      this.dummy.scale.set(size, size * (0.6 + Math.random() * 0.4), 1.0);
      this.dummy.rotation.set(-Math.PI * 0.1, 0, rotZ);
      this.dummy.updateMatrix();

      this.mesh.setMatrixAt(i, this.dummy.matrix);

      // Color por profundidad en Z y gradiente de sombra
      const depthRatio = (z - -60) / (-10 - -60);
      const colorIndex =
        Math.floor(depthRatio * this.colors.length) % this.colors.length;
      this.mesh.setColorAt(i, this.colors[colorIndex]);
    }

    this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;

    this.scene.add(this.mesh);
  }

  update(stress, frameCount, isSnap = false) {
    if (isSnap || stress > 0.55) {
      const jitter = isSnap ? 0.6 : (stress - 0.55) * 0.35;

      for (let i = 0; i < this.particleCount; i++) {
        const origin = this.initPositions[i];

        this.mesh.getMatrixAt(i, this.dummy.matrix);
        this.dummy.matrix.decompose(
          this.dummy.position,
          this.dummy.quaternion,
          this.dummy.scale,
        );

        this.dummy.position.x = origin.x + (Math.random() - 0.5) * jitter;
        this.dummy.position.y = origin.y + (Math.random() - 0.5) * jitter;

        this.dummy.rotation.set(-Math.PI * 0.1, 0, this.rotations[i]);
        this.dummy.updateMatrix();
        this.mesh.setMatrixAt(i, this.dummy.matrix);
      }
      this.mesh.instanceMatrix.needsUpdate = true;
    }
  }
}
