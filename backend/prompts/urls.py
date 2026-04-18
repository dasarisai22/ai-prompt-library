"""
URL patterns for the prompts app.
"""

from django.urls import path
from .views import PromptListView, PromptDetailView, LoginView, LogoutView, AuthStatusView, SignupView

urlpatterns = [
    path('prompts/', PromptListView.as_view(), name='prompt-list'),
    path('prompts/<int:pk>/', PromptDetailView.as_view(), name='prompt-detail'),
    path('auth/login/', LoginView.as_view(), name='auth-login'),
    path('auth/signup/', SignupView.as_view(), name='auth-signup'),
    path('auth/logout/', LogoutView.as_view(), name='auth-logout'),
    path('auth/status/', AuthStatusView.as_view(), name='auth-status'),
]
