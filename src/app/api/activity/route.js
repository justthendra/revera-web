import { NextResponse } from 'next/server';
import { connectMongo } from '@/lib/db';
import { GuildSettings } from '@/models/GuildSettings';
import { UserProfile } from '@/models/UserProfile';

function formatTimeAgo(date) {
  if (!date) return 'Just now';
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export async function GET() {
  try {
    await connectMongo();

    // 1. Fetch active playback in guilds
    const activeGuilds = await GuildSettings.find(
      { 'currentTrack.title': { $exists: true, $ne: null } },
      { guildId: 1, currentTrack: 1 }
    )
      .sort({ 'currentTrack.updatedAt': -1 })
      .limit(5)
      .lean()
      .catch(() => []);

    // 2. Fetch recent track history across all user profiles
    const profiles = await UserProfile.find({}, { history: { $slice: -15 }, stats: 1 })
      .lean()
      .catch(() => []);

    let allTracks = [];
    let totalPlayed = 0;
    let totalListeningMs = 0;

    for (const p of profiles) {
      if (p.stats?.tracksPlayed) totalPlayed += p.stats.tracksPlayed;
      if (p.stats?.listeningTimeMs) totalListeningMs += p.stats.listeningTimeMs;

      if (Array.isArray(p.history)) {
        for (const t of p.history) {
          allTracks.push({
            title: t.title,
            author: t.author || 'Unknown Artist',
            duration: t.duration || '00:00',
            thumbnail: t.thumbnail || '',
            url: t.url || '',
            addedAt: t.addedAt || new Date()
          });
        }
      }
    }

    // Sort recent tracks by addedAt descending
    allTracks.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
    const recentTracks = allTracks.slice(0, 15);

    // 3. Build live activities list
    const activities = [];

    // First add active live streams if any
    for (const g of activeGuilds) {
      if (g.currentTrack?.title) {
        // Consider live only if isPlaying is true and updated within last 15 minutes
        const isRecent = g.currentTrack.updatedAt && (new Date() - new Date(g.currentTrack.updatedAt) < 15 * 60 * 1000);
        const isLive = Boolean(g.currentTrack.isPlaying && isRecent);

        activities.push({
          guild: `Server #${g.guildId.slice(-4)}`,
          title: g.currentTrack.title,
          author: g.currentTrack.author,
          thumbnail: g.currentTrack.thumbnail,
          url: g.currentTrack.url,
          action: isLive
            ? `Streaming "${g.currentTrack.title}" • ${g.currentTrack.author}`
            : `Played "${g.currentTrack.title}" • ${g.currentTrack.author}`,
          time: formatTimeAgo(g.currentTrack.updatedAt),
          isLive,
          duration: g.currentTrack.duration
        });
      }
    }

    // Then add actual played tracks from history
    for (const track of recentTracks) {
      // Avoid duplicate title if already present in active
      if (!activities.some((a) => a.title === track.title)) {
        activities.push({
          guild: 'Discord Community',
          title: track.title,
          author: track.author,
          thumbnail: track.thumbnail,
          url: track.url,
          action: `Played "${track.title}" • ${track.author}`,
          time: formatTimeAgo(track.addedAt),
          isLive: false,
          duration: track.duration
        });
      }
    }

    // If database has fewer than 2 tracks yet, supplement with defaults
    if (activities.length === 0) {
      activities.push(
        {
          guild: 'Discord Community',
          title: 'Çıt Çıt Çedene',
          author: 'Barış Manço',
          thumbnail: 'https://www.scdn.co/i/_global/twitter_card-default.jpg',
          action: 'Played "Çıt Çıt Çedene" • Barış Manço',
          time: 'Just now',
          isLive: false,
          duration: '03:52'
        },
        {
          guild: 'Discord Community',
          title: 'Seni Dert Etmeler',
          author: 'Madrigal',
          thumbnail: 'https://www.scdn.co/i/_global/twitter_card-default.jpg',
          action: 'Played "Seni Dert Etmeler" • Madrigal',
          time: '2m ago',
          isLive: false,
          duration: '03:08'
        }
      );
    }

    // ONLY return a track as currentTrack if it is GENUINELY streaming right now
    const currentLiveTrack = activities.find((a) => a.isLive === true) || null;

    return NextResponse.json({
      success: true,
      activities,
      currentTrack: currentLiveTrack,
      stats: {
        totalTracksPlayed: totalPlayed || recentTracks.length,
        listeningHours: Math.round(totalListeningMs / (1000 * 60 * 60)) || 1
      }
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err.message,
      activities: [
        {
          guild: 'Nexus Music #1',
          title: 'Çıt Çıt Çedene',
          author: 'Barış Manço',
          action: 'Streaming Lossless in #voice-01',
          time: 'Just now',
          isLive: true,
          duration: '03:52'
        }
      ]
    });
  }
}

