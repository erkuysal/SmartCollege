#include <SPI.h>
#include <MFRC522.h>

#define RST_PIN       9    // MFRC522 reset
#define SS_PIN       10    // MFRC522 SPI SS

MFRC522 mfrc522(SS_PIN, RST_PIN);

// MIFARE Classic default Key A
MFRC522::MIFARE_Key keyA;

// Sector/block constants
static const byte TARGET_SECTOR = 1;  
static const byte TARGET_BLOCK  = 4;  
static const byte DATA_SIZE     = 16; 
static const byte READ_BUF_SIZE = DATA_SIZE + 2; 

// Continuous scanning
bool continuousScanMode = false;

// Command keywords
const char* CMD_TEST         = "TEST";
const char* CMD_WRITE_TAG    = "WRITE_TAG";
const char* CMD_READ_TAG     = "READ_TAG";
const char* CMD_CONTINUOUS   = "CONTINUOUS_SCAN";
const char* CMD_STOP         = "STOP_SCAN";

// Max tag‐ID length we'll accept (prefix+year+4 digits = 9, 
// but allow up to 16 in case you ever change format)
static const byte MAX_TAG_ID_LEN = 16;

// ——— Prototypes ———
bool  handleSerialCommand(String cmd);
bool  waitForCard(uint32_t timeoutMs = 30000);
String buildUidString();
bool  authenticateBlock(byte blockAddr);
void  handleWriteTag(const String& tagId);
void  handleReadTagOnce();
void  readOnceAndPrintJSON();

void setup() {
  Serial.begin(115200);
  while (!Serial);

  SPI.begin();
  mfrc522.PCD_Init();

  // Load default key A = 0xFF…FF
  for (byte i = 0; i < 6; i++) 
    keyA.keyByte[i] = 0xFF;

  // Let backend know we're alive
  Serial.println(F("{\"status\":\"ready\"}"));
}

void loop() {
  // 1) Service any incoming serial command
  if (Serial.available()) {
    String line = Serial.readStringUntil('\n');
    line.trim();
    if (handleSerialCommand(line)) {
      // handled → skip to next loop
      return;
    }
  }

  // 2) If in continuous mode, keep polling
  if (continuousScanMode) {
    // allow STOP_SCAN mid‐loop
    if (Serial.available()) {
      String cmd2 = Serial.readStringUntil('\n');
      cmd2.trim();
      if (cmd2.equalsIgnoreCase(CMD_STOP)) {
        continuousScanMode = false;
        Serial.println(F("{\"status\":\"ok\",\"action\":\"stop_scan\",\"message\":\"Stopping continuous scan mode\"}"));
        return;
      }
    }
    
    // poll for a card
    if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()) {
      readOnceAndPrintJSON();
      mfrc522.PICC_HaltA();
      mfrc522.PCD_StopCrypto1();
      delay(500);
    }
    delay(50);
  }
}

// Parse "ACTION:payload"
// Returns true if ACTION was recognized
bool handleSerialCommand(String cmd) {
  int sep = cmd.indexOf(':');
  String action  = (sep >= 0 ? cmd.substring(0, sep) : cmd);
  String payload = (sep >= 0 ? cmd.substring(sep + 1) : "");
  action.trim(); payload.trim();

  if (action.equalsIgnoreCase(CMD_TEST)) {
    Serial.println(F("{\"status\":\"ok\",\"action\":\"test\"}"));
    return true;
  }
  if (action.equalsIgnoreCase(CMD_WRITE_TAG)) {
    handleWriteTag(payload);
    return true;
  }
  if (action.equalsIgnoreCase(CMD_READ_TAG)) {
    handleReadTagOnce();
    return true;
  }
  if (action.equalsIgnoreCase(CMD_CONTINUOUS)) {
    continuousScanMode = true;
    Serial.println(F("{\"status\":\"ok\",\"action\":\"continuous_scan\",\"message\":\"Entering continuous scan mode\"}"));
    return true;
  }
  if (action.equalsIgnoreCase(CMD_STOP)) {
    continuousScanMode = false;
    Serial.println(F("{\"status\":\"ok\",\"action\":\"stop_scan\",\"message\":\"Stopping continuous scan mode\"}"));
    return true;
  }

  // Unknown command
  Serial.print(F("{\"status\":\"error\",\"reason\":\"Unknown command: "));
  Serial.print(action);
  Serial.println(F("\"}"));
  return true;
}

// Wait up to timeoutMs for a card to appear/read
bool waitForCard(uint32_t timeoutMs) {
  uint32_t start = millis();
  while (millis() - start < timeoutMs) {
    if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()) {
      return true;
    }
  }
  return false;
}

