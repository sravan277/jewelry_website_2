from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from pymongo import MongoClient
from PIL import Image
import io
import os
import base64
import uuid
import datetime
import tensorflow as tf
import numpy as np
import traceback
import cv2
from bson import ObjectId
from dotenv import load_dotenv
from functools import wraps
import requests
import time

# Load environment variables
load_dotenv()

# Initialize Flask app with debug mode
app = Flask(__name__)
app.debug = True
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Hugging Face API configuration
API_URL = "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large"
headers = {"Authorization": "Bearer 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"}

# Jewelry-related keywords for validation
JEWELRY_KEYWORDS = {
    'jewelry', 'ring', 'necklace', 'chain', 'bracelet', 'earring',
    'gold', 'jewellery', 'pendant', 'ornament', 'design', 'pattern',
    'sketch', 'drawing', 'accessory', 'precious', 'metal', 'gem',
    'stone', 'diamond'
}

# Model paths
MODEL_DIR = "E:/website/jewelry_website_2/backend/models"
MODEL_PATHS = {
    "gold": "E:/website/jewelry_website_2/backend/models/generator_epoch_26.keras",
    "silver": "E:/website/jewelry_website_2/backend/models/pix2pix_generator_epoch_28.keras",
    "gold_gemstone": "E:/website/jewelry_website_2/backend/models/pix2pix_generator_epoch_43.keras",
    "classifier": "C:/Users/NEW/Downloads/gold_vs_sketch_model.h5"
}

# Initialize models dictionary
models = {}

def load_model_with_retry(model_type, path, max_retries=3, retry_delay=5):
    """Load a model with retry logic"""
    for attempt in range(max_retries):
        try:
            print(f"\nAttempt {attempt + 1} of {max_retries} to load {model_type} model")
            if not os.path.exists(path):
                print(f"Error: Model file not found at {path}")
                return None
                
            print(f"Loading {model_type} model from: {path}")
            model = tf.keras.models.load_model(path)
            print(f"Successfully loaded {model_type} model")
            return model
            
        except tf.errors.ResourceExhaustedError as e:
            if attempt < max_retries - 1:
                print(f"Resource exhausted, waiting {retry_delay} seconds before retry...")
                time.sleep(retry_delay)
                retry_delay *= 2  # Exponential backoff
            else:
                print(f"Failed to load {model_type} model after {max_retries} attempts: {str(e)}")
                return None
        except Exception as e:
            print(f"Error loading {model_type} model: {str(e)}")
            print("Detailed error:")
            traceback.print_exc()
            return None

def load_models():
    """Load all models into memory"""
    global models
    print("\n=== Starting model loading process ===")
    
    if not os.path.exists(MODEL_DIR):
        print(f"Creating models directory at {MODEL_DIR}")
        os.makedirs(MODEL_DIR, exist_ok=True)
    
    # Load each model
    for model_type, path in MODEL_PATHS.items():
        models[model_type] = load_model_with_retry(model_type, path)
    
    # Verify models were loaded
    loaded_models = [model_type for model_type, model in models.items() if model is not None]
    print("\n=== Model Loading Summary ===")
    if not loaded_models:
        print("ERROR: No models were successfully loaded!")
        print("Model status:")
        for model_type in MODEL_PATHS:
            print(f"- {model_type}: {'Loaded' if models.get(model_type) is not None else 'Failed'}")
        return False
    else:
        print(f"Successfully loaded models: {', '.join(loaded_models)}")
        print("Failed models:", [m for m in MODEL_PATHS if m not in loaded_models])
        return True

def query_huggingface_api(image_bytes, max_retries=3, retry_delay=5):
    """
    Query Hugging Face API with rate limit handling and retries
    Returns: (caption, error_message)
    """
    for attempt in range(max_retries):
        try:
            response = requests.post(API_URL, headers=headers, data=image_bytes)
            
            if response.status_code == 200:
                result = response.json()
                return result[0]['generated_text'], None
                
            elif response.status_code == 429:  # Rate limit exceeded
                print(f"Rate limit exceeded (attempt {attempt + 1}/{max_retries})")
                if attempt < max_retries - 1:
                    time.sleep(retry_delay)
                    continue
                return None, "Rate limit exceeded - proceeding with classification only"
                
            else:
                print(f"API error {response.status_code}")
                return None, f"API error: {response.status_code}"
                
        except Exception as e:
            print(f"Error in Hugging Face API call: {str(e)}")
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
                continue
            return None, str(e)
    
    return None, "Maximum retries exceeded - proceeding with classification only"

def is_jewelry_related(caption):
    """Check if the caption contains jewelry-related keywords"""
    if not caption:
        return True  # Skip validation if caption is None (API error)
    caption_words = caption.lower().split()
    return any(keyword in caption_words for keyword in JEWELRY_KEYWORDS)

