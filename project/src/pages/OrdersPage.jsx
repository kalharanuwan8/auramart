import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';
import Layout from '../components/common/Layout';
import { useAuth } from '../context/AuthContext';
import { formatPrice, formatDate } from '../utils/helpers';
import { products } from '../data/products';

const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Load orders from localStorage
    const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const userOrders = savedOrders.filter(order => order.customerId === user?.id);
    setOrders(userOrders);
  }, [user]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processing':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-blue-500" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'processing':
        return 'text-yellow-700 bg-yellow-100';
      case 'shipped':
        return 'text-blue-700 bg-blue-100';
      case 'delivered':
        return 'text-green-700 bg-green-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  if (orders.length === 0) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Package className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No orders yet</h2>
          <p className="text-gray-600 mb-8">When you place orders, they'll appear here</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Order Header */}
              <div className="bg-gray-50 px-6 py-4 border-b">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-lg font-semibold text-gray-900">Order #{order.id}</h3>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-2 capitalize">{order.status}</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mt-2 sm:mt-0">
                    Ordered on {formatDate(order.orderDate)}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="px-6 py-4">
                <div className="space-y-4">
                  {order.items.map((item) => {
                    const product = products.find(p => p.id === item.productId);
                    if (!product) return null;

                    return (
                      <div key={`${item.productId}-${item.selectedSize}-${item.selectedColor}`} className="flex items-center space-x-4">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{product.name}</h4>
                          <p className="text-sm text-gray-600">by {product.seller}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm text-gray-600">Size: {item.selectedSize}</span>
                            <span className="text-sm text-gray-600">Color: {item.selectedColor}</span>
                            <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Order Total */}
                <div className="border-t mt-4 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-primary-500">{formatPrice(order.total)}</span>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-1">Shipping Address</h4>
                  <p className="text-sm text-gray-600">{order.shippingAddress}</p>
                </div>
              </div>
            </div>
          ))}
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

export default OrdersPage;