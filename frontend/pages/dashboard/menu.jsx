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
  const [optionModal, setOptionModal] = useState({
    open: false,
    item: null,
    optionId: null,
    optionName: 'Size',
    isRequired: true,
    optionValues: [
      { name: 'Size M', price: 0 },
      { name: 'Size L', price: 0 }
    ],
  });
  const [accompanimentModal, setAccompanimentModal] = useState({
    open: false,
    item: null,
    list: [],
    form: {
      name: '',
      price: '',
      scope: 'item', // item | category | all
    },
    loading: false,
  });
  const [optionsLoading, setOptionsLoading] = useState(false);
  const normalizeOptionValues = (values) => {
    if (!values) return [];

    let arr = [];
    if (Array.isArray(values)) {
      arr = values;
    } else if (typeof values === 'object') {
      // Trường hợp Sequelize trả JSON dạng object: { "0": {...}, "1": {...} }
      arr = Object.values(values);
    } else if (typeof values === 'string' || typeof values === 'number') {
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
        const newCategories = categoriesRes.data.data;
        setCategories(newCategories);
        
        // Nếu có categories và chưa có selectedCategory, chọn category đầu tiên
        if (newCategories.length > 0 && !selectedCategory) {
          setSelectedCategory(newCategories[0]);
          await fetchItems(Number(newCategories[0].id));
        } 
        // Nếu đã có selectedCategory, cập nhật lại object để đảm bảo dữ liệu mới nhất
        else if (newCategories.length > 0 && selectedCategory) {
          const selectedId = Number(selectedCategory.id);
          const updatedCategory = newCategories.find(cat => Number(cat.id) === selectedId);
          if (updatedCategory) {
            setSelectedCategory(updatedCategory);
            await fetchItems(Number(updatedCategory.id));
          } else {
            // Nếu selectedCategory không còn tồn tại, chọn category đầu tiên
            setSelectedCategory(newCategories[0]);
            await fetchItems(Number(newCategories[0].id));
          }
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
      if (!categoryId) {
        setItems([]);
        return;
      }
      const itemsRes = await api.get(`/items/category/${categoryId}`);
      if (itemsRes.data.success) {
        setItems(itemsRes.data.data || []);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error('Không thể tải danh sách món');
      setItems([]);
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
        // Fetch lại dữ liệu và đảm bảo selectedCategory được cập nhật
        await fetchData();
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
        // Đảm bảo fetch lại items với đúng categoryId
        if (selectedCategory && selectedCategory.id) {
          await fetchItems(Number(selectedCategory.id));
        }
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
        // Đảm bảo fetch lại items với đúng categoryId
        if (selectedCategory && selectedCategory.id) {
          await fetchItems(Number(selectedCategory.id));
        }
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
        if (selectedCategory && selectedCategory.id) {
          await fetchItems(Number(selectedCategory.id));
        }
        if (editingItem && editingItem.id === itemId) {
          setItemImagePreview(null);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể xóa ảnh');
    }
  };

  const openOptionModal = async (item) => {
    setOptionsLoading(true);
    setOptionModal((prev) => ({
      ...prev,
      open: true,
      item,
      optionId: null,
      optionName: 'Size',
      isRequired: true,
      optionValues: normalizeOptionValues([
        { name: 'Size M', price: 0 },
        { name: 'Size L', price: 0 },
      ]),
    }));

    try {
      const res = await api.get(`/item-options/item/${item.id}`);
      if (res.data.success && res.data.data.length > 0) {
        // Ưu tiên option tên Size nếu có
        const existingOption = res.data.data.find(opt => opt.optionName?.toLowerCase().includes('size')) || res.data.data[0];
        setOptionModal((prev) => ({
          ...prev,
          open: true,
          item,
          optionId: existingOption.id,
          optionName: existingOption.optionName || 'Size',
          isRequired: !!existingOption.isRequired,
          optionValues: normalizeOptionValues(
            Array.isArray(existingOption.optionValues) && existingOption.optionValues.length > 0
              ? existingOption.optionValues
              : [{ name: 'Size M', price: 0 }]
          ),
        }));
      }
    } catch (error) {
      toast.error('Không thể tải tùy chọn kích cỡ');
    } finally {
      setOptionsLoading(false);
    }
  };

  const updateOptionValue = (index, key, value) => {
    setOptionModal((prev) => {
      const updated = [...prev.optionValues];
      updated[index] = { 
        ...updated[index], 
        [key]: key === 'price' ? Number(value) || 0 : value 
      };
      return { ...prev, optionValues: updated };
    });
  };

  const addOptionValueRow = () => {
    setOptionModal((prev) => ({
      ...prev,
      optionValues: Array.isArray(prev.optionValues)
        ? [...prev.optionValues, { name: '', price: 0 }]
        : [{ name: '', price: 0 }],
    }));
  };

  const addPresetSize = (label) => {
    setOptionModal((prev) => {
      // Nếu đã có label thì không thêm trùng
      const arr = Array.isArray(prev.optionValues) ? prev.optionValues : [];
      if (arr.some(v => v.name?.trim().toLowerCase() === label.toLowerCase())) return prev;
      return {
        ...prev,
        optionValues: [...arr, { name: label, price: 0 }]
      };
    });
  };

  const removeOptionValueRow = (index) => {
    setOptionModal((prev) => {
      if (prev.optionValues.length === 1) return prev;
      const updated = prev.optionValues.filter((_, idx) => idx !== index);
      return { ...prev, optionValues: updated };
    });
  };

  const handleSaveOption = async () => {
    if (!optionModal.item) return;
    const sanitizedValues = normalizeOptionValues(optionModal.optionValues)
      .filter(v => v.name?.trim());

    if (sanitizedValues.length === 0) {
      toast.error('Vui lòng nhập ít nhất một kích cỡ');
      return;
    }

    try {
      setOptionsLoading(true);
      if (optionModal.optionId) {
        await api.put(`/item-options/${optionModal.optionId}`, {
          optionName: optionModal.optionName || 'Size',
          optionType: 'select',
          isRequired: optionModal.isRequired,
          optionValues: sanitizedValues,
        });
      } else {
        await api.post('/item-options', {
          itemId: optionModal.item.id,
          optionName: optionModal.optionName || 'Size',
          optionType: 'select',
          isRequired: optionModal.isRequired,
          optionValues: sanitizedValues,
        });
      }
      toast.success('Đã lưu kích cỡ & giá cộng thêm');
      setOptionModal((prev) => ({ ...prev, open: false, item: null }));
      if (selectedCategory?.id) {
        await fetchItems(Number(selectedCategory.id));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể lưu kích cỡ');
    } finally {
      setOptionsLoading(false);
    }
  };

  const openAccompanimentModal = async (item) => {
    setAccompanimentModal({
      open: true,
      item,
      list: [],
      form: { name: '', price: '', scope: 'item' },
      loading: true,
    });

    try {
      const res = await api.get(`/items/${item.id}/accompaniments`);
      if (res.data.success) {
        setAccompanimentModal((prev) => ({
          ...prev,
          list: res.data.data || [],
          loading: false,
        }));
      }
    } catch (error) {
      toast.error('Không thể tải món kèm');
      setAccompanimentModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleCreateAccompaniment = async () => {
    if (!accompanimentModal.item) return;
    const { name, price, scope } = accompanimentModal.form;
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên món kèm');
      return;
    }
    try {
      setAccompanimentModal((prev) => ({ ...prev, loading: true }));
      if (scope === 'item') {
        await api.post(`/items/${accompanimentModal.item.id}/accompaniments`, {
          accompanimentName: name.trim(),
          accompanimentPrice: Number(price) || 0,
          isOptional: true,
        });
      } else {
        await api.post('/items/accompaniments/bulk', {
          accompanimentName: name.trim(),
          accompanimentPrice: Number(price) || 0,
          isOptional: true,
          targetType: scope === 'category' ? 'category' : 'all',
          categoryId: scope === 'category' ? accompanimentModal.item.categoryId : undefined,
        });
      }
      toast.success('Đã lưu món kèm');
      // Refresh list for the current item
      const res = await api.get(`/items/${accompanimentModal.item.id}/accompaniments`);
      setAccompanimentModal((prev) => ({
        ...prev,
        list: res.data.data || [],
        form: { name: '', price: '', scope },
        loading: false,
      }));
      if (selectedCategory?.id) {
        await fetchItems(Number(selectedCategory.id));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể thêm món kèm');
      setAccompanimentModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleUpdateAccompaniment = async (accompaniment) => {
    try {
      await api.put(`/items/accompaniments/${accompaniment.id}`, {
        accompanimentName: accompaniment.accompanimentName,
        accompanimentPrice: Number(accompaniment.accompanimentPrice) || 0,
        isOptional: accompaniment.isOptional,
      });
      toast.success('Đã cập nhật món kèm');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật');
    }
  };

  const handleDeleteAccompaniment = async (id) => {
    if (!confirm('Xóa món kèm này?')) return;
    try {
      await api.delete(`/items/accompaniments/${id}`);
      setAccompanimentModal((prev) => ({
        ...prev,
        list: prev.list.filter((item) => item.id !== id),
      }));
      toast.success('Đã xóa món kèm');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể xóa');
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

  const handleDeleteItem = async (itemId, e) => {
    // Prevent form submission and event bubbling
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!confirm('Bạn có chắc chắn muốn xóa món này không?')) return;
    
    // Optimistic update: Remove item from UI immediately
    const itemToDelete = items.find(item => item.id === itemId);
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
    
    try {
      const res = await api.delete(`/items/${itemId}`);
      if (res.data.success) {
        toast.success('Đã xóa món thành công');
        // Only refetch if API call succeeds (already updated optimistically)
        // This ensures data consistency without full page reload
      } else {
        // Revert optimistic update on failure
        if (itemToDelete) {
          setItems(prevItems => [...prevItems, itemToDelete].sort((a, b) => a.id - b.id));
        }
        toast.error('Không thể xóa món');
      }
    } catch (error) {
      // Revert optimistic update on error
      if (itemToDelete) {
        setItems(prevItems => [...prevItems, itemToDelete].sort((a, b) => a.id - b.id));
      }
      toast.error(error.response?.data?.message || 'Không thể xóa món');
    }
  };

  const handleDeleteCategory = async (categoryId, e) => {
    // Prevent form submission and event bubbling
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!confirm('Bạn có chắc chắn muốn xóa danh mục này không? Tất cả món trong danh mục này cũng sẽ bị xóa.')) return;
    
    // Optimistic update: Remove category from UI immediately
    const categoryToDelete = categories.find(cat => cat.id === categoryId);
    const wasSelected = selectedCategory?.id === categoryId;
    const remainingCategories = categories.filter(cat => cat.id !== categoryId);
    
    setCategories(remainingCategories);
    
    // If deleted category was selected, select first remaining category or clear
    if (wasSelected) {
      if (remainingCategories.length > 0) {
        setSelectedCategory(remainingCategories[0]);
        fetchItems(remainingCategories[0].id);
      } else {
        setSelectedCategory(null);
        setItems([]);
      }
    }
    
    try {
      const res = await api.delete(`/categories/${categoryId}`);
      if (res.data.success) {
        toast.success('Đã xóa danh mục thành công');
        // Only refetch if needed (already updated optimistically)
        // Refetch to ensure all related items are also removed
        fetchData();
      } else {
        // Revert optimistic update on failure
        if (categoryToDelete) {
          setCategories(prevCategories => [...prevCategories, categoryToDelete].sort((a, b) => a.id - b.id));
        }
        toast.error('Không thể xóa danh mục');
      }
    } catch (error) {
      // Revert optimistic update on error
      if (categoryToDelete) {
        setCategories(prevCategories => [...prevCategories, categoryToDelete].sort((a, b) => a.id - b.id));
      }
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
                <div key={category.id} className="card hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-purple-300 hover-lift animate-fadeIn">
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
                      type="button"
                      onClick={(e) => handleDeleteCategory(category.id, e)}
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
                      const selectedId = e.target.value ? Number(e.target.value) : null;
                      const cat = selectedId ? categories.find(c => Number(c.id) === selectedId) : null;
                      setSelectedCategory(cat);
                      if (cat) {
                        fetchItems(Number(cat.id));
                      } else {
                        setItems([]);
                      }
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
                        <div key={item.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex flex-col hover-lift animate-fadeIn">
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
                              <div className="flex flex-wrap gap-1 mb-2">
                                <button
                                  type="button"
                                  onClick={() => openOptionModal(item)}
                                  className="px-2 py-1 text-[10px] bg-blue-50 text-blue-700 rounded border border-blue-200 hover:bg-blue-100 transition"
                                >
                                  Size + giá
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openAccompanimentModal(item)}
                                  className="px-2 py-1 text-[10px] bg-emerald-50 text-emerald-700 rounded border border-emerald-200 hover:bg-emerald-100 transition"
                                >
                                  Món kèm
                                </button>
                              </div>
                            <div className="flex gap-1 mt-auto">
                              <button
                                onClick={() => handleEditItem(item)}
                                className="flex-1 px-2 py-1.5 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-600 hover:text-white transition font-medium flex items-center justify-center gap-1 transform hover:scale-105 active:scale-95"
                                title="Sửa"
                              >
                                <EditIcon className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteItem(item.id, e)}
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

      {/* Modal - Item Size / Options */}
      {optionModal.open && optionModal.item && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Kích cỡ & giá cộng thêm</h2>
              <button onClick={() => setOptionModal((prev) => ({ ...prev, open: false, item: null }))} className="text-gray-500 hover:text-gray-700">×</button>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Món: <span className="font-semibold text-gray-800">{optionModal.item.itemName}</span>
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold mb-1">Tên nhóm</label>
                <input
                  type="text"
                  value={optionModal.optionName}
                  onChange={(e) => setOptionModal((prev) => ({ ...prev, optionName: e.target.value }))}
                  className="input-field w-full"
                  placeholder="Size"
                />
              </div>
              <label className="inline-flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={optionModal.isRequired}
                  onChange={(e) => setOptionModal((prev) => ({ ...prev, isRequired: e.target.checked }))}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                Bắt buộc chọn
              </label>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-gray-500 mr-1">Thêm nhanh:</span>
                {['Size M', 'Size L', 'Size XL'].map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => addPresetSize(label)}
                    className="px-2 py-1 text-[11px] bg-gray-100 text-gray-700 rounded border border-gray-200 hover:bg-gray-200 transition"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">
                    Danh sách kích cỡ 
                  </span>
                  <button type="button" onClick={addOptionValueRow} className="text-sm text-purple-600 hover:underline">
                    + Thêm dòng
                  </button>
                </div>
                {(Array.isArray(optionModal.optionValues) ? optionModal.optionValues : []).map((opt, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-7">
                      <input
                        type="text"
                        value={opt.name || ''}
                        onChange={(e) => updateOptionValue(idx, 'name', e.target.value)}
                        className="input-field w-full"
                        placeholder="Tên size (vd: Size M, 500ml...)"
                      />
                    </div>
                    <div className="col-span-4">
                      <input
                        type="number"
                        value={opt.price ?? 0}
                        onChange={(e) => updateOptionValue(idx, 'price', e.target.value)}
                        className="input-field w-full"
                        placeholder="Giá +"
                        step="1000"
                        min="0"
                      />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeOptionValueRow(idx)}
                        className="px-2 py-1 text-sm bg-red-50 text-red-600 rounded border border-red-200 hover:bg-red-100"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                type="button"
                onClick={() => setOptionModal((prev) => ({ ...prev, open: false, item: null }))}
                className="btn btn-secondary flex-1"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveOption}
                disabled={optionsLoading}
                className="btn btn-primary flex-1 disabled:opacity-50"
              >
                {optionsLoading ? 'Đang lưu...' : 'Lưu kích cỡ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Accompaniments */}
      {accompanimentModal.open && accompanimentModal.item && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Món ăn kèm</h2>
              <button onClick={() => setAccompanimentModal({ open: false, item: null, list: [], form: { name: '', price: '', scope: 'item' }, loading: false })} className="text-gray-500 hover:text-gray-700">×</button>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Món: <span className="font-semibold text-gray-800">{accompanimentModal.item.itemName}</span>
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-sm mb-3">Thêm món kèm</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={accompanimentModal.form.name}
                  onChange={(e) => setAccompanimentModal((prev) => ({ ...prev, form: { ...prev.form, name: e.target.value } }))}
                  className="input-field"
                  placeholder="Tên món kèm"
                />
                <input
                  type="number"
                  value={accompanimentModal.form.price}
                  onChange={(e) => setAccompanimentModal((prev) => ({ ...prev, form: { ...prev.form, price: e.target.value } }))}
                  className="input-field"
                  placeholder="Giá cộng thêm"
                  step="500"
                />
                <select
                  value={accompanimentModal.form.scope}
                  onChange={(e) => setAccompanimentModal((prev) => ({ ...prev, form: { ...prev.form, scope: e.target.value } }))}
                  className="input-field"
                >
                  <option value="item">Chỉ món này</option>
                  <option value="category">Danh mục này</option>
                  <option value="all">Tất cả món</option>
                </select>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                - Chọn "Tất cả món" để biến món kèm này thành mặc định cho toàn bộ quán.{"\n"}
                - Chọn "Danh mục này" nếu chỉ áp dụng cho một nhóm món.
              </p>
              <div className="flex justify-end mt-3">
                <button
                  type="button"
                  onClick={handleCreateAccompaniment}
                  className="btn btn-primary px-4"
                  disabled={accompanimentModal.loading}
                >
                  {accompanimentModal.loading ? 'Đang lưu...' : 'Lưu món kèm'}
                </button>
              </div>
            </div>

            <h3 className="font-semibold text-sm mb-2">Danh sách món kèm của món này</h3>
            {accompanimentModal.loading ? (
              <p className="text-gray-500 text-sm">Đang tải...</p>
            ) : accompanimentModal.list.length === 0 ? (
              <p className="text-gray-500 text-sm">Chưa có món kèm</p>
            ) : (
              <div className="space-y-2">
                {accompanimentModal.list.map((acc) => (
                  <div key={acc.id} className="flex items-center gap-2 border border-gray-200 rounded-lg p-3">
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-800">{acc.accompanimentName}</p>
                      <p className="text-xs text-gray-500">+ {formatVND(acc.accompanimentPrice || 0)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteAccompaniment(acc.id)}
                      className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded border border-red-200 hover:bg-red-100"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
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