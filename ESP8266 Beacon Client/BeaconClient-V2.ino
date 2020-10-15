#include <ArduinoJson.h>

#include <SocketIoClient.h>
#include <ESP8266mDNS.h>
#include <ESP8266WebServer.h>
#include <EEPROM.h>

/*

FREQUENCY
LIGHTPATTERN - SOLID, STROBE, FADE
COLORPATTERN - RANDOM, RANGE, RANDOMRANGE, LIST, RANDOMLIST
COLORS

{
 "frequency":"1000",
 "lightpattern":"solid",
 "colorpattern":"list",
 "colors: [
  "FF000000",
  "00FF0000",
  "0000FF00"]
}

*/

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
//defaults
int frequency = 1000;
String lightPattern = "solid";
String colorPattern = "list";
unsigned long colors[64] = { 0xFF000000, 0xFF330000, 0xFFAA0000, 0x00FF0000, 0x0011FF00, 0x0000FF00, 0xFF00FF00 };
int currentColor = 0;
unsigned long currentRedIntensity = 255;
unsigned long currentGreenIntensity = 0;
unsigned long currentBlueIntensity = 0;
unsigned long currentWhiteIntensity = 0;
int numColors = 7;
unsigned long programTimer = millis();
boolean on = true;
boolean fadingIn = false;
double rFader = 0;
double gFader = 0;
double bFader = 0;
double wFader = 0;
double redRatio = 1;
double greenRatio = 1;
double blueRatio = 1;
double whiteRatio = 1;
double maxIntensity = 256;

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
    programLoop();    
  }
}

void programLoop() {
  unsigned long currentTimer = millis();
  if (currentTimer - programTimer >= frequency) {
    setLightPattern();
    setColorPattern();
    setPins(); 
    programTimer = currentTimer;
  }
}

void softReset() {
  ESP.restart();
}
