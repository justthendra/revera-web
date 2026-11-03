import { NextResponse } from 'next/server';
import { connectMongo } from '@/lib/db';
import { Playlist } from '@/models/Playlist';
import { extractMedia } from '@/lib/importers';

export async function POST(request) {
  try {
    const body = await request.json();
    const { action = 'preview', url, playlistId, guildId, guildName, userId, ownerTag, name, description } = body;

    if (!url || typeof url !== 'string' || !url.trim()) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid Spotify or YouTube URL.' },
        { status: 400 }
      );
    }

    // 1. Preview / Inspection mode
    if (action === 'preview') {
      const media = await extractMedia(url);
      return NextResponse.json({
        success: true,
        media: {
          type: media.type,
          name: media.name,
          thumbnail: media.thumbnail,
          trackCount: media.tracks.length,
          tracks: media.tracks
        }
      });
    }

    // Connect to database for persistent actions
    await connectMongo();

    // 2. Create new server playlist from imported URL
    if (action === 'createAndImport') {
      if (!guildId) {
        return NextResponse.json(
          { success: false, error: 'Target Discord Server (guildId) is required.' },
          { status: 400 }
        );
      }

      const media = await extractMedia(url);
      const playlistName = (name && name.trim()) || media.name || 'Imported Playlist';
      const playlistDesc = (description && description.trim()) || `Imported ${media.tracks.length} tracks from ${media.type.replace('_', ' ')}`;

      const newId = 'pl_' + Math.random().toString(36).substring(2, 9);
      const newPlaylist = await Playlist.create({
        playlistId: newId,
        guildId,
        guildName: guildName || 'Discord Server',
        userId: userId || 'web_user',
        ownerTag: ownerTag || 'Community Member',
        name: playlistName.slice(0, 50),
        description: playlistDesc.slice(0, 160),
        isPublic: false,
        plays: 0,
        tracks: media.tracks.map((t) => ({
          title: t.title,
          url: t.url,
          author: t.author || 'Unknown Artist',
          duration: t.duration || '03:00',
          thumbnail: t.thumbnail || '',
          addedAt: new Date()
        }))
      });

      return NextResponse.json({
        success: true,
        importedCount: media.tracks.length,
        playlist: newPlaylist
      });
    }

    // 3. Append tracks from URL into existing playlist
    if (action === 'appendTracks') {
      if (!playlistId || !guildId) {
        return NextResponse.json(
          { success: false, error: 'playlistId and guildId are required.' },
          { status: 400 }
        );
      }

      const playlist = await Playlist.findOne({ playlistId, guildId });
      if (!playlist) {
        return NextResponse.json(
          { success: false, error: 'Server playlist not found.' },
          { status: 404 }
        );
      }

      const media = await extractMedia(url);
      const newTracks = media.tracks.map((t) => ({
        title: t.title,
        url: t.url,
        author: t.author || 'Unknown Artist',
        duration: t.duration || '03:00',
        thumbnail: t.thumbnail || '',
        addedAt: new Date()
      }));

      playlist.tracks.push(...newTracks);
      playlist.updatedAt = new Date();
      await playlist.save();

      return NextResponse.json({
        success: true,
        importedCount: newTracks.length,
        playlist
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown action specified.' }, { status: 400 });
  } catch (err) {
    console.error('Playlist import error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to import playlist/track.' },
      { status: 500 }
    );
  }
}

