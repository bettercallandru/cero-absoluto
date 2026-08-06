// src/environment.js
import * as THREE from "three";
import { ArtConfig } from "./ArtDirection.js";

export class EnvironmentManager {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    // Aplicar el color base del lienzo desde la Dirección de Arte
    this.scene.background = new THREE.Color(ArtConfig.proyeccion.fondo);

    this.layers = [];
    this._initPuntillismo();
  }

  _initPuntillismo() {
    // Vertex Shader: Controla la posición, turbulencia base y tamaño en pantalla
    const vertexShader = `
      attribute float scaleMod;
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        // Escala relativa a la distancia de la cámara
        gl_PointSize = scaleMod * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    // Fragment Shader: Genera un disco orgánico con caída de opacidad radial
    const fragmentShader = `
      uniform vec3 diffuseColor;
      uniform float baseOpacity;
      void main() {
        // Coordenadas locales de cada punto (0.0 a 1.0)
        vec2 coord = gl_PointCoord - vec2(0.5);
        float dist = length(coord);
        
        // Descartar píxeles fuera del círculo
        if (dist > 0.5) discard;
        
        // Caída suave (soft-edge) emulando papel húmedo
        float alpha = baseOpacity * (1.0 - smoothstep(0.3, 0.5, dist));
        
        gl_FragColor = vec4(diffuseColor, alpha);
      }
    `;

    // Iterar sobre las capas definidas en ArtDirection.js
    ArtConfig.entorno.capasPuntillismo.forEach((capa) => {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(capa.cantidad * 3);
      const scales = new Float32Array(capa.cantidad);

      for (let i = 0; i < capa.cantidad; i++) {
        // Distribución inicial de la mancha
        positions[i * 3] = (Math.random() - 0.5) * capa.dispersionX;
        positions[i * 3 + 1] =
          capa.offsetY + (Math.random() - 0.5) * capa.dispersionY;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 80; // Profundidad (Efecto parallax)

        // Ligeras variaciones orgánicas en el tamaño de cada disco
        scales[i] = capa.escalaBasePx * (0.7 + Math.random() * 0.6);
      }

      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3),
      );
      geometry.setAttribute("scaleMod", new THREE.BufferAttribute(scales, 1));

      const material = new THREE.ShaderMaterial({
        uniforms: {
          diffuseColor: { value: new THREE.Color(capa.color) },
          baseOpacity: { value: capa.opacidad },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false, // Evita conflictos visuales al solapar puntos
        blending: ArtConfig.entorno.modoMezcla,
      });

      const points = new THREE.Points(geometry, material);
      this.group.add(points);

      this.layers.push({
        mesh: points,
        config: capa,
      });
    });
  }

  update(record, stress, frameCount, isSnap) {
    // Lectura de los datos físicos
    const windSpeed = record?.wind_speed_180m || 10.0;
    const turbulencia = windSpeed * 0.005 + stress * 0.05;

    // Animación de los discos emulando corrientes de viento fluidas
    this.layers.forEach((layer, index) => {
      const positions = layer.mesh.geometry.attributes.position.array;
      const config = layer.config;

      for (let i = 0; i < config.cantidad; i++) {
        const idx = i * 3;

        // Movimiento lateral (viento) y flotación vertical
        const driftX = Math.sin(frameCount * 0.01 + i) * turbulencia;
        const driftY =
          Math.cos(frameCount * 0.015 + i * 0.5) * (turbulencia * 0.4);

        positions[idx] += driftX;
        positions[idx + 1] += driftY;

        // Bucle de re-encuadre orgánico (si el disco sale por un lado, entra por el otro)
        if (Math.abs(positions[idx]) > config.dispersionX / 2) {
          positions[idx] *= -0.9;
        }
      }
      layer.mesh.geometry.attributes.position.needsUpdate = true;
    });
  }
}
