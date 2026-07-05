from rest_framework import serializers
from .models import Department


class DepartmentSerializer(serializers.ModelSerializer):
    student_count = serializers.SerializerMethodField()
    teacher_count = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = ['id', 'name', 'description', 'student_count', 'teacher_count', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_student_count(self, obj):
        return obj.users.filter(role='STUDENT').count()

    def get_teacher_count(self, obj):
        return obj.users.filter(role='TEACHER').count()

    def validate_name(self, value):
        instance = self.instance
        qs = Department.objects.filter(name__iexact=value)
        if instance:
            qs = qs.exclude(pk=instance.pk)
        if qs.exists():
            raise serializers.ValidationError('Department with this name already exists.')
        return value
