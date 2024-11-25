import mongoose from 'mongoose';

export interface IDesign extends mongoose.Document {
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  cloudinaryId: string;
  user: mongoose.Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected';
}

const designSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['rings', 'necklaces', 'earrings', 'bracelets', 'other'],
    },
    imageUrl: {
      type: String,
      required: true,
    },
    cloudinaryId: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IDesign>('Design', designSchema);
