#ifndef RFIDHANDLER_H
#define RFIDHANDLER_H

#include <SPI.h>
#include <MFRC522.h>

#define DEFAULT_BLOCK 1 // Default block for RFID operations

class RFIDHandler {
public:
    static void initRFID();
    static bool writeToRFID(String data, byte block = DEFAULT_BLOCK); // Dynamic block writing
    static String readFromRFID(byte block = DEFAULT_BLOCK);           // Dynamic block reading
private:
    static MFRC522 rfid;
    static MFRC522::MIFARE_Key key;
};

#endif