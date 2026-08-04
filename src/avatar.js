/**
 * MÓDULO ANATÓMICO: Látice Cristalino Refinado (Calidad Expositiva - Prioridad 1)
 * Silueta estilizada, alta fragilidad anatómica y pose asimétrica pasiva.
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

  /**
   * Poses anatómicas con micro-desequilibrio asimétrico pasivo (Escultura viva)
   */
  getAnatomyPose(stress) {
    // Pose en Calma: Leve inclinación orgánica en hombros y cadera
    const poseCalm = {
      head: { x: 3, y: 124, z: 2 },
      neck: { x: 0, y: 94, z: 0 },
      shoulderL: { x: -36, y: 74, z: 2 },
      shoulderR: { x: 36, y: 70, z: -4 }, // Hombro derecho sutilmente más bajo y atrás
      elbowL: { x: -50, y: 24, z: 12 },
      elbowR: { x: 48, y: 20, z: -12 },
      handL: { x: -40, y: -26, z: 20 },
      handR: { x: 42, y: -28, z: -18 },
      hipL: { x: -17, y: -22, z: 2 },
      hipR: { x: 17, y: -24, z: -2 }, // Larga inclinación pélvica pasiva
      kneeL: { x: -21, y: -82, z: 8 },
      kneeR: { x: 19, y: -84, z: -8 },
      footL: { x: -17, y: -142, z: 12 },
      footR: { x: 15, y: -142, z: -12 },
    };

    // Pose bajo Estrés: Tensión comprimida hacia adelante y encogimiento tensional
    const poseStress = {
      head: { x: -8, y: 104, z: 26 },
      neck: { x: -4, y: 82, z: 16 },
      shoulderL: { x: -26, y: 62, z: 22 },
      shoulderR: { x: 24, y: 58, z: 18 },
      elbowL: { x: -14, y: 12, z: 28 },
      elbowR: { x: 14, y: 8, z: 24 },
      handL: { x: -4, y: -22, z: 32 },
      handR: { x: 4, y: -24, z: 30 },
      hipL: { x: -11, y: -16, z: 8 },
      hipR: { x: 11, y: -18, z: 6 },
      kneeL: { x: -9, y: -68, z: 16 },
      kneeR: { x: 9, y: -70, z: 12 },
      footL: { x: -7, y: -128, z: 20 },
      footR: { x: 7, y: -130, z: 16 },
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
        r: lerp(0.0, 0.25, t),
        g: lerp(0.75, 0.9, t),
        b: lerp(0.95, 1.0, t),
      };
    } else {
      let t = map(stress, 0.5, 1.0, 0, 1);
      return {
        r: lerp(0.25, 1.0, t),
        g: lerp(0.9, 0.15, t),
        b: lerp(1.0, 0.25, t),
      };
    }
  }

  /**
   * Genera el segmento polifacético con aristas cristalinas delgadas y fractura tectónica
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

    for (let s = 0; s <= sections; s++) {
      const t = s / sections;
      const cx = lerp(pStart.x, pEnd.x, t);
      const cy = lerp(pStart.y, pEnd.y, t);
      const cz = lerp(pStart.z, pEnd.z, t);

      // Perfil de anchura con estilización en los extremos de la articulación
      const radius = radiusMax * Math.sin(t * Math.PI) + 1.8;
      const ringVertices = [];

      // Cizallamiento tectónico discontinuo (salto en bloques en alta tensión)
      const fractureShiftX =
        Math.sign(Math.sin(s * 3.5 + this.timeOff)) * (stress * 10.0);
      const fractureShiftZ =
        Math.sign(Math.cos(s * 2.8 + this.timeOff)) * (stress * 10.0);

      for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * Math.PI * 2;

        // Dislocación angular rígida bajo estrés
        const angularDislocation =
          stress > 0.35 ? Math.floor(stress * 5) * 0.15 : 0;
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

    const latticeStrands = [];

    // Aristas Longitudinales
    for (let i = 0; i < sides; i++) {
      const line = [];
      for (let s = 0; s <= sections; s++) {
        line.push(ringRays[s][i]);
      }
      latticeStrands.push(line);
    }

    // Aristas Anulares (Anillos poligonales transversales)
    for (let s = 0; s <= sections; s++) {
      const ring = ringRays[s];
      const closedRing = [...ring, ring[0]];
      latticeStrands.push(closedRing);
    }

    return { latticeStrands, ringRays };
  }

  updateFrameData(stress, frameCount) {
    this.timeOff += 0.005 + stress * 0.03;
    const pose = this.getAnatomyPose(stress);
    const color = this.getEmotionalColor(stress);

    // Corazón Geométrico Facetado (Icosaedro)
    const heartY = (pose.neck.y + pose.hipL.y) * 0.45;
    const heartPulse =
      Math.sin(frameCount * (0.05 + stress * 0.1)) * (1.5 + stress * 4.0);
    const heart = {
      position: { x: 0, y: heartY, z: 2 },
      radius: 6.5 + heartPulse,
      intensity: 0.8 + stress * 0.7,
    };

    // TABLA REFINADA DE SECCIONES ANATÓMICAS (Proporciones Esbeltas para Exhibición)
    const crystalGroups = [
      // Cabeza: Nido denso de cristal (Alta frecuencia polifacética)
      { start: pose.head, end: pose.neck, radius: 7.5, sides: 8, sections: 5 },

      // Torso Superior y Pecho: Comprimido y elegante
      {
        start: pose.neck,
        end: { x: 0, y: (pose.neck.y + pose.hipL.y) / 2, z: 0 },
        radius: 14.5,
        sides: 7,
        sections: 4,
      },

      // Abdomen y Pelvis: Estructura ósea limpia
      {
        start: { x: 0, y: (pose.neck.y + pose.hipL.y) / 2, z: 0 },
        end: pose.hipL,
        radius: 11.0,
        sides: 6,
        sections: 4,
      },
      {
        start: { x: 0, y: (pose.neck.y + pose.hipL.y) / 2, z: 0 },
        end: pose.hipR,
        radius: 11.0,
        sides: 6,
        sections: 4,
      },

      // Extremidades Superiores: Hilos cristalinos ligeros
      {
        start: pose.shoulderL,
        end: pose.elbowL,
        radius: 6.5,
        sides: 5,
        sections: 4,
      },
      {
        start: pose.shoulderR,
        end: pose.elbowR,
        radius: 6.5,
        sides: 5,
        sections: 4,
      },
      {
        start: pose.elbowL,
        end: pose.handL,
        radius: 4.0,
        sides: 4,
        sections: 3,
      },
      {
        start: pose.elbowR,
        end: pose.handR,
        radius: 4.0,
        sides: 4,
        sections: 3,
      },

      // Extremidades Inferiores: Apoyo vertical elongado (Giacometti-like)
      { start: pose.hipL, end: pose.kneeL, radius: 9.0, sides: 6, sections: 4 },
      { start: pose.hipR, end: pose.kneeR, radius: 9.0, sides: 6, sections: 4 },
      {
        start: pose.kneeL,
        end: pose.footL,
        radius: 5.0,
        sides: 5,
        sections: 3,
      },
      {
        start: pose.kneeR,
        end: pose.footR,
        radius: 5.0,
        sides: 5,
        sections: 3,
      },
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

      // Extraer vértices para los nodos celuloides de cristal
      for (let ring of ringRays) {
        for (let pt of ring) {
          let nodeX = pt.x;
          let nodeY = pt.y;
          let nodeZ = pt.z;

          if (stress > 0.35) {
            const shardDrift = (stress - 0.35) * 16.0;
            nodeX += Math.sin(pt.y * 0.12 + this.timeOff) * shardDrift;
            nodeZ += Math.cos(pt.x * 0.12 + this.timeOff) * shardDrift;
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
