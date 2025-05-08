
import { Product } from "./mockData";

// Ingredient substitution suggestions for dietary restrictions
export const INGREDIENT_SUBSTITUTIONS: Record<string, Record<string, string>> = {
  "vegetarian": {
    "Beef": "Plant-based beef alternative",
    "Chicken": "Tofu or tempeh",
    "Bacon": "Plant-based bacon or smoked coconut chips",
    "Fish": "Jackfruit or heart of palm"
  },
  "vegan": {
    "Milk": "Almond milk or soy milk",
    "Eggs": "Flax egg (1 tbsp ground flaxseed + 3 tbsp water)",
    "Cheese": "Nutritional yeast or plant-based cheese",
    "Butter": "Plant-based butter or coconut oil",
    "Honey": "Maple syrup or agave nectar"
  },
  "gluten-free": {
    "Flour": "Gluten-free flour blend",
    "Pasta": "Rice pasta or chickpea pasta",
    "Bread": "Gluten-free bread",
    "Soy Sauce": "Tamari or coconut aminos"
  },
  "dairy-free": {
    "Milk": "Almond milk or oat milk",
    "Butter": "Coconut oil or plant-based butter",
    "Cream": "Coconut cream",
    "Cheese": "Dairy-free cheese alternative"
  },
  "nut-free": {
    "Almond milk": "Oat milk or rice milk",
    "Peanut butter": "Sunflower seed butter",
    "Cashews": "Sunflower seeds or pumpkin seeds"
  },
  "egg-free": {
    "Eggs (binding)": "Applesauce or mashed banana",
    "Eggs (leavening)": "Baking soda + vinegar",
    "Egg wash": "Aquafaba (chickpea liquid)"
  }
};

export interface RecipeIngredient {
  name: string;
  quantity: string;
  productId: string;
  dietaryFlags?: string[]; // e.g. ["contains-dairy", "contains-gluten"]
}

export interface Recipe {
  id: number;
  name: string;
  image: string;
  category: string;
  difficulty: string;
  time: string;
  dietaryTags: string[]; // e.g. ["vegetarian", "gluten-free"]
  description: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
}

