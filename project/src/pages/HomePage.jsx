import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Star, Users, Package } from 'lucide-react';
import Layout from '../components/common/Layout';
import ProductGrid from '../components/product/ProductGrid';
import ProductFilters from '../components/product/ProductFilters';
import Button from '../components/common/Button';
import { products, categories } from '../data/products';

const HomePage = () => {
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [filters, setFilters] = useState({
    category: '',
    priceRange: null,
    rating: 0,
    sortBy: 'latest'
  });

  useEffect(() => {
    let filtered = [...products];

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Apply price range filter
    if (filters.priceRange) {
      filtered = filtered.filter(product => 
        product.price >= filters.priceRange.min && 
        product.price <= filters.priceRange.max
      );
    }

    // Apply rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter(product => product.rating >= filters.rating);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'popularity':
        filtered.sort((a, b) => b.sales - a.sales);
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // Latest - keep original order
        break;
    }

    setFilteredProducts(filtered);
  }, [filters]);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-500 to-primary-700 text-white py-20 overflow-hidden">
        {/* Background Images */}
        <div className="absolute inset-0 flex">
          <div className="w-1/3 h-full bg-cover bg-center transition-transform duration-700 hover:-translate-x-4" 
               style={{backgroundImage: 'url(https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=800)'}}>
            <div className="w-full h-full bg-black bg-opacity-40"></div>
          </div>
          <div className="w-1/3 h-full bg-cover bg-center transition-transform duration-700 hover:-translate-x-4" 
               style={{backgroundImage: 'url(https://images.pexels.com/photos/1337477/pexels-photo-1337477.jpeg?auto=compress&cs=tinysrgb&w=800)'}}>
            <div className="w-full h-full bg-black bg-opacity-40"></div>
          </div>
          <div className="w-1/3 h-full bg-cover bg-center transition-transform duration-700 hover:-translate-x-4" 
               style={{backgroundImage: 'url(https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=800)'}}>
            <div className="w-full h-full bg-black bg-opacity-40"></div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center relative z-10">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Discover Fashion
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 animate-slide-up">
              Connect with top sellers across Sri Lanka and find your perfect style
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/signup">Start Shopping</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary-500" asChild>
                <Link to="/seller/signup">Become a Seller</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:bg-primary-500 group-hover:scale-110 transition-all duration-300">
                <Package className="h-8 w-8 text-primary-500 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">10K+</h3>
              <p className="text-gray-600">Products</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:bg-primary-500 group-hover:scale-110 transition-all duration-300">
                <Users className="h-8 w-8 text-primary-500 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">500+</h3>
              <p className="text-gray-600">Sellers</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:bg-primary-500 group-hover:scale-110 transition-all duration-300">
                <TrendingUp className="h-8 w-8 text-primary-500 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">50K+</h3>
              <p className="text-gray-600">Happy Customers</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:bg-primary-500 group-hover:scale-110 transition-all duration-300">
                <Star className="h-8 w-8 text-primary-500 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">4.8</h3>
              <p className="text-gray-600">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Shop by Category</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {categories.slice(0, 8).map((category, index) => (
              <button
                key={category}
                onClick={() => handleFiltersChange({ ...filters, category })}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-full hover:bg-primary-500 hover:text-white transition-all duration-300 transform hover:scale-105"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">Featured Products</h2>
            <ProductFilters onFiltersChange={handleFiltersChange} activeFilters={filters} />
          </div>
          
          <ProductGrid products={filteredProducts} />
          
          {filteredProducts.length > 0 && (
            <div className="text-center mt-12">
              <Button size="lg" variant="outline">
                Load More Products
              </Button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;