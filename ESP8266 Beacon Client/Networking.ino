
void connectToNetwork() {
  boolean networkFound = false;
  int i, n;
  WiFi.mode(WIFI_STA);
  WiFi.disconnect();
  delay(100);

  int numVisibleNetworks = WiFi.scanNetworks();
  WifiAuthPair wifiAuthPair;
  EEPROM.get(0, wifiAuthPair);
  for (i = 0; i < numVisibleNetworks; i++) {
      if (!strcmp(wifiAuthPair.ssid, WiFi.SSID(i).c_str())) {
        networkFound = true;
        break; 
      }
  }

  if (networkFound) {
    WiFi.begin(wifiAuthPair.ssid, wifiAuthPair.password);
	boolean enterWifiSetup = false;
    while (WiFi.status() != WL_CONNECTED) {
      if (connectionTimer < millis()) {
		enterWifiSetup = true;
        break;
	  } else {
		delay(500);
	  }
    }
	if (enterWifiSetup) {
		setupWifi();
	} else {
		initializeSocketIo();
	}
  } else {
    setupWifi();
  }
}

void initializeSocketIo() {
  MDNS.begin("esp8266");
  socket.on("connect", onConnect);
  socket.on("receivedProgram", setProgram);
  WifiAuthPair wifiAuthPair;
  char url[256];
  EEPROM.get(sizeof(wifiAuthPair), url);
  socket.begin(url);
  analogWriteRange(256);
}

void setupWifi() {
  settingUpWifi = true;
  const char *ssid = "BeaconOfGondor";
  WiFi.softAP(ssid);
  server.on("/", handleRoot);
  server.on("/network", handleNewNetwork);
  server.begin();
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
  String color = jsonBuffer["color"];
  if (color.length() <= 6) {
    color = color + "00";
  }
  colors[0] = strtoul(color.c_str(), NULL, 10);
  frequency = jsonBuffer["frequency"];
  if (jsonBuffer["pattern"] == "random") {
    colorPattern = "random";
    lightPattern = "solid";
  } else {
    String myLP = jsonBuffer["pattern"];
    lightPattern = myLP;
    colorPattern = "solid";
  }
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

void handleRoot() {
  WifiAuthPair wifiAuthPair;
  EEPROM.get(0, wifiAuthPair); 
  char html[512];
  char url[256];
  EEPROM.get(sizeof(wifiAuthPair), url);
  sprintf(html,"<h1>Current SSID: %s</h1><br /><h1>Current URL: %s</h1><br /><form action=\"/network\" method=\"POST\">SSID: <input type=\"text\" name=\"ssid\" value=\"\"></br>Password: <input type=\"text\" name=\"password\" value=\"\"></br>URL: <input type=\"text\" name=\"url\" value=\"\"></br><input type=\"submit\" value=\"Submit\"></form>",wifiAuthPair.ssid, url);
  server.send(200, "text/html", html);
}

void handleNewNetwork() {
  if (server.hasArg("ssid")== false){
    server.send(200, "text/html", "Body not received");
    return;
  }

  WifiAuthPair wifiAuthPair;
  strcpy(wifiAuthPair.ssid, server.arg("ssid").c_str());
  strcpy(wifiAuthPair.password, server.arg("password").c_str());
  char url[256];
  strcpy(url, server.arg("url").c_str());
  Serial.println(wifiAuthPair.ssid);
  Serial.println(wifiAuthPair.password);
  Serial.println(url);
  EEPROM.put(0, wifiAuthPair);
  EEPROM.put(sizeof(wifiAuthPair), url);
  EEPROM.commit();
  server.send(200, "text/html", "<h1>Wifi Network Saved</h1>");
  softReset();
}
