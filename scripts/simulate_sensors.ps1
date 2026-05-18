# Simula 10 sensores da fazenda1 publicando 30 dias de leituras
# (4 leituras por dia = 120 mensagens por sensor, 1200 no total).
#
# Requer: mosquitto_pub no PATH (instalavel via Mosquitto for Windows).
# Uso:    powershell -ExecutionPolicy Bypass -File .\simulate_sensors.ps1

[CmdletBinding()]
param(
    [string]$MqttHost = $(if ($env:MQTT_HOST) { $env:MQTT_HOST } else { "localhost" }),
    [int]   $Port     = $(if ($env:MQTT_PORT) { [int]$env:MQTT_PORT } else { 1883 }),
    [string]$User     = $(if ($env:MQTT_USER) { $env:MQTT_USER } else { "fazenda1" }),
    [string]$Pass     = $(if ($env:MQTT_PASS) { $env:MQTT_PASS } else { "pass" }),
    [string]$UserId   = $(if ($env:USER_ID)   { $env:USER_ID }   else { "userId" }),
    [string]$Farm     = $(if ($env:FARM)      { $env:FARM }      else { "fazenda1" })
)

$ErrorActionPreference = "Stop"

# Centro da fazenda (referencia fornecida)
$CenterLat = -23.6484655
$CenterLon = -46.5739827

$Sensors = @(
    @{ Id = "1e23a01"; Name = "Plantacao Norte";  LatOff =  0.0020; LonOff =  0.0010 },
    @{ Id = "1e23a02"; Name = "Plantacao Sul";    LatOff = -0.0015; LonOff =  0.0022 },
    @{ Id = "1e23a03"; Name = "Plantacao Leste";  LatOff =  0.0008; LonOff = -0.0018 },
    @{ Id = "1e23a04"; Name = "Plantacao Oeste";  LatOff = -0.0025; LonOff =  0.0015 },
    @{ Id = "1e23a05"; Name = "Estufa A";         LatOff =  0.0012; LonOff = -0.0028 },
    @{ Id = "1e23a06"; Name = "Estufa B";         LatOff = -0.0007; LonOff =  0.0007 },
    @{ Id = "1e23a07"; Name = "Pomar Velho";      LatOff =  0.0030; LonOff = -0.0012 },
    @{ Id = "1e23a08"; Name = "Horta Central";    LatOff = -0.0018; LonOff =  0.0025 },
    @{ Id = "1e23a09"; Name = "Pasto Alto";       LatOff =  0.0005; LonOff = -0.0020 },
    @{ Id = "1e23a10"; Name = "Pasto Baixo";      LatOff = -0.0010; LonOff =  0.0003 }
)

$ReadingsPerDay  = 4
$Days            = 30
$IntervalSeconds = 86400 / $ReadingsPerDay   # 21600 = 6h
$TotalReadings   = $Days * $ReadingsPerDay

$NowEpoch   = [int][double]::Parse((Get-Date -UFormat %s))
$StartEpoch = $NowEpoch - ($Days * 86400)

$rnd = [System.Random]::new()

function Rand-Range([double]$min, [double]$max) {
    return [math]::Round($min + ($rnd.NextDouble() * ($max - $min)), 2)
}

$total = 0

foreach ($i in 0..($Sensors.Count - 1)) {
    $s = $Sensors[$i]
    $lat = [math]::Round($CenterLat + $s.LatOff, 7)
    $lon = [math]::Round($CenterLon + $s.LonOff, 7)
    $topic = "$UserId/$Farm/sensor/$($s.Id)/dados"

    Write-Host "==> Sensor $($s.Id) ($($s.Name)) @ $lat,$lon -> $topic"

    for ($r = 0; $r -lt $TotalReadings; $r++) {
        $ts = $StartEpoch + ($r * $IntervalSeconds)
        $hour = ([int]([math]::Floor($ts / 3600))) % 24

        if ($hour -ge 6 -and $hour -le 18) {
            $lux = Rand-Range 20000 95000
        } else {
            $lux = Rand-Range 0 50
        }

        if ($hour -ge 12 -and $hour -le 16) {
            $airT = Rand-Range 24 33
        } elseif ($hour -ge 6 -and $hour -le 18) {
            $airT = Rand-Range 18 26
        } else {
            $airT = Rand-Range 12 20
        }

        $soilT = Rand-Range 16 28
        $soilM = Rand-Range 30 75
        $airH  = Rand-Range 45 90
        $batt  = [math]::Round(100 - (($r / $TotalReadings) * 20) + ($rnd.NextDouble() - 0.5), 2)

        # Cultura invariante para garantir ponto decimal em vez de virgula
        $ci = [System.Globalization.CultureInfo]::InvariantCulture
        $payload = '{{"name":"{0}","soil_temperature":{1},"soil_moisture":{2},"air_humidity":{3},"luminosity":{4},"air_temperature":{5},"battery":{6},"latitude":"{7}","longitude":"{8}","timestamp":{9}}}' -f `
            $s.Name,
            $soilT.ToString($ci),
            $soilM.ToString($ci),
            $airH.ToString($ci),
            $lux.ToString($ci),
            $airT.ToString($ci),
            $batt.ToString($ci),
            $lat.ToString($ci),
            $lon.ToString($ci),
            $ts

        $args = @(
            "-h", $MqttHost,
            "-p", $Port,
            "-i", $s.Id,
            "-u", $User,
            "-P", $Pass,
            "-t", $topic,
            "-m", $payload
        )

        # -r somente na ultima mensagem de cada sensor
        if ($r -eq ($TotalReadings - 1)) {
            $args += "-r"
        }

        & mosquitto_pub @args
        if ($LASTEXITCODE -ne 0) {
            Write-Error "mosquitto_pub falhou (exit $LASTEXITCODE) no sensor $($s.Id), leitura $r"
            exit $LASTEXITCODE
        }

        $total++
    }
}

Write-Host ""
Write-Host "Concluido. Total de mensagens publicadas: $total"
