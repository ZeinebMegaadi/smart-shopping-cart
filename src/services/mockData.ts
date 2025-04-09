
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
  { id: 'beverages', name: 'Beverages', icon: '🧃' },
  { id: 'bakery', name: 'Baking & Cooking', icon: '🥖' },
  { id: 'condiments', name: 'Oils & Condiments', icon: '🛢️' },
  { id: 'snacks', name: 'Snacks & Sweets', icon: '🍬' },
  { id: 'breakfast', name: 'Breakfast & Cereals', icon: '🥣' },
  { id: 'meat', name: 'Meat & Processed Foods', icon: '🥩' },
  { id: 'household', name: 'Household Items', icon: '🧼' },
  { id: 'dairy', name: 'Dairy & Eggs', icon: '🥛' },
  { id: 'fruits', name: 'Fruits & Vegetables', icon: '🍎' },
  { id: 'pantry', name: 'Pantry', icon: '🥫' },
  { id: 'frozen', name: 'Frozen', icon: '❄️' },
];

// Mock subcategories
export const subcategories = {
  fruits: ['Fresh Fruits', 'Fresh Vegetables', 'Organic Produce', 'Pre-Cut & Prepared'],
  dairy: ['Milk', 'Cheese', 'Yogurt', 'Eggs', 'Butter'],
  bakery: ['Bread', 'Flour', 'Baking Ingredients', 'Cake Mixes'],
  meat: ['Beef', 'Poultry', 'Pork', 'Seafood', 'Processed Meats'],
  pantry: ['Pasta & Rice', 'Canned Goods', 'Spices', 'Baking'],
  frozen: ['Frozen Meals', 'Ice Cream', 'Frozen Vegetables', 'Pizza'],
  beverages: ['Water', 'Milk', 'Juice', 'Coffee & Tea', 'Soft Drinks'],
  snacks: ['Chips', 'Cookies', 'Candy', 'Nuts', 'Chocolate'],
  breakfast: ['Cereals', 'Oatmeal', 'Breakfast Bars', 'Jams'],
  condiments: ['Cooking Oils', 'Vinegars', 'Sauces', 'Spices'],
  household: ['Cleaning Supplies', 'Paper Products', 'Laundry', 'Kitchen Supplies'],
};

