import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ShoppingListItem } from "@shared/schema";
import { Download, Trash2, X } from "lucide-react";

export default function ShoppingList() {
  const { toast } = useToast();

  const { data: shoppingItems = [] } = useQuery<ShoppingListItem[]>({
    queryKey: ["/api/shopping"],
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, purchased }: { id: number; purchased: boolean }) => {
      return apiRequest("PATCH", `/api/shopping/${id}`, { purchased });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shopping"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update item",
        variant: "destructive",
      });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/shopping/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shopping"] });
      toast({
        title: "Item removed",
        description: "Item removed from shopping list",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove item",
        variant: "destructive",
      });
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: async () => {
      const promises = shoppingItems.map(item => 
        apiRequest("DELETE", `/api/shopping/${item.id}`)
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shopping"] });
      toast({
        title: "Shopping list cleared",
        description: "All items have been removed from your shopping list",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to clear shopping list",
        variant: "destructive",
      });
    },
  });

  const handleToggleItem = (id: number, purchased: boolean) => {
    updateItemMutation.mutate({ id, purchased });
  };

  const handleExportList = () => {
    const exportText = shoppingItems
      .map(item => `${item.purchased ? "✓" : "□"} ${item.ingredient} (for ${item.recipeName})`)
      .join("\n");
    
    const blob = new Blob([exportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "shopping-list.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Shopping list exported",
      description: "Your shopping list has been downloaded as a text file",
    });
  };

  const purchasedCount = shoppingItems.filter(item => item.purchased).length;
  const progressPercentage = shoppingItems.length > 0 ? (purchasedCount / shoppingItems.length) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h3 className="text-3xl font-bold text-secondary mb-4">Shopping List</h3>
        <p className="text-gray-600">Missing ingredients from your selected recipes</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-xl font-semibold text-gray-800">
            {shoppingItems.length} {shoppingItems.length === 1 ? "item" : "items"} to buy
          </h4>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportList}
              disabled={shoppingItems.length === 0}
              className="text-gray-600 hover:text-primary transition-colors"
            >
              <Download className="mr-1 h-4 w-4" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => clearAllMutation.mutate()}
              disabled={shoppingItems.length === 0 || clearAllMutation.isPending}
              className="text-gray-600 hover:text-destructive transition-colors"
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Clear All
            </Button>
          </div>
        </div>

        {shoppingItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">🛒</div>
            <h4 className="text-lg font-semibold text-gray-600 mb-2">Your shopping list is empty</h4>
            <p className="text-gray-500">
              Add missing ingredients from recipes to build your shopping list
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-8">
              {shoppingItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={item.purchased}
                      onCheckedChange={(checked) =>
                        handleToggleItem(item.id, checked as boolean)
                      }
                      disabled={updateItemMutation.isPending}
                    />
                    <div>
                      <div
                        className={`font-medium text-gray-800 ${
                          item.purchased ? "line-through" : ""
                        }`}
                      >
                        {item.ingredient}
                      </div>
                      <div className="text-sm text-gray-600">For {item.recipeName}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItemMutation.mutate(item.id)}
                    disabled={removeItemMutation.isPending}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>
                  {purchasedCount} of {shoppingItems.length} items purchased
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
