import Link from 'next/link';
import { FaHome, FaCompass } from 'react-icons/fa';

export const metadata = {
  title: '404 - Page Not Found',
  description: 'The page you are looking for does not exist on Revera Music Studio.',
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-20 relative bg-[#08060d]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 blur-[120px] rounded-full pointer-events-none" />
      <span className="text-8xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 font-mono tracking-tighter">
        404
      </span>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-4">
        Page Not Found
      </h1>
      <p className="text-gray-400 max-w-md mt-2 text-sm">
        The track or destination you are looking for has faded into silence. Let&apos;s get you back to the beat.
      </p>
      <div className="mt-8 flex items-center gap-4">
        <Link
          href="/"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-sm flex items-center gap-2 hover:opacity-90 shadow-lg shadow-pink-500/25 transition-all"
        >
          <FaHome /> Return Home
        </Link>
        <Link
          href="/dashboard"
          className="px-6 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-gray-300 font-bold text-sm flex items-center gap-2 hover:bg-white/[0.08] hover:text-white transition-all"
        >
          <FaCompass /> Dashboard
        </Link>
      </div>
    </div>
  );
}