def load_image_for_prediction(image_bytes):
    """Prepare image for model prediction"""
    image = Image.open(io.BytesIO(image_bytes))
    image = image.convert('RGB')
    image = np.array(image)
    image = cv2.resize(image, (256, 256))
    image = (image / 127.5) - 1
    return np.expand_dims(image, axis=0).astype(np.float32)

def classify_image(image_bytes):
    """Classify if the image is a valid sketch"""
    try:
        # Load and preprocess image
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        image = image.resize((150, 150))
        image_array = np.array(image) / 255.0
        image_array = np.expand_dims(image_array, axis=0)

        # Get prediction
        classifier = models.get('classifier')
        if classifier is None:
            print("Classifier model not loaded")
            return True, 0.0  # Continue without classification if model not loaded
            
        prediction = classifier.predict(image_array, verbose=0)
        confidence = float(prediction[0][0])
        is_valid = confidence > 0.5
        
        print(f"Classification confidence: {confidence}")
        return is_valid, confidence
    except Exception as e:
        print(f"Error in classification: {str(e)}")
        return True, 0.0  # Continue without classification on error

def process_image_with_model(image_array, model_type):
    """Process image with specified model"""
    if model_type not in models:
        raise ValueError(f"Unknown model type: {model_type}")
        
    model = models.get(model_type)
    if model is None:
        # Try to reload the model
        print(f"Model {model_type} not loaded, attempting to reload...")
        models[model_type] = load_model_with_retry(model_type, MODEL_PATHS[model_type])
        model = models.get(model_type)
        if model is None:
            raise ValueError(f"Failed to load model {model_type}")
    
    try:
        predicted_image = model(image_array, training=False)
        return (predicted_image[0] + 1) / 2
    except tf.errors.ResourceExhaustedError as e:
        print(f"Resource exhausted while processing image with {model_type} model")
        raise ValueError("The model is currently experiencing high demand. Please try again in a few minutes.")
    except Exception as e:
        print(f"Error processing image with {model_type} model: {str(e)}")
        traceback.print_exc()
        raise

def process_image_request(request, model_type):
    """Common image processing logic for all endpoints with improved error handling"""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
            
        # Check for email in either field
        email = request.form.get('email') or request.form.get('userEmail')
        if not email:
            return jsonify({"error": "Email not provided"}), 400

        file = request.files['file']
        image_bytes = file.read()
        print(f"Processing image for email: {email}, size: {len(image_bytes)} bytes")

        # Step 1: Classify the image (primary validation)
        is_valid_sketch, confidence = classify_image(image_bytes)
        if not is_valid_sketch and confidence > 0:  # Only reject if we have a confident negative classification
            return jsonify({
                "error": "The image does not appear to be a valid sketch",
                "confidence": confidence
            }), 400

        # Step 2: Try image-to-text validation (optional)
        caption, error = query_huggingface_api(image_bytes)
        if caption and not is_jewelry_related(caption):
            # Log the rejection but don't block if we're not confident
            print(f"Warning: Image may not be jewelry-related. Caption: {caption}")
            if confidence < 0.3:  # If classifier was also not confident, then reject
                return jsonify({
                    "error": "The image does not appear to be jewelry-related",
                    "caption": caption
                }), 400

        # Step 3: Process image with model
        try:
            # Convert original sketch to base64
            sketch_image_b64 = base64.b64encode(image_bytes).decode('utf-8')
            
            # Process the image
            sketch_image = load_image_for_prediction(image_bytes)
            predicted_image = process_image_with_model(sketch_image, model_type)
            
            # Convert generated image to base64
            generated_pil = Image.fromarray((predicted_image * 255).numpy().astype(np.uint8))
            img_byte_arr = io.BytesIO()
            generated_pil.save(img_byte_arr, format='PNG')
            generated_image_b64 = base64.b64encode(img_byte_arr.getvalue()).decode('utf-8')
            
            # Save to database
            try:
                image_id = save_to_database(sketch_image_b64, generated_image_b64, model_type, email)
                print(f"Successfully saved images to database with ID: {image_id}")
            except Exception as e:
                print(f"Error saving to database: {str(e)}")
                # Continue even if save fails, to at least return the generated image
            
            # Return the generated image
            img_byte_arr.seek(0)
            return send_file(
                img_byte_arr,
                mimetype='image/png',
                as_attachment=False
            )

        except tf.errors.ResourceExhaustedError:
            print("TensorFlow resource exhausted - suggesting retry")
            return jsonify({
                "error": "Model resources exhausted. Please try again in a few minutes.",
                "retry_suggested": True
            }), 503
            
        except Exception as e:
            print(f"Error in image processing: {str(e)}")
            return jsonify({"error": str(e)}), 500

    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

def save_to_database(sketch_image_b64, generated_image_b64, model_type, user_email):
    """Save processed images to database with user email"""
    if collection is None:
        raise Exception("Database connection not available")
        
    unique_id = str(uuid.uuid4())
    record = {
        "_id": unique_id,
        "userEmail": user_email,
        "sketch_image": sketch_image_b64,
        "generated_image": generated_image_b64,
        "model_type": model_type,
        "timestamp": datetime.datetime.utcnow(),
        "filename": f"{user_email}_{datetime.datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
    }
    collection.insert_one(record)
    return unique_id

