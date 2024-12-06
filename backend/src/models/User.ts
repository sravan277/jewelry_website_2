import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  name: string;
  generatedImages: Array<{
    sketchImage: string;
    generatedImage: string;
    sketchImageData: Buffer;
    generatedImageData: Buffer;
    title: string;
    description: string;
    category: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Date;
  }>;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    generatedImages: [{
      sketchImage: {
        type: String,
        required: true,
      },
      generatedImage: {
        type: String,
        required: true,
      },
      sketchImageData: {
        type: Buffer,
        required: false,
      },
      generatedImageData: {
        type: Buffer,
        required: false,
      },
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      category: {
        type: String,
        required: true,
        enum: ['rings', 'necklaces', 'earrings', 'bracelets', 'other'],
      },
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
      },
      createdAt: {
        type: Date,
        default: Date.now,
      }
    }],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);
