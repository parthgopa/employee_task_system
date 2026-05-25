from flask import request, g
from bson import ObjectId
from pymongo import ReturnDocument
from config.database import get_db
from models.task_model import create_task_doc
from utils.helpers import serialize_doc, serialize_list, success_response, error_response, utcnow, today_str, parse_date
from utils.validators import validate_task

def get_today_tasks():
    db = get_db()
    user_id = g.user_id
    date = today_str()
    # Get daily tasks (no project) + project tasks for today
    tasks = list(db.tasks.find({
        "userId": ObjectId(user_id),
        "taskDate": date
    }).sort("createdAt", 1))
    return success_response(serialize_list(tasks))

def get_tasks_by_date(date):
    parsed = parse_date(date)
    if not parsed:
        return error_response("Invalid date format. Use YYYY-MM-DD", 422)
    db = get_db()
    user_id = g.user_id
    query = {"userId": ObjectId(user_id), "taskDate": date}
    
    # Filter by project if provided
    project_id = request.args.get("projectId")
    if project_id:
        if project_id == "null":
            query["projectId"] = None
        else:
            try:
                query["projectId"] = ObjectId(project_id)
            except:
                return error_response("Invalid project ID", 422)
    
    tasks = list(db.tasks.find(query).sort("createdAt", 1))
    return success_response(serialize_list(tasks))

def create_task():
    data = request.get_json(silent=True) or {}
    errors = validate_task(data)
    if errors:
        return error_response("Validation failed", 422, errors)

    db = get_db()
    task_doc = create_task_doc(
        user_id=g.user_id,
        title=data["title"],
        description=data.get("description", ""),
        priority=data.get("priority", "medium"),
        task_date=data.get("taskDate", today_str()),
        project_id=data.get("projectId"),
    )
    result = db.tasks.insert_one(task_doc)
    task_doc["_id"] = result.inserted_id
    return success_response(serialize_doc(task_doc), "Task created", 201)

def update_task(task_id):
    db = get_db()
    user_id = g.user_id
    try:
        oid = ObjectId(task_id)
    except Exception:
        return error_response("Invalid task ID", 422)

    task = db.tasks.find_one({"_id": oid, "userId": ObjectId(user_id)})
    if not task:
        return error_response("Task not found", 404)

    data = request.get_json(silent=True) or {}
    update_fields = {}

    if "title" in data:
        if not str(data["title"]).strip():
            return error_response("Title cannot be empty", 422)
        update_fields["title"] = str(data["title"]).strip()
    if "description" in data:
        update_fields["description"] = str(data["description"]).strip()
    if "priority" in data:
        if data["priority"] not in ["low", "medium", "high"]:
            return error_response("Invalid priority", 422)
        update_fields["priority"] = data["priority"]
    if "status" in data:
        if data["status"] not in ["not_initiated", "in_progress", "completed"]:
            return error_response("Invalid status", 422)
        update_fields["status"] = data["status"]
        if data["status"] == "completed" and task.get("status") != "completed":
            update_fields["completedAt"] = utcnow()
        elif data["status"] in ["not_initiated", "in_progress"]:
            update_fields["completedAt"] = None

    if not update_fields:
        return error_response("No fields to update", 422)

    updated = db.tasks.find_one_and_update(
        {"_id": oid}, {"$set": update_fields}, return_document=ReturnDocument.AFTER
    )
    return success_response(serialize_doc(updated), "Task updated")

def delete_task(task_id):
    db = get_db()
    user_id = g.user_id
    try:
        oid = ObjectId(task_id)
    except Exception:
        return error_response("Invalid task ID", 422)

    result = db.tasks.delete_one({"_id": oid, "userId": ObjectId(user_id)})
    if result.deleted_count == 0:
        return error_response("Task not found", 404)
    return success_response(None, "Task deleted")

def update_task_status(task_id):
    """Update task status with explicit state."""
    db = get_db()
    user_id = g.user_id
    try:
        oid = ObjectId(task_id)
    except Exception:
        return error_response("Invalid task ID", 422)

    task = db.tasks.find_one({"_id": oid, "userId": ObjectId(user_id)}, {"status": 1})
    if not task:
        return error_response("Task not found", 404)

    data = request.get_json(silent=True) or {}
    new_status = data.get("status")
    
    if new_status not in ["not_initiated", "in_progress", "completed"]:
        return error_response("Invalid status. Must be: not_initiated, in_progress, completed", 422)
    
    update = {"status": new_status}
    if new_status == "completed":
        update["completedAt"] = utcnow()
    else:
        update["completedAt"] = None

    updated = db.tasks.find_one_and_update(
        {"_id": oid},
        {"$set": update},
        return_document=ReturnDocument.AFTER,
    )
    return success_response(serialize_doc(updated), "Status updated")

def get_tasks_by_project(project_id):
    """Get all tasks for a specific project."""
    db = get_db()
    user_id = g.user_id
    
    try:
        oid = ObjectId(project_id)
    except Exception:
        return error_response("Invalid project ID", 422)
    
    # Verify project exists and belongs to user
    project = db.projects.find_one({"_id": oid, "userId": ObjectId(user_id)})
    if not project:
        return error_response("Project not found", 404)
    
    # Get all tasks for this project
    tasks = list(db.tasks.find({"projectId": oid, "userId": ObjectId(user_id)}).sort("taskDate", -1))
    return success_response(serialize_list(tasks))
