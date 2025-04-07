
import { useCart } from "@/contexts/CartContext";
import CartItemCard from "@/components/shop/CartItemCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, ShoppingCart, ListCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import RecipeRecommendations from "@/components/shop/RecipeRecommendations";

const CartPage = () => {
  const { items, totalItems, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Smart Shopping Checklist</h1>
      
      {items.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="col-span-1 lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center">
                  <ListCheck className="h-5 w-5 mr-2" />
                  <h2 className="text-xl font-semibold">Items in Cart ({totalItems})</h2>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clearCart}
                >
                  Clear List
                </Button>
              </div>
              
              <div className="divide-y">
                {items.map((item) => (
                  <CartItemCard key={item.product.id} item={item} />
                ))}
              </div>
            </div>
          </div>
          
          <div className="col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Cart Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{totalPrice.toFixed(2)} TND</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{totalPrice.toFixed(2)} TND</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  onClick={() => navigate("/shop")}
                >
                  <ShoppingBag size={16} className="mr-2" /> Continue Shopping
                </Button>
              </CardFooter>
            </Card>
            
            <RecipeRecommendations cartItems={items} />
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <div className="mx-auto w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
            <ShoppingCart size={32} className="text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Button 
            size="lg" 
            className="mx-auto"
            onClick={() => navigate("/shop")}
          >
            <ShoppingBag className="mr-2 h-5 w-5" />
            Continue Shopping
          </Button>
        </div>
      )}
    </div>
  );
};

export default CartPage;
