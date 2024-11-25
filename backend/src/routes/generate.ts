import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import OpenAI from 'openai';
import { auth } from '../middleware/auth';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Configure OpenAI
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is not set');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Only image files are allowed!'));
    }
    cb(null, true);
  },
});

// Generate image route
router.post('/image', auth, upload.single('image'), async (req, res) => {
  let uploadedFile = null;
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    // Upload image to Cloudinary
    uploadedFile = req.file;
    const result = await cloudinary.uploader.upload(req.file.path);

    // Generate image using DALL-E
    const prompt = req.body.prompt || 'Transform this jewelry sketch into a realistic, detailed 3D render';
    const response = await openai.images.generate({
      model: "dall-e-2",
      prompt: `${prompt}. The image should be a photorealistic jewelry design based on this sketch: ${result.secure_url}`,
      n: 1,
      size: "1024x1024",
    });

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    // Get the generated image URL
    const generatedImageUrl = response.data[0].url;

    res.json({
      originalImage: result.secure_url,
      generatedImage: generatedImageUrl,
    });
  } catch (error: any) {
    // Clean up temporary file if it exists
    if (uploadedFile && fs.existsSync(uploadedFile.path)) {
      fs.unlinkSync(uploadedFile.path);
    }

    console.error('Image generation error:', error);
    res.status(500).json({
      message: 'Error generating image',
      error: error.message,
    });
  }
});

export default router;
