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
    storeGoogleMapLink: '',
  });
  const [extractingAddress, setExtractingAddress] = useState(false);
  const [validatingAddress, setValidatingAddress] = useState(false);
  const [validatedAddress, setValidatedAddress] = useState(null); // { originalAddress, validatedAddress, coordinates }
  const [addressConfirmed, setAddressConfirmed] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Reset validation when user edits address
    if (name === 'storeAddress' && (addressConfirmed || validatedAddress)) {
      setAddressConfirmed(false);
      setValidatedAddress(null);
    }
  };

  // Validate store address when user leaves the input field
  const handleStoreAddressBlur = async () => {
    if (formData.storeAddress.trim()) {
      setValidatingAddress(true);
      setAddressConfirmed(false);
      setValidatedAddress(null);
      
      try {
        // Validate and geocode address
        const validateRes = await api.post('/orders/validate-address', {
          address: formData.storeAddress.trim(),
        });
        
        if (validateRes.data.success) {
          setValidatedAddress(validateRes.data.data);
          // Don't auto-confirm, let user confirm manually
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error validating address:', error);
        }
        // Show error message
        if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error('Không thể xác thực địa chỉ. Vui lòng kiểm tra lại địa chỉ.');
        }
        setValidatedAddress(null);
        setAddressConfirmed(false);
      } finally {
        setValidatingAddress(false);
      }
    }
  };

  // Confirm validated address
  const handleConfirmAddress = () => {
    if (!validatedAddress) return;
    
    setAddressConfirmed(true);
    // Update form data with validated address
    setFormData(prev => ({
      ...prev,
      storeAddress: validatedAddress.validatedAddress
    }));
    toast.success('Địa chỉ đã được xác nhận!');
  };

  // Reject validated address and let user edit
  const handleRejectAddress = () => {
    setValidatedAddress(null);
    setAddressConfirmed(false);
  };

  // Extract address from Google Maps link (optional - just for reference)
  const handleGoogleMapLinkBlur = async () => {
    if (formData.storeGoogleMapLink.trim()) {
      setExtractingAddress(true);
      try {
        const res = await api.post('/utils/extract-address-from-google-maps', {
          googleMapsLink: formData.storeGoogleMapLink.trim()
        });
        
        if (res.data.success && res.data.data.address) {
          // Only auto-fill if address field is empty
          if (!formData.storeAddress || formData.storeAddress.trim() === '') {
            setFormData(prev => ({
              ...prev,
              storeAddress: res.data.data.address
            }));
            toast.success('Đã tự động lấy địa chỉ từ Google Maps! Vui lòng kiểm tra và chỉnh sửa nếu cần.');
          } else {
            toast.info('Đã lấy địa chỉ từ Google Maps. Vui lòng so sánh với địa chỉ bạn đã nhập và chỉnh sửa nếu cần.');
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error extracting address:', error);
        }
        // Don't show error - just inform user to enter manually
        toast.info('Không thể lấy địa chỉ tự động. Vui lòng nhập địa chỉ thủ công ở ô trên.');
      } finally {
        setExtractingAddress(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.email || !formData.password || !formData.storeName) {
      toast.error('Vui lòng điền đầy đủ thông tin: email, mật khẩu và tên cửa hàng');
      return;
    }

    if (!formData.storeAddress || formData.storeAddress.trim() === '') {
      toast.error('Vui lòng nhập địa chỉ cửa hàng');
      return;
    }
    
    if (!addressConfirmed || !validatedAddress) {
      toast.error('Vui lòng xác nhận địa chỉ cửa hàng trước khi đăng ký');
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
        // Use validated address if confirmed, otherwise use original
        storeAddress: addressConfirmed && validatedAddress 
          ? validatedAddress.validatedAddress 
          : formData.storeAddress,
        storeGoogleMapLink: formData.storeGoogleMapLink,
      });

      if (res.data.success) {
        localStorage.setItem('token', res.data.data.token);
        toast.success('Đăng ký thành công!');
        router.push('/dashboard');
      } else {
        toast.error(res.data.message || 'Đăng ký thất bại');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Registration error:', error);
      }
      
      // Extract error message from response
      let errorMessage = 'Đăng ký thất bại';
      
      if (error.response) {
        // Server responded with error
        errorMessage = error.response.data?.message || errorMessage;
        
        // Log additional error details in development
        if (process.env.NODE_ENV === 'development' && error.response?.data?.error) {
          console.error('Error details:', error.response.data.error);
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
      } else {
        // Something else happened
        errorMessage = error.message || errorMessage;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Đăng ký - MenuOrder</title>
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
                  unoptimized
                  priority
                />
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent mb-2 tracking-tight">
                Đăng ký cửa hàng
              </h1>
              <p className="text-gray-600 mt-2 text-center font-medium">Tạo tài khoản mới cho cửa hàng của bạn</p>
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
              <label className="block mb-2 font-bold text-gray-700">
                Địa chỉ cửa hàng <span className="text-red-600">*</span>
              </label>
              <textarea
                name="storeAddress"
                value={formData.storeAddress}
                onChange={handleChange}
                onBlur={handleStoreAddressBlur}
                className={`input-field ${addressConfirmed ? 'border-green-500 bg-green-50' : validatedAddress ? 'border-yellow-500 bg-yellow-50' : ''}`}
                rows="3"
                placeholder="Nhập địa chỉ đầy đủ: Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố"
                required
                disabled={addressConfirmed}
              />
              {validatingAddress && (
                <p className="text-sm text-blue-600 mt-1 flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Đang xác thực địa chỉ...
                </p>
              )}
              
              {/* Address validation confirmation box */}
              {validatedAddress && !addressConfirmed && (
                <div className="mt-3 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📍</span>
                    <div className="flex-1">
                      <p className="font-semibold text-yellow-800 mb-2">
                        Địa chỉ đã được xác thực:
                      </p>
                      <p className="text-sm text-gray-700 mb-1">
                        <span className="font-medium">Bạn nhập:</span> {validatedAddress.originalAddress}
                      </p>
                      <p className="text-sm font-bold text-green-700 mb-2">
                        <span className="font-medium">Hệ thống tìm thấy:</span> {validatedAddress.validatedAddress}
                      </p>
                      
                      {/* Warning messages */}
                      {validatedAddress.warning && (
                        <div className="mb-3 p-3 bg-red-50 border-2 border-red-400 rounded-lg">
                          <p className="text-sm text-red-700 font-semibold whitespace-pre-line">
                            {validatedAddress.warning}
                          </p>
                          {validatedAddress.warning.includes('số nhà') && (
                            <p className="text-xs text-red-600 mt-2">
                              Ví dụ địa chỉ đầy đủ: <strong>58 Nguyễn Công Trứ, Tân An, Hội An, Quảng Nam</strong>
                            </p>
                          )}
                        </div>
                      )}
                      
                      {!validatedAddress.warning && (
                        <div className="mb-3 p-2 bg-green-50 border border-green-300 rounded-lg">
                          <p className="text-xs text-green-700 flex items-center gap-2">
                            <span>✓</span>
                            Địa chỉ có số nhà/số đường và khớp với địa chỉ bạn nhập
                          </p>
                        </div>
                      )}
                      
                      {/* Similarity indicator */}
                      {validatedAddress.similarity !== undefined && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-600">
                            Độ khớp: <span className={`font-semibold ${validatedAddress.similarity >= 0.6 ? 'text-green-600' : validatedAddress.similarity >= 0.4 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {(validatedAddress.similarity * 100).toFixed(0)}%
                            </span>
                          </p>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleConfirmAddress}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                        >
                          ✓ Xác nhận địa chỉ này
                        </button>
                        <button
                          type="button"
                          onClick={handleRejectAddress}
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold"
                        >
                          ✗ Chỉnh sửa lại
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {addressConfirmed && validatedAddress && (
                <div className="mt-3 p-3 bg-green-50 border-2 border-green-500 rounded-lg">
                  <p className="text-sm text-green-700 font-semibold flex items-center gap-2">
                    <span>✓</span>
                    Địa chỉ đã được xác nhận: {validatedAddress.validatedAddress}
                  </p>
                </div>
              )}
              
              <p className="text-xs text-gray-500 mt-1">
                ⚠️ Địa chỉ này là bắt buộc và sẽ được dùng làm điểm xuất phát khi tính phí ship hàng.
                <br />
                Ví dụ: 58 Nguyễn Công Trứ, Tân An, Hội An, Quảng Nam, Việt Nam
              </p>
            </div>

            <div>
              <label className="block mb-2 font-bold text-gray-700">
                Link Google Maps <span className="text-gray-500 text-sm font-normal">(Tùy chọn - để tham khảo)</span>
              </label>
              <input
                type="url"
                name="storeGoogleMapLink"
                value={formData.storeGoogleMapLink}
                onChange={handleChange}
                onBlur={handleGoogleMapLinkBlur}
                className="input-field"
                placeholder="https://maps.google.com/?q=địa+chỉ (không bắt buộc)"
                disabled={extractingAddress}
              />
              {extractingAddress && (
                <p className="text-sm text-purple-600 mt-1">Đang lấy địa chỉ từ Google Maps...</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                💡 Có thể dán link Google Maps để tham khảo, nhưng vui lòng kiểm tra và chỉnh sửa địa chỉ ở ô trên cho chính xác.
              </p>
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
              disabled={loading || validatingAddress || !addressConfirmed}
              className="btn btn-primary w-full py-4 text-lg font-bold mt-6 disabled:opacity-50 disabled:cursor-not-allowed btn-ripple scale-on-hover"
            >
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
            {!addressConfirmed && formData.storeAddress.trim() && (
              <p className="text-sm text-red-600 mt-2 text-center">
                ⚠️ Vui lòng xác nhận địa chỉ cửa hàng trước khi đăng ký
              </p>
            )}
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
