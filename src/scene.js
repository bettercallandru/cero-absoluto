// src/scene.js
import * as THREE from "three";

import { AvatarEngine } from "./avatar.js";
import { EnvironmentManager } from "./environment.js";
import { ArtConfig } from "./ArtDirection.js";

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

    // Fondo de pergamino desde Dirección de Arte
    this.scene.background = new THREE.Color(ArtConfig.proyeccion.fondo);

    this.camera = new THREE.PerspectiveCamera(
      60,
      this.width / this.height,
      0.1,
      1000,
    );
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
    // Luz ambiental suave para no quemar el pergamino ni el grafito
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Luz focalizada sobre la escultura de grafito
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 100);
    this.scene.add(directionalLight);

    // Luz interna emitida por el corazón
    this.heartLight = new THREE.PointLight(
      ArtConfig.avatar.corazon.colorBase,
      ArtConfig.avatar.corazon.intensidadLuz,
      150,
    );
    this.scene.add(this.heartLight);
  }

  initAvatarRenderer() {
    this.avatarGroup = new THREE.Group();
    this.scene.add(this.avatarGroup);

    // 1. Núcleo/Corazón: Geometría facetada mate/mineral
    const heartGeo = new THREE.IcosahedronGeometry(1, 1);
    const heartMat = new THREE.MeshStandardMaterial({
      color: ArtConfig.avatar.corazon.colorBase,
      emissive: ArtConfig.avatar.corazon.colorBase,
      emissiveIntensity: 0.5,
      roughness: 0.7,
      metalness: 0.3,
    });
    this.heartMesh = new THREE.Mesh(heartGeo, heartMat);
    this.avatarGroup.add(this.heartMesh);

    // 2. Grupo para las aristas de grafito
    this.strandsGroup = new THREE.Group();
    this.avatarGroup.add(this.strandsGroup);

    // 3. Esquirlas / Polvo de carbón
    this.cloudGeometry = new THREE.BufferGeometry();
    this.cloudMaterial = new THREE.PointsMaterial({
      size: 4.0,
      color: ArtConfig.avatar.material.colorReposo,
      transparent: true,
      opacity: 0.85,
      blending: THREE.NormalBlending,
      depthWrite: true,
    });
    this.bodyCloudMesh = new THREE.Points(
      this.cloudGeometry,
      this.cloudMaterial,
    );
    this.avatarGroup.add(this.bodyCloudMesh);
  }

  initEnvironmentManager() {
    this.environment = new EnvironmentManager(this.scene);
  }

  updateAvatar(stress, frameCount) {
    const data = this.avatarEngine.updateFrameData(stress, frameCount);

    // Actualizar posición e intensidad del corazón
    this.heartMesh.position.set(
      data.heart.position.x,
      data.heart.position.y,
      data.heart.position.z,
    );
    this.heartMesh.scale.setScalar(data.heart.radius * 0.4);
    this.heartMesh.material.emissiveIntensity = data.heart.intensidad;

    this.heartLight.position.copy(this.heartMesh.position);
    this.heartLight.intensity = data.heart.intensidad * 1.5;

    // Interpolación cromática de grafito (de Reposo a Estrés)
    const colorReposo = new THREE.Color(ArtConfig.avatar.material.colorReposo);
    const colorEstres = new THREE.Color(ArtConfig.avatar.material.colorEstres);
    const currentColor = colorReposo.lerp(colorEstres, data.stressFactor);

    // Limpiar aristas previas
    while (this.strandsGroup.children.length > 0) {
      const child = this.strandsGroup.children.pop();
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    }

    // Dibujar aristas con trazo de grafito
    const lineMaterial = new THREE.LineBasicMaterial({
      color: currentColor,
      transparent: true,
      opacity: ArtConfig.avatar.material.opacidadBase,
      linewidth: ArtConfig.avatar.material.grosorAristas,
    });

    for (let strandPoints of data.strands) {
      const points = strandPoints.map((p) => new THREE.Vector3(p.x, p.y, p.z));
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, lineMaterial);
      this.strandsGroup.add(line);
    }

    // Actualizar polvo de carbón / esquirlas desprendidas
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
    this.cloudMaterial.color = currentColor;
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

        // 1. Actualizar Paisaje Puntillista
        if (this.environment) {
          this.environment.update(
            record,
            stress,
            frameCount,
            this.simulation.snapTriggered,
          );
        }

        // 2. Actualizar Avatar de Grafito
        this.updateAvatar(stress, frameCount);
        this.avatarGroup.rotation.y = Math.sin(frameCount * 0.005) * 0.15;

        // 3. Sincronización con Audio
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

      // Renderizado directo a WebGL
      this.renderer.render(this.scene, this.camera);
    };

    animate();
  }
}
