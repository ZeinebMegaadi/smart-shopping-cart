
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { products, sales, inventory, bestSellers } from "@/services/mockData";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { CalendarDays, DollarSign, TrendingUp, Users } from "lucide-react";

// Calculate additional analytics
const calculateAnalytics = () => {
  // Total inventory value
  const totalInventoryValue = products.reduce(
    (sum, product) => sum + product.price * product.quantityInStock, 0
  );
  
  // Total products
  const totalProducts = products.length;
  
  // Total sales
  const totalSales = sales.reduce((sum, month) => sum + month.total, 0);
  
  // Low stock items (less than 50 in stock)
  const lowStockItems = products.filter(
    (product) => product.quantityInStock < 50
  ).length;
  
  // Calculate revenue trend (% increase from first to last month)
  const firstMonth = sales[0]?.total || 0;
  const lastMonth = sales[sales.length - 1]?.total || 0;
  const revenueTrend = firstMonth ? ((lastMonth - firstMonth) / firstMonth) * 100 : 0;
  
  // Categories with lowest inventory
  const lowInventoryCategories = [...inventory]
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 3)
    .map(item => item.category);
    
  // Average price per category
  const categoryPrices = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = { total: 0, count: 0 };
    }
    acc[product.category].total += product.price;
    acc[product.category].count += 1;
    return acc;
  }, {});
  
  const avgPriceByCategory = Object.entries(categoryPrices).map(([category, data]) => ({
    category,
    avgPrice: data.total / data.count
  }));
  
  return {
    totalInventoryValue,
    totalProducts,
    totalSales,
    lowStockItems,
    revenueTrend,
    lowInventoryCategories,
    avgPriceByCategory
  };
};

const analytics = calculateAnalytics();

// Custom colors for charts
const COLORS = ['#0DB4B9', '#8B5CF6', '#FFC145', '#FF6B6B', '#36D399', '#8884d8', '#82ca9d', '#ffc658'];

// Function to format currency in TND
const formatTND = (value) => {
  return `${value.toFixed(2)} TND`;
};

const formatPercentage = (value) => {
  return `${value.toFixed(1)}%`;
};

const DashboardStats = () => {
  // Enhanced sales data with projections
  const enhancedSales = [...sales];
  if (sales.length > 0) {
    const lastMonth = sales[sales.length - 1];
    const avgGrowth = sales.length > 1 
      ? (sales[sales.length - 1].total - sales[0].total) / (sales.length - 1)
      : 0;
      
    // Add projected months
    enhancedSales.push({ 
      month: 'Aug', 
      total: lastMonth.total + avgGrowth,
      projected: true 
    });
    enhancedSales.push({ 
      month: 'Sep', 
      total: lastMonth.total + avgGrowth * 2,
      projected: true 
    });
  }
  
  // Sales by category data
  const salesByCategory = [
    { name: 'Beverages', value: 12500 },
    { name: 'Snacks', value: 9800 },
    { name: 'Dairy', value: 7400 },
    { name: 'Pantry', value: 6200 },
    { name: 'Household', value: 4100 },
  ];
  
  // Monthly visits data
  const monthlyVisits = [
    { month: 'Jan', visits: 1200 },
    { month: 'Feb', visits: 1350 },
    { month: 'Mar', visits: 1800 },
    { month: 'Apr', visits: 1650 },
    { month: 'May', visits: 1950 },
    { month: 'Jun', visits: 2100 },
    { month: 'Jul', visits: 2300 },
  ];
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="dashboard-card hover-scale transition-all duration-300 border border-primary/10 bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-primary" />
              Total Inventory Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTND(analytics.totalInventoryValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">Across {analytics.totalProducts} products</p>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card hover-scale transition-all duration-300 border border-primary/10 bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium flex items-center">
              <Users className="h-4 w-4 mr-2 text-primary" />
              Low Stock Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.lowStockItems}</div>
            <p className="text-xs text-muted-foreground mt-1">Need reordering soon</p>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card hover-scale transition-all duration-300 border border-primary/10 bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-primary" />
              Total Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTND(analytics.totalSales)}</div>
            <p className={`text-xs ${analytics.revenueTrend >= 0 ? 'text-green-500' : 'text-red-500'} mt-1 flex items-center`}>
              <TrendingUp className="h-3 w-3 mr-1" />
              {formatPercentage(Math.abs(analytics.revenueTrend))} {analytics.revenueTrend >= 0 ? 'increase' : 'decrease'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card hover-scale transition-all duration-300 border border-primary/10 bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium flex items-center">
              <CalendarDays className="h-4 w-4 mr-2 text-primary" />
              Inventory Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Low stock: {analytics.lowInventoryCategories[0]}, {analytics.lowInventoryCategories[1]}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="dashboard-card hover-lift glass-effect border-gradient">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={enhancedSales} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `${value} TND`} />
                  <Tooltip 
                    formatter={(value) => [`${value.toFixed(2)} TND`, 'Revenue']}
                  />
                  <Legend />
                  <Line 
                    name="Actual Revenue" 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#0DB4B9" 
                    strokeWidth={2} 
                    activeDot={{ r: 8 }}
                    dot={{ stroke: '#0DB4B9', strokeWidth: 2, fill: 'white', r: 4 }}
                  />
                  {/* Dashed line for projections */}
                  <Line 
                    name="Projected Revenue" 
                    type="monotone" 
                    dataKey={(data) => data.projected ? data.total : null} 
                    stroke="#8B5CF6" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ stroke: '#8B5CF6', strokeWidth: 2, fill: 'white', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card hover-lift glass-effect border-gradient">
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    animationDuration={800}
                  >
                    {salesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value.toFixed(2)} TND`, 'Sales']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card hover-lift glass-effect border-gradient">
          <CardHeader>
            <CardTitle>Store Traffic</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyVisits} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value} visitors`, 'Traffic']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Legend />
                  <Bar name="Monthly Visitors" dataKey="visits" fill="#FFC145" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1 lg:col-span-1 dashboard-card hover-lift glass-effect border-gradient">
          <CardHeader>
            <CardTitle>Best Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  layout="vertical" 
                  data={bestSellers} 
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={150} 
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value} units`, 'Sales']}
                  />
                  <Bar dataKey="units" fill="#FF6B6B" radius={[0, 4, 4, 0]}>
                    {bestSellers.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardStats;
