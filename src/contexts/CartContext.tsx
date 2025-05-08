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

  // Debug function to log current cart state
  const logCartState = (message: string) => {
    console.log(`[CART DEBUG] ${message}`);
    console.log('Unscanned items:', items.map(item => `${item.product.name} (ID: ${item.product.id})`));
    console.log('Scanned items:', scannedItems.map(item => `${item.product.name} (ID: ${item.product.id})`));
  };

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
        const unscannedItems = processedCart.filter((item: CartItem) => item.scanned === false);
        const newScannedItems = processedCart.filter((item: CartItem) => item.scanned === true);
        
        console.log(`[CART INIT] Loading from localStorage: ${unscannedItems.length} unscanned, ${newScannedItems.length} scanned items`);
        
        setItems(unscannedItems);
        setScannedItems(newScannedItems);
      } catch (error) {
        console.error("[CART ERROR] Failed to parse saved cart:", error);
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

        console.log('[CART SUPABASE] Loading shopping list for user:', userId);

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
          console.error('[CART ERROR] Error loading shopping list:', error);
          return;
        }

        console.log('[CART SUPABASE] Shopping list items loaded:', shoppingListItems);

        if (shoppingListItems && shoppingListItems.length > 0) {
          // Convert Supabase data to CartItem format
          const unscannedItems: CartItem[] = [];
          const scannedItemsList: CartItem[] = [];
          
          shoppingListItems.forEach(item => {
            // Map product from Supabase data format to our Product type
            const supabaseProduct = item.products;
            if (!supabaseProduct) {
              console.log(`[CART WARN] Skipping item with product_id ${item.product_id} - no product data found`);
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
              console.log(`[CART SUPABASE] Item ${product.name} (ID: ${item.id}) IS scanned, adding to scanned items list`);
              scannedItemsList.push(cartItem);
            } else {
              console.log(`[CART SUPABASE] Item ${product.name} (ID: ${item.id}) is NOT scanned, adding to unscanned items list`);
              unscannedItems.push(cartItem);
            }
          });

          console.log(`[CART SUPABASE] Loaded ${unscannedItems.length} unscanned items and ${scannedItemsList.length} scanned items`);

          // Update state with the new items using functional updates to guarantee latest state
          setItems(() => unscannedItems);
          setScannedItems(() => scannedItemsList);
          
          // Also update localStorage
          localStorage.setItem("cart", JSON.stringify([...unscannedItems, ...scannedItemsList]));
          logCartState("After loading from Supabase");
        } else {
          setItems([]);
          setScannedItems([]);
          localStorage.removeItem("cart");
          console.log('[CART SUPABASE] No items found in shopping list, cleared cart');
        }
      } catch (error) {
        console.error('[CART ERROR] Error in loadShoppingListFromSupabase:', error);
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

  // Update localStorage whenever cart changes - use a deep copy to avoid mutation issues
  useEffect(() => {
    const allItems = [...JSON.parse(JSON.stringify(items)), ...JSON.parse(JSON.stringify(scannedItems))];
    localStorage.setItem("cart", JSON.stringify(allItems));
    console.log(`[CART STATE] Updated localStorage with ${items.length} unscanned items and ${scannedItems.length} scanned items`);
  }, [items, scannedItems]);

  // Fixed addToCart function to correctly check for existing products and handle product IDs properly
  const addToCart = async (product: Product, quantity = 1) => {
    console.log("[CART ADD] Adding to cart:", { 
      id: product.id,
      name: product.name,
      barcodeId: product.barcodeId
    }, "quantity:", quantity);

    if (!product || !product.id) {
      console.error("[CART ERROR] Attempted to add invalid product:", product);
      toast({
        title: "Error",
        description: "Cannot add invalid product to cart",
        variant: "destructive",
      });
      return;
    }
    
    // Create a deep copy of the product to avoid mutation issues
    const productCopy = JSON.parse(JSON.stringify(product));
    
    // Check if the product is already in the cart (using exact ID match only)
    const existingItemById = items.find(item => item.product.id === product.id);
    
    if (existingItemById) {
      // Update quantity for existing item
      console.log("[CART UPDATE] Found existing item by ID, updating quantity");
      // Use functional update to ensure we're working with the latest state
      setItems(currentItems => 
        currentItems.map(item => {
          if (item.product.id === product.id) {
            return { ...item, quantity: item.quantity + quantity };
          }
          return item;
        })
      );
      
      toast({
        title: "Cart updated",
        description: `${product.name} quantity updated in cart`,
      });
    } 
    else {
      // Item doesn't exist, add it as new
      console.log("[CART ADD] Adding new item to cart:", product.name);
      const newItem = { 
        product: productCopy, 
        quantity,
        scanned: false // Explicitly set to false for new items
      };
      
      // Use functional update to ensure we're working with the latest state
      setItems(currentItems => {
        const updatedItems = [...currentItems, newItem];
        console.log("[CART STATE] New cart state:", updatedItems.map(i => `${i.product.name} (ID: ${i.product.id})`));
        return updatedItems;
      });
      
      toast({
        title: "Added to cart",
        description: `${product.name} added to your cart`,
      });
      
      // Sync with Supabase if authenticated
      if (isAuthenticated) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const userId = session?.user?.id;
          
          if (userId) {
            console.log(`[CART SUPABASE] User ${userId} is authenticated, checking if product ${product.id} exists in DB`);
            
            // First ensure we're working with a proper product ID for database queries
            let productIdForDb: number;
            
            try {
              // Try to directly use the product.id if it's a number already
              if (typeof product.id === 'number') {
                productIdForDb = product.id;
                console.log(`[CART SUPABASE] Product ID is already a number: ${productIdForDb}`);
              } else {
                // Convert string ID to number if possible
                productIdForDb = parseInt(product.id, 10);
                if (isNaN(productIdForDb)) {
                  throw new Error("Product ID is not a valid number");
                }
                console.log(`[CART SUPABASE] Converted product ID string to number: ${productIdForDb}`);
              }
            } catch (parseError) {
              console.error("[CART ERROR] Error parsing product ID:", parseError);
              
              // If we can't use the ID, look up the product by name as fallback
              console.log(`[CART SUPABASE] Will look up product "${product.name}" by name instead of ID`);
              productIdForDb = 0; // Initialize with invalid ID
            }
            
            // First try to find the product by ID in products table
            console.log(`[CART SUPABASE] Looking for product in database with ID: ${productIdForDb}`);
            let foundProduct = null;
            
            // Only attempt ID-based lookup if we have a valid ID
            if (productIdForDb && !isNaN(productIdForDb)) {
              const { data: productById, error: productIdError } = await supabase
                .from('products')
                .select('id, Product')
                .eq('id', productIdForDb)
                .maybeSingle();
              
              console.log('[CART SUPABASE] Product lookup by ID response:', { productById, productIdError });
              
              if (!productIdError && productById) {
                foundProduct = productById;
                console.log(`[CART SUPABASE] Found product by ID: ${foundProduct.id} - ${foundProduct.Product}`);
              }
            }
            
            // If no product found by ID, try by name with case-insensitive search
            if (!foundProduct) {
              console.log(`[CART SUPABASE] Product not found by ID, searching by name: "${product.name}"`);
              
              const { data: productsByName, error: nameSearchError } = await supabase
                .from('products')
                .select('id, Product')
                .ilike('Product', `%${product.name}%`);
              
              console.log('[CART SUPABASE] Product search by name results:', { 
                count: productsByName?.length || 0, 
                error: nameSearchError 
              });
              
              if (!nameSearchError && productsByName && productsByName.length > 0) {
                // Try to find exact match first (ignoring case)
                const exactMatch = productsByName.find(p => 
                  p.Product.toLowerCase() === product.name.toLowerCase()
                );
                
                if (exactMatch) {
                  foundProduct = exactMatch;
                  console.log(`[CART SUPABASE] Found exact name match: ${foundProduct.id} - ${foundProduct.Product}`);
                } else {
                  // Otherwise use the first partial match
                  foundProduct = productsByName[0];
                  console.log(`[CART SUPABASE] Using first partial match: ${foundProduct.id} - ${foundProduct.Product}`);
                }
              }
            }
            
            // Final check if we have found a valid product
            if (foundProduct) {
              const finalProductId = foundProduct.id;
              console.log(`[CART SUPABASE] Using final product ID for shopping list insert: ${finalProductId}`);
              
              // Check if the item is already in shopping list to avoid duplicates
              const { data: existingItems, error: listError } = await supabase
                .from('shopping_list')
                .select('*')
                .eq('shopper_id', userId)
                .eq('product_id', finalProductId);
              
              console.log('[CART SUPABASE] Shopping list check response:', { 
                count: existingItems?.length || 0, 
                error: listError 
              });
              
              if (listError) {
                console.error('[CART ERROR] Error checking shopping list:', listError);
                toast({
                  title: "Sync Error", 
                  description: `Error checking shopping list: ${listError.message}`,
                  variant: "destructive"
                });
                return;
              }
              
              if (!existingItems || existingItems.length === 0) {
                console.log(`[CART SUPABASE] Inserting product (ID: ${finalProductId}) into shopping_list`);
                // Insert the item into shopping_list
                const { data: insertData, error: insertError } = await supabase
                  .from('shopping_list')
                  .insert({
                    shopper_id: userId,
                    product_id: finalProductId,
                    scanned: false
                  })
                  .select();
                
                console.log('[CART SUPABASE] Insert operation result:', { 
                  insertData, 
                  error: insertError 
                });
                
                if (insertError) {
                  console.error('[CART ERROR] Error adding item to shopping list:', insertError);
                  toast({
                    title: "Sync Error",
                    description: `Could not sync ${product.name} with server: ${insertError.message}`,
                    variant: "destructive"
                  });
                } else {
                  toast({
                    title: "Synced",
                    description: `${product.name} added to your shopping list`,
                  });
                  // If DB insert succeeded, update local item with the shopping list ID
                  if (insertData && insertData.length > 0) {
                    const shoppingListId = insertData[0].id;
                    setItems(currentItems => 
                      currentItems.map(item => {
                        if (item.product.id === product.id) {
                          return { ...item, shoppingListId };
                        }
                        return item;
                      })
                    );
                  }
                }
              } else {
                console.log(`[CART SUPABASE] Product already exists in shopping list, not inserting again`);
                toast({
                  title: "Already in List",
                  description: `${product.name} is already in your shopping list`,
                  variant: "default"
                });
              }
            } else {
              console.log(`[CART WARN] Product "${product.name}" not found in products table`);
              toast({
                title: "Local Only",
                description: `${product.name} added locally only (not found in database)`,
              });
            }
          }
        } catch (error) {
          console.error('[CART ERROR] Error syncing with shopping list:', error);
          toast({
            title: "Sync Error",
            description: "Failed to sync with server. Item added locally only.",
            variant: "destructive"
          });
        }
      }
      
      // Log the final cart state after the operation
      setTimeout(() => logCartState("After adding item"), 100);
    }
  };

  const removeFromCart = async (productId: string) => {
    console.log(`[CART REMOVE] Removing product with ID ${productId}`);
    
    // Check which list the item is in
    const unscannedItem = items.find(item => item.product.id === productId);
    const scannedItem = scannedItems.find(item => item.product.id === productId);
    const itemToRemove = unscannedItem || scannedItem;
    
    // Remove from appropriate list using functional updates
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
          console.log(`[CART SUPABASE] Removing product ${productId} from shopping_list`);
          
          // Delete item from shopping_list in Supabase
          const { error } = await supabase
            .from('shopping_list')
            .delete()
            .eq('shopper_id', userId)
            .eq('product_id', Number(itemToRemove.product.id));
            
          if (error) {
            console.error('[CART ERROR] Error removing item from shopping list:', error);
          } else {
            console.log('[CART SUPABASE] Successfully removed item from shopping list');
          }
        }
      } catch (error) {
        console.error('[CART ERROR] Error syncing with shopping list:', error);
      }
    }
    
    // Log the final cart state after the operation
    setTimeout(() => logCartState("After removing item"), 100);
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    console.log(`[CART UPDATE] Updating quantity for product ${productId} to ${quantity}`);
    
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    // Check if the item is in unscanned or scanned items
    const unscannedIndex = items.findIndex(item => item.product.id === productId);
    const scannedIndex = scannedItems.findIndex(item => item.product.id === productId);
    
    if (unscannedIndex !== -1) {
      // Update quantity in unscanned items using functional update
      setItems(prev => prev.map((item, index) => 
        index === unscannedIndex ? { ...item, quantity } : item
      ));
    } else if (scannedIndex !== -1) {
      // Update quantity in scanned items using functional update
      setScannedItems(prev => prev.map((item, index) => 
        index === scannedIndex ? { ...item, quantity } : item
      ));
    }
    
    // Currently there's no quantity field in the shopping_list table,
    // so we just ensure the item exists in Supabase but don't update its quantity
    
    // Log the final cart state after the operation
    setTimeout(() => logCartState("After updating quantity"), 100);
  };

  const clearCart = async () => {
    // Clear local cart state
    setItems([]);
    setScannedItems([]);
    localStorage.removeItem("cart");
    
    console.log('[CART CLEAR] Cart cleared');
    
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
          console.log('[CART SUPABASE] Clearing all shopping list items');
          
          // Delete all items from shopping_list for this user in Supabase
          const { error } = await supabase
            .from('shopping_list')
            .delete()
            .eq('shopper_id', userId);
            
          if (error) {
            console.error('[CART ERROR] Error clearing shopping list:', error);
          } else {
            console.log('[CART SUPABASE] Shopping list successfully cleared');
          }
        }
      } catch (error) {
        console.error('[CART ERROR] Error syncing with shopping list:', error);
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
