'use client';

import { useState, useEffect } from 'react';
import {
  FaHeart,
  FaHistory,
  FaTrash,
  FaExternalLinkAlt,
  FaHeadphones,
  FaClock
} from 'react-icons/fa';
import DashboardShell from '@/components/DashboardShell';

export default function FavoritesDashboardPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoading(true);
    try {
      const res = await fetch('/api/user/profile');
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function removeFavorite(url) {
    try {
      const res = await fetch(`/api/user/profile?url=${encodeURIComponent(url)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const minutesListened = Math.round((profile?.stats?.listeningTimeMs || 0) / 60000);

  return (
    <DashboardShell activeSection="favorites">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 border-b border-white/[0.06]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Liked Songs & Listening History
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Your personal music collection saved via the 💖 Favorite button or <code className="text-pink-400 font-mono">/favorites</code>.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="px-4 py-2 rounded-xl bg-[#14131d] border border-white/[0.06] flex items-center gap-2.5 text-xs">
            <FaHeadphones className="text-pink-400" />
            <span className="text-gray-400">Tracks Played:</span>
            <strong className="text-white font-mono">{profile?.stats?.tracksPlayed || 0}</strong>
          </div>
          <div className="px-4 py-2 rounded-xl bg-[#14131d] border border-white/[0.06] flex items-center gap-2.5 text-xs">
            <FaClock className="text-purple-400" />
            <span className="text-gray-400">Listening Time:</span>
            <strong className="text-white font-mono">{minutesListened} mins</strong>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center text-gray-400">
          <div className="w-10 h-10 border-3 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold">Loading your personal music profile...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Liked Songs Column */}
          <div className="bg-[#14131d] p-6 rounded-2xl border border-white/[0.06]">
            <h2 className="text-base font-black text-white flex items-center gap-2.5 mb-5">
              <FaHeart className="text-rose-500" />
              <span>Liked Songs ({profile?.favorites?.length || 0})</span>
            </h2>

            {!profile?.favorites?.length ? (
              <p className="text-xs text-gray-500 py-10 text-center">
                No liked songs yet. Click the 💖 Favorite button on the Discord player panel while a track is playing!
              </p>
            ) : (
              <div className="space-y-2.5">
                {profile.favorites.map((track, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#211f30] border border-white/5"
                  >
                    <div className="min-w-0">
                      <a
                        href={track.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-white hover:text-pink-400 truncate block"
                      >
                        {track.title}
                      </a>
                      <span className="text-[11px] text-gray-400 block truncate">
                        {track.author} • {track.duration}
                      </span>
                    </div>

                    <button
                      onClick={() => removeFavorite(track.url)}
                      title="Remove from Favorites"
                      className="p-2 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-400 text-xs transition-colors cursor-pointer shrink-0"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recently Played Column */}
          <div className="bg-[#14131d] p-6 rounded-2xl border border-white/[0.06]">
            <h2 className="text-base font-black text-white flex items-center gap-2.5 mb-5">
              <FaHistory className="text-purple-400" />
              <span>Recently Streamed ({profile?.history?.length || 0})</span>
            </h2>

            {!profile?.history?.length ? (
              <p className="text-xs text-gray-500 py-10 text-center">
                Your recently played tracks in Discord will appear here automatically.
              </p>
            ) : (
              <div className="space-y-2.5">
                {profile.history.slice(0, 12).map((track, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#211f30] border border-white/5"
                  >
                    <div className="min-w-0">
                      <a
                        href={track.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-white hover:text-purple-300 truncate block"
                      >
                        {track.title}
                      </a>
                      <span className="text-[11px] text-gray-400 block truncate">
                        {track.author}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-gray-400 shrink-0">
                      {track.duration}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

