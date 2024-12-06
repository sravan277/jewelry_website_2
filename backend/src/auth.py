from functools import wraps
from flask import request, jsonify
from google.oauth2 import id_token
from google.auth.transport import requests
import jwt
import os
from flask import Flask, request
from pymongo import MongoClient
import bcrypt
from datetime import datetime

app = Flask(__name__)

# Your Google OAuth client ID
GOOGLE_CLIENT_ID = "564453147944-fco1mb1nkmvnnm1o9l5djc1d9s6grplh.apps.googleusercontent.com"
JWT_SECRET = '724b07ce96f552b2d9405fb02899e199d14fdb874cf33634a3d233a649b8544a0a6ec9874c9d2f705bc983b478686d0808924b4fcd3166c752d492101c5c419d'  # Replace with a secure secret key

# Connect to MongoDB
try:
    client = MongoClient('mongodb://localhost:27017/', serverSelectionTimeoutMS=5000)
    # Test the connection
    client.server_info()
    db = client['jewellery_website']
    users_collection = db['users']
    print("Successfully connected to MongoDB")
except Exception as e:
    print(f"Error connecting to MongoDB: {str(e)}")
    raise Exception("Failed to connect to MongoDB. Make sure MongoDB is running.")

def verify_google_token(token):
    try:
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Invalid issuer')
        return idinfo
    except Exception as e:
        print(f"Token verification error: {str(e)}")
        return None

def create_jwt_token(user_info):
    return jwt.encode({
        'email': user_info.get('email')
    }, JWT_SECRET, algorithm='HS256')

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
        
        if not token:
            return jsonify({'message': 'Token is required'}), 401
        
        try:
            # First try JWT token
            data = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            # Add user info to request
            request.user = {'email': data.get('email')}
        except jwt.InvalidTokenError:
            # If JWT fails, try Google token
            user_info = verify_google_token(token)
            if not user_info:
                return jsonify({'message': 'Invalid token'}), 401
            request.user = {'email': user_info.get('email')}
            
        return f(*args, **kwargs)
    return decorated

@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        name = data.get('name')

        if not email or not password or not name:
            return jsonify({'message': 'Email, password, and name are required'}), 400

        # Check if user already exists
        existing_user = users_collection.find_one({'email': email})
        if existing_user:
            return jsonify({'message': 'Email already registered'}), 400

        # Hash password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        # Create user document
        user = {
            'email': email,
            'password': hashed_password,
            'name': name,
            'created_at': datetime.utcnow()
        }

        # Insert into database
        result = users_collection.insert_one(user)

        # Create token
        token = create_jwt_token({'email': email})

        return jsonify({
            'data': {
                'token': token,
                'user': {
                    'email': email,
                    'id': str(result.inserted_id),
                    'name': name
                }
            }
        }), 201

    except Exception as e:
        print(f"Registration error: {str(e)}")
        return jsonify({'message': 'Registration failed'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({'message': 'Email and password are required'}), 400

        # Find user
        user = users_collection.find_one({'email': email})
        if not user:
            return jsonify({'message': 'Invalid email or password'}), 401

        # Check password
        if not bcrypt.checkpw(password.encode('utf-8'), user['password']):
            return jsonify({'message': 'Invalid email or password'}), 401

        # Create token
        token = create_jwt_token({'email': email})

        return jsonify({
            'data': {
                'token': token,
                'user': {
                    'email': email,
                    'id': str(user['_id'])
                }
            }
        }), 200

    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({'message': 'Login failed'}), 500

@app.route('/api/users/me', methods=['GET'])
@token_required
def get_current_user():
    try:
        email = request.user.get('email')
        if not email:
            return jsonify({'message': 'User not found'}), 404

        user = users_collection.find_one({'email': email})
        if not user:
            return jsonify({'message': 'User not found'}), 404

        return jsonify({
            'email': user['email']
        }), 200

    except Exception as e:
        print(f"Get user error: {str(e)}")
        return jsonify({'message': 'Failed to get user information'}), 500
