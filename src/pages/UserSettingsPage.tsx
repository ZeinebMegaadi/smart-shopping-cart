
import { useState } from "react";
import DietaryPreferences from "@/components/shop/DietaryPreferences";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { User, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserSettingsPage = () => {
  const [activeTab, setActiveTab] = useState<string>("dietary");
  const { toast } = useToast();
  const navigate = useNavigate();
  
  return (
    <div className="container max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 gradient-text">User Settings</h1>
      
      <div className="bg-white rounded-xl shadow-sm p-6">
        <Tabs 
          defaultValue="dietary" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mb-6">
            <TabsTrigger value="dietary">
              <Settings className="mr-2 h-4 w-4" /> 
              Dietary Preferences
            </TabsTrigger>
            <TabsTrigger value="account">
              <User className="mr-2 h-4 w-4" />
              Account
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dietary" className="mt-0">
            <DietaryPreferences />
          </TabsContent>
          
          <TabsContent value="account" className="mt-0">
            <div className="text-center py-16">
              <h3 className="text-xl font-medium mb-2">Account Settings</h3>
              <p className="text-muted-foreground mb-4">
                Account settings are coming soon. This section will allow you to update your profile information.
              </p>
              <Button variant="outline" onClick={() => navigate("/")}>
                Return to Home
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserSettingsPage;
