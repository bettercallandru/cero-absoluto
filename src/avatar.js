import * as THREE from "three";

export class Avatar {
  constructor() {
    this.group = new THREE.Group();

    // Posición fija en el escenario
    this.group.position.set(-0.5, -9.0, 0.0);
    this.baseScale = 2.2;
    this.group.scale.set(this.baseScale, this.baseScale, this.baseScale);

    // Suavizado de estrés (Lerp / Smooth Damping)
    this.currentStress = 0.0;
    this.lerpSpeed = 0.04; // Controla la fluidez del cambio (menor valor = más suave)

    // Ajustes de escala
    this.S = 0.018;
    this.CX = 400;
    this.CY = 450;

    // Luz focal del corazón
    this.heartLight = new THREE.PointLight(0xd92626, 3.2, 45);
    this.group.add(this.heartLight);

    // Partículas
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

    // Configuración del Nudo de Estrés
    this.knotPointsCount = 320;
    this.knotPositions = new Float32Array(this.knotPointsCount * 3);

    this.initMeshes();
  }

  p(x, y) {
    return new THREE.Vector2((x - this.CX) * this.S, -(y - this.CY) * this.S);
  }

  initMeshes() {
    // 1. Sticker / Borde exterior
    this.stickerMat = new THREE.MeshBasicMaterial({
      color: 0xfaf8f5,
      side: THREE.DoubleSide,
      transparent: true,
    });
    this.stickerMesh = new THREE.Mesh(
      new THREE.BufferGeometry(),
      this.stickerMat,
    );
    this.stickerMesh.position.z = -0.05;
    this.group.add(this.stickerMesh);

    this.stickerOutlineMat = new THREE.LineBasicMaterial({
      color: 0xd2cbd2,
      linewidth: 1.5,
      transparent: true,
    });
    this.stickerOutlineLine = new THREE.LineLoop(
      new THREE.BufferGeometry(),
      this.stickerOutlineMat,
    );
    this.stickerOutlineLine.position.z = -0.04;
    this.group.add(this.stickerOutlineLine);

    // 2. Sombra base estática
    const shadowGeo = new THREE.ShapeGeometry(
      this.getEllipseShape(0, -4.2, 2.8, 0.25),
    );
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.15,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.position.z = -0.02;
    this.group.add(shadowMesh);

    // 3. Suelo Inmóvil (Coordenada Y fija)
    this.groundLineMat = new THREE.LineBasicMaterial({
      color: 0x1a1a1a,
      linewidth: 2.0,
    });
    const groundPts = [
      new THREE.Vector3(-3.2, -4.23, 0),
      new THREE.Vector3(3.2, -4.23, 0),
    ];
    this.groundLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(groundPts),
      this.groundLineMat,
    );
    this.groundLine.position.z = -0.01;
    this.group.add(this.groundLine);

    // 4. Pies Fijos
    const feetMat = new THREE.MeshBasicMaterial({
      color: 0x231518,
      side: THREE.DoubleSide,
      transparent: true,
    });
    this.feetMesh = new THREE.Mesh(
      new THREE.ShapeGeometry(this.getFeetShape()),
      feetMat,
    );
    this.feetMesh.position.z = 0.01;
    this.group.add(this.feetMesh);

    // 5. Forro Interior
    this.liningMat = new THREE.MeshBasicMaterial({
      color: 0xb98087,
      side: THREE.DoubleSide,
      transparent: true,
    });
    this.liningMesh = new THREE.Mesh(
      new THREE.BufferGeometry(),
      this.liningMat,
    );
    this.liningMesh.position.z = 0.02;
    this.group.add(this.liningMesh);

    // 6. Ruana
    this.tunicMat = new THREE.MeshBasicMaterial({
      color: 0x3d1e22,
      side: THREE.DoubleSide,
      transparent: true,
    });
    this.tunicMesh = new THREE.Mesh(new THREE.BufferGeometry(), this.tunicMat);
    this.tunicMesh.position.z = 0.03;
    this.group.add(this.tunicMesh);

    // 7. Pliegues / Sombras ruana
    this.shadowFoldMat = new THREE.MeshBasicMaterial({
      color: 0x230d10,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
    });
    this.shadowFold1Mesh = new THREE.Mesh(
      new THREE.BufferGeometry(),
      this.shadowFoldMat,
    );
    this.shadowFold2Mesh = new THREE.Mesh(
      new THREE.BufferGeometry(),
      this.shadowFoldMat,
    );
    this.shadowFold1Mesh.position.z = 0.04;
    this.shadowFold2Mesh.position.z = 0.04;
    this.group.add(this.shadowFold1Mesh);
    this.group.add(this.shadowFold2Mesh);

