import { GoogleGenAI } from "@google/genai";
import { InsertRecipe } from "@shared/schema";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface GenerateRecipeRequest {
  ingredients: string[];
  cuisine?: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  maxCookingTime?: number;
  servings?: number;
  dietaryRestrictions?: string[];
}

export async function generateHealthyRecipe(params: GenerateRecipeRequest): Promise<InsertRecipe> {
  const prompt = `Create a healthy recipe using these ingredients: ${params.ingredients.join(", ")}.

Requirements:
- Focus on healthy, nutritious cooking
- Use at least 3 of the provided ingredients
- ${params.cuisine ? `Make it ${params.cuisine} cuisine` : "Any cuisine style"}
- ${params.difficulty ? `Difficulty level: ${params.difficulty}` : "Easy to Medium difficulty"}
- ${params.maxCookingTime ? `Maximum cooking time: ${params.maxCookingTime} minutes` : "Under 45 minutes"}
- ${params.servings ? `Serves ${params.servings} people` : "Serves 4 people"}
- ${params.dietaryRestrictions?.length ? `Dietary restrictions: ${params.dietaryRestrictions.join(", ")}` : ""}

Return a JSON object with exactly this structure:
{
  "name": "Recipe Name",
  "description": "Brief appetizing description focusing on health benefits",
  "cookingTime": number (in minutes),
  "servings": number,
  "difficulty": "Easy" | "Medium" | "Hard",
  "cuisine": "cuisine type",
  "rating": number (40-50, representing 4.0-5.0 stars * 10),
  "ingredients": ["ingredient 1", "ingredient 2", ...],
  "instructions": ["step 1", "step 2", ...],
  "imageUrl": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
}

Make it creative and healthy while using the available ingredients efficiently.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            cookingTime: { type: "number" },
            servings: { type: "number" },
            difficulty: { type: "string", enum: ["Easy", "Medium", "Hard"] },
            cuisine: { type: "string" },
            rating: { type: "number" },
            ingredients: { type: "array", items: { type: "string" } },
            instructions: { type: "array", items: { type: "string" } },
            imageUrl: { type: "string" }
          },
          required: ["name", "description", "cookingTime", "servings", "difficulty", "cuisine", "rating", "ingredients", "instructions", "imageUrl"]
        }
      },
      contents: prompt,
    });

    const rawJson = response.text;
    if (!rawJson) {
      throw new Error("Empty response from Gemini");
    }

    const recipe = JSON.parse(rawJson) as InsertRecipe;
    
    // Validate the response has required fields
    if (!recipe.name || !recipe.ingredients || !recipe.instructions) {
      throw new Error("Invalid recipe structure from Gemini");
    }

    return recipe;
  } catch (error) {
    console.error("Error generating recipe with Gemini:", error);
    throw new Error(`Failed to generate recipe: ${error}`);
  }
}

export async function generateMultipleRecipes(params: GenerateRecipeRequest, count: number = 3): Promise<InsertRecipe[]> {
  const promises = Array.from({ length: count }, () => generateHealthyRecipe(params));
  
  try {
    const results = await Promise.allSettled(promises);
    const recipes = results
      .filter((result): result is PromiseFulfilledResult<InsertRecipe> => result.status === 'fulfilled')
      .map(result => result.value);
    
    return recipes;
  } catch (error) {
    console.error("Error generating multiple recipes:", error);
    throw new Error("Failed to generate recipes");
  }
}