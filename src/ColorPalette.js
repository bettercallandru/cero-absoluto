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

  // PALETA DE MASA TECTÓNICA: 80 Colores Organizados en 4 Capas (20 por Capa)
  masaTectonica: {
    // --- CAPA 0: ACOPLE Y TRANSICIÓN BASE (20 Colores) ---
    mtC0_01_granateProfundo: "#210404",
    mtC0_02_rojoSombraSuelo: "#330A07",
    mtC0_03_terracotaOscurecido: "#48150B",
    mtC0_04_ladrilloBaseSombra: "#5B1C10",
    mtC0_05_ocreArcillaTostado: "#6E2B12",
    mtC0_06_ocreVerdosoOscuro: "#613D15",
    mtC0_07_olivaAcopleBajo: "#524F18",
    mtC0_08_olivaMusgoBase: "#41581C",
    mtC0_09_verdeCopaOscurecido: "#1F5226",
    mtC0_10_verdePinoAcople: "#12431C",
    mtC0_11_verdeBosqueProfundo: "#0C3717",
    mtC0_12_pardoMineralOscuro: "#2B2117",
    mtC0_13_terracotaCeniza: "#40261B",
    mtC0_14_musgoSombraTierra: "#2C3B1A",
    mtC0_15_verdeVegetalSombra: "#244C20",
    mtC0_16_olivaAhumado: "#4A471C",
    mtC0_17_cobreOscurecido: "#592E15",
    mtC0_18_sombraRojizaRoca: "#36130D",
    mtC0_19_verdeOscuroBosque: "#163E1F",
    mtC0_20_pinoSombraBase: "#0E2F16",

    // --- CAPA 1: SOTOBOSQUE Y VERDES MINERALES (20 Colores) ---
    mtC1_01_verdePinoDenso: "#12381B",
    mtC1_02_verdeMusgoFresco: "#174222",
    mtC1_03_jadeMineral: "#1B472A",
    mtC1_04_serpentinaOscura: "#204E35",
    mtC1_05_malaquitaSombra: "#23473B",
    mtC1_06_verdeLiquenOscuro: "#2B5234",
    mtC1_07_verdeBosqueGranito: "#1E3F2E",
    mtC1_08_verdeOlivaProfundo: "#314B20",
    mtC1_09_musgoCeniza: "#26422F",
    mtC1_10_verdePizarraSombra: "#213B36",
    mtC1_11_verdeVegetalAhumado: "#2D5038",
    mtC1_12_jadeProfundo: "#163C2A",
    mtC1_13_basaltoVerdoso: "#1C3127",
    mtC1_14_malaquitaPizarra: "#274840",
    mtC1_15_serpentinaClara: "#2E5943",
    mtC1_16_verdePinoLuz: "#23522F",
    mtC1_17_sombraPardoVerde: "#2B3521",
    mtC1_18_verdeLiquenSombra: "#1F4125",
    mtC1_19_grafitoVerdoso: "#20332B",
    mtC1_20_verdeBosqueAhumado: "#1A3A28",

    // --- CAPA 2: ESTRATO MEDIO Y PIZARRA (20 Colores) ---
    mtC2_01_verdePizarraFrio: "#223E36",
    mtC2_02_pizarraBasaltica: "#273D38",
    mtC2_03_grafitoMineral: "#2B3636",
    mtC2_04_titanioVegetal: "#313D3B",
    mtC2_05_musgoGlacial: "#2A453F",
    mtC2_06_pizarraAhumada: "#33413E",
    mtC2_07_meteoritaVerdosa: "#364A44",
    mtC2_08_aceroVegetal: "#3B4745",
    mtC2_09_carbónMineral: "#2E3333",
    mtC2_10_sombraBasalto: "#262C2C",
    mtC2_11_verdeGlacialOscuro: "#233B36",
    mtC2_12_pizarraAzulada: "#293A3A",
    mtC2_13_titanioSombra: "#343E3B",
    mtC2_14_meteoritaOscura: "#2C3635",
    mtC2_15_verdeCenizaFrio: "#314842",
    mtC2_16_pizarraGrisacea: "#384442",
    mtC2_17_grafitoAhumado: "#303837",
    mtC2_18_basaltoVegetal: "#2A3A33",
    mtC2_19_titanioGrafito: "#394340",
    mtC2_20_pizarraProfunda: "#1F2928",

    // --- CAPA 3: CÚSPIDE Y TITANIO LUMINOSO (20 Colores) ---
    mtC3_01_titanioCeniza: "#3D4846",
    mtC3_02_aceroAhumado: "#4A5653",
    mtC3_03_meteoritaClara: "#586461",
    mtC3_04_plataCuarzo: "#6E7A77",
    mtC3_05_cuarzoPerlaSombra: "#7E8A87",
    mtC3_06_platinoLuminoso: "#8F9B98",
    mtC3_07_grisPizarraClaro: "#525E5B",
    mtC3_08_cenizaVolcanica: "#444E4C",
    mtC3_09_plataAhumada: "#63706D",
    mtC3_10_cuarzoPerlaLuz: "#85928F",
    mtC3_11_liquenGlacialClaro: "#5B6B67",
    mtC3_12_titanioLuminoso: "#6B7A76",
    mtC3_13_aceroCuarzo: "#55625F",
    mtC3_14_platinoAhumado: "#788582",
    mtC3_15_meteoritaLuz: "#687673",
    mtC3_16_cenizaTitanio: "#4B5553",
    mtC3_17_grisPerlaMineral: "#7B8784",
    mtC3_18_cuarzoPizarra: "#5F6D6A",
    mtC3_19_platinoCeniza: "#83908D",
    mtC3_20_cuarzoPlatinoFinal: "#9AA6A3",
  },

  // --- CAPA 2: TEJIDO URBANO (Cúmulos de Pigmento Orgánico) ---
  tejidoUrbano: {
    // Estrato 1: Base Terrenal / Sombras Profundas (Y Bajo)
    granateProfundo: "#3B0A0A",
    carminOscuro: "#5A1313",
    ladrilloDenso: "#7A1C1C",
    terracotaBasal: "#8C271E",
    arcillaCalida: "#A33327",

    // Estrato 2: Valles Bajos / Transición Cálida (Y Medio-Bajo)
    oxidoVibrante: "#B84029",
    naranjaTerracota: "#CD532B",
    ocreAnaranjado: "#D96832",
    sienaTostado: "#E07E3C",
    mostazaCalido: "#E89647",

    // Estrato 3: Valles Medios / Transición Vegetal (Y Medio-Alto)
    ocreSeco: "#D19E4A",
    mostazaAceituna: "#BBA04F",
    olivaSecoClaro: "#9FA053",
    musgoCalido: "#859B52",
    verdePradoSuave: "#6D9350",

    // Estrato 4: Crestas Distantes / Encuentro Tectónico (Y Alto)
    verdeHoja: "#57884D",
    pinoMedio: "#467B48",
    bosqueFrio: "#386D43",
    olivaOscuro: "#2F5E3D",
    sombraVegetal: "#264F34",
  },

  // --- CAPA 4: ESTRATO ATMOSFÉRICO (Bruma / Niebla / Clima Frío) ---
  estratoAtmosferico: {
    cenizaFria: "#A0AEC0", // Existente
    azulGrisaceo: "#718096", // Existente
    nieblaCinc: "#CBD5E0", // Existente
    blancoTiza: "#EDF2F7", // Existente
    // Nuevas variantes para dispersión gaseosa:
    brumaProfunda: "#8C9BAE",
    vaporCielo: "#B0BDCE",
    humoCalido: "#E2E8F0",
    grisNiebla: "#9AA7B8",
  },

  /**
   * Helper para convertir un grupo cromático a un array de THREE.Color
   * @param {string} category
   * @returns {THREE.Color[]}
   */
  getThreeColors(category) {
    const group = this[category] || this.tejidoUrbano;
    const hexArray = Array.isArray(group) ? group : Object.values(group);

    return hexArray.map((hex) => new THREE.Color(hex));
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
