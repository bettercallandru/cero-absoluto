/**
 * CERO ABSOLUTO: LATENCIA DE LA CERTEZA
 * Proyecto para Voltaje 14
 * Stack: p5.js + Open-Meteo API (Fetch API)
 */

// --- VARIABLES GLOBALES DE ESTADO ---
let stressIndex = 0.0; // Variable maestra: 0.0 (Calma) a 1.0 (Caos)
let targetStress = 0.0; // Para transiciones suaves entre lecturas de la API
let particles = []; // Arreglo para el paisaje de datos
const MAX_PARTICLES = 300;

// Configuración de la API (Bogotá, Colombia - Puedes cambiar coordenadas)
const API_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=4.6097&longitude=-74.0817&current=temperature_2m,relative_humidity_2m,wind_speed_10m";

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Inicializar el paisaje de datos (Partículas)
  for (let i = 0; i < MAX_PARTICLES; i++) {
    particles.push(new DataParticle());
  }

  // Primera petición a la API y temporizador para consultar cada 30 segundos
  fetchEnvironmentData();
  setInterval(fetchEnvironmentData, 30000);
}

function draw() {
  // Lerp suave para que el estrés cambie progresivamente y no de golpe
  stressIndex = lerp(stressIndex, targetStress, 0.05);

  // Fondo que oscurece / enrojece levemente con la saturación de estrés
  let bgR = map(stressIndex, 0, 1, 10, 30);
  let bgG = map(stressIndex, 0, 1, 12, 5);
  let bgB = map(stressIndex, 0, 1, 18, 5);
  background(bgR, bgG, bgB, 200); // Alfa para dejar estela suave (motion blur)

  // 1. DIBUJAR PAISAJE DE DATOS (Lluvia de partículas)
  for (let p of particles) {
    p.update(stressIndex);
    p.display(stressIndex);
  }

  // 2. DIBUJAR AVATAR Y CORAZÓN CENTRAL
  push();
  translate(width / 2, height / 2);
  drawAvatar(stressIndex);
  drawHeart(stressIndex);
  pop();

  // 3. TELEMETRÍA / DEBUG (Información discreta en esquina)
  drawHUD();
}

// --- CONSUMO DE LA API EN TIEMPO REAL ---
async function fetchEnvironmentData() {
  try {
    let response = await fetch(API_URL);
    let data = await response.json();

    let wind = data.current.wind_speed_10m; // Velocidad del viento (km/h)
    let humidity = data.current.relative_humidity_2m; // Humedad %

    // Normalización: Calculamos la volatilidad ambiental
    // Vientos > 30 km/h o extremas de humedad disparan el estrés
    let windStress = map(wind, 0, 40, 0, 0.6, true);
    let humidityStress = map(abs(50 - humidity), 0, 50, 0, 0.4, true);

    targetStress = constrain(windStress + humidityStress, 0.0, 1.0);
    console.log(
      `[API Update] Viento: ${wind}km/h | Humedad: ${humidity}% | Stress: ${targetStress.toFixed(2)}`,
    );
  } catch (error) {
    console.warn("Error consultando API, manteniendo estado:", error);
  }
}

// --- CLASE: PAISAJE DE DATOS (Partículas) ---
class DataParticle {
  constructor() {
    this.reset();
    this.y = random(height); // Dispersar al inicio
  }

  reset() {
    this.x = random(width);
    this.y = random(-50, -10);
    this.size = random(1.5, 3.5);
    this.baseSpeed = random(2, 5);
  }

  update(stress) {
    // La velocidad y la turbulencia aumentan exponencialmente con el estrés
    let speedMultiplier = map(stress, 0, 1, 1, 4);
    let noiseFactor =
      map(noise(this.x * 0.01, frameCount * 0.02), 0, 1, -2, 2) * stress;

    this.y += this.baseSpeed * speedMultiplier;
    this.x += noiseFactor;

    if (this.y > height + 10) {
      this.reset();
    }
  }

  display(stress) {
    noStroke();
    // Transición de color: Cian/Azul claro (Estabilidad) -> Rojo/Blanco brillante (Caos)
    let r = map(stress, 0, 1, 100, 255);
    let g = map(stress, 0, 1, 200, 50);
    let b = map(stress, 0, 1, 255, 80);
    fill(r, g, b, 180);

    // Si el estrés es alto, dibujamos las partículas más alargadas (efecto velocidad)
    let particleHeight = map(stress, 0, 1, this.size, this.size * 5);
    rect(this.x, this.y, this.size, particleHeight);
  }
}

// --- DIBUJO DEL AVATAR CON GLITCH ---
function drawAvatar(stress) {
  push();

  // Efecto Glitch / Dislocación si el estrés es elevado
  if (stress > 0.4 && random(1) < stress * 0.3) {
    translate(random(-15, 15) * stress, random(-5, 5) * stress);
  }

  noStroke();
  fill(240, 240, 245, 230); // Blanco estético ligeramente azulado

  // Cabeza
  ellipse(0, -90, 45, 55);

  // Cuello
  rect(-8, -60, 16, 20);

  // Hombros y Torso (Estilizado)
  beginShape();
  vertex(-50, -35);
  vertex(50, -35);
  vertex(35, 80);
  vertex(-35, 80);
  endShape(CLOSE);

  pop();
}

// --- DIBUJO DEL CORAZÓN PULSANTE ---
function drawHeart(stress) {
  push();
  translate(0, -10); // Posición en el pecho del avatar

  // Frecuencia cardiaca: 60 BPM en estabilidad (1 Hz) -> 160+ BPM en caos (2.6 Hz)
  let bpm = map(stress, 0, 1, 1.0, 2.8);
  let pulse = sin(frameCount * 0.1 * bpm);

  // Escala base + rebote del pulso
  let baseScale = map(stress, 0, 1, 18, 26);
  let heartSize = baseScale + pulse * (4 + stress * 8);

  // Color del corazón: Rojo profundo -> Rojo neón sobrecargado
  fill(255, map(stress, 0, 1, 20, 60), 40, 220);
  noStroke();

  // Silueta Vectorial del Corazón
  beginShape();
  for (let a = 0; a < TWO_PI; a += 0.1) {
    let x = 16 * pow(sin(a), 3);
    let y = -(13 * cos(a) - 5 * cos(2 * a) - 2 * cos(3 * a) - cos(4 * a));
    vertex(x * (heartSize / 20), y * (heartSize / 20));
  }
  endShape(CLOSE);

  // Resplandor / Halo (Glow)
  fill(255, 0, 50, 40 + pulse * 20);
  ellipse(0, 0, heartSize * 2.2, heartSize * 2.2);

  pop();
}

// --- TELEMETRÍA EN PANTALLA ---
function drawHUD() {
  fill(255, 100);
  textSize(11);
  textFont("monospace");
  text(
    `ESTADO AMBIENTAL // STRESS_INDEX: ${stressIndex.toFixed(4)}`,
    20,
    height - 20,
  );

  // Simulador de control manual con teclado (Para pruebas sin esperar la API)
  text(`[Prueba manual: Teclas ↑ / ↓ para variar el estrés]`, 20, height - 38);
}

// --- CONTROLES DE PRUEBA RÁPIDA (Teclado) ---
function keyPressed() {
  if (keyCode === UP_ARROW) {
    targetStress = constrain(targetStress + 0.1, 0.0, 1.0);
  } else if (keyCode === DOWN_ARROW) {
    targetStress = constrain(targetStress - 0.1, 0.0, 1.0);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
