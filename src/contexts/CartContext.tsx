
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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
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

  // Load cart from Supabase when user is authenticated
  useEffect(() => {
    const loadShoppingListFromSupabase = async () => {
      if (!isAuthenticated) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;

        if (!userId) return;

        // Load shopping list from Supabase
        const { data: shoppingListItems, error } = await supabase
          .from('shopping_list')
          .select(`
            id,
            product_id,
            scanned,
            products:product_id (
              id,
              "Product", 
              "Price",
              "Stock",
              "Category",
              "Subcategory",
              "Aisle",
              image_url
            )
          `)
          .eq('shopper_id', userId);

        if (error) {
          console.error('Error loading shopping list:', error);
          return;
        }

        if (shoppingListItems && shoppingListItems.length > 0) {
          // Convert Supabase data to CartItem format
          const cartItems: CartItem[] = shoppingListItems.map(item => {
            // Map product from Supabase data format to our Product type
            const supabaseProduct = item.products;
            if (!supabaseProduct) return null;

            const product: Product = {
              id: String(supabaseProduct.id),
              barcodeId: String(supabaseProduct.id),
              name: supabaseProduct["Product"],
              price: supabaseProduct["Price"],
              quantityInStock: supabaseProduct["Stock"],
              category: supabaseProduct["Category"],
              subcategory: supabaseProduct["Subcategory"],
              aisle: supabaseProduct["Aisle"] || "Unknown", // Add default value for aisle
              description: `Product from ${supabaseProduct["Category"]} category`,
              image: supabaseProduct.image_url || '/placeholder.svg',
              "image-url": supabaseProduct.image_url || null,
              popular: false
            };

            return {
              product,
              quantity: 1 // Default quantity
            };
          }).filter(Boolean) as CartItem[];

          // Merge with local cart, prioritizing Supabase items
          const localItems = [...items];
          const mergedItems: CartItem[] = [...cartItems];

          // Add local items not in Supabase
          localItems.forEach(localItem => {
            const exists = cartItems.some(item => item.product.id === localItem.product.id);
            if (!exists) {
              mergedItems.push(localItem);
            }
          });

          setItems(mergedItems);
          localStorage.setItem("cart", JSON.stringify(mergedItems));
        }
      } catch (error) {
        console.error('Error in loadShoppingListFromSupabase:', error);
      }
    };

    loadShoppingListFromSupabase();
  }, [isAuthenticated]);

  // Set up real-time subscription for shopping list changes
  useEffect(() => {
    if (!isAuthenticated) return;

    const setupRealtimeSubscription = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        
        if (!userId) return;

        // Create a channel specifically for this user's shopping list
        const shoppingListChannel = supabase
          .channel(`shopping-list-${userId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'shopping_list',
              filter: `shopper_id=eq.${userId}`
            },
            async (payload) => {
              console.log('Real-time shopping list update:', payload);

              // Refresh the entire shopping list on any change
              // This ensures we have the most up-to-date data
              loadShoppingListFromSupabase();
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(shoppingListChannel);
        };
      } catch (error) {
        console.error('Error setting up real-time subscription:', error);
      }
    };

    // Helper function to load shopping list data
    const loadShoppingListFromSupabase = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;

        if (!userId) return;

        const { data: shoppingListItems, error } = await supabase
          .from('shopping_list')
          .select(`
            id,
            product_id,
            scanned,
            products:product_id (
              id,
              "Product", 
              "Price",
              "Stock",
              "Category",
              "Subcategory",
              "Aisle",
              image_url
            )
          `)
          .eq('shopper_id', userId);

        if (error) {
          console.error('Error refreshing shopping list:', error);
          return;
        }

        if (shoppingListItems && shoppingListItems.length > 0) {
          const cartItems: CartItem[] = shoppingListItems
            .map(item => {
              const supabaseProduct = item.products;
              if (!supabaseProduct) return null;

              const product: Product = {
                id: String(supabaseProduct.id),
                barcodeId: String(supabaseProduct.id),
                name: supabaseProduct["Product"],
                price: supabaseProduct["Price"],
                quantityInStock: supabaseProduct["Stock"],
                category: supabaseProduct["Category"],
                subcategory: supabaseProduct["Subcategory"],
                aisle: supabaseProduct["Aisle"] || "Unknown", // Add default value for aisle
                description: `Product from ${supabaseProduct["Category"]} category`,
                image: supabaseProduct.image_url || '/placeholder.svg',
                "image-url": supabaseProduct.image_url || null,
                popular: false
              };

              return {
                product,
                quantity: 1
              };
            })
            .filter(Boolean) as CartItem[];

          setItems(cartItems);
          localStorage.setItem("cart", JSON.stringify(cartItems));
        } else {
          // If shopping list is empty, clear local cart
          setItems([]);
          localStorage.removeItem("cart");
        }
      } catch (error) {
        console.error('Error in loadShoppingListFromSupabase:', error);
      }
    };

    const subscription = setupRealtimeSubscription();
    
    return () => {
      if (subscription) {
        subscription.then(unsub => {
          if (unsub) unsub();
        });
      }
    };
  }, [isAuthenticated]);

  // Update localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addToCart = async (product: Product, quantity = 1) => {
    // Check if the item is already in the cart
    const existingItemIndex = items.findIndex(
      (item) => item.product.id === product.id
    );

    let updatedItems = [...items];

    // Update local state first for immediate UI feedback
    if (existingItemIndex >= 0) {
      // Item exists, update quantity
      updatedItems[existingItemIndex].quantity += quantity;
      setItems(updatedItems);
      
      toast({
        title: "Cart updated",
        description: `${product.name} quantity updated in cart`,
      });
    } else {
      // Item doesn't exist, add it
      updatedItems = [...items, { product, quantity }];
      setItems(updatedItems);
      
      toast({
        title: "Added to cart",
        description: `${product.name} added to your cart`,
      });
    }
    
    // Sync with Supabase if the user is authenticated
    if (isAuthenticated) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        
        if (userId) {
          // Check if the product is already in the shopping list
          const { data: existingItems } = await supabase
            .from('shopping_list')
            .select('*')
            .eq('shopper_id', userId)
            .eq('product_id', Number(product.barcodeId));
          
          if (!existingItems || existingItems.length === 0) {
            // Verify that product exists in products table first
            const { data: productExists } = await supabase
              .from('products')
              .select('id')
              .eq('id', Number(product.barcodeId))
              .single();
            
            if (productExists) {
              // Add to shopping list if not already there and product exists
              const { error } = await supabase
                .from('shopping_list')
                .insert({
                  shopper_id: userId,
                  product_id: Number(product.barcodeId),
                  scanned: false
                });
              
              if (error) {
                console.error('Error adding item to shopping list:', error);
                toast({
                  title: "Sync Error",
                  description: `Could not sync ${product.name} with server: ${error.message}`,
                  variant: "destructive"
                });
              }
            } else {
              console.error(`Product ${product.name} (ID: ${product.barcodeId}) does not exist in products table`);
              toast({
                title: "Product Error",
                description: `This product doesn't exist in our database. It's available locally only.`,
                variant: "destructive"
              });
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
    
    // Update local state first for immediate UI feedback
    setItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
    
    if (itemToRemove) {
      toast({
        title: "Removed from cart",
        description: `${itemToRemove.product.name} removed from your cart`,
      });
    }
    
    // Sync with Supabase if the user is authenticated
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
          }
        }
      } catch (error) {
        console.error('Error syncing with shopping list:', error);
      }
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
    
    // Currently there's no quantity field in the shopping_list table,
    // so we just ensure the item exists in Supabase but don't update its quantity
  };

  const clearCart = async () => {
    // Clear local cart state
    setItems([]);
    localStorage.removeItem("cart");
    
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart",
    });
    
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
          }
        }
      } catch (error) {
        console.error('Error syncing with shopping list:', error);
      }
    }
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
