#include <ArduinoJson.h>

#include <SocketIoClient.h>
#include <ESP8266mDNS.h>
#include <ESP8266WebServer.h>

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

const char* ssid[3] = {"YourSSID1", "YourSSID2", "YourSSID3"};
const char* password[3] = {"YourWiFiPassword1","YourWiFiPassword2","YourWiFiPassword3"};
const int knownNetworkCount = sizeof(ssid) / sizeof(ssid[0]);
DynamicJsonDocument jsonBuffer(1024);
const int redPin = 13;
const int greenPin = 15;
const int bluePin = 12;
const int whitePin = 4;

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
boolean settingUpWifi = false;

SocketIoClient socket;

ESP8266WebServer server(80);

void setup() {
  Serial.begin(115200);
  connectToNetwork();

  MDNS.begin("esp8266");
  socket.on("connect", logIP);
  socket.on("receivedProgram", setProgram);
  socket.begin("ec2-54-172-251-229.compute-1.amazonaws.com");
  analogWriteRange(256);
}

void connectToNetwork() {
  boolean networkFound = false;
  int i, n;
  WiFi.mode(WIFI_STA);
  WiFi.disconnect();
  delay(100);

  int numVisibleNetworks = WiFi.scanNetworks();
  if (numVisibleNetworks == 0)
    softReset();

  for (i = 0; i < numVisibleNetworks; i++) {
    for (n = 0; n < knownNetworkCount; n++) {
      if (strcmp(ssid[n], WiFi.SSID(i).c_str())) {
        
      } else {
        networkFound = true;
        break;
      }
    }
    if (networkFound) break;
  }

  if (!networkFound)
    softReset();

  WiFi.begin(ssid[n], password[n]);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
}

void softReset() {
  ESP.restart();
}
void setupWifi() {
  settingUpWifi = true;
  const char *ssid = "BeaconOfGondor";
  WiFi.softAP(ssid);
  server.on("/", handleRoot);
  server.begin();
}

void loop() {
  if (settingUpWifi) {
    server.handleClient();    
  } else {
    socket.loop();
    programLoop();    
//    currentRedIntensity = 0xFF;
//    currentGreenIntensity = 0x00;
//    currentBlueIntensity = 0x00;
//    setPins();
//    delay(1000);
//    currentRedIntensity = 0x00;
//    currentGreenIntensity = 0xFF;
//    currentBlueIntensity = 0x00;
//    setPins();
//    delay(1000);
//    currentRedIntensity = 0x00;
//    currentGreenIntensity = 0x00;
//    currentBlueIntensity = 0xFF;
//    setPins();
//    delay(1000);
  }
}

void logIP(const char * payload, size_t length) {
  socket.emit("logIP", ("{\"value\":\""+WiFi.localIP().toString()+"\"}").c_str());
}

void setColor(const char * payload, size_t length) {
  DeserializationError error = deserializeJson(jsonBuffer, payload);
  if (error) {
    return;
  }
  String color = jsonBuffer["color"];
  if (color.length() <= 6) {
    color = color + "00";
  }
  colors[0] = strtoul(color.c_str(), NULL, 16);
  frequency = jsonBuffer["frequency"];
  if (jsonBuffer["pattern"] == "random") {
    colorPattern = "random";
    lightPattern = "solid";
  } else {
    String myLP = jsonBuffer["pattern"];
    lightPattern = myLP;
    colorPattern = "solid";
  }
  //String destination = jsonBuffer["destination"];
}

