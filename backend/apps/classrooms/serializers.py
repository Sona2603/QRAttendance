from rest_framework import serializers
from .models import ClassRoom
from apps.authentication.serializers import UserSerializer
from apps.departments.serializers import DepartmentSerializer


class ClassRoomSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    teacher_name = serializers.CharField(source='teacher.name', read_only=True)
    student_count = serializers.SerializerMethodField()

    class Meta:
        model = ClassRoom
        fields = [
            'id', 'name', 'department', 'department_name',
            'teacher', 'teacher_name', 'students', 'student_count', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def get_student_count(self, obj):
        return obj.students.count()

    def validate(self, data):
        name = data.get('name', getattr(self.instance, 'name', None))
        department = data.get('department', getattr(self.instance, 'department', None))
        qs = ClassRoom.objects.filter(name=name, department=department)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError('A classroom with this name already exists in this department.')
        return data


class ClassRoomDetailSerializer(ClassRoomSerializer):
    teacher = UserSerializer(read_only=True)
    department = DepartmentSerializer(read_only=True)
    students = UserSerializer(many=True, read_only=True)

    class Meta(ClassRoomSerializer.Meta):
        pass
