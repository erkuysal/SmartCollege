#include "RFIDHandler.h"
#include "BackendHandler.h"

// Default Configurations
const char* backendBaseURL = DEFAULT_BACKEND_BASE_URL;

String getWriteEndpoint(String studentNumber) {
    return String(backendBaseURL) + "api/students/" + studentNumber + "/card/write/";
}

String getReadEndpoint() {
    return String(backendBaseURL) + "api/students/card/read/";
}

void setup() {
    Serial.begin(115200);
    RFIDHandler::initRFID();

    if (BackendHandler::connectToWiFi()) {
        Serial.println("Connected to Wi-Fi.");
    } else {
        Serial.println("Failed to connect to Wi-Fi.");
    }
}

void loop() {
    // Example: Reading RFID card
    String cardData = RFIDHandler::readFromRFID();
    if (cardData != "") {
        Serial.println("Read from RFID: " + cardData);

        String readEndpoint = getReadEndpoint();
        String payload = "{\"card_data\":\"" + cardData + "\"}";
        String response = BackendHandler::sendToBackend(readEndpoint, payload);

        Serial.println("Backend Response (Validation): " + response);
    }

    delay(5000);
}