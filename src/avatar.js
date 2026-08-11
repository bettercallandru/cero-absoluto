// src/avatar.js
import * as THREE from "three";

export class Avatar {
  constructor() {
    this.group = new THREE.Group();

    // Posición y escala del avatar
    this.group.position.set(-0.5, -9.0, 0.0);
    this.group.scale.set(2.3, 2.3, 2.3);

    // Luz cálida del corazón
    this.heartLight = new THREE.PointLight(0xd92626, 3.2, 45);
    this.group.add(this.heartLight);

    // Partículas de polvo de grafito
    this.particlesCount = 35;
    this.particlePositions = new Float32Array(this.particlesCount * 3);
    this.particleVelocities = [];

    for (let i = 0; i < this.particlesCount; i++) {
      this.particlePositions[i * 3] = (Math.random() - 0.5) * 8;
      this.particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 8 - 4;
      this.particlePositions[i * 3 + 2] = 0.2;

      this.particleVelocities.push({
        x: (Math.random() - 0.5) * 0.05,
        y: Math.random() * 0.08 + 0.02,
      });
    }

    this.initMeshes();
  }

  initMeshes() {
    // 1. Sticker / Halo de Papel Acuarela Unificado
    this.stickerMat = new THREE.MeshBasicMaterial({
      color: 0xfaf8f5,
      side: THREE.DoubleSide,
    });
    this.stickerMesh = new THREE.Mesh(
      new THREE.BufferGeometry(),
      this.stickerMat,
    );
    this.stickerMesh.position.z = -0.05;
    this.group.add(this.stickerMesh);

    this.stickerOutlineMat = new THREE.LineBasicMaterial({
      color: 0xdcd5c9,
      linewidth: 1.5,
    });
    this.stickerOutlineLine = new THREE.LineLoop(
      new THREE.BufferGeometry(),
      this.stickerOutlineMat,
    );
    this.stickerOutlineLine.position.z = -0.04;
    this.group.add(this.stickerOutlineLine);

    // 2. Interior / Dobladillo Rosa Empolvado (Paleta GRIS)
    this.tunicInnerMat = new THREE.MeshBasicMaterial({
      color: 0x9e6f77,
      side: THREE.DoubleSide,
    });
    this.tunicInnerMesh = new THREE.Mesh(
      new THREE.BufferGeometry(),
      this.tunicInnerMat,
    );
    this.tunicInnerMesh.position.z = 0.01;
    this.group.add(this.tunicInnerMesh);

    // 3. Túnica Borgoña / Vinotinto Profundo (Paleta GRIS)
    this.tunicMat = new THREE.MeshBasicMaterial({
      color: 0x3f1a23,
      side: THREE.DoubleSide,
    });
    this.tunicMesh = new THREE.Mesh(new THREE.BufferGeometry(), this.tunicMat);
    this.tunicMesh.position.z = 0.03;
    this.group.add(this.tunicMesh);

    // Contorno suave de grafito
    this.outlineMat = new THREE.LineBasicMaterial({
      color: 0x160f12,
      linewidth: 2,
    });
    this.tunicOutlineLine = new THREE.LineLoop(
      new THREE.BufferGeometry(),
      this.outlineMat,
    );
    this.tunicOutlineLine.position.z = 0.08;
    this.group.add(this.tunicOutlineLine);

    // 4. Sombras Asimétricas de Acuarela (Manchas orgánicas, no simétricas)
    this.shadowMat = new THREE.MeshBasicMaterial({
      color: 0x220c12,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    this.asymShadowMesh = new THREE.Mesh(
      new THREE.BufferGeometry(),
      this.shadowMat,
    );
    this.asymShadowMesh.position.z = 0.04;
    this.group.add(this.asymShadowMesh);

    // 5. Cabeza Blanca Porcelana
    this.headMat = new THREE.MeshBasicMaterial({
      color: 0xfaf8f5,
      side: THREE.DoubleSide,
    });
    this.headMesh = new THREE.Mesh(new THREE.BufferGeometry(), this.headMat);
    this.headMesh.position.z = 0.09;
    this.group.add(this.headMesh);

    this.headOutlineLine = new THREE.LineLoop(
      new THREE.BufferGeometry(),
      this.outlineMat,
    );
    this.headOutlineLine.position.z = 0.11;
    this.group.add(this.headOutlineLine);

    // 6. Facciones Suaves de Boceto a Lápiz
    this.guideMat = new THREE.LineBasicMaterial({
      color: 0x160f12,
      linewidth: 1.2,
    });
    this.guideVLine = new THREE.Line(new THREE.BufferGeometry(), this.guideMat);
    this.eyesLine = new THREE.Line(new THREE.BufferGeometry(), this.guideMat);
    this.mouthLine = new THREE.Line(new THREE.BufferGeometry(), this.guideMat);
    this.group.add(this.guideVLine);
    this.group.add(this.eyesLine);
    this.group.add(this.mouthLine);

    // 7. Brazos de Grafito Caligráfico (Estilo GRIS: ahusados y finos)
    this.inkArmMat = new THREE.MeshBasicMaterial({
      color: 0x160f12,
      side: THREE.DoubleSide,
    });
    this.leftArmMesh = new THREE.Mesh(
      new THREE.BufferGeometry(),
      this.inkArmMat,
    );
    this.rightArmMesh = new THREE.Mesh(
      new THREE.BufferGeometry(),
      this.inkArmMat,
    );
    this.leftArmMesh.position.z = 0.12;
    this.rightArmMesh.position.z = 0.12;
    this.group.add(this.leftArmMesh);
    this.group.add(this.rightArmMesh);

    // 8. Corazón Carmín Iluminado
    const heartShape = this.getHeartShape();
    const heartGeo = new THREE.ShapeGeometry(heartShape);
    const heartMat = new THREE.MeshBasicMaterial({
      color: 0xd92626,
      side: THREE.DoubleSide,
    });
    this.heartMesh = new THREE.Mesh(heartGeo, heartMat);
    this.heartMesh.position.z = 0.15;
    this.group.add(this.heartMesh);

    // 9. Partículas
    this.particlesGeo = new THREE.BufferGeometry();
    const particlesMat = new THREE.PointsMaterial({
      color: 0x1a1a1a,
      size: 0.18,
      transparent: true,
      opacity: 0.75,
    });
    this.particlesMesh = new THREE.Points(this.particlesGeo, particlesMat);
    this.group.add(this.particlesMesh);

    // 10. Línea Horizon / Suelo
    const groundPoints = [
      new THREE.Vector3(-18, -5.1, -0.1),
      new THREE.Vector3(-5, -5.0, -0.1),
      new THREE.Vector3(5, -5.05, -0.1),
      new THREE.Vector3(18, -4.95, -0.1),
    ];
    const groundGeo = new THREE.BufferGeometry().setFromPoints(groundPoints);
    const groundMat = new THREE.LineBasicMaterial({
      color: 0x1a1a1a,
      linewidth: 1.5,
    });
    this.group.add(new THREE.Line(groundGeo, groundMat));
  }

  applyJitter(x, y, index, stress, frameCount) {
    if (stress < 0.05) return { x, y };

    const freq = frameCount * 0.22 + index * 1.5;
    const amp = stress * 0.3;
    const jitterX = (Math.sin(freq) + Math.cos(freq * 1.2)) * amp;
    const jitterY = (Math.cos(freq * 0.8) + Math.sin(freq * 1.4)) * amp;

    return { x: x + jitterX, y: y + jitterY };
  }

  /**
   * Genera el contorno orgánico y curvo de la túnica (Sin líneas rectas)
   */
  getTunicShape(stress, frameCount) {
    const shoulderHike = stress * 0.35;
    const neckY = 4.9 - shoulderHike * 0.2;
    const shoulderY = 4.0 + shoulderHike;
    const shoulderX = 1.45 - stress * 0.1;

    // Curva fluida usando Beziers/Puntos orgánicos
    const shape = new THREE.Shape();

    // Inicio: Cuello
    const pNeck = this.applyJitter(0, neckY - 0.1, 1, stress, frameCount);
    shape.moveTo(pNeck.x, pNeck.y);

    // Hombro Derecho
    const pShedDer = this.applyJitter(
      shoulderX,
      shoulderY,
      2,
      stress,
      frameCount,
    );
    const pBustDer = this.applyJitter(2.2, 1.8, 3, stress, frameCount);
    shape.quadraticCurveTo(pShedDer.x, pShedDer.y, pBustDer.x, pBustDer.y);

    // Caída Derecha hasta el Vuelo
    const pHemDer = this.applyJitter(4.2, -4.6, 4, stress, frameCount);
    const pMidRight = this.applyJitter(2.4, -1.8, 5, stress, frameCount);
    shape.quadraticCurveTo(pMidRight.x, pMidRight.y, pHemDer.x, pHemDer.y);

    // Base del Ruedo: Arco Orgánico Cóncavo (No horizontal recto)
    const pHemCenter = this.applyJitter(0, -5.2, 6, stress, frameCount);
    const pHemIzq = this.applyJitter(-4.2, -4.6, 7, stress, frameCount);
    shape.bezierCurveTo(2.0, -5.0, -2.0, -5.0, pHemIzq.x, pHemIzq.y);

    // Caída Izquierda subiendo
    const pMidLeft = this.applyJitter(-2.4, -1.8, 8, stress, frameCount);
    const pBustIzq = this.applyJitter(-2.2, 1.8, 9, stress, frameCount);
    shape.quadraticCurveTo(pMidLeft.x, pMidLeft.y, pBustIzq.x, pBustIzq.y);

    // Hombro Izquierdo de vuelta al cuello
    const pShedIzq = this.applyJitter(
      -shoulderX,
      shoulderY,
      10,
      stress,
      frameCount,
    );
    shape.quadraticCurveTo(pShedIzq.x, pShedIzq.y, pNeck.x, pNeck.y);

    return { shape, pHemDer, pHemIzq, pNeck, shoulderY, shoulderX };
  }

  /**
   * Dobladillo interior en rosa empolvado (Vista interna de la tela)
   */
  getInnerFoldShape(pHemDer, pHemIzq, stress, frameCount) {
    const shape = new THREE.Shape();
    shape.moveTo(pHemIzq.x, pHemIzq.y);

    // Curva cayendo por debajo del borde
    const pBottomCenter = this.applyJitter(0, -5.4, 20, stress, frameCount);
    shape.quadraticCurveTo(
      pBottomCenter.x,
      pBottomCenter.y,
      pHemDer.x,
      pHemDer.y,
    );

    // Retorno por la base interna
    const pInnerCenter = this.applyJitter(0, -4.8, 21, stress, frameCount);
    shape.quadraticCurveTo(
      pInnerCenter.x,
      pInnerCenter.y,
      pHemIzq.x,
      pHemIzq.y,
    );

    return shape;
  }

  /**
   * Halo de Papel que bordea suavemente todo el cuerpo
   */
  getStickerHaloPath(headCenterY, shoulderY, shoulderX, stress, frameCount) {
    const halo = [];
    const steps = 16;
    const radiusX = 1.6;
    const radiusY = 1.8;

    // Arco alrededor de la cabeza
    for (let i = 0; i <= steps; i++) {
      const angle = Math.PI - (i / steps) * Math.PI;
      const x = Math.cos(angle) * radiusX;
      const y = headCenterY + 0.2 + Math.sin(angle) * radiusY;
      const j = this.applyJitter(x, y, i + 80, stress * 0.4, frameCount);
      halo.push(new THREE.Vector2(j.x, j.y));
    }

    // Bajada lado derecho
    halo.push(new THREE.Vector2(2.8, 1.5));
    halo.push(new THREE.Vector2(4.8, -4.8));
    halo.push(new THREE.Vector2(0.0, -5.8)); // Base suave
    halo.push(new THREE.Vector2(-4.8, -4.8));
    halo.push(new THREE.Vector2(-2.8, 1.5));

    return halo;
  }

  getHeadPath(stress, frameCount) {
    const rawPoints = [];
    const numPoints = 16;
    const radiusX = 0.82;
    const radiusY = 1.12;
    const centerY = 6.0 - stress * 0.2;

    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const x = Math.cos(angle) * radiusX;
      const y = centerY + Math.sin(angle) * radiusY;
      const j = this.applyJitter(x, y, i + 30, stress, frameCount);
      rawPoints.push(new THREE.Vector2(j.x, j.y));
    }

    return { points: rawPoints, centerY };
  }

  getExpressiveFaceLines(stress, frameCount, headCenterY) {
    const v1 = this.applyJitter(0.0, headCenterY + 1.0, 50, stress, frameCount);
    const v2 = this.applyJitter(0.0, headCenterY - 1.0, 51, stress, frameCount);

    // Ojos suaves
    const eyesCurve = 0.08 - stress * 0.12;
    const eyesPts = [
      this.applyJitter(-0.6, headCenterY + 0.15, 52, stress, frameCount),
      this.applyJitter(
        0.0,
        headCenterY + 0.15 + eyesCurve,
        53,
        stress,
        frameCount,
      ),
      this.applyJitter(0.6, headCenterY + 0.15, 54, stress, frameCount),
    ];

    // Boca Expresiva (Curva hacia abajo con mayor estrés)
    const mouthCurve = 0.15 - stress * 0.5;
    const mouthPts = [
      this.applyJitter(-0.4, headCenterY - 0.5, 55, stress, frameCount),
      this.applyJitter(
        0.0,
        headCenterY - 0.5 + mouthCurve,
        56,
        stress,
        frameCount,
      ),
      this.applyJitter(0.4, headCenterY - 0.5, 57, stress, frameCount),
    ];

    return {
      vertical: [
        new THREE.Vector3(v1.x, v1.y, 0.12),
        new THREE.Vector3(v2.x, v2.y, 0.12),
      ],
      eyes: eyesPts.map((p) => new THREE.Vector3(p.x, p.y, 0.12)),
      mouth: mouthPts.map((p) => new THREE.Vector3(p.x, p.y, 0.12)),
    };
  }

  /**
   * Brazos Estilizados de Tinta / Grafito (Efecto GRIS)
   */
  getFineInkArms(stress, frameCount) {
    const shoulderHike = stress * 0.35;
    const shoulderY = 3.8 + shoulderHike;
    const inward = stress * 0.22;

    // Brazo Izquierdo (Trazo ahusado: grueso en hombro, fino en la mano)
    const leftArmShape = new THREE.Shape();
    leftArmShape.moveTo(-1.2 + inward, shoulderY);
    leftArmShape.quadraticCurveTo(-1.0 + inward, 2.2, -0.15, 1.1); // Mano cerca al corazón
    leftArmShape.quadraticCurveTo(
      -0.9 + inward,
      2.1,
      -1.0 + inward,
      shoulderY - 0.15,
    ); // Retorno muy delgado

    // Brazo Derecho
    const rightArmShape = new THREE.Shape();
    rightArmShape.moveTo(1.2 - inward, shoulderY);
    rightArmShape.quadraticCurveTo(1.0 - inward, 2.2, 0.15, 1.1);
    rightArmShape.quadraticCurveTo(
      0.9 - inward,
      2.1,
      1.0 - inward,
      shoulderY - 0.15,
    );

    return { leftArmShape, rightArmShape };
  }

  /**
   * Sombras Asimétricas en acuarela (Solo en puntos específicos)
   */
  getAsymmetricShadowShape(stress, frameCount) {
    const shape = new THREE.Shape();
    // Mancha de sombra cayendo desde el hombro derecho y acumulándose en el pliegue inferior
    shape.moveTo(0.2, 3.8);
    shape.quadraticCurveTo(2.2, 1.0, 3.2, -4.2);
    shape.quadraticCurveTo(1.8, -3.5, 0.8, -1.0);
    shape.quadraticCurveTo(0.1, 1.2, 0.2, 3.8);

    return shape;
  }

  getHeartShape() {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.25);
    shape.bezierCurveTo(0, 0.45, -0.4, 0.7, -0.65, 0.35);
    shape.bezierCurveTo(-0.65, 0.05, -0.35, -0.3, 0, -0.65);
    shape.bezierCurveTo(0.35, -0.3, 0.65, 0.05, 0.65, 0.35);
    shape.bezierCurveTo(0.4, 0.7, 0, 0.45, 0, 0.25);
    return shape;
  }

