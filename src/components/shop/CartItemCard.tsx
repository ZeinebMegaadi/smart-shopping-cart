
import { Button } from "@/components/ui/button";
import { useCart, CartItem } from "@/contexts/CartContext";
import { Trash, Plus, Minus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface CartItemCardProps {
  item: CartItem;
}

const CartItemCard = ({ item }: CartItemCardProps) => {
  const { updateQuantity, removeFromCart } = useCart();
  const { product, quantity } = item;
  
  const handleIncrement = () => {
    if (quantity < product.quantityInStock) {
      updateQuantity(product.id, quantity + 1);
    }
  };
  
  const handleDecrement = () => {
    if (quantity > 1) {
      updateQuantity(product.id, quantity - 1);
    }
  };
  
  return (
    <div className="flex items-center border-b border-gray-200 py-4">
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
        <img
          src={product["image-url"] || product.image || '/placeholder.svg'}
          alt={product.name}
          className="h-full w-full object-cover object-center"
          onError={(e) => {
            // If image fails to load, replace with placeholder
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
      </div>
      
      <div className="ml-4 flex flex-1 flex-col">
        <div className="flex justify-between">
          <div>
            <h3 className="text-base font-medium">{product.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {product.category} / {product.subcategory}
            </p>
          </div>
          <p className="text-base font-medium">{product.price.toFixed(2)} TND</p>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center border rounded-md">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8" 
              onClick={handleDecrement}
              disabled={quantity <= 1}
            >
              <Minus size={16} />
            </Button>
            <span className="w-8 text-center">{quantity}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={handleIncrement}
              disabled={quantity >= product.quantityInStock}
            >
              <Plus size={16} />
            </Button>
          </div>
          
          <div className="flex items-center">
            <span className="mr-4 text-sm text-muted-foreground">
              {(product.price * quantity).toFixed(2)} TND
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-destructive"
              onClick={() => removeFromCart(product.id)}
            >
              <Trash size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CartItemSkeleton = () => (
  <div className="flex items-center border-b border-gray-200 py-4">
    <Skeleton className="h-20 w-20 rounded-md" />
    <div className="ml-4 flex flex-1 flex-col">
      <div className="flex justify-between">
        <div>
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="flex items-center justify-between mt-2">
        <Skeleton className="h-8 w-24 rounded-md" />
        <div className="flex items-center">
          <Skeleton className="h-4 w-16 mr-4" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  </div>
);

export default CartItemCard;
