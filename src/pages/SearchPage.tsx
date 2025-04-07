
import { useState, useEffect } from "react";
import { products } from "@/services/mockData";
import ProductCard from "@/components/shop/ProductCard";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState(products);
  const [isAnimated, setIsAnimated] = useState(false);
  
  useEffect(() => {
    // Animation delay for elements
    setTimeout(() => setIsAnimated(true), 100);
    
    if (!searchTerm) {
      setSearchResults(products);
      return;
    }
    
    const filteredProducts = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.subcategory.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setSearchResults(filteredProducts);
  }, [searchTerm]);
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className={`transition-all duration-500 transform ${isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <h1 className="text-3xl font-bold mb-8 gradient-text text-center md:text-left">Search Products</h1>
        
        <div className="max-w-2xl mx-auto mb-10">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl blur-md group-hover:blur transition-all duration-300"></div>
            <div className="relative bg-white rounded-xl shadow-sm">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for products..."
                className="pl-12 py-6 text-lg rounded-xl border-none focus:ring-2 focus:ring-primary/50 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
              {searchTerm && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setSearchTerm("")}
                >
                  <FilterX className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-sm text-muted-foreground text-center">
            <span className="font-medium">{searchResults.length}</span> products found
            {searchTerm && <span> for "<span className="text-primary font-medium">{searchTerm}</span>"</span>}
          </p>
        </div>
        
        {searchResults.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {searchResults.map((product, index) => (
              <div 
                key={product.id} 
                className="animate-slide-up" 
                style={{ animationDelay: `${0.05 * index}s` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm animate-slide-up">
            <div className="mx-auto w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-6">
              <SearchIcon size={32} className="text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No products found</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Try a different search term or browse our categories to find what you're looking for.
            </p>
            <Button 
              variant="outline"
              onClick={() => setSearchTerm("")}
              className="transition-all hover:shadow-md"
            >
              Clear Search
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
