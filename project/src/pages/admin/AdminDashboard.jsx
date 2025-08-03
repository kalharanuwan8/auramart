import React, { useState, useEffect } from 'react';
import { Users, Package, DollarSign, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import Layout from '../../components/common/Layout';
import Button from '../../components/common/Button';
import { formatPrice } from '../../utils/helpers';
import { products } from '../../data/products';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 1247,
    totalSellers: 156,
    totalProducts: products.length,
    totalRevenue: 125430.50,
    pendingApprovals: 8,
    monthlyGrowth: 12.5
  });

  const [recentOrders] = useState([
    { id: 'ORD001', customer: 'Sarah Johnson', amount: 129.99, status: 'completed' },
    { id: 'ORD002', customer: 'Mike Chen', amount: 89.50, status: 'processing' },
    { id: 'ORD003', customer: 'Emily Davis', amount: 199.99, status: 'shipped' },
  ]);

  const [platformActivities] = useState([
    { id: 1, type: 'user_signup', message: 'New customer registered: jane@email.com', time: '2 minutes ago' },
    { id: 2, type: 'product_added', message: 'New product added: Designer Handbag', time: '15 minutes ago' },
    { id: 3, type: 'order_placed', message: 'Order #ORD123 placed for $89.99', time: '1 hour ago' },
  ]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Platform overview and management</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Package className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-primary-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalRevenue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Growth</p>
                <p className="text-2xl font-bold text-gray-900">+{stats.monthlyGrowth}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{order.id}</p>
                      <p className="text-sm text-gray-600">{order.customer}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatPrice(order.amount)}</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        order.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'processing'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Platform Activities */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Platform Activities</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {platformActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${
                      activity.type === 'user_signup' 
                        ? 'bg-green-100'
                        : activity.type === 'product_added'
                        ? 'bg-blue-100'
                        : 'bg-primary-100'
                    }`}>
                      {activity.type === 'user_signup' && <Users className="h-4 w-4 text-green-500" />}
                      {activity.type === 'product_added' && <Package className="h-4 w-4 text-blue-500" />}
                      {activity.type === 'order_placed' && <DollarSign className="h-4 w-4 text-primary-500" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Management Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Product Approvals</h3>
            <p className="text-3xl font-bold text-yellow-500 mb-4">{stats.pendingApprovals}</p>
            <Button variant="outline" size="sm" className="w-full">
              Review Products
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Users className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">User Management</h3>
            <p className="text-3xl font-bold text-blue-500 mb-4">{stats.totalUsers}</p>
            <Button variant="outline" size="sm" className="w-full">
              Manage Users
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Platform Health</h3>
            <p className="text-3xl font-bold text-green-500 mb-4">99.9%</p>
            <Button variant="outline" size="sm" className="w-full">
              View Reports
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;