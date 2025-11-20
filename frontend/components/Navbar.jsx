import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '../lib/store';
import { useState } from 'react';

export default function Navbar() {
  const { user, token, logout } = useStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="gradient-teal text-white shadow-xl sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div className="container-custom py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition group">
          <div className="relative">
            <Image 
              src="/logo.jpg" 
              alt="MenuOrder Logo" 
              width={45} 
              height={45}
              className="rounded-full object-cover ring-2 ring-white ring-offset-2 ring-offset-purple-500 group-hover:scale-110 transition-transform"
            />
          </div>
          <span className="text-2xl font-bold tracking-tight">MenuOrder</span>
        </Link>

        <div className="hidden md:flex space-x-6">
          {token && user ? (
            <>
              <Link href="/dashboard" className="hover:text-purple-100 transition px-3 py-2 rounded-lg hover:bg-white hover:bg-opacity-20">
                Bảng điều khiển
              </Link>
              <button
                onClick={() => {
                  logout();
                  localStorage.removeItem('token');
                  window.location.href = '/';
                }}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-5 py-2 rounded-lg transition backdrop-blur-sm border border-white border-opacity-30"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-purple-100 transition px-3 py-2 rounded-lg hover:bg-white hover:bg-opacity-20">
                Đăng nhập
              </Link>
              <Link href="/register" className="bg-white text-purple-600 px-5 py-2 rounded-lg hover:bg-opacity-90 transition font-semibold shadow-lg hover:shadow-xl hover:scale-105">
                Đăng ký
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          ☰
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-blue-700 p-4 space-y-2">
          {token && user ? (
            <>
              <Link href="/dashboard" className="block hover:text-blue-200 transition">
                Bảng điều khiển
              </Link>
              <button
                onClick={() => {
                  logout();
                  localStorage.removeItem('token');
                  window.location.href = '/';
                }}
                className="w-full text-left bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block hover:text-blue-200 transition">
                Đăng nhập
              </Link>
              <Link href="/register" className="block bg-green-500 px-4 py-2 rounded hover:bg-green-600 transition">
                Đăng ký
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
