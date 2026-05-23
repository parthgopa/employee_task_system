from utils.helpers import utcnow, today_str
from bson import ObjectId

def create_task_doc(user_id, title, description="", priority="medium", task_date=None):
    return {
        "userId": ObjectId(user_id),
        "title": title.strip(),
        "description": description.strip() if description else "",
        "priority": priority,
        "status": "pending",
        "taskDate": task_date or today_str(),
        "createdAt": utcnow(),
        "completedAt": None,
    }
