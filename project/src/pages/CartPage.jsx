import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import Layout from '../components/common/Layout';
import Button from '../components/common/Button';
import Toast from '../components/common/Toast';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/helpers';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setIsCheckingOut(true);
    
    // Mock Stripe checkout process
    setTimeout(() => {
      setToast({
        show: true,
        message: 'Order placed successfully! Redirecting to orders...',
        type: 'success'
      });
      
      // Create mock order
      const order = {
        id: `ORD${Date.now()}`,
        customerId: user.id,
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor
        })),
        total: getCartTotal(),
        status: 'processing',
        orderDate: new Date().toISOString(),
        shippingAddress: '123 Main St, New York, NY 10001'
      };

      // Save order to localStorage
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      localStorage.setItem('orders', JSON.stringify([order, ...existingOrders]));

      clearCart();
      
      setTimeout(() => {
        navigate('/orders');
      }, 2000);
    }, 2000);
  };

  if (cartItems.length === 0) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Start shopping to add items to your cart</p>
          <Button asChild size="lg">
            <Link to="/">Start Shopping</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.cartId} className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-600">by {item.seller}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-sm text-gray-600">Size: {item.selectedSize}</span>
                    <span className="text-sm text-gray-600">Color: {item.selectedColor}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                    className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-lg font-medium w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                    className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-primary-500">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                  <button
                    onClick={() => {
                      removeFromCart(item.cartId);
                      setToast({
                        show: true,
                        message: 'Item removed from cart',
                        type: 'success'
                      });
                    }}
                    className="text-red-500 hover:text-red-700 mt-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(getCartTotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">{formatPrice(getCartTotal() * 0.08)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-primary-500">
                      {formatPrice(getCartTotal() * 1.08)}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                className="w-full mb-4"
                size="lg"
                loading={isCheckingOut}
              >
                {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
              </Button>

              <Button
                variant="outline"
                className="w-full"
                asChild
              >
                <Link to="/">Continue Shopping</Link>
              </Button>
            </div>
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

export default CartPage;