import mongoose from 'mongoose';

const UserProfileSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    favorites: [
      {
        title: { type: String, required: true },
        url: { type: String, required: true },
        author: { type: String, default: 'Unknown Artist' },
        duration: { type: String, default: '00:00' },
        durationMS: { type: Number, default: 0 },
        thumbnail: { type: String, default: '' },
        addedAt: { type: Date, default: Date.now }
      }
    ],
    history: [
      {
        title: { type: String, required: true },
        url: { type: String, required: true },
        author: { type: String, default: 'Unknown Artist' },
        duration: { type: String, default: '00:00' },
        durationMS: { type: Number, default: 0 },
        thumbnail: { type: String, default: '' },
        addedAt: { type: Date, default: Date.now }
      }
    ],
    stats: {
      tracksPlayed: { type: Number, default: 0 },
      listeningTimeMs: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

export const UserProfile =
  mongoose.models.UserProfile ||
  mongoose.model('UserProfile', UserProfileSchema);

