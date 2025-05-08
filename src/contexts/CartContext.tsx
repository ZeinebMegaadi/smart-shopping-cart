
import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "../services/mockData";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStatus } from "@/hooks/useAuthStatus";

export interface CartItem {
  product: Product;
  quantity: number;
  scanned: boolean;
  shoppingListId?: string; // Track the database ID
}

interface CartContextType {
  items: CartItem[];
  scannedItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  scannedTotalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [scannedItems, setScannedItems] = useState<CartItem[]>([]);
  const { toast } = useToast();
  const { isAuthenticated } = useAuthStatus();

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        // Ensure scanned is explicitly a boolean to avoid type issues
        const processedCart = parsedCart.map((item: CartItem) => ({
          ...item,
          scanned: item.scanned === true
        }));
        
        // Split items based on scanned flag
        setItems(processedCart.filter((item: CartItem) => item.scanned === false));
        setScannedItems(processedCart.filter((item: CartItem) => item.scanned === true));
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

        console.log('Loading shopping list for user:', userId);

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

        console.log('Shopping list items loaded:', shoppingListItems);

        if (shoppingListItems && shoppingListItems.length > 0) {
          // Convert Supabase data to CartItem format
          const unscannedItems: CartItem[] = [];
          const scannedItemsList: CartItem[] = [];
          
          shoppingListItems.forEach(item => {
            // Map product from Supabase data format to our Product type
            const supabaseProduct = item.products;
            if (!supabaseProduct) {
              console.log(`Skipping item with product_id ${item.product_id} - no product data found`);
              return;
            }

            const product: Product = {
              id: String(supabaseProduct.id),
              barcodeId: String(supabaseProduct.id),
              name: supabaseProduct["Product"],
              price: supabaseProduct["Price"],
              quantityInStock: supabaseProduct["Stock"],
              category: supabaseProduct["Category"],
              subcategory: supabaseProduct["Subcategory"],
              aisle: supabaseProduct["Aisle"] || "Unknown",
              description: `Product from ${supabaseProduct["Category"]} category`,
              image: supabaseProduct.image_url || '/placeholder.svg',
              "image-url": supabaseProduct.image_url || null,
              popular: false
            };

            // Explicitly cast scanned to boolean to ensure consistent type
            const isScanned = item.scanned === true;
            
            const cartItem: CartItem = {
              product,
              quantity: 1,
              scanned: isScanned,
              shoppingListId: item.id
            };

            // Split items based on scanned status
            if (isScanned) {
              console.log(`Item ${product.name} (ID: ${item.id}) IS scanned, adding to scanned items list`);
              scannedItemsList.push(cartItem);
            } else {
              console.log(`Item ${product.name} (ID: ${item.id}) is NOT scanned, adding to unscanned items list`);
              unscannedItems.push(cartItem);
            }
          });

          console.log(`Loaded ${unscannedItems.length} unscanned items and ${scannedItemsList.length} scanned items`);

          // Update state with the new items
          setItems(unscannedItems);
          setScannedItems(scannedItemsList);

          // Also update localStorage
          localStorage.setItem("cart", JSON.stringify([...unscannedItems, ...scannedItemsList]));
        } else {
          setItems([]);
          setScannedItems([]);
          localStorage.removeItem("cart");
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

        console.log('Setting up real-time subscription for shopping list changes...');
        
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
              console.log('Real-time shopping list update received:', payload);

              // Handle different types of events
              if (payload.eventType === 'UPDATE') {
                const updatedItem = payload.new as any;
                console.log('Updated item details:', updatedItem);
                
                // Check if scanned status changed
                const wasScanned = payload.old && (payload.old as any).scanned === true;
                const isNowScanned = updatedItem.scanned === true;
                
                console.log(`Item scanned status changed: was ${wasScanned}, is now ${isNowScanned}`);
                
                // If an item was newly scanned (changed from false to true)
                if (!wasScanned && isNowScanned) {
                  console.log('Item newly scanned, moving from unscanned to scanned list');
                  
                  // Find and remove from unscanned items
                  const matchingItem = items.find(item => 
                    item.shoppingListId === updatedItem.id || 
                    item.product.id === String(updatedItem.product_id)
                  );
                  
                  if (matchingItem) {
                    console.log('Found matching unscanned item to move:', matchingItem);
                    
                    // Remove from unscanned items
                    setItems(prev => prev.filter(item => 
                      !(item.shoppingListId === updatedItem.id || 
                        (!item.shoppingListId && item.product.id === String(updatedItem.product_id)))
                    ));
                    
                    // Add to scanned items
                    const scannedItem = {
                      ...matchingItem,
                      scanned: true,
                      shoppingListId: updatedItem.id
                    };
                    
                    setScannedItems(prev => [...prev, scannedItem]);
                    
                    toast({
                      title: "Item scanned",
                      description: `${matchingItem.product.name} has been scanned and added to your cart`,
                    });
                  } else {
                    // If we don't find the item in our local state, fetch it from Supabase
                    console.log('Item not found in unscanned list, fetching from database');
                    
                    const { data: productData } = await supabase
                      .from('products')
                      .select('*')
                      .eq('id', updatedItem.product_id)
                      .single();
                      
                    if (productData) {
                      const product: Product = {
                        id: String(productData.id),
                        barcodeId: String(productData.id),
                        name: productData["Product"],
                        price: productData["Price"],
                        quantityInStock: productData["Stock"],
                        category: productData["Category"],
                        subcategory: productData["Subcategory"],
                        aisle: productData["Aisle"] || "Unknown",
                        description: `Product from ${productData["Category"]} category`,
                        image: productData.image_url || '/placeholder.svg',
                        "image-url": productData.image_url || null,
                        popular: false
                      };
                      
                      const scannedItem: CartItem = {
                        product,
                        quantity: 1,
                        scanned: true,
                        shoppingListId: updatedItem.id
                      };
                      
                      setScannedItems(prev => [...prev, scannedItem]);
                      
                      toast({
                        title: "New item scanned",
                        description: `${product.name} has been scanned and added to your cart`,
                      });
                    }
                  }
                } 
                // If item was unscanned (changed from true to false)
                else if (wasScanned && !isNowScanned) {
                  console.log('Item was unscanned, moving from scanned to unscanned list');
                  
                  // Find and remove from scanned items
                  const matchingItem = scannedItems.find(item => 
                    item.shoppingListId === updatedItem.id || 
                    item.product.id === String(updatedItem.product_id)
                  );
                  
                  if (matchingItem) {
                    // Remove from scanned items
                    setScannedItems(prev => prev.filter(item => 
                      !(item.shoppingListId === updatedItem.id || 
                        (!item.shoppingListId && item.product.id === String(updatedItem.product_id)))
                    ));
                    
                    // Add to unscanned items
                    const unscannedItem = {
                      ...matchingItem,
                      scanned: false,
                      shoppingListId: updatedItem.id
                    };
                    
                    setItems(prev => [...prev, unscannedItem]);
                  }
                }
                
                // Full refresh to ensure consistent state
                refreshShoppingList();
              } 
              // Handle DELETE event
              else if (payload.eventType === 'DELETE') {
                const deletedItem = payload.old as any;
                const isScanned = deletedItem.scanned === true;
                
                console.log(`Item deleted: ${deletedItem.id}, was scanned: ${isScanned}`);
                
                // Remove from appropriate list
                if (isScanned) {
                  setScannedItems(prev => prev.filter(item => item.shoppingListId !== deletedItem.id));
                } else {
                  setItems(prev => prev.filter(item => item.shoppingListId !== deletedItem.id));
                }
              } 
              // Handle INSERT event
              else if (payload.eventType === 'INSERT') {
                const newItem = payload.new as any;
                const isScanned = newItem.scanned === true;
                
                console.log(`New item added: ${newItem.id}, scanned: ${isScanned}`);
                
                // Fetch full product details
                const { data: productData } = await supabase
                  .from('products')
                  .select('*')
                  .eq('id', newItem.product_id)
                  .single();
                  
                if (productData) {
                  const product: Product = {
                    id: String(productData.id),
                    barcodeId: String(productData.id),
                    name: productData["Product"],
                    price: productData["Price"],
                    quantityInStock: productData["Stock"],
                    category: productData["Category"],
                    subcategory: productData["Subcategory"],
                    aisle: productData["Aisle"] || "Unknown",
                    description: `Product from ${productData["Category"]} category`,
                    image: productData.image_url || '/placeholder.svg',
                    "image-url": productData.image_url || null,
                    popular: false
                  };
                  
                  const cartItem: CartItem = {
                    product,
                    quantity: 1,
                    scanned: isScanned,
                    shoppingListId: newItem.id
                  };
                  
                  // Add to appropriate list
                  if (isScanned) {
                    setScannedItems(prev => [...prev, cartItem]);
                    console.log(`Added new scanned item: ${product.name}`);
                  } else {
                    setItems(prev => [...prev, cartItem]);
                    console.log(`Added new unscanned item: ${product.name}`);
                  }
                }
              }
            }
          )
          .subscribe();

        console.log('Realtime subscription set up successfully');
        
        return () => {
          console.log('Cleaning up realtime subscription');
          supabase.removeChannel(shoppingListChannel);
        };
      } catch (error) {
        console.error('Error setting up real-time subscription:', error);
      }
    };

    // Helper function to refresh shopping list data
    const refreshShoppingList = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;

        if (!userId) return;

        console.log('Refreshing shopping list data from Supabase...');
        
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
          console.log('Refreshed shopping list items:', shoppingListItems);
          
          // Split items based on scanned status
          const unscannedItems: CartItem[] = [];
          const newScannedItems: CartItem[] = [];
          
          shoppingListItems.forEach(item => {
            const supabaseProduct = item.products;
            if (!supabaseProduct) return;

            const product: Product = {
              id: String(supabaseProduct.id),
              barcodeId: String(supabaseProduct.id),
              name: supabaseProduct["Product"],
              price: supabaseProduct["Price"],
              quantityInStock: supabaseProduct["Stock"],
              category: supabaseProduct["Category"],
              subcategory: supabaseProduct["Subcategory"],
              aisle: supabaseProduct["Aisle"] || "Unknown",
              description: `Product from ${supabaseProduct["Category"]} category`,
              image: supabaseProduct.image_url || '/placeholder.svg',
              "image-url": supabaseProduct.image_url || null,
              popular: false
            };

            // Explicitly cast to boolean
            const isScanned = item.scanned === true;
            
            const cartItem: CartItem = {
              product,
              quantity: 1,
              scanned: isScanned,
              shoppingListId: item.id
            };

            if (isScanned) {
              newScannedItems.push(cartItem);
              console.log(`Item ${product.name} (ID: ${item.id}) IS scanned`);
            } else {
              unscannedItems.push(cartItem);
              console.log(`Item ${product.name} (ID: ${item.id}) is NOT scanned`);
            }
          });

          console.log(`Refreshed: ${unscannedItems.length} unscanned, ${newScannedItems.length} scanned items`);

          // Update state with refreshed data
          setItems(unscannedItems);
          setScannedItems(newScannedItems);
          
          // Update localStorage with all items
          localStorage.setItem("cart", JSON.stringify([...unscannedItems, ...newScannedItems]));
        } else {
          // If shopping list is empty, clear local cart
          setItems([]);
          setScannedItems([]);
          localStorage.removeItem("cart");
        }
      } catch (error) {
        console.error('Error in refreshShoppingList:', error);
      }
    };

    // Set up subscription and do initial refresh
    const subscription = setupRealtimeSubscription();
    refreshShoppingList();
    
    return () => {
      if (subscription) {
        subscription.then(unsub => {
          if (unsub) unsub();
        });
      }
    };
  }, [isAuthenticated, toast]);

  // Update localStorage whenever cart changes
  useEffect(() => {
    const allItems = [...items, ...scannedItems];
    localStorage.setItem("cart", JSON.stringify(allItems));
  }, [items, scannedItems]);

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
      updatedItems = [...items, { 
        product, 
        quantity,
        scanned: false // Explicitly set to false for new items
      }];
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
            .eq('product_id', Number(product.id)); // Use product.id directly instead of barcodeId
          
          if (!existingItems || existingItems.length === 0) {
            // Important fix: First check if product exists using its ID directly
            const { data: productExists } = await supabase
              .from('products')
              .select('id')
              .eq('id', Number(product.id)) // Use ID directly for consistency
              .single();
            
            if (productExists) {
              // Add to shopping list if not already there and product exists
              const { error } = await supabase
                .from('shopping_list')
                .insert({
                  shopper_id: userId,
                  product_id: Number(product.id), // Use product.id consistently 
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
              // If the product doesn't exist in the database with the ID,
              // try with barcodeId as a fallback (for legacy reasons)
              const { data: productByBarcode } = await supabase
                .from('products')
                .select('id')
                .eq('id', Number(product.barcodeId));
                
              if (productByBarcode && productByBarcode.length > 0) {
                // Product exists with barcodeId
                const { error } = await supabase
                  .from('shopping_list')
                  .insert({
                    shopper_id: userId,
                    product_id: Number(product.barcodeId),
                    scanned: false
                  });
                
                if (error) {
                  console.error('Error adding item to shopping list (barcode fallback):', error);
                  toast({
                    title: "Sync Error",
                    description: `Could not sync ${product.name} with server: ${error.message}`,
                    variant: "destructive"
                  });
                }
              } else {
                console.error(`Product ${product.name} (ID: ${product.id}, BarcodeID: ${product.barcodeId}) does not exist in products table`);
                toast({
                  title: "Product Error",
                  description: `This product doesn't exist in our database. It's available locally only.`,
                  variant: "destructive"
                });
                
                // Log the product details for debugging
                console.log('Problem product details:', product);
                
                // Let's try to get more information about what's in the database
                const { data: allProducts, error: productsError } = await supabase
                  .from('products')
                  .select('id, Product')
                  .eq('Product', product.name);
                
                if (productsError) {
                  console.error('Error fetching products by name:', productsError);
                } else if (allProducts && allProducts.length > 0) {
                  console.log('Found products with the same name:', allProducts);
                } else {
                  console.log('No products found with name:', product.name);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Error syncing with shopping list:', error);
      }
    }
  };

  const removeFromCart = async (productId: string) => {
    // Check which list the item is in
    const unscannedItem = items.find(item => item.product.id === productId);
    const scannedItem = scannedItems.find(item => item.product.id === productId);
    const itemToRemove = unscannedItem || scannedItem;
    
    // Remove from appropriate list
    if (unscannedItem) {
      setItems(prev => prev.filter(item => item.product.id !== productId));
    }
    
    if (scannedItem) {
      setScannedItems(prev => prev.filter(item => item.product.id !== productId));
    }
    
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
            .eq('product_id', Number(itemToRemove.product.id));
            
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

    // Check if the item is in unscanned or scanned items
    const unscannedIndex = items.findIndex(item => item.product.id === productId);
    const scannedIndex = scannedItems.findIndex(item => item.product.id === productId);
    
    if (unscannedIndex !== -1) {
      // Update quantity in unscanned items
      setItems(prev => prev.map((item, index) => 
        index === unscannedIndex ? { ...item, quantity } : item
      ));
    } else if (scannedIndex !== -1) {
      // Update quantity in scanned items
      setScannedItems(prev => prev.map((item, index) => 
        index === scannedIndex ? { ...item, quantity } : item
      ));
    }
    
    // Currently there's no quantity field in the shopping_list table,
    // so we just ensure the item exists in Supabase but don't update its quantity
  };

  const clearCart = async () => {
    // Clear local cart state
    setItems([]);
    setScannedItems([]);
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

  const totalItems = items.reduce((total, item) => total + item.quantity, 0) + 
                    scannedItems.reduce((total, item) => total + item.quantity, 0);
  
  const totalPrice = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const scannedTotalPrice = scannedItems.reduce(
    (total, item) => total + item.product.price * item.quantity, 
    0
  );

  const value = {
    items,
    scannedItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    scannedTotalPrice,
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