const recipeData: Recipe[] = [
  {
    id: 1,
    name: "Pasta Carbonara",
    category: "Italian",
    difficulty: "Medium",
    time: "30 min",
    dietaryTags: [],
    description: "A classic Italian pasta dish with eggs, cheese, and bacon",
    ingredients: [
      { name: "Pasta", quantity: "200g", productId: "3", dietaryFlags: ["contains-gluten"] },
      { name: "Eggs", quantity: "2", productId: "10", dietaryFlags: ["contains-egg"] },
      { name: "Parmesan Cheese", quantity: "50g", productId: "2", dietaryFlags: ["contains-dairy"] },
      { name: "Bacon", quantity: "100g", productId: "12", dietaryFlags: ["contains-meat"] }
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
    dietaryTags: ["vegetarian", "vegan", "dairy-free"],
    description: "A quick and healthy vegetable stir-fry with a savory sauce",
    ingredients: [
      { name: "Mixed Vegetables", quantity: "300g", productId: "9" },
      { name: "Soy Sauce", quantity: "2 tbsp", productId: "5", dietaryFlags: ["contains-gluten"] },
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
    dietaryTags: ["vegetarian"],
    description: "A moist and delicious banana bread that's perfect for breakfast or snack time",
    ingredients: [
      { name: "Bananas", quantity: "3 ripe", productId: "1" },
      { name: "Flour", quantity: "250g", productId: "5", dietaryFlags: ["contains-gluten"] },
      { name: "Sugar", quantity: "100g", productId: "5" },
      { name: "Eggs", quantity: "2", productId: "10", dietaryFlags: ["contains-egg"] },
      { name: "Butter", quantity: "100g", productId: "10", dietaryFlags: ["contains-dairy"] }
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
    dietaryTags: ["vegetarian", "gluten-free"],
    description: "A refreshing salad with tomatoes, cucumber, olives, and feta cheese",
    ingredients: [
      { name: "Tomatoes", quantity: "2", productId: "9" },
      { name: "Cucumber", quantity: "1", productId: "9" },
      { name: "Red Onion", quantity: "1/2", productId: "9" },
      { name: "Feta Cheese", quantity: "100g", productId: "2", dietaryFlags: ["contains-dairy"] },
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
    dietaryTags: ["vegetarian"],
    description: "Classic homemade chocolate chip cookies that are soft and chewy",
    ingredients: [
      { name: "Flour", quantity: "280g", productId: "5", dietaryFlags: ["contains-gluten"] },
      { name: "Butter", quantity: "170g", productId: "10", dietaryFlags: ["contains-dairy"] },
      { name: "Sugar", quantity: "150g", productId: "5" },
      { name: "Chocolate Chips", quantity: "200g", productId: "11", dietaryFlags: ["may-contain-dairy"] },
      { name: "Eggs", quantity: "1", productId: "10", dietaryFlags: ["contains-egg"] },
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
  },
  {
    id: 6,
    name: "Vegan Buddha Bowl",
    category: "Vegan",
    difficulty: "Easy",
    time: "25 min",
    dietaryTags: ["vegetarian", "vegan", "dairy-free", "gluten-free", "egg-free"],
    description: "A nutritious bowl packed with colorful vegetables and plant-based protein",
    ingredients: [
      { name: "Quinoa", quantity: "100g", productId: "5" },
      { name: "Chickpeas", quantity: "1 can", productId: "5" },
      { name: "Sweet Potato", quantity: "1 medium", productId: "9" },
      { name: "Kale", quantity: "2 cups", productId: "9" },
      { name: "Avocado", quantity: "1", productId: "9" },
      { name: "Tahini", quantity: "2 tbsp", productId: "5" }
    ],
    instructions: [
      "Cook quinoa according to package instructions.",
      "Roast chickpeas and sweet potato cubes with spices at 200°C for 20 minutes.",
      "Massage kale with olive oil and lemon juice.",
      "Arrange all ingredients in a bowl.",
      "Slice avocado and place on top.",
      "Drizzle with tahini sauce and serve."
    ],
    image: "/placeholder.svg"
  },
  {
    id: 7,
    name: "Gluten-Free Pancakes",
    category: "Breakfast",
    difficulty: "Easy",
    time: "20 min",
    dietaryTags: ["vegetarian", "gluten-free"],
    description: "Fluffy and delicious pancakes made with gluten-free flour",
    ingredients: [
      { name: "Gluten-Free Flour", quantity: "200g", productId: "5" },
      { name: "Eggs", quantity: "2", productId: "10", dietaryFlags: ["contains-egg"] },
      { name: "Milk", quantity: "240ml", productId: "3", dietaryFlags: ["contains-dairy"] },
      { name: "Baking Powder", quantity: "1 tbsp", productId: "5" },
      { name: "Sugar", quantity: "2 tbsp", productId: "5" },
      { name: "Vanilla Extract", quantity: "1 tsp", productId: "5" }
    ],
    instructions: [
      "Mix dry ingredients in a bowl.",
      "In another bowl, whisk together eggs, milk, and vanilla.",
      "Combine wet and dry ingredients until smooth.",
      "Heat a non-stick pan over medium heat.",
      "Pour batter onto the pan to form pancakes.",
      "Cook until bubbles form, then flip and cook the other side.",
      "Serve with maple syrup or fresh fruit."
    ],
    image: "/placeholder.svg"
  },
  {
    id: 8,
    name: "Caprese Salad",
    category: "Italian",
    difficulty: "Easy",
    time: "10 min",
    dietaryTags: ["vegetarian", "gluten-free"],
    description: "A simple Italian salad with fresh tomatoes, mozzarella, and basil",
    ingredients: [
      { name: "Tomatoes", quantity: "2 large", productId: "9" },
      { name: "Fresh Mozzarella", quantity: "200g", productId: "2", dietaryFlags: ["contains-dairy"] },
      { name: "Fresh Basil", quantity: "handful", productId: "9" },
      { name: "Olive Oil", quantity: "2 tbsp", productId: "5" },
      { name: "Balsamic Vinegar", quantity: "1 tbsp", productId: "5" }
    ],
    instructions: [
      "Slice tomatoes and mozzarella.",
      "Arrange alternating slices of tomato and mozzarella on a plate.",
      "Tuck basil leaves between the slices.",
      "Drizzle with olive oil and balsamic vinegar.",
      "Season with salt and pepper to taste.",
      "Serve immediately."
    ],
    image: "/placeholder.svg"
  },
  {
    id: 9,
    name: "Beef Stir-Fry",
    category: "Asian",
    difficulty: "Medium",
    time: "25 min",
    dietaryTags: ["dairy-free", "egg-free"],
    description: "A savory stir-fry with tender beef strips and crisp vegetables",
    ingredients: [
      { name: "Beef Strips", quantity: "300g", productId: "15", dietaryFlags: ["contains-meat"] },
      { name: "Bell Peppers", quantity: "2", productId: "9" },
      { name: "Broccoli", quantity: "1 head", productId: "9" },
      { name: "Soy Sauce", quantity: "3 tbsp", productId: "5", dietaryFlags: ["contains-gluten"] },
      { name: "Ginger", quantity: "1 tbsp, grated", productId: "9" },
      { name: "Rice", quantity: "200g", productId: "5" }
    ],
    instructions: [
      "Slice beef into thin strips and marinate in soy sauce.",
      "Chop vegetables into bite-sized pieces.",
      "Heat oil in a wok over high heat.",
      "Stir-fry beef until browned, then remove from pan.",
      "Stir-fry vegetables and ginger until tender-crisp.",
      "Return beef to the pan and add sauce.",
      "Toss until everything is coated and heated through.",
      "Serve hot over cooked rice."
    ],
    image: "/placeholder.svg"
  },
  {
    id: 10,
    name: "Mango Smoothie Bowl",
    category: "Breakfast",
    difficulty: "Easy",
    time: "10 min",
    dietaryTags: ["vegetarian", "gluten-free"],
    description: "A refreshing and nutritious smoothie bowl topped with fresh fruits and granola",
    ingredients: [
      { name: "Frozen Mango", quantity: "200g", productId: "9" },
      { name: "Banana", quantity: "1", productId: "1" },
      { name: "Greek Yogurt", quantity: "200g", productId: "2", dietaryFlags: ["contains-dairy"] },
      { name: "Honey", quantity: "1 tbsp", productId: "5" },
      { name: "Granola", quantity: "3 tbsp", productId: "14", dietaryFlags: ["may-contain-gluten", "may-contain-nuts"] },
      { name: "Fresh Berries", quantity: "handful", productId: "9" }
    ],
    instructions: [
      "Blend frozen mango, banana, yogurt, and honey until smooth.",
      "Pour into a bowl.",
      "Top with granola and fresh berries.",
      "Add optional toppings like coconut flakes or chia seeds.",
      "Serve immediately."
    ],
    image: "/placeholder.svg"
  },
  {
    id: 11,
    name: "Chicken Tikka Masala",
    category: "Indian",
    difficulty: "Medium",
    time: "45 min",
    dietaryTags: ["gluten-free"],
    description: "A flavorful Indian curry with tender chicken in a creamy tomato sauce",
    ingredients: [
      { name: "Chicken Breast", quantity: "500g", productId: "15", dietaryFlags: ["contains-meat"] },
      { name: "Yogurt", quantity: "200g", productId: "2", dietaryFlags: ["contains-dairy"] },
      { name: "Tomato Sauce", quantity: "300g", productId: "5" },
      { name: "Heavy Cream", quantity: "100ml", productId: "3", dietaryFlags: ["contains-dairy"] },
      { name: "Spices (Garam Masala)", quantity: "2 tbsp", productId: "5" },
      { name: "Rice", quantity: "200g", productId: "5" }
    ],
    instructions: [
      "Cut chicken into cubes and marinate in yogurt and spices.",
      "Grill or bake chicken until cooked through.",
      "In a pan, heat oil and add tomato sauce and spices.",
      "Add grilled chicken and simmer for 10 minutes.",
      "Stir in cream and simmer for another 5 minutes.",
      "Serve hot with rice or naan bread."
    ],
    image: "/placeholder.svg"
  },
  {
    id: 12,
    name: "Avocado Toast",
    category: "Breakfast",
    difficulty: "Easy",
    time: "10 min",
    dietaryTags: ["vegetarian", "vegan", "dairy-free"],
    description: "A simple and nutritious breakfast with creamy avocado on toasted bread",
    ingredients: [
      { name: "Bread", quantity: "2 slices", productId: "4", dietaryFlags: ["contains-gluten"] },
      { name: "Avocado", quantity: "1", productId: "9" },
      { name: "Lemon Juice", quantity: "1 tsp", productId: "9" },
      { name: "Cherry Tomatoes", quantity: "5", productId: "9" },
      { name: "Salt & Pepper", quantity: "to taste", productId: "7" }
    ],
    instructions: [
      "Toast the bread slices.",
      "Mash the avocado with lemon juice, salt, and pepper.",
      "Spread the avocado mixture on the toast.",
      "Top with halved cherry tomatoes and any additional toppings.",
      "Season with more salt and pepper if desired.",
      "Serve immediately."
    ],
    image: "/placeholder.svg"
  },
  {
    id: 13,
    name: "Lentil Soup",
    category: "Soup",
    difficulty: "Medium",
    time: "40 min",
    dietaryTags: ["vegetarian", "vegan", "dairy-free", "gluten-free", "egg-free"],
    description: "A hearty and nutritious soup packed with lentils and vegetables",
    ingredients: [
      { name: "Red Lentils", quantity: "200g", productId: "5" },
      { name: "Carrots", quantity: "2", productId: "9" },
      { name: "Celery", quantity: "2 stalks", productId: "9" },
      { name: "Onion", quantity: "1", productId: "9" },
      { name: "Vegetable Broth", quantity: "1L", productId: "5" },
      { name: "Cumin", quantity: "1 tsp", productId: "5" }
    ],
    instructions: [
      "Chop all vegetables.",
      "In a large pot, sauté onion, carrots, and celery.",
      "Add lentils and spices, stir to combine.",
      "Pour in vegetable broth and bring to a boil.",
      "Reduce heat and simmer for 30 minutes.",
      "Blend partially for a creamier texture if desired.",
      "Season with salt and pepper to taste."
    ],
    image: "/placeholder.svg"
  },
  {
    id: 14,
    name: "Berry Smoothie",
    category: "Beverage",
    difficulty: "Easy",
    time: "5 min",
    dietaryTags: ["vegetarian", "gluten-free"],
    description: "A refreshing and nutritious smoothie packed with berries and yogurt",
    ingredients: [
      { name: "Mixed Berries", quantity: "150g", productId: "9" },
      { name: "Banana", quantity: "1", productId: "1" },
      { name: "Greek Yogurt", quantity: "100g", productId: "2", dietaryFlags: ["contains-dairy"] },
      { name: "Honey", quantity: "1 tbsp", productId: "5" },
      { name: "Almond Milk", quantity: "200ml", productId: "3", dietaryFlags: ["contains-nuts"] }
    ],
    instructions: [
      "Place all ingredients in a blender.",
      "Blend until smooth.",
      "Add more liquid if needed to reach desired consistency.",
      "Pour into glasses and serve immediately."
    ],
    image: "/placeholder.svg"
  },
  {
    id: 15,
    name: "Veggie Burger",
    category: "Vegetarian",
    difficulty: "Medium",
    time: "35 min",
    dietaryTags: ["vegetarian", "vegan", "dairy-free", "egg-free"],
    description: "A delicious plant-based burger with a hearty patty and fresh toppings",
    ingredients: [
      { name: "Black Beans", quantity: "1 can", productId: "5" },
      { name: "Quinoa", quantity: "100g cooked", productId: "5" },
      { name: "Onion", quantity: "1 small", productId: "9" },
      { name: "Breadcrumbs", quantity: "1/2 cup", productId: "4", dietaryFlags: ["contains-gluten"] },
      { name: "Burger Buns", quantity: "4", productId: "4", dietaryFlags: ["contains-gluten"] },
      { name: "Lettuce", quantity: "4 leaves", productId: "9" },
      { name: "Tomato", quantity: "1", productId: "9" }
    ],
    instructions: [
      "Mash black beans in a bowl.",
      "Add cooked quinoa, finely chopped onion, and breadcrumbs.",
      "Mix in spices and form into patties.",
      "Chill patties for 30 minutes.",
      "Cook patties in a pan with oil until browned on both sides.",
      "Toast burger buns if desired.",
      "Assemble burgers with lettuce, tomato, and your favorite condiments."
    ],
    image: "/placeholder.svg"
  },
  {
    id: 16,
    name: "Chicken Noodle Soup",
    category: "Soup",
    difficulty: "Medium",
    time: "50 min",
    dietaryTags: ["dairy-free"],
    description: "A comforting classic soup with tender chicken, vegetables, and noodles",
    ingredients: [
      { name: "Chicken Breast", quantity: "300g", productId: "15", dietaryFlags: ["contains-meat"] },
      { name: "Egg Noodles", quantity: "150g", productId: "3", dietaryFlags: ["contains-gluten", "contains-egg"] },
      { name: "Carrots", quantity: "2", productId: "9" },
      { name: "Celery", quantity: "2 stalks", productId: "9" },
      { name: "Onion", quantity: "1", productId: "9" },
      { name: "Chicken Broth", quantity: "1.5L", productId: "5" }
    ],
    instructions: [
      "In a large pot, cook chicken in broth until done, then remove and shred.",
      "Sauté chopped onions, carrots, and celery in the pot.",
      "Return chicken to pot and add more broth.",
      "Bring to a boil, then add noodles.",
      "Cook until noodles are tender.",
      "Season with salt, pepper, and herbs to taste.",
      "Serve hot."
    ],
    image: "/placeholder.svg"
  },
  {
    id: 17,
    name: "Spicy Tofu Stir-Fry",
    category: "Asian",
    difficulty: "Medium",
    time: "25 min",
    dietaryTags: ["vegetarian", "vegan", "dairy-free", "egg-free"],
    description: "A flavorful stir-fry with crispy tofu and vegetables in a spicy sauce",
    ingredients: [
      { name: "Firm Tofu", quantity: "400g", productId: "2" },
      { name: "Bell Peppers", quantity: "2", productId: "9" },
      { name: "Snow Peas", quantity: "100g", productId: "9" },
      { name: "Soy Sauce", quantity: "3 tbsp", productId: "5", dietaryFlags: ["contains-gluten"] },
      { name: "Sriracha", quantity: "1 tbsp", productId: "5" },
      { name: "Ginger", quantity: "1 tbsp, grated", productId: "9" },
      { name: "Rice", quantity: "200g", productId: "5" }
    ],
    instructions: [
      "Press tofu to remove excess water, then cut into cubes.",
      "Heat oil in a pan and fry tofu until golden and crispy.",
      "Remove tofu and set aside.",
      "In the same pan, stir-fry vegetables and ginger.",
      "Mix soy sauce and sriracha for the sauce.",
      "Add tofu back to the pan and pour in the sauce.",
      "Toss everything together until well coated.",
      "Serve hot over cooked rice."
    ],
    image: "/placeholder.svg"
  },
  {
    id: 18,
    name: "Nut-Free Granola",
    category: "Breakfast",
    difficulty: "Easy",
    time: "35 min",
    dietaryTags: ["vegetarian", "dairy-free", "nut-free"],
    description: "A crunchy homemade granola without nuts, perfect for those with allergies",
    ingredients: [
      { name: "Rolled Oats", quantity: "300g", productId: "14", dietaryFlags: ["contains-gluten"] },
      { name: "Sunflower Seeds", quantity: "50g", productId: "5" },
      { name: "Pumpkin Seeds", quantity: "50g", productId: "5" },
      { name: "Dried Cranberries", quantity: "100g", productId: "5" },
      { name: "Honey", quantity: "80ml", productId: "5" },
      { name: "Coconut Oil", quantity: "60ml", productId: "5" },
      { name: "Cinnamon", quantity: "1 tsp", productId: "5" }
    ],
    instructions: [
      "Preheat oven to 150°C and line a baking tray.",
      "Mix oats, seeds, and cinnamon in a large bowl.",
      "Heat honey and coconut oil until melted, then pour over dry ingredients.",
      "Stir until everything is well coated.",
      "Spread mixture evenly on the baking tray.",
      "Bake for 25-30 minutes, stirring halfway through.",
      "Allow to cool completely, then mix in dried cranberries.",
      "Store in an airtight container."
    ],
    image: "/placeholder.svg"
  },
  {
    id: 19,
    name: "Ratatouille",
    category: "French",
    difficulty: "Medium",
    time: "60 min",
    dietaryTags: ["vegetarian", "vegan", "gluten-free", "dairy-free", "egg-free", "nut-free"],
    description: "A classic French vegetable stew with eggplant, zucchini, and tomatoes",
    ingredients: [
      { name: "Eggplant", quantity: "1", productId: "9" },
      { name: "Zucchini", quantity: "2", productId: "9" },
      { name: "Bell Pepper", quantity: "1", productId: "9" },
      { name: "Tomatoes", quantity: "4", productId: "9" },
      { name: "Onion", quantity: "1", productId: "9" },
      { name: "Garlic", quantity: "3 cloves", productId: "9" },
      { name: "Olive Oil", quantity: "3 tbsp", productId: "5" },
      { name: "Herbs de Provence", quantity: "2 tsp", productId: "5" }
    ],
    instructions: [
      "Chop all vegetables into similar-sized chunks.",
      "In a large pot, sauté onion and garlic until fragrant.",
      "Add bell pepper and cook for 5 minutes.",
      "Add eggplant and zucchini, cook until starting to soften.",
      "Add tomatoes, herbs, salt, and pepper.",
      "Cover and simmer for 30-40 minutes, stirring occasionally.",
      "Serve hot or at room temperature."
    ],
    image: "/placeholder.svg"
  },
  {
    id: 20,
    name: "Cauliflower Pizza Crust",
    category: "Italian",
    difficulty: "Medium",
    time: "45 min",
    dietaryTags: ["vegetarian", "gluten-free"],
    description: "A low-carb alternative to traditional pizza crust made with cauliflower",
    ingredients: [
      { name: "Cauliflower", quantity: "1 medium head", productId: "9" },
      { name: "Eggs", quantity: "2", productId: "10", dietaryFlags: ["contains-egg"] },
      { name: "Mozzarella Cheese", quantity: "100g", productId: "2", dietaryFlags: ["contains-dairy"] },
      { name: "Parmesan Cheese", quantity: "30g", productId: "2", dietaryFlags: ["contains-dairy"] },
      { name: "Italian Seasoning", quantity: "1 tsp", productId: "5" },
      { name: "Tomato Sauce", quantity: "for topping", productId: "5" },
      { name: "Toppings of Choice", quantity: "as desired", productId: "9" }
    ],
    instructions: [
      "Preheat oven to 200°C and line a baking sheet with parchment paper.",
      "Pulse cauliflower in a food processor until rice-like consistency.",
      "Microwave cauliflower for 5 minutes, then let cool.",
      "Squeeze out excess moisture using a clean kitchen towel.",
      "Mix cauliflower with eggs, cheese, and seasonings.",
      "Form into a pizza crust shape on the baking sheet.",
      "Bake for 15-20 minutes until golden.",
      "Add sauce and toppings, then bake for another 10 minutes.",
      "Let cool slightly before slicing."
    ],
    image: "/placeholder.svg"
  }
];

export default recipeData;
