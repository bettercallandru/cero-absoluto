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
