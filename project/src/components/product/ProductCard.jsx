import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatPrice, generateStars } from '../../utils/helpers';
import Button from '../common/Button';
import Toast from '../common/Toast';

const ProductCard = ({ product }) => {
  const { addToCart, addToFavorites, removeFromFavorites, isFavorite } = useCart();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setToastMessage('Product added to cart!');
    setShowToast(true);
  };

  const handleToggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isFavorite(product.id)) {
      removeFromFavorites(product.id);
      setToastMessage('Removed from favorites');
    } else {
      addToFavorites(product);
      setToastMessage('Added to favorites!');
    }
    setShowToast(true);
  };

  const stars = generateStars(product.rating);

  return (
    <>
      <Link to={`/product/${product.id}`}>
        <div 
          className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Product Image */}
          <div className="relative overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            
            {/* Favorite Button */}
            <button
              onClick={handleToggleFavorite}
              className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
                isFavorite(product.id)
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Heart className={`h-4 w-4 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
            </button>

            {/* Add to Cart Overlay */}
            <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 transform transition-all duration-300 ${
              isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
            }`}>
              <Button
                onClick={handleAddToCart}
                className="w-full bg-white text-gray-900 hover:bg-gray-100"
                size="sm"
              >
                <ShoppingCart className="h-4 w-4 mr-2 text-red-600" />
                Add to Cart
              </Button>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
            
            {/* Rating */}
            <div className="flex items-center mb-2">
              <div className="flex">
                {stars.map((star, index) => (
                  <Star
                    key={index}
                    className={`h-4 w-4 ${
                      star === 'full' 
                        ? 'text-yellow-400 fill-current' 
                        : star === 'half'
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 ml-2">({product.reviews})</span>
            </div>

            {/* Seller */}
            <p className="text-sm text-gray-600 mb-2">by {product.seller}</p>

            {/* Price and Sales */}
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-primary-500">{formatPrice(product.price)}</span>
              <span className="text-sm text-gray-500">{product.sales} sold</span>
            </div>
          </div>
        </div>
      </Link>

      <Toast
        type="success"
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </>
  );
};

export default ProductCard;