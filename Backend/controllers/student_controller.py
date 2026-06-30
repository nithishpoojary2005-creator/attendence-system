import os
from flask import request, jsonify
from models.student import StudentModel
from models.user import UserModel
from werkzeug.utils import secure_filename

# Ensure upload directory exists
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'static', 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

class StudentController:
    @staticmethod
    def add_student():
        data = request.json or {}
        required = ["name", "roll", "department", "year"]

        if not all(k in data and str(data[k]).strip() for k in required):
            return jsonify({"error": "All fields are required"}), 400

        roll = data["roll"].strip().upper()
        if StudentModel.find_by_roll(roll):
            return jsonify({"error": "Student with this Roll number already exists"}), 409

        # Create student profile
        StudentModel.create_student(
            name=data["name"],
            roll=roll,
            department=data["department"],
            year=data["year"],
            profile_picture=data.get("profile_picture")
        )

        # Automatically provision a login user for the student
        # Email defaults to roll@school.com, password defaults to roll
        email = f"{roll.lower()}@school.com"
        # If user account doesn't exist, create it
        if not UserModel.find_by_roll(roll):
            UserModel.create_user(
                email=email,
                password=roll, # Default password is the roll number
                role="student",
                name=data["name"],
                roll=roll
            )

        return jsonify({"message": "Student created and login account provisioned successfully"}), 201

    @staticmethod
    def get_all_students():
        try:
            students = StudentModel.find_all()
            return jsonify([StudentModel.serialize_student(s) for s in students]), 200
        except Exception as e:
            return jsonify({"error": f"Database error: {str(e)}"}), 500

    @staticmethod
    def filter_students():
        dept = request.args.get("department")
        year = request.args.get("year")
        search = request.args.get("search")

        try:
            students = StudentModel.filter_students(department=dept, year=year, search_query=search)
            return jsonify([StudentModel.serialize_student(s) for s in students]), 200
        except Exception as e:
            return jsonify({"error": f"Failed to filter students: {str(e)}"}), 500

    @staticmethod
    def update_student(roll):
        student = StudentModel.find_by_roll(roll)
        if not student:
            return jsonify({"error": "Student not found"}), 404

        data = request.json or {}
        try:
            StudentModel.update_student(roll, data)
            return jsonify({"message": "Student updated successfully"}), 200
        except Exception as e:
            return jsonify({"error": f"Failed to update student: {str(e)}"}), 500

    @staticmethod
    def delete_student(roll):
        student = StudentModel.find_by_roll(roll)
        if not student:
            return jsonify({"error": "Student not found"}), 404

        try:
            StudentModel.delete_student(roll)
            return jsonify({"message": "Student and all attendance records deleted successfully"}), 200
        except Exception as e:
            return jsonify({"error": f"Failed to delete student: {str(e)}"}), 500

    @staticmethod
    def upload_profile_picture():
        if 'file' not in request.files:
            return jsonify({"error": "No file part in the request"}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected for uploading"}), 400
            
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            # Prefix with timestamp to avoid name collisions
            from datetime import datetime
            timestamp_str = datetime.now().strftime("%Y%m%d%H%M%S")
            unique_filename = f"{timestamp_str}_{filename}"
            
            filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
            file.save(filepath)
            
            # Return relative path for frontend access
            file_url = f"/static/uploads/{unique_filename}"
            return jsonify({
                "message": "File uploaded successfully",
                "file_url": file_url
            }), 200
        else:
            return jsonify({"error": "Allowed file types are png, jpg, jpeg, gif"}), 400
