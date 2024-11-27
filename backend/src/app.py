from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from pymongo import MongoClient
from PIL import Image
import io
import cv2
import numpy as np
import tensorflow as tf
import base64
from bson import ObjectId
import uuid
import datetime

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize MongoDB connection
client = MongoClient('mongodb+srv://vashistap1124:Vashista%4024@cluster0.5tzk8.mongodb.net')
db = client["jewelry_website"]
collection = db["designs"]

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
def process_image():
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

    # Store in MongoDB with unique ID
    record = {
        "_id": unique_id,
        "sketch_image": sketch_image_b64,
        "generated_image": generated_image_b64,
        "timestamp": datetime.datetime.utcnow()
    }
    collection.insert_one(record)

    # Send back the generated image
    img_byte_arr.seek(0)
    return send_file(img_byte_arr, mimetype='image/png')

@app.route('/api/get_images', methods=['GET'])
def get_images():
    try:
        # Fetch all image records from MongoDB
        records = list(collection.find().sort("timestamp", -1))
        # Convert records for JSON serialization
        for record in records:
            record['_id'] = str(record['_id'])
            if 'timestamp' in record:
                record['timestamp'] = record['timestamp'].isoformat()
        return jsonify(records), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/delete_image/<image_id>', methods=['DELETE'])
def delete_image(image_id):
    try:
        # Delete the image record using UUID as _id
        result = collection.delete_one({"_id": image_id})
        
        if result.deleted_count > 0:
            return jsonify({"message": "Image deleted successfully"}), 200
        return jsonify({"error": "Image not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4000)
