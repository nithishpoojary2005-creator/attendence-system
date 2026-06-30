from flask import request, jsonify, send_file
from models.attendance import AttendanceModel
from models.student import StudentModel
from services.export_service import ExportService
import tempfile
import os

class AttendanceController:
    @staticmethod
    def mark_attendance():
        data = request.json or {}
        records = data.get("records", [])

        if not records:
            return jsonify({"error": "No attendance records submitted"}), 400

        try:
            marked = AttendanceModel.mark_attendance(records)
            return jsonify({"message": "Attendance saved successfully", "records_processed": marked}), 201
        except Exception as e:
            return jsonify({"error": f"Failed to save attendance: {str(e)}"}), 500

    @staticmethod
    def get_report():
        roll = request.args.get("roll")
        year = request.args.get("year")
        department = request.args.get("department")
        subject = request.args.get("subject")
        date = request.args.get("date")
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")

        try:
            records = AttendanceModel.find_records(
                roll=roll,
                year=year,
                department=department,
                subject=subject,
                date=date,
                start_date=start_date,
                end_date=end_date
            )
            return jsonify([AttendanceModel.serialize_record(r) for r in records]), 200
        except Exception as e:
            return jsonify({"error": f"Failed to retrieve report: {str(e)}"}), 500

    @staticmethod
    def get_summary():
        roll = request.args.get("roll")
        year = request.args.get("year")

        if not roll:
            return jsonify({"error": "Roll number is required"}), 400

        try:
            summary_data = AttendanceModel.get_summary_by_roll(roll, year)
            if not summary_data:
                return jsonify({"error": "Student not found"}), 404
            return jsonify(summary_data), 200
        except Exception as e:
            return jsonify({"error": f"Failed to fetch summary: {str(e)}"}), 500

    @staticmethod
    def get_subject_summary():
        roll = request.args.get("roll")
        if not roll:
            return jsonify({"error": "Roll number is required"}), 400
            
        try:
            summary = AttendanceModel.get_subject_wise_summary(roll)
            return jsonify(summary), 200
        except Exception as e:
            return jsonify({"error": f"Failed to fetch subject-wise summary: {str(e)}"}), 500

    @staticmethod
    def export_report():
        roll = request.args.get("roll")
        year = request.args.get("year")
        department = request.args.get("department")
        subject = request.args.get("subject")
        format_type = request.args.get("format", "csv").lower() # csv, excel, pdf

        try:
            records = AttendanceModel.find_records(
                roll=roll,
                year=year,
                department=department,
                subject=subject
            )
            
            if not records:
                return jsonify({"error": "No records found to export"}), 404
                
            serialized_records = [AttendanceModel.serialize_record(r) for r in records]
            
            # Use temporary file to export
            with tempfile.NamedTemporaryFile(delete=False) as tmp:
                temp_path = tmp.name
                
            if format_type == "csv":
                ExportService.to_csv(serialized_records, temp_path)
                mimetype = "text/csv"
                download_name = "attendance_report.csv"
            elif format_type == "excel":
                ExportService.to_excel(serialized_records, temp_path)
                mimetype = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                download_name = "attendance_report.xlsx"
            elif format_type == "pdf":
                ExportService.to_pdf(serialized_records, temp_path)
                mimetype = "application/pdf"
                download_name = "attendance_report.pdf"
            else:
                return jsonify({"error": "Unsupported export format"}), 400

            # Send file
            response = send_file(
                temp_path,
                mimetype=mimetype,
                as_attachment=True,
                download_name=download_name
            )
            
            # Clean up file after sending (via background cleaner or just let OS temp clean it up, 
            # but to prevent locks we return directly and let Flask handle file deletion if we use a helper,
            # or simply let it persist in temp which is fine. For reliability we will clean it after request finishes)
            @response.call_on_close
            def cleanup():
                try:
                    if os.path.exists(temp_path):
                        os.remove(temp_path)
                except Exception as e:
                    print(f"Error removing temp file {temp_path}: {e}")
                    
            return response
            
        except Exception as e:
            return jsonify({"error": f"Failed to export report: {str(e)}"}), 500
