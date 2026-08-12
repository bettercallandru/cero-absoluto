import "./style.css";
import { fetchWeatherData } from "./api.js";
import { SimulationEngine } from "./simulation.js";
import { AudioManager } from "./audio.js";
import { SceneManager } from "./scene.js";
import { LienzoTexturizado } from "./components/LienzoTexturizado.js";

async function initApp() {
  console.log("🚀 Iniciando Cero Absoluto (Core 3D)...");

  // 1. Instanciar Motor de Simulación y Audio
  const simulation = new SimulationEngine(300);
  const audio = new AudioManager();

  // 2. Obtener Datos Climáticos
  const data = await fetchWeatherData();
  simulation.init(data);

  // 3. Inicializar Renderizador Three.js
  const sceneManager = new SceneManager(simulation, audio);
  sceneManager.start();

  // 4. Inicializar Lienzo Texturizado
  const lienzo = new LienzoTexturizado(sceneManager.scene);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
