import bcrypt
from datetime import datetime
from config.db import get_db

class UserModel:
    @staticmethod
    def create_user(email, password, role, name, roll=None):
        db = get_db()
        # Hash password
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
        
        user_doc = {
            "email": email.strip().lower(),
            "password": hashed_password,
            "role": role, # 'admin', 'faculty', 'student'
            "name": name.strip(),
            "created_at": datetime.now()
        }
        if roll:
            user_doc["roll"] = roll.strip().upper()
            
        result = db["users"].insert_one(user_doc)
        return result.inserted_id

    @staticmethod
    def find_by_email(email):
        db = get_db()
        return db["users"].find_one({"email": email.strip().lower()})

    @staticmethod
    def find_by_roll(roll):
        db = get_db()
        return db["users"].find_one({"roll": roll.strip().upper()})

    @staticmethod
    def verify_password(password, hashed_password):
        if not hashed_password or not password:
            return False
        # If password in db is string (for instance, seed values or decoded), encode it
        if isinstance(hashed_password, str):
            hashed_password = hashed_password.encode('utf-8')
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password)

    @staticmethod
    def serialize_user(user):
        if not user:
            return None
        return {
            "id": str(user.get("_id")),
            "email": user.get("email"),
            "role": user.get("role"),
            "name": user.get("name"),
            "roll": user.get("roll"),
            "created_at": user.get("created_at").isoformat() if isinstance(user.get("created_at"), datetime) else user.get("created_at")
        }
