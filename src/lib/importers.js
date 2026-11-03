import { Innertube } from 'youtubei.js';

let innertubeInstance = null;

async function getInnertube() {
  if (!innertubeInstance) {
    innertubeInstance = await Innertube.create();
  }
  return innertubeInstance;
}

// In-memory token cache for Spotify API
let cachedSpotifyToken = null;
let spotifyTokenExpiresAt = 0;

/**
 * Retrieves a Spotify Client Credentials access token.
 */
async function getSpotifyToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID || process.env.DP_SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET || process.env.DP_SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) return null;

  if (cachedSpotifyToken && Date.now() < spotifyTokenExpiresAt - 60000) {
    return cachedSpotifyToken;
  }

  try {
    const creds = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${creds}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    if (!res.ok) {
      console.warn(`[Spotify API] Failed to obtain token (Status ${res.status})`);
      return null;
    }

    const data = await res.json();
    if (data.access_token) {
      cachedSpotifyToken = data.access_token;
      spotifyTokenExpiresAt = Date.now() + ((data.expires_in || 3600) * 1000);
      return cachedSpotifyToken;
    }
  } catch (err) {
    console.warn('[Spotify API] Error fetching access token:', err.message);
  }
  return null;
}

/**
 * Fetches a Spotify playlist with full pagination using the official Web API.
 */
async function fetchSpotifyPlaylistAPI(playlistId, token) {
  const res = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}?fields=name,images,tracks(total,next,items(track(id,name,artists,duration_ms,album(images),external_urls)))`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) {
    throw new Error(`Spotify API playlist error (${res.status})`);
  }

  const data = await res.json();
  const playlistName = data.name || 'Spotify Playlist';
  const rawCover = data.images?.[0]?.url || '';
  const tracks = [];

  function processItems(items) {
    if (!items || !Array.isArray(items)) return;
    for (const item of items) {
      const track = item.track;
      if (!track || !track.id) continue;
      const durationSec = Math.floor((track.duration_ms || 0) / 1000);
      const m = Math.floor(durationSec / 60);
      const s = durationSec % 60;
      const durationStr = `${m}:${s < 10 ? '0' : ''}${s}`;

      tracks.push({
        title: track.name || 'Unknown Track',
        author: (track.artists || []).map((a) => a.name).join(', ') || 'Spotify Artist',
        url: track.external_urls?.spotify || `https://open.spotify.com/track/${track.id}`,
        duration: durationStr,
        thumbnail: track.album?.images?.[0]?.url || rawCover
      });
    }
  }

  processItems(data.tracks?.items);

  let nextUrl = data.tracks?.next;
  let pageCount = 0;
  // Paginate through all tracks (up to 1,000+ tracks)
  while (nextUrl && pageCount < 20) {
    pageCount++;
    try {
      const pageRes = await fetch(nextUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!pageRes.ok) break;
      const pageData = await pageRes.json();
      processItems(pageData.items);
      nextUrl = pageData.next;
    } catch (err) {
      console.warn('[Spotify API] Playlist pagination failed:', err.message);
      break;
    }
  }

  // Spotify policy (Nov 2024+) returns 200 with metadata but strips tracks for Client Credentials.
  // If no tracks were populated via Web API, throw so the reliable embed parser runs.
  if (!tracks.length) {
    throw new Error('Spotify Web API returned no tracks (restricted by Spotify Client Credentials policy), using embed fallback');
  }

  return {
    type: 'spotify_playlist',
    name: playlistName,
    thumbnail: rawCover,
    tracks
  };
}

/**
 * Fetches a Spotify album with full pagination using the official Web API.
 */
async function fetchSpotifyAlbumAPI(albumId, token) {
  const res = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    throw new Error(`Spotify API album error (${res.status})`);
  }

  const data = await res.json();
  const albumName = data.name || 'Spotify Album';
  const rawCover = data.images?.[0]?.url || '';
  const tracks = [];

  function processItems(items) {
    if (!items || !Array.isArray(items)) return;
    for (const track of items) {
      if (!track || !track.id) continue;
      const durationSec = Math.floor((track.duration_ms || 0) / 1000);
      const m = Math.floor(durationSec / 60);
      const s = durationSec % 60;
      const durationStr = `${m}:${s < 10 ? '0' : ''}${s}`;

      tracks.push({
        title: track.name || 'Unknown Track',
        author: (track.artists || []).map((a) => a.name).join(', ') || 'Spotify Artist',
        url: track.external_urls?.spotify || `https://open.spotify.com/track/${track.id}`,
        duration: durationStr,
        thumbnail: rawCover
      });
    }
  }

  processItems(data.tracks?.items);

  let nextUrl = data.tracks?.next;
  let pageCount = 0;
  while (nextUrl && pageCount < 20) {
    pageCount++;
    try {
      const pageRes = await fetch(nextUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!pageRes.ok) break;
      const pageData = await pageRes.json();
      processItems(pageData.items);
      nextUrl = pageData.next;
    } catch (err) {
      console.warn('[Spotify API] Album pagination failed:', err.message);
      break;
    }
  }

  if (!tracks.length) {
    throw new Error('Spotify Web API returned no tracks for album, using embed fallback');
  }

  return {
    type: 'spotify_album',
    name: albumName,
    thumbnail: rawCover,
    tracks
  };
}

