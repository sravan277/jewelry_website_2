import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import User, { IUser } from '../models/User';
import { generateToken } from '../middleware/auth';
import { Types } from 'mongoose';

const router = express.Router();

interface AuthRequest extends Request {
  body: {
    email: string;
    password: string;
    name?: string;
  };
}

// Register route
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/\d/)
      .withMessage('Password must contain at least one number')
      .matches(/[a-zA-Z]/)
      .withMessage('Password must contain at least one letter'),
    body('name').trim().notEmpty().withMessage('Name is required'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          status: 'error',
          errors: errors.array() 
        });
      }

      const { email, password, name } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ 
          status: 'error',
          message: 'Email is already registered' 
        });
      }

      // Create new user
      const user = new User({
        email,
        password, // Will be hashed by the pre-save hook
        name,
      }) as IUser;

      await user.save();

      // Generate token
      const token = generateToken(user._id.toString());

      res.status(201).json({
        status: 'success',
        data: {
          token,
          user: {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
          },
        },
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ 
        status: 'error',
        message: 'An error occurred during registration. Please try again.' 
      });
    }
  }
);

// Login route
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          status: 'error',
          errors: errors.array() 
        });
      }

      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email }) as IUser | null;
      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid email or password'
        });
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid password'
        });
      }

      // Generate token
      const token = generateToken(user._id.toString());

      res.json({
        status: 'success',
        data: {
          token,
          user: {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
          },
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        status: 'error',
        message: 'An error occurred during login. Please try again.'
      });
    }
  }
);

export default router;
