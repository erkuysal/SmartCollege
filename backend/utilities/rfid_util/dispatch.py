import serial
import requests
import time
import logging

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Arduino serial port configuration
SERIAL_PORT = "/dev/cu.usbserial-1140"   # Arduino port
BAUD_RATE = 9600

# Backend API configuration
API_READ_URL = "http://127.0.0.1:8000/api/rfid/read/"
API_WRITE_URL = "http://127.0.0.1:8000/api/rfid/write/"

# Initialize serial connection
try:
    arduino = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
    time.sleep(2)  # Wait for Arduino to initialize
    logger.info(f"✅ Connected to Arduino on {SERIAL_PORT}")
except serial.SerialException as e:
    logger.error(f"❌ Could not connect to Arduino: {e}")
    exit()


def send_to_arduino(data):
    """Send data to Arduino over serial."""
    arduino.write(data.encode())
    logger.info(f"📤 Sent to Arduino: {data}")


def read_from_arduino():
    """Read RFID tag from Arduino."""
    if arduino.in_waiting > 0:
        tag_data = arduino.readline().decode().strip()
        logger.info(f"📥 Read from Arduino: {tag_data}")
        return tag_data
    return None


def validate_rfid(tag_data):
    """Send tag data to backend for validation."""
    response = requests.post(API_READ_URL, json={"rfid_tag": tag_data})
    return response.json()


def write_rfid(tag_data, user_id):
    """Send write request to backend."""
    response = requests.post(API_WRITE_URL, json={"rfid_tag": tag_data, "user_id": user_id})
    return response.json()


def main():
    while True:
        print("\n🔹 Waiting for RFID scan...")
        tag_data = read_from_arduino()

        if tag_data:
            print("🔍 Checking tag...")
            validation_result = validate_rfid(tag_data)

            if "error" not in validation_result:
                print(f"✅ User Found: {validation_result['user']}")
            else:
                print("❌ Tag not found. Do you want to register it?")
                choice = input("Register this tag? (yes/no): ").strip().lower()
                if choice == "yes":
                    user_id = input("Enter user ID to assign this RFID: ")
                    write_result = write_rfid(tag_data, user_id)
                    print(write_result["message"])
        time.sleep(1)  # Prevent CPU overuse


if __name__ == "__main__":
    main()