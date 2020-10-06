
void handleRoot() {
  server.send(200, "text/html", "<h1>You are connected</h1>");
}