/**
 * Fetches a single Spotify track with high-res art and exact metadata.
 */
async function fetchSpotifyTrackAPI(trackId, token) {
  const res = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    throw new Error(`Spotify API single track error (${res.status})`);
  }

  const track = await res.json();
  const durationSec = Math.floor((track.duration_ms || 0) / 1000);
  const m = Math.floor(durationSec / 60);
  const s = durationSec % 60;
  const durationStr = `${m}:${s < 10 ? '0' : ''}${s}`;
  const thumbnail = track.album?.images?.[0]?.url || '';

  return {
    type: 'spotify_track',
    name: track.name || 'Spotify Track',
    thumbnail,
    tracks: [
      {
        title: track.name || 'Spotify Track',
        author: (track.artists || []).map((a) => a.name).join(', ') || 'Spotify Artist',
        url: track.external_urls?.spotify || `https://open.spotify.com/track/${track.id}`,
        duration: durationStr,
        thumbnail
      }
    ]
  };
}

/**
 * Extracts tracks from Spotify playlists/albums/tracks, YouTube playlists/videos, and SoundCloud.
 * @param {string} inputUrl
 * @returns {Promise<{ type: string, name: string, thumbnail?: string, tracks: Array<{ title: string, author: string, duration: string, url: string, thumbnail?: string }> }>}
 */
