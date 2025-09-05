# ESP32 Water Quality Monitor Setup Guide

## 🔧 Hardware Requirements

### ESP32 Board
- ESP32 DevKit or similar
- Power supply (5V/3.3V)

### Water Quality Sensors
- **pH Sensor** → Analog Pin A0
- **TDS Sensor** → Analog Pin A1  
- **Turbidity Sensor** → Analog Pin A2
- **EC Sensor** → Analog Pin A3
- **DS18B20 Temperature Sensor** → Digital Pin 2

## 📋 Arduino Libraries Required

Install these libraries in Arduino IDE:
```
WiFi (ESP32 built-in)
HTTPClient (ESP32 built-in)
ArduinoJson (by Benoit Blanchon)
OneWire (by Jim Studt)
DallasTemperature (by Miles Burton)
Adafruit GFX Library (by Adafruit)
Adafruit SSD1306 (by Adafruit)
```

## ⚙️ Configuration Steps

### 1. Update WiFi Credentials
```cpp
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
```

### 2. Set Server URL
```cpp
const char* serverURL = "http://your-server-ip:5000/api/waterQuality/add";
```

### 3. Configure Station ID
Get your station MongoDB ID from your database and update:
```cpp
const char* stationId = "YOUR_STATION_MONGODB_ID";
```

### 4. Calibrate Sensors
Adjust the mapping values based on your specific sensors:
```cpp
// pH sensor calibration (0-14 pH range)
data.pH = mapFloat(phRaw, 0, 4095, 0, 14);

// TDS sensor calibration (0-1000 ppm range)
data.tds = mapFloat(tdsRaw, 0, 4095, 0, 1000);

// EC sensor calibration (0-2000 µS/cm range)
data.ec = mapFloat(ecRaw, 0, 4095, 0, 2000);

// Turbidity sensor calibration (0-100 NTU range)
data.turbidity = mapFloat(turbidityRaw, 0, 4095, 0, 100);
```

## 🔌 Wiring Diagram

```
ESP32 DevKit Pinout:
┌─────────────────┐
│     ESP32       │
│                 │
│ A0  ←─ pH       │
│ A1  ←─ TDS      │
│ A2  ←─ Turbidity│
│ A3  ←─ EC       │
│ D2  ←─ DS18B20  │
│                 │
│ 3V3 ←─ VCC      │
│ GND ←─ GND      │
└─────────────────┘
```

## 🚀 Features

### ✅ Automatic Data Collection
- Reads sensors every 5 minutes
- Validates data before sending
- Automatic sensor calibration support

### ✅ Smart Connectivity
- Auto-connects to WiFi on startup
- Reconnects automatically if connection lost
- Stores data locally when offline

### ✅ Offline Storage
- Stores up to 50 readings when offline
- Automatically syncs when internet returns
- No data loss during network outages

### ✅ Real-time Monitoring
- Serial monitor output for debugging
- Status indicators for all operations
- Error handling and recovery

## 📊 Data Flow

```
ESP32 Sensors → Local Storage → WiFi → Your Server → MongoDB → AI Retraining
```

## 🔄 Automatic AI Retraining

Every time your ESP32 successfully sends data to your server:
1. Data is saved to MongoDB
2. ML model retraining is automatically triggered
3. AI model updates with new water quality patterns
4. Future predictions improve with real sensor data

## 🛠️ Troubleshooting

### WiFi Connection Issues
- Check SSID and password
- Ensure ESP32 is in range
- Monitor serial output for connection status

### Sensor Reading Issues
- Verify wiring connections
- Check sensor power supply
- Calibrate sensors with known standards

### Server Communication Issues
- Verify server URL and port
- Check if server is running
- Ensure station ID exists in database

## 📈 Monitoring

Use Arduino IDE Serial Monitor (115200 baud) to see:
- Sensor readings
- WiFi connection status
- Data transmission results
- Error messages and debugging info

## 🔋 Power Optimization

For battery-powered deployments, uncomment deep sleep functionality:
```cpp
// Add this at the end of loop() for battery saving
// enterDeepSleep(300); // Sleep for 5 minutes
```
