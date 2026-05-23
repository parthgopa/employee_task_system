from flask import request, g
from bson import ObjectId
from config.database import get_db
from utils.helpers import serialize_doc, serialize_list, success_response, error_response, parse_date, today_str
from datetime import datetime, timezone, timedelta

def get_history_by_date(date):
    if not parse_date(date):
        return error_response("Invalid date format. Use YYYY-MM-DD", 422)
    db = get_db()
    user_id = g.user_id
    tasks = list(db.tasks.find({"userId": ObjectId(user_id), "taskDate": date}).sort("createdAt", 1))
    goal = db.daily_goals.find_one({"userId": ObjectId(user_id), "date": date})

    total = len(tasks)
    completed = sum(1 for t in tasks if t.get("status") == "completed")
    pending = total - completed

    return success_response({
        "date": date,
        "tasks": serialize_list(tasks),
        "goal": serialize_doc(goal),
        "stats": {
            "total": total,
            "completed": completed,
            "pending": pending,
            "completion_rate": round((completed / total * 100), 1) if total > 0 else 0,
        }
    })

def get_history_dates():
    """Return all dates that have tasks for the current user (for calendar)."""
    db = get_db()
    user_id = g.user_id
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 30))
    skip = (page - 1) * limit

    pipeline = [
        {"$match": {"userId": ObjectId(user_id)}},
        {"$group": {
            "_id": "$taskDate",
            "total": {"$sum": 1},
            "completed": {"$sum": {"$cond": [{"$eq": ["$status", "completed"]}, 1, 0]}},
        }},
        {"$sort": {"_id": -1}},
        {"$skip": skip},
        {"$limit": limit},
    ]
    results = list(db.tasks.aggregate(pipeline))
    dates = [
        {
            "date": r["_id"],
            "total": r["total"],
            "completed": r["completed"],
            "pending": r["total"] - r["completed"],
            "completion_rate": round((r["completed"] / r["total"] * 100), 1) if r["total"] > 0 else 0,
        }
        for r in results
    ]
    total_count = db.tasks.distinct("taskDate", {"userId": ObjectId(user_id)})
    return success_response({
        "dates": dates,
        "total": len(total_count),
        "page": page,
        "limit": limit,
    })