export async function extractMedia(inputUrl) {
  if (!inputUrl || typeof inputUrl !== 'string') {
    throw new Error('Please enter a valid URL or search term.');
  }

  const url = inputUrl.trim();

  // 1. SPOTIFY PLAYLIST OR ALBUM
  const spotifyPlaylistMatch = url.match(/open\.spotify\.com\/(?:intl-[a-z]{2}\/)?playlist\/([a-zA-Z0-9]+)/i);
  const spotifyAlbumMatch = url.match(/open\.spotify\.com\/(?:intl-[a-z]{2}\/)?album\/([a-zA-Z0-9]+)/i);

  if (spotifyPlaylistMatch || spotifyAlbumMatch) {
    const isAlbum = !!spotifyAlbumMatch;
    const id = isAlbum ? spotifyAlbumMatch[1] : spotifyPlaylistMatch[1];

    // Priority 1: Try official Spotify Web API (Full tracks, pagination, high-res covers)
    const token = await getSpotifyToken();
    if (token) {
      try {
        if (isAlbum) {
          return await fetchSpotifyAlbumAPI(id, token);
        } else {
          return await fetchSpotifyPlaylistAPI(id, token);
        }
      } catch (apiErr) {
        // Silently transition to reliable embed parser when Spotify restricts direct track endpoints
      }
    }

    // Priority 2: Embed fallback (for unauthenticated or restricted environments)
    const embedUrl = `https://open.spotify.com/embed/${isAlbum ? 'album' : 'playlist'}/${id}`;

    const res = await fetch(embedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to load Spotify ${isAlbum ? 'album' : 'playlist'} (${res.status}). Ensure it is public.`);
    }

    const html = await res.text();
    const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]+?)<\/script>/);
    if (!match) {
      throw new Error('Unable to extract Spotify tracks. The playlist may be private or restricted.');
    }

    const data = JSON.parse(match[1]);
    const entity = data.props?.pageProps?.state?.data?.entity;
    if (!entity) {
      throw new Error('Spotify playlist data was empty or restricted.');
    }

    const playlistName = entity.name || (isAlbum ? 'Spotify Album' : 'Spotify Playlist');
    const rawCover = entity.visualIdentity?.image?.[0]?.url || entity.coverArt?.sources?.[0]?.url || '';

    const rawTrackList = entity.trackList || entity.tracks?.items || entity.tracks || [];

    const tracks = rawTrackList.map((item) => {
      const t = item.track || item;
      const uri = t.uri || '';
      const trackId = uri ? uri.split(':').pop() : (t.id || '');
      const durationSec = Math.floor((t.duration || t.duration_ms || 0) / 1000);
      const m = Math.floor(durationSec / 60);
      const s = durationSec % 60;
      const durationStr = `${m}:${s < 10 ? '0' : ''}${s}`;

      const title = t.title || t.name || 'Unknown Track';
      const author =
        t.subtitle ||
        (Array.isArray(t.artists) ? t.artists.map((a) => a.name).join(', ') : '') ||
        entity.subtitle ||
        'Spotify Artist';
      const thumbnail = t.album?.images?.[0]?.url || rawCover;

      return {
        title,
        author,
        url: trackId ? `https://open.spotify.com/track/${trackId}` : url,
        duration: durationStr,
        thumbnail
      };
    });

    return {
      type: isAlbum ? 'spotify_album' : 'spotify_playlist',
      name: playlistName,
      thumbnail: rawCover,
      tracks
    };
  }

  // 2. SPOTIFY SINGLE TRACK
  const spotifyTrackMatch = url.match(/open\.spotify\.com\/(?:intl-[a-z]{2}\/)?track\/([a-zA-Z0-9]+)/i);
  if (spotifyTrackMatch) {
    const trackId = spotifyTrackMatch[1];
    const token = await getSpotifyToken();
    if (token) {
      try {
        return await fetchSpotifyTrackAPI(trackId, token);
      } catch (trackErr) {
        // Fallback to oEmbed if track API lookup fails
      }
    }

    const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`;
    const res = await fetch(oembedUrl);
    if (res.ok) {
      const oembed = await res.json();
      return {
        type: 'spotify_track',
        name: oembed.title || 'Spotify Track',
        thumbnail: oembed.thumbnail_url || '',
        tracks: [
          {
            title: oembed.title || 'Spotify Track',
            author: oembed.author_name || 'Spotify Artist',
            url: url.split('?')[0],
            duration: '03:30',
            thumbnail: oembed.thumbnail_url || ''
          }
        ]
      };
    }
  }

  // 3. YOUTUBE PLAYLIST
  const ytPlaylistMatch = url.match(/[?&]list=([a-zA-Z0-9_-]+)/i);
  if (ytPlaylistMatch && (url.includes('youtube.com') || url.includes('youtu.be'))) {
    const playlistId = ytPlaylistMatch[1];
    const yt = await getInnertube();
    let playlist = await yt.getPlaylist(playlistId);

    const playlistName = playlist.info?.title || 'YouTube Playlist';
    const allVideos = [...(playlist.videos || [])];

    // Paginate through ALL continuation batches to load the entire playlist (e.g. 263, 500, or 1000+ tracks)
    while (playlist.has_continuation && allVideos.length < 3000) {
      try {
        playlist = await playlist.getContinuation();
        if (playlist.videos?.length) {
          allVideos.push(...playlist.videos);
        } else {
          break;
        }
      } catch (err) {
        console.error('Error fetching playlist continuation:', err);
        break;
      }
    }

    const tracks = [];

    for (const v of allVideos) {
      const videoId = v.id || v.content_id;
      const title = v.title?.text || v.metadata?.title?.text || (typeof v.title?.toString === 'function' ? v.title.toString() : '');
      const author = v.author?.name || v.metadata?.metadata?.metadata_rows?.[0]?.metadata_parts?.[0]?.text?.text || 'YouTube Creator';
      const duration = v.duration?.text || '03:00';
      const thumbnail = v.thumbnails?.[0]?.url || v.content_image?.image?.[0]?.url || (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '');

      if (videoId && title) {
        tracks.push({
          title,
          author,
          url: `https://www.youtube.com/watch?v=${videoId}`,
          duration,
          thumbnail
        });
      }
    }

    if (tracks.length === 0) {
      throw new Error('No public tracks found in this YouTube playlist.');
    }

    return {
      type: 'youtube_playlist',
      name: playlistName,
      thumbnail: tracks[0]?.thumbnail || '',
      tracks
    };
  }

  // 4. YOUTUBE SINGLE VIDEO
  const ytVideoMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  if (ytVideoMatch) {
    const videoId = ytVideoMatch[1];
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const res = await fetch(oembedUrl);
    if (res.ok) {
      const oembed = await res.json();
      return {
        type: 'youtube_track',
        name: oembed.title || 'YouTube Video',
        thumbnail: oembed.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        tracks: [
          {
            title: oembed.title || 'YouTube Video',
            author: oembed.author_name || 'YouTube Creator',
            url: `https://www.youtube.com/watch?v=${videoId}`,
            duration: '03:00',
            thumbnail: oembed.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
          }
        ]
      };
    }
  }

  // 5. SOUNDCLOUD
  if (url.includes('soundcloud.com')) {
    const scUrl = `https://soundcloud.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const res = await fetch(scUrl);
    if (res.ok) {
      const oembed = await res.json();
      return {
        type: 'soundcloud_track',
        name: oembed.title || 'SoundCloud Track',
        thumbnail: oembed.thumbnail_url || '',
        tracks: [
          {
            title: oembed.title || 'SoundCloud Track',
            author: oembed.author_name || 'SoundCloud Artist',
            url,
            duration: '03:00',
            thumbnail: oembed.thumbnail_url || ''
          }
        ]
      };
    }
  }

  // 6. Generic or Search query
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return {
      type: 'search',
      name: url,
      tracks: [
        {
          title: url,
          author: 'Search Query',
          url: url,
          duration: '03:00',
          thumbnail: ''
        }
      ]
    };
  }

  throw new Error('Unsupported URL format. Supported: Spotify (Playlists, Albums, Tracks), YouTube (Playlists, Videos), SoundCloud.');
}

