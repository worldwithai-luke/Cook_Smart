import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserIngredientSchema, 
  insertFavoriteRecipeSchema, 
  insertShoppingListItemSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Recipes
  app.get("/api/recipes", async (req, res) => {
    try {
      const recipes = await storage.getRecipes();
      res.json(recipes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recipes" });
    }
  });

  app.get("/api/recipes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const recipe = await storage.getRecipe(id);
      if (!recipe) {
        return res.status(404).json({ error: "Recipe not found" });
      }
      res.json(recipe);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recipe" });
    }
  });

  app.post("/api/recipes/search", async (req, res) => {
    try {
      const { ingredients } = req.body;
      if (!Array.isArray(ingredients)) {
        return res.status(400).json({ error: "Ingredients must be an array" });
      }
      
      const recipes = await storage.searchRecipesByIngredients(ingredients);
      res.json(recipes);
    } catch (error) {
      res.status(500).json({ error: "Failed to search recipes" });
    }
  });

  // User Ingredients
  app.get("/api/ingredients", async (req, res) => {
    try {
      const ingredients = await storage.getUserIngredients();
      res.json(ingredients);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ingredients" });
    }
  });

  app.post("/api/ingredients", async (req, res) => {
    try {
      const validatedData = insertUserIngredientSchema.parse(req.body);
      const ingredient = await storage.addUserIngredient(validatedData);
      res.status(201).json(ingredient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid ingredient data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to add ingredient" });
    }
  });

  app.delete("/api/ingredients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.removeUserIngredient(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove ingredient" });
    }
  });

  // Favorites
  app.get("/api/favorites", async (req, res) => {
    try {
      const favorites = await storage.getFavoriteRecipes();
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites", async (req, res) => {
    try {
      const validatedData = insertFavoriteRecipeSchema.parse(req.body);
      const favorite = await storage.addFavoriteRecipe(validatedData);
      res.status(201).json(favorite);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid favorite data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to add favorite" });
    }
  });

  app.delete("/api/favorites/:recipeId", async (req, res) => {
    try {
      const recipeId = parseInt(req.params.recipeId);
      await storage.removeFavoriteRecipe(recipeId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove favorite" });
    }
  });

  // Shopping List
  app.get("/api/shopping", async (req, res) => {
    try {
      const items = await storage.getShoppingListItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch shopping list" });
    }
  });

  app.post("/api/shopping", async (req, res) => {
    try {
      const validatedData = insertShoppingListItemSchema.parse(req.body);
      const item = await storage.addShoppingListItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid shopping item data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to add shopping item" });
    }
  });

  app.delete("/api/shopping/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.removeShoppingListItem(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove shopping item" });
    }
  });

  app.patch("/api/shopping/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { purchased } = req.body;
      if (typeof purchased !== "boolean") {
        return res.status(400).json({ error: "Purchased must be a boolean" });
      }
      
      await storage.updateShoppingListItem(id, purchased);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to update shopping item" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
