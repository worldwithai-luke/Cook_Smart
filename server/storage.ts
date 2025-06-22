import { 
  recipes, 
  userIngredients, 
  favoriteRecipes, 
  shoppingListItems,
  type Recipe, 
  type InsertRecipe,
  type UserIngredient, 
  type InsertUserIngredient,
  type FavoriteRecipe, 
  type InsertFavoriteRecipe,
  type ShoppingListItem, 
  type InsertShoppingListItem
} from "@shared/schema";

export interface IStorage {
  // Recipes
  getRecipes(): Promise<Recipe[]>;
  getRecipe(id: number): Promise<Recipe | undefined>;
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;
  searchRecipesByIngredients(ingredients: string[]): Promise<Recipe[]>;
  
  // User Ingredients
  getUserIngredients(): Promise<UserIngredient[]>;
  addUserIngredient(ingredient: InsertUserIngredient): Promise<UserIngredient>;
  removeUserIngredient(id: number): Promise<void>;
  
  // Favorites
  getFavoriteRecipes(): Promise<(FavoriteRecipe & { recipe: Recipe })[]>;
  addFavoriteRecipe(favorite: InsertFavoriteRecipe): Promise<FavoriteRecipe>;
  removeFavoriteRecipe(recipeId: number): Promise<void>;
  
  // Shopping List
  getShoppingListItems(): Promise<ShoppingListItem[]>;
  addShoppingListItem(item: InsertShoppingListItem): Promise<ShoppingListItem>;
  removeShoppingListItem(id: number): Promise<void>;
  updateShoppingListItem(id: number, purchased: boolean): Promise<void>;
}

export class MemStorage implements IStorage {
  private recipes: Map<number, Recipe>;
  private userIngredients: Map<number, UserIngredient>;
  private favoriteRecipes: Map<number, FavoriteRecipe>;
  private shoppingListItems: Map<number, ShoppingListItem>;
  private currentRecipeId: number;
  private currentIngredientId: number;
  private currentFavoriteId: number;
  private currentShoppingId: number;

  constructor() {
    this.recipes = new Map();
    this.userIngredients = new Map();
    this.favoriteRecipes = new Map();
    this.shoppingListItems = new Map();
    this.currentRecipeId = 1;
    this.currentIngredientId = 1;
    this.currentFavoriteId = 1;
    this.currentShoppingId = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample recipes
    const sampleRecipes: InsertRecipe[] = [
      {
        name: "Chicken Tikka Masala",
        description: "A rich and creamy Indian curry featuring tender chunks of chicken in a spiced tomato-based sauce.",
        cookingTime: 35,
        servings: 4,
        difficulty: "Medium",
        cuisine: "Indian",
        rating: 47,
        ingredients: ["chicken breast", "tomatoes", "garlic", "coconut milk", "garam masala", "ground cumin", "onions", "ginger"],
        instructions: [
          "Season chicken with salt, pepper, and half the garam masala. Heat oil in a large pan over medium-high heat.",
          "Cook chicken pieces until golden brown on all sides, about 6-8 minutes. Remove and set aside.",
          "In the same pan, sauté garlic until fragrant. Add remaining spices and cook for 30 seconds.",
          "Add diced tomatoes and coconut milk. Simmer for 10 minutes until sauce thickens.",
          "Return chicken to pan and simmer for 5 more minutes. Serve hot with rice and garnish with cilantro."
        ],
        imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
      },
      {
        name: "Pasta Primavera",
        description: "Fresh colorful vegetable pasta with herbs and parmesan cheese.",
        cookingTime: 20,
        servings: 3,
        difficulty: "Easy",
        cuisine: "Italian",
        rating: 45,
        ingredients: ["pasta", "bell peppers", "tomatoes", "garlic", "parmesan cheese", "olive oil", "basil", "zucchini"],
        instructions: [
          "Cook pasta according to package directions until al dente.",
          "Heat olive oil in a large skillet and sauté garlic until fragrant.",
          "Add bell peppers and zucchini, cook for 5 minutes until tender-crisp.",
          "Add tomatoes and cook for 2-3 minutes until heated through.",
          "Toss with cooked pasta, fresh basil, and parmesan cheese. Serve immediately."
        ],
        imageUrl: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
      },
      {
        name: "Garlic Herb Chicken",
        description: "Perfectly seasoned roasted chicken with fresh herbs and garlic.",
        cookingTime: 25,
        servings: 4,
        difficulty: "Easy",
        cuisine: "American",
        rating: 49,
        ingredients: ["chicken breast", "garlic", "fresh herbs", "olive oil", "lemon", "salt", "pepper"],
        instructions: [
          "Preheat oven to 425°F (220°C).",
          "Mix minced garlic, chopped herbs, olive oil, salt, and pepper in a bowl.",
          "Rub the herb mixture all over the chicken breasts.",
          "Place in a baking dish and roast for 20-25 minutes until cooked through.",
          "Let rest for 5 minutes, then slice and serve with lemon wedges."
        ],
        imageUrl: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
      }
    ];

    sampleRecipes.forEach(recipe => {
      const id = this.currentRecipeId++;
      this.recipes.set(id, { ...recipe, id });
    });
  }

