
import { useState } from "react";
import { CartItem } from "@/contexts/CartContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChefHat, ShoppingCart } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useCart } from "@/contexts/CartContext";

interface RecipeRecommendationsProps {
  cartItems: CartItem[];
}

// Mock recipe data - in a real app, this would come from an API
const recipes = [
  {
    id: 1,
    name: "Pasta Carbonara",
    description: "A classic Italian pasta dish with eggs, cheese, and bacon",
    ingredients: ["pasta", "eggs", "cheese", "bacon"],
    image: "/placeholder.svg",
  },
  {
    id: 2,
    name: "Chicken Curry",
    description: "Spicy curry with tender chicken pieces",
    ingredients: ["chicken", "curry", "rice", "onions"],
    image: "/placeholder.svg",
  },
  {
    id: 3,
    name: "Vegetable Stir Fry",
    description: "Quick and healthy vegetable stir fry",
    ingredients: ["broccoli", "carrot", "pepper", "soy sauce"],
    image: "/placeholder.svg",
  },
  {
    id: 4,
    name: "Banana Bread",
    description: "Sweet and moist banana bread",
    ingredients: ["banana", "flour", "eggs", "sugar"],
    image: "/placeholder.svg",
  }
];

const RecipeRecommendations = ({ cartItems }: RecipeRecommendationsProps) => {
  const [selectedRecipe, setSelectedRecipe] = useState<number | null>(null);
  const { toast } = useToast();
  const { addToCart } = useCart();

  // Find recipes that match ingredients in the cart
  const getRecommendedRecipes = () => {
    const cartIngredients = cartItems.map(item => item.product.name.toLowerCase());
    
    return recipes.filter(recipe => {
      // Recipe is recommended if at least one ingredient is in the cart
      return recipe.ingredients.some(ingredient => 
        cartIngredients.some(cartItem => cartItem.includes(ingredient))
      );
    }).slice(0, 3); // Show maximum 3 recommendations
  };

  const handleSelectRecipe = (recipeId: number) => {
    setSelectedRecipe(recipeId);
  };

  const recommendedRecipes = getRecommendedRecipes();
  const selectedRecipeData = recipes.find(r => r.id === selectedRecipe);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ChefHat className="mr-2 h-5 w-5" />
          Recipe Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        {selectedRecipe ? (
          <div className="space-y-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedRecipe(null)}
            >
              ← Back to recommendations
            </Button>
            <div className="aspect-video overflow-hidden rounded-md mb-3">
              <img 
                src={selectedRecipeData?.image} 
                alt={selectedRecipeData?.name}
                className="object-cover w-full h-full" 
              />
            </div>
            <h3 className="text-lg font-semibold">{selectedRecipeData?.name}</h3>
            <p className="text-sm text-muted-foreground">{selectedRecipeData?.description}</p>
            
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Ingredients:</h4>
              <ul className="text-sm space-y-1">
                {selectedRecipeData?.ingredients.map((ingredient, i) => (
                  <li key={i} className="flex items-center">
                    {ingredient}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : recommendedRecipes.length > 0 ? (
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Based on items in your cart, you might like these recipes:
            </p>
            <div className="space-y-3">
              {recommendedRecipes.map(recipe => (
                <div 
                  key={recipe.id} 
                  className="flex items-center p-2 rounded-md hover:bg-muted cursor-pointer"
                  onClick={() => handleSelectRecipe(recipe.id)}
                >
                  <div className="h-12 w-12 overflow-hidden rounded-md mr-3">
                    <img 
                      src={recipe.image} 
                      alt={recipe.name}
                      className="object-cover w-full h-full" 
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">{recipe.name}</h4>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {recipe.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground text-sm">
              Add more items to your cart to get recipe recommendations.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecipeRecommendations;
