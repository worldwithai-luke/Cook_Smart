import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Recipe, UserIngredient } from "@shared/schema";
import { Clock, Users, Heart, ShoppingCart, Printer } from "lucide-react";

interface RecipeModalProps {
  recipe: Recipe;
  isOpen: boolean;
  onClose: () => void;
}

export default function RecipeModal({ recipe, isOpen, onClose }: RecipeModalProps) {
  const { toast } = useToast();

  const { data: userIngredients = [] } = useQuery<UserIngredient[]>({
    queryKey: ["/api/ingredients"],
  });

  const addToFavoritesMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/favorites", {
        recipeId: recipe.id,
        savedAt: new Date().toISOString(),
      });
    },
    onSuccess: () => {
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
    mutationFn: async (missingIngredients: string[]) => {
      const promises = missingIngredients.map(ingredient =>
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

  // Calculate ingredient availability
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

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>${recipe.name} - ChefMate Recipe</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { border-bottom: 2px solid #FF6B35; padding-bottom: 10px; margin-bottom: 20px; }
            .title { color: #2D5016; font-size: 24px; font-weight: bold; }
            .meta { margin: 10px 0; color: #666; }
            .ingredients, .instructions { margin: 20px 0; }
            .ingredients h3, .instructions h3 { color: #2D5016; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            .ingredient-item { margin: 5px 0; }
            .instruction-step { margin: 10px 0; padding: 10px; border-left: 3px solid #FF6B35; }
            .step-number { font-weight: bold; color: #FF6B35; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${recipe.name}</div>
            <div class="meta">
              ⏱ ${recipe.cookingTime} minutes | 👥 ${recipe.servings} servings
            </div>
            <div class="meta">${recipe.description}</div>
          </div>
          
          <div class="ingredients">
            <h3>Ingredients</h3>
            ${recipe.ingredients.map(ingredient => `
              <div class="ingredient-item">• ${ingredient}</div>
            `).join('')}
          </div>
          
          <div class="instructions">
            <h3>Instructions</h3>
            ${recipe.instructions.map((instruction, index) => `
              <div class="instruction-step">
                <span class="step-number">${index + 1}.</span> ${instruction}
              </div>
            `).join('')}
          </div>
          
          <div style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">
            Recipe from ChefMate - Your Cooking Companion
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-screen overflow-hidden">
        <DialogHeader className="sticky top-0 bg-white z-10 border-b border-gray-200 pb-4">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-bold text-secondary">
              {recipe.name}
            </DialogTitle>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[80vh]">
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <img
                  src={recipe.imageUrl}
                  alt={recipe.name}
                  className="w-full h-64 object-cover rounded-xl mb-6"
                />
                
                <div className="flex items-center space-x-6 text-sm text-gray-600 mb-6">
                  <span className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    {recipe.cookingTime} minutes
                  </span>
                  <span className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    {recipe.servings} servings
                  </span>
                </div>

                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-secondary mb-3">Description</h4>
                  <p className="text-gray-600 leading-relaxed">{recipe.description}</p>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-secondary mb-4">Ingredients</h4>
                <div className="space-y-2 mb-6">
                  {recipe.ingredients.map((ingredient, index) => {
                    const isAvailable = availableIngredients.includes(ingredient);
                    return (
                      <div key={index} className="flex items-center justify-between p-2 rounded">
                        <span className="text-gray-700">{ingredient}</span>
                        <Badge
                          variant="secondary"
                          className={
                            isAvailable
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {isAvailable ? "Have" : "Need"}
                        </Badge>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-3 mb-6">
                  {missingIngredients.length > 0 && (
                    <Button
                      onClick={() => addMissingToShoppingMutation.mutate(missingIngredients)}
                      disabled={addMissingToShoppingMutation.isPending}
                      className="flex-1 bg-primary text-white hover:bg-primary-dark transition-colors"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add Missing to Cart
                    </Button>
                  )}
                  <Button
                    onClick={() => addToFavoritesMutation.mutate()}
                    disabled={addToFavoritesMutation.isPending}
                    variant="outline"
                    className="bg-accent text-accent-foreground hover:bg-yellow-500 transition-colors"
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h4 className="text-lg font-semibold text-secondary mb-4">Instructions</h4>
              <div className="space-y-4">
                {recipe.instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold text-sm">
                      {index + 1}
                    </span>
                    <p className="text-gray-700 pt-1">{instruction}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
