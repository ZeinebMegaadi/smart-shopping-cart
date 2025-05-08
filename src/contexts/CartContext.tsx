import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "../services/mockData";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStatus } from "@/hooks/useAuthStatus";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuthStatus();

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Failed to parse saved cart:", error);
        localStorage.removeItem("cart");
      }
    }
  }, []);

  // Update localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  // Set up real-time subscription to shopping_list table
  useEffect(() => {
    if (!isAuthenticated) return;

    // Fetch initial shopping list data from Supabase
    const fetchShoppingList = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        
        if (!userId) {
          setIsLoading(false);
          return;
        }

        // Get all items from user's shopping list
        const { data: shoppingListItems, error } = await supabase
          .from('shopping_list')
          .select(`
            id, 
            scanned,
            product_id,
            products (*)
          `)
          .eq('shopper_id', userId);

        if (error) {
          console.error('Error fetching shopping list:', error);
          toast({
            title: "Failed to load shopping list",
            description: error.message,
            variant: "destructive"
          });
          return;
        }

        if (shoppingListItems && shoppingListItems.length > 0) {
          // Map shopping list items to cart items format
          const cartItems: CartItem[] = shoppingListItems.map(item => {
            // Find the corresponding product from mock data using barcode ID
            const matchingProduct = item.products;
            if (matchingProduct) {
              return {
                product: {
                  id: String(matchingProduct.Barcode_ID) || "unknown",
                  barcodeId: String(matchingProduct.Barcode_ID),
                  name: matchingProduct.Product,
                  price: matchingProduct.Price,
                  description: `${matchingProduct.Category} - ${matchingProduct.Subcategory}`,
                  category: matchingProduct.Category,
                  subcategory: matchingProduct.Subcategory,
                  quantityInStock: matchingProduct.Stock,
                  aisle: matchingProduct.Aisle,
                  "image-url": matchingProduct["image-url"]
                },
                quantity: 1 // Default quantity, can be adjusted later
              };
            }
            return null;
          }).filter(Boolean) as CartItem[];
          
          // Merge with local cart items, keeping local quantities if available
          const mergedItems = [...items];
          
          cartItems.forEach(serverItem => {
            const existingItemIndex = mergedItems.findIndex(item => 
              item.product.id === serverItem.product.id
            );
            
            if (existingItemIndex >= 0) {
              // Keep local quantity
            } else {
              mergedItems.push(serverItem);
            }
          });
          
          setItems(mergedItems);
        }
      } catch (error) {
        console.error('Error in fetchShoppingList:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShoppingList();

    // Set up real-time subscription
    const channel = supabase
      .channel('shopping_list_changes')
      .on('postgres_changes', 
        {
          event: '*', 
          schema: 'public',
          table: 'shopping_list',
          filter: `shopper_id=eq.${supabase.auth.getSession().then(res => res.data.session?.user?.id)}`
        }, 
        async (payload) => {
          console.log('Real-time update received:', payload);
          
          // Handle different types of events
          if (payload.eventType === 'INSERT') {
            // A new item was added to the shopping list
            try {
              const productId = payload.new.product_id;
              
              // Fetch the full product details
              const { data: productData, error: productError } = await supabase
                .from('products')
                .select('*')
                .eq('Barcode_ID', productId)
                .single();
              
              if (productError || !productData) {
                console.error('Error fetching product:', productError);
                return;
              }
              
              // Check if this product is already in the cart
              const existingItemIndex = items.findIndex(item => 
                item.product.id === String(productData.Barcode_ID)
              );
              
              if (existingItemIndex >= 0) {
                // Product already in cart, update quantity
                setItems(prevItems => {
                  const updatedItems = [...prevItems];
                  updatedItems[existingItemIndex].quantity += 1;
                  return updatedItems;
                });
              } else {
                // Add new product to cart
                const newProduct: Product = {
                  id: String(productData.Barcode_ID),
                  barcodeId: String(productData.Barcode_ID),
                  name: productData.Product,
                  price: productData.Price,
                  description: `${productData.Category} - ${productData.Subcategory}`,
                  category: productData.Category,
                  subcategory: productData.Subcategory,
                  quantityInStock: productData.Stock,
                  aisle: productData.Aisle,
                  "image-url": productData["image-url"]
                };
                
                setItems(prevItems => [...prevItems, { product: newProduct, quantity: 1 }]);
              }
            } catch (error) {
              console.error('Error handling INSERT event:', error);
            }
          } else if (payload.eventType === 'DELETE') {
            // An item was removed from the shopping list
            setItems(prevItems => 
              prevItems.filter(item => item.product.barcodeId !== String(payload.old.product_id))
            );
          }
        }
      )
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to shopping list changes!');
        } else {
          console.log('Subscription status:', status);
        }
      });

    return () => {
      // Clean up subscription when component unmounts or auth status changes
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, toast]);

  const addToCart = async (product: Product, quantity = 1) => {
    setItems((prevItems) => {
      // Check if the item is already in the cart
      const existingItemIndex = prevItems.findIndex(
        (item) => item.product.id === product.id
      );

      if (existingItemIndex >= 0) {
        // Item exists, update quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        
        toast({
          title: "Cart updated",
          description: `${product.name} quantity updated in cart`,
        });
        
        return updatedItems;
      } else {
        // Item doesn't exist, add it
        toast({
          title: "Added to cart",
          description: `${product.name} added to your cart`,
        });
        
        return [...prevItems, { product, quantity }];
      }
    });
    
    // Sync with Supabase shopping list for logged-in shoppers
    if (isAuthenticated) {
      try {
        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        
        if (userId) {
          // Check if the product is already in the user's shopping list
          const { data: existingItems } = await supabase
            .from('shopping_list')
            .select('*')
            .eq('shopper_id', userId)
            .eq('product_id', Number(product.barcodeId));
          
          if (!existingItems || existingItems.length === 0) {
            // Add to shopping list if not already there
            const { error } = await supabase
              .from('shopping_list')
              .insert({
                shopper_id: userId,
                product_id: Number(product.barcodeId),
                scanned: false
              });
            
            if (error) {
              console.error('Error adding item to shopping list:', error);
            } else {
              console.log('Item successfully added to shopping list in Supabase');
            }
          }
        }
      } catch (error) {
        console.error('Error syncing with shopping list:', error);
      }
    }
  };

  const removeFromCart = async (productId: string) => {
    const itemToRemove = items.find((item) => item.product.id === productId);
    
    // First, remove from Supabase if user is authenticated
    if (isAuthenticated && itemToRemove) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        
        if (userId) {
          // Delete item from shopping_list in Supabase
          const { error } = await supabase
            .from('shopping_list')
            .delete()
            .eq('shopper_id', userId)
            .eq('product_id', Number(itemToRemove.product.barcodeId));
            
          if (error) {
            console.error('Error removing item from shopping list:', error);
          } else {
            console.log('Item successfully removed from shopping list in Supabase');
          }
        }
      } catch (error) {
        console.error('Error syncing with shopping list:', error);
      }
    }
    
    // Then, remove from local cart
    setItems((prevItems) => {
      if (itemToRemove) {
        toast({
          title: "Removed from cart",
          description: `${itemToRemove.product.name} removed from your cart`,
        });
      }
      
      return prevItems.filter((item) => item.product.id !== productId);
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = async () => {
    // Clear from Supabase if user is authenticated
    if (isAuthenticated) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        
        if (userId) {
          // Delete all items from shopping_list for this user in Supabase
          const { error } = await supabase
            .from('shopping_list')
            .delete()
            .eq('shopper_id', userId);
            
          if (error) {
            console.error('Error clearing shopping list:', error);
          } else {
            console.log('Shopping list successfully cleared in Supabase');
          }
        }
      } catch (error) {
        console.error('Error syncing with shopping list:', error);
      }
    }
    
    setItems([]);
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart",
    });
  };

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  
  const totalPrice = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    isLoading,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
