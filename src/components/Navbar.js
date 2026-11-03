'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signIn, signOut } from 'next-auth/react';
import {
  FaDiscord,
  FaSlidersH,
  FaSignOutAlt,
  FaChevronDown,
  FaBroadcastTower,
  FaFolderOpen
} from 'react-icons/fa';
import { RiEqualizerFill } from 'react-icons/ri';
import { MdAudiotrack } from 'react-icons/md';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileDropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID || '1566285256397553768';
  const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=37046336&scope=bot%20applications.commands`;

  const featuresList = [
    { title: 'Interactive Player Deck', desc: 'Discord buttons, modals & queue menus', href: '/#features', icon: <FaSlidersH className="text-[#ff2a9d]" /> },
    { title: '13+ Studio DSP Filters', desc: 'Real-time 8D, Bassboost & Nightcore', href: '/#filters', icon: <RiEqualizerFill className="text-[#a855f7]" /> },
    { title: '24/7 Voice Radio', desc: 'Indefinite low-latency voice connection', href: '/#features', icon: <FaBroadcastTower className="text-cyan-400" /> },
    { title: 'Dedicated Song Request', desc: 'Hands-free typing in #revera-music', href: '/#features', icon: <MdAudiotrack className="text-emerald-400" /> }
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${scrolled
          ? 'backdrop-blur-2xl bg-[#08060d]/85 border-b border-white/[0.08] shadow-2xl shadow-black/60'
          : 'bg-transparent border-b border-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="relative w-16 h-16 rounded-2xl p-0.5 transition-transform">
              <Image
                src="/revera-tp.png"
                alt="Revera"
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-wider text-white block leading-none">
                REVERA
              </span>
              <span className="text-[10px] font-bold tracking-widest uppercase text-pink-400">
                Music Studio
              </span>
            </div>
          </Link>

          {/* Dux Header Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-300">
            <Link href="/" className="text-white hover:text-pink-400 transition-colors">
              Home
            </Link>

            {/* Features Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <button
                type="button"
                className="flex items-center gap-1.5 py-2 hover:text-white transition-colors cursor-pointer"
              >
                <span>Modules</span>
                <FaChevronDown
                  className={`text-[10px] transition-transform ${dropdownOpen ? 'rotate-180 text-pink-400' : ''
                    }`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 top-full pt-2 w-[480px] z-50">
                  <div className="dux-card p-4 shadow-2xl grid grid-cols-2 gap-2 bg-[#100b1a]/95 border border-white/10">
                    {featuresList.map((item, i) => (
                      <Link
                        key={i}
                        href={item.href}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.05] transition-colors"
                      >
                        <div className="w-9 h-9 rounded-xl bg-white/[0.05] flex items-center justify-center text-sm shrink-0 mt-0.5">
                          {item.icon}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white leading-tight">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-1 leading-snug">
                            {item.desc}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link href="/#commands" className="hover:text-pink-400 transition-colors">
              Commands
            </Link>
            <Link href="/dashboard/playlists" className="hover:text-pink-400 transition-colors">
              Playlists
            </Link>
            <Link href="/#faq" className="hover:text-pink-400 transition-colors">
              FAQ
            </Link>
          </nav>
        </div>

        {/* Right: Auth & Profile Dropdown */}
        <div className="flex items-center gap-4">
          {status === 'loading' ? (
            <div className="w-9 h-9 rounded-full bg-white/10 animate-pulse" />
          ) : session?.user ? (
            <div className="relative" ref={profileDropdownRef}>
              {/* Profile Pill: ONLY Avatar and @username */}
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-pink-500/40 transition-all cursor-pointer group shadow-lg shadow-black/20"
              >
                <div className="relative">
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      className="w-7 h-7 rounded-full object-cover ring-2 ring-pink-500/40 group-hover:ring-pink-500/70 transition-all"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#ff2a9d] to-[#a855f7] flex items-center justify-center font-bold text-xs text-white">
                      {session.user.name?.[0] || 'U'}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[#08060d]" />
                </div>
                <span className="text-xs font-bold text-gray-200 group-hover:text-white transition-colors">
                  @{session.user.name}
                </span>
                <FaChevronDown
                  className={`text-[9px] text-gray-400 group-hover:text-white transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180 text-pink-400' : ''
                    }`}
                />
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-[#141022]/95 backdrop-blur-2xl border border-white/10 shadow-2xl p-2 z-50 animate-fade-in">
                  {/* User Profile Info Header */}
                  <div className="px-3 py-2.5 border-b border-white/5 mb-1.5 flex items-center gap-3">
                    <div className="relative">
                      {session.user.image ? (
                        <img
                          src={session.user.image}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover ring-1 ring-white/20"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center text-sm font-bold">
                          {session.user.name?.[0] || 'U'}
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#141022]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate leading-tight">
                        {session.user.name}
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono truncate leading-tight mt-0.5">
                        @{session.user.name}
                      </p>
                    </div>
                  </div>

                  {/* Actions inside Dropdown */}
                  <div className="space-y-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-gray-200 hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <span className="p-1.5 rounded-lg bg-pink-500/15 text-pink-400">
                        <FaSlidersH className="text-xs" />
                      </span>
                      <div className="min-w-0">
                        <span className="block leading-tight">Dashboard</span>
                        <span className="text-[10px] text-gray-400 font-normal">Bot controls & player</span>
                      </div>
                    </Link>

                    <Link
                      href="/dashboard/playlists"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-gray-200 hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <span className="p-1.5 rounded-lg bg-purple-500/15 text-purple-400">
                        <FaFolderOpen className="text-xs" />
                      </span>
                      <div className="min-w-0">
                        <span className="block leading-tight">Server Playlists</span>
                        <span className="text-[10px] text-gray-400 font-normal">Manage & import tracks</span>
                      </div>
                    </Link>

                    <a
                      href={inviteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-gray-200 hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <span className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-400">
                        <FaDiscord className="text-xs" />
                      </span>
                      <div className="min-w-0">
                        <span className="block leading-tight">Add to Discord</span>
                        <span className="text-[10px] text-gray-400 font-normal">Invite Revera to server</span>
                      </div>
                    </a>
                  </div>

                  {/* Divider */}
                  <div className="my-1.5 border-t border-white/5" />

                  {/* Sign Out Button */}
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      signOut({ callbackUrl: '/' });
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <span className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400">
                      <FaSignOutAlt className="text-xs" />
                    </span>
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => signIn('discord', { callbackUrl: '/dashboard' })}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-gray-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <a
                href={inviteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 sm:px-6 sm:py-2.5 rounded-xl text-xs sm:text-sm font-extrabold text-white btn-dux-primary flex items-center gap-2.5 transition-all active:scale-95 cursor-pointer"
              >
                <FaDiscord className="text-base" />
                <span>Add to Discord</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
