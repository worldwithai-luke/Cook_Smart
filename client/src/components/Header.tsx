import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ShoppingListItem } from "@shared/schema";
import { Utensils, Search, ShoppingCart, Menu } from "lucide-react";

interface HeaderProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

export default function Header({ currentSection, onSectionChange }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: shoppingItems = [] } = useQuery<ShoppingListItem[]>({
    queryKey: ["/api/shopping"],
  });

  const unpurchasedItemsCount = shoppingItems.filter(item => !item.purchased).length;

  const handleNavClick = (section: string) => {
    onSectionChange(section);
    setMobileMenuOpen(false);
    
    // Scroll to section
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Utensils className="text-primary text-2xl" />
            <h1 className="text-2xl font-bold text-secondary">ChefMate</h1>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <button
              onClick={() => handleNavClick("ingredients")}
              className={`text-gray-600 hover:text-primary transition-colors font-medium ${
                currentSection === "ingredients" ? "text-primary" : ""
              }`}
            >
              My Ingredients
            </button>
            <button
              onClick={() => handleNavClick("recipes")}
              className={`text-gray-600 hover:text-primary transition-colors font-medium ${
                currentSection === "recipes" ? "text-primary" : ""
              }`}
            >
              Recipes
            </button>
            <button
              onClick={() => handleNavClick("favorites")}
              className={`text-gray-600 hover:text-primary transition-colors font-medium ${
                currentSection === "favorites" ? "text-primary" : ""
              }`}
            >
              Favorites
            </button>
            <button
              onClick={() => handleNavClick("shopping")}
              className={`text-gray-600 hover:text-primary transition-colors font-medium ${
                currentSection === "shopping" ? "text-primary" : ""
              }`}
            >
              Shopping List
            </button>
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="relative p-2">
              <Search className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative p-2"
              onClick={() => handleNavClick("shopping")}
            >
              <ShoppingCart className="h-5 w-5" />
              {unpurchasedItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unpurchasedItemsCount}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              <button
                onClick={() => handleNavClick("ingredients")}
                className="block w-full text-left px-4 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 rounded"
              >
                My Ingredients
              </button>
              <button
                onClick={() => handleNavClick("recipes")}
                className="block w-full text-left px-4 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 rounded"
              >
                Recipes
              </button>
              <button
                onClick={() => handleNavClick("favorites")}
                className="block w-full text-left px-4 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 rounded"
              >
                Favorites
              </button>
              <button
                onClick={() => handleNavClick("shopping")}
                className="block w-full text-left px-4 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 rounded"
              >
                Shopping List
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
