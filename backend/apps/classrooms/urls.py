from django.urls import path
from .views import ClassRoomListCreateView, ClassRoomDetailView, add_student_to_class, remove_student_from_class

urlpatterns = [
    path('', ClassRoomListCreateView.as_view(), name='classroom_list'),
    path('<int:pk>/', ClassRoomDetailView.as_view(), name='classroom_detail'),
    path('<int:pk>/add-student/', add_student_to_class, name='add_student'),
    path('<int:pk>/remove-student/<int:student_id>/', remove_student_from_class, name='remove_student'),
]
