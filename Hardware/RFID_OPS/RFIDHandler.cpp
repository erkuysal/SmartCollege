#include "RFIDHandler.h"

#define RST_PIN 5
#define SS_PIN 10

MFRC522 RFIDHandler::rfid(SS_PIN, RST_PIN);
MFRC522::MIFARE_Key RFIDHandler::key;

void RFIDHandler::initRFID() {
    SPI.begin();
    rfid.PCD_Init();

    for (byte i = 0; i < 6; i++) {
        key.keyByte[i] = 0xFF;
    }
}

bool RFIDHandler::writeToRFID(String data, byte block) {
    byte buffer[16];
    data.toCharArray((char*)buffer, 16);

    if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) {
        return false; // No card present
    }

    MFRC522::StatusCode status = rfid.PCD_Authenticate(MFRC522::PICC_CMD_MF_AUTH_KEY_A, block, &key, &(rfid.uid));
    if (status != MFRC522::STATUS_OK) {
        return false; // Authentication failed
    }

    status = rfid.MIFARE_Write(block, buffer, 16);
    return (status == MFRC522::STATUS_OK); // Return true if write successful
}

String RFIDHandler::readFromRFID(byte block) {
    byte buffer[18];
    byte size = sizeof(buffer);

    if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) {
        return ""; // No card present
    }

    MFRC522::StatusCode status = rfid.PCD_Authenticate(MFRC522::PICC_CMD_MF_AUTH_KEY_A, block, &key, &(rfid.uid));
    if (status != MFRC522::STATUS_OK) {
        return ""; // Authentication failed
    }

    status = rfid.MIFARE_Read(block, buffer, &size);
    if (status != MFRC522::STATUS_OK) {
        return ""; // Read failed
    }

    String data = "";
    for (byte i = 0; i < 16; i++) {
        data += (char)buffer[i];
    }
    return data; // Return the read data
}