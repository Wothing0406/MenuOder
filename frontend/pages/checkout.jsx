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
  const [storeAddress, setStoreAddress] = useState(null);
  const [orderType, setOrderType] = useState('dine_in'); // 'dine_in' or 'delivery'
  const [shippingFee, setShippingFee] = useState(0);
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  const [validatingAddress, setValidatingAddress] = useState(false);
  const [validatedAddress, setValidatedAddress] = useState(null); // { originalAddress, validatedAddress, coordinates }
  const [addressConfirmed, setAddressConfirmed] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    tableNumber: '',
    deliveryAddress: '',
    customerNote: '',
    paymentMethod: 'cash',
  });

  useEffect(() => {
    if (!router.query.store) return;

    const fetchStoreId = async () => {
      try {
        const res = await api.get(`/stores/slug/${router.query.store}`);
        if (res.data.success) {
          setStoreId(res.data.data.store.id);
          setStoreAddress(res.data.data.store.storeAddress);
        }
      } catch (error) {
        toast.error('Không tìm thấy cửa hàng');
        router.push('/');
      }
    };

    fetchStoreId();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.store]);

  // Reset form when order type changes
  useEffect(() => {
    if (orderType === 'dine_in') {
      setFormData(prev => ({
        ...prev,
        customerName: '',
        // Keep customerPhone for tracking purposes
        customerEmail: '',
        deliveryAddress: '',
      }));
      setShippingFee(0);
      setValidatedAddress(null);
      setAddressConfirmed(false);
    } else {
      setFormData(prev => ({
        ...prev,
        tableNumber: '',
        customerEmail: '',
      }));
      // Reset address validation when switching to delivery
      if (formData.deliveryAddress.trim() === '') {
        setValidatedAddress(null);
        setAddressConfirmed(false);
        setShippingFee(0);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOrderTypeChange = (type) => {
    setOrderType(type);
  };

  // Validate address when delivery address changes
  const handleDeliveryAddressBlur = async () => {
    if (orderType === 'delivery' && formData.deliveryAddress.trim()) {
      setValidatingAddress(true);
      setAddressConfirmed(false);
      setValidatedAddress(null);
      setShippingFee(0);
      
      try {
        // Validate and geocode address
        const validateRes = await api.post('/orders/validate-address', {
          address: formData.deliveryAddress.trim(),
        });
        
        if (validateRes.data.success) {
          setValidatedAddress(validateRes.data.data);
          // Don't auto-confirm, let user confirm manually
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error validating address:', error);
        }
        // Show error message
        if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error('Không thể xác thực địa chỉ. Vui lòng kiểm tra lại địa chỉ.');
        }
        setValidatedAddress(null);
        setAddressConfirmed(false);
      } finally {
        setValidatingAddress(false);
      }
    }
  };

  // Confirm validated address and calculate shipping
  const handleConfirmAddress = async () => {
    if (!validatedAddress || !storeAddress) return;
    
    setAddressConfirmed(true);
    setCalculatingShipping(true);
    
    try {
      // Use validated address for shipping calculation
      const distanceRes = await api.post('/orders/calculate-shipping', {
        origin: storeAddress,
        destination: validatedAddress.validatedAddress,
      });
      
      if (distanceRes.data.success) {
        setShippingFee(distanceRes.data.data.shippingFee);
        // Update form data with validated address
        setFormData(prev => ({
          ...prev,
          deliveryAddress: validatedAddress.validatedAddress
        }));
        toast.success('Địa chỉ đã được xác nhận!');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error calculating shipping:', error);
      }
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Không thể tính phí ship. Vui lòng thử lại.');
      }
      setAddressConfirmed(false);
      setShippingFee(0);
    } finally {
      setCalculatingShipping(false);
    }
  };

  // Reject validated address and let user edit
  const handleRejectAddress = () => {
    setValidatedAddress(null);
    setAddressConfirmed(false);
    setShippingFee(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation based on order type
    if (orderType === 'dine_in') {
      if (!formData.tableNumber || formData.tableNumber.trim() === '') {
        toast.error('Vui lòng nhập số bàn');
        return;
      }
      const tableNum = parseInt(formData.tableNumber.trim());
      if (isNaN(tableNum) || tableNum < 1) {
        toast.error('Số bàn phải là số nguyên dương');
        return;
      }
    } else if (orderType === 'delivery') {
      if (!formData.customerName || formData.customerName.trim() === '') {
        toast.error('Vui lòng nhập tên khách hàng');
        return;
      }
      if (!formData.customerPhone || formData.customerPhone.trim() === '') {
        toast.error('Vui lòng nhập số điện thoại');
        return;
      }
      if (!formData.deliveryAddress || formData.deliveryAddress.trim() === '') {
        toast.error('Vui lòng nhập địa chỉ giao hàng');
        return;
      }
      if (!addressConfirmed || !validatedAddress) {
        toast.error('Vui lòng xác nhận địa chỉ giao hàng trước khi đặt hàng');
        return;
      }
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

      const orderPayload = {
        storeId: parseInt(storeId),
        orderType: orderType,
        customerNote: formData.customerNote?.trim() || null,
        paymentMethod: formData.paymentMethod || 'cash',
        items: orderItems,
      };

      if (orderType === 'dine_in') {
        orderPayload.tableNumber = parseInt(formData.tableNumber.trim());
        // Include phone number if provided for tracking
        if (formData.customerPhone && formData.customerPhone.trim()) {
          orderPayload.customerPhone = formData.customerPhone.trim();
        }
      } else {
        orderPayload.customerName = formData.customerName.trim();
        orderPayload.customerPhone = formData.customerPhone.trim();
        // Use validated address if confirmed, otherwise use original
        orderPayload.deliveryAddress = addressConfirmed && validatedAddress 
          ? validatedAddress.validatedAddress 
          : formData.deliveryAddress.trim();
      }

      const res = await api.post('/orders', orderPayload);

      if (res.data.success) {
        toast.success('Đặt hàng thành công!');
        clearCart();
        // Redirect to order success page with store slug
        const storeSlug = router.query.store;
        router.push(`/order-success/${res.data.data.id}${storeSlug ? `?store=${storeSlug}` : ''}`);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Order creation error:', error);
        console.error('Error response:', error.response?.data);
      }
      
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

  const finalTotal = total + shippingFee;

  if (cartItems.length === 0) {
    return (
      <Layout>
        <Head>
          <title>Thanh toán - MenuOrder</title>
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
        <title>Thanh toán - MenuOrder</title>
      </Head>

      <div className="container-custom py-3 md:py-6 pb-6">
        <h1 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-gray-800 text-center">
          Hoàn tất thông tin để đặt hàng
        </h1>
        <div className="space-y-3 md:space-y-4">
          {/* Order Summary - Compact */}
          <div className="bg-white rounded-xl p-3 md:p-4 shadow-sm border border-purple-100">
            <h2 className="text-base md:text-lg font-bold mb-2 text-gray-800 flex items-center gap-1.5">
              <span className="text-lg">📋</span>
              Tóm tắt đơn
            </h2>

            <div className="space-y-1.5 mb-2 max-h-40 md:max-h-48 overflow-y-auto">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-start gap-2 py-1.5 border-b border-gray-100 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-xs md:text-sm truncate">{item.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-gray-500">SL: {item.quantity}</p>
                      {item.selectedAccompaniments && item.selectedAccompaniments.length > 0 && (
                        <p className="text-xs text-gray-400 truncate">
                          +{item.selectedAccompaniments.length} món kèm
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-right font-bold text-xs md:text-sm text-purple-600 whitespace-nowrap">
                    {formatVND(item.subtotal)}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-gray-200 space-y-1">
              <div className="flex justify-between text-xs md:text-sm text-gray-600">
                <span>Tạm tính:</span>
                <span className="font-semibold">{formatVND(total)}</span>
              </div>
              {orderType === 'delivery' && (
                <div className="flex justify-between text-xs md:text-sm text-gray-600">
                  <span>Phí giao hàng:</span>
                  <span className="font-semibold">
                    {shippingFee > 0 ? formatVND(shippingFee) : calculatingShipping ? 'Đang tính...' : 'Chưa tính'}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm md:text-base font-bold text-purple-600 pt-1">
                <span>Tổng cộng:</span>
                <span>{formatVND(finalTotal)}</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl p-3 md:p-4 shadow-sm border border-gray-100">
            <h2 className="text-base md:text-lg font-bold mb-3 text-gray-800 flex items-center gap-1.5">
              <span className="text-lg">👤</span>
              Thông tin đơn hàng
            </h2>

            {/* Order Type Selection */}
            <div className="mb-3">
              <label className="block mb-2 font-semibold text-sm">
                Loại đơn hàng <span className="text-red-600">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleOrderTypeChange('dine_in')}
                  className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center justify-center ${
                    orderType === 'dine_in'
                      ? 'border-purple-500 bg-purple-50 text-purple-700 font-bold shadow-sm'
                      : 'border-gray-200 bg-white active:scale-95'
                  }`}
                >
                  <div className="text-2xl md:text-3xl mb-1">🍽️</div>
                  <div className="font-semibold text-xs md:text-sm">Đặt tại quán</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleOrderTypeChange('delivery')}
                  className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center justify-center ${
                    orderType === 'delivery'
                      ? 'border-purple-500 bg-purple-50 text-purple-700 font-bold shadow-sm'
                      : 'border-gray-200 bg-white active:scale-95'
                  }`}
                >
                  <div className="text-2xl md:text-3xl mb-1">🚚</div>
                  <div className="font-semibold text-xs md:text-sm">Giao hàng</div>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Dine-in fields */}
              {orderType === 'dine_in' && (
                <>
                  <div>
                    <label className="block mb-1.5 font-semibold text-sm">
                      Nhập số bàn đang ngồi <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      name="tableNumber"
                      value={formData.tableNumber}
                      onChange={handleChange}
                      className="input-field w-full text-sm py-2.5"
                      placeholder="Nhập số bàn"
                      min="1"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1.5 font-semibold text-sm">
                      Số điện thoại <span className="text-gray-500 text-xs">(Không bắt buộc)</span>
                    </label>
                    <input
                      type="tel"
                      name="customerPhone"
                      value={formData.customerPhone}
                      onChange={handleChange}
                      className="input-field w-full text-sm py-2.5"
                      placeholder="Nên nhập số điện thoại để theo dõi đơn hàng"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Nhập số điện thoại để có thể theo dõi đơn hàng của bạn sau này
                    </p>
                  </div>
                </>
              )}

              {/* Delivery fields */}
              {orderType === 'delivery' && (
                <>
                  <div>
                    <label className="block mb-1.5 font-semibold text-sm">
                      Tên khách hàng <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleChange}
                      className="input-field w-full text-sm py-2.5"
                      placeholder="Nhập tên của bạn"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 font-semibold text-sm">
                      Số điện thoại <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="tel"
                      name="customerPhone"
                      value={formData.customerPhone}
                      onChange={handleChange}
                      className="input-field w-full text-sm py-2.5"
                      placeholder="+84-xxx-xxx-xxx"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 font-semibold text-sm">
                      Địa chỉ giao hàng <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      name="deliveryAddress"
                      value={formData.deliveryAddress}
                      onChange={(e) => {
                        handleChange(e);
                        // Reset validation when user edits
                        if (addressConfirmed || validatedAddress) {
                          setAddressConfirmed(false);
                          setValidatedAddress(null);
                          setShippingFee(0);
                        }
                      }}
                      onBlur={handleDeliveryAddressBlur}
                      className={`input-field w-full text-sm py-2.5 ${addressConfirmed ? 'border-green-500 bg-green-50' : validatedAddress ? 'border-yellow-500 bg-yellow-50' : ''}`}
                      rows="3"
                      placeholder="Số nhà, đường, phường/xã, quận/huyện, thành phố( Vui lòng nhập rõ chính xác địa chỉ để tính phí ship và giao hàng)"
                      required
                      disabled={addressConfirmed}
                    />
                    {validatingAddress && (
                      <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                        <span className="animate-spin">⏳</span>
                        Đang xác thực địa chỉ...
                      </p>
                    )}
                        
                    {/* Address validation confirmation box */}
                    {validatedAddress && !addressConfirmed && (
                      <div className="mt-2 p-2.5 bg-yellow-50 border border-yellow-400 rounded-lg">
                        <p className="text-xs font-semibold text-yellow-800 mb-1.5">
                          Địa chỉ đã được xác thực:
                        </p>
                        <p className="text-xs text-gray-700 mb-1 break-words">
                          <span className="font-medium">Hệ thống tìm thấy:</span> {validatedAddress.validatedAddress}
                        </p>
                        {validatedAddress.warning && (
                          <div className="mb-2 p-1.5 bg-red-50 border border-red-300 rounded text-xs text-red-700">
                            {validatedAddress.warning}
                          </div>
                        )}
                        <div className="flex gap-2 mt-2">
                          <button
                            type="button"
                            onClick={handleConfirmAddress}
                            disabled={calculatingShipping}
                            className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded text-xs font-semibold disabled:opacity-50"
                          >
                            {calculatingShipping ? 'Đang tính...' : '✓ Xác nhận'}
                          </button>
                          <button
                            type="button"
                            onClick={handleRejectAddress}
                            className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-xs font-semibold"
                          >
                            ✗ Sửa
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {addressConfirmed && validatedAddress && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-400 rounded-lg">
                        <p className="text-xs text-green-700 font-semibold flex items-center gap-1">
                          <span>✓</span>
                          Đã xác nhận: {validatedAddress.validatedAddress}
                        </p>
                      </div>
                    )}
                    
                    {calculatingShipping && addressConfirmed && (
                      <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                        <span className="animate-spin">⏳</span>
                        Đang tính phí ship...
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Common fields */}
              <div>
                <label className="block mb-1.5 font-semibold text-sm">Ghi chú đơn hàng</label>
                <textarea
                  name="customerNote"
                  value={formData.customerNote}
                  onChange={handleChange}
                  className="input-field w-full text-sm py-2.5"
                  rows="2"
                  placeholder="Ghi chú đặc biệt cho đơn hàng..."
                ></textarea>
              </div>

              <div>
                <label className="block mb-1.5 font-semibold text-sm">Phương thức thanh toán</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="input-field w-full text-sm py-2.5"
                >
                  <option value="cash">Tiền mặt</option>
                  <option value="bank_transfer">Chuyển khoản</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading || calculatingShipping || validatingAddress || (orderType === 'delivery' && !addressConfirmed)}
                className="btn btn-primary w-full mt-3 py-3 text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang đặt hàng...' : 'Đặt hàng ngay'}
              </button>
              {orderType === 'delivery' && !addressConfirmed && (
                <p className="text-xs text-red-600 mt-1.5 text-center">
                  ⚠️ Vui lòng xác nhận địa chỉ giao hàng
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
