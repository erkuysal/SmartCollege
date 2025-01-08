#ifndef BACKENDHANDLER_H
#define BACKENDHANDLER_H

#include <SoftwareSerial.h>

// Default backend and Wi-Fi configurations
#define DEFAULT_BACKEND_BASE_URL "http://127.0.0.1:8000/"
#define DEFAULT_SSID "UNIVERSITY EDUCATION"
#define DEFAULT_PASSWORD "15112016edu"

// Define ESP8266 communication pins
#define RX_PIN 0 // Arduino pin connected to ESP8266 TX
#define TX_PIN 1 // Arduino pin connected to ESP8266 RX

class BackendHandler {
public:
    static bool connectToWiFi(const char* ssid = DEFAULT_SSID, const char* password = DEFAULT_PASSWORD);
    static String sendToBackend(const String& endpoint, const String& payload);
private:
    static SoftwareSerial esp8266; // SoftwareSerial for ESP8266 communication
    static bool sendATCommand(const String& command, const String& expectedResponse, unsigned long timeout);
};

#endif