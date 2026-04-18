# Admin registration remains default; no custom admin needed for now
from django.contrib import admin
from .models import Prompt

@admin.register(Prompt)
class PromptAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'complexity', 'created_at')
    list_filter = ('complexity',)
    search_fields = ('title', 'content')
