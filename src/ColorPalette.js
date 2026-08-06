// src/ColorPalette.js

/**
 * DICCIONARIO CROMÁTICO - CERO ABSOLUTO
 * Paleta expandida de 20 pigmentos orgánicos y minerales.
 */
import * as THREE from "three";

export const ColorPalette = {
  // --- SOPORTE BASE ---
  soporte: {
    pergaminoViejo: "#F4F0E8",
    linoCrudo: "#EAE4D8",
  },

  // --- CAPA 1: BASE REFRACTARIA (Piso / Asfalto / Drenaje) ---
  baseRefractaria: {
    asfaltoHumedo: "#2B2D2F",
    ladrilloMojado: "#8C3B2B",
    ocreRefractario: "#C88A3B",
    aguaLluvia: "#4A5568",
  },

  // --- CAPA 2: TEJIDO URBANO (Cúmulos de Pigmento Orgánico) ---
  tejidoUrbano: {
    terracotaBogotano: "#B84A2A",
    amarilloMostaza: "#DA9F38",
    musgoDorado: "#8A8A3B",
    carminSombra: "#6B2332",
  },

  // --- CAPA 3: MASA TECTÓNICA (Los Cerros Orientales) ---
  masaTectonica: {
    grafitoPuro: "#1A1D1A",
    verdeMusgoOscuro: "#2D3A2E",
    verdeAbeto: "#1E2820",
    tierraSombra: "#3B322B",
  },

  // --- CAPA 4: ESTRATO ATMOSFÉRICO (Bruma / Niebla / Clima Frío) ---
  estratoAtmosferico: {
    cenizaFria: "#A0AEC0",
    azulGrisaceo: "#718096",
    nieblaCinc: "#CBD5E0",
    blancoTiza: "#EDF2F7",
  },

  /**
   * Helper para convertir un grupo cromático a un array de THREE.Color
   * @param {string} category 
   * @returns {THREE.Color[]}
   */
  getThreeColors(category) {
    const group = this[category];
    if (!group) return [];
    return Object.values(group).map((hex) => new THREE.Color(hex));
  },
};

export const Palette = {
  // El lienzo físico / Soporte
  soporte: {
    pergaminoBase: 0xf3efe0, // Tono hueso claro, mate
    pergaminoSombra: 0xe6dfcc,
  },

  // Paisaje (Los pigmentos)
  pigmentos: {
    cenizaBruma: 0x8c929d, // Gris frío para la humedad/viento
    musgoCerros: 0x4a5d4e, // Verde oscuro tectónico
    terracotaUrbano: 0xa35638, // Naranja quemado/óxido
    ladrilloBase: 0x8b3a2b, // Rojo profundo
  },

  // El ancla tectónica (Sprint 2)
  avatar: {
    grafitoReposo: 0x2a2c31,
    grafitoEstres: 0x111215,
    corazonLatente: 0x5c6370,
  },
};

