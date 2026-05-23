import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from flask import request, jsonify
from config.database import get_db
from config.settings import config
from models.user_model import create_user_doc
from utils.helpers import serialize_doc, success_response, error_response
from utils.validators import validate_email, validate_password

def register():
    data = request.get_json(silent=True) or {}
    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))
    role = data.get("role", "employee")

    if not name or len(name) < 2:
        return error_response("Name must be at least 2 characters", 422)
    if not validate_email(email):
        return error_response("Invalid email address", 422)
    valid, msg = validate_password(password)
    if not valid:
        return error_response(msg, 422)

    db = get_db()
    if db.users.find_one({"email": email}):
        return error_response("Email already registered", 409)

    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    user_doc = create_user_doc(name, email, hashed, role)
    result = db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id

    token = _generate_token(str(result.inserted_id))
    user_data = serialize_doc(user_doc)
    user_data.pop("password", None)

    return success_response({"token": token, "user": user_data}, "Registration successful", 201)

def login():
    data = request.get_json(silent=True) or {}
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))

    if not email or not password:
        return error_response("Email and password are required", 422)

    db = get_db()
    user = db.users.find_one({"email": email})
    if not user:
        return error_response("Invalid credentials", 401)

    if not bcrypt.checkpw(password.encode("utf-8"), user["password"].encode("utf-8")):
        return error_response("Invalid credentials", 401)

    token = _generate_token(str(user["_id"]))
    user_data = serialize_doc(user)
    user_data.pop("password", None)

    return success_response({"token": token, "user": user_data}, "Login successful")

def get_me():
    from flask import g
    user_data = serialize_doc(g.current_user)
    user_data.pop("password", None)
    return success_response(user_data)

def update_profile():
    from flask import g
    data = request.get_json(silent=True) or {}
    name = str(data.get("name", "")).strip()
    if not name or len(name) < 2:
        return error_response("Name must be at least 2 characters", 422)
    db = get_db()
    db.users.update_one({"_id": g.current_user["_id"]}, {"$set": {"name": name}})
    user = db.users.find_one({"_id": g.current_user["_id"]})
    user_data = serialize_doc(user)
    user_data.pop("password", None)
    return success_response(user_data, "Profile updated")

def change_password():
    from flask import g
    data = request.get_json(silent=True) or {}
    current_pw = str(data.get("currentPassword", ""))
    new_pw = str(data.get("newPassword", ""))
    if not current_pw or not new_pw:
        return error_response("Both current and new password are required", 422)
    if len(new_pw) < 6:
        return error_response("New password must be at least 6 characters", 422)
    user = g.current_user
    if not bcrypt.checkpw(current_pw.encode("utf-8"), user["password"].encode("utf-8")):
        return error_response("Current password is incorrect", 401)
    hashed = bcrypt.hashpw(new_pw.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    db = get_db()
    db.users.update_one({"_id": user["_id"]}, {"$set": {"password": hashed}})
    return success_response(None, "Password changed successfully")

def _generate_token(user_id):
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=config.JWT_EXPIRY_HOURS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, config.JWT_SECRET, algorithm="HS256")
