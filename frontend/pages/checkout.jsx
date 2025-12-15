import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../lib/api';
import { useCart } from '../lib/store';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import { formatVND } from '../lib/utils';
import { CartIcon, DeliveryTruckIcon } from '../components/Icons';

export default function Checkout() {
  const router = useRouter();
  const { items: cartItems, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [storeId, setStoreId] = useState(null);
  const [storeAddress, setStoreAddress] = useState(null);
  const [storeInfo, setStoreInfo] = useState(null); // chứa cấu hình ZaloPay
  const [paymentAccounts, setPaymentAccounts] = useState({ bank_transfer: [], zalopay: [] });
  const [selectedPaymentAccount, setSelectedPaymentAccount] = useState(null);
  const [orderType, setOrderType] = useState('dine_in'); // 'dine_in' or 'delivery'
  const [shippingFee, setShippingFee] = useState(0);
  const [shippingCalculated, setShippingCalculated] = useState(false);
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
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherInfo, setVoucherInfo] = useState(null);
  const [applyingVoucher, setApplyingVoucher] = useState(false);
  // ZaloPay UI states
  const [showZaloPayQR, setShowZaloPayQR] = useState(false);
  const [zaloPayQRCode, setZaloPayQRCode] = useState(null);
  const [zaloPayOrderId, setZaloPayOrderId] = useState(null);
  const [checkingPayment, setCheckingPayment] = useState(false);
  // Bank Transfer QR UI states
  const [showBankTransferQR, setShowBankTransferQR] = useState(false);
  const [bankTransferQRCode, setBankTransferQRCode] = useState(null);
  const [bankTransferInfo, setBankTransferInfo] = useState(null);
  const [bankTransferOrderId, setBankTransferOrderId] = useState(null);

  useEffect(() => {
    if (!router.query.store) return;

    const fetchStoreData = async () => {
      try {
        const res = await api.get(`/stores/slug/${router.query.store}`);
        if (res.data.success) {
          const store = res.data.data.store;
          setStoreId(store.id);
          setStoreAddress(store.storeAddress);
          setStoreInfo(store);
          
          // Fetch payment accounts
          try {
            const paymentRes = await api.get(`/payment/store/${store.id}/active`);
            if (paymentRes.data.success) {
              console.log('Fetched active payment accounts:', paymentRes.data.data);
              // Log bank account numbers to verify they are complete
              if (paymentRes.data.data.bank_transfer) {
                paymentRes.data.data.bank_transfer.forEach(acc => {
                  console.log(`Bank account ${acc.id}:`, {
                    accountName: acc.accountName,
                    bankAccountNumber: acc.bankAccountNumber,
                    bankAccountNumberLength: acc.bankAccountNumber?.length,
                    bankName: acc.bankName,
                    isDefault: acc.isDefault
                  });
                });
              }
              // Ensure data structure is correct
              const paymentData = paymentRes.data.data || {};
              setPaymentAccounts({
                bank_transfer: paymentData.bank_transfer || [],
                zalopay: paymentData.zalopay || []
              });
              
              console.log('📊 Payment accounts set:', {
                bank_transfer: paymentData.bank_transfer?.length || 0,
                zalopay: paymentData.zalopay?.length || 0,
                bankAccounts: paymentData.bank_transfer,
                zaloPayAccounts: paymentData.zalopay
              });
              
              // Auto-select default accounts
              const defaultBank = paymentData.bank_transfer?.find(acc => acc.isDefault);
              const defaultZaloPay = paymentData.zalopay?.find(acc => acc.isDefault);
              
              if (defaultBank) {
                console.log('✅ Auto-selected default bank account:', defaultBank.id);
                setSelectedPaymentAccount(prev => ({ ...prev, bank_transfer: defaultBank.id }));
              } else if (paymentData.bank_transfer?.length > 0) {
                // If no default, use first account
                console.log('⚠️ No default bank account, using first account:', paymentData.bank_transfer[0].id);
                setSelectedPaymentAccount(prev => ({ ...prev, bank_transfer: paymentData.bank_transfer[0].id }));
              }
              if (defaultZaloPay) {
                setSelectedPaymentAccount(prev => ({ ...prev, zalopay: defaultZaloPay.id }));
              }
            }
          } catch (paymentError) {
            console.error('Error fetching payment accounts:', paymentError);
          }
        }
      } catch (error) {
        toast.error('Không tìm thấy cửa hàng');
        router.push('/');
      }
    };

    fetchStoreData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.store]);

  // Restore order state if orderId is in URL (for bank transfer payment)
  useEffect(() => {
    const orderId = router.query.orderId;
    if (!orderId || !storeId) return;

    const restoreOrderState = async () => {
      try {
        const orderRes = await api.get(`/orders/${orderId}`);
        if (orderRes.data.success) {
          const order = orderRes.data.data;
          
          // Only restore if order is not paid and payment method is bank_transfer_qr
          if (!order.isPaid && order.paymentMethod === 'bank_transfer_qr') {
            // Restore order state
            setBankTransferOrderId(order.id);
            setFormData(prev => ({
              ...prev,
              paymentMethod: 'bank_transfer_qr'
            }));
            
            // Get bank info from order's payment account first, then fallback to store's payment accounts
            let paymentAccountToUse = null;
            if (order.paymentAccount) {
              paymentAccountToUse = order.paymentAccount;
              setBankTransferInfo({
                accountNumber: order.paymentAccount.bankAccountNumber,
                accountName: order.paymentAccount.bankAccountName,
                bankName: order.paymentAccount.bankName
              });
            } else {
              // Fallback to store's payment accounts
              try {
                const paymentRes = await api.get(`/payment/store/${storeId}/active`);
                if (paymentRes.data.success) {
                  const paymentData = paymentRes.data.data || {};
                  paymentAccountToUse = paymentData.bank_transfer?.find(acc => acc.isDefault) || paymentData.bank_transfer?.[0];
                  
                  if (paymentAccountToUse && !bankTransferInfo) {
                    setBankTransferInfo({
                      accountNumber: paymentAccountToUse.bankAccountNumber,
                      accountName: paymentAccountToUse.bankAccountName,
                      bankName: paymentAccountToUse.bankName
                    });
                  }
                }
              } catch (error) {
                console.error('Error fetching bank info:', error);
              }
            }
            
            // Try to get QR code from order
            if (order.bankTransferQRCode) {
              setBankTransferQRCode(order.bankTransferQRCode);
            } else if (paymentAccountToUse) {
              // If QR code not in order, try to regenerate it using the payment account
              try {
                const qrRes = await api.post(`/bank-transfer/create-qr/${order.id}`, {
                  paymentAccountId: paymentAccountToUse.id
                });
                
                if (qrRes.data.success && (qrRes.data.data.qrCodeImage || qrRes.data.data.qrCode)) {
                  const qrCode = qrRes.data.data.qrCodeImage || qrRes.data.data.qrCode;
                  setBankTransferQRCode(qrCode);
                  if (qrRes.data.data.bankInfo && !bankTransferInfo) {
                    setBankTransferInfo(qrRes.data.data.bankInfo);
                  }
                }
              } catch (qrError) {
                console.error('Error regenerating QR code:', qrError);
              }
            }
          } else if (order.isPaid) {
            // Order already paid, redirect to success page
            const storeSlug = router.query.store;
            router.push(`/order-success/${order.id}${storeSlug ? `?store=${storeSlug}` : ''}`);
          }
        }
      } catch (error) {
        console.error('Error restoring order state:', error);
      }
    };

    restoreOrderState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.orderId, storeId]);

  // Reset voucher when giỏ hàng thay đổi
  useEffect(() => {
    setVoucherInfo(null);
  }, [total]);

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
      setShippingCalculated(false);
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
        setShippingCalculated(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      
      // Reset QR codes when payment method changes
      if (name === 'paymentMethod') {
        if (value !== 'zalopay_qr' && value !== 'bank_transfer_qr') {
          // Reset QR codes if switching to non-QR payment method
          setZaloPayQRCode(null);
          setZaloPayOrderId(null);
          setBankTransferQRCode(null);
          setBankTransferInfo(null);
          setBankTransferOrderId(null);
        } else if (value === 'zalopay_qr' && prev.paymentMethod === 'bank_transfer_qr') {
          // Switch from bank transfer to ZaloPay - reset bank transfer QR
          setBankTransferQRCode(null);
          setBankTransferInfo(null);
          setBankTransferOrderId(null);
        } else if (value === 'bank_transfer_qr' && prev.paymentMethod === 'zalopay_qr') {
          // Switch from ZaloPay to bank transfer - reset ZaloPay QR
          setZaloPayQRCode(null);
          setZaloPayOrderId(null);
        }
      }
      
      // Nếu chọn Bank Transfer QR: tạo preview QR ngay (không cần order)
      if (name === 'paymentMethod' && value === 'bank_transfer_qr') {
        // Delay để đảm bảo state đã cập nhật
        setTimeout(() => {
          handleGeneratePreviewQR();
        }, 100);
      }
      
      // Nếu chọn ZaloPay QR: tạo order và QR (vì ZaloPay cần order)
      if (name === 'paymentMethod' && value === 'zalopay_qr') {
        // Delay để đảm bảo state đã cập nhật
        setTimeout(() => {
          handleCreateQROrder(newData);
        }, 100);
      }
      
      return newData;
    });
  };

  // Generate preview QR code for bank transfer (without creating order)
  const handleGeneratePreviewQR = async () => {
    if (!storeId || !paymentAccounts.bank_transfer || paymentAccounts.bank_transfer.length === 0) {
      return;
    }

    if (cartItems.length === 0) {
      return;
    }

    // Prevent duplicate QR generation
    if (bankTransferQRCode) {
      return;
    }

    try {
      const defaultAccount = paymentAccounts.bank_transfer.find(acc => acc.isDefault) || paymentAccounts.bank_transfer[0];
      
      if (!defaultAccount) {
        console.error('No bank account available');
        return;
      }

      // Calculate total amount
      const subtotal = total;
      const finalTotal = subtotal + shippingFee - (voucherInfo?.discountAmount || 0);

      const qrRes = await api.post('/bank-transfer/generate-preview-qr', {
        storeId: parseInt(storeId),
        amount: finalTotal,
        paymentAccountId: defaultAccount.id
      });

      if (qrRes.data.success && (qrRes.data.data.qrCodeImage || qrRes.data.data.qrCode)) {
        const qrCode = qrRes.data.data.qrCodeImage || qrRes.data.data.qrCode;
        console.log('✅ Preview QR code generated:', { 
          hasQRCode: !!qrCode, 
          qrCodeUrl: typeof qrCode === 'string' ? qrCode.substring(0, 100) : 'base64 image',
          bankInfo: qrRes.data.data.bankInfo
        });
        
        setBankTransferQRCode(qrCode);
        setBankTransferInfo(qrRes.data.data.bankInfo);
        
        // Scroll to QR code after render
        setTimeout(() => {
          const qrElement = document.querySelector('[data-qr-code="bank_transfer"]');
          if (qrElement) {
            qrElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);
      } else {
        console.error('Preview QR generation failed:', qrRes.data);
      }
    } catch (error) {
      console.error('Error generating preview QR:', error);
      if (process.env.NODE_ENV === 'development') {
        console.error('Error response:', error.response?.data);
      }
    }
  };

  // Validate form before creating order
  const validateFormForOrder = (formData) => {
    if (orderType === 'dine_in') {
      if (!formData.tableNumber || formData.tableNumber.trim() === '') {
        return { valid: false, message: 'Vui lòng nhập số bàn' };
      }
      const tableNum = parseInt(formData.tableNumber.trim());
      if (isNaN(tableNum) || tableNum < 1) {
        return { valid: false, message: 'Số bàn phải là số nguyên dương' };
      }
    } else if (orderType === 'delivery') {
      if (!formData.customerName || formData.customerName.trim() === '') {
        return { valid: false, message: 'Vui lòng nhập tên khách hàng' };
      }
      if (!formData.customerPhone || formData.customerPhone.trim() === '') {
        return { valid: false, message: 'Vui lòng nhập số điện thoại' };
      }
      if (!formData.deliveryAddress || formData.deliveryAddress.trim() === '') {
        return { valid: false, message: 'Vui lòng nhập địa chỉ giao hàng' };
      }
      if (!addressConfirmed || !validatedAddress) {
        return { valid: false, message: 'Vui lòng xác nhận địa chỉ giao hàng trước khi đặt hàng' };
      }
    }
    return { valid: true };
  };

  // Create order and QR code when QR payment method is selected
  const handleCreateQROrder = async (currentFormData) => {
    const formDataToUse = currentFormData || formData;
    
    // Validate form
    const validation = validateFormForOrder(formDataToUse);
    if (!validation.valid) {
      // Don't show error, just wait for user to fill form
      return;
    }

    if (cartItems.length === 0) {
      return;
    }

    // Prevent duplicate order creation only if order exists and is already paid
    // Allow retry if order exists but payment not confirmed
    if (formDataToUse.paymentMethod === 'zalopay_qr' && zaloPayOrderId) {
      // Check if order is already paid
      try {
        const checkRes = await api.get(`/orders/${zaloPayOrderId}`);
        if (checkRes.data.success && checkRes.data.data.isPaid) {
          return; // Order already paid, don't create duplicate
        }
      } catch (error) {
        // If check fails, allow retry
        console.error('Error checking order status:', error);
      }
    }
    
    if (formDataToUse.paymentMethod === 'bank_transfer_qr' && bankTransferOrderId) {
      // Check if order is already paid
      try {
        const checkRes = await api.get(`/orders/${bankTransferOrderId}`);
        if (checkRes.data.success && checkRes.data.data.isPaid) {
          return; // Order already paid, don't create duplicate
        }
      } catch (error) {
        // If check fails, allow retry
        console.error('Error checking order status:', error);
      }
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

      if (!storeId) {
        return;
      }

      const orderPayload = {
        storeId: parseInt(storeId),
        orderType: orderType,
        customerNote: formDataToUse.customerNote?.trim() || null,
        paymentMethod: formDataToUse.paymentMethod || 'cash',
        items: orderItems,
      };

      if (voucherInfo?.code) {
        orderPayload.voucherCode = voucherInfo.code;
      }

      if (orderType === 'dine_in') {
        orderPayload.tableNumber = parseInt(formDataToUse.tableNumber.trim());
        if (formDataToUse.customerPhone && formDataToUse.customerPhone.trim()) {
          orderPayload.customerPhone = formDataToUse.customerPhone.trim();
        }
      } else {
        orderPayload.customerName = formDataToUse.customerName.trim();
        orderPayload.customerPhone = formDataToUse.customerPhone.trim();
        orderPayload.deliveryAddress = addressConfirmed && validatedAddress 
          ? validatedAddress.validatedAddress 
          : formDataToUse.deliveryAddress.trim();
      }

      const res = await api.post('/orders', orderPayload);

      if (res.data.success) {
        const newOrderId = res.data.data.id;

        // Nếu chọn ZaloPay QR: tạo QR sau khi tạo order
        if (formDataToUse.paymentMethod === 'zalopay_qr') {
          try {
            // Reset old QR codes first
            setBankTransferQRCode(null);
            setBankTransferInfo(null);
            setBankTransferOrderId(null);
            
            const paymentAccountId = selectedPaymentAccount?.zalopay || 
              paymentAccounts.zalopay.find(acc => acc.isDefault)?.id ||
              paymentAccounts.zalopay[0]?.id;
            
            if (!paymentAccountId) {
              toast.error('Không tìm thấy tài khoản ZaloPay. Vui lòng thử lại.');
              return;
            }
              
            const qrRes = await api.post(`/zalopay/create-qr/${newOrderId}`, {
              paymentAccountId
            });
            
            if (qrRes.data.success && (qrRes.data.data.qrCodeImage || qrRes.data.data.qrCode)) {
              const qrCode = qrRes.data.data.qrCodeImage || qrRes.data.data.qrCode;
              console.log('ZaloPay QR created successfully:', { orderId: newOrderId, hasQRCode: !!qrCode, qrCodeUrl: qrCode?.substring(0, 100) });
              setZaloPayQRCode(qrCode);
              setZaloPayOrderId(newOrderId);
              
              // Scroll to QR code sau khi đã render
              setTimeout(() => {
                const qrElement = document.querySelector('[data-qr-code="zalopay"]');
                if (qrElement) {
                  qrElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                  console.warn('QR code element not found for scrolling');
                }
              }, 300);
              
              toast.success('Đã tạo QR ZaloPay. Quét mã để thanh toán.');
            } else {
              toast.error(qrRes.data?.message || 'Không thể tạo QR ZaloPay. Vui lòng thanh toán bằng phương thức khác.');
              console.error('ZaloPay QR creation failed:', qrRes.data);
              // Reset QR state on failure
              setZaloPayQRCode(null);
              setZaloPayOrderId(null);
            }
          } catch (error) {
            console.error('Error creating ZaloPay QR:', error);
            console.error('Error response:', error.response?.data);
            toast.error(error.response?.data?.message || 'Không thể tạo QR ZaloPay. Vui lòng thử lại.');
            // Reset QR state on error
            setZaloPayQRCode(null);
            setZaloPayOrderId(null);
          }
        }

        // Nếu chọn Bank Transfer QR: tạo QR sau khi tạo order (chỉ dùng tài khoản mặc định do chủ quán cài đặt)
        if (formDataToUse.paymentMethod === 'bank_transfer_qr') {
          try {
            // Reset old QR codes first
            setZaloPayQRCode(null);
            setZaloPayOrderId(null);
            
            // Chỉ sử dụng tài khoản mặc định (do chủ quán đã chọn trong cài đặt)
            console.log('🔍 Available bank accounts:', paymentAccounts.bank_transfer);
            const defaultAccount = paymentAccounts.bank_transfer.find(acc => acc.isDefault);
            console.log('🎯 Default account found:', defaultAccount);
            
            if (!defaultAccount) {
              console.error('❌ No default bank account found! Available accounts:', paymentAccounts.bank_transfer);
              toast.error('Cửa hàng chưa cấu hình tài khoản ngân hàng mặc định. Vui lòng liên hệ cửa hàng.');
              return;
            }
            
            console.log('✅ Using default bank account for QR (set by store owner):', {
              accountId: defaultAccount.id,
              accountName: defaultAccount.accountName,
              bankAccountNumber: defaultAccount.bankAccountNumber,
              bankAccountNumberLength: defaultAccount.bankAccountNumber?.length,
              bankName: defaultAccount.bankName,
              isDefault: defaultAccount.isDefault
            });
              
            const qrRes = await api.post(`/bank-transfer/create-qr/${newOrderId}`, {
              paymentAccountId: defaultAccount.id
            });
            
            if (qrRes.data.success && (qrRes.data.data.qrCodeImage || qrRes.data.data.qrCode)) {
              const qrCode = qrRes.data.data.qrCodeImage || qrRes.data.data.qrCode;
              console.log('Bank Transfer QR created successfully:', { 
                orderId: newOrderId, 
                hasQRCode: !!qrCode, 
                qrCodeUrl: typeof qrCode === 'string' ? qrCode.substring(0, 100) : 'base64 image',
                bankInfo: qrRes.data.data.bankInfo,
                accountNumber: qrRes.data.data.bankInfo?.accountNumber,
                accountNumberLength: qrRes.data.data.bankInfo?.accountNumber?.length
              });
              
              // Set new QR code
              setBankTransferQRCode(qrCode);
              setBankTransferInfo(qrRes.data.data.bankInfo);
              setBankTransferOrderId(newOrderId);
              
              // Update URL to include orderId for restoration on refresh
              const storeSlug = router.query.store;
              router.replace(`/checkout?store=${storeSlug}&orderId=${newOrderId}`, undefined, { shallow: true });
              
              // Scroll to QR code sau khi đã render
              setTimeout(() => {
                const qrElement = document.querySelector('[data-qr-code="bank_transfer"]');
                if (qrElement) {
                  qrElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                  console.warn('QR code element not found for scrolling');
                }
              }, 300);
              
              toast.success('Đã tạo QR chuyển khoản. Quét mã để thanh toán.');
              // Note: Không clear cart ở đây, chỉ clear khi thanh toán thành công
            } else {
              toast.error(qrRes.data?.message || 'Không thể tạo QR chuyển khoản. Vui lòng thanh toán bằng phương thức khác.');
              console.error('Bank Transfer QR creation failed:', qrRes.data);
              // Reset QR state on failure
              setBankTransferQRCode(null);
              setBankTransferInfo(null);
              setBankTransferOrderId(null);
            }
          } catch (error) {
            console.error('Error creating Bank Transfer QR:', error);
            console.error('Error response:', error.response?.data);
            toast.error(error.response?.data?.message || 'Không thể tạo QR chuyển khoản. Vui lòng thử lại.');
            // Reset QR state on error
            setBankTransferQRCode(null);
            setBankTransferInfo(null);
            setBankTransferOrderId(null);
          }
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Order creation error:', error);
      }
      toast.error(error.response?.data?.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
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
      setShippingCalculated(false);
      
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
      console.error('Error validating address:', error);
      
      // Handle network errors
      if (error.networkError || error.code === 'ECONNREFUSED' || error.message?.includes('Network Error') || error.message?.includes('ERR_NETWORK')) {
        toast.error('Không thể kết nối đến server. Vui lòng kiểm tra backend server có đang chạy không.');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.userMessage || 'Không thể xác thực địa chỉ. Vui lòng kiểm tra lại địa chỉ.');
      }
      setValidatedAddress(null);
      setAddressConfirmed(false);
      setShippingCalculated(false);
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
      
      const { success, status, shippingFee: fee = 0, message } = distanceRes.data || {};

      if (success && status === 'ok') {
        setShippingFee(fee);
        setShippingCalculated(true);
        // Update form data with validated address
        setFormData(prev => ({
          ...prev,
          deliveryAddress: validatedAddress.validatedAddress
        }));
        toast.success(message || 'Địa chỉ đã được xác nhận!');
      } else {
        toast.error(message || distanceRes.data?.message || 'Không thể tính phí ship');
        setAddressConfirmed(false);
        setShippingFee(0);
        setShippingCalculated(false);
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
      setShippingCalculated(false);
    } finally {
      setCalculatingShipping(false);
    }
  };

  // Reject validated address and let user edit
  const handleRejectAddress = () => {
    setValidatedAddress(null);
    setAddressConfirmed(false);
    setShippingFee(0);
    setShippingCalculated(false);
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      toast.error('Vui lòng nhập mã voucher');
      return;
    }
    if (!storeId) {
      toast.error('Không tìm thấy thông tin cửa hàng để áp dụng voucher');
      return;
    }

    try {
      setApplyingVoucher(true);
      const res = await api.post('/vouchers/validate', {
        code: voucherCode.trim().toUpperCase(),
        storeId,
        orderAmount: total
      });

      if (res.data.success) {
        setVoucherInfo(res.data.data);
        toast.success(res.data.message || 'Áp dụng voucher thành công!');
      }
    } catch (error) {
      setVoucherInfo(null);
      if (process.env.NODE_ENV === 'development') {
        console.error('Apply voucher error:', error);
      }
      toast.error(error.response?.data?.message || 'Voucher không hợp lệ');
    } finally {
      setApplyingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setVoucherInfo(null);
    toast('Đã huỷ voucher');
  };

  const handleCheckZaloPayStatus = async () => {
    if (!zaloPayOrderId) return;
    setCheckingPayment(true);
    try {
      // Check order status to verify payment
      const orderRes = await api.get(`/orders/${zaloPayOrderId}`);
      if (orderRes.data.success) {
        const order = orderRes.data.data;
        // Check if order is paid - this is the key check
        if (order.isPaid) {
          // Only redirect if status is confirmed or higher
          if (order.status === 'confirmed' || order.status === 'preparing' || order.status === 'ready' || order.status === 'delivered' || order.status === 'completed') {
            toast.success('Thanh toán ZaloPay thành công!');
            const storeSlug = router.query.store;
            clearCart();
            router.push(`/order-success/${zaloPayOrderId}${storeSlug ? `?store=${storeSlug}` : ''}`);
            return;
          } else {
            toast('Thanh toán đã được xác nhận, đang chờ xử lý đơn hàng...', { icon: '✅' });
          }
        } else {
          toast('Thanh toán đang chờ. Vui lòng thử lại sau vài giây.', { icon: '⏳' });
        }
      } else {
        toast.error('Không kiểm tra được trạng thái đơn hàng.');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Check ZaloPay status error:', error);
        console.error('Error response:', error.response?.data);
      }
      toast.error(error.response?.data?.message || 'Không kiểm tra được trạng thái thanh toán.');
    } finally {
      setCheckingPayment(false);
    }
  };

  // Auto-check payment status when QR is displayed
  useEffect(() => {
    if (!zaloPayOrderId || !zaloPayQRCode) return;
    
    const checkInterval = setInterval(async () => {
      try {
        // Check order status to verify payment
        const orderRes = await api.get(`/orders/${zaloPayOrderId}`);
        if (orderRes.data.success) {
          const order = orderRes.data.data;
          // Check if order is paid - this is the key check
          if (order.isPaid) {
            clearInterval(checkInterval);
            // Only redirect if status is confirmed or higher
            if (order.status === 'confirmed' || order.status === 'preparing' || order.status === 'ready' || order.status === 'delivered' || order.status === 'completed') {
              toast.success('Thanh toán ZaloPay thành công!');
              const storeSlug = router.query.store;
              clearCart();
              router.push(`/order-success/${zaloPayOrderId}${storeSlug ? `?store=${storeSlug}` : ''}`);
            } else {
              // Payment confirmed but status not updated yet, wait a bit
              console.log('Payment confirmed but status not updated yet:', order.status);
            }
          }
        }
      } catch (error) {
        // Silent fail, continue polling
        if (process.env.NODE_ENV === 'development') {
          console.error('Auto-check ZaloPay status error:', error);
        }
      }
    }, 3000); // Check every 3 seconds

    return () => clearInterval(checkInterval);
  }, [zaloPayOrderId, zaloPayQRCode, router, clearCart]);

  // Auto-check bank transfer payment status when QR is displayed (chỉ để hiển thị trạng thái, KHÔNG tự động redirect)
  // User PHẢI click "Tôi đã thanh toán" để xác nhận và redirect
  useEffect(() => {
    if (!bankTransferOrderId || !bankTransferQRCode) return;
    
    const checkInterval = setInterval(async () => {
      try {
        const res = await api.get(`/orders/${bankTransferOrderId}`);
        if (res.data.success) {
          const order = res.data.data;
          // Chỉ kiểm tra và hiển thị trạng thái, KHÔNG tự động redirect
          // User phải click "Tôi đã thanh toán" để xác nhận và redirect
          if (order.isPaid) {
            // Chỉ dừng polling, không redirect tự động
            clearInterval(checkInterval);
            // Hiển thị thông báo nhưng không redirect - user phải click nút
            toast('Thanh toán đã được xác nhận. Vui lòng bấm "Tôi đã thanh toán" để hoàn tất đơn hàng.', { 
              icon: '✅',
              duration: 5000 
            });
          }
        }
      } catch (error) {
        // Silent fail, continue polling
        if (process.env.NODE_ENV === 'development') {
          console.error('Auto-check bank transfer status error:', error);
        }
      }
    }, 5000); // Check every 5 seconds (ít thường xuyên hơn)

    return () => clearInterval(checkInterval);
  }, [bankTransferOrderId, bankTransferQRCode]);

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

      if (voucherInfo?.code) {
        orderPayload.voucherCode = voucherInfo.code;
      }

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
        const newOrderId = res.data.data.id;

        // Nếu chọn ZaloPay QR: tạo QR sau khi tạo order
        if (formData.paymentMethod === 'zalopay_qr') {
          try {
            const paymentAccountId = selectedPaymentAccount?.zalopay || 
              paymentAccounts.zalopay.find(acc => acc.isDefault)?.id ||
              paymentAccounts.zalopay[0]?.id;
              
            const qrRes = await api.post(`/zalopay/create-qr/${newOrderId}`, {
              paymentAccountId
            });
            if (qrRes.data.success) {
              setZaloPayQRCode(qrRes.data.data.qrCodeImage || qrRes.data.data.qrCode);
              setZaloPayOrderId(newOrderId);
              // Don't show modal, QR will be displayed inline below form
              clearCart();
              toast.success('Đã tạo QR ZaloPay. Quét mã để thanh toán.');
              // Auto-check payment status will start via useEffect
              return; // Don't redirect, show QR inline
            } else {
              toast.error(qrRes.data?.message || 'Không thể tạo QR ZaloPay. Vui lòng thanh toán bằng phương thức khác.');
            }
          } catch (error) {
            if (process.env.NODE_ENV === 'development') {
              console.error('Error creating ZaloPay QR:', error);
              console.error('Error response:', error.response?.data);
            }
            toast.error(error.response?.data?.message || 'Không thể tạo QR ZaloPay. Vui lòng thử lại hoặc chọn phương thức khác.');
          }
        }

        // Nếu chọn Bank Transfer QR: tạo QR sau khi tạo order
        if (formData.paymentMethod === 'bank_transfer_qr') {
          try {
            const paymentAccountId = selectedPaymentAccount?.bank_transfer || 
              paymentAccounts.bank_transfer.find(acc => acc.isDefault)?.id ||
              paymentAccounts.bank_transfer[0]?.id;
              
            const qrRes = await api.post(`/bank-transfer/create-qr/${newOrderId}`, {
              paymentAccountId
            });
            if (qrRes.data.success) {
              setBankTransferQRCode(qrRes.data.data.qrCodeImage || qrRes.data.data.qrCode);
              setBankTransferInfo(qrRes.data.data.bankInfo);
              setBankTransferOrderId(newOrderId);
              
              // Update URL to include orderId for restoration on refresh
              const storeSlug = router.query.store;
              router.replace(`/checkout?store=${storeSlug}&orderId=${newOrderId}`, undefined, { shallow: true });
              
              // Don't show modal, QR will be displayed inline below form
              // Note: Không clear cart ở đây, chỉ clear khi thanh toán thành công
              toast.success('Đã tạo QR chuyển khoản. Quét mã để thanh toán.');
              // Auto-check payment status will start via useEffect
              return; // Don't redirect, show QR inline
            } else {
              toast.error(qrRes.data?.message || 'Không thể tạo QR chuyển khoản. Vui lòng thanh toán bằng phương thức khác.');
            }
          } catch (error) {
            if (process.env.NODE_ENV === 'development') {
              console.error('Error creating Bank Transfer QR:', error);
              console.error('Error response:', error.response?.data);
            }
            toast.error(error.response?.data?.message || 'Không thể tạo QR chuyển khoản. Vui lòng thử lại hoặc chọn phương thức khác.');
          }
        }

        // Default flow cho các phương thức khác (cash, bank_transfer manual)
        // Chỉ redirect nếu không phải QR payment (vì QR payment đã được xử lý ở trên)
        if (formData.paymentMethod !== 'zalopay_qr' && formData.paymentMethod !== 'bank_transfer_qr') {
        toast.success('Đặt hàng thành công!');
        clearCart();
        const storeSlug = router.query.store;
        router.push(`/order-success/${newOrderId}${storeSlug ? `?store=${storeSlug}` : ''}`);
        }
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

  const discountAmount = voucherInfo?.discountAmount ? Number(voucherInfo.discountAmount) : 0;
  const finalTotal = Math.max(0, total - discountAmount) + shippingFee;

  // Don't show empty cart message if there's an active order waiting for payment
  const hasActiveOrder = bankTransferOrderId || zaloPayOrderId;
  
  if (cartItems.length === 0 && !hasActiveOrder) {
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
          <div className="bg-white rounded-xl p-3 md:p-4 shadow-sm border border-purple-100 card-glow">
            <h2 className="text-base md:text-lg font-bold mb-2 text-gray-800 flex items-center gap-1.5">
              <div className="icon-wrapper text-purple-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
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

            <div className="mt-3">
              <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1">
                Nhập mã voucher (nếu có)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  className="input-field flex-1 uppercase"
                  placeholder="VD: GIAM20"
                  maxLength={20}
                />
                {voucherInfo ? (
                  <button
                    type="button"
                    onClick={handleRemoveVoucher}
                    className="px-4 py-2 rounded-lg bg-gray-200 font-semibold text-sm hover:bg-gray-300 transition"
                  >
                    Huỷ
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleApplyVoucher}
                    disabled={applyingVoucher || !storeId}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm bg-purple-600 text-white hover:bg-purple-700 transition ${
                      applyingVoucher ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                  >
                    {applyingVoucher ? 'Đang áp dụng...' : 'Áp dụng'}
                  </button>
                )}
              </div>
              {voucherInfo && (
                <p className="text-xs text-green-600 mt-1">
                  Voucher {voucherInfo.code} giảm {formatVND(discountAmount)}
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-gray-200 space-y-1">
              <div className="flex justify-between text-xs md:text-sm text-gray-600">
                <span>Tạm tính:</span>
                <span className="font-semibold">{formatVND(total)}</span>
              </div>
              {voucherInfo && (
                <div className="flex justify-between text-xs md:text-sm text-green-600">
                  <span>Voucher ({voucherInfo.code}):</span>
                  <span>-{formatVND(discountAmount)}</span>
                </div>
              )}
              {orderType === 'delivery' && (
                <div className="flex justify-between text-xs md:text-sm text-gray-600">
                  <span>Phí giao hàng:</span>
                  <span className="font-semibold">
                    {calculatingShipping
                      ? 'Đang tính...'
                      : shippingCalculated
                        ? formatVND(shippingFee)
                        : 'Chưa tính'}
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
          <div className="bg-white rounded-xl p-3 md:p-4 shadow-sm border border-gray-100 card-glow">
            <h2 className="text-base md:text-lg font-bold mb-3 text-gray-800 flex items-center gap-1.5">
              <div className="icon-wrapper text-purple-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
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
                  <div className="mb-1">
                    <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
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
                  <div className="mb-1">
                    <DeliveryTruckIcon className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
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
                      setShippingCalculated(false);
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
                  {paymentAccounts?.bank_transfer && Array.isArray(paymentAccounts.bank_transfer) && paymentAccounts.bank_transfer.length > 0 && (
                    <option value="bank_transfer_qr">Chuyển khoản</option>
                )}
                </select>
                
                {/* Show message if no bank account available */}
                {(!paymentAccounts?.bank_transfer || paymentAccounts.bank_transfer.length === 0) && (
                  <p className="mt-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
                    ⚠️ Cửa hàng chưa cấu hình tài khoản ngân hàng. Vui lòng chọn "Tiền mặt".
                </p>
              )}
                
                {/* Debug info in development */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-1 text-xs text-gray-400">
                    Debug: Bank: {paymentAccounts?.bank_transfer?.length || 0}
                    {paymentAccounts?.bank_transfer && paymentAccounts.bank_transfer.length > 0 && (
                      <span className="ml-2">
                        Accounts: {paymentAccounts.bank_transfer.map(acc => `${acc.accountName} (${acc.isDefault ? 'default' : 'not default'})`).join(', ')}
                      </span>
                    )}
          </div>
                )}
                
                {/* Account selection for ZaloPay - Only show if QR not yet created */}
                {formData.paymentMethod === 'zalopay_qr' && paymentAccounts.zalopay && paymentAccounts.zalopay.length > 0 && !zaloPayQRCode && (
                  <div className="mt-2">
                    <label className="block mb-1.5 text-xs font-semibold text-gray-700">Chọn tài khoản ZaloPay</label>
                    <select
                      value={selectedPaymentAccount?.zalopay || paymentAccounts.zalopay.find(acc => acc.isDefault)?.id || paymentAccounts.zalopay[0]?.id || ''}
                      onChange={(e) => setSelectedPaymentAccount(prev => ({ ...prev, zalopay: parseInt(e.target.value) }))}
                      className="input-field w-full text-sm py-2"
                    >
                      {paymentAccounts.zalopay.map(acc => (
                        <option key={acc.id} value={acc.id}>
                          {acc.accountName} {acc.isDefault ? '(Mặc định)' : ''}
                        </option>
                      ))}
                    </select>
              </div>
                )}

                {/* Info about bank transfer account - Show when selected but QR not yet created */}
                {formData.paymentMethod === 'bank_transfer_qr' && paymentAccounts.bank_transfer && paymentAccounts.bank_transfer.length > 0 && !bankTransferQRCode && (
                  <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
                    <p className="font-bold text-sm text-blue-900 mb-2">💳 Thông tin tài khoản thanh toán:</p>
                    {(() => {
                      const defaultAccount = paymentAccounts.bank_transfer.find(acc => acc.isDefault);
                      const accountToUse = defaultAccount || paymentAccounts.bank_transfer[0];
                      if (accountToUse) {
                        return (
                          <div className="space-y-1 text-sm">
                            <p><strong>Ngân hàng:</strong> <span className="font-semibold text-gray-800">{accountToUse.bankName}</span></p>
                            <p><strong>Số tài khoản:</strong> <span className="font-mono font-bold text-gray-800">{accountToUse.bankAccountNumber}</span></p>
                            <p><strong>Chủ tài khoản:</strong> <span className="font-semibold text-gray-800">{accountToUse.bankAccountName}</span></p>
                            <p className="text-xs text-blue-700 mt-2">
                              📱 Đang tạo mã QR...
                            </p>
            </div>
                        );
                      }
                      return <p className="text-red-600">Cửa hàng chưa cấu hình tài khoản ngân hàng</p>;
                    })()}
        </div>
      )}

                {/* Display QR Code - Show right after account info */}
                {formData.paymentMethod === 'bank_transfer_qr' && bankTransferQRCode && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl" data-qr-code="bank_transfer">
                    <h4 className="text-sm font-bold text-blue-700 mb-2 text-center">📱 Mã QR Chuyển khoản</h4>
                    <p className="text-xs text-gray-600 text-center mb-3">
                      Quét mã bằng app ngân hàng. Số tiền và nội dung sẽ tự động điền.
                    </p>
                    <div className="flex flex-col items-center mb-3">
                      <div className="bg-white p-3 rounded-lg border-2 border-blue-300 shadow-lg">
                  <img
                    src={bankTransferQRCode}
                          alt="Bank Transfer QR Code"
                          className="w-56 h-56 mx-auto object-contain"
                  />
                </div>
                {bankTransferInfo && (
                        <div className="text-xs text-gray-700 space-y-1 text-center mt-3 bg-white/50 px-3 py-2 rounded-lg">
                          <p><strong>STK:</strong> <span className="font-mono">{bankTransferInfo.accountNumber}</span></p>
                    <p><strong>CTK:</strong> {bankTransferInfo.accountName}</p>
                    <p><strong>NH:</strong> {bankTransferInfo.bankName}</p>
                  </div>
                )}
              </div>
                    
                    {/* Show confirm payment button only if order has been created */}
                    {bankTransferOrderId && (
                      <div className="text-center mt-4 pt-4 border-t border-blue-200">
                        <p className="text-xs text-gray-600 mb-2 font-semibold">
                          ⚠️ QUAN TRỌNG: Sau khi chuyển khoản, vui lòng bấm nút bên dưới để xác nhận thanh toán.
                        </p>
                        <p className="text-xs text-blue-600 mb-3">
                          💡 Hệ thống đang tự động kiểm tra thanh toán. Sau khi chuyển khoản thành công, vui lòng bấm "Tôi đã thanh toán" để hoàn tất đơn hàng.
                        </p>
              <button
                          type="button"
                onClick={async () => {
                  // Kiểm tra lại trạng thái đơn hàng trước khi xác nhận
                  try {
                    const checkRes = await api.get(`/orders/${bankTransferOrderId}`);
                    if (checkRes.data.success) {
                      const order = checkRes.data.data;
                      
                      // Kiểm tra xem đơn hàng đã được thanh toán chưa (từ hệ thống tự động hoặc admin)
                      if (order.isPaid) {
                        toast.success('Đơn hàng đã được xác nhận thanh toán!');
                        clearCart();
                        const storeSlug = router.query.store;
                        router.push(`/order-success/${bankTransferOrderId}${storeSlug ? `?store=${storeSlug}` : ''}`);
                        return;
                      }
                      
                      // Nếu chưa thanh toán, hiển thị cảnh báo và yêu cầu xác nhận
                      const confirmed = window.confirm(
                        '⚠️ XÁC NHẬN QUAN TRỌNG:\n\n' +
                        'Bạn đã thực sự chuyển khoản thành công chưa?\n\n' +
                        'Vui lòng đảm bảo:\n' +
                        '1. Bạn đã quét mã QR và chuyển khoản đúng số tiền\n' +
                        '2. Bạn đã nhập đúng nội dung chuyển khoản\n' +
                        '3. Giao dịch đã thành công trên app ngân hàng\n\n' +
                        'Nếu bạn chưa chuyển khoản, vui lòng bấm "Hủy" và thực hiện chuyển khoản trước.\n\n' +
                        'Nếu bạn đã chuyển khoản, bấm "OK" để xác nhận.'
                      );
                      
                      if (!confirmed) {
                        return;
                      }
                      
                      // Xác nhận lần 2 để chắc chắn
                      const confirmed2 = window.confirm(
                        'Xác nhận lần cuối:\n\n' +
                        'Bạn CHẮC CHẮN đã chuyển khoản thành công?\n\n' +
                        'Lưu ý: Đơn hàng sẽ được gửi đến cửa hàng và cửa hàng sẽ kiểm tra lại thanh toán.\n' +
                        'Nếu không có thanh toán, đơn hàng có thể bị hủy.'
                      );
                      
                      if (!confirmed2) {
                        return;
                      }
                    }
                  } catch (checkError) {
                    console.error('Error checking order status:', checkError);
                    toast.error('Không thể kiểm tra trạng thái đơn hàng. Vui lòng thử lại.');
                    return;
                  }
                  
                  try {
                    setCheckingPayment(true);
                    const res = await api.post(`/bank-transfer/confirm-payment/${bankTransferOrderId}`);
                    if (res.data.success) {
                                // Check if order was actually paid or just confirmed by customer
                                if (res.data.data.isPaid) {
                                  // Order already paid (from previous confirmation or admin)
                                  toast.success('Đơn hàng đã được xác nhận thanh toán!');
                                  clearCart();
                                  const storeSlug = router.query.store;
                                  router.push(`/order-success/${bankTransferOrderId}${storeSlug ? `?store=${storeSlug}` : ''}`);
                                } else {
                                  // Customer confirmation sent, waiting for store verification
                                  // KHÔNG redirect đến order-success, chỉ hiển thị thông báo
                                  toast.success(res.data.message || 'Đã gửi xác nhận thanh toán! Cửa hàng sẽ kiểm tra và xác nhận đơn hàng của bạn.', {
                                    duration: 5000
                                  });
                                  // Hiển thị thông báo rõ ràng rằng đơn hàng chưa được xác nhận
                                  toast('⚠️ Lưu ý: Đơn hàng của bạn đang chờ cửa hàng xác minh thanh toán. Bạn có thể theo dõi trạng thái đơn hàng sau.', {
                                    icon: 'ℹ️',
                                    duration: 6000
                                  });
                                  // KHÔNG clear cart và KHÔNG redirect - để người dùng có thể theo dõi
                                  // clearCart(); // Comment out - không clear cart khi chưa thanh toán thực sự
                                  // router.push(...); // Comment out - không redirect khi chưa thanh toán thực sự
                                }
                              } else {
                                toast.error(res.data.message || 'Xác nhận thanh toán thất bại');
                    }
                  } catch (error) {
                              console.error('Confirm payment error:', error);
                              const errorMessage = error.response?.data?.message || 'Xác nhận thanh toán thất bại. Vui lòng thử lại.';
                              toast.error(errorMessage);
                            } finally {
                              setCheckingPayment(false);
                            }
                          }}
                          disabled={checkingPayment}
                          className="btn btn-primary text-sm py-2 px-6 font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {checkingPayment ? 'Đang xác nhận...' : '✅ Tôi đã thanh toán'}
              </button>
            </div>
                    )}
        </div>
      )}
                

                {/* Display QR Code inline when available */}
                {formData.paymentMethod === 'zalopay_qr' && zaloPayQRCode && (
                  <div className="mt-4 p-4 bg-purple-50 border-2 border-purple-200 rounded-xl" data-qr-code="zalopay">
                    <h4 className="text-sm font-bold text-purple-700 mb-2 text-center">Mã QR ZaloPay</h4>
                    <p className="text-xs text-gray-600 text-center mb-3">
                      Quét mã bằng ZaloPay. Số tiền sẽ tự động điền.
                    </p>
                    <div className="flex justify-center mb-3">
                <img
                  src={zaloPayQRCode}
                        alt="ZaloPay QR Code"
                        className="w-48 h-48 object-contain border-2 border-purple-300 rounded-lg bg-white p-2"
                />
                          </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-2">
                        {checkingPayment ? 'Đang kiểm tra thanh toán...' : 'Đang chờ thanh toán...'}
                      </p>
                          <button
                            type="button"
                onClick={handleCheckZaloPayStatus}
                disabled={checkingPayment}
                        className="btn btn-primary text-sm py-2 px-4"
              >
                {checkingPayment ? 'Đang kiểm tra...' : 'Tôi đã thanh toán'}
                          </button>
                        </div>
                      </div>
                    )}
                    
                      </div>

              {/* Show order button if:
                  1. Not using QR payment method, OR
                  2. Using QR payment but order hasn't been created yet (allow creating order), OR
                  3. Using bank_transfer_qr but order hasn't been created yet (preview QR only) */}
              {((formData.paymentMethod !== 'zalopay_qr' && formData.paymentMethod !== 'bank_transfer_qr') ||
                (formData.paymentMethod === 'zalopay_qr' && !zaloPayOrderId) ||
                (formData.paymentMethod === 'bank_transfer_qr' && !bankTransferOrderId)) && (
              <button
                type="submit"
                disabled={loading || calculatingShipping || validatingAddress || (orderType === 'delivery' && (!addressConfirmed || !shippingCalculated))}
                className="btn btn-primary w-full mt-3 py-3 text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed btn-ripple scale-on-hover"
              >
                {loading ? 'Đang đặt hàng...' : 'Đặt hàng ngay'}
              </button>
              )}
              {orderType === 'delivery' && (!addressConfirmed || !shippingCalculated) && (
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
