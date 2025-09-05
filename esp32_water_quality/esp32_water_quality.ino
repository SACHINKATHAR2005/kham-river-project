#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Server configuration
const char* serverURL = "http://your-server-ip:5000/api/waterQuality/add";
const char* stationId = "YOUR_STATION_MONGODB_ID"; // Replace with your actual station ID

// Display configuration
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define SCREEN_ADDRESS 0x3C
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// Sensor pins
#define PH_PIN A0
#define TDS_PIN A1
#define TURBIDITY_PIN A2
#define TEMP_SENSOR_PIN 2

// Temperature sensor setup
OneWire oneWire(TEMP_SENSOR_PIN);
DallasTemperature temperatureSensor(&oneWire);

// EC calculation constant
const float EC_FACTOR = 0.6; // EC = TDS / 0.6

// Timing variables
unsigned long lastReading = 0;
unsigned long lastDisplayUpdate = 0;
const unsigned long READING_INTERVAL = 300000; // 5 minutes (300,000 ms)
const unsigned long RETRY_INTERVAL = 60000;    // 1 minute retry on failure
const unsigned long DISPLAY_INTERVAL = 500;   // 0.5 seconds for parameter cycling

// Display variables
int currentDisplayParam = 0;
const int TOTAL_DISPLAY_PARAMS = 6; // WiFi status + 5 parameters

// Data storage for offline mode
struct WaterQualityData {
  float pH;
  float temperature;
  float ec;
  float tds;
  float turbidity;
  unsigned long timestamp;
};

const int MAX_STORED_READINGS = 50;
WaterQualityData storedReadings[MAX_STORED_READINGS];
int storedCount = 0;

// Current sensor readings (global for display)
WaterQualityData currentReading;

void setup() {
  Serial.begin(115200);
  
  // Initialize display
  if(!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println(F("SSD1306 allocation failed"));
    for(;;);
  }
  
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println("Water Quality Monitor");
  display.println("Initializing...");
  display.display();
  delay(2000);
  
  // Initialize temperature sensor
  temperatureSensor.begin();
  
  // Connect to WiFi
  connectToWiFi();
  
  Serial.println("ESP32 Water Quality Monitor Started");
  Serial.println("Station ID: " + String(stationId));
}

void loop() {
  unsigned long currentTime = millis();
  
  // Update display every 0.5 seconds
  if (currentTime - lastDisplayUpdate >= DISPLAY_INTERVAL) {
    currentReading = collectSensorData();
    updateDisplay();
    lastDisplayUpdate = currentTime;
  }
  
  // Take readings and send to server at specified intervals
  if (currentTime - lastReading >= READING_INTERVAL) {
    WaterQualityData reading = collectSensorData();
    
    // Try to send data if connected to WiFi
    if (WiFi.status() == WL_CONNECTED) {
      if (sendDataToServer(reading)) {
        Serial.println("✅ Data sent successfully");
        
        // Send any stored offline data
        sendStoredData();
      } else {
        Serial.println("❌ Failed to send data - storing locally");
        storeDataLocally(reading);
      }
    } else {
      Serial.println("📡 No WiFi - storing data locally");
      storeDataLocally(reading);
      
      // Try to reconnect
      connectToWiFi();
    }
    
    lastReading = currentTime;
  }
  
  delay(100); // Small delay to prevent watchdog issues
}

void connectToWiFi() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("🔄 Connecting to WiFi...");
    WiFi.begin(ssid, password);
    
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
      delay(500);
      Serial.print(".");
      attempts++;
    }
    
    if (WiFi.status() == WL_CONNECTED) {
      Serial.println();
      Serial.println("✅ WiFi Connected!");
      Serial.print("IP Address: ");
      Serial.println(WiFi.localIP());
    } else {
      Serial.println();
      Serial.println("❌ WiFi Connection Failed");
    }
  }
}

WaterQualityData collectSensorData() {
  WaterQualityData data;
  
  Serial.println("📊 Collecting sensor data...");
  
  // Read temperature
  temperatureSensor.requestTemperatures();
  data.temperature = temperatureSensor.getTempCByIndex(0);
  
  // Read pH (calibration needed based on your sensor)
  int phRaw = analogRead(PH_PIN);
  data.pH = mapFloat(phRaw, 0, 4095, 0, 14); // Adjust based on your pH sensor
  
  // Read TDS (Total Dissolved Solids)
  int tdsRaw = analogRead(TDS_PIN);
  data.tds = mapFloat(tdsRaw, 0, 4095, 0, 1000); // Adjust based on your TDS sensor
  
  // Calculate EC from TDS using standard formula: EC = TDS / 0.6
  data.ec = data.tds / EC_FACTOR;
  
  // Read Turbidity
  int turbidityRaw = analogRead(TURBIDITY_PIN);
  data.turbidity = mapFloat(turbidityRaw, 0, 4095, 0, 100); // Adjust based on your turbidity sensor
  
  data.timestamp = millis();
  
  // Print readings
  Serial.println("📈 Sensor Readings:");
  Serial.println("  pH: " + String(data.pH, 2));
  Serial.println("  Temperature: " + String(data.temperature, 2) + "°C");
  Serial.println("  TDS: " + String(data.tds, 2) + " ppm");
  Serial.println("  EC: " + String(data.ec, 2) + " µS/cm");
  Serial.println("  Turbidity: " + String(data.turbidity, 2) + " NTU");
  
  return data;
}

