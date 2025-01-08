#include "BackendHandler.h"

SoftwareSerial BackendHandler::esp8266(RX_PIN, TX_PIN);

bool BackendHandler::sendATCommand(const String& command, const String& expectedResponse, unsigned long timeout) {
    esp8266.println(command);
    unsigned long start = millis();
    String response = "";

    while (millis() - start < timeout) {
        if (esp8266.available()) {
            response += (char)esp8266.read();
            if (response.indexOf(expectedResponse) != -1) {
                return true;
            }
        }
    }
    Serial.println("AT Command Response: " + response);
    return false;
}

bool BackendHandler::connectToWiFi(const char* ssid, const char* password) {
    esp8266.begin(9600); // Start communication with ESP8266

    if (!sendATCommand("AT", "OK", 2000)) {
        Serial.println("ESP8266 not responding.");
        return false;
    }

    if (!sendATCommand("AT+RST", "OK", 5000)) {
        Serial.println("ESP8266 reset failed.");
        return false;
    }

    if (!sendATCommand("AT+CWMODE=1", "OK", 2000)) {
        Serial.println("Failed to set Wi-Fi mode.");
        return false;
    }

    String connectCommand = "AT+CWJAP=\"" + String(ssid) + "\",\"" + String(password) + "\"";
    if (!sendATCommand(connectCommand, "WIFI GOT IP", 15000)) {
        Serial.println("Failed to connect to Wi-Fi.");
        return false;
    }

    Serial.println("Connected to Wi-Fi!");
    return true;
}

String BackendHandler::sendToBackend(const String& endpoint, const String& payload) {
    String request = "POST " + endpoint + " HTTP/1.1\r\n";
    request += "Host: <backend-ip>\r\n";
    request += "Content-Type: application/json\r\n";
    request += "Content-Length: " + String(payload.length()) + "\r\n\r\n";
    request += payload;

    if (!sendATCommand("AT+CIPSTART=\"TCP\",\"<backend-ip>\",80", "OK", 5000)) {
        return "Failed to start TCP connection.";
    }

    String lengthCommand = "AT+CIPSEND=" + String(request.length());
    if (!sendATCommand(lengthCommand, ">", 2000)) {
        return "Failed to initiate data send.";
    }

    esp8266.println(request);

    unsigned long start = millis();
    String response = "";

    while (millis() - start < 5000) {
        if (esp8266.available()) {
            response += (char)esp8266.read();
        }
    }

    sendATCommand("AT+CIPCLOSE", "OK", 2000);
    return response;
}