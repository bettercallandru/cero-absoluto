/**
 * CAPA: LIENZO TEXTURIZADO (Acuarela, Pincel Seco & Grano Canson)
 * - Grano de papel físico superpuesto en pantalla (mix-blend-mode: multiply).
 * - Mapas de opacidad de cerda de pincel procedurales (sin cristales ni picos filosos).
 * - 15 colores pastel/orgánicos esparcidos sin marcos ni cajas recortadas.
 */
import * as THREE from "three";

export class LienzoTexturizado {
  constructor(scene) {
    this.scene = scene;
    this.init();
  }

  /**
   * 1. Genera la textura de opacidad (Alpha Map) de un brochazo de cerda suave
   */
  createBrushAlphaTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, 256, 128);

    // Gradiente radial suavizado para la mancha central
    const grad = ctx.createRadialGradient(128, 64, 10, 128, 64, 110);
    grad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
    grad.addColorStop(0.4, "rgba(255, 255, 255, 0.65)");
    grad.addColorStop(0.8, "rgba(255, 255, 255, 0.15)");
    grad.addColorStop(1, "rgba(255, 255, 255, 0.0)");

    ctx.fillStyle = grad;

    // Dibujar mancha orgánica de bordes blandos
    ctx.beginPath();
    const steps = 32;
    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      const rx = 105 + (Math.random() - 0.5) * 20;
      const ry = 38 + (Math.random() - 0.5) * 12;
      const x = 128 + Math.cos(angle) * rx;
      const y = 64 + Math.sin(angle) * ry;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // Trazados de filamentos / cerdas de pincel seco
    ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
    ctx.lineWidth = 1.2;
    for (let s = 0; s < 16; s++) {
      const yOffset = 25 + Math.random() * 78;
      ctx.beginPath();
      ctx.moveTo(15 + Math.random() * 20, yOffset);
      ctx.bezierCurveTo(
        90,
        yOffset + (Math.random() - 0.5) * 12,
        170,
        yOffset + (Math.random() - 0.5) * 12,
        240 - Math.random() * 20,
        yOffset,
      );
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  /**
   * 2. Proyecta una capa de grano de papel sobre el viewport completo
   */
  setupPaperGrainOverlay() {
    if (document.getElementById("paper-grain-overlay-element")) return;

    const overlayCanvas = document.createElement("canvas");
    overlayCanvas.width = 512;
    overlayCanvas.height = 512;
    const ctx = overlayCanvas.getContext("2d");

    // Fondo base del grano
    ctx.fillStyle = "#F0ECE1";
    ctx.fillRect(0, 0, 512, 512);

    // Dientes de papel (ruido de alta frecuencia)
    const imgData = ctx.getImageData(0, 0, 512, 512);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 26;
      data[i] = Math.min(255, Math.max(0, 240 + noise)); // Red
      data[i + 1] = Math.min(255, Math.max(0, 236 + noise)); // Green
      data[i + 2] = Math.min(255, Math.max(0, 225 + noise)); // Blue
      data[i + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);

    // Hilos cruzados de lino/algodón
    ctx.strokeStyle = "rgba(150, 135, 120, 0.07)";
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 512; i += 3) {
      if (Math.random() > 0.3) {
        ctx.beginPath();
        ctx.moveTo(0, i + (Math.random() - 0.5) * 2);
        ctx.lineTo(512, i + (Math.random() - 0.5) * 2);
        ctx.stroke();
      }
      if (Math.random() > 0.3) {
        ctx.beginPath();
        ctx.moveTo(i + (Math.random() - 0.5) * 2, 0);
        ctx.lineTo(i + (Math.random() - 0.5) * 2, 512);
        ctx.stroke();
      }
    }

    const dataUrl = overlayCanvas.toDataURL();

    // Inyectar el overlay CSS que multiplica el grano sobre toda la pantalla
    const style = document.createElement("style");
    style.innerHTML = `
      #paper-grain-overlay-element {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        background-image: url("${dataUrl}");
        background-repeat: repeat;
        background-size: 256px 256px;
        mix-blend-mode: multiply;
        opacity: 0.55;
        z-index: 99;
      }
    `;
    document.head.appendChild(style);

    const div = document.createElement("div");
    div.id = "paper-grain-overlay-element";
    document.body.appendChild(div);
  }

  init() {
    // 1. Activar el overlay de grano de papel físico
    this.setupPaperGrainOverlay();

    // 2. Paleta expandida de 15 pigmentos Fine-Art
    const colors = [
      new THREE.Color("#E8D5CB"), // 1. Terracota rosado
      new THREE.Color("#F7F5EE"), // 2. Blanco tiza / marfil
      new THREE.Color("#E2D7C3"), // 3. Lino ocre
      new THREE.Color("#E5DDD0"), // 4. Arena neutra
      new THREE.Color("#DDA7A5"), // 5. Palo de rosa
      new THREE.Color("#C4B0A9"), // 6. Gris rosáceo
      new THREE.Color("#D0C3B4"), // 7. Arcilla clara
      new THREE.Color("#B8C4BB"), // 8. Verde sabio pastel
      new THREE.Color("#C7C3D4"), // 9. Lavanda suave
      new THREE.Color("#EAD5C3"), // 10. Melocotón empolvado
      new THREE.Color("#DFD3C3"), // 11. Pergamina antigua
      new THREE.Color("#C8B6A6"), // 12. Tierra taupe
      new THREE.Color("#F2E7D5"), // 13. Crema suave
      new THREE.Color("#B3C0C3"), // 14. Azul piedra suave
      new THREE.Color("#D2B48C"), // 15. Canela atenuado
    ];

    // 3. Crear mapa de opacidad de cerda suave
    const brushAlphaMap = this.createBrushAlphaTexture();

    const strokeCount = 50; // Cantidad abundante de brochazos
    const strokeGeometry = new THREE.PlaneGeometry(1.0, 1.0);

    const strokeMaterial = new THREE.MeshBasicMaterial({
      alphaMap: brushAlphaMap,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    this.strokesMesh = new THREE.InstancedMesh(
      strokeGeometry,
      strokeMaterial,
      strokeCount,
    );

    const dummy = new THREE.Object3D();

    for (let i = 0; i < strokeCount; i++) {
      // Distribución amplia por todo el plano (sin cajas ni marcos)
      const x = (Math.random() - 0.5) * 64;
      const y = (Math.random() - 0.5) * 110;
      const z = -29.0 + (Math.random() - 0.5) * 2.0; // Detrás del paisaje

      // Escalas variadas para huella de pincel plano
      const scaleX = 14 + Math.random() * 22;
      const scaleY = 4 + Math.random() * 9;
      const rotation = (Math.random() - 0.5) * Math.PI * 2; // Rotación completa libre

      dummy.position.set(x, y, z);
      dummy.scale.set(scaleX, scaleY, 1.0);
      dummy.rotation.set(0, 0, rotation);
      dummy.updateMatrix();

      this.strokesMesh.setMatrixAt(i, dummy.matrix);

      const color = colors[Math.floor(Math.random() * colors.length)].clone();
      this.strokesMesh.setColorAt(i, color);
    }

    this.strokesMesh.instanceMatrix.needsUpdate = true;
    if (this.strokesMesh.instanceColor)
      this.strokesMesh.instanceColor.needsUpdate = true;

    this.scene.add(this.strokesMesh);
  }

  update() {}
}
