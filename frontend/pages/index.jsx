import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect } from 'react';
import Layout from '../components/Layout';
import Navbar from '../components/Navbar';
import { 
  MenuIcon, 
  CartIcon, 
  QRIcon, 
  SettingsIcon, 
  FoodIcon, 
  CategoryIcon,
  CreditCardIcon,
  StarIcon,
  BarChartIcon,
  MapPinIcon,
  PackageIcon,
  WalletIcon
  ,PhoneIcon, LockIcon, UserIcon
} from '../components/Icons';
import ScrollReveal from '../components/ScrollReveal';

export default function Home() {
  useEffect(() => {
    // Add page transition class
    document.body.classList.add('page-transition');
    return () => {
      document.body.classList.remove('page-transition');
    };
  }, []);

  return (
    <Layout>
      <Head>
        <title>MenuOrder - Hệ thống Menu & Đặt hàng Trực tuyến</title>
      </Head>
      <Navbar />

      {/* Hero Section */}
      <div className="relative gradient-teal text-white py-12 md:py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 grid-pattern opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-purple-600/20"></div>
        
        {/* Abstract Floating Shapes */}
        <div className="abstract-shape-1 top-20 right-10 float-shape"></div>
        <div className="abstract-shape-2 bottom-20 left-10 float-shape" style={{animationDelay: '2s'}}></div>
        <div className="abstract-shape-1 top-1/2 left-1/4 float-shape" style={{animationDelay: '4s'}}></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 right-10 w-32 h-32 bg-white bg-opacity-10 rounded-full blur-2xl float-animation"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-white bg-opacity-10 rounded-full blur-3xl float-animation" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-purple-300 bg-opacity-20 rounded-full blur-xl float-animation" style={{animationDelay: '2s'}}></div>
        
        <div className="container-custom text-center relative z-10 px-4">
          <div className="flex justify-center mb-4 md:mb-6">
            <div className="relative">
              <Image 
                src="/logo.jpg" 
                alt="MenuOrder Logo" 
                width={140} 
                height={140}
                className="rounded-full object-cover shadow-2xl ring-4 ring-white ring-offset-2 md:ring-offset-4 ring-offset-purple-500 float-animation w-24 h-24 md:w-[140px] md:h-[140px]"
              />
              <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-6 h-6 md:w-8 md:h-8 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 md:mb-6 tracking-tight px-2 text-white drop-shadow-lg">
            MenuOrder
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl mb-6 md:mb-10 opacity-95 max-w-2xl mx-auto leading-relaxed px-2 text-white/95 drop-shadow-md">
            Tạo menu trực tuyến, quản lý đơn hàng và phát triển kinh doanh của bạn
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center px-4">
            <Link href="/register" className="bg-white text-purple-600 px-6 md:px-8 py-3 md:py-4 rounded-xl shadow-2xl hover:shadow-3xl transition-all font-bold text-base md:text-lg hover:scale-105 transform w-full sm:w-auto min-h-[48px] flex items-center justify-center btn-ripple scale-on-hover">
              Bắt đầu miễn phí
            </Link>
            <Link href="/login" className="bg-white bg-opacity-20 backdrop-blur-sm text-white border-2 border-white border-opacity-30 px-6 md:px-8 py-3 md:py-4 rounded-xl shadow-xl hover:bg-opacity-30 transition-all font-bold text-base md:text-lg hover:scale-105 transform w-full sm:w-auto min-h-[48px] flex items-center justify-center glass-effect scale-on-hover">
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container-custom py-12 md:py-20">
        <div className="text-center mb-8 md:mb-16 px-4 overflow-visible">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-5 bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent leading-tight" style={{paddingBottom: '0.5rem', display: 'inline-block'}}>
            Tính năng nổi bật
          </h2>
          <p className="text-gray-600 text-base md:text-lg px-2 leading-relaxed mt-2">Khám phá những tính năng mạnh mẽ giúp bạn quản lý cửa hàng hiệu quả</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <ScrollReveal delay={0}>
            <div className="card text-center group relative overflow-hidden card-glow hover-lift">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="flex justify-center mb-4">
                  <div className="icon-wrapper text-purple-600">
                    <FoodIcon className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">Quản lý Menu Dễ dàng</h3>
                <p className="text-gray-600 leading-relaxed">
                  Tạo danh mục, thêm món với giá, mô tả và hình ảnh một cách dễ dàng
                </p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <div className="card text-center group relative overflow-hidden card-glow hover-lift">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="flex justify-center mb-4">
                  <div className="icon-wrapper text-blue-600">
                    <PhoneIcon className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">Thân thiện với Mobile</h3>
                <p className="text-gray-600 leading-relaxed">
                  Thiết kế responsive hoạt động hoàn hảo trên điện thoại, tablet và máy tính
                </p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="card text-center group relative overflow-hidden card-glow hover-lift">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="flex justify-center mb-4">
                  <div className="icon-wrapper text-purple-600">
                    <CartIcon className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">Quản lý Đơn hàng</h3>
                <p className="text-gray-600 leading-relaxed">
                  Theo dõi tất cả đơn hàng, cập nhật trạng thái và quản lý kinh doanh từ bảng điều khiển
                </p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <div className="card text-center group relative overflow-hidden card-glow hover-lift">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="flex justify-center mb-4">
                  <div className="icon-wrapper text-green-600">
                    <LockIcon className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">Bảo mật</h3>
                <p className="text-gray-600 leading-relaxed">
                  Xác thực người dùng với JWT tokens giữ cho dữ liệu của bạn an toàn
                </p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={400}>
            <div className="card text-center group relative overflow-hidden card-glow hover-lift">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="flex justify-center mb-4">
                  <div className="icon-wrapper text-yellow-600">
                    <QRIcon className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">Mã QR</h3>
                <p className="text-gray-600 leading-relaxed">
                  Tạo mã QR cho khách hàng quét và truy cập menu của bạn ngay lập tức
                </p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={500}>
            <div className="card text-center group relative overflow-hidden card-glow hover-lift">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="flex justify-center mb-4">
                  <div className="icon-wrapper text-pink-600">
                    <SettingsIcon className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">Tùy chỉnh</h3>
                <p className="text-gray-600 leading-relaxed">
                  Thêm tùy chọn tùy chỉnh như kích cỡ, topping và yêu cầu đặc biệt cho từng món
                </p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={600}>
            <div className="card text-center group relative overflow-hidden card-glow hover-lift">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="flex justify-center mb-4">
                  <div className="icon-wrapper text-emerald-600">
                    <CreditCardIcon className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">Thanh toán Online</h3>
                <p className="text-gray-600 leading-relaxed">
                  Hỗ trợ thanh toán qua VietQR, ZaloPay QR và nhiều phương thức thanh toán khác
                </p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={700}>
            <div className="card text-center group relative overflow-hidden card-glow hover-lift">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="flex justify-center mb-4">
                  <div className="icon-wrapper text-amber-600">
                    <WalletIcon className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">Voucher & Giảm giá</h3>
                <p className="text-gray-600 leading-relaxed">
                  Tạo và quản lý mã giảm giá, voucher để thu hút khách hàng và tăng doanh số
                </p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={800}>
            <div className="card text-center group relative overflow-hidden card-glow hover-lift">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="flex justify-center mb-4">
                  <div className="icon-wrapper text-orange-600">
                    <StarIcon className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">Đánh giá & Phản hồi</h3>
                <p className="text-gray-600 leading-relaxed">
                  Khách hàng có thể đánh giá món ăn và dịch vụ, giúp bạn cải thiện chất lượng
                </p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={900}>
            <div className="card text-center group relative overflow-hidden card-glow hover-lift">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="flex justify-center mb-4">
                  <div className="icon-wrapper text-indigo-600">
                    <BarChartIcon className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">Thống kê Doanh thu</h3>
                <p className="text-gray-600 leading-relaxed">
                  Theo dõi doanh thu chi tiết theo ngày, tháng, năm và phân tích xu hướng bán hàng
                </p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={1000}>
            <div className="card text-center group relative overflow-hidden card-glow hover-lift">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="flex justify-center mb-4">
                  <div className="icon-wrapper text-teal-600">
                    <MapPinIcon className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">Giao hàng Thông minh</h3>
                <p className="text-gray-600 leading-relaxed">
                  Tự động xác thực địa chỉ và tính phí ship dựa trên khoảng cách thực tế
                </p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={1100}>
            <div className="card text-center group relative overflow-hidden card-glow hover-lift">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="flex justify-center mb-4">
                  <div className="icon-wrapper text-cyan-600">
                    <PackageIcon className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">Theo dõi Đơn hàng</h3>
                <p className="text-gray-600 leading-relaxed">
                  Khách hàng có thể theo dõi trạng thái đơn hàng bằng mã đơn hoặc số điện thoại
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* How It Works */}
      <div className="relative py-12 md:py-20 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-10"></div>
        <div className="container-custom relative z-10">
          <div className="text-center mb-8 md:mb-16 px-4 overflow-visible">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-5 bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent leading-tight" style={{paddingBottom: '0.5rem', display: 'inline-block'}}>
              Cách hoạt động
            </h2>
            <p className="text-gray-600 text-base md:text-lg leading-relaxed mt-2">Chỉ với 4 bước đơn giản để bắt đầu</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 px-4">
            <ScrollReveal delay={0}>
              <div className="text-center group">
                <div className="gradient-teal text-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-transform relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/20"></div>
                  <UserIcon className="w-10 h-10 relative z-10" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
                </div>
                <h3 className="font-bold mb-3 text-xl text-gray-800">Đăng ký</h3>
                <p className="text-gray-600 leading-relaxed">Tạo tài khoản cửa hàng với email và mật khẩu</p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <div className="text-center group">
                <div className="gradient-teal text-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-transform relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/20"></div>
                  <CategoryIcon className="w-10 h-10 relative z-10" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                </div>
                <h3 className="font-bold mb-3 text-xl text-gray-800">Thêm Menu</h3>
                <p className="text-gray-600 leading-relaxed">Tạo danh mục và thêm món ăn với giá cả</p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="text-center group">
                <div className="gradient-teal text-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-transform relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/20"></div>
                  <QRIcon className="w-10 h-10 relative z-10" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
                <h3 className="font-bold mb-3 text-xl text-gray-800">Chia sẻ QR Code</h3>
                <p className="text-gray-600 leading-relaxed">Tạo và in mã QR cho khách hàng</p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div className="text-center group">
                <div className="gradient-teal text-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-transform relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/20"></div>
                  <CartIcon className="w-10 h-10 relative z-10" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse" style={{animationDelay: '0.6s'}}></div>
                </div>
                <h3 className="font-bold mb-3 text-xl text-gray-800">Quản lý Đơn hàng</h3>
                <p className="text-gray-600 leading-relaxed">Xem và quản lý tất cả đơn hàng của khách hàng</p>
              </div>
            </ScrollReveal>
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
              <p className="mb-2 font-semibold">© 2025 Nguyễn Duy Quang</p>
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
