import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectMongo } from '@/lib/db';
import { UserProfile } from '@/models/UserProfile';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongo();
    const profile = await UserProfile.findOne({ userId: session.user.id }).lean();

    return NextResponse.json({
      success: true,
      profile: profile || {
        userId: session.user.id,
        favorites: [],
        history: [],
        stats: { tracksPlayed: 0, listeningTimeMs: 0 }
      }
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const trackUrl = searchParams.get('url');

    await connectMongo();
    const updated = await UserProfile.findOneAndUpdate(
      { userId: session.user.id },
      { $pull: { favorites: { url: trackUrl } } },
      { new: true }
    ).lean();

    return NextResponse.json({ success: true, profile: updated });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

