import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { UserIngredient } from "@shared/schema";
import { Plus, X } from "lucide-react";

interface IngredientInputProps {
  onFindRecipes: () => void;
}

const commonIngredients = ["Onions", "Rice", "Eggs", "Cheese", "Pasta", "Chicken", "Tomatoes", "Garlic"];

export default function IngredientInput({ onFindRecipes }: IngredientInputProps) {
  const [ingredientInput, setIngredientInput] = useState("");
  const { toast } = useToast();

  const { data: userIngredients = [] } = useQuery<UserIngredient[]>({
    queryKey: ["/api/ingredients"],
  });

  const addIngredientMutation = useMutation({
    mutationFn: async (name: string) => {
      return apiRequest("POST", "/api/ingredients", { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ingredients"] });
      setIngredientInput("");
      toast({
        title: "Ingredient added",
        description: "Successfully added to your kitchen",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add ingredient",
        variant: "destructive",
      });
    },
  });

  const removeIngredientMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/ingredients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ingredients"] });
      toast({
        title: "Ingredient removed",
        description: "Removed from your kitchen",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove ingredient",
        variant: "destructive",
      });
    },
  });

  const handleAddIngredient = () => {
    if (ingredientInput.trim()) {
      // Check if ingredient already exists
      const exists = userIngredients.some(
        ing => ing.name.toLowerCase() === ingredientInput.toLowerCase()
      );
      
      if (exists) {
        toast({
          title: "Already added",
          description: "This ingredient is already in your kitchen",
          variant: "destructive",
        });
        return;
      }

      addIngredientMutation.mutate(ingredientInput.trim());
    }
  };

  const handleQuickAdd = (ingredient: string) => {
    // Check if ingredient already exists
    const exists = userIngredients.some(
      ing => ing.name.toLowerCase() === ingredient.toLowerCase()
    );
    
    if (exists) {
      toast({
        title: "Already added",
        description: "This ingredient is already in your kitchen",
        variant: "destructive",
      });
      return;
    }

    addIngredientMutation.mutate(ingredient);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddIngredient();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex flex-wrap gap-3 mb-6 min-h-[60px] p-4 border-2 border-dashed border-gray-200 rounded-lg">
        {userIngredients.length === 0 ? (
          <p className="text-gray-500 italic">Add ingredients to see them here...</p>
        ) : (
          userIngredients.map((ingredient) => (
            <Badge
              key={ingredient.id}
              variant="secondary"
              className="bg-secondary-light text-white px-4 py-2 text-sm font-medium flex items-center gap-2"
            >
              {ingredient.name}
              <button
                onClick={() => removeIngredientMutation.mutate(ingredient.id)}
                className="hover:text-gray-200 transition-colors"
                disabled={removeIngredientMutation.isPending}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))
        )}
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Type an ingredient (e.g., chicken, tomatoes, rice)"
            value={ingredientInput}
            onChange={(e) => setIngredientInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <Button
          onClick={handleAddIngredient}
          disabled={!ingredientInput.trim() || addIngredientMutation.isPending}
          className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add
        </Button>
      </div>

      <div className="mb-8">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Quick Add:</h4>
        <div className="flex flex-wrap gap-2">
          {commonIngredients.map((ingredient) => (
            <Button
              key={ingredient}
              variant="outline"
              size="sm"
              onClick={() => handleQuickAdd(ingredient)}
              disabled={addIngredientMutation.isPending}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
            >
              {ingredient}
            </Button>
          ))}
        </div>
      </div>

      <div className="text-center">
        <Button
          onClick={onFindRecipes}
          size="lg"
          className="bg-secondary text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-secondary-light transition-colors shadow-lg"
          disabled={userIngredients.length === 0}
        >
          <Plus className="mr-2 h-5 w-5" />
          Find Recipes
        </Button>
        {userIngredients.length === 0 && (
          <p className="text-sm text-gray-500 mt-2">Add at least one ingredient to find recipes</p>
        )}
      </div>
    </div>
  );
}
