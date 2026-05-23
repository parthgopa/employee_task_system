"""Admin controller — endpoints for managing employees and viewing their data."""
from flask import request
from bson import ObjectId
from config.database import get_db
from utils.helpers import serialize_doc, serialize_list, success_response, error_response, utcnow, today_str


def get_all_employees():
    """List all employees with their task stats."""
    db = get_db()
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 50))
    search = request.args.get("search", "").strip()
    skip = (page - 1) * limit

    query = {"role": {"$ne": "admin"}}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
        ]

    total = db.users.count_documents(query)
    users = list(
        db.users.find(query, {"password": 0})
        .sort("createdAt", -1)
        .skip(skip)
        .limit(limit)
    )

    employees = []
    for user in users:
        uid = user["_id"]
        total_tasks = db.tasks.count_documents({"userId": uid})
        completed_tasks = db.tasks.count_documents({"userId": uid, "status": "completed"})
        today_tasks = db.tasks.count_documents({"userId": uid, "taskDate": today_str()})
        completion_rate = round((completed_tasks / total_tasks) * 100) if total_tasks > 0 else 0

        emp = serialize_doc(user)
        emp["stats"] = {
            "totalTasks": total_tasks,
            "completedTasks": completed_tasks,
            "todayTasks": today_tasks,
            "completionRate": completion_rate,
        }
        employees.append(emp)

    return success_response({
        "employees": employees,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit,
    })


def get_employee_detail(employee_id):
    """Get employee profile + overall stats."""
    db = get_db()
    try:
        oid = ObjectId(employee_id)
    except Exception:
        return error_response("Invalid employee ID", 422)

    user = db.users.find_one({"_id": oid}, {"password": 0})
    if not user or user.get("role") == "admin":
        return error_response("Employee not found", 404)

    total_tasks = db.tasks.count_documents({"userId": oid})
    completed_tasks = db.tasks.count_documents({"userId": oid, "status": "completed"})
    pending_tasks = total_tasks - completed_tasks
    completion_rate = round((completed_tasks / total_tasks) * 100) if total_tasks > 0 else 0

    high_priority = db.tasks.count_documents({"userId": oid, "priority": "high"})
    medium_priority = db.tasks.count_documents({"userId": oid, "priority": "medium"})
    low_priority = db.tasks.count_documents({"userId": oid, "priority": "low"})

    emp = serialize_doc(user)
    emp["stats"] = {
        "totalTasks": total_tasks,
        "completedTasks": completed_tasks,
        "pendingTasks": pending_tasks,
        "completionRate": completion_rate,
        "priorityBreakdown": {"high": high_priority, "medium": medium_priority, "low": low_priority},
    }
    return success_response(emp)


def get_employee_tasks(employee_id):
    """Get tasks for a specific employee, optionally filtered by date."""
    db = get_db()
    try:
        oid = ObjectId(employee_id)
    except Exception:
        return error_response("Invalid employee ID", 422)

    user = db.users.find_one({"_id": oid})
    if not user or user.get("role") == "admin":
        return error_response("Employee not found", 404)

    date = request.args.get("date", today_str())
    status = request.args.get("status")

    query = {"userId": oid, "taskDate": date}
    if status and status in ("pending", "completed"):
        query["status"] = status

    tasks = list(db.tasks.find(query).sort("createdAt", -1))
    total = len(tasks)
    completed = sum(1 for t in tasks if t["status"] == "completed")

    return success_response({
        "tasks": serialize_list(tasks),
        "date": date,
        "stats": {
            "total": total,
            "completed": completed,
            "pending": total - completed,
            "completionRate": round((completed / total) * 100) if total > 0 else 0,
        },
    })


def get_employee_history(employee_id):
    """Get date-wise history overview for an employee."""
    db = get_db()
    try:
        oid = ObjectId(employee_id)
    except Exception:
        return error_response("Invalid employee ID", 422)

    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 30))

    pipeline = [
        {"$match": {"userId": oid}},
        {"$group": {
            "_id": "$taskDate",
            "total": {"$sum": 1},
            "completed": {"$sum": {"$cond": [{"$eq": ["$status", "completed"]}, 1, 0]}},
        }},
        {"$addFields": {
            "pending": {"$subtract": ["$total", "$completed"]},
            "completion_rate": {"$cond": [
                {"$gt": ["$total", 0]},
                {"$round": [{"$multiply": [{"$divide": ["$completed", "$total"]}, 100]}, 0]},
                0,
            ]},
        }},
        {"$sort": {"_id": -1}},
        {"$skip": (page - 1) * limit},
        {"$limit": limit},
    ]

    dates = list(db.tasks.aggregate(pipeline))
    total_dates = db.tasks.distinct("taskDate", {"userId": oid})

    result = []
    for d in dates:
        result.append({
            "date": d["_id"],
            "total": d["total"],
            "completed": d["completed"],
            "pending": d["pending"],
            "completion_rate": d["completion_rate"],
        })

    return success_response({
        "dates": result,
        "total": len(total_dates),
        "page": page,
    })


def get_admin_dashboard_stats():
    """Overall stats for admin dashboard."""
    db = get_db()
    total_employees = db.users.count_documents({"role": {"$ne": "admin"}})
    total_tasks = db.tasks.count_documents({})
    completed_tasks = db.tasks.count_documents({"status": "completed"})
    today_total = db.tasks.count_documents({"taskDate": today_str()})
    today_completed = db.tasks.count_documents({"taskDate": today_str(), "status": "completed"})

    overall_rate = round((completed_tasks / total_tasks) * 100) if total_tasks > 0 else 0
    today_rate = round((today_completed / today_total) * 100) if today_total > 0 else 0

    top_pipeline = [
        {"$match": {"role": {"$ne": "admin"}}},
        {"$lookup": {
            "from": "tasks",
            "let": {"uid": "$_id"},
            "pipeline": [
                {"$match": {"$expr": {"$eq": ["$userId", "$$uid"]}}},
                {"$group": {"_id": None, "total": {"$sum": 1}, "done": {"$sum": {"$cond": [{"$eq": ["$status", "completed"]}, 1, 0]}}}},
            ],
            "as": "task_stats",
        }},
        {"$addFields": {
            "task_total": {"$ifNull": [{"$arrayElemAt": ["$task_stats.total", 0]}, 0]},
            "task_done":  {"$ifNull": [{"$arrayElemAt": ["$task_stats.done",  0]}, 0]},
        }},
        {"$addFields": {
            "rate": {"$cond": [{"$gt": ["$task_total", 0]}, {"$round": [{"$multiply": [{"$divide": ["$task_done", "$task_total"]}, 100]}, 0]}, 0]},
        }},
        {"$sort": {"rate": -1, "task_done": -1}},
        {"$limit": 5},
        {"$project": {"password": 0, "task_stats": 0}},
    ]
    top_employees = list(db.users.aggregate(top_pipeline))

    return success_response({
        "totalEmployees": total_employees,
        "totalTasks": total_tasks,
        "completedTasks": completed_tasks,
        "pendingTasks": total_tasks - completed_tasks,
        "overallCompletionRate": overall_rate,
        "todayTasks": today_total,
        "todayCompleted": today_completed,
        "todayRate": today_rate,
        "topEmployees": serialize_list(top_employees),
    })
