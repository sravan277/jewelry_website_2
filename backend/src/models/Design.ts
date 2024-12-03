import mongoose from 'mongoose';

export interface IDesign extends mongoose.Document {
  title: string;
  description: string;
  category: string;
  sketchImage: string;
  generatedImage: string;
  sketchCloudinaryId: string;
  generatedCloudinaryId: string;
  user: mongoose.Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
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
    sketchImage: {
      type: String,
      required: true,
    },
    generatedImage: {
      type: String,
      required: true,
    },
    sketchCloudinaryId: {
      type: String,
      required: true,
    },
    generatedCloudinaryId: {
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
