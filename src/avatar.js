// src/avatar.js
import { ArtConfig } from "./ArtDirection.js";

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpPos(pA, pB, t) {
  return {
    x: lerp(pA.x, pB.x, t),
    y: lerp(pA.y, pB.y, t),
    z: lerp(pA.z, pB.z, t),
  };
}

function buildOrthonormalBasis(dir) {
  const d = { ...dir };
  const len = Math.sqrt(d.x * d.x + d.y * d.y + d.z * d.z) || 1;
  d.x /= len;
  d.y /= len;
  d.z /= len;

  let up = { x: 0, y: 1, z: 0 };
  if (Math.abs(d.y) > 0.9) {
    up = { x: 1, y: 0, z: 0 };
  }

  const rX = d.y * up.z - d.z * up.y;
  const rY = d.z * up.x - d.x * up.z;
  const rZ = d.x * up.y - d.y * up.x;
  const rLen = Math.sqrt(rX * rX + rY * rY + rZ * rZ) || 1;
  const right = { x: rX / rLen, y: rY / rLen, z: rZ / rLen };

  const uX = right.y * d.z - right.z * d.y;
  const uY = right.z * d.x - right.x * d.z;
  const uZ = right.x * d.y - right.y * d.x;
  const upVector = { x: uX, y: uY, z: uZ };

  return { dir: d, right, up: upVector };
}

export class AvatarEngine {
  constructor() {
    this.timeOff = 0;
  }

  getAnatomyPose(stress) {
    const s = Math.max(0, Math.min(1, stress));

    const poseCalm = {
      head: { x: 0, y: 62, z: 0 },
      neck: { x: 0, y: 48, z: 0 },
      shoulderL: { x: -16, y: 42, z: 0 },
      shoulderR: { x: 16, y: 42, z: 0 },
      elbowL: { x: -28, y: 14, z: -4 },
      elbowR: { x: 28, y: 14, z: -4 },
      wristL: { x: -36, y: -16, z: -8 },
      wristR: { x: 36, y: -16, z: -8 },
      hipL: { x: -10, y: -30, z: 0 },
      hipR: { x: 10, y: -30, z: 0 },
      kneeL: { x: -14, y: -72, z: 4 },
      kneeR: { x: 14, y: -72, z: 4 },
      ankleL: { x: -16, y: -116, z: 0 },
      ankleR: { x: 16, y: -116, z: 0 },
    };

    const poseStress = {
      head: { x: 4, y: 66, z: 8 },
      neck: { x: 2, y: 50, z: 4 },
      shoulderL: { x: -22, y: 46, z: -6 },
      shoulderR: { x: 18, y: 38, z: 8 },
      elbowL: { x: -40, y: 22, z: 12 },
      elbowR: { x: 34, y: 2, z: -16 },
      wristL: { x: -54, y: -2, z: 28 },
      wristR: { x: 44, y: -28, z: -24 },
      hipL: { x: -14, y: -32, z: -4 },
      hipR: { x: 12, y: -28, z: 6 },
      kneeL: { x: -20, y: -76, z: 18 },
      kneeR: { x: 10, y: -68, z: -12 },
      ankleL: { x: -24, y: -120, z: 28 },
      ankleR: { x: 14, y: -112, z: -18 },
    };

    const currentPose = {};
    for (let joint in poseCalm) {
      currentPose[joint] = lerpPos(poseCalm[joint], poseStress[joint], s);
    }
    return currentPose;
  }

