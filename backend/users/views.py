import json

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .models import Student, Attendance


@csrf_exempt
def record_attendance(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        student_number = data.get('student_number')

        # Validate student
        try:
            student = Student.objects.get(student_number=student_number)
        except Student.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Student not found'}, status=404)

        # Record attendance
        Attendance.objects.create(student=student)
        return JsonResponse({'status': 'success', 'message': 'Attendance recorded'})

    return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)