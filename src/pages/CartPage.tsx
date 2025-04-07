
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import CartItemCard from "@/components/shop/CartItemCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, ShoppingCart } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const CartPage = () => {
  const { items, totalItems, totalPrice, clearCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  const handleCheckout = () => {
    if (!currentUser) {
      toast({
        title: "Sign in required",
        description: "Please sign in to complete your purchase",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    setIsCheckingOut(true);
    
    // Simulate checkout process
    setTimeout(() => {
      toast({
        title: "Order placed successfully!",
        description: "Thank you for your purchase",
      });
      clearCart();
      setIsCheckingOut(false);
      navigate("/");
    }, 2000);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Shopping Cart</h1>
      
      {items.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="col-span-1 lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Cart Items ({totalItems})</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clearCart}
                >
                  Clear Cart
                </Button>
              </div>
              
              <div className="divide-y">
                {items.map((item) => (
                  <CartItemCard key={item.product.id} item={item} />
                ))}
              </div>
            </div>
          </div>
          
          <div className="col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${(totalPrice * 0.07).toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${(totalPrice + totalPrice * 0.07).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? "Processing..." : "Proceed to Checkout"}
                </Button>
              </CardFooter>
            </Card>
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
