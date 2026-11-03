import Link from 'next/link';
import { FaShieldAlt, FaArrowLeft, FaFileContract, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

export const metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service and conditions for using Revera Music Bot and its web dashboard.',
  openGraph: {
    title: 'Terms of Service | Revera',
    description: 'Terms of Service and conditions for using Revera Music Bot and its web dashboard.',
  },
};

export default function TermsOfServicePage() {
  return (
    <div className="relative w-full min-h-screen bg-[#08060d] text-white pt-28 sm:pt-36 pb-24 px-4 sm:px-6 lg:px-8 font-['Plus_Jakarta_Sans',sans-serif] bg-dux-grid overflow-hidden">
      {/* Background Aurora Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#ff2a9d]/20 via-[#a855f7]/10 to-transparent blur-[130px] rounded-full" />
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/15 text-pink-400 text-xs font-bold mb-3 border border-pink-500/20">
            <FaFileContract />
            <span>Legal Documentation</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Terms of Service
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
              <span className="text-pink-400 font-mono text-sm">01.</span>
              <span>Acceptance of Terms</span>
            </h2>
            <p>
              By inviting, accessing, or using the <strong>Revera</strong> Discord bot, its official website,
              and associated web dashboard services (collectively referred to as the &quot;Service&quot;), you
              agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms,
              please discontinue the use of Revera and remove the bot from your Discord servers.
            </p>
          </section>

          {/* Section 2 */}
          <section className="dux-card p-6 sm:p-8">
            <h2 className="text-lg font-black text-white mb-3 flex items-center gap-2.5">
              <span className="text-pink-400 font-mono text-sm">02.</span>
              <span>Discord Terms of Service Compliance</span>
            </h2>
            <p className="mb-3">
              Revera operates on the Discord platform. As a condition of using Revera, you must comply with:
            </p>
            <ul className="space-y-2 text-xs text-gray-300 list-disc list-inside">
              <li>
                <a href="https://discord.com/terms" target="_blank" rel="noopener noreferrer" className="text-pink-400 underline">
                  Discord Terms of Service
                </a>
              </li>
              <li>
                <a href="https://discord.com/guidelines" target="_blank" rel="noopener noreferrer" className="text-pink-400 underline">
                  Discord Community Guidelines
                </a>
              </li>
              <li>
                <a href="https://discord.com/developers/docs/policies-and-agreements/developer-policy" target="_blank" rel="noopener noreferrer" className="text-pink-400 underline">
                  Discord Developer Policy
                </a>
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="dux-card p-6 sm:p-8">
            <h2 className="text-lg font-black text-white mb-3 flex items-center gap-2.5">
              <span className="text-pink-400 font-mono text-sm">03.</span>
              <span>Permitted Use & User Conduct</span>
            </h2>
            <p className="mb-3">
              Revera is designed to provide high-quality audio streaming, real-time audio filters, and playlist
              management in Discord voice channels. When using our Service, you agree NOT to:
            </p>
            <div className="space-y-2.5 text-xs text-gray-300">
              <div className="flex items-start gap-2">
                <FaCheckCircle className="text-emerald-400 shrink-0 mt-0.5 text-xs" />
                <span>Use the Service to transmit abusive, hateful, obscene, or defamatory audio.</span>
              </div>
              <div className="flex items-start gap-2">
                <FaCheckCircle className="text-emerald-400 shrink-0 mt-0.5 text-xs" />
                <span>Attempt to bypass bot rate limits, access controls, or overload bot audio infrastructure.</span>
              </div>
              <div className="flex items-start gap-2">
                <FaCheckCircle className="text-emerald-400 shrink-0 mt-0.5 text-xs" />
                <span>Exploit bugs, reverse-engineer, decompile, or tamper with the bot&apos;s source code or API.</span>
              </div>
              <div className="flex items-start gap-2">
                <FaCheckCircle className="text-emerald-400 shrink-0 mt-0.5 text-xs" />
                <span>Use the bot to transmit unauthorized commercial spam or automated voice disruptions.</span>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="dux-card p-6 sm:p-8">
            <h2 className="text-lg font-black text-white mb-3 flex items-center gap-2.5">
              <span className="text-pink-400 font-mono text-sm">04.</span>
              <span>Third-Party Services & Content</span>
            </h2>
            <p className="mb-3">
              Revera allows users to stream publicly accessible media links from third-party services including
              <strong> YouTube</strong>, <strong>Spotify</strong>, <strong>SoundCloud</strong>, and <strong>Apple Music</strong>.
            </p>
            <p className="text-xs text-gray-400 leading-relaxed mb-3">
              Revera does not host, store, or own any audio or musical content streamed through the Service.
              All audio content, album artwork, and trademarks belong to their respective copyright owners and artists.
              You are responsible for ensuring that you have the right to stream queries or URLs requested in your voice channels.
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              We comply with applicable copyright laws and honor legitimate DMCA / copyright infringement requests.
            </p>
          </section>

          {/* Section 5 */}
          <section className="dux-card p-6 sm:p-8">
            <h2 className="text-lg font-black text-white mb-3 flex items-center gap-2.5">
              <span className="text-pink-400 font-mono text-sm">05.</span>
              <span>Cloud Playlists & Server Isolation</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 mb-2">
              Playlists created via the dashboard or bot commands are scoped to the specific Discord server
              (<code className="text-pink-400 font-mono">guildId</code>) in which they are created.
            </p>
            <p className="text-xs text-gray-400">
              We do not guarantee permanent storage of custom playlists or settings. Users may delete their
              playlists at any time directly through the dashboard or using the <code className="text-pink-400 font-mono">/playlist delete</code> command.
            </p>
          </section>

          {/* Section 6 */}
          <section className="dux-card p-6 sm:p-8">
            <h2 className="text-lg font-black text-white mb-3 flex items-center gap-2.5">
              <span className="text-pink-400 font-mono text-sm">06.</span>
              <span>Service Availability & Disclaimers</span>
            </h2>
            <p className="mb-3 text-xs sm:text-sm">
              The Service is provided on an <strong>&quot;AS IS&quot;</strong> and <strong>&quot;AS AVAILABLE&quot;</strong> basis
              without warranties of any kind, either express or implied.
            </p>
            <p className="text-xs text-gray-400 leading-relaxed mb-2">
              We do not guarantee that the Service will always be uninterrupted, error-free, completely secure,
              or free from latency. Temporary service interruptions may occur due to Discord API maintenance,
              third-party audio extractor updates, or hosting server restarts.
            </p>
          </section>

          {/* Section 7 */}
          <section className="dux-card p-6 sm:p-8">
            <h2 className="text-lg font-black text-white mb-3 flex items-center gap-2.5">
              <span className="text-pink-400 font-mono text-sm">07.</span>
              <span>Limitation of Liability</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              To the maximum extent permitted by applicable law, the Revera development team shall not be held liable
              for any direct, indirect, incidental, special, consequential, or punitive damages resulting from your access
              to or inability to use the Service, including any Discord server administration disputes or data loss.
            </p>
          </section>

          {/* Section 8 */}
          <section className="dux-card p-6 sm:p-8">
            <h2 className="text-lg font-black text-white mb-3 flex items-center gap-2.5">
              <span className="text-pink-400 font-mono text-sm">08.</span>
              <span>Modifications to Terms</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-300">
              We reserve the right to revise these Terms at any time. Any changes will be posted on this page with an updated
              effective date. Continued use of the Service following any modifications signifies your acceptance of the revised Terms.
            </p>
          </section>

          {/* Contact Block */}
          <section className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-transparent border border-pink-500/20">
            <h3 className="text-base font-bold text-white mb-2">Questions or Inquiries?</h3>
            <p className="text-xs text-gray-300 mb-4">
              If you have any questions regarding these Terms of Service or need support, reach out to our team
              via our official Discord community.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 text-xs font-bold transition-colors"
            >
              <span>Return to Revera Music</span>
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}

