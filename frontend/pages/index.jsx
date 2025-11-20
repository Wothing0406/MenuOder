import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '../components/Layout';
import Navbar from '../components/Navbar';

export default function Home() {
  return (
    <Layout>
      <Head>
        <title>MenuOrder - Hệ thống Menu & Đặt hàng Trực tuyến</title>
      </Head>
      <Navbar />

      {/* Hero Section */}
      <div className="relative gradient-teal text-white py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 grid-pattern opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-purple-600/20"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 right-10 w-32 h-32 bg-white bg-opacity-10 rounded-full blur-2xl float-animation"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-white bg-opacity-10 rounded-full blur-3xl float-animation" style={{animationDelay: '1s'}}></div>
        
        <div className="container-custom text-center relative z-10">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Image 
                src="/logo.jpg" 
                alt="MenuOrder Logo" 
                width={140} 
                height={140}
                className="rounded-full object-cover shadow-2xl ring-4 ring-white ring-offset-4 ring-offset-purple-500 float-animation"
              />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            MenuOrder
          </h1>
          <p className="text-xl md:text-2xl mb-10 opacity-95 max-w-2xl mx-auto leading-relaxed">
            Tạo menu trực tuyến, quản lý đơn hàng và phát triển kinh doanh của bạn
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/register" className="bg-white text-purple-600 px-8 py-4 rounded-xl shadow-2xl hover:shadow-3xl transition-all font-bold text-lg hover:scale-105 transform">
              Bắt đầu miễn phí
            </Link>
            <Link href="/login" className="bg-white bg-opacity-20 backdrop-blur-sm text-white border-2 border-white border-opacity-30 px-8 py-4 rounded-xl shadow-xl hover:bg-opacity-30 transition-all font-bold text-lg hover:scale-105 transform">
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container-custom py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
            Tính năng nổi bật
          </h2>
          <p className="text-gray-600 text-lg">Khám phá những tính năng mạnh mẽ giúp bạn quản lý cửa hàng hiệu quả</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card text-center group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform">🍽️</div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Quản lý Menu Dễ dàng</h3>
              <p className="text-gray-600 leading-relaxed">
                Tạo danh mục, thêm món với giá, mô tả và hình ảnh một cách dễ dàng
              </p>
            </div>
          </div>

          <div className="card text-center group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform">📱</div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Thân thiện với Mobile</h3>
              <p className="text-gray-600 leading-relaxed">
                Thiết kế responsive hoạt động hoàn hảo trên điện thoại, tablet và máy tính
              </p>
            </div>
          </div>

          <div className="card text-center group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform">📊</div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Quản lý Đơn hàng</h3>
              <p className="text-gray-600 leading-relaxed">
                Theo dõi tất cả đơn hàng, cập nhật trạng thái và quản lý kinh doanh từ bảng điều khiển
              </p>
            </div>
          </div>

          <div className="card text-center group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform">🔐</div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Bảo mật</h3>
              <p className="text-gray-600 leading-relaxed">
                Xác thực người dùng với JWT tokens giữ cho dữ liệu của bạn an toàn
              </p>
            </div>
          </div>

          <div className="card text-center group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform">🎯</div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Mã QR</h3>
              <p className="text-gray-600 leading-relaxed">
                Tạo mã QR cho khách hàng quét và truy cập menu của bạn ngay lập tức
              </p>
            </div>
          </div>

          <div className="card text-center group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform">⚙️</div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Tùy chỉnh</h3>
              <p className="text-gray-600 leading-relaxed">
                Thêm tùy chọn tùy chỉnh như kích cỡ, topping và yêu cầu đặc biệt cho từng món
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="relative py-20 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-10"></div>
        <div className="container-custom relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
              Cách hoạt động
            </h2>
            <p className="text-gray-600 text-lg">Chỉ với 4 bước đơn giản để bắt đầu</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="gradient-teal text-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-xl group-hover:scale-110 transition-transform relative">
                1
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
              <h3 className="font-bold mb-3 text-xl text-gray-800">Đăng ký</h3>
              <p className="text-gray-600 leading-relaxed">Tạo tài khoản cửa hàng với email và mật khẩu</p>
            </div>

            <div className="text-center group">
              <div className="gradient-teal text-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-xl group-hover:scale-110 transition-transform relative">
                2
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              </div>
              <h3 className="font-bold mb-3 text-xl text-gray-800">Thêm Menu</h3>
              <p className="text-gray-600 leading-relaxed">Tạo danh mục và thêm món ăn với giá cả</p>
            </div>

            <div className="text-center group">
              <div className="gradient-teal text-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-xl group-hover:scale-110 transition-transform relative">
                3
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
              </div>
              <h3 className="font-bold mb-3 text-xl text-gray-800">Chia sẻ QR Code</h3>
              <p className="text-gray-600 leading-relaxed">Tạo và in mã QR cho khách hàng</p>
            </div>

            <div className="text-center group">
              <div className="gradient-teal text-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-xl group-hover:scale-110 transition-transform relative">
                4
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse" style={{animationDelay: '0.6s'}}></div>
              </div>
              <h3 className="font-bold mb-3 text-xl text-gray-800">Quản lý Đơn hàng</h3>
              <p className="text-gray-600 leading-relaxed">Xem và quản lý tất cả đơn hàng của khách hàng</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative gradient-teal text-white py-12 overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="container-custom relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Image 
                  src="/logo.jpg" 
                  alt="MenuOrder Logo" 
                  width={50} 
                  height={50}
                  className="rounded-full object-cover ring-2 ring-white ring-offset-2 ring-offset-purple-600"
                />
              </div>
              <div>
                <p className="font-bold text-xl">MenuOrder</p>
                <p className="text-sm text-purple-100">Trường THPT Nguyễn Trãi</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="mb-2 font-semibold">© 2025 MenuOrder</p>
              <p className="text-purple-100 text-sm max-w-md">
                Hệ thống quản lý menu và đặt hàng trực tuyến cho nhà hàng và quán cà phê
              </p>
            </div>
          </div>
        </div>
      </footer>
    </Layout>
  );
}
