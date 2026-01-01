import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../../lib/api';
import { useCart } from '../../lib/store';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import ItemCard from '../../components/ItemCard';
import ReviewCard from '../../components/ReviewCard';
import ReviewForm from '../../components/ReviewForm';
import StarRating from '../../components/StarRating';
import { formatVND, formatVNDNumber } from '../../lib/utils';
import { DishIcon, MapPinIcon, PhoneIcon } from '../../components/Icons';

export default function StorePage() {
  const router = useRouter();
  const { slug } = router.query;
  const { addItem, items: cartItems, clearCart, removeItem, updateItem } = useCart();
  const [store, setStore] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [itemsInCategory, setItemsInCategory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showItemDetail, setShowItemDetail] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [quantity, setQuantity] = useState(1);
  // { [accompanimentId]: quantity }
  const [selectedAccompaniments, setSelectedAccompaniments] = useState({});
  const [itemNote, setItemNote] = useState('');
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewTotalPages, setReviewTotalPages] = useState(1);
  const [showMobileCart, setShowMobileCart] = useState(false);

  // Chuẩn hoá optionValues từ backend (có thể là string JSON, number, object, null...)
  const normalizeOptionValues = (values) => {
    if (!values) return [];

    let arr = [];
    if (Array.isArray(values)) {
      arr = values;
    } else if (typeof values === 'string') {
      // Trường hợp backend lưu dưới dạng chuỗi JSON: "[{...}, {...}]"
      const trimmed = values.trim();
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            arr = parsed;
          } else if (parsed && typeof parsed === 'object') {
            arr = Object.values(parsed);
          } else {
            arr = [values];
          }
        } catch {
          arr = [values];
        }
      } else {
        arr = [values];
      }
    } else if (typeof values === 'object') {
      // Trường hợp Sequelize lưu JSON dạng object: { "0": {...}, "1": {...} }
      arr = Object.values(values);
    } else if (typeof values === 'number') {
      arr = [values];
    }

    return arr.map((v) => {
      if (typeof v === 'string' || typeof v === 'number') {
        return { name: String(v), price: 0 };
      }
      return {
        name: typeof v?.name === 'string' ? v.name : '',
        price: Number(v?.price) || 0,
      };
    });
  };

  useEffect(() => {
    if (!slug) return;
    fetchStoreData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    if (store?.id) {
      fetchReviews();
      fetchReviewStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store]);

  const fetchStoreData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/stores/slug/${slug}`);
      if (res.data.success) {
        setStore(res.data.data.store);

        // Chuẩn hóa dữ liệu categories/items để luôn có ItemOptions & accompaniments
        const rawCategories = res.data.data.categories || [];
        const mappedCategories = rawCategories.map((cat) => ({
          ...cat,
          items: (cat.items || []).map((item) => ({
            ...item,
            // Đảm bảo front-end luôn dùng ItemOptions
            ItemOptions: item.ItemOptions || item.options || [],
            // Đảm bảo accompaniments tồn tại dạng mảng
            accompaniments: item.accompaniments || item.ItemAccompaniments || item.item_accompaniments || [],
          })),
        }));

        setCategories(mappedCategories);
        if (mappedCategories.length > 0) {
          setSelectedCategory(mappedCategories[0].id);
          setItemsInCategory(mappedCategories[0].items);
        }
      }
    } catch (error) {
      toast.error('Không tìm thấy cửa hàng');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (page = 1) => {
    if (!store?.id) return;
    try {
      setLoadingReviews(true);
      const res = await api.get(`/reviews/store/${store.id}?page=${page}&limit=10&sort=newest`);
      if (res.data.success) {
        if (page === 1) {
          setReviews(res.data.data.reviews);
        } else {
          setReviews(prev => [...prev, ...res.data.data.reviews]);
        }
        setReviewTotalPages(res.data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const fetchReviewStats = async () => {
    if (!store?.id) return;
    try {
      const res = await api.get(`/reviews/store/${store.id}?page=1&limit=1`);
      // Calculate stats from reviews
      if (res.data.success && res.data.data.reviews.length > 0) {
        // We'll get stats from the store data if available
        // Or calculate from reviews
      }
    } catch (error) {
      // Ignore
    }
  };

  const handleReviewSubmit = (review) => {
    setReviews(prev => [review, ...prev]);
    setShowReviewForm(false);
    toast.success('Cảm ơn bạn đã đánh giá!');
    // Refresh reviews
    fetchReviews(1);
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    const category = categories.find((c) => c.id === categoryId);
    setItemsInCategory(category?.items || []);
  };

  const handleAddToCart = (item) => {
    // Nếu món có giới hạn tồn kho và đã hết -> không cho mở popup chọn món
    if (item.remainingStock !== null && item.remainingStock !== undefined) {
      const stock = Number(item.remainingStock);
      if (!Number.isNaN(stock) && stock <= 0) {
        toast.error('Món này đã hết, vui lòng chọn món khác.');
        return;
      }
    }

    setShowItemDetail(item);

    // Khởi tạo sẵn lựa chọn mặc định cho các option bắt buộc (ví dụ Size)
    const defaultOptions = {};
    (item.ItemOptions || []).forEach((option) => {
      const values = normalizeOptionValues(option.optionValues);
      if (option.optionType === 'select' && option.isRequired && values.length > 0) {
        // Không set mặc định nếu khách chưa chọn, để bắt buộc chọn rõ ràng
        // defaultOptions[option.id] = values[0].name;
      }
    });

    setSelectedOptions(defaultOptions);
    setQuantity(1);
    setSelectedAccompaniments({});
    setItemNote('');
  };

  const handleConfirmAddToCart = () => {
    if (!showItemDetail) return;
    const item = showItemDetail;
    const basePrice = parseFloat(item.itemPrice || 0);

    // Validate required options (ví dụ bắt buộc chọn Size)
    const missingRequired = (item.ItemOptions || []).filter(
      (option) =>
        option.isRequired &&
        option.optionType === 'select' &&
        (!selectedOptions[option.id] || selectedOptions[option.id] === '')
    );

    if (missingRequired.length > 0) {
      const names = missingRequired.map((o) => o.optionName).join(', ');
      toast.error(`Vui lòng chọn: ${names}`);
      return;
    }
    
    // Calculate additional price from options
    let optionsPrice = 0;
    Object.entries(selectedOptions).forEach(([optionId, selectedValue]) => {
      const option = item.ItemOptions?.find((o) => o.id === parseInt(optionId));
      if (option) {
        const values = normalizeOptionValues(option.optionValues);
        const value = values.find((v) => v.name === selectedValue);
        if (value?.price) {
          optionsPrice += parseFloat(value.price);
        }
      }
    });

    // Calculate additional price from accompaniments (toppings with quantity)
    let accompanimentsPrice = 0;
    const selectedAccompanimentsList = [];
    Object.entries(selectedAccompaniments).forEach(([accompanimentId, qtyValue]) => {
      const qty = Math.max(0, parseInt(qtyValue) || 0);
      if (qty > 0) {
        const accompaniment = item.accompaniments?.find((a) => a.id === parseInt(accompanimentId));
        if (accompaniment) {
          const unitPrice = parseFloat(accompaniment.accompanimentPrice || 0);
          accompanimentsPrice += unitPrice * qty;
          selectedAccompanimentsList.push({
            id: accompaniment.id,
            name: accompaniment.accompanimentName,
            price: unitPrice,
            quantity: qty,
          });
        }
      }
    });

    const itemPrice = basePrice + optionsPrice + accompanimentsPrice;
    const qty = quantity || 1;

    // Nếu món có giới hạn tồn kho, giới hạn số lượng tối đa ngay ở front để UX rõ ràng
    if (item.remainingStock !== null && item.remainingStock !== undefined) {
      const stock = Number(item.remainingStock);
      if (!Number.isNaN(stock) && qty > stock) {
        toast.error(`Món "${item.itemName}" chỉ còn ${stock} phần. Vui lòng giảm số lượng.`);
        return;
      }
    }

    // Build human-readable option labels for display (keep numeric-keyed selectedOptions for backend)
    const selectedOptionsDisplay = {};
    Object.entries(selectedOptions).forEach(([optionId, selectedValue]) => {
      const option = item.ItemOptions?.find((o) => o.id === parseInt(optionId));
      const optionName = option?.optionName || `Option ${optionId}`;
      if (selectedValue) {
        selectedOptionsDisplay[optionName] = selectedValue;
      }
    });

    const cartItem = {
      id: `${item.id}-${Math.random()}`,
      itemId: item.id,
      name: item.itemName,
      basePrice: itemPrice,
      quantity: qty,
      subtotal: itemPrice * qty,
      selectedOptions: selectedOptions,
      selectedOptionsDisplay,
      selectedAccompaniments: selectedAccompanimentsList,
      notes: itemNote || '',
      itemImage: item.itemImage,
    };

    addItem(cartItem);
    toast.success('Đã thêm vào giỏ hàng!');
    setShowItemDetail(null);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container-custom py-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p>Đang tải cửa hàng...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!store) {
    return (
      <Layout>
        <div className="container-custom py-8 text-center">
          <p className="text-red-600 font-bold">Không tìm thấy cửa hàng</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{store.storeName} - MenuOrder</title>
      </Head>

      {/* Store Header with Banner Image - Professional Design */}
      <div className="relative mb-4 md:mb-6 overflow-hidden rounded-b-2xl md:rounded-b-3xl shadow-2xl group">
        {/* Store Banner/Image Background */}
        {store.storeImage ? (
          <div className="relative h-56 md:h-72 w-full overflow-hidden">
            <img 
              src={(() => {
                if (store.storeImage.startsWith('http')) {
                  return store.storeImage;
                }
                const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5002';
                const imagePath = store.storeImage.startsWith('/') ? store.storeImage : '/' + store.storeImage;
                return apiBase + imagePath;
              })()}
              alt={store.storeName}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.className = 'relative h-56 md:h-72 w-full bg-gradient-to-r from-purple-500 via-purple-400 to-purple-300';
              }}
            />
            {/* Professional Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"></div>
            {/* Subtle Pattern Overlay */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }}></div>
          </div>
        ) : (
          <div className="relative h-56 md:h-72 w-full bg-gradient-to-r from-purple-500 via-purple-400 to-purple-300 overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>
            {/* Pattern overlay for gradient background */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.2) 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }}></div>
          </div>
        )}
        
        {/* Store Info Overlay - Professional Design */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 z-10">
          <div className="container-custom">
            <div className="flex items-end gap-3 md:gap-4 animate-fadeIn">
              {/* Logo - Left with Professional Styling */}
              <div className="relative flex-shrink-0 transform transition-transform duration-300 hover:scale-105">
                {store.storeLogo ? (
                  <div className="relative">
                    <img 
                      src={(() => {
                        if (store.storeLogo.startsWith('http')) {
                          return store.storeLogo;
                        }
                        const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5002';
                        const logoPath = store.storeLogo.startsWith('/') ? store.storeLogo : '/' + store.storeLogo;
                        return apiBase + logoPath;
                      })()}
                      alt={store.storeName}
                      className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover shadow-2xl ring-4 ring-white/90 backdrop-blur-sm"
                      onError={(e) => {
                        e.target.src = '/logo.jpg';
                      }}
                    />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent"></div>
                  </div>
                ) : (
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl ring-4 ring-white/90">
                    <span className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                      {(store.storeName || 'S')[0].toUpperCase()}
                    </span>
                  </div>
                )}
                {/* Status Indicator */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-green-400 rounded-full border-[3px] border-white shadow-lg animate-pulse"></div>
              </div>
              
              {/* Store Info - Professional Typography */}
              <div className="flex-1 text-white pb-1 min-w-0">
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-1.5 md:mb-2 drop-shadow-2xl leading-tight break-words line-clamp-2 tracking-tight">
                  {store.storeName}
                </h1>
                
                {/* Rating Display - Compact */}
                {store.averageRating > 0 && (
                  <div className="flex items-center gap-2 mb-1.5">
                    <StarRating rating={store.averageRating} readonly size="sm" />
                    <span className="text-xs md:text-sm font-semibold text-white drop-shadow-md">
                      {store.averageRating.toFixed(1)}
                    </span>
                    <span className="text-xs text-white/80 drop-shadow-md">
                      ({store.totalReviews || 0})
                    </span>
                  </div>
                )}
                
                {(store.storeDetailedAddress || store.storeAddress) && (
                  <div className="flex items-start gap-1.5 mb-1.5">
                    <MapPinIcon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 mt-0.5 drop-shadow-md" />
                    <span className="text-xs md:text-sm text-white/95 drop-shadow-md leading-tight line-clamp-2 font-medium">
                      {store.storeDetailedAddress || store.storeAddress}
                    </span>
                  </div>
                )}
                {store.storePhone && (
                  <div className="flex items-center gap-1.5">
                    <PhoneIcon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 drop-shadow-md" />
                    <span className="text-xs md:text-sm text-white/95 drop-shadow-md font-medium">{store.storePhone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Mobile: Categories Horizontal Scroll */}
      <div className="md:hidden mb-4 sticky top-0 z-30 bg-gray-50 pt-2 pb-3 -mx-4 px-4">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {categories.map((category, index) => (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.id)}
              className={`flex-shrink-0 px-5 py-3 rounded-xl transition-all font-bold text-sm whitespace-nowrap min-w-[80px] ${
                selectedCategory === category.id
                  ? 'gradient-teal text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 shadow-md active:scale-95'
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  selectedCategory === category.id ? 'bg-white text-purple-600' : 'bg-purple-100 text-purple-600'
                }`}>
                  {index + 1}
                </span>
                {category.categoryName}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="container-custom py-4 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
          {/* Desktop: Categories Sidebar */}
          <div className="hidden md:block md:col-span-1">
            <div className="card sticky top-4">
              <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                <span className="text-2xl">📋</span>
                Danh mục
              </h2>
              <div className="space-y-2">
                {categories.map((category, index) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all font-medium flex items-center gap-2 ${
                      selectedCategory === category.id
                        ? 'gradient-teal text-white shadow-lg transform scale-105'
                        : 'bg-gray-50 hover:bg-purple-50 text-gray-700 hover:text-purple-700 hover:shadow-md'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      selectedCategory === category.id ? 'bg-white text-purple-600' : 'bg-purple-100 text-purple-600'
                    }`}>
                      {index + 1}
                    </span>
                    {category.categoryName}
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop: Cart Summary */}
            <div className="card mt-4">
              <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
                <span className="text-2xl">🛒</span>
                Giỏ hàng
              </h3>
              {cartItems.length === 0 ? (
                <p className="text-gray-600 text-sm">Giỏ hàng trống</p>
              ) : (
                <>
                  <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                    {cartItems.map((item) => (
                      <div key={item.id} className="border-b pb-2 last:border-0">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className="font-bold text-sm truncate flex-1">{item.name}</p>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center text-xs font-bold transition-colors active:scale-95"
                                title="Xóa món"
                              >
                                ×
                              </button>
                            </div>
                            {item.selectedOptionsDisplay && Object.keys(item.selectedOptionsDisplay).length > 0 ? (
                              <p className="text-xs text-gray-500 truncate mt-0.5">
                                {Object.entries(item.selectedOptionsDisplay).map(([k, v]) => `${k}: ${v}`).join(', ')}
                              </p>
                            ) : item.selectedOptions && Object.keys(item.selectedOptions).length > 0 ? (
                              <p className="text-xs text-gray-500 truncate mt-0.5">
                                Size / tuỳ chọn: {Object.values(item.selectedOptions).filter(Boolean).join(', ')}
                              </p>
                            ) : null}
                            {item.selectedAccompaniments && item.selectedAccompaniments.length > 0 && (
                              <p className="text-xs text-gray-500 truncate">
                                {item.selectedAccompaniments
                                  .map((acc) => `${acc.quantity && acc.quantity > 0 ? `${acc.quantity} × ` : ''}${acc.name}${acc.price ? ` (${formatVND(acc.price)} / phần)` : ''}`)
                                  .join(', ')}
                              </p>
                            )}
                            {item.notes && (
                              <p className="text-xs text-blue-600 italic truncate">
                                {item.notes}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-gray-600">SL:</span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => updateItem(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                    item.quantity <= 1
                                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700 active:scale-95'
                                  }`}
                                >
                                  −
                                </button>
                                <span className="text-xs font-semibold text-gray-700 min-w-[20px] text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateItem(item.id, item.quantity + 1)}
                                  className="w-6 h-6 rounded-full bg-purple-500 hover:bg-purple-600 text-white flex items-center justify-center text-xs font-bold transition-all active:scale-95"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                          <p className="font-bold text-sm whitespace-nowrap ml-2">
                            {formatVND(item.subtotal)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center font-bold mb-3">
                      <span>Tổng:</span>
                      <span className="text-purple-600 text-lg">
                        {formatVND(cartItems
                          .reduce((acc, item) => acc + item.subtotal, 0))}
                      </span>
                    </div>
                    <button
                      onClick={() => router.push(`/checkout?store=${slug}`)}
                      className="btn btn-primary w-full mb-2 btn-ripple scale-on-hover"
                    >
                      Thanh toán
                    </button>
                    <button
                      onClick={() => clearCart()}
                      className="btn btn-secondary w-full text-sm btn-ripple scale-on-hover"
                    >
                      Xóa giỏ hàng
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Items Grid */}
          <div className="md:col-span-3 pb-24 md:pb-0">
            {itemsInCategory.length === 0 ? (
              <p className="text-gray-600 text-center py-8 text-sm">Không có món nào trong danh mục này</p>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 md:gap-3">
                {itemsInCategory.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile: Floating Cart Button */}
      {cartItems.length > 0 && (
        <>
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t-2 border-purple-300 z-40 safe-area-inset-bottom">
            <div className="py-3 px-4">
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => setShowMobileCart(true)}
                  className="flex items-center gap-2 flex-1 min-w-0 text-left"
                >
                  <span className="text-2xl flex-shrink-0">🛒</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-gray-800 leading-tight">
                      {cartItems.length} món
                    </p>
                    <p className="text-xs text-gray-600 leading-tight">
                      Tổng: <span className="font-bold text-purple-600 text-sm sm:text-base leading-none inline-block">
                        {formatVND(cartItems.reduce((acc, item) => acc + item.subtotal, 0))}
                      </span>
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => router.push(`/checkout?store=${slug}`)}
                  className="btn btn-primary px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-bold flex-shrink-0 btn-ripple scale-on-hover"
                >
                  Thanh toán
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Cart Drawer */}
          {showMobileCart && (
            <div className="md:hidden fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 animate-fadeIn">
              <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col animate-slideUp cart-drawer">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <span className="text-2xl">🛒</span>
                    Giỏ hàng ({cartItems.length})
                  </h3>
                  <button
                    onClick={() => setShowMobileCart(false)}
                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg font-bold transition-colors"
                  >
                    ×
                  </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4">
                  {cartItems.length === 0 ? (
                    <p className="text-gray-600 text-sm text-center py-8">Giỏ hàng trống</p>
                  ) : (
                    <div className="space-y-3">
                      {cartItems.map((item) => (
                        <div key={item.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <p className="font-bold text-sm flex-1">{item.name}</p>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center text-sm font-bold transition-colors active:scale-95"
                              title="Xóa món"
                            >
                              ×
                            </button>
                          </div>
                          
                          {item.selectedOptionsDisplay && Object.keys(item.selectedOptionsDisplay).length > 0 ? (
                            <p className="text-xs text-gray-500 mb-1">
                              {Object.entries(item.selectedOptionsDisplay).map(([k, v]) => `${k}: ${v}`).join(', ')}
                            </p>
                          ) : item.selectedOptions && Object.keys(item.selectedOptions).length > 0 ? (
                            <p className="text-xs text-gray-500 mb-1">
                              Size / tuỳ chọn: {Object.values(item.selectedOptions).filter(Boolean).join(', ')}
                            </p>
                          ) : null}
                          {item.selectedAccompaniments && item.selectedAccompaniments.length > 0 && (
                            <p className="text-xs text-gray-500 mb-1">
                              {item.selectedAccompaniments
                                .map((acc) => `${acc.quantity && acc.quantity > 0 ? `${acc.quantity} × ` : ''}${acc.name}${acc.price ? ` (${formatVND(acc.price)} / phần)` : ''}`)
                                .join(', ')}
                            </p>
                          )}
                          {item.notes && (
                            <p className="text-xs text-blue-600 italic mb-2">
                              {item.notes}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-gray-600">Số lượng:</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateItem(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                                  item.quantity <= 1
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700 active:scale-95'
                                }`}
                              >
                                −
                              </button>
                              <span className="text-sm font-semibold text-gray-700 min-w-[24px] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateItem(item.id, item.quantity + 1)}
                                className="w-7 h-7 rounded-full bg-purple-500 hover:bg-purple-600 text-white flex items-center justify-center text-sm font-bold transition-all active:scale-95"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                            <span className="text-xs text-gray-600">Thành tiền:</span>
                            <p className="font-bold text-sm text-purple-600">
                              {formatVND(item.subtotal)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                {cartItems.length > 0 && (
                  <div className="border-t border-gray-200 p-4 bg-white">
                    <div className="flex justify-between items-center font-bold mb-3">
                      <span>Tổng cộng:</span>
                      <span className="text-purple-600 text-lg">
                        {formatVND(cartItems.reduce((acc, item) => acc + item.subtotal, 0))}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          clearCart();
                          setShowMobileCart(false);
                        }}
                        className="btn btn-secondary flex-1 text-sm btn-ripple scale-on-hover"
                      >
                        Xóa giỏ hàng
                      </button>
                      <button
                        onClick={() => {
                          setShowMobileCart(false);
                          router.push(`/checkout?store=${slug}`);
                        }}
                        className="btn btn-primary flex-1 btn-ripple scale-on-hover"
                      >
                        Thanh toán
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Item Detail Modal */}
      {showItemDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-t-3xl md:rounded-2xl max-w-md w-full p-4 md:p-6 shadow-2xl relative overflow-hidden max-h-[85vh] md:max-h-[90vh] overflow-y-auto">
            <div className="relative z-10">
              {/* Close button */}
              <button
                onClick={() => setShowItemDetail(null)}
                className="absolute top-2 right-2 w-8 h-8 md:w-10 md:h-10 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-lg md:text-xl font-bold transition-colors z-20"
              >
                ×
              </button>
              
              {/* Header with price */}
              <div className="mb-4 pr-10">
                <h2 className="text-xl md:text-2xl font-bold mb-2 text-gray-800">{showItemDetail.itemName}</h2>
                <p className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                  {formatVND(showItemDetail.itemPrice)}
                </p>
              </div>
              {showItemDetail.itemDescription && (
                <p className="text-gray-600 mb-4 leading-relaxed text-xs md:text-sm pb-3 border-b border-gray-200">{showItemDetail.itemDescription}</p>
              )}

            {/* Quantity Selector */}
            <div className="mb-4">
              <label className="block font-semibold mb-2 text-sm">
                Số lượng <span className="text-red-600">*</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold text-gray-700 transition-all active:scale-95"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 md:w-24 text-center border-2 border-purple-200 rounded-lg px-2 py-2 md:py-2.5 font-bold text-base md:text-lg focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-purple-500 hover:bg-purple-600 flex items-center justify-center font-bold text-white transition-all active:scale-95"
                >
                  +
                </button>
              </div>
            </div>

            {/* Options (Size, Đá, ... ) */}
            {showItemDetail.ItemOptions && showItemDetail.ItemOptions.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2 text-sm">Tùy chọn</h3>
                <div className="space-y-3">
                  {showItemDetail.ItemOptions.map((option) => (
                    <div key={option.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="font-semibold text-xs text-gray-800">
                          {option.optionName}{' '}
                          {option.isRequired && <span className="text-red-600">*</span>}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {option.isRequired ? 'Chọn 1' : 'Có thể bỏ qua'}
                        </p>
                      </div>

                      {option.optionType === 'select' && option.optionValues && normalizeOptionValues(option.optionValues).length > 0 && (
                        <div className="space-y-1.5">
                          {normalizeOptionValues(option.optionValues).map((value) => (
                            <label
                              key={value.name}
                              className="flex items-center justify-between p-2.5 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-all"
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`option-${option.id}`}
                                  value={value.name}
                                  checked={selectedOptions[option.id] === value.name}
                                  onChange={() =>
                                    setSelectedOptions((prev) => ({
                                      ...prev,
                                      [option.id]: value.name,
                                    }))
                                  }
                                  className="w-4 h-4 text-purple-600 focus:ring-purple-500 focus:ring-2"
                                />
                                <span className="text-xs md:text-sm font-medium text-gray-800">
                                  {value.name}
                                </span>
                              </div>
                              <span className="text-xs md:text-sm font-semibold text-purple-600">
                                {value.price
                                  ? `+${formatVND(value.price)}`
                                  : 'Không thêm tiền'}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Accompaniments (Món ăn kèm) với số lượng */}
            {showItemDetail.accompaniments && showItemDetail.accompaniments.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2 text-sm text-gray-800 flex items-center gap-1.5">
                  <DishIcon className="w-4 h-4 text-purple-600" strokeWidth={2} />
                  Món ăn kèm
                </h3>
                <div className="space-y-2">
                  {showItemDetail.accompaniments.map((accompaniment) => {
                    const qty = selectedAccompaniments[accompaniment.id] || 0;
                    const unitPrice = parseFloat(accompaniment.accompanimentPrice || 0);
                    return (
                      <div
                        key={accompaniment.id}
                        className={`flex items-center justify-between p-2.5 md:p-3 border rounded-lg transition-all ${
                          qty > 0
                            ? 'border-purple-400 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-sm text-gray-800">
                            {accompaniment.accompanimentName}
                          </span>
                          <span className="text-xs text-gray-500">
                            +{formatVND(unitPrice)} / 1 phần
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedAccompaniments((prev) => {
                                const current = prev[accompaniment.id] || 0;
                                const next = Math.max(0, current - 1);
                                return { ...prev, [accompaniment.id]: next };
                              })
                            }
                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm font-bold text-gray-700 active:scale-95"
                          >
                            −
                          </button>
                          <span className="min-w-[24px] text-center text-sm font-semibold text-gray-800">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedAccompaniments((prev) => {
                                const current = prev[accompaniment.id] || 0;
                                const next = current + 1;
                                return { ...prev, [accompaniment.id]: next };
                              })
                            }
                            className="w-8 h-8 rounded-full bg-purple-500 hover:bg-purple-600 flex items-center justify-center text-sm font-bold text-white active:scale-95"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Notes for Item */}
            <div className="mb-4">
              <label className="block font-semibold mb-1.5 text-xs text-gray-700 flex items-center gap-1.5">
                <span className="text-sm">📝</span>
                Ghi chú (nếu cần)
              </label>
              <textarea
                value={itemNote}
                onChange={(e) => setItemNote(e.target.value)}
                className="input-field text-sm py-2"
                rows="2"
                placeholder="Ví dụ: Không cay, ít đường..."
              ></textarea>
            </div>

            {/* Price Display - Compact */}
            <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-sm text-gray-700">Tổng ({quantity} món):</span>
                <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                  {formatVND((
                    parseFloat(showItemDetail.itemPrice) +
                    Object.entries(selectedOptions).reduce((sum, [optionId, selectedValue]) => {
                      const option = showItemDetail.ItemOptions?.find((o) => o.id === parseInt(optionId));
                      if (option) {
                        const values = normalizeOptionValues(option.optionValues);
                        const value = values.find((v) => v.name === selectedValue);
                        if (value?.price) {
                          return sum + parseFloat(value.price);
                        }
                      }
                      return sum;
                    }, 0) +
                    Object.entries(selectedAccompaniments).reduce((sum, [accId, qtyValue]) => {
                      const qty = Math.max(0, parseInt(qtyValue) || 0);
                      if (qty > 0) {
                        const acc = showItemDetail.accompaniments?.find((a) => a.id === parseInt(accId));
                        if (acc) {
                          return sum + qty * parseFloat(acc.accompanimentPrice || 0);
                        }
                      }
                      return sum;
                    }, 0)
                  ) * quantity)}
                </span>
              </div>
            </div>

            <div className="flex gap-2 mt-4 sticky bottom-0 bg-white pt-3 pb-2 -mb-4">
              <button
                onClick={() => setShowItemDetail(null)}
                className="btn btn-secondary flex-1 py-2.5 font-semibold text-sm"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmAddToCart}
                className="btn btn-primary flex-1 py-2.5 font-semibold text-sm btn-ripple scale-on-hover"
              >
                Thêm vào giỏ
              </button>
            </div>
            </div>
          </div>
        </div>
      )}

      {/* Reviews Section - Compact Mobile Design */}
      {store && (
        <div className="container-custom py-4 md:py-6">
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            {/* Header - Compact */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <h2 className="text-base md:text-lg font-bold text-gray-800 mb-2">Đánh Giá</h2>
                {/* Average Rating Display */}
                {store.averageRating > 0 && (
                  <div className="flex items-center gap-2">
                    <StarRating rating={store.averageRating} readonly size="sm" />
                    <span className="text-sm md:text-base font-semibold text-gray-800">
                      {parseFloat(store.averageRating).toFixed(1)}
                    </span>
                    <span className="text-xs md:text-sm text-gray-500">
                      ({store.totalReviews || 0} đánh giá)
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="px-3 py-1.5 md:px-4 md:py-2 bg-purple-600 text-white text-xs md:text-sm font-semibold rounded-lg hover:bg-purple-700 transition active:scale-95 flex-shrink-0 ml-3"
              >
                {showReviewForm ? 'Hủy' : 'Viết đánh giá'}
              </button>
            </div>

            {/* Review Form - Compact */}
            {showReviewForm && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <ReviewForm
                  storeId={store.id}
                  onSuccess={handleReviewSubmit}
                  onCancel={() => setShowReviewForm(false)}
                />
              </div>
            )}

            {/* Reviews List - Compact */}
            {reviews.length > 0 ? (
              <div className="space-y-3">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                    <ReviewCard review={review} />
                  </div>
                ))}
                
                {reviewPage < reviewTotalPages && (
                  <button
                    onClick={() => {
                      const nextPage = reviewPage + 1;
                      setReviewPage(nextPage);
                      fetchReviews(nextPage);
                    }}
                    disabled={loadingReviews}
                    className="w-full py-2 text-sm text-purple-600 font-medium hover:bg-purple-50 rounded-lg transition"
                  >
                    {loadingReviews ? 'Đang tải...' : 'Xem thêm đánh giá'}
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 text-sm">
                <p>Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