  async getRecipes(): Promise<Recipe[]> {
    return Array.from(this.recipes.values());
  }

  async getRecipe(id: number): Promise<Recipe | undefined> {
    return this.recipes.get(id);
  }

  async createRecipe(recipe: InsertRecipe): Promise<Recipe> {
    const id = this.currentRecipeId++;
    const newRecipe: Recipe = { ...recipe, id };
    this.recipes.set(id, newRecipe);
    return newRecipe;
  }

  async searchRecipesByIngredients(ingredients: string[]): Promise<Recipe[]> {
    if (ingredients.length === 0) {
      return Array.from(this.recipes.values());
    }

    const allRecipes = Array.from(this.recipes.values());
    const lowerIngredients = ingredients.map(ing => ing.toLowerCase());
    
    return allRecipes.filter(recipe => {
      return recipe.ingredients.some(ingredient => 
        lowerIngredients.some(userIng => 
          ingredient.toLowerCase().includes(userIng) || userIng.includes(ingredient.toLowerCase())
        )
      );
    });
  }

  async getUserIngredients(): Promise<UserIngredient[]> {
    return Array.from(this.userIngredients.values());
  }

  async addUserIngredient(ingredient: InsertUserIngredient): Promise<UserIngredient> {
    // Check if ingredient already exists
    const existing = Array.from(this.userIngredients.values()).find(
      ing => ing.name.toLowerCase() === ingredient.name.toLowerCase()
    );
    
    if (existing) {
      return existing;
    }

    const id = this.currentIngredientId++;
    const newIngredient: UserIngredient = { ...ingredient, id };
    this.userIngredients.set(id, newIngredient);
    return newIngredient;
  }

  async removeUserIngredient(id: number): Promise<void> {
    this.userIngredients.delete(id);
  }

  async getFavoriteRecipes(): Promise<(FavoriteRecipe & { recipe: Recipe })[]> {
    const favorites = Array.from(this.favoriteRecipes.values());
    return favorites.map(fav => {
      const recipe = this.recipes.get(fav.recipeId);
      if (!recipe) {
        throw new Error(`Recipe ${fav.recipeId} not found`);
      }
      return { ...fav, recipe };
    });
  }

  async addFavoriteRecipe(favorite: InsertFavoriteRecipe): Promise<FavoriteRecipe> {
    // Check if already favorited
    const existing = Array.from(this.favoriteRecipes.values()).find(
      fav => fav.recipeId === favorite.recipeId
    );
    
    if (existing) {
      return existing;
    }

    const id = this.currentFavoriteId++;
    const newFavorite: FavoriteRecipe = { ...favorite, id };
    this.favoriteRecipes.set(id, newFavorite);
    return newFavorite;
  }

  async removeFavoriteRecipe(recipeId: number): Promise<void> {
    const favorite = Array.from(this.favoriteRecipes.entries()).find(
      ([, fav]) => fav.recipeId === recipeId
    );
    
    if (favorite) {
      this.favoriteRecipes.delete(favorite[0]);
    }
  }

  async getShoppingListItems(): Promise<ShoppingListItem[]> {
    return Array.from(this.shoppingListItems.values());
  }

  async addShoppingListItem(item: InsertShoppingListItem): Promise<ShoppingListItem> {
    // Check if item already exists
    const existing = Array.from(this.shoppingListItems.values()).find(
      shoppingItem => shoppingItem.ingredient.toLowerCase() === item.ingredient.toLowerCase() && 
                     shoppingItem.recipeId === item.recipeId
    );
    
    if (existing) {
      return existing;
    }

    const id = this.currentShoppingId++;
    const newItem: ShoppingListItem = { ...item, id };
    this.shoppingListItems.set(id, newItem);
    return newItem;
  }

  async removeShoppingListItem(id: number): Promise<void> {
    this.shoppingListItems.delete(id);
  }

  async updateShoppingListItem(id: number, purchased: boolean): Promise<void> {
    const item = this.shoppingListItems.get(id);
    if (item) {
      this.shoppingListItems.set(id, { ...item, purchased });
    }
  }
}

export const storage = new MemStorage();
