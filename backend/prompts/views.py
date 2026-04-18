import json
import redis

from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User

from .models import Prompt, Tag
from django.conf import settings


# ─── Redis client ─────────────────────────────────────────────────────────────

def get_redis():
    """Return a Redis connection using settings."""
    return redis.Redis(
        host=settings.REDIS_HOST,
        port=settings.REDIS_PORT,
        decode_responses=True,
    )


# ─── Helper ───────────────────────────────────────────────────────────────────

def prompt_to_dict(prompt, view_count=0):
    """Serialize a Prompt model instance to a dict with tags and author."""
    return {
        "id": prompt.id,
        "title": prompt.title,
        "content": prompt.content,
        "complexity": prompt.complexity,
        "created_at": prompt.created_at.isoformat(),
        "tags": [t.name for t in prompt.tags.all()],
        "author": prompt.author.username if prompt.author else None,
        "view_count": view_count,
    }


# ─── Validation ───────────────────────────────────────────────────────────────

def validate_prompt_data(data):
    errors = {}

    title = data.get("title", "").strip()
    content = data.get("content", "").strip()
    complexity_raw = data.get("complexity")

    if len(title) < 3:
        errors["title"] = "Title must be at least 3 characters long."

    if len(content) < 20:
        errors["content"] = "Content must be at least 20 characters long."

    try:
        complexity = int(complexity_raw)
        if not (1 <= complexity <= 10):
            errors["complexity"] = "Complexity must be between 1 and 10."
    except (TypeError, ValueError):
        errors["complexity"] = "Complexity must be a valid integer."
        complexity = None

    tags_raw = data.get("tags", [])
    if not isinstance(tags_raw, list):
        errors["tags"] = "Tags must be a list of strings."

    cleaned = {"title": title, "content": content, "complexity": complexity, "tags": tags_raw}
    return cleaned, errors


# ─── Prompt Views ─────────────────────────────────────────────────────────────

@method_decorator(csrf_exempt, name='dispatch')
class PromptListView(View):
    def get(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({"error": "Authentication required."}, status=401)

        # Show all prompts (shared library)
        prompts = Prompt.objects.all().prefetch_related('tags')
        
        tag_filter = request.GET.get('tag')
        if tag_filter:
            prompts = prompts.filter(tags__name__iexact=tag_filter)
            
        r = get_redis()
        result = []
        for prompt in prompts:
            count = r.get(f"prompt:{prompt.id}:views")
            view_count = int(count) if count else 0
            result.append(prompt_to_dict(prompt, view_count))

        return JsonResponse(result, safe=False, status=200)

    def post(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({"error": "Authentication required."}, status=401)

        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON."}, status=400)

        cleaned, errors = validate_prompt_data(data)
        if errors:
            return JsonResponse({"errors": errors}, status=422)

        prompt = Prompt.objects.create(
            title=cleaned["title"],
            content=cleaned["content"],
            complexity=cleaned["complexity"],
            author=request.user
        )

        for tag_name in cleaned["tags"]:
            tag_name = str(tag_name).strip().lower()
            if tag_name:
                tag, _ = Tag.objects.get_or_create(name=tag_name)
                prompt.tags.add(tag)

        return JsonResponse(prompt_to_dict(prompt), status=201)


@method_decorator(csrf_exempt, name='dispatch')
class PromptDetailView(View):
    def get(self, request, pk):
        if not request.user.is_authenticated:
            return JsonResponse({"error": "Authentication required."}, status=401)

        try:
            prompt = Prompt.objects.get(pk=pk)
        except Prompt.DoesNotExist:
            return JsonResponse({"error": "Not found."}, status=404)

        r = get_redis()
        view_count = r.incr(f"prompt:{prompt.id}:views")

        return JsonResponse(prompt_to_dict(prompt, view_count), status=200)

    def put(self, request, pk):
        if not request.user.is_authenticated:
            return JsonResponse({"error": "Authentication required."}, status=401)

        try:
            prompt = Prompt.objects.get(pk=pk)
        except Prompt.DoesNotExist:
            return JsonResponse({"error": "Not found."}, status=404)
            
        if prompt.author and prompt.author != request.user:
            return JsonResponse({"error": "Permission denied."}, status=403)

        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON."}, status=400)

        cleaned, errors = validate_prompt_data(data)
        if errors:
            return JsonResponse({"errors": errors}, status=422)

        prompt.title = cleaned["title"]
        prompt.content = cleaned["content"]
        prompt.complexity = cleaned["complexity"]
        prompt.save()

        prompt.tags.clear()
        for tag_name in cleaned["tags"]:
            tag_name = str(tag_name).strip().lower()
            if tag_name:
                tag, _ = Tag.objects.get_or_create(name=tag_name)
                prompt.tags.add(tag)

        r = get_redis()
        count = r.get(f"prompt:{prompt.id}:views")
        view_count = int(count) if count else 0

        return JsonResponse(prompt_to_dict(prompt, view_count), status=200)

    def delete(self, request, pk):
        if not request.user.is_authenticated:
            return JsonResponse({"error": "Authentication required."}, status=401)

        try:
            prompt = Prompt.objects.get(pk=pk)
        except Prompt.DoesNotExist:
            return JsonResponse({"error": "Not found."}, status=404)
            
        if prompt.author and prompt.author != request.user:
            return JsonResponse({"error": "Permission denied."}, status=403)

        r = get_redis()
        r.delete(f"prompt:{prompt.id}:views")

        prompt.delete()
        return JsonResponse({"success": True}, status=204)


# ─── Auth Views ───────────────────────────────────────────────────────────────

@method_decorator(csrf_exempt, name='dispatch')
class LoginView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON."}, status=400)
            
        username = data.get("username", "").strip()
        password = data.get("password", "")
        
        if not username or not password:
            return JsonResponse({"error": "Username and password are required."}, status=400)

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return JsonResponse({"success": True, "username": user.username})
        else:
            return JsonResponse({"error": "Invalid username or password."}, status=401)


@method_decorator(csrf_exempt, name='dispatch')
class SignupView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON."}, status=400)
            
        username = data.get("username", "").strip()
        password = data.get("password", "")
        confirm_password = data.get("confirm_password", "")

        errors = {}

        if len(username) < 3:
            errors["username"] = "Username must be at least 3 characters."
        elif User.objects.filter(username=username).exists():
            errors["username"] = "Username already taken. Choose another."

        if len(password) < 6:
            errors["password"] = "Password must be at least 6 characters."

        if password != confirm_password:
            errors["confirm_password"] = "Passwords do not match."

        if errors:
            return JsonResponse({"errors": errors}, status=422)

        user = User.objects.create_user(username=username, password=password)
        login(request, user)
        return JsonResponse({"success": True, "username": user.username}, status=201)

@method_decorator(csrf_exempt, name='dispatch')
class LogoutView(View):
    def post(self, request):
        logout(request)
        return JsonResponse({"success": True})

@method_decorator(csrf_exempt, name='dispatch')
class AuthStatusView(View):
    def get(self, request):
        if request.user.is_authenticated:
            return JsonResponse({"authenticated": True, "username": request.user.username})
        return JsonResponse({"authenticated": False})