    // Delineado ruana
    this.tunicOutlineMat = new THREE.LineBasicMaterial({
      color: 0x1a0a0c,
      linewidth: 2,
      transparent: true,
    });
    this.tunicOutlineLine = new THREE.LineLoop(
      new THREE.BufferGeometry(),
      this.tunicOutlineMat,
    );
    this.tunicOutlineLine.position.z = 0.08;
    this.group.add(this.tunicOutlineLine);

    // =========================================================================
    // 8. CABEZA COMPLETA ESTÁTICA (SE CONSTRUYE UNA SOLA VEZ)
    // =========================================================================
    this.headGroup = new THREE.Group();
    this.headGroup.position.z = 0.1;
    this.group.add(this.headGroup);

    this.skinMat = new THREE.MeshBasicMaterial({
      color: 0xfbf0e8,
      side: THREE.DoubleSide,
      transparent: true,
    });

    // Cuello y Cara
    this.headGroup.add(
      new THREE.Mesh(
        new THREE.ShapeGeometry(this.getNeckShape()),
        this.skinMat,
      ),
    );
    this.headGroup.add(
      new THREE.Mesh(
        new THREE.ShapeGeometry(this.getFaceShape()),
        this.skinMat,
      ),
    );

    // Rubores
    this.blushMat = new THREE.MeshBasicMaterial({
      color: 0xd67b7d,
      transparent: true,
      opacity: 0.45,
    });
    this.headGroup.add(
      new THREE.Mesh(
        new THREE.ShapeGeometry(this.getEllipseShape(-0.43, 3.74, 0.14, 0.07)),
        this.blushMat,
      ),
    );
    this.headGroup.add(
      new THREE.Mesh(
        new THREE.ShapeGeometry(this.getEllipseShape(0.43, 3.74, 0.14, 0.07)),
        this.blushMat,
      ),
    );

    // Facciones Neutras Limpias
    this.featureMat = new THREE.LineBasicMaterial({
      color: 0x211c18,
      linewidth: 2,
      transparent: true,
    });

    // Ojos (Líneas finas neutras)
    const eyesPts = [
      new THREE.Vector3(-0.45, 3.85, 0),
      new THREE.Vector3(-0.15, 3.85, 0),
      new THREE.Vector3(0.15, 3.85, 0),
      new THREE.Vector3(0.45, 3.85, 0),
    ];
    this.headGroup.add(
      new THREE.LineSegments(
        new THREE.BufferGeometry().setFromPoints(eyesPts),
        this.featureMat,
      ),
    );

    // Cejas
    const browsPts = [
      new THREE.Vector3(-0.45, 3.98, 0),
      new THREE.Vector3(-0.15, 3.98, 0),
      new THREE.Vector3(0.15, 3.98, 0),
      new THREE.Vector3(0.45, 3.98, 0),
    ];
    this.headGroup.add(
      new THREE.LineSegments(
        new THREE.BufferGeometry().setFromPoints(browsPts),
        this.featureMat,
      ),
    );

