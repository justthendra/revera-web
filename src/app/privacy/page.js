import Link from 'next/link';
import { FaShieldAlt, FaArrowLeft, FaUserLock, FaDatabase, FaEyeSlash, FaCheckCircle } from 'react-icons/fa';

export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy describing how Revera Music Bot collects, uses, and safeguards your data.',
  openGraph: {
    title: 'Privacy Policy | Revera',
    description: 'Privacy Policy describing how Revera Music Bot collects, uses, and safeguards your data.',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="relative w-full min-h-screen bg-[#08060d] text-white pt-28 sm:pt-36 pb-24 px-4 sm:px-6 lg:px-8 font-['Plus_Jakarta_Sans',sans-serif] bg-dux-grid overflow-hidden">
      {/* Background Aurora Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#a855f7]/20 via-[#ff2a9d]/10 to-transparent blur-[130px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Navigation Breadcrumb */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <FaArrowLeft className="text-[10px]" />
          <span>Back to Home</span>
        </Link>

        {/* Page Header */}
        <div className="mb-10 pb-8 border-b border-white/[0.08]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 text-purple-400 text-xs font-bold mb-3 border border-purple-500/20">
            <FaUserLock />
            <span>Data Protection & Privacy</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-2 font-mono">
            Last Updated: November 2, 2026 • Effective Immediately
          </p>
        </div>

        {/* Document Content */}
        <div className="space-y-8 text-sm text-gray-300 leading-relaxed">
          {/* Section 1 */}
          <section className="dux-card p-6 sm:p-8">
            <h2 className="text-lg font-black text-white mb-3 flex items-center gap-2.5">
              <span className="text-purple-400 font-mono text-sm">01.</span>
              <span>Overview & Scope</span>
            </h2>
            <p>
              Your privacy is of paramount importance to us. This Privacy Policy details the types of information
              collected by <strong>Revera</strong> (&quot;we&quot;, &quot;our&quot;, or &quot;the Service&quot;), how that data is used, stored,
              and your rights regarding your personal information when using our Discord bot and web dashboard.
            </p>
          </section>

          {/* Section 2 */}
          <section className="dux-card p-6 sm:p-8">
            <h2 className="text-lg font-black text-white mb-3 flex items-center gap-2.5">
              <span className="text-purple-400 font-mono text-sm">02.</span>
              <span>Information We Collect</span>
            </h2>
            <p className="mb-4">
              To provide music playback, persistent server settings, and cloud playlist features, Revera collects
              the minimum necessary data:
            </p>

            <div className="space-y-3 text-xs text-gray-300">
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                <strong className="text-white block mb-1">Discord User Identification:</strong>
                <span>
                  When you authenticate on our dashboard via Discord OAuth2, we receive your Discord User ID,
                  username, avatar URL, and the list of Discord servers you manage to populate the dashboard selector.
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                <strong className="text-white block mb-1">Server & Channel Configuration:</strong>
                <span>
                  Discord Server IDs (<code className="text-purple-400">guildId</code>), designated text channel IDs,
                  DJ role IDs, and audio volume preferences are saved in MongoDB to maintain your server setup across bot restarts.
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                <strong className="text-white block mb-1">Custom Playlists & Favorites:</strong>
                <span>
                  Track metadata (song title, author, duration, URL, thumbnail) of playlists you create or import
                  from Spotify/YouTube are saved and tied exclusively to your server or user profile.
                </span>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="dux-card p-6 sm:p-8">
            <h2 className="text-lg font-black text-white mb-3 flex items-center gap-2.5">
              <span className="text-purple-400 font-mono text-sm">03.</span>
              <span>Information We NEVER Collect</span>
            </h2>
            <p className="mb-3 text-xs sm:text-sm">
              We respect your Discord privacy and adhere strictly to zero-intrusion standards:
            </p>
            <div className="space-y-2.5 text-xs text-gray-300">
              <div className="flex items-start gap-2">
                <FaEyeSlash className="text-emerald-400 shrink-0 mt-0.5 text-xs" />
                <span><strong>No Voice Recording:</strong> Revera NEVER records, monitors, stores, or processes any voice audio from your Discord voice channels.</span>
              </div>
              <div className="flex items-start gap-2">
                <FaEyeSlash className="text-emerald-400 shrink-0 mt-0.5 text-xs" />
                <span><strong>No Message Harvesting:</strong> We do NOT read, store, or log private direct messages (DMs) or unrelated server chat messages.</span>
              </div>
              <div className="flex items-start gap-2">
                <FaEyeSlash className="text-emerald-400 shrink-0 mt-0.5 text-xs" />
                <span><strong>No Passwords or Financial Details:</strong> Authentication is handled strictly through official Discord OAuth2. We never touch your Discord credentials.</span>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="dux-card p-6 sm:p-8">
            <h2 className="text-lg font-black text-white mb-3 flex items-center gap-2.5">
              <span className="text-purple-400 font-mono text-sm">04.</span>
              <span>How We Use Your Data</span>
            </h2>
            <ul className="space-y-2 text-xs text-gray-300 list-disc list-inside">
              <li>To initialize audio streaming and maintain 24/7 voice radio connectivity in your server.</li>
              <li>To display live player controllers, seek times, and current song metadata on the web dashboard.</li>
              <li>To enforce DJ role permissions and channel lockdowns configured by server administrators.</li>
              <li>To store, import, and stream server-exclusive custom playlists.</li>
              <li>To diagnose technical errors and ensure high-availability audio engine performance.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="dux-card p-6 sm:p-8">
            <h2 className="text-lg font-black text-white mb-3 flex items-center gap-2.5">
              <span className="text-purple-400 font-mono text-sm">05.</span>
              <span>Third-Party Services</span>
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed mb-3">
              Revera communicates with the following authorized third parties to provide functionality:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <strong className="text-white block">Discord API:</strong>
                <span className="text-gray-400">Used for slash commands, voice gateway connections, and user authentication.</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <strong className="text-white block">MongoDB Atlas:</strong>
                <span className="text-gray-400">Encrypted cloud database storing server settings and playlist schemas.</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <strong className="text-white block">YouTube & Spotify:</strong>
                <span className="text-gray-400">Queried dynamically for track titles, duration, and public audio streams.</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <strong className="text-white block">NextAuth.js:</strong>
                <span className="text-gray-400">Secure, encrypted HTTP-only session cookies for web dashboard logins.</span>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="dux-card p-6 sm:p-8">
            <h2 className="text-lg font-black text-white mb-3 flex items-center gap-2.5">
              <span className="text-purple-400 font-mono text-sm">06.</span>
              <span>Data Retention & Your Deletion Rights</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 mb-3">
              You retain full ownership and control over your stored data:
            </p>
            <div className="space-y-2 text-xs text-gray-400">
              <p>
                • <strong>Playlists:</strong> You can permanently delete any playlist you created at any time directly through the dashboard or by executing <code className="text-purple-400">/playlist delete</code> in Discord.
              </p>
              <p>
                • <strong>Server Settings:</strong> Server administrators can reset all bot settings to default using the dashboard &quot;Reset Defaults&quot; button.
              </p>
              <p>
                • <strong>Right to be Forgotten:</strong> Removing Revera from your server or requesting manual data removal permanently detaches all server records from our active databases.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section className="dux-card p-6 sm:p-8">
            <h2 className="text-lg font-black text-white mb-3 flex items-center gap-2.5">
              <span className="text-purple-400 font-mono text-sm">07.</span>
              <span>Security Safeguards</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              We implement industry-standard encryption protocols (TLS/SSL) for all communication between the web dashboard,
              the Discord API, and our database clusters. Sensitive access tokens are strictly encrypted and never exposed
              to public client bundles.
            </p>
          </section>

          {/* Contact Block */}
          <section className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-transparent border border-purple-500/20">
            <h3 className="text-base font-bold text-white mb-2">Privacy Questions or Data Requests</h3>
            <p className="text-xs text-gray-300 mb-4">
              To request a copy of your stored data or request complete account erasure, contact our development
              team via our official Discord community.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-bold transition-colors"
            >
              <span>Return to Revera Music</span>
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}

