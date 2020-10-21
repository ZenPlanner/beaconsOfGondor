void initializeSocketIo() {
  MDNS.begin("esp8266");
  socket.on("connect", onConnect);
  socket.on("receivedProgram", setProgram);
  socket.on("setColor", setColor);
  WifiAuthPair wifiAuthPair;
  char url[256];
  EEPROM.get(sizeof(wifiAuthPair), url);
  socket.begin(url);
  analogWriteRange(256);
}

void onConnect(const char * payload, size_t length) {
  urlConnected = true;
  socket.emit("logIP", ("{\"value\":\""+WiFi.localIP().toString()+"\"}").c_str());
}

void setColor(const char * payload, size_t length) {
  DeserializationError error = deserializeJson(jsonBuffer, payload);
  if (error) {
    return;
  }
  int frequency = jsonBuffer["frequency"];
  String myLP = jsonBuffer["lightPattern"];
  String myCP = jsonBuffer["colorPattern"];
  String color = jsonBuffer["color"];
  LightPattern lightPattern = translateLightPattern(myLP);
  ColorPattern colorPattern = translateColorPattern(myCP);
  BeaconColor colors[64];
  if (color.length() <= 6) {
    color = color + "00";
  }
  unsigned long currentColor = strtoul(color.c_str(), NULL, 10);
  colors[0] = BeaconColor(
                (int) (currentColor & 0xFF000000) >> 24, //red
                (int) (currentColor & 0x00FF0000) >> 16, //green
                (int) (currentColor & 0x0000FF00) >> 8,  //blue
                (int) (currentColor & 0x000000FF)        //white
              );
  ledController.setProgram(frequency, 1, colors, lightPattern, colorPattern);
}

void setProgram(const char * payload, size_t length) {
  DeserializationError error = deserializeJson(jsonBuffer, payload);
  if (error) {
    return;
  }
  int frequency = jsonBuffer["frequency"];
  String myLP = jsonBuffer["lightPattern"];
  String myCP = jsonBuffer["colorPattern"];
  JsonArray myColors = jsonBuffer["colors"].as<JsonArray>();
  LightPattern lightPattern = translateLightPattern(myLP);
  ColorPattern colorPattern = translateColorPattern(myCP);
  int colorCount = myColors.size();
  BeaconColor colors[64];
  for (int i = 0; i < myColors.size(); i++) {
    String color = jsonBuffer["colors"][i];
    if (color.length() <= 6) {
      color = color + "00";
    }
    unsigned long currentColor = strtoul(color.c_str(), NULL, 10);
    colors[i] = BeaconColor(
                  (int) ((currentColor & 0xFF000000) >> 24), //red
                  (int) ((currentColor & 0x00FF0000) >> 16), //green
                  (int) ((currentColor & 0x0000FF00) >> 8),  //blue
                  (int) (currentColor & 0x000000FF)        //white
                );
  }
  ledController.setProgram(frequency, colorCount, colors, lightPattern, colorPattern);
}

LightPattern translateLightPattern(String lightPattern) {
  if (lightPattern == "fade") {
    return LightPattern::FADE;
  } else if (lightPattern == "strobe") {
    return LightPattern::STROBE;  
  }  
  return LightPattern::SOLID;
}

ColorPattern translateColorPattern(String colorPattern) {
  if (colorPattern == "random")
    return ColorPattern::RANDOM;
  else if (colorPattern == "range")
    return ColorPattern::RANGE;
  else if (colorPattern == "randomrange")
    return ColorPattern::RANDOMRANGE;
  else if (colorPattern == "randomlist")
    return ColorPattern::RANDOMLIST;
  else if (colorPattern == "randomfade")
    return ColorPattern::RANDOMFADE;
  else
    return ColorPattern::LIST;
}
