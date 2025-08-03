import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedFavorites = localStorage.getItem('favorites');
    
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addToCart = (product, quantity = 1, selectedSize = null, selectedColor = null) => {
    const existingItem = cartItems.find(item => 
      item.id === product.id && 
      item.selectedSize === selectedSize && 
      item.selectedColor === selectedColor
    );

    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.id === product.id && 
        item.selectedSize === selectedSize && 
        item.selectedColor === selectedColor
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCartItems([...cartItems, { 
        ...product, 
        quantity, 
        selectedSize, 
        selectedColor,
        cartId: `${product.id}_${selectedSize}_${selectedColor}_${Date.now()}`
      }]);
    }
  };

  const removeFromCart = (cartId) => {
    setCartItems(cartItems.filter(item => item.cartId !== cartId));
  };

  const updateQuantity = (cartId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartId);
      return;
    }
    
    setCartItems(cartItems.map(item =>
      item.cartId === cartId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const addToFavorites = (product) => {
    if (!favorites.find(item => item.id === product.id)) {
      setFavorites([...favorites, product]);
    }
  };

  const removeFromFavorites = (productId) => {
    setFavorites(favorites.filter(item => item.id !== productId));
  };

  const isFavorite = (productId) => {
    return favorites.some(item => item.id === productId);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cartItems,
    favorites,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    getCartTotal,
    getCartItemsCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};