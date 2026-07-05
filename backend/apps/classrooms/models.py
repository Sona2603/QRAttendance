from django.db import models
from django.conf import settings


class ClassRoom(models.Model):
    name = models.CharField(max_length=150)
    department = models.ForeignKey(
        'departments.Department',
        on_delete=models.CASCADE,
        related_name='classrooms'
    )
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='classrooms',
        limit_choices_to={'role': 'TEACHER'}
    )
    students = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='enrolled_classrooms',
        blank=True,
        limit_choices_to={'role': 'STUDENT'}
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['name', 'department']

    def __str__(self):
        return f'{self.name} - {self.department.name}'
