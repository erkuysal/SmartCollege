#include <SPI.h>
#include <MFRC522.h>

#define RST_PIN 9    // Configurable pin for Reset
#define SS_PIN 10    // Configurable pin for SPI Slave Select

MFRC522 mfrc522(SS_PIN, RST_PIN); // Create MFRC522 instance
MFRC522::MIFARE_Key key;

// Function prototypes
void setupReader();
bool writeStudentNumber(const String &studentNumber);
bool readStudentNumber();
bool authenticate(byte blockAddr);
void listenForCommands();

void setup() {
  Serial.begin(9600);         // Initialize serial communication
  SPI.begin();                // Initialize SPI bus
  mfrc522.PCD_Init();         // Initialize RFID reader
  setupReader();              // Prepare default keys and system messages
}

void loop() {
  listenForCommands();
}

// Setup default reader key
void setupReader() {
  for (byte i = 0; i < 6; i++) {
    key.keyByte[i] = 0xFF; // Default key for MIFARE Classic
  }
  Serial.println("[INFO] RFID reader initialized. Listening for commands...");
}

// Listen for backend commands
void listenForCommands() {
  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    command.trim();

    if (command.startsWith("WRITE:")) {
      String studentNumber = command.substring(6); // Extract the student number
      Serial.println("[INFO] WRITE command received.");
      
      if (writeStudentNumber(studentNumber)) {
        Serial.println("WRITE_OK"); // Inform backend of success
      } else {
        Serial.println("WRITE_FAIL"); // Inform backend of failure
      }
    } 
    else if (command.startsWith("READ")) {
      Serial.println("[INFO] READ command received.");
      
      if (readStudentNumber()) {
        Serial.println("READ_OK"); // Inform backend of success
      } else {
        Serial.println("READ_FAIL"); // Inform backend of failure
      }
    } 
    else {
      Serial.println("[ERROR] Unknown command received.");
    }
  }
}

// Write student number to RFID block
bool writeStudentNumber(const String &studentNumber) {
  byte blockAddr = 4; // Block to write the student number
  byte buffer[16];
  memset(buffer, 0, sizeof(buffer)); // Clear buffer

  // Copy the student number to the buffer (max 16 bytes)
  for (int i = 0; i < 16 && i < studentNumber.length(); i++) {
    buffer[i] = studentNumber.charAt(i);
  }

  // Wait for card
  if (!mfrc522.PICC_IsNewCardPresent() || !mfrc522.PICC_ReadCardSerial()) {
    Serial.println("[ERROR] No card detected!");
    return false;
  }

  if (!authenticate(blockAddr)) {
    Serial.println("[ERROR] Authentication failed!");
    return false;
  }

  // Write the student number to the block
  MFRC522::StatusCode status = mfrc522.MIFARE_Write(blockAddr, buffer, 16);
  if (status != MFRC522::STATUS_OK) {
    Serial.print("[ERROR] Write failed: ");
    Serial.println(mfrc522.GetStatusCodeName(status));
    return false;
  }

  Serial.println("[INFO] Write successful!");
  return true;
}

// Read student number from RFID block
bool readStudentNumber() {
  byte blockAddr = 4; // Block to read the student number
  byte buffer[18];    // Buffer for data (16 bytes + 2 CRC)
  byte bufferSize = sizeof(buffer);

  // Wait for card
  if (!mfrc522.PICC_IsNewCardPresent() || !mfrc522.PICC_ReadCardSerial()) {
    Serial.println("[ERROR] No card detected!");
    return false;
  }

  if (!authenticate(blockAddr)) {
    Serial.println("[ERROR] Authentication failed!");
    return false;
  }

  // Read the block
  MFRC522::StatusCode status = mfrc522.MIFARE_Read(blockAddr, buffer, &bufferSize);
  if (status != MFRC522::STATUS_OK) {
    Serial.print("[ERROR] Read failed: ");
    Serial.println(mfrc522.GetStatusCodeName(status));
    return false;
  }

  // Print the data as ASCII
  Serial.print("[INFO] Data in block ");
  Serial.print(blockAddr);
  Serial.print(": ");
  for (byte i = 0; i < 16; i++) {
    if (buffer[i] != 0) { // Ignore empty bytes
      Serial.write(buffer[i]);
    }
  }
  Serial.println();
  return true;
}

// Authenticate the card for a specific block
bool authenticate(byte blockAddr) {
  MFRC522::StatusCode status = mfrc522.PCD_Authenticate(
    MFRC522::PICC_CMD_MF_AUTH_KEY_A,
    blockAddr,
    &key,
    &(mfrc522.uid)
  );

  if (status != MFRC522::STATUS_OK) {
    Serial.print("[ERROR] Authentication failed: ");
    Serial.println(mfrc522.GetStatusCodeName(status));
    return false;
  }

  return true;
}
