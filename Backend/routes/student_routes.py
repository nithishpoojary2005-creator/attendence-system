from flask import Blueprint
from controllers.student_controller import StudentController
from middleware.auth_middleware import token_required

student_bp = Blueprint("student", __name__)

@student_bp.route("/student/add", methods=["POST"])
@token_required(allowed_roles=["admin", "faculty"])
def add_student():
    return StudentController.add_student()

@student_bp.route("/students", methods=["GET"])
@token_required(allowed_roles=["admin", "faculty", "student"])
def get_all_students():
    return StudentController.get_all_students()

@student_bp.route("/students/filter", methods=["GET"])
@token_required(allowed_roles=["admin", "faculty", "student"])
def filter_students():
    return StudentController.filter_students()

@student_bp.route("/student/update/<roll>", methods=["PUT"])
@token_required(allowed_roles=["admin"])
def update_student(roll):
    return StudentController.update_student(roll)

@student_bp.route("/student/delete/<roll>", methods=["DELETE"])
@token_required(allowed_roles=["admin"])
def delete_student(roll):
    return StudentController.delete_student(roll)

@student_bp.route("/student/upload-pic", methods=["POST"])
@token_required(allowed_roles=["admin", "faculty", "student"])
def upload_profile_picture():
    return StudentController.upload_profile_picture()
