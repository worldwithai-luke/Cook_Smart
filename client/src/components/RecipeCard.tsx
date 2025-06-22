import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Recipe } from "@shared/schema";
import { Clock, Users, Star, Heart, ShoppingCart } from "lucide-react";

interface RecipeCardProps {
  recipe: Recipe & {
    availableIngredients: string[];
    missingIngredients: string[];
  };
  onViewRecipe: () => void;
}

export default function RecipeCard({ recipe, onViewRecipe }: RecipeCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const { toast } = useToast();

  const addToFavoritesMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/favorites", {
        recipeId: recipe.id,
        savedAt: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      setIsFavorited(true);
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Added to favorites",
        description: `${recipe.name} has been saved to your favorites`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add to favorites",
        variant: "destructive",
      });
    },
  });

  const addMissingToShoppingMutation = useMutation({
    mutationFn: async () => {
      const promises = recipe.missingIngredients.map(ingredient =>
        apiRequest("POST", "/api/shopping", {
          ingredient,
          recipeId: recipe.id,
          recipeName: recipe.name,
          purchased: false,
        })
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shopping"] });
      toast({
        title: "Added to shopping list",
        description: `Missing ingredients for ${recipe.name} added to your shopping list`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add to shopping list",
        variant: "destructive",
      });
    },
  });

  const handleToggleFavorite = () => {
    if (!isFavorited) {
      addToFavoritesMutation.mutate();
    }
  };

  const rating = recipe.rating / 10; // Convert from 0-50 scale to 0-5 scale

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <img
        src={recipe.imageUrl}
        alt={recipe.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h4 className="text-xl font-semibold text-gray-800">{recipe.name}</h4>
          <button
            onClick={handleToggleFavorite}
            disabled={addToFavoritesMutation.isPending}
            className={`transition-colors ${
              isFavorited ? "text-accent" : "text-gray-400 hover:text-accent"
            }`}
          >
            <Heart className={`h-5 w-5 ${isFavorited ? "fill-current" : ""}`} />
          </button>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
          <span className="flex items-center">
            <Clock className="mr-1 h-4 w-4" />
            {recipe.cookingTime} min
          </span>
          <span className="flex items-center">
            <Users className="mr-1 h-4 w-4" />
            {recipe.servings} servings
          </span>
          <span className="flex items-center">
            <Star className="mr-1 h-4 w-4 text-accent fill-current" />
            {rating.toFixed(1)}
          </span>
        </div>

        {recipe.availableIngredients.length > 0 && (
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-700 mb-2">Your Ingredients:</div>
            <div className="flex flex-wrap gap-1">
              {recipe.availableIngredients.slice(0, 3).map((ingredient, index) => (
                <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 text-xs">
                  {ingredient}
                </Badge>
              ))}
              {recipe.availableIngredients.length > 3 && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                  +{recipe.availableIngredients.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {recipe.missingIngredients.length > 0 && (
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-700 mb-2">Missing Ingredients:</div>
            <div className="flex flex-wrap gap-1">
              {recipe.missingIngredients.slice(0, 2).map((ingredient, index) => (
                <Badge key={index} variant="secondary" className="bg-red-100 text-red-800 text-xs">
                  {ingredient}
                </Badge>
              ))}
              {recipe.missingIngredients.length > 2 && (
                <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs">
                  +{recipe.missingIngredients.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={onViewRecipe}
            className="flex-1 bg-primary text-white hover:bg-primary-dark transition-colors"
          >
            View Recipe
          </Button>
          {recipe.missingIngredients.length > 0 && (
            <Button
              onClick={() => addMissingToShoppingMutation.mutate()}
              disabled={addMissingToShoppingMutation.isPending}
              variant="outline"
              size="sm"
              className="bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
