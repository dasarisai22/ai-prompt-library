"""
Main URL configuration for ai_prompt_library project.
"""

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # All prompt-related endpoints are handled by the prompts app
    path('', include('prompts.urls')),
]
