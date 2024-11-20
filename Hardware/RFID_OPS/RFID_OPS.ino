#include "RFIDHandler.h"
#include "BackendHandler.h"

// Menu States
enum MenuOption { MENU_IDLE, MENU_WRITE, MENU_READ, MENU_SEND, MENU_READ_BLOCK, MENU_DUMP_CARD };
MenuOption currentOption = MENU_IDLE;

void setup() {
  Serial.begin(9600);
  RFIDHandler::initRFID();

  Serial.println("Welcome to RFID Menu System!");
  Serial.println("Type the option number and press Enter:");
  Serial.println("1: Write Student Number to RFID");
  Serial.println("2: Read Student Number from RFID");
  Serial.println("3: Send Student Number to Backend");
  Serial.println("4: Read Arbitrary Data Block");
  Serial.println("5: Dump Card Details");
}

void loop() {
  if (Serial.available()) {
    char option = Serial.read();
    switch (option) {
      case '1':
        currentOption = MENU_WRITE;
        Serial.println("Selected: Write to RFID");
        RFIDHandler::writeToRFID();
        break;
      case '2':
        currentOption = MENU_READ;
        Serial.println("Selected: Read from RFID");
        RFIDHandler::readFromRFID();
        break;
      case '3':
        currentOption = MENU_SEND;
        Serial.println("Selected: Send to Backend");
        BackendHandler::sendToBackend();
        break;
      case '4':
        currentOption = MENU_READ_BLOCK;
        Serial.println("Selected: Read Arbitrary Data Block");
        RFIDHandler::readArbitraryBlock();
        break;
      case '5':
        currentOption = MENU_DUMP_CARD;
        Serial.println("Selected: Dump Card Details");
        RFIDHandler::dumpCardDetails();
        break;
      default:
        Serial.println("Invalid option. Try again.");
        break;
    }
    currentOption = MENU_IDLE;
    Serial.println("\nType the option number and press Enter:");
    Serial.println("1: Write Student Number to RFID");
    Serial.println("2: Read Student Number from RFID");
    Serial.println("3: Send Student Number to Backend");
    Serial.println("4: Read Arbitrary Data Block");
    Serial.println("5: Dump Card Details");
  }
}