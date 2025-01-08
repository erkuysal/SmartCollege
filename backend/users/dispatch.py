import serial
import requests
import time

# Arduino serial port configuration
SERIAL_PORT = 'COM3'  # Replace with your port
BAUD_RATE = 9600

# Backend API configuration
API_WRITE_URL = "http://127.0.0.1:8000/api/students/rfid-data/"
API_VALIDATE_URL = "http://127.0.0.1:8000/api/students/validate-card/"

# Initialize serial connection
arduino = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
time.sleep(2)  # Wait for the connection to initialize


def fetch_student_data(student_number):
    """
    Fetch student data from the backend.
    """
    response = requests.get(f"{API_WRITE_URL}{student_number}/")
    return response.json() if response.status_code == 200 else None


def validate_card_data(card_data):
    """
    Send card data to the backend for validation.
    """
    response = requests.post(API_VALIDATE_URL, json={"card_data": card_data})
    return response.json()


def send_to_arduino(data):
    """
    Send data to Arduino over serial.
    """
    arduino.write(data.encode())
    print(f"Sent to Arduino: {data}")


def read_from_arduino():
    """
    Read data from Arduino over serial.
    """
    if arduino.in_waiting > 0:
        card_data = arduino.readline().decode().strip()
        print(f"Read from Arduino: {card_data}")
        return card_data
    return None


def main():
    while True:
        print("1. Write to RFID card")
        print("2. Validate RFID card")
        choice = input("Choose an option: ")

        if choice == "1":
            student_number = input("Enter the student number to write to RFID: ")
            student_data = fetch_student_data(student_number)
            if student_data:
                formatted_data = f"{student_data['studentNumber']},{student_data['firstName']},{student_data['lastName']}"
                send_to_arduino(formatted_data)
            else:
                print("Student not found.")
        elif choice == "2":
            print("Waiting for card data...")
            card_data = read_from_arduino()
            if card_data:
                validation_result = validate_card_data(card_data)
                print(validation_result["message"])
        else:
            print("Invalid choice.")