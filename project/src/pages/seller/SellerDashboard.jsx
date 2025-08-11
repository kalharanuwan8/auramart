import React, { useState, useEffect } from 'react';
import {
  Plus, Package, DollarSign, TrendingUp, MessageCircle,
  Edit, Trash2
} from 'lucide-react';
import Layout from '../../components/common/Layout';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Toast from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';
import { products, categories } from '../../data/products';
import { formatPrice } from '../../utils/helpers';

// Firebase imports
import { storage } from '../../firebase/firebase';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL
} from "firebase/storage";

const SellerDashboard = () => {
  const { user } = useAuth();
  const [sellerProducts, setSellerProducts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [newProduct, setNewProduct] = useState({
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
  const [uploading, setUploading] = useState(false);
  const [localFiles, setLocalFiles] = useState([]);

  useEffect(() => {
    const userProducts = products.filter(product => product.sellerId === user?.id);
    setSellerProducts(userProducts);
  }, [user]);

  // Handle file selection (limit 3)
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Validate number of files
    if (selectedFiles.length > 3) {
      setToast({
        show: true,
        message: 'Maximum 3 images allowed',
        type: 'error'
      });
      return;
    }

    // Basic validation before setting files
    const invalidFiles = selectedFiles.filter(
      file => !file.type.startsWith('image/') || file.size > 5 * 1024 * 1024
    );

    if (invalidFiles.length > 0) {
      setToast({
        show: true,
        message: 'Some files are invalid. Please ensure all files are images under 5MB',
        type: 'error'
      });
      return;
    }

    setLocalFiles(selectedFiles);
    setNewProduct(prev => ({ ...prev, displayImageIndex: 0 }));
  };

  // Upload images to Firebase and return URLs
  const uploadImages = async (files) => {
    setUploading(true);
    const uploadedUrls = [];
    
    try {
      for (const file of files) {
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File ${file.name} is too large. Maximum size is 5MB`);
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`File ${file.name} is not an image`);
        }

        const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const storageRef = ref(storage, `products/${user.id}/${filename}`);
        
        try {
          // Upload file
          const uploadTask = await uploadBytesResumable(storageRef, file);
          console.log(`Upload progress for ${file.name}: ${uploadTask.bytesTransferred} bytes`);
          
          // Get download URL
          const url = await getDownloadURL(uploadTask.ref);
          console.log(`Successfully uploaded ${file.name}: ${url}`);
          uploadedUrls.push(url);
        } catch (uploadError) {
          console.error(`Error uploading ${file.name}:`, uploadError);
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
        }
      }

      setUploading(false);
      return uploadedUrls;
      
    } catch (error) {
      setUploading(false);
      setToast({
        show: true,
        message: error.message,
        type: 'error'
      });
      console.error('Upload error:', error);
      return [];
    }
  };

  // ✅ FIXED: Add or Update Product
  const handleAddProduct = async (e) => {
    e.preventDefault();

    // Validate image presence
    if (!editingProduct && localFiles.length === 0) {
      setToast({ show: true, message: "Please upload at least one image.", type: 'error' });
      return;
    }

    // Upload images if selected
    let uploadedUrls = [];
    if (localFiles.length > 0) {
      uploadedUrls = await uploadImages(localFiles);
    }

    let finalImages = [];
    if (editingProduct) {
      if (localFiles.length > 0) {
        // Merge old + new
        finalImages = [...(newProduct.images || []), ...uploadedUrls];
      } else {
        // Keep existing
        finalImages = newProduct.images || [];
      }
    } else {
      finalImages = uploadedUrls;
    }

    if (finalImages.length === 0) {
      setToast({ show: true, message: "At least one image URL is required.", type: 'error' });
      return;
    }

    // Build product object
    const product = {
      id: editingProduct ? editingProduct.id : Date.now(),
      ...newProduct,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock),
      seller: user.storeName || user.name,
      sellerId: user.id,
      sales: editingProduct ? editingProduct.sales : 0,
      rating: editingProduct ? editingProduct.rating : 0,
      reviews: editingProduct ? editingProduct.reviews : 0,
      images: finalImages,
      displayImageIndex: newProduct.displayImageIndex || 0
    };

    // Update or Add
    let updatedProducts;
    if (editingProduct) {
      updatedProducts = sellerProducts.map(p => p.id === product.id ? product : p);
    } else {
      updatedProducts = [...sellerProducts, product];
    }

    setSellerProducts(updatedProducts);

    // Reset form
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
    setShowAddModal(false);

    setToast({
      show: true,
      message: editingProduct ? 'Product updated successfully!' : 'Product added successfully!',
      type: 'success'
    });
  };

  const handleDeleteProduct = (productId) => {
    setSellerProducts(sellerProducts.filter(p => p.id !== productId));
    setToast({
      show: true,
      message: 'Product deleted successfully!',
      type: 'success'
    });
  };

  const totalRevenue = sellerProducts.reduce((total, product) =>
    total + (product.price * product.sales), 0
  );

  const totalSales = sellerProducts.reduce((total, product) =>
    total + product.sales, 0
  );

  useEffect(() => {
    if (editingProduct) {
      setNewProduct(editingProduct);
      setLocalFiles([]);
    }
  }, [editingProduct]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user?.storeName || user?.name}</p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {editingProduct ? "Edit Product" : "Add Product"}
          </Button>
        </div>

        {/* Stats Cards */}
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

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">My Products</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sales
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sellerProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={product.images?.[product.displayImageIndex] || product.images?.[0] || 'https://via.placeholder.com/40'}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {product.stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {product.sales}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setNewProduct(product);
                            setShowAddModal(true);
                            setLocalFiles([]);
                          }}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingProduct(null);
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
        }}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        size="lg"
      >
        <form onSubmit={handleAddProduct} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
              <input
                type="number"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Images (1-3)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="w-full"
              disabled={uploading}
            />
            <p className="text-xs text-gray-500 mt-1">You can upload up to 3 images.</p>
          </div>

          {/* Image previews */}
          <div className="flex space-x-4 mt-4 overflow-x-auto">
            {localFiles.length > 0 && localFiles.map((file, index) => {
              const previewURL = URL.createObjectURL(file);
              return (
                <div key={index} className="relative">
                  <img src={previewURL} alt={`preview-${index}`} className="w-20 h-20 object-cover rounded" />
                  <input
                    type="radio"
                    name="displayImage"
                    checked={newProduct.displayImageIndex === index}
                    onChange={() => setNewProduct({ ...newProduct, displayImageIndex: index })}
                    className="absolute top-1 left-1"
                  />
                  <span className="absolute top-1 left-7 bg-white text-xs px-1 rounded">Display</span>
                </div>
              );
            })}

            {localFiles.length === 0 && editingProduct && newProduct.images?.map((url, index) => (
              <div key={index} className="relative">
                <img src={url} alt={`existing-${index}`} className="w-20 h-20 object-cover rounded" />
                <input
                  type="radio"
                  name="displayImage"
                  checked={newProduct.displayImageIndex === index}
                  onChange={() => setNewProduct({ ...newProduct, displayImageIndex: index })}
                  className="absolute top-1 left-1"
                />
                <span className="absolute top-1 left-7 bg-white text-xs px-1 rounded">Display</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sizes (comma separated)</label>
              <input
                type="text"
                value={Array.isArray(newProduct.sizes) ? newProduct.sizes.join(', ') : ''}
                onChange={(e) => setNewProduct({
                  ...newProduct,
                  sizes: e.target.value.split(',').map(s => s.trim())
                })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Colors (comma separated)</label>
              <input
                type="text"
                value={Array.isArray(newProduct.colors) ? newProduct.colors.join(', ') : ''}
                onChange={(e) => setNewProduct({
                  ...newProduct,
                  colors: e.target.value.split(',').map(c => c.trim())
                })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowAddModal(false);
                setEditingProduct(null);
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
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={uploading}
            >
              {uploading
                ? 'Uploading...'
                : editingProduct
                  ? 'Update Product'
                  : 'Add Product'}
            </Button>
          </div>
        </form>
      </Modal>

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </Layout>
  );
};

export default SellerDashboard;
