export const categories = [
  'Dresses',
  'Shirts & Blouses',
  'Pants & Jeans',
  'Shoes',
  'Accessories',
  'Bags',
  'Jewelry',
  'Outerwear'
];

export const products = [
  {
    id: 1,
    name: "Elegant Summer Dress",
    category: "Dresses",
    price: 89.99,
    image: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "Beautiful flowing summer dress perfect for any occasion. Made with premium cotton blend fabric.",
    seller: "Fashion Forward",
    sellerId: "seller_1",
    sales: 234,
    rating: 4.5,
    reviews: 89,
    stock: 15,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Blue", "Red", "White"]
  },
  {
    id: 2,
    name: "Classic White Shirt",
    category: "Shirts & Blouses",
    price: 45.99,
    image: "https://images.pexels.com/photos/1337477/pexels-photo-1337477.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "Timeless white button-up shirt that pairs with everything. Professional and versatile.",
    seller: "Urban Style",
    sellerId: "seller_2",
    sales: 156,
    rating: 4.3,
    reviews: 67,
    stock: 8,
    sizes: ["S", "M", "L", "XL"],
    colors: ["White", "Light Blue"]
  },
  {
    id: 3,
    name: "Designer High Heels",
    category: "Shoes",
    price: 129.99,
    image: "https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "Luxurious high heels crafted with genuine leather. Perfect for formal events.",
    seller: "Luxury Steps",
    sellerId: "seller_3",
    sales: 78,
    rating: 4.8,
    reviews: 34,
    stock: 5,
    sizes: ["6", "7", "8", "9", "10"],
    colors: ["Black", "Red", "Nude"]
  },
  {
    id: 4,
    name: "Vintage Denim Jacket",
    category: "Outerwear",
    price: 75.50,
    image: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "Classic vintage-style denim jacket with a modern fit. Great for layering.",
    seller: "Retro Vibes",
    sellerId: "seller_4",
    sales: 112,
    rating: 4.6,
    reviews: 45,
    stock: 12,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Light Blue", "Dark Blue", "Black"]
  },
  {
    id: 5,
    name: "Bohemian Maxi Dress",
    category: "Dresses",
    price: 95.00,
    image: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "Flowing bohemian maxi dress with intricate patterns. Perfect for summer festivals.",
    seller: "Boho Chic",
    sellerId: "seller_5",
    sales: 89,
    rating: 4.4,
    reviews: 32,
    stock: 7,
    sizes: ["XS", "S", "M", "L"],
    colors: ["Floral", "Paisley", "Geometric"]
  },
  {
    id: 6,
    name: "Leather Crossbody Bag",
    category: "Bags",
    price: 159.99,
    image: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "Premium leather crossbody bag with adjustable strap. Perfect for everyday use.",
    seller: "Leather Craft",
    sellerId: "seller_6",
    sales: 203,
    rating: 4.7,
    reviews: 98,
    stock: 20,
    sizes: ["One Size"],
    colors: ["Brown", "Black", "Tan"]
  },
  {
    id: 7,
    name: "Statement Gold Necklace",
    category: "Jewelry",
    price: 79.99,
    image: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "Bold statement necklace with gold-plated finish. Makes any outfit stand out.",
    seller: "Glamour Jewelry",
    sellerId: "seller_7",
    sales: 145,
    rating: 4.2,
    reviews: 56,
    stock: 25,
    sizes: ["One Size"],
    colors: ["Gold", "Silver", "Rose Gold"]
  },
  {
    id: 8,
    name: "Skinny Fit Jeans",
    category: "Pants & Jeans",
    price: 69.99,
    image: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "Premium skinny fit jeans with stretch fabric for ultimate comfort and style.",
    seller: "Denim Co",
    sellerId: "seller_8",
    sales: 276,
    rating: 4.5,
    reviews: 123,
    stock: 30,
    sizes: ["26", "28", "30", "32", "34"],
    colors: ["Dark Blue", "Light Blue", "Black"]
  },
  {
    id: 9,
    name: "Silk Scarf Set",
    category: "Accessories",
    price: 39.99,
    image: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "Set of 3 luxury silk scarves with different patterns. Versatile and elegant.",
    seller: "Silk Avenue",
    sellerId: "seller_9",
    sales: 167,
    rating: 4.6,
    reviews: 78,
    stock: 18,
    sizes: ["One Size"],
    colors: ["Multi", "Pastel", "Bold"]
  },
  {
    id: 10,
    name: "Casual Sneakers",
    category: "Shoes",
    price: 119.99,
    image: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "Comfortable casual sneakers with premium cushioning. Perfect for everyday wear.",
    seller: "Comfort Walk",
    sellerId: "seller_10",
    sales: 189,
    rating: 4.4,
    reviews: 92,
    stock: 22,
    sizes: ["6", "7", "8", "9", "10", "11"],
    colors: ["White", "Black", "Gray"]
  }
];

export const sellers = [
  {
    id: "seller_1",
    name: "Fashion Forward",
    email: "contact@fashionforward.com",
    logo: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=200",
    banner: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=1200",
    description: "Trendy fashion for the modern woman",
    rating: 4.5,
    totalSales: 1250,
    joinDate: "2023-01-15"
  },
  {
    id: "seller_2",
    name: "Urban Style",
    email: "hello@urbanstyle.com",
    logo: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=200",
    banner: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=1200",
    description: "Urban streetwear and contemporary fashion",
    rating: 4.3,
    totalSales: 890,
    joinDate: "2023-02-20"
  }
];

export const reviews = [
  {
    id: 1,
    productId: 1,
    userId: "customer_1",
    userName: "Sarah Johnson",
    rating: 5,
    comment: "Absolutely love this dress! The quality is amazing and it fits perfectly.",
    date: "2024-01-15"
  },
  {
    id: 2,
    productId: 1,
    userId: "customer_2",
    userName: "Emily Chen",
    rating: 4,
    comment: "Beautiful dress, runs a bit small so order a size up.",
    date: "2024-01-10"
  },
  {
    id: 3,
    productId: 2,
    userId: "customer_3",
    userName: "Jessica Miller",
    rating: 4,
    comment: "Great quality shirt, very professional looking.",
    date: "2024-01-12"
  }
];

export const orders = [
  {
    id: "ORD001",
    customerId: "customer_1",
    items: [
      { productId: 1, quantity: 1, price: 89.99 },
      { productId: 3, quantity: 1, price: 129.99 }
    ],
    total: 219.98,
    status: "delivered",
    orderDate: "2024-01-10",
    shippingAddress: "123 Main St, New York, NY 10001"
  },
  {
    id: "ORD002",
    customerId: "customer_1",
    items: [
      { productId: 2, quantity: 2, price: 45.99 }
    ],
    total: 91.98,
    status: "shipped",
    orderDate: "2024-01-15",
    shippingAddress: "123 Main St, New York, NY 10001"
  }
];