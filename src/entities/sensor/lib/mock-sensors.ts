import { DEFAULT_SENSOR_THRESHOLDS } from "@/shared/constants/thresholds";
import type { RawReading } from "@/entities/reading/api/fetch-sensor-history";
import type { Sensor, SensorPayload } from "../model/types";

/**
 * Sensores de demonstração, gerados no navegador.
 *
 * Eles existiam no back-end: o `sensor-simulator` publicava as mesmas três
 * leituras no broker MQTT local. Só que o `mqtt-sub` da `main` assina apenas
 * `application/+/device/+/event/up` em networkserver2.maua.br — as linhas do
 * broker local estão comentadas. O simulador ficou órfão, e com ele os únicos
 * sensores que tinham coordenada.
 *
 * O gerador abaixo é a porta direta do `genReading` de sensor-simulator/
 * sensors.go, para as séries terem a mesma forma de antes: luminosidade e
 * temperatura seguindo o ciclo dia/noite, solo seguindo o ar com amortecimento
 * e bateria decaindo ~20% a cada 30 dias.
 *
 * O dispositivo LoRa real continua vindo da API e entra na mesma lista.
 */

// Centro da fazenda; ~0.001 grau ≈ 111 m.
const CENTER_LAT = -23.6484655;
const CENTER_LON = -46.5739827;

const MOCK_HISTORY_DAYS = 30;
const MOCK_INTERVAL_SEC = 15 * 60;

/** Nenhuma tela mostra este campo; existe só para satisfazer o RawReading. */
const MOCK_USER_ID = "simulador";

type MockValue = Record<keyof SensorPayload, number>;

interface MockDevice {
  devEUI: string;
  name: string;
  latitude: number;
  longitude: number;
  /**
   * Força um parâmetro fora dos limites depois da leitura gerada, para o mapa
   * exibir os três estados do pin. Vale para a série inteira, inclusive o
   * histórico: sem isso o gráfico mostraria o sensor saudável e só o último
   * ponto em alerta.
   */
  scenario?: (value: MockValue) => void;
}

export const MOCK_DEVICES: readonly MockDevice[] = [
  {
    devEUI: "1e23a01",
    name: "Plantação Norte",
    latitude: CENTER_LAT + 0.002,
    longitude: CENTER_LON + 0.001,
  },
  {
    devEUI: "1e23a02",
    name: "Plantação Sul",
    latitude: CENTER_LAT - 0.0015,
    longitude: CENTER_LON + 0.0022,
    // 18% fica entre alertLow (15) e warnLow (20): pin amarelo, ícone de bateria.
    scenario: (value) => {
      value.battery = 18;
    },
  },
  {
    devEUI: "1e23a03",
    name: "Plantação Leste",
    latitude: CENTER_LAT + 0.0008,
    longitude: CENTER_LON - 0.0018,
    // 14% está abaixo de alertLow (20): pin vermelho, ícone de gota.
    scenario: (value) => {
      value.soil_moisture = 14;
    },
  },
];

export const isMockDevice = (devEUI: string | null | undefined): boolean =>
  !!devEUI && MOCK_DEVICES.some((device) => device.devEUI === devEUI);

const hash32 = (text: string): number => {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
};

/**
 * PRNG semeado, e não Math.random: a mesma leitura precisa sair idêntica a
 * cada chamada. Com aleatoriedade real o gráfico tremeria a cada refetch e o
 * último ponto nunca bateria com o valor do card.
 */
const rng = (seed: number) => {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

const clamp = (v: number, min: number, max: number): number => Math.min(Math.max(v, min), max);
const round2 = (v: number): number => Math.round(v * 100) / 100;

/** Personalidade fixa por sensor, para as séries não ficarem idênticas. */
const sensorBias = (devEUI: string): number => (hash32(devEUI) % 100) / 100 - 0.5;

const genValue = (device: MockDevice, tsSec: number, batteryStartSec: number): MockValue => {
  const rand = rng(hash32(device.devEUI) ^ tsSec);
  const date = new Date(tsSec * 1000);
  const hourF = date.getHours() + date.getMinutes() / 60;
  const bias = sensorBias(device.devEUI);

  // Temperatura do ar: senoide com pico ~14h (média 22, amplitude 9).
  const airTemperature = 22 + 9 * Math.sin((2 * Math.PI * (hourF - 8)) / 24) + bias * 2 + (rand() - 0.5) * 3;

  // Luminosidade: curva solar entre 6h e 18h, quase zero à noite.
  const luminosity =
    hourF >= 6 && hourF < 18
      ? 95000 * Math.sin((Math.PI * (hourF - 6)) / 12) * (0.85 + rand() * 0.15)
      : rand() * 50;

  const soilTemperature = clamp(airTemperature * 0.6 + 8 + (rand() - 0.5) * 1.6, 16, 28);

  // Piso em 38, e não em 30: o limite de atenção do painel é `valor <= 30`,
  // então encostar no piso deixaria um sensor saudável sempre em amarelo.
  const soilMoisture = clamp(
    52 + bias * 30 + 10 * Math.sin((2 * Math.PI * tsSec) / (86400 * 7)) + (rand() - 0.5) * 6,
    38,
    75,
  );

  const airHumidity = clamp(110 - 2 * airTemperature + bias * 10 + (rand() - 0.5) * 6, 45, 90);

  // Bateria: 100% no início da janela, -20% a cada 30 dias, piso em 20%.
  const days = (tsSec - batteryStartSec) / 86400;
  const battery = clamp(100 - days * (20 / 30) + (rand() - 0.5), 20, 100);

  const value: MockValue = {
    air_temperature: round2(airTemperature),
    soil_temperature: round2(soilTemperature),
    soil_moisture: round2(soilMoisture),
    air_humidity: round2(airHumidity),
    luminosity: round2(clamp(luminosity, 0, 100000)),
    battery: round2(battery),
  };

  device.scenario?.(value);
  return value;
};

/**
 * Janela alinhada na grade de 15 minutos. Sem o alinhamento, o último ponto
 * andaria a cada render e o gráfico piscaria sozinho.
 */
const mockWindow = () => {
  const nowSec = Math.floor(Date.now() / 1000);
  const endSec = nowSec - (nowSec % MOCK_INTERVAL_SEC);
  return { startSec: endSec - MOCK_HISTORY_DAYS * 86400, endSec };
};

export const buildMockHistory = (devEUI: string): RawReading[] => {
  const device = MOCK_DEVICES.find((d) => d.devEUI === devEUI);
  if (!device) return [];

  const { startSec, endSec } = mockWindow();
  const readings: RawReading[] = [];

  for (let ts = startSec; ts <= endSec; ts += MOCK_INTERVAL_SEC) {
    readings.push({
      timestamp: ts,
      userId: MOCK_USER_ID,
      devEUI: device.devEUI,
      devAddr: device.devEUI,
      deviceType: "sensor",
      name: device.name,
      value: {
        ...genValue(device, ts, startSec),
        latitude: device.latitude,
        longitude: device.longitude,
      },
    });
  }

  return readings;
};

export const buildMockSensors = (): Sensor[] => {
  const { startSec, endSec } = mockWindow();

  return MOCK_DEVICES.map((device) => ({
    id: device.devEUI,
    devEUI: device.devEUI,
    devAddr: device.devEUI,
    name: device.name,
    nickname: device.name,
    deviceType: "sensor",
    latitude: device.latitude,
    longitude: device.longitude,
    thresholds: { ...DEFAULT_SENSOR_THRESHOLDS },
    lastReading: genValue(device, endSec, startSec) as Partial<SensorPayload>,
    lastReadingAt: endSec,
  }));
};
