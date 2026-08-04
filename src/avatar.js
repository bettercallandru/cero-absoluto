/**
 * MÓDULO VISUAL: Avatar con Masa Volumétrica, Asimetría y Núcleo Intercostal (Cero Absoluto)
 */

export class Avatar {
  constructor() {
    this.timeOff = 0;
  }

  /**
   * Genera coordenadas anatómicas asimétricas interpoladas en 4 estados emocionales
   */
  getAnatomyPose(p, stress) {
    // 1. CALMA / INMERSIÓN (0.0 - 0.25): Flotante, asimétrica, brazos abiertos
    const poseCalm = {
      head: { x: 2, y: -135, r: 22 },
      neck: { x: 0, y: -100, r: 12 },
      shoulderL: { x: -48, y: -80, r: 16 },
      shoulderR: { x: 44, y: -75, r: 16 }, // Asimetría sutil de hombros
      elbowL: { x: -62, y: -25, r: 12 },
      elbowR: { x: 58, y: -30, r: 12 },
      handL: { x: -52, y: 35, r: 10 },
      handR: { x: 48, y: 25, r: 10 },
      hipL: { x: -24, y: 25, r: 18 },
      hipR: { x: 20, y: 25, r: 18 },
      kneeL: { x: -30, y: 85, r: 14 },
      kneeR: { x: 26, y: 85, r: 14 },
      footL: { x: -28, y: 150, r: 10 },
      footR: { x: 22, y: 150, r: 10 },
    };

    // 2. TENSIÓN / ALERTA (0.26 - 0.55): Erguida, vertical
    const poseAlert = {
      head: { x: 0, y: -130, r: 20 },
      neck: { x: 0, y: -95, r: 12 },
      shoulderL: { x: -42, y: -78, r: 16 },
      shoulderR: { x: 42, y: -78, r: 16 },
      elbowL: { x: -50, y: -20, r: 12 },
      elbowR: { x: 50, y: -20, r: 12 },
      handL: { x: -38, y: 30, r: 10 },
      handR: { x: 38, y: 30, r: 10 },
      hipL: { x: -20, y: 25, r: 18 },
      hipR: { x: 20, y: 25, r: 18 },
      kneeL: { x: -22, y: 85, r: 14 },
      kneeR: { x: 22, y: 85, r: 14 },
      footL: { x: -20, y: 150, r: 10 },
      footR: { x: 20, y: 150, r: 10 },
    };

    // 3. ESTRÉS / FRICCIÓN (0.56 - 0.80): Asimétrica, inclinación lateral de resistencia
    const poseStress = {
      head: { x: -5, y: -120, r: 20 },
      neck: { x: -3, y: -90, r: 13 },
      shoulderL: { x: -42, y: -72, r: 18 }, // Hombro izquierdo tenso/elevado
      shoulderR: { x: 34, y: -68, r: 16 },
      elbowL: { x: -35, y: -15, r: 13 },
      elbowR: { x: 28, y: -18, r: 13 },
      handL: { x: -20, y: 30, r: 10 },
      handR: { x: 18, y: 25, r: 10 },
      hipL: { x: -20, y: 22, r: 18 },
      hipR: { x: 16, y: 22, r: 18 },
      kneeL: { x: -18, y: 80, r: 14 },
      kneeR: { x: 16, y: 80, r: 14 },
      footL: { x: -16, y: 145, r: 10 },
      footR: { x: 14, y: 145, r: 10 },
    };

    // 4. COLAPSO CLIMÁTICO (0.81 - 1.0): Encorvada, defensiva, cabeza hundida
    const poseCollapse = {
      head: { x: 0, y: -105, r: 18 },
      neck: { x: 0, y: -80, r: 14 },
      shoulderL: { x: -30, y: -65, r: 18 },
      shoulderR: { x: 30, y: -65, r: 18 },
      elbowL: { x: -18, y: -18, r: 13 },
      elbowR: { x: 18, y: -18, r: 13 },
      handL: { x: -8, y: 20, r: 10 },
      handR: { x: 8, y: 20, r: 10 },
      hipL: { x: -15, y: 20, r: 18 },
      hipR: { x: 15, y: 20, r: 18 },
      kneeL: { x: -12, y: 75, r: 14 },
      kneeR: { x: 12, y: 75, r: 14 },
      footL: { x: -10, y: 140, r: 10 },
      footR: { x: 10, y: 140, r: 10 },
    };

    // Selección e interpolación entre los 4 estados
    let targetPoseA, targetPoseB, t;
    if (stress < 0.3) {
      targetPoseA = poseCalm;
      targetPoseB = poseAlert;
      t = p.map(stress, 0, 0.3, 0, 1);
    } else if (stress < 0.65) {
      targetPoseA = poseAlert;
      targetPoseB = poseStress;
      t = p.map(stress, 0.3, 0.65, 0, 1);
    } else {
      targetPoseA = poseStress;
      targetPoseB = poseCollapse;
      t = p.map(stress, 0.65, 1.0, 0, 1);
    }

    const pose = {};
    for (let key in targetPoseA) {
      pose[key] = {
        x: p.lerp(targetPoseA[key].x, targetPoseB[key].x, t),
        y: p.lerp(targetPoseA[key].y, targetPoseB[key].y, t),
        r: p.lerp(targetPoseA[key].r, targetPoseB[key].r, t),
      };
    }
    return pose;
  }

