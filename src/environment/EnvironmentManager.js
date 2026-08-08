/**
 * FACHADA INTEGRADORA DEL ENTORNO - CERO ABSOLUTO
 */
import { BaseRefractaria } from "./BaseRefractaria.js";
import { TejidoUrbano } from "./TejidoUrbano.js";
import { MasaTectonica } from "./MasaTectonica.js";
import { EstratoAtmosferico } from "./EstratoAtmosferico.js";

export class EnvironmentManager {
  constructor(scene) {
    this.scene = scene;

    // Instanciación de las 4 capas independientes
    /* this.baseRefractaria = new BaseRefractaria(scene); */
    this.tejidoUrbano = new TejidoUrbano(scene);
    /* this.masaTectonica = new MasaTectonica(scene);
    this.estratoAtmosferico = new EstratoAtmosferico(scene); */
  }

  /**
   * Ciclo de actualización unificado
   */
  update(record, stress, frameCount, isSnap = false) {
    const windSpeed = record ? record.wind_speed_180m : 10.0;

    /* this.baseRefractaria.update(stress, frameCount); */
    this.tejidoUrbano.update(stress, frameCount);
    /* this.masaTectonica.update(stress, frameCount, isSnap);
    this.estratoAtmosferico.update(windSpeed, frameCount); */
  }
}
