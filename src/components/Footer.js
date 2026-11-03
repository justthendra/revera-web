import Link from 'next/link';
import Image from 'next/image';
import { FaDiscord, FaSpotify, FaYoutube, FaSoundcloud, FaApple } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/[0.06] bg-[#06040a] text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
          {/* Col 1: Brand & Bio */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-xl p-0.5">
                <Image
                  src="/revera-tp.png"
                  alt="Revera"
                  width={64}
                  height={64}
                  className="rounded-[10px] w-full h-full object-cover"
                />
              </div>
              <span className="text-lg font-black tracking-wider text-white">
                REVERA
              </span>
            </Link>
            <p className="text-xs text-gray-400 max-w-sm leading-relaxed mb-6 font-normal">
              High-performance, lossless 320kbps Discord audio bot with 13+ real-time studio DSP filters, 24/7 radio mode, and a zero-latency web dashboard.
            </p>
            <div className="flex items-center gap-4 text-lg text-gray-400">
              <FaDiscord className="hover:text-[#5865F2] transition-colors cursor-pointer" />
              <FaSpotify className="hover:text-[#1DB954] transition-colors cursor-pointer" />
              <FaYoutube className="hover:text-[#FF0000] transition-colors cursor-pointer" />
              <FaSoundcloud className="hover:text-[#FF5500] transition-colors cursor-pointer" />
              <FaApple className="hover:text-pink-400 transition-colors cursor-pointer" />
            </div>
          </div>

          {/* Col 2: Features */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-white mb-4">
              Features
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/#features" className="hover:text-white transition-colors">Player Controller</Link></li>
              <li><Link href="/#filters" className="hover:text-white transition-colors">13+ DSP Filters</Link></li>
              <li><Link href="/#features" className="hover:text-white transition-colors">24/7 Voice Radio</Link></li>
              <li><Link href="/#features" className="hover:text-white transition-colors">Dedicated Channel</Link></li>
              <li><Link href="/dashboard/playlists" className="hover:text-white transition-colors">Cloud Playlists</Link></li>
            </ul>
          </div>

          {/* Col 3: Dashboard */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white mb-4">
              Dashboard
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Select a Server</Link></li>
              <li><Link href="/dashboard/playlists" className="hover:text-white transition-colors">Public Playlists</Link></li>
              <li><Link href="/dashboard/favorites" className="hover:text-white transition-colors">Liked Songs</Link></li>
              <li><Link href="/#commands" className="hover:text-white transition-colors">Slash Commands</Link></li>
            </ul>
          </div>

          {/* Col 4: Community */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white mb-4">
              Community
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Support Discord</a></li>
              <li><Link href="/#faq" className="hover:text-white transition-colors">FAQ & Guides</Link></li>
              <li><a href="https://top.gg" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Vote for Revera</a></li>
            </ul>
          </div>

          {/* Col 5: Legal */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white mb-4">
              Legal
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/terms" className="hover:text-pink-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-pink-400 transition-colors">Privacy Policy</Link></li>
              <li><a href="https://discord.com/terms" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Discord Terms</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/[0.06] pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <p>© 2026 Revera Audio Studio. All rights reserved.</p>
            <span className="text-gray-700">•</span>
            <Link href="/terms" className="hover:text-gray-400 transition-colors">Terms</Link>
            <span className="text-gray-700">•</span>
            <Link href="/privacy" className="hover:text-gray-400 transition-colors">Privacy</Link>
          </div>
          <p className="mt-2 sm:mt-0 font-mono text-[11px] text-pink-400">
            Powered by Thendra.
          </p>
        </div>
      </div>
    </footer>
  );
}
