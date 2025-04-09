
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import DashboardStats from "@/components/dashboard/DashboardStats";
import InventoryTable from "@/components/dashboard/InventoryTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Package2, Activity, Grid2X2 } from "lucide-react";

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);
  
  // Redirect if not logged in or not a store owner
  if (!currentUser) {
    return <Navigate to="/auth" />;
  }
  
  if (currentUser.role !== "owner") {
    return <Navigate to="/" />;
  }
  
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
        </div>
      </div>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <div className="hidden">
          <TabsList className="grid grid-cols-3 w-[500px]">
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
          </TabsList>
        </div>
        
        <TabsContent value="overview" className="animate-fade-in">
          <div className="dashboard-card hover-lift glass-effect border-gradient">
            <DashboardStats />
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="animate-fade-in">
          <div className="dashboard-card hover-lift glass-effect border-gradient">
            <h2 className="text-2xl font-bold mb-4">Store Analytics</h2>
            <div className="h-[400px] flex items-center justify-center">
              <BarChart3 className="h-16 w-16 text-muted-foreground animate-float" />
              <p className="text-muted-foreground">Analytics dashboard coming soon.</p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="inventory" className="animate-fade-in">
          <div className="dashboard-card hover-lift glass-effect border-gradient">
            <InventoryTable />
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Decorative elements */}
      <div className="absolute top-1/4 right-10 w-20 h-20 border border-primary/20 rounded-full opacity-10 animate-rotate-slow hidden lg:block"></div>
      <div className="absolute bottom-20 left-10 w-32 h-32 border border-secondary/20 rounded-full opacity-5 animate-rotate-slow hidden lg:block" style={{ animationDirection: 'reverse' }}></div>
    </div>
  );
};

export default DashboardPage;
