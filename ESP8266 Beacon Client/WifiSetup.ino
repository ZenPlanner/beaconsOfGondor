
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
    while (WiFi.status() != WL_CONNECTED) {
      if (connectionTimer < millis()) {
        networkFound = false;
        break;
      } else {
        delay(500);
      }
    }
    if (networkFound) {
      initializeSocketIo();
    } else {
      setupWifi();
    }
  } else {
    setupWifi();
  }
}

void setupWifi() {
  settingUpWifi = true;
  const char *ssid = "BeaconOfGondor";
  WiFi.softAP(ssid);
  server.on("/", handleRoot);
  server.on("/network", handleNewNetwork);
  server.begin();
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