# MongoDB configuration with error handling
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
DB_NAME = os.getenv('DB_NAME', 'jewelry_website')
COLLECTION_NAME = 'designs'

def init_mongodb():
    """Initialize MongoDB connection with error handling"""
    global client, db, collection
    try:
        # Connect with a timeout
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        # Test the connection
        client.server_info()
        
        db = client[DB_NAME]
        collection = db[COLLECTION_NAME]
        
        # Verify collection exists by attempting a simple operation
        collection.find_one()
        print(f"Successfully connected to MongoDB at {MONGO_URI}")
        print(f"Using database: {DB_NAME}, collection: {COLLECTION_NAME}")
        return True
    except Exception as e:
        print(f"Error connecting to MongoDB: {str(e)}")
        client = None
        db = None
        collection = None
        return False

@app.route('/api/upload', methods=['POST'])
def process_gold():
    """Endpoint for gold jewelry model"""
    return process_image_request(request, "gold")

@app.route('/api/upload/silver', methods=['POST'])
def process_silver():
    """Endpoint for silver jewelry model"""
    return process_image_request(request, "silver")

@app.route('/api/upload/gold-gemstone', methods=['POST'])
def process_gold_gemstone():
    """Endpoint for gold with gemstone jewelry model"""
    return process_image_request(request, "gold_gemstone")

@app.route('/api/images/my-images', methods=['GET'])
def get_user_images():
    """Get processed images for a specific user"""
    app.logger.info('Received request for /api/images/my-images')
    app.logger.info(f'Request args: {request.args}')
    
    try:
        email = request.args.get('email')
        if not email:
            app.logger.error('No email provided')
            return jsonify({'error': 'Email is required'}), 400

        if collection is None:
            app.logger.error('Database connection not available')
            return jsonify({'error': 'Database connection not available'}), 500

        # Get all images for the user from MongoDB
        query = {'userEmail': email}
        app.logger.info(f'Querying MongoDB with: {query}')
        
        images = list(collection.find(query).sort('timestamp', -1))
        app.logger.info(f'Found {len(images)} images')
        
        # Convert ObjectId and datetime for JSON serialization
        for image in images:
            image['_id'] = str(image['_id'])
            if isinstance(image.get('timestamp'), datetime.datetime):
                image['timestamp'] = image['timestamp'].isoformat()
            
        return jsonify(images)

    except Exception as e:
        app.logger.error(f'Error in get_user_images: {str(e)}')
        return jsonify({'error': str(e)}), 500

@app.route('/api/images/<image_id>/download', methods=['GET'])
def download_image(image_id):
    """Download a specific image"""
    try:
        image_type = request.args.get('type', 'generated')  # 'generated' or 'sketch'
        
        # Find the image in database
        image_doc = collection.find_one({"_id": image_id})
        if not image_doc:
            return jsonify({"error": "Image not found"}), 404

        # Get the appropriate image data
        image_data = image_doc['generated_image'] if image_type == 'generated' else image_doc['sketch_image']
        
        # Convert base64 to bytes
        image_bytes = base64.b64decode(image_data)
        
        # Create file-like object
        img_io = io.BytesIO(image_bytes)
        
        # Generate filename
        filename = f"{image_doc['filename']}_{image_type}.png"
        
        return send_file(
            img_io,
            mimetype='image/png',
            as_attachment=True,
            download_name=filename
        )

    except Exception as e:
        print(f"Error downloading image: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/images/<image_id>', methods=['DELETE'])
def delete_image(image_id):
    """Delete an image record from database"""
    try:
        # Verify user owns the image
        user_email = request.args.get('email') or request.args.get('userEmail')
        if not user_email:
            return jsonify({"error": "User email not provided"}), 400

        print(f"Attempting to delete image {image_id} for user {user_email}")
        result = collection.delete_one({"_id": image_id, "userEmail": user_email})
        
        if result.deleted_count == 0:
            print(f"Image {image_id} not found or unauthorized for user {user_email}")
            return jsonify({"error": "Image not found or unauthorized"}), 404
            
        print(f"Successfully deleted image {image_id} for user {user_email}")
        return jsonify({"message": "Image deleted successfully"})

    except Exception as e:
        print(f"Error deleting image: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    try:
        print("Initializing MongoDB connection...")
        if not init_mongodb():
            raise Exception("Failed to initialize MongoDB")
            
        print("Loading AI models...")
        if not load_models():
            raise Exception("Failed to load models")
        print("Models loaded successfully")
        
        print("Starting Flask server...")
        print("Available routes:", [str(rule) for rule in app.url_map.iter_rules()])
        app.run(host='0.0.0.0', port=4000, debug=True)
    except Exception as e:
        print(f"Error during startup: {str(e)}")
