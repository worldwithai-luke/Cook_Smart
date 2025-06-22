import { useQuery } from "@tanstack/react-query";
import { ShoppingListItem } from "@shared/schema";
import { Plus, Utensils, Heart, ShoppingCart } from "lucide-react";

interface MobileNavProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

export default function MobileNav({ currentSection, onSectionChange }: MobileNavProps) {
  const { data: shoppingItems = [] } = useQuery<ShoppingListItem[]>({
    queryKey: ["/api/shopping"],
  });

  const unpurchasedItemsCount = shoppingItems.filter(item => !item.purchased).length;

  const handleNavClick = (section: string) => {
    onSectionChange(section);
    
    // Scroll to section
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40">
      <div className="flex justify-around py-2">
        <button
          onClick={() => handleNavClick("ingredients")}
          className={`flex flex-col items-center py-2 px-3 transition-colors ${
            currentSection === "ingredients" ? "text-primary" : "text-gray-600 hover:text-primary"
          }`}
        >
          <Plus className="text-lg mb-1" />
          <span className="text-xs">Add</span>
        </button>
        
        <button
          onClick={() => handleNavClick("recipes")}
          className={`flex flex-col items-center py-2 px-3 transition-colors ${
            currentSection === "recipes" ? "text-primary" : "text-gray-600 hover:text-primary"
          }`}
        >
          <Utensils className="text-lg mb-1" />
          <span className="text-xs">Recipes</span>
        </button>
        
        <button
          onClick={() => handleNavClick("favorites")}
          className={`flex flex-col items-center py-2 px-3 transition-colors ${
            currentSection === "favorites" ? "text-primary" : "text-gray-600 hover:text-primary"
          }`}
        >
          <Heart className="text-lg mb-1" />
          <span className="text-xs">Favorites</span>
        </button>
        
        <button
          onClick={() => handleNavClick("shopping")}
          className={`flex flex-col items-center py-2 px-3 relative transition-colors ${
            currentSection === "shopping" ? "text-primary" : "text-gray-600 hover:text-primary"
          }`}
        >
          <ShoppingCart className="text-lg mb-1" />
          <span className="text-xs">Shop</span>
          {unpurchasedItemsCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unpurchasedItemsCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}