  updateParticles(stress) {
    for (let i = 0; i < this.particlesCount; i++) {
      if (i / this.particlesCount < stress) {
        this.particlePositions[i * 3 + 1] +=
          this.particleVelocities[i].y * (1 + stress);
        this.particlePositions[i * 3] +=
          this.particleVelocities[i].x *
          Math.sin(this.particlePositions[i * 3 + 1]);

        if (this.particlePositions[i * 3 + 1] > 8.0) {
          this.particlePositions[i * 3 + 1] = -5.0;
          this.particlePositions[i * 3] = (Math.random() - 0.5) * 6;
        }
      } else {
        this.particlePositions[i * 3 + 1] = -20;
      }
    }
    return this.particlePositions;
  }

  update(stress, frameCount) {
    // 1. Túnica Borgoña y Dobladillo Rosa
    const {
      shape: tunicShape,
      pHemDer,
      pHemIzq,
      shoulderY,
      shoulderX,
    } = this.getTunicShape(stress, frameCount);
    this.tunicMesh.geometry.dispose();
    this.tunicMesh.geometry = new THREE.ShapeGeometry(tunicShape);

    const innerShape = this.getInnerFoldShape(
      pHemDer,
      pHemIzq,
      stress,
      frameCount,
    );
    this.tunicInnerMesh.geometry.dispose();
    this.tunicInnerMesh.geometry = new THREE.ShapeGeometry(innerShape);

    // Contorno suave de túnica
    const tunicPoints = tunicShape.getPoints(32);
    const tunicOutline3D = tunicPoints.map(
      (p) => new THREE.Vector3(p.x, p.y, 0),
    );
    this.tunicOutlineLine.geometry.dispose();
    this.tunicOutlineLine.geometry = new THREE.BufferGeometry().setFromPoints(
      tunicOutline3D,
    );

    // 2. Sombras Asimétricas
    const asymShadowShape = this.getAsymmetricShadowShape(stress, frameCount);
    this.asymShadowMesh.geometry.dispose();
    this.asymShadowMesh.geometry = new THREE.ShapeGeometry(asymShadowShape);

    // 3. Cabeza
    const { points: headPoints, centerY: headCenterY } = this.getHeadPath(
      stress,
      frameCount,
    );
    this.headMesh.geometry.dispose();
    this.headMesh.geometry = new THREE.ShapeGeometry(
      new THREE.Shape(headPoints),
    );

    const headOutline3D = headPoints.map((p) => new THREE.Vector3(p.x, p.y, 0));
    this.headOutlineLine.geometry.dispose();
    this.headOutlineLine.geometry = new THREE.BufferGeometry().setFromPoints(
      headOutline3D,
    );

    // 4. Recorte de Papel Blanco / Sticker Unificado
    const stickerPoints = this.getStickerHaloPath(
      headCenterY,
      shoulderY,
      shoulderX,
      stress,
      frameCount,
    );
    this.stickerMesh.geometry.dispose();
    this.stickerMesh.geometry = new THREE.ShapeGeometry(
      new THREE.Shape(stickerPoints),
    );

    const halo3D = stickerPoints.map((p) => new THREE.Vector3(p.x, p.y, 0));
    this.stickerOutlineLine.geometry.dispose();
    this.stickerOutlineLine.geometry = new THREE.BufferGeometry().setFromPoints(
      halo3D,
    );

    // 5. Expresión del Rostro (Líneas de boceto)
    const faceLines = this.getExpressiveFaceLines(
      stress,
      frameCount,
      headCenterY,
    );
    this.guideVLine.geometry.dispose();
    this.guideVLine.geometry = new THREE.BufferGeometry().setFromPoints(
      faceLines.vertical,
    );

    this.eyesLine.geometry.dispose();
    this.eyesLine.geometry = new THREE.BufferGeometry().setFromPoints(
      faceLines.eyes,
    );

    this.mouthLine.geometry.dispose();
    this.mouthLine.geometry = new THREE.BufferGeometry().setFromPoints(
      faceLines.mouth,
    );

    // 6. Brazos de Grafito Caligráfico
    const { leftArmShape, rightArmShape } = this.getFineInkArms(
      stress,
      frameCount,
    );
    this.leftArmMesh.geometry.dispose();
    this.leftArmMesh.geometry = new THREE.ShapeGeometry(leftArmShape);

    this.rightArmMesh.geometry.dispose();
    this.rightArmMesh.geometry = new THREE.ShapeGeometry(rightArmShape);

    // 7. Corazón y Pulsación de Luz
    const heartPulse = Math.sin(frameCount * (0.06 + stress * 0.12)) * 0.22;
    const heartScale = 0.82 + heartPulse;
    this.heartMesh.position.set(0.0, 1.15, 0.15);
    this.heartMesh.scale.setScalar(heartScale);

    this.heartLight.position.set(0.0, 1.15, 3.0);
    this.heartLight.intensity = (1.0 + stress * 1.5) * 2.8;

    // 8. Partículas
    const particlePositions = this.updateParticles(stress);
    this.particlesGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3),
    );
    this.particlesGeo.attributes.position.needsUpdate = true;

    // Flotación / Respiración
    this.group.position.y = -9.0 + Math.sin(frameCount * 0.015) * 0.12;
  }
}