  generateCrystallineLattice(
    pStart,
    pEnd,
    radiusMax,
    sides,
    sections,
    stress,
    frameCount,
  ) {
    const strands = [];
    const dir = {
      x: pEnd.x - pStart.x,
      y: pEnd.y - pStart.y,
      z: pEnd.z - pStart.z,
    };
    const basis = buildOrthonormalBasis(dir);
    const s = Math.max(0, Math.min(1, stress));

    // Fractura tectónica configurada por Dirección de Arte
    const fractureShiftX =
      Math.sign(Math.sin(s * 3.5 + this.timeOff)) *
      (s > ArtConfig.avatar.fisicas.umbralFractura
        ? s * ArtConfig.avatar.fisicas.multiplicadorTension
        : 0);

    for (let side = 0; side < sides; side++) {
      const strandPoints = [];
      const angleBase = (side / sides) * Math.PI * 2;

      for (let sec = 0; sec <= sections; sec++) {
        const t = sec / sections;
        const profileRadius = Math.sin(t * Math.PI) * radiusMax;

        const noiseA =
          Math.sin(t * 12.0 + side + frameCount * 0.04) * (s * 4.5);
        const noiseB = Math.cos(t * 8.0 - side + frameCount * 0.03) * (s * 4.5);

        const angle = angleBase + noiseA * 0.15;
        const r = profileRadius + noiseB;

        const basePos = lerpPos(pStart, pEnd, t);

        const localR = Math.cos(angle) * r;
        const localU = Math.sin(angle) * r;

        let posX = basePos.x + basis.right.x * localR + basis.up.x * localU;
        let posY = basePos.y + basis.right.y * localR + basis.up.y * localU;
        let posZ = basePos.z + basis.right.z * localR + basis.up.z * localU;

        if (t > 0.3 && t < 0.7) {
          posX += fractureShiftX;
        }

        strandPoints.push({ x: posX, y: posY, z: posZ });
      }
      strands.push(strandPoints);
    }
    return strands;
  }

  updateFrameData(stress, frameCount) {
    this.timeOff += 0.005 + stress * 0.03;
    const pose = this.getAnatomyPose(stress);

    // Posición del corazón tectónico
    const heartY = (pose.neck.y + pose.hipL.y) * 0.45;
    const heartPulse =
      Math.sin(frameCount * (0.05 + stress * 0.1)) * (1.5 + stress * 4.0);

    const heart = {
      position: { x: 0, y: heartY, z: 2 },
      radius: ArtConfig.avatar.corazon.radioBase + heartPulse,
      intensidad: 0.5 + stress * 1.5,
    };

    const crystalGroups = [
      { start: pose.head, end: pose.neck, r: 8.0, sides: 5, sec: 8 },
      { start: pose.neck, end: pose.shoulderL, r: 4.5, sides: 4, sec: 6 },
      { start: pose.neck, end: pose.shoulderR, r: 4.5, sides: 4, sec: 6 },
      { start: pose.shoulderL, end: pose.elbowL, r: 4.0, sides: 4, sec: 8 },
      { start: pose.shoulderR, end: pose.elbowR, r: 4.0, sides: 4, sec: 8 },
      { start: pose.elbowL, end: pose.wristL, r: 3.2, sides: 3, sec: 8 },
      { start: pose.elbowR, end: pose.wristR, r: 3.2, sides: 3, sec: 8 },
      { start: pose.neck, end: pose.hipL, r: 10.0, sides: 6, sec: 12 },
      { start: pose.neck, end: pose.hipR, r: 10.0, sides: 6, sec: 12 },
      { start: pose.hipL, end: pose.hipR, r: 7.0, sides: 4, sec: 6 },
      { start: pose.hipL, end: pose.kneeL, r: 5.5, sides: 4, sec: 10 },
      { start: pose.hipR, end: pose.kneeR, r: 5.5, sides: 4, sec: 10 },
      { start: pose.kneeL, end: pose.ankleL, r: 4.0, sides: 4, sec: 10 },
      { start: pose.kneeR, end: pose.ankleR, r: 4.0, sides: 4, sec: 10 },
    ];

    const strands = [];
    crystalGroups.forEach((g) => {
      const generated = this.generateCrystallineLattice(
        g.start,
        g.end,
        g.r,
        g.sides,
        g.sec,
        stress,
        frameCount,
      );
      strands.push(...generated);
    });

    // Esquirlas desprendidas de carbón
    const cloudNodes = [];
    const cloudCount = Math.floor(120 + stress * 350);
    for (let i = 0; i < cloudCount; i++) {
      const t = i / cloudCount;
      const seed = i * 1.7;
      const angle = seed + frameCount * 0.02;
      const spread = 8 + stress * 35;

      const x =
        Math.sin(angle * 2.3) * spread + (Math.random() - 0.5) * stress * 20;
      const y = lerp(-116, 62, t) + Math.cos(angle * 1.5) * 10;
      const z = Math.cos(angle * 2.3) * spread + (Math.random() - 0.5) * 15;

      cloudNodes.push({ x, y, z });
    }

    return {
      pose,
      heart,
      strands,
      cloud: cloudNodes,
      stressFactor: stress,
    };
  }
}
