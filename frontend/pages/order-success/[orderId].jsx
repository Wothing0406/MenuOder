import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../../lib/api';
import { useCart } from '../../lib/store';
import Layout from '../../components/Layout';
import { formatVND } from '../../lib/utils';

export default function OrderSuccess() {
  const router = useRouter();
  const { orderId } = router.query;
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
          setOrder(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

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
        <title>Order Success - MenuOrder</title>
      </Head>

      <div className="container-custom py-12">
        <div className="max-w-md mx-auto card text-center">
          <div className="mb-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-5xl text-green-600">✓</span>
            </div>
            <h1 className="text-3xl font-bold mb-2 text-green-600">Đặt hàng thành công!</h1>
            <p className="text-gray-600">Cảm ơn bạn đã đặt hàng!</p>
          </div>

          {order && (
            <>
              <div className="bg-gray-50 p-6 rounded-lg mb-6 text-left border border-gray-200">
                <div className="mb-3">
                  <span className="text-sm text-gray-600">Mã đơn hàng:</span>
                  <p className="text-blue-600 font-bold text-lg">{order.orderCode}</p>
                </div>
                {order.tableNumber && (
                  <div className="mb-3">
                    <span className="text-sm text-gray-600">Số bàn:</span>
                    <p className="font-bold">{order.tableNumber}</p>
                  </div>
                )}
                <div className="mb-3">
                  <span className="text-sm text-gray-600">Tổng tiền:</span>
                  <p className="font-bold text-xl text-blue-600">{formatVND(order.totalAmount)}</p>
                </div>
                <div className="mb-3">
                  <span className="text-sm text-gray-600">Phương thức thanh toán:</span>
                  <p className="capitalize font-medium">
                    {order.paymentMethod === 'cash' ? 'Tiền mặt' : 
                     order.paymentMethod === 'bank_transfer' ? 'Chuyển khoản' : 
                     'Thẻ tín dụng'}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Thời gian đặt:</span>
                  <p className="text-sm">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                </div>
              </div>

              {order.items && order.items.length > 0 && (
                <div className="text-left mb-6">
                  <h3 className="font-bold mb-3 text-lg">Chi tiết đơn hàng:</h3>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-start p-3 bg-gray-50 rounded border">
                        <div className="flex-1">
                          <p className="font-bold">{item.itemName}</p>
                          <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                          {item.selectedAccompaniments && 
                           Array.isArray(item.selectedAccompaniments) && 
                           item.selectedAccompaniments.length > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              Món kèm: {item.selectedAccompaniments.map(acc => acc.name).join(', ')}
                            </p>
                          )}
                        </div>
                        <p className="font-bold text-blue-600">{formatVND(item.subtotal)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <p className="text-gray-700 text-sm">
                  Cửa hàng sẽ xác nhận đơn hàng của bạn trong thời gian sớm nhất. Vui lòng chờ!
                </p>
              </div>
            </>
          )}

          <div className="mt-6 space-y-2">
            <button
              onClick={() => router.push('/')}
              className="btn btn-primary w-full py-3"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
