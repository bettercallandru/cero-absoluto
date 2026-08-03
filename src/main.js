// src/main.js
import p5 from "p5";
import "./style.css";
import { fetchWeatherData } from "./api.js";
import { SimulationEngine } from "./simulation.js";
import { createSketch } from "./sketch.js";

async function initApp() {
  console.log("🚀 Iniciando Cero Absoluto...");

  const simulation = new SimulationEngine(300);

  // Obtener datos (API o Mock)
  const data = await fetchWeatherData();
  simulation.init(data);

  // Instanciar p5
  const sketchFunction = createSketch(simulation);
  new p5(sketchFunction);
}

// Ejecutar cuando el DOM esté completamente cargado
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
