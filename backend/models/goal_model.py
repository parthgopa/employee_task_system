from utils.helpers import utcnow, today_str
from bson import ObjectId

def create_goal_doc(user_id, goal, date=None, notes=""):
    return {
        "userId": ObjectId(user_id),
        "date": date or today_str(),
        "goal": goal.strip(),
        "completed": False,
        "notes": notes.strip() if notes else "",
        "createdAt": utcnow(),
        "updatedAt": utcnow(),
    }
