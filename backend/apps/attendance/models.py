import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone


class AttendanceSession(models.Model):
    classroom = models.ForeignKey(
        'classrooms.ClassRoom',
        on_delete=models.CASCADE,
        related_name='sessions'
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_sessions'
    )
    qr_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    start_time = models.DateTimeField(default=timezone.now)
    end_time = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Session: {self.classroom.name} - {self.start_time.strftime("%Y-%m-%d %H:%M")}'

    @property
    def is_expired(self):
        return timezone.now() > self.end_time

    def deactivate_if_expired(self):
        if self.is_expired and self.is_active:
            self.is_active = False
            self.save(update_fields=['is_active'])


class Attendance(models.Model):
    STATUS_CHOICES = [
        ('PRESENT', 'Present'),
        ('ABSENT', 'Absent'),
        ('LATE', 'Late'),
    ]

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='attendances'
    )
    session = models.ForeignKey(
        AttendanceSession,
        on_delete=models.CASCADE,
        related_name='attendances'
    )
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PRESENT')
    scan_time = models.DateTimeField(auto_now_add=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    class Meta:
        unique_together = ['student', 'session']
        ordering = ['-scan_time']

    def __str__(self):
        return f'{self.student.name} - {self.session} - {self.status}'
