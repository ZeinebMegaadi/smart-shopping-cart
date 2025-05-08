
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { Product } from "@/services/mockData";
import { Plus, Minus, ShoppingCart, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useToast } from "@/components/ui/use-toast";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [quantity, setQuantity] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuthStatus();
  const { toast } = useToast();
  
  const incrementQuantity = () => {
    if (quantity < product.quantityInStock) {
      setQuantity(quantity + 1);
    }
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const handleAddToCart = async () => {
    if (isAdding) return; // Prevent double-clicks
    
    setIsAdding(true);
    
    try {
      // Log product details before adding to cart to help debug
      console.log("Adding product to cart:", {
        id: product.id,
        name: product.name,
        barcodeId: product.barcodeId,
        numericId: typeof product.id === 'string' ? parseInt(product.id, 10) : product.id
      });
      
      // Pass the full product to addToCart
      await addToCart(product, quantity);
      setQuantity(1); // Reset quantity after adding
    } catch (error) {
      console.error("Error adding product to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add product to cart. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Add a small delay before resetting isAdding to prevent rapid clicking
      setTimeout(() => {
        setIsAdding(false);
      }, 500);
    }
  };
  
  // Use the image URL from the product object, falling back to placeholder
  const productImage = product["image-url"] || product.image || '/placeholder.svg';
  
  return (
    <div 
      className="product-card overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-square bg-muted relative overflow-hidden">
        <img 
          src={productImage} 
          alt={product.name}
          className="object-cover w-full h-full transition-all duration-500 group-hover:scale-110"
          onError={(e) => {
            // If image fails to load, replace with placeholder
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
        
        {/* Popular badge with animation */}
        {product.popular && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-secondary to-secondary/80 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1 animate-pulse-soft">
            <Sparkles size={12} />
            <span>Popular</span>
          </div>
        )}
        
        {/* Category icon */}
        <div className="absolute bottom-2 left-2 bg-black/30 backdrop-blur-sm text-white text-lg w-8 h-8 flex items-center justify-center rounded-full">
          {product.category === 'fruits' && '🍎'}
          {product.category === 'dairy' && '🥛'}
          {product.category === 'bakery' && '🍞'}
          {product.category === 'meat' && '🥩'}
          {product.category === 'pantry' && '🥫'}
          {product.category === 'frozen' && '❄️'}
          {product.category === 'beverages' && '🧃'}
          {product.category === 'snacks' && '🍬'}
          {product.category === 'breakfast' && '🥣'}
          {product.category === 'household' && '🧼'}
          {product.category === 'condiments' && '🛢️'}
        </div>
        
        {/* Shine effect on hover */}
        <div 
          className={`absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full transition-transform duration-700 ${isHovered ? 'translate-x-full' : '-translate-x-full'}`}
        ></div>
      </div>
      
      <div className="p-4">
        <div className="mb-1">
          <p className="text-xs text-muted-foreground">{product.category} / {product.subcategory}</p>
        </div>
        
        <h3 className="font-medium text-lg mb-1 group-hover:text-primary transition-colors">{product.name}</h3>
        
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
        
        <div className="flex items-center justify-between">
          <span className="font-semibold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{product.price.toFixed(2)} TND</span>
          <span className={`text-sm px-2 py-0.5 rounded-full ${product.quantityInStock > 50 ? 'bg-green-100 text-green-700' : product.quantityInStock > 20 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
            {product.quantityInStock} in stock
          </span>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center border rounded-full overflow-hidden bg-muted/50">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full text-primary" 
              onClick={decrementQuantity}
              disabled={quantity <= 1}
            >
              <Minus size={14} />
            </Button>
            <span className="w-8 text-center font-medium">{quantity}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full text-primary" 
              onClick={incrementQuantity}
              disabled={quantity >= product.quantityInStock}
            >
              <Plus size={14} />
            </Button>
          </div>
          
          <Button 
            size="sm" 
            className={`btn-hover rounded-full px-4 ${isAdding ? 'opacity-75' : ''}`}
            onClick={handleAddToCart}
            disabled={isAdding}
          >
            <ShoppingCart size={14} className={`mr-2 ${isAdding ? 'animate-pulse' : ''}`} /> 
            {isAdding ? 'Adding...' : 'Add'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
