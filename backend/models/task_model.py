from utils.helpers import utcnow, today_str
from bson import ObjectId

def create_task_doc(user_id, title, description="", priority="medium", task_date=None, project_id=None):
    return {
        "userId": ObjectId(user_id),
        "title": title.strip(),
        "description": description.strip() if description else "",
        "priority": priority,
        "status": "not_initiated",  # not_initiated, in_progress, completed
        "taskDate": task_date or today_str(),
        "projectId": ObjectId(project_id) if project_id else None,
        "createdAt": utcnow(),
        "completedAt": None,
    }
