import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// MANAGE_GUILD (0x20) or ADMINISTRATOR (0x8)
const MANAGE_GUILD_PERM = 0x20;
const ADMIN_PERM = 0x8;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.accessToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch user guilds from Discord API
    const userGuildsRes = await fetch('https://discord.com/api/v10/users/@me/guilds', {
      headers: { Authorization: `Bearer ${session.accessToken}` }
    });

    if (!userGuildsRes.ok) {
      const err = await userGuildsRes.text();
      return NextResponse.json(
        { success: false, error: `Failed to fetch user guilds: ${err}` },
        { status: userGuildsRes.status }
      );
    }

    const userGuilds = await userGuildsRes.json();

    // 2. Fetch bot's mutual guilds if bot token is configured
    let botGuildIds = new Set();
    const botToken = process.env.DISCORD_BOT_TOKEN;
    if (botToken) {
      try {
        const botGuildsRes = await fetch('https://discord.com/api/v10/users/@me/guilds', {
          headers: { Authorization: `Bot ${botToken}` }
        });
        if (botGuildsRes.ok) {
          const botGuilds = await botGuildsRes.json();
          botGuildIds = new Set(botGuilds.map((g) => g.id));
        }
      } catch (e) {
        console.warn('Could not fetch bot mutual guilds:', e.message);
      }
    }

    // 3. Filter guilds where user has MANAGE_GUILD or ADMINISTRATOR
    const manageableGuilds = userGuilds
      .filter((g) => {
        if (g.owner) return true;
        const perms = BigInt(g.permissions || 0);
        return (
          (perms & BigInt(ADMIN_PERM)) === BigInt(ADMIN_PERM) ||
          (perms & BigInt(MANAGE_GUILD_PERM)) === BigInt(MANAGE_GUILD_PERM)
        );
      })
      .map((g) => ({
        id: g.id,
        name: g.name,
        icon: g.icon
          ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=128`
          : null,
        botInGuild: botGuildIds.has(g.id),
        owner: g.owner
      }));

    return NextResponse.json({ success: true, guilds: manageableGuilds });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

