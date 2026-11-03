import { NextResponse } from 'next/server';
import { connectMongo } from '@/lib/db';
import { Playlist } from '@/models/Playlist';

export async function GET(request) {
  try {
    await connectMongo();
    const { searchParams } = new URL(request.url);
    const guildId = searchParams.get('guildId');
    const userId = searchParams.get('userId');

    // Server-scoped: only return playlists belonging to the requested server
    if (guildId) {
      const playlists = await Playlist.find({ guildId }).sort({ updatedAt: -1 });
      return NextResponse.json({ success: true, playlists });
    }

    // User-scoped: only return personal playlists of the user
    if (userId) {
      const playlists = await Playlist.find({ userId }).sort({ updatedAt: -1 });
      return NextResponse.json({ success: true, playlists });
    }

    // Never expose private server playlists to anonymous global visitors
    return NextResponse.json({ success: true, playlists: [] });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectMongo();
    const body = await request.json();
    const { name, userId, ownerTag, guildId, guildName, description } = body;

    if (!name || !guildId) {
      return NextResponse.json(
        { success: false, error: 'Playlist name and Discord Server (guildId) are required.' },
        { status: 400 }
      );
    }

    const playlistId = 'pl_' + Math.random().toString(36).substring(2, 9);
    const newPlaylist = await Playlist.create({
      playlistId,
      guildId,
      guildName: guildName || 'Discord Server',
      userId: userId || 'web_user',
      ownerTag: ownerTag || 'Community Member',
      name: name.trim().slice(0, 50),
      description: (description || 'Server Playlist').trim().slice(0, 160),
      isPublic: false,
      plays: 0,
      tracks: []
    });

    return NextResponse.json({ success: true, playlist: newPlaylist });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    await connectMongo();
    const body = await request.json();
    const { action, playlistId, guildId, track, trackIndex } = body;

    if (!playlistId || !guildId) {
      return NextResponse.json(
        { success: false, error: 'playlistId and guildId are required' },
        { status: 400 }
      );
    }

    const playlist = await Playlist.findOne({ playlistId, guildId });
    if (!playlist) {
      return NextResponse.json(
        { success: false, error: 'Playlist not found in this server.' },
        { status: 404 }
      );
    }

    if (action === 'addTrack') {
      if (!track?.title || !track?.url) {
        return NextResponse.json({ success: false, error: 'Valid track is required.' }, { status: 400 });
      }

      playlist.tracks.push({
        title: track.title,
        url: track.url,
        author: track.author || 'Unknown Artist',
        duration: track.duration || '00:00',
        thumbnail: track.thumbnail || '',
        addedAt: new Date()
      });
      playlist.updatedAt = new Date();
      await playlist.save();

      return NextResponse.json({ success: true, playlist });
    }

    if (action === 'removeTrack') {
      if (typeof trackIndex !== 'number' || trackIndex < 0 || trackIndex >= playlist.tracks.length) {
        return NextResponse.json({ success: false, error: 'Invalid track index.' }, { status: 400 });
      }

      playlist.tracks.splice(trackIndex, 1);
      playlist.updatedAt = new Date();
      await playlist.save();

      return NextResponse.json({ success: true, playlist });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await connectMongo();
    const { searchParams } = new URL(request.url);
    const playlistId = searchParams.get('playlistId');
    const guildId = searchParams.get('guildId');

    if (!playlistId || !guildId) {
      return NextResponse.json(
        { success: false, error: 'playlistId and guildId are required' },
        { status: 400 }
      );
    }

    const deleted = await Playlist.findOneAndDelete({ playlistId, guildId });
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Playlist not found in this server.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Playlist deleted.' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
