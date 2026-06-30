from datetime import datetime
from config.db import get_db

class StudentModel:
    @staticmethod
    def create_student(name, roll, department, year, profile_picture=None):
        db = get_db()
        student_doc = {
            "name": name.strip(),
            "roll": roll.strip().upper(),
            "department": department.strip(),
            "year": str(year).strip(),
            "profile_picture": profile_picture,
            "created_at": datetime.now()
        }
        result = db["students"].insert_one(student_doc)
        return result.inserted_id

    @staticmethod
    def find_by_roll(roll):
        db = get_db()
        return db["students"].find_one({"roll": roll.strip().upper()})

    @staticmethod
    def find_all():
        db = get_db()
        return list(db["students"].find())

    @staticmethod
    def filter_students(department=None, year=None, search_query=None):
        db = get_db()
        query = {}
        if department:
            query["department"] = department
        if year:
            query["year"] = str(year)
        if search_query:
            # Case insensitive search on name or roll
            query["$or"] = [
                {"name": {"$regex": search_query, "$options": "i"}},
                {"roll": {"$regex": search_query, "$options": "i"}}
            ]
        return list(db["students"].find(query))

    @staticmethod
    def update_student(roll, update_data):
        db = get_db()
        # Clean data keys
        cleaned_data = {}
        for k in ["name", "department", "year", "profile_picture"]:
            if k in update_data:
                if k == "year":
                    cleaned_data[k] = str(update_data[k]).strip()
                elif isinstance(update_data[k], str):
                    cleaned_data[k] = update_data[k].strip()
                else:
                    cleaned_data[k] = update_data[k]
                    
        result = db["students"].update_one({"roll": roll.strip().upper()}, {"$set": cleaned_data})
        return result.modified_count

    @staticmethod
    def delete_student(roll):
        db = get_db()
        roll_upper = roll.strip().upper()
        # Delete student record
        student_result = db["students"].delete_one({"roll": roll_upper})
        # Delete student attendance records
        db["attendance"].delete_many({"roll": roll_upper})
        # Delete associated login if exists
        db["users"].delete_one({"roll": roll_upper})
        return student_result.deleted_count

    @staticmethod
    def serialize_student(student):
        if not student:
            return None
        return {
            "name": student.get("name"),
            "roll": student.get("roll"),
            "department": student.get("department"),
            "year": student.get("year"),
            "profile_picture": student.get("profile_picture"),
            "created_at": student.get("created_at").isoformat() if isinstance(student.get("created_at"), datetime) else student.get("created_at")
        }
