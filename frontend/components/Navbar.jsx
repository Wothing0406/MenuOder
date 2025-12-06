import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '../lib/store';
import { useState } from 'react';
import { MenuIcon, X as XIcon, LogOutIcon, UserIcon } from './Icons';

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
          <Link href="/track-order" className="hover:text-purple-100 transition px-3 py-2 rounded-lg hover:bg-white hover:bg-opacity-20">
            Theo dõi đơn hàng
          </Link>
          {token && user ? (
            <>
              {user?.role === 'admin' && (
                <Link href="/admin" className="hover:text-purple-100 transition px-3 py-2 rounded-lg hover:bg-white hover:bg-opacity-20">
                  Quản trị
                </Link>
              )}
              <Link href="/dashboard" className="hover:text-purple-100 transition px-3 py-2 rounded-lg hover:bg-white hover:bg-opacity-20">
                Bảng điều khiển
              </Link>
              <button
                onClick={() => {
                  logout();
                  localStorage.removeItem('token');
                  window.location.href = '/';
                }}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-5 py-2 rounded-lg transition backdrop-blur-sm border border-white border-opacity-30 flex items-center gap-2"
              >
                <LogOutIcon className="w-4 h-4" />
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
          className="md:hidden w-10 h-10 flex items-center justify-center hover:bg-white hover:bg-opacity-20 rounded-lg transition"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Menu"
        >
          {isMenuOpen ? (
            <XIcon className="w-6 h-6" strokeWidth={2.5} />
          ) : (
            <MenuIcon className="w-6 h-6" strokeWidth={2} />
          )}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-purple-700 p-4 space-y-2 animate-fadeIn">
          <Link 
            href="/track-order" 
            className="block px-4 py-3 rounded-lg hover:bg-white hover:bg-opacity-20 transition font-medium"
            onClick={() => setIsMenuOpen(false)}
          >
            Theo dõi đơn hàng
          </Link>
          {token && user ? (
            <>
              {user?.role === 'admin' && (
                <Link 
                  href="/admin" 
                  className="block px-4 py-3 rounded-lg hover:bg-white hover:bg-opacity-20 transition font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Quản trị
                </Link>
              )}
              <Link 
                href="/dashboard" 
                className="block px-4 py-3 rounded-lg hover:bg-white hover:bg-opacity-20 transition font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Bảng điều khiển
              </Link>
              <button
                onClick={() => {
                  logout();
                  localStorage.removeItem('token');
                  window.location.href = '/';
                }}
                className="w-full text-left bg-red-500 px-4 py-3 rounded-lg hover:bg-red-600 transition font-medium flex items-center gap-2"
              >
                <LogOutIcon className="w-4 h-4" />
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/login" 
                className="block px-4 py-3 rounded-lg hover:bg-white hover:bg-opacity-20 transition font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Đăng nhập
              </Link>
              <Link 
                href="/register" 
                className="block bg-white text-purple-600 px-4 py-3 rounded-lg hover:bg-opacity-90 transition font-semibold text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
