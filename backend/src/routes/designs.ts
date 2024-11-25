import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { auth } from '../middleware/auth';
import Design from '../models/Design';

const router = express.Router();

// Configure multer for file upload
const upload = multer({
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

// Create a new design
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category } = req.body;

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file!.path, {
      folder: 'jewelry_designs',
    });

    const design = new Design({
      title,
      description,
      category,
      imageUrl: result.secure_url,
      cloudinaryId: result.public_id,
      user: req.user.id,
    });

    await design.save();
    res.status(201).json(design);
  } catch (error) {
    res.status(500).json({ message: 'Error uploading design' });
  }
});

// Get all designs for a user
router.get('/my-designs', auth, async (req, res) => {
  try {
    const designs = await Design.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(designs);
  } catch (error) {
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

    // Delete image from Cloudinary
    await cloudinary.uploader.destroy(design.cloudinaryId);
    
    await Design.deleteOne({ _id: design._id });
    res.json({ message: 'Design deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting design' });
  }
});

export default router;
