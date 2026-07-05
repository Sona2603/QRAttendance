import io
import json
import qrcode
import base64
from django.utils import timezone
from .models import AttendanceSession, Attendance


def generate_qr_code(session: AttendanceSession) -> str:
    """Generate a base64-encoded QR code image for a session."""
    payload = json.dumps({
        'session_id': session.id,
        'token': str(session.qr_token),
    })
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(payload)
    qr.make(fit=True)
    img = qr.make_image(fill='black', back_color='white')

    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    return base64.b64encode(buffer.read()).decode('utf-8')


def scan_qr_code(student, session_id, token, latitude=None, longitude=None):
    """
    Validate a QR scan and record attendance.
    Returns (attendance, error_message).
    """
    try:
        session = AttendanceSession.objects.select_related('classroom').get(pk=session_id)
    except AttendanceSession.DoesNotExist:
        return None, 'Session not found.'

    if str(session.qr_token) != str(token):
        return None, 'Invalid QR token.'

    session.deactivate_if_expired()
    if not session.is_active:
        return None, 'This session has expired.'

    # Check if student is enrolled in this classroom
    if not session.classroom.students.filter(pk=student.pk).exists():
        return None, 'You are not enrolled in this class.'

    # Prevent duplicates
    if Attendance.objects.filter(student=student, session=session).exists():
        return None, 'You have already marked attendance for this session.'

    # Determine status: LATE if past start_time + 15 min
    now = timezone.now()
    grace_period = session.start_time + timezone.timedelta(minutes=15)
    status = 'LATE' if now > grace_period else 'PRESENT'

    attendance = Attendance.objects.create(
        student=student,
        session=session,
        status=status,
        latitude=latitude,
        longitude=longitude,
    )
    return attendance, None


def get_attendance_percentage(student, classroom=None):
    """Calculate attendance percentage for a student."""
    from apps.classrooms.models import ClassRoom

    sessions_qs = AttendanceSession.objects.all()
    if classroom:
        sessions_qs = sessions_qs.filter(classroom=classroom)
    else:
        enrolled = ClassRoom.objects.filter(students=student)
        sessions_qs = sessions_qs.filter(classroom__in=enrolled)

    total = sessions_qs.count()
    if total == 0:
        return 0

    attended = Attendance.objects.filter(
        student=student,
        session__in=sessions_qs,
        status__in=['PRESENT', 'LATE']
    ).count()

    return round((attended / total) * 100, 2)
