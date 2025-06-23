import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/Header";
import IngredientInput from "@/components/IngredientInput";
import RecipeCard from "@/components/RecipeCard";
import RecipeModal from "@/components/RecipeModal";
import ShoppingList from "@/components/ShoppingList";
import MobileNav from "@/components/MobileNav";
import { Recipe, UserIngredient } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Utensils, Clock, Users, Star, Sparkles, RotateCcw } from "lucide-react";

export default function Home() {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [cuisineFilter, setCuisineFilter] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const [currentSection, setCurrentSection] = useState<string>("ingredients");

  const { data: recipes = [], isLoading: recipesLoading } = useQuery<Recipe[]>({
    queryKey: ["/api/recipes"],
  });

  const { data: userIngredients = [] } = useQuery<UserIngredient[]>({
    queryKey: ["/api/ingredients"],
  });

  const { data: searchedRecipes = [], refetch: searchRecipes } = useQuery<Recipe[]>({
    queryKey: ["/api/recipes/search"],
    enabled: false,
  });

  // Use searched recipes if available, otherwise all recipes
  const displayRecipes = searchedRecipes.length > 0 ? searchedRecipes : recipes;

  // Filter recipes based on selected filters
  const filteredRecipes = displayRecipes.filter((recipe) => {
    const cuisineMatch = cuisineFilter === "all" || recipe.cuisine.toLowerCase() === cuisineFilter;
    const timeMatch = timeFilter === "all" || 
      (timeFilter === "under-15" && recipe.cookingTime < 15) ||
      (timeFilter === "15-30" && recipe.cookingTime >= 15 && recipe.cookingTime <= 30) ||
      (timeFilter === "30-60" && recipe.cookingTime > 30 && recipe.cookingTime <= 60) ||
      (timeFilter === "over-60" && recipe.cookingTime > 60);
    
    return cuisineMatch && timeMatch;
  });

  // Get ingredient availability for each recipe
  const recipesWithAvailability = filteredRecipes.map((recipe) => {
    const userIngredientNames = userIngredients.map(ing => ing.name.toLowerCase());
    const availableIngredients = recipe.ingredients.filter(ingredient =>
      userIngredientNames.some(userIng => 
        ingredient.toLowerCase().includes(userIng) || userIng.includes(ingredient.toLowerCase())
      )
    );
    const missingIngredients = recipe.ingredients.filter(ingredient =>
      !userIngredientNames.some(userIng => 
        ingredient.toLowerCase().includes(userIng) || userIng.includes(ingredient.toLowerCase())
      )
    );

    return {
      ...recipe,
      availableIngredients,
      missingIngredients,
    };
  });

  const generateAIRecipesMutation = useMutation({
    mutationFn: async (params: any) => {
      return apiRequest("POST", "/api/recipes/generate", params);
    },
    onSuccess: (newRecipes) => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
      setCurrentSection("recipes");
      document.getElementById("recipes")?.scrollIntoView({ behavior: "smooth" });
    },
    onError: (error: any) => {
      console.error("Failed to generate AI recipes:", error);
      throw error;
    },
  });

  const handleFindRecipes = async () => {
    if (userIngredients.length > 0) {
      await searchRecipes();
    }
    setCurrentSection("recipes");
    document.getElementById("recipes")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleGenerateAIRecipes = async (params: any) => {
    await generateAIRecipesMutation.mutateAsync(params);
  };

  const handleResetRecipes = () => {
    setCuisineFilter("all");
    setTimeFilter("all");
    queryClient.setQueryData(["/api/recipes/search"], []);
    setCurrentSection("ingredients");
    document.getElementById("ingredients")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-cream">
      <Header currentSection={currentSection} onSectionChange={setCurrentSection} />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-light to-primary py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-black">
              Turn Your Ingredients Into Delicious Meals
            </h2>
            <p className="text-xl mb-8 text-black">
              Enter what's in your kitchen and get personalized recipes that reduce food waste
            </p>
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-gray-100 shadow-lg"
              onClick={() => {
                setCurrentSection("ingredients");
                document.getElementById("ingredients")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <Utensils className="mr-2 h-5 w-5" />
              Add Ingredients
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
            <div className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">{recipes.length}</div>
              <div className="text-gray-600">Recipes Available</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-secondary mb-2">89%</div>
              <div className="text-gray-600">Food Waste Reduced</div>
            </div>
          </div>
        </div>
      </section>

      {/* Ingredient Input Section */}
      <section id="ingredients" className="py-16 bg-warm-gray">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-secondary mb-4">What's In Your Kitchen?</h3>
            <p className="text-gray-600 text-lg">
              Add your available ingredients to discover amazing recipe possibilities
            </p>
          </div>
          <IngredientInput 
            onFindRecipes={handleFindRecipes} 
            onGenerateRecipes={handleGenerateAIRecipes}
          />
        </div>
      </section>

      {/* Recipe Results Section */}
      <section id="recipes" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8">
            <div>
              <h3 className="text-3xl font-bold text-secondary mb-2 flex items-center">
                Recipe Suggestions
                {generateAIRecipesMutation.isPending && (
                  <Sparkles className="ml-3 h-6 w-6 text-purple-600 animate-spin" />
                )}
              </h3>
              <p className="text-gray-600">
                Found {filteredRecipes.length} recipes{userIngredients.length > 0 ? " with your ingredients" : ""}
                {generateAIRecipesMutation.isPending && " • Generating fresh AI recipes..."}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4 mt-4 lg:mt-0">
              <Select value={cuisineFilter} onValueChange={setCuisineFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Cuisines" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cuisines</SelectItem>
                  <SelectItem value="italian">Italian</SelectItem>
                  <SelectItem value="indian">Indian</SelectItem>
                  <SelectItem value="american">American</SelectItem>
                  <SelectItem value="mexican">Mexican</SelectItem>
                  <SelectItem value="asian">Asian</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Any Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Time</SelectItem>
                  <SelectItem value="under-15">Under 15 min</SelectItem>
                  <SelectItem value="15-30">15-30 min</SelectItem>
                  <SelectItem value="30-60">30-60 min</SelectItem>
                  <SelectItem value="over-60">Over 1 hour</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={handleResetRecipes}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>

          {recipesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                  <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipesWithAvailability.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onViewRecipe={() => setSelectedRecipe(recipe)}
                />
              ))}
            </div>
          )}

          {filteredRecipes.length === 0 && !recipesLoading && (
            <div className="text-center py-12">
              <Utensils className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h4 className="text-lg font-semibold text-gray-600 mb-2">No recipes found</h4>
              <p className="text-gray-500">
                {userIngredients.length === 0 
                  ? "Add some ingredients to see recipe suggestions" 
                  : "Try adjusting your filters or adding more ingredients"
                }
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Favorites Section */}
      <section id="favorites" className="py-16 bg-warm-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-secondary mb-4">Your Favorite Recipes</h3>
            <p className="text-gray-600">Saved recipes ready to cook</p>
          </div>
          
          {/* This will be populated by the favorites query */}
          <div className="text-center py-12">
            <Star className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h4 className="text-lg font-semibold text-gray-600 mb-2">No favorites yet</h4>
            <p className="text-gray-500">
              Save your favorite recipes by clicking the heart icon on recipe cards
            </p>
          </div>
        </div>
      </section>

      {/* Shopping List Section */}
      <section id="shopping" className="py-16">
        <ShoppingList />
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Utensils className="text-primary text-2xl" />
                <h5 className="text-2xl font-bold">ChefMate</h5>
              </div>
              <p className="text-gray-300 mb-4">
                Transform your available ingredients into delicious meals while reducing food waste and making cooking more enjoyable.
              </p>
            </div>
            
            <div>
              <h6 className="font-semibold mb-4">Features</h6>
              <ul className="space-y-2 text-gray-300">
                <li>Recipe Finder</li>
                <li>Ingredient Scanner</li>
                <li>Meal Planning</li>
                <li>Shopping Lists</li>
              </ul>
            </div>

            <div>
              <h6 className="font-semibold mb-4">Support</h6>
              <ul className="space-y-2 text-gray-300">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 ChefMate. All rights reserved. Built with ❤️ for home cooks everywhere.</p>
          </div>
        </div>
      </footer>

      {/* Recipe Modal */}
      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          isOpen={!!selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}

      {/* Mobile Navigation */}
      <MobileNav currentSection={currentSection} onSectionChange={setCurrentSection} />
    </div>
  );
}
