'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  FaDiscord,
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaBroadcastTower,
  FaShieldAlt,
  FaSlidersH,
  FaFolderOpen,
  FaCheck,
  FaChevronDown,
  FaBolt,
  FaHeadphones,
  FaSpotify,
  FaYoutube,
  FaSoundcloud,
  FaApple,
  FaHashtag,
  FaGift
} from 'react-icons/fa';
import { RiSparklingFill, RiEqualizerFill, RiDiscFill } from 'react-icons/ri';
import { MdSpeed, MdAudiotrack } from 'react-icons/md';

export default function DuxStyleHomePage() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [liked, setLiked] = useState(true);
  const [activeFilter, setActiveFilter] = useState('8D Audio');
  const [activeTab, setActiveTab] = useState('playback');
  const [openFaq, setOpenFaq] = useState(0);

  // Live Track & Stream Activities from MongoDB
  const [activities, setActivities] = useState([
    {
      guild: 'Discord Community',
      title: 'Bilir O Beni',
      author: 'Pinhani',
      thumbnail: 'https://www.scdn.co/i/_global/twitter_card-default.jpg',
      action: 'Played "Bilir O Beni" • Pinhani',
      time: 'Just now',
      isLive: false,
      duration: '03:48'
    },
    {
      guild: 'Discord Community',
      title: 'Çıt Çıt Çedene',
      author: 'Barış Manço',
      thumbnail: 'https://www.scdn.co/i/_global/twitter_card-default.jpg',
      action: 'Played "Çıt Çıt Çedene" • Barış Manço',
      time: '5m ago',
      isLive: false,
      duration: '03:52'
    },
    {
      guild: 'Discord Community',
      title: 'Seni Dert Etmeler',
      author: 'Madrigal',
      thumbnail: 'https://www.scdn.co/i/_global/twitter_card-default.jpg',
      action: 'Played "Seni Dert Etmeler" • Madrigal',
      time: '12m ago',
      isLive: false,
      duration: '03:08'
    }
  ]);

  useEffect(() => {
    async function fetchLiveActivity() {
      try {
        const res = await fetch('/api/activity');
        const data = await res.json();
        if (data.success && data.activities?.length) {
          setActivities(data.activities);
        }
      } catch (err) {
        console.error('Failed to fetch live activity:', err);
      }
    }

    fetchLiveActivity();
    const interval = setInterval(fetchLiveActivity, 10000);
    return () => clearInterval(interval);
  }, []);

  // Gamified Lucky Spin Wheel Mock (Dux Signature Feature)
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [wheelReward, setWheelReward] = useState(null);

  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID || '123456789';
  const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands`;

  const dspPresets = [
    { name: '8D Audio', tag: 'Surround', eq: [60, 85, 95, 70, 90, 80, 65] },
    { name: 'Bassboost High', tag: 'Heavy Sub', eq: [95, 90, 75, 45, 50, 65, 80] },
    { name: 'Nightcore', tag: 'Fast/Pitch', eq: [50, 65, 80, 90, 95, 88, 92] },
    { name: 'Vaporwave', tag: 'Slow Chill', eq: [85, 78, 70, 60, 45, 40, 35] },
    { name: 'Lo-Fi Chill', tag: 'Warm Vinyl', eq: [75, 80, 68, 55, 40, 30, 25] },
    { name: 'Karaoke', tag: 'Vocal Cut', eq: [80, 70, 25, 20, 30, 75, 85] }
  ];

  const currentEq = dspPresets.find((p) => p.name === activeFilter)?.eq || [80, 75, 60, 50, 70, 85, 80];

  const packages = [
    {
      badge: 'Core Features',
      title: 'Free Studio Package',
      price: '$0',
      period: 'forever free',
      desc: 'Complete high-fidelity music streaming for gaming and community Discord servers.',
      features: [
        '320kbps Lossless Audio Output',
        'Spotify, YouTube & Apple Music URLs',
        '2 Rows of Interactive Discord Buttons',
        'Seek, Volume & Song Request Modals',
        'All 40 Custom 3D Revera Emojis',
        'Up to 500 Queue Tracks Limit'
      ],
      ctaText: 'Add to Discord',
      href: inviteUrl,
      highlight: false
    },
    {
      badge: 'Popular Choice',
      title: 'Studio Pro Tier',
      price: 'Free',
      period: 'open access',
      desc: 'Full studio capabilities with 24/7 voice persistence and all 13 real-time FFmpeg filters.',
      features: [
        'Everything in Core Features',
        '24/7 Voice Channel Radio Persistence',
        '13+ Studio FFmpeg DSP Filters (8D, Bassboost)',
        'Dedicated #revera-music Auto-Request Channel',
        'Unlimited MongoDB Cloud Playlists',
        'DJ Role Protection & Channel Lockdown',
        'Full Web Dashboard Server Management'
      ],
      ctaText: 'Open Web Dashboard',
      href: '/dashboard',
      highlight: true
    }
  ];

  const commands = {
    playback: [
      { cmd: '/play <query>', desc: 'Play any track or playlist from Spotify, YouTube, SoundCloud with autocomplete.' },
      { cmd: '/panel', desc: 'Summon the interactive controller with buttons, modals, and queue jump menus.' },
      { cmd: '/nowplaying', desc: 'Display a rich progress bar, song requester, active audio filter, and quick buttons.' },
      { cmd: '/search <query>', desc: 'Browse the top 10 search results and select multiple tracks via dropdown.' },
      { cmd: '/pause • /resume', desc: 'Direct playback transport commands.' }
    ],
    management: [
      { cmd: '/queue view [page]', desc: 'Paginated queue explorer with direct track jump selector.' },
      { cmd: '/skip [to] • /stop', desc: 'Skip current track, jump to a specific queue index, or end playback.' },
      { cmd: '/volume <1-100>', desc: 'Adjust master gain volume percentage.' },
      { cmd: '/seek <time>', desc: 'Jump to any timestamp like 1:30 or 90 seconds.' },
      { cmd: '/loop <mode> • /shuffle', desc: 'Cycle Track/Queue/Autoplay modes or randomize upcoming tracks.' }
    ],
    studio: [
      { cmd: '/filter [preset]', desc: 'Apply 13+ studio FFmpeg DSP filters (Bassboost, 8D, Nightcore, Lo-Fi, etc.).' },
      { cmd: '/lyrics [song]', desc: 'Fetch synchronized or plain lyrics for currently playing or searched tracks.' },
      { cmd: '/playlist create', desc: 'Opens a popup Modal to create custom cloud playlists.' },
      { cmd: '/favorites list | play', desc: 'Stream your personal liked songs collection across any server.' }
    ],
    admin: [
      { cmd: '/settings', desc: 'Interactive dashboard with RoleSelectMenu for DJ Role and 24/7 Mode.' },
      { cmd: '/setup create', desc: 'Create a dedicated #revera-music channel for hands-free requests.' },
      { cmd: '/stats • /help', desc: 'Inspect live voice ping, uptime, and explore the interactive command guide.' }
    ]
  };

  const spinWheel = () => {
    if (wheelSpinning) return;
    setWheelSpinning(true);
    setWheelReward(null);
    setTimeout(() => {
      const rewards = ['8D Audio Preset Unlocked', '24/7 Radio Mode Ready', 'Bassboost High Activated', 'VIP Lossless Audio'];
      const picked = rewards[Math.floor(Math.random() * rewards.length)];
      setWheelReward(picked);
      setWheelSpinning(false);
    }, 1800);
  };

  return (
    <div className="relative w-full bg-[#08060d] text-white overflow-hidden bg-dux-grid font-['Plus_Jakarta_Sans',sans-serif]">
      {/* ========================================================= */}
      {/* AMBIENT HERO AURORA GLOW (Extending Behind Navbar)        */}
      {/* ========================================================= */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] sm:w-[1000px] h-[450px] bg-gradient-to-b from-[#ff2a9d]/25 via-[#a855f7]/15 to-transparent blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute -top-10 left-1/4 w-[350px] h-[350px] bg-cyan-500/10 blur-[110px] rounded-full pointer-events-none" />
        <div className="absolute top-10 right-1/4 w-[350px] h-[350px] bg-pink-500/15 blur-[110px] rounded-full pointer-events-none" />
      </div>

      {/* ========================================================= */}
      {/* DUX / TEBEX HERO SECTION WITH AURORA RADIAL GLOW          */}
      {/* ========================================================= */}
      <section className="relative pt-28 sm:pt-36 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 dux-radial-glow z-10">
        <div className="flex flex-col items-center text-center">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full dux-card border border-white/10 text-xs font-extrabold text-pink-400 mb-8 shadow-xl">
            <RiSparklingFill className="text-[#ff2a9d] text-sm" />
            <span>Next-Gen Discord Audio Architecture</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
          </div>

          {/* Dux High-Impact Heading */}
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight text-white max-w-5xl leading-[1.05]">
            Ultra-Crisp Sound. <br />
            <span className="text-dux-pink">Zero Compromises.</span>
          </h1>

          <p className="mt-8 text-lg sm:text-xl text-gray-300 max-w-2xl font-normal leading-relaxed">
            Elevate your Discord server with 320kbps lossless streaming from Spotify & YouTube,
            interactive Discord button controls, 13+ studio FFmpeg DSP filters, and a real-time web dashboard.
          </p>

          {/* Dux Dual Action Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href={inviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-xl text-sm sm:text-base font-extrabold text-white btn-dux-primary flex items-center gap-3 transition-transform active:scale-95 shadow-2xl shadow-pink-500/30 cursor-pointer"
            >
              <FaDiscord className="text-xl" />
              <span>Add to Discord</span>
            </a>
            <Link
              href="/dashboard"
              className="px-8 py-4 rounded-xl text-sm sm:text-base font-extrabold text-white dux-card hover:border-pink-500/40 hover:bg-white/[0.04] flex items-center gap-3 transition-all cursor-pointer"
            >
              <FaSlidersH className="text-pink-400 text-sm" />
              <span>Open Server Dashboard</span>
            </Link>
          </div>

          {/* Supported Streaming Media Logos */}
          <div className="mt-10 flex items-center gap-6 sm:gap-10 text-gray-400 text-xs font-extrabold uppercase tracking-widest font-mono">
            <span>Powered By:</span>
            <div className="flex items-center gap-6 text-2xl text-gray-300">
              <FaSpotify className="hover:text-[#1db954] transition-colors" title="Spotify Lossless" />
              <FaYoutube className="hover:text-[#ff0000] transition-colors" title="YouTube Music" />
              <FaApple className="hover:text-pink-400 transition-colors" title="Apple Music" />
              <FaSoundcloud className="hover:text-[#ff5500] transition-colors" title="SoundCloud" />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* ANNOUNCEMENT BANNER (Positioned Above Live Activity)      */}
      {/* ========================================================= */}
      <div className="w-full bg-gradient-to-r from-[#ff2a9d] via-[#a855f7] to-[#06b6d4] text-[#08060d] py-2.5 px-4 text-center text-xs font-black tracking-wide flex items-center justify-center gap-3 shadow-lg z-20 relative">
        <span className="px-2 py-0.5 rounded-full bg-black/20 text-white font-extrabold text-[10px] uppercase tracking-wider">
          New Release
        </span>
        <span>Revera v1.0 is live! 320kbps Lossless streaming, 13+ DSP Filters & Web Dashboard</span>
        <Link href="/dashboard" className="underline font-black hover:opacity-85 text-white hidden sm:inline">
          Launch Dashboard →
        </Link>
      </div>

      {/* ========================================================= */}
      {/* 3. RECENT EVENTS / LIVE STREAM TICKER (Live MongoDB Data) */}
      {/* ========================================================= */}
      <section className="w-full border-b border-white/[0.06] bg-[#0c0914] py-3.5 overflow-hidden">
        <div className="flex items-center">
          <div className="px-6 shrink-0 flex items-center gap-2.5 text-xs font-black text-pink-400 uppercase tracking-widest border-r border-white/10">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>Live Activity:</span>
          </div>

          <div className="overflow-hidden flex-1 relative flex gap-6 select-none">
            {/* Track 1 */}
            <div className="animate-marquee">
              {(activities.length < 8
                ? activities.concat(activities).concat(activities).concat(activities)
                : activities.concat(activities)
              ).map((item, idx) => (
                <div
                  key={`track1-${idx}`}
                  className="flex items-center gap-3 text-xs text-gray-300 whitespace-nowrap bg-white/[0.03] hover:bg-white/[0.06] px-3.5 py-1.5 rounded-xl border border-white/[0.06] transition-colors"
                >
                  {item.thumbnail && (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-5 h-5 rounded-md object-cover border border-white/10 shrink-0"
                    />
                  )}
                  <strong className="text-white font-bold tracking-tight">{item.title}</strong>
                  <span className="text-pink-300 font-medium">{item.author}</span>
                  <span className="text-gray-600">•</span>
                  {item.isLive ? (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                      LIVE
                    </span>
                  ) : (
                    <span className="text-gray-500 font-mono text-[10px]">Played</span>
                  )}
                  <span className="text-gray-500 font-mono text-[10px]">({item.time})</span>
                </div>
              ))}
            </div>

            {/* Track 2 (Duplicate for Seamless Infinite Loop) */}
            <div className="animate-marquee" aria-hidden="true">
              {(activities.length < 8
                ? activities.concat(activities).concat(activities).concat(activities)
                : activities.concat(activities)
              ).map((item, idx) => (
                <div
                  key={`track2-${idx}`}
                  className="flex items-center gap-3 text-xs text-gray-300 whitespace-nowrap bg-white/[0.03] hover:bg-white/[0.06] px-3.5 py-1.5 rounded-xl border border-white/[0.06] transition-colors"
                >
                  {item.thumbnail && (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-5 h-5 rounded-md object-cover border border-white/10 shrink-0"
                    />
                  )}
                  <strong className="text-white font-bold tracking-tight">{item.title}</strong>
                  <span className="text-pink-300 font-medium">{item.author}</span>
                  <span className="text-gray-600">•</span>
                  {item.isLive ? (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                      LIVE
                    </span>
                  ) : (
                    <span className="text-gray-500 font-mono text-[10px]">Played</span>
                  )}
                  <span className="text-gray-500 font-mono text-[10px]">({item.time})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. DUX GAMIFIED LUCKY WHEEL (Daily Interactive Feature)   */}
      {/* ========================================================= */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="dux-card p-8 sm:p-10 border border-pink-500/25 bg-gradient-to-r from-[#170e24] via-[#100a1c] to-[#1a0c24] flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 text-pink-400 text-xs font-bold mb-3">
              <FaGift /> Dux Interactive Wheel
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Spin to Unlock Free Audio Presets
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 mt-2 max-w-md">
              Try your luck once a day to unlock instant FFmpeg DSP presets and server optimization boosts!
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 shrink-0">
            <button
              onClick={spinWheel}
              disabled={wheelSpinning}
              className={`px-8 py-3.5 rounded-xl font-extrabold text-white text-sm btn-dux-primary flex items-center gap-2.5 transition-all cursor-pointer ${wheelSpinning ? 'animate-pulse opacity-70' : ''
                }`}
            >
              <span>{wheelSpinning ? 'Spinning Wheel...' : '🎡 Spin the Lucky Wheel'}</span>
            </button>

            {wheelReward && (
              <div className="text-xs font-bold text-emerald-400 animate-bounce">
                🎉 Reward: {wheelReward}!
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. DUX STORE PACKAGES / TIER SHOWCASE (Tebex Products)    */}
      {/* ========================================================= */}
      <section id="packages" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 text-xs font-bold mb-3 border border-purple-500/20">
            Feature Breakdown
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white">
            Everything Included. <span className="text-dux-pink">Zero Paywalls.</span>
          </h2>
          <p className="mt-4 text-gray-400 max-w-xl mx-auto text-sm sm:text-base">
            All premium music streaming tools, FFmpeg studio filters, and web dashboard controls are 100% free for your server.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {packages.map((pkg, idx) => (
            <div
              key={idx}
              className={`dux-card p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden ${pkg.highlight
                  ? 'border-[#ff2a9d]/50 bg-gradient-to-b from-[#1b1029] to-[#0f0918] shadow-2xl shadow-pink-500/15'
                  : 'bg-[#120d1c]'
                }`}
            >
              {pkg.highlight && (
                <div className="absolute top-5 right-5 px-3 py-1 rounded-full bg-gradient-to-r from-[#ff2a9d] to-[#a855f7] text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                  Recommended
                </div>
              )}

              <div>
                <span className="text-xs font-mono font-bold text-pink-400 uppercase tracking-widest block mb-2">
                  {pkg.badge}
                </span>
                <h3 className="text-2xl font-black text-white">{pkg.title}</h3>
                <p className="text-xs sm:text-sm text-gray-400 mt-2 font-normal leading-relaxed">
                  {pkg.desc}
                </p>

                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black text-white font-mono">{pkg.price}</span>
                  <span className="text-xs text-gray-400 font-semibold">{pkg.period}</span>
                </div>

                <div className="mt-8 space-y-3 border-t border-white/5 pt-6">
                  {pkg.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs sm:text-sm text-gray-300">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-xs shrink-0">
                        <FaCheck />
                      </span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-10 pt-4">
                <a
                  href={pkg.href}
                  className={`w-full py-4 rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${pkg.highlight
                      ? 'btn-dux-primary text-white'
                      : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
                    }`}
                >
                  <span>{pkg.ctaText}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. DUX FEATURE BOXES & LIVE CONTROLLER PREVIEW            */}
      {/* ========================================================= */}
      <section id="features" className="py-20 bg-[#0c0914] border-y border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black text-white">
              Studio Power. <span className="text-dux-pink">Seamless Discord Integration.</span>
            </h2>
            <p className="mt-4 text-gray-400 max-w-xl mx-auto text-sm sm:text-base">
              Experience why leading Discord gaming communities trust Revera for their voice channels.
            </p>
          </div>

          {/* Dux Grid Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <FaSlidersH className="text-[#ff2a9d] text-2xl" />,
                title: 'Clickable Transport Panel',
                desc: 'Control music like a real DJ deck. 2 rows of buttons, interactive modals for exact volume & timestamp seek, and instant queue drop menus.'
              },
              {
                icon: <MdAudiotrack className="text-[#a855f7] text-2xl" />,
                title: 'Dedicated Request Channel',
                desc: 'Set up #revera-music so members can type song titles directly. The bot queues the song and maintains an automatically updating pinned controller.'
              },
              {
                icon: <FaBroadcastTower className="text-cyan-400 text-2xl" />,
                title: '24/7 Voice Radio Mode',
                desc: 'Never worry about the bot disconnecting. Enable 24/7 voice persistence in the web dashboard so music flows without pause.'
              },
              {
                icon: <RiEqualizerFill className="text-emerald-400 text-2xl" />,
                title: '13+ Studio DSP Filters',
                desc: 'Transform audio in real time: Bassboost High, 8D Binaural Surround, Nightcore, Vaporwave, and Lo-Fi Chill directly from a select menu.'
              },
              {
                icon: <FaFolderOpen className="text-amber-400 text-2xl" />,
                title: 'Cloud Playlists & Liked Songs',
                desc: 'Every listener gets a personal library for their favorite tracks, with full support for sharing public community playlists stored in MongoDB.'
              },
              {
                icon: <FaShieldAlt className="text-rose-400 text-2xl" />,
                title: 'DJ Permissions & Locks',
                desc: 'Restrict volume changes, queue clears, and track skipping to a custom @DJ role while allowing regular members to request songs.'
              }
            ].map((card, i) => (
              <div
                key={i}
                className="dux-card p-8 flex flex-col justify-between group hover:border-pink-500/40"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {card.icon}
                  </div>
                  <h3 className="text-xl font-black text-white mb-2 group-hover:text-pink-300 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-normal">
                    {card.desc}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-gray-500">
                  <span>REVERA MODULE</span>
                  <span className="text-emerald-400 font-bold">READY ✓</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. REAL-TIME EQUALIZER & AUDIO DSP DEMO                  */}
      {/* ========================================================= */}
      <section id="filters" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="dux-card p-8 sm:p-12 border border-white/10 bg-gradient-to-r from-[#170e24] via-[#100a1c] to-[#130b1e]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-mono font-bold text-pink-400 uppercase tracking-widest block">
                FFmpeg DSP Audio Engine
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                Preview Real-Time <span className="text-dux-pink">Studio Audio Curves</span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                Click any DSP preset below to preview how Revera reshapes the audio frequencies in real time before streaming to Discord voice channels.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                {dspPresets.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => setActiveFilter(p.name)}
                    className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${activeFilter === p.name
                        ? 'bg-pink-500/20 border-[#ff2a9d] text-white shadow-lg shadow-pink-500/20'
                        : 'bg-[#1a1426] border-white/5 text-gray-400 hover:border-white/15'
                      }`}
                  >
                    <p className="text-xs font-black">{p.name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{p.tag}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="bg-[#0b0813] p-6 rounded-2xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-gray-400 font-bold">FFMPEG EQUALIZER GRAPH</span>
                  <span className="text-pink-400 font-black font-mono">{activeFilter}</span>
                </div>

                <div className="h-36 flex items-end justify-between gap-3 pt-4">
                  {currentEq.map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                      <div
                        style={{ height: `${val}%` }}
                        className="w-full rounded-t-lg bg-gradient-to-t from-[#9333ea] to-[#ff2a9d] transition-all duration-300"
                      />
                      <span className="text-[9px] font-mono text-gray-500">
                        {['60Hz', '150Hz', '400Hz', '1k', '2.5k', '6k', '15k'][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 8. COMMAND REFERENCE TABBED EXPLORER                      */}
      {/* ========================================================= */}
      <section id="commands" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Slash Command <span className="text-dux-pink">Reference Deck</span>
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-gray-400">
            Explore all 21 slash commands with live autocomplete support.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-2.5">
            {[
              { id: 'playback', label: 'Playback' },
              { id: 'management', label: 'Queue Controls' },
              { id: 'studio', label: 'DSP & Playlists' },
              { id: 'admin', label: 'Server Setup' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${activeTab === tab.id
                    ? 'btn-dux-primary text-white shadow-lg shadow-pink-500/20'
                    : 'bg-[#140e1f] text-gray-300 hover:text-white border border-white/5'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
          {commands[activeTab].map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl dux-card border border-white/5 hover:border-pink-500/30 transition-all"
            >
              <code className="text-xs sm:text-sm font-mono font-black text-[#ff2a9d]">
                {item.cmd}
              </code>
              <p className="text-xs text-gray-300 mt-1.5 leading-relaxed font-normal">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 9. FREQUENTLY ASKED QUESTIONS (Dux Accordion)             */}
      {/* ========================================================= */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Frequently Asked <span className="text-dux-pink">Questions</span>
          </h2>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'How do I add Revera to my Discord server?',
              a: 'Simply click "Add to Discord" at the top of the page, choose the server you manage, and grant the requested voice permissions. Revera joins ready to play.'
            },
            {
              q: 'Can I stream playlists directly from Spotify or YouTube?',
              a: 'Yes! Paste any track, album, or playlist URL into /play (or drop it into the dedicated #revera-music channel). Revera extracts and streams them seamlessly.'
            },
            {
              q: 'How does the Web Dashboard work with Discord OAuth2?',
              a: 'Click "Sign In" or "Open Web Dashboard". Log in with your Discord account, and the dashboard will automatically list the servers where you have Administrator or Manage Server permissions.'
            },
            {
              q: 'How can I lock music controls to DJ roles?',
              a: 'Open the Web Dashboard, pick your server, select your server’s DJ role from the dropdown, and toggle "DJ Only Mode" ON. Regular members can still request songs, while skip and volume controls remain protected.'
            }
          ].map((faq, idx) => (
            <div key={idx} className="dux-card rounded-2xl border border-white/5 overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                className="w-full px-6 py-4 text-left flex items-center justify-between text-sm font-extrabold text-white cursor-pointer"
              >
                <span>{faq.q}</span>
                <FaChevronDown
                  className={`text-xs text-pink-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''
                    }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-6 pb-5 text-xs sm:text-sm text-gray-300 leading-relaxed border-t border-white/5 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 10. DUX STORE CONVERSION CALLOUT BANNER                   */}
      {/* ========================================================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 my-16">
        <div className="rounded-3xl bg-gradient-to-r from-[#ff2a9d] via-[#a855f7] to-[#06b6d4] p-10 sm:p-14 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-pink-500/25">
          <div className="text-center md:text-left max-w-xl">
            <h3 className="text-3xl sm:text-4xl font-black text-[#08060d] leading-tight">
              Ready to Upgrade Your Server’s Sound?
            </h3>
            <p className="text-[#08060d]/80 text-sm sm:text-base mt-2 font-bold">
              Join leading gaming and community servers streaming lossless audio with zero lag.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 shrink-0">
            <a
              href={inviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-xl bg-[#08060d] hover:bg-[#150f24] text-white font-extrabold text-sm flex items-center gap-2.5 shadow-2xl transition-all cursor-pointer"
            >
              <FaDiscord className="text-lg text-[#ff2a9d]" />
              <span>Add Revera Now</span>
            </a>
            <Link
              href="/dashboard"
              className="px-8 py-4 rounded-xl bg-black/20 hover:bg-black/30 text-white font-extrabold text-sm backdrop-blur-md transition-all cursor-pointer"
            >
              Open Dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
