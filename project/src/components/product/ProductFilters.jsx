import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { categories } from '../../data/products';
import Button from '../common/Button';

const ProductFilters = ({ onFiltersChange, activeFilters }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState(activeFilters);

  const priceRanges = [
    { label: 'Under $50', min: 0, max: 50 },
    { label: '$50 - $100', min: 50, max: 100 },
    { label: '$100 - $200', min: 100, max: 200 },
    { label: 'Over $200', min: 200, max: Infinity }
  ];

  const ratings = [4, 3, 2, 1];

  const handleFilterChange = (filterType, value) => {
    setTempFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const applyFilters = () => {
    onFiltersChange(tempFilters);
    setIsOpen(false);
  };

  const clearFilters = () => {
    const clearedFilters = {
      category: '',
      priceRange: null,
      rating: 0,
      sortBy: 'latest'
    };
    setTempFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(activeFilters).some(value => 
    value && value !== '' && value !== 0 && value !== 'latest'
  );

  return (
    <div className="relative">
      {/* Filter Toggle Button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Filter className="h-4 w-4 mr-2" />
        Filters
        {hasActiveFilters && (
          <span className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            !
          </span>
        )}
      </Button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-6 z-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={tempFilters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
            <div className="space-y-2">
              {priceRanges.map((range, index) => (
                <label key={index} className="flex items-center">
                  <input
                    type="radio"
                    name="priceRange"
                    checked={tempFilters.priceRange === range}
                    onChange={() => handleFilterChange('priceRange', range)}
                    className="mr-2 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">{range.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Rating Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <div className="space-y-2">
              {ratings.map((rating) => (
                <label key={rating} className="flex items-center">
                  <input
                    type="radio"
                    name="rating"
                    checked={tempFilters.rating === rating}
                    onChange={() => handleFilterChange('rating', rating)}
                    className="mr-2 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">{rating}+ Stars</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={tempFilters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="latest">Latest</option>
              <option value="popularity">Popularity</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Rating</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={clearFilters}
              className="flex-1"
              size="sm"
            >
              Clear All
            </Button>
            <Button
              onClick={applyFilters}
              className="flex-1"
              size="sm"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFilters;