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

  // --- DENTRO DE initAvatarRenderer() EN scene.js ---
  initAvatarRenderer() {
    this.avatarGroup = new THREE.Group();
    this.scene.add(this.avatarGroup);

    // 1. Corazón Emisivo
    const heartGeo = new THREE.SphereGeometry(1, 32, 32);
    const heartMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x00e5ff,
      emissiveIntensity: 1.2,
      roughness: 0.1,
    });
    this.heartMesh = new THREE.Mesh(heartGeo, heartMat);
    this.avatarGroup.add(this.heartMesh);

    // 2. Grupo de Filamentos Musculares
    this.strandsGroup = new THREE.Group();
    this.avatarGroup.add(this.strandsGroup);

    // 3. Nube Volumétrica Celular del Avatar (NUEVO FASE 2)
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

  initParticleSystem() {
    this.particleSystem = new ParticleSystem3D(700);
    this.scene.add(this.particleSystem.mesh);
  }

  // --- DENTRO DE updateAvatar(stress, frameCount) EN scene.js ---
  updateAvatar(stress, frameCount) {
    const data = this.avatarEngine.updateFrameData(stress, frameCount);

    // A. Actualizar Corazón
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

    // B. Actualizar Filamentos Musculares
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

    // C. Actualizar Nube Volumétrica Celular (NUEVO FASE 2)
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

        // 4. Sincronización de Audio con Eventos de Fractura Tectónica
        if (this.audio && record.datetime) {
          this.audio.update(
            stress,
            record.temperature_180m,
            record.wind_speed_180m,
            this.simulation.snapTriggered, // Se añade bandera de salto
            this.simulation.lastSnapFrame ? 0.25 : 0.0, // Magnitud de impacto
          );
        }
      }

      // Renderizado a través del Compositor en lugar de renderer.render direct
      this.composer.render();
    };

    animate();
  }
}
