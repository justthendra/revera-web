'use client';

import { Suspense, useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  FaArrowLeft,
  FaVolumeUp,
  FaBroadcastTower,
  FaShieldAlt,
  FaSave,
  FaCheck,
  FaHashtag,
  FaInfinity,
  FaPlay,
  FaPause,
  FaForward,
  FaStop,
  FaRandom,
  FaRedo,
  FaUndo,
  FaMusic,
  FaBell,
  FaClock,
  FaVoteYea,
  FaCopy,
  FaFolderOpen,
  FaExternalLinkAlt,
  FaChevronDown,
  FaChevronUp,
  FaTimes,
  FaListUl
} from 'react-icons/fa';
import { RiEqualizerFill, RiDiscFill } from 'react-icons/ri';
import { MdAudiotrack } from 'react-icons/md';
import DashboardShell from '@/components/DashboardShell';

const AUDIO_FILTERS_SHOWCASE = [
  { name: 'Bassboost', tag: 'Low-End Punch', cmd: '/filter preset:bassboost' },
  { name: 'Bassboost High', tag: 'Extreme Sub-Bass', cmd: '/filter preset:bassboost_high' },
  { name: '8D Audio', tag: 'Binaural Surround', cmd: '/filter preset:8D' },
  { name: 'Nightcore', tag: 'Upbeat & Pitch+', cmd: '/filter preset:nightcore' },
  { name: 'Vaporwave', tag: 'Slowed & Aesthetic', cmd: '/filter preset:vaporwave' },
  { name: 'Lo-Fi Chill', tag: 'Warm Vintage Vinyl', cmd: '/filter preset:lofi' },
  { name: 'Karaoke', tag: 'Vocal Attenuation', cmd: '/filter preset:karaoke' },
  { name: 'Subboost', tag: 'Ultra-Low Sub', cmd: '/filter preset:subboost' },
  { name: 'Tremolo', tag: 'Amplitude Pulse', cmd: '/filter preset:tremolo' },
  { name: 'Vibrato', tag: 'Pitch Modulation', cmd: '/filter preset:vibrato' },
  { name: 'Phaser', tag: 'Phase Sweep', cmd: '/filter preset:phaser' },
  { name: 'Chorus', tag: 'Harmonic Ensemble', cmd: '/filter preset:chorus' },
  { name: 'Normalizer', tag: 'Dynamic Balance', cmd: '/filter preset:normalizer' }
];

function GuildDashboardInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const guildId = params?.guildId;

  const [activePlugin, setActivePlugin] = useState(searchParams.get('tab') || 'player');
  const [guildMeta, setGuildMeta] = useState(null);
  const [roles, setRoles] = useState([]);
  const [textChannels, setTextChannels] = useState([]);
  const [voiceChannels, setVoiceChannels] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Live Web Player State
  const [liveTrack, setLiveTrack] = useState(null);
  const [liveVolume, setLiveVolume] = useState(80);
  const [loopMode, setLoopMode] = useState(0); // 0 = off, 1 = track, 2 = queue
  const [streamInput, setStreamInput] = useState('');
  const [sendingCmd, setSendingCmd] = useState(false);

  // Server Custom Playlists in Live Controller
  const [serverPlaylists, setServerPlaylists] = useState([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [playlistsDrawerOpen, setPlaylistsDrawerOpen] = useState(true);
  const [selectedPlaylistPreview, setSelectedPlaylistPreview] = useState(null);
  const [playlistNotice, setPlaylistNotice] = useState(null);

  // Server Settings State
  const [settings, setSettings] = useState({
    guildId,
    djRoleId: '',
    djOnlyMode: false,
    defaultVolume: 80,
    restrictedTextChannelId: '',
    twentyFourSeven: { enabled: false, voiceChannelId: '', textChannelId: '' },
    requestChannel: { channelId: '', messageId: '' },
    announceSongs: true,
    autoDisconnectTime: 300,
    voteSkipEnabled: false,
    preventDuplicates: false
  });

  useEffect(() => {
    if (guildId) {
      fetchGuildConfig();
      fetchLivePlayer();
      fetchServerPlaylists();
      const interval = setInterval(fetchLivePlayer, 3000);
      return () => clearInterval(interval);
    }
  }, [guildId]);

  async function fetchGuildConfig() {
    setLoading(true);
    try {
      const res = await fetch(`/api/guilds?guildId=${guildId}`);
      const data = await res.json();
      if (data.success) {
        if (data.guild) setGuildMeta(data.guild);
        if (data.roles) setRoles(data.roles);
        if (data.textChannels) setTextChannels(data.textChannels);
        if (data.voiceChannels) setVoiceChannels(data.voiceChannels);
        if (data.settings) {
          setSettings({
            guildId,
            djRoleId: data.settings.djRoleId || '',
            djOnlyMode: Boolean(data.settings.djOnlyMode),
            defaultVolume: data.settings.defaultVolume ?? 80,
            restrictedTextChannelId: data.settings.restrictedTextChannelId || '',
            twentyFourSeven: {
              enabled: Boolean(data.settings.twentyFourSeven?.enabled),
              voiceChannelId: data.settings.twentyFourSeven?.voiceChannelId || '',
              textChannelId: data.settings.twentyFourSeven?.textChannelId || ''
            },
            requestChannel: {
              channelId: data.settings.requestChannel?.channelId || '',
              messageId: data.settings.requestChannel?.messageId || ''
            },
            announceSongs: data.settings.announceSongs !== false,
            autoDisconnectTime: data.settings.autoDisconnectTime ?? 300,
            voteSkipEnabled: Boolean(data.settings.voteSkipEnabled),
            preventDuplicates: Boolean(data.settings.preventDuplicates)
          });
          if (data.settings.defaultVolume) setLiveVolume(data.settings.defaultVolume);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchLivePlayer() {
    try {
      const res = await fetch(`/api/guilds/player?guildId=${guildId}`);
      const data = await res.json();
      if (data.success) {
        setLiveTrack(data.currentTrack || null);
        if (typeof data.defaultVolume === 'number') {
          setLiveVolume(data.defaultVolume);
        }
      }
    } catch (err) {
      // Quiet fail on polling
    }
  }

  // Send Remote Transport Action to Bot in Discord
  async function sendRemoteAction(action, actParams = {}) {
    setSendingCmd(true);
    try {
      await fetch('/api/guilds/player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guildId,
          action,
          params: actParams
        })
      });
      setTimeout(fetchLivePlayer, 500);
    } catch (err) {
      console.error('Remote action failed:', err);
    } finally {
      setSendingCmd(false);
    }
  }

  // Stream Track from Web Input to Discord Voice
  function handleStreamToVoice(e) {
    e.preventDefault();
    if (!streamInput.trim()) return;
    sendRemoteAction('play', { query: streamInput.trim() });
    setStreamInput('');
  }

  // Fetch Server-Specific Playlists
  async function fetchServerPlaylists() {
    if (!guildId) return;
    setLoadingPlaylists(true);
    try {
      const res = await fetch(`/api/playlists?guildId=${guildId}`);
      const data = await res.json();
      if (data.success && data.playlists) {
        setServerPlaylists(data.playlists);
      }
    } catch (err) {
      console.error('Failed to fetch server playlists:', err);
    } finally {
      setLoadingPlaylists(false);
    }
  }

  // Play an entire Server Playlist in Voice
  async function handlePlayServerPlaylist(pl) {
    if (!pl || !pl.tracks?.length) return;
    const initialTrack = pl.tracks[0];
    const query = initialTrack?.url || `${initialTrack?.title} ${initialTrack?.author}`;
    sendRemoteAction('playPlaylist', {
      playlistId: pl.playlistId || pl._id,
      name: pl.name,
      query
    });
    setPlaylistNotice(`Streaming "${pl.name}" (${pl.tracks.length} tracks) to voice channel...`);
    setTimeout(() => setPlaylistNotice(null), 4500);
  }

  // Play a single selected track immediately from playlist inspection
  function handlePlayTrackFromPlaylist(track, plName) {
    if (!track) return;
    const query = track.url || `${track.title} ${track.author}`;
    sendRemoteAction('playNow', {
      query,
      playNow: true,
      title: track.title,
      author: track.author
    });
    setPlaylistNotice(`Switching playback to "${track.title}" from "${plName}"...`);
    setTimeout(() => setPlaylistNotice(null), 4500);
  }

  async function persistSettings(nextSettings) {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('/api/guilds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...nextSettings,
          guildId,
          djRoleId: nextSettings.djRoleId || null,
          restrictedTextChannelId: nextSettings.restrictedTextChannelId || null,
          twentyFourSeven: {
            enabled: Boolean(nextSettings.twentyFourSeven?.enabled),
            voiceChannelId: nextSettings.twentyFourSeven?.voiceChannelId || null,
            textChannelId: nextSettings.twentyFourSeven?.textChannelId || null
          },
          requestChannel: {
            channelId: nextSettings.requestChannel?.channelId || null,
            messageId: nextSettings.requestChannel?.messageId || null
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  function handleSaveForm(e) {
    e.preventDefault();
    persistSettings(settings);
  }

  // Sidebar live plugin toggles
  const pluginStates = {
    player: Boolean(liveTrack?.isPlaying),
    volume: true,
    stay247: Boolean(settings.twentyFourSeven?.enabled),
    requestChannel: Boolean(settings.requestChannel?.channelId),
    djMode: Boolean(settings.djOnlyMode),
    queueBehavior: Boolean(settings.announceSongs || settings.preventDuplicates),
    filters: true,
    channelLock: Boolean(settings.restrictedTextChannelId)
  };

  function handleToggleSidebarPlugin(key) {
    setActivePlugin(key);
    let updated = { ...settings };

    if (key === 'stay247') {
      updated = {
        ...settings,
        twentyFourSeven: {
          ...settings.twentyFourSeven,
          enabled: !settings.twentyFourSeven?.enabled
        }
      };
      setSettings(updated);
      persistSettings(updated);
    } else if (key === 'djMode') {
      updated = {
        ...settings,
        djOnlyMode: !settings.djOnlyMode
      };
      setSettings(updated);
      persistSettings(updated);
    } else if (key === 'queueBehavior') {
      updated = {
        ...settings,
        announceSongs: !settings.announceSongs
      };
      setSettings(updated);
      persistSettings(updated);
    } else if (key === 'channelLock' && settings.restrictedTextChannelId) {
      updated = {
        ...settings,
        restrictedTextChannelId: ''
      };
      setSettings(updated);
      persistSettings(updated);
    } else if (key === 'requestChannel' && settings.requestChannel?.channelId) {
      updated = {
        ...settings,
        requestChannel: { channelId: '', messageId: '' }
      };
      setSettings(updated);
      persistSettings(updated);
    }
  }

  return (
    <DashboardShell
      activeSection="guild"
      activePlugin={activePlugin}
      onSelectPlugin={setActivePlugin}
      pluginStates={pluginStates}
      onTogglePlugin={handleToggleSidebarPlugin}
      activeGuild={
        guildMeta || {
          id: guildId,
          name: `Server #${String(guildId).slice(-4)}`,
          icon: null
        }
      }
    >
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 border-b border-white/[0.06]">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white mb-2 transition-colors"
          >
            <FaArrowLeft className="text-[10px]" />
            <span>Back to All Servers</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>{guildMeta?.name || 'Server Audio Studio'}</span>
            <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/30">
              320kbps Lossless
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              const defaults = {
                guildId,
                djRoleId: '',
                djOnlyMode: false,
                defaultVolume: 80,
                restrictedTextChannelId: '',
                twentyFourSeven: { enabled: false, voiceChannelId: '', textChannelId: '' },
                requestChannel: { channelId: '', messageId: '' },
                announceSongs: true,
                autoDisconnectTime: 300,
                voteSkipEnabled: false,
                preventDuplicates: false
              };
              setSettings(defaults);
              persistSettings(defaults);
            }}
            className="px-4 py-2.5 rounded-xl bg-[#211f30] hover:bg-[#2a273d] border border-white/10 text-xs font-bold text-gray-300 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <FaUndo className="text-[10px]" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSaveForm}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-[#10b981] hover:bg-[#059669] shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {saved ? (
              <>
                <FaCheck />
                <span>Saved to MongoDB!</span>
              </>
            ) : (
              <>
                <FaSave />
                <span>{saving ? 'Saving...' : 'Save Settings'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-28 text-center text-gray-400">
          <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold">Synchronizing Discord server channels, roles & audio studio...</p>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {/* ========================================================= */}
          {/* 1. LIVE WEB PLAYER CONTROLLER (Full-Width Studio Deck)   */}
          {/* ========================================================= */}
          <div
            className={`p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#170e24] via-[#120c1e] to-[#150e24] border transition-all ${
              activePlugin === 'player'
                ? 'border-[#a855f7] shadow-xl shadow-purple-500/15'
                : 'border-white/[0.08]'
            }`}
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-white/[0.06]">
              {/* Left: Active Song Info or Idle */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-black/40 border border-white/10 shrink-0 shadow-xl">
                  {liveTrack?.isPlaying && liveTrack?.thumbnail ? (
                    <img
                      src={liveTrack.thumbnail}
                      alt={liveTrack.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl text-pink-400">
                      <RiDiscFill className={liveTrack?.isPlaying ? 'animate-spin' : ''} />
                    </div>
                  )}
                  {liveTrack?.isPlaying && (
                    <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider ${
                        liveTrack?.isPlaying
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-white/10 text-gray-400'
                      }`}
                    >
                      {liveTrack?.isPlaying ? 'Streaming Live' : 'Voice Player Idle'}
                    </span>
                    <span className="text-gray-500 text-xs font-mono">•</span>
                    <span className="text-gray-400 text-xs font-mono">
                      {liveTrack?.isPlaying ? liveTrack?.duration || '00:00' : '00:00'}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white truncate max-w-sm sm:max-w-md">
                    {liveTrack?.isPlaying && liveTrack?.title
                      ? liveTrack.title
                      : 'No active track in voice channel'}
                  </h3>
                  <p className="text-xs text-gray-400 truncate">
                    {liveTrack?.isPlaying && liveTrack?.author
                      ? `by ${liveTrack.author}`
                      : 'Play a song via Discord or enter a track below'}
                  </p>
                </div>
              </div>

              {/* Center/Right: Live Transport Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    sendRemoteAction(liveTrack?.isPlaying ? 'pause' : 'resume')
                  }
                  disabled={sendingCmd || !liveTrack?.isPlaying || !liveTrack?.title}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ff2a9d] to-[#a855f7] hover:brightness-110 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-pink-500/25 transition-all cursor-pointer disabled:opacity-40"
                >
                  {liveTrack?.isPlaying ? <FaPause /> : <FaPlay />}
                  <span>{liveTrack?.isPlaying ? 'Pause' : 'Play'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => sendRemoteAction('skip')}
                  disabled={sendingCmd || !liveTrack?.isPlaying || !liveTrack?.title}
                  className="p-3 rounded-xl bg-[#211f30] hover:bg-[#2a273d] border border-white/10 text-white text-xs transition-colors cursor-pointer disabled:opacity-40"
                  title="Skip to Next Track"
                >
                  <FaForward />
                </button>

                <button
                  type="button"
                  onClick={() => sendRemoteAction('stop')}
                  disabled={sendingCmd || !liveTrack?.isPlaying || !liveTrack?.title}
                  className="p-3 rounded-xl bg-[#211f30] hover:bg-rose-500/20 text-gray-300 hover:text-rose-400 border border-white/10 text-xs transition-colors cursor-pointer disabled:opacity-40"
                  title="Stop Audio & Clear Queue"
                >
                  <FaStop />
                </button>

                <button
                  type="button"
                  onClick={() => sendRemoteAction('shuffle')}
                  disabled={sendingCmd}
                  className="p-3 rounded-xl bg-[#211f30] hover:bg-[#2a273d] border border-white/10 text-gray-300 hover:text-white text-xs transition-colors cursor-pointer"
                  title="Shuffle Queue Tracks"
                >
                  <FaRandom />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const nextMode = (loopMode + 1) % 3;
                    setLoopMode(nextMode);
                    sendRemoteAction('loop', { mode: nextMode });
                  }}
                  className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    loopMode > 0
                      ? 'bg-pink-500/20 border-pink-500 text-pink-300'
                      : 'bg-[#211f30] border-white/10 text-gray-400'
                  }`}
                  title="Toggle Repeat Mode"
                >
                  <FaRedo className="text-[10px]" />
                  <span>{loopMode === 1 ? 'Track' : loopMode === 2 ? 'Queue' : 'Loop'}</span>
                </button>
              </div>
            </div>

            {/* Quick Web Stream Input + Live Volume Slider */}
            <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
              {/* Stream Search Input */}
              <form onSubmit={handleStreamToVoice} className="lg:col-span-8 flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={streamInput}
                    onChange={(e) => setStreamInput(e.target.value)}
                    placeholder="Enter song title, YouTube link or Spotify playlist to stream..."
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-[#211f30] border border-white/10 text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-purple-500"
                  />
                  <FaMusic className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs pointer-events-none" />
                </div>
                <button
                  type="submit"
                  disabled={!streamInput.trim() || sendingCmd}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-white font-extrabold text-xs transition-all cursor-pointer whitespace-nowrap disabled:opacity-40"
                >
                  Stream to Voice
                </button>
              </form>

              {/* Live Volume Slider */}
              <div className="lg:col-span-4 flex items-center gap-3 bg-[#211f30] px-4 py-2.5 rounded-xl border border-white/[0.08]">
                <FaVolumeUp className="text-pink-400 text-xs shrink-0" />
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={liveVolume}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setLiveVolume(val);
                    sendRemoteAction('volume', { volume: val });
                  }}
                  className="w-full h-1.5 bg-[#14131d] rounded-lg appearance-none cursor-pointer accent-[#a855f7]"
                />
                <span className="font-mono text-xs font-bold text-white w-9 text-right shrink-0">
                  {liveVolume}%
                </span>
              </div>
            </div>

            {/* ========================================================= */}
            {/* SERVER CUSTOM PLAYLISTS DRAWER / QUICK LAUNCHER           */}
            {/* ========================================================= */}
            <div className="mt-5 pt-5 border-t border-white/[0.08]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
                <button
                  type="button"
                  onClick={() => setPlaylistsDrawerOpen(!playlistsDrawerOpen)}
                  className="flex items-center gap-2.5 text-xs font-black text-white hover:text-pink-400 transition-colors cursor-pointer group"
                >
                  <div className="w-6 h-6 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center text-[11px] group-hover:bg-pink-500 group-hover:text-white transition-all">
                    <FaFolderOpen />
                  </div>
                  <span>Server Playlists</span>
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-gray-300 text-[10px] font-mono">
                    {serverPlaylists.length}
                  </span>
                  {playlistsDrawerOpen ? (
                    <FaChevronUp className="text-[10px] text-gray-400" />
                  ) : (
                    <FaChevronDown className="text-[10px] text-gray-400" />
                  )}
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={fetchServerPlaylists}
                    disabled={loadingPlaylists}
                    className="text-[11px] text-gray-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                    title="Refresh server playlists"
                  >
                    Refresh
                  </button>
                  <span className="text-gray-600 text-xs">•</span>
                  <Link
                    href={`/dashboard/playlists?guildId=${guildId}`}
                    className="text-[11px] font-bold text-pink-400 hover:text-pink-300 flex items-center gap-1.5 transition-colors"
                  >
                    <span>Manage / Import Playlists</span>
                    <FaExternalLinkAlt className="text-[9px]" />
                  </Link>
                </div>
              </div>

              {playlistNotice && (
                <div className="mb-3.5 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2.5 animate-fade-in shadow-lg">
                  <FaCheck className="text-emerald-400 shrink-0" />
                  <span>{playlistNotice}</span>
                </div>
              )}

              {playlistsDrawerOpen && (
                <div className="animate-fade-in">
                  {loadingPlaylists ? (
                    <div className="py-8 text-center text-gray-400 text-xs">
                      <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Loading server playlists...
                    </div>
                  ) : serverPlaylists.length === 0 ? (
                    <div className="p-5 rounded-2xl bg-[#141221] border border-dashed border-white/10 text-center">
                      <p className="text-xs text-gray-400 mb-2.5">
                        No custom playlists saved for this server yet.
                      </p>
                      <Link
                        href={`/dashboard/playlists?guildId=${guildId}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500/20 to-purple-600/20 hover:from-pink-500/30 hover:to-purple-600/30 text-pink-300 border border-pink-500/30 text-xs font-bold transition-all shadow-md"
                      >
                        <FaFolderOpen className="text-xs" />
                        Create or Import Playlist
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {serverPlaylists.map((pl) => {
                        const trackCount = pl.tracks?.length || 0;
                        const cover = pl.tracks?.[0]?.thumbnail;
                        return (
                          <div
                            key={pl.playlistId || pl._id}
                            className="p-3.5 rounded-2xl bg-[#191428] hover:bg-[#1e1932] border border-white/[0.08] hover:border-pink-500/40 transition-all flex flex-col justify-between gap-3 group shadow-md"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0 flex items-center justify-center text-pink-400 shadow-md">
                                {cover ? (
                                  <img
                                    src={cover}
                                    alt=""
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  />
                                ) : (
                                  <RiDiscFill className="text-2xl" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="text-xs font-black text-white truncate group-hover:text-pink-300 transition-colors">
                                  {pl.name}
                                </h4>
                                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-0.5">
                                  <span className="text-purple-400 font-bold font-mono">
                                    {trackCount} Tracks
                                  </span>
                                  {pl.plays > 0 && (
                                    <>
                                      <span>•</span>
                                      <span>{pl.plays} plays</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
                              <button
                                type="button"
                                onClick={() => handlePlayServerPlaylist(pl)}
                                disabled={trackCount === 0 || sendingCmd}
                                className="flex-1 py-1.5 px-3 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:brightness-110 text-white font-extrabold text-[11px] flex items-center justify-center gap-1.5 shadow-md shadow-pink-500/20 transition-all disabled:opacity-40 cursor-pointer"
                              >
                                <FaPlay className="text-[9px]" />
                                <span>Play in Voice</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setSelectedPlaylistPreview(pl)}
                                className="p-1.5 px-2.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-gray-300 hover:text-white text-[11px] font-bold border border-white/10 transition-colors cursor-pointer"
                                title="Inspect Track List"
                              >
                                <FaListUl className="text-[10px]" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ========================================================= */}
          {/* 2-COLUMN SETTINGS GRID                                    */}
          {/* ========================================================= */}
          <form onSubmit={handleSaveForm} className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* 1. MASTER VOLUME & AUDIO DECK */}
            <div
              className={`p-6 sm:p-7 rounded-2xl bg-[#14131d] border transition-all ${
                activePlugin === 'volume'
                  ? 'border-[#a855f7] shadow-lg shadow-purple-500/10'
                  : 'border-white/[0.06]'
              }`}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-pink-500/15 text-[#ff2a9d] flex items-center justify-center text-lg">
                    <FaVolumeUp />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Default Master Volume</h3>
                    <p className="text-xs text-gray-400">Startup volume when bot joins voice channels</p>
                  </div>
                </div>
                <span className="text-lg font-mono font-black text-[#ff2a9d] px-3 py-1 rounded-xl bg-pink-500/10 border border-pink-500/20">
                  {settings.defaultVolume}%
                </span>
              </div>

              <input
                type="range"
                min="1"
                max="100"
                value={settings.defaultVolume}
                onChange={(e) =>
                  setSettings({ ...settings, defaultVolume: Number(e.target.value) })
                }
                className="w-full h-2.5 bg-[#252336] rounded-lg appearance-none cursor-pointer accent-[#a855f7]"
              />
              <div className="flex justify-between text-[11px] text-gray-500 font-mono mt-2.5">
                <span>1% (Quiet)</span>
                <span>50% (Standard)</span>
                <span>80% (Studio Default)</span>
                <span>100% (Maximum)</span>
              </div>
            </div>

            {/* 2. 24/7 VOICE RADIO PERSISTENCE */}
            <div
              className={`p-6 sm:p-7 rounded-2xl bg-[#14131d] border transition-all ${
                activePlugin === 'stay247'
                  ? 'border-[#a855f7] shadow-lg shadow-purple-500/10'
                  : 'border-white/[0.06]'
              }`}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center text-lg">
                    <FaBroadcastTower />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">24/7 Voice Radio Mode</h3>
                    <p className="text-xs text-gray-400">Keep Revera in the voice channel indefinitely</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSettings({
                      ...settings,
                      twentyFourSeven: {
                        ...settings.twentyFourSeven,
                        enabled: !settings.twentyFourSeven?.enabled
                      }
                    })
                  }
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    settings.twentyFourSeven?.enabled ? 'bg-[#10b981]' : 'bg-[#252336]'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      settings.twentyFourSeven?.enabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                  24/7 Home Voice Channel
                </label>
                {voiceChannels.length > 0 ? (
                  <select
                    value={settings.twentyFourSeven?.voiceChannelId || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        twentyFourSeven: {
                          ...settings.twentyFourSeven,
                          voiceChannelId: e.target.value
                        }
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-[#211f30] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Auto-detect active voice channel</option>
                    {voiceChannels.map((vc) => (
                      <option key={vc.id} value={vc.id}>
                        🔊 {vc.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={settings.twentyFourSeven?.voiceChannelId || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        twentyFourSeven: {
                          ...settings.twentyFourSeven,
                          voiceChannelId: e.target.value
                        }
                      })
                    }
                    placeholder="Optional Voice Channel ID..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#211f30] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                  />
                )}
              </div>
            </div>

            {/* 3. DEDICATED SONG REQUEST CHANNEL */}
            <div
              className={`p-6 sm:p-7 rounded-2xl bg-[#14131d] border transition-all ${
                activePlugin === 'requestChannel'
                  ? 'border-[#a855f7] shadow-lg shadow-purple-500/10'
                  : 'border-white/[0.06]'
              }`}
            >
              <div className="flex items-center gap-3.5 mb-5">
                <div className="w-11 h-11 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center text-xl">
                  <MdAudiotrack />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Dedicated Request Channel</h3>
                  <p className="text-xs text-gray-400">
                    Members type song names directly in chat without typing <code className="text-pink-400">/play</code>
                  </p>
                </div>
              </div>

              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                Designated Song Request Channel
              </label>
              {textChannels.length > 0 ? (
                <select
                  value={settings.requestChannel?.channelId || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      requestChannel: {
                        ...settings.requestChannel,
                        channelId: e.target.value
                      }
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-[#211f30] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                >
                  <option value="">Disabled (or run /setup create in Discord)</option>
                  {textChannels.map((tc) => (
                    <option key={tc.id} value={tc.id}>
                      # {tc.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={settings.requestChannel?.channelId || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      requestChannel: {
                        ...settings.requestChannel,
                        channelId: e.target.value
                      }
                    })
                  }
                  placeholder="Text Channel ID..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#211f30] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                />
              )}
            </div>

            {/* 4. DJ ROLE & ACCESS CONTROL */}
            <div
              className={`p-6 sm:p-7 rounded-2xl bg-[#14131d] border transition-all ${
                activePlugin === 'djMode'
                  ? 'border-[#a855f7] shadow-lg shadow-purple-500/10'
                  : 'border-white/[0.06]'
              }`}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center text-lg">
                    <FaShieldAlt />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">DJ Role & Access Control</h3>
                    <p className="text-xs text-gray-400">Restrict skip, stop, volume & filters to designated DJs</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSettings({ ...settings, djOnlyMode: !settings.djOnlyMode })
                  }
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    settings.djOnlyMode ? 'bg-[#10b981]' : 'bg-[#252336]'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      settings.djOnlyMode ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                Server DJ Role
              </label>
              {roles.length > 0 ? (
                <select
                  value={settings.djRoleId || ''}
                  onChange={(e) => setSettings({ ...settings, djRoleId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#211f30] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                >
                  <option value="">No specific DJ Role (All members can control)</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      @{r.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={settings.djRoleId || ''}
                  onChange={(e) => setSettings({ ...settings, djRoleId: e.target.value })}
                  placeholder="Discord Role ID..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#211f30] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                />
              )}
            </div>

            {/* 5. QUEUE & AUTOPLAY BEHAVIOR MODULE */}
            <div
              className={`p-6 sm:p-7 rounded-2xl bg-[#14131d] border transition-all ${
                activePlugin === 'queueBehavior'
                  ? 'border-[#a855f7] shadow-lg shadow-purple-500/10'
                  : 'border-white/[0.06]'
              }`}
            >
              <div className="flex items-center gap-3.5 mb-5">
                <div className="w-11 h-11 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center text-lg">
                  <FaInfinity />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Queue & Autoplay Behavior</h3>
                  <p className="text-xs text-gray-400">Stream announcements, duplicate prevention & vote skip</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Announce Songs */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#211f30]">
                  <div className="flex items-center gap-3">
                    <FaBell className="text-pink-400 text-sm" />
                    <div>
                      <p className="text-xs font-bold text-white">Announce Now Playing Tracks</p>
                      <p className="text-[11px] text-gray-400">Send embedded player message when each song begins</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings({ ...settings, announceSongs: !settings.announceSongs })
                    }
                    className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                      settings.announceSongs ? 'bg-[#10b981]' : 'bg-[#14131d]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
                        settings.announceSongs ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Prevent Duplicate Tracks */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#211f30]">
                  <div className="flex items-center gap-3">
                    <FaCopy className="text-cyan-400 text-sm" />
                    <div>
                      <p className="text-xs font-bold text-white">Prevent Duplicate Songs in Queue</p>
                      <p className="text-[11px] text-gray-400">Block re-adding songs that are already in queue</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings({
                        ...settings,
                        preventDuplicates: !settings.preventDuplicates
                      })
                    }
                    className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                      settings.preventDuplicates ? 'bg-[#10b981]' : 'bg-[#14131d]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
                        settings.preventDuplicates ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Vote Skip Requirement */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#211f30]">
                  <div className="flex items-center gap-3">
                    <FaVoteYea className="text-amber-400 text-sm" />
                    <div>
                      <p className="text-xs font-bold text-white">Vote-Skip Threshold (50%)</p>
                      <p className="text-[11px] text-gray-400">Require majority vote among voice members to skip</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings({
                        ...settings,
                        voteSkipEnabled: !settings.voteSkipEnabled
                      })
                    }
                    className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                      settings.voteSkipEnabled ? 'bg-[#10b981]' : 'bg-[#14131d]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
                        settings.voteSkipEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Auto Disconnect Dropdown */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-2">
                    <FaClock className="text-gray-400" />
                    <span>Auto-Disconnect When Channel is Empty</span>
                  </label>
                  <select
                    value={settings.autoDisconnectTime}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        autoDisconnectTime: Number(e.target.value)
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-[#211f30] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                  >
                    <option value={0}>Instant (Disconnect immediately when alone)</option>
                    <option value={60}>1 Minute Grace Period</option>
                    <option value={300}>5 Minutes Grace Period (Recommended)</option>
                    <option value={600}>10 Minutes Grace Period</option>
                    <option value={-1}>Never Disconnect (Stay in Channel)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 6. RESTRICTED COMMAND CHANNEL */}
            <div
              className={`p-6 sm:p-7 rounded-2xl bg-[#14131d] border transition-all ${
                activePlugin === 'channelLock'
                  ? 'border-[#a855f7] shadow-lg shadow-purple-500/10'
                  : 'border-white/[0.06]'
              }`}
            >
              <div className="flex items-center gap-3.5 mb-5">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-lg">
                  <FaHashtag />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Allowed Command Channel</h3>
                  <p className="text-xs text-gray-400">
                    Lock music commands (<code className="text-pink-400">/play</code>, <code className="text-pink-400">/queue</code>) to one channel
                  </p>
                </div>
              </div>

              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                Allowed Text Channel
              </label>
              {textChannels.length > 0 ? (
                <select
                  value={settings.restrictedTextChannelId || ''}
                  onChange={(e) =>
                    setSettings({ ...settings, restrictedTextChannelId: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-[#211f30] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                >
                  <option value="">Unrestricted (Commands allowed anywhere)</option>
                  {textChannels.map((tc) => (
                    <option key={tc.id} value={tc.id}>
                      # {tc.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={settings.restrictedTextChannelId || ''}
                  onChange={(e) =>
                    setSettings({ ...settings, restrictedTextChannelId: e.target.value })
                  }
                  placeholder="Optional Text Channel ID..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#211f30] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                />
              )}
            </div>

            {/* 7. STUDIO FFmpeg DSP FILTERS (Spanning full width) */}
            <div
              className={`xl:col-span-2 p-6 sm:p-7 rounded-2xl bg-[#14131d] border transition-all ${
                activePlugin === 'filters'
                  ? 'border-[#a855f7] shadow-lg shadow-purple-500/10'
                  : 'border-white/[0.06]'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-pink-500/15 text-[#ff2a9d] flex items-center justify-center text-lg">
                    <RiEqualizerFill />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">13 Studio FFmpeg DSP Filters</h3>
                    <p className="text-xs text-gray-400">
                      Real-time audio processing presets active in this server via Discord button panels
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                  Ready & Active
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 mt-3">
                {AUDIO_FILTERS_SHOWCASE.map((f) => (
                  <div
                    key={f.name}
                    title={f.cmd}
                    className="p-3 rounded-xl bg-[#211f30] border border-white/5 hover:border-pink-500/30 transition-all flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="w-2 h-2 rounded-full bg-[#ff2a9d]" />
                      <span className="text-[10px] text-gray-500 font-mono">320kbps</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{f.name}</p>
                      <p className="text-[10px] text-gray-400">{f.tag}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================= */}
      {/* PLAYLIST TRACKS PREVIEW MODAL                             */}
      {/* ========================================================= */}
      {selectedPlaylistPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#141221] border border-white/15 p-6 shadow-2xl flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0 flex items-center justify-center text-pink-400">
                  {selectedPlaylistPreview.tracks?.[0]?.thumbnail ? (
                    <img
                      src={selectedPlaylistPreview.tracks[0].thumbnail}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <RiDiscFill className="text-2xl" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-black text-white truncate">
                    {selectedPlaylistPreview.name}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {selectedPlaylistPreview.tracks?.length || 0} Tracks • Server Playlist
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPlaylistPreview(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>

            {/* Modal Track List */}
            <div className="flex-1 overflow-y-auto py-3 space-y-1.5 pr-1">
              {!selectedPlaylistPreview.tracks || selectedPlaylistPreview.tracks.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-8">This playlist is empty.</p>
              ) : (
                selectedPlaylistPreview.tracks.map((track, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="text-[11px] font-mono text-gray-500 w-5 text-right shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white truncate group-hover:text-pink-300 transition-colors">
                          {track.title}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate">
                          {track.author}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono text-gray-500">
                        {track.duration || '00:00'}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handlePlayTrackFromPlaylist(track, selectedPlaylistPreview.name)
                        }
                        className="p-2 rounded-lg bg-pink-500/10 hover:bg-pink-500/30 text-pink-300 text-xs transition-colors cursor-pointer"
                        title="Stream this track to voice"
                      >
                        <FaPlay className="text-[9px]" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
              <Link
                href={`/dashboard/playlists?guildId=${guildId}`}
                className="text-xs font-bold text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <span>Edit in Studio</span>
                <FaExternalLinkAlt className="text-[10px] text-pink-400" />
              </Link>

              <button
                type="button"
                onClick={() => {
                  handlePlayServerPlaylist(selectedPlaylistPreview);
                  setSelectedPlaylistPreview(null);
                }}
                disabled={!selectedPlaylistPreview.tracks?.length || sendingCmd}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:brightness-110 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-pink-500/25 transition-all cursor-pointer disabled:opacity-50"
              >
                <FaPlay className="text-[10px]" />
                <span>Play Entire Playlist</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

export default function GuildConfigPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#110f1a] flex items-center justify-center text-gray-400 text-xs font-bold">
          Loading Server Audio Studio...
        </div>
      }
    >
      <GuildDashboardInner />
    </Suspense>
  );
}
