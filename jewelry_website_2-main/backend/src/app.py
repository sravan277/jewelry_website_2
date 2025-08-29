import os
import io
import traceback
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from PIL import Image
from dotenv import load_dotenv
import tensorflow as tf
import numpy as np
import cv2

# Load any environment variables (e.g., from a .env file)
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# --- Configuration ---

# Configure CORS to ONLY allow requests from your Node.js backend API
# This is a critical security step.
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5000"}})

# --- Model Loading ---

# Use relative paths to make the project portable.
# This finds the 'backend' root directory and then locates the 'models' folder inside it.
MODEL_DIR = r"C:\Users\srava\Documents\Git_projects\jewelry_models"

MODEL_PATHS = {
    "gold": os.path.join(MODEL_DIR, "pix2pix_generator_epoch_46.keras"),
    "silver": os.path.join(MODEL_DIR, "pix2pix_generator_epoch_28.keras"),
    "gold_gemstone": os.path.join(MODEL_DIR, "pix2pix_generator_epoch_28.keras"),
    "paper_sketch": os.path.join(MODEL_DIR, "pix2pix_generator_epoch_46.keras"),
}

models = {}

def load_models():
    """Load all TensorFlow models into memory upon application start."""
    global models
    print("=== Starting ML Model Loading Process ===")
    for model_type, path in MODEL_PATHS.items():
        if os.path.exists(path):
            try:
                models[model_type] = tf.keras.models.load_model(path)
                print(f"- Successfully loaded '{model_type}' model.")
            except Exception as e:
                print(f"ERROR loading '{model_type}' model from {path}: {e}")
                traceback.print_exc()
        else:
            print(f"WARNING: Model file not found for '{model_type}' at {path}")
    print("=== Model Loading Complete. ===")

# --- Image Processing Helper Functions ---

def load_image_for_prediction(image_bytes):
    """Prepares a standard image for model prediction."""
    image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    image = np.array(image)
    image = cv2.resize(image, (256, 256))
    image = (image / 127.5) - 1  # Normalize to [-1, 1]
    return np.expand_dims(image, axis=0).astype(np.float32)

def convert_to_black_white_sketch(image_bytes):
    """Converts an image to an enhanced black-and-white sketch format."""
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    inverted_image = 255 - gray_image
    blurred_image = cv2.GaussianBlur(inverted_image, (21, 21), 0)
    inverted_blurred_image = 255 - blurred_image
    sketch_image = cv2.divide(gray_image, inverted_blurred_image, scale=256.0)
    
    sketch_image_rgb = cv2.cvtColor(sketch_image, cv2.COLOR_GRAY2RGB)
    sketch_image_rgb = cv2.resize(sketch_image_rgb, (256, 256))
    
    return sketch_image_rgb.astype(np.float32)

def process_image_with_model(image_array, model_type):
    """Runs the specified model on the prepared image array."""
    model = models.get(model_type)
    if model is None:
        raise ValueError(f"Model '{model_type}' is not loaded or does not exist.")
    
    predicted_image = model(image_array, training=False)
    # De-normalize from [-1, 1] back to [0, 1]
    return (predicted_image[0] + 1) / 2

# --- The Single, Consolidated API Endpoint ---

@app.route('/api/generate', methods=['POST'])
def generate_image_endpoint():
    """
    Receives an image and a model_type from the Node.js service,
    processes it, and returns the generated image.
    """
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No image file provided in the request."}), 400

        file = request.files['file']
        model_type = request.form.get('model_type')

        if not model_type or model_type not in models:
            available = list(models.keys())
            return jsonify({"error": f"A valid 'model_type' is required. Available models: {available}"}), 400

        image_bytes = file.read()
        
        # The processing logic is now simplified and directly inside the endpoint
        if model_type == "paper_sketch":
            sketch_image = convert_to_black_white_sketch(image_bytes)
            # Normalize sketch from [0, 255] to [-1, 1] for the model
            model_input = (sketch_image / 127.5) - 1
            model_input = np.expand_dims(model_input, axis=0)
        else:
            model_input = load_image_for_prediction(image_bytes)
        
        # Run the model
        predicted_tensor = process_image_with_model(model_input, model_type)
        
        # Convert the final tensor back to a sendable image format
        generated_pil = Image.fromarray((predicted_tensor.numpy() * 255).astype(np.uint8))
        img_byte_arr = io.BytesIO()
        generated_pil.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)

        # Return the generated image as a file in the response
        return send_file(img_byte_arr, mimetype='image/png')

    except Exception as e:
        print(f"--- An error occurred in /api/generate ---")
        traceback.print_exc()
        return jsonify({"error": "An internal error occurred during image generation."}), 500

# --- Application Startup ---

if __name__ == '__main__':
    # Load models into memory before starting the server
    load_models()
    
    # Run the Flask app on a different port than the Node.js app to avoid conflicts
    print("\n>>> Starting Flask ML Service on http://localhost:4000 <<<")
    app.run(host='0.0.0.0', port=4000)