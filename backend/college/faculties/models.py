from django.db import models

# Create your models here.

class Faculty(models.Model):
    name = models.CharField(max_length=100, unique=True, help_text="Faculty name")
    code = models.CharField(max_length=20, unique=True, help_text="Faculty code")
    description = models.TextField(null=True, blank=True, help_text="Faculty description")
    dean = models.CharField(max_length=100, help_text="Name of the faculty dean", null=True, blank=True)
    office_location = models.CharField(max_length=255, help_text="Office location of the faculty", null=True, blank=True)
    is_active = models.BooleanField(default=True, help_text="Is this faculty currently active?")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']
        verbose_name_plural = "Faculties"
