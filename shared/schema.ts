import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  cookingTime: integer("cooking_time").notNull(), // in minutes
  servings: integer("servings").notNull(),
  difficulty: text("difficulty").notNull(), // Easy, Medium, Hard
  cuisine: text("cuisine").notNull(),
  rating: integer("rating").notNull().default(0), // 1-5 scale * 10 (e.g., 47 = 4.7)
  ingredients: text("ingredients").array().notNull(),
  instructions: text("instructions").array().notNull(),
  imageUrl: text("image_url").notNull(),
});

export const userIngredients = pgTable("user_ingredients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const favoriteRecipes = pgTable("favorite_recipes", {
  id: serial("id").primaryKey(),
  recipeId: integer("recipe_id").notNull(),
  savedAt: text("saved_at").notNull(),
});

export const shoppingListItems = pgTable("shopping_list_items", {
  id: serial("id").primaryKey(),
  ingredient: text("ingredient").notNull(),
  recipeId: integer("recipe_id").notNull(),
  recipeName: text("recipe_name").notNull(),
  purchased: boolean("purchased").notNull().default(false),
});

export const insertRecipeSchema = createInsertSchema(recipes).omit({
  id: true,
});

export const insertUserIngredientSchema = createInsertSchema(userIngredients).omit({
  id: true,
});

export const insertFavoriteRecipeSchema = createInsertSchema(favoriteRecipes).omit({
  id: true,
});

export const insertShoppingListItemSchema = createInsertSchema(shoppingListItems).omit({
  id: true,
});

export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type UserIngredient = typeof userIngredients.$inferSelect;
export type InsertUserIngredient = z.infer<typeof insertUserIngredientSchema>;
export type FavoriteRecipe = typeof favoriteRecipes.$inferSelect;
export type InsertFavoriteRecipe = z.infer<typeof insertFavoriteRecipeSchema>;
export type ShoppingListItem = typeof shoppingListItems.$inferSelect;
export type InsertShoppingListItem = z.infer<typeof insertShoppingListItemSchema>;
