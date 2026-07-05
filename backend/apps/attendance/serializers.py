from rest_framework import serializers
from django.utils import timezone
from .models import AttendanceSession, Attendance
from .services import generate_qr_code


class AttendanceSessionSerializer(serializers.ModelSerializer):
    classroom_name = serializers.CharField(source='classroom.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)
    qr_code = serializers.SerializerMethodField()
    attendance_count = serializers.SerializerMethodField()
    is_expired = serializers.BooleanField(read_only=True)

    class Meta:
        model = AttendanceSession
        fields = [
            'id', 'classroom', 'classroom_name', 'created_by', 'created_by_name',
            'qr_token', 'qr_code', 'start_time', 'end_time', 'is_active',
            'attendance_count', 'is_expired', 'created_at'
        ]
        read_only_fields = ['id', 'qr_token', 'created_by', 'created_at', 'is_expired']

    def get_qr_code(self, obj):
        return generate_qr_code(obj)

    def get_attendance_count(self, obj):
        return obj.attendances.count()

    def validate(self, data):
        start = data.get('start_time', timezone.now())
        end = data.get('end_time')
        if end and end <= start:
            raise serializers.ValidationError({'end_time': 'End time must be after start time.'})
        return data

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    student_email = serializers.CharField(source='student.email', read_only=True)
    session_classroom = serializers.CharField(source='session.classroom.name', read_only=True)
    session_date = serializers.DateTimeField(source='session.start_time', read_only=True)

    class Meta:
        model = Attendance
        fields = [
            'id', 'student', 'student_name', 'student_email',
            'session', 'session_classroom', 'session_date',
            'status', 'scan_time', 'latitude', 'longitude'
        ]
        read_only_fields = ['id', 'student', 'scan_time']


class QRScanSerializer(serializers.Serializer):
    session_id = serializers.IntegerField()
    token = serializers.UUIDField()
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False, allow_null=True)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False, allow_null=True)
