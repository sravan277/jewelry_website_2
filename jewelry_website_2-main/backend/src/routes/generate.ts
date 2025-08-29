import express from 'express';
import multer from 'multer';
import { auth } from '../middleware/auth';
import axios from 'axios';
import FormData from 'form-data';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // Use memory storage for proxying

// This function forwards the request to the Python ML service
const forwardToMlService = async (req: express.Request, res: express.Response, modelType: string) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided.' });
    }

    const form = new FormData();
    form.append('file', req.file.buffer, { filename: req.file.originalname });
    form.append('model_type', modelType);

    // Call the Python Flask server
    const flaskResponse = await axios.post('http://localhost:4000/api/generate', form, {
      headers: form.getHeaders(),
      responseType: 'arraybuffer', // Important for receiving an image
    });

    // Send the generated image back to the frontend
    res.set('Content-Type', 'image/png');
    res.send(flaskResponse.data);

  } catch (error: any) {
    console.error(`Error forwarding to ML service for model ${modelType}:`, error.message);
    res.status(500).json({ error: 'Error generating image via ML service.' });
  }
};

// Create routes that match what the frontend is calling
// POST /api/upload/
router.post('/', auth, upload.single('file'), (req, res) => {
  forwardToMlService(req, res, 'gold');
});

// POST /api/upload/silver
router.post('/silver', auth, upload.single('file'), (req, res) => {
  forwardToMlService(req, res, 'silver');
});

// POST /api/upload/paper-sketch
router.post('/paper-sketch', auth, upload.single('file'), (req, res) => {
  forwardToMlService(req, res, 'paper_sketch');
});

// POST /api/upload/gold-gemstone
router.post('/gold-gemstone', auth, upload.single('file'), (req, res) => {
  forwardToMlService(req, res, 'gold_gemstone');
});

export default router;