import Head from 'next/head';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useStore } from '../lib/store';
import api from '../lib/api';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import Navbar from '../components/Navbar';

export default function Login() {
  const router = useRouter();
  const { setToken, setUser, setStore, initDeviceId } = useStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error('Vui lòng nhập email và mật khẩu');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password,
      });

      if (res.data.success) {
        // Initialize device ID
        const deviceId = initDeviceId();
        
        // Save token to both localStorage and zustand store
        const token = res.data.data.token;
        localStorage.setItem('token', token);
        setToken(token);
        setUser(res.data.data.user);
        setStore(res.data.data.store);
        
        // Log device info for session management
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Login successful - Device ID:', deviceId);
        }
        
        toast.success('Đăng nhập thành công!');
        const targetPath = res.data.data.user?.role === 'admin' ? '/admin' : '/dashboard';
        router.push(targetPath);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Đăng nhập - MenuOrder</title>
      </Head>
      <Navbar />

      <div className="container-custom py-16">
        <div className="max-w-md mx-auto card relative overflow-hidden card-glow">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-full blur-2xl opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-100 rounded-full blur-xl opacity-50"></div>
          <div className="relative z-10">
            <div className="flex flex-col items-center mb-8">
              <div className="relative mb-4 transform transition-transform hover:scale-105">
                <Image 
                  src="/logo.jpg" 
                  alt="MenuOrder Logo" 
                  width={90} 
                  height={90}
                  className="rounded-full object-cover shadow-xl ring-4 ring-purple-100"
                />
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent mb-2 tracking-tight">
                Đăng nhập
              </h1>
              <p className="text-gray-600 mt-2 text-center font-medium">Đăng nhập vào tài khoản cửa hàng của bạn</p>
            </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 font-bold text-gray-700 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-bold text-gray-700 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Mật khẩu
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                placeholder="••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-4 text-lg font-bold mt-6 btn-ripple scale-on-hover"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600">
            Chưa có tài khoản?{' '}
            <a href="/register" className="text-purple-600 font-bold hover:text-purple-700 hover:underline transition">
              Đăng ký ngay
            </a>
          </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
