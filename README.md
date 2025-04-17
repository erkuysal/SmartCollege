# SmartCollege - Integrated College Management System

SmartCollege is a comprehensive college management system that combines web technologies with hardware integration to provide a modern solution for academic institutions. The platform creates a connected ecosystem where administrative tasks, academic management, and physical access control are seamlessly integrated through RFID technology.

## Project Overview

This project is divided into three main components that work together to create a complete solution:

1. **Backend**: Django REST Framework API that serves as the system's core, handling data processing, business logic, and database operations
2. **Frontend**: Vue.js 3 + Vuetify single-page application that provides an intuitive interface for users across different roles
3. **Hardware**: Arduino-based RFID card readers for physical access control, attendance tracking, and user identification

## Core Features

### User and Role Management
- **Student Management**: Registration, profiles, academic records, attendance tracking
- **Lecturer Management**: Course assignments, scheduling, performance analytics
- **Staff Administration**: Role-based permissions, department assignments, system access

### Academic Management
- **Attendance Tracking**: RFID-based automated attendance recording with real-time updates
- **Grade Management**: Course grading, transcripts, GPA calculation
- **Enrollment System**: Course registration, semester planning, prerequisites validation
- **Academic Bindings**: Course-student-lecturer relationship management

### Resource Management
- **Classroom Allocation**: Room scheduling, capacity planning, facility management
- **Department Organization**: Faculty structuring, program management, resource allocation
- **Course Catalog**: Curriculum management, course descriptions, credit allocation
- **Facility Booking**: Library, labs, and other spaces reservation system

### RFID Integration
- **Card Management**: Card issuance, programming, tracking, and deactivation
- **Access Control**: Building/room access permissions based on user roles
- **Automated Attendance**: Touchless check-in for classes and events
- **Identity Verification**: Secure user identification across campus services

### Security and Compliance
- **Authentication**: JWT-based secure access to digital resources
- **Authorization**: Role-based permissions across all functions
- **Audit Logging**: Comprehensive tracking of system activities
- **Data Protection**: Encryption and privacy controls for sensitive information

## System Architecture

### Backend (Django + Django REST Framework)

The backend follows a modular architecture with domain-specific applications:

- **Structure**:
  - `backend/`: Core Django project settings and configurations
  - `users/`: User models and authentication (JWT-based)
    - `base/`: Common user functionality and base models
    - `students/`: Student-specific views and endpoints
    - `lecturers/`: Lecturer-specific functionality
    - `staff/`: Administrative staff interfaces
  - `academics/`: Academic management
    - `attendance/`: Attendance tracking and reporting
    - `enrollment/`: Course registration and class rosters
    - `grades/`: Assessment records and grade calculations
    - `bindings/`: Course-student-lecturer relationships
  - `college/`: Institution resources
    - `courses/`: Course definitions and curriculum
    - `classrooms/`: Physical spaces and scheduling
    - `departments/`: Organizational structure
    - `facilities/`: Campus resources and booking
    - `schedules/`: Academic calendar and timetables
    - `faculties/`: Faculty management and hierarchies
  - `utilities/`: Support services
    - `rfid_util/`: RFID card management and integration
    - `notifications/`: Messaging and alerts
    - `reports/`: Data analytics and reporting
  - `security/`: Security features (audit logging, access control)
  - `transactions/`: Financial operations (under development)

- **API Documentation**:
  - Auto-generated OpenAPI schema: `/api/schema/`
  - Interactive Swagger UI: `/api/schema/swagger-ui/`
  - ReDoc documentation: `/api/schema/redoc/`

- **Key Technologies**:
  - Django 5.1.3: Web framework
  - Django REST Framework 3.15.2: API toolkit
  - drf-spectacular 0.28.0: OpenAPI schema generation
  - PySerial: Hardware communication
  - SQLite (development) / PostgreSQL (production): Database

### Frontend (Vue.js + Vuetify)

