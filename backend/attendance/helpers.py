from django.utils import timezone
from django.db import transaction
from users.models import BaseUser
from rfid.models import RFIDTag
from attendance.models import AttendanceRecord, AttendanceSession

class AttendanceError(Exception):
    """Base exception for attendance-related errors."""
    pass

class AlreadyMarked(AttendanceError):
    """Raised when a student has already been marked present for a session."""
    pass

class InvalidCard(AttendanceError):
    """Raised when the RFID card is not valid."""
    pass

class UserNotFound(AttendanceError):
    """Raised when a user is not found."""
    pass

class SessionNotActive(AttendanceError):
    """Raised when the attendance session is not active."""
    pass

@transaction.atomic
def mark_attendance(session, user_number, uid):
    """
    Mark a user as present in an attendance session.
    
    Args:
        session: The AttendanceSession instance
        user_number: The user's number (e.g., "S20250001")
        uid: The RFID card UID
        
    Returns:
        dict: A dictionary containing the attendance record details
        
    Raises:
        SessionNotActive: If the session is not active
        UserNotFound: If the user is not found
        InvalidCard: If the RFID card is not valid
        AlreadyMarked: If the user has already been marked present
    """
    # Check if session is active
    if not session.is_active:
        raise SessionNotActive("Session is not active")

    # Get the user
    try:
        user = BaseUser.objects.get(user_number=user_number, user_type='student')
    except BaseUser.DoesNotExist:
        raise UserNotFound(f"User with number {user_number} not found")

    # Check if the RFID card is valid
    # if not user.card_uid:
    #     user.card_uid = uid
    #     user.save()
    # elif user.card_uid != uid:
    #     raise InvalidCard("Invalid RFID card")

    # Check if already marked
    if AttendanceRecord.objects.filter(student=user, session=session).exists():
        raise AlreadyMarked("User already marked present for this session")

    # Create attendance record
    record = AttendanceRecord.objects.create(
        student=user,
        session=session,
        timestamp=timezone.now()
    )

    return {
        "status": "success",
        "user_number": user.user_number,
        "uid": uid,
        "session_id": session.id,
        "timestamp": record.timestamp.isoformat(),
        "message": "Attendance marked successfully"
    }