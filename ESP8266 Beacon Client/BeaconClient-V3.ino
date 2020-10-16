#include <ArduinoJson.h>

#include <SocketIoClient.h>
#include <ESP8266mDNS.h>
#include <ESP8266WebServer.h>
#include <EEPROM.h>

#include "LEDController.h"

// Networking Variables
struct WifiAuthPair {
  char ssid[32];
  char password[63];
};

boolean settingUpWifi = false;
boolean urlConnected = false;
unsigned long connectionTimer = millis() + 30000;

SocketIoClient socket;

ESP8266WebServer server(80);
DynamicJsonDocument jsonBuffer(1024);

//LED Controller Variables
const int redPin = 13;
const int greenPin = 15;
const int bluePin = 12;
const int whitePin = 4;

LEDController ledController = LEDController(redPin, greenPin, bluePin, whitePin);

void setup() {
  Serial.begin(115200);
  EEPROM.begin(512);
  connectToNetwork();
}

void loop() {
  if (settingUpWifi) {
    server.handleClient();    
  } else {
    if (!urlConnected && connectionTimer < millis())
      setupWifi();
    socket.loop();
    ledController.beaconLoop();
  }
}

void softReset() {
  ESP.restart();
}
