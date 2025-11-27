import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useStore } from '../../lib/store';
import Navbar from '../../components/Navbar';
import Layout from '../../components/Layout';
import ImageCrop from '../../components/ImageCrop';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { formatVND, getImageUrl } from '../../lib/utils';
import { PlusIcon, DeleteIcon, EditIcon, ArrowUpIcon, ArrowDownIcon, FolderIcon, ClipboardIcon, MoneyIcon, NoteIcon, CameraIcon, DishIcon, CheckIcon, CloseIcon } from '../../components/Icons';

export default function MenuManagement() {
  const router = useRouter();
  const { token, user, store } = useStore();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('categories');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('category');
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    categoryName: '',
    itemName: '',
    itemPrice: '',
    itemDescription: '',
  });
  const [itemImage, setItemImage] = useState(null);
  const [itemImagePreview, setItemImagePreview] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    fetchData();
    fetchQR();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const categoriesRes = await api.get('/categories/my-categories');
      if (categoriesRes.data.success) {
        setCategories(categoriesRes.data.data);
        if (categoriesRes.data.data.length > 0 && !selectedCategory) {
          setSelectedCategory(categoriesRes.data.data[0]);
          fetchItems(categoriesRes.data.data[0].id);
        }
      }
    } catch (error) {
      toast.error('Không thể tải dữ liệu menu');
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async (categoryId) => {
    try {
      const itemsRes = await api.get(`/items/category/${categoryId}`);
      if (itemsRes.data.success) {
        setItems(itemsRes.data.data);
      }
    } catch (error) {
      toast.error('Không thể tải danh sách món');
    }
  };

  const fetchQR = async () => {
    try {
      const qrRes = await api.get('/qr/my-store');
      if (qrRes.data.success) {
        setQrData(qrRes.data.data);
      }
    } catch (error) {
      // ignore
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/categories', {
        categoryName: formData.categoryName,
      });
      if (res.data.success) {
        toast.success('Đã tạo danh mục thành công');
        setFormData({ ...formData, categoryName: '' });
        setShowModal(false);
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể tạo danh mục');
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    
    if (!selectedCategory) {
      toast.error('Vui lòng chọn danh mục');
      return;
    }

    try {
      setUploading(true);
      const formDataToSend = new FormData();
      formDataToSend.append('categoryId', selectedCategory.id);
      formDataToSend.append('itemName', formData.itemName.trim());
      formDataToSend.append('itemPrice', formData.itemPrice);
      formDataToSend.append('itemDescription', formData.itemDescription?.trim() || '');
      
      if (itemImage) {
        formDataToSend.append('itemImage', itemImage);
      }

      const res = await api.post('/items', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (res.data.success) {
        toast.success('🎉 Đã tạo món thành công!');
        setFormData({ itemName: '', itemPrice: '', itemDescription: '' });
        setItemImage(null);
        setItemImagePreview(null);
        setShowModal(false);
        fetchItems(selectedCategory.id);
      }
    } catch (error) {
      console.error('Error creating item:', error);
      toast.error(error.response?.data?.message || 'Không thể tạo món. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    
    try {
      setUploading(true);
      let res;
      
      // Nếu có ảnh mới, dùng FormData, nếu không dùng JSON
      if (itemImage) {
        const formDataToSend = new FormData();
        formDataToSend.append('itemName', formData.itemName.trim());
        formDataToSend.append('itemPrice', formData.itemPrice);
        formDataToSend.append('itemDescription', formData.itemDescription?.trim() || '');
        formDataToSend.append('itemImage', itemImage);

        res = await api.put(`/items/${editingItem.id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Nếu không có ảnh mới, dùng JSON
        res = await api.put(`/items/${editingItem.id}`, {
          itemName: formData.itemName.trim(),
          itemPrice: formData.itemPrice,
          itemDescription: formData.itemDescription?.trim() || '',
        });
      }
      
      if (res.data.success) {
        toast.success('🎉 Đã cập nhật món thành công!');
        setFormData({ itemName: '', itemPrice: '', itemDescription: '' });
        setItemImage(null);
        setItemImagePreview(null);
        setEditingItem(null);
        setShowModal(false);
        fetchItems(selectedCategory.id);
      }
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error(error.response?.data?.message || 'Không thể cập nhật món. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setFormData({
      itemName: item.itemName,
      itemPrice: item.itemPrice,
      itemDescription: item.itemDescription || '',
    });
    setItemImage(null); // Reset file mới
    // Set preview với ảnh hiện tại (có thể là URL từ server)
    if (item.itemImage) {
      setItemImagePreview(getImageUrl(item.itemImage));
    } else {
      setItemImagePreview(null);
    }
    setModalMode('edit-item');
    setShowModal(true);
  };

  const handleDeleteItemImage = async (itemId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa ảnh món này không?')) return;
    try {
      const res = await api.delete(`/items/${itemId}/image`);
      if (res.data.success) {
        toast.success('Đã xóa ảnh thành công');
        fetchItems(selectedCategory.id);
        if (editingItem && editingItem.id === itemId) {
          setItemImagePreview(null);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể xóa ảnh');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file ảnh');
        return;
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước ảnh không được vượt quá 5MB');
        return;
      }
      
      // Show crop modal
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = async (croppedImageDataUrl) => {
    try {
      // Convert data URL to blob/file
      const response = await fetch(croppedImageDataUrl);
      const blob = await response.blob();
      
      // Create file with proper name
      const fileName = `item-image-${Date.now()}.jpg`;
      const file = new File([blob], fileName, { 
        type: 'image/jpeg',
        lastModified: Date.now()
      });
      
      // Update state
      setItemImage(file);
      setItemImagePreview(croppedImageDataUrl);
      
      toast.success('✅ Đã điều chỉnh ảnh thành công! Bạn có thể xem preview ở trên.');
    } catch (error) {
      console.error('Error converting cropped image:', error);
      toast.error('❌ Không thể xử lý ảnh đã crop. Vui lòng thử lại.');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa món này không?')) return;
    try {
      const res = await api.delete(`/items/${itemId}`);
      if (res.data.success) {
        toast.success('Đã xóa món thành công');
        fetchItems(selectedCategory.id);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể xóa món');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa danh mục này không?')) return;
    try {
      const res = await api.delete(`/categories/${categoryId}`);
      if (res.data.success) {
        toast.success('Đã xóa danh mục thành công');
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể xóa danh mục');
    }
  }

  const handleMoveCategory = async (categoryId, direction) => {
    const currentIndex = categories.findIndex(c => c.id === categoryId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= categories.length) return;

    try {
      // Create new order array
      const newCategories = [...categories];
      [newCategories[currentIndex], newCategories[newIndex]] = [newCategories[newIndex], newCategories[currentIndex]];

      // Build categoryOrders array with new displayOrder values
      const categoryOrders = newCategories.map((cat, idx) => ({
        categoryId: cat.id,
        displayOrder: idx
      }));

      const res = await api.post('/categories/reorder', { categoryOrders });
      if (res.data.success) {
        toast.success('✅ Đã sắp xếp lại danh mục!');
        fetchData(); // Refresh to get updated order
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể sắp xếp danh mục');
    }
  }


  if (loading) {
    return (
      <Layout>
        <Navbar />
        <div className="container-custom py-8 text-center">
          <p>Đang tải...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Quản lý Menu - MenuOrder</title>
      </Head>
      <Navbar />

      <div className="container-custom py-8">
        <h1 className="text-3xl font-bold mb-8">Quản lý Menu</h1>

        {/* QR Code and Store Link */}
        {qrData && (
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg flex flex-col items-center">
            <h2 className="text-xl font-bold mb-4">Mã QR cho khách hàng đặt hàng</h2>
            <img src={qrData.qrCode} alt="Mã QR cửa hàng" className="mb-4" style={{ width: 200, border: '2px solid #ddd', padding: '8px' }} />
            <a href={qrData.storeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline mb-4 text-center">
              {qrData.storeUrl}
            </a>
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = qrData.qrCode;
                link.download = `${qrData.storeName}-qr.png`;
                link.click();
              }}
              className="btn btn-primary"
            >
              Tải xuống Mã QR
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b">
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 font-bold ${
              activeTab === 'categories'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600'
            }`}
          >
            Danh mục
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className={`px-4 py-2 font-bold ${
              activeTab === 'items'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600'
            }`}
          >
            Món ăn
          </button>
        </div>

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div>
            <button
              onClick={() => {
                setModalMode('category');
                setFormData({ categoryName: '' });
                setShowModal(true);
              }}
              className="btn btn-primary mb-6 hover:bg-purple-700 transition shadow-lg hover:shadow-xl btn-ripple scale-on-hover flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Thêm danh mục mới
            </button>

            <div className="space-y-3">
              {categories.map((category, index) => (
                <div key={category.id} className="card hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-purple-300 hover-lift stagger-item animate-fadeIn">
                  <div className="flex items-center gap-3">
                    {/* Order Controls */}
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleMoveCategory(category.id, 'up')}
                        disabled={index === 0}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition transform hover:scale-110 ${
                          index === 0
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-purple-100 text-purple-600 hover:bg-purple-200 active:scale-95'
                        }`}
                        title="Di chuyển lên"
                      >
                        <ArrowUpIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveCategory(category.id, 'down')}
                        disabled={index === categories.length - 1}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition transform hover:scale-110 ${
                          index === categories.length - 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-purple-100 text-purple-600 hover:bg-purple-200 active:scale-95'
                        }`}
                        title="Di chuyển xuống"
                      >
                        <ArrowDownIcon className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Category Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                          {index + 1}
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">{category.categoryName}</h3>
                      </div>
                      {category.categoryDescription && (
                        <p className="text-gray-600 mb-3 text-sm line-clamp-2">{category.categoryDescription}</p>
                      )}
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="btn btn-danger text-sm hover:bg-red-600 transition px-4 py-2 flex items-center gap-2"
                      title="Xóa danh mục"
                    >
                      <DeleteIcon className="w-4 h-4" />
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {categories.length === 0 && (
              <p className="text-gray-600">Chưa có danh mục nào</p>
            )}
          </div>
        )}

        {/* Items Tab */}
        {activeTab === 'items' && (
          <div>
            {categories.length === 0 ? (
              <p className="text-gray-600">Vui lòng tạo danh mục trước khi thêm món.</p>
            ) : (
              <>
                <div className="mb-4">
                  <label className="font-bold mr-2">Chọn danh mục:</label>
                  <select
                    value={selectedCategory?.id || ''}
                    onChange={e => {
                      const cat = categories.find(c => c.id === Number(e.target.value));
                      setSelectedCategory(cat);
                      if (cat) fetchItems(cat.id);
                    }}
                    className="input-field"
                  >
                    <option value="">-- Chọn --</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
                    ))}
                  </select>
                </div>

                {selectedCategory && (
                  <>
                    <button
                      onClick={() => {
                        setModalMode('item');
                        setFormData({ itemName: '', itemPrice: '', itemDescription: '' });
                        setItemImage(null);
                        setItemImagePreview(null);
                        setShowModal(true);
                      }}
                      className="btn btn-primary mb-4 hover:bg-purple-700 transition shadow-lg hover:shadow-xl btn-ripple scale-on-hover flex items-center gap-2"
                    >
                      <PlusIcon className="w-5 h-5" />
                      Thêm món mới
                    </button>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                      {items.map(item => (
                        <div key={item.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex flex-col hover-lift stagger-item animate-fadeIn">
                          {/* Image Square */}
                          {item.itemImage ? (
                            <div className="w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden relative">
                              <img
                                src={getImageUrl(item.itemImage)}
                                alt={item.itemName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-full aspect-square bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                              <DishIcon className="w-12 h-12 md:w-16 md:h-16 text-purple-400" />
                            </div>
                          )}
                          
                          {/* Content - Compact */}
                          <div className="p-2 flex flex-col flex-1">
                            <h3 className="text-xs md:text-sm font-bold mb-1 text-gray-800 line-clamp-2 min-h-[2rem] leading-tight">
                              {item.itemName}
                            </h3>
                            <p className="text-xs font-bold text-purple-600 mb-2">
                              {formatVND(item.itemPrice)}
                            </p>
                            <div className="flex gap-1 mt-auto">
                              <button
                                onClick={() => handleEditItem(item)}
                                className="flex-1 px-2 py-1.5 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-600 hover:text-white transition font-medium flex items-center justify-center gap-1 transform hover:scale-105 active:scale-95"
                                title="Sửa"
                              >
                                <EditIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="flex-1 px-2 py-1.5 text-xs bg-red-100 text-red-700 rounded hover:bg-red-600 hover:text-white transition font-medium flex items-center justify-center gap-1 transform hover:scale-105 active:scale-95"
                                title="Xóa"
                              >
                                <DeleteIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {items.length === 0 && (
                      <p className="text-gray-600">Chưa có món nào trong danh mục {selectedCategory.categoryName}</p>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* Modal - Add Category */}
        {showModal && modalMode === 'category' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <FolderIcon className="w-6 h-6 text-purple-600" />
                  Thêm danh mục mới
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-transform hover:rotate-90"
                >
                  <CloseIcon className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleAddCategory} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <ClipboardIcon className="w-5 h-5 text-purple-600" />
                    Tên danh mục <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Đồ uống, Món chính, Tráng miệng..."
                    value={formData.categoryName}
                    onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                    className="input-field w-full"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn btn-secondary flex-1 hover:bg-gray-400 transition"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex-1 hover:bg-purple-700 transition flex items-center justify-center gap-2"
                  >
                    <CheckIcon className="w-5 h-5" />
                    Tạo danh mục
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal - Add Item */}
        {showModal && modalMode === 'item' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <PlusIcon className="w-6 h-6 text-purple-600" />
                  Thêm món mới
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setItemImage(null);
                    setItemImagePreview(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 transition-transform hover:rotate-90"
                >
                  <CloseIcon className="w-6 h-6" />
                </button>
              </div>
              <div className="mb-4 px-3 py-2 bg-purple-100 rounded-lg flex items-center gap-2">
                <FolderIcon className="w-5 h-5 text-purple-600" />
                <p className="text-sm text-purple-800">
                  Danh mục: <span className="font-bold">{selectedCategory?.categoryName}</span>
                </p>
              </div>
              <form onSubmit={handleAddItem} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <DishIcon className="w-5 h-5 text-purple-600" />
                    Tên món <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Cà phê sữa đá"
                    value={formData.itemName}
                    onChange={e => setFormData({ ...formData, itemName: e.target.value })}
                    className="input-field w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    💰 Giá món (₫) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Ví dụ: 25000"
                    value={formData.itemPrice}
                    onChange={e => setFormData({ ...formData, itemPrice: e.target.value })}
                    className="input-field w-full"
                    required
                    step="0.01"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📝 Mô tả món
                  </label>
                  <textarea
                    placeholder="Mô tả về món ăn (không bắt buộc)"
                    value={formData.itemDescription}
                    onChange={e => setFormData({ ...formData, itemDescription: e.target.value })}
                    className="input-field w-full"
                    rows="3"
                  />
                </div>
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <CameraIcon className="w-5 h-5 text-purple-600" />
                    Ảnh món (tùy chọn)
                  </label>
                  {itemImagePreview && (
                    <div className="relative mb-3 group">
                      <div className="w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden border-2 border-purple-300 shadow-lg">
                        <img
                          src={itemImagePreview}
                          alt="Preview ảnh đã crop"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                          <CheckIcon className="w-4 h-4" />
                          Ảnh đã sẵn sàng
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const fileInput = document.createElement('input');
                            fileInput.type = 'file';
                            fileInput.accept = 'image/*';
                            fileInput.onchange = handleImageChange;
                            fileInput.click();
                          }}
                          className="bg-blue-500 text-white rounded-full w-9 h-9 flex items-center justify-center text-xs hover:bg-blue-600 transition shadow-lg hover:scale-110"
                          title="Thay đổi ảnh"
                        >
                          🔄
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setItemImage(null);
                            setItemImagePreview(null);
                            toast.success('Đã xóa ảnh');
                          }}
                          className="bg-red-500 text-white rounded-full w-9 h-9 flex items-center justify-center text-sm hover:bg-red-600 transition shadow-lg hover:scale-110"
                          title="Xóa ảnh"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}
                  {!itemImagePreview && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition cursor-pointer"
                      onClick={() => document.getElementById('item-image-input').click()}>
                      <CameraIcon className="w-16 h-16 text-gray-400 mb-2 mx-auto" />
                      <p className="text-sm text-gray-600 mb-1">Nhấn để chọn ảnh</p>
                      <p className="text-xs text-gray-500">JPG, PNG, GIF • Tối đa 5MB</p>
                    </div>
                  )}
                  <input
                    id="item-image-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setItemImage(null);
                      setItemImagePreview(null);
                    }}
                    className="btn btn-secondary flex-1"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Đang tạo...
                      </>
                    ) : (
                      <>
                        <CheckIcon className="w-5 h-5" />
                        Tạo món
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal - Edit Item */}
        {showModal && modalMode === 'edit-item' && editingItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <EditIcon className="w-6 h-6 text-purple-600" />
                  Chỉnh sửa món
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingItem(null);
                    setItemImage(null);
                    setItemImagePreview(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 transition-transform hover:rotate-90"
                >
                  <CloseIcon className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleUpdateItem} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <DishIcon className="w-5 h-5 text-purple-600" />
                    Tên món <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Cà phê sữa đá"
                    value={formData.itemName}
                    onChange={e => setFormData({ ...formData, itemName: e.target.value })}
                    className="input-field w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    💰 Giá món (₫) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Ví dụ: 25000"
                    value={formData.itemPrice}
                    onChange={e => setFormData({ ...formData, itemPrice: e.target.value })}
                    className="input-field w-full"
                    required
                    step="0.01"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📝 Mô tả món
                  </label>
                  <textarea
                    placeholder="Mô tả về món ăn (không bắt buộc)"
                    value={formData.itemDescription}
                    onChange={e => setFormData({ ...formData, itemDescription: e.target.value })}
                    className="input-field w-full"
                    rows="3"
                  />
                </div>
                {/* Image Upload/Edit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <CameraIcon className="w-5 h-5 text-purple-600" />
                    Ảnh món (tùy chọn)
                  </label>
                  {itemImagePreview && (
                    <div className="relative mb-3 group">
                      <div className="w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden border-2 border-purple-300 shadow-lg">
                        <img
                          src={itemImagePreview}
                          alt="Preview ảnh"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                          {itemImage ? (
                            <>
                              <CheckIcon className="w-4 h-4" />
                              Ảnh mới đã sẵn sàng
                            </>
                          ) : (
                            <>
                              <CameraIcon className="w-4 h-4" />
                              Ảnh hiện tại
                            </>
                          )}
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const fileInput = document.createElement('input');
                            fileInput.type = 'file';
                            fileInput.accept = 'image/*';
                            fileInput.onchange = handleImageChange;
                            fileInput.click();
                          }}
                          className="bg-blue-500 text-white rounded-full w-9 h-9 flex items-center justify-center text-xs hover:bg-blue-600 transition shadow-lg hover:scale-110"
                          title="Thay đổi ảnh"
                        >
                          🔄
                        </button>
                        {editingItem?.itemImage && !itemImage && (
                          <button
                            type="button"
                            onClick={() => handleDeleteItemImage(editingItem.id)}
                            className="bg-red-500 text-white rounded-full w-9 h-9 flex items-center justify-center text-sm hover:bg-red-600 transition shadow-lg hover:scale-110"
                            title="Xóa ảnh từ server"
                          >
                            <DeleteIcon className="w-5 h-5" />
                          </button>
                        )}
                        {itemImage && (
                          <button
                            type="button"
                            onClick={() => {
                              setItemImage(null);
                              setItemImagePreview(editingItem?.itemImage || null);
                              toast.success('Đã hủy ảnh mới');
                            }}
                            className="bg-orange-500 text-white rounded-full w-9 h-9 flex items-center justify-center text-sm hover:bg-orange-600 transition shadow-lg hover:scale-110"
                            title="Hủy ảnh mới"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  {!itemImagePreview && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition cursor-pointer"
                      onClick={() => document.getElementById('edit-item-image-input').click()}>
                      <CameraIcon className="w-16 h-16 text-gray-400 mb-2 mx-auto" />
                      <p className="text-sm text-gray-600 mb-1">Nhấn để chọn ảnh</p>
                      <p className="text-xs text-gray-500">JPG, PNG, GIF • Tối đa 5MB</p>
                    </div>
                  )}
                  <input
                    id="edit-item-image-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingItem(null);
                      setItemImage(null);
                      setItemImagePreview(null);
                    }}
                    className="btn btn-secondary flex-1"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Đang cập nhật...
                      </>
                    ) : (
                      <>
                        <CheckIcon className="w-5 h-5" />
                        Cập nhật món
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Image Crop Modal */}
        {showCropModal && imageToCrop && (
          <ImageCrop
            imageSrc={imageToCrop}
            onClose={() => {
              setShowCropModal(false);
              setImageToCrop(null);
            }}
            onCropComplete={handleCropComplete}
          />
        )}
      </div>
    </Layout>
  );
}