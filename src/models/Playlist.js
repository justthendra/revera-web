import mongoose from 'mongoose';

const PlaylistSchema = new mongoose.Schema(
  {
    playlistId: { type: String, required: true, unique: true, index: true },
    guildId: { type: String, required: false, index: true, default: null },
    guildName: { type: String, default: 'Discord Server' },
    userId: { type: String, required: true, index: true },
    ownerTag: { type: String, default: 'Anonymous' },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    description: { type: String, default: '', maxlength: 200 },
    isPublic: { type: Boolean, default: false },
    plays: { type: Number, default: 0 },
    tracks: [
      {
        title: { type: String, required: true },
        url: { type: String, required: true },
        author: { type: String, default: 'Unknown Artist' },
        duration: { type: String, default: '00:00' },
        durationMS: { type: Number, default: 0 },
        thumbnail: { type: String, default: '' },
        addedAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export const Playlist =
  mongoose.models.Playlist || mongoose.model('Playlist', PlaylistSchema);

