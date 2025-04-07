
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import DashboardStats from "@/components/dashboard/DashboardStats";
import InventoryTable from "@/components/dashboard/InventoryTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout, Package2, BarChart3 } from "lucide-react";

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
    <div className={`container mx-auto px-4 py-12 transition-all duration-500 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
      <h1 className="text-3xl font-bold mb-2 gradient-text">Store Dashboard</h1>
      <p className="text-muted-foreground mb-8">Manage your inventory and view store performance</p>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <div className="bg-white rounded-xl p-2 inline-flex shadow-sm">
          <TabsList className="grid grid-cols-2 w-[400px]">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Package2 className="h-4 w-4" />
              <span>Inventory</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="overview" className="animate-fade-in">
          <div className="dashboard-card hover-lift">
            <DashboardStats />
          </div>
        </TabsContent>
        
        <TabsContent value="inventory" className="animate-fade-in">
          <div className="dashboard-card hover-lift">
            <InventoryTable />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardPage;