    // Nariz
    const nosePts = [
      new THREE.Vector3(0, 3.88, 0),
      new THREE.Vector3(-0.04, 3.65, 0),
      new THREE.Vector3(0.02, 3.63, 0),
    ];
    this.headGroup.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(nosePts),
        new THREE.LineBasicMaterial({
          color: 0xcbb3a1,
          linewidth: 1.5,
          transparent: true,
        }),
      ),
    );

    // Boca Neutra
    const mouthPts = [
      new THREE.Vector3(-0.12, 3.48, 0),
      new THREE.Vector3(0.12, 3.48, 0),
    ];
    this.headGroup.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(mouthPts),
        new THREE.LineBasicMaterial({
          color: 0x8a5a54,
          linewidth: 2,
          transparent: true,
        }),
      ),
    );

    // Cabello
    this.hairMat = new THREE.MeshBasicMaterial({
      color: 0x679998,
      side: THREE.DoubleSide,
      transparent: true,
    });
    const { hairL, hairR, hairC, hairH } = this.getHairShapes();
    this.headGroup.add(
      new THREE.Mesh(
        new THREE.ShapeGeometry([hairL, hairR, hairC]),
        this.hairMat,
      ),
    );

    this.hairHighlightMat = new THREE.MeshBasicMaterial({
      color: 0x9ec2c0,
      transparent: true,
      opacity: 0.6,
    });
    this.headGroup.add(
      new THREE.Mesh(new THREE.ShapeGeometry(hairH), this.hairHighlightMat),
    );

    // 9. Brazos
    this.armsMat = new THREE.LineBasicMaterial({
      color: 0xe8d3c1,
      linewidth: 4,
      transparent: true,
    });
    this.leftArmLine = new THREE.Line(new THREE.BufferGeometry(), this.armsMat);
    this.rightArmLine = new THREE.Line(
      new THREE.BufferGeometry(),
      this.armsMat,
    );
    this.leftArmLine.position.z = 0.17;
    this.rightArmLine.position.z = 0.17;
    this.group.add(this.leftArmLine);
    this.group.add(this.rightArmLine);

    // 10. Corazón
    const heartGeo = new THREE.ShapeGeometry(this.getHeartShape());
    this.heartMat = new THREE.MeshBasicMaterial({
      color: 0xd92626,
      side: THREE.DoubleSide,
      transparent: true,
    });
    this.heartMesh = new THREE.Mesh(heartGeo, this.heartMat);
    this.heartMesh.position.z = 0.18;
    this.group.add(this.heartMesh);

    // 11. Nudo de Estrés
    this.knotGeo = new THREE.BufferGeometry();
    this.knotGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(this.knotPositions, 3),
    );
    this.knotMat = new THREE.LineBasicMaterial({
      color: 0x111111,
      linewidth: 2.2,
      transparent: true,
      opacity: 0.0,
    });
    this.knotMesh = new THREE.Line(this.knotGeo, this.knotMat);
    this.knotMesh.position.z = 0.22;
    this.group.add(this.knotMesh);

    // 12. Partículas
    this.particlesGeo = new THREE.BufferGeometry();
    const particlesMat = new THREE.PointsMaterial({
      color: 0x1a1a1a,
      size: 0.18,
      transparent: true,
      opacity: 0.75,
    });
    this.particlesMesh = new THREE.Points(this.particlesGeo, particlesMat);
    this.group.add(this.particlesMesh);
  }

  getEllipseShape(cx, cy, rx, ry) {
    const shape = new THREE.Shape();
    shape.absellipse(cx, cy, rx, ry, 0, Math.PI * 2, false, 0);
    return shape;
  }

  getTunicShape(stress) {
    const shape = new THREE.Shape();

    const squatY = stress * 1.3;
    const widen = stress * 0.4;

    const neckL = new THREE.Vector2(-0.22 - widen * 0.2, 3.42 - squatY);
    const neckR = new THREE.Vector2(0.22 + widen * 0.2, 3.42 - squatY);
    const shoulderL = new THREE.Vector2(-1.98 - widen, 2.52 - squatY * 0.8);
    const shoulderR = new THREE.Vector2(1.98 + widen, 2.52 - squatY * 0.8);
    const midL = new THREE.Vector2(-3.24 - widen * 1.2, -0.54);
    const midR = new THREE.Vector2(3.24 + widen * 1.2, -0.36);

    const baseL = new THREE.Vector2(-2.97, -4.23);
    const baseC = new THREE.Vector2(0, -4.5);
    const baseR = new THREE.Vector2(2.97, -4.23);

    shape.moveTo(neckL.x, neckL.y);
    shape.bezierCurveTo(
      shoulderL.x,
      shoulderL.y,
      midL.x,
      midL.y,
      baseL.x,
      baseL.y,
    );
    shape.quadraticCurveTo(baseC.x, baseC.y, baseR.x, baseR.y);
    shape.bezierCurveTo(
      midR.x,
      midR.y,
      shoulderR.x,
      shoulderR.y,
      neckR.x,
      neckR.y,
    );

    return shape;
  }

  getLiningShape() {
    const shape = new THREE.Shape();
    shape.moveTo(-2.97, -4.23);
    shape.quadraticCurveTo(0, -4.5, 2.97, -4.23);
    shape.lineTo(2.79, -4.5);
    shape.quadraticCurveTo(0, -4.77, -2.79, -4.5);
    shape.closePath();
    return shape;
  }

  getAsymmetricShadowShapes(stress) {
    const squatY = stress * 1.3;

    const s1 = new THREE.Shape();
    s1.moveTo(-0.9, 2.52 - squatY);
    s1.bezierCurveTo(-1.44, 0.36, -0.54, -1.26, -0.54, -1.26);
    s1.bezierCurveTo(-1.17, 0.54, -1.17, 2.52 - squatY, -0.9, 2.52 - squatY);

    const s2 = new THREE.Shape();
    s2.moveTo(1.62, 0.54 - squatY * 0.5);
    s2.quadraticCurveTo(2.16, -1.44, 1.08, -2.88);
    s2.quadraticCurveTo(1.53, -1.26, 1.62, 0.54 - squatY * 0.5);

    return { s1, s2 };
  }

  getFeetShape() {
    const shape = new THREE.Shape();
    shape.moveTo(-0.27, -4.23);
    shape.lineTo(-0.22, -4.77);
    shape.lineTo(-0.11, -4.23);
    shape.moveTo(0.11, -4.23);
    shape.lineTo(0.22, -4.77);
    shape.lineTo(0.27, -4.23);
    return shape;
  }

  getNeckShape() {
    const shape = new THREE.Shape();
    shape.moveTo(-0.22, 3.96);
    shape.lineTo(0.22, 3.96);
    shape.lineTo(0.14, 3.42);
    shape.quadraticCurveTo(0, 3.33, -0.14, 3.42);
    return shape;
  }

  getFaceShape() {
    const shape = new THREE.Shape();
    shape.moveTo(-0.58, 4.77);
    shape.bezierCurveTo(-0.68, 3.96, -0.36, 3.28, 0, 3.2);
    shape.bezierCurveTo(0.36, 3.28, 0.68, 3.96, 0.58, 4.77);
    return shape;
  }

  getHairShapes() {
    const hairL = new THREE.Shape();
    hairL.moveTo(-0.58, 4.77);
    hairL.bezierCurveTo(-1.26, 4.95, -1.53, 4.05, -1.26, 3.33);
    hairL.bezierCurveTo(-0.99, 2.97, -0.68, 3.15, -0.63, 3.69);
    hairL.bezierCurveTo(-0.68, 4.23, -0.58, 4.59, -0.58, 4.77);

    const hairR = new THREE.Shape();
    hairR.moveTo(0.58, 4.77);
    hairR.bezierCurveTo(1.26, 4.95, 1.53, 4.05, 1.26, 3.33);
    hairR.bezierCurveTo(0.99, 2.97, 0.68, 3.15, 0.63, 3.69);
    hairR.bezierCurveTo(0.68, 4.23, 0.58, 4.59, 0.58, 4.77);

    const hairC = new THREE.Shape();
    hairC.moveTo(-0.63, 4.77);
    hairC.bezierCurveTo(-0.36, 4.32, -0.14, 4.28, 0, 4.46);
    hairC.bezierCurveTo(0.14, 4.28, 0.36, 4.32, 0.63, 4.77);
    hairC.bezierCurveTo(0.18, 5.04, -0.18, 5.04, -0.63, 4.77);

    const hairH = new THREE.Shape();
    hairH.moveTo(-0.54, 4.82);
    hairH.bezierCurveTo(-0.27, 5.22, 0.27, 5.22, 0.54, 4.82);
    hairH.bezierCurveTo(0.18, 4.59, -0.18, 4.59, -0.54, 4.82);

    return { hairL, hairR, hairC, hairH };
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

  updateScribble(stress, frameCount, squatY) {
    if (stress < 0.05) {
      this.knotMat.opacity = 0.0;
      return;
    }

    this.knotMat.opacity = Math.min(1.0, (stress - 0.05) * 1.5);

    const topCenterY = 6.66 - squatY;
    const rx = 0.8 + stress * 2.6;
    const ry = 0.6 + stress * 4.2;

    const time = frameCount * 0.05;

    for (let i = 0; i < this.knotPointsCount; i++) {
      const idx = i * 3;
      const t = (i / this.knotPointsCount) * Math.PI * 14;

      const rawX = Math.sin(t * 3.0 + time) * Math.cos(t * 0.8);
      const rawY = Math.sin(t * 5.0 + time) * 0.7 - (t / (Math.PI * 14)) * ry;

      const noiseX =
        (Math.sin(t * 6.5 + time * 1.3) + Math.cos(t * 2.8)) * stress * 0.2;
      const noiseY =
        (Math.cos(t * 4.8 + time * 1.1) + Math.sin(t * 3.5)) * stress * 0.2;

      this.knotPositions[idx] = rawX * rx + noiseX;
      this.knotPositions[idx + 1] = topCenterY + rawY + noiseY;
      this.knotPositions[idx + 2] = 0.0;
    }

    this.knotGeo.attributes.position.needsUpdate = true;
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
          this.particlePositions[i * 3 + 1] = -4.2;
          this.particlePositions[i * 3] = (Math.random() - 0.5) * 4;
        }
      } else {
        this.particlePositions[i * 3 + 1] = -20;
      }
    }
    return this.particlePositions;
  }

  update(targetStress, frameCount) {
    // 1. INTERPOLACIÓN SUAVE DE ESTRÉS (Elimina los saltos repentinos)
    this.currentStress += (targetStress - this.currentStress) * this.lerpSpeed;
    const stress = this.currentStress;

    // 2. AGACHADO FÍSICO FLUIDO
    const squatY = stress * 1.3;
    this.headGroup.position.y = -squatY; // Translada suavemente el grupo entero de la cabeza

    // Opacidad progresiva
    const bodyOpacity =
      stress > 0.4 ? Math.max(0.1, 1.0 - (stress - 0.4) * 1.8) : 1.0;

    this.tunicMat.opacity = bodyOpacity;
    this.liningMat.opacity = bodyOpacity;
    this.skinMat.opacity = bodyOpacity;
    this.hairMat.opacity = bodyOpacity;
    this.feetMesh.material.opacity = bodyOpacity;
    this.shadowFoldMat.opacity = 0.65 * bodyOpacity;
    this.blushMat.opacity = 0.45 * bodyOpacity;
    this.stickerMat.opacity = bodyOpacity;
    this.stickerOutlineMat.opacity = bodyOpacity;

    // 3. Deformación fluida del cuerpo
    const tunicShape = this.getTunicShape(stress);
    this.tunicMesh.geometry.dispose();
    this.tunicMesh.geometry = new THREE.ShapeGeometry(tunicShape);

    const liningShape = this.getLiningShape();
    this.liningMesh.geometry.dispose();
    this.liningMesh.geometry = new THREE.ShapeGeometry(liningShape);

    // Sombras
    const { s1, s2 } = this.getAsymmetricShadowShapes(stress);
    this.shadowFold1Mesh.geometry.dispose();
    this.shadowFold1Mesh.geometry = new THREE.ShapeGeometry(s1);

    this.shadowFold2Mesh.geometry.dispose();
    this.shadowFold2Mesh.geometry = new THREE.ShapeGeometry(s2);

    // Delineados
    const tunicPoints = tunicShape.getPoints(32);
    const tunicOutline3D = tunicPoints.map(
      (p) => new THREE.Vector3(p.x, p.y, 0),
    );
    this.tunicOutlineLine.geometry.dispose();
    this.tunicOutlineLine.geometry = new THREE.BufferGeometry().setFromPoints(
      tunicOutline3D,
    );

    // Borde blanco (Sticker)
    const haloPoints = tunicPoints.map(
      (p) => new THREE.Vector2(p.x * 1.08, p.y * 1.04),
    );
    this.stickerMesh.geometry.dispose();
    this.stickerMesh.geometry = new THREE.ShapeGeometry(
      new THREE.Shape(haloPoints),
    );

    const halo3D = haloPoints.map((p) => new THREE.Vector3(p.x, p.y, 0));
    this.stickerOutlineLine.geometry.dispose();
    this.stickerOutlineLine.geometry = new THREE.BufferGeometry().setFromPoints(
      halo3D,
    );

    // 4. Brazos
    const leftArmPts = [
      new THREE.Vector3(-1.44, 0.54 - squatY, 0),
      new THREE.Vector3(-0.72, -0.18 - squatY, 0),
      new THREE.Vector3(0.45, -0.45 - squatY, 0),
    ];
    const rightArmPts = [
      new THREE.Vector3(1.44, 0.54 - squatY, 0),
      new THREE.Vector3(0.72, -0.18 - squatY, 0),
      new THREE.Vector3(-0.45, -0.45 - squatY, 0),
    ];

    this.leftArmLine.geometry.dispose();
    this.leftArmLine.geometry = new THREE.BufferGeometry().setFromPoints(
      leftArmPts,
    );

    this.rightArmLine.geometry.dispose();
    this.rightArmLine.geometry = new THREE.BufferGeometry().setFromPoints(
      rightArmPts,
    );

    // 5. Corazón y Luz
    const heartPulse = Math.sin(frameCount * (0.06 + stress * 0.12)) * 0.22;
    const heartScale = 0.7 + heartPulse;
    const heartY = -0.45 - squatY;
    this.heartMesh.position.set(0, heartY, 0.18);
    this.heartMesh.scale.setScalar(heartScale);

    this.heartLight.position.set(0, heartY, 3.0);
    this.heartLight.intensity = (1.0 + stress * 1.5) * 2.8;

    // 6. Nudo de Estrés
    this.updateScribble(stress, frameCount, squatY);

    // 7. Partículas
    const particlePositions = this.updateParticles(stress);
    this.particlesGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3),
    );
    this.particlesGeo.attributes.position.needsUpdate = true;
  }
}
