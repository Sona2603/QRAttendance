from django.db.models.signals import post_save
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Attendance


@receiver(post_save, sender=Attendance)
def broadcast_attendance(sender, instance, created, **kwargs):
    if not created:
        return
    channel_layer = get_channel_layer()
    if channel_layer is None:
        return
    group_name = f'attendance_{instance.session_id}'
    try:
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                'type': 'attendance_update',
                'data': {
                    'type': 'new_attendance',
                    'student': instance.student.name,
                    'status': instance.status,
                    'scan_time': instance.scan_time.isoformat(),
                }
            }
        )
    except Exception:
        pass  # channel layer unavailable
