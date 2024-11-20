#include "RFIDHandler.h"

#define RST_PIN 9
#define SS_PIN 10

MFRC522 RFIDHandler::rfid(SS_PIN, RST_PIN);
MFRC522::MIFARE_Key RFIDHandler::key;

void RFIDHandler::initRFID() {
    SPI.begin();
    rfid.PCD_Init();

    // Set default key (factory default for MIFARE cards)
    for (byte i = 0; i < 6; i++) {
        key.keyByte[i] = 0xFF;
    }
}

void RFIDHandler::writeToRFID() {
    Serial.println("Place the card near the reader to write...");
    while (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) {
        delay(500);
    }

    byte block = 1; // Memory block to write
    byte buffer[16] = "123456"; // Student number
    byte bufferSize = sizeof(buffer);

    MFRC522::StatusCode status = rfid.PCD_Authenticate(MFRC522::PICC_CMD_MF_AUTH_KEY_A, block, &key, &(rfid.uid));
    if (status != MFRC522::STATUS_OK) {
        Serial.print("Authentication failed: ");
        Serial.println(rfid.GetStatusCodeName(status));
        return;
    }

    status = rfid.MIFARE_Write(block, buffer, bufferSize);
    if (status == MFRC522::STATUS_OK) {
        Serial.println("Data written successfully!");
    } else {
        Serial.print("Write failed: ");
        Serial.println(rfid.GetStatusCodeName(status));
    }

    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();
}

void RFIDHandler::readFromRFID() {
    Serial.println("Place the card near the reader to read...");
    while (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) {
        delay(500);
    }

    byte block = 1;
    byte buffer[18];
    byte bufferSize = sizeof(buffer);

    MFRC522::StatusCode status = rfid.PCD_Authenticate(MFRC522::PICC_CMD_MF_AUTH_KEY_A, block, &key, &(rfid.uid));
    if (status != MFRC522::STATUS_OK) {
        Serial.print("Authentication failed: ");
        Serial.println(rfid.GetStatusCodeName(status));
        return;
    }

    status = rfid.MIFARE_Read(block, buffer, &bufferSize);
    if (status == MFRC522::STATUS_OK) {
        Serial.print("Data read: ");
        for (byte i = 0; i < 16; i++) {
            Serial.write(buffer[i]);
        }
        Serial.println();
    } else {
        Serial.print("Read failed: ");
        Serial.println(rfid.GetStatusCodeName(status));
    }

    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();
}

void RFIDHandler::readArbitraryBlock() {
    Serial.println("Enter the block number (0-63): ");
    while (!Serial.available()) {
        delay(10);
    }

    int block = Serial.parseInt();
    if (block < 0 || block > 63) {
        Serial.println("Invalid block number. Please enter a number between 0 and 63.");
        return;
    }

    Serial.println("Place the card near the reader to read...");
    while (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) {
        delay(500);
    }

    byte buffer[18];
    byte bufferSize = sizeof(buffer);

    MFRC522::StatusCode status = rfid.PCD_Authenticate(MFRC522::PICC_CMD_MF_AUTH_KEY_A, block, &key, &(rfid.uid));
    if (status != MFRC522::STATUS_OK) {
        Serial.print("Authentication failed: ");
        Serial.println(rfid.GetStatusCodeName(status));
        return;
    }

    status = rfid.MIFARE_Read(block, buffer, &bufferSize);
    if (status == MFRC522::STATUS_OK) {
        Serial.print("Data read from block ");
        Serial.print(block);
        Serial.print(": ");
        for (byte i = 0; i < 16; i++) {
            Serial.write(buffer[i]);
        }
        Serial.println();
    } else {
        Serial.print("Read failed: ");
        Serial.println(rfid.GetStatusCodeName(status));
    }

    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();
}