from flask import request, g
from bson import ObjectId
from config.database import get_db
from utils.helpers import success_response, error_response, utcnow
from datetime import datetime, timezone, timedelta

def _date_range(days_back):
    today = utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    dates = []
    for i in range(days_back - 1, -1, -1):
        d = today - timedelta(days=i)
        dates.append(d.strftime("%Y-%m-%d"))
    return dates

def get_weekly_analytics():
    db = get_db()
    user_id = g.user_id
    dates = _date_range(7)

    pipeline = [
        {"$match": {"userId": ObjectId(user_id), "taskDate": {"$in": dates}}},
        {"$group": {
            "_id": "$taskDate",
            "total": {"$sum": 1},
            "completed": {"$sum": {"$cond": [{"$eq": ["$status", "completed"]}, 1, 0]}},
        }},
    ]
    results = {r["_id"]: r for r in db.tasks.aggregate(pipeline)}

    chart_data = []
    for d in dates:
        r = results.get(d, {"total": 0, "completed": 0})
        chart_data.append({
            "date": d,
            "total": r["total"],
            "completed": r["completed"],
            "pending": r["total"] - r["completed"],
            "completion_rate": round((r["completed"] / r["total"] * 100), 1) if r["total"] > 0 else 0,
        })

    total_tasks = sum(d["total"] for d in chart_data)
    total_completed = sum(d["completed"] for d in chart_data)

    return success_response({
        "period": "weekly",
        "chart": chart_data,
        "summary": {
            "total_tasks": total_tasks,
            "completed": total_completed,
            "pending": total_tasks - total_completed,
            "avg_completion_rate": round((total_completed / total_tasks * 100), 1) if total_tasks > 0 else 0,
        }
    })

def get_monthly_analytics():
    db = get_db()
    user_id = g.user_id
    dates = _date_range(30)

    pipeline = [
        {"$match": {"userId": ObjectId(user_id), "taskDate": {"$in": dates}}},
        {"$group": {
            "_id": "$taskDate",
            "total": {"$sum": 1},
            "completed": {"$sum": {"$cond": [{"$eq": ["$status", "completed"]}, 1, 0]}},
        }},
    ]
    results = {r["_id"]: r for r in db.tasks.aggregate(pipeline)}

    chart_data = []
    for d in dates:
        r = results.get(d, {"total": 0, "completed": 0})
        chart_data.append({
            "date": d,
            "total": r["total"],
            "completed": r["completed"],
            "pending": r["total"] - r["completed"],
            "completion_rate": round((r["completed"] / r["total"] * 100), 1) if r["total"] > 0 else 0,
        })

    total_tasks = sum(d["total"] for d in chart_data)
    total_completed = sum(d["completed"] for d in chart_data)

    return success_response({
        "period": "monthly",
        "chart": chart_data,
        "summary": {
            "total_tasks": total_tasks,
            "completed": total_completed,
            "pending": total_tasks - total_completed,
            "avg_completion_rate": round((total_completed / total_tasks * 100), 1) if total_tasks > 0 else 0,
        }
    })

def get_overall_stats():
    db = get_db()
    user_id = g.user_id

    total = db.tasks.count_documents({"userId": ObjectId(user_id)})
    completed = db.tasks.count_documents({"userId": ObjectId(user_id), "status": "completed"})
    pending = total - completed

    streak = _calculate_streak(db, user_id)

    priority_pipeline = [
        {"$match": {"userId": ObjectId(user_id)}},
        {"$group": {"_id": "$priority", "count": {"$sum": 1}}},
    ]
    priority_data = {r["_id"]: r["count"] for r in db.tasks.aggregate(priority_pipeline)}

    return success_response({
        "total_tasks": total,
        "completed": completed,
        "pending": pending,
        "completion_rate": round((completed / total * 100), 1) if total > 0 else 0,
        "streak": streak,
        "priority_breakdown": {
            "high": priority_data.get("high", 0),
            "medium": priority_data.get("medium", 0),
            "low": priority_data.get("low", 0),
        }
    })

def _calculate_streak(db, user_id):
    today = utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    streak = 0
    current = today
    for _ in range(365):
        date_str = current.strftime("%Y-%m-%d")
        count = db.tasks.count_documents({"userId": ObjectId(user_id), "taskDate": date_str, "status": "completed"})
        if count > 0:
            streak += 1
            current -= timedelta(days=1)
        else:
            if current == today:
                current -= timedelta(days=1)
                continue
            break
    return streak
