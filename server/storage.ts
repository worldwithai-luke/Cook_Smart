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
import { db } from "./db";
import { eq } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  constructor() {
    // Initialize with sample data on first run
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    try {
      // Check if we already have data
      const existingRecipes = await db.select().from(recipes).limit(1);
      if (existingRecipes.length > 0) {
        return; // Data already exists
      }

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

      for (const recipe of sampleRecipes) {
        await db.insert(recipes).values(recipe);
      }
    } catch (error) {
      console.error("Error initializing sample data:", error);
    }
  }

  async getRecipes(): Promise<Recipe[]> {
    return await db.select().from(recipes);
  }

  async getRecipe(id: number): Promise<Recipe | undefined> {
    const [recipe] = await db.select().from(recipes).where(eq(recipes.id, id));
    return recipe || undefined;
  }

  async createRecipe(recipe: InsertRecipe): Promise<Recipe> {
    const [newRecipe] = await db
      .insert(recipes)
      .values(recipe)
      .returning();
    return newRecipe;
  }

  async searchRecipesByIngredients(ingredients: string[]): Promise<Recipe[]> {
    if (ingredients.length === 0) {
      return await db.select().from(recipes);
    }

    const allRecipes = await db.select().from(recipes);
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
    return await db.select().from(userIngredients);
  }

  async addUserIngredient(ingredient: InsertUserIngredient): Promise<UserIngredient> {
    // Check if ingredient already exists
    const existing = await db.select().from(userIngredients).where(eq(userIngredients.name, ingredient.name));
    
    if (existing.length > 0) {
      return existing[0];
    }

    const [newIngredient] = await db
      .insert(userIngredients)
      .values(ingredient)
      .returning();
    return newIngredient;
  }

  async removeUserIngredient(id: number): Promise<void> {
    await db.delete(userIngredients).where(eq(userIngredients.id, id));
  }

  async getFavoriteRecipes(): Promise<(FavoriteRecipe & { recipe: Recipe })[]> {
    const favorites = await db.select().from(favoriteRecipes);
    const results = [];
    
    for (const fav of favorites) {
      const [recipe] = await db.select().from(recipes).where(eq(recipes.id, fav.recipeId));
      if (recipe) {
        results.push({ ...fav, recipe });
      }
    }
    
    return results;
  }

  async addFavoriteRecipe(favorite: InsertFavoriteRecipe): Promise<FavoriteRecipe> {
    // Check if already favorited
    const existing = await db.select().from(favoriteRecipes).where(eq(favoriteRecipes.recipeId, favorite.recipeId));
    
    if (existing.length > 0) {
      return existing[0];
    }

    const [newFavorite] = await db
      .insert(favoriteRecipes)
      .values(favorite)
      .returning();
    return newFavorite;
  }

  async removeFavoriteRecipe(recipeId: number): Promise<void> {
    await db.delete(favoriteRecipes).where(eq(favoriteRecipes.recipeId, recipeId));
  }

  async getShoppingListItems(): Promise<ShoppingListItem[]> {
    return await db.select().from(shoppingListItems);
  }

  async addShoppingListItem(item: InsertShoppingListItem): Promise<ShoppingListItem> {
    // Check if item already exists
    const existing = await db.select().from(shoppingListItems).where(
      eq(shoppingListItems.ingredient, item.ingredient)
    );
    
    if (existing.length > 0 && existing[0].recipeId === item.recipeId) {
      return existing[0];
    }

    const [newItem] = await db
      .insert(shoppingListItems)
      .values(item)
      .returning();
    return newItem;
  }

  async removeShoppingListItem(id: number): Promise<void> {
    await db.delete(shoppingListItems).where(eq(shoppingListItems.id, id));
  }

  async updateShoppingListItem(id: number, purchased: boolean): Promise<void> {
    await db
      .update(shoppingListItems)
      .set({ purchased })
      .where(eq(shoppingListItems.id, id));
  }
}

export const storage = new DatabaseStorage();
