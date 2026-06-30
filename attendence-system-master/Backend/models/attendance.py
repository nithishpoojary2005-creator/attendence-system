from datetime import datetime
from config.db import get_db

class AttendanceModel:
    @staticmethod
    def mark_attendance(records):
        db = get_db()
        success_count = 0
        timestamp_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        for r in records:
            roll = r.get("roll").strip().upper()
            date = r.get("date")
            status = r.get("status", "Absent")
            subject = r.get("subject", "").strip()
            
            # Ensure student exists
            student = db["students"].find_one({"roll": roll})
            if not student:
                continue
                
            match = {
                "roll": roll,
                "date": date,
                "subject": subject
            }
            
            attendance_data = {
                "name": student.get("name"),
                "roll": roll,
                "department": student.get("department"),
                "year": student.get("year"),
                "date": date,
                "subject": subject,
                "status": status,
                "timestamp": timestamp_str
            }
            
            # Upsert record (insert or update)
            db["attendance"].update_one(match, {"$set": attendance_data}, upsert=True)
            success_count += 1
            
        return success_count

    @staticmethod
    def find_records(roll=None, year=None, department=None, subject=None, date=None, start_date=None, end_date=None):
        db = get_db()
        query = {}
        
        if roll:
            query["roll"] = roll.strip().upper()
        if year:
            query["year"] = str(year)
        if department:
            query["department"] = department
        if subject:
            query["subject"] = {"$regex": f"^{subject}$", "$options": "i"}
        if date:
            query["date"] = date
        elif start_date and end_date:
            query["date"] = {"$gte": start_date, "$lte": end_date}
            
        return list(db["attendance"].find(query).sort([("date", -1), ("roll", 1)]))

    @staticmethod
    def get_summary_by_roll(roll, year=None):
        db = get_db()
        roll_upper = roll.strip().upper()
        
        # Verify student
        student = db["students"].find_one({"roll": roll_upper})
        if not student:
            return None
            
        query = {"roll": roll_upper}
        if year:
            query["year"] = str(year)
            
        records = list(db["attendance"].find(query))
        
        total = len(records)
        present = sum(1 for r in records if r.get("status") == "Present")
        absent = total - present
        percentage = round((present / total) * 100, 2) if total > 0 else 0.0
        
        return {
            "name": student.get("name"),
            "roll": roll_upper,
            "department": student.get("department"),
            "year": year or student.get("year"),
            "total_days": total,
            "present": present,
            "absent": absent,
            "attendance_percentage": percentage
        }

    @staticmethod
    def get_subject_wise_summary(roll):
        db = get_db()
        roll_upper = roll.strip().upper()
        
        query = {"roll": roll_upper}
        records = list(db["attendance"].find(query))
        
        subject_groups = {}
        for r in records:
            subject = r.get("subject", "General") or "General"
            if subject not in subject_groups:
                subject_groups[subject] = []
            subject_groups[subject].append(r)
            
        result = []
        for subj, recs in subject_groups.items():
            total = len(recs)
            present = sum(1 for r in recs if r.get("status") == "Present")
            absent = total - present
            percentage = round((present / total) * 100, 2) if total > 0 else 0.0
            
            result.append({
                "subject": subj,
                "total_days": total,
                "present": present,
                "absent": absent,
                "attendance_percentage": percentage
            })
            
        return result

    @staticmethod
    def serialize_record(record):
        if not record:
            return None
        return {
            "name": record.get("name"),
            "roll": record.get("roll"),
            "department": record.get("department"),
            "year": record.get("year"),
            "date": record.get("date"),
            "subject": record.get("subject"),
            "status": record.get("status"),
            "timestamp": record.get("timestamp")
        }
