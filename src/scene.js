// src/scene.js
import * as THREE from "three";

import { AvatarEngine } from "./avatar.js";
import { EnvironmentManager } from "./environment.js";
import { ArtConfig } from "./ArtDirection.js"; // NUEVO: Importamos la Dirección de Arte

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
    this.initEnvironmentManager();
    this.addEvents();
  }

  initThree() {
    this.scene = new THREE.Scene();

    // El fondo ahora es dictado por la Dirección de Arte
    this.scene.background = new THREE.Color(ArtConfig.proyeccion.fondo);

    this.camera = new THREE.PerspectiveCamera(
      60,
      this.width / this.height,
      0.1,
      1000,
    );
    // Distancia de cámara dictada por la Dirección de Arte
    this.camera.position.set(0, 0, ArtConfig.proyeccion.distanciaCamara);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.container.appendChild(this.renderer.domElement);
  }

  addLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    this.scene.add(ambientLight);

    // Luz temporal del avatar (Se revisará en el Sprint 2)
    this.heartLight = new THREE.PointLight(0x00e5ff, 2.5, 250);
    this.scene.add(this.heartLight);
  }

  initAvatarRenderer() {
    // Se conserva intacto para el Sprint 1. Será refactorizado en el Sprint 2.
    this.avatarGroup = new THREE.Group();
    this.scene.add(this.avatarGroup);

    const heartGeo = new THREE.SphereGeometry(1, 32, 32);
    const heartMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x00e5ff,
      emissiveIntensity: 1.2,
      roughness: 0.1,
    });
    this.heartMesh = new THREE.Mesh(heartGeo, heartMat);
    this.avatarGroup.add(this.heartMesh);

    this.strandsGroup = new THREE.Group();
    this.avatarGroup.add(this.strandsGroup);

    this.cloudGeometry = new THREE.BufferGeometry();
    this.cloudMaterial = new THREE.PointsMaterial({
      size: 2.8,
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.bodyCloudMesh = new THREE.Points(
      this.cloudGeometry,
      this.cloudMaterial,
    );
    this.avatarGroup.add(this.bodyCloudMesh);
  }

  initEnvironmentManager() {
    // Instanciación del nuevo paisaje puntillista
    this.environment = new EnvironmentManager(this.scene);
  }

  updateAvatar(stress, frameCount) {
    // Lógica temporal conservada para el Sprint 1
    const data = this.avatarEngine.updateFrameData(stress, frameCount);

    this.heartMesh.position.set(
      data.heart.position.x,
      data.heart.position.y,
      data.heart.position.z,
    );
    this.heartMesh.scale.setScalar(data.heart.radius * 0.5);

    const color = new THREE.Color(data.color.r, data.color.g, data.color.b);
    this.heartMesh.material.color = color;
    this.heartMesh.material.emissive = color;
    this.heartMesh.material.emissiveIntensity = data.heart.intensity * 1.5;

    this.heartLight.color = color;
    this.heartLight.position.copy(this.heartMesh.position);

    while (this.strandsGroup.children.length > 0) {
      const child = this.strandsGroup.children.pop();
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    }

    const lineMaterial = new THREE.LineBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.65,
    });

    for (let strandPoints of data.strands) {
      const points = strandPoints.map((p) => new THREE.Vector3(p.x, p.y, p.z));
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, lineMaterial);
      this.strandsGroup.add(line);
    }

    const cloudPositions = new Float32Array(data.cloud.length * 3);
    for (let i = 0; i < data.cloud.length; i++) {
      cloudPositions[i * 3] = data.cloud[i].x;
      cloudPositions[i * 3 + 1] = data.cloud[i].y;
      cloudPositions[i * 3 + 2] = data.cloud[i].z;
    }

    this.cloudGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(cloudPositions, 3),
    );
    this.cloudGeometry.attributes.position.needsUpdate = true;
    this.cloudMaterial.color = color;
  }

  addEvents() {
    window.addEventListener("resize", () => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;

      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(this.width, this.height);
      // Eliminada la referencia al composer en el resize
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

        // 1. Actualizar Entorno Atmosférico y Paisaje
        if (this.environment) {
          this.environment.update(
            record,
            stress,
            frameCount,
            this.simulation.snapTriggered,
          );
        }

        // 2. Actualizar Entidades 3D (Avatar temporal)
        this.updateAvatar(stress, frameCount);
        this.avatarGroup.rotation.y = Math.sin(frameCount * 0.005) * 0.15;

        // 3. Sincronización de Audio
        if (this.audio && record.datetime) {
          this.audio.update(
            stress,
            record.temperature_180m,
            record.wind_speed_180m,
            this.simulation.snapTriggered,
            this.simulation.lastSnapFrame ? 0.25 : 0.0,
          );
        }
      }

      // 4. Renderizado directo de WebGL (Sin filtros de postprocesamiento)
      this.renderer.render(this.scene, this.camera);
    };

    animate();
  }
}