The frontend uses a component-based architecture with TypeScript for type safety:

- **Project Structure**:
  - `src/components/`: Reusable UI components
    - `navigation/`: Navigation elements (sidebar, navbar)
    - `layouts/`: Page layout templates
  - `src/views/`: Page components
    - `layouts/`: Layout wrapper components
    - `pages/`: Application pages
      - `management/`: Administrative interfaces
      - `actions/`: Form-based action pages (add/edit)
      - `details/`: Detail view pages
  - `src/router/`: Route definitions and navigation
  - `src/plugins/`: Vuetify and other plugin configurations
  - `src/utils/`: Helper functions and utilities
  - `src/assets/`: Static files (images, styles)

- **Features**:
  - Responsive material design interface
  - Role-based dashboard views
  - Interactive data tables and visualizations
  - Data-driven charts and reports
  - Dynamic form generation
  - Real-time notifications
  - Calendar integration for scheduling

- **Key Technologies**:
  - Vue 3.4.31: Progressive JavaScript framework
  - Vuetify 3.6.14: Material Design component library
  - TypeScript: Type-safe JavaScript superset
  - Pinia 2.3.0: State management
  - Vue Router 4.5.0: Client-side routing
  - Axios: HTTP client for API communication
  - Chart.js: Data visualization
  - FullCalendar: Calendar and scheduling interface
  - Vite: Development server and build tool

### Hardware (Arduino + RFID)

The hardware component uses Arduino microcontrollers with RFID modules:

- **Components**:
  - Arduino microcontroller (UNO/Nano compatible)
  - MFRC522 RFID reader modules (13.56MHz)
  - USB serial connection to backend server
  - Optional LCD display for user feedback

- **Implementation Details**:
  - Serial communication protocol at 9600 baud
  - Command-based interface with the backend
  - Card read/write operations with error handling
  - Authentication using default MIFARE keys
  - Student ID storage in RFID card block 4

- **Functionality**:
  - Two-way communication with backend server
  - Reading student identification from cards
  - Writing new student IDs to blank cards
  - Error detection and reporting
  - Status indication for operations

## Setup and Installation

### Backend Setup

#### Option 1: Standard Virtual Environment

1. Create a virtual environment:
   ```
   python -m venv venv
   ```

2. Activate the virtual environment:
   - On Windows: `venv\Scripts\activate`
   - On macOS/Linux: `source venv/bin/activate`

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

#### Option 2: Using Conda

