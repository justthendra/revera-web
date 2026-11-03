import mongoose from 'mongoose';

const GuildSettingsSchema = new mongoose.Schema(
  {
    guildId: { type: String, required: true, unique: true, index: true },
    djRoleId: { type: String, default: null },
    djOnlyMode: { type: Boolean, default: false },
    defaultVolume: { type: Number, default: 80, min: 1, max: 100 },
    restrictedTextChannelId: { type: String, default: null },
    twentyFourSeven: {
      enabled: { type: Boolean, default: false },
      voiceChannelId: { type: String, default: null },
      textChannelId: { type: String, default: null }
    },
    requestChannel: {
      channelId: { type: String, default: null },
      messageId: { type: String, default: null }
    },
    announceSongs: { type: Boolean, default: true },
    autoDisconnectTime: { type: Number, default: 300 },
    voteSkipEnabled: { type: Boolean, default: false },
    preventDuplicates: { type: Boolean, default: false },
    remoteAction: { type: Object, default: null },
    currentTrack: {
      title: { type: String, default: null },
      author: { type: String, default: null },
      duration: { type: String, default: null },
      thumbnail: { type: String, default: null },
      url: { type: String, default: null },
      requestedBy: { type: String, default: null },
      isPlaying: { type: Boolean, default: false },
      updatedAt: { type: Date, default: Date.now }
    }
  },
  { timestamps: true }
);

export const GuildSettings =
  mongoose.models.GuildSettings ||
  mongoose.model('GuildSettings', GuildSettingsSchema);

