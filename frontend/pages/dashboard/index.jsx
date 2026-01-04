import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useStore } from '../../lib/store';
import Navbar from '../../components/Navbar';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { formatVND } from '../../lib/utils';
import { CartIcon, QRIcon, SettingsIcon, CategoryIcon, FoodIcon, DeliveryTruckIcon, TableIcon, BarChartIcon, StarIcon, ArrowRightIcon, PlusCircleIcon, EditIcon, DeleteIcon, WalletIcon, BankIcon, CheckCircleIcon, CloseIcon, RefreshIcon, SaveIcon, AlertCircleIcon, CreditCardIcon, ClockIcon, MoneyIcon } from '../../components/Icons';
import PaymentAccountManager from '../../components/PaymentAccountManager';

export default function Dashboard() {
  const router = useRouter();
  const { token, user, store, setToken, isHydrated } = useStore();
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
  const [uploadingStoreImage, setUploadingStoreImage] = useState(false);
  const [storeImagePreview, setStoreImagePreview] = useState(null);
  const [storeData, setStoreData] = useState(null); // Store data riêng cho settings tab
  const prevOrderIdsRef = useRef(new Set());
  const hasInitializedOrdersRef = useRef(false);
  // Tabs scroll controls
  const tabsRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const updateTabArrows = () => {
    const el = tabsRef.current;
    if (!el) return;
    setShowLeftArrow(el.scrollLeft > 5);
    setShowRightArrow(el.scrollWidth - el.clientWidth - el.scrollLeft > 5);
  };

  const scrollTabs = (direction) => {
    const el = tabsRef.current;
    if (!el) return;
    const amount = Math.max(el.clientWidth * 0.6, 120);
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  useEffect(() => {
    updateTabArrows();
    const onResize = () => updateTabArrows();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const [bankTransferConfig, setBankTransferConfig] = useState({
    bankAccountNumber: '',
    bankAccountName: '',
    bankName: '',
    bankCode: '',
    bankTransferQRIsActive: false
  });
  const [savingBankTransfer, setSavingBankTransfer] = useState(false);
  const [bankSearchQuery, setBankSearchQuery] = useState('');
  const [bankSearchResults, setBankSearchResults] = useState([]);
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [lookingUpAccountName, setLookingUpAccountName] = useState(false);
  const [accountNameLookupResult, setAccountNameLookupResult] = useState(null);
  const [zaloPayConfig, setZaloPayConfig] = useState({
    zaloPayAppId: '',
    zaloPayKey1: '',
    zaloPayKey2: '',
    zaloPayMerchantId: '',
    zaloPayIsActive: false,
    zaloPayLink: ''
  });
  const [savingZaloPay, setSavingZaloPay] = useState(false);
  const [verifyingZaloPay, setVerifyingZaloPay] = useState(false);
  const [zaloPayStatus, setZaloPayStatus] = useState(null); // {type: 'success'|'error', message: string}
  const [selectedDate, setSelectedDate] = useState(null); // Date for revenue cards
  const [selectedDateType, setSelectedDateType] = useState(null); // 'today', 'month', 'year'
  const [dateOrders, setDateOrders] = useState([]); // Orders for selected date
  const [showDateOrdersModal, setShowDateOrdersModal] = useState(false);
  const [loadingDateOrders, setLoadingDateOrders] = useState(false);
  const [dateRevenue, setDateRevenue] = useState(0); // Revenue for selected date
  const [storeFormData, setStoreFormData] = useState({
    storeName: '',
    storePhone: '',
    storeAddress: '',
    storeDetailedAddress: '',
    storeDescription: ''
  });
  const [savingStoreInfo, setSavingStoreInfo] = useState(false);
  const [storeVouchers, setStoreVouchers] = useState([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [creatingVoucher, setCreatingVoucher] = useState(false);
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
  const [deleteVoucherCode, setDeleteVoucherCode] = useState('');
  const [deletingByCode, setDeletingByCode] = useState(false);
  // Payment accounts management
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState(null); // 'zalopay' or 'bank'
  const [editingAccount, setEditingAccount] = useState(null); // {type: 'zalopay'|'bank', data: {...}}
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Đánh dấu đã hydrate để tránh redirect sớm khi F5
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

    console.log('✅ Authentication restored, loading dashboard data');
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, token, user]);

  const speak = (text) => {
    try {
      if (typeof window === 'undefined') return;
      const synth = window.speechSynthesis;
      if (!synth) return;
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'vi-VN';
      utter.rate = 1;
      synth.speak(utter);
    } catch (err) {
      // silent
    }
  };

  // Thông báo đơn mới đã được xử lý global ở `_app.jsx` cho mọi trang trong `/dashboard`
  // Giữ hàm trống để tránh spam thông báo/voice 2 lần (trước đây dashboard tự thông báo).
  const handleNewOrderNotification = () => {};

  const refreshOrders = async (silent = false) => {
    try {
      const ordersRes = await api.get('/orders/my-store/list?limit=50');
      if (ordersRes.data.success) {
        const list = ordersRes.data.data.orders || [];

        // Chỉ cập nhật state, không phát thông báo ở đây nữa (global notifier đã làm).
        hasInitializedOrdersRef.current = true;
        prevOrderIdsRef.current = new Set(list.map(o => o.id));
        setOrders(list);
        if (!silent) toast.success('Đã làm mới đơn hàng');
      }
    } catch (err) {
      if (!silent) {
        toast.error('Không thể làm mới đơn hàng');
      }
      if (process.env.NODE_ENV === 'development') {
        console.error('Orders refresh error:', err);
      }
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch store data (quan trọng cho logo)
      try {
        const storeRes = await api.get('/stores/my-store');
        if (storeRes.data.success) {
          // Cập nhật store trong Zustand store
          useStore.setState({ store: storeRes.data.data });
          // Cập nhật storeData cho settings tab
          setStoreData(storeRes.data.data);
          // ZaloPay config (ẩn key, chỉ điền khi người dùng nhập)
          const zp = storeRes.data.data.zaloPayConfig || {};
          setZaloPayConfig({
            zaloPayAppId: zp.appId || '',
            zaloPayKey1: '',
            zaloPayKey2: '',
            zaloPayMerchantId: zp.merchantId || '',
            zaloPayIsActive: zp.isActive || false,
            zaloPayLink: zp.link || ''
          });
          // Bank Transfer config
          const bt = storeRes.data.data.bankTransferConfig || {};
          setBankTransferConfig({
            bankAccountNumber: bt.accountNumber || '',
            bankAccountName: bt.accountName || '',
            bankName: bt.bankName || '',
            bankTransferQRIsActive: bt.isActive || false
          });
          setZaloPayStatus(null);
          // Cập nhật form data
          setStoreFormData({
            storeName: storeRes.data.data.storeName || '',
            storePhone: storeRes.data.data.storePhone || '',
            storeAddress: storeRes.data.data.storeAddress || '',
            storeDetailedAddress: storeRes.data.data.storeDetailedAddress || '',
            storeDescription: storeRes.data.data.storeDescription || ''
          });
          // Reset previews nếu có trong database
          setLogoPreview(null); // Clear preview để hiển thị logo từ DB
          setStoreImagePreview(null); // Clear preview để hiển thị storeImage từ DB
        }
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Store fetch error:', err);
        }
      }
      
      // Fetch orders (silent to tránh toast)
      await refreshOrders(true);

      // Fetch stats
      try {
        const statsRes = await api.get('/orders/my-store/stats');
        if (statsRes.data.success) {
          setStats(statsRes.data.data);
        } else {
          console.error('Stats API returned unsuccessful:', statsRes.data);
          // Set default stats if API returns unsuccessful
          setStats({ 
            totalOrders: 0, 
            pendingOrders: 0, 
            completedOrders: 0, 
            totalRevenue: 0,
            todayRevenue: 0,
            monthlyRevenue: 0,
            yearlyRevenue: 0
          });
        }
      } catch (err) {
        console.error('Stats fetch error:', err);
        if (err.response) {
          console.error('Stats API Error Response:', err.response.status, err.response.data);
          // Show error toast for non-401 errors (401 will redirect to login)
          if (err.response.status !== 401) {
            toast.error('Không thể tải thống kê: ' + (err.response.data?.message || 'Lỗi không xác định'));
          }
        } else if (err.request) {
          console.error('Stats API Request Error:', err.request);
          const apiUrl = api.defaults.baseURL || (typeof window !== 'undefined' ? window.__API_URL__ : 'Unknown');
          console.error('API URL:', apiUrl);
          console.error('Request URL:', err.config?.url);
          console.error('Full Request Config:', err.config);
          toast.error(`Không thể kết nối đến server để lấy thống kê. API: ${apiUrl}`);
        } else {
          console.error('Stats Error:', err.message);
          toast.error('Lỗi khi tải thống kê: ' + err.message);
        }
        // Set default stats if fetch fails
        setStats({ 
          totalOrders: 0, 
          pendingOrders: 0, 
          completedOrders: 0, 
          totalRevenue: 0,
          todayRevenue: 0,
          monthlyRevenue: 0,
          yearlyRevenue: 0
        });
      }

      // Fetch QR code
      try {
        const qrRes = await api.get('/qr/my-store');
        if (qrRes.data.success) {
          setQrCode(qrRes.data.data.qrCode);
        }
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('QR code fetch error:', err);
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Dashboard data error:', error);
      }
      toast.error('Không thể tải một số dữ liệu bảng điều khiển');
    } finally {
      setLoading(false);
    }
  };

  // Polling đơn hàng mới mỗi 10s (silent) để hiện thông báo nếu có đơn mới
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      refreshOrders(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [token]);

  const fetchStoreVouchers = async () => {
    try {
      setLoadingVouchers(true);
      const res = await api.get('/vouchers/my-store');
      if (res.data.success) {
        setStoreVouchers(res.data.data || []);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Fetch vouchers error:', error);
      }
      toast.error('Không thể tải danh sách voucher');
    } finally {
      setLoadingVouchers(false);
    }
  };

  const handleLookupAccountName = async (accountNumber, bankCode) => {
    if (!accountNumber || !bankCode || accountNumber.length < 8) {
      return;
    }

    try {
      setLookingUpAccountName(true);
      setAccountNameLookupResult(null);
      
      const res = await api.get(`/bank-transfer/lookup-account-name?accountNumber=${encodeURIComponent(accountNumber)}&bankCode=${encodeURIComponent(bankCode)}`);
      
      if (res.data.success && res.data.accountName) {
        // Successfully found account name
        setBankTransferConfig(prev => ({
          ...prev,
          bankAccountName: res.data.accountName
        }));
        setAccountNameLookupResult({
          success: true,
          message: `Đã tìm thấy: ${res.data.accountName}`,
          accountName: res.data.accountName
        });
      } else {
        // Lookup not available or not found
        setAccountNameLookupResult({
          success: false,
          message: res.data.message || 'Không thể tra cứu tự động. Vui lòng nhập tên chủ tài khoản thủ công.'
        });
      }
    } catch (error) {
      setAccountNameLookupResult({
        success: false,
        message: 'Không thể tra cứu tự động. Vui lòng nhập tên chủ tài khoản thủ công.'
      });
      if (process.env.NODE_ENV === 'development') {
        console.error('Lookup account name error:', error);
      }
    } finally {
      setLookingUpAccountName(false);
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
      toast.error('Vui lòng nhập giá trị giảm hợp lệ');
      return;
    }
    try {
      setCreatingVoucher(true);
      const payload = {
        ...voucherForm,
        code: voucherForm.code.trim(),
        discountValue: Number(voucherForm.discountValue),
        minOrderAmount: voucherForm.minOrderAmount ? Number(voucherForm.minOrderAmount) : 0,
        maxDiscountAmount: voucherForm.maxDiscountAmount ? Number(voucherForm.maxDiscountAmount) : undefined,
        description: voucherForm.description?.trim() || undefined,
        startsAt: voucherForm.startsAt || null,
        expiresAt: voucherForm.neverExpires ? null : voucherForm.expiresAt || null,
        usageLimit: voucherForm.usageLimit ? Number(voucherForm.usageLimit) : null
      };
      await api.post('/vouchers/my-store', payload);
      toast.success('Đã tạo voucher mới!');
      resetVoucherForm();
      fetchStoreVouchers();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Create voucher error:', error);
      }
      toast.error(error.response?.data?.message || 'Không thể tạo voucher');
    } finally {
      setCreatingVoucher(false);
    }
  };

  const handleDeleteVoucher = async (voucherId) => {
    if (!voucherId) return;
    try {
      await api.delete(`/vouchers/my-store/${voucherId}`);
      toast.success('Đã xoá voucher');
      fetchStoreVouchers();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Delete voucher error:', error);
      }
      toast.error(error.response?.data?.message || 'Không thể xoá voucher');
    }
  };

  const handleDeleteVoucherByCode = async (e) => {
    e.preventDefault();
    if (!deleteVoucherCode.trim()) {
      toast.error('Vui lòng nhập mã voucher cần xoá');
      return;
    }
    try {
      setDeletingByCode(true);
      await api.delete(`/vouchers/my-store/code/${deleteVoucherCode.trim()}`);
      toast.success('Đã xoá voucher theo mã');
      setDeleteVoucherCode('');
      fetchStoreVouchers();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Delete voucher by code error:', error);
      }
      toast.error(error.response?.data?.message || 'Không thể xoá voucher');
    } finally {
      setDeletingByCode(false);
    }
  };

  const handleToggleVoucherActive = async (voucher) => {
    try {
      await api.put(`/vouchers/my-store/${voucher.id}`, {
        isActive: !voucher.isActive
      });
      toast.success('Đã cập nhật trạng thái voucher');
      fetchStoreVouchers();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Toggle voucher error:', error);
      }
      toast.error(error.response?.data?.message || 'Không thể cập nhật voucher');
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    // Tìm đơn hàng để kiểm tra trạng thái hiện tại
    const order = orders.find(o => o.id === orderId);
    
    // Không cho phép thay đổi trạng thái nếu đơn đã hủy hoặc hoàn tất
    if (order && (order.status === 'cancelled' || order.status === 'completed')) {
      toast.error('Không thể thay đổi trạng thái đơn hàng đã hủy hoặc hoàn tất');
      // Reset select về giá trị cũ
      fetchData();
      return;
    }
    
    // Kiểm tra cả orderDetail nếu đang mở
    if (orderDetail && orderDetail.id === orderId && 
        (orderDetail.status === 'cancelled' || orderDetail.status === 'completed')) {
      toast.error('Không thể thay đổi trạng thái đơn hàng đã hủy hoặc hoàn tất');
      fetchData();
      return;
    }
    
    // Payload: khi chuyển sang "Đã xác nhận" => coi như đã nhận tiền
    const payload = { status: newStatus };
    if (newStatus === 'confirmed') {
      payload.isPaid = true;
    }
    
    try {
      const res = await api.put(`/orders/${orderId}/status`, payload);
      if (res.data.success) {
        toast.success('Cập nhật trạng thái đơn hàng thành công');
        fetchData();
        if (selectedOrder === orderId) {
          fetchOrderDetail(orderId);
        }
      }
    } catch (error) {
      toast.error('Cập nhật trạng thái đơn hàng thất bại');
      // Reset select về giá trị cũ nếu có lỗi
      fetchData();
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
      toast.error('Không thể tải chi tiết đơn hàng');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleOrderClick = (order) => {
    // Cho phép xem chi tiết đơn hàng (kể cả đã hủy hoặc hoàn tất)
    setSelectedOrder(order.id);
    fetchOrderDetail(order.id);
  };

  const closeOrderDetail = () => {
    setSelectedOrder(null);
    setOrderDetail(null);
  };

  // Fetch orders by date (only completed orders for revenue calculation)
  const fetchOrdersByDate = async (date) => {
    try {
      setLoadingDateOrders(true);
      const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
      const res = await api.get(`/orders/my-store/list?date=${dateStr}&limit=1000`);
      if (res.data.success) {
        const orders = res.data.data.orders || [];
        setDateOrders(orders);
        // Calculate total revenue for the date - ONLY completed orders (paid)
        const revenue = orders
          .filter(order => order.status === 'completed')
          .reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0);
        setDateRevenue(revenue);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching orders by date:', error);
      }
      toast.error('Không thể tải đơn hàng theo ngày');
    } finally {
      setLoadingDateOrders(false);
    }
  };

  // Handle click on revenue card
  const handleRevenueCardClick = async (type) => {
    let dateToShow;
    if (type === 'today') {
      dateToShow = new Date();
      setSelectedDate(dateToShow);
      setSelectedDateType('today');
      await fetchOrdersByDate(dateToShow);
      setShowDateOrdersModal(true);
    } else if (type === 'month') {
      // Show date picker for month - limit to current month
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      const input = document.createElement('input');
      input.type = 'date';
      input.min = firstDayOfMonth.toISOString().split('T')[0];
      input.max = lastDayOfMonth.toISOString().split('T')[0];
      input.onchange = async (e) => {
        if (e.target.value) {
          dateToShow = new Date(e.target.value);
          setSelectedDate(dateToShow);
          setSelectedDateType('month');
          await fetchOrdersByDate(dateToShow);
          setShowDateOrdersModal(true);
        }
      };
      input.click();
      return;
    } else if (type === 'year') {
      // Show date picker for year - limit to current year
      const today = new Date();
      const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
      const lastDayOfYear = new Date(today.getFullYear(), 11, 31);
      
      const input = document.createElement('input');
      input.type = 'date';
      input.min = firstDayOfYear.toISOString().split('T')[0];
      input.max = lastDayOfYear.toISOString().split('T')[0];
      input.onchange = async (e) => {
        if (e.target.value) {
          dateToShow = new Date(e.target.value);
          setSelectedDate(dateToShow);
          setSelectedDateType('year');
          await fetchOrdersByDate(dateToShow);
          setShowDateOrdersModal(true);
        }
      };
      input.click();
      return;
    }
  };

  const handleStoreImageUpload = async (e) => {
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
      setStoreImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload
    setUploadingStoreImage(true);
    try {
      const formData = new FormData();
      formData.append('storeImage', file);

      const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5002';
      const response = await fetch(`${API_BASE}/api/stores/my-store/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Upload hình ảnh quán thành công!');
        // Reload store data
        const storeRes = await api.get('/stores/my-store');
        if (storeRes.data.success) {
          useStore.setState({ store: storeRes.data.data });
          setStoreData(storeRes.data.data);
          setStoreImagePreview(null);
        }
      } else {
        toast.error(data.message || 'Upload hình ảnh thất bại!');
        setStoreImagePreview(null);
      }
    } catch (error) {
      console.error('Upload store image error:', error);
      toast.error('Upload hình ảnh thất bại!');
      setStoreImagePreview(null);
    } finally {
      setUploadingStoreImage(false);
      // Reset input
      e.target.value = '';
    }
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

      const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5002';
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
          // Cập nhật store trong Zustand
          useStore.setState({ store: storeRes.data.data });
          // Cập nhật storeData cho settings tab
          setStoreData(storeRes.data.data);
          // Clear preview để hiển thị logo từ DB
          setLogoPreview(null);
        }
      } else {
        toast.error(data.message || 'Upload logo thất bại!');
        setLogoPreview(null);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Upload logo error:', error);
      }
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
      <>
        <Head>
          <title>Bảng điều khiển - MenuOrder</title>
        </Head>
        <Navbar />

      <div className="container-custom px-3 md:px-6 py-8">
        {/* Header */}
        <div className="mb-8 gradient-teal text-white p-5 md:p-8 rounded-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-20"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white bg-opacity-10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">Chào mừng, {user?.storeName}</h1>
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 mt-3">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <p className="text-sm text-white font-medium mb-1">Slug cửa hàng</p>
                <p className="font-bold text-white">{store?.storeSlug}</p>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <p className="text-sm text-white font-medium mb-1">URL cửa hàng</p>
                <p className="font-bold text-white text-sm break-all">
                  {typeof window !== 'undefined' && `${window.location.origin}/store/${store?.storeSlug}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs - full width bar (outside header container) */}
      <div className="w-full">
        <div className="relative overflow-x-auto px-3 md:px-6">
          <div className="container-custom">
          {/* Tabs */}
          <div className="relative overflow-x-auto px-0">
          {/* gradient edges as swipe hint */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-white to-transparent hidden sm:block" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white to-transparent hidden sm:block" />

          <div
            ref={tabsRef}
            onScroll={updateTabArrows}
            className="flex tabs-scroll gap-2 md:gap-3 lg:gap-4 mb-3 md:mb-6 border border-gray-200 bg-white/80 backdrop-blur rounded-xl px-2 py-2 shadow-sm overflow-x-auto"
          >
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 md:px-4 py-2 text-xs sm:text-sm md:text-base font-semibold transition flex items-center gap-2 whitespace-nowrap rounded-lg ${
              activeTab === 'overview'
                ? 'bg-purple-100 text-purple-700 shadow-inner'
                : 'text-gray-800 hover:bg-gray-100'
            }`}
          >
            <BarChartIcon className="w-5 h-5" />
            Tổng quan
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 md:px-4 py-2 text-xs sm:text-sm md:text-base font-semibold transition flex items-center gap-2 whitespace-nowrap rounded-lg ${
              activeTab === 'orders'
                ? 'bg-purple-100 text-purple-700 shadow-inner'
                : 'text-gray-800 hover:bg-gray-100'
            }`}
          >
            <CartIcon className="w-5 h-5" />
            Đơn hàng
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-3 md:px-4 py-2 text-xs sm:text-sm md:text-base font-semibold transition flex items-center gap-2 whitespace-nowrap rounded-lg ${
              activeTab === 'menu'
                ? 'bg-purple-100 text-purple-700 shadow-inner'
                : 'text-gray-800 hover:bg-gray-100'
            }`}
          >
            <CategoryIcon className="w-5 h-5" />
            Quản lý Menu
          </button>
          <Link
            href="/dashboard/reviews"
            className={`px-3 md:px-4 py-2 text-xs sm:text-sm md:text-base font-semibold transition flex items-center gap-2 whitespace-nowrap rounded-lg ${
              router.pathname === '/dashboard/reviews'
                ? 'bg-purple-100 text-purple-700 shadow-inner'
                : 'text-gray-800 hover:bg-gray-100'
            }`}
          >
            <StarIcon className="w-5 h-5" />
            Đánh Giá
          </Link>
          <button
            onClick={() => setActiveTab('qr')}
            className={`px-3 md:px-4 py-2 text-xs sm:text-sm md:text-base font-semibold transition flex items-center gap-2 whitespace-nowrap rounded-lg ${
              activeTab === 'qr'
                ? 'bg-purple-100 text-purple-700 shadow-inner'
                : 'text-gray-800 hover:bg-gray-100'
            }`}
          >
            <QRIcon className="w-5 h-5" />
            Mã QR
          </button>
          <button
            onClick={async () => {
              setActiveTab('settings');
              // Fetch store data khi vào tab settings để có logo mới nhất
              try {
                const storeRes = await api.get('/stores/my-store');
                if (storeRes.data.success) {
                  setStoreData(storeRes.data.data);
                  useStore.setState({ store: storeRes.data.data });
                  setStoreFormData({
                    storeName: storeRes.data.data.storeName || '',
                    storePhone: storeRes.data.data.storePhone || '',
                    storeAddress: storeRes.data.data.storeAddress || '',
                    storeDetailedAddress: storeRes.data.data.storeDetailedAddress || '',
                    storeDescription: storeRes.data.data.storeDescription || ''
                  });
                  setLogoPreview(null); // Clear preview
                await fetchStoreVouchers();
                }
              } catch (err) {
                if (process.env.NODE_ENV === 'development') {
                  console.error('Fetch store data error:', err);
                }
              }
            }}
            className={`px-3 md:px-4 py-2 text-xs sm:text-sm md:text-base font-semibold transition flex items-center gap-2 whitespace-nowrap rounded-lg ${
              activeTab === 'settings'
                ? 'bg-purple-100 text-purple-700 shadow-inner'
                : 'text-gray-800 hover:bg-gray-100'
            }`}
          >
            <SettingsIcon className="w-5 h-5" />
            Cài đặt
          </button>
          </div>

          {/* Left / Right arrows for small screens when tabs overflow */}
          {showLeftArrow && (
            <button
              aria-label="scroll left"
              onClick={() => scrollTabs('left')}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center md:hidden"
            >
              <ArrowRightIcon className="w-4 h-4 transform -rotate-180 text-gray-600" />
            </button>
          )}

          {showRightArrow && (
            <button
              aria-label="scroll right"
              onClick={() => scrollTabs('right')}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center md:hidden"
            >
              <ArrowRightIcon className="w-4 h-4 text-gray-600" />
            </button>
          )}

          {/* swipe hint for small screens */}
         
          </div>
          </div>
        </div>
      </div>

      {/* Overview Tab */}
      <div className="container-custom px-3 md:px-6 py-8">
        {activeTab === 'overview' && stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="card group relative overflow-hidden card-glow hover-lift stagger-item">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-gray-600 font-semibold">Tổng đơn hàng</h3>
                    <div className="icon-wrapper text-blue-600 transform group-hover:scale-110 transition-transform">
                      <CartIcon className="w-6 h-6" />
                    </div>
                  </div>
                  <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent count-up">{stats.totalOrders}</p>
                </div>
              </div>
              <div className="card group relative overflow-hidden card-glow hover-lift stagger-item">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-gray-600 font-semibold">Đơn chờ xử lý</h3>
                    <div className="icon-wrapper text-yellow-600 transform group-hover:scale-110 transition-transform">
                      <ClockIcon className="w-6 h-6" />
                    </div>
                  </div>
                  <p className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-400 bg-clip-text text-transparent count-up">{stats.pendingOrders}</p>
                </div>
              </div>
              <div className="card group relative overflow-hidden card-glow hover-lift stagger-item">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-gray-600 font-semibold">Đơn hoàn thành</h3>
                    <div className="icon-wrapper text-green-600 transform group-hover:scale-110 transition-transform">
                      <CheckCircleIcon className="w-6 h-6" />
                    </div>
                  </div>
                  <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent count-up">{stats.completedOrders}</p>
                </div>
              </div>
              <div 
                className="card group relative overflow-hidden cursor-pointer hover:shadow-lg transition-shadow card-glow hover-lift stagger-item"
                onClick={() => handleRevenueCardClick('today')}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-gray-600 font-semibold">Doanh thu hôm nay</h3>
                    <div className="icon-wrapper text-purple-600 transform group-hover:scale-110 transition-transform">
                      <MoneyIcon className="w-6 h-6" />
                    </div>
                  </div>
                  <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                    {formatVND(stats.todayRevenue || 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Nhấn để xem chi tiết</p>
                </div>
              </div>
            </div>

            {/* Analytics Link */}
            <div className="mb-6">
              <Link href="/dashboard/analytics">
                <div className="card group relative overflow-hidden card-glow cursor-pointer hover:shadow-xl transition-all hover-lift">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-gray-600">📊 Xem Thống Kê Chi Tiết</h3>
                      <p className="text-gray-600 font-semibold">
                        Biểu đồ doanh thu, món bán chạy, và phân tích đơn hàng
                      </p>
                    </div>
                    <BarChartIcon className="w-12 h-12 text-purple-600 opacity-80 transform group-hover:scale-110 transition-transform" />
                  </div>
                </div>
              </Link>
            </div>

            {/* Revenue Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div 
                className="card relative overflow-hidden bg-gradient-to-br from-green-50 via-green-50 to-emerald-50 border-2 border-green-100 cursor-pointer hover:shadow-lg transition-shadow hover-lift"
                onClick={() => handleRevenueCardClick('month')}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-200 rounded-full blur-3xl opacity-30"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-gray-700 font-bold text-lg">Doanh thu tháng này</h3>
                    <div className="icon-wrapper text-green-600">
                      <WalletIcon className="w-6 h-6" />
                    </div>
                  </div>
                  <p className="text-4xl font-bold bg-gradient-to-r from-green-700 to-green-500 bg-clip-text text-transparent mb-2">
                    {formatVND(stats.monthlyRevenue || 0)}
                  </p>
                  <p className="text-sm text-gray-600 font-medium">
                    Tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}
                  </p>
                </div>
              </div>
              <div 
                className="card relative overflow-hidden bg-gradient-to-br from-blue-50 via-blue-50 to-cyan-50 border-2 border-blue-100 cursor-pointer hover:shadow-lg transition-shadow hover-lift"
                onClick={() => handleRevenueCardClick('year')}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-30"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-gray-700 font-bold text-lg">Doanh thu năm nay</h3>
                    <div className="icon-wrapper text-blue-600">
                      <WalletIcon className="w-6 h-6" />
                    </div>
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
            <div className="flex items-center justify-between mb-4 gap-3">
              <h2 className="text-2xl font-bold">Đơn hàng gần đây</h2>
              <button
                onClick={() => refreshOrders()}
                className="flex items-center gap-2 px-2 py-1 text-sm sm:px-3 sm:py-2 sm:text-base bg-blue-600 text-white rounded-md sm:rounded-lg hover:bg-blue-700 transition min-h-0"
                aria-label="Làm mới đơn"
              >
                <RefreshIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Làm mới đơn</span>
              </button>
            </div>
            {orders.length === 0 ? (
              <p className="text-gray-600">Chưa có đơn hàng nào</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left">Mã đơn</th>
                      <th className="px-4 py-2 text-left">Loại đơn</th>
                      <th className="px-4 py-2 text-left">Khách hàng</th>
                      <th className="px-4 py-2 text-left">Tổng tiền</th>
                      <th className="px-4 py-2 text-left">Trạng thái</th>
                      <th className="px-4 py-2 text-left">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const isDisabled = order.status === 'cancelled' || order.status === 'completed';
                      return (
                      <tr 
                        key={order.id} 
                        className="border-b hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleOrderClick(order)}
                      >
                        <td className="px-4 py-2 font-bold">{order.orderCode}</td>
                        <td className="px-4 py-2">
                          <div className="flex flex-col gap-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${
                              order.orderType === 'delivery'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {order.orderType === 'delivery' ? (
                                <>
                                  <DeliveryTruckIcon className="w-4 h-4" />
                                  Giao hàng
                                </>
                              ) : (
                                <>
                                  <TableIcon className="w-4 h-4" />
                                  Tại bàn
                                </>
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          {order.orderType === 'delivery' 
                            ? (order.customerName || 'N/A')
                            : `Bàn ${order.tableNumber || 'N/A'}`
                          }
                        </td>
                        <td className="px-4 py-2 font-bold">
                          {formatVND(order.totalAmount)}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-bold sm:px-3 sm:py-1 sm:text-sm whitespace-nowrap ${
                              order.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : order.status === 'confirmed'
                                ? 'bg-blue-100 text-blue-800'
                                : order.status === 'preparing'
                                ? 'bg-orange-100 text-orange-800'
                                : order.status === 'ready'
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'delivered'
                                ? 'bg-purple-100 text-purple-800'
                                : order.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {order.status === 'pending' ? 'Chờ xử lý' :
                             order.status === 'confirmed' ? 'Đã xác nhận' :
                             order.status === 'preparing' ? 'Đang chuẩn bị' :
                             order.status === 'ready' ? 'Sẵn sàng' :
                             order.status === 'delivered' ? 'Đã giao' :
                             order.status === 'completed' ? 'Hoàn tất' :
                             order.status === 'cancelled' ? 'Đã hủy' : order.status}
                          </span>
                        </td>
                        <td className="px-4 py-2" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            disabled={order.status === 'cancelled' || order.status === 'completed'}
                            className={`border rounded px-2 py-1 ${
                              order.status === 'cancelled' || order.status === 'completed'
                                ? 'bg-gray-100 cursor-not-allowed opacity-60'
                                : 'bg-white cursor-pointer'
                            }`}
                          >
                            <option value="pending">Chờ xử lý</option>
                            <option value="confirmed">Đã xác nhận</option>
                            <option value="preparing">Đang chuẩn bị</option>
                            <option value="ready">Sẵn sàng</option>
                            <option value="delivered">Đã giao</option>
                            <option value="completed">Hoàn tất</option>
                            <option value="cancelled">Đã hủy</option>
                          </select>
                        </td>
                      </tr>
                      );
                    })}
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
              className="btn btn-primary btn-ripple scale-on-hover"
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
              className="btn btn-primary btn-ripple scale-on-hover"
            >
              Tải xuống Mã QR
            </button>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="card px-3 sm:px-4 md:px-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Cài đặt Cửa hàng</h2>
            
            {/* Logo Upload Section */}
            <div className="mb-6 sm:mb-8">
              <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Logo cửa hàng</h3>
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                {/* Logo Preview */}
                <div className="flex-shrink-0 mx-auto sm:mx-0">
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-gray-200 shadow-lg">
                    {logoPreview ? (
                      <img 
                        src={logoPreview}
                        alt="Store Logo Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          if (process.env.NODE_ENV === 'development') {
                            console.error('Logo preview load error:', e.target.src);
                          }
                          e.target.src = '/logo.jpg';
                        }}
                      />
                    ) : (storeData?.storeLogo || store?.storeLogo) ? (
                      <img 
                        src={(() => {
                          const logo = storeData?.storeLogo || store?.storeLogo;
                          if (!logo) return '/logo.jpg';
                          // Nếu đã là full URL
                          if (logo.startsWith('http')) {
                            return logo;
                          }
                          // Nếu là relative path, tạo full URL
                          const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5002';
                          // Đảm bảo không có double slash
                          const logoPath = logo.startsWith('/') ? logo : '/' + logo;
                          return apiBase + logoPath;
                        })()}
                        alt="Store Logo"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          if (process.env.NODE_ENV === 'development') {
                            console.error('Logo load error:', e.target.src);
                          }
                          e.target.src = '/logo.jpg';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-4xl font-bold">
                        {(storeData?.storeName || store?.storeName)?.[0]?.toUpperCase() || 'S'}
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
                <div className="flex-1 w-full sm:w-auto">
                  <p className="text-sm sm:text-base text-gray-600 mb-2 sm:mb-3">
                    Logo sẽ hiển thị ở header trang menu của cửa hàng bạn.
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                    Định dạng: JPG, PNG, GIF (Tối đa 5MB)
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <label className="inline-block w-full sm:w-auto">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={uploadingLogo}
                        className="hidden"
                        id="logo-upload"
                      />
                      <span className={`btn ${uploadingLogo ? 'btn-secondary opacity-50 cursor-not-allowed' : 'btn-primary btn-ripple scale-on-hover'} cursor-pointer inline-block w-full sm:w-auto text-center`}>
                        {uploadingLogo ? 'Đang upload...' : 'Chọn ảnh logo'}
                      </span>
                    </label>
                    {(storeData?.storeLogo || store?.storeLogo) && (
                      <button
                        onClick={async () => {
                          try {
                            // Gửi request xóa logo - update store với storeLogo = null
                            // Backend cần hỗ trợ xóa logo bằng cách set storeLogo = null
                            // Tạm thời: Gọi API update với storeLogo empty
                            await api.put('/stores/my-store', {
                              storeName: storeData?.storeName || store?.storeName,
                              // Không gửi storeLogo để giữ nguyên (cần backend hỗ trợ xóa)
                            });
                            // Fetch lại store data
                            const storeRes = await api.get('/stores/my-store');
                            if (storeRes.data.success) {
                              useStore.setState({ store: storeRes.data.data });
                              setStoreData(storeRes.data.data);
                              setLogoPreview(null);
                              toast.success('Đã xóa logo!');
                            }
                          } catch (error) {
                            if (process.env.NODE_ENV === 'development') {
                              console.error('Delete logo error:', error);
                            }
                            toast.error('Xóa logo thất bại!');
                          }
                        }}
                        className="btn btn-secondary w-full sm:w-auto"
                      >
                        Xóa logo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Store Image (Banner) Upload Section */}
            <div className="mb-6 sm:mb-8">
              <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Hình ảnh quán (Banner)</h3>
              <div className="flex flex-col gap-4 sm:gap-6">
                {/* Image Preview */}
                <div className="w-full">
                  <div className="relative w-full h-40 sm:h-48 md:h-64 rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg bg-gray-100">
                    {storeImagePreview ? (
                      <img 
                        src={storeImagePreview}
                        alt="Store Image Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (storeData?.storeImage || store?.storeImage) ? (
                      <img 
                        src={(() => {
                          const image = storeData?.storeImage || store?.storeImage;
                          if (!image) return null;
                          if (image.startsWith('http')) {
                            return image;
                          }
                          const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5002';
                          const imagePath = image.startsWith('/') ? image : '/' + image;
                          return apiBase + imagePath;
                        })()}
                        alt="Store Banner"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center text-white">
                        <div className="text-center">
                          <div className="text-4xl mb-2">🖼️</div>
                          <p className="text-sm">Chưa có hình ảnh quán</p>
                        </div>
                      </div>
                    )}
                    {uploadingStoreImage && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Upload Button */}
                <div>
                  <p className="text-sm sm:text-base text-gray-600 mb-2 sm:mb-3">
                    Hình ảnh này sẽ hiển thị ở đầu trang menu của cửa hàng bạn, giúp khách hàng dễ nhận biết.
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                    Định dạng: JPG, PNG, GIF (Tối đa 5MB). Khuyến nghị: 1200x400px hoặc tỷ lệ tương tự.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <label className="inline-block w-full sm:w-auto">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleStoreImageUpload}
                        disabled={uploadingStoreImage}
                        className="hidden"
                        id="store-image-upload"
                      />
                      <span className={`btn ${uploadingStoreImage ? 'btn-secondary opacity-50 cursor-not-allowed' : 'btn-primary btn-ripple scale-on-hover'} cursor-pointer inline-block w-full sm:w-auto text-center`}>
                        {uploadingStoreImage ? 'Đang upload...' : 'Chọn hình ảnh quán'}
                      </span>
                    </label>
                    {(storeData?.storeImage || store?.storeImage) && (
                      <button
                        onClick={async () => {
                          try {
                            await api.put('/stores/my-store', {
                              storeName: storeData?.storeName || store?.storeName,
                              storeImage: '', // Gửi empty string để xóa
                            });
                            const storeRes = await api.get('/stores/my-store');
                            if (storeRes.data.success) {
                              useStore.setState({ store: storeRes.data.data });
                              setStoreData(storeRes.data.data);
                              setStoreImagePreview(null);
                              toast.success('Đã xóa hình ảnh quán!');
                            }
                          } catch (error) {
                            console.error('Delete store image error:', error);
                            toast.error('Xóa hình ảnh thất bại!');
                          }
                        }}
                        className="btn btn-secondary w-full sm:w-auto"
                      >
                        Xóa hình ảnh
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Store Information Section */}
            <div className="mb-6 sm:mb-8">
              <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Thông tin cửa hàng</h3>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Tên cửa hàng</label>
                  <input
                    type="text"
                    value={storeFormData.storeName}
                    onChange={(e) => setStoreFormData({ ...storeFormData, storeName: e.target.value })}
                    className="input-field w-full"
                    placeholder="Nhập tên cửa hàng"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Số điện thoại</label>
                  <input
                    type="text"
                    value={storeFormData.storePhone}
                    onChange={(e) => setStoreFormData({ ...storeFormData, storePhone: e.target.value })}
                    className="input-field w-full"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Địa chỉ (dùng để tính khoảng cách) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={storeFormData.storeAddress}
                    onChange={(e) => setStoreFormData({ ...storeFormData, storeAddress: e.target.value })}
                    className="input-field w-full"
                    placeholder="Ví dụ: Nguyễn Công Trứ, Hội An, Quảng Nam"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Địa chỉ này được dùng để tính khoảng cách và phí ship. Vui lòng nhập địa chỉ đầy đủ.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Địa chỉ chi tiết (hiển thị cho khách hàng)
                  </label>
                  <textarea
                    value={storeFormData.storeDetailedAddress}
                    onChange={(e) => setStoreFormData({ ...storeFormData, storeDetailedAddress: e.target.value })}
                    className="input-field w-full"
                    rows="3"
                    placeholder="Ví dụ: Số 123, Đường Nguyễn Công Trứ, Phường Minh An, Hội An, Quảng Nam (Gần chợ Hội An)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Địa chỉ chi tiết này sẽ hiển thị cho khách hàng trên trang menu. Bạn có thể thêm số nhà, hướng dẫn đường đi, v.v. 
                    <span className="font-semibold text-blue-600"> Địa chỉ này không ảnh hưởng đến tính toán khoảng cách.</span>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Mô tả cửa hàng</label>
                  <textarea
                    value={storeFormData.storeDescription}
                    onChange={(e) => setStoreFormData({ ...storeFormData, storeDescription: e.target.value })}
                    className="input-field w-full"
                    rows="3"
                    placeholder="Nhập mô tả về cửa hàng của bạn"
                  />
                </div>
                <button
                  onClick={async () => {
                    try {
                      setSavingStoreInfo(true);
                      const res = await api.put('/stores/my-store', storeFormData);
                      if (res.data.success) {
                        toast.success('Cập nhật thông tin cửa hàng thành công!');
                        // Reload store data
                        const storeRes = await api.get('/stores/my-store');
                        if (storeRes.data.success) {
                          useStore.setState({ store: storeRes.data.data });
                          setStoreData(storeRes.data.data);
                        }
                      }
                    } catch (error) {
                      toast.error('Cập nhật thông tin thất bại!');
                      if (process.env.NODE_ENV === 'development') {
                        console.error('Update store info error:', error);
                      }
                    } finally {
                      setSavingStoreInfo(false);
                    }
                  }}
                  disabled={savingStoreInfo}
                  className={`btn btn-primary ${savingStoreInfo ? 'opacity-50 cursor-not-allowed' : 'btn-ripple scale-on-hover'}`}
                >
                  {savingStoreInfo ? 'Đang lưu...' : 'Lưu thông tin'}
                </button>
              </div>
            </div>

            {/* Payment Accounts Management - Using new PaymentAccountManager component */}
            <div className="border-t border-gray-200 pt-4 sm:pt-6 mt-4 sm:mt-6 -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6">
              {store?.id ? (
                <PaymentAccountManager storeId={store.id} />
              ) : (
                <div className="text-center py-6 sm:py-8 text-gray-500 text-sm sm:text-base">
                  Đang tải thông tin cửa hàng...
                </div>
              )}
            </div>

            {/* Old ZaloPay configuration - Hidden, replaced by new UI */}
            {false && (
            <div className="border-t border-gray-200 pt-6 mt-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold mb-2">💳 Cấu hình ZaloPay</h3>
                <p className="text-sm text-gray-600">
                  Nhập App ID và Key 1/2 từ ZaloPay. Merchant ID có thể để trống (sẽ dùng App ID thay thế). Bật công tắc để hiển thị phương thức ZaloPay cho khách.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">App ID *</label>
                  <input
                    type="text"
                    value={zaloPayConfig.zaloPayAppId}
                    onChange={(e) => setZaloPayConfig({ ...zaloPayConfig, zaloPayAppId: e.target.value })}
                    className="input-field w-full"
                    placeholder="Nhập App ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Merchant ID (tùy chọn)</label>
                  <input
                    type="text"
                    value={zaloPayConfig.zaloPayMerchantId}
                    onChange={(e) => setZaloPayConfig({ ...zaloPayConfig, zaloPayMerchantId: e.target.value })}
                    className="input-field w-full"
                    placeholder="Nếu trống sẽ dùng App ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Key 1 *</label>
                  <input
                    type="password"
                    value={zaloPayConfig.zaloPayKey1}
                    onChange={(e) => setZaloPayConfig({ ...zaloPayConfig, zaloPayKey1: e.target.value })}
                    className="input-field w-full"
                    placeholder={storeData?.zaloPayConfig?.hasKey1 ? 'Đã lưu (nhập để thay đổi)' : 'Nhập Key 1'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Key 2 (tùy chọn)</label>
                  <input
                    type="password"
                    value={zaloPayConfig.zaloPayKey2}
                    onChange={(e) => setZaloPayConfig({ ...zaloPayConfig, zaloPayKey2: e.target.value })}
                    className="input-field w-full"
                    placeholder={storeData?.zaloPayConfig?.hasKey2 ? 'Đã lưu (nhập để thay đổi)' : 'Nhập Key 2'}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="inline-flex items-center gap-2 text-sm font-semibold">
                    <input
                      type="checkbox"
                      checked={zaloPayConfig.zaloPayIsActive}
                      onChange={(e) => setZaloPayConfig({ ...zaloPayConfig, zaloPayIsActive: e.target.checked })}
                    />
                    Bật thanh toán ZaloPay cho khách
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Khi bật, khách sẽ thấy phương thức ZaloPay QR tại trang thanh toán.
                  </p>
                </div>
              </div>
              <div className="mt-4">
                {zaloPayStatus && (
                  <div className={`mb-3 text-sm font-semibold ${zaloPayStatus.type === 'success' ? 'text-green-700' : 'text-red-600'}`}>
                    {zaloPayStatus.message}
                  </div>
                )}
                <div className="flex flex-col md:flex-row gap-2">
                  <button
                    onClick={async () => {
                      setVerifyingZaloPay(true);
                      setZaloPayStatus(null);
                      try {
                        const res = await api.post('/zalopay/verify', {
                          zaloPayAppId: zaloPayConfig.zaloPayAppId,
                          zaloPayKey1: zaloPayConfig.zaloPayKey1,
                          zaloPayKey2: zaloPayConfig.zaloPayKey2,
                          zaloPayMerchantId: zaloPayConfig.zaloPayMerchantId
                        });
                        if (res.data.success) {
                          setZaloPayStatus({ type: 'success', message: 'Liên kết thành công (ZaloPay xác nhận).' });
                          toast.success('Liên kết ZaloPay thành công!');
                        }
                      } catch (error) {
                        const msg = error.response?.data?.message || 'Liên kết thất bại. Kiểm tra App ID / Key 1 / Key 2.';
                        setZaloPayStatus({ type: 'error', message: msg });
                        toast.error(msg);
                      } finally {
                        setVerifyingZaloPay(false);
                      }
                    }}
                    disabled={verifyingZaloPay || !zaloPayConfig.zaloPayAppId || !zaloPayConfig.zaloPayKey1}
                    className="btn btn-secondary"
                  >
                    {verifyingZaloPay ? 'Đang kiểm tra...' : 'Liên kết với ZaloPay'}
                  </button>
                <button
                  onClick={async () => {
                    setSavingZaloPay(true);
                    try {
                      const payload = { ...zaloPayConfig };
                      const res = await api.put('/stores/my-store', payload);
                      if (res.data.success) {
                        toast.success('Đã lưu cấu hình ZaloPay');
                        const storeRes = await api.get('/stores/my-store');
                        if (storeRes.data.success) {
                          useStore.setState({ store: storeRes.data.data });
                          setStoreData(storeRes.data.data);
                          const zp = storeRes.data.data.zaloPayConfig || {};
                          setZaloPayConfig({
                            zaloPayAppId: zp.appId || '',
                            zaloPayKey1: '',
                            zaloPayKey2: '',
                            zaloPayMerchantId: zp.merchantId || '',
                            zaloPayIsActive: zp.isActive || false,
                            zaloPayLink: zp.link || ''
                          });
                        }
                      }
                    } catch (error) {
                      toast.error(error.response?.data?.message || 'Lưu cấu hình ZaloPay thất bại');
                      if (process.env.NODE_ENV === 'development') {
                        console.error('Save ZaloPay config error:', error);
                      }
                    } finally {
                      setSavingZaloPay(false);
                    }
                  }}
                  disabled={savingZaloPay}
                  className="btn btn-primary"
                >
                  {savingZaloPay ? 'Đang lưu...' : 'Lưu cấu hình ZaloPay'}
                </button>
              </div>
            </div>
            </div>
            )}

            {/* Old Bank Transfer QR configuration - Hidden, replaced by new UI */}
            {false && (
            <div className="border-t border-gray-200 pt-6 mt-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold mb-2">🏦 Cấu hình Chuyển khoản QR</h3>
                <p className="text-sm text-gray-600">
                  Nhập thông tin tài khoản ngân hàng để tạo QR code chuyển khoản. Khách hàng có thể quét mã để chuyển khoản trực tiếp với số tiền và nội dung tự động điền. <strong>Hoàn toàn miễn phí!</strong>
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Số tài khoản *</label>
                  <input
                    type="text"
                    value={bankTransferConfig.bankAccountNumber}
                    onChange={(e) => {
                      // Only allow digits, remove any non-digit characters
                      const value = e.target.value.replace(/\D/g, '');
                      setBankTransferConfig({ ...bankTransferConfig, bankAccountNumber: value });
                    }}
                    className="input-field w-full"
                    placeholder="Nhập số tài khoản (chỉ số)"
                    maxLength={19}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Tên chủ tài khoản *</label>
                  <input
                    type="text"
                    value={bankTransferConfig.bankAccountName}
                    onChange={(e) => setBankTransferConfig({ ...bankTransferConfig, bankAccountName: e.target.value })}
                    className="input-field w-full"
                    placeholder="Nhập tên chủ tài khoản"
                  />
                </div>
                <div className="md:col-span-2 relative">
                  <label className="block text-sm font-semibold mb-2">Tên ngân hàng *</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={bankSearchQuery}
                      onChange={(e) => {
                        const query = e.target.value;
                        setBankSearchQuery(query);
                        setShowBankDropdown(true);
                        if (query.trim()) {
                          api.get(`/bank-transfer/banks?search=${encodeURIComponent(query)}`)
                            .then(res => {
                              if (res.data.success) {
                                setBankSearchResults(res.data.data);
                              }
                            })
                            .catch(err => console.error('Search banks error:', err));
                        } else {
                          setBankSearchResults([]);
                        }
                      }}
                      onFocus={() => {
                        setShowBankDropdown(true);
                        if (!bankSearchQuery.trim() && bankSearchResults.length === 0) {
                          // Load all banks on first focus
                          api.get('/bank-transfer/banks')
                            .then(res => {
                              if (res.data.success) {
                                setBankSearchResults(res.data.data);
                              }
                            })
                            .catch(err => console.error('Load banks error:', err));
                        }
                      }}
                      className="input-field w-full"
                      placeholder="Tìm kiếm ngân hàng (VD: Vietcombank, Techcombank, BIDV...)"
                    />
                    {showBankDropdown && bankSearchResults.length > 0 && (
                      <div 
                        className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {bankSearchResults.map((bank) => (
                          <div
                            key={bank.code}
                            onClick={() => {
                              setBankSearchQuery(bank.shortName);
                              setBankTransferConfig({
                                ...bankTransferConfig,
                                bankName: bank.shortName,
                                bankCode: bank.code
                              });
                              setShowBankDropdown(false);
                            }}
                            className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-semibold text-sm">{bank.shortName}</div>
                            <div className="text-xs text-gray-500">{bank.name}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {bankTransferConfig.bankCode && (
                    <p className="text-xs text-green-600 mt-1">
                      ✅ Đã chọn: {bankTransferConfig.bankName} (Mã: {bankTransferConfig.bankCode}) - Hỗ trợ VietQR
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Tìm kiếm và chọn ngân hàng từ danh sách được VietQR hỗ trợ. Hỗ trợ hơn 30 ngân hàng tại Việt Nam.
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="inline-flex items-center gap-2 text-sm font-semibold">
                    <input
                      type="checkbox"
                      checked={bankTransferConfig.bankTransferQRIsActive}
                      onChange={(e) => setBankTransferConfig({ ...bankTransferConfig, bankTransferQRIsActive: e.target.checked })}
                    />
                    Bật thanh toán Chuyển khoản QR cho khách
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Khi bật, khách sẽ thấy phương thức "Chuyển khoản QR (quét mã)" tại trang thanh toán.
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={async () => {
                    setSavingBankTransfer(true);
                    try {
                      const payload = { ...bankTransferConfig };
                      const res = await api.put('/stores/my-store', payload);
                      if (res.data.success) {
                        toast.success('Đã lưu cấu hình Chuyển khoản QR');
                        const storeRes = await api.get('/stores/my-store');
                        if (storeRes.data.success) {
                          useStore.setState({ store: storeRes.data.data });
                          setStoreData(storeRes.data.data);
                          const bt = storeRes.data.data.bankTransferConfig || {};
                          setBankTransferConfig({
                            bankAccountNumber: bt.accountNumber || '',
                            bankAccountName: bt.accountName || '',
                            bankName: bt.bankName || '',
                            bankCode: bt.bankCode || '',
                            bankTransferQRIsActive: bt.isActive || false
                          });
                          if (bt.bankName) {
                            setBankSearchQuery(bt.bankName);
                          }
                        }
                      }
                    } catch (error) {
                      toast.error(error.response?.data?.message || 'Lưu cấu hình Chuyển khoản QR thất bại');
                      if (process.env.NODE_ENV === 'development') {
                        console.error('Save Bank Transfer config error:', error);
                      }
                    } finally {
                      setSavingBankTransfer(false);
                    }
                  }}
                  disabled={savingBankTransfer || !bankTransferConfig.bankAccountNumber || !bankTransferConfig.bankAccountName || !bankTransferConfig.bankName}
                  className="btn btn-primary"
                >
                  {savingBankTransfer ? 'Đang lưu...' : 'Lưu cấu hình Chuyển khoản QR'}
                </button>
              </div>
            </div>
            )}

            {/* Voucher customization */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                  🎁 Voucher khuyến mãi cho khách hàng
                </h3>
                <p className="text-sm text-gray-600">
                  Tất cả voucher tạo tại đây chỉ áp dụng cho cửa hàng <span className="font-semibold">{store?.storeName}</span>. 
                  Bạn có thể đặt điều kiện đơn tối thiểu, giảm theo phần trăm hoặc số tiền cố định và thời hạn sử dụng.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <form onSubmit={handleCreateVoucher} className="space-y-4 bg-purple-50 p-4 rounded-xl border border-purple-100 shadow-sm">
                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      Mã voucher <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={voucherForm.code}
                      onChange={(e) => setVoucherForm((prev) => ({
                        ...prev,
                        code: e.target.value.toUpperCase()
                      }))}
                      className="input-field w-full uppercase"
                      placeholder="VD: GIAM20"
                      maxLength={20}
                    />
                    <p className="text-xs text-gray-500 mt-1">Mã sẽ tự động chuyển thành chữ in hoa.</p>
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
                      <label className="block text-sm font-semibold mb-1">
                        Giá trị giảm <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="number"
                        name="discountValue"
                        value={voucherForm.discountValue}
                        onChange={handleVoucherFormChange}
                        className="input-field w-full"
                        min="0"
                        step="0.1"
                        placeholder={voucherForm.discountType === 'percentage' ? 'Ví dụ: 20 (%)' : 'Ví dụ: 50000 (VND)'}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1">Đơn tối thiểu (VND)</label>
                      <input
                        type="number"
                        name="minOrderAmount"
                        value={voucherForm.minOrderAmount}
                        onChange={handleVoucherFormChange}
                        className="input-field w-full"
                        min="0"
                        step="1000"
                        placeholder="Ví dụ: 100000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Giảm tối đa (VND)</label>
                      <input
                        type="number"
                        name="maxDiscountAmount"
                        value={voucherForm.maxDiscountAmount}
                        onChange={handleVoucherFormChange}
                        className="input-field w-full"
                        min="0"
                        step="1000"
                        placeholder="Không bắt buộc"
                      />
                      <p className="text-xs text-gray-500 mt-1">Dùng khi giảm % để giới hạn số tiền giảm.</p>
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

                  <div className="flex items-center gap-3">
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
                    <label className="block text-sm font-semibold mb-1">Mô tả hiển thị cho khách</label>
                    <textarea
                      name="description"
                      value={voucherForm.description}
                      onChange={handleVoucherFormChange}
                      className="input-field w-full"
                      rows="2"
                      placeholder="Nhập ghi chú: áp dụng cho đơn giao hàng, ..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={creatingVoucher}
                    className={`btn btn-primary w-full ${creatingVoucher ? 'opacity-60 cursor-not-allowed' : 'btn-ripple scale-on-hover'}`}
                  >
                    {creatingVoucher ? 'Đang tạo...' : 'Tạo voucher mới'}
                  </button>
                </form>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold">Voucher hiện tại</h4>
                      <p className="text-sm text-gray-500">Quản lý tất cả voucher của cửa hàng.</p>
                    </div>
                    <button
                      onClick={fetchStoreVouchers}
                      className="text-sm text-purple-600 font-semibold hover:underline"
                    >
                      Làm mới
                    </button>
                  </div>

                  {loadingVouchers ? (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                      Đang tải voucher...
                    </div>
                  ) : storeVouchers.length === 0 ? (
                    <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-sm text-gray-600">
                      Chưa có voucher nào. Hãy tạo voucher đầu tiên của bạn!
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                      {storeVouchers.map((voucher) => (
                        <div key={voucher.id} className="border rounded-xl p-4 shadow-sm bg-white">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="text-xs text-gray-500 uppercase">Mã voucher</p>
                              <p className="text-xl font-extrabold tracking-widest text-purple-600">{voucher.code}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${voucher.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-700'}`}>
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
                              <p className="text-xs text-gray-500">Đơn hàng tối thiểu</p>
                              <p className="font-semibold">{formatVND(voucher.minOrderAmount || 0)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Giảm tối đa</p>
                              <p className="font-semibold">{voucher.maxDiscountAmount ? formatVND(voucher.maxDiscountAmount) : 'Không giới hạn'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Ngày bắt đầu</p>
                              <p className="font-semibold">
                                {voucher.startsAt
                                  ? new Date(voucher.startsAt).toLocaleString('vi-VN', { 
                                      year: 'numeric', 
                                      month: '2-digit', 
                                      day: '2-digit',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })
                                  : 'Ngay lập tức'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Hạn sử dụng</p>
                              <p className="font-semibold">
                                {voucher.neverExpires || !voucher.expiresAt
                                  ? 'Không giới hạn'
                                  : new Date(voucher.expiresAt).toLocaleString('vi-VN', { 
                                      year: 'numeric', 
                                      month: '2-digit', 
                                      day: '2-digit',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Lượt sử dụng</p>
                              <p className="font-semibold">{voucher.usageCount || 0}{voucher.usageLimit ? ` / ${voucher.usageLimit}` : ' / Không giới hạn'}</p>
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
                              onClick={() => handleToggleVoucherActive(voucher)}
                              className="px-4 py-2 rounded-lg font-semibold text-sm border border-purple-200 text-purple-700 hover:bg-purple-50 transition"
                            >
                              {voucher.isActive ? 'Tạm tắt' : 'Kích hoạt'}
                            </button>
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
                    <label className="text-sm font-semibold text-gray-700">Xóa voucher theo mã</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={deleteVoucherCode}
                        onChange={(e) => setDeleteVoucherCode(e.target.value.toUpperCase())}
                        className="input-field flex-1 uppercase"
                        placeholder="Nhập mã voucher cần xoá"
                      />
                      <button
                        type="submit"
                        disabled={deletingByCode}
                        className={`px-4 py-2 rounded-lg font-semibold bg-gray-800 text-white hover:bg-black transition ${deletingByCode ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        {deletingByCode ? 'Đang xoá...' : 'Xóa'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Tính năng này hữu ích khi bạn muốn xoá nhanh một voucher bằng mã ký tự.
                    </p>
                  </form>
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
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-gray-600">Mã đơn: {orderDetail.orderCode}</p>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 w-fit ${
                        orderDetail.orderType === 'delivery'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {orderDetail.orderType === 'delivery' ? (
                          <>
                            <DeliveryTruckIcon className="w-4 h-4" />
                            Giao hàng
                          </>
                        ) : (
                          <>
                            <TableIcon className="w-4 h-4" />
                            Tại bàn
                          </>
                        )}
                      </span>
                    </div>
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
                    {orderDetail.orderType === 'delivery' ? (
                      <>
                        <div>
                          <p className="text-gray-600 text-sm">Tên khách hàng</p>
                          <p className="font-bold">{orderDetail.customerName || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Số điện thoại</p>
                          <p className="font-bold">{orderDetail.customerPhone || 'N/A'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-gray-600 text-sm">Địa chỉ giao hàng</p>
                          <p className="font-bold">{orderDetail.deliveryAddress || 'N/A'}</p>
                        </div>
                        {orderDetail.deliveryDistance && (
                          <div>
                            <p className="text-gray-600 text-sm">Khoảng cách</p>
                            <p className="font-bold">{orderDetail.deliveryDistance} km</p>
                          </div>
                        )}
                        {orderDetail.shippingFee > 0 && (
                          <div>
                            <p className="text-gray-600 text-sm">Phí ship</p>
                            <p className="font-bold">{formatVND(orderDetail.shippingFee)}</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div>
                        <p className="text-gray-600 text-sm">Số bàn</p>
                        <p className="font-bold">{orderDetail.tableNumber || 'N/A'}</p>
                      </div>
                    )}
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
                            : orderDetail.status === 'preparing'
                            ? 'bg-orange-100 text-orange-800'
                            : orderDetail.status === 'ready'
                            ? 'bg-green-100 text-green-800'
                            : orderDetail.status === 'delivered'
                            ? 'bg-purple-100 text-purple-800'
                            : orderDetail.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {orderDetail.status === 'pending' ? 'Chờ xử lý' :
                         orderDetail.status === 'confirmed' ? 'Đã xác nhận' :
                         orderDetail.status === 'preparing' ? 'Đang chuẩn bị' :
                         orderDetail.status === 'ready' ? 'Sẵn sàng' :
                         orderDetail.status === 'delivered' ? 'Đã giao' :
                         orderDetail.status === 'completed' ? 'Hoàn tất' :
                         orderDetail.status === 'cancelled' ? 'Đã hủy' : orderDetail.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Tổng tiền</p>
                      <p className="font-bold text-xl text-blue-600">
                        {formatVND(orderDetail.totalAmount)}
                      </p>
                    </div>
                    {orderDetail.voucherCode && (
                      <div className="col-span-2 bg-green-50 border border-green-100 rounded-lg p-3">
                        <p className="text-xs text-green-700 font-semibold uppercase">Voucher áp dụng</p>
                        <div className="flex items-center justify-between text-sm text-green-800 font-bold">
                          <span>{orderDetail.voucherCode}</span>
                          <span>-{formatVND(orderDetail.discountAmount || 0)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {orderDetail.customerNote && (
                    <div>
                      <p className="text-gray-600 text-sm">Ghi chú</p>
                      <p className="font-medium">{orderDetail.customerNote}</p>
                    </div>
                  )}
                  
                  {/* QR Code Display */}
                  {(orderDetail.zaloPayQrCode || orderDetail.bankTransferQRCode) && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-gray-600 text-sm mb-2 font-semibold">Mã QR thanh toán</p>
                      <div className="flex flex-col items-center gap-3">
                        {orderDetail.zaloPayQrCode && (
                          <div className="text-center">
                            <p className="text-xs text-gray-600 mb-2">ZaloPay QR</p>
                            <img
                              src={orderDetail.zaloPayQrCode}
                              alt="ZaloPay QR Code"
                              className="w-48 h-48 border-2 border-purple-200 rounded-lg mx-auto"
                    />
                  </div>
                        )}
                        {orderDetail.bankTransferQRCode && (
                          <div className="text-center">
                            <p className="text-xs text-gray-600 mb-2">Chuyển khoản QR</p>
                            <img
                              src={orderDetail.bankTransferQRCode}
                              alt="Bank Transfer QR Code"
                              className="w-48 h-48 border-2 border-blue-200 rounded-lg mx-auto"
                    />
                  </div>
                        )}
                </div>
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
                          {item.selectedAccompaniments && (
                            <div className="mt-2 pt-2 border-t">
                              <p className="text-sm font-medium text-gray-700 mb-1">Món ăn kèm:</p>
                              <ul className="list-disc list-inside text-sm text-gray-600">
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
                                  return list.length === 0
                                    ? [<li key="none">Không có</li>]
                                    : list.map((acc, idx) => (
                                        <li key={idx}>
                                          {acc.quantity ? `${acc.quantity} × ${acc.name}` : acc.name}
                                          {acc.price ? ` (+${formatVND(acc.price)} / phần)` : ''}
                                        </li>
                                      ));
                                })()}
                              </ul>
                            </div>
                          )}
                          {item.selectedOptions && (
                            <div className="mt-2 pt-2 border-t">
                              <p className="text-sm font-medium text-gray-700 mb-1">Tùy chọn:</p>
                              <p className="text-sm text-gray-600">
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

      {/* Date Orders Modal */}
      {showDateOrdersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowDateOrdersModal(false)}>
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-2xl font-bold">
                      Đơn hàng ngày {selectedDate ? new Date(selectedDate).toLocaleDateString('vi-VN') : ''}
                    </h2>
                    <input
                      type="date"
                      value={selectedDate ? new Date(selectedDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          const newDate = new Date(e.target.value);
                          setSelectedDate(newDate);
                          fetchOrdersByDate(newDate);
                        }
                      }}
                      max={new Date().toISOString().split('T')[0]}
                      className="border rounded px-3 py-1 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div>
                      <p className="text-sm text-gray-600">Doanh thu (hoàn tất):</p>
                      <p className="font-bold text-lg text-purple-600">{formatVND(dateRevenue)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tổng số đơn:</p>
                      <p className="font-bold text-lg text-gray-800">
                        {dateOrders.length} đơn
                        {dateOrders.filter(o => o.status === 'completed').length > 0 && (
                          <span className="text-sm text-green-600 ml-2">
                            ({dateOrders.filter(o => o.status === 'completed').length} hoàn tất)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowDateOrdersModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl ml-4"
                >
                  ×
                </button>
              </div>

              {loadingDateOrders ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Đang tải đơn hàng...</p>
                </div>
              ) : dateOrders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Không có đơn hàng nào trong ngày này</p>
                </div>
              ) : (
                <div>
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Lưu ý:</strong> Doanh thu chỉ tính từ các đơn hàng có trạng thái "Hoàn tất" (đã thanh toán). 
                      Các đơn hàng đang xử lý sẽ không được tính vào doanh thu.
                    </p>
                  </div>
                  <div className="space-y-4">
                    {dateOrders.map((order) => {
                      const isCompleted = order.status === 'completed';
                      const isCancelled = order.status === 'cancelled';
                      return (
                        <div 
                          key={order.id} 
                          className={`border rounded-lg p-4 transition-colors cursor-pointer ${
                            isCompleted 
                              ? 'border-green-300 bg-green-50 hover:bg-green-100' 
                              : isCancelled
                              ? 'border-red-200 bg-red-50 hover:bg-red-100'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                          onClick={() => {
                            // Cho phép xem chi tiết đơn hàng (kể cả đã hủy hoặc hoàn tất)
                            setSelectedOrder(order.id);
                            fetchOrderDetail(order.id);
                            setShowDateOrdersModal(false);
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <p className="font-bold text-lg">{order.orderCode}</p>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${
                                  order.orderType === 'delivery'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {order.orderType === 'delivery' ? (
                                    <>
                                      <DeliveryTruckIcon className="w-4 h-4" />
                                      Giao hàng
                                    </>
                                  ) : (
                                    <>
                                      <TableIcon className="w-4 h-4" />
                                      Tại bàn
                                    </>
                                  )}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                  order.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : order.status === 'confirmed'
                                    ? 'bg-blue-100 text-blue-800'
                                    : order.status === 'preparing'
                                    ? 'bg-orange-100 text-orange-800'
                                    : order.status === 'ready'
                                    ? 'bg-green-100 text-green-800'
                                    : order.status === 'delivered'
                                    ? 'bg-purple-100 text-purple-800'
                                    : order.status === 'completed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {order.status === 'pending' ? 'Chờ xử lý' :
                                   order.status === 'confirmed' ? 'Đã xác nhận' :
                                   order.status === 'preparing' ? 'Đang chuẩn bị' :
                                   order.status === 'ready' ? 'Sẵn sàng' :
                                   order.status === 'delivered' ? 'Đã giao' :
                                   order.status === 'completed' ? 'Hoàn tất' :
                                   order.status === 'cancelled' ? 'Đã hủy' : order.status}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">
                                {order.orderType === 'delivery' 
                                  ? (order.customerName || 'N/A')
                                  : `Bàn ${order.tableNumber || 'N/A'}`}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(order.createdAt).toLocaleString('vi-VN')}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold text-lg ${isCompleted ? 'text-purple-600' : 'text-gray-400'}`}>
                                {formatVND(order.totalAmount)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Choose Payment Type */}
      {showAddPaymentModal && !selectedPaymentType && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all animate-scaleIn">
            <div className="flex items-center justify-center mb-2">
              <div className="icon-wrapper icon-wrapper-lg icon-wrapper-primary">
                <CreditCardIcon className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2 text-center text-gray-800">Chọn phương thức thanh toán</h3>
            <p className="text-sm text-gray-600 text-center mb-6">
              Chọn loại tài khoản bạn muốn liên kết
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setSelectedPaymentType('zalopay');
                  if (!editingAccount) {
                    setZaloPayConfig({
                      zaloPayAppId: '',
                      zaloPayKey1: '',
                      zaloPayKey2: '',
                      zaloPayMerchantId: '',
                      zaloPayIsActive: false,
                      zaloPayLink: ''
                    });
                  }
                }}
                className="group relative w-full p-5 border-2 border-purple-200 rounded-xl hover:border-purple-400 bg-gradient-to-br from-white to-purple-50/30 hover:from-purple-50 hover:to-purple-100 transition-all duration-300 text-left overflow-hidden transform hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-200/0 via-purple-200/20 to-purple-200/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-4">
                  <div className="icon-wrapper icon-wrapper-lg icon-wrapper-primary group-hover:scale-110 transition-transform duration-300">
                    <WalletIcon className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-lg text-gray-800 mb-1">ZaloPay</div>
                    <div className="text-sm text-gray-600">Ví điện tử ZaloPay</div>
                  </div>
                  <ArrowRightIcon className="w-5 h-5 text-purple-600 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </button>
              <button
                onClick={() => {
                  setSelectedPaymentType('bank');
                  if (!editingAccount) {
                    setBankTransferConfig({
                      bankAccountNumber: '',
                      bankAccountName: '',
                      bankName: '',
                      bankCode: '',
                      bankTransferQRIsActive: false
                    });
                    setBankSearchQuery('');
                  }
                }}
                className="group relative w-full p-5 border-2 border-blue-200 rounded-xl hover:border-blue-400 bg-gradient-to-br from-white to-blue-50/30 hover:from-blue-50 hover:to-blue-100 transition-all duration-300 text-left overflow-hidden transform hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-200/0 via-blue-200/20 to-blue-200/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-4">
                  <div className="icon-wrapper icon-wrapper-lg icon-wrapper-info group-hover:scale-110 transition-transform duration-300">
                    <BankIcon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-lg text-gray-800 mb-1">Tài khoản ngân hàng</div>
                    <div className="text-sm text-gray-600">Chuyển khoản QR (Miễn phí)</div>
                  </div>
                  <ArrowRightIcon className="w-5 h-5 text-blue-600 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </button>
            </div>
            <button
              onClick={() => {
                setShowAddPaymentModal(false);
                setEditingAccount(null);
                setSelectedPaymentType(null);
              }}
              className="w-full mt-6 px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Modal: Link Payment Account Form */}
      {showAddPaymentModal && selectedPaymentType && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4 overflow-y-auto py-8">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {selectedPaymentType === 'zalopay' ? (
                  <div className="icon-wrapper icon-wrapper-md icon-wrapper-primary">
                    <WalletIcon className="w-6 h-6 text-purple-600" />
                  </div>
                ) : (
                  <div className="icon-wrapper icon-wrapper-md icon-wrapper-info">
                    <BankIcon className="w-6 h-6 text-blue-600" />
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-800">
                  {editingAccount ? 'Sửa' : 'Liên kết'} {selectedPaymentType === 'zalopay' ? 'ZaloPay' : 'Tài khoản ngân hàng'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowAddPaymentModal(false);
                  setSelectedPaymentType(null);
                  setEditingAccount(null);
                  setZaloPayStatus(null);
                  setAccountNameLookupResult(null);
                  setLookingUpAccountName(false);
                }}
                className="icon-button p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <CloseIcon className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* ZaloPay Form */}
            {selectedPaymentType === 'zalopay' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">App ID *</label>
                    <input
                      type="text"
                      value={zaloPayConfig.zaloPayAppId}
                      onChange={(e) => setZaloPayConfig({ ...zaloPayConfig, zaloPayAppId: e.target.value })}
                      className="input-field w-full"
                      placeholder="Nhập App ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Merchant ID (tùy chọn)</label>
                    <input
                      type="text"
                      value={zaloPayConfig.zaloPayMerchantId}
                      onChange={(e) => setZaloPayConfig({ ...zaloPayConfig, zaloPayMerchantId: e.target.value })}
                      className="input-field w-full"
                      placeholder="Nếu trống sẽ dùng App ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Key 1 *</label>
                    <input
                      type="password"
                      value={zaloPayConfig.zaloPayKey1}
                      onChange={(e) => setZaloPayConfig({ ...zaloPayConfig, zaloPayKey1: e.target.value })}
                      className="input-field w-full"
                      placeholder={editingAccount?.data?.appId ? 'Nhập để thay đổi' : 'Nhập Key 1'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Key 2 (tùy chọn)</label>
                    <input
                      type="password"
                      value={zaloPayConfig.zaloPayKey2}
                      onChange={(e) => setZaloPayConfig({ ...zaloPayConfig, zaloPayKey2: e.target.value })}
                      className="input-field w-full"
                      placeholder={editingAccount?.data?.appId ? 'Nhập để thay đổi' : 'Nhập Key 2'}
                    />
                  </div>
                </div>
                <div>
                  <label className="inline-flex items-center gap-2 text-sm font-semibold">
                    <input
                      type="checkbox"
                      checked={zaloPayConfig.zaloPayIsActive}
                      onChange={(e) => setZaloPayConfig({ ...zaloPayConfig, zaloPayIsActive: e.target.checked })}
                    />
                    Bật thanh toán ZaloPay cho khách
                  </label>
                </div>

                {/* Verification Result */}
                {zaloPayStatus && (
                  <div className={`p-4 rounded-lg ${zaloPayStatus.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className={`font-semibold ${zaloPayStatus.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                      {zaloPayStatus.type === 'success' ? '✅' : '❌'} {zaloPayStatus.message}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-6">
                  <button
                    onClick={async () => {
                      setVerifyingZaloPay(true);
                      setZaloPayStatus(null);
                      try {
                        const res = await api.post('/zalopay/verify', {
                          zaloPayAppId: zaloPayConfig.zaloPayAppId,
                          zaloPayKey1: zaloPayConfig.zaloPayKey1,
                          zaloPayKey2: zaloPayConfig.zaloPayKey2,
                          zaloPayMerchantId: zaloPayConfig.zaloPayMerchantId
                        });
                        if (res.data.success) {
                          setZaloPayStatus({ type: 'success', message: 'Liên kết thành công! ZaloPay đã xác nhận thông tin.' });
                          toast.success('Liên kết ZaloPay thành công!');
                        } else {
                          setZaloPayStatus({ type: 'error', message: res.data.message || 'Liên kết thất bại' });
                        }
                      } catch (error) {
                        const msg = error.response?.data?.message || 'Liên kết thất bại. Kiểm tra App ID / Key 1 / Key 2.';
                        setZaloPayStatus({ type: 'error', message: msg });
                        toast.error(msg);
                      } finally {
                        setVerifyingZaloPay(false);
                      }
                    }}
                    disabled={verifyingZaloPay || !zaloPayConfig.zaloPayAppId || !zaloPayConfig.zaloPayKey1}
                    className="group relative flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-gray-600 to-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                    {verifyingZaloPay ? (
                      <>
                        <RefreshIcon className="w-4 h-4 relative z-10 animate-spin" />
                        <span className="relative z-10">Đang kiểm tra...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="w-4 h-4 relative z-10" />
                        <span className="relative z-10">Kiểm tra liên kết</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={async () => {
                      setSavingZaloPay(true);
                      try {
                        const payload = { ...zaloPayConfig };
                        const res = await api.put('/stores/my-store', payload);
                        if (res.data.success) {
                          toast.success(editingAccount ? 'Đã cập nhật ZaloPay' : 'Đã liên kết ZaloPay thành công!');
                          const storeRes = await api.get('/stores/my-store');
                          if (storeRes.data.success) {
                            useStore.setState({ store: storeRes.data.data });
                            setStoreData(storeRes.data.data);
                          }
                          setShowAddPaymentModal(false);
                          setSelectedPaymentType(null);
                          setEditingAccount(null);
                          setZaloPayStatus(null);
                        }
                      } catch (error) {
                        toast.error(error.response?.data?.message || 'Lưu thất bại');
                      } finally {
                        setSavingZaloPay(false);
                      }
                    }}
                    disabled={savingZaloPay || !zaloPayConfig.zaloPayAppId || !zaloPayConfig.zaloPayKey1}
                    className="group relative flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-purple-700 to-purple-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                    {savingZaloPay ? (
                      <>
                        <RefreshIcon className="w-4 h-4 relative z-10 animate-spin" />
                        <span className="relative z-10">Đang lưu...</span>
                      </>
                    ) : (
                      <>
                        <SaveIcon className="w-4 h-4 relative z-10" />
                        <span className="relative z-10">{editingAccount ? 'Cập nhật' : 'Lưu và liên kết'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Bank Transfer Form */}
            {selectedPaymentType === 'bank' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Số tài khoản *</label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={bankTransferConfig.bankAccountNumber}
                        onChange={(e) => {
                          // Get the raw input value
                          const rawValue = e.target.value;
                          // Only allow digits, remove any non-digit characters
                          let accountNumber = rawValue.replace(/\D/g, '');
                          // Ensure max length of 19 digits
                          if (accountNumber.length > 19) {
                            accountNumber = accountNumber.slice(0, 19);
                          }
                          
                          // Always update the account number immediately - don't let anything interfere
                          setBankTransferConfig(prev => ({ ...prev, bankAccountNumber: accountNumber }));
                          
                            // Clear lookup result if account number is too short
                          if (accountNumber.length < 8) {
                            setAccountNameLookupResult(null);
                            }
                          // Don't auto-lookup during typing - only on blur to avoid interrupting user
                        }}
                        onBlur={() => {
                          // Try lookup when user leaves the field (only then, not during typing)
                          const accountNumber = bankTransferConfig.bankAccountNumber;
                          if (accountNumber && accountNumber.length >= 8 && bankTransferConfig.bankCode && !editingAccount) {
                            handleLookupAccountName(accountNumber, bankTransferConfig.bankCode);
                          }
                        }}
                        className="input-field w-full"
                        placeholder="Nhập số tài khoản (chỉ số, tối đa 19 chữ số)"
                        maxLength={19}
                        // Don't disable input during lookup - let user continue typing
                      />
                      {lookingUpAccountName && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <RefreshIcon className="w-4 h-4 text-blue-600 animate-spin" />
                        </div>
                      )}
                    </div>
                    {accountNameLookupResult && (
                      <p className={`text-xs mt-1 ${accountNameLookupResult.success ? 'text-green-600' : 'text-gray-500'}`}>
                        {accountNameLookupResult.success ? (
                          <>✅ {accountNameLookupResult.message}</>
                        ) : (
                          <>ℹ️ {accountNameLookupResult.message}</>
                        )}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Tên chủ tài khoản *</label>
                    <input
                      type="text"
                      value={bankTransferConfig.bankAccountName}
                      onChange={(e) => setBankTransferConfig({ ...bankTransferConfig, bankAccountName: e.target.value })}
                      className="input-field w-full"
                      placeholder={lookingUpAccountName ? "Đang tra cứu..." : "Nhập tên chủ tài khoản"}
                      disabled={lookingUpAccountName}
                    />
                  </div>
                  <div className="md:col-span-2 relative">
                    <label className="block text-sm font-semibold mb-2">Tên ngân hàng *</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={bankSearchQuery}
                        onChange={(e) => {
                          const query = e.target.value;
                          setBankSearchQuery(query);
                          setShowBankDropdown(true);
                          if (query.trim()) {
                            api.get(`/bank-transfer/banks?search=${encodeURIComponent(query)}`)
                              .then(res => {
                                if (res.data.success) {
                                  setBankSearchResults(res.data.data);
                                }
                              })
                              .catch(err => console.error('Search banks error:', err));
                          } else {
                            setBankSearchResults([]);
                          }
                        }}
                        onFocus={() => {
                          setShowBankDropdown(true);
                          if (!bankSearchQuery.trim() && bankSearchResults.length === 0) {
                            api.get('/bank-transfer/banks')
                              .then(res => {
                                if (res.data.success) {
                                  setBankSearchResults(res.data.data);
                                }
                              })
                              .catch(err => console.error('Load banks error:', err));
                          }
                        }}
                        className="input-field w-full"
                        placeholder="Tìm kiếm ngân hàng..."
                      />
                      {showBankDropdown && bankSearchResults.length > 0 && (
                        <div 
                          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {bankSearchResults.map((bank) => (
                            <div
                              key={bank.code}
                              onClick={() => {
                                setBankSearchQuery(bank.shortName);
                                const newConfig = {
                                  ...bankTransferConfig,
                                  bankName: bank.shortName,
                                  bankCode: bank.code
                                };
                                setBankTransferConfig(newConfig);
                                setShowBankDropdown(false);
                                
                                // Auto lookup account name if account number is already entered
                                if (newConfig.bankAccountNumber && newConfig.bankAccountNumber.length >= 8 && !editingAccount) {
                                  handleLookupAccountName(newConfig.bankAccountNumber, bank.code);
                                }
                              }}
                              className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-semibold text-sm">{bank.shortName}</div>
                              <div className="text-xs text-gray-500">{bank.name}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {bankTransferConfig.bankCode && (
                      <p className="text-xs text-green-600 mt-1">
                        ✅ Đã chọn: {bankTransferConfig.bankName} (Mã: {bankTransferConfig.bankCode})
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="inline-flex items-center gap-2 text-sm font-semibold">
                    <input
                      type="checkbox"
                      checked={bankTransferConfig.bankTransferQRIsActive}
                      onChange={(e) => setBankTransferConfig({ ...bankTransferConfig, bankTransferQRIsActive: e.target.checked })}
                    />
                    Bật thanh toán Chuyển khoản QR cho khách
                  </label>
                </div>

                <div className="flex gap-3 pt-6">
                  <button
                    onClick={() => {
                      setShowAddPaymentModal(false);
                      setSelectedPaymentType(null);
                      setEditingAccount(null);
                      setAccountNameLookupResult(null);
                      setLookingUpAccountName(false);
                    }}
                    className="flex-1 px-5 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors duration-200"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={async () => {
                      setSavingBankTransfer(true);
                      try {
                        const payload = { ...bankTransferConfig };
                        const res = await api.put('/stores/my-store', payload);
                        if (res.data.success) {
                          toast.success(editingAccount ? 'Đã cập nhật tài khoản ngân hàng' : 'Đã liên kết tài khoản ngân hàng thành công!');
                          const storeRes = await api.get('/stores/my-store');
                          if (storeRes.data.success) {
                            useStore.setState({ store: storeRes.data.data });
                            setStoreData(storeRes.data.data);
                          }
                          setShowAddPaymentModal(false);
                          setSelectedPaymentType(null);
                          setEditingAccount(null);
                          setAccountNameLookupResult(null);
                          setLookingUpAccountName(false);
                        }
                      } catch (error) {
                        toast.error(error.response?.data?.message || 'Lưu thất bại');
                      } finally {
                        setSavingBankTransfer(false);
                      }
                    }}
                    disabled={savingBankTransfer || !bankTransferConfig.bankAccountNumber || !bankTransferConfig.bankAccountName || !bankTransferConfig.bankName}
                    className="group relative flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                    {savingBankTransfer ? (
                      <>
                        <RefreshIcon className="w-4 h-4 relative z-10 animate-spin" />
                        <span className="relative z-10">Đang lưu...</span>
                      </>
                    ) : (
                      <>
                        <SaveIcon className="w-4 h-4 relative z-10" />
                        <span className="relative z-10">{editingAccount ? 'Cập nhật' : 'Lưu và liên kết'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Confirm Delete */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scaleIn">
            <div className="flex items-center justify-center mb-4">
              <div className="icon-wrapper icon-wrapper-lg icon-wrapper-danger">
                <AlertCircleIcon className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2 text-center text-gray-800">Xác nhận xóa</h3>
            <p className="text-gray-600 mb-6 text-center">
              Bạn có chắc chắn muốn xóa tài khoản {showDeleteConfirm === 'zalopay' ? 'ZaloPay' : 'ngân hàng'} này? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-5 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors duration-200"
              >
                Hủy
              </button>
              <button
                onClick={async () => {
                  try {
                    if (showDeleteConfirm === 'zalopay') {
                      const res = await api.put('/stores/my-store', {
                        zaloPayAppId: null,
                        zaloPayKey1: null,
                        zaloPayKey2: null,
                        zaloPayMerchantId: null,
                        zaloPayIsActive: false
                      });
                      if (res.data.success) {
                        toast.success('Đã xóa tài khoản ZaloPay');
                      }
                    } else {
                      const res = await api.put('/stores/my-store', {
                        bankAccountNumber: null,
                        bankAccountName: null,
                        bankName: null,
                        bankCode: null,
                        bankTransferQRIsActive: false
                      });
                      if (res.data.success) {
                        toast.success('Đã xóa tài khoản ngân hàng');
                      }
                    }
                    const storeRes = await api.get('/stores/my-store');
                    if (storeRes.data.success) {
                      useStore.setState({ store: storeRes.data.data });
                      setStoreData(storeRes.data.data);
                    }
                    setShowDeleteConfirm(null);
                  } catch (error) {
                    toast.error('Xóa thất bại');
                  }
                }}
                className="group relative flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                <DeleteIcon className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Xóa</span>
              </button>
            </div>
          </div>
        </div>
      )}
      </>
    </Layout>
  );
}
