import Head from 'next/head';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/router';
import api from '../lib/api';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import Navbar from '../components/Navbar';

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    storeName: '',
    storePhone: '',
    storeAddress: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.email || !formData.password || !formData.storeName) {
      toast.error('Vui lòng điền đầy đủ thông tin: email, mật khẩu và tên cửa hàng');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/register', {
        email: formData.email,
        password: formData.password,
        storeName: formData.storeName,
        storePhone: formData.storePhone,
        storeAddress: formData.storeAddress,
      });

      if (res.data.success) {
        localStorage.setItem('token', res.data.data.token);
        toast.success('Đăng ký thành công!');
        router.push('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Register - MenuOrder</title>
      </Head>
      <Navbar />

      <div className="container-custom py-16">
        <div className="max-w-md mx-auto card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-full blur-2xl opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-100 rounded-full blur-xl opacity-50"></div>
          <div className="relative z-10">
            <div className="flex flex-col items-center mb-8">
              <div className="relative mb-4">
                <Image 
                  src="/logo.jpg" 
                  alt="MenuOrder Logo" 
                  width={90} 
                  height={90}
                  className="rounded-full object-cover shadow-xl ring-4 ring-purple-100"
                />
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent mb-2">
                Đăng ký cửa hàng
              </h1>
              <p className="text-gray-600 mt-2 text-center">Tạo tài khoản mới cho cửa hàng của bạn</p>
            </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 font-bold text-gray-700">
                Email <span className="text-red-600">*</span>
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
              <label className="block mb-2 font-bold text-gray-700">
                Tên cửa hàng <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="storeName"
                value={formData.storeName}
                onChange={handleChange}
                className="input-field"
                placeholder="Tên cửa hàng của bạn"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-bold text-gray-700">Số điện thoại</label>
              <input
                type="tel"
                name="storePhone"
                value={formData.storePhone}
                onChange={handleChange}
                className="input-field"
                placeholder="+84-xxx-xxx-xxx"
              />
            </div>

            <div>
              <label className="block mb-2 font-bold text-gray-700">Địa chỉ</label>
              <input
                type="text"
                name="storeAddress"
                value={formData.storeAddress}
                onChange={handleChange}
                className="input-field"
                placeholder="Địa chỉ cửa hàng"
              />
            </div>

            <div>
              <label className="block mb-2 font-bold text-gray-700">
                Mật khẩu <span className="text-red-600">*</span>
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

            <div>
              <label className="block mb-2 font-bold text-gray-700">
                Xác nhận mật khẩu <span className="text-red-600">*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input-field"
                placeholder="••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-4 text-lg font-bold mt-6"
            >
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600">
            Đã có tài khoản?{' '}
            <a href="/login" className="text-purple-600 font-bold hover:text-purple-700 hover:underline transition">
              Đăng nhập ngay
            </a>
          </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
