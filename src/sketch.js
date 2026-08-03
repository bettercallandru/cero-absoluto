/**
 * MÓDULO 3: Renderizador p5.js
 */

export function createSketch(simulation) {
  return (p) => {
    p.setup = () => {
      let canvas = p.createCanvas(p.windowWidth, p.windowHeight);
      canvas.parent("canvas-container");
    };

    p.draw = () => {
      p.background(10, 12, 18, 220);

      // Actualizar la simulación con el frame de p5
      simulation.update(p.frameCount, p);

      let record = simulation.getCurrentRecord();
      let stress = simulation.currentStress;

      if (!record.datetime) return; // Esperar a que cargue la data

      // --- DIBUJO PRUEBA VISUAL ---
      p.push();
      p.translate(p.width / 2, p.height / 2);

      let size = p.map(record.temperature_180m, 5, 25, 80, 220);
      let rotSpeed = p.map(record.wind_speed_180m, 0, 50, 0.01, 0.08);

      p.rotate(p.frameCount * rotSpeed);
      p.noFill();
      p.strokeWeight(p.map(stress, 0, 1, 1, 6));
      p.stroke(p.map(stress, 0, 1, 0, 255), 200, 255);
      p.rectMode(p.CENTER);
      p.rect(0, 0, size, size);
      p.pop();

      // --- TELEMETRÍA / HUD ---
      drawHUD(
        p,
        record,
        simulation.currentIndex,
        simulation.weatherData.length,
        stress,
      );
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
    };
  };
}

function drawHUD(p, data, index, total, stress) {
  p.fill(240);
  p.textFont("monospace");
  p.textSize(12);
  p.textAlign(p.LEFT);

  let progressPercent = (((index + 1) / total) * 100).toFixed(1);

  p.text(`[CERO ABSOLUTO // VITE + MODULES OK]`, 20, 30);
  p.text(`HORA FUTURA: ${data.datetime}`, 20, 50);
  p.text(`PROGRESO:    ${index + 1}/${total} (${progressPercent}%)`, 20, 70);
  p.text(`PRECIP.:     ${data.precipitation_probability}%`, 20, 95);
  p.text(`VIENTO:      ${data.wind_speed_180m} km/h`, 20, 115);
  p.text(`TEMP:        ${data.temperature_180m} °C`, 20, 135);

  p.fill(p.map(stress, 0, 1, 0, 255), p.map(stress, 0, 1, 255, 0), 100);
  p.text(`ESTRÉS:      ${stress.toFixed(3)}`, 20, 160);
  p.rect(20, 170, stress * 150, 4);
}
