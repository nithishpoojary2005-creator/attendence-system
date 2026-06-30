import os
import sys
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

# ==========================
# Load Environment Variables
# ==========================
load_dotenv()

# Add project root to Python path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)

# ==========================
# Import Application Modules
# ==========================
from config.db import get_db
from controllers.auth_controller import AuthController
from routes.auth_routes import auth_bp
from routes.student_routes import student_bp
from routes.attendance_routes import attendance_bp

# ==========================
# Create Flask App
# ==========================
app = Flask(__name__)

# ==========================
# CORS Configuration
# ==========================

allowed_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:3001"
).split(",")

CORS(
    app,
    resources={r"/*": {"origins": allowed_origins}},
    supports_credentials=True,
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"]
)

# ==========================
# Security Headers
# ==========================

@app.after_request
def add_security_headers(response):
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"

    # Development CSP
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "connect-src 'self' http://localhost:3000 http://localhost:3001 http://localhost:8000; "
        "img-src 'self' data: blob:; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com;"
    )

    return response

# ==========================
# Initialize Database
# ==========================

db = get_db()
AuthController.seed_admin()

# ==========================
# Register Blueprints
# ==========================

app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(student_bp)
app.register_blueprint(attendance_bp)

# ==========================
# Static Uploads
# ==========================

@app.route("/static/uploads/<path:filename>")
def uploaded_file(filename):
    upload_folder = os.path.join(BASE_DIR, "static", "uploads")
    return send_from_directory(upload_folder, filename)

# ==========================
# Health Check
# ==========================

@app.route("/", methods=["GET"])
def health():
    return jsonify({
        "status": "success",
        "message": "Student Attendance Management API is running.",
        "environment": os.getenv("FLASK_ENV", "development")
    }), 200

# ==========================
# Error Handlers
# ==========================

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "success": False,
        "message": "Requested resource was not found."
    }), 404


@app.errorhandler(500)
def internal_server_error(error):
    return jsonify({
        "success": False,
        "message": "Internal Server Error."
    }), 500

# ==========================
# Start Application
# ==========================

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        debug=True
    )