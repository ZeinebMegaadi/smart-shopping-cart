
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

  // Update localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, quantity = 1) => {
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
