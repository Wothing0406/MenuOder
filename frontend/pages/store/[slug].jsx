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
    const item = showItemDetail;
    const basePrice = parseFloat(item.itemPrice);
    
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

      <div className="relative gradient-teal text-white shadow-2xl mb-8 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-20"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white bg-opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white bg-opacity-10 rounded-full blur-2xl"></div>
        <div className="container-custom py-10 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              {store.storeLogo ? (
                <img 
                  src={(() => {
                    // Nếu đã là full URL
                    if (store.storeLogo.startsWith('http')) {
                      return store.storeLogo;
                    }
                    // Nếu là relative path, tạo full URL
                    const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
                    // Đảm bảo không có double slash
                    const logoPath = store.storeLogo.startsWith('/') ? store.storeLogo : '/' + store.storeLogo;
                    return apiBase + logoPath;
                  })()}
                  alt={store.storeName}
                  className="w-24 h-24 rounded-full object-cover shadow-2xl ring-4 ring-white ring-offset-4 ring-offset-purple-500"
                  onError={(e) => {
                    console.error('Logo load error:', e.target.src);
                    e.target.src = '/logo.jpg';
                  }}
                />
              ) : (
                <img 
                  src="/logo.jpg" 
                  alt="Store Logo"
                  className="w-24 h-24 rounded-full object-cover shadow-2xl ring-4 ring-white ring-offset-4 ring-offset-purple-500"
                />
              )}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">{store.storeName}</h1>
              {store.storeAddress && (
                <p className="text-purple-50 flex items-center justify-center md:justify-start gap-2 text-lg mb-2">
                  <span className="text-2xl">📍</span> 
                  <span>{store.storeAddress}</span>
                </p>
              )}
              {store.storePhone && (
                <p className="text-purple-50 flex items-center justify-center md:justify-start gap-2 text-lg">
                  <span className="text-2xl">📞</span> 
                  <span>{store.storePhone}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Categories Sidebar */}
        <div className="md:col-span-1">
          <div className="card sticky top-4">
            <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
              <span className="text-2xl">📋</span>
              Danh mục
            </h2>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all font-medium ${
                    selectedCategory === category.id
                      ? 'gradient-teal text-white shadow-lg transform scale-105'
                      : 'bg-gray-50 hover:bg-purple-50 text-gray-700 hover:text-purple-700 hover:shadow-md'
                  }`}
                >
                  {category.categoryName}
                </button>
              ))}
            </div>
          </div>

          {/* Cart Summary */}
          <div className="card mt-4">
            <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
              <span className="text-2xl">🛒</span>
              Giỏ hàng
            </h3>
            {cartItems.length === 0 ? (
              <p className="text-gray-600">Giỏ hàng trống</p>
            ) : (
              <>
                <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="border-b pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-bold text-sm">{item.name}</p>
                          <p className="text-xs text-gray-600">SL: {item.quantity}</p>
                          {item.selectedAccompaniments && item.selectedAccompaniments.length > 0 && (
                            <p className="text-xs text-gray-500">
                              + {item.selectedAccompaniments.map(acc => acc.name).join(', ')}
                            </p>
                          )}
                          {item.notes && (
                            <p className="text-xs text-blue-600 italic">
                              Ghi chú: {item.notes}
                            </p>
                          )}
                        </div>
                        <p className="font-bold text-sm">
                          {formatVND(item.subtotal)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center font-bold mb-4">
                    <span>Tổng:</span>
                    <span className="text-blue-600 text-lg">
                      ${cartItems
                        .reduce((acc, item) => acc + item.subtotal, 0)
                        .toFixed(2)}
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
        <div className="md:col-span-3">
          {itemsInCategory.length === 0 ? (
            <p className="text-gray-600">Không có món nào trong danh mục này</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

      {/* Item Detail Modal */}
      {showItemDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-full blur-3xl opacity-30"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-3 text-gray-800">{showItemDetail.itemName}</h2>
              {showItemDetail.itemDescription && (
                <p className="text-gray-600 mb-4 leading-relaxed">{showItemDetail.itemDescription}</p>
              )}
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent mb-6">
                {formatVND(showItemDetail.itemPrice)}
              </p>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block font-bold mb-2">
                Số lượng <span className="text-red-600">*</span>
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 flex items-center justify-center font-bold text-gray-700 shadow-md hover:shadow-lg transition-all hover:scale-110"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 text-center border-2 border-purple-200 rounded-xl px-3 py-2 font-bold text-lg focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 flex items-center justify-center font-bold text-white shadow-md hover:shadow-lg transition-all hover:scale-110"
                >
                  +
                </button>
              </div>
            </div>

            {/* Options */}
            {showItemDetail.ItemOptions && showItemDetail.ItemOptions.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold mb-3">Tùy chọn</h3>
                <div className="space-y-4">
                  {showItemDetail.ItemOptions.map((option) => (
                    <div key={option.id}>
                      <label className="block font-bold mb-2">
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
                          className="input-field"
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
              <div className="mb-6">
                <h3 className="font-bold mb-4 text-lg text-gray-800 flex items-center gap-2">
                  <span className="text-xl">🍽️</span>
                  Món ăn kèm
                </h3>
                <div className="space-y-2">
                  {showItemDetail.accompaniments.map((accompaniment) => (
                    <label
                      key={accompaniment.id}
                      className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedAccompaniments[accompaniment.id] || false}
                          onChange={(e) =>
                            setSelectedAccompaniments((prev) => ({
                              ...prev,
                              [accompaniment.id]: e.target.checked,
                            }))
                          }
                          className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 focus:ring-2"
                        />
                        <span className="font-medium text-gray-700 group-hover:text-purple-700">{accompaniment.accompanimentName}</span>
                      </div>
                      <span className="text-purple-600 font-bold text-lg">
                        +{formatVND(accompaniment.accompanimentPrice || 0)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Notes for Item */}
            <div className="mb-6">
              <label className="block font-bold mb-2 text-gray-700 flex items-center gap-2">
                <span className="text-lg">📝</span>
                Ghi chú cho món (nếu cần)
              </label>
              <textarea
                value={itemNote}
                onChange={(e) => setItemNote(e.target.value)}
                className="input-field"
                rows="3"
                placeholder="Ví dụ: Không cay, ít đường, không hành..."
              ></textarea>
              {itemNote && (
                <p className="text-xs text-gray-500 mt-1 italic">Ghi chú của bạn: {itemNote}</p>
              )}
            </div>

            {/* Price Display */}
            <div className="mb-6 p-5 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-100">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold">Giá món:</span>
                <span className="text-lg font-bold text-blue-600">
                  {formatVND(showItemDetail.itemPrice)}
                </span>
              </div>
              {Object.keys(selectedOptions).length > 0 && (
                <div className="text-sm text-gray-600 mb-1">
                  + Tùy chọn: {formatVND(Object.entries(selectedOptions).reduce((sum, [optionId, selectedValue]) => {
                    const option = showItemDetail.ItemOptions?.find((o) => o.id === parseInt(optionId));
                    if (option?.optionValues && Array.isArray(option.optionValues)) {
                      const value = option.optionValues.find((v) => v.name === selectedValue);
                      if (value?.price) {
                        return sum + parseFloat(value.price);
                      }
                    }
                    return sum;
                  }, 0))}
                </div>
              )}
              {Object.values(selectedAccompaniments).some(v => v) && (
                <div className="text-sm text-gray-600 mb-1">
                  + Món kèm: {formatVND(Object.entries(selectedAccompaniments).reduce((sum, [accId, isSelected]) => {
                    if (isSelected) {
                      const acc = showItemDetail.accompaniments?.find((a) => a.id === parseInt(accId));
                      if (acc) {
                        return sum + parseFloat(acc.accompanimentPrice || 0);
                      }
                    }
                    return sum;
                  }, 0))}
                </div>
              )}
              <div className="border-t-2 border-purple-200 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-700 text-lg">Tổng ({quantity} món):</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
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
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowItemDetail(null)}
                className="btn btn-secondary flex-1 py-3 font-semibold"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmAddToCart}
                className="btn btn-primary flex-1 py-3 font-semibold hover:scale-105 transform transition-transform"
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
