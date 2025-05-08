
import { useCart } from "@/contexts/CartContext";
import { useEffect, useState } from "react";
import CartItemCard from "@/components/shop/CartItemCard";
import ScannedItemCard from "@/components/shop/ScannedItemCard"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, ShoppingCart, ListCheck, Receipt, Check, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import RecipeRecommendations from "@/components/shop/RecipeRecommendations";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CartPage = () => {
  const { items, scannedItems, totalItems, totalPrice, scannedTotalPrice, clearCart } = useCart();
  const { isAuthenticated } = useAuthStatus();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("checklist");
  
  // Debug state
  useEffect(() => {
    console.log("CartPage rendered with:", { 
      itemsCount: items.length, 
      scannedItemsCount: scannedItems.length,
      items,
      scannedItems
    });
  }, [items, scannedItems]);
  
  // Show proper tab based on what's available
  useEffect(() => {
    if (items.length === 0 && scannedItems.length > 0) {
      setActiveTab("scanned");
    }
  }, [items.length, scannedItems.length]);
  
  // Animation
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);
  
  const totalBill = scannedTotalPrice;
  const hasItems = items.length > 0 || scannedItems.length > 0;
  const hasScannedItems = scannedItems.length > 0;
  const hasUnscannedItems = items.length > 0;
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className={`transition-all duration-500 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <h1 className="text-3xl font-bold mb-4 gradient-text">Your Smart Shopping Experience</h1>
        
        {!isAuthenticated && (
          <Alert variant="warning" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You're not signed in. Cart items are saved locally but won't sync with smart cart scanning.
            </AlertDescription>
          </Alert>
        )}
        
        {hasItems ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="col-span-1 lg:col-span-2">
              <Tabs 
                defaultValue="checklist" 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="w-full mb-6">
                  <TabsTrigger 
                    value="checklist" 
                    className="flex-1 relative"
                  >
                    <ListCheck className="mr-2 h-5 w-5" /> 
                    Shopping Checklist
                    {hasUnscannedItems && (
                      <span className="ml-2 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                        {items.length}
                      </span>
                    )}
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="scanned" 
                    className="flex-1 relative"
                  >
                    <Check className="mr-2 h-5 w-5" /> 
                    In My Cart
                    {hasScannedItems && (
                      <span className="ml-2 bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-xs">
                        {scannedItems.length}
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="checklist" className="mt-0">
                  <div className="bg-white rounded-xl shadow-sm p-6 hover-lift">
                    <div className="mb-6 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                          <ListCheck className="h-5 w-5 text-primary" />
                        </div>
                        <h2 className="text-xl font-semibold">Items to Collect ({items.length})</h2>
                      </div>
                      {hasUnscannedItems && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={clearCart}
                          className="transition-all hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                        >
                          Clear List
                        </Button>
                      )}
                    </div>
                    
                    {hasUnscannedItems ? (
                      <div className="divide-y space-y-2">
                        {items.map((item, index) => (
                          <div 
                            key={`unscanned-${item.product.id}-${index}`} 
                            className="animate-slide-up" 
                            style={{ animationDelay: `${0.05 * index}s` }}
                          >
                            <CartItemCard item={item} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-10 text-center">
                        <div className="mb-4 text-muted-foreground">
                          <ShoppingCart className="mx-auto h-12 w-12 opacity-20" />
                        </div>
                        <p className="text-muted-foreground">
                          Your checklist is empty. Add items from the shop or check your scanned items.
                        </p>
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() => setActiveTab("scanned")}
                          disabled={!hasScannedItems}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          View Scanned Items
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="scanned" className="mt-0">
                  <div className="bg-white rounded-xl shadow-sm p-6 hover-lift">
                    <div className="mb-6 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center mr-3">
                          <Check className="h-5 w-5 text-green-500" />
                        </div>
                        <h2 className="text-xl font-semibold">Items in My Cart ({scannedItems.length})</h2>
                      </div>
                    </div>
                    
                    {hasScannedItems ? (
                      <div className="divide-y space-y-2">
                        {scannedItems.map((item, index) => (
                          <div 
                            key={`scanned-${item.product.id}-${index}`} 
                            className="animate-slide-up" 
                            style={{ animationDelay: `${0.05 * index}s` }}
                          >
                            <ScannedItemCard item={item} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-10 text-center">
                        <div className="mb-4 text-muted-foreground">
                          <ShoppingCart className="mx-auto h-12 w-12 opacity-20" />
                        </div>
                        <p className="text-muted-foreground">
                          No items have been scanned yet. Items will appear here when they're scanned at the store.
                        </p>
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() => setActiveTab("checklist")}
                          disabled={!hasUnscannedItems}
                        >
                          <ListCheck className="mr-2 h-4 w-4" />
                          View Checklist
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
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
                    <Table>
                      <TableBody>
                        {hasUnscannedItems && (
                          <>
                            <TableRow>
                              <TableCell className="font-medium">Checklist Items</TableCell>
                              <TableCell className="text-right">{items.length}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Checklist Subtotal</TableCell>
                              <TableCell className="text-right">{totalPrice.toFixed(2)} TND</TableCell>
                            </TableRow>
                          </>
                        )}
                        
                        {hasScannedItems && (
                          <>
                            <TableRow>
                              <TableCell className="font-medium">Scanned Items</TableCell>
                              <TableCell className="text-right">{scannedItems.length}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Cart Subtotal</TableCell>
                              <TableCell className="text-right">{scannedTotalPrice.toFixed(2)} TND</TableCell>
                            </TableRow>
                          </>
                        )}
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TableCell>Current Total</TableCell>
                          <TableCell className="text-right font-bold text-primary">
                            {scannedTotalPrice.toFixed(2)} TND
                          </TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
                    
                    {hasScannedItems && (
                      <div className="mt-4 p-3 bg-green-50 rounded-md">
                        <h4 className="font-medium text-green-700 flex items-center">
                          <Check className="mr-2 h-4 w-4" />
                          Real-time Scanning
                        </h4>
                        <p className="text-xs text-green-600 mt-1">
                          Items will automatically move from your checklist to cart as they're scanned in-store.
                        </p>
                      </div>
                    )}
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
              
              {hasUnscannedItems && (
                <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
                  <RecipeRecommendations cartItems={items} />
                </div>
              )}
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
