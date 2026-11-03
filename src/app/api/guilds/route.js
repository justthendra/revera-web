import { NextResponse } from 'next/server';
import { connectMongo } from '@/lib/db';
import { GuildSettings } from '@/models/GuildSettings';

export async function GET(request) {
  try {
    await connectMongo();
    const { searchParams } = new URL(request.url);
    const guildId = searchParams.get('guildId');

    if (guildId) {
      const settings = await GuildSettings.findOne({ guildId }).lean();

      // Fetch real Guild Info, Roles, and Channels from Discord API using Bot Token
      let discordGuild = null;
      let roles = [];
      let textChannels = [];
      let voiceChannels = [];

      const botToken = process.env.DISCORD_BOT_TOKEN;
      if (botToken) {
        try {
          const [guildRes, channelsRes, rolesRes] = await Promise.all([
            fetch(`https://discord.com/api/v10/guilds/${guildId}`, {
              headers: { Authorization: `Bot ${botToken}` }
            }),
            fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
              headers: { Authorization: `Bot ${botToken}` }
            }),
            fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
              headers: { Authorization: `Bot ${botToken}` }
            })
          ]);

          if (guildRes.ok) {
            const gData = await guildRes.json();
            discordGuild = {
              id: gData.id,
              name: gData.name,
              icon: gData.icon
                ? `https://cdn.discordapp.com/icons/${gData.id}/${gData.icon}.png?size=128`
                : null
            };
          }

          if (channelsRes.ok) {
            const cData = await channelsRes.json();
            if (Array.isArray(cData)) {
              textChannels = cData
                .filter((c) => c.type === 0 || c.type === 5)
                .sort((a, b) => a.position - b.position)
                .map((c) => ({ id: c.id, name: c.name }));
              voiceChannels = cData
                .filter((c) => c.type === 2 || c.type === 13)
                .sort((a, b) => a.position - b.position)
                .map((c) => ({ id: c.id, name: c.name }));
            }
          }

          if (rolesRes.ok) {
            const rData = await rolesRes.json();
            if (Array.isArray(rData)) {
              roles = rData
                .filter((r) => r.name !== '@everyone' && !r.managed)
                .sort((a, b) => b.position - a.position)
                .map((r) => ({ id: r.id, name: r.name, color: r.color }));
            }
          }
        } catch (err) {
          console.warn('Could not fetch live guild metadata from Discord:', err.message);
        }
      }

      return NextResponse.json({
        success: true,
        guild: discordGuild,
        roles,
        textChannels,
        voiceChannels,
        settings: settings || {
          guildId,
          djRoleId: null,
          djOnlyMode: false,
          defaultVolume: 80,
          restrictedTextChannelId: null,
          twentyFourSeven: { enabled: false, voiceChannelId: null, textChannelId: null },
          requestChannel: { channelId: null, messageId: null },
          announceSongs: true,
          autoDisconnectTime: 300,
          voteSkipEnabled: false,
          preventDuplicates: false
        }
      });
    }

    const allSettings = await GuildSettings.find().limit(50).lean();
    return NextResponse.json({ success: true, list: allSettings });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectMongo();
    const body = await request.json();
    const { guildId, ...updateData } = body;

    if (!guildId) {
      return NextResponse.json({ success: false, error: 'guildId is required' }, { status: 400 });
    }

    const updated = await GuildSettings.findOneAndUpdate(
      { guildId },
      { $set: updateData },
      { new: true, upsert: true }
    ).lean();

    return NextResponse.json({ success: true, settings: updated });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
