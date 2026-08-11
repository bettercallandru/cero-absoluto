// src/SceneManager.js
import * as THREE from "three";

import { AvatarEngine } from "./avatar.js";
import { EnvironmentManager } from "./environment/EnvironmentManager.js";
import { ArtDirection } from "./ArtDirection.js";
import { ColorPalette } from "./ColorPalette.js";

export class SceneManager {
  constructor(simulation, audio) {
    this.simulation = simulation;
    this.audio = audio;
    this.avatarEngine = new AvatarEngine();

    this.container = document.getElementById("canvas-container");
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.uiVisible = true;

    this.initThree();
    this.addLights();
    this.initAvatarRenderer();
    this.initEnvironmentManager();
    this.initUI(); // Inyección de la Interfaz
    this.addEvents();
  }

  initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(
      ColorPalette.soporte.pergaminoViejo,
    );

    const { fov, near, far, position, target } = ArtDirection.camera;
    this.camera = new THREE.PerspectiveCamera(
      fov,
      this.width / this.height,
      near,
      far,
    );

    this.camera.position.set(position.x, position.y, position.z);
    this.camera.lookAt(target.x, target.y, target.z);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    if (this.container) {
      this.container.appendChild(this.renderer.domElement);
    }
  }

  addLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    this.scene.add(ambientLight);

    this.heartLight = new THREE.PointLight(0xd92626, 3.0, 45);
    this.scene.add(this.heartLight);
  }

  initAvatarRenderer() {
    this.avatarGroup = new THREE.Group();
    this.avatarGroup.position.set(-1.0, -9.0, 0.0);
    this.avatarGroup.scale.set(2.4, 2.4, 2.4);
    this.scene.add(this.avatarGroup);

    // 1. Halo Trasero Papel
    this.bgPaperMat = new THREE.MeshBasicMaterial({
      color: 0xfaf8f5,
      side: THREE.DoubleSide,
    });
    this.bgPaperMesh = new THREE.Mesh(
      new THREE.BufferGeometry(),
      this.bgPaperMat,
    );
    this.bgPaperMesh.position.z = -0.05;
    this.avatarGroup.add(this.bgPaperMesh);

    // 2. Túnica Oscura
    this.tunicMat = new THREE.MeshBasicMaterial({
      color: 0x22252a,
      side: THREE.DoubleSide,
    });
    this.tunicMesh = new THREE.Mesh(new THREE.BufferGeometry(), this.tunicMat);
    this.avatarGroup.add(this.tunicMesh);

    // 3. Cabeza/Cabello
    this.headMat = new THREE.MeshBasicMaterial({
      color: 0x1f383a,
      side: THREE.DoubleSide,
    });
    this.headMesh = new THREE.Mesh(new THREE.BufferGeometry(), this.headMat);
    this.avatarGroup.add(this.headMesh);

    // 4. Contorno Grafito
    this.outlineMat = new THREE.LineBasicMaterial({
      color: 0x0d0d0d,
      linewidth: 2,
    });
    this.outlineLine = new THREE.LineLoop(
      new THREE.BufferGeometry(),
      this.outlineMat,
    );
    this.outlineLine.position.z = 0.08;
    this.avatarGroup.add(this.outlineLine);

    // 5. Brazo
    this.armLine = new THREE.Line(new THREE.BufferGeometry(), this.outlineMat);
    this.avatarGroup.add(this.armLine);

    // 6. Corazón Vectorial
    const heartShape = this.avatarEngine.getHeartShape();
    const heartGeo = new THREE.ShapeGeometry(heartShape);
    const heartMat = new THREE.MeshBasicMaterial({
      color: 0xd92626,
      side: THREE.DoubleSide,
    });
    this.heartMesh = new THREE.Mesh(heartGeo, heartMat);
    this.avatarGroup.add(this.heartMesh);

    // 7. Partículas
    this.particlesGeo = new THREE.BufferGeometry();
    const particlesMat = new THREE.PointsMaterial({
      color: 0x1a1a1a,
      size: 0.18,
      transparent: true,
      opacity: 0.75,
    });
    this.particlesMesh = new THREE.Points(this.particlesGeo, particlesMat);
    this.avatarGroup.add(this.particlesMesh);

    // 8. Línea de Suelo
    const groundPoints = [
      new THREE.Vector3(-18, -5.1, -0.1),
      new THREE.Vector3(-5, -5.0, -0.1),
      new THREE.Vector3(5, -5.05, -0.1),
      new THREE.Vector3(18, -4.95, -0.1),
    ];
    const groundGeo = new THREE.BufferGeometry().setFromPoints(groundPoints);
    const groundMat = new THREE.LineBasicMaterial({
      color: 0x1a1a1a,
      linewidth: 1.5,
    });
    const groundLine = new THREE.Line(groundGeo, groundMat);
    this.avatarGroup.add(groundLine);
  }

  initEnvironmentManager() {
    this.environment = new EnvironmentManager(this.scene);
  }

  /**
   * Crea la estructura HTML y CSS de la interfaz lateral
   */
  initUI() {
    // 1. Estilos inyectados
    const styleElement = document.createElement("style");
    styleElement.textContent = `
      .sim-ui-panel {
        position: fixed;
        top: 24px;
        left: 24px;
        width: 260px;
        background: rgba(26, 26, 26, 0.88);
        color: #e8e3d8;
        font-family: 'Courier New', Courier, monospace;
        font-size: 11px;
        padding: 16px;
        border-radius: 4px;
        border: 1px solid rgba(232, 227, 216, 0.2);
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        backdrop-filter: blur(8px);
        z-index: 999;
        transition: opacity 0.3s ease, transform 0.3s ease;
        pointer-events: auto;
        user-select: none;
      }
      .sim-ui-panel.hidden {
        opacity: 0;
        transform: translateX(-20px);
        pointer-events: none;
      }
      .sim-ui-title {
        font-size: 12px;
        font-weight: bold;
        letter-spacing: 1px;
        margin-bottom: 4px;
        color: #ffffff;
        text-transform: uppercase;
      }
      .sim-ui-date {
        color: #a09d96;
        font-size: 10px;
        margin-bottom: 12px;
      }
      .sim-ui-divider {
        border: 0;
        border-top: 1px dashed rgba(232, 227, 216, 0.25);
        margin: 8px 0;
      }
      .sim-ui-row {
        display: flex;
        justify-content: space-between;
        margin: 4px 0;
      }
      .sim-ui-label {
        color: #b5b0a5;
      }
      .sim-ui-value {
        font-weight: bold;
        color: #ffffff;
      }
      .sim-ui-bar-container {
        width: 100%;
        height: 4px;
        background: rgba(255,255,255,0.1);
        margin-top: 4px;
        border-radius: 2px;
        overflow: hidden;
      }
      .sim-ui-bar-fill {
        height: 100%;
        width: 0%;
        background: #d92626;
        transition: width 0.1s ease, background-color 0.3s ease;
      }
      .sim-ui-footer {
        margin-top: 12px;
        font-size: 9px;
        color: #7a7771;
        text-align: center;
      }
    `;
    document.head.appendChild(styleElement);

    // 2. Contenedor DOM
    this.uiContainer = document.createElement("div");
    this.uiContainer.className = "sim-ui-panel";
    this.uiContainer.innerHTML = `
      <div class="sim-ui-title">BITÁCORA AMBIENTAL</div>
      <div class="sim-ui-date" id="ui-date">-- / -- / ---- --:--</div>
      
      <div class="sim-ui-row">
        <span class="sim-ui-label">Progreso:</span>
        <span class="sim-ui-value" id="ui-progress">0%</span>
      </div>
      <div class="sim-ui-row">
        <span class="sim-ui-label">Iteración:</span>
        <span class="sim-ui-value" id="ui-iteration">0 / 0</span>
      </div>

      <hr class="sim-ui-divider" />

      <div class="sim-ui-row">
        <span class="sim-ui-label">Estrés Térmico:</span>
        <span class="sim-ui-value" id="ui-stress">0%</span>
      </div>
      <div class="sim-ui-bar-container">
        <div class="sim-ui-bar-fill" id="ui-stress-bar"></div>
      </div>

      <hr class="sim-ui-divider" />

      <div class="sim-ui-row">
        <span class="sim-ui-label">Temperatura:</span>
        <span class="sim-ui-value" id="ui-temp">-- °C</span>
      </div>
      <div class="sim-ui-row">
        <span class="sim-ui-label">Velocidad Viento:</span>
        <span class="sim-ui-value" id="ui-wind">-- km/h</span>
      </div>
      <div class="sim-ui-row">
        <span class="sim-ui-label">Humedad Relativa:</span>
        <span class="sim-ui-value" id="ui-humidity">-- %</span>
      </div>
      <div class="sim-ui-row">
        <span class="sim-ui-label">Precipitación:</span>
        <span class="sim-ui-value" id="ui-precip">-- mm</span>
      </div>

      <div class="sim-ui-footer">
        [H] Ocultar UI &nbsp;|&nbsp; [T] Pantalla Completa
      </div>
    `;

    document.body.appendChild(this.uiContainer);

    // Referencias a los elementos HTML
    this.uiElements = {
      date: document.getElementById("ui-date"),
      progress: document.getElementById("ui-progress"),
      iteration: document.getElementById("ui-iteration"),
      stress: document.getElementById("ui-stress"),
      stressBar: document.getElementById("ui-stress-bar"),
      temp: document.getElementById("ui-temp"),
      wind: document.getElementById("ui-wind"),
      humidity: document.getElementById("ui-humidity"),
      precip: document.getElementById("ui-precip"),
    };
  }

  /**
   * Actualiza el contenido de la interfaz con los datos de la simulación
   * ajustado a 72 iteraciones (72 horas / 3 días).
   */
  updateUI(record, stress) {
    if (!this.uiElements) return;

    // 1. Total de iteraciones fijado en 72 (3 días / 72 horas) con fallback seguro
    const totalRecords =
      this.simulation &&
      this.simulation.records &&
      this.simulation.records.length > 0
        ? this.simulation.records.length
        : 72;

    // 2. Obtener el índice actual (1-indexed para lectura humana: de 1 a 72)
    const rawIndex =
      this.simulation && typeof this.simulation.currentIndex === "number"
        ? this.simulation.currentIndex
        : 0;

    const currentStep = Math.min(Math.max(rawIndex + 1, 1), totalRecords);

    // 3. Cálculo de porcentaje de progreso (0% al 100%)
    const progressPct = ((currentStep / totalRecords) * 100).toFixed(1);
    const stressPct = Math.min(Math.max(stress * 100, 0), 100).toFixed(0);

    // 4. Inyección en la interfaz
    this.uiElements.date.textContent =
      record && record.datetime ? record.datetime : "Registro continuo";
    this.uiElements.progress.textContent = `${progressPct}%`;
    this.uiElements.iteration.textContent = `${currentStep} / ${totalRecords}`;

    this.uiElements.stress.textContent = `${stressPct}%`;
    this.uiElements.stressBar.style.width = `${stressPct}%`;

    // Cambiar color de la barra de estrés según intensidad
    if (stress > 0.7) {
      this.uiElements.stressBar.style.background = "#d92626"; // Rojo
    } else if (stress > 0.35) {
      this.uiElements.stressBar.style.background = "#e69500"; // Naranja
    } else {
      this.uiElements.stressBar.style.background = "#4a90e2"; // Azul calmo
    }

    // Datos meteorológicos
    if (record) {
      this.uiElements.temp.textContent =
        record.temperature_180m !== undefined
          ? `${record.temperature_180m.toFixed(1)} °C`
          : "--";
      this.uiElements.wind.textContent =
        record.wind_speed_180m !== undefined
          ? `${record.wind_speed_180m.toFixed(1)} km/h`
          : "--";
      this.uiElements.humidity.textContent =
        record.relative_humidity_2m !== undefined
          ? `${record.relative_humidity_2m.toFixed(0)} %`
          : "--";
      this.uiElements.precip.textContent =
        record.precipitation !== undefined
          ? `${record.precipitation.toFixed(1)} mm`
          : "0.0 mm";
    }
  }

  toggleUI() {
    this.uiVisible = !this.uiVisible;
    if (this.uiContainer) {
      if (this.uiVisible) {
        this.uiContainer.classList.remove("hidden");
      } else {
        this.uiContainer.classList.add("hidden");
      }
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(
          `Error intentando entrar en pantalla completa: ${err.message}`,
        );
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  updateAvatar(stress, frameCount) {
    const data = this.avatarEngine.updateFrameData(stress, frameCount);

    // 1. Relleno Túnica
    const tunicShape = new THREE.Shape(data.tunicPoints);
    this.tunicMesh.geometry.dispose();
    this.tunicMesh.geometry = new THREE.ShapeGeometry(tunicShape);

    // 2. Halo Trasero Papel
    const bgShape = new THREE.Shape(data.tunicPoints);
    this.bgPaperMesh.geometry.dispose();
    this.bgPaperMesh.geometry = new THREE.ShapeGeometry(bgShape);
    this.bgPaperMesh.scale.set(1.06, 1.05, 1.0);

    // 3. Cabeza
    const headShape = new THREE.Shape(data.headPoints);
    this.headMesh.geometry.dispose();
    this.headMesh.geometry = new THREE.ShapeGeometry(headShape);

    // 4. Contorno de Grafito
    const outline3D = data.tunicPoints.map(
      (p) => new THREE.Vector3(p.x, p.y, 0),
    );
    this.outlineLine.geometry.dispose();
    this.outlineLine.geometry = new THREE.BufferGeometry().setFromPoints(
      outline3D,
    );

    // 5. Brazo
    this.armLine.geometry.dispose();
    this.armLine.geometry = new THREE.BufferGeometry().setFromPoints(
      data.armPoints,
    );

    // 6. Corazón Vectorial
    this.heartMesh.position.set(
      data.heart.position.x,
      data.heart.position.y,
      data.heart.position.z,
    );
    this.heartMesh.scale.setScalar(data.heart.radius);

    this.heartLight.position.set(
      this.avatarGroup.position.x + data.heart.position.x,
      this.avatarGroup.position.y + data.heart.position.y,
      3.0,
    );
    this.heartLight.intensity = data.heart.intensidad * 2.8;

    // 7. Partículas
    this.particlesGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(data.particles, 3),
    );
    this.particlesGeo.attributes.position.needsUpdate = true;

    // Respiración corporal leve
    this.avatarGroup.position.y = -9.0 + Math.sin(frameCount * 0.015) * 0.12;
  }

  addEvents() {
    window.addEventListener("resize", () => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;

      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(this.width, this.height);
    });

    // ATAJOS DE TECLADO: H (Ocultar/Mostrar UI) y T (Pantalla Completa)
    window.addEventListener("keydown", (event) => {
      if (event.key === "h" || event.key === "H") {
        this.toggleUI();
      }
      if (event.key === "t" || event.key === "T") {
        this.toggleFullscreen();
      }
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

        if (this.environment) {
          this.environment.update(
            record,
            stress,
            frameCount,
            this.simulation.snapTriggered,
          );
        }

        this.updateAvatar(stress, frameCount);
        this.updateUI(record, stress); // Actualizar interfaz en vivo

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

      this.renderer.render(this.scene, this.camera);
    };

    animate();
  }
}
