/**
 * FACHADA INTEGRADORA DEL ENTORNO - PAISAJE LIMPIO
 */
import { TejidoUrbano } from "./TejidoUrbano.js";
import { MasaTectonica } from "./MasaTectonica.js";
import { EstratoAtmosferico } from "./EstratoAtmosferico.js";

export class EnvironmentManager {
  constructor(scene) {
    this.scene = scene;

    // Instanciación de las 3 capas orgánicas del paisaje
    this.tejidoUrbano = new TejidoUrbano(scene);
    this.masaTectonica = new MasaTectonica(scene);
    this.estratoAtmosferico = new EstratoAtmosferico(scene);
  }

  /**
   * Ciclo de actualización unificado
   */
  update(record, stress, frameCount, isSnap = false) {
    const windSpeed = record ? record.wind_speed_180m : 12.0;
    const relativeHumidity = record ? record.relative_humidity_2m : 0.65;

    // Actualización de capas
    this.tejidoUrbano.update(stress, frameCount);
    this.masaTectonica.update(stress, frameCount, isSnap);
    this.estratoAtmosferico.update(windSpeed, relativeHumidity, frameCount);
  }
}
