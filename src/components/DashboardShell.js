'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  FaServer,
  FaSlidersH,
  FaBroadcastTower,
  FaShieldAlt,
  FaFolderOpen,
  FaHeart,
  FaVolumeUp,
  FaHashtag,
  FaLock,
  FaInfinity,
  FaSignOutAlt,
  FaHome,
  FaPlusCircle,
  FaHeadphones,
  FaPlayCircle
} from 'react-icons/fa';
import { RiEqualizerFill, RiDashboardFill } from 'react-icons/ri';
import { MdAudiotrack } from 'react-icons/md';

export default function DashboardShell({
  children,
  activeSection = 'servers',
  onSelectPlugin = null,
  activePlugin = 'volume',
  pluginStates = null,
  onTogglePlugin = null,
  activeGuild = null
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [lastGuildId, setLastGuildId] = useState(null);

  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID || '123456789';
  const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=37047360&scope=bot%20applications.commands`;

  useEffect(() => {
    if (activeGuild?.id) {
      localStorage.setItem('revera_last_guild_id', activeGuild.id);
      setLastGuildId(activeGuild.id);
    } else {
      const saved = localStorage.getItem('revera_last_guild_id');
      if (saved) setLastGuildId(saved);
    }
  }, [activeGuild]);

  // Default visual toggle states when viewing the Server Selection screen
  const [localToggles, setLocalToggles] = useState({
    volume: true,
    stay247: true,
    requestChannel: true,
    djMode: false,
    filters: true,
    channelLock: false,
    autoplay: true
  });

  const effectiveToggles = pluginStates || localToggles;

  const handleSwitchClick = (e, key) => {
    e.stopPropagation();
    if (onTogglePlugin) {
      onTogglePlugin(key);
    } else {
      setLocalToggles((prev) => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const handlePluginRowClick = (key) => {
    if (onSelectPlugin) {
      onSelectPlugin(key);
    } else if (lastGuildId) {
      router.push(`/dashboard/${lastGuildId}?tab=${key}`);
    }
  };

  const musicPlugins = [
    {
      key: 'player',
      label: 'Live Controller',
      icon: <FaPlayCircle />,
      hasToggle: false
    },
    {
      key: 'volume',
      label: 'Player & Volume',
      icon: <FaVolumeUp />,
      hasToggle: true
    },
    {
      key: 'stay247',
      label: '24/7 Voice Radio',
      icon: <FaBroadcastTower />,
      hasToggle: true
    },
    {
      key: 'requestChannel',
      label: 'Request Channel',
      icon: <MdAudiotrack />,
      hasToggle: true
    },
    {
      key: 'djMode',
      label: 'DJ Role & Access',
      icon: <FaShieldAlt />,
      hasToggle: true
    },
    {
      key: 'queueBehavior',
      label: 'Queue & Autoplay',
      icon: <FaInfinity />,
      hasToggle: true
    },
    {
      key: 'filters',
      label: 'Studio DSP Filters',
      icon: <RiEqualizerFill />,
      hasToggle: true
    },
    {
      key: 'channelLock',
      label: 'Command Channel',
      icon: <FaHashtag />,
      hasToggle: true
    }
  ];

  return (
    <div className="min-h-screen w-full bg-[#110f1a] text-white flex flex-col font-['Plus_Jakarta_Sans',sans-serif] select-none tracking-normal">
      {/* ========================================================= */}
      {/* TOP FULL-WIDTH BAR (Matching Reference Image Header)      */}
      {/* ========================================================= */}
      <header className="h-20 w-full bg-[#110f1a] px-6 sm:px-8 flex items-center justify-between shrink-0">
        {/* Left: Brand Logo + Active Server Pill */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="relative w-11 h-11 rounded-2xl p-0.5 group-hover:scale-105 transition-transform">
              <Image
                src="/revera-tp.png"
                alt="Revera Logo"
                width={44}
                height={44}
                className="w-full h-full object-cover rounded-[14px]"
              />
            </div>
            <div>
              <span className="font-black text-lg tracking-wider text-white block leading-none">
                REVERA
              </span>
              <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest">
                Music Studio
              </span>
            </div>
          </Link>

          {activeGuild && (
            <div className="hidden md:flex items-center gap-2.5 pl-6 border-l border-white/10">
              {activeGuild.icon ? (
                <img
                  src={activeGuild.icon}
                  alt={activeGuild.name}
                  className="w-7 h-7 rounded-full object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold">
                  {activeGuild.name?.[0] || 'S'}
                </div>
              )}
              <span className="text-xs font-bold text-gray-200 max-w-[180px] truncate">
                {activeGuild.name}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/25">
                Connected
              </span>
            </div>
          )}
        </div>

        {/* Right: User Avatar + Name + Green Badge + Logout (Matching Reference 3) */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 text-xs font-semibold text-gray-300 transition-colors"
          >
            <FaHome className="text-pink-400" />
            <span>Home Page</span>
          </Link>

          {session?.user && (
            <div className="flex items-center gap-3 pl-2">
              <div className="relative">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-[#a855f7]/60"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#ff2a9d] to-[#a855f7] flex items-center justify-center font-black text-sm">
                    {session.user.name?.[0] || 'U'}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#10b981] ring-2 ring-[#110f1a]" />
              </div>

              <div className="text-left hidden sm:block">
                <p className="text-xs font-black text-white tracking-wide uppercase leading-none mb-1">
                  {session.user.name}
                </p>
                <span className="inline-block px-2 py-0.5 rounded-md bg-[#10b981] text-[#052e16] text-[9px] font-black uppercase tracking-wider">
                  Upgrade
                </span>
              </div>

              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                title="Sign Out"
                className="ml-1 p-2.5 rounded-xl bg-white/[0.04] hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 transition-colors text-xs cursor-pointer"
              >
                <FaSignOutAlt />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ========================================================= */}
      {/* BODY: LEFT SIDEBAR + RECESSED MAIN WORKSPACE              */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col lg:flex-row w-full overflow-hidden">
        {/* LEFT SIDEBAR */}
        <aside className="w-full lg:w-68 bg-[#110f1a] px-5 pb-6 pt-2 flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            {/* Top 4 Primary Navigation Links */}
            <nav className="space-y-1">
              <Link
                href={lastGuildId ? `/dashboard/${lastGuildId}` : '/dashboard'}
                className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeSection === 'guild'
                  ? 'text-white bg-white/[0.07]'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
              >
                <RiDashboardFill className="text-base text-purple-400" />
                <span>Dashboard</span>
              </Link>

              <Link
                href="/dashboard"
                className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeSection === 'servers'
                  ? 'text-white bg-white/[0.07]'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
              >
                <FaServer className="text-sm text-pink-400" />
                <span>Servers</span>
              </Link>

              <Link
                href="/dashboard/playlists"
                className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeSection === 'playlists'
                  ? 'text-white bg-white/[0.07]'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
              >
                <FaFolderOpen className="text-sm text-amber-400" />
                <span>Cloud Playlists</span>
              </Link>

              <Link
                href="/dashboard/favorites"
                className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeSection === 'favorites'
                  ? 'text-white bg-white/[0.07]'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
              >
                <FaHeart className="text-sm text-rose-400" />
                <span>Liked & History</span>
              </Link>
            </nav>

            {/* Divider */}
            <div className="border-t border-white/[0.06]" />

            {/* Music Bot Plugin Controls (Exact Purple Highlight Pill & Toggles from Image) */}
            <div className="space-y-1.5">
              <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                Music Bot Plugins
              </p>

              {musicPlugins.map((item) => {
                const isSelected = activeSection === 'guild' && activePlugin === item.key;
                const isOn = Boolean(effectiveToggles[item.key]);

                return (
                  <div
                    key={item.key}
                    onClick={() => handlePluginRowClick(item.key)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${isSelected
                      ? 'bg-gradient-to-r from-[#8b5cf6] to-[#a855f7] text-white font-bold shadow-lg shadow-purple-500/25'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.03]'
                      }`}
                  >
                    <span className="flex items-center gap-3 truncate pr-2">
                      <span
                        className={`text-sm shrink-0 ${isSelected ? 'text-white' : 'text-gray-400'
                          }`}
                      >
                        {item.icon}
                      </span>
                      <span className="text-xs font-semibold truncate">{item.label}</span>
                    </span>

                    {item.hasToggle && (
                      <button
                        type="button"
                        onClick={(e) => handleSwitchClick(e, item.key)}
                        className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${isSelected
                          ? 'bg-black/25'
                          : isOn
                            ? 'bg-[#8b5cf6]'
                            : 'bg-[#252336]'
                          }`}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded-full shadow-md transform transition-transform ${isOn
                            ? 'translate-x-4 bg-white'
                            : 'translate-x-0 bg-gray-400'
                            }`}
                        />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Emerald/Cyan Action Card (Matching Reference Image Bottom-Left) */}
          <a
            href={inviteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 p-4 rounded-2xl bg-gradient-to-r from-[#10b981] via-[#14b8a6] to-[#06b6d4] text-[#042f2e] flex items-center justify-between shadow-xl shadow-emerald-500/20 hover:brightness-105 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-black/15 text-white flex items-center justify-center text-lg shadow-inner">
                <FaHeadphones />
              </div>
              <div>
                <h4 className="text-xs font-black tracking-tight text-white leading-none">
                  Add to Server
                </h4>
                <p className="text-[10px] font-bold text-emerald-950 mt-1">
                  320kbps Lossless Bot
                </p>
              </div>
            </div>
            <FaPlusCircle className="text-white text-base group-hover:translate-x-0.5 transition-transform" />
          </a>
        </aside>

        {/* RIGHT RECESSED WORKSPACE */}
        <div className="flex-1 bg-[#181624] lg:rounded-tl-[32px] border-t border-l border-white/[0.06] p-6 sm:p-10 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

