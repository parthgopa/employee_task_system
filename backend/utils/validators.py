import re

def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

def validate_password(password):
    if not password or len(password) < 6:
        return False, "Password must be at least 6 characters"
    return True, None

def validate_task(data):
    errors = {}
    if not data.get("title") or not str(data["title"]).strip():
        errors["title"] = "Title is required"
    elif len(str(data["title"])) > 200:
        errors["title"] = "Title must be under 200 characters"
    priority = data.get("priority", "medium")
    if priority not in ["low", "medium", "high"]:
        errors["priority"] = "Priority must be low, medium, or high"
    return errors

def validate_goal(data):
    errors = {}
    if not data.get("goal") or not str(data["goal"]).strip():
        errors["goal"] = "Goal description is required"
    elif len(str(data["goal"])) > 500:
        errors["goal"] = "Goal must be under 500 characters"
    return errors
