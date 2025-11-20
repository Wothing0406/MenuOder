import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useStore } from '../../lib/store';
import Navbar from '../../components/Navbar';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import toast from 'react-hot-toast';

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
  const [formData, setFormData] = useState({
    categoryName: '',
    itemName: '',
    itemPrice: '',
    itemDescription: '',
  });

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    fetchData();
    fetchQR();
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
      toast.error('Failed to load menu data');
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
      toast.error('Failed to load items');
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
        toast.success('Category created');
        setFormData({ ...formData, categoryName: '' });
        setShowModal(false);
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create category');
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/items', {
        itemName: formData.itemName,
        itemPrice: formData.itemPrice,
        itemDescription: formData.itemDescription,
        categoryId: selectedCategory.id,
      });
      if (res.data.success) {
        toast.success('Item created');
        setFormData({ ...formData, itemName: '', itemPrice: '', itemDescription: '' });
        setShowModal(false);
        fetchItems(selectedCategory.id);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create item');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Are you sure?')) return;
    try {
      const res = await api.delete(`/items/${itemId}`);
      if (res.data.success) {
        toast.success('Item deleted');
        fetchItems(selectedCategory.id);
      }
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Are you sure?')) return;
    try {
      const res = await api.delete(`/categories/${categoryId}`);
      if (res.data.success) {
        toast.success('Category deleted');
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to delete category');
    }
  }


  if (loading) {
    return (
      <Layout>
        <Navbar />
        <div className="container-custom py-8 text-center">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Menu Management - MenuOrder</title>
      </Head>
      <Navbar />

      <div className="container-custom py-8">
        <h1 className="text-3xl font-bold mb-8">Menu Management</h1>

        {/* QR Code and Store Link */}
        {qrData && (
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg flex flex-col items-center">
            <h2 className="text-xl font-bold mb-4">QR Code for Customer Ordering</h2>
            <img src={qrData.qrCode} alt="Store QR Code" className="mb-4" style={{ width: 200, border: '2px solid #ddd', padding: '8px' }} />
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
              Download QR Code
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
            Categories
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className={`px-4 py-2 font-bold ${
              activeTab === 'items'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600'
            }`}
          >
            Items
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
              className="btn btn-primary mb-6"
            >
              Add Category
            </button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {categories.map((category) => (
                <div key={category.id} className="card">
                  <h3 className="text-lg font-bold mb-2">{category.categoryName}</h3>
                  <p className="text-gray-600 mb-4 text-sm">{category.categoryDescription}</p>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="btn btn-danger w-full text-sm"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>

            {categories.length === 0 && (
              <p className="text-gray-600">No categories yet</p>
            )}
          </div>
        )}

        {/* Items Tab */}
        {activeTab === 'items' && (
          <div>
            {categories.length === 0 ? (
              <p className="text-gray-600">Please create a category first before adding items.</p>
            ) : (
              <>
                <div className="mb-4">
                  <label className="font-bold mr-2">Select Category:</label>
                  <select
                    value={selectedCategory?.id || ''}
                    onChange={e => {
                      const cat = categories.find(c => c.id === Number(e.target.value));
                      setSelectedCategory(cat);
                      if (cat) fetchItems(cat.id);
                    }}
                    className="input-field"
                  >
                    <option value="">-- Select --</option>
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
                        setShowModal(true);
                      }}
                      className="btn btn-primary mb-4"
                    >
                      Add Item
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {items.map(item => (
                        <div key={item.id} className="card">
                          <h3 className="text-lg font-bold mb-2">{item.itemName}</h3>
                          <p className="text-gray-600 mb-2 text-sm">{item.itemDescription}</p>
                          <p className="text-blue-600 font-bold mb-3 text-lg">
                            {parseFloat(item.itemPrice).toFixed(0)}₫
                          </p>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="btn btn-danger w-full text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>

                    {items.length === 0 && (
                      <p className="text-gray-600">No items in {selectedCategory.categoryName} yet</p>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* Modal - Add Category */}
        {showModal && modalMode === 'category' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Add Category</h2>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <input
                  type="text"
                  placeholder="Category Name"
                  value={formData.categoryName}
                  onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                  className="input-field"
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal - Add Item */}
        {showModal && modalMode === 'item' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Add Item to {selectedCategory?.categoryName}</h2>
              <form onSubmit={handleAddItem} className="space-y-4">
                <input
                  type="text"
                  placeholder="Item Name"
                  value={formData.itemName}
                  onChange={e => setFormData({ ...formData, itemName: e.target.value })}
                  className="input-field"
                  required
                />
                <input
                  type="number"
                  placeholder="Item Price (₫)"
                  value={formData.itemPrice}
                  onChange={e => setFormData({ ...formData, itemPrice: e.target.value })}
                  className="input-field"
                  required
                  step="0.01"
                />
                <textarea
                  placeholder="Item Description"
                  value={formData.itemDescription}
                  onChange={e => setFormData({ ...formData, itemDescription: e.target.value })}
                  className="input-field"
                  required
                  rows="3"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}