1. Install Miniconda or Anaconda:
   - Download and install from [Conda's official website](https://docs.conda.io/en/latest/miniconda.html)
   - Follow the installation instructions for your operating system

2. Create a new Conda environment:
   ```
   conda create -n smartcollege python=3.11
   ```

3. Activate the Conda environment:
   - On Windows: `conda activate smartcollege`
   - On macOS/Linux: `conda activate smartcollege`

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
   
   Note: Some packages may require Conda-specific installation:
   ```
   conda install -c conda-forge django
   ```

5. Set up environment variables:
   Create a `.env` file in the backend directory with:
   ```
   DJANGO_SECRET_KEY=your_secret_key_here
   DJANGO_DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1
   ```

6. Run migrations:
   ```
   python manage.py migrate
   ```

7. Create a superuser:
   ```
   python manage.py createsuperuser
   ```

8. Run the development server:
   ```
   python manage.py runserver
   ```

### Frontend Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Configure environment (optional):
   Create an `.env` file in the frontend directory for API endpoints and other configurations.

3. Start the development server:
   ```
   npm run dev
   ```

4. Build for production:
   ```
   npm run build
   ```

### Hardware Setup

1. Install the Arduino IDE (2.0+ recommended)

2. Install required libraries through the Arduino Library Manager:
   - MFRC522 by GithubCommunity
   - SPI (included with Arduino IDE)

3. Connect the RFID reader to the Arduino:
   - RST_PIN -> Digital Pin 9
   - SS_PIN -> Digital Pin 10
   - MOSI -> Digital Pin 11
   - MISO -> Digital Pin 12
   - SCK -> Digital Pin 13
   - 3.3V and GND as appropriate

   Refer to the connection diagrams in the Hardware directory:
   - `RFID_CONN.png`
   - `RFID_CONNECTIONS.png`

4. Upload the sketch from the `Hardware/read_write/read_write.ino` to the Arduino

5. Connect the Arduino to the backend server via USB serial

6. Configure the backend to recognize the correct serial port:
   - Windows: Look for "COM#" ports in Device Manager
   - macOS: Look for "/dev/tty.usbmodem*" devices
   - Linux: Look for "/dev/ttyACM*" or "/dev/ttyUSB*" devices

## Development Workflow

### Backend Development

1. Create or modify Django models in the appropriate app
2. Generate and apply migrations with `python manage.py makemigrations` and `python manage.py migrate`
3. Create serializers for API representation
4. Implement viewsets or API views with appropriate permissions
5. Register endpoints in the app's urls.py
6. Update API documentation as needed
7. Test with Django test framework or tools like Postman

### Frontend Development

1. Define new routes in the router configuration when adding pages
2. Create reusable components in the components directory
3. Implement views that compose these components
4. Use Pinia stores for state management across components
5. Connect to backend APIs using Axios or Fetch
6. Test across different screen sizes for responsiveness
7. Follow the material design principles for UI consistency

### Hardware Development

1. Develop and test Arduino code using the Arduino IDE
2. Implement communication protocol with the backend
3. Test card read/write operations
4. Implement error handling for failed operations
5. Verify integration with the backend system

### Integration Process

1. The backend API endpoints are documented in `api_endpoints.md`
2. Frontend components interact with backend through API calls
3. RFID hardware communicates with backend through serial interface using command-response protocols
4. Backend processes RFID data and updates the database
5. Frontend reflects changes through reactive data binding

## Data Flow Examples

### Attendance Tracking Flow

1. Student taps RFID card on reader at classroom entrance
2. Arduino reads student ID and sends to backend via serial
3. Backend verifies student enrollment in current class
4. Attendance record is created in the database
5. Lecturer's dashboard updates with real-time attendance information

### Card Issuance Flow

1. Administrator assigns a new card to a student in the frontend
2. Frontend sends request to backend API
3. Backend creates a pending RFID card record
4. Staff member initiates card writing process
5. Backend sends command to Arduino
6. Arduino writes student ID to physical card
7. Arduino confirms successful writing
8. Backend updates card status to "issued"
9. Student can now use the card across campus

## Security Notes

- JWT authentication secures all API endpoints with token-based access
- RFID cards use standard MIFARE Classic security with default keys
- Role-based permissions restrict access to sensitive operations
- Password hashing and secure storage for user credentials
- Input validation on both frontend and backend
- CSRF protection for form submissions
- Session management for authenticated users

## Error Handling

- Backend returns appropriate HTTP status codes with error messages
- Frontend displays user-friendly error notifications
- Hardware devices report operation status and errors
- Logging throughout the system for debugging
- Fallback mechanisms for hardware failures

## Future Development

- **Payment Integration**: Tuition fees, library fines, cafeteria purchases
- **Mobile Application**: Native app for students and lecturers
- **Advanced Analytics**: Predictive modeling for student performance
- **External Integrations**: LMS platforms, digital libraries, research databases
- **Biometric Authentication**: Multi-factor security options
- **Cloud Deployment**: Containerization and scaling strategy
- **Offline Mode**: Operation during network disruptions

## License

This project is proprietary and for educational purposes only.

## Project Team

- Backend Developers: [Team Member Names]
- Frontend Developers: [Team Member Names]
- Hardware Engineers: [Team Member Names]
- Project Manager: [Name]
- UI/UX Designers: [Team Member Names] 