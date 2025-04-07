
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import DashboardStats from "@/components/dashboard/DashboardStats";
import InventoryTable from "@/components/dashboard/InventoryTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Redirect if not logged in or not a store owner
  if (!currentUser) {
    return <Navigate to="/auth" />;
  }
  
  if (currentUser.role !== "owner") {
    return <Navigate to="/" />;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Store Dashboard</h1>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="animate-fade-in">
          <DashboardStats />
        </TabsContent>
        
        <TabsContent value="inventory" className="animate-fade-in">
          <InventoryTable />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardPage;
