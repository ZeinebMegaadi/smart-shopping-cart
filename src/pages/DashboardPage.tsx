
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardStats from "@/components/dashboard/DashboardStats";
import { InventoryTable } from "@/components/dashboard/InventoryTable"; // Changed to named import
import UserManagement from "@/components/dashboard/UserManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Package2, Activity, Grid2X2, Users } from "lucide-react";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { Product } from "@/services/mockData";
import { toast } from "@/components/ui/use-toast";

const transformProducts = (dbProducts: any[]): Product[] => {
  return dbProducts.map(item => ({
    id: `product_${item['Barcode ID'] || Date.now()}`,
    name: item.Product || '',
    description: '',
    // Use image-url field if available, fallback to placeholder
    image: item['image-url'] || '/placeholder.svg',
    barcodeId: String(item['Barcode ID'] || ''),
    category: item.Category || '',
    subcategory: item.Subcategory || '',
    aisle: item.Aisle || '',
    price: item.Price || 0,
    quantityInStock: item.Stock || 0,
  }));
};

const DashboardPage = () => {
  const { isAuthenticated, userRole } = useAuthStatus();
  const [activeTab, setActiveTab] = useState("overview");
  const [isVisible, setIsVisible] = useState(false);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [shoppers, setShoppers] = useState<any[]>([]);
  const [shoppingLists, setShoppingLists] = useState([]);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
    
    const fetchInitialData = async () => {
      try {
        // Fetch products
        const { data: initialProducts, error: productsError } = await supabase.from('products').select('*');
        if (productsError) {
          console.error("Error fetching products:", productsError);
        } else {
          console.log("Fetched products:", initialProducts?.length || 0);
          setProducts(transformProducts(initialProducts || []));
        }
        
        // Fetch shoppers with improved logging
        const { data: shoppersData, error: shoppersError } = await supabase
          .from('shoppers')
          .select('*');

        if (shoppersError) {
          console.error("Error fetching shoppers:", shoppersError);
          toast({
            title: "Error",
            description: "Failed to fetch shoppers data",
            variant: "destructive",
          });
        } else {
          console.log("Fetched shoppers data:", shoppersData);
          if (Array.isArray(shoppersData)) {
            setShoppers(shoppersData);
            console.log("Updated shoppers state with:", shoppersData.length, "items");
            
            // Fetch shopping lists for each shopper
            for (const shopper of shoppersData) {
              try {
                const { data: shopperLists, error: listError } = await supabase
                  .from('shopping_list')
                  .select('*')
                  .eq('shopper_id', shopper.id);
                  
                if (listError) {
                  console.error(`Error fetching lists for shopper ${shopper.id}:`, listError);
                } else {
                  console.log(`Fetched ${shopperLists?.length || 0} list items for shopper ${shopper.id}`);
                }
              } catch (err) {
                console.error("Error in shopping list fetch:", err);
              }
            }
          } else {
            console.error("Shoppers data is not an array:", shoppersData);
          }
        }
        
        // Fetch all shopping lists
        const { data: initialShoppingLists, error: listsError } = await supabase.from('shopping_list').select('*');
        if (listsError) {
          console.error("Error fetching shopping lists:", listsError);
        } else {
          console.log("Fetched shopping lists:", initialShoppingLists?.length || 0);
          setShoppingLists(initialShoppingLists || []);
        }
      } catch (error) {
        console.error("Error in fetchInitialData:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      }
    };

    fetchInitialData();
    
    // Set up real-time subscription for shoppers table
    const shoppersChannel = supabase
      .channel('shoppers-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shoppers' },
        (payload) => {
          console.log('Shoppers change received:', payload);
          if (payload.eventType === 'INSERT') {
            setShoppers((prev) => [...prev, payload.new]);
            toast({
              title: "New shopper added",
              description: `${payload.new.email || "New user"} has been added`,
            });
          } else if (payload.eventType === 'UPDATE') {
            setShoppers((prev) =>
              prev.map((shopper) =>
                shopper.id === payload.old.id ? payload.new : shopper
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setShoppers((prev) =>
              prev.filter((shopper) => shopper.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();
      
    // Set up real-time subscription for shopping_list table
    const shoppingListChannel = supabase
      .channel('shopping-list-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shopping_list' },
        (payload) => {
          console.log('Shopping list change received:', payload);
          if (payload.eventType === 'INSERT') {
            setShoppingLists((prev) => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setShoppingLists((prev) =>
              prev.map((item) =>
                item.id === payload.old.id ? payload.new : item
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setShoppingLists((prev) =>
              prev.filter((item) => item.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(shoppersChannel);
      supabase.removeChannel(shoppingListChannel);
    };
  }, []);

  return (
    <div className={`container mx-auto px-4 py-12 transition-all duration-700 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2 gradient-text">Store Dashboard</h1>
          <p className="text-muted-foreground">Manage your inventory and view store performance</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm p-1 rounded-full border border-border animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <button 
            className={`p-2 rounded-full transition-all ${activeTab === 'overview' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
            onClick={() => setActiveTab('overview')}
          >
            <Grid2X2 size={18} />
          </button>
          <button 
            className={`p-2 rounded-full transition-all ${activeTab === 'analytics' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
            onClick={() => setActiveTab('analytics')}
          >
            <Activity size={18} />
          </button>
          <button 
            className={`p-2 rounded-full transition-all ${activeTab === 'inventory' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
            onClick={() => setActiveTab('inventory')}
          >
            <Package2 size={18} />
          </button>
          <button 
            className={`p-2 rounded-full transition-all ${activeTab === 'users' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} />
          </button>
        </div>
      </div>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <div className="hidden">
          <TabsList className="grid grid-cols-4 w-[600px]">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Grid2X2 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Package2 className="h-4 w-4" />
              <span>Inventory</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Users</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="overview" className="animate-fade-in">
          <div className="dashboard-card hover-lift glass-effect border-gradient">
            <DashboardStats />
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="animate-fade-in">
          <div className="dashboard-card hover-lift glass-effect border-gradient">
            <h2 className="text-2xl font-bold mb-4">Advanced Analytics</h2>
            <DashboardStats />
          </div>
        </TabsContent>
        
        <TabsContent value="inventory" className="animate-fade-in">
          <div className="dashboard-card hover-lift glass-effect border-gradient">
            <InventoryTable initialProducts={products} />
          </div>
        </TabsContent>
        
        <TabsContent value="users" className="animate-fade-in">
          <div className="dashboard-card hover-lift glass-effect border-gradient">
            <UserManagement initialShoppers={shoppers} />
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="absolute top-1/4 right-10 w-20 h-20 border border-primary/20 rounded-full opacity-10 animate-rotate-slow hidden lg:block"></div>
      <div className="absolute bottom-20 left-10 w-32 h-32 border border-secondary/20 rounded-full opacity-5 animate-rotate-slow hidden lg:block" style={{ animationDirection: 'reverse' }}></div>
    </div>
  );
};

export default DashboardPage;
