# SmartAttendance System

A comprehensive attendance management system built with Vue.js frontend and Django backend, featuring RFID integration for automated attendance tracking.

## 🚀 Project Overview

SmartAttendance is a modern attendance management system designed for educational institutions. It provides automated attendance tracking using RFID technology, comprehensive academic management, and a digital wallet system for students.

### Key Features

- **RFID Integration**: Real-time RFID card reading and writing for automated attendance
- **Attendance Tracking**: Comprehensive session and attendance management
- **Academic Management**: Course, semester, and academic year management
- **User Management**: Support for students and lecturers with custom user models
- **Digital Wallet**: Student wallet system with point-based rewards
- **Modern UI**: Beautiful interface built with Vue.js and Vuetify
- **RESTful API**: Complete API with automatic documentation
- **Real-time Updates**: Live attendance tracking and notifications

## 🏗️ Architecture

### Technology Stack

#### Frontend
- **Framework**: Vue.js 3 with Composition API
- **Language**: TypeScript
- **Build Tool**: Vite
- **UI Framework**: Vuetify 3
- **State Management**: Pinia
- **Router**: Vue Router 4
- **HTTP Client**: Axios

#### Backend
- **Framework**: Django 5.2.2
- **API Framework**: Django REST Framework 3.16.0
- **Database**: SQLite (Development)
- **API Documentation**: DRF Spectacular 0.28.0
- **CORS**: django-cors-headers
- **Serial Communication**: pyserial for RFID integration

## 📁 Project Structure

```
SmartAttendance/
├── frontend/                 # Vue.js frontend application
│   ├── src/
│   │   ├── components/       # Reusable Vue components
│   │   ├── views/           # Page-level components
│   │   ├── client/          # API client and stores
│   │   ├── router/          # Routing configuration
│   │   ├── config/          # Application configuration
│   │   ├── styles/          # Global styles and themes
│   │   ├── plugins/         # Vue plugins
│   │   └── assets/          # Static assets
│   ├── package.json
│   └── vite.config.mts
├── backend/                  # Django backend application
│   ├── users/               # User management app
│   ├── attendance/          # Attendance tracking app
│   ├── academic/            # Academic management app
│   ├── wallet/              # Wallet management app
│   ├── rfid/                # RFID integration app
│   ├── backend/             # Django project settings
│   ├── manage.py
│   └── requirements.txt
└── README.md
```

## 🛠️ Quick Start

### Prerequisites

- **Node.js** (version 16 or higher)
- **Python** (3.8 or higher)
- **Conda** (for environment management)
- **Git**
- **RFID Hardware** (for full functionality)

### Backend Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd SmartAttendance
   ```

2. **Set up Python environment**:
   ```bash
   # Using conda
   conda create -n smartattendance-backend python=3.11
   conda activate smartattendance-backend
   
   # Or using venv
   python -m venv smartattendance-env
   source smartattendance-env/bin/activate  # On Windows: smartattendance-env\Scripts\activate
   ```

3. **Install backend dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. **Set up the database**:
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```

5. **Start the backend server**:
   ```bash
   python manage.py runserver
   ```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`

## 🔧 Configuration

### Backend Configuration

Create a `.env` file in the backend directory:
```bash
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///db.sqlite3
RFID_SERIAL_PORT=/dev/cu.usbserial-1140
RFID_BAUDRATE=115200
CORS_ALLOW_ALL_ORIGINS=True
```

### Frontend Configuration

Create environment files in the frontend directory:
```bash
# .env
VITE_API_URL=http://localhost:8000/api
VITE_APP_TITLE=SmartAttendance
```

## 📚 API Documentation

Once the backend is running, you can access the API documentation:

- **Swagger UI**: `http://localhost:8000/api/schema/swagger-ui/`
- **ReDoc**: `http://localhost:8000/api/schema/redoc/`
- **OpenAPI Schema**: `http://localhost:8000/api/schema/`

## 🎯 Core Features

### Attendance Management
- Create and manage class sessions
- Track student attendance in real-time
- View attendance reports and statistics
- RFID-based automated attendance marking

### Academic Management
- Manage academic years and semesters
- Create and manage courses
- Handle course registrations
- Schedule management

### User Management
- Student and lecturer accounts
- Custom user model with role-based access
- User profile management

### Wallet System
- Digital wallet for students
- Point-based reward system
- Transaction history
- Activity-based point allocation

### RFID Integration
- Real-time RFID card reading
- Card writing and management
- Continuous scanning capabilities
- Hardware integration

## 🚀 Development

### Backend Development

```bash
# Run development server
python manage.py runserver

# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Run tests
python manage.py test

# Django shell
python manage.py shell_plus
```

### Frontend Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check
```

## 📦 Deployment

### Backend Deployment

1. **Install production dependencies**:
   ```bash
   pip install gunicorn psycopg2-binary
   ```

2. **Configure production settings**:
   ```python
   DEBUG = False
   ALLOWED_HOSTS = ['yourdomain.com']
   ```

3. **Collect static files**:
   ```bash
   python manage.py collectstatic
   ```

4. **Run with Gunicorn**:
   ```bash
   gunicorn --bind 0.0.0.0:8000 backend.wsgi:application
   ```

### Frontend Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Deploy the `dist/` folder** to your hosting provider

3. **Configure SPA routing** (redirect all routes to index.html)

## 🔒 Security Considerations

### Production Security
- Use environment variables for sensitive data
- Set `DEBUG = False` in production
- Configure proper CORS origins
- Use HTTPS in production
- Implement proper authentication

### API Security
- Implement JWT or session authentication
- Use proper permission classes
- Validate all inputs
- Use Django ORM to prevent SQL injection

## 🐛 Troubleshooting

### Common Issues

#### Backend Issues
```bash
# Database issues
python manage.py migrate --fake-initial

# Port conflicts
lsof -i :8000
kill -9 <PID>

# Clear cache
find . -type d -name "__pycache__" -exec rm -r {} +
```

#### Frontend Issues
```bash
# Clear dependencies
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow PEP 8 for Python code
- Use TypeScript for frontend development
- Write meaningful commit messages
- Update documentation for new features
- Test your changes thoroughly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the detailed documentation files

## 🔗 Links

- **Backend Documentation**: [backend.md](backend.md)
- **Frontend Documentation**: [frontend.md](frontend.md)
- **API Examples**: [example_responses.md](example_responses.md)
- **Django Documentation**: https://docs.djangoproject.com/
- **Vue.js Documentation**: https://vuejs.org/
- **Vuetify Documentation**: https://vuetifyjs.com/

---

**SmartAttendance** - Modern attendance management for educational institutions. 