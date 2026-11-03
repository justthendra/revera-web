'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import {
  FaDiscord,
  FaSearch,
  FaCrown,
  FaServer,
  FaSyncAlt
} from 'react-icons/fa';
import DashboardShell from '@/components/DashboardShell';

export default function SelectServerDashboardPage() {
  const { data: session, status } = useSession();
  const [guilds, setGuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'active'

  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID || '123456789';

  useEffect(() => {
    if (session) {
      fetchGuilds();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [session, status]);

  async function fetchGuilds() {
    setLoading(true);
    try {
      const res = await fetch('/api/user/guilds');
      const data = await res.json();
      if (data.success && data.guilds) {
        setGuilds(data.guilds);
        const firstActive = data.guilds.find((g) => g.botInGuild);
        if (firstActive && !localStorage.getItem('revera_last_guild_id')) {
          localStorage.setItem('revera_last_guild_id', firstActive.id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filteredGuilds = guilds.filter((g) => {
    const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase());
    if (filterMode === 'active') return matchesSearch && g.botInGuild;
    return matchesSearch;
  });

  // Soft ambient glowing backdrops matching the reference image cards
  const cardBackdrops = [
    'from-[#3b4cca]/60 via-[#2a3366]/80 to-[#1f243d]',
    'from-[#7c4d6b]/60 via-[#52394a]/80 to-[#2b2028]',
    'from-[#3d7c8a]/60 via-[#2d535c]/80 to-[#1c2f36]',
    'from-[#8a6d3d]/60 via-[#5c4a2d]/80 to-[#332a1c]',
    'from-[#6c3d8a]/60 via-[#482d5c]/80 to-[#261c33]',
    'from-[#8a3d5c]/60 via-[#5c2d40]/80 to-[#331c26]'
  ];

  if (status !== 'loading' && !session) {
    return (
      <div className="min-h-screen w-full bg-[#110f1a] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#181624] p-8 sm:p-10 rounded-3xl text-center border border-white/10 shadow-2xl">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl p-0.5 bg-gradient-to-tr from-[#ff2a9d] to-[#a855f7] flex items-center justify-center">
            <div className="w-full h-full bg-[#110f1a] rounded-[14px] flex items-center justify-center">
              <FaDiscord className="text-4xl text-[#ff2a9d]" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Revera Music <span className="text-gradient">Dashboard</span>
          </h1>
          <p className="mt-3 text-sm text-gray-400 leading-relaxed">
            Sign in with your Discord account to configure 24/7 radio mode, default volume, DJ permissions, and dedicated song request channels for your servers.
          </p>
          <button
            onClick={() => signIn('discord')}
            className="mt-8 w-full py-3.5 rounded-xl font-bold text-white btn-mee6 flex items-center justify-center gap-2.5 transition-transform active:scale-95 cursor-pointer text-sm"
          >
            <FaDiscord className="text-lg" />
            <span>Sign in with Discord</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <DashboardShell activeSection="servers">
      {/* Top Header Row inside Workspace: "Select a Server" + Search Input + Filter Pill */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8">
        <div className="flex flex-wrap items-center gap-6">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Select a Server
          </h1>

          {/* Search Input (Exact Pill Style from Reference Image) */}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter Server"
              className="pl-5 pr-11 py-2.5 rounded-xl bg-[#211f30] border border-white/[0.06] text-white text-xs placeholder:text-gray-400 focus:outline-none focus:border-purple-500/50 w-56 sm:w-72 font-medium"
            />
            <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
          </div>
        </div>

        {/* Right Filter / Status Pills */}
        <div className="flex items-center gap-3">
          <button
            onClick={fetchGuilds}
            title="Refresh Servers"
            className="p-2.5 rounded-xl bg-[#211f30] hover:bg-[#2a273d] border border-white/[0.06] text-gray-300 text-xs transition-colors cursor-pointer"
          >
            <FaSyncAlt className={loading ? 'animate-spin text-pink-400' : ''} />
          </button>

          <button
            onClick={() => setFilterMode(filterMode === 'all' ? 'active' : 'all')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              filterMode === 'active'
                ? 'bg-[#10b981]/20 border-[#10b981]/50 text-[#10b981]'
                : 'bg-[#162726] border-[#10b981]/30 text-white hover:border-[#10b981]/60'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-[#10b981] text-[#052e16] flex items-center justify-center text-[10px]">
              <FaCrown />
            </span>
            <span>{filterMode === 'active' ? 'Showing Active Only' : 'Lossless Audio'}</span>
          </button>
        </div>
      </div>

      {/* Servers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-2">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="h-48 rounded-2xl bg-[#211f30]/60 border border-white/5 animate-pulse"
            />
          ))}
        </div>
      ) : filteredGuilds.length === 0 ? (
        <div className="py-28 text-center rounded-3xl mt-4 p-12 bg-[#211f30]/40 border border-white/5">
          <FaServer className="text-4xl text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-1">No Matching Servers Found</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            {search
              ? `No manageable server matched "${search}".`
              : 'You need Administrator or Manage Server permission in a Discord server to configure Revera.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-2">
          {filteredGuilds.map((guild, idx) => {
            const backdrop = cardBackdrops[idx % cardBackdrops.length];
            const inviteGuildUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&guild_id=${guild.id}&permissions=8&scope=bot%20applications.commands`;

            return (
              <div
                key={guild.id}
                className="bg-[#14131d] rounded-2xl overflow-hidden border border-white/[0.06] hover:border-purple-500/40 transition-all flex flex-col justify-between group shadow-xl hover:-translate-y-1"
              >
                {/* Frosted Blurred Top Banner with White Circle Icon */}
                <div
                  className={`relative h-32 bg-gradient-to-br ${backdrop} flex items-center justify-center overflow-hidden`}
                >
                  {/* Ambient radial glow behind avatar */}
                  <div className="absolute w-24 h-24 rounded-full bg-white/20 blur-xl pointer-events-none" />

                  <div className="relative w-18 h-18 rounded-full bg-white p-1 shadow-2xl flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
                    {guild.icon ? (
                      <img
                        src={guild.icon}
                        alt={guild.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-[#7c3aed] to-[#ff2a9d] rounded-full flex items-center justify-center font-black text-white text-lg">
                        {guild.name
                          .split(' ')
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Bar: Server Name + Role + Go/Setup Pill Button */}
                <div className="px-4 py-3.5 bg-[#14131d] flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">
                      {guild.name}
                    </h4>
                    <span className="text-[11px] text-gray-500 font-medium block mt-0.5">
                      {guild.owner ? 'Owner' : 'DJ Master'}
                    </span>
                  </div>

                  {guild.botInGuild ? (
                    <Link
                      href={`/dashboard/${guild.id}`}
                      className="px-5 py-1.5 rounded-lg text-xs font-extrabold text-white bg-[#10b981] hover:bg-[#059669] shadow-md shadow-emerald-500/20 transition-all shrink-0"
                    >
                      Go
                    </Link>
                  ) : (
                    <a
                      href={inviteGuildUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-1.5 rounded-lg text-xs font-extrabold text-[#1a1302] bg-[#facc15] hover:bg-[#eab308] shadow-md shadow-yellow-500/20 transition-all shrink-0"
                    >
                      Setup
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
