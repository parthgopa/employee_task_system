"""Seed script to create an admin user. Run once: python seed_admin.py"""
import bcrypt
from dotenv import load_dotenv
load_dotenv()

from config.database import get_db
from utils.helpers import utcnow

ADMIN_NAME  = "Admin"
ADMIN_EMAIL = "admin@taskflow.com"
ADMIN_PASS  = "Admin@123"

def main():
    db = get_db()
    if db.users.find_one({"email": ADMIN_EMAIL}):
        print(f"Admin user already exists: {ADMIN_EMAIL}")
        return

    hashed = bcrypt.hashpw(ADMIN_PASS.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    db.users.insert_one({
        "name": ADMIN_NAME,
        "email": ADMIN_EMAIL,
        "password": hashed,
        "role": "admin",
        "createdAt": utcnow(),
    })
    print(f"Admin user created: {ADMIN_EMAIL} / {ADMIN_PASS}")

if __name__ == "__main__":
    main()
