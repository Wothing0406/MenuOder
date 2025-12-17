import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../lib/api';
import Layout from '../components/Layout';
import { formatVND } from '../lib/utils';
import toast from 'react-hot-toast';
import { DeliveryTruckIcon, TableIcon } from '../components/Icons';

const getStatusLabel = (status) => {
  const statusMap = {
    pending: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    preparing: { label: 'Đang chuẩn bị', color: 'bg-orange-100 text-orange-800 border-orange-300' },
    ready: { label: 'Sẵn sàng', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
    delivered: { label: 'Đã giao hàng', color: 'bg-purple-100 text-purple-800 border-purple-300' },
    completed: { label: 'Hoàn tất', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800 border-red-300' }
  };
  return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800 border-gray-300' };
};

const getPaymentMethodLabel = (method) => {
  const methodMap = {
    cash: 'Tiền mặt',
    bank_transfer: 'Chuyển khoản',
    credit_card: 'Thẻ tín dụng'
  };
  return methodMap[method] || method;
};

export default function TrackOrder() {
  const router = useRouter();
  const { orderCode, phoneNumber } = router.query;
  const [searchType, setSearchType] = useState(orderCode ? 'orderCode' : 'phone'); // 'orderCode' or 'phone'
  const [searchValue, setSearchValue] = useState(orderCode || phoneNumber || '');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState(null);

  // Auto-search if orderCode or phoneNumber is provided in URL
  useEffect(() => {
    if ((orderCode || phoneNumber) && !orders) {
      handleAutoSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderCode, phoneNumber]);

  const handleAutoSearch = async () => {
    const value = orderCode || phoneNumber;
    if (!value) return;

    setLoading(true);
    try {
      const params = orderCode 
        ? { orderCode: value.trim() }
        : { phoneNumber: value.trim() };
      
      const res = await api.get('/orders/track', { params });
      
      if (res.data.success) {
        setOrders(Array.isArray(res.data.data) ? res.data.data : [res.data.data]);
        if (res.data.count > 1) {
          toast.success(`Tìm thấy ${res.data.count} đơn hàng`);
        } else {
          toast.success('Tìm thấy đơn hàng');
        }
      }
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error('Không tìm thấy đơn hàng. Vui lòng kiểm tra lại thông tin.');
      } else {
        toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
      }
      setOrders(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchValue.trim()) {
      toast.error('Vui lòng nhập mã đơn hàng hoặc số điện thoại');
      return;
    }

    setLoading(true);
    try {
      const params = searchType === 'orderCode' 
        ? { orderCode: searchValue.trim() }
        : { phoneNumber: searchValue.trim() };
      
      const res = await api.get('/orders/track', { params });
      
      if (res.data.success) {
        setOrders(Array.isArray(res.data.data) ? res.data.data : [res.data.data]);
        if (res.data.count > 1) {
          toast.success(`Tìm thấy ${res.data.count} đơn hàng`);
        } else {
          toast.success('Tìm thấy đơn hàng');
        }
      }
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error('Không tìm thấy đơn hàng. Vui lòng kiểm tra lại thông tin.');
      } else {
        toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
      }
      setOrders(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Theo dõi đơn hàng - MenuOrder</title>
      </Head>

      <div className="container-custom py-6 md:py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-800">
              📦 Theo dõi đơn hàng
            </h1>
            <p className="text-gray-600 text-base md:text-lg">
              Nhập mã đơn hàng hoặc số điện thoại để xem trạng thái đơn hàng của bạn
            </p>
          </div>

          {/* Search Form */}
          <div className="card mb-8">
            <form onSubmit={handleSearch} className="space-y-4">
              {/* Search Type Selection */}
              <div>
                <label className="block mb-2 font-semibold text-sm text-gray-700">
                  Tìm kiếm theo:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchType('orderCode');
                      setSearchValue('');
                      setOrders(null);
                    }}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      searchType === 'orderCode'
                        ? 'border-purple-500 bg-purple-50 text-purple-700 font-bold'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">🔖</div>
                    <div className="text-sm font-semibold">Mã đơn hàng</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchType('phone');
                      setSearchValue('');
                      setOrders(null);
                    }}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      searchType === 'phone'
                        ? 'border-purple-500 bg-purple-50 text-purple-700 font-bold'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">📱</div>
                    <div className="text-sm font-semibold">Số điện thoại</div>
                  </button>
                </div>
              </div>

              {/* Search Input */}
              <div>
                <label className="block mb-2 font-semibold text-sm text-gray-700">
                  {searchType === 'orderCode' ? 'Mã đơn hàng' : 'Số điện thoại'} <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={searchType === 'orderCode' ? 'VD: ORD-XXXXX-XXXXX' : 'VD: 0901234567'}
                  className="input-field w-full text-base py-3"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full py-3 text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Đang tìm kiếm...
                  </span>
                ) : (
                  '🔍 Tìm kiếm đơn hàng'
                )}
              </button>
            </form>
          </div>

          {/* Orders Results */}
          {orders && orders.length > 0 && (
            <div className="space-y-6">
              {orders.map((order) => {
                const statusInfo = getStatusLabel(order.status);
                return (
                  <div key={order.id} className="card">
                    {/* Order Header */}
                    <div className="border-b border-gray-200 pb-4 mb-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Mã đơn hàng</p>
                          <p className="text-lg md:text-xl font-bold text-purple-600 break-all">
                            {order.orderCode}
                          </p>
                        </div>
                        <div className={`px-4 py-2 rounded-lg border-2 inline-block ${statusInfo.color}`}>
                          <p className="text-sm font-bold">{statusInfo.label}</p>
                        </div>
                      </div>
                    </div>

                    {/* Store Info */}
                    {order.store && (
                      <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-xs text-purple-600 mb-1 font-semibold">Cửa hàng</p>
                        <p className="text-sm font-bold text-purple-800">{order.store.storeName}</p>
                        {order.store.storeAddress && (
                          <p className="text-xs text-purple-700 mt-1">📍 {order.store.storeAddress}</p>
                        )}
                        {order.store.storePhone && (
                          <p className="text-xs text-purple-700 mt-1">📞 {order.store.storePhone}</p>
                        )}
                      </div>
                    )}

                    {/* Order Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Thời gian đặt</p>
                        <p className="text-sm font-semibold text-gray-800">
                          {new Date(order.createdAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Loại đơn hàng</p>
                        <p className="text-sm font-semibold text-gray-800 capitalize flex items-center gap-1">
                          {order.orderType === 'dine_in' ? (
                            <>
                              <TableIcon className="w-4 h-4" />
                              Đặt tại quán
                            </>
                          ) : (
                            <>
                              <DeliveryTruckIcon className="w-4 h-4" />
                              Giao hàng
                            </>
                          )}
                        </p>
                      </div>
                      {order.tableNumber && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Số bàn</p>
                          <p className="text-sm font-semibold text-gray-800">
                            Bàn {order.tableNumber}
                          </p>
                        </div>
                      )}
                      {order.customerName && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Tên khách hàng</p>
                          <p className="text-sm font-semibold text-gray-800">
                            {order.customerName}
                          </p>
                        </div>
                      )}
                      {order.customerPhone && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Số điện thoại</p>
                          <p className="text-sm font-semibold text-gray-800">
                            {order.customerPhone}
                          </p>
                        </div>
                      )}
                      {order.deliveryAddress && (
                        <div className="md:col-span-2">
                          <p className="text-xs text-gray-500 mb-1">Địa chỉ giao hàng</p>
                          <p className="text-sm font-semibold text-gray-800">
                            {order.deliveryAddress}
                          </p>
                        </div>
                      )}
                      {order.shippingFee > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Phí giao hàng</p>
                          <p className="text-sm font-semibold text-gray-800">
                            {formatVND(order.shippingFee)}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Phương thức thanh toán</p>
                        <p className="text-sm font-semibold text-gray-800">
                          {getPaymentMethodLabel(order.paymentMethod)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Trạng thái thanh toán</p>
                        <p className={`text-sm font-semibold ${order.isPaid ? 'text-green-600' : 'text-orange-600'}`}>
                          {order.isPaid ? '✓ Đã thanh toán' : '⏳ Chưa thanh toán'}
                        </p>
                      </div>
                    </div>

                    {/* Order Items */}
                    {order.items && order.items.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-bold text-gray-700 mb-3">Chi tiết đơn hàng:</p>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex justify-between items-start p-3 bg-gray-50 rounded-lg border border-gray-200"
                            >
                              <div className="flex-1 min-w-0 pr-2">
                                <p className="font-semibold text-gray-800 mb-1">{item.itemName}</p>
                                <p className="text-xs text-gray-600 mb-1">
                                  Số lượng: {item.quantity} × {formatVND(item.itemPrice)}
                                </p>
                                {item.selectedOptions && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Tùy chọn:{' '}
                                    {(() => {
                                      const normalizeOptionsText = (opt) => {
                                        if (!opt) return '';
                                        if (typeof opt === 'string') {
                                          try {
                                            const parsed = JSON.parse(opt);
                                            return normalizeOptionsText(parsed);
                                          } catch {
                                            return opt;
                                          }
                                        }
                                        if (Array.isArray(opt)) {
                                          return opt
                                            .map((v) =>
                                              typeof v === 'string'
                                                ? v
                                                : (v && v.name) || ''
                                            )
                                            .filter(Boolean)
                                            .join(', ');
                                        }
                                        if (typeof opt === 'object') {
                                          return Object.values(opt)
                                            .map((v) =>
                                              typeof v === 'string'
                                                ? v
                                                : (v && v.name) || ''
                                            )
                                            .filter(Boolean)
                                            .join(', ');
                                        }
                                        return String(opt);
                                      };

                                      return normalizeOptionsText(item.selectedOptions);
                                    })()}
                                  </p>
                                )}
                                {item.selectedAccompaniments && (
                                  <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                                    <p className="font-medium">Món kèm:</p>
                                    {(() => {
                                      const normalizeAcc = (data) => {
                                        if (!data) return [];
                                        if (typeof data === 'string') {
                                          try {
                                            const parsed = JSON.parse(data);
                                            return normalizeAcc(parsed);
                                          } catch {
                                            return [];
                                          }
                                        }
                                        if (Array.isArray(data)) return data;
                                        if (typeof data === 'object') return Object.values(data);
                                        return [];
                                      };

                                      const list = normalizeAcc(item.selectedAccompaniments);
                                      return list.length === 0 ? (
                                        <p>Không có</p>
                                      ) : (
                                        list.map((acc, idx) => (
                                          <p key={idx}>
                                            {acc.quantity ? `${acc.quantity} × ${acc.name}` : acc.name}
                                            {acc.price ? ` (+${formatVND(acc.price)} / phần)` : ''}
                                          </p>
                                        ))
                                      );
                                    })()}
                                  </div>
                                )}
                                {item.notes && (
                                  <p className="text-xs text-gray-500 mt-1 italic">
                                    Ghi chú: {item.notes}
                                  </p>
                                )}
                              </div>
                              <p className="font-bold text-purple-600 whitespace-nowrap">
                                {formatVND(item.subtotal)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Total Amount */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-800">Tổng cộng:</span>
                        <span className="text-2xl font-bold text-purple-600">
                          {formatVND(order.totalAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Customer Note */}
                    {order.customerNote && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs text-blue-700 font-semibold mb-1">Ghi chú:</p>
                        <p className="text-sm text-blue-800">{order.customerNote}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* No Results Message */}
          {orders && orders.length === 0 && (
            <div className="card text-center py-8">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-600 text-lg">Không tìm thấy đơn hàng</p>
              <p className="text-gray-500 text-sm mt-2">
                Vui lòng kiểm tra lại mã đơn hàng hoặc số điện thoại
              </p>
            </div>
          )}

          {/* Back Button */}
          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-purple-600 hover:text-purple-700 font-semibold underline"
            >
              ← Về trang chủ
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

