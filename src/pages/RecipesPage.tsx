
import { useState } from "react";
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
import { ChefHat, Search, ShoppingCart } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { products } from "@/services/mockData";

// Mock recipes data - in a real app, this would come from an API
const recipeData = [
  {
    id: 1,
    name: "Pasta Carbonara",
    category: "Italian",
    difficulty: "Medium",
    time: "30 min",
    description: "A classic Italian pasta dish with eggs, cheese, and bacon",
    ingredients: [
      { name: "Pasta", quantity: "200g", productId: "3" },
      { name: "Eggs", quantity: "2", productId: "10" },
      { name: "Parmesan Cheese", quantity: "50g", productId: "2" },
      { name: "Bacon", quantity: "100g", productId: "12" }
    ],
    instructions: [
      "Cook pasta according to package instructions.",
      "Fry bacon until crisp.",
      "Beat eggs and mix with grated cheese.",
      "Drain pasta and immediately add to eggs mixture, stirring quickly.",
      "Add bacon and serve immediately."
    ],
    image: "/placeholder.svg"
  },
  {
    id: 2,
    name: "Vegetable Stir-Fry",
    category: "Asian",
    difficulty: "Easy",
    time: "20 min",
    description: "A quick and healthy vegetable stir-fry with a savory sauce",
    ingredients: [
      { name: "Mixed Vegetables", quantity: "300g", productId: "9" },
      { name: "Soy Sauce", quantity: "2 tbsp", productId: "5" },
      { name: "Garlic", quantity: "2 cloves", productId: "9" },
      { name: "Rice", quantity: "150g", productId: "5" }
    ],
    instructions: [
      "Prepare all vegetables by washing and chopping them.",
      "Heat oil in a wok or large frying pan.",
      "Add garlic and stir-fry for 30 seconds.",
      "Add vegetables and stir-fry for 5 minutes.",
      "Add soy sauce and continue cooking for 2 minutes.",
      "Serve hot with rice."
    ],
    image: "/placeholder.svg"
  },
  {
    id: 3,
    name: "Banana Bread",
    category: "Baking",
    difficulty: "Easy",
    time: "60 min",
    description: "A moist and delicious banana bread that's perfect for breakfast or snack time",
    ingredients: [
      { name: "Bananas", quantity: "3 ripe", productId: "1" },
      { name: "Flour", quantity: "250g", productId: "5" },
      { name: "Sugar", quantity: "100g", productId: "5" },
      { name: "Eggs", quantity: "2", productId: "10" },
      { name: "Butter", quantity: "100g", productId: "10" }
    ],
    instructions: [
      "Preheat oven to 180°C and grease a loaf pan.",
      "Mash bananas in a mixing bowl.",
      "Add melted butter and sugar, mix well.",
      "Beat in eggs one at a time.",
      "Fold in flour and baking soda.",
      "Pour batter into the prepared pan and bake for 50 minutes.",
      "Let cool before slicing."
    ],
    image: "/placeholder.svg"
  },
  {
    id: 4,
    name: "Greek Salad",
    category: "Mediterranean",
    difficulty: "Easy",
    time: "15 min",
    description: "A refreshing salad with tomatoes, cucumber, olives, and feta cheese",
    ingredients: [
      { name: "Tomatoes", quantity: "2", productId: "9" },
      { name: "Cucumber", quantity: "1", productId: "9" },
      { name: "Red Onion", quantity: "1/2", productId: "9" },
      { name: "Feta Cheese", quantity: "100g", productId: "2" },
      { name: "Olives", quantity: "handful", productId: "5" },
      { name: "Olive Oil", quantity: "2 tbsp", productId: "5" }
    ],
    instructions: [
      "Chop tomatoes, cucumber, and red onion.",
      "Mix vegetables in a bowl.",
      "Add crumbled feta cheese and olives.",
      "Drizzle with olive oil and sprinkle with oregano.",
      "Toss gently and serve."
    ],
    image: "/placeholder.svg"
  },
  {
    id: 5,
    name: "Chocolate Chip Cookies",
    category: "Baking",
    difficulty: "Medium",
    time: "30 min",
    description: "Classic homemade chocolate chip cookies that are soft and chewy",
    ingredients: [
      { name: "Flour", quantity: "280g", productId: "5" },
      { name: "Butter", quantity: "170g", productId: "10" },
      { name: "Sugar", quantity: "150g", productId: "5" },
      { name: "Chocolate Chips", quantity: "200g", productId: "11" },
      { name: "Eggs", quantity: "1", productId: "10" },
      { name: "Vanilla Extract", quantity: "1 tsp", productId: "5" }
    ],
    instructions: [
      "Preheat oven to 190°C.",
      "Cream butter and sugars until smooth.",
      "Beat in eggs and vanilla.",
      "Add dry ingredients gradually.",
      "Stir in chocolate chips.",
      "Drop spoonfuls onto baking sheets and bake for 10 minutes.",
      "Cool on wire racks before serving."
    ],
    image: "/placeholder.svg"
  }
];

const RecipesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<number | null>(null);
  const { toast } = useToast();
  const { addToCart } = useCart();

  const filteredRecipes = recipeData.filter(recipe => 
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedRecipeData = recipeData.find(r => r.id === selectedRecipe);

  const addIngredientsToCart = (recipeId: number) => {
    const recipe = recipeData.find(r => r.id === recipeId);
    
    if (recipe) {
      recipe.ingredients.forEach(ingredient => {
        const product = products.find(p => p.id === ingredient.productId);
        if (product) {
          addToCart(product, 1);
        }
      });
      
      toast({
        title: "Ingredients added",
        description: `All ingredients for ${recipe.name} have been added to your cart.`,
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Recipe Finder</h1>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search recipes..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
                  <CardTitle className="text-2xl">{selectedRecipeData?.name}</CardTitle>
                  <CardDescription>
                    {selectedRecipeData?.category} • {selectedRecipeData?.difficulty} • {selectedRecipeData?.time}
                  </CardDescription>
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
                    {selectedRecipeData?.ingredients.map((ingredient, index) => (
                      <li key={index} className="flex justify-between">
                        <span>{ingredient.name}</span>
                        <span className="text-muted-foreground">{ingredient.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => addIngredientsToCart(selectedRecipeData?.id!)}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add all ingredients to cart
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <Card key={recipe.id} className="overflow-hidden">
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
          ))}
          
          {filteredRecipes.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No recipes found matching your search.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecipesPage;
