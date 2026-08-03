/**
 * MÓDULO 1: API Open-Meteo
 */

import { fetchWeatherApi } from "openmeteo";

const DEFAULT_PARAMS = {
  // Bogotá (Ajustable a tu locación)
  latitude: 4.6097,
  longitude: -74.0817,
  hourly: [
    "precipitation_probability",
    "temperature_180m",
    "wind_speed_180m",
    "relative_humidity_2m",
  ],
  forecast_days: 3,
};

function buildRequestParams(options = {}) {
  return {
    ...DEFAULT_PARAMS,
    ...options,
    hourly: options.hourly ?? DEFAULT_PARAMS.hourly,
  };
}

function formatDate(date) {
  return date.toISOString().slice(0, 16).replace("T", " ");
}

function createMockWeatherData() {
  const mock = [];
  const startTime = new Date();

  for (let i = 0; i < 72; i += 1) {
    const timeSlot = new Date(startTime.getTime() + i * 3600 * 1000);
    mock.push({
      datetime: formatDate(timeSlot),
      precipitation_probability: Math.floor(Math.sin(i * 0.2) * 50 + 50),
      temperature_180m: Number((12 + Math.cos(i * 0.1) * 8).toFixed(1)),
      wind_speed_180m: Number((10 + Math.sin(i * 0.3) * 25).toFixed(1)),
      relative_humidity_2m: Math.floor(60 + Math.cos(i * 0.15) * 30),
    });
  }

  return mock;
}

function mapWeatherData(hourly, utcOffsetSeconds) {
  const totalPoints = Math.max(
    1,
    (Number(hourly.timeEnd()) - Number(hourly.time())) / hourly.interval(),
  );

  const time = Array.from(
    { length: totalPoints },
    (_, index) =>
      new Date(
        (Number(hourly.time()) + index * hourly.interval() + utcOffsetSeconds) *
          1000,
      ),
  );

  const precipitationProbability = hourly.variables(0).valuesArray();
  const temperature180m = hourly.variables(1).valuesArray();
  const windSpeed180m = hourly.variables(2).valuesArray();
  const relativeHumidity2m = hourly.variables(3).valuesArray();

  return time.map((date, index) => ({
    datetime: formatDate(date),
    precipitation_probability: precipitationProbability[index],
    temperature_180m: temperature180m[index],
    wind_speed_180m: windSpeed180m[index],
    relative_humidity_2m: relativeHumidity2m[index],
  }));
}

export async function fetchWeatherData(options = {}) {
  const params = buildRequestParams(options);

  try {
    const url = "https://api.open-meteo.com/v1/forecast";
    const responses = await fetchWeatherApi(url, params);
    const response = responses[0];
    const utcOffsetSeconds = response.utcOffsetSeconds();
    const hourly = response.hourly();

    return mapWeatherData(hourly, utcOffsetSeconds);
  } catch (error) {
    console.warn(
      "⚠️ No se pudo consultar Open-Meteo. Se usará el mock de respaldo.",
      error,
    );
    return createMockWeatherData();
  }
}

export default fetchWeatherData;