bool sendDataToServer(WaterQualityData data) {
  if (WiFi.status() != WL_CONNECTED) {
    return false;
  }
  
  HTTPClient http;
  http.begin(serverURL);
  http.addHeader("Content-Type", "application/json");
  
  // Create JSON payload
  DynamicJsonDocument doc(1024);
  doc["stationId"] = stationId;
  doc["pH"] = data.pH;
  doc["temperature"] = data.temperature;
  doc["ec"] = data.ec;
  doc["tds"] = data.tds;
  doc["turbidity"] = data.turbidity;
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  Serial.println("📤 Sending data: " + jsonString);
  
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("📥 Server response (" + String(httpResponseCode) + "): " + response);
    
    http.end();
    return (httpResponseCode == 200 || httpResponseCode == 201);
  } else {
    Serial.println("❌ HTTP Error: " + String(httpResponseCode));
    http.end();
    return false;
  }
}

void storeDataLocally(WaterQualityData data) {
  if (storedCount < MAX_STORED_READINGS) {
    storedReadings[storedCount] = data;
    storedCount++;
    Serial.println("💾 Data stored locally (" + String(storedCount) + "/" + String(MAX_STORED_READINGS) + ")");
  } else {
    Serial.println("⚠️ Local storage full! Overwriting oldest data.");
    // Shift array and add new data
    for (int i = 0; i < MAX_STORED_READINGS - 1; i++) {
      storedReadings[i] = storedReadings[i + 1];
    }
    storedReadings[MAX_STORED_READINGS - 1] = data;
  }
}

void sendStoredData() {
  if (storedCount == 0) return;
  
  Serial.println("📤 Sending " + String(storedCount) + " stored readings...");
  
  int successCount = 0;
  for (int i = 0; i < storedCount; i++) {
    if (sendDataToServer(storedReadings[i])) {
      successCount++;
      delay(1000); // Small delay between requests
    } else {
      break; // Stop if we encounter an error
    }
  }
  
  if (successCount > 0) {
    // Remove sent data from storage
    for (int i = successCount; i < storedCount; i++) {
      storedReadings[i - successCount] = storedReadings[i];
    }
    storedCount -= successCount;
    Serial.println("✅ Sent " + String(successCount) + " stored readings");
  }
}

void updateDisplay() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  
  // Display title
  display.println("Water Quality Monitor");
  display.println("--------------------");
  
  // Cycle through different parameters every 0.5 seconds
  switch(currentDisplayParam) {
    case 0: // WiFi Status
      display.println("WiFi Status:");
      if (WiFi.status() == WL_CONNECTED) {
        display.println("CONNECTED");
        display.println("IP: " + WiFi.localIP().toString());
        display.println("Hotspot: " + String(ssid));
      } else {
        display.println("DISCONNECTED");
        display.println("Trying to connect...");
      }
      break;
      
    case 1: // pH
      display.println("pH Level:");
      display.setTextSize(2);
      display.println(String(currentReading.pH, 2));
      display.setTextSize(1);
      display.println("Range: 0-14");
      break;
      
    case 2: // Temperature
      display.println("Temperature:");
      display.setTextSize(2);
      display.println(String(currentReading.temperature, 1) + "C");
      display.setTextSize(1);
      display.println("Celsius");
      break;
      
    case 3: // TDS
      display.println("TDS (Total Dissolved):");
      display.setTextSize(2);
      display.println(String(currentReading.tds, 0));
      display.setTextSize(1);
      display.println("ppm (parts per million)");
      break;
      
    case 4: // EC (calculated from TDS)
      display.println("EC (Electrical Cond.):");
      display.setTextSize(2);
      display.println(String(currentReading.ec, 0));
      display.setTextSize(1);
      display.println("uS/cm (TDS/0.6)");
      break;
      
    case 5: // Turbidity
      display.println("Turbidity:");
      display.setTextSize(2);
      display.println(String(currentReading.turbidity, 1));
      display.setTextSize(1);
      display.println("NTU (clarity)");
      break;
  }
  
  // Show data transmission status
  display.setCursor(0, 56);
  display.print("Stored: " + String(storedCount));
  if (WiFi.status() == WL_CONNECTED) {
    display.print(" | SYNC ON");
  } else {
    display.print(" | OFFLINE");
  }
  
  display.display();
  
  // Move to next parameter
  currentDisplayParam = (currentDisplayParam + 1) % TOTAL_DISPLAY_PARAMS;
}

float mapFloat(int value, int fromLow, int fromHigh, float toLow, float toHigh) {
  return (value - fromLow) * (toHigh - toLow) / (fromHigh - fromLow) + toLow;
}

// Function to handle deep sleep (optional for battery-powered setups)
void enterDeepSleep(int seconds) {
  Serial.println("💤 Entering deep sleep for " + String(seconds) + " seconds");
  esp_sleep_enable_timer_wakeup(seconds * 1000000);
  esp_deep_sleep_start();
}
