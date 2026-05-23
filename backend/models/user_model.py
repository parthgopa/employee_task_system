from utils.helpers import utcnow

def create_user_doc(name, email, hashed_password, role="employee"):
    return {
        "name": name.strip(),
        "email": email.lower().strip(),
        "password": hashed_password,
        "role": role,
        "createdAt": utcnow(),
    }
