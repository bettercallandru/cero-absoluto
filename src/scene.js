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
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.uiVisible = true;

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
  }

  initEnvironmentManager() {
    this.environment = new EnvironmentManager(this.scene);
  }

  initUI() {
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

    document.body.appendChild(this.uiContainer);

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
      this.uiElements.stressBar.style.background = "#4a90e2";
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
      this.width = window.innerWidth;
      this.height = window.innerHeight;

      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(this.width, this.height);
    });

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

        // Llamada ultra limpia al avatar
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
