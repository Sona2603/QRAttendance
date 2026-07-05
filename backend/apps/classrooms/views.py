from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter

from .models import ClassRoom
from .serializers import ClassRoomSerializer, ClassRoomDetailSerializer
from apps.authentication.permissions import IsAdmin, IsAdminOrTeacher, IsAdminOrReadOnly


class ClassRoomListCreateView(generics.ListCreateAPIView):
    serializer_class = ClassRoomSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['department', 'teacher']
    search_fields = ['name']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return ClassRoom.objects.all()
        elif user.role == 'TEACHER':
            return ClassRoom.objects.filter(teacher=user)
        else:
            return ClassRoom.objects.filter(students=user)

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdmin()]
        return [IsAuthenticated()]


class ClassRoomDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ClassRoom.objects.all()
    permission_classes = [IsAdminOrReadOnly]

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ClassRoomDetailSerializer
        return ClassRoomSerializer


@api_view(['POST'])
@permission_classes([IsAdmin])
def add_student_to_class(request, pk):
    try:
        classroom = ClassRoom.objects.get(pk=pk)
    except ClassRoom.DoesNotExist:
        return Response({'error': 'Classroom not found.'}, status=404)

    student_id = request.data.get('student_id')
    if not student_id:
        return Response({'error': 'student_id is required.'}, status=400)

    from apps.authentication.models import User
    try:
        student = User.objects.get(pk=student_id, role='STUDENT')
    except User.DoesNotExist:
        return Response({'error': 'Student not found.'}, status=404)

    classroom.students.add(student)
    return Response({'message': f'{student.name} added to {classroom.name}.'})


@api_view(['DELETE'])
@permission_classes([IsAdmin])
def remove_student_from_class(request, pk, student_id):
    try:
        classroom = ClassRoom.objects.get(pk=pk)
        from apps.authentication.models import User
        student = User.objects.get(pk=student_id)
        classroom.students.remove(student)
        return Response({'message': 'Student removed.'})
    except ClassRoom.DoesNotExist:
        return Response({'error': 'Classroom not found.'}, status=404)
