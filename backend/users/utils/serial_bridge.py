import time
import serial

ARDUINO_PORT = "/dev/cu.usbserial-1140"  # Adjust for your environment
BAUD_RATE = 9600
TIMEOUT = 3  # Increase if needed (in seconds)

def send_to_arduino_write(data_to_write):
    """
    Sends 'WRITE:<data>' to the Arduino and loops until
    it receives 'WRITE_OK' or 'WRITE_FAIL' or times out.
    Returns a dict: {"status": "success"} or {"error": "..."}.
    """
    print(f"[DEBUG] Connecting to {ARDUINO_PORT} at {BAUD_RATE} baud...")
    try:
        with serial.Serial(ARDUINO_PORT, BAUD_RATE, timeout=TIMEOUT) as ser:
            print("[DEBUG] Connected to Arduino. Flushing input...")
            # Some boards reset on open, so short delay can help
            time.sleep(2)
            ser.flushInput()

            command = f"WRITE:{data_to_write}\n"
            print(f"[DEBUG] Sending command to Arduino: {command.strip()}")
            ser.write(command.encode('utf-8'))

            while True:
                line = ser.readline().decode('utf-8').strip()
                if not line:
                    print("[DEBUG] No line read from Arduino (timeout).")
                    return {"error": "No response (timeout or empty line)."}

                print(f"[DEBUG] Line from Arduino: {line}")
                if line == "WRITE_OK":
                    return {"status": "success"}
                elif line == "WRITE_FAIL":
                    return {"error": "Arduino reported WRITE_FAIL."}
                # Otherwise, treat it as a debug line and keep reading
    except serial.SerialException as e:
        # More specific exception handling for serial errors
        print(f"[DEBUG] Serial connection error: {e}")
        return {"error": f"Serial connection error: {str(e)}"}
    except Exception as e:
        print(f"[DEBUG] General exception: {e}")
        return {"error": str(e)}


def read_from_arduino():
    """
    Sends 'READ' to Arduino and expects:
      - 'DATA:<some_string>' or
      - 'READ_FAIL'
    Returns {"data": "..."} or {"error": "..."} accordingly.
    """
    print(f"[DEBUG] Connecting to {ARDUINO_PORT} at {BAUD_RATE} baud...")
    try:
        with serial.Serial(ARDUINO_PORT, BAUD_RATE, timeout=TIMEOUT) as ser:
            print("[DEBUG] Connected to Arduino. Flushing input...")
            time.sleep(2)  # Give Arduino time to reset if needed
            ser.flushInput()

            command = "READ\n"
            print(f"[DEBUG] Sending command to Arduino: {command.strip()}")
            ser.write(command.encode('utf-8'))

            # Read a single line for the response
            response = ser.readline().decode('utf-8').strip()
            print(f"[DEBUG] Line from Arduino: {response}")

            if response.startswith("DATA:"):
                card_data = response[5:]  # remove "DATA:"
                return {"data": card_data}
            elif response == "READ_FAIL":
                return {"error": "Arduino reported READ_FAIL."}
            else:
                return {"error": f"Unexpected response: {response}"}
    except serial.SerialException as e:
        print(f"[DEBUG] Serial connection error: {e}")
        return {"error": f"Serial connection error: {str(e)}"}
    except Exception as e:
        print(f"[DEBUG] General exception: {e}")
        return {"error": str(e)}
