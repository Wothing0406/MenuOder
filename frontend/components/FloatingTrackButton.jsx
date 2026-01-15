import React from 'react';
import Link from 'next/link';

export default function FloatingTrackButton() {
  return (
    <>
      <Link href="/track-order" legacyBehavior>
        <a
          aria-label="Theo dõi đơn hàng"
          title="Nhấp để theo dõi đơn hàng"
          className="md:hidden floating-track"
        >
          <span className="icon" aria-hidden="true">
            {/* Crisp delivery/truck SVG — vector, high contrast */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
              <defs>
                <linearGradient id="g-truck" x1="0" x2="1">
                  <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95"/>
                  <stop offset="1" stopColor="#F3F8FF" stopOpacity="0.9"/>
                </linearGradient>
                <filter id="s-drop" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#0b1020" floodOpacity="0.14"/>
                </filter>
              </defs>
              <g filter="url(#s-drop)">
                <rect x="1" y="6" width="11.5" height="5.5" rx="1.2" fill="url(#g-truck)"/>
                <path d="M12.6 11h4.9l1.4 2.2v1.8" stroke="#0b1020" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="6.4" cy="18" r="1.6" fill="#0b1020"/>
                <circle cx="18.4" cy="18" r="1.6" fill="#0b1020"/>
                <path d="M3 11h2.5" stroke="#0b1020" strokeWidth="1" strokeLinecap="round"/>
              </g>
            </svg>
          </span>
          <span className="label">Theo dõi đơn hàng</span>
        </a>
      </Link>

      <style jsx>{`
        .floating-track {
          position: fixed;
          right: 16px;
          bottom: 24px;
          z-index: 1400;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 999px;
          background: linear-gradient(90deg, #7B4BFF 0%, #5AC8FA 100%);
          color: #fff;
          font-weight: 700;
          box-shadow: 0 12px 30px rgba(90,200,250,0.14), 0 4px 10px rgba(0,0,0,0.08);
          border: 1px solid rgba(255,255,255,0.08);
          cursor: pointer;
          text-decoration: none;
          transform-origin: center;
          animation: floatX 3.6s ease-in-out infinite alternate;
          transition: transform .18s ease, box-shadow .18s ease;
        }

        .floating-track:focus {
          outline: 3px solid rgba(255,255,255,0.18);
          outline-offset: 4px;
        }

        .floating-track:hover {
          animation-play-state: paused;
          transform: translateY(-6px) scale(1.03);
          box-shadow: 0 18px 40px rgba(90,200,250,0.18), 0 6px 18px rgba(0,0,0,0.12);
        }

        .floating-track .icon {
          width: 36px;
          height: 36px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.06);
          border-radius: 10px;
          padding: 4px;
          flex-shrink: 0;
          position: relative;
          overflow: visible;
        }

        /* shimmer highlight sweeping across icon — paused on hover */
        .floating-track .icon::after {
          content: "";
          position: absolute;
          top: -2px;
          left: -40%;
          width: 80%;
          height: 120%;
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0) 100%);
          transform: skewX(-20deg);
          animation: shimmer 2.2s linear infinite;
          border-radius: 12px;
          pointer-events: none;
        }

        .floating-track:hover .icon::after {
          animation-play-state: paused;
          opacity: 0.0;
        }

        .floating-track .label {
          display: inline-block;
          line-height: 1;
          font-size: 13px;
          white-space: nowrap;
          max-width: 10.5rem;
          text-overflow: ellipsis;
          overflow: hidden;
        }

        @keyframes floatX {
          0%   { transform: translateX(0) translateY(0); }
          25%  { transform: translateX(8px) translateY(-3px); }
          50%  { transform: translateX(0) translateY(0); }
          75%  { transform: translateX(-8px) translateY(-3px); }
          100% { transform: translateX(0) translateY(0); }
        }

        @keyframes shimmer {
          0% { left: -60%; opacity: 0; }
          10% { opacity: 0.8; }
          50% { left: 120%; opacity: 0.6; }
          100% { left: 120%; opacity: 0; }
        }

        /* hide on desktop (maintain md:hidden behavior) */
        @media (min-width: 768px) {
          .floating-track { display: none; }
        }
      `}</style>
    </>
  );
}


