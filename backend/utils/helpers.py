from bson import ObjectId
from datetime import datetime, timezone

def serialize_doc(doc):
    """Convert MongoDB document to JSON-serializable dict."""
    if doc is None:
        return None
    result = {}
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            result[key] = str(value)
        elif isinstance(value, datetime):
            result[key] = value.isoformat().replace("+00:00", "Z") if value.tzinfo else value.isoformat() + "Z"
        elif isinstance(value, list):
            result[key] = [serialize_doc(v) if isinstance(v, dict) else (str(v) if isinstance(v, ObjectId) else v) for v in value]
        elif isinstance(value, dict):
            result[key] = serialize_doc(value)
        else:
            result[key] = value
    return result

def serialize_list(docs):
    return [serialize_doc(d) for d in docs]

def utcnow():
    return datetime.now(timezone.utc)

def today_str():
    return utcnow().strftime("%Y-%m-%d")

def parse_date(date_str):
    """Parse YYYY-MM-DD string to datetime."""
    try:
        return datetime.strptime(date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
    except (ValueError, TypeError):
        return None

def success_response(data=None, message="Success", status_code=200):
    resp = {"success": True, "message": message}
    if data is not None:
        resp["data"] = data
    return resp, status_code

def error_response(message="An error occurred", status_code=400, errors=None):
    resp = {"success": False, "message": message}
    if errors:
        resp["errors"] = errors
    return resp, status_code
