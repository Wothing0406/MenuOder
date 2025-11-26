import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../../lib/api';
import { useCart } from '../../lib/store';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import ItemCard from '../../components/ItemCard';
import { formatVND, formatVNDNumber } from '../../lib/utils';

export default function StorePage() {
  const router = useRouter();
  const { slug } = router.query;
  const { addItem, items: cartItems, clearCart } = useCart();
  const [store, setStore] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [itemsInCategory, setItemsInCategory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showItemDetail, setShowItemDetail] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [selectedAccompaniments, setSelectedAccompaniments] = useState({});
  const [itemNote, setItemNote] = useState('');

  useEffect(() => {
    if (!slug) return;
    fetchStoreData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const fetchStoreData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/stores/slug/${slug}`);
      if (res.data.success) {
        setStore(res.data.data.store);
        setCategories(res.data.data.categories);
        if (res.data.data.categories.length > 0) {
          setSelectedCategory(res.data.data.categories[0].id);
          setItemsInCategory(res.data.data.categories[0].items);
        }
      }
    } catch (error) {
      toast.error('Không tìm thấy cửa hàng');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    const category = categories.find((c) => c.id === categoryId);
    setItemsInCategory(category?.items || []);
  };

  const handleAddToCart = (item) => {
    setShowItemDetail(item);
    setSelectedOptions({});
    setQuantity(1);
    setSelectedAccompaniments({});
    setItemNote('');
  };

  const handleConfirmAddToCart = () => {
    if (!showItemDetail) return;
    const item = showItemDetail;
    const basePrice = parseFloat(item.itemPrice || 0);
    
    // Calculate additional price from options
    let optionsPrice = 0;
    Object.entries(selectedOptions).forEach(([optionId, selectedValue]) => {
      const option = item.ItemOptions?.find((o) => o.id === parseInt(optionId));
      if (option?.optionValues && Array.isArray(option.optionValues)) {
        const value = option.optionValues.find((v) => v.name === selectedValue);
        if (value?.price) {
          optionsPrice += parseFloat(value.price);
        }
      }
    });

    // Calculate additional price from accompaniments
    let accompanimentsPrice = 0;
    const selectedAccompanimentsList = [];
    Object.entries(selectedAccompaniments).forEach(([accompanimentId, isSelected]) => {
      if (isSelected) {
        const accompaniment = item.accompaniments?.find((a) => a.id === parseInt(accompanimentId));
        if (accompaniment) {
          accompanimentsPrice += parseFloat(accompaniment.accompanimentPrice || 0);
          selectedAccompanimentsList.push({
            id: accompaniment.id,
            name: accompaniment.accompanimentName,
            price: parseFloat(accompaniment.accompanimentPrice || 0)
          });
        }
      }
    });

    const itemPrice = basePrice + optionsPrice + accompanimentsPrice;
    const qty = quantity || 1;

    const cartItem = {
      id: `${item.id}-${Math.random()}`,
      itemId: item.id,
      name: item.itemName,
      basePrice: itemPrice,
      quantity: qty,
      subtotal: itemPrice * qty,
      selectedOptions: selectedOptions,
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

      {/* Store Header with Banner Image */}
      <div className="relative mb-4 md:mb-6 overflow-hidden rounded-b-2xl md:rounded-b-3xl shadow-xl">
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
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.className = 'relative h-56 md:h-72 w-full bg-gradient-to-r from-purple-500 via-purple-400 to-purple-300';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
          </div>
        ) : (
          <div className="relative h-56 md:h-72 w-full bg-gradient-to-r from-purple-500 via-purple-400 to-purple-300 overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-2xl"></div>
            </div>
          </div>
        )}
        
        {/* Store Info Overlay - Left Aligned */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
          <div className="container-custom">
            <div className="flex items-end gap-3 md:gap-4">
              {/* Logo - Left */}
              <div className="relative flex-shrink-0">
                {store.storeLogo ? (
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
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover shadow-2xl ring-4 ring-white"
                    onError={(e) => {
                      e.target.src = '/logo.jpg';
                    }}
                  />
                ) : (
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl ring-4 ring-white">
                    <span className="text-3xl md:text-4xl font-bold text-white">
                      {(store.storeName || 'S')[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-green-400 rounded-full border-[3px] border-white shadow-lg"></div>
              </div>
              
              {/* Store Info - Left Aligned */}
              <div className="flex-1 text-white pb-1 min-w-0">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1.5 md:mb-2 drop-shadow-lg truncate">{store.storeName}</h1>
                {store.storeAddress && (
                  <div className="flex items-start gap-1.5 mb-1.5">
                    <span className="text-base md:text-lg flex-shrink-0 mt-0.5">📍</span> 
                    <span className="text-xs md:text-sm text-white/95 drop-shadow-md leading-tight line-clamp-2">{store.storeAddress}</span>
                  </div>
                )}
                {store.storePhone && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-base md:text-lg flex-shrink-0">📞</span> 
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
                            <p className="font-bold text-sm truncate">{item.name}</p>
                            <p className="text-xs text-gray-600">SL: {item.quantity}</p>
                            {item.selectedAccompaniments && item.selectedAccompaniments.length > 0 && (
                              <p className="text-xs text-gray-500 truncate">
                                + {item.selectedAccompaniments.map(acc => acc.name).join(', ')}
                              </p>
                            )}
                            {item.notes && (
                              <p className="text-xs text-blue-600 italic truncate">
                                {item.notes}
                              </p>
                            )}
                          </div>
                          <p className="font-bold text-sm whitespace-nowrap">
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
                      className="btn btn-primary w-full mb-2"
                    >
                      Thanh toán
                    </button>
                    <button
                      onClick={() => clearCart()}
                      className="btn btn-secondary w-full text-sm"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 md:gap-3">
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
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t-2 border-purple-300 z-40 safe-area-inset-bottom">
          <div className="py-3 px-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-2xl flex-shrink-0">🛒</span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm text-gray-800">
                    {cartItems.length} món
                  </p>
                  <p className="text-xs text-gray-600">
                    Tổng: <span className="font-bold text-purple-600 text-base">
                      {formatVND(cartItems.reduce((acc, item) => acc + item.subtotal, 0))}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push(`/checkout?store=${slug}`)}
                className="btn btn-primary px-5 py-3 text-sm font-bold flex-shrink-0"
              >
                Thanh toán
              </button>
            </div>
          </div>
        </div>
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

            {/* Options */}
            {showItemDetail.ItemOptions && showItemDetail.ItemOptions.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2 text-sm">Tùy chọn</h3>
                <div className="space-y-3">
                  {showItemDetail.ItemOptions.map((option) => (
                    <div key={option.id}>
                      <label className="block font-semibold mb-1.5 text-xs">
                        {option.optionName}
                        {option.isRequired && <span className="text-red-600">*</span>}
                      </label>
                      {option.optionType === 'select' && (
                        <select
                          value={selectedOptions[option.id] || ''}
                          onChange={(e) =>
                            setSelectedOptions((prev) => ({
                              ...prev,
                              [option.id]: e.target.value,
                            }))
                          }
                          className="input-field text-sm py-2"
                        >
                          <option value="">Chọn tùy chọn</option>
                          {option.optionValues &&
                            option.optionValues.map((value) => (
                              <option key={value.name} value={value.name}>
                                {value.name}
                                {value.price ? ` (+${formatVND(value.price)})` : ''}
                              </option>
                            ))}
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Accompaniments (Món ăn kèm) */}
            {showItemDetail.accompaniments && showItemDetail.accompaniments.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2 text-sm text-gray-800 flex items-center gap-1.5">
                  <span className="text-base">🍽️</span>
                  Món ăn kèm
                </h3>
                <div className="space-y-2">
                  {showItemDetail.accompaniments.map((accompaniment) => (
                    <label
                      key={accompaniment.id}
                      className="flex items-center justify-between p-2.5 md:p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedAccompaniments[accompaniment.id] || false}
                          onChange={(e) =>
                            setSelectedAccompaniments((prev) => ({
                              ...prev,
                              [accompaniment.id]: e.target.checked,
                            }))
                          }
                          className="w-4 h-4 md:w-5 md:h-5 text-purple-600 rounded focus:ring-purple-500 focus:ring-2"
                        />
                        <span className="font-medium text-sm text-gray-700 group-hover:text-purple-700">{accompaniment.accompanimentName}</span>
                      </div>
                      <span className="text-purple-600 font-bold text-sm md:text-base">
                        +{formatVND(accompaniment.accompanimentPrice || 0)}
                      </span>
                    </label>
                  ))}
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
                      if (option?.optionValues && Array.isArray(option.optionValues)) {
                        const value = option.optionValues.find((v) => v.name === selectedValue);
                        if (value?.price) {
                          return sum + parseFloat(value.price);
                        }
                      }
                      return sum;
                    }, 0) +
                    Object.entries(selectedAccompaniments).reduce((sum, [accId, isSelected]) => {
                      if (isSelected) {
                        const acc = showItemDetail.accompaniments?.find((a) => a.id === parseInt(accId));
                        if (acc) {
                          return sum + parseFloat(acc.accompanimentPrice || 0);
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
                className="btn btn-primary flex-1 py-2.5 font-semibold text-sm hover:scale-105 transform transition-transform"
              >
                Thêm vào giỏ
              </button>
            </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
