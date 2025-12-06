import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useStore } from '../../lib/store';
import Navbar from '../../components/Navbar';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { formatVND } from '../../lib/utils';
import RevenueChart from '../../components/RevenueChart';
import TopItemsChart from '../../components/TopItemsChart';
import OrderTypePieChart from '../../components/OrderTypePieChart';

export default function Analytics() {
  const router = useRouter();
  const { token, user } = useStore();
  const [loading, setLoading] = useState(true);
  const [revenueChartData, setRevenueChartData] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [orderTypeStats, setOrderTypeStats] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [chartType, setChartType] = useState('quantity');

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    if (user?.role === 'admin') {
      router.replace('/admin');
      return;
    }

    fetchAnalyticsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user, selectedPeriod]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch revenue chart data
      const revenueRes = await api.get(`/orders/my-store/revenue-chart?period=${selectedPeriod}`);
      if (revenueRes.data.success) {
        setRevenueChartData(revenueRes.data.data);
      }

      // Fetch top selling items
      const topItemsRes = await api.get(`/orders/my-store/top-items?period=${selectedPeriod}&limit=10`);
      if (topItemsRes.data.success) {
        setTopItems(topItemsRes.data.data);
      }

      // Fetch order type stats
      const orderTypeRes = await api.get(`/orders/my-store/order-type-stats?period=${selectedPeriod}`);
      if (orderTypeRes.data.success) {
        setOrderTypeStats(orderTypeRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      
      // Log chi tiết lỗi để debug
      if (error.response) {
        console.error('API Error Response:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('API Request Error:', error.request);
        console.error('API URL:', api.defaults.baseURL);
      } else {
        console.error('Error:', error.message);
      }
      
      // Hiển thị thông báo lỗi cụ thể hơn
      if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        router.push('/login');
      } else if (error.response?.status === 404) {
        toast.error('Không tìm thấy dữ liệu. Có thể chưa có đơn hàng hoàn thành.');
      } else if (error.networkError) {
        toast.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối.');
      } else {
        toast.error('Không thể tải dữ liệu thống kê: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Navbar />
        <div className="container-custom py-8 text-center">
          <p>Đang tải dữ liệu thống kê...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Thống Kê Chi Tiết - MenuOrder</title>
      </Head>
      <Navbar />

      <div className="container-custom py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Thống Kê Chi Tiết</h1>
          <div className="flex gap-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-800 font-medium"
            >
              <option value="week">7 ngày qua</option>
              <option value="month">30 ngày qua</option>
              <option value="year">12 tháng qua</option>
            </select>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="card mb-8">
          <div className="mb-4">
            <h2 className="text-2xl font-bold mb-2">Biểu Đồ Doanh Thu</h2>
            <p className="text-gray-700 font-medium">
              Doanh thu và số lượng đơn hàng theo thời gian
            </p>
          </div>
          <RevenueChart data={revenueChartData} period={selectedPeriod} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Selling Items */}
          <div className="card">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Món Bán Chạy</h2>
                <p className="text-gray-700 font-medium">Top 10 món được đặt nhiều nhất</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setChartType('quantity')}
                  className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${
                    chartType === 'quantity'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300 border border-gray-300'
                  }`}
                >
                  Số lượng
                </button>
                <button
                  onClick={() => setChartType('revenue')}
                  className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${
                    chartType === 'revenue'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300 border border-gray-300'
                  }`}
                >
                  Doanh thu
                </button>
              </div>
            </div>
            <TopItemsChart data={topItems} type={chartType} />
          </div>

          {/* Order Type Stats */}
          <div className="card">
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-2">Phân Loại Đơn Hàng</h2>
              <p className="text-gray-700 font-medium">
                Tỷ lệ đơn tại quán vs giao hàng
              </p>
            </div>
            <OrderTypePieChart data={orderTypeStats} />
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
            <h3 className="text-lg font-bold text-gray-700 mb-2">Tổng Doanh Thu</h3>
            <p className="text-3xl font-bold text-green-700">
              {formatVND(
                revenueChartData.reduce((sum, item) => sum + item.revenue, 0)
              )}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {revenueChartData.length} ngày có đơn hàng
            </p>
          </div>

          <div className="card bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
            <h3 className="text-lg font-bold text-gray-700 mb-2">Tổng Số Đơn</h3>
            <p className="text-3xl font-bold text-blue-700">
              {revenueChartData.reduce((sum, item) => sum + item.orderCount, 0)}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Đơn hàng đã hoàn tất
            </p>
          </div>

          <div className="card bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
            <h3 className="text-lg font-bold text-gray-700 mb-2">Đơn Trung Bình</h3>
            <p className="text-3xl font-bold text-purple-700">
              {formatVND(
                revenueChartData.length > 0
                  ? revenueChartData.reduce((sum, item) => sum + item.revenue, 0) /
                    revenueChartData.reduce((sum, item) => sum + item.orderCount, 0) || 0
                  : 0
              )}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Giá trị đơn hàng trung bình
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}




