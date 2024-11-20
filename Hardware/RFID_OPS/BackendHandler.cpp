#include "BackendHandler.h"
#include <SPI.h>
#include <MFRC522.h>

void BackendHandler::sendToBackend() {
    Serial.println("Place the card near the reader to send data...");
    while (!Serial.available()) {
        delay(10);
    }

    Serial.println("Simulated: Sending UID to backend...");
    // Add HTTP code here for real implementation
}