import * as THREE from "three";

export class EnvironmentManager {
  constructor(scene) {
    this.scene = scene;

    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.fogParticles = null;
    this.terrainMesh = null;
    this.terrainPositionsInitial = null;
    this.floraGroup = new THREE.Group();

    this.particleCount = 1200; // Calibrado para convivir con ParticleSystem3D (700)

    this._initTerrain();
    this._initFog();
    this._initFlora();
  }

  /**
   * 1. LÁTICE TERRENO (Suelo Topográfico Deformable)
   */
  _initTerrain() {
    const size = 350; // Escalado para coordinar con la cámara a Z = 280
    const segments = 40;
    const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
    geometry.rotateX(-Math.PI / 2);

    this.terrainPositionsInitial = geometry.attributes.position.array.slice();

    const material = new THREE.MeshBasicMaterial({
      color: 0x1a1d28,
      wireframe: true,
      transparent: true,
      opacity: 0.2,
    });

    this.terrainMesh = new THREE.Mesh(geometry, material);
    this.terrainMesh.position.y = -80; // Posición adecuada bajo el avatar
    this.group.add(this.terrainMesh);
  }

  /**
   * 2. NIEBLA GASEOSA ATMOSFÉRICA (Piso / Cizallamiento)
   */
  _initFog() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.particleCount * 3);

    const radius = 180;
    const height = 80;

    for (let i = 0; i < this.particleCount; i++) {
      const r = Math.random() * radius;
      const theta = Math.random() * Math.PI * 2;

      positions[i * 3] = r * Math.cos(theta);
      positions[i * 3 + 1] = -80 + Math.random() * height; // Niebla baja
      positions[i * 3 + 2] = r * Math.sin(theta);
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    // Textura suave para partículas atmosféricas
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, "rgba(255, 255, 255, 0.6)");
    grad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      color: 0x6e8494,
      size: 4.5,
      map: texture,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.fogParticles = new THREE.Points(geometry, material);
    this.group.add(this.fogParticles);
  }

  /**
   * 3. FLORA ENDÉMICA FOSILIZADA (Frailejones Cristales)
   */
  _initFlora() {
    const positions = [
      { x: -60, z: -40 },
      { x: 70, z: -30 },
      { x: -40, z: 60 },
      { x: 50, z: 50 },
      { x: -80, z: 20 },
    ];

    positions.forEach((pos) => {
      const frailejon = this._createFrailejonStructure();
      frailejon.position.set(pos.x, -80, pos.z);
      this.floraGroup.add(frailejon);
    });

    this.group.add(this.floraGroup);
  }

  _createFrailejonStructure() {
    const group = new THREE.Group();
    const material = new THREE.MeshBasicMaterial({
      color: 0x3d4f5d,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });

    const stemGeo = new THREE.CylinderGeometry(1.5, 2.5, 18, 5);
    const stem = new THREE.Mesh(stemGeo, material);
    stem.position.y = 9;
    group.add(stem);

    const leafCount = 8;
    for (let i = 0; i < leafCount; i++) {
      const leafGeo = new THREE.ConeGeometry(2, 12, 3);
      const leaf = new THREE.Mesh(leafGeo, material);

      const angle = (i / leafCount) * Math.PI * 2;
      leaf.position.set(Math.cos(angle) * 3, 17, Math.sin(angle) * 3);
      leaf.rotation.x = Math.PI / 3;
      leaf.rotation.y = angle;

      group.add(leaf);
    }

    return group;
  }

  /**
   * ACTUALIZACIÓN DEL ENTORNO (Sincronizada con el Bucle de scene.js)
   */
  update(record, stress, frameCount, isSnap) {
    const windSpeed = record?.wind_speed_180m || 10.0;
    const humidity = record?.relative_humidity_2m || 75.0;

    // A. Actualizar Niebla Gaseosa
    if (this.fogParticles) {
      const positions = this.fogParticles.geometry.attributes.position.array;
      const speedFactor = (windSpeed / 10) * 0.15;

      for (let i = 0; i < this.particleCount; i++) {
        positions[i * 3] += Math.sin(frameCount * 0.02 + i) * speedFactor;
        positions[i * 3 + 2] += Math.cos(frameCount * 0.015 + i) * speedFactor;

        if (Math.abs(positions[i * 3]) > 200) positions[i * 3] *= -0.9;
        if (Math.abs(positions[i * 3 + 2]) > 200) positions[i * 3 + 2] *= -0.9;
      }

      this.fogParticles.geometry.attributes.position.needsUpdate = true;
      this.fogParticles.material.opacity = THREE.MathUtils.clamp(
        humidity / 300 + 0.1,
        0.15,
        0.4,
      );
    }

    // B. Actualizar Látice Terreno (Deformación + Sismos)
    if (this.terrainMesh) {
      const positions = this.terrainMesh.geometry.attributes.position.array;
      const count = positions.length / 3;

      for (let i = 0; i < count; i++) {
        const initY = this.terrainPositionsInitial[i * 3 + 1];
        const x = positions[i * 3];
        const z = positions[i * 3 + 2];

        let wave =
          Math.sin(x * 0.02 + frameCount * 0.02) *
          Math.cos(z * 0.02 + frameCount * 0.02) *
          3.5;

        if (stress > 0.3) {
          wave += Math.sin(x * z * 0.001 + frameCount * 0.1) * (stress * 4.0);
        }

        if (isSnap) {
          wave += (Math.random() - 0.5) * 6.0;
        }

        positions[i * 3 + 1] = initY + wave;
      }

      this.terrainMesh.geometry.attributes.position.needsUpdate = true;
    }

    // C. Actualizar Flora (Estructuras periféricas)
    this.floraGroup.children.forEach((plant, index) => {
      plant.rotation.y = Math.sin(frameCount * 0.01 + index) * 0.1;

      if (isSnap) {
        plant.rotation.z = (Math.random() - 0.5) * 0.15;
      } else {
        plant.rotation.z = THREE.MathUtils.lerp(plant.rotation.z, 0, 0.05);
      }
    });
  }
}
