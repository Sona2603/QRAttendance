import csv
import io
from datetime import datetime

from django.http import HttpResponse
from django.db.models import Count, Q
from django.utils import timezone

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import AttendanceSession, Attendance
from .serializers import AttendanceSessionSerializer, AttendanceSerializer, QRScanSerializer
from .services import scan_qr_code, get_attendance_percentage
from apps.authentication.permissions import IsAdmin, IsTeacher, IsAdminOrTeacher, IsStudent

try:
    import openpyxl
    HAS_OPENPYXL = True
except ImportError:
    HAS_OPENPYXL = False


class AttendanceSessionListCreateView(generics.ListCreateAPIView):
    serializer_class = AttendanceSessionSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['classroom', 'is_active']
    search_fields = ['classroom__name']
    ordering_fields = ['created_at', 'start_time']

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminOrTeacher()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return AttendanceSession.objects.all()
        elif user.role == 'TEACHER':
            return AttendanceSession.objects.filter(created_by=user)
        else:
            return AttendanceSession.objects.filter(classroom__students=user)


class AttendanceSessionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AttendanceSessionSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAuthenticated()]
        return [IsAdminOrTeacher()]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return AttendanceSession.objects.all()
        elif user.role == 'TEACHER':
            return AttendanceSession.objects.filter(created_by=user)
        return AttendanceSession.objects.filter(classroom__students=user)


class QRScanView(APIView):
    permission_classes = [IsStudent]

    def post(self, request):
        serializer = QRScanSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        d = serializer.validated_data

        attendance, error = scan_qr_code(
            student=request.user,
            session_id=d['session_id'],
            token=d['token'],
            latitude=d.get('latitude'),
            longitude=d.get('longitude'),
        )
        if error:
            return Response({'error': error}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {'message': f'Attendance marked as {attendance.status}.', 'status': attendance.status},
            status=status.HTTP_201_CREATED
        )


class AttendanceListView(generics.ListAPIView):
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'session', 'session__classroom', 'session__classroom__department']
    search_fields = ['student__name', 'student__email', 'session__classroom__name']
    ordering_fields = ['scan_time', 'status']

    def get_queryset(self):
        user = self.request.user
        qs = Attendance.objects.select_related('student', 'session__classroom')
        if user.role == 'ADMIN':
            return qs
        elif user.role == 'TEACHER':
            return qs.filter(session__created_by=user)
        else:
            return qs.filter(student=user)


class AttendanceHistoryView(APIView):
    permission_classes = [IsStudent]

    def get(self, request):
        attendances = Attendance.objects.filter(student=request.user).select_related(
            'session__classroom__department'
        )
        percentage = get_attendance_percentage(request.user)
        data = AttendanceSerializer(attendances, many=True).data
        return Response({
            'attendances': data,
            'total': attendances.count(),
            'percentage': percentage,
        })


class DashboardStatsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        from apps.authentication.models import User
        from apps.classrooms.models import ClassRoom
        from apps.departments.models import Department

        stats = {
            'total_students': User.objects.filter(role='STUDENT').count(),
            'total_teachers': User.objects.filter(role='TEACHER').count(),
            'total_classes': ClassRoom.objects.count(),
            'total_sessions': AttendanceSession.objects.count(),
            'total_departments': Department.objects.count(),
            'active_sessions': AttendanceSession.objects.filter(
                is_active=True,
                end_time__gt=timezone.now()
            ).count(),
        }
        return Response(stats)


class MonthlyAttendanceView(APIView):
    permission_classes = [IsAdminOrTeacher]

    def get(self, request):
        year = int(request.query_params.get('year', timezone.now().year))
        data = []
        for month in range(1, 13):
            count = Attendance.objects.filter(
                scan_time__year=year,
                scan_time__month=month
            ).count()
            data.append({'month': month, 'count': count})
        return Response(data)


class DepartmentAttendanceView(APIView):
    permission_classes = [IsAdminOrTeacher]

    def get(self, request):
        from apps.departments.models import Department
        result = []
        for dept in Department.objects.all():
            total = Attendance.objects.filter(
                session__classroom__department=dept
            ).count()
            present = Attendance.objects.filter(
                session__classroom__department=dept,
                status='PRESENT'
            ).count()
            result.append({
                'department': dept.name,
                'total': total,
                'present': present,
                'absent': total - present,
            })
        return Response(result)


class ExportAttendanceCSVView(APIView):
    permission_classes = [IsAdminOrTeacher]

    def get(self, request):
        qs = self._get_queryset(request)
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="attendance.csv"'
        writer = csv.writer(response)
        writer.writerow(['Student', 'Email', 'Classroom', 'Department', 'Status', 'Scan Time'])
        for a in qs:
            writer.writerow([
                a.student.name, a.student.email,
                a.session.classroom.name,
                a.session.classroom.department.name,
                a.status, a.scan_time.strftime('%Y-%m-%d %H:%M')
            ])
        return response

    def _get_queryset(self, request):
        qs = Attendance.objects.select_related(
            'student', 'session__classroom__department'
        )
        if request.user.role == 'TEACHER':
            qs = qs.filter(session__created_by=request.user)
        return self._apply_filters(qs, request)

    def _apply_filters(self, qs, request):
        params = request.query_params
        if params.get('department'):
            qs = qs.filter(session__classroom__department_id=params['department'])
        if params.get('classroom'):
            qs = qs.filter(session__classroom_id=params['classroom'])
        if params.get('date_from'):
            qs = qs.filter(scan_time__date__gte=params['date_from'])
        if params.get('date_to'):
            qs = qs.filter(scan_time__date__lte=params['date_to'])
        return qs


class ExportAttendanceExcelView(ExportAttendanceCSVView):
    def get(self, request):
        if not HAS_OPENPYXL:
            return Response({'error': 'openpyxl not installed.'}, status=500)
        qs = self._get_queryset(request)
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = 'Attendance'
        ws.append(['Student', 'Email', 'Classroom', 'Department', 'Status', 'Scan Time'])
        for a in qs:
            ws.append([
                a.student.name, a.student.email,
                a.session.classroom.name,
                a.session.classroom.department.name,
                a.status, a.scan_time.strftime('%Y-%m-%d %H:%M')
            ])
        buf = io.BytesIO()
        wb.save(buf)
        buf.seek(0)
        response = HttpResponse(
            buf.read(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename="attendance.xlsx"'
        return response
