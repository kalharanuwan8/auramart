import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import Layout from '../components/common/Layout';
import ProductGrid from '../components/product/ProductGrid';
import Button from '../components/common/Button';
import { useCart } from '../context/CartContext';

const FavoritesPage = () => {
  const { favorites } = useCart();

  if (favorites.length === 0) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Heart className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No favorites yet</h2>
          <p className="text-gray-600 mb-8">Save products you love to see them here</p>
          <Button asChild size="lg">
            <Link to="/">Start Shopping</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
          <span className="text-gray-600">{favorites.length} items</span>
        </div>

        <ProductGrid products={favorites} />
      </div>
    </Layout>
  );
};

export default FavoritesPage;