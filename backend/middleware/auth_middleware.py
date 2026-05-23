import jwt
from functools import wraps
from flask import request, g
from config.settings import config
from config.database import get_db
from bson import ObjectId
from utils.helpers import error_response

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return error_response("Authentication token missing", 401)
        token = auth_header.split(" ", 1)[1]
        try:
            payload = jwt.decode(token, config.JWT_SECRET, algorithms=["HS256"])
            db = get_db()
            user = db.users.find_one({"_id": ObjectId(payload["user_id"])})
            if not user:
                return error_response("User not found", 401)
            g.current_user = user
            g.user_id = str(user["_id"])
        except jwt.ExpiredSignatureError:
            return error_response("Token has expired", 401)
        except jwt.InvalidTokenError:
            return error_response("Invalid token", 401)
        except Exception as e:
            return error_response("Authentication failed", 401)
        return f(*args, **kwargs)
    return decorated

def admin_required(f):
    """Decorator that requires the user to be authenticated AND have admin role."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return error_response("Authentication token missing", 401)
        token = auth_header.split(" ", 1)[1]
        try:
            payload = jwt.decode(token, config.JWT_SECRET, algorithms=["HS256"])
            db = get_db()
            user = db.users.find_one({"_id": ObjectId(payload["user_id"])})
            if not user:
                return error_response("User not found", 401)
            if user.get("role") != "admin":
                return error_response("Admin access required", 403)
            g.current_user = user
            g.user_id = str(user["_id"])
        except jwt.ExpiredSignatureError:
            return error_response("Token has expired", 401)
        except jwt.InvalidTokenError:
            return error_response("Invalid token", 401)
        except Exception:
            return error_response("Authentication failed", 401)
        return f(*args, **kwargs)
    return decorated
