/**
 * MÓDULO ANATÓMICO: Motor de Anatomía Vectorial, Nube Celular y Deterioro (Fases 1, 2 y 3)
 * Cero Absoluto - Simulación de Pérdida de Coherencia Anatómica
 */

function lerp(start, end, amt) {
  return (1 - amt) * start + amt * end;
}

function map(value, inMin, inMax, outMin, outMax) {
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

function getOrthonormalBasis(v) {
  const len = Math.hypot(v.x, v.y, v.z) || 1;
  const vNorm = { x: v.x / len, y: v.y / len, z: v.z / len };
  let ref =
    Math.abs(vNorm.y) > 0.9 ? { x: 1, y: 0, z: 0 } : { x: 0, y: 1, z: 0 };

  let u = {
    x: vNorm.y * ref.z - vNorm.z * ref.y,
    y: vNorm.z * ref.x - vNorm.x * ref.z,
    z: vNorm.x * ref.y - vNorm.y * ref.x,
  };
  const uLen = Math.hypot(u.x, u.y, u.z) || 1;
  u = { x: u.x / uLen, y: u.y / uLen, z: u.z / uLen };

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
      head: { x: -8, y: 102, z: 24 },
      neck: { x: -4, y: 80, z: 15 },
      shoulderL: { x: -30, y: 60, z: 22 },
      shoulderR: { x: 28, y: 58, z: 22 },
      elbowL: { x: -18, y: 12, z: 28 },
      elbowR: { x: 18, y: 12, z: 28 },
      handL: { x: -8, y: -24, z: 32 },
      handR: { x: 8, y: -24, z: 32 },
      hipL: { x: -14, y: -18, z: 6 },
      hipR: { x: 14, y: -18, z: 6 },
      kneeL: { x: -12, y: -70, z: 14 },
      kneeR: { x: 12, y: -70, z: 14 },
      footL: { x: -10, y: -130, z: 18 },
      footR: { x: 10, y: -130, z: 18 },
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
        g: lerp(0.85, 0.2, t),
        b: lerp(1.0, 0.25, t),
      };
    }
  }

  /**
   * Genera fascículos musculares con destrenzado tensional y desalineación por estrés
   */
  generateMuscleBundle(
    pStart,
    pEnd,
    rJoint,
    rBelly,
    fiberCount,
    stress,
    frameCount,
    steps = 12,
  ) {
    const v = {
      x: pEnd.x - pStart.x,
      y: pEnd.y - pStart.y,
      z: pEnd.z - pStart.z,
    };
    const { u, w } = getOrthonormalBasis(v);
    const fibers = [];

    // Factor de aflojamiento tensional (Aumento de radio y distorsión)
    const slack = 1.0 + stress * 1.8;

    for (let f = 0; f < fiberCount; f++) {
      const angle = (f / fiberCount) * Math.PI * 2;
      const points = [];

      for (let s = 0; s <= steps; s++) {
        const t = s / steps;

        // Desfase Anatómico Temporal (Retardo de extremidades según distancia al núcleo)
        const lagPhase =
          Math.sin(frameCount * 0.06 - t * 3.0 + f) * (stress * 14.0);

        const cx = lerp(pStart.x, pEnd.x, t) + u.x * lagPhase * 0.3;
        const cy = lerp(pStart.y, pEnd.y, t);
        const cz = lerp(pStart.z, pEnd.z, t) + w.z * lagPhase * 0.3;

        // Pérdida de perfil muscular: El vientre se deforma impredeciblemente
        const baseRadius =
          (rJoint + (rBelly - rJoint) * Math.sin(t * Math.PI)) * slack;
        const twist = angle + t * (0.8 - stress * 1.5); // El helicoide se destrenza

        // Ruido tensional de dispersión en alta tensión
        const noiseX = Math.sin(t * 10 + f + this.timeOff) * (stress * 8.0);
        const noiseZ = Math.cos(t * 10 + f + this.timeOff) * (stress * 8.0);

        const offsetX =
          (u.x * Math.cos(twist) + w.x * Math.sin(twist)) * baseRadius + noiseX;
        const offsetY =
          (u.y * Math.cos(twist) + w.y * Math.sin(twist)) * baseRadius;
        const offsetZ =
          (u.z * Math.cos(twist) + w.z * Math.sin(twist)) * baseRadius + noiseZ;

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

  /**
   * Nube celuloide con desprendimiento físico y evaporación según estrés
   */
  generateCellularCloud(strands, stress, frameCount) {
    const cloudPoints = [];
    const pulseSpeed = frameCount * 0.08;

    for (let i = 0; i < strands.length; i += 2) {
      const fiber = strands[i];
      for (let j = 0; j < fiber.length; j++) {
        const pt = fiber[j];

        // 1. Vibración celular base
        let vibeX = Math.sin(pulseSpeed + i + j) * (1.2 + stress * 2.0);
        let vibeY = Math.cos(pulseSpeed * 0.8 + i * 0.5) * (1.2 + stress * 2.0);
        let vibeZ = Math.sin(pulseSpeed * 1.2 + j * 0.4) * (1.2 + stress * 2.0);

        // 2. Desprendimiento Volumétrico (Evaporación atmosférica)
        if (stress > 0.3) {
          const detachFactor = Math.pow(stress, 2) * 35.0;
          const driftAngle = (i + j) * 0.3 + this.timeOff;

          vibeX += Math.cos(driftAngle) * detachFactor;
          vibeY += Math.sin(pulseSpeed * 0.5 + j) * (detachFactor * 0.6); // Flotación ascendente/descendente
          vibeZ += Math.sin(driftAngle) * detachFactor;
        }

        cloudPoints.push({
          x: pt.x + vibeX,
          y: pt.y + vibeY,
          z: pt.z + vibeZ,
        });
      }
    }
    return cloudPoints;
  }

  updateFrameData(stress, frameCount) {
    this.timeOff += 0.008 + stress * 0.025;
    const pose = this.getAnatomyPose(stress);
    const color = this.getEmotionalColor(stress);

    // Corazón / Núcleo
    const heartY = (pose.neck.y + pose.hipL.y) * 0.45;
    const heartPulse =
      Math.sin(frameCount * (0.04 + stress * 0.12)) * (2 + stress * 8);
    const heart = {
      position: { x: 0, y: heartY, z: 2 },
      radius: 10 + heartPulse,
      intensity: 0.6 + stress * 0.8,
    };

    // Definitivo de Fascículos Musculares 3D
    const muscleGroups = [
      { start: pose.head, end: pose.neck, rJoint: 6, rBelly: 12, count: 6 },
      {
        start: pose.neck,
        end: { x: 0, y: (pose.neck.y + pose.hipL.y) / 2, z: 0 },
        rJoint: 12,
        rBelly: 28,
        count: 12,
      },
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
        stress,
        frameCount,
      );
      strands.push(...groupFibers);
    }

    // Nube celular en desintegración progresiva
    const cloud = this.generateCellularCloud(strands, stress, frameCount);

    return {
      pose,
      color,
      heart,
      strands,
      cloud,
    };
  }
}
