"""
WSGI config for ai_prompt_library project.
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ai_prompt_library.settings')

application = get_wsgi_application()
