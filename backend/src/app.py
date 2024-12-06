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
    'gold', 'jewellery', 'pendant', 'ornament'
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

def load_models():
    """Load all models into memory"""
    global models
    print("\n=== Starting model loading process ===")
    
    if not os.path.exists(MODEL_DIR):
        print(f"Creating models directory at {MODEL_DIR}")
        os.makedirs(MODEL_DIR, exist_ok=True)
    
    # Load each model
    for model_type, path in MODEL_PATHS.items():
        try:
            print(f"\nLoading {model_type} model from: {path}")
            
            if not os.path.exists(path):
                print(f"Error: Model file not found at {path}")
                models[model_type] = None
                continue
                
            print(f"File exists, attempting to load {model_type} model...")
            model = tf.keras.models.load_model(path)
            print(f"Successfully loaded {model_type} model")
            models[model_type] = model
            
        except Exception as e:
            print(f"Error loading {model_type} model: {str(e)}")
            print("Detailed error:")
            traceback.print_exc()
            models[model_type] = None
    
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
        raise ValueError(f"Model {model_type} not loaded")
    
    try:
        predicted_image = model(image_array, training=False)
        return (predicted_image[0] + 1) / 2
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
        print(f"Caption received from Hugging Face API: {caption}")  # Added print statement
        if caption and not is_jewelry_related(caption):
            # Log the rejection but don't block if we're not confident
            print(f"Warning: Image may not be jewelry-related. Caption: {caption}")
            return jsonify({"error": "The image does not appear to be jewelry-related",
                    "caption": caption}), 400
            

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

def save_to_database(sketch_image_b64, generated_image_b64, model_type, email):
    """Save processed images to user's generatedImages array"""
    try:
        # Get MongoDB collection for users
        client = MongoClient(MONGO_URI)
        db = client[DB_NAME]
        users_collection = db['users']

        # Create new image entry
        new_image = {
            "sketchImage": f"data:image/png;base64,{sketch_image_b64}",
            "generatedImage": f"data:image/png;base64,{generated_image_b64}",
            "sketchImageData": sketch_image_b64,
            "generatedImageData": generated_image_b64,
            "title": f"{model_type.replace('_', ' ').title()} Design",
            "description": f"Generated using {model_type} model",
            "category": model_type,
            "status": "pending",
            "createdAt": datetime.datetime.utcnow()
        }

        # First, check if user exists
        user = users_collection.find_one({"email": email})
        
        if user:
            # Update existing user
            print(f"Found existing user with email: {email}")
            result = users_collection.update_one(
                {"email": email},
                {"$push": {"generatedImages": new_image}}
            )
            print(f"Update result: Modified {result.modified_count} document(s)")
        else:
            # Create new user if doesn't exist
            print(f"Creating new user with email: {email}")
            result = users_collection.insert_one({
                "email": email,
                "generatedImages": [new_image],
                "createdAt": datetime.datetime.utcnow()
            })
            print(f"Insert result: Inserted ID {result.inserted_id}")

        # Verify the update
        updated_user = users_collection.find_one({"email": email})
        if updated_user and "generatedImages" in updated_user:
            print(f"Successfully verified. User has {len(updated_user['generatedImages'])} images")
            return str(updated_user['_id'])
        else:
            print("Warning: Could not verify image was saved")
            return None

    except Exception as e:
        print(f"Error saving to database: {str(e)}")
        traceback.print_exc()  # Print full stack trace
        raise
    finally:
        client.close()

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

@app.route('/api/images/<email>', methods=['GET'])
def get_user_images(email):
    """Get all generated images for a specific user"""
    try:
        client = MongoClient(MONGO_URI)
        db = client[DB_NAME]
        users_collection = db['users']

        # Find user and get their generatedImages array
        user = users_collection.find_one(
            {"email": email},
            {"generatedImages": 1}
        )

        if not user:
            return jsonify({"error": "User not found"}), 404

        # Return the generatedImages array
        return jsonify({
            "success": True,
            "images": user.get("generatedImages", [])
        })

    except Exception as e:
        print(f"Error retrieving images: {str(e)}")
        return jsonify({"error": str(e)}), 500
    finally:
        client.close()

# MongoDB configuration with error handling
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
DB_NAME = os.getenv('DB_NAME', 'jewelry_website')

if __name__ == '__main__':
    try:
        print("Initializing MongoDB connection...")
        # Connect with a timeout
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        # Test the connection
        client.server_info()
        
        db = client[DB_NAME]
        
        # Verify collection exists by attempting a simple operation
        db.list_collection_names()
        print(f"Successfully connected to MongoDB at {MONGO_URI}")
        print(f"Using database: {DB_NAME}")
        
        print("Loading AI models...")
        if not load_models():
            raise Exception("Failed to load models")
        print("Models loaded successfully")
        
        print("Starting Flask server...")
        print("Available routes:", [str(rule) for rule in app.url_map.iter_rules()])
        app.run(host='0.0.0.0', port=4000, debug=True)
    except Exception as e:
        print(f"Error during startup: {str(e)}")
