import * as THREE from "three";
// Modulos de Postprocesamiento de Three.js
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

import { AvatarEngine } from "./avatar.js";
import { ParticleSystem3D } from "./particles.js";

export class SceneManager {
  constructor(simulation, audio) {
    this.simulation = simulation;
    this.audio = audio;
    this.avatarEngine = new AvatarEngine();

    this.container = document.getElementById("canvas-container");
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.initThree();
    this.initPostProcessing();
    this.addLights();
    this.initAvatarRenderer();
    this.initParticleSystem();
    this.addEvents();
  }

  initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x06070a); // Fondo oscuro profundo

    this.camera = new THREE.PerspectiveCamera(
      60,
      this.width / this.height,
      0.1,
      1000,
    );
    this.camera.position.set(0, 0, 280);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.container.appendChild(this.renderer.domElement);
  }

  initPostProcessing() {
    // 1. Pase de Renderizado Principal
    const renderPass = new RenderPass(this.scene, this.camera);

    // 2. Pase de Bloom (Resplandor volumétrico)
    // Parámetros: (resolución, intensidad, radio, umbral)
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(this.width, this.height),
      1.2, // Intensidad inicial
      0.4, // Radio de dispersión
      0.15, // Umbral (elementos con brillo mayor a 0.15 resplandecen)
    );

    // 3. Compositor de Efectos
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(renderPass);
    this.composer.addPass(this.bloomPass);
  }

  addLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    this.scene.add(ambientLight);

    this.heartLight = new THREE.PointLight(0x00e5ff, 2.5, 250);
    this.scene.add(this.heartLight);
  }

  initAvatarRenderer() {
    this.avatarGroup = new THREE.Group();
    this.scene.add(this.avatarGroup);

    // Malla del Corazón Emisivo
    const heartGeo = new THREE.SphereGeometry(1, 32, 32);
    const heartMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x00e5ff,
      emissiveIntensity: 1.2,
      roughness: 0.1,
    });
    this.heartMesh = new THREE.Mesh(heartGeo, heartMat);
    this.avatarGroup.add(this.heartMesh);

    // Grupo de Filamentos
    this.strandsGroup = new THREE.Group();
    this.avatarGroup.add(this.strandsGroup);
  }

  initParticleSystem() {
    this.particleSystem = new ParticleSystem3D(700);
    this.scene.add(this.particleSystem.mesh);
  }

  updateAvatar(stress, frameCount) {
    const data = this.avatarEngine.updateFrameData(stress, frameCount);

    // Actualizar Corazón
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

    // Reconstruir Filamentos con materiales reactivos al Bloom
    while (this.strandsGroup.children.length > 0) {
      const child = this.strandsGroup.children.pop();
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    }

    const lineMaterial = new THREE.LineBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.75,
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
      this.composer.setSize(this.width, this.height);
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

        // 1. Modulación dinámica del Bloom según el estrés
        // A mayor estrés, la radiación visual y la dispersión aumentan
        this.bloomPass.strength = 1.0 + stress * 1.8;
        this.bloomPass.radius = 0.3 + stress * 0.6;

        // 2. Actualizar Entidades 3D
        this.updateAvatar(stress, frameCount);
        this.particleSystem.update(record, stress, frameCount);

        // 3. Oscilación de la cámara / avatar
        this.avatarGroup.rotation.y = Math.sin(frameCount * 0.005) * 0.15;

        // 4. Sincronización de Audio
        if (this.audio && record.datetime) {
          this.audio.update(
            stress,
            record.temperature_180m,
            record.wind_speed_180m,
          );
        }
      }

      // Renderizado a través del Compositor en lugar de renderer.render direct
      this.composer.render();
    };

    animate();
  }
}
