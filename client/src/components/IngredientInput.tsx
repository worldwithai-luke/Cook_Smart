import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { UserIngredient } from "@shared/schema";
import { Plus, X, Sparkles, Utensils } from "lucide-react";

interface IngredientInputProps {
  onFindRecipes: () => void;
  onGenerateRecipes: (params: any) => void;
}

const commonIngredients = ["Onions", "Rice", "Eggs", "Cheese", "Pasta", "Chicken", "Tomatoes", "Garlic"];

export default function IngredientInput({ onFindRecipes, onGenerateRecipes }: IngredientInputProps) {
  const [ingredientInput, setIngredientInput] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState<string>("any");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("any");
  const [isGenerating, setIsGenerating] = useState(false);
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

  const handleGenerateAIRecipes = async () => {
    if (userIngredients.length === 0) {
      toast({
        title: "No ingredients",
        description: "Add some ingredients first to generate AI recipes",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const params = {
        ingredients: userIngredients.map(ing => ing.name),
        cuisine: selectedCuisine !== "any" ? selectedCuisine : undefined,
        difficulty: selectedDifficulty !== "any" ? selectedDifficulty : undefined,
        maxCookingTime: 45,
        servings: 4,
        count: 3
      };

      await onGenerateRecipes(params);
      
      toast({
        title: "AI recipes generated!",
        description: "Fresh healthy recipes created just for your ingredients",
      });
    } catch (error: any) {
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate AI recipes",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
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

      {/* AI Recipe Generation Options */}
      {userIngredients.length > 0 && (
        <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Sparkles className="mr-2 h-5 w-5 text-purple-600" />
            AI Recipe Generation
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cuisine Style</label>
              <Select value={selectedCuisine} onValueChange={setSelectedCuisine}>
                <SelectTrigger>
                  <SelectValue placeholder="Any cuisine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Cuisine</SelectItem>
                  <SelectItem value="Italian">Italian</SelectItem>
                  <SelectItem value="Mexican">Mexican</SelectItem>
                  <SelectItem value="Asian">Asian</SelectItem>
                  <SelectItem value="Mediterranean">Mediterranean</SelectItem>
                  <SelectItem value="Indian">Indian</SelectItem>
                  <SelectItem value="American">American</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Any difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Difficulty</SelectItem>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      <div className="text-center space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={onFindRecipes}
            size="lg"
            className="bg-secondary text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-secondary-light transition-colors shadow-lg"
            disabled={userIngredients.length === 0}
          >
            <Utensils className="mr-2 h-5 w-5" />
            Find Existing Recipes
          </Button>
          
          <Button
            onClick={handleGenerateAIRecipes}
            size="lg"
            disabled={userIngredients.length === 0 || isGenerating}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            {isGenerating ? "Generating..." : "Generate AI Recipes"}
          </Button>
        </div>
        
        {userIngredients.length === 0 && (
          <p className="text-sm text-gray-500">Add ingredients to discover and generate recipes</p>
        )}
        
        {userIngredients.length > 0 && (
          <p className="text-sm text-gray-600">
            Find existing recipes or let AI create new healthy recipes using your ingredients
          </p>
        )}
      </div>
    </div>
  );
}
