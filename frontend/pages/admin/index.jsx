import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

import Layout from '../../components/Layout';
import Navbar from '../../components/Navbar';
import api from '../../lib/api';
import { useStore } from '../../lib/store';
import { formatVND } from '../../lib/utils';

export default function AdminDashboard() {
  const router = useRouter();
  const { token, user } = useStore();

  const [stores, setStores] = useState([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [vouchers, setVouchers] = useState([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [voucherForm, setVoucherForm] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    description: '',
    neverExpires: true,
    startsAt: '',
    expiresAt: '',
    usageLimit: '',
    isActive: true
  });
  const [creatingVoucher, setCreatingVoucher] = useState(false);
  const [deleteCode, setDeleteCode] = useState('');
  const [deletingCode, setDeletingCode] = useState(false);
  const [hasAdminSecret, setHasAdminSecret] = useState(false);

  useEffect(() => {
    // Accept admin secret from query param
    const { key } = router.query || {};
    if (key && typeof window !== 'undefined') {
      localStorage.setItem('adminSecret', key);
      // Clean the URL (remove key) for security
      const cleanUrl = window.location.pathname + window.location.search.replace(/([?&])key=[^&]*(&|$)/, (m, p1, p2) => (p1 === '?' && p2 ? '?' : '')).replace(/[?&]$/, '');
      window.history.replaceState({}, document.title, cleanUrl || '/admin');
    }

    const adminSecret = typeof window !== 'undefined' ? localStorage.getItem('adminSecret') : null;
    if (!adminSecret) {
      setHasAdminSecret(false);
      return; // do not fetch without secret
    }

    setHasAdminSecret(true);
    fetchStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query]);

  useEffect(() => {
    // Only fetch vouchers if a store is selected or global is selected
    if (selectedStoreId || selectedStoreId === 'global') {
      fetchVouchers(selectedStoreId);
    } else {
      setVouchers([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStoreId]);

  const fetchStores = async () => {
    try {
      setLoadingStores(true);
      const res = await api.get('/stores/admin');
      if (res.data.success) {
        const list = res.data.data || [];
        setStores(list);
        if (!selectedStoreId && list.length > 0) {
          setSelectedStoreId(String(list[0].id));
        }
      } else {
        toast.error(res.data.message || 'Không thể tải danh sách cửa hàng');
      }
    } catch (error) {
      console.error('Fetch stores error:', error);
      
      // Handle network errors
      if (error.networkError || error.code === 'ECONNREFUSED' || error.message?.includes('Network Error') || error.message?.includes('ERR_NETWORK')) {
        toast.error('Không thể kết nối đến server. Vui lòng kiểm tra backend server có đang chạy không.');
      } else if (error.response) {
        // Server responded with error
        const errorMessage = error.response.data?.message || error.message || 'Không thể tải danh sách cửa hàng';
        if (error.response.status === 403) {
          toast.error('Lỗi xác thực: Admin secret không hợp lệ. Vui lòng truy cập lại với key đúng.');
        } else if (error.response.status === 500 && error.response.data?.message?.includes('ADMIN_SECRET_KEY')) {
          toast.error('Lỗi cấu hình server: Admin secret chưa được cấu hình.');
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error(error.userMessage || error.message || 'Không thể tải danh sách cửa hàng');
      }
    } finally {
      setLoadingStores(false);
    }
  };

  const fetchVouchers = async (storeIdValue) => {
    // Skip if no store selected and not global
    if (!storeIdValue && storeIdValue !== 'global' && storeIdValue !== '') {
      setVouchers([]);
      return;
    }
    
    try {
      setLoadingVouchers(true);
      const params = {};
      if (storeIdValue === 'global') {
        params.storeId = 'global';
      } else if (storeIdValue && storeIdValue.trim() !== '') {
        params.storeId = storeIdValue;
      }
      const res = await api.get('/vouchers/admin', { params });
      if (res.data.success) {
        setVouchers(res.data.data || []);
      } else {
        toast.error(res.data.message || 'Không thể tải voucher của cửa hàng này');
      }
    } catch (error) {
      console.error('Fetch admin vouchers error:', error);
      
      // Handle network errors
      if (error.networkError || error.code === 'ECONNREFUSED' || error.message?.includes('Network Error') || error.message?.includes('ERR_NETWORK')) {
        toast.error('Không thể kết nối đến server. Vui lòng kiểm tra backend server có đang chạy không.');
      } else if (error.response) {
        // Server responded with error
        const errorMessage = error.response.data?.message || error.message || 'Không thể tải voucher của cửa hàng này';
        if (error.response.status === 403) {
          toast.error('Lỗi xác thực: Admin secret không hợp lệ. Vui lòng truy cập lại với key đúng.');
        } else if (error.response.status === 500) {
          toast.error('Lỗi server: ' + errorMessage);
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error(error.userMessage || error.message || 'Không thể tải voucher của cửa hàng này');
      }
    } finally {
      setLoadingVouchers(false);
    }
  };

  const handleStoreStatusToggle = async (store) => {
    try {
      await api.patch(`/stores/admin/${store.id}/status`, {
        isActive: !store.isActive
      });
      toast.success(`Đã ${store.isActive ? 'tạm khoá' : 'mở lại'} cửa hàng`);
      fetchStores();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Toggle store status error:', error);
      }
      toast.error(error.response?.data?.message || 'Không thể cập nhật trạng thái quán');
    }
  };

  const handleVoucherFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setVoucherForm((prev) => {
      const next = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
      if (name === 'neverExpires' && checked) {
        next.expiresAt = '';
      }
      if (name === 'code') {
        next.code = value.toUpperCase();
      }
      return next;
    });
  };

  const resetVoucherForm = () => {
    setVoucherForm({
      code: '',
      discountType: 'percentage',
      discountValue: '',
      minOrderAmount: '',
      maxDiscountAmount: '',
      description: '',
      neverExpires: true,
      startsAt: '',
      expiresAt: '',
      usageLimit: '',
      isActive: true
    });
  };

  const handleCreateVoucher = async (e) => {
    e.preventDefault();
    if (!voucherForm.code.trim()) {
      toast.error('Vui lòng nhập mã voucher');
      return;
    }
    if (!voucherForm.discountValue || Number(voucherForm.discountValue) <= 0) {
      toast.error('Giá trị giảm không hợp lệ');
      return;
    }

    try {
      setCreatingVoucher(true);
      const payload = {
        ...voucherForm,
        // Không gửi storeId -> voucher toàn hệ thống
        code: voucherForm.code.trim().toUpperCase(),
        discountValue: Number(voucherForm.discountValue),
        minOrderAmount: voucherForm.minOrderAmount ? Number(voucherForm.minOrderAmount) : 0,
        maxDiscountAmount: voucherForm.maxDiscountAmount ? Number(voucherForm.maxDiscountAmount) : undefined,
        description: voucherForm.description?.trim() || undefined,
        startsAt: voucherForm.startsAt || null,
        expiresAt: voucherForm.neverExpires ? null : voucherForm.expiresAt || null,
        usageLimit: voucherForm.usageLimit ? Number(voucherForm.usageLimit) : null
      };
      const res = await api.post('/vouchers/admin', payload);
      if (res.data.success) {
        toast.success('Đã tạo voucher toàn hệ thống!');
        resetVoucherForm();
        fetchVouchers(selectedStoreId);
      } else {
        toast.error(res.data.message || 'Không thể tạo voucher');
      }
    } catch (error) {
      console.error('Create admin voucher error:', error);
      
      // Handle network errors
      if (error.networkError || error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        toast.error('Không thể kết nối đến server. Vui lòng kiểm tra backend server có đang chạy không.');
      } else if (error.response) {
        // Server responded with error
        toast.error(error.response.data?.message || 'Không thể tạo voucher');
      } else {
        // Other errors
        toast.error(error.userMessage || error.message || 'Không thể tạo voucher');
      }
    } finally {
      setCreatingVoucher(false);
    }
  };

  const handleDeleteVoucher = async (voucherId) => {
    if (!voucherId) return;
    try {
      await api.delete(`/vouchers/admin/${voucherId}`);
      toast.success('Đã xoá voucher');
      fetchVouchers(selectedStoreId);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Delete admin voucher error:', error);
      }
      toast.error(error.response?.data?.message || 'Không thể xoá voucher');
    }
  };

  const handleDeleteVoucherByCode = async (e) => {
    e.preventDefault();
    if (!deleteCode.trim()) {
      toast.error('Vui lòng nhập mã voucher cần xoá');
      return;
    }

    try {
      setDeletingCode(true);
      const params = {};
      if (selectedStoreId === 'global') {
        params.storeId = 'global';
      } else if (selectedStoreId) {
        params.storeId = selectedStoreId;
      }

      await api.delete(`/vouchers/admin/code/${deleteCode.trim().toUpperCase()}`, { params });
      toast.success('Đã xoá voucher theo mã');
      setDeleteCode('');
      fetchVouchers(selectedStoreId);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Delete voucher by code error:', error);
      }
      toast.error(error.response?.data?.message || 'Không thể xoá voucher');
    } finally {
      setDeletingCode(false);
    }
  };

  const totalStores = stores.length;
  const activeStores = stores.filter((store) => store.isActive).length;

  return (
    <Layout>
      <Head>
        <title>Trang quản trị - MenuOrder</title>
      </Head>
      <Navbar />

      <div className="container-custom py-8 space-y-8">
        <section className="gradient-teal text-white p-8 rounded-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-20"></div>
          <div className="relative z-10">
            <p className="uppercase text-sm tracking-[0.3em] text-purple-100 mb-2">Admin Control</p>
            <h1 className="text-4xl font-extrabold mb-6">Bảng điều khiển quản trị</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm p-4 rounded-xl">
                <p className="text-sm text-purple-100">Tổng số cửa hàng</p>
                <p className="text-3xl font-bold">{totalStores}</p>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm p-4 rounded-xl">
                <p className="text-sm text-purple-100">Cửa hàng đang hoạt động</p>
                <p className="text-3xl font-bold">{activeStores}</p>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm p-4 rounded-xl">
                <p className="text-sm text-purple-100">Voucher đang theo dõi</p>
                <p className="text-3xl font-bold">{vouchers.length}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Quản lý cửa hàng</h2>
              <p className="text-sm text-gray-600">Bật/tắt hoạt động, xem nhanh thông tin từng quán.</p>
            </div>
            <button
              onClick={fetchStores}
              className="px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition"
            >
              Làm mới
            </button>
          </div>

          {!hasAdminSecret ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              Đây là trang ẩn. Thiếu Admin Secret. Hãy truy cập qua URL: /admin?key=YOUR_ADMIN_SECRET_KEY
            </div>
          ) : loadingStores ? (
            <div className="flex items-center gap-2 text-gray-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
              Đang tải danh sách quán...
            </div>
          ) : stores.length === 0 ? (
            <p className="text-gray-600">Chưa có cửa hàng nào.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 font-semibold text-gray-600">Cửa hàng</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Chủ quán</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Trạng thái</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.map((store) => (
                    <tr key={store.id} className="border-b last:border-0">
                      <td className="px-4 py-3">
                        <p className="font-bold text-gray-800">{store.storeName}</p>
                        <p className="text-xs text-gray-500">{store.storeSlug}</p>
                        <p className="text-xs text-gray-500">{store.storeAddress}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold">{store.owner?.storeName || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{store.owner?.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            store.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {store.isActive ? 'Đang hoạt động' : 'Đã khoá'}
                        </span>
                      </td>
                      <td className="px-4 py-3 space-x-2">
                        <button
                          onClick={() => handleStoreStatusToggle(store)}
                          className="px-3 py-2 rounded-lg border border-purple-200 text-purple-700 text-xs font-semibold hover:bg-purple-50 transition"
                        >
                          {store.isActive ? 'Khoá quán' : 'Mở lại'}
                        </button>
                        <button
                          onClick={() => window.open(`/store/${store.storeSlug}`, '_blank')}
                          className="px-3 py-2 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-black transition"
                        >
                          Xem menu
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="card">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Quản lý voucher toàn hệ thống</h2>
            <p className="text-sm text-gray-600">
              Tạo, xoá hoặc vô hiệu hoá voucher cho từng cửa hàng. Đây là trang quản trị ẩn chỉ dành cho chủ website.
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Lọc voucher theo cửa hàng</label>
            <select
              value={selectedStoreId}
              onChange={(e) => setSelectedStoreId(e.target.value)}
              className="input-field w-full md:w-80"
            >
              <option value="">Tất cả voucher (gồm toàn hệ thống)</option>
              <option value="global">Chỉ voucher toàn hệ thống</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.storeName} ({store.storeSlug})
                </option>
              ))}
            </select>
          </div>

          {true ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <form onSubmit={handleCreateVoucher} className="space-y-4 bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-sm" aria-label="Tạo voucher toàn hệ thống">
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Mã voucher <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={voucherForm.code}
                    onChange={handleVoucherFormChange}
                    className="input-field w-full uppercase"
                    placeholder="VD: TET2025"
                    maxLength={20}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Loại giảm</label>
                    <select
                      name="discountType"
                      value={voucherForm.discountType}
                      onChange={handleVoucherFormChange}
                      className="input-field w-full"
                    >
                      <option value="percentage">Giảm %</option>
                      <option value="fixed">Giảm số tiền</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Giá trị giảm</label>
                    <input
                      type="number"
                      name="discountValue"
                      value={voucherForm.discountValue}
                      onChange={handleVoucherFormChange}
                      className="input-field w-full"
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Đơn tối thiểu</label>
                    <input
                      type="number"
                      name="minOrderAmount"
                      value={voucherForm.minOrderAmount}
                      onChange={handleVoucherFormChange}
                      className="input-field w-full"
                      min="0"
                      step="1000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Giảm tối đa</label>
                    <input
                      type="number"
                      name="maxDiscountAmount"
                      value={voucherForm.maxDiscountAmount}
                      onChange={handleVoucherFormChange}
                      className="input-field w-full"
                      min="0"
                      step="1000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Ngày bắt đầu (tuỳ chọn)</label>
                    <input
                      type="datetime-local"
                      name="startsAt"
                      value={voucherForm.startsAt}
                      onChange={handleVoucherFormChange}
                      className="input-field w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">Voucher chỉ có hiệu lực từ ngày này trở đi.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Giới hạn số lượng sử dụng</label>
                    <input
                      type="number"
                      name="usageLimit"
                      value={voucherForm.usageLimit}
                      onChange={handleVoucherFormChange}
                      className="input-field w-full"
                      min="1"
                      step="1"
                      placeholder="Ví dụ: 100"
                    />
                    <p className="text-xs text-gray-500 mt-1">Để trống = không giới hạn. Nhập số để giới hạn số lần sử dụng.</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      name="neverExpires"
                      checked={voucherForm.neverExpires}
                      onChange={handleVoucherFormChange}
                      className="w-4 h-4"
                    />
                    Không giới hạn thời gian
                  </label>
                  <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={voucherForm.isActive}
                      onChange={handleVoucherFormChange}
                      className="w-4 h-4"
                    />
                    Kích hoạt ngay
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Ngày hết hạn (tuỳ chọn)</label>
                  <input
                    type="datetime-local"
                    name="expiresAt"
                    value={voucherForm.expiresAt}
                    onChange={handleVoucherFormChange}
                    className="input-field w-full"
                    disabled={voucherForm.neverExpires}
                  />
                  <p className="text-xs text-gray-500 mt-1">Voucher sẽ hết hạn sau thời điểm này.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Mô tả</label>
                  <textarea
                    name="description"
                    value={voucherForm.description}
                    onChange={handleVoucherFormChange}
                    className="input-field w-full"
                    rows="2"
                  />
                </div>

                <button
                  type="submit"
                  disabled={creatingVoucher}
                  className={`btn btn-primary w-full ${creatingVoucher ? 'opacity-60 cursor-not-allowed' : 'btn-ripple scale-on-hover'}`}
                >
                  {creatingVoucher ? 'Đang tạo...' : 'Tạo voucher toàn hệ thống'}
                </button>
              </form>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">Voucher của cửa hàng</h3>
                    <p className="text-sm text-gray-600">Theo dõi và xoá nhanh voucher theo mã ký tự.</p>
                  </div>
                  <button
                    onClick={() => fetchVouchers(selectedStoreId)}
                    className="text-sm text-purple-600 font-semibold hover:underline"
                  >
                    Làm mới
                  </button>
                </div>

                {loadingVouchers ? (
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                    Đang tải voucher...
                  </div>
                ) : vouchers.length === 0 ? (
                  <p className="text-gray-600 text-sm">Chưa có voucher nào cho cửa hàng này.</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {vouchers.map((voucher) => (
                      <div key={voucher.id} className="border rounded-xl p-4 shadow-sm bg-white">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-xs text-gray-500 uppercase">Mã voucher</p>
                            <p className="text-xl font-extrabold tracking-widest text-purple-600">{voucher.code}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${voucher.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>
                            {voucher.isActive ? 'Đang bật' : 'Đang tắt'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
                          <div>
                            <p className="text-xs text-gray-500">Loại giảm</p>
                            <p className="font-semibold">
                              {voucher.discountType === 'percentage'
                                ? `-${Number(voucher.discountValue)}%`
                                : `-${formatVND(voucher.discountValue)}`}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Đơn tối thiểu</p>
                            <p className="font-semibold">{formatVND(voucher.minOrderAmount || 0)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Giảm tối đa</p>
                            <p className="font-semibold">
                              {voucher.maxDiscountAmount ? formatVND(voucher.maxDiscountAmount) : 'Không giới hạn'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Hạn dùng</p>
                            <p className="font-semibold">
                              {voucher.neverExpires || !voucher.expiresAt
                                ? 'Không giới hạn'
                                : new Date(voucher.expiresAt).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Lượt sử dụng</p>
                            <p className="font-semibold">{voucher.usageCount || 0}{voucher.usageLimit ? ` / ${voucher.usageLimit}` : ''}</p>
                          </div>
                          {voucher.description && (
                            <div className="col-span-2">
                              <p className="text-xs text-gray-500">Ghi chú</p>
                              <p className="font-semibold text-gray-700">{voucher.description}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => handleDeleteVoucher(voucher.id)}
                            className="px-4 py-2 rounded-lg font-semibold text-sm bg-red-500 text-white hover:bg-red-600 transition"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <form onSubmit={handleDeleteVoucherByCode} className="flex flex-col gap-3">
                  <label className="text-sm font-semibold text-gray-700">Xóa voucher theo mã ký tự</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={deleteCode}
                      onChange={(e) => setDeleteCode(e.target.value.toUpperCase())}
                      className="input-field flex-1 uppercase"
                      placeholder="Nhập mã cần xoá"
                    />
                    <button
                      type="submit"
                      disabled={deletingCode}
                      className={`px-4 py-2 rounded-lg font-semibold bg-gray-900 text-white hover:bg-black transition ${deletingCode ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {deletingCode ? 'Đang xoá...' : 'Xóa'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Hãy chọn một cửa hàng để quản lý voucher.</p>
          )}
        </section>
      </div>
    </Layout>
  );
}

