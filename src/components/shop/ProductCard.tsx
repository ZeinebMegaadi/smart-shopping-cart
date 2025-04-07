
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { Product } from "@/services/mockData";
import { Plus, Minus, ShoppingCart } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  
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
  
  const handleAddToCart = () => {
    addToCart(product, quantity);
    setQuantity(1);
  };
  
  return (
    <div className="product-card overflow-hidden">
      <div className="aspect-square bg-muted relative overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name}
          className="object-cover w-full h-full transition-all hover:scale-105"
        />
        {product.popular && (
          <div className="absolute top-2 right-2 bg-secondary text-white text-xs font-medium px-2 py-1 rounded-md">
            Popular
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="mb-1">
          <p className="text-xs text-muted-foreground">{product.category} / {product.subcategory}</p>
        </div>
        <h3 className="font-medium text-lg mb-1">{product.name}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="font-semibold">${product.price.toFixed(2)}</span>
          <span className="text-sm text-muted-foreground">{product.quantityInStock} in stock</span>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center border rounded-md">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={decrementQuantity}
              disabled={quantity <= 1}
            >
              <Minus size={16} />
            </Button>
            <span className="w-8 text-center">{quantity}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={incrementQuantity}
              disabled={quantity >= product.quantityInStock}
            >
              <Plus size={16} />
            </Button>
          </div>
          <Button 
            size="sm" 
            className="btn-hover"
            onClick={handleAddToCart}
          >
            <ShoppingCart size={16} className="mr-2" /> Add
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
