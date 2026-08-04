/**
 * MÓDULO ANATÓMICO: Motor de Anatomía Vectorial 3D (Cero Absoluto - Fase 1)
 * Genera fibras musculares curvas y volumétricas rodeando los ejes óseos.
 */

// --- FUNCIONES MATEMÁTICAS VECTORIALES Y AUXILIARES ---
function lerp(start, end, amt) {
  return (1 - amt) * start + amt * end;
}

function map(value, inMin, inMax, outMin, outMax) {
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

// Genera un sistema de coordenadas perpendicular al vector del hueso
function getOrthonormalBasis(v) {
  const len = Math.hypot(v.x, v.y, v.z) || 1;
  const vNorm = { x: v.x / len, y: v.y / len, z: v.z / len };

  // Vector de referencia no colineal
  let ref =
    Math.abs(vNorm.y) > 0.9 ? { x: 1, y: 0, z: 0 } : { x: 0, y: 1, z: 0 };

  // Producto cruz vNorm x ref -> u
  let u = {
    x: vNorm.y * ref.z - vNorm.z * ref.y,
    y: vNorm.z * ref.x - vNorm.x * ref.z,
    z: vNorm.x * ref.y - vNorm.y * ref.x,
  };
  const uLen = Math.hypot(u.x, u.y, u.z) || 1;
  u = { x: u.x / uLen, y: u.y / uLen, z: u.z / uLen };

  // Producto cruz vNorm x u -> w
  let w = {
    x: vNorm.y * u.z - vNorm.z * u.y,
    y: vNorm.z * u.x - vNorm.x * u.z,
    z: vNorm.x * u.y - vNorm.y * u.x,
  };

  return { vNorm, u, w };
}

export class AvatarEngine {
  constructor() {
    this.timeOff = 0;
  }

  getAnatomyPose(stress) {
    // Poses anatómicas 3D (Calma, Alerta, Estrés, Colapso)
    const poseCalm = {
      head: { x: 0, y: 120, z: 0 },
      neck: { x: 0, y: 92, z: 0 },
      shoulderL: { x: -42, y: 72, z: 5 },
      shoulderR: { x: 42, y: 72, z: -5 },
      elbowL: { x: -58, y: 22, z: 15 },
      elbowR: { x: 58, y: 22, z: -10 },
      handL: { x: -48, y: -28, z: 25 },
      handR: { x: 48, y: -25, z: -15 },
      hipL: { x: -20, y: -22, z: 0 },
      hipR: { x: 20, y: -22, z: 0 },
      kneeL: { x: -26, y: -80, z: 10 },
      kneeR: { x: 24, y: -80, z: -5 },
      footL: { x: -22, y: -140, z: 15 },
      footR: { x: 20, y: -140, z: -10 },
    };

    const poseStress = {
      head: { x: -5, y: 105, z: 20 },
      neck: { x: -3, y: 82, z: 12 },
      shoulderL: { x: -32, y: 62, z: 18 },
      shoulderR: { x: 30, y: 60, z: 18 },
      elbowL: { x: -20, y: 15, z: 22 },
      elbowR: { x: 20, y: 15, z: 22 },
      handL: { x: -10, y: -20, z: 26 },
      handR: { x: 10, y: -20, z: 26 },
      hipL: { x: -16, y: -20, z: 4 },
      hipR: { x: 16, y: -20, z: 4 },
      kneeL: { x: -14, y: -72, z: 10 },
      kneeR: { x: 14, y: -72, z: 10 },
      footL: { x: -12, y: -132, z: 12 },
      footR: { x: 12, y: -132, z: 12 },
    };

    const pose = {};
    for (let key in poseCalm) {
      pose[key] = {
        x: lerp(poseCalm[key].x, poseStress[key].x, stress),
        y: lerp(poseCalm[key].y, poseStress[key].y, stress),
        z: lerp(poseCalm[key].z, poseStress[key].z, stress),
      };
    }
    return pose;
  }

  getEmotionalColor(stress) {
    if (stress < 0.5) {
      let t = map(stress, 0, 0.5, 0, 1);
      return {
        r: lerp(0.05, 0.2, t),
        g: lerp(0.5, 0.85, t),
        b: lerp(0.95, 1.0, t),
      };
    } else {
      let t = map(stress, 0.5, 1.0, 0, 1);
      return {
        r: lerp(0.2, 0.95, t),
        g: lerp(0.85, 0.25, t),
        b: lerp(1.0, 0.3, t),
      };
    }
  }

  /**
   * Genera un fascículo muscular volumétrico tridimensional compuesto por curvas de flujo
   */
  generateMuscleBundle(pStart, pEnd, rJoint, rBelly, fiberCount, steps = 12) {
    const v = {
      x: pEnd.x - pStart.x,
      y: pEnd.y - pStart.y,
      z: pEnd.z - pStart.z,
    };
    const { u, w } = getOrthonormalBasis(v);
    const fibers = [];

    for (let f = 0; f < fiberCount; f++) {
      const angle = (f / fiberCount) * Math.PI * 2;
      const points = [];

      for (let s = 0; s <= steps; s++) {
        const t = s / steps;

        // Interpolación del punto central sobre el hueso
        const cx = lerp(pStart.x, pEnd.x, t);
        const cy = lerp(pStart.y, pEnd.y, t);
        const cz = lerp(pStart.z, pEnd.z, t);

        // Perfil del vientre muscular (abultado al centro, ajustado en articulaciones)
        const radius = rJoint + (rBelly - rJoint) * Math.sin(t * Math.PI);

        // Torsión helicoidal suave a lo largo del músculo
        const twist = angle + t * 0.8;

        const offsetX =
          (u.x * Math.cos(twist) + w.x * Math.sin(twist)) * radius;
        const offsetY =
          (u.y * Math.cos(twist) + w.y * Math.sin(twist)) * radius;
        const offsetZ =
          (u.z * Math.cos(twist) + w.z * Math.sin(twist)) * radius;

        points.push({
          x: cx + offsetX,
          y: cy + offsetY,
          z: cz + offsetZ,
        });
      }
      fibers.push(points);
    }
    return fibers;
  }

  updateFrameData(stress, frameCount) {
    this.timeOff += 0.008 + stress * 0.02;
    const pose = this.getAnatomyPose(stress);
    const color = this.getEmotionalColor(stress);

    // 1. Corazón / Núcleo
    const heartY = (pose.neck.y + pose.hipL.y) * 0.45;
    const heartPulse =
      Math.sin(frameCount * (0.04 + stress * 0.09)) * (2 + stress * 6);
    const heart = {
      position: { x: 0, y: heartY, z: 2 },
      radius: 10 + heartPulse,
      intensity: 0.6 + stress * 0.6,
    };

    // 2. Definición de Fascículos Musculares (Masa Corporal 3D)
    const muscleGroups = [
      // Cuello
      { start: pose.head, end: pose.neck, rJoint: 6, rBelly: 12, count: 6 },
      // Pecho / Torso
      {
        start: pose.neck,
        end: { x: 0, y: (pose.neck.y + pose.hipL.y) / 2, z: 0 },
        rJoint: 12,
        rBelly: 28,
        count: 12,
      },
      // Abdomen / Pelvis
      {
        start: { x: 0, y: (pose.neck.y + pose.hipL.y) / 2, z: 0 },
        end: pose.hipL,
        rJoint: 22,
        rBelly: 18,
        count: 8,
      },
      {
        start: { x: 0, y: (pose.neck.y + pose.hipL.y) / 2, z: 0 },
        end: pose.hipR,
        rJoint: 22,
        rBelly: 18,
        count: 8,
      },
      // Brazos (Deltoides, Bíceps, Antebrazos)
      {
        start: pose.shoulderL,
        end: pose.elbowL,
        rJoint: 9,
        rBelly: 16,
        count: 8,
      },
      {
        start: pose.shoulderR,
        end: pose.elbowR,
        rJoint: 9,
        rBelly: 16,
        count: 8,
      },
      { start: pose.elbowL, end: pose.handL, rJoint: 7, rBelly: 12, count: 6 },
      { start: pose.elbowR, end: pose.handR, rJoint: 7, rBelly: 12, count: 6 },
      // Piernas (Cuádriceps y Pantorrillas)
      { start: pose.hipL, end: pose.kneeL, rJoint: 12, rBelly: 22, count: 10 },
      { start: pose.hipR, end: pose.kneeR, rJoint: 12, rBelly: 22, count: 10 },
      { start: pose.kneeL, end: pose.footL, rJoint: 9, rBelly: 15, count: 8 },
      { start: pose.kneeR, end: pose.footR, rJoint: 9, rBelly: 15, count: 8 },
    ];

    const strands = [];
    for (let group of muscleGroups) {
      const groupFibers = this.generateMuscleBundle(
        group.start,
        group.end,
        group.rJoint,
        group.rBelly,
        group.count,
      );
      strands.push(...groupFibers);
    }

    return {
      pose,
      color,
      heart,
      strands,
    };
  }
}
