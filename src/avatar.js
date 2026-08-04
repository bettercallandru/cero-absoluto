/**
 * MÓDULO ANATÓMICO: Generador de Coordenadas y Poses 3D (Cero Absoluto)
 * Puramente matemático: No realiza llamadas de dibujo ni depende de p5.js
 */

// --- FUNCIONES MATEMÁTICAS AUXILIARES ---
function lerp(start, end, amt) {
  return (1 - amt) * start + amt * end;
}

function map(value, inMin, inMax, outMin, outMax) {
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

// Generador de ruido pseudo-aleatorio suave para filamentos 3D
function simpleNoise3D(x, y, z) {
  return (
    Math.sin(x * 1.5 + z) * 0.4 +
    Math.cos(y * 2.1 + x) * 0.4 +
    Math.sin(z * 3.2 + y) * 0.2
  );
}

export class AvatarEngine {
  constructor() {
    this.timeOff = 0;
  }

  /**
   * Poses anatómicas definidas en espacio 3D (Eje Y positivo hacia arriba)
   */
  getAnatomyPose(stress) {
    // 1. CALMA / INMERSIÓN (0.0 - 0.25): Flotante, abierta
    const poseCalm = {
      head: { x: 2, y: 120, z: 0, r: 20 },
      neck: { x: 0, y: 90, z: 0, r: 12 },
      shoulderL: { x: -45, y: 70, z: 5, r: 15 },
      shoulderR: { x: 42, y: 68, z: -5, r: 15 },
      elbowL: { x: -58, y: 20, z: 15, r: 11 },
      elbowR: { x: 55, y: 22, z: -10, r: 11 },
      handL: { x: -48, y: -30, z: 25, r: 9 },
      handR: { x: 45, y: -25, z: -15, r: 9 },
      hipL: { x: -22, y: -25, z: 0, r: 16 },
      hipR: { x: 18, y: -25, z: 0, r: 16 },
      kneeL: { x: -28, y: -80, z: 10, r: 13 },
      kneeR: { x: 24, y: -80, z: -5, r: 13 },
      footL: { x: -25, y: -140, z: 15, r: 9 },
      footR: { x: 20, y: -140, z: -10, r: 9 },
    };

    // 2. TENSIÓN / ALERTA (0.26 - 0.55): Erguida, erguido vertical
    const poseAlert = {
      head: { x: 0, y: 125, z: 0, r: 19 },
      neck: { x: 0, y: 92, z: 0, r: 12 },
      shoulderL: { x: -40, y: 72, z: 0, r: 15 },
      shoulderR: { x: 40, y: 72, z: 0, r: 15 },
      elbowL: { x: -48, y: 18, z: 5, r: 11 },
      elbowR: { x: 48, y: 18, z: -5, r: 11 },
      handL: { x: -35, y: -28, z: 10, r: 9 },
      handR: { x: 35, y: -28, z: -10, r: 9 },
      hipL: { x: -18, y: -25, z: 0, r: 16 },
      hipR: { x: 18, y: -25, z: 0, r: 16 },
      kneeL: { x: -20, y: -80, z: 0, r: 13 },
      kneeR: { x: 20, y: -80, z: 0, r: 13 },
      footL: { x: -18, y: -140, z: 0, r: 9 },
      footR: { x: 18, y: -140, z: 0, r: 9 },
    };

    // 3. ESTRÉS / FRICCIÓN (0.56 - 0.80): Asimétrica, contraída
    const poseStress = {
      head: { x: -5, y: 115, z: 10, r: 18 },
      neck: { x: -3, y: 88, z: 5, r: 12 },
      shoulderL: { x: -40, y: 68, z: 12, r: 16 },
      shoulderR: { x: 32, y: 62, z: -8, r: 15 },
      elbowL: { x: -32, y: 12, z: 18, r: 11 },
      elbowR: { x: 26, y: 15, z: -12, r: 11 },
      handL: { x: -18, y: -28, z: 20, r: 9 },
      handR: { x: 16, y: -24, z: -15, r: 9 },
      hipL: { x: -18, y: -22, z: 2, r: 16 },
      hipR: { x: 14, y: -22, z: -2, r: 16 },
      kneeL: { x: -16, y: -75, z: 8, r: 13 },
      kneeR: { x: 14, y: -75, z: -6, r: 13 },
      footL: { x: -14, y: -135, z: 10, r: 9 },
      footR: { x: 12, y: -135, z: -8, r: 9 },
    };

    // 4. COLAPSO CLIMÁTICO (0.81 - 1.0): Defensiva, encorvada hacia adelante
    const poseCollapse = {
      head: { x: 0, y: 100, z: 25, r: 17 },
      neck: { x: 0, y: 78, z: 18, r: 13 },
      shoulderL: { x: -28, y: 60, z: 20, r: 16 },
      shoulderR: { x: 28, y: 60, z: 20, r: 16 },
      elbowL: { x: -16, y: 15, z: 25, r: 11 },
      elbowR: { x: 16, y: 15, z: 25, r: 11 },
      handL: { x: -8, y: -20, z: 28, r: 9 },
      handR: { x: 8, y: -20, z: 28, r: 9 },
      hipL: { x: -14, y: -20, z: 5, r: 16 },
      hipR: { x: 14, y: -20, z: 5, r: 16 },
      kneeL: { x: -11, y: -70, z: 12, r: 13 },
      kneeR: { x: 11, y: -70, z: 12, r: 13 },
      footL: { x: -9, y: -130, z: 15, r: 9 },
      footR: { x: 9, y: -130, z: 15, r: 9 },
    };

    let targetPoseA, targetPoseB, t;
    if (stress < 0.3) {
      targetPoseA = poseCalm;
      targetPoseB = poseAlert;
      t = map(stress, 0, 0.3, 0, 1);
    } else if (stress < 0.65) {
      targetPoseA = poseAlert;
      targetPoseB = poseStress;
      t = map(stress, 0.3, 0.65, 0, 1);
    } else {
      targetPoseA = poseStress;
      targetPoseB = poseCollapse;
      t = map(stress, 0.65, 1.0, 0, 1);
    }

    const pose = {};
    for (let key in targetPoseA) {
      pose[key] = {
        x: lerp(targetPoseA[key].x, targetPoseB[key].x, t),
        y: lerp(targetPoseA[key].y, targetPoseB[key].y, t),
        z: lerp(targetPoseA[key].z, targetPoseB[key].z, t),
        r: lerp(targetPoseA[key].r, targetPoseB[key].r, t),
      };
    }
    return pose;
  }

  /**
   * Color RGB normalizado (0.0 a 1.0) para compatibilidad directa con THREE.Color
   */
  getEmotionalColor(stress) {
    let r, g, b;
    if (stress < 0.4) {
      let t = map(stress, 0, 0.4, 0, 1);
      r = lerp(0.08, 0.24, t);
      g = lerp(0.47, 0.78, t);
      b = lerp(0.94, 1.0, t);
    } else if (stress < 0.7) {
      let t = map(stress, 0.4, 0.7, 0, 1);
      r = lerp(0.24, 1.0, t);
      g = lerp(0.78, 0.96, t);
      b = lerp(1.0, 0.86, t);
    } else {
      let t = map(stress, 0.7, 1.0, 0, 1);
      r = lerp(1.0, 0.82, t);
      g = lerp(0.96, 0.08, t);
      b = lerp(0.86, 0.27, t);
    }
    return { r, g, b };
  }

  /**
   * Genera toda la estructura geométrica 3D requerida por el renderizador
   */
  updateFrameData(stress, frameCount) {
    this.timeOff += 0.008 + stress * 0.02;

    const pose = this.getAnatomyPose(stress);
    const color = this.getEmotionalColor(stress);

    // 1. Datos del Corazón (Núcleo intercostal)
    const heartY = (pose.neck.y + pose.hipL.y) * 0.45;
    const heartPulse =
      Math.sin(frameCount * (0.04 + stress * 0.09)) * (3 + stress * 8);

    const heart = {
      position: { x: 0, y: heartY, z: 2 },
      radius: 12 + heartPulse,
      intensity: 0.5 + stress * 0.5,
    };

    // 2. Torso Volumétrico (Masa de costillas)
    const torsoRibs = [];
    const ribSteps = 7;
    for (let i = 0; i <= ribSteps; i++) {
      let tStep = i / ribSteps;
      let rxL = lerp(pose.shoulderL.x, pose.hipL.x, tStep);
      let rxR = lerp(pose.shoulderR.x, pose.hipR.x, tStep);
      let ry = lerp(pose.shoulderL.y, pose.hipL.y, tStep);
      let rz = lerp(pose.shoulderL.z, pose.hipL.z, tStep);
      let width = (rxR - rxL) * 0.6;
      torsoRibs.push({
        x: (rxL + rxR) / 2,
        y: ry,
        z: rz + Math.sin(tStep * Math.PI) * 10,
        r: width,
      });
    }

    // 3. Cadenas de Filamentos (Líneas 3D)
    const limbs = [
      torsoRibs,
      [pose.shoulderL, pose.elbowL, pose.handL],
      [pose.shoulderR, pose.elbowR, pose.handR],
      [pose.hipL, pose.kneeL, pose.footL],
      [pose.hipR, pose.kneeR, pose.footR],
    ];

    const strandCount = Math.floor(map(stress, 0, 1, 8, 16));
    const strands = [];

    for (let limbIndex = 0; limbIndex < limbs.length; limbIndex++) {
      let limb = limbs[limbIndex];

      for (let s = 0; s < strandCount; s++) {
        const strandPoints = [];

        for (let i = 0; i < limb.length; i++) {
          let node = limb[i];
          let noiseVal = simpleNoise3D(
            node.x * 0.02,
            node.y * 0.02 + s * 0.1,
            this.timeOff,
          );

          let offset = noiseVal * node.r * (0.7 + stress * 1.1);

          let vx = node.x + offset + (s - strandCount / 2) * 1.2;
          let vy = node.y;
          let vz = (node.z || 0) + offset * 0.5 + (s - strandCount / 2) * 0.8;

          // Jitter de estrés
          if (stress > 0.75 && Math.random() < 0.035) {
            vx += (Math.random() - 0.5) * 6;
            vz += (Math.random() - 0.5) * 6;
          }

          strandPoints.push({ x: vx, y: vy, z: vz });
        }
        strands.push(strandPoints);
      }
    }

    return {
      pose,
      color,
      heart,
      strands,
    };
  }
}
