import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, MessageCircle, LogOut, Settings, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useChat } from '../../context/ChatContext';
import { getCountryFlag, debounce } from '../../utils/helpers';
import { products } from '../../data/products';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { getCartItemsCount } = useCart();
  const { unreadCount } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [countryFlag, setCountryFlag] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setCountryFlag(getCountryFlag());
  }, []);

  const debouncedSearch = debounce((query) => {
    if (query.trim()) {
      const results = products.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, 300);

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults([]);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    switch (user?.userType) {
      case 'customer':
        return '/customer/dashboard';
      case 'seller':
        return '/seller/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  return (
    <nav className="bg-white shadow-lg border-b-2 border-primary-500 sticky top-0 z-50">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-gray-900">
                <span className='text-red-800'>R</span>ello.lk
              </span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8 relative">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </form>
            
            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-50">
                {searchResults.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="flex items-center p-3 hover:bg-gray-50 border-b last:border-b-0"
                    onClick={() => {
                      setSearchResults([]);
                      setSearchQuery('');
                    }}
                  >
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">${product.price}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right Side Icons - Always in the corner */}
          <div className="flex-shrink-0 flex items-center space-x-2">
            {user ? (
              <>
                {/* Cart (Customer only) */}
                {user.userType === 'customer' && (
                  <Link to="/cart" className="relative p-2 text-gray-600 hover:text-primary-500 hover:bg-gray-100 rounded-lg transition-all duration-200">
                    <ShoppingCart className="h-6 w-6" />
                    {getCartItemsCount() > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {getCartItemsCount()}
                      </span>
                    )}
                  </Link>
                )}

                {/* Favorites (Customer only) */}
                {user.userType === 'customer' && (
                  <Link to="/favorites" className="p-2 text-gray-600 hover:text-primary-500 hover:bg-gray-100 rounded-lg transition-all duration-200">
                    <Heart className="h-6 w-6" />
                  </Link>
                )}

                {/* Chat */}
                

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
                  >
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.name}</span>
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <Link
                        to={getDashboardLink()}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowDropdown(false)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                      
                      {user.userType === 'customer' && (
                        <Link
                          to="/orders"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowDropdown(false)}
                        >
                          <Package className="h-4 w-4 mr-2" />
                          Orders
                        </Link>
                      )}
                      
                      <div className="border-t border-gray-200 my-2"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Login/Signup Section - Enhanced corner positioning */
              <div className="flex items-center space-x-3 ml-4">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-primary-500 font-medium transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-gray-100"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-primary-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors duration-200 shadow-sm hover:shadow-md"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;