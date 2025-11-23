import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useStore } from '../../lib/store';
import Navbar from '../../components/Navbar';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { formatVND } from '../../lib/utils';

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

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch orders
      try {
        const ordersRes = await api.get('/orders/my-store/list?limit=50');
        if (ordersRes.data.success) {
          setOrders(ordersRes.data.data.orders);
        }
      } catch (err) {
        console.error('Orders fetch error:', err);
      }

      // Fetch stats
      try {
        const statsRes = await api.get('/orders/my-store/stats');
        if (statsRes.data.success) {
          setStats(statsRes.data.data);
        }
      } catch (err) {
        console.error('Stats fetch error:', err);
        // Set default stats if fetch fails
        setStats({ totalOrders: 0, pendingOrders: 0, completedOrders: 0, totalRevenue: 0 });
      }

      // Fetch QR code
      try {
        const qrRes = await api.get('/qr/my-store');
        if (qrRes.data.success) {
          setQrCode(qrRes.data.data.qrCode);
        }
      } catch (err) {
        console.error('QR code fetch error:', err);
      }
    } catch (error) {
      console.error('Dashboard data error:', error);
      toast.error('Không thể tải một số dữ liệu bảng điều khiển');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
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
      toast.error('Failed to load order details');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order.id);
    fetchOrderDetail(order.id);
  };

  const closeOrderDetail = () => {
    setSelectedOrder(null);
    setOrderDetail(null);
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
          useStore.setState({ store: storeRes.data.data });
          // Update preview với URL từ server
          if (storeRes.data.data.storeLogo) {
            const logoUrl = storeRes.data.data.storeLogo.startsWith('http') 
              ? storeRes.data.data.storeLogo 
              : `${API_BASE}${storeRes.data.data.storeLogo}`;
            setLogoPreview(logoUrl);
          }
        }
      } else {
        toast.error(data.message || 'Upload logo thất bại!');
        setLogoPreview(null);
      }
    } catch (error) {
      console.error('Upload logo error:', error);
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
        <title>Dashboard - MenuOrder</title>
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
        <div className="flex gap-4 mb-8 border-b">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-bold transition ${
              activeTab === 'overview'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            Tổng quan
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 font-bold transition ${
              activeTab === 'orders'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            Đơn hàng
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2 font-bold transition ${
              activeTab === 'menu'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            Quản lý Menu
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`px-4 py-2 font-bold transition ${
              activeTab === 'qr'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            Mã QR
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 font-bold transition ${
              activeTab === 'settings'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            Cài đặt
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="card group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-gray-600 font-semibold">Tổng đơn hàng</h3>
                    <span className="text-3xl transform group-hover:scale-110 transition-transform">📦</span>
                  </div>
                  <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">{stats.totalOrders}</p>
                </div>
              </div>
              <div className="card group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-gray-600 font-semibold">Đơn chờ xử lý</h3>
                    <span className="text-3xl transform group-hover:scale-110 transition-transform">⏳</span>
                  </div>
                  <p className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-400 bg-clip-text text-transparent">{stats.pendingOrders}</p>
                </div>
              </div>
              <div className="card group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-gray-600 font-semibold">Đơn hoàn thành</h3>
                    <span className="text-3xl transform group-hover:scale-110 transition-transform">✅</span>
                  </div>
                  <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">{stats.completedOrders}</p>
                </div>
              </div>
              <div className="card group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-gray-600 font-semibold">Tổng doanh thu</h3>
                    <span className="text-3xl transform group-hover:scale-110 transition-transform">💰</span>
                  </div>
                  <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                    {formatVND(stats.totalRevenue || 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Revenue Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card relative overflow-hidden bg-gradient-to-br from-green-50 via-green-50 to-emerald-50 border-2 border-green-100">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-200 rounded-full blur-3xl opacity-30"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-gray-700 font-bold text-lg">Doanh thu tháng này</h3>
                    <span className="text-3xl">📅</span>
                  </div>
                  <p className="text-4xl font-bold bg-gradient-to-r from-green-700 to-green-500 bg-clip-text text-transparent mb-2">
                    {formatVND(stats.monthlyRevenue || 0)}
                  </p>
                  <p className="text-sm text-gray-600 font-medium">
                    Tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}
                  </p>
                </div>
              </div>
              <div className="card relative overflow-hidden bg-gradient-to-br from-blue-50 via-blue-50 to-cyan-50 border-2 border-blue-100">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-30"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-gray-700 font-bold text-lg">Doanh thu năm nay</h3>
                    <span className="text-3xl">📊</span>
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
                      <th className="px-4 py-2 text-left">Khách hàng</th>
                      <th className="px-4 py-2 text-left">Tổng tiền</th>
                      <th className="px-4 py-2 text-left">Trạng thái</th>
                      <th className="px-4 py-2 text-left">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr 
                        key={order.id} 
                        className="border-b hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleOrderClick(order)}
                      >
                        <td className="px-4 py-2 font-bold">{order.orderCode}</td>
                        <td className="px-4 py-2">{order.customerName}</td>
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
                                : order.status === 'ready'
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'delivered'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-2" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className="border rounded px-2 py-1"
                          >
                            <option value="pending">Chờ xử lý</option>
                            <option value="confirmed">Đã xác nhận</option>
                            <option value="preparing">Đang chuẩn bị</option>
                            <option value="ready">Sẵn sàng</option>
                            <option value="delivered">Đã giao</option>
                          </select>
                        </td>
                      </tr>
                    ))}
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
              className="btn btn-primary"
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
              className="btn btn-primary"
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
                    {(logoPreview || (store?.storeLogo ? (
                      <img 
                        src={(() => {
                          // Nếu đã là full URL
                          if (store.storeLogo.startsWith('http')) {
                            return store.storeLogo;
                          }
                          // Nếu là relative path, tạo full URL
                          const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
                          // Đảm bảo không có double slash
                          const logoPath = store.storeLogo.startsWith('/') ? store.storeLogo : '/' + store.storeLogo;
                          return apiBase + logoPath;
                        })()}
                        alt="Store Logo"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Logo load error:', e.target.src);
                          e.target.src = '/logo.jpg';
                        }}
                      />
                    ) : null)) || (
                      <div className="w-full h-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-4xl font-bold">
                        {store?.storeName?.[0]?.toUpperCase() || 'S'}
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
                    <span className={`btn ${uploadingLogo ? 'btn-secondary opacity-50 cursor-not-allowed' : 'btn-primary'} cursor-pointer inline-block`}>
                      {uploadingLogo ? 'Đang upload...' : 'Chọn ảnh logo'}
                    </span>
                  </label>
                  {store?.storeLogo && (
                    <button
                      onClick={async () => {
                        try {
                          // Gửi request xóa logo (update với logo = null)
                          const formData = new FormData();
                          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}/api/stores/my-store`, {
                            method: 'PUT',
                            headers: {
                              'Authorization': `Bearer ${token}`
                            },
                            body: formData // Empty formData sẽ không có logo
                          });
                          const data = await response.json();
                          if (data.success) {
                            toast.success('Đã xóa logo!');
                            setLogoPreview(null);
                            const storeRes = await api.get('/stores/my-store');
                            if (storeRes.data.success) {
                              useStore.setState({ store: storeRes.data.data });
                            }
                          }
                        } catch (error) {
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
                    <p className="text-gray-600">Mã đơn: {orderDetail.orderCode}</p>
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
                    <div>
                      <p className="text-gray-600 text-sm">Khách hàng</p>
                      <p className="font-bold">{orderDetail.customerName}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Số điện thoại</p>
                      <p className="font-bold">{orderDetail.customerPhone}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Số bàn</p>
                      <p className="font-bold">{orderDetail.tableNumber || 'N/A'}</p>
                    </div>
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
                            : orderDetail.status === 'ready'
                            ? 'bg-green-100 text-green-800'
                            : orderDetail.status === 'delivered'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {orderDetail.status}
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
    </Layout>
  );
}
