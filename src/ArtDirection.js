// src/ArtDirection.js
import * as THREE from "three";
import { Palette } from "./ColorPalette.js";

export const ArtConfig = {
  // 1. Configuración de Cámara y Lienzo
  proyeccion: {
    anchoEstimadoMetros: 4.0,
    distanciaCamara: 280,
    fondo: Palette.soporte.pergaminoBase,
  },

  // 2. Jerarquía Escalar del Paisaje Puntillista
  entorno: {
    modoMezcla: THREE.NormalBlending, // Superposición clásica tipo acuarela/tinta
    capasPuntillismo: [
      {
        id: "bruma",
        color: Palette.pigmentos.cenizaBruma,
        cantidad: 1200,
        escalaBasePx: 8.0, // Puntos pequeños
        opacidad: 0.6,
        dispersionX: 350,
        dispersionY: 180,
        offsetY: 120, // Zona alta de la proyección
      },
      {
        id: "cerros",
        color: Palette.pigmentos.musgoCerros,
        cantidad: 1800,
        escalaBasePx: 25.0, // Discos medianos (Construyen masa)
        opacidad: 0.85,
        dispersionX: 280,
        dispersionY: 120,
        offsetY: -30, // Zona central
      },
      {
        id: "urbano",
        color: Palette.pigmentos.terracotaUrbano,
        cantidad: 800,
        escalaBasePx: 50.0, // Discos grandes y expresivos
        opacidad: 0.75,
        dispersionX: 200,
        dispersionY: 80,
        offsetY: -100, // Zona baja (Suelo)
      },
    ],
  },

  // 3. Configuración del Avatar
  avatar: {
    material: {
      // Colores base obtenidos de la paleta
      colorReposo: Palette.avatar.grafitoReposo,
      colorEstres: Palette.avatar.grafitoEstres,
      opacidadBase: 0.85,
      grosorAristas: 2.0, // Para dar peso a la silueta
    },
    corazon: {
      colorBase: Palette.avatar.corazonLatente,
      intensidadLuz: 2.5,
      radioBase: 6.5,
    },
    fisicas: {
      umbralFractura: 0.35, // Punto de estrés donde comienzan a desprenderse esquirlas
      multiplicadorTension: 16.0,
    },
  },
};

/**
 * DIRECCIÓN DE ARTE Y REGLAS MATEMÁTICAS - CERO ABSOLUTO
 * Parámetros de cámara, ecuaciones de distribución topográfica y límites espaciales.
 */

export const ArtDirection = {
  // --- CONFIGURACIÓN DE CÁMARA (-35° en X) ---
  camera: {
    fov: 45,
    near: 0.1,
    far: 1000,
    position: { x: 0, y: 35, z: 120 },
    rotationX: -0.610865, // -35 grados expresados en radianes
    target: { x: 0, y: 0, z: 0 },
  },

  // --- CAPA 1: PARÁMETROS BASE REFRACTARIA (Drenaje Vertical) ---
  baseRefractaria: {
    count: 1200,
    yMin: -120,
    yMax: -75,
    xWidth: 160,
    zDepth: 80,
    scaleYStretch: 3.8, // Elongación de partículas imitando escurrimientos
    opacityFalloffExponent: 1.8,
    dripSpeed: 0.12,
  },

  // --- CAPA 2: PARÁMETROS TEJIDO URBANO (Cúmulos Metabólicos) ---
  tejidoUrbano: {
    count: 1800,
    // Centros radiales (Atractores de pigmento)
    centers: [
      { x: -18, z: 12, radius: 22, weight: 1.0 },
      { x: 22, z: -8, radius: 28, weight: 0.85 },
      { x: -6, z: -22, radius: 18, weight: 0.6 },
      { x: 28, z: 18, radius: 16, weight: 0.5 },
    ],
    yBase: -35,
    ySpread: 22,
    particleSizeMin: 1.5,
    particleSizeMax: 4.8,
  },

  // --- CAPA 3: PARÁMETROS MASA TECTÓNICA (Perfil de Cerros Orientales) ---
  masaTectonica: {
    count: 2600,
    xMin: -60,
    xMax: 70,
    zMin: -55,
    zMax: -10,
    hMax: 82,          // Altura máxima que sobrepasa al avatar
    xCenter: 25,        // Pico desplazado a la derecha
    width: 42,          // Ancho de campana gaussiana
    noiseFrequency: 0.08,
    noiseAmplitude: 14,

    /**
     * Ecuación Topográfica de la Cresta Tectónica:
     * Y_cresta(X) = H_max * e^(-((X - X_0)/W)^2) + Noise(X) * A
     */
    getHillHeight(x) {
      const gaussian = Math.exp(-Math.pow((x - this.xCenter) / this.width, 2));
      const noise = Math.sin(x * this.noiseFrequency) * Math.cos(x * this.noiseFrequency * 0.5);
      return this.hMax * gaussian + noise * this.noiseAmplitude - 30;
    },
  },

  // --- CAPA 4: PARÁMETROS ESTRATO ATMOSFÉRICO (Bruma y Niebla) ---
  estratoAtmosferico: {
    count: 1500,
    yMin: 35,
    yMax: 135,
    xBounds: [-80, 80],
    zBounds: [-60, 40],
    baseParticleSize: 0.8,
    opacityMin: 0.12,
    opacityMax: 0.32,
    windDriftFactor: 0.04,
  },
};