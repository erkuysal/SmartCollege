import serial
import time
import json

class RFIDSerialWriter:
    """
    Sends WRITE_TAG:<user_number> to Arduino and waits for a single JSON reply.
    Expects the Arduino to respond with something like
      {"status":"ok","action":"write","uid":"AABBCCDD","data":"S20250001"}
    or
      {"status":"error","action":"write","reason":"Some reason"}
    """

    def __init__(self, port, baudrate=115200, timeout=20):
        """
        port: e.g. '/dev/ttyUSB0' or 'COM3'
        baudrate: must match Serial.begin(...) in your Arduino sketch
        timeout: total seconds to wait for the JSON response after sending WRITE_TAG.
        """
        self.port = port
        self.baudrate = baudrate
        self.timeout = timeout

    def write_user_number(self, user_number):
        """
        Returns (True, message_dict) on success, or (False, error_message) on failure/timeout.
        - On success, message_dict will be the parsed JSON (with keys "uid" and "data").
        - On failure, error_message is a string describing what went wrong.
        """
        try:
            ser = serial.Serial(self.port, self.baudrate, timeout=1)
        except serial.SerialException as e:
            return False, f"Could not open serial port {self.port}: {e}"

        # Give Arduino time to reset and send its initial READY JSON.
        time.sleep(2)
        ser.reset_input_buffer()

        # Send the WRITE_TAG command
        cmd_str = f"WRITE_TAG:{user_number}\n"
        try:
            ser.write(cmd_str.encode('utf-8'))
        except serial.SerialException as e:
            ser.close()
            return False, f"Error writing to serial port: {e}"

        # Now wait up to self.timeout seconds for a JSON line.
        deadline = time.time() + self.timeout
        while time.time() < deadline:
            try:
                raw = ser.readline()
            except serial.SerialException as e:
                ser.close()
                return False, f"Error reading from serial port: {e}"

            if not raw:
                # readline() timed out; keep looping until overall timeout
                continue

            line = raw.decode('utf-8', errors='ignore').strip()
            if not line:
                continue

            # Try to parse JSON:
            try:
                resp = json.loads(line)
            except json.JSONDecodeError:
                # Not valid JSON—ignore any stray lines
                continue

            # We got a JSON object. Check status/action:
            status = resp.get("status")
            action = resp.get("action")
            if status == "ok" and action == "write":
                ser.close()
                return True, resp
            else:
                # status=="error" or unexpected action:
                reason = resp.get("reason", "Unknown error")
                ser.close()
                return False, f"Arduino returned error: {reason}"

        # If we fall out of the loop, we never saw a valid JSON reply
        ser.close()
        return False, "Timeout waiting for JSON response from Arduino" 