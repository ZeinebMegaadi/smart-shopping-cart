
import { useCart } from "@/contexts/CartContext";
import { useEffect, useState } from "react";
import CartItemCard, { CartItemSkeleton } from "@/components/shop/CartItemCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, ShoppingCart, ListCheck, Receipt, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import RecipeRecommendations from "@/components/shop/RecipeRecommendations";
import { useAuthStatus } from "@/hooks/useAuthStatus";

const CartPage = () => {
  const { items, totalItems, totalPrice, clearCart, isLoading } = useCart();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const { isAuthenticated } = useAuthStatus();
  
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className={`transition-all duration-500 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold gradient-text">Your Smart Shopping Checklist</h1>
          {isAuthenticated && (
            <div className="text-sm text-muted-foreground flex items-center">
              <RefreshCw size={14} className="mr-1" /> 
              Real-time synced
            </div>
          )}
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="col-span-1 lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm p-6 hover-lift">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <ListCheck className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">Items in Cart</h2>
                  </div>
                </div>
                
                <div className="divide-y space-y-2">
                  {[1, 2, 3].map((_, index) => (
                    <CartItemSkeleton key={index} />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="col-span-1">
              <Card className="border-gradient hover-lift overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
                  <CardTitle className="flex items-center">
                    <Receipt className="mr-2 h-5 w-5" />
                    Your Cart Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">Loading...</span>
                    </div>
                    <div className="border-t pt-4 flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="text-lg text-primary">Loading...</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full btn-hover"
                    onClick={() => navigate("/shop")}
                    disabled
                  >
                    <ShoppingBag size={16} className="mr-2" /> Continue Shopping
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="col-span-1 lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm p-6 hover-lift">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <ListCheck className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">Items in Cart ({totalItems})</h2>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={clearCart}
                    className="transition-all hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                  >
                    Clear List
                  </Button>
                </div>
                
                <div className="divide-y space-y-2">
                  {items.map((item, index) => (
                    <div 
                      key={item.product.id} 
                      className="animate-slide-up" 
                      style={{ animationDelay: `${0.05 * index}s` }}
                    >
                      <CartItemCard item={item} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="col-span-1 space-y-6">
              <Card className="border-gradient hover-lift overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
                  <CardTitle className="flex items-center">
                    <Receipt className="mr-2 h-5 w-5" />
                    Your Cart Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">{totalPrice.toFixed(2)} TND</span>
                    </div>
                    <div className="border-t pt-4 flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="text-lg text-primary">{totalPrice.toFixed(2)} TND</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full btn-hover"
                    onClick={() => navigate("/shop")}
                  >
                    <ShoppingBag size={16} className="mr-2" /> Continue Shopping
                  </Button>
                </CardFooter>
              </Card>
              
              <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <RecipeRecommendations cartItems={items} />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm animate-fade-in">
            <div className="relative mx-auto">
              <div className="w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mb-6 mx-auto animate-pulse-soft">
                <ShoppingCart size={40} className="text-muted-foreground" />
              </div>
              <div className="absolute top-0 right-0 w-full h-full bg-primary/5 rounded-full animate-pulse-soft" style={{ animationDelay: "1s" }}></div>
            </div>
            <h2 className="text-3xl font-bold mb-3">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Looks like you haven't added any products to your cart yet.
            </p>
            <Button 
              size="lg" 
              className="mx-auto btn-hover shadow-md"
              onClick={() => navigate("/shop")}
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Start Shopping
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
