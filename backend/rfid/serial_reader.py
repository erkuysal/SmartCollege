import serial
import time
import json

class RFIDSerialReader:
    """
    Sends READ\n to the Arduino, waits for exactly one JSON reply:
      {"status":"ok","action":"read","uid":"AABBCCDD","data":"S20250001"}
    or
      {"status":"error","action":"read","reason":"Some reason"}
    """

    def __init__(self, port, baudrate=115200, timeout=20):
        """
        port: e.g. '/dev/ttyUSB0' or 'COM3'
        baudrate: must match Arduino's Serial.begin(115200)
        timeout: total seconds to wait for the JSON response after sending READ
        """
        self.port = port
        self.baudrate = baudrate
        self.timeout = timeout

    def read_user_number(self):
        """
        Returns (True, message_dict) if the Arduino responds with status:ok and action:read.
        Otherwise returns (False, error_message).
        """
        try:
            ser = serial.Serial(self.port, self.baudrate, timeout=1)
        except serial.SerialException as e:
            return False, f"Could not open serial port {self.port}: {e}"

        # Give Arduino time to reset and send any initial READY JSON
        time.sleep(2)
        ser.reset_input_buffer()

        # Send the READ command
        try:
            ser.write(b"READ_TAG\n")
        except serial.SerialException as e:
            ser.close()
            return False, f"Error writing to serial port: {e}"

        # Loop until timeout, looking for valid JSON
        deadline = time.time() + self.timeout
        while time.time() < deadline:
            try:
                raw = ser.readline()
            except serial.SerialException as e:
                ser.close()
                return False, f"Error reading from serial port: {e}"

            if not raw:
                # no line read, loop again
                continue

            line = raw.decode('utf-8', errors='ignore').strip()
            if not line:
                continue

            # Try to parse JSON
            try:
                resp = json.loads(line)
            except json.JSONDecodeError:
                # ignore stray lines
                continue

            status = resp.get("status")
            action = resp.get("action")
            if status == "ok" and action == "read":
                ser.close()
                return True, resp
            else:
                reason = resp.get("reason", "Unknown error")
                ser.close()
                return False, f"Arduino returned error: {reason}"

        # If we exit the loop, no valid JSON arrived
        ser.close()
        return False, "Timeout waiting for JSON response from Arduino" 