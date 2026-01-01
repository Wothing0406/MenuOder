import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useStore } from '../../lib/store';
import Navbar from '../../components/Navbar';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import ReviewCard from '../../components/ReviewCard';
import StarRating from '../../components/StarRating';

export default function ReviewsManagement() {
  const router = useRouter();
  const { token, user, isHydrated } = useStore();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState({
    itemId: '',
    isVisible: '',
    sort: 'newest',
    page: 1
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1
  });

  useEffect(() => {
    // Wait for store hydration before checking authentication
    if (!isHydrated) return;

    // Wait for authentication to be fully restored (token + user data)
    if (!token || !user) {
      // If we have no token at all, redirect to login
      if (!token) {
        console.log('🔐 No token found, redirecting to login');
        router.push('/login');
        return;
      }
      // If we have token but no user data yet, wait for _app.jsx to restore it
      console.log('⏳ Waiting for authentication restoration...');
      return;
    }

    // Check user role
    if (user?.role === 'admin') {
      router.replace('/admin');
      return;
    }

    console.log('✅ Authentication restored, loading reviews data');
    fetchReviews();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user, isHydrated, filter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.itemId) params.append('itemId', filter.itemId);
      if (filter.isVisible !== '') params.append('isVisible', filter.isVisible);
      params.append('sort', filter.sort);
      params.append('page', filter.page);
      params.append('limit', '20');

      const res = await api.get(`/reviews/my-store?${params.toString()}`);
      if (res.data.success) {
        setReviews(res.data.data.reviews);
        setPagination(res.data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Không thể tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/reviews/my-store/stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleToggleVisibility = async (reviewId) => {
    try {
      const res = await api.put(`/reviews/${reviewId}/visibility`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchReviews();
        fetchStats();
      }
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const handleDelete = async (reviewId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đánh giá này không?')) return;

    try {
      const res = await api.delete(`/reviews/${reviewId}`);
      if (res.data.success) {
        toast.success('Đã xóa đánh giá');
        fetchReviews();
        fetchStats();
      }
    } catch (error) {
      toast.error('Không thể xóa đánh giá');
    }
  };

  if (loading && reviews.length === 0) {
    return (
      <Layout>
        <Navbar />
        <div className="container-custom py-8 text-center">
          <p>Đang tải...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Quản Lý Đánh Giá - MenuOrder</title>
      </Head>
      <Navbar />

      <div className="container-custom py-8">
        <h1 className="text-3xl font-bold mb-8">Quản Lý Đánh Giá</h1>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
              <h3 className="text-lg font-bold text-gray-700 mb-2">Điểm Trung Bình</h3>
              <div className="flex items-center gap-3">
                <StarRating rating={parseFloat(stats.averageRating)} readonly size="lg" />
                <span className="text-3xl font-bold text-yellow-700">
                  {stats.averageRating}
                </span>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
              <h3 className="text-lg font-bold text-gray-700 mb-2">Tổng Đánh Giá</h3>
              <p className="text-3xl font-bold text-blue-700">{stats.totalReviews}</p>
            </div>

            <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
              <h3 className="text-lg font-bold text-gray-700 mb-2">Phân Bố Đánh Giá</h3>
              <div className="space-y-1">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-sm w-12">{rating} sao:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{
                          width: `${stats.totalReviews > 0 ? (stats.distribution[rating] / stats.totalReviews) * 100 : 0}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold w-8 text-right">
                      {stats.distribution[rating] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sắp xếp
              </label>
              <select
                value={filter.sort}
                onChange={(e) => setFilter({ ...filter, sort: e.target.value, page: 1 })}
                className="input-field w-full"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="highest">Điểm cao nhất</option>
                <option value="lowest">Điểm thấp nhất</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                value={filter.isVisible}
                onChange={(e) => setFilter({ ...filter, isVisible: e.target.value, page: 1 })}
                className="input-field w-full"
              >
                <option value="">Tất cả</option>
                <option value="true">Đang hiển thị</option>
                <option value="false">Đã ẩn</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFilter({ itemId: '', isVisible: '', sort: 'newest', page: 1 })}
                className="btn btn-secondary w-full"
              >
                Đặt lại
              </button>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="card">
                <ReviewCard review={review} showItem={true} />
                
                {/* Admin Actions & Info */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Thông tin người đánh giá:</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Tên:</span> {review.reviewerName}</p>
                        {review.reviewerPhone && (
                          <p><span className="font-medium">SĐT:</span> {review.reviewerPhone}</p>
                        )}
                        {review.reviewerEmail && (
                          <p><span className="font-medium">Email:</span> {review.reviewerEmail}</p>
                        )}
                        {review.order && (
                          <p><span className="font-medium">Mã đơn:</span> {review.order.orderCode}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Thông tin đánh giá:</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Ngày:</span> {new Date(review.createdAt).toLocaleString('vi-VN')}</p>
                        <p>
                          <span className="font-medium">Trạng thái:</span>{' '}
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            review.isVisible 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {review.isVisible ? 'Đang hiển thị' : 'Đã ẩn'}
                          </span>
                        </p>
                        {review.isVerified && (
                          <p>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                              ✓ Đã xác minh từ đơn hàng
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleVisibility(review.id)}
                      className={`btn flex-1 ${
                        review.isVisible ? 'btn-secondary' : 'btn-primary'
                      }`}
                    >
                      {review.isVisible ? 'Ẩn đánh giá' : 'Hiện đánh giá'}
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="btn btn-danger"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setFilter({ ...filter, page: filter.page - 1 })}
                  disabled={filter.page === 1}
                  className="btn btn-secondary"
                >
                  Trước
                </button>
                <span className="flex items-center px-4">
                  Trang {filter.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => setFilter({ ...filter, page: filter.page + 1 })}
                  disabled={filter.page >= pagination.totalPages}
                  className="btn btn-secondary"
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="card text-center py-12 text-gray-500">
            <p>Chưa có đánh giá nào</p>
          </div>
        )}
      </div>
    </Layout>
  );
}





