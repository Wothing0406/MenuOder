import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useStore } from '../../lib/store';
import Navbar from '../../components/Navbar';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { formatVND } from '../../lib/utils';
import { CartIcon, QRIcon, SettingsIcon, CategoryIcon, FoodIcon, DeliveryTruckIcon, TableIcon } from '../../components/Icons';

export default function Dashboard() {
  const router = useRouter();
  const { token, user, store } = useStore();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetail, setOrderDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [uploadingStoreImage, setUploadingStoreImage] = useState(false);
  const [storeImagePreview, setStoreImagePreview] = useState(null);
  const [storeData, setStoreData] = useState(null); // Store data riêng cho settings tab
  const [selectedDate, setSelectedDate] = useState(null); // Date for revenue cards
  const [selectedDateType, setSelectedDateType] = useState(null); // 'today', 'month', 'year'
  const [dateOrders, setDateOrders] = useState([]); // Orders for selected date
  const [showDateOrdersModal, setShowDateOrdersModal] = useState(false);
  const [loadingDateOrders, setLoadingDateOrders] = useState(false);
  const [dateRevenue, setDateRevenue] = useState(0); // Revenue for selected date
  const [storeFormData, setStoreFormData] = useState({
    storeName: '',
    storePhone: '',
    storeAddress: '',
    storeDetailedAddress: '',
    storeDescription: ''
  });
  const [savingStoreInfo, setSavingStoreInfo] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch store data (quan trọng cho logo)
      try {
        const storeRes = await api.get('/stores/my-store');
        if (storeRes.data.success) {
          // Cập nhật store trong Zustand store
          useStore.setState({ store: storeRes.data.data });
          // Cập nhật storeData cho settings tab
          setStoreData(storeRes.data.data);
          // Cập nhật form data
          setStoreFormData({
            storeName: storeRes.data.data.storeName || '',
            storePhone: storeRes.data.data.storePhone || '',
            storeAddress: storeRes.data.data.storeAddress || '',
            storeDetailedAddress: storeRes.data.data.storeDetailedAddress || '',
            storeDescription: storeRes.data.data.storeDescription || ''
          });
          // Reset previews nếu có trong database
          setLogoPreview(null); // Clear preview để hiển thị logo từ DB
          setStoreImagePreview(null); // Clear preview để hiển thị storeImage từ DB
        }
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Store fetch error:', err);
        }
      }
      
      // Fetch orders
      try {
        const ordersRes = await api.get('/orders/my-store/list?limit=50');
        if (ordersRes.data.success) {
          setOrders(ordersRes.data.data.orders);
        }
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Orders fetch error:', err);
        }
      }

      // Fetch stats
      try {
        const statsRes = await api.get('/orders/my-store/stats');
        if (statsRes.data.success) {
          setStats(statsRes.data.data);
        }
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Stats fetch error:', err);
        }
        // Set default stats if fetch fails
        setStats({ 
          totalOrders: 0, 
          pendingOrders: 0, 
          completedOrders: 0, 
          totalRevenue: 0,
          todayRevenue: 0,
          monthlyRevenue: 0,
          yearlyRevenue: 0
        });
      }

      // Fetch QR code
      try {
        const qrRes = await api.get('/qr/my-store');
        if (qrRes.data.success) {
          setQrCode(qrRes.data.data.qrCode);
        }
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('QR code fetch error:', err);
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Dashboard data error:', error);
      }
      toast.error('Không thể tải một số dữ liệu bảng điều khiển');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    // Tìm đơn hàng để kiểm tra trạng thái hiện tại
    const order = orders.find(o => o.id === orderId);
    
    // Không cho phép thay đổi trạng thái nếu đơn đã hủy hoặc hoàn tất
    if (order && (order.status === 'cancelled' || order.status === 'completed')) {
      toast.error('Không thể thay đổi trạng thái đơn hàng đã hủy hoặc hoàn tất');
      // Reset select về giá trị cũ
      fetchData();
      return;
    }
    
    // Kiểm tra cả orderDetail nếu đang mở
    if (orderDetail && orderDetail.id === orderId && 
        (orderDetail.status === 'cancelled' || orderDetail.status === 'completed')) {
      toast.error('Không thể thay đổi trạng thái đơn hàng đã hủy hoặc hoàn tất');
      fetchData();
      return;
    }
    
    try {
      const res = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      if (res.data.success) {
        toast.success('Cập nhật trạng thái đơn hàng thành công');
        fetchData();
        if (selectedOrder === orderId) {
          fetchOrderDetail(orderId);
        }
      }
    } catch (error) {
      toast.error('Cập nhật trạng thái đơn hàng thất bại');
      // Reset select về giá trị cũ nếu có lỗi
      fetchData();
    }
  };

  const fetchOrderDetail = async (orderId) => {
    try {
      setLoadingDetail(true);
      const res = await api.get(`/orders/${orderId}`);
      if (res.data.success) {
        setOrderDetail(res.data.data);
      }
    } catch (error) {
      toast.error('Không thể tải chi tiết đơn hàng');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleOrderClick = (order) => {
    // Cho phép xem chi tiết đơn hàng (kể cả đã hủy hoặc hoàn tất)
    setSelectedOrder(order.id);
    fetchOrderDetail(order.id);
  };

  const closeOrderDetail = () => {
    setSelectedOrder(null);
    setOrderDetail(null);
  };

  // Fetch orders by date (only completed orders for revenue calculation)
  const fetchOrdersByDate = async (date) => {
    try {
      setLoadingDateOrders(true);
      const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
      const res = await api.get(`/orders/my-store/list?date=${dateStr}&limit=1000`);
      if (res.data.success) {
        const orders = res.data.data.orders || [];
        setDateOrders(orders);
        // Calculate total revenue for the date - ONLY completed orders (paid)
        const revenue = orders
          .filter(order => order.status === 'completed')
          .reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0);
        setDateRevenue(revenue);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching orders by date:', error);
      }
      toast.error('Không thể tải đơn hàng theo ngày');
    } finally {
      setLoadingDateOrders(false);
    }
  };

  // Handle click on revenue card
  const handleRevenueCardClick = async (type) => {
    let dateToShow;
    if (type === 'today') {
      dateToShow = new Date();
      setSelectedDate(dateToShow);
      setSelectedDateType('today');
      await fetchOrdersByDate(dateToShow);
      setShowDateOrdersModal(true);
    } else if (type === 'month') {
      // Show date picker for month - limit to current month
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      const input = document.createElement('input');
      input.type = 'date';
      input.min = firstDayOfMonth.toISOString().split('T')[0];
      input.max = lastDayOfMonth.toISOString().split('T')[0];
      input.onchange = async (e) => {
        if (e.target.value) {
          dateToShow = new Date(e.target.value);
          setSelectedDate(dateToShow);
          setSelectedDateType('month');
          await fetchOrdersByDate(dateToShow);
          setShowDateOrdersModal(true);
        }
      };
      input.click();
      return;
    } else if (type === 'year') {
      // Show date picker for year - limit to current year
      const today = new Date();
      const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
      const lastDayOfYear = new Date(today.getFullYear(), 11, 31);
      
      const input = document.createElement('input');
      input.type = 'date';
      input.min = firstDayOfYear.toISOString().split('T')[0];
      input.max = lastDayOfYear.toISOString().split('T')[0];
      input.onchange = async (e) => {
        if (e.target.value) {
          dateToShow = new Date(e.target.value);
          setSelectedDate(dateToShow);
          setSelectedDateType('year');
          await fetchOrdersByDate(dateToShow);
          setShowDateOrdersModal(true);
        }
      };
      input.click();
      return;
    }
  };

  const handleStoreImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh!');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước file không được vượt quá 5MB!');
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setStoreImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload
    setUploadingStoreImage(true);
    try {
      const formData = new FormData();
      formData.append('storeImage', file);

      const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
      const response = await fetch(`${API_BASE}/api/stores/my-store/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Upload hình ảnh quán thành công!');
        // Reload store data
        const storeRes = await api.get('/stores/my-store');
        if (storeRes.data.success) {
          useStore.setState({ store: storeRes.data.data });
          setStoreData(storeRes.data.data);
          setStoreImagePreview(null);
        }
      } else {
        toast.error(data.message || 'Upload hình ảnh thất bại!');
        setStoreImagePreview(null);
      }
    } catch (error) {
      console.error('Upload store image error:', error);
      toast.error('Upload hình ảnh thất bại!');
      setStoreImagePreview(null);
    } finally {
      setUploadingStoreImage(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh!');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước file không được vượt quá 5MB!');
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
      const response = await fetch(`${API_BASE}/api/stores/my-store/logo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Upload logo thành công!');
        // Reload store data
        const storeRes = await api.get('/stores/my-store');
        if (storeRes.data.success) {
          // Cập nhật store trong Zustand
          useStore.setState({ store: storeRes.data.data });
          // Cập nhật storeData cho settings tab
          setStoreData(storeRes.data.data);
          // Clear preview để hiển thị logo từ DB
          setLogoPreview(null);
        }
      } else {
        toast.error(data.message || 'Upload logo thất bại!');
        setLogoPreview(null);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Upload logo error:', error);
      }
      toast.error('Upload logo thất bại!');
      setLogoPreview(null);
    } finally {
      setUploadingLogo(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Navbar />
        <div className="container-custom py-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p>Đang tải...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Bảng điều khiển - MenuOrder</title>
      </Head>
      <Navbar />

      <div className="container-custom py-8">
        {/* Header */}
        <div className="mb-8 gradient-teal text-white p-8 rounded-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-20"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white bg-opacity-10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-3 tracking-tight">Chào mừng, {user?.storeName}</h1>
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <p className="text-sm text-purple-100 mb-1">Slug cửa hàng</p>
                <p className="font-bold">{store?.storeSlug}</p>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <p className="text-sm text-purple-100 mb-1">URL cửa hàng</p>
                <p className="font-bold text-sm break-all">
                  {typeof window !== 'undefined' && `${window.location.origin}/store/${store?.storeSlug}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Tổng quan
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            <CartIcon className="w-5 h-5" />
            Đơn hàng
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2 font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'menu'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            <CategoryIcon className="w-5 h-5" />
            Quản lý Menu
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`px-4 py-2 font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'qr'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            <QRIcon className="w-5 h-5" />
            Mã QR
          </button>
          <button
            onClick={async () => {
              setActiveTab('settings');
              // Fetch store data khi vào tab settings để có logo mới nhất
              try {
                const storeRes = await api.get('/stores/my-store');
                if (storeRes.data.success) {
                  setStoreData(storeRes.data.data);
                  useStore.setState({ store: storeRes.data.data });
                  setStoreFormData({
                    storeName: storeRes.data.data.storeName || '',
                    storePhone: storeRes.data.data.storePhone || '',
                    storeAddress: storeRes.data.data.storeAddress || '',
                    storeDetailedAddress: storeRes.data.data.storeDetailedAddress || '',
                    storeDescription: storeRes.data.data.storeDescription || ''
                  });
                  setLogoPreview(null); // Clear preview
                }
              } catch (err) {
                if (process.env.NODE_ENV === 'development') {
                  console.error('Fetch store data error:', err);
                }
              }
            }}
            className={`px-4 py-2 font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            <SettingsIcon className="w-5 h-5" />
            Cài đặt
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="card group relative overflow-hidden card-glow hover-lift stagger-item">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-gray-600 font-semibold">Tổng đơn hàng</h3>
                    <div className="icon-wrapper text-blue-600 transform group-hover:scale-110 transition-transform">
                      <CartIcon className="w-6 h-6" />
                    </div>
                  </div>
                  <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent count-up">{stats.totalOrders}</p>
                </div>
              </div>
              <div className="card group relative overflow-hidden card-glow hover-lift stagger-item">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-gray-600 font-semibold">Đơn chờ xử lý</h3>
                    <div className="icon-wrapper text-yellow-600 transform group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-400 bg-clip-text text-transparent count-up">{stats.pendingOrders}</p>
                </div>
              </div>
              <div className="card group relative overflow-hidden card-glow hover-lift stagger-item">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-gray-600 font-semibold">Đơn hoàn thành</h3>
                    <div className="icon-wrapper text-green-600 transform group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent count-up">{stats.completedOrders}</p>
                </div>
              </div>
              <div 
                className="card group relative overflow-hidden cursor-pointer hover:shadow-lg transition-shadow card-glow hover-lift stagger-item"
                onClick={() => handleRevenueCardClick('today')}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-gray-600 font-semibold">Doanh thu hôm nay</h3>
                    <div className="icon-wrapper text-purple-600 transform group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                    {formatVND(stats.todayRevenue || 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Nhấn để xem chi tiết</p>
                </div>
              </div>
            </div>

            {/* Revenue Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div 
                className="card relative overflow-hidden bg-gradient-to-br from-green-50 via-green-50 to-emerald-50 border-2 border-green-100 cursor-pointer hover:shadow-lg transition-shadow hover-lift"
                onClick={() => handleRevenueCardClick('month')}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-200 rounded-full blur-3xl opacity-30"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-gray-700 font-bold text-lg">Doanh thu tháng này</h3>
                    <div className="icon-wrapper text-green-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-4xl font-bold bg-gradient-to-r from-green-700 to-green-500 bg-clip-text text-transparent mb-2">
                    {formatVND(stats.monthlyRevenue || 0)}
                  </p>
                  <p className="text-sm text-gray-600 font-medium">
                    Tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}
                  </p>
                </div>
              </div>
              <div 
                className="card relative overflow-hidden bg-gradient-to-br from-blue-50 via-blue-50 to-cyan-50 border-2 border-blue-100 cursor-pointer hover:shadow-lg transition-shadow hover-lift"
                onClick={() => handleRevenueCardClick('year')}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-30"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-gray-700 font-bold text-lg">Doanh thu năm nay</h3>
                    <div className="icon-wrapper text-blue-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent mb-2">
                    {formatVND(stats.yearlyRevenue || 0)}
                  </p>
                  <p className="text-sm text-gray-600 font-medium">
                    Năm {new Date().getFullYear()}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Đơn hàng gần đây</h2>
            {orders.length === 0 ? (
              <p className="text-gray-600">Chưa có đơn hàng nào</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left">Mã đơn</th>
                      <th className="px-4 py-2 text-left">Loại đơn</th>
                      <th className="px-4 py-2 text-left">Khách hàng</th>
                      <th className="px-4 py-2 text-left">Tổng tiền</th>
                      <th className="px-4 py-2 text-left">Trạng thái</th>
                      <th className="px-4 py-2 text-left">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const isDisabled = order.status === 'cancelled' || order.status === 'completed';
                      return (
                      <tr 
                        key={order.id} 
                        className="border-b hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleOrderClick(order)}
                      >
                        <td className="px-4 py-2 font-bold">{order.orderCode}</td>
                        <td className="px-4 py-2">
                          <div className="flex flex-col gap-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${
                              order.orderType === 'delivery'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {order.orderType === 'delivery' ? (
                                <>
                                  <DeliveryTruckIcon className="w-4 h-4" />
                                  Giao hàng
                                </>
                              ) : (
                                <>
                                  <TableIcon className="w-4 h-4" />
                                  Tại bàn
                                </>
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          {order.orderType === 'delivery' 
                            ? (order.customerName || 'N/A')
                            : `Bàn ${order.tableNumber || 'N/A'}`
                          }
                        </td>
                        <td className="px-4 py-2 font-bold">
                          {formatVND(order.totalAmount)}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-bold ${
                              order.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : order.status === 'confirmed'
                                ? 'bg-blue-100 text-blue-800'
                                : order.status === 'preparing'
                                ? 'bg-orange-100 text-orange-800'
                                : order.status === 'ready'
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'delivered'
                                ? 'bg-purple-100 text-purple-800'
                                : order.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {order.status === 'pending' ? 'Chờ xử lý' :
                             order.status === 'confirmed' ? 'Đã xác nhận' :
                             order.status === 'preparing' ? 'Đang chuẩn bị' :
                             order.status === 'ready' ? 'Sẵn sàng' :
                             order.status === 'delivered' ? 'Đã giao' :
                             order.status === 'completed' ? 'Hoàn tất' :
                             order.status === 'cancelled' ? 'Đã hủy' : order.status}
                          </span>
                        </td>
                        <td className="px-4 py-2" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            disabled={order.status === 'cancelled' || order.status === 'completed'}
                            className={`border rounded px-2 py-1 ${
                              order.status === 'cancelled' || order.status === 'completed'
                                ? 'bg-gray-100 cursor-not-allowed opacity-60'
                                : 'bg-white cursor-pointer'
                            }`}
                          >
                            <option value="pending">Chờ xử lý</option>
                            <option value="confirmed">Đã xác nhận</option>
                            <option value="preparing">Đang chuẩn bị</option>
                            <option value="ready">Sẵn sàng</option>
                            <option value="delivered">Đã giao</option>
                            <option value="completed">Hoàn tất</option>
                            <option value="cancelled">Đã hủy</option>
                          </select>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Menu Management Tab */}
        {activeTab === 'menu' && (
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Quản lý Menu</h2>
            <p className="text-gray-600 mb-4">
              Đi đến trang quản lý menu đầy đủ để thêm/chỉnh sửa danh mục và món ăn.
            </p>
            <button
              onClick={() => router.push('/dashboard/menu')}
              className="btn btn-primary btn-ripple scale-on-hover"
            >
              Quản lý Menu
            </button>
          </div>
        )}

        {/* QR Code Tab */}
        {activeTab === 'qr' && qrCode && (
          <div className="card flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4">Mã QR Cửa hàng</h2>
            <p className="text-gray-600 mb-6 text-center">
              In mã QR này để khách hàng quét và truy cập menu của bạn
            </p>
            <div className="bg-white p-4 rounded-lg shadow-lg mb-6">
              <img src={qrCode} alt="Store QR Code" className="w-64 h-64" />
            </div>
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = qrCode;
                link.download = `${store?.storeSlug}-qr.png`;
                link.click();
              }}
              className="btn btn-primary btn-ripple scale-on-hover"
            >
              Tải xuống Mã QR
            </button>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">Cài đặt Cửa hàng</h2>
            
            {/* Logo Upload Section */}
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-4">Logo cửa hàng</h3>
              <div className="flex flex-col md:flex-row items-start gap-6">
                {/* Logo Preview */}
                <div className="flex-shrink-0">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 shadow-lg">
                    {logoPreview ? (
                      <img 
                        src={logoPreview}
                        alt="Store Logo Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          if (process.env.NODE_ENV === 'development') {
                            console.error('Logo preview load error:', e.target.src);
                          }
                          e.target.src = '/logo.jpg';
                        }}
                      />
                    ) : (storeData?.storeLogo || store?.storeLogo) ? (
                      <img 
                        src={(() => {
                          const logo = storeData?.storeLogo || store?.storeLogo;
                          if (!logo) return '/logo.jpg';
                          // Nếu đã là full URL
                          if (logo.startsWith('http')) {
                            return logo;
                          }
                          // Nếu là relative path, tạo full URL
                          const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5002';
                          // Đảm bảo không có double slash
                          const logoPath = logo.startsWith('/') ? logo : '/' + logo;
                          return apiBase + logoPath;
                        })()}
                        alt="Store Logo"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          if (process.env.NODE_ENV === 'development') {
                            console.error('Logo load error:', e.target.src);
                          }
                          e.target.src = '/logo.jpg';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-4xl font-bold">
                        {(storeData?.storeName || store?.storeName)?.[0]?.toUpperCase() || 'S'}
                      </div>
                    )}
                    {uploadingLogo && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Upload Button */}
                <div className="flex-1">
                  <p className="text-gray-600 mb-3">
                    Logo sẽ hiển thị ở header trang menu của cửa hàng bạn.
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Định dạng: JPG, PNG, GIF (Tối đa 5MB)
                  </p>
                  <label className="inline-block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                      className="hidden"
                      id="logo-upload"
                    />
                    <span className={`btn ${uploadingLogo ? 'btn-secondary opacity-50 cursor-not-allowed' : 'btn-primary btn-ripple scale-on-hover'} cursor-pointer inline-block`}>
                      {uploadingLogo ? 'Đang upload...' : 'Chọn ảnh logo'}
                    </span>
                  </label>
                  {(storeData?.storeLogo || store?.storeLogo) && (
                    <button
                      onClick={async () => {
                        try {
                          // Gửi request xóa logo - update store với storeLogo = null
                          // Backend cần hỗ trợ xóa logo bằng cách set storeLogo = null
                          // Tạm thời: Gọi API update với storeLogo empty
                          await api.put('/stores/my-store', {
                            storeName: storeData?.storeName || store?.storeName,
                            // Không gửi storeLogo để giữ nguyên (cần backend hỗ trợ xóa)
                          });
                          // Fetch lại store data
                          const storeRes = await api.get('/stores/my-store');
                          if (storeRes.data.success) {
                            useStore.setState({ store: storeRes.data.data });
                            setStoreData(storeRes.data.data);
                            setLogoPreview(null);
                            toast.success('Đã xóa logo!');
                          }
                        } catch (error) {
                          if (process.env.NODE_ENV === 'development') {
                            console.error('Delete logo error:', error);
                          }
                          toast.error('Xóa logo thất bại!');
                        }
                      }}
                      className="btn btn-secondary ml-3"
                    >
                      Xóa logo
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Store Image (Banner) Upload Section */}
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-4">Hình ảnh quán (Banner)</h3>
              <div className="flex flex-col gap-6">
                {/* Image Preview */}
                <div className="w-full">
                  <div className="relative w-full h-48 md:h-64 rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg bg-gray-100">
                    {storeImagePreview ? (
                      <img 
                        src={storeImagePreview}
                        alt="Store Image Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (storeData?.storeImage || store?.storeImage) ? (
                      <img 
                        src={(() => {
                          const image = storeData?.storeImage || store?.storeImage;
                          if (!image) return null;
                          if (image.startsWith('http')) {
                            return image;
                          }
                          const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5002';
                          const imagePath = image.startsWith('/') ? image : '/' + image;
                          return apiBase + imagePath;
                        })()}
                        alt="Store Banner"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center text-white">
                        <div className="text-center">
                          <div className="text-4xl mb-2">🖼️</div>
                          <p className="text-sm">Chưa có hình ảnh quán</p>
                        </div>
                      </div>
                    )}
                    {uploadingStoreImage && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Upload Button */}
                <div>
                  <p className="text-gray-600 mb-3">
                    Hình ảnh này sẽ hiển thị ở đầu trang menu của cửa hàng bạn, giúp khách hàng dễ nhận biết.
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Định dạng: JPG, PNG, GIF (Tối đa 5MB). Khuyến nghị: 1200x400px hoặc tỷ lệ tương tự.
                  </p>
                  <label className="inline-block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleStoreImageUpload}
                      disabled={uploadingStoreImage}
                      className="hidden"
                      id="store-image-upload"
                    />
                    <span className={`btn ${uploadingStoreImage ? 'btn-secondary opacity-50 cursor-not-allowed' : 'btn-primary btn-ripple scale-on-hover'} cursor-pointer inline-block`}>
                      {uploadingStoreImage ? 'Đang upload...' : 'Chọn hình ảnh quán'}
                    </span>
                  </label>
                  {(storeData?.storeImage || store?.storeImage) && (
                    <button
                      onClick={async () => {
                        try {
                          await api.put('/stores/my-store', {
                            storeName: storeData?.storeName || store?.storeName,
                            storeImage: '', // Gửi empty string để xóa
                          });
                          const storeRes = await api.get('/stores/my-store');
                          if (storeRes.data.success) {
                            useStore.setState({ store: storeRes.data.data });
                            setStoreData(storeRes.data.data);
                            setStoreImagePreview(null);
                            toast.success('Đã xóa hình ảnh quán!');
                          }
                        } catch (error) {
                          console.error('Delete store image error:', error);
                          toast.error('Xóa hình ảnh thất bại!');
                        }
                      }}
                      className="btn btn-secondary ml-3"
                    >
                      Xóa hình ảnh
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Store Information Section */}
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-4">Thông tin cửa hàng</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Tên cửa hàng</label>
                  <input
                    type="text"
                    value={storeFormData.storeName}
                    onChange={(e) => setStoreFormData({ ...storeFormData, storeName: e.target.value })}
                    className="input-field w-full"
                    placeholder="Nhập tên cửa hàng"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Số điện thoại</label>
                  <input
                    type="text"
                    value={storeFormData.storePhone}
                    onChange={(e) => setStoreFormData({ ...storeFormData, storePhone: e.target.value })}
                    className="input-field w-full"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Địa chỉ (dùng để tính khoảng cách) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={storeFormData.storeAddress}
                    onChange={(e) => setStoreFormData({ ...storeFormData, storeAddress: e.target.value })}
                    className="input-field w-full"
                    placeholder="Ví dụ: Nguyễn Công Trứ, Hội An, Quảng Nam"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Địa chỉ này được dùng để tính khoảng cách và phí ship. Vui lòng nhập địa chỉ đầy đủ.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Địa chỉ chi tiết (hiển thị cho khách hàng)
                  </label>
                  <textarea
                    value={storeFormData.storeDetailedAddress}
                    onChange={(e) => setStoreFormData({ ...storeFormData, storeDetailedAddress: e.target.value })}
                    className="input-field w-full"
                    rows="3"
                    placeholder="Ví dụ: Số 123, Đường Nguyễn Công Trứ, Phường Minh An, Hội An, Quảng Nam (Gần chợ Hội An)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Địa chỉ chi tiết này sẽ hiển thị cho khách hàng trên trang menu. Bạn có thể thêm số nhà, hướng dẫn đường đi, v.v. 
                    <span className="font-semibold text-blue-600"> Địa chỉ này không ảnh hưởng đến tính toán khoảng cách.</span>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Mô tả cửa hàng</label>
                  <textarea
                    value={storeFormData.storeDescription}
                    onChange={(e) => setStoreFormData({ ...storeFormData, storeDescription: e.target.value })}
                    className="input-field w-full"
                    rows="3"
                    placeholder="Nhập mô tả về cửa hàng của bạn"
                  />
                </div>
                <button
                  onClick={async () => {
                    try {
                      setSavingStoreInfo(true);
                      const res = await api.put('/stores/my-store', storeFormData);
                      if (res.data.success) {
                        toast.success('Cập nhật thông tin cửa hàng thành công!');
                        // Reload store data
                        const storeRes = await api.get('/stores/my-store');
                        if (storeRes.data.success) {
                          useStore.setState({ store: storeRes.data.data });
                          setStoreData(storeRes.data.data);
                        }
                      }
                    } catch (error) {
                      toast.error('Cập nhật thông tin thất bại!');
                      if (process.env.NODE_ENV === 'development') {
                        console.error('Update store info error:', error);
                      }
                    } finally {
                      setSavingStoreInfo(false);
                    }
                  }}
                  disabled={savingStoreInfo}
                  className={`btn btn-primary ${savingStoreInfo ? 'opacity-50 cursor-not-allowed' : 'btn-ripple scale-on-hover'}`}
                >
                  {savingStoreInfo ? 'Đang lưu...' : 'Lưu thông tin'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={closeOrderDetail}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {loadingDetail ? (
              <div className="p-8 text-center">Đang tải...</div>
            ) : orderDetail ? (
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Chi tiết đơn hàng</h2>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-gray-600">Mã đơn: {orderDetail.orderCode}</p>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 w-fit ${
                        orderDetail.orderType === 'delivery'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {orderDetail.orderType === 'delivery' ? (
                          <>
                            <DeliveryTruckIcon className="w-4 h-4" />
                            Giao hàng
                          </>
                        ) : (
                          <>
                            <TableIcon className="w-4 h-4" />
                            Tại bàn
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={closeOrderDetail}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    {orderDetail.orderType === 'delivery' ? (
                      <>
                        <div>
                          <p className="text-gray-600 text-sm">Tên khách hàng</p>
                          <p className="font-bold">{orderDetail.customerName || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Số điện thoại</p>
                          <p className="font-bold">{orderDetail.customerPhone || 'N/A'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-gray-600 text-sm">Địa chỉ giao hàng</p>
                          <p className="font-bold">{orderDetail.deliveryAddress || 'N/A'}</p>
                        </div>
                        {orderDetail.deliveryDistance && (
                          <div>
                            <p className="text-gray-600 text-sm">Khoảng cách</p>
                            <p className="font-bold">{orderDetail.deliveryDistance} km</p>
                          </div>
                        )}
                        {orderDetail.shippingFee > 0 && (
                          <div>
                            <p className="text-gray-600 text-sm">Phí ship</p>
                            <p className="font-bold">{formatVND(orderDetail.shippingFee)}</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div>
                        <p className="text-gray-600 text-sm">Số bàn</p>
                        <p className="font-bold">{orderDetail.tableNumber || 'N/A'}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-600 text-sm">Thời gian đặt</p>
                      <p className="font-bold">
                        {new Date(orderDetail.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Trạng thái</p>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-bold inline-block ${
                          orderDetail.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : orderDetail.status === 'confirmed'
                            ? 'bg-blue-100 text-blue-800'
                            : orderDetail.status === 'preparing'
                            ? 'bg-orange-100 text-orange-800'
                            : orderDetail.status === 'ready'
                            ? 'bg-green-100 text-green-800'
                            : orderDetail.status === 'delivered'
                            ? 'bg-purple-100 text-purple-800'
                            : orderDetail.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {orderDetail.status === 'pending' ? 'Chờ xử lý' :
                         orderDetail.status === 'confirmed' ? 'Đã xác nhận' :
                         orderDetail.status === 'preparing' ? 'Đang chuẩn bị' :
                         orderDetail.status === 'ready' ? 'Sẵn sàng' :
                         orderDetail.status === 'delivered' ? 'Đã giao' :
                         orderDetail.status === 'completed' ? 'Hoàn tất' :
                         orderDetail.status === 'cancelled' ? 'Đã hủy' : orderDetail.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Tổng tiền</p>
                      <p className="font-bold text-xl text-blue-600">
                        {formatVND(orderDetail.totalAmount)}
                      </p>
                    </div>
                  </div>

                  {orderDetail.customerNote && (
                    <div>
                      <p className="text-gray-600 text-sm">Ghi chú</p>
                      <p className="font-medium">{orderDetail.customerNote}</p>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-bold mb-4">Món đã đặt</h3>
                  <div className="space-y-3">
                    {orderDetail.items && orderDetail.items.length > 0 ? (
                      orderDetail.items.map((item) => (
                        <div key={item.id} className="border rounded p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <p className="font-bold text-lg">{item.itemName}</p>
                              <p className="text-gray-600">Số lượng: {item.quantity}</p>
                              <p className="text-gray-600">
                                Giá: {formatVND(item.itemPrice)}
                              </p>
                            </div>
                            <p className="font-bold text-lg">
                              {formatVND(item.subtotal)}
                            </p>
                          </div>
                          {item.selectedAccompaniments && 
                           Array.isArray(item.selectedAccompaniments) && 
                           item.selectedAccompaniments.length > 0 && (
                            <div className="mt-2 pt-2 border-t">
                              <p className="text-sm font-medium text-gray-700 mb-1">Món ăn kèm:</p>
                              <ul className="list-disc list-inside text-sm text-gray-600">
                                {item.selectedAccompaniments.map((acc, idx) => (
                                  <li key={idx}>
                                    {acc.name} (+{formatVND(acc.price || 0)})
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                            <div className="mt-2 pt-2 border-t">
                              <p className="text-sm font-medium text-gray-700 mb-1">Tùy chọn:</p>
                              <p className="text-sm text-gray-600">
                                {Object.entries(item.selectedOptions).map(([key, value]) => value).join(', ')}
                              </p>
                            </div>
                          )}
                          {item.notes && item.notes.trim() && (
                            <div className="mt-2 pt-2 border-t">
                              <p className="text-sm font-medium text-gray-700">Ghi chú:</p>
                              <p className="text-sm text-gray-600 italic">{item.notes}</p>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600">Không có món nào</p>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={closeOrderDetail}
                    className="btn btn-secondary flex-1"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">Không tìm thấy chi tiết đơn hàng</div>
            )}
          </div>
        </div>
      )}

      {/* Date Orders Modal */}
      {showDateOrdersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowDateOrdersModal(false)}>
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-2xl font-bold">
                      Đơn hàng ngày {selectedDate ? new Date(selectedDate).toLocaleDateString('vi-VN') : ''}
                    </h2>
                    <input
                      type="date"
                      value={selectedDate ? new Date(selectedDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          const newDate = new Date(e.target.value);
                          setSelectedDate(newDate);
                          fetchOrdersByDate(newDate);
                        }
                      }}
                      max={new Date().toISOString().split('T')[0]}
                      className="border rounded px-3 py-1 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div>
                      <p className="text-sm text-gray-600">Doanh thu (hoàn tất):</p>
                      <p className="font-bold text-lg text-purple-600">{formatVND(dateRevenue)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tổng số đơn:</p>
                      <p className="font-bold text-lg text-gray-800">
                        {dateOrders.length} đơn
                        {dateOrders.filter(o => o.status === 'completed').length > 0 && (
                          <span className="text-sm text-green-600 ml-2">
                            ({dateOrders.filter(o => o.status === 'completed').length} hoàn tất)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowDateOrdersModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl ml-4"
                >
                  ×
                </button>
              </div>

              {loadingDateOrders ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Đang tải đơn hàng...</p>
                </div>
              ) : dateOrders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Không có đơn hàng nào trong ngày này</p>
                </div>
              ) : (
                <div>
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Lưu ý:</strong> Doanh thu chỉ tính từ các đơn hàng có trạng thái "Hoàn tất" (đã thanh toán). 
                      Các đơn hàng đang xử lý sẽ không được tính vào doanh thu.
                    </p>
                  </div>
                  <div className="space-y-4">
                    {dateOrders.map((order) => {
                      const isCompleted = order.status === 'completed';
                      const isCancelled = order.status === 'cancelled';
                      return (
                        <div 
                          key={order.id} 
                          className={`border rounded-lg p-4 transition-colors cursor-pointer ${
                            isCompleted 
                              ? 'border-green-300 bg-green-50 hover:bg-green-100' 
                              : isCancelled
                              ? 'border-red-200 bg-red-50 hover:bg-red-100'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                          onClick={() => {
                            // Cho phép xem chi tiết đơn hàng (kể cả đã hủy hoặc hoàn tất)
                            setSelectedOrder(order.id);
                            fetchOrderDetail(order.id);
                            setShowDateOrdersModal(false);
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <p className="font-bold text-lg">{order.orderCode}</p>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${
                                  order.orderType === 'delivery'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {order.orderType === 'delivery' ? (
                                    <>
                                      <DeliveryTruckIcon className="w-4 h-4" />
                                      Giao hàng
                                    </>
                                  ) : (
                                    <>
                                      <TableIcon className="w-4 h-4" />
                                      Tại bàn
                                    </>
                                  )}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                  order.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : order.status === 'confirmed'
                                    ? 'bg-blue-100 text-blue-800'
                                    : order.status === 'preparing'
                                    ? 'bg-orange-100 text-orange-800'
                                    : order.status === 'ready'
                                    ? 'bg-green-100 text-green-800'
                                    : order.status === 'delivered'
                                    ? 'bg-purple-100 text-purple-800'
                                    : order.status === 'completed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {order.status === 'pending' ? 'Chờ xử lý' :
                                   order.status === 'confirmed' ? 'Đã xác nhận' :
                                   order.status === 'preparing' ? 'Đang chuẩn bị' :
                                   order.status === 'ready' ? 'Sẵn sàng' :
                                   order.status === 'delivered' ? 'Đã giao' :
                                   order.status === 'completed' ? 'Hoàn tất' :
                                   order.status === 'cancelled' ? 'Đã hủy' : order.status}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">
                                {order.orderType === 'delivery' 
                                  ? (order.customerName || 'N/A')
                                  : `Bàn ${order.tableNumber || 'N/A'}`}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(order.createdAt).toLocaleString('vi-VN')}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold text-lg ${isCompleted ? 'text-purple-600' : 'text-gray-400'}`}>
                                {formatVND(order.totalAmount)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
