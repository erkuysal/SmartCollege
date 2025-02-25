import serial
import time
import logging

logger = logging.getLogger(__name__)

SERIAL_PORT = "/dev/cu.usbserial-1140"  # Adjust for your environment
BAUD_RATE = 9600

try:
    arduino = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
    time.sleep(2)
    logger.info(f"✅ Connected to Arduino on {SERIAL_PORT}")
except serial.SerialException as e:
    logger.error(f"❌ Could not connect to Arduino: {e}")
    arduino = None


def send_to_arduino_write(data):
    """Sends a write command to Arduino"""
    if arduino:
        command = f"WRITE:{data}\n"
        arduino.write(command.encode())
        logger.info(f"📤 Sent: {command}")
        return {"message": f"📤 Sent: {command}"}
    return {"error": "Arduino connection unavailable."}


def read_from_arduino():
    """Reads student number from RFID card via Arduino"""
    if arduino and arduino.in_waiting > 0:
        data = arduino.readline().decode().strip()
        logger.info(f"📥 Read: {data}")
        return {"data": data}
    return {"error": "No data received from Arduino."}