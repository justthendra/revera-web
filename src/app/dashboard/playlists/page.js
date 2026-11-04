'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  FaMusic,
  FaFolderOpen,
  FaCopy,
  FaCheck,
  FaPlus,
  FaTrash,
  FaServer,
  FaTimes,
  FaChevronDown,
  FaSpotify,
  FaYoutube,
  FaSoundcloud,
  FaSearch,
  FaLayerGroup,
  FaBolt
} from 'react-icons/fa';
import DashboardShell from '@/components/DashboardShell';

export default function PlaylistsDashboardPage() {
  const { data: session } = useSession();
  const [guilds, setGuilds] = useState([]);
  const [selectedGuildId, setSelectedGuildId] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [loadingGuilds, setLoadingGuilds] = useState(true);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Create Playlist Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createTab, setCreateTab] = useState('import'); // 'import' | 'manual'
  const [importUrl, setImportUrl] = useState('');
  const [analyzingImport, setAnalyzingImport] = useState(false);
  const [importPreview, setImportPreview] = useState(null);
  const [importError, setImportError] = useState('');
  const [newPlName, setNewPlName] = useState('');
  const [newPlDesc, setNewPlDesc] = useState('');
  const [creating, setCreating] = useState(false);

  // Add Track Modal State
  const [addTrackModalOpen, setAddTrackModalOpen] = useState(false);
  const [activePlaylistId, setActivePlaylistId] = useState(null);
  const [trackUrl, setTrackUrl] = useState('');
  const [trackTitle, setTrackTitle] = useState('');
  const [trackArtist, setTrackArtist] = useState('');
  const [trackThumbnail, setTrackThumbnail] = useState('');
  const [analyzingTrack, setAnalyzingTrack] = useState(false);
  const [trackPreview, setTrackPreview] = useState(null);
  const [trackError, setTrackError] = useState('');
  const [addingTrack, setAddingTrack] = useState(false);

  // 1. Fetch User Guilds
  useEffect(() => {
    async function fetchUserGuilds() {
      setLoadingGuilds(true);
      try {
        const res = await fetch('/api/user/guilds');
        const data = await res.json();
        if (data.success && data.guilds?.length) {
          setGuilds(data.guilds);
          const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
          const queryGuildId = urlParams ? urlParams.get('guildId') : null;
          const savedId = queryGuildId || localStorage.getItem('revera_last_guild_id');
          const matched = data.guilds.find((g) => g.id === savedId);
          setSelectedGuildId(matched ? matched.id : (queryGuildId || data.guilds[0].id));
        }
      } catch (err) {
        console.error('Error fetching user guilds:', err);
      } finally {
        setLoadingGuilds(false);
      }
    }
    fetchUserGuilds();
  }, []);

  // 2. Fetch Playlists for Selected Guild
  useEffect(() => {
    if (!selectedGuildId) return;
    localStorage.setItem('revera_last_guild_id', selectedGuildId);
    fetchGuildPlaylists(selectedGuildId);
  }, [selectedGuildId]);

  async function fetchGuildPlaylists(guildId) {
    setLoadingPlaylists(true);
    try {
      const res = await fetch(`/api/playlists?guildId=${guildId}`);
      const data = await res.json();
      if (data.success) {
        setPlaylists(data.playlists || []);
      }
    } catch (err) {
      console.error('Error fetching guild playlists:', err);
    } finally {
      setLoadingPlaylists(false);
    }
  }

  const selectedGuild = guilds.find((g) => g.id === selectedGuildId);

  // --- IMPORT PLAYLIST ACTIONS ---
  async function handleAnalyzeImportUrl(customUrl) {
    const targetUrl = (customUrl || importUrl).trim();
    if (!targetUrl) return;

    setAnalyzingImport(true);
    setImportError('');
    setImportPreview(null);

    try {
      const res = await fetch('/api/playlists/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'preview',
          url: targetUrl
        })
      });
      const data = await res.json();
      if (data.success && data.media) {
        setImportPreview(data.media);
        if (!newPlName.trim()) {
          setNewPlName(data.media.name || '');
        }
      } else {
        setImportError(data.error || 'Could not parse playlist. Please verify the URL.');
      }
    } catch (err) {
      setImportError('Failed to connect to extraction service: ' + err.message);
    } finally {
      setAnalyzingImport(false);
    }
  }

  // Create & Import Playlist
  async function handleCreatePlaylist(e) {
    e.preventDefault();
    if (!selectedGuildId) return;

    setCreating(true);
    setImportError('');

    try {
      if (createTab === 'import' && importUrl.trim()) {
        const res = await fetch('/api/playlists/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'createAndImport',
            url: importUrl.trim(),
            name: newPlName.trim(),
            description: newPlDesc.trim(),
            guildId: selectedGuildId,
            guildName: selectedGuild?.name || 'Discord Server',
            userId: session?.user?.id || 'web_user',
            ownerTag: session?.user?.name || 'Community Member'
          })
        });
        const data = await res.json();
        if (data.success && data.playlist) {
          setPlaylists((prev) => [data.playlist, ...prev]);
          closeCreateModal();
        } else {
          setImportError(data.error || 'Failed to import playlist.');
        }
      } else {
        // Manual creation
        if (!newPlName.trim()) return;
        const res = await fetch('/api/playlists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newPlName.trim(),
            description: newPlDesc.trim(),
            guildId: selectedGuildId,
            guildName: selectedGuild?.name || 'Discord Server',
            userId: session?.user?.id || 'web_user',
            ownerTag: session?.user?.name || 'Community Member'
          })
        });
        const data = await res.json();
        if (data.success && data.playlist) {
          setPlaylists((prev) => [data.playlist, ...prev]);
          closeCreateModal();
        } else {
          setImportError(data.error || 'Failed to create playlist.');
        }
      }
    } catch (err) {
      setImportError('Network error: ' + err.message);
    } finally {
      setCreating(false);
    }
  }

  function closeCreateModal() {
    setCreateModalOpen(false);
    setImportUrl('');
    setImportPreview(null);
    setImportError('');
    setNewPlName('');
    setNewPlDesc('');
    setCreateTab('import');
  }

  // Delete Playlist
  async function handleDeletePlaylist(playlistId) {
    if (!confirm('Are you sure you want to delete this server playlist?')) return;
    try {
      const res = await fetch(`/api/playlists?playlistId=${playlistId}&guildId=${selectedGuildId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setPlaylists((prev) => prev.filter((p) => p.playlistId !== playlistId));
      } else {
        alert(data.error || 'Failed to delete playlist');
      }
    } catch (err) {
      console.error(err);
    }
  }

  // --- ADD TRACK / BATCH IMPORT ACTIONS ---
  async function handleAnalyzeTrackUrl(customUrl) {
    const targetUrl = (customUrl || trackUrl).trim();
    if (!targetUrl) return;

    setAnalyzingTrack(true);
    setTrackError('');
    setTrackPreview(null);

    try {
      const res = await fetch('/api/playlists/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'preview',
          url: targetUrl
        })
      });
      const data = await res.json();
      if (data.success && data.media) {
        setTrackPreview(data.media);
        if (data.media.tracks?.length === 1) {
          const t = data.media.tracks[0];
          setTrackTitle(t.title || '');
          setTrackArtist(t.author || '');
          setTrackThumbnail(t.thumbnail || '');
        }
      } else {
        setTrackError(data.error || 'Could not resolve track link.');
      }
    } catch (err) {
      setTrackError('Error analyzing link: ' + err.message);
    } finally {
      setAnalyzingTrack(false);
    }
  }

  // Add Single Track or Batch Append Tracks to Playlist
  async function handleAddTrackOrBatch(e) {
    e.preventDefault();
    if (!activePlaylistId || !selectedGuildId) return;

    setAddingTrack(true);
    setTrackError('');

    try {
      // If user pasted a playlist into the song adder, do a batch append!
      if (trackPreview && trackPreview.tracks?.length > 1) {
        const res = await fetch('/api/playlists/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'appendTracks',
            url: trackUrl.trim(),
            playlistId: activePlaylistId,
            guildId: selectedGuildId
          })
        });
        const data = await res.json();
        if (data.success && data.playlist) {
          setPlaylists((prev) =>
            prev.map((p) => (p.playlistId === activePlaylistId ? data.playlist : p))
          );
          closeAddTrackModal();
        } else {
          setTrackError(data.error || 'Failed to batch add tracks.');
        }
      } else {
        // Single track addition
        if (!trackTitle.trim() || !trackUrl.trim()) {
          setTrackError('Track title and URL are required.');
          setAddingTrack(false);
          return;
        }

        const res = await fetch('/api/playlists', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'addTrack',
            playlistId: activePlaylistId,
            guildId: selectedGuildId,
            track: {
              title: trackTitle.trim(),
              url: trackUrl.trim(),
              author: trackArtist.trim() || 'Unknown Artist',
              thumbnail: trackThumbnail || ''
            }
          })
        });
        const data = await res.json();
        if (data.success && data.playlist) {
          setPlaylists((prev) =>
            prev.map((p) => (p.playlistId === activePlaylistId ? data.playlist : p))
          );
          closeAddTrackModal();
        } else {
          setTrackError(data.error || 'Failed to add track.');
        }
      }
    } catch (err) {
      setTrackError('Network error: ' + err.message);
    } finally {
      setAddingTrack(false);
    }
  }

  function closeAddTrackModal() {
    setAddTrackModalOpen(false);
    setActivePlaylistId(null);
    setTrackUrl('');
    setTrackTitle('');
    setTrackArtist('');
    setTrackThumbnail('');
    setTrackPreview(null);
    setTrackError('');
  }

  // Remove Track from Playlist
  async function handleRemoveTrack(playlistId, trackIndex) {
    try {
      const res = await fetch('/api/playlists', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'removeTrack',
          playlistId,
          guildId: selectedGuildId,
          trackIndex
        })
      });
      const data = await res.json();
      if (data.success && data.playlist) {
        setPlaylists((prev) =>
          prev.map((p) => (p.playlistId === playlistId ? data.playlist : p))
        );
      }
    } catch (err) {
      console.error(err);
    }
  }

  const copyCommand = (pl) => {
    navigator.clipboard.writeText(`/playlist load name:${pl.name}`);
    setCopiedId(pl.playlistId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <DashboardShell activeSection="playlists">
      {/* Header with Server Selector & Create Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/[0.06]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 text-pink-400 text-xs font-bold mb-2">
            <FaFolderOpen /> Server-Exclusive Playlists
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Server Playlists
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Import entire Spotify & YouTube playlists or create custom server playlists for{' '}
            <strong className="text-pink-400">{selectedGuild?.name || 'your server'}</strong>.
          </p>
        </div>

        {/* Server Selector & Create Button */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Server Selector Dropdown */}
          <div className="relative">
            <select
              value={selectedGuildId || ''}
              onChange={(e) => setSelectedGuildId(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 rounded-xl bg-[#211f30] border border-white/[0.08] text-white text-xs font-bold focus:outline-none focus:border-purple-500/50 cursor-pointer min-w-[200px]"
            >
              {guilds.map((g) => (
                <option key={g.id} value={g.id} className="bg-[#181624] text-white">
                  {g.name}
                </option>
              ))}
            </select>
            <FaChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs" />
          </div>

          <button
            onClick={() => setCreateModalOpen(true)}
            disabled={!selectedGuildId}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ff2a9d] to-[#a855f7] hover:brightness-110 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-pink-500/25 transition-all cursor-pointer disabled:opacity-50"
          >
            <FaPlus />
            <span>Create / Import Playlist</span>
          </button>
        </div>
      </div>

      {/* Playlists Content */}
      {loadingGuilds || loadingPlaylists ? (
        <div className="py-28 text-center text-gray-400">
          <div className="w-10 h-10 border-3 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold">Loading Server Playlists...</p>
        </div>
      ) : playlists.length === 0 ? (
        <div className="py-24 text-center rounded-3xl mt-8 p-12 bg-[#14131d] border border-white/[0.06]">
          <div className="flex items-center justify-center gap-3 text-3xl mb-4 text-gray-500">
            <FaSpotify className="text-emerald-500" />
            <FaYoutube className="text-red-500" />
            <FaSoundcloud className="text-orange-500" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            No Playlists in {selectedGuild?.name || 'this server'}
          </h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto mb-6">
            Import an entire public Spotify or YouTube playlist directly, or create a custom server playlist.
          </p>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ff2a9d] to-[#a855f7] hover:brightness-110 text-white text-xs font-bold inline-flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-pink-500/20"
          >
            <FaPlus />
            <span>Import Spotify / YouTube Playlist</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
          {playlists.map((pl) => (
            <div
              key={pl.playlistId}
              className="bg-[#14131d] p-6 rounded-2xl border border-white/[0.06] hover:border-purple-500/40 transition-all flex flex-col justify-between group shadow-xl"
            >
              <div>
                {/* Header: Server Badge & Track Count */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-pink-500/15 text-[#ff2a9d] font-bold border border-pink-500/20">
                    {pl.tracks?.length || 0} Tracks
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1.5">
                    <FaServer className="text-[9px]" />
                    <span>Server Only</span>
                  </span>
                </div>

                <h3 className="text-lg font-black text-white group-hover:text-pink-300 transition-colors truncate">
                  {pl.name}
                </h3>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2 min-h-[32px]">
                  {pl.description || 'Dedicated Server Playlist'}
                </p>

                {/* Tracks preview list */}
                <div className="mt-5 space-y-2 border-t border-white/5 pt-4">
                  {pl.tracks?.slice(0, 5).map((t, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs text-gray-300 bg-[#211f30] px-3 py-2 rounded-xl group/track"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        {t.thumbnail ? (
                          <img
                            src={t.thumbnail}
                            alt=""
                            className="w-6 h-6 rounded-md object-cover shrink-0 border border-white/10"
                          />
                        ) : (
                          <span className="text-gray-500 font-mono text-[10px] shrink-0">
                            {idx + 1}.
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-medium text-white leading-tight">{t.title}</p>
                          <p className="text-[10px] text-gray-400 truncate leading-tight mt-0.5">
                            {t.author || 'Unknown Artist'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-gray-400 font-mono text-[10px]">
                          {t.duration || '03:00'}
                        </span>
                        <button
                          onClick={() => handleRemoveTrack(pl.playlistId, idx)}
                          title="Remove Track"
                          className="opacity-0 group-hover/track:opacity-100 text-gray-500 hover:text-rose-400 transition-opacity p-1"
                        >
                          <FaTrash className="text-[10px]" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {(pl.tracks?.length || 0) > 5 && (
                    <p className="text-[11px] text-gray-500 text-center font-mono pt-1">
                      + {pl.tracks.length - 5} more tracks
                    </p>
                  )}

                  {(!pl.tracks || pl.tracks.length === 0) && (
                    <div className="py-4 text-center text-xs text-gray-500 font-medium">
                      No tracks yet. Click "Add / Import Songs" below.
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-6 pt-4 border-t border-white/5 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>
                    By <strong className="text-white">@{pl.ownerTag || 'Member'}</strong>
                  </span>
                  <button
                    onClick={() => {
                      setActivePlaylistId(pl.playlistId);
                      setAddTrackModalOpen(true);
                    }}
                    className="text-pink-400 hover:text-pink-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <FaPlus className="text-[10px]" /> Add / Import Songs
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyCommand(pl)}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-500/20"
                  >
                    {copiedId === pl.playlistId ? (
                      <>
                        <FaCheck /> Copied Discord Command!
                      </>
                    ) : (
                      <>
                        <FaCopy /> Copy Play Command
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDeletePlaylist(pl.playlistId)}
                    title="Delete Playlist"
                    className="p-2 rounded-xl bg-white/[0.04] hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 transition-colors text-xs cursor-pointer"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* CREATE / IMPORT SERVER PLAYLIST MODAL */}
      {/* ========================================================================= */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="w-full max-w-lg bg-[#181624] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative my-8">
            <button
              onClick={closeCreateModal}
              className="absolute right-5 top-5 text-gray-400 hover:text-white text-sm"
            >
              <FaTimes />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-pink-500/20 text-pink-400 text-xs">
                <FaLayerGroup />
              </span>
              <h3 className="text-xl font-black text-white">Create Server Playlist</h3>
            </div>
            <p className="text-xs text-gray-400 mb-5">
              Scoped exclusively to <strong className="text-pink-400">{selectedGuild?.name}</strong>.
            </p>

            {/* Mode Tabs */}
            <div className="grid grid-cols-2 p-1 bg-[#12111a] rounded-xl border border-white/5 mb-6 text-xs font-bold">
              <button
                type="button"
                onClick={() => setCreateTab('import')}
                className={`py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                  createTab === 'import'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <FaBolt />
                <span>Import from Link</span>
              </button>
              <button
                type="button"
                onClick={() => setCreateTab('manual')}
                className={`py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                  createTab === 'manual'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <FaPlus />
                <span>Blank Playlist</span>
              </button>
            </div>

            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              {createTab === 'import' ? (
                <>
                  {/* URL Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-gray-300">
                        Spotify / YouTube Playlist or Album URL
                      </label>
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                        <FaSpotify className="text-emerald-400" />
                        <FaYoutube className="text-red-400" />
                        <FaSoundcloud className="text-orange-400" />
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type="url"
                        required
                        value={importUrl}
                        onChange={(e) => {
                          setImportUrl(e.target.value);
                          if (importPreview) setImportPreview(null);
                        }}
                        onBlur={() => {
                          if (importUrl.trim() && !importPreview) {
                            handleAnalyzeImportUrl(importUrl);
                          }
                        }}
                        placeholder="https://open.spotify.com/playlist/... or YouTube Playlist link"
                        className="w-full pl-4 pr-24 py-2.5 rounded-xl bg-[#211f30] border border-white/10 text-white text-xs focus:outline-none focus:border-pink-500 placeholder:text-gray-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => handleAnalyzeImportUrl(importUrl)}
                        disabled={analyzingImport || !importUrl.trim()}
                        className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 text-[11px] font-bold transition-all disabled:opacity-40"
                      >
                        {analyzingImport ? 'Analyzing...' : 'Inspect'}
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1.5">
                      Supports Spotify Playlists, Albums, YouTube Playlists, and SoundCloud sets.
                    </p>
                  </div>

                  {/* Error Notification */}
                  {importError && (
                    <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium">
                      {importError}
                    </div>
                  )}

                  {/* Preview of Imported Media */}
                  {importPreview && (
                    <div className="p-3.5 rounded-2xl bg-[#12101c] border border-emerald-500/30 space-y-3 animate-fade-in">
                      <div className="flex items-center gap-3">
                        {importPreview.thumbnail && (
                          <img
                            src={importPreview.thumbnail}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover border border-white/10 shadow-md shrink-0"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            {importPreview.type.includes('spotify') ? (
                              <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                                <FaSpotify /> Spotify
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-red-400 flex items-center gap-1">
                                <FaYoutube /> YouTube
                              </span>
                            )}
                            <span className="text-gray-600">•</span>
                            <span className="text-[10px] font-bold text-purple-400">
                              {importPreview.trackCount} Tracks Ready
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-white truncate">
                            {importPreview.name}
                          </h4>
                        </div>
                      </div>

                      {/* First tracks preview */}
                      <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                        {importPreview.tracks?.slice(0, 3).map((t, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between text-[11px] text-gray-300 bg-white/[0.03] px-2.5 py-1.5 rounded-lg"
                          >
                            <span className="truncate pr-2">
                              {i + 1}. {t.title} - <span className="text-gray-400">{t.author}</span>
                            </span>
                            <span className="font-mono text-[10px] text-gray-400 shrink-0">
                              {t.duration}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Playlist Name override */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1.5">
                      Server Playlist Title
                    </label>
                    <input
                      type="text"
                      required
                      value={newPlName}
                      onChange={(e) => setNewPlName(e.target.value)}
                      placeholder="e.g. Server Top Hits"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#211f30] border border-white/10 text-white text-xs focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1.5">
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      value={newPlDesc}
                      onChange={(e) => setNewPlDesc(e.target.value)}
                      placeholder="Imported from Spotify/YouTube"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#211f30] border border-white/10 text-white text-xs focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Manual Creation Form */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1.5">
                      Playlist Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newPlName}
                      onChange={(e) => setNewPlName(e.target.value)}
                      placeholder="e.g. Chill Gaming Sessions"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#211f30] border border-white/10 text-white text-xs focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1.5">
                      Description (Optional)
                    </label>
                    <textarea
                      value={newPlDesc}
                      onChange={(e) => setNewPlDesc(e.target.value)}
                      placeholder="What is this playlist about?"
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#211f30] border border-white/10 text-white text-xs focus:outline-none focus:border-pink-500 resize-none"
                    />
                  </div>
                </>
              )}

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="flex-1 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-gray-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newPlName.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#ff2a9d] to-[#a855f7] hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-pink-500/25 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Importing Tracks...</span>
                    </>
                  ) : createTab === 'import' ? (
                    <>
                      <FaBolt />
                      <span>Import & Create</span>
                    </>
                  ) : (
                    <span>Create Playlist</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD TRACK OR BATCH IMPORT MODAL */}
      {/* ========================================================================= */}
      {addTrackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="w-full max-w-lg bg-[#181624] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative my-8">
            <button
              onClick={closeAddTrackModal}
              className="absolute right-5 top-5 text-gray-400 hover:text-white text-sm"
            >
              <FaTimes />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs">
                <FaMusic />
              </span>
              <h3 className="text-xl font-black text-white">Add Songs to Playlist</h3>
            </div>
            <p className="text-xs text-gray-400 mb-5">
              Paste a Spotify or YouTube track, video, or entire playlist link to append.
            </p>

            <form onSubmit={handleAddTrackOrBatch} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-300">
                    Track or Playlist URL
                  </label>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                    <FaSpotify className="text-emerald-400" />
                    <FaYoutube className="text-red-400" />
                    <FaSoundcloud className="text-orange-400" />
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="url"
                    required
                    value={trackUrl}
                    onChange={(e) => {
                      setTrackUrl(e.target.value);
                      if (trackPreview) setTrackPreview(null);
                    }}
                    onBlur={() => {
                      if (trackUrl.trim() && !trackPreview) {
                        handleAnalyzeTrackUrl(trackUrl);
                      }
                    }}
                    placeholder="https://open.spotify.com/track/... or YouTube link"
                    className="w-full pl-4 pr-24 py-2.5 rounded-xl bg-[#211f30] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500 placeholder:text-gray-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleAnalyzeTrackUrl(trackUrl)}
                    disabled={analyzingTrack || !trackUrl.trim()}
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold transition-all disabled:opacity-40"
                  >
                    {analyzingTrack ? 'Analyzing...' : 'Auto-Fill'}
                  </button>
                </div>
              </div>

              {/* Error Notification */}
              {trackError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium">
                  {trackError}
                </div>
              )}

              {/* Multi-track Batch Detected Alert */}
              {trackPreview && trackPreview.tracks?.length > 1 && (
                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                      <FaBolt className="text-pink-400" />
                      Batch Playlist Detected
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded-md">
                      {trackPreview.tracks.length} Songs
                    </span>
                  </div>
                  <p className="text-xs text-gray-300">
                    You pasted a playlist (<strong>{trackPreview.name}</strong>). Clicking "Add to Playlist" below will append all{' '}
                    <strong>{trackPreview.tracks.length} songs</strong> at once!
                  </p>
                  {trackPreview.type?.includes('spotify') && trackPreview.tracks.length === 100 && (
                    <p className="text-[11px] text-amber-300">
                      💡 Spotify's public embed interface provides up to the first 100 tracks.
                    </p>
                  )}
                </div>
              )}

              {/* Single Track Details (Editable if single track or manual) */}
              {(!trackPreview || trackPreview.tracks?.length <= 1) && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1.5">
                      Song Title
                    </label>
                    <input
                      type="text"
                      required
                      value={trackTitle}
                      onChange={(e) => setTrackTitle(e.target.value)}
                      placeholder="e.g. Blinding Lights"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#211f30] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1.5">
                      Artist / Creator
                    </label>
                    <input
                      type="text"
                      value={trackArtist}
                      onChange={(e) => setTrackArtist(e.target.value)}
                      placeholder="e.g. The Weeknd"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#211f30] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </>
              )}

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={closeAddTrackModal}
                  className="flex-1 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-gray-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingTrack || (!trackUrl.trim())}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#10b981] to-[#06b6d4] hover:brightness-110 text-[#042f2e] text-xs font-extrabold shadow-lg shadow-emerald-500/25 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {addingTrack ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                      <span>Adding Songs...</span>
                    </>
                  ) : trackPreview && trackPreview.tracks?.length > 1 ? (
                    <>
                      <FaBolt />
                      <span>Append All {trackPreview.tracks.length} Songs</span>
                    </>
                  ) : (
                    <span>Add Track</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
