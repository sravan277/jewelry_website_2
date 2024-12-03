from flask import Blueprint, request, jsonify
from ..auth import verify_google_token, create_jwt_token

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/google-login', methods=['POST'])
def google_login():
    try:
        google_token = request.json.get('googleToken')
        if not google_token:
            return jsonify({'error': 'Google token is required'}), 400
            
        user_info = verify_google_token(google_token)
        if not user_info:
            return jsonify({'error': 'Invalid Google token'}), 401
            
        # Create our own JWT token
        token = create_jwt_token(user_info)
        
        return jsonify({
            'success': True,
            'token': token,
            'user': {
                'id': user_info.get('sub'),
                'email': user_info.get('email'),
                'name': user_info.get('name')
            }
        })
        
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({'error': 'Authentication failed'}), 500
