import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../lib/api';
import { useCart } from '../lib/store';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import { formatVND } from '../lib/utils';

export default function Checkout() {
  const router = useRouter();
  const { items: cartItems, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [storeId, setStoreId] = useState(null);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    tableNumber: '',
    customerNote: '',
    paymentMethod: 'cash',
  });

  useEffect(() => {
    if (!router.query.store) return;

    // Get store info
    const fetchStoreId = async () => {
      try {
        const res = await api.get(`/stores/slug/${router.query.store}`);
        if (res.data.success) {
          setStoreId(res.data.data.store.id);
        }
      } catch (error) {
        toast.error('Store not found');
        router.push('/');
      }
    };

    fetchStoreId();
  }, [router.query.store]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customerName || !formData.customerPhone || !formData.tableNumber) {
      toast.error('Vui lòng điền đầy đủ thông tin: tên, số điện thoại và số bàn');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Giỏ hàng của bạn đang trống');
      return;
    }

    try {
      setLoading(true);

      const orderItems = cartItems.map((item) => ({
        itemId: item.itemId,
        quantity: item.quantity,
        selectedOptions: item.selectedOptions || {},
        selectedAccompaniments: item.selectedAccompaniments || [],
        notes: item.notes || '',
      }));

      // Validate storeId
      if (!storeId) {
        toast.error('Không tìm thấy thông tin cửa hàng. Vui lòng thử lại.');
        return;
      }

      // Validate tableNumber
      let tableNum = null;
      if (formData.tableNumber && formData.tableNumber.trim() !== '') {
        const parsed = parseInt(formData.tableNumber.trim());
        if (isNaN(parsed) || parsed < 1) {
          toast.error('Số bàn phải là số nguyên dương');
          return;
        }
        tableNum = parsed;
      }

      const res = await api.post('/orders', {
        storeId: parseInt(storeId),
        tableNumber: tableNum,
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone.trim(),
        customerEmail: formData.customerEmail?.trim() || null,
        customerNote: formData.customerNote?.trim() || null,
        paymentMethod: formData.paymentMethod || 'cash',
        items: orderItems,
      });

      if (res.data.success) {
        toast.success('Đặt hàng thành công!');
        clearCart();
        router.push(`/order-success/${res.data.data.id}`);
      }
    } catch (error) {
      console.error('Order creation error:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Đặt hàng thất bại';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Check for network errors
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <Layout>
        <Head>
          <title>Checkout - MenuOrder</title>
        </Head>
        <div className="container-custom py-12 text-center">
          <p className="text-xl mb-4">Giỏ hàng của bạn đang trống</p>
          <button
            onClick={() => router.back()}
            className="btn btn-primary"
          >
            Quay lại menu
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Checkout - MenuOrder</title>
      </Head>

      <div className="container-custom py-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
            Thanh toán đơn hàng
          </h1>
          <p className="text-gray-600 text-lg">Hoàn tất thông tin để đặt hàng</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Form */}
          <div className="md:col-span-2">
            <div className="card relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-purple-100 rounded-full blur-3xl opacity-20"></div>
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <span className="text-2xl">👤</span>
                  Thông tin khách hàng
                </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-2 font-bold">
                    Tên <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Nhập tên của bạn"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 font-bold">
                    Số điện thoại <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="+84-xxx-xxx-xxx"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 font-bold">
                    Số bàn <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    name="tableNumber"
                    value={formData.tableNumber}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Nhập số bàn"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 font-bold">Email</label>
                  <input
                    type="email"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-bold">Ghi chú đơn hàng</label>
                  <textarea
                    name="customerNote"
                    value={formData.customerNote}
                    onChange={handleChange}
                    className="input-field"
                    rows="4"
                    placeholder="Any special requests or notes..."
                  ></textarea>
                </div>

                <div>
                  <label className="block mb-2 font-bold">Phương thức thanh toán</label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="cash">Tiền mặt</option>
                    <option value="bank_transfer">Chuyển khoản</option>
                    <option value="credit_card">Thẻ tín dụng</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full mt-8 py-4 text-lg font-bold hover:scale-105 transform transition-transform shadow-xl"
                >
                  {loading ? 'Đang đặt hàng...' : 'Đặt hàng ngay'}
                </button>
              </form>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="card sticky top-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-2xl opacity-20"></div>
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <span className="text-2xl">📋</span>
                  Tóm tắt đơn hàng
                </h2>

              <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-bold text-gray-800 mb-1">{item.name}</p>
                        <p className="text-sm text-gray-600 mb-2">Số lượng: <span className="font-semibold">{item.quantity}</span></p>
                        {item.selectedAccompaniments && item.selectedAccompaniments.length > 0 && (
                          <div className="text-xs text-gray-600 mt-1 bg-white px-2 py-1 rounded">
                            <span className="font-medium">Món kèm:</span> {item.selectedAccompaniments.map(acc => acc.name).join(', ')}
                          </div>
                        )}
                        {item.notes && (
                          <div className="text-xs text-purple-600 mt-2 italic bg-purple-50 px-2 py-1 rounded">
                            <span className="font-medium">Ghi chú:</span> {item.notes}
                          </div>
                        )}
                      </div>
                      <p className="text-right font-bold text-lg text-purple-600 ml-4">
                        {formatVND(item.subtotal)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-gray-200 pt-4 space-y-3 bg-gradient-to-br from-gray-50 to-white rounded-lg p-4">
                <div className="flex justify-between text-gray-700">
                  <span>Tạm tính:</span>
                  <span className="font-semibold">{formatVND(total)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Phí giao hàng:</span>
                  <span className="font-semibold text-green-600">Miễn phí</span>
                </div>
                <div className="flex justify-between text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent border-t-2 border-gray-200 pt-3 mt-2">
                  <span>Tổng cộng:</span>
                  <span>{formatVND(total)}</span>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
