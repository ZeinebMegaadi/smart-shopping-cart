
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Carrot, Egg, Wheat, Milk, UtilsOff } from "lucide-react";

// Common dietary restrictions
export const DIETARY_RESTRICTIONS = [
  { id: "vegetarian", label: "Vegetarian", icon: <Carrot className="h-4 w-4" />, description: "No meat or fish" },
  { id: "vegan", label: "Vegan", icon: <Carrot className="h-4 w-4" />, description: "No animal products" },
  { id: "gluten-free", label: "Gluten-Free", icon: <Wheat className="h-4 w-4" />, description: "No gluten-containing grains" },
  { id: "dairy-free", label: "Dairy-Free", icon: <Milk className="h-4 w-4" />, description: "No milk products" },
  { id: "nut-free", label: "Nut-Free", icon: <UtilsOff className="h-4 w-4" />, description: "No tree nuts or peanuts" },
  { id: "egg-free", label: "Egg-Free", icon: <Egg className="h-4 w-4" />, description: "No eggs or egg products" },
  { id: "halal", label: "Halal", icon: <UtilsOff className="h-4 w-4" />, description: "Follows Halal dietary laws" },
  { id: "low-sugar", label: "Low Sugar", icon: <UtilsOff className="h-4 w-4" />, description: "Reduced sugar content" },
];

export const DietaryPreferences = () => {
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  // Load user's dietary preferences
  useEffect(() => {
    const loadUserPreferences = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user?.id) {
          setUserId(session.user.id);
          
          const { data, error } = await supabase
            .from('shoppers')
            .select('dietary_preferences')
            .eq('id', session.user.id)
            .single();
            
          if (error) {
            console.error('Error fetching dietary preferences:', error);
            return;
          }
          
          if (data && data.dietary_preferences) {
            setSelectedPreferences(data.dietary_preferences);
          }
        }
      } catch (error) {
        console.error('Error loading user preferences:', error);
      }
    };
    
    loadUserPreferences();
  }, []);

  const handlePreferenceToggle = (preferenceId: string) => {
    setSelectedPreferences(prev => {
      if (prev.includes(preferenceId)) {
        return prev.filter(id => id !== preferenceId);
      } else {
        return [...prev, preferenceId];
      }
    });
  };

  const savePreferences = async () => {
    if (!userId) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save your dietary preferences.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('shoppers')
        .update({ dietary_preferences: selectedPreferences })
        .eq('id', userId);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Preferences Updated",
        description: "Your dietary preferences have been saved.",
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Failed to Save Preferences",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dietary Preferences</CardTitle>
        <CardDescription>
          Select your dietary restrictions to receive personalized recipes and shopping recommendations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DIETARY_RESTRICTIONS.map((restriction) => (
            <div key={restriction.id} className="flex items-start space-x-3 p-3 rounded-md hover:bg-muted/40 transition-colors">
              <Checkbox 
                id={`restriction-${restriction.id}`}
                checked={selectedPreferences.includes(restriction.id)}
                onCheckedChange={() => handlePreferenceToggle(restriction.id)}
              />
              <div className="grid gap-1.5">
                <label
                  htmlFor={`restriction-${restriction.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1"
                >
                  {restriction.icon}
                  {restriction.label}
                </label>
                <p className="text-xs text-muted-foreground">
                  {restriction.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={savePreferences}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save Preferences"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DietaryPreferences;
