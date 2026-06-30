from flask import Blueprint
from controllers.auth_controller import AuthController
from middleware.auth_middleware import token_required

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    return AuthController.register()

@auth_bp.route("/login", methods=["POST"])
def login():
    return AuthController.login()

@auth_bp.route("/me", methods=["GET"])
@token_required()
def get_me():
    return AuthController.get_me()

@auth_bp.route("/change-password", methods=["POST"])
@token_required()
def change_password():
    return AuthController.change_password()

