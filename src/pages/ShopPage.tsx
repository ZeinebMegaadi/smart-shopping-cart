
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { products, categories } from "@/services/mockData";
import CategoryList from "@/components/shop/CategoryList";
import SubcategoryFilter from "@/components/shop/SubcategoryFilter";
import ProductCard from "@/components/shop/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, SlidersHorizontal, X } from "lucide-react";

const ShopPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  
  // State
  const [selectedCategory, setSelectedCategory] = useState(queryParams.get("category") || "");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [showFilters, setShowFilters] = useState(false);
  
  // Update URL when category changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory) {
      params.set("category", selectedCategory);
    }
    
    const newUrl = params.toString() ? `?${params.toString()}` : "";
    navigate(`/shop${newUrl}`, { replace: true });
  }, [selectedCategory, navigate]);
  
  // Filter products based on selections
  const filteredProducts = products.filter((product) => {
    // Category filter
    if (selectedCategory && product.category !== selectedCategory) {
      return false;
    }
    
    // Subcategory filter
    if (selectedSubcategory && product.subcategory !== selectedSubcategory) {
      return false;
    }
    
    // Search filter
    if (
      searchTerm &&
      !product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !product.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    
    // Price range filter
    if (priceRange.min && product.price < Number(priceRange.min)) {
      return false;
    }
    if (priceRange.max && product.price > Number(priceRange.max)) {
      return false;
    }
    
    return true;
  });
  
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory("");
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already working via state
  };
  
  const handleClearFilters = () => {
    setSelectedCategory("");
    setSelectedSubcategory("");
    setSearchTerm("");
    setPriceRange({ min: "", max: "" });
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Shop Products</h1>
      
      {/* Categories */}
      <CategoryList 
        selectedCategory={selectedCategory} 
        onSelectCategory={handleCategorySelect}
      />
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Mobile filter toggle */}
        <div className="md:hidden">
          <Button
            variant="outline"
            className="w-full mb-4 flex items-center justify-center"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>
        
        {/* Sidebar filters */}
        <div 
          className={`${
            showFilters ? "block" : "hidden"
          } md:block w-full md:w-64 space-y-8`}
        >
          {/* Search */}
          <div>
            <h3 className="text-lg font-medium mb-3">Search</h3>
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </form>
          </div>
          
          {/* Subcategory filter */}
          {selectedCategory && (
            <SubcategoryFilter
              categoryId={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              onSelectSubcategory={setSelectedSubcategory}
            />
          )}
          
          {/* Price range filter */}
          <div>
            <h3 className="text-lg font-medium mb-3">Price Range</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="min-price" className="text-sm">Min ($)</Label>
                <Input
                  id="min-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="max-price" className="text-sm">Max ($)</Label>
                <Input
                  id="max-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                />
              </div>
            </div>
          </div>
          
          {/* Clear filters */}
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleClearFilters}
          >
            <X className="mr-2 h-4 w-4" /> Clear All Filters
          </Button>
        </div>
        
        {/* Products grid */}
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredProducts.length} products found
            </p>
          </div>
          
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">
                Try changing your filters or search term.
              </p>
              <Button variant="outline" onClick={handleClearFilters}>
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