void setProgram(const char * payload, size_t length) {
  DeserializationError error = deserializeJson(jsonBuffer, payload);
  if (error) {
    return;
  }
  frequency = jsonBuffer["frequency"];
  String myLP = jsonBuffer["lightPattern"];
  lightPattern = myLP;
  String myCP = jsonBuffer["colorPattern"];
  colorPattern = myCP;
  
  JsonArray myColors = jsonBuffer["colors"].as<JsonArray>();
  for (int i = 0; i < myColors.size(); i++) {
    String color = jsonBuffer["colors"][i];
    if (color.length() <= 6) {
      color = color + "00";
    }
    colors[i] = strtoul(color.c_str(), NULL, 10);
//    Serial.println(color);
//    Serial.println(colors[i]);
    
  }
  numColors = myColors.size();
  rFader = 0;
  gFader = 0;
  bFader = 0;
  wFader = 0;
  fadingIn = true;
  currentColor = 0;
  currentRedIntensity = 0;
  currentGreenIntensity = 0;
  currentBlueIntensity = 0;
  currentWhiteIntensity = 0;
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

void setColorPattern() {
  boolean changingColor = false;
  if (lightPattern == "fade") {
    if (colorPattern == "range") {
      if (getIntensityAsNumber() == colors[currentColor]) {
        changingColor = true;
      }
    } else {
      if (allLightsOff()) {
        changingColor = true;
      }
    }
  } else if (lightPattern != "fade") {
    if (on) {
      changingColor = true;
    }
  }
  if (changingColor) {
    if (colorPattern == "list" && numColors > 1)  {
      if (currentColor < (numColors - 1))
        currentColor++;
      else
        currentColor = 0;
    } else if (colorPattern == "randomlist") {
      currentColor = random(numColors);
    } else if (colorPattern == "range" && numColors > 1) {
        if (currentColor < (numColors - 1))
          currentColor++;
        else
          currentColor = 0;
    } else if (colorPattern == "randomrange") {
      
    } else if (colorPattern == "random") {
      numColors = 1;
      currentColor = 0;
      colors[currentColor] = random(2147483647);
    }
  }
  if (lightPattern == "fade") {
    redRatio = ((double) getRed(colors[currentColor])) / maxIntensity;
    greenRatio = ((double) getGreen(colors[currentColor])) / maxIntensity;
    blueRatio = ((double) getBlue(colors[currentColor])) / maxIntensity;
    whiteRatio = ((double) getWhite(colors[currentColor])) / maxIntensity;
  }
}

boolean allLightsOff() {
  return currentRedIntensity <= 0 && currentGreenIntensity <= 0 && currentBlueIntensity <= 0 && currentWhiteIntensity <= 0;
}

unsigned long getIntensityAsNumber() {
  return (currentRedIntensity << 24) | (currentGreenIntensity << 16) | (currentBlueIntensity << 8) | (currentWhiteIntensity);
}

void setLightPattern() {
  if (lightPattern == "solid") {
    on = true;
    currentRedIntensity = getRed(colors[currentColor]);
    currentGreenIntensity = getGreen(colors[currentColor]);
    currentBlueIntensity = getBlue(colors[currentColor]);
    currentWhiteIntensity = getWhite(colors[currentColor]);
  } else if (lightPattern == "strobe") {
    if (on) {
      currentRedIntensity = 0;
      currentGreenIntensity = 0;
      currentBlueIntensity = 0;
      currentWhiteIntensity = 0;
      on = false;
    } else {
      currentRedIntensity = getRed(colors[currentColor]);
      currentGreenIntensity = getGreen(colors[currentColor]);
      currentBlueIntensity = getBlue(colors[currentColor]);
      currentWhiteIntensity = getWhite(colors[currentColor]);
      on = true;
    }
  } else if (lightPattern == "fade") {
    if (colorPattern == "range") {
      fade(colors[currentColor]);
    } else {
      if (currentRedIntensity <= 0 && currentGreenIntensity <= 0 && currentBlueIntensity <= 0 && currentWhiteIntensity <= 0) {
        fadingIn = true;
      } else if (
          currentRedIntensity >= getRed(colors[currentColor]) &&
          currentGreenIntensity >= getGreen(colors[currentColor]) &&
          currentBlueIntensity >= getBlue(colors[currentColor]) &&
          currentWhiteIntensity >= getWhite(colors[currentColor])
        ) {
        fadingIn = false;
      }
      if (fadingIn) {
        fade(colors[currentColor]);
      } else {
        fade(0);
      } 
    }
  }
//  Serial.println(currentGreenIntensity);
//  Serial.println(currentRedIntensity);
//  Serial.println(currentBlueIntensity);
}

void fade(unsigned long color) {
  if (currentRedIntensity > getRed(color))
    rFader = rFader - redRatio;
  else if (currentRedIntensity < getRed(color))
    rFader = rFader + redRatio;
  if (currentGreenIntensity > getGreen(color))
    gFader = gFader - greenRatio;
  else if (currentGreenIntensity < getGreen(color))
    gFader = gFader + greenRatio;
  if (currentBlueIntensity > getBlue(color))
    bFader = bFader - blueRatio;
  else if (currentBlueIntensity < getBlue(color))
    bFader = bFader + blueRatio;
  if (currentWhiteIntensity > getWhite(color))
    wFader = wFader - whiteRatio;
  else if (currentWhiteIntensity < getWhite(color))
    wFader = wFader + whiteRatio;
  if (rFader < 0) rFader = 0;
  if (rFader > 255) rFader = 255;
  if (gFader < 0) gFader = 0;
  if (gFader > 255) gFader = 255;
  if (bFader < 0) bFader = 0;
  if (bFader > 255) bFader = 255;
  if (wFader < 0) wFader = 0;    
  if (wFader > 255) wFader = 255;
  currentRedIntensity = rFader;
  currentGreenIntensity = gFader;
  currentBlueIntensity = bFader;
  currentWhiteIntensity = wFader;
}

void setPins() {
  analogWrite(redPin, currentRedIntensity);
  analogWrite(greenPin, currentGreenIntensity);
  analogWrite(bluePin, currentBlueIntensity);
  analogWrite(whitePin, currentWhiteIntensity); 
}

unsigned long getRed(unsigned long color) {
  return (color & 0xFF000000) >> 24;
}

unsigned long getGreen(unsigned long color) {
  return (color & 0x00FF0000) >> 16;
}

unsigned long getBlue(unsigned long color) {
  return (color & 0x0000FF00) >> 8;
}

unsigned long getWhite(unsigned long color) {
  return color & 0x000000FF;
}
