
import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChefHat, Search, ShoppingCart, Filter, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import recipeData, { INGREDIENT_SUBSTITUTIONS, Recipe, RecipeIngredient } from "@/services/recipeData";
import { DIETARY_RESTRICTIONS } from "@/components/shop/DietaryPreferences";

const RecipesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<number | null>(null);
  const [selectedDietaryFilters, setSelectedDietaryFilters] = useState<string[]>([]);
  const [userDietaryPreferences, setUserDietaryPreferences] = useState<string[]>([]);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);
  const { toast } = useToast();
  const { addToCart } = useCart();

  // Load user's dietary preferences when component mounts
  useEffect(() => {
    const loadUserPreferences = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user?.id) {
          const { data, error } = await supabase
            .from('shoppers')
            .select('dietary_preferences')
            .eq('id', session.user.id)
            .single();
            
          if (error) {
            console.error('Error fetching dietary preferences:', error);
          } else if (data?.dietary_preferences) {
            setUserDietaryPreferences(data.dietary_preferences);
            // Auto-apply user's dietary filters
            setSelectedDietaryFilters(data.dietary_preferences);
          }
        }
      } catch (error) {
        console.error('Error loading user preferences:', error);
      } finally {
        setIsLoadingPreferences(false);
      }
    };
    
    loadUserPreferences();
  }, []);

  // Filter recipes based on search term and dietary restrictions
  const filteredRecipes = recipeData.filter(recipe => {
    // Text search filter
    const matchesSearch = 
      recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Dietary filter
    const matchesDietary = selectedDietaryFilters.length === 0 || 
      selectedDietaryFilters.every(filter => recipe.dietaryTags.includes(filter));
    
    return matchesSearch && matchesDietary;
  });

  const selectedRecipeData = selectedRecipe !== null 
    ? recipeData.find(r => r.id === selectedRecipe) 
    : null;

  // Check if an ingredient conflicts with dietary preferences
  const checkIngredientConflict = (ingredient: RecipeIngredient) => {
    if (!ingredient.dietaryFlags || userDietaryPreferences.length === 0) return false;
    
    const conflicts = {
      "vegetarian": ["contains-meat", "contains-fish"],
      "vegan": ["contains-meat", "contains-fish", "contains-dairy", "contains-egg", "contains-honey"],
      "gluten-free": ["contains-gluten"],
      "dairy-free": ["contains-dairy"],
      "nut-free": ["contains-nuts"],
      "egg-free": ["contains-egg"]
    };
    
    return userDietaryPreferences.some(pref => {
      if (conflicts[pref as keyof typeof conflicts]) {
        return ingredient.dietaryFlags?.some(flag => 
          conflicts[pref as keyof typeof conflicts].includes(flag)
        );
      }
      return false;
    });
  };

  // Find substitution for an ingredient
  const findSubstitution = (ingredient: RecipeIngredient) => {
    for (const preference of userDietaryPreferences) {
      const substitutions = INGREDIENT_SUBSTITUTIONS[preference as keyof typeof INGREDIENT_SUBSTITUTIONS];
      if (substitutions && substitutions[ingredient.name]) {
        return substitutions[ingredient.name];
      }
    }
    return null;
  };

  const addIngredientsToCart = (recipeId: number) => {
    const recipe = recipeData.find(r => r.id === recipeId);
    
    if (!recipe) return;
    
    // Filter out ingredients that conflict with dietary preferences
    let skippedCount = 0;
    const skippedIngredients: string[] = [];
    
    recipe.ingredients.forEach(ingredient => {
      if (checkIngredientConflict(ingredient)) {
        skippedCount++;
        skippedIngredients.push(ingredient.name);
      } else {
        const product = {
          id: ingredient.productId,
          name: ingredient.name,
          description: `Ingredient for ${recipe.name}`,
          image: '/placeholder.svg',
          "image-url": null,
          barcodeId: ingredient.productId,
          category: "Recipe Ingredient",
          subcategory: recipe.category,
          aisle: "Various",
          price: 1.99, // Placeholder price
          quantityInStock: 10, // Placeholder stock
          popular: false
        };
        
        addToCart(product, 1);
      }
    });
    
    // Notification message
    if (skippedCount > 0) {
      toast({
        title: `Added ${recipe.ingredients.length - skippedCount} ingredients`,
        description: `${skippedCount} ingredients (${skippedIngredients.join(", ")}) were excluded due to your dietary preferences.`,
        variant: "default",
      });
    } else {
      toast({
        title: "Ingredients added",
        description: `All ingredients for ${recipe.name} have been added to your cart.`,
      });
    }
  };

  const toggleDietaryFilter = (filterId: string) => {
    setSelectedDietaryFilters(prev => {
      if (prev.includes(filterId)) {
        return prev.filter(id => id !== filterId);
      } else {
        return [...prev, filterId];
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold">Recipe Finder</h1>
        <div className="flex w-full max-w-lg gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search recipes..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                <span className="hidden md:inline">Filter</span>
                {selectedDietaryFilters.length > 0 && (
                  <Badge variant="secondary" className="ml-1">{selectedDietaryFilters.length}</Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Dietary Restrictions</h4>
                <div className="grid grid-cols-1 gap-3">
                  {DIETARY_RESTRICTIONS.map((restriction) => (
                    <div key={restriction.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`filter-${restriction.id}`}
                        checked={selectedDietaryFilters.includes(restriction.id)}
                        onCheckedChange={() => toggleDietaryFilter(restriction.id)}
                      />
                      <label
                        htmlFor={`filter-${restriction.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1"
                      >
                        {restriction.icon}
                        {restriction.label}
                      </label>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between pt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedDietaryFilters([])}
                  >
                    Clear Filters
                  </Button>
                  
                  <Button 
                    size="sm"
                    onClick={() => setSelectedDietaryFilters([...userDietaryPreferences])}
                    disabled={userDietaryPreferences.length === 0}
                  >
                    Use My Preferences
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      {selectedRecipe ? (
        <div>
          <Button 
            variant="outline" 
            className="mb-6"
            onClick={() => setSelectedRecipe(null)}
          >
            ← Back to recipes
          </Button>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="col-span-1 lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">{selectedRecipeData?.name}</CardTitle>
                      <CardDescription>
                        {selectedRecipeData?.category} • {selectedRecipeData?.difficulty} • {selectedRecipeData?.time}
                      </CardDescription>
                    </div>
                    {selectedRecipeData?.dietaryTags && selectedRecipeData.dietaryTags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {selectedRecipeData.dietaryTags.map(tag => (
                          <Badge key={tag} variant="outline" className="bg-primary/5">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="aspect-video overflow-hidden rounded-lg">
                    <img 
                      src={selectedRecipeData?.image} 
                      alt={selectedRecipeData?.name}
                      className="object-cover w-full h-full" 
                    />
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground">{selectedRecipeData?.description}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Instructions</h3>
                    <ol className="space-y-3 list-decimal ml-5">
                      {selectedRecipeData?.instructions.map((step, index) => (
                        <li key={index} className="text-muted-foreground">{step}</li>
                      ))}
                    </ol>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Ingredients
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {selectedRecipeData?.ingredients.map((ingredient, index) => {
                      const hasConflict = checkIngredientConflict(ingredient);
                      const substitution = hasConflict ? findSubstitution(ingredient) : null;
                      
                      return (
                        <li key={index} className={`flex justify-between items-center ${hasConflict ? 'text-amber-600' : ''}`}>
                          <div className="flex items-center">
                            <span>{ingredient.name}</span>
                            {hasConflict && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <AlertCircle className="h-4 w-4 ml-1 text-amber-500" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>This ingredient conflicts with your dietary preferences.</p>
                                    {substitution && <p>Suggested substitution: {substitution}</p>}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                          <span className="text-muted-foreground">{ingredient.quantity}</span>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => addIngredientsToCart(selectedRecipeData?.id!)}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add compatible ingredients to cart
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {isLoadingPreferences ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading recipes...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecipes.length > 0 ? (
                filteredRecipes.map((recipe) => (
                  <Card key={recipe.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-video overflow-hidden">
                      <img 
                        src={recipe.image} 
                        alt={recipe.name}
                        className="object-cover w-full h-full transition-all hover:scale-105" 
                      />
                    </div>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{recipe.name}</CardTitle>
                        <ChefHat className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <CardDescription>
                        {recipe.category} • {recipe.difficulty} • {recipe.time}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="line-clamp-2 text-muted-foreground">
                        {recipe.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {recipe.dietaryTags.map(tag => (
                          <Badge key={tag} variant="outline" className="bg-primary/5 text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button 
                        variant="outline"
                        onClick={() => setSelectedRecipe(recipe.id)}
                      >
                        View Recipe
                      </Button>
                      <Button 
                        variant="secondary"
                        onClick={() => addIngredientsToCart(recipe.id)}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add Ingredients
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">No recipes found matching your search or dietary filters.</p>
                  {selectedDietaryFilters.length > 0 && (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setSelectedDietaryFilters([])}
                    >
                      Clear Dietary Filters
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecipesPage;
