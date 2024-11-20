#ifndef RFIDHANDLER_H
#define RFIDHANDLER_H

#include <SPI.h>
#include <MFRC522.h>

class RFIDHandler {
public:
    static void initRFID();
    static void writeToRFID();
    static void readFromRFID();
    static void readArbitraryBlock();
    static void dumpCardDetails();
private:
    static MFRC522 rfid;
    static MFRC522::MIFARE_Key key;
};

#endif