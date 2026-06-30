from flask import request, jsonify
from models.user import UserModel
from models.student import StudentModel
from middleware.auth_middleware import generate_token
from config.db import get_db

class AuthController:
    @staticmethod
    def seed_admin():
        db = get_db()
        admin = UserModel.find_by_email("admin@example.com")
        if not admin:
            UserModel.create_user(
                email="admin@example.com",
                password="admin123",
                role="admin",
                name="System Administrator"
            )
            print("👤 Default Admin account seeded successfully (admin@example.com / admin123)")
        
        # Optionally seed a test faculty
        faculty = UserModel.find_by_email("faculty@example.com")
        if not faculty:
            UserModel.create_user(
                email="faculty@example.com",
                password="faculty123",
                role="faculty",
                name="Dr. Jane Smith"
            )
            print("👤 Default Faculty account seeded successfully (faculty@example.com / faculty123)")

    @staticmethod
    def register():
        data = request.json or {}
        email = data.get("email")
        password = data.get("password")
        role = data.get("role", "student")
        name = data.get("name")
        roll = data.get("roll")

        if role == "student" and not roll:
            return jsonify({"error": "Roll number is required for students"}), 400
            
        if not email or not password or not name:
            return jsonify({"error": "Email, password, and name are required"}), 400

        # Check existing user
        if UserModel.find_by_email(email):
            return jsonify({"error": "User with this email already exists"}), 409

        if roll and UserModel.find_by_roll(roll):
            return jsonify({"error": "User with this roll number already exists"}), 409

        try:
            user_id = UserModel.create_user(email, password, role, name, roll)
            return jsonify({"message": "User registered successfully", "user_id": str(user_id)}), 201
        except Exception as e:
            return jsonify({"error": f"Failed to register user: {str(e)}"}), 500

    @staticmethod
    def login():
        data = request.json or {}
        login_id = data.get("email") or data.get("roll") # User can enter email or roll
        password = data.get("password")

        if not login_id or not password:
            return jsonify({"error": "Username/Email/Roll and Password are required"}), 400

        login_id = login_id.strip()
        user = None

        # Try finding by email
        if "@" in login_id:
            user = UserModel.find_by_email(login_id)
        else:
            # Try finding by roll number
            user = UserModel.find_by_roll(login_id)
            if not user:
                # Try finding by email directly anyway
                user = UserModel.find_by_email(login_id)

        if not user or not UserModel.verify_password(password, user.get("password")):
            return jsonify({"error": "Invalid email/roll number or password"}), 401

        # Generate token
        token = generate_token(
            user_id=str(user["_id"]),
            role=user["role"],
            name=user["name"],
            email=user.get("email"),
            roll=user.get("roll")
        )

        return jsonify({
            "message": "Login successful",
            "token": token,
            "user": UserModel.serialize_user(user)
        }), 200

    @staticmethod
    def get_me():
        # Accessible if token is valid
        user_info = getattr(request, "user_info", None)
        if not user_info:
            return jsonify({"error": "Unauthorized"}), 401
            
        db = get_db()
        # Find fresh user from database
        user = db["users"].find_one({"email": user_info.get("email")}) if user_info.get("email") else db["users"].find_one({"roll": user_info.get("roll")})
        
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        return jsonify(UserModel.serialize_user(user)), 200

    @staticmethod
    def change_password():
        user_info = getattr(request, "user_info", None)
        if not user_info:
            return jsonify({"error": "Unauthorized"}), 401
            
        data = request.json or {}
        old_password = data.get("old_password")
        new_password = data.get("new_password")

        if not old_password or not new_password:
            return jsonify({"error": "Current and new passwords are required"}), 400

        db = get_db()
        # Find user
        user = db["users"].find_one({"email": user_info.get("email")}) if user_info.get("email") else db["users"].find_one({"roll": user_info.get("roll")})
        
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Verify old password
        import bcrypt
        if not UserModel.verify_password(old_password, user.get("password")):
            return jsonify({"error": "Incorrect current password"}), 400

        # Hash new password
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), salt)

        # Update in database
        db["users"].update_one({"_id": user["_id"]}, {"$set": {"password": hashed_password}})
        return jsonify({"message": "Password changed successfully"}), 200

