/**
 * MÓDULO ANATÓMICO: Látice Cristalino (Cero Absoluto - Prototipo Alternativo)
 * Estructura mineral/arquitectónica con dinámica de fractura geométrica.
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
      head: { x: -10, y: 100, z: 25 },
      neck: { x: -5, y: 78, z: 15 },
      shoulderL: { x: -30, y: 58, z: 20 },
      shoulderR: { x: 28, y: 56, z: 20 },
      elbowL: { x: -15, y: 10, z: 30 },
      elbowR: { x: 15, y: 10, z: 30 },
      handL: { x: -5, y: -25, z: 35 },
      handR: { x: 5, y: -25, z: 35 },
      hipL: { x: -12, y: -16, z: 8 },
      hipR: { x: 12, y: -16, z: 8 },
      kneeL: { x: -10, y: -68, z: 15 },
      kneeR: { x: 10, y: -68, z: 15 },
      footL: { x: -8, y: -128, z: 20 },
      footR: { x: 8, y: -128, z: 20 },
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
        r: lerp(0.0, 0.3, t),
        g: lerp(0.7, 0.9, t),
        b: lerp(0.9, 1.0, t),
      };
    } else {
      let t = map(stress, 0.5, 1.0, 0, 1);
      return {
        r: lerp(0.3, 1.0, t),
        g: lerp(0.9, 0.1, t),
        b: lerp(1.0, 0.2, t),
      };
    }
  }

  /**
   * Genera un segmento de Látice Polieledro con aristas rectas y fractura angular
   */
  generateCrystallineLattice(
    pStart,
    pEnd,
    radiusMax,
    sides,
    sections,
    stress,
    frameCount,
  ) {
    const v = {
      x: pEnd.x - pStart.x,
      y: pEnd.y - pStart.y,
      z: pEnd.z - pStart.z,
    };
    const { u, w } = getOrthonormalBasis(v);
    const ringRays = [];

    // 1. Construir anillos poligonales a lo largo del segmento
    for (let s = 0; s <= sections; s++) {
      const t = s / sections;
      const cx = lerp(pStart.x, pEnd.x, t);
      const cy = lerp(pStart.y, pEnd.y, t);
      const cz = lerp(pStart.z, pEnd.z, t);

      // Perfil de anchura rígido (facetado)
      const radius = radiusMax * Math.sin(t * Math.PI) + 3;
      const ringVertices = [];

      // Cizallamiento tectónico por estrés (desplazamiento brusco en bloques)
      const fractureShiftX =
        Math.sign(Math.sin(s * 3.0 + this.timeOff)) * (stress * 12.0);
      const fractureShiftZ =
        Math.sign(Math.cos(s * 2.5 + this.timeOff)) * (stress * 12.0);

      for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * Math.PI * 2;

        // Rotación de facetado rígido bajo estrés
        const angularDislocation =
          stress > 0.4 ? Math.floor(stress * 4) * 0.2 : 0;
        const totalAngle = angle + angularDislocation;

        const vx =
          cx +
          (u.x * Math.cos(totalAngle) + w.x * Math.sin(totalAngle)) * radius +
          fractureShiftX;
        const vy =
          cy +
          (u.y * Math.cos(totalAngle) + w.y * Math.sin(totalAngle)) * radius;
        const vz =
          cz +
          (u.z * Math.cos(totalAngle) + w.z * Math.sin(totalAngle)) * radius +
          fractureShiftZ;

        ringVertices.push({ x: vx, y: vy, z: vz });
      }
      ringRays.push(ringVertices);
    }

    // 2. Unir vértices para formar las aristas del Látice
    const latticeStrands = [];

    // Aristas Longitudinales
    for (let i = 0; i < sides; i++) {
      const line = [];
      for (let s = 0; s <= sections; s++) {
        line.push(ringRays[s][i]);
      }
      latticeStrands.push(line);
    }

    // Aristas Anulares (Anillos transversales)
    for (let s = 0; s <= sections; s++) {
      const ring = ringRays[s];
      const closedRing = [...ring, ring[0]]; // Cerrar el polígono
      latticeStrands.push(closedRing);
    }

    return { latticeStrands, ringRays };
  }

  updateFrameData(stress, frameCount) {
    this.timeOff += 0.005 + stress * 0.03;
    const pose = this.getAnatomyPose(stress);
    const color = this.getEmotionalColor(stress);

    // Corazón Cúbico / Geométrico
    const heartY = (pose.neck.y + pose.hipL.y) * 0.45;
    const heartPulse =
      Math.sin(frameCount * (0.05 + stress * 0.1)) * (2 + stress * 5);
    const heart = {
      position: { x: 0, y: heartY, z: 2 },
      radius: 8 + heartPulse,
      intensity: 0.8 + stress * 0.7,
    };

    // Estructura de Secciones Cristalinas
    const crystalGroups = [
      { start: pose.head, end: pose.neck, radius: 10, sides: 6, sections: 3 },
      {
        start: pose.neck,
        end: { x: 0, y: (pose.neck.y + pose.hipL.y) / 2, z: 0 },
        radius: 22,
        sides: 8,
        sections: 5,
      },
      {
        start: { x: 0, y: (pose.neck.y + pose.hipL.y) / 2, z: 0 },
        end: pose.hipL,
        radius: 18,
        sides: 6,
        sections: 4,
      },
      {
        start: { x: 0, y: (pose.neck.y + pose.hipL.y) / 2, z: 0 },
        end: pose.hipR,
        radius: 18,
        sides: 6,
        sections: 4,
      },
      {
        start: pose.shoulderL,
        end: pose.elbowL,
        radius: 14,
        sides: 5,
        sections: 3,
      },
      {
        start: pose.shoulderR,
        end: pose.elbowR,
        radius: 14,
        sides: 5,
        sections: 3,
      },
      {
        start: pose.elbowL,
        end: pose.handL,
        radius: 10,
        sides: 4,
        sections: 3,
      },
      {
        start: pose.elbowR,
        end: pose.handR,
        radius: 10,
        sides: 4,
        sections: 3,
      },
      { start: pose.hipL, end: pose.kneeL, radius: 16, sides: 6, sections: 4 },
      { start: pose.hipR, end: pose.kneeR, radius: 16, sides: 6, sections: 4 },
      { start: pose.kneeL, end: pose.footL, radius: 12, sides: 5, sections: 3 },
      { start: pose.kneeR, end: pose.footR, radius: 12, sides: 5, sections: 3 },
    ];

    const strands = [];
    const cloudNodes = [];

    for (let group of crystalGroups) {
      const { latticeStrands, ringRays } = this.generateCrystallineLattice(
        group.start,
        group.end,
        group.radius,
        group.sides,
        group.sections,
        stress,
        frameCount,
      );
      strands.push(...latticeStrands);

      // Extraer los vértices del cristal para formar los nodos brillantes
      for (let ring of ringRays) {
        for (let pt of ring) {
          // Desprendimiento de fragmentos cristalinos en estrés alto
          let nodeX = pt.x;
          let nodeY = pt.y;
          let nodeZ = pt.z;

          if (stress > 0.4) {
            const shardDrift = (stress - 0.4) * 20.0;
            nodeX += Math.sin(pt.y * 0.1 + this.timeOff) * shardDrift;
            nodeZ += Math.cos(pt.x * 0.1 + this.timeOff) * shardDrift;
          }

          cloudNodes.push({ x: nodeX, y: nodeY, z: nodeZ });
        }
      }
    }

    return {
      pose,
      color,
      heart,
      strands,
      cloud: cloudNodes,
    };
  }
}
