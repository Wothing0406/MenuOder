import React from 'react';
import Link from 'next/link';

export default function TrackOrderButton({ className = '' }) {
  return (
    <Link href="/track-order" legacyBehavior>
      <a
        className={`inline-flex items-center gap-3 bg-white/95 hover:bg-white rounded-full px-4 py-2 shadow-md border border-purple-100 text-gray-900 font-semibold transition-transform transform hover:-translate-y-1 ${className}`}
        aria-label="Theo dõi đơn hàng"
      >
        <span className="w-8 h-8 flex items-center justify-center">
          {/* Professional two-tone SVG with gradient + subtle shadow */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
            <defs>
              <linearGradient id="g-track" x1="0" x2="1">
                <stop offset="0" stopColor="#7B4BFF" />
                <stop offset="1" stopColor="#5AC8FA" />
              </linearGradient>
              <filter id="f-track" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#7b4bff" floodOpacity="0.12"/>
              </filter>
            </defs>
            <g filter="url(#f-track)">
              <rect x="2" y="7" width="12" height="6.5" rx="1.2" fill="url(#g-track)" opacity="0.98"></rect>
              <path d="M14 13h5l1.5 3v1.5" stroke="#0f1724" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" opacity="0.95"/>
              <circle cx="7.5" cy="18.2" r="1.6" fill="#0f1724" />
              <circle cx="18.5" cy="18.2" r="1.6" fill="#0f1724" />
            </g>
          </svg>
        </span>
        <span className="hidden sm:inline">Nhấp vào đây để theo dõi đơn hàng</span>
      </a>
    </Link>
  );
}


