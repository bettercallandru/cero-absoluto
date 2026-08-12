// src/SceneManager.js
import * as THREE from "three";

import { Avatar } from "./avatar.js";
import { EnvironmentManager } from "./environment/EnvironmentManager.js";
import { ArtDirection } from "./ArtDirection.js";
import { ColorPalette } from "./ColorPalette.js";

export class SceneManager {
  constructor(simulation, audio) {
    this.simulation = simulation;
    this.audio = audio;

    this.container = document.getElementById("canvas-container");
    this.width = this.container
      ? this.container.clientWidth
      : window.innerWidth;
    this.height = this.container
      ? this.container.clientHeight
      : window.innerHeight;

    this.uiVisible = true;
    this.uiTimeout = null;

    this.initThree();
    this.addLights();

    // Instanciación limpia de componentes
    this.avatar = new Avatar();
    this.scene.add(this.avatar.group);

    this.initEnvironmentManager();
    this.initUI();
    this.addEvents();
  }

  initThree() {
    this.scene = new THREE.Scene();

    // Mantenemos el fondo beige/pergamino original para la escena 3D
    this.scene.background = new THREE.Color(
      ColorPalette.soporte.pergaminoViejo,
    );

    // Respetamos 100% tu dirección de arte y cámara original
    const { fov, near, far, position, target } = ArtDirection.camera;
    this.camera = new THREE.PerspectiveCamera(
      fov,
      this.width / this.height,
      near,
      far,
    );

    // Factor de alejamiento para encuadrar el paisaje horizontal en formato 9:16
    const ZOOM_FACTOR = 2;

    this.camera.position.set(position.x, position.y, position.z * ZOOM_FACTOR);
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
  }

  initEnvironmentManager() {
    this.environment = new EnvironmentManager(this.scene);
  }

  initUI() {
    const styleElement = document.createElement("style");
    styleElement.textContent = `
      .sim-ui-panel {
        position: absolute;
        top: 24px;
        left: 24px;
        width: 240px;
        background: rgba(245, 240, 235, 0.88);
        color: #1a1a1a;
        font-family: 'Courier New', Courier, monospace;
        font-size: 11px;
        padding: 14px;
        border-radius: 3px;
        border: 1px solid rgba(0,0,0,0.12);
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        backdrop-filter: blur(6px);
        z-index: 999;
        transition: opacity 0.8s ease, transform 0.8s ease;
        pointer-events: auto;
        user-select: none;
      }
      .sim-ui-panel.hidden {
        opacity: 0;
        transform: translateY(-8px);
        pointer-events: none;
      }
      .sim-ui-title {
        font-size: 11px;
        font-weight: bold;
        letter-spacing: 1px;
        margin-bottom: 2px;
        color: #1a1a1a;
        text-transform: uppercase;
      }
      .sim-ui-date {
        color: #66635d;
        font-size: 9px;
        margin-bottom: 8px;
      }
      .sim-ui-divider {
        border: 0;
        border-top: 1px dashed rgba(0, 0, 0, 0.15);
        margin: 6px 0;
      }
      .sim-ui-row {
        display: flex;
        justify-content: space-between;
        margin: 3px 0;
      }
      .sim-ui-label {
        color: #524f48;
      }
      .sim-ui-value {
        font-weight: bold;
        color: #1a1a1a;
      }
      .sim-ui-bar-container {
        width: 100%;
        height: 3px;
        background: rgba(0,0,0,0.08);
        margin-top: 3px;
        border-radius: 1px;
        overflow: hidden;
      }
      .sim-ui-bar-fill {
        height: 100%;
        width: 0%;
        background: #d92626;
        transition: width 0.1s ease, background-color 0.3s ease;
      }
      .sim-ui-footer {
        margin-top: 10px;
        font-size: 8px;
        color: #8c8880;
        text-align: center;
      }
    `;
    document.head.appendChild(styleElement);

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
        <span class="sim-ui-value" id="ui-iteration">0 / 72</span>
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

    // Lo agregamos dentro del canvas-container para que quede ceñido al lienzo 9:16
    if (this.container) {
      this.container.appendChild(this.uiContainer);
    } else {
      document.body.appendChild(this.uiContainer);
    }

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

    this.resetUiTimer();
  }

  resetUiTimer() {
    if (!this.uiContainer) return;
    this.uiContainer.classList.remove("hidden");
    clearTimeout(this.uiTimeout);

    // Autocultado tras 4 segundos de inactividad
    this.uiTimeout = setTimeout(() => {
      if (this.uiVisible) {
        this.uiContainer.classList.add("hidden");
      }
    }, 4000);
  }

  updateUI(record, stress) {
    if (!this.uiElements) return;

    const totalRecords =
      this.simulation &&
      this.simulation.records &&
      this.simulation.records.length > 0
        ? this.simulation.records.length
        : 72;

    const rawIndex =
      this.simulation && typeof this.simulation.currentIndex === "number"
        ? this.simulation.currentIndex
        : 0;

    const currentStep = Math.min(Math.max(rawIndex + 1, 1), totalRecords);

    const progressPct = ((currentStep / totalRecords) * 100).toFixed(1);
    const stressPct = Math.min(Math.max(stress * 100, 0), 100).toFixed(0);

    this.uiElements.date.textContent =
      record && record.datetime ? record.datetime : "Registro continuo";
    this.uiElements.progress.textContent = `${progressPct}%`;
    this.uiElements.iteration.textContent = `${currentStep} / ${totalRecords}`;

    this.uiElements.stress.textContent = `${stressPct}%`;
    this.uiElements.stressBar.style.width = `${stressPct}%`;

    if (stress > 0.7) {
      this.uiElements.stressBar.style.background = "#d92626";
    } else if (stress > 0.35) {
      this.uiElements.stressBar.style.background = "#e69500";
    } else {
      this.uiElements.stressBar.style.background = "#2b5c8f";
    }

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
      this.uiContainer.classList.toggle("hidden", !this.uiVisible);
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .catch((err) => console.error(err));
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  }

  addEvents() {
    window.addEventListener("resize", () => {
      this.width = this.container
        ? this.container.clientWidth
        : window.innerWidth;
      this.height = this.container
        ? this.container.clientHeight
        : window.innerHeight;

      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(this.width, this.height);
    });

    window.addEventListener("mousemove", () => this.resetUiTimer());

    window.addEventListener("keydown", (event) => {
      this.resetUiTimer();
      if (event.key === "h" || event.key === "H") {
        this.toggleUI();
      }
      if (event.key === "t" || event.key === "T") {
        this.toggleFullscreen();
      }
    });

    window.addEventListener("click", () => {
      this.resetUiTimer();
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

        if (this.avatar) {
          this.avatar.update(stress, frameCount);
        }

        this.updateUI(record, stress);

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
