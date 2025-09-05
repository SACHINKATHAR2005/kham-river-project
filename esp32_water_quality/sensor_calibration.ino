// ESP32 Sensor Calibration Helper
// Use this code to calibrate your sensors before using the main water quality monitor

#include <OneWire.h>
#include <DallasTemperature.h>

// Sensor pins
#define PH_PIN A0
#define TDS_PIN A1
#define TURBIDITY_PIN A2
#define EC_PIN A3
#define TEMP_SENSOR_PIN 2

// Temperature sensor setup
OneWire oneWire(TEMP_SENSOR_PIN);
DallasTemperature temperatureSensor(&oneWire);

void setup() {
  Serial.begin(115200);
  temperatureSensor.begin();
  
  Serial.println("=== ESP32 Water Quality Sensor Calibration ===");
  Serial.println("This will help you calibrate your sensors");
  Serial.println("Have standard solutions ready for calibration");
  delay(2000);
}

void loop() {
  Serial.println("\n📊 Raw Sensor Readings:");
  
  // Read all sensors
  int phRaw = analogRead(PH_PIN);
  int tdsRaw = analogRead(TDS_PIN);
  int turbidityRaw = analogRead(TURBIDITY_PIN);
  int ecRaw = analogRead(EC_PIN);
  
  temperatureSensor.requestTemperatures();
  float temperature = temperatureSensor.getTempCByIndex(0);
  
  // Display raw values
  Serial.println("pH Raw: " + String(phRaw) + " (0-4095)");
  Serial.println("TDS Raw: " + String(tdsRaw) + " (0-4095)");
  Serial.println("Turbidity Raw: " + String(turbidityRaw) + " (0-4095)");
  Serial.println("EC Raw: " + String(ecRaw) + " (0-4095)");
  Serial.println("Temperature: " + String(temperature, 2) + "°C");
  
  // Show current mapping (adjust these in main code)
  Serial.println("\n🔧 Current Mappings:");
  Serial.println("pH: " + String(mapFloat(phRaw, 0, 4095, 0, 14), 2));
  Serial.println("TDS: " + String(mapFloat(tdsRaw, 0, 4095, 0, 1000), 2) + " ppm");
  Serial.println("EC: " + String(mapFloat(ecRaw, 0, 4095, 0, 2000), 2) + " µS/cm");
  Serial.println("Turbidity: " + String(mapFloat(turbidityRaw, 0, 4095, 0, 100), 2) + " NTU");
  
  Serial.println("\n📝 Calibration Notes:");
  Serial.println("1. Test with known pH 7.0 solution");
  Serial.println("2. Test with distilled water (TDS ~0)");
  Serial.println("3. Test with clear water (Turbidity ~0)");
  Serial.println("4. Adjust mapping values in main code");
  
  delay(5000);
}

float mapFloat(int value, int fromLow, int fromHigh, float toLow, float toHigh) {
  return (value - fromLow) * (toHigh - toLow) / (fromHigh - fromLow) + toLow;
}
