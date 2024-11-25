from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import tensorflow as tf
import base64
import io
import numpy as np
from PIL import Image
import datetime
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from dotenv import load_dotenv
import os
import cv2
import uuid

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app, supports_credentials=True)

# JWT Configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key')  # Change in production
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(days=1)
jwt = JWTManager(app)

# MongoDB Configuration
MONGO_URI = os.getenv('MONGODB_URI')
client = MongoClient(MONGO_URI)
db = client.get_default_database()
users_collection = db.users
images_collection = db.images

# Load the generator model
generator = tf.keras.models.load_model("C:/SDC/pix2pix_generator_epoch_43.keras")

def load_image_for_prediction(image_bytes):
    # Read image from bytes
    image = Image.open(io.BytesIO(image_bytes))
    image = image.convert('RGB')
    image = np.array(image)
    image = cv2.resize(image, (256, 256))
    image = (image / 127.5) - 1  # Normalize to [-1, 1]
    return np.expand_dims(image, axis=0).astype(np.float32)

def process_image_with_model(image_array):
    # Predict using the model
    predicted_image = generator(image_array, training=False)
    return (predicted_image[0] + 1) / 2  # Rescale to [0, 1] for display

@app.route('/api/upload', methods=['POST'])
@jwt_required()
def process_image():
    try:
        current_user_id = get_jwt_identity()
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files['file']
        image_bytes = file.read()

        # Load and process the image
        sketch_image = load_image_for_prediction(image_bytes)
        predicted_image = process_image_with_model(sketch_image)

        # Convert processed image to PIL format
        predicted_image = (predicted_image * 255).numpy().astype(np.uint8)
        predicted_image_pil = Image.fromarray(predicted_image)

        # Convert images to base64
        sketch_image_b64 = base64.b64encode(image_bytes).decode("utf-8")
        img_byte_arr = io.BytesIO()
        predicted_image_pil.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)
        generated_image_b64 = base64.b64encode(img_byte_arr.read()).decode("utf-8")

        # Create unique ID for the record
        unique_id = str(uuid.uuid4())

        # Store in MongoDB with unique ID and user ID
        record = {
            "_id": unique_id,
            "user_id": current_user_id,
            "input_image": sketch_image_b64,
            "output_image": generated_image_b64,
            "timestamp": datetime.datetime.utcnow()
        }
        images_collection.insert_one(record)

        # Send back the generated image
        img_byte_arr.seek(0)
        return send_file(img_byte_arr, mimetype='image/png')
    except Exception as e:
        print(f"Error in process_image: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/get_images', methods=['GET'])
@jwt_required()
def get_images():
    try:
        current_user_id = get_jwt_identity()
        # Fetch all image records for the current user from MongoDB
        records = list(images_collection.find({"user_id": current_user_id}).sort("timestamp", -1))
        # Convert records for JSON serialization
        for record in records:
            record['_id'] = str(record['_id'])
            if 'timestamp' in record:
                record['timestamp'] = record['timestamp'].isoformat()
        return jsonify(records), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/delete_image/<image_id>', methods=['DELETE'])
@jwt_required()
def delete_image(image_id):
    try:
        current_user_id = get_jwt_identity()
        # Delete the image record from MongoDB using the ObjectId and user ID
        result = images_collection.delete_one({"_id": ObjectId(image_id), "user_id": current_user_id})
        
        if result.deleted_count > 0:
            return jsonify({"message": "Image deleted successfully"}), 200
        return jsonify({"error": "Image not found or unauthorized"}), 404
    except Exception as e:
        print(f"Error deleting image: {str(e)}")  # Debug print
        return jsonify({"error": str(e)}), 500

@app.route('/api/user/profile', methods=['GET'])
@jwt_required()
def get_user_profile():
    try:
        current_user_id = get_jwt_identity()
        user = users_collection.find_one({'_id': ObjectId(current_user_id)})
        
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Count user's designs
        designs_count = images_collection.count_documents({'user_id': str(user['_id'])})
        
        # Format the response
        response = {
            'name': user.get('name', ''),
            'email': user['email'],
            'joinDate': user.get('created_at', datetime.datetime.utcnow()).isoformat(),
            'lastLogin': user.get('last_login', datetime.datetime.utcnow()).isoformat(),
            'designsCreated': designs_count,
            'preferences': user.get('preferences', {
                'notifications': True,
                'newsletter': True
            })
        }
        
        return jsonify(response)
    except Exception as e:
        print(f"Error in get_user_profile: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/user/profile', methods=['PUT'])
@jwt_required()
def update_user_profile():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate input
        allowed_fields = ['name', 'preferences']
        update_data = {k: v for k, v in data.items() if k in allowed_fields}
        
        if not update_data:
            return jsonify({'error': 'No valid fields to update'}), 400
        
        # Update the user document
        result = users_collection.update_one(
            {'_id': ObjectId(current_user_id)},
            {'$set': update_data}
        )
        
        if result.modified_count == 0:
            return jsonify({'error': 'User not found or no changes made'}), 404
        
        return jsonify({'message': 'Profile updated successfully'})
    except Exception as e:
        print(f"Error in update_user_profile: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/user/designs', methods=['GET'])
@jwt_required()
def get_user_designs():
    try:
        current_user_id = get_jwt_identity()
        
        # Get all designs for the current user
        designs = list(images_collection.find(
            {'user_id': str(current_user_id)},
            {'_id': 1, 'input_image': 1, 'output_image': 1, 'timestamp': 1}
        ).sort('timestamp', -1))
        
        # Format the response
        for design in designs:
            design['_id'] = str(design['_id'])
            if 'timestamp' in design:
                design['timestamp'] = design['timestamp'].isoformat()
        
        return jsonify(designs)
    except Exception as e:
        print(f"Error in get_user_designs: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4000)
