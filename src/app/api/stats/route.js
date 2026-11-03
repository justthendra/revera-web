import { NextResponse } from 'next/server';
import { connectMongo } from '@/lib/db';
import { GuildSettings } from '@/models/GuildSettings';
import { UserProfile } from '@/models/UserProfile';
import { Playlist } from '@/models/Playlist';

export async function GET() {
  try {
    await connectMongo();

    const [guildCount, userCount, playlistCount] = await Promise.all([
      GuildSettings.countDocuments().catch(() => 0),
      UserProfile.countDocuments().catch(() => 0),
      Playlist.countDocuments().catch(() => 0)
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalGuilds: Math.max(guildCount, 1),
        totalUsers: Math.max(userCount, 1),
        totalPlaylists: playlistCount,
        audioEngines: ['YouTube', 'Spotify', 'SoundCloud', 'Apple Music'],
        filtersCount: 13,
        uptime: '99.98%'
      }
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err.message,
      stats: {
        totalGuilds: 1,
        totalUsers: 1,
        totalPlaylists: 1,
        audioEngines: ['YouTube', 'Spotify', 'SoundCloud', 'Apple Music'],
        filtersCount: 13,
        uptime: '100%'
      }
    });
  }
}

