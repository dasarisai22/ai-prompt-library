"""
Prompt model definition.
Maps to the 'prompts_prompt' table in PostgreSQL.
"""

from django.db import models
from django.core.exceptions import ValidationError


def validate_complexity(value):
    """Ensure complexity stays between 1 and 10."""
    if value < 1 or value > 10:
        raise ValidationError(f"Complexity must be between 1 and 10, got {value}.")


from django.contrib.auth.models import User

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    
    def __str__(self):
        return self.name

class Prompt(models.Model):
    """
    Represents an AI image prompt stored in the database.
    Views are tracked in Redis, not here.
    """
    title = models.CharField(max_length=255)
    content = models.TextField()
    complexity = models.IntegerField(validators=[validate_complexity])
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Bonuses:
    tags = models.ManyToManyField(Tag, related_name='prompts', blank=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)

    class Meta:
        ordering = ['-created_at']   # Newest prompts first

    def __str__(self):
        return self.title
