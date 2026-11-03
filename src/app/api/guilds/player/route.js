import { NextResponse } from 'next/server';
import { connectMongo } from '@/lib/db';
import { GuildSettings } from '@/models/GuildSettings';

export async function GET(request) {
  try {
    await connectMongo();
    const { searchParams } = new URL(request.url);
    const guildId = searchParams.get('guildId');

    if (!guildId) {
      return NextResponse.json({ success: false, error: 'guildId is required' }, { status: 400 });
    }

    const doc = await GuildSettings.findOne({ guildId }, { currentTrack: 1, defaultVolume: 1 }).lean();
    const track = doc?.currentTrack;
    const isLive = Boolean(track && track.isPlaying && track.title);

    return NextResponse.json({
      success: true,
      currentTrack: isLive ? track : null,
      defaultVolume: doc?.defaultVolume ?? 80
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectMongo();
    const body = await request.json();
    const { guildId, action, params = {} } = body;

    if (!guildId || !action) {
      return NextResponse.json(
        { success: false, error: 'guildId and action are required' },
        { status: 400 }
      );
    }

    const actionPayload = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      action,
      params,
      createdAt: new Date()
    };

    const updated = await GuildSettings.findOneAndUpdate(
      { guildId },
      { $set: { remoteAction: actionPayload } },
      { new: true, upsert: true }
    ).lean();

    return NextResponse.json({
      success: true,
      actionId: actionPayload.id,
      currentTrack: updated?.currentTrack || null
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

