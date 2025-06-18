import json
import serial
from .serial_reader import RFIDSerialReader
from django.conf import settings
from django.utils import timezone
import time

def validate_user_number(user_number):
    """
    Validate the format of a user number.
    Expected format: S/L{year}{increment:04d}, e.g. S20250001 or L20250001
    """
    if not user_number or not isinstance(user_number, str):
        return False
    if not (user_number.startswith('S') or user_number.startswith('L')):
        return False
    try:
        year = int(user_number[1:5])
        number = int(user_number[5:])
        return 2000 <= year <= 2100 and 1 <= number <= 9999
    except (ValueError, IndexError):
        return False

def format_error(message):
    """
    Standardize error response format
    """
    return {
        "status": "error",
        "detail": message,
        "timestamp": timezone.now().isoformat()
    }

def format_success(data):
    """
    Standardize success response format
    """
    return {
        "status": "ok",
        **data,
        "timestamp": timezone.now().isoformat()
    }

def read_rfid_card(timeout=30):
    """
    Try to read one RFID swipe from Arduino.
    Returns (True, {"uid": "...", "user_number": "S20250001"}) on success,
            (False, "<error message>") on failure or timeout.
    """
    serial_port = getattr(settings, "RFID_SERIAL_PORT", None)
    if not serial_port:
        return False, format_error("Serial port not configured.")

    reader = RFIDSerialReader(port=serial_port, baudrate=115200, timeout=timeout)
    success, result = reader.read_student_number()
    if not success:
        return False, format_error(result)

    # result is the JSON dict from Arduino, e.g.:
    #   {"status":"ok","action":"read","uid":"A1B2C3D4","data":"S20250001"}
    if result.get("status") != "ok" or result.get("action") != "read":
        return False, format_error(result.get("reason", "Unknown Arduino error"))

    user_number = result["data"]
    if not validate_user_number(user_number):
        return False, format_error(f"Invalid user number format: {user_number}")

    return True, format_success({
        "uid": result["uid"],
        "user_number": user_number
    })

def continuous_scan():
    """
    Continuously scan for RFID cards and yield scan results.
    Returns a generator that yields Server-Sent Events (SSE) for each scan.
    
    Yields:
        SSE events in the format: "data: {...}\n\n"
        Each event contains:
        - On success: {"status": "ok", "user_number": "...", "uid": "..."}
        - On error: {"status": "error", "detail": "..."}
        Also yields a heartbeat comment every 15 seconds if no data is sent.
    """
    serial_port = getattr(settings, "RFID_SERIAL_PORT", None)
    if not serial_port:
        yield f"data: {json.dumps(format_error('Serial port not configured.'))}\n\n"
        return

    try:
        ser = serial.Serial(serial_port, 115200, timeout=1)
    except serial.SerialException as e:
        yield f"data: {json.dumps(format_error(f'Could not open serial port: {e}'))}\n\n"
        return

    # Wait for initial "ready" message
    try:
        print("Waiting for Arduino ready message...")
        while True:
            raw = ser.readline()
            if raw:
                line = raw.decode('utf-8', errors='ignore').strip()
                print(f"Received from Arduino: {line}")
                try:
                    resp = json.loads(line)
                    if resp.get("status") == "ready":
                        break
                except json.JSONDecodeError:
                    continue
    except serial.SerialException as e:
        ser.close()
        yield f"data: {json.dumps(format_error(f'Error waiting for Arduino: {e}'))}\n\n"
        return

    # Send CONTINUOUS_SCAN command to Arduino
    try:
        print("Sending CONTINUOUS_SCAN command to Arduino...")
        ser.write(b"CONTINUOUS_SCAN\n")
        ser.flush()  # Ensure the command is sent
    except serial.SerialException as e:
        ser.close()
        yield f"data: {json.dumps(format_error(f'Error writing to serial port: {e}'))}\n\n"
        return

    # Wait for continuous scan acknowledgment
    try:
        print("Waiting for continuous scan acknowledgment...")
        while True:
            raw = ser.readline()
            if raw:
                line = raw.decode('utf-8', errors='ignore').strip()
                print(f"Received from Arduino: {line}")
                try:
                    resp = json.loads(line)
                    if resp.get("status") == "ok" and resp.get("action") == "continuous_scan":
                        yield f"data: {json.dumps(format_success({
                            'message': 'Continuous scanning started'
                        }))}\n\n"
                        break
                except json.JSONDecodeError:
                    continue
    except serial.SerialException as e:
        ser.close()
        yield f"data: {json.dumps(format_error(f'Error waiting for acknowledgment: {e}'))}\n\n"
        return

    KEEP_ALIVE = 15  # seconds
    last = time.time()

    try:
        while True:
            try:
                raw = ser.readline()
                now = time.time()
                if raw:
                    line = raw.decode('utf-8', errors='ignore').strip()
                    print(f"Received from Arduino: {line}")
                    
                    if not line:
                        # Even if line is empty, check for heartbeat
                        if now - last > KEEP_ALIVE:
                            yield ":\n\n"  # SSE heartbeat comment
                            last = now
                        continue

                    try:
                        resp = json.loads(line)
                        print(f"Parsed JSON response: {resp}")
                    except json.JSONDecodeError as e:
                        print(f"JSON decode error: {e}, line: {line}")
                        # Heartbeat if needed
                        if now - last > KEEP_ALIVE:
                            yield ":\n\n"
                            last = now
                        continue

                    if resp.get("status") == "ok" and resp.get("action") == "read":
                        uid = resp.get("uid")
                        user_number = resp.get("data")
                        if not user_number:
                            print(f"Missing user number in response: {resp}")
                            yield f"data: {json.dumps(format_error('No user number in card data'))}\n\n"
                        elif not validate_user_number(user_number):
                            yield f"data: {json.dumps(format_error(f'Invalid user number format: {user_number}'))}\n\n"
                        else:
                            yield f"data: {json.dumps(format_success({
                                'user_number': user_number,
                                'uid': uid,
                                'message': 'Card scanned successfully'
                            }))}\n\n"
                        last = now
                    elif resp.get("status") == "ok" and resp.get("action") == "stop_scan":
                        # Arduino has stopped scanning
                        yield f"data: {json.dumps(format_success({
                            'action': 'stop_scan',
                            'message': 'Scanning stopped by Arduino'
                        }))}\n\n"
                        break
                    else:
                        error_detail = resp.get('reason', 'Unknown error')
                        print(f"Error response from Arduino: {error_detail}")
                        yield f"data: {json.dumps(format_error(error_detail))}\n\n"
                        last = now
                else:
                    # No data, check for heartbeat
                    if now - last > KEEP_ALIVE:
                        yield ":\n\n"
                        last = now

            except serial.SerialException as e:
                print(f"Serial port error: {e}")
                yield f"data: {json.dumps(format_error(f'Serial port error: {e}'))}\n\n"
                break

    finally:
        # Send STOP_SCAN command to Arduino before closing
        try:
            print("Sending STOP_SCAN command to Arduino...")
            ser.write(b"STOP_SCAN\n")
            ser.flush()  # Ensure the command is sent
        except:
            pass
        ser.close() 