from academics.attendance.models import AttendanceSession


class AcademicService:
    @staticmethod
    def process_attendance(session_id):
        """Process attendance for a session"""
        session = AttendanceSession.objects.get(id=session_id)
        if not session.is_active:
            return False
            
        if session.get_status() == "Closed":
            session.close_session()
            return True
        return False

    @staticmethod
    def validate_schedule(schedule):
        """Validate schedule conflicts"""
        conflicts = []
        if schedule.has_classroom_conflict():
            conflicts.append("Classroom conflict")
        if schedule.has_lecturer_conflict():
            conflicts.append("Lecturer conflict")
        if schedule.has_student_conflicts():
            conflicts.append("Student conflicts")
        return conflicts 