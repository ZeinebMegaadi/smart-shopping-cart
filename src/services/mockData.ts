
// Mock data for the Smart Shopping Cart application

export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  barcodeId: string;
  category: string;
  subcategory: string;
  aisle: string;
  price: number;
  quantityInStock: number;
  popular?: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'shopper' | 'owner';
  password: string; // In a real app, this would be hashed
}

export interface CartItem {
  productId: string;
  quantity: number;
}

// Mock categories
export const categories = [
  { id: 'fruits', name: 'Fruits & Vegetables', icon: '🍎' },
  { id: 'dairy', name: 'Dairy & Eggs', icon: '🥛' },
  { id: 'bakery', name: 'Bakery', icon: '🍞' },
  { id: 'meat', name: 'Meat & Seafood', icon: '🥩' },
  { id: 'pantry', name: 'Pantry', icon: '🥫' },
  { id: 'frozen', name: 'Frozen', icon: '❄️' },
  { id: 'beverages', name: 'Beverages', icon: '🥤' },
  { id: 'snacks', name: 'Snacks', icon: '🍫' },
];

// Mock subcategories
export const subcategories = {
  fruits: ['Fresh Fruits', 'Fresh Vegetables', 'Organic Produce', 'Pre-Cut & Prepared'],
  dairy: ['Milk', 'Cheese', 'Yogurt', 'Eggs', 'Butter'],
  bakery: ['Bread', 'Pastries', 'Cakes', 'Cookies'],
  meat: ['Beef', 'Poultry', 'Pork', 'Seafood'],
  pantry: ['Pasta & Rice', 'Canned Goods', 'Spices', 'Baking'],
  frozen: ['Frozen Meals', 'Ice Cream', 'Frozen Vegetables', 'Pizza'],
  beverages: ['Soda', 'Water', 'Juice', 'Coffee & Tea', 'Alcohol'],
  snacks: ['Chips', 'Cookies', 'Candy', 'Nuts', 'Popcorn'],
};

// Mock products
export const products: Product[] = [
  {
    id: '1',
    name: 'Organic Bananas',
    description: 'Sweet and fresh organic bananas',
    image: '/placeholder.svg',
    barcodeId: 'B001',
    category: 'fruits',
    subcategory: 'Fresh Fruits',
    aisle: 'A1',
    price: 1.99,
    quantityInStock: 150,
    popular: true,
  },
  {
    id: '2',
    name: 'Whole Milk',
    description: 'Fresh whole milk',
    image: '/placeholder.svg',
    barcodeId: 'D001',
    category: 'dairy',
    subcategory: 'Milk',
    aisle: 'B3',
    price: 3.49,
    quantityInStock: 75,
    popular: true,
  },
  {
    id: '3',
    name: 'Sourdough Bread',
    description: 'Freshly baked sourdough bread',
    image: '/placeholder.svg',
    barcodeId: 'B101',
    category: 'bakery',
    subcategory: 'Bread',
    aisle: 'C1',
    price: 4.99,
    quantityInStock: 30,
  },
  {
    id: '4',
    name: 'Ground Beef',
    description: '80% lean ground beef',
    image: '/placeholder.svg',
    barcodeId: 'M001',
    category: 'meat',
    subcategory: 'Beef',
    aisle: 'D2',
    price: 5.99,
    quantityInStock: 45,
    popular: true,
  },
  {
    id: '5',
    name: 'Pasta Sauce',
    description: 'Homestyle tomato pasta sauce',
    image: '/placeholder.svg',
    barcodeId: 'P101',
    category: 'pantry',
    subcategory: 'Canned Goods',
    aisle: 'E4',
    price: 2.99,
    quantityInStock: 100,
  },
  {
    id: '6',
    name: 'Vanilla Ice Cream',
    description: 'Premium vanilla bean ice cream',
    image: '/placeholder.svg',
    barcodeId: 'F001',
    category: 'frozen',
    subcategory: 'Ice Cream',
    aisle: 'F2',
    price: 4.49,
    quantityInStock: 60,
  },
  {
    id: '7',
    name: 'Sparkling Water',
    description: 'Refreshing sparkling water',
    image: '/placeholder.svg',
    barcodeId: 'B201',
    category: 'beverages',
    subcategory: 'Water',
    aisle: 'G3',
    price: 1.79,
    quantityInStock: 120,
  },
  {
    id: '8',
    name: 'Potato Chips',
    description: 'Original flavor potato chips',
    image: '/placeholder.svg',
    barcodeId: 'S001',
    category: 'snacks',
    subcategory: 'Chips',
    aisle: 'H1',
    price: 3.29,
    quantityInStock: 85,
    popular: true,
  },
  {
    id: '9',
    name: 'Avocado',
    description: 'Ripe Hass avocados',
    image: '/placeholder.svg',
    barcodeId: 'B002',
    category: 'fruits',
    subcategory: 'Fresh Vegetables',
    aisle: 'A2',
    price: 1.49,
    quantityInStock: 70,
  },
  {
    id: '10',
    name: 'Greek Yogurt',
    description: 'Plain Greek yogurt',
    image: '/placeholder.svg',
    barcodeId: 'D002',
    category: 'dairy',
    subcategory: 'Yogurt',
    aisle: 'B2',
    price: 4.99,
    quantityInStock: 40,
  },
  {
    id: '11',
    name: 'Chocolate Chip Cookies',
    description: 'Fresh baked chocolate chip cookies',
    image: '/placeholder.svg',
    barcodeId: 'B102',
    category: 'bakery',
    subcategory: 'Cookies',
    aisle: 'C3',
    price: 3.99,
    quantityInStock: 55,
    popular: true,
  },
  {
    id: '12',
    name: 'Chicken Breast',
    description: 'Boneless, skinless chicken breasts',
    image: '/placeholder.svg',
    barcodeId: 'M002',
    category: 'meat',
    subcategory: 'Poultry',
    aisle: 'D1',
    price: 6.99,
    quantityInStock: 65,
  },
];

// Mock users
export const users: User[] = [
  {
    id: '1',
    email: 'shopper@example.com',
    name: 'Sam Shopper',
    role: 'shopper',
    password: 'password123'
  },
  {
    id: '2',
    email: 'owner@example.com',
    name: 'Olivia Owner',
    role: 'owner',
    password: 'password123'
  }
];

// Mock order/sales data for analytics
export const sales = [
  { month: 'Jan', total: 2400 },
  { month: 'Feb', total: 1398 },
  { month: 'Mar', total: 9800 },
  { month: 'Apr', total: 3908 },
  { month: 'May', total: 4800 },
  { month: 'Jun', total: 3800 },
  { month: 'Jul', total: 4300 },
];

// Mock inventory level data for analytics
export const inventory = [
  { category: 'Fruits & Vegetables', stock: 350 },
  { category: 'Dairy & Eggs', stock: 275 },
  { category: 'Bakery', stock: 210 },
  { category: 'Meat & Seafood', stock: 190 },
  { category: 'Pantry', stock: 450 },
  { category: 'Frozen', stock: 180 },
  { category: 'Beverages', stock: 320 },
  { category: 'Snacks', stock: 240 },
];

// Mock best selling products
export const bestSellers = [
  { id: '1', name: 'Organic Bananas', units: 125 },
  { id: '4', name: 'Ground Beef', units: 98 },
  { id: '8', name: 'Potato Chips', units: 92 },
  { id: '2', name: 'Whole Milk', units: 87 },
  { id: '11', name: 'Chocolate Chip Cookies', units: 76 },
];
