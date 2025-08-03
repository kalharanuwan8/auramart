import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Truck, Shield, ArrowLeft, MessageCircle } from 'lucide-react';
import Layout from '../components/common/Layout';
import Button from '../components/common/Button';
import Toast from '../components/common/Toast';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { products, reviews } from '../data/products';
import { formatPrice, generateStars, formatDate } from '../utils/helpers';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, addToFavorites, removeFromFavorites, isFavorite } = useCart();
  
  const [product, setProduct] = useState(null);
  const [productReviews, setProductReviews] = useState([]);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    const foundProduct = products.find(p => p.id === parseInt(id));
    if (foundProduct) {
      setProduct(foundProduct);
      setSelectedSize(foundProduct.sizes[0]);
      setSelectedColor(foundProduct.colors[0]);
      
      const productReviewsList = reviews.filter(r => r.productId === foundProduct.id);
      setProductReviews(productReviewsList);
    }
  }, [id]);

  if (!product) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-center text-gray-500">Product not found</p>
        </div>
      </Layout>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      setToast({
        show: true,
        message: 'Please select size and color',
        type: 'error'
      });
      return;
    }

    addToCart(product, quantity, selectedSize, selectedColor);
    setToast({
      show: true,
      message: 'Product added to cart!',
      type: 'success'
    });
  };

  const handleToggleFavorite = () => {
    if (isFavorite(product.id)) {
      removeFromFavorites(product.id);
      setToast({
        show: true,
        message: 'Removed from favorites',
        type: 'success'
      });
    } else {
      addToFavorites(product);
      setToast({
        show: true,
        message: 'Added to favorites!',
        type: 'success'
      });
    }
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!user) {
      setToast({
        show: true,
        message: 'Please login to submit a review',
        type: 'error'
      });
      return;
    }

    const review = {
      id: Date.now(),
      productId: product.id,
      userId: user.id,
      userName: user.name,
      rating: newReview.rating,
      comment: newReview.comment,
      date: new Date().toISOString().split('T')[0]
    };

    setProductReviews([review, ...productReviews]);
    setNewReview({ rating: 5, comment: '' });
    setToast({
      show: true,
      message: 'Review submitted successfully!',
      type: 'success'
    });
  };

  const stars = generateStars(product.rating);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Thumbnail gallery could go here */}
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100 opacity-60">
                  <img
                    src={product.image}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-lg text-gray-600">by {product.seller}</p>
            </div>

            {/* Rating and Reviews */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                {stars.map((star, index) => (
                  <Star
                    key={index}
                    className={`h-5 w-5 ${
                      star === 'full' 
                        ? 'text-yellow-400 fill-current' 
                        : star === 'half'
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-600">({product.reviews} reviews)</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-600">{product.sales} sold</span>
            </div>

            {/* Price */}
            <div>
              <span className="text-4xl font-bold text-primary-500">{formatPrice(product.price)}</span>
            </div>

            {/* Size Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Size</label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border rounded-lg transition-all ${
                      selectedSize === size
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Color</label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 border rounded-lg transition-all ${
                      selectedColor === color
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Quantity</label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                >
                  -
                </button>
                <span className="text-lg font-medium w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                >
                  +
                </button>
                <span className="text-sm text-gray-500">({product.stock} in stock)</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button
                onClick={handleAddToCart}
                className="flex-1"
                size="lg"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
              <Button
                onClick={handleToggleFavorite}
                variant={isFavorite(product.id) ? 'primary' : 'outline'}
                size="lg"
              >
                <Heart className={`h-5 w-5 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
              </Button>
              <Button
                variant="outline"
                size="lg"
              >
                <MessageCircle className="h-5 w-5" />
              </Button>
            </div>

            {/* Features */}
            <div className="border-t pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Truck className="h-5 w-5 text-primary-500" />
                  <span className="text-sm text-gray-600">Free shipping</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary-500" />
                  <span className="text-sm text-gray-600">Secure payment</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'description', label: 'Description' },
                { id: 'reviews', label: `Reviews (${productReviews.length})` },
                { id: 'shipping', label: 'Shipping' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Features</h4>
                    <ul className="text-gray-700 space-y-1">
                      <li>• Premium quality materials</li>
                      <li>• Comfortable fit</li>
                      <li>• Easy care instructions</li>
                      <li>• Sustainable production</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Care Instructions</h4>
                    <ul className="text-gray-700 space-y-1">
                      <li>• Machine wash cold</li>
                      <li>• Tumble dry low</li>
                      <li>• Do not bleach</li>
                      <li>• Iron on low heat</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-8">
                {/* Submit Review */}
                {user && user.userType === 'customer' && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h3>
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              type="button"
                              onClick={() => setNewReview({ ...newReview, rating })}
                              className="focus:outline-none"
                            >
                              <Star
                                className={`h-6 w-6 ${
                                  rating <= newReview.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                        <textarea
                          value={newReview.comment}
                          onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                          rows={4}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Share your experience with this product..."
                          required
                        />
                      </div>
                      <Button type="submit" size="sm">
                        Submit Review
                      </Button>
                    </form>
                  </div>
                )}

                {/* Reviews List */}
                <div className="space-y-6">
                  {productReviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-600 font-medium text-sm">
                              {review.userName.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-900">{review.userName}</h4>
                            <div className="flex">
                              {generateStars(review.rating).map((star, index) => (
                                <Star
                                  key={index}
                                  className={`h-4 w-4 ${
                                    star === 'full' 
                                      ? 'text-yellow-400 fill-current' 
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">{formatDate(review.date)}</span>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Delivery Options</h4>
                    <ul className="text-gray-700 space-y-2">
                      <li>• Standard Delivery (5-7 business days) - Free</li>
                      <li>• Express Delivery (2-3 business days) - $9.99</li>
                      <li>• Next Day Delivery - $19.99</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Return Policy</h4>
                    <ul className="text-gray-700 space-y-2">
                      <li>• 30-day free returns</li>
                      <li>• Items must be unworn</li>
                      <li>• Original packaging required</li>
                      <li>• Free return shipping</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Toast
        type={toast.type}
        message={toast.message}
        isVisible={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </Layout>
  );
};

export default ProductDetailPage;