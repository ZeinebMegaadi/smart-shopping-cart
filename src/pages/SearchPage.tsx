
import { useState, useEffect } from "react";
import { products } from "@/services/mockData";
import ProductCard from "@/components/shop/ProductCard";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState(products);
  
  useEffect(() => {
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Search Products</h1>
      
      <div className="max-w-lg mx-auto mb-8">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for products..."
            className="pl-10 py-6 text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          {searchResults.length} products found
          {searchTerm && ` for "${searchTerm}"`}
        </p>
      </div>
      
      {searchResults.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {searchResults.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium mb-2">No products found</h2>
          <p className="text-muted-foreground">
            Try a different search term or browse our categories.
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
