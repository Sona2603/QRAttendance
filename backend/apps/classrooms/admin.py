from django.contrib import admin
from .models import ClassRoom

@admin.register(ClassRoom)
class ClassRoomAdmin(admin.ModelAdmin):
    list_display = ['name', 'department', 'teacher', 'created_at']
    list_filter = ['department']
    search_fields = ['name']
    filter_horizontal = ['students']
