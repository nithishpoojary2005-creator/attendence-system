from flask import Blueprint
from controllers.attendance_controller import AttendanceController
from middleware.auth_middleware import token_required

attendance_bp = Blueprint("attendance", __name__)

@attendance_bp.route("/attendance/bulk", methods=["POST"])
@token_required(allowed_roles=["admin", "faculty"])
def mark_attendance():
    return AttendanceController.mark_attendance()

@attendance_bp.route("/attendance/report", methods=["GET"])
@token_required(allowed_roles=["admin", "faculty", "student"])
def get_report():
    return AttendanceController.get_report()

@attendance_bp.route("/attendance/summary", methods=["GET"])
@token_required(allowed_roles=["admin", "faculty", "student"])
def get_summary():
    return AttendanceController.get_summary()

@attendance_bp.route("/attendance/subject-summary", methods=["GET"])
@token_required(allowed_roles=["admin", "faculty", "student"])
def get_subject_summary():
    return AttendanceController.get_subject_summary()

@attendance_bp.route("/attendance/export", methods=["GET"])
@token_required(allowed_roles=["admin", "faculty", "student"])
def export_report():
    return AttendanceController.export_report()
