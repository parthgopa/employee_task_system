from utils.helpers import utcnow
from bson import ObjectId

def create_project_doc(user_id, name, description="", status="active"):
    return {
        "userId": ObjectId(user_id),
        "name": name.strip(),
        "description": description.strip() if description else "",
        "status": status,  # active, completed, archived
        "createdAt": utcnow(),
        "updatedAt": utcnow(),
    }
