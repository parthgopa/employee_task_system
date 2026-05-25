from flask import g
from bson import ObjectId
from config.database import get_db
from utils.helpers import serialize_list, success_response, error_response, today_str
from datetime import datetime, timezone

def get_overdue_tasks():
    """Get all pending tasks from previous dates (overdue alerts)."""
    db = get_db()
    user_id = g.user_id
    today = today_str()
    
    # Find all pending tasks where taskDate < today
    overdue_tasks = list(db.tasks.find({
        "userId": ObjectId(user_id),
        "status": "pending",
        "taskDate": {"$lt": today}
    }).sort("taskDate", -1))
    
    # Group by date for better organization
    grouped = {}
    for task in overdue_tasks:
        date = task.get("taskDate", "unknown")
        if date not in grouped:
            grouped[date] = []
        grouped[date].append(task)
    
    # Calculate summary stats
    total_overdue = len(overdue_tasks)
    high_priority = sum(1 for t in overdue_tasks if t.get("priority") == "high")
    
    return success_response({
        "tasks": serialize_list(overdue_tasks),
        "groupedByDate": {k: serialize_list(v) for k, v in grouped.items()},
        "summary": {
            "total": total_overdue,
            "highPriority": high_priority,
            "oldestDate": min((t.get("taskDate") for t in overdue_tasks), default=None)
        }
    })

def dismiss_alert(task_id):
    """Mark a task as acknowledged (soft dismiss)."""
    db = get_db()
    user_id = g.user_id
    
    try:
        oid = ObjectId(task_id)
    except Exception:
        return error_response("Invalid task ID", 422)
    
    # Update task to mark as acknowledged
    db.tasks.update_one(
        {"_id": oid, "userId": ObjectId(user_id)},
        {"$set": {"alertAcknowledged": True, "alertAcknowledgedAt": datetime.now(timezone.utc)}}
    )
    
    return success_response(None, "Alert dismissed")

def get_alerts_summary():
    """Quick endpoint for sidebar badge count."""
    db = get_db()
    user_id = g.user_id
    today = today_str()
    
    count = db.tasks.count_documents({
        "userId": ObjectId(user_id),
        "status": "pending",
        "taskDate": {"$lt": today},
        "$or": [
            {"alertAcknowledged": {"$exists": False}},
            {"alertAcknowledged": False}
        ]
    })
    
    has_high_priority = db.tasks.count_documents({
        "userId": ObjectId(user_id),
        "status": "pending",
        "taskDate": {"$lt": today},
        "priority": "high",
        "$or": [
            {"alertAcknowledged": {"$exists": False}},
            {"alertAcknowledged": False}
        ]
    }) > 0
    
    return success_response({
        "count": count,
        "hasHighPriority": has_high_priority,
        "today": today
    })
