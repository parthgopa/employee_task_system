from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from config.settings import config

_client = None
_db = None

def get_db():
    global _client, _db
    if _db is None:
        _client = MongoClient(
            config.MONGODB_URI,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
            socketTimeoutMS=10000,
        )
        try:
            _client.admin.command("ping")
            _db = _client[config.DATABASE_NAME]
            _create_indexes(_db)
            print(f"[DB] Connected to MongoDB: {config.DATABASE_NAME}")
        except ConnectionFailure as e:
            print(f"[DB] Connection failed: {e}")
            _db = _client[config.DATABASE_NAME]
    return _db

def _create_indexes(db):
    db.users.create_index("email", unique=True)
    db.tasks.create_index([("userId", 1), ("taskDate", -1)])
    db.tasks.create_index([("userId", 1), ("status", 1)])
    db.tasks.create_index([("userId", 1), ("projectId", 1)])
    db.projects.create_index([("userId", 1), ("status", 1)])
    db.projects.create_index([("userId", 1), ("createdAt", -1)])
    db.daily_goals.create_index([("userId", 1), ("date", 1)], unique=True)

def close_db():
    global _client, _db
    if _client:
        _client.close()
        _client = None
        _db = None