// Build a hex UID string
String buildUidString() {
  char buf[21] = {0};
  for (byte i = 0; i < mfrc522.uid.size && i < 10; i++) {
    sprintf(buf + 2*i, "%02X", mfrc522.uid.uidByte[i]);
  }
  return String(buf);
}

// Try to auth the target block with Key A
bool authenticateBlock(byte blockAddr) {
  return mfrc522.PCD_Authenticate(
    MFRC522::PICC_CMD_MF_AUTH_KEY_A,
    blockAddr, &keyA, &mfrc522.uid
  ) == MFRC522::STATUS_OK;
}

// Handle WRITE_TAG:<tagId>
void handleWriteTag(const String& tagId) {
  // basic validation
  if (tagId.length() < 1 || tagId.length() > MAX_TAG_ID_LEN) {
    Serial.println(F("{\"status\":\"error\",\"action\":\"write\",\"reason\":\"Invalid tagId length\"}"));
    return;
  }

  if (!waitForCard()) {
    Serial.println(F("{\"status\":\"error\",\"action\":\"write\",\"reason\":\"No card detected within timeout\"}"));
    return;
  }

  String uid = buildUidString();
  byte blockAddr = TARGET_SECTOR * 4 + (TARGET_BLOCK % 4);

  if (!authenticateBlock(blockAddr)) {
    Serial.print(F("{\"status\":\"error\",\"action\":\"write\",\"uid\":\""));
    Serial.print(uid);
    Serial.println(F("\",\"reason\":\"Auth failed\"}"));
    mfrc522.PICC_HaltA(); mfrc522.PCD_StopCrypto1();
    return;
  }

  // prepare buffer
  byte buf[DATA_SIZE];
  memset(buf, 0, DATA_SIZE);
  for (byte i = 0; i < tagId.length() && i < DATA_SIZE; i++) {
    buf[i] = (byte)tagId.charAt(i);
  }

  auto status = mfrc522.MIFARE_Write(blockAddr, buf, DATA_SIZE);
  mfrc522.PICC_HaltA(); mfrc522.PCD_StopCrypto1();

  if (status != MFRC522::STATUS_OK) {
    Serial.print(F("{\"status\":\"error\",\"action\":\"write\",\"uid\":\""));
    Serial.print(uid);
    Serial.print(F("\",\"reason\":\"Write failed: "));
    Serial.print(mfrc522.GetStatusCodeName(status));
    Serial.println(F("\"}"));
    return;
  }

  Serial.print(F("{\"status\":\"ok\",\"action\":\"write\",\"uid\":\""));
  Serial.print(uid);
  Serial.print(F("\",\"data\":\""));
  Serial.print(tagId);
  Serial.println(F("\"}"));
}

// Handle one-off READ_TAG
void handleReadTagOnce() {
  if (!waitForCard()) {
    Serial.println(F("{\"status\":\"error\",\"action\":\"read\",\"reason\":\"No card detected within timeout\"}"));
    return;
  }
  readOnceAndPrintJSON();
}

// Read, auth & print JSON
void readOnceAndPrintJSON() {
  String uid = buildUidString();
  byte blockAddr = TARGET_SECTOR * 4 + (TARGET_BLOCK % 4);

  if (!authenticateBlock(blockAddr)) {
    Serial.print(F("{\"status\":\"error\",\"action\":\"read\",\"uid\":\""));
    Serial.print(uid);
    Serial.println(F("\",\"reason\":\"Auth failed\"}"));
    mfrc522.PICC_HaltA(); mfrc522.PCD_StopCrypto1();
    return;
  }

  byte readBuf[READ_BUF_SIZE];
  byte count = sizeof(readBuf);
  auto status = mfrc522.MIFARE_Read(blockAddr, readBuf, &count);
  mfrc522.PICC_HaltA(); mfrc522.PCD_StopCrypto1();

  if (status != MFRC522::STATUS_OK) {
    Serial.print(F("{\"status\":\"error\",\"action\":\"read\",\"uid\":\""));
    Serial.print(uid);
    Serial.print(F("\",\"reason\":\"Read failed: "));
    Serial.print(mfrc522.GetStatusCodeName(status));
    Serial.println(F("\"}"));
    return;
  }

  // extract ASCII text
  char text[DATA_SIZE+1] = {0};
  for (byte i = 0; i < DATA_SIZE; i++) {
    if (readBuf[i] == 0) break;
    text[i] = (char)readBuf[i];
  }

  Serial.print(F("{\"status\":\"ok\",\"action\":\"read\",\"uid\":\""));
  Serial.print(uid);
  Serial.print(F("\",\"data\":\""));
  Serial.print(text);
  Serial.println(F("\"}"));
}