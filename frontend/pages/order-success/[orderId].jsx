import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../../lib/api';
import { useCart } from '../../lib/store';
import Layout from '../../components/Layout';
import { formatVND } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function OrderSuccess() {
  const router = useRouter();
  const { orderId, store } = router.query;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${orderId}`);
        if (res.data.success) {
          const orderData = res.data.data;
          setOrder(orderData);
          
          // Save order code to localStorage for quick access
          if (orderData.orderCode) {
            const savedOrders = JSON.parse(localStorage.getItem('recentOrders') || '[]');
            const orderInfo = {
              orderCode: orderData.orderCode,
              orderId: orderData.id,
              createdAt: orderData.createdAt,
              totalAmount: orderData.totalAmount,
              status: orderData.status
            };
            
            // Remove if already exists
            const filtered = savedOrders.filter(o => o.orderCode !== orderData.orderCode);
            // Add to beginning
            filtered.unshift(orderInfo);
            // Keep only last 5 orders
            const recentOrders = filtered.slice(0, 5);
            localStorage.setItem('recentOrders', JSON.stringify(recentOrders));
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to fetch order:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const copyOrderCode = () => {
    if (order?.orderCode) {
      navigator.clipboard.writeText(order.orderCode);
      toast.success('Đã sao chép mã đơn hàng!');
    }
  };

  const goToTrackWithOrderCode = () => {
    if (order?.orderCode) {
      router.push(`/track-order?orderCode=${encodeURIComponent(order.orderCode)}`);
    } else {
      router.push('/track-order');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container-custom py-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p>Đang tải chi tiết đơn hàng...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Đặt hàng thành công - MenuOrder</title>
      </Head>

      <div className="container-custom py-6 md:py-12 px-4">
        <div className="max-w-md mx-auto card text-center">
          <div className="mb-6">
            <div className="w-24 h-24 md:w-28 md:h-28 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-fadeIn">
              <span className="text-6xl md:text-7xl text-green-600">✓</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-green-600">Đặt hàng thành công!</h1>
            <p className="text-gray-600 text-base md:text-lg">Cảm ơn bạn đã đặt hàng!</p>
          </div>

          {order && (
            <>
              {/* Bill Header - Store Info */}
              {order.store && (
                <div className="bg-white p-4 md:p-6 rounded-xl mb-4 text-center border-2 border-gray-200">
                  <h2 className="text-xl md:text-2xl font-bold mb-2">{order.store.storeName}</h2>
                  {order.store.storeAddress && (
                    <p className="text-sm text-gray-600 mb-1">{order.store.storeAddress}</p>
                  )}
                  {order.store.storePhone && (
                    <p className="text-sm text-gray-600">📞 {order.store.storePhone}</p>
                  )}
                </div>
              )}

              {/* Bill Content */}
              <div className="bg-gray-50 p-4 md:p-6 rounded-xl mb-6 text-left border-2 border-gray-200">
                <div className="mb-4 pb-3 border-b border-gray-300">
                  <span className="text-xs md:text-sm text-gray-600 block mb-2">Mã đơn hàng:</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex-1 min-w-0 bg-white px-3 py-2.5 rounded-lg border-2 border-blue-200 flex items-center justify-between gap-2">
                      <p className="text-blue-600 font-bold text-base md:text-lg break-all select-all flex-1 min-w-0">{order.orderCode}</p>
                      <button
                        onClick={copyOrderCode}
                        className="flex-shrink-0 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all text-xs md:text-sm font-semibold flex items-center gap-1.5 shadow-sm hover:shadow-md active:scale-95"
                        title="Sao chép mã đơn hàng"
                      >
                        <span>📋</span>
                        <span>Sao chép</span>
                      </button>
                    </div>
                  </div>
                  {order.customerPhone && (
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Bạn có thể theo dõi đơn hàng bằng mã này hoặc số điện thoại: {order.customerPhone}
                    </p>
                  )}
                  {!order.customerPhone && order.orderType === 'dine_in' && (
                    <p className="text-xs text-orange-600 mt-2 font-semibold">
                      ⚠️ Lưu mã đơn hàng này để theo dõi đơn hàng của bạn!
                    </p>
                  )}
                </div>

                {/* Customer Info */}
                {order.customerName && (
                  <div className="mb-4 pb-3 border-b border-gray-300">
                    <span className="text-xs md:text-sm text-gray-600 block mb-1">Khách hàng:</span>
                    <p className="font-bold text-base md:text-lg">{order.customerName}</p>
                  </div>
                )}
                {order.customerPhone && (
                  <div className="mb-4 pb-3 border-b border-gray-300">
                    <span className="text-xs md:text-sm text-gray-600 block mb-1">Số điện thoại:</span>
                    <p className="font-medium text-base md:text-lg">{order.customerPhone}</p>
                  </div>
                )}
                {order.deliveryAddress && (
                  <div className="mb-4 pb-3 border-b border-gray-300">
                    <span className="text-xs md:text-sm text-gray-600 block mb-1">Địa chỉ giao hàng:</span>
                    <p className="font-medium text-base md:text-lg">{order.deliveryAddress}</p>
                  </div>
                )}
                {order.tableNumber && (
                  <div className="mb-4 pb-3 border-b border-gray-300">
                    <span className="text-xs md:text-sm text-gray-600 block mb-1">Số bàn:</span>
                    <p className="font-bold text-base md:text-lg">{order.tableNumber}</p>
                  </div>
                )}

                {/* Payment Summary */}
                <div className="mb-4 pb-3 border-b border-gray-300">
                  <span className="text-xs md:text-sm text-gray-600 block mb-2">Tóm tắt thanh toán:</span>
                  <div className="space-y-1 text-sm">
                    {order.items && order.items.length > 0 && (
                      <div className="flex justify-between">
                        <span>Tạm tính:</span>
                        <span>{formatVND(order.items.reduce((sum, item) => sum + parseFloat(item.subtotal || 0), 0))}</span>
                      </div>
                    )}
                    {order.shippingFee > 0 && (
                      <div className="flex justify-between">
                        <span>Phí ship:</span>
                        <span>{formatVND(order.shippingFee)}</span>
                      </div>
                    )}
                    {order.discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Giảm giá {order.voucherCode ? `(${order.voucherCode})` : ''}:</span>
                        <span>-{formatVND(order.discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-base md:text-lg pt-2 border-t border-gray-300 mt-2">
                      <span>Tổng tiền:</span>
                      <span className="text-blue-600">{formatVND(order.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4 pb-3 border-b border-gray-300">
                  <span className="text-xs md:text-sm text-gray-600 block mb-1">Phương thức thanh toán:</span>
                  <p className="font-medium text-base md:text-lg">
                    {order.paymentMethod === 'cash' ? 'Tiền mặt' : 
                     order.paymentMethod === 'bank_transfer' ? 'Chuyển khoản (thủ công)' :
                     order.paymentMethod === 'bank_transfer_qr' ? 'Chuyển khoản QR' :
                     order.paymentMethod === 'zalopay_qr' ? 'ZaloPay QR' :
                     order.paymentMethod || 'Chưa xác định'}
                  </p>
                  {order.isPaid && (
                    <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                      ✓ Đã thanh toán
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-xs md:text-sm text-gray-600 block mb-1">Thời gian đặt:</span>
                  <p className="text-sm md:text-base">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                </div>
              </div>

              {order.items && order.items.length > 0 && (
                <div className="text-left mb-6">
                  <h3 className="font-bold mb-4 text-lg md:text-xl">Chi tiết đơn hàng:</h3>
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-start p-3 md:p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="font-bold text-base md:text-lg mb-1">{item.itemName}</p>
                          <p className="text-sm md:text-base text-gray-600 mb-1">Số lượng: {item.quantity}</p>
                          {item.selectedAccompaniments && 
                           Array.isArray(item.selectedAccompaniments) && 
                           item.selectedAccompaniments.length > 0 && (
                            <p className="text-xs md:text-sm text-gray-500 mt-1">
                              Món kèm: {item.selectedAccompaniments.map(acc => acc.name).join(', ')}
                            </p>
                          )}
                        </div>
                        <p className="font-bold text-blue-600 text-base md:text-lg whitespace-nowrap">{formatVND(item.subtotal)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-blue-50 p-4 md:p-5 rounded-xl mb-6 border-2 border-blue-200">
                <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-3">
                  Cửa hàng sẽ xác nhận đơn hàng của bạn trong thời gian sớm nhất. Vui lòng chờ!
                </p>
                <div className="bg-white p-3 rounded-lg border border-blue-300 mt-3">
                  <p className="text-xs md:text-sm text-gray-700 font-semibold mb-2">
                    📱 Cách theo dõi đơn hàng:
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                    <li>Nhấn nút "Theo dõi đơn hàng" bên dưới</li>
                    {order.customerPhone ? (
                      <li>Hoặc nhập số điện thoại: <strong>{order.customerPhone}</strong></li>
                    ) : (
                      <li>Hoặc nhập mã đơn hàng: <strong>{order.orderCode}</strong></li>
                    )}
                    <li>Hoặc vào menu "Theo dõi đơn hàng" trên thanh điều hướng</li>
                  </ul>
                </div>
              </div>
            </>
          )}

          <div className="mt-6 space-y-3">
            <button
              onClick={goToTrackWithOrderCode}
              className="btn bg-purple-600 hover:bg-purple-700 text-white w-full py-4 text-base md:text-lg font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              📦 Theo dõi đơn hàng ngay
            </button>
            <button
              onClick={() => {
                if (store) {
                  router.push(`/store/${store}`);
                } else {
                  router.push('/');
                }
              }}
              className="btn btn-primary w-full py-4 text-base md:text-lg font-bold"
            >
              {store ? 'Về menu quán' : 'Về trang chủ'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
