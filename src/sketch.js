/**
 * MÓDULO 3: Renderizador p5.js (Controles de Exposición Integrados)
 */

import { Avatar } from "./avatar.js";
import { ParticleSystem } from "./particles.js";
import { AudioManager } from "./audio.js";

export function createSketch(simulation) {
  const avatar = new Avatar();
  const particleSystem = new ParticleSystem(250);
  const audio = new AudioManager();

  // Estado para controlar la visibilidad de la telemetría en sala
  let showHUD = true;

  return (p) => {
    p.setup = () => {
      let canvas = p.createCanvas(p.windowWidth, p.windowHeight);
      canvas.parent("canvas-container");
      particleSystem.init(p);
    };

    p.draw = () => {
      p.background(8, 10, 16, 45);

      // Actualizar la simulación
      simulation.update(p.frameCount, p);

      let record = simulation.getCurrentRecord();
      let stress = simulation.currentStress;

      if (!record.datetime) return; // Esperar a que cargue la data

      // Actualizar los parámetros sintéticos del audio
      audio.update(stress, record.temperature_180m, record.wind_speed_180m);

      // 1. PARTÍCULAS
      particleSystem.draw(p, record, stress);

      // 2. AVATAR
      avatar.draw(p, stress, record.temperature_180m);

      // 3. HUD Y BOTÓN DE AUDIO (Condicionado)
      if (showHUD) {
        drawHUD(
          p,
          record,
          simulation.currentIndex,
          simulation.weatherData.length,
          stress,
          audio.isStarted,
        );
      }
    };

    // Activar audio al hacer clic en el lienzo (Requisito del navegador)
    p.mousePressed = () => {
      audio.start();
    };

    // --- CONTROLES DE TECLADO PARA GALERÍA ---
    p.keyPressed = () => {
      let k = p.key.toLowerCase();

      if (k === "f") {
        // [F] Alternar Pantalla Completa
        let fs = p.fullscreen();
        p.fullscreen(!fs);
      } else if (k === "h") {
        // [H] Ocultar / Mostrar el texto HUD
        showHUD = !showHUD;
      } else if (k === "r") {
        // [R] Reiniciar el bucle y el estrés (para nuevos espectadores)
        simulation.currentIndex = 0;
        simulation.currentStress = 0.5; // Asumiendo que 0.5 es tu valor base
      }
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
    };
  };
}

// ... Mantén tu función drawHUD() exactamente igual que antes ...
function drawHUD(p, data, index, total, stress, audioActive) {
  // (Código previo de drawHUD sin cambios)
  p.fill(240);
  p.textFont("monospace");
  p.textSize(12);
  p.textAlign(p.LEFT);

  let progressPercent = (((index + 1) / total) * 100).toFixed(1);

  p.text(`[CERO ABSOLUTO // CERA / VOLTAJE 14]`, 20, 30);
  p.text(`REGISTRO TEMPORAL: ${data.datetime}`, 20, 50);
  p.text(
    `PROGRESO BUCLE:   ${index + 1}/${total} (${progressPercent}%)`,
    20,
    70,
  );
  p.text(`---------------------------------------`, 20, 85);
  p.text(`PRECIPITACIÓN:    ${data.precipitation_probability}%`, 20, 105);
  p.text(`VIENTO (180m):    ${data.wind_speed_180m} km/h`, 20, 125);
  p.text(`TEMP (180m):      ${data.temperature_180m} °C`, 20, 145);
  p.text(`HUMEDAD:          ${data.relative_humidity_2m}%`, 20, 165);
  p.text(`---------------------------------------`, 20, 180);

  // Indicador de Estrés
  p.fill(p.map(stress, 0, 1, 0, 255), p.map(stress, 0, 1, 255, 0), 100);
  p.text(`ESTRÉS COGNITIVO: ${stress.toFixed(3)}`, 20, 200);
  p.rect(20, 210, stress * 160, 5);

  // Mensaje de estado de Audio
  p.textSize(11);
  if (!audioActive) {
    p.fill(255, 200, 0);
    p.text(
      `[ 🔊 HAZ CLIC EN CUALQUIER LUGAR PARA ACTIVAR EL AUDIO ]`,
      20,
      p.height - 30,
    );
  } else {
    p.fill(0, 255, 150);
    p.text(`[ 🔊 SISTEMA DE AUDIO REACTIVO: ACTIVO ]`, 20, p.height - 30);
  }
}
