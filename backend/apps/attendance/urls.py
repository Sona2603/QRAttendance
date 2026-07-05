from django.urls import path
from .views import (
    AttendanceSessionListCreateView, AttendanceSessionDetailView,
    QRScanView, AttendanceListView, AttendanceHistoryView,
    DashboardStatsView, MonthlyAttendanceView, DepartmentAttendanceView,
    ExportAttendanceCSVView, ExportAttendanceExcelView,
)

urlpatterns = [
    path('sessions/', AttendanceSessionListCreateView.as_view(), name='session_list'),
    path('sessions/<int:pk>/', AttendanceSessionDetailView.as_view(), name='session_detail'),
    path('scan/', QRScanView.as_view(), name='scan_qr'),
    path('', AttendanceListView.as_view(), name='attendance_list'),
    path('history/', AttendanceHistoryView.as_view(), name='attendance_history'),
    path('stats/', DashboardStatsView.as_view(), name='dashboard_stats'),
    path('monthly/', MonthlyAttendanceView.as_view(), name='monthly_attendance'),
    path('department-stats/', DepartmentAttendanceView.as_view(), name='dept_attendance'),
    path('export/csv/', ExportAttendanceCSVView.as_view(), name='export_csv'),
    path('export/excel/', ExportAttendanceExcelView.as_view(), name='export_excel'),
]