  getEmotionalColor(p, stress) {
    let r, g, b;
    if (stress < 0.4) {
      let t = p.map(stress, 0, 0.4, 0, 1);
      r = p.lerp(20, 60, t);
      g = p.lerp(120, 200, t);
      b = p.lerp(240, 255, t);
    } else if (stress < 0.7) {
      let t = p.map(stress, 0.4, 0.7, 0, 1);
      r = p.lerp(60, 255, t);
      g = p.lerp(200, 245, t);
      b = p.lerp(255, 220, t);
    } else {
      let t = p.map(stress, 0.7, 1.0, 0, 1);
      r = p.lerp(255, 210, t);
      g = p.lerp(245, 20, t);
      b = p.lerp(220, 70, t);
    }
    return { r, g, b };
  }

  draw(p, stress, temperature) {
    p.push();

    // Posicionamiento en pantalla
    p.translate(p.width / 2, p.height / 2 - 10);
    let baseScale = p.map(p.height, 600, 1200, 1.1, 1.6);
    p.scale(baseScale);

    this.timeOff += 0.008 + stress * 0.02;

    const pose = this.getAnatomyPose(p, stress);
    const { r, g, b } = this.getEmotionalColor(p, stress);

    // --- 1. ILUMINACIÓN NATIVA INTERCOSTAL (CORAZÓN DIFUSO) ---
    // En lugar de una elipse sólida, el pulso emana como un halo atmosférico detrás del torso
    p.drawingContext.shadowBlur = 25 + stress * 45;
    p.drawingContext.shadowColor = `rgba(${r}, ${g}, ${b}, ${0.4 + stress * 0.5})`;

    let heartY = (pose.neck.y + pose.hipL.y) * 0.45; // Ubicación natural del pecho
    let heartPulse =
      p.sin(p.frameCount * (0.04 + stress * 0.09)) * (8 + stress * 18);

    p.noStroke();
    p.fill(r, g, b, 90 + stress * 60);
    // Masa elíptica suave desdibujada intercostal
    p.ellipse(0, heartY, 35 + heartPulse, 50 + heartPulse);
    p.drawingContext.shadowBlur = 0; // Desactivar para optimizar dibujo lineal

    // --- 2. CABEZA DELINEADA (DESAMBIGUACIÓN ANATÓMICA) ---
    // Corona de hilos en la cabeza para identificarla como la extremidad superior
    p.noFill();
    p.stroke(r, g, b, 180);
    p.strokeWeight(1.0);
    for (let h = 0; h < 5; h++) {
      let hr = pose.head.r + h * 2;
      p.ellipse(pose.head.x, pose.head.y, hr * 0.9, hr * 1.1);
    }

    // --- 3. MASA TORÁCICA Y CATORCE CADENAS FILAMENTOSAS ---
    // Definimos la masa del torso como un tejido envolvente
    const torsoRibs = [];
    let ribSteps = 7;
    for (let i = 0; i <= ribSteps; i++) {
      let tStep = i / ribSteps;
      let rxL = p.lerp(pose.shoulderL.x, pose.hipL.x, tStep);
      let rxR = p.lerp(pose.shoulderR.x, pose.hipR.x, tStep);
      let ry = p.lerp(pose.shoulderL.y, pose.hipL.y, tStep);
      let width = (rxR - rxL) * 0.6;
      torsoRibs.push({ x: (rxL + rxR) / 2, y: ry, r: width });
    }

    const limbs = [
      // Torso Volumétrico (Masa Torácica)
      torsoRibs,
      // Extremidades independientes (Espacios Negativos)
      [pose.shoulderL, pose.elbowL, pose.handL],
      [pose.shoulderR, pose.elbowR, pose.handR],
      [pose.hipL, pose.kneeL, pose.footL],
      [pose.hipR, pose.kneeR, pose.footR],
    ];

    let strandCount = p.floor(p.map(stress, 0, 1, 8, 16));

    for (let limbIndex = 0; limbIndex < limbs.length; limbIndex++) {
      let limb = limbs[limbIndex];
      let isTorso = limbIndex === 0;

      for (let s = 0; s < strandCount; s++) {
        let alpha = p.map(s, 0, strandCount, isTorso ? 210 : 180, 30);
        p.stroke(r, g, b, alpha);
        p.strokeWeight(p.map(s, 0, strandCount, isTorso ? 1.4 : 1.0, 0.4));

        p.beginShape();
        for (let i = 0; i < limb.length; i++) {
          let node = limb[i];
          let n = p.noise(node.x * 0.02, node.y * 0.02 + s * 0.1, this.timeOff);
          let offset = p.map(n, 0, 1, -node.r, node.r) * (0.7 + stress * 1.1);

          let vx = node.x + offset + (s - strandCount / 2) * 1.3;
          let vy = node.y;

          // Difusión paulatina hacia la base (pies) para evitar el efecto holograma
          if (!isTorso && i === limb.length - 1 && node.y > 100) {
            vy += s * 1.2; // Desvanecimiento suave en el suelo
          }

          // Jitter de alta tensión
          if (stress > 0.75 && p.random(1) < 0.035) {
            vx += p.random(-5, 5);
          }

          p.vertex(vx, vy);
        }
        p.endShape();
      }
    }

    p.pop();
  }
}
