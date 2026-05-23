from flask import request, g
from bson import ObjectId
from config.database import get_db
from models.goal_model import create_goal_doc
from utils.helpers import serialize_doc, success_response, error_response, utcnow, today_str, parse_date
from utils.validators import validate_goal

def get_today_goal():
    db = get_db()
    goal = db.daily_goals.find_one({"userId": ObjectId(g.user_id), "date": today_str()})
    return success_response(serialize_doc(goal))

def get_goal_by_date(date):
    if not parse_date(date):
        return error_response("Invalid date format. Use YYYY-MM-DD", 422)
    db = get_db()
    goal = db.daily_goals.find_one({"userId": ObjectId(g.user_id), "date": date})
    return success_response(serialize_doc(goal))

def upsert_goal():
    data = request.get_json(silent=True) or {}
    errors = validate_goal(data)
    if errors:
        return error_response("Validation failed", 422, errors)

    db = get_db()
    user_id = g.user_id
    date = data.get("date", today_str())

    existing = db.daily_goals.find_one({"userId": ObjectId(user_id), "date": date})
    if existing:
        update_fields = {
            "goal": str(data["goal"]).strip(),
            "notes": str(data.get("notes", "")).strip(),
            "updatedAt": utcnow(),
        }
        if "completed" in data:
            update_fields["completed"] = bool(data["completed"])
        db.daily_goals.update_one({"_id": existing["_id"]}, {"$set": update_fields})
        updated = db.daily_goals.find_one({"_id": existing["_id"]})
        return success_response(serialize_doc(updated), "Goal updated")
    else:
        goal_doc = create_goal_doc(user_id, data["goal"], date, data.get("notes", ""))
        result = db.daily_goals.insert_one(goal_doc)
        goal_doc["_id"] = result.inserted_id
        return success_response(serialize_doc(goal_doc), "Goal created", 201)

def update_goal(goal_id):
    db = get_db()
    try:
        oid = ObjectId(goal_id)
    except Exception:
        return error_response("Invalid goal ID", 422)

    goal = db.daily_goals.find_one({"_id": oid, "userId": ObjectId(g.user_id)})
    if not goal:
        return error_response("Goal not found", 404)

    data = request.get_json(silent=True) or {}
    update_fields = {"updatedAt": utcnow()}

    if "goal" in data:
        if not str(data["goal"]).strip():
            return error_response("Goal cannot be empty", 422)
        update_fields["goal"] = str(data["goal"]).strip()
    if "completed" in data:
        update_fields["completed"] = bool(data["completed"])
    if "notes" in data:
        update_fields["notes"] = str(data["notes"]).strip()

    db.daily_goals.update_one({"_id": oid}, {"$set": update_fields})
    updated = db.daily_goals.find_one({"_id": oid})
    return success_response(serialize_doc(updated), "Goal updated")
