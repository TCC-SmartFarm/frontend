#!/usr/bin/env bash
# Simula 10 sensores da fazenda1 publicando 30 dias de leituras
# (4 leituras por dia = 120 mensagens por sensor, 1200 no total).
#
# Requer: mosquitto_pub no PATH.
# Uso:    ./simulate_sensors.sh

set -euo pipefail

HOST="${MQTT_HOST:-localhost}"
PORT="${MQTT_PORT:-1883}"
USER="${MQTT_USER:-fazenda1}"
PASS="${MQTT_PASS:-pass}"
USER_ID="${USER_ID:-userId}"
FARM="${FARM:-fazenda1}"

# Centro da fazenda (referência fornecida)
CENTER_LAT="-23.6484655"
CENTER_LON="-46.5739827"

# 10 sensores: id curto + nome amigável
SENSOR_IDS=(
  "1e23a01" "1e23a02" "1e23a03" "1e23a04" "1e23a05"
  "1e23a06" "1e23a07" "1e23a08" "1e23a09" "1e23a10"
)
SENSOR_NAMES=(
  "Plantacao Norte"
  "Plantacao Sul"
  "Plantacao Leste"
  "Plantacao Oeste"
  "Estufa A"
  "Estufa B"
  "Pomar Velho"
  "Horta Central"
  "Pasto Alto"
  "Pasto Baixo"
)

# Offsets de latitude/longitude por sensor (graus). ~0.001 grau ≈ 111 m.
LAT_OFFSETS=( "0.0020" "-0.0015"  "0.0008" "-0.0025"  "0.0012" "-0.0007"  "0.0030" "-0.0018"  "0.0005" "-0.0010" )
LON_OFFSETS=( "0.0010"  "0.0022" "-0.0018"  "0.0015" "-0.0028"  "0.0007" "-0.0012"  "0.0025" "-0.0020"  "0.0003" )

READINGS_PER_DAY=4
DAYS=30
INTERVAL_SECONDS=$(( 86400 / READINGS_PER_DAY ))  # 21600 = 6h

NOW=$(date +%s)
START_TS=$(( NOW - DAYS * 86400 ))

# Função: número pseudo-aleatório float entre $1 e $2 com 2 casas decimais
rand_range() {
  awk -v min="$1" -v max="$2" 'BEGIN{srand(); printf "%.2f", min + rand()*(max-min)}'
}

# Para variabilidade: cria seed distinta por iteração injetando RANDOM no awk.
rand_seed() {
  awk -v min="$1" -v max="$2" -v seed="$RANDOM$RANDOM" \
    'BEGIN{srand(seed); printf "%.2f", min + rand()*(max-min)}'
}

total=0
for i in "${!SENSOR_IDS[@]}"; do
  sid="${SENSOR_IDS[$i]}"
  sname="${SENSOR_NAMES[$i]}"
  lat=$(awk -v c="$CENTER_LAT" -v o="${LAT_OFFSETS[$i]}" 'BEGIN{printf "%.7f", c + o}')
  lon=$(awk -v c="$CENTER_LON" -v o="${LON_OFFSETS[$i]}" 'BEGIN{printf "%.7f", c + o}')
  topic="${USER_ID}/${FARM}/sensor/${sid}/dados"

  echo "==> Sensor ${sid} (${sname}) @ ${lat},${lon} -> ${topic}"

  # bateria decresce de 100 a ~80 ao longo dos 30 dias
  for ((r = 0; r < DAYS * READINGS_PER_DAY; r++)); do
    ts=$(( START_TS + r * INTERVAL_SECONDS ))

    # hora do dia para modular luminosidade e temperatura
    hour=$(( (ts / 3600) % 24 ))

    # Luminosidade: alta de dia, ~0 à noite
    if (( hour >= 6 && hour <= 18 )); then
      lux=$(rand_seed 20000 95000)
    else
      lux=$(rand_seed 0 50)
    fi

    # Temperatura do ar: mais alta à tarde
    if (( hour >= 12 && hour <= 16 )); then
      air_t=$(rand_seed 24 33)
    elif (( hour >= 6 && hour <= 18 )); then
      air_t=$(rand_seed 18 26)
    else
      air_t=$(rand_seed 12 20)
    fi

    soil_t=$(rand_seed 16 28)
    soil_m=$(rand_seed 30 75)
    air_h=$(rand_seed 45 90)

    # bateria linear decrescente com pequeno ruído
    batt=$(awk -v r="$r" -v total="$(( DAYS * READINGS_PER_DAY ))" -v s="$RANDOM" \
      'BEGIN{srand(s); printf "%.2f", 100 - (r/total)*20 + (rand()-0.5)}')

    payload=$(cat <<EOF
{"name":"${sname}","soil_temperature":${soil_t},"soil_moisture":${soil_m},"air_humidity":${air_h},"luminosity":${lux},"air_temperature":${air_t},"battery":${batt},"latitude":"${lat}","longitude":"${lon}","timestamp":${ts}}
EOF
)

    # -r só na última mensagem de cada sensor (mantém retain com leitura mais recente).
    if (( r == DAYS * READINGS_PER_DAY - 1 )); then
      mosquitto_pub -h "$HOST" -p "$PORT" -i "$sid" -u "$USER" -P "$PASS" \
        -t "$topic" -m "$payload" -r
    else
      mosquitto_pub -h "$HOST" -p "$PORT" -i "$sid" -u "$USER" -P "$PASS" \
        -t "$topic" -m "$payload"
    fi

    total=$(( total + 1 ))
  done
done

echo ""
echo "Concluido. Total de mensagens publicadas: ${total}"
