/**
 * DICCIONARIO CROMÁTICO EXPANDIDO - CERO ABSOLUTO
 * Estructura de objeto semántico con 10 variantes por capa para vibración puntillista.
 */
import * as THREE from "three";

export const ColorPalette = {
  // --- SOPORTE BASE ---
  soporte: {
    pergaminoViejo: "#F4F0E8",
    linoCrudo: "#EAE4D8",
  },

  // --- CAPA 1: BASE REFRACTARIA (Asfalto, Lluvia y Reflejos) ---
  baseRefractaria: {
    asfaltoHumedo: "#2B2D2F",      // Existente
    ladrilloMojado: "#8C3B2B",     // Existente
    ocreRefractario: "#C88A3B",    // Existente
    aguaLluvia: "#4A5568",         // Existente
    // Nuevas variantes para gradiente y vibración:
    asfaltoProfundo: "#1F2122",
    grafitoSombra: "#3A3D40",
    oxidoOscuro: "#5C2C23",
    terracotaCaido: "#A64A38",
    tierraCresta: "#7A5228",
    charcoReflejo: "#38424D",
  },

  // --- CAPA 2: TEJIDO URBANO (Cúmulos de Pigmento Orgánico) ---
  tejidoUrbano: {
    terracotaBogotano: "#B84A2A",  // Existente (Usado en scene.js)
    amarilloMostaza: "#DA9F38",    // Existente
    musgoDorado: "#8A8A3B",        // Existente
    carminSombra: "#6B2332",       // Existente (Usado en scene.js)
    // Nuevas variantes para puntillismo metabólico:
    ladrilloQuemado: "#9E381E",
    terracotaLuz: "#D15B38",
    ocreCalido: "#E8B34F",
    olivaUrbano: "#A3A34B",
    carminProfundo: "#852E41",
    barroAmarillo: "#C47B2B",
  },

  // --- CAPA 3: MASA TECTÓNICA (Los Cerros Orientales) ---
  masaTectonica: {
    grafitoPuro: "#1A1D1A",        // Existente (Usado en scene.js)
    verdeMusgoOscuro: "#2D3A2E",   // Existente
    verdeAbeto: "#1E2820",         // Existente (Usado en scene.js)
    tierraSombra: "#3B322B",       // Existente
    // Nuevas variantes para la silueta del cerro:
    carbonDenso: "#121412",
    pizarraOscura: "#242924",
    pinoSombra: "#3A4A3C",
    musgoProfundo: "#2A332B",
    cortezaVieja: "#4A4037",
    sombraTectonica: "#172118",
  },

  // --- CAPA 4: ESTRATO ATMOSFÉRICO (Bruma / Niebla / Clima Frío) ---
  estratoAtmosferico: {
    cenizaFria: "#A0AEC0",         // Existente
    azulGrisaceo: "#718096",       // Existente
    nieblaCinc: "#CBD5E0",         // Existente
    blancoTiza: "#EDF2F7",         // Existente
    // Nuevas variantes para dispersión gaseosa:
    brumaProfunda: "#8C9BAE",
    vaporCielo: "#B0BDCE",
    humoCalido: "#E2E8F0",
    grisNiebla: "#9AA7B8",
  },

  /**
   * Extrae todas las variantes de un grupo como un arreglo de THREE.Color
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