// Mock products with your provided items
export const products: Product[] = [
  // Beverages
  {
    id: '1',
    name: 'Water bottle Sabrine 1.5L',
    description: 'Pure mineral water in a 1.5L bottle',
    image: '/placeholder.svg',
    barcodeId: '6194007510014',
    category: 'beverages',
    subcategory: 'Water',
    aisle: 'A1',
    price: 0.99,
    quantityInStock: 120,
    popular: true,
  },
  {
    id: '2',
    name: 'Safia water 0.5L',
    description: 'Portable 0.5L water bottle for on-the-go hydration',
    image: '/placeholder.svg',
    barcodeId: '6194001800500',
    category: 'beverages',
    subcategory: 'Water',
    aisle: 'A1',
    price: 0.65,
    quantityInStock: 180,
  },
  {
    id: '3',
    name: 'Vitalait semi-skimmed milk 1L',
    description: 'Semi-skimmed milk rich in calcium and vitamins',
    image: '/placeholder.svg',
    barcodeId: '6191507220214',
    category: 'beverages',
    subcategory: 'Milk',
    aisle: 'A2',
    price: 2.30,
    quantityInStock: 45,
    popular: true,
  },
  
  // Baking & Cooking Essentials
  {
    id: '4',
    name: 'Warda Cake Flour 1kg',
    description: 'Fine cake flour for light and fluffy baking',
    image: '/placeholder.svg',
    barcodeId: '6191564600059',
    category: 'bakery',
    subcategory: 'Flour',
    aisle: 'B1',
    price: 3.20,
    quantityInStock: 50,
  },
  {
    id: '5',
    name: 'Cornstarch Vanoise',
    description: 'Thickening agent for sauces and desserts',
    image: '/placeholder.svg',
    barcodeId: '6191402801327',
    category: 'bakery',
    subcategory: 'Baking Ingredients',
    aisle: 'B1',
    price: 1.75,
    quantityInStock: 60,
  },
  {
    id: '6',
    name: 'Dry yeast',
    description: 'Active dry yeast for bread making',
    image: '/placeholder.svg',
    barcodeId: '6191514000414',
    category: 'bakery',
    subcategory: 'Baking Ingredients',
    aisle: 'B2',
    price: 1.50,
    quantityInStock: 70,
    popular: true,
  },
  {
    id: '7',
    name: 'Salt 500g Le Flamant',
    description: 'Fine table salt for cooking and seasoning',
    image: '/placeholder.svg',
    barcodeId: '6192003302046',
    category: 'bakery',
    subcategory: 'Baking Ingredients',
    aisle: 'B2',
    price: 0.80,
    quantityInStock: 100,
  },
  
  // Oils & Condiments
  {
    id: '8',
    name: 'Cristal 0.9L Corn oil',
    description: 'Pure corn oil for cooking and frying',
    image: '/placeholder.svg',
    barcodeId: '6191564500724',
    category: 'condiments',
    subcategory: 'Cooking Oils',
    aisle: 'C1',
    price: 8.50,
    quantityInStock: 40,
  },
  
  // Snacks & Sweets
  {
    id: '9',
    name: 'Chips Tortillas Salt',
    description: 'Crunchy tortilla chips with sea salt',
    image: '/placeholder.svg',
    barcodeId: '6191454720658',
    category: 'snacks',
    subcategory: 'Chips',
    aisle: 'D1',
    price: 3.99,
    quantityInStock: 85,
    popular: true,
  },
  {
    id: '10',
    name: 'Chocolate Maestro 8 pieces',
    description: 'Assorted premium chocolate pieces',
    image: '/placeholder.svg',
    barcodeId: '6190405449941',
    category: 'snacks',
    subcategory: 'Chocolate',
    aisle: 'D2',
    price: 5.25,
    quantityInStock: 30,
  },
  {
    id: '11',
    name: 'Mentos Fanta',
    description: 'Orange-flavored chewy candy',
    image: '/placeholder.svg',
    barcodeId: '6921211119041',
    category: 'snacks',
    subcategory: 'Candy',
    aisle: 'D3',
    price: 1.20,
    quantityInStock: 65,
  },
  {
    id: '12',
    name: 'Danette Dark Chocolate',
    description: 'Rich dark chocolate pudding',
    image: '/placeholder.svg',
    barcodeId: '61945234',
    category: 'snacks',
    subcategory: 'Chocolate',
    aisle: 'D2',
    price: 2.75,
    quantityInStock: 48,
  },
  {
    id: '13',
    name: 'Chewing gum Mentos White Sugar-Free',
    description: 'Fresh mint sugar-free chewing gum',
    image: '/placeholder.svg',
    barcodeId: '8935001720674',
    category: 'snacks',
    subcategory: 'Candy',
    aisle: 'D3',
    price: 1.45,
    quantityInStock: 90,
  },
  
  // Breakfast & Cereals
  {
    id: '14',
    name: 'Corn flakes Santé brand',
    description: 'Crispy breakfast corn flakes',
    image: '/placeholder.svg',
    barcodeId: '5900671014948',
    category: 'breakfast',
    subcategory: 'Cereals',
    aisle: 'E1',
    price: 4.15,
    quantityInStock: 35,
    popular: true,
  },
  
  // Meat & Processed Foods
  {
    id: '15',
    name: 'Smoked sausages Mliha',
    description: 'Traditional smoked beef sausages',
    image: '/placeholder.svg',
    barcodeId: '6191507500011',
    category: 'meat',
    subcategory: 'Processed Meats',
    aisle: 'F1',
    price: 7.90,
    quantityInStock: 25,
  },
  
  // Household Items
  {
    id: '16',
    name: 'Lilas dishwashing liquid Lemon',
    description: 'Lemon-scented dishwashing liquid',
    image: '/placeholder.svg',
    barcodeId: '6192477621568',
    category: 'household',
    subcategory: 'Cleaning Supplies',
    aisle: 'G1',
    price: 3.50,
    quantityInStock: 55,
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
  { category: 'Beverages', stock: 350 },
  { category: 'Dairy & Eggs', stock: 275 },
  { category: 'Baking & Cooking', stock: 210 },
  { category: 'Meat & Processed Foods', stock: 190 },
  { category: 'Pantry', stock: 450 },
  { category: 'Frozen', stock: 180 },
  { category: 'Oils & Condiments', stock: 120 },
  { category: 'Snacks & Sweets', stock: 240 },
  { category: 'Breakfast & Cereals', stock: 160 },
  { category: 'Household Items', stock: 200 },
];

// Mock best selling products
export const bestSellers = [
  { id: '1', name: 'Water bottle Sabrine 1.5L', units: 125 },
  { id: '9', name: 'Chips Tortillas Salt', units: 98 },
  { id: '3', name: 'Vitalait semi-skimmed milk 1L', units: 92 },
  { id: '6', name: 'Dry yeast', units: 87 },
  { id: '14', name: 'Corn flakes Santé brand', units: 76 },
];
