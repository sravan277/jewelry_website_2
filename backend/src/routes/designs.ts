import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { auth } from '../middleware/auth';
import Design from '../models/Design';

const router = express.Router();

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5000000, // 5MB max file size
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload an image file'));
    }
    cb(null, true);
  },
});

// Create a new design with both sketch and generated images
router.post('/', auth, upload.fields([
  { name: 'sketchImage', maxCount: 1 },
  { name: 'generatedImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!files.sketchImage || !files.generatedImage) {
      return res.status(400).json({ message: 'Both sketch and generated images are required' });
    }

    // Upload both images to Cloudinary
    const sketchResult = await cloudinary.uploader.upload(
      `data:${files.sketchImage[0].mimetype};base64,${files.sketchImage[0].buffer.toString('base64')}`,
      { folder: 'jewelry_designs/sketches' }
    );

    const generatedResult = await cloudinary.uploader.upload(
      `data:${files.generatedImage[0].mimetype};base64,${files.generatedImage[0].buffer.toString('base64')}`,
      { folder: 'jewelry_designs/generated' }
    );

    const design = new Design({
      title,
      description,
      category,
      sketchImage: sketchResult.secure_url,
      generatedImage: generatedResult.secure_url,
      sketchCloudinaryId: sketchResult.public_id,
      generatedCloudinaryId: generatedResult.public_id,
      user: req.user.id,
    });

    await design.save();
    res.status(201).json(design);
  } catch (error) {
    console.error('Error creating design:', error);
    res.status(500).json({ message: 'Error uploading design' });
  }
});

// Get all designs for a user
router.get('/my-designs', auth, async (req, res) => {
  try {
    const designs = await Design.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select('-__v')
      .lean();

    res.json(designs);
  } catch (error) {
    console.error('Error fetching designs:', error);
    res.status(500).json({ message: 'Error fetching designs' });
  }
});

// Get all approved designs
router.get('/approved', async (req, res) => {
  try {
    const designs = await Design.find({ status: 'approved' })
      .sort({ createdAt: -1 })
      .populate('user', 'name');
    res.json(designs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching designs' });
  }
});

// Update a design
router.patch('/:id', auth, async (req, res) => {
  try {
    const design = await Design.findOne({ _id: req.params.id, user: req.user.id });
    
    if (!design) {
      return res.status(404).json({ message: 'Design not found' });
    }

    const updates = Object.keys(req.body);
    const allowedUpdates = ['title', 'description', 'category'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates' });
    }

    updates.forEach((update: string) => {
      if (update in design) {
        (design as any)[update] = req.body[update];
      }
    });
    await design.save();

    res.json(design);
  } catch (error) {
    res.status(500).json({ message: 'Error updating design' });
  }
});

// Delete a design
router.delete('/:id', auth, async (req, res) => {
  try {
    const design = await Design.findOne({ _id: req.params.id, user: req.user.id });

    if (!design) {
      return res.status(404).json({ message: 'Design not found' });
    }

    // Delete images from Cloudinary
    await cloudinary.uploader.destroy(design.sketchCloudinaryId);
    await cloudinary.uploader.destroy(design.generatedCloudinaryId);

    // Delete design from database
    await design.deleteOne();

    res.json({ message: 'Design deleted successfully' });
  } catch (error) {
    console.error('Error deleting design:', error);
    res.status(500).json({ message: 'Error deleting design' });
  }
});

export default router;
