from django.db import models

class Drawing(models.Model):
    title = models.CharField(max_length=255)
    canvas_data = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)