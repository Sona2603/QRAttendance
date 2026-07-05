from django.contrib import admin
from .models import AttendanceSession, Attendance


@admin.register(AttendanceSession)
class AttendanceSessionAdmin(admin.ModelAdmin):
    list_display = ['classroom', 'created_by', 'start_time', 'end_time', 'is_active']
    list_filter = ['is_active', 'classroom__department']
    search_fields = ['classroom__name']


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['student', 'session', 'status', 'scan_time']
    list_filter = ['status', 'session__classroom__department']
    search_fields = ['student__name', 'student__email']
