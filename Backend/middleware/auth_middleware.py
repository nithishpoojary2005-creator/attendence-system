import os
import jwt
from functools import wraps
from flask import request, jsonify
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-jwt-key-change-in-production")
ALGORITHM = "HS256"

def generate_token(user_id, role, name, email=None, roll=None):
    payload = {
        "sub": user_id,
        "role": role,
        "name": name,
        "email": email,
        "roll": roll,
        "exp": datetime.utcnow() + timedelta(days=1), # expires in 1 day
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)

def decode_token(token):
    try:
        # Strip Bearer if present
        if token.startswith("Bearer "):
            token = token.split(" ")[1]
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return {"error": "Token has expired"}
    except jwt.InvalidTokenError:
        return {"error": "Invalid token"}

def token_required(allowed_roles=None):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            token = None
            
            # Read token from headers
            if "Authorization" in request.headers:
                token = request.headers["Authorization"]
                
            if not token:
                return jsonify({"error": "Authorization token is missing"}), 401
                
            decoded = decode_token(token)
            if "error" in decoded:
                return jsonify({"error": decoded["error"]}), 401
                
            # Role validation
            if allowed_roles:
                user_role = decoded.get("role")
                if user_role not in allowed_roles:
                    return jsonify({"error": "Forbidden: Access denied for this role"}), 403
                    
            # Attach user info to request context
            request.user_info = decoded
            return f(*args, **kwargs)
        return decorated
    return decorator
