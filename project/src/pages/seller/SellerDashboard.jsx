import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, Package, DollarSign, TrendingUp, MessageCircle,
  Edit, Trash2, Upload, X
} from 'lucide-react';
import Layout from '../../components/common/Layout';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Toast from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';
import { categories as categoriesFromData } from '../../data/products';
import { formatPrice } from '../../utils/helpers';

// Firebase
import { db, storage } from '../../firebase/firebase';
import {
  collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const SellerDashboard = () => {
  const { currentUser: userProfile } = useAuth();

  const [sellerProducts, setSellerProducts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [uploading, setUploading] = useState(false);
  const [localFiles, setLocalFiles] = useState([]);

  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    stock: '',
    sizes: [],
    colors: [],
    images: [], // when editing: array of URLs; when adding: we keep localFiles for uploads
    displayImageIndex: 0
  });

  // fallbacks if categoriesFromData missing
  const categories = useMemo(
    () => categoriesFromData?.length ? categoriesFromData : [
      { name: 'General' }, { name: 'Clothing' }, { name: 'Electronics' }, { name: 'Home' }
    ],
    []
  );

  // ===== Fetch seller products =====
  useEffect(() => {
    if (!userProfile?.uid) return;

    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'products'), where('sellerId', '==', userProfile.uid));
        const snap = await getDocs(q);
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setSellerProducts(list);
      } catch (err) {
        console.error(err);
        setToast({ show: true, message: 'Failed to load products', type: 'error' });
      }
    };

    fetchProducts();
  }, [userProfile]);

  // ===== Helpers =====
  const resetForm = () => {
    setNewProduct({
      name: '',
      category: '',
      price: '',
      description: '',
      stock: '',
      sizes: [],
      colors: [],
      images: [],
      displayImageIndex: 0
    });
    setLocalFiles([]);
    setEditingProduct(null);
  };

  const closeModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const handleChange = (field, value) => {
    setNewProduct(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 3) {
      setToast({ show: true, message: 'Maximum 3 images allowed', type: 'error' });
      return;
    }
    const invalid = selectedFiles.filter(f => !f.type.startsWith('image/') || f.size > 5 * 1024 * 1024);
    if (invalid.length > 0) {
      setToast({ show: true, message: 'Only images under 5MB allowed', type: 'error' });
      return;
    }
    setLocalFiles(selectedFiles);
    // When adding, we show local previews via Object URLs; when editing, we’ll append on save.
  };

  const uploadImagesToStorage = async (files, productId) => {
    const urls = [];
    for (const file of files) {
      const safeName = file.name.replace(/\s+/g, '_');
      const path = `products/${userProfile.uid}/${productId}/${Date.now()}_${safeName}`;
      const imageRef = ref(storage, path);
      await uploadBytes(imageRef, file);
      const url = await getDownloadURL(imageRef);
      urls.push(url);
    }
    return urls;
  };

  // ===== Create / Update =====
  const handleAddOrUpdate = async (e) => {
    e.preventDefault();
    if (!userProfile?.uid) {
      setToast({ show: true, message: 'You must be logged in', type: 'error' });
      return;
    }

    // basic validation
    if (!newProduct.name?.trim()) {
      setToast({ show: true, message: 'Product name is required', type: 'error' });
      return;
    }
    if (!editingProduct && localFiles.length === 0) {
      setToast({ show: true, message: 'Please upload at least one image', type: 'error' });
      return;
    }

    setUploading(true);
    try {
      if (editingProduct) {
        // Start with existing image URLs (newProduct.images is already URLs)
        let finalImages = Array.isArray(newProduct.images) ? [...newProduct.images] : [];
        if (localFiles.length) {
          const newUrls = await uploadImagesToStorage(localFiles, editingProduct.id);
          finalImages = [...finalImages, ...newUrls];
        }

        const productRef = doc(db, 'products', editingProduct.id);
        const payload = {
          ...newProduct,
          price: parseFloat(newProduct.price || 0),
          stock: parseInt(newProduct.stock || 0, 10),
          images: finalImages,
          updatedAt: serverTimestamp()
        };
        await updateDoc(productRef, payload);

        setSellerProducts(prev =>
          prev.map(p => p.id === editingProduct.id ? { ...payload, id: editingProduct.id } : p)
        );

        setToast({ show: true, message: 'Product updated successfully!', type: 'success' });
      } else {
        const tempId = `${Date.now()}`; // used only for folder path
        const uploadedUrls = await uploadImagesToStorage(localFiles, tempId);

        const productData = {
          ...newProduct,
          price: parseFloat(newProduct.price || 0),
          stock: parseInt(newProduct.stock || 0, 10),
          seller: userProfile?.displayName || userProfile?.email || 'Unknown Seller',
          sellerId: userProfile.uid,
          sales: 0,
          rating: 0,
          reviews: 0,
          images: uploadedUrls,
          displayImageIndex: newProduct.displayImageIndex || 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'products'), productData);
        setSellerProducts(prev => [...prev, { id: docRef.id, ...productData }]);

        setToast({ show: true, message: 'Product added successfully!', type: 'success' });
      }

      closeModal();
    } catch (err) {
      console.error(err);
      setToast({ show: true, message: err.message || 'Operation failed', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  // ===== Delete =====
  const handleDeleteProduct = async (productId) => {
    try {
      await deleteDoc(doc(db, 'products', productId));
      setSellerProducts(prev => prev.filter(p => p.id !== productId));
      // Optional: also delete Storage files if you track the exact paths. (We only have URLs here.)
      setToast({ show: true, message: 'Product deleted successfully!', type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ show: true, message: 'Failed to delete product', type: 'error' });
    }
  };

  // When clicking edit, load the product into form
  useEffect(() => {
    if (editingProduct) {
      setNewProduct({
        name: editingProduct.name || '',
        category: editingProduct.category || '',
        price: editingProduct.price ?? '',
        description: editingProduct.description || '',
        stock: editingProduct.stock ?? '',
        sizes: Array.isArray(editingProduct.sizes) ? editingProduct.sizes : [],
        colors: Array.isArray(editingProduct.colors) ? editingProduct.colors : [],
        images: Array.isArray(editingProduct.images) ? editingProduct.images : [],
        displayImageIndex: editingProduct.displayImageIndex || 0
      });
      setLocalFiles([]);
    }
  }, [editingProduct]);

  // ===== Stats =====
  const totalRevenue = sellerProducts.reduce((sum, p) => sum + (Number(p.price || 0) * Number(p.sales || 0)), 0);
  const totalSales = sellerProducts.reduce((sum, p) => sum + Number(p.sales || 0), 0);

  // ===== UI =====
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {userProfile?.storeName || userProfile?.name || userProfile?.displayName || 'Seller'}
            </p>
          </div>
          <Button onClick={() => { setShowAddModal(true); setEditingProduct(null); resetForm(); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Package className="h-6 w-6 text-primary-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{sellerProducts.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(totalRevenue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">{totalSales}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <MessageCircle className="h-6 w-6 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Messages</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">My Products</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sellerProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={product.images?.[product.displayImageIndex] || 'https://via.placeholder.com/40'}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatPrice(product.price)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.stock}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.sales}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setShowAddModal(true);
                          }}
                          className="text-primary-600 hover:text-primary-900"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {sellerProducts.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      You have no products yet. Click <span className="font-semibold">Add Product</span> to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={closeModal}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        size="lg"
      >
        <form onSubmit={handleAddOrUpdate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Product name"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={newProduct.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="" disabled>Select category</option>
                {categories.map((c, idx) => (
                  <option key={idx} value={c.name || c}>
                    {c.name || c}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <input
                type="number"
                step="0.01"
                value={newProduct.price}
                onChange={(e) => handleChange('price', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="0.00"
                required
              />
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input
                type="number"
                value={newProduct.stock}
                onChange={(e) => handleChange('stock', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="0"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={newProduct.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Describe your product"
            />
          </div>

          {/* Sizes / Colors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sizes (comma-separated)
              </label>
              <input
                type="text"
                value={Array.isArray(newProduct.sizes) ? newProduct.sizes.join(',') : ''}
                onChange={(e) =>
                  handleChange('sizes',
                    e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  )
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="S, M, L"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Colors (comma-separated)
              </label>
              <input
                type="text"
                value={Array.isArray(newProduct.colors) ? newProduct.colors.join(',') : ''}
                onChange={(e) =>
                  handleChange('colors',
                    e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  )
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Red, Blue"
              />
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>

            {/* Existing image URLs (when editing) */}
            {editingProduct && newProduct.images?.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-3">
                {newProduct.images.map((url, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={url}
                      alt={`img-${idx}`}
                      className={`w-20 h-20 rounded-lg object-cover border ${newProduct.displayImageIndex === idx ? 'border-primary-500' : 'border-gray-200'}`}
                      onClick={() => handleChange('displayImageIndex', idx)}
                    />
                    {newProduct.displayImageIndex === idx && (
                      <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">
                        Display
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* New local files (previews) */}
            {localFiles.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-3">
                {localFiles.map((file, idx) => {
                  const url = URL.createObjectURL(file);
                  return (
                    <div key={idx} className="relative">
                      <img src={url} alt={`new-${idx}`} className="w-20 h-20 rounded-lg object-cover border border-gray-200" />
                    </div>
                  );
                })}
              </div>
            )}

            <label className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <Upload className="w-4 h-4 mr-2" />
              <span>Upload (max 3, &lt;5MB)</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
            </label>
          </div>

          {/* Display image index selector (when at least one image exists) */}
          {(editingProduct ? (newProduct.images?.length > 0) : (localFiles.length > 0)) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Image Index</label>
              <input
                type="number"
                min="0"
                max={(editingProduct ? newProduct.images.length : localFiles.length) - 1}
                value={newProduct.displayImageIndex}
                onChange={(e) => handleChange('displayImageIndex', Number(e.target.value))}
                className="w-32 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Click an image above to set it as display, or enter an index.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={uploading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
            <Button type="submit" disabled={uploading}>
              {uploading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
            </Button>
          </div>
        </form>
      </Modal>

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ show: false, message: '', type: 'success' })}
      />
    </Layout>
  );
};

export default SellerDashboard;
