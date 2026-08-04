import * as THREE from "three";
import { AvatarEngine } from "./avatar.js";

export class SceneManager {
  constructor(simulation, audio) {
    this.simulation = simulation;
    this.audio = audio;
    this.avatarEngine = new AvatarEngine();

    this.container = document.getElementById("canvas-container");
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.initThree();
    this.addLights();
    this.initAvatarRenderer();
    this.addEvents();
  }

  initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0c12);

    this.camera = new THREE.PerspectiveCamera(
      60,
      this.width / this.height,
      0.1,
      1000,
    );
    this.camera.position.set(0, 0, 280);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.container.appendChild(this.renderer.domElement);
  }

  addLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);

    this.heartLight = new THREE.PointLight(0x00e5ff, 2, 200);
    this.scene.add(this.heartLight);
  }

  initAvatarRenderer() {
    this.avatarGroup = new THREE.Group();
    this.scene.add(this.avatarGroup);

    // 1. Malla del Corazón (Esfera)
    const heartGeo = new THREE.SphereGeometry(1, 32, 32);
    const heartMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x00e5ff,
      emissiveIntensity: 0.8,
      roughness: 0.2,
    });
    this.heartMesh = new THREE.Mesh(heartGeo, heartMat);
    this.avatarGroup.add(this.heartMesh);

    // 2. Grupo contenedor para los filamentos de líneas
    this.strandsGroup = new THREE.Group();
    this.avatarGroup.add(this.strandsGroup);
  }

  updateAvatar(stress, frameCount) {
    const data = this.avatarEngine.updateFrameData(stress, frameCount);

    // A. Actualizar Corazón
    this.heartMesh.position.set(
      data.heart.position.x,
      data.heart.position.y,
      data.heart.position.z,
    );
    this.heartMesh.scale.setScalar(data.heart.radius * 0.5);

    // Color del corazón y luz
    const color = new THREE.Color(data.color.r, data.color.g, data.color.b);
    this.heartMesh.material.color = color;
    this.heartMesh.material.emissive = color;
    this.heartMesh.material.emissiveIntensity = data.heart.intensity;
    this.heartLight.color = color;
    this.heartLight.position.copy(this.heartMesh.position);

    // B. Reconstruir/Actualizar Filamentos
    // Limpieza simple de líneas anteriores para actualizar la estructura
    while (this.strandsGroup.children.length > 0) {
      const child = this.strandsGroup.children.pop();
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    }

    const lineMaterial = new THREE.LineBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.6,
    });

    for (let strandPoints of data.strands) {
      const points = strandPoints.map((p) => new THREE.Vector3(p.x, p.y, p.z));
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, lineMaterial);
      this.strandsGroup.add(line);
    }
  }

  addEvents() {
    window.addEventListener("resize", () => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
    });

    window.addEventListener("click", () => {
      if (this.audio && !this.audio.isStarted) {
        this.audio.start();
      }
    });
  }

  start() {
    let frameCount = 0;

    const animate = () => {
      requestAnimationFrame(animate);
      frameCount++;

      if (this.simulation) {
        this.simulation.update(frameCount);
        const stress = this.simulation.currentStress;
        const record = this.simulation.getCurrentRecord();

        // Actualizar el avatar 3D con los datos desacoplados
        this.updateAvatar(stress, frameCount);

        // Rotación sutil del avatar en el espacio 3D
        this.avatarGroup.rotation.y = Math.sin(frameCount * 0.005) * 0.15;

        if (this.audio && record.datetime) {
          this.audio.update(
            stress,
            record.temperature_180m,
            record.wind_speed_180m,
          );
        }
      }

      this.renderer.render(this.scene, this.camera);
    };

    animate();
  }
}
