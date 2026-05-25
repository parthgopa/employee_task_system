from flask import request, g
from bson import ObjectId
from pymongo import ReturnDocument
from config.database import get_db
from models.project_model import create_project_doc
from utils.helpers import serialize_doc, serialize_list, success_response, error_response, utcnow

def get_projects():
    """Get all projects for the current user."""
    db = get_db()
    user_id = g.user_id
    status = request.args.get("status", "active")
    
    query = {"userId": ObjectId(user_id)}
    if status != "all":
        query["status"] = status
    
    projects = list(db.projects.find(query).sort("createdAt", -1))
    
    # Get task counts for each project
    for project in projects:
        pid = project["_id"]
        project["taskStats"] = {
            "total": db.tasks.count_documents({"projectId": pid}),
            "notInitiated": db.tasks.count_documents({"projectId": pid, "status": "not_initiated"}),
            "inProgress": db.tasks.count_documents({"projectId": pid, "status": "in_progress"}),
            "completed": db.tasks.count_documents({"projectId": pid, "status": "completed"}),
        }
    
    return success_response(serialize_list(projects))

def get_project(project_id):
    """Get a single project by ID."""
    db = get_db()
    user_id = g.user_id
    
    try:
        oid = ObjectId(project_id)
    except Exception:
        return error_response("Invalid project ID", 422)
    
    project = db.projects.find_one({"_id": oid, "userId": ObjectId(user_id)})
    if not project:
        return error_response("Project not found", 404)
    
    # Get all tasks for this project
    tasks = list(db.tasks.find({"projectId": oid}).sort("createdAt", -1))
    project["tasks"] = serialize_list(tasks)
    
    return success_response(serialize_doc(project))

def create_project():
    """Create a new project."""
    data = request.get_json(silent=True) or {}
    name = str(data.get("name", "")).strip()
    description = str(data.get("description", "")).strip()
    
    if not name:
        return error_response("Project name is required", 422)
    
    db = get_db()
    project_doc = create_project_doc(
        user_id=g.user_id,
        name=name,
        description=description,
    )
    
    result = db.projects.insert_one(project_doc)
    project_doc["_id"] = result.inserted_id
    
    return success_response(serialize_doc(project_doc), "Project created", 201)

def update_project(project_id):
    """Update a project."""
    db = get_db()
    user_id = g.user_id
    
    try:
        oid = ObjectId(project_id)
    except Exception:
        return error_response("Invalid project ID", 422)
    
    project = db.projects.find_one({"_id": oid, "userId": ObjectId(user_id)})
    if not project:
        return error_response("Project not found", 404)
    
    data = request.get_json(silent=True) or {}
    update_fields = {}
    
    if "name" in data:
        if not str(data["name"]).strip():
            return error_response("Project name cannot be empty", 422)
        update_fields["name"] = str(data["name"]).strip()
    if "description" in data:
        update_fields["description"] = str(data.get("description", "")).strip()
    if "status" in data:
        if data["status"] not in ["active", "completed", "archived"]:
            return error_response("Invalid status", 422)
        update_fields["status"] = data["status"]
    
    if not update_fields:
        return error_response("No fields to update", 422)
    
    update_fields["updatedAt"] = utcnow()
    
    updated = db.projects.find_one_and_update(
        {"_id": oid},
        {"$set": update_fields},
        return_document=ReturnDocument.AFTER,
    )
    
    return success_response(serialize_doc(updated), "Project updated")

def delete_project(project_id):
    """Delete a project and optionally its tasks."""
    db = get_db()
    user_id = g.user_id
    
    try:
        oid = ObjectId(project_id)
    except Exception:
        return error_response("Invalid project ID", 422)
    
    project = db.projects.find_one({"_id": oid, "userId": ObjectId(user_id)})
    if not project:
        return error_response("Project not found", 404)
    
    # Option to delete or unassign tasks
    delete_tasks = request.args.get("deleteTasks", "false").lower() == "true"
    
    if delete_tasks:
        db.tasks.delete_many({"projectId": oid})
    else:
        # Unassign tasks from project (make them daily tasks)
        db.tasks.update_many(
            {"projectId": oid},
            {"$set": {"projectId": None}}
        )
    
    db.projects.delete_one({"_id": oid})
    
    return success_response(None, "Project deleted")
