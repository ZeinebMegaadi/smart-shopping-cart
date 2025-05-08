
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ShoppingItem {
  id: string;
  scanned: boolean;
  product_id?: number;
}

// Fixed interface to avoid recursive type definition
interface Shopper {
  id: string;
  email: string;
  timestamp?: string;
  name?: string;
  rfidCardId?: string;
  username?: string;
  // Define shopping list items without circular references
  shoppingList?: ShoppingItem[];
}

interface Owner {
  id: string;
  email: string;
}

// Props interface for UserManagement component
interface UserManagementProps {
  initialShoppers?: any[];
}

const UserManagement: React.FC<UserManagementProps> = ({ initialShoppers }) => {
  const [shoppers, setShoppers] = useState<Shopper[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [newOwnerEmail, setNewOwnerEmail] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedShopper, setSelectedShopper] = useState<Shopper | null>(null);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch Shoppers
      const { data: shoppersData, error: shoppersError } = await supabase
        .from("shoppers")
        .select("*");

      if (shoppersError) {
        console.error("Error fetching shoppers:", shoppersError);
      } else {
        setShoppers(shoppersData || []);
      }

      // Fetch Owners
      const { data: ownersData, error: ownersError } = await supabase
        .from("owners")
        .select("*");

      if (ownersError) {
        console.error("Error fetching owners:", ownersError);
      } else {
        setOwners(ownersData || []);
      }
    } catch (error) {
      console.error("Unexpected error fetching users:", error);
    }
  };

  const handleAddOwner = async () => {
    try {
      // First check if the email already exists in owners table
      const { data: existingOwner, error: ownerCheckError } = await supabase
        .from("owners")
        .select("*")
        .eq("email", newOwnerEmail)
        .maybeSingle();
      
      if (ownerCheckError) {
        console.error("Error checking existing owner:", ownerCheckError);
      }
      
      if (existingOwner) {
        toast({
          title: "Owner exists",
          description: `${newOwnerEmail} is already an owner.`,
          variant: "default",
        });
        return;
      }
      
      // Create new owner entry
      const { error: insertError } = await supabase
        .from("owners")
        .insert({
          email: newOwnerEmail,
          id: crypto.randomUUID(), // Generate a random UUID for new owner
        });
        
      if (insertError) {
        console.error("Error inserting owner:", insertError);
        toast({
          title: "Error",
          description: `Failed to add owner: ${insertError.message}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Owner Added",
          description: `${newOwnerEmail} has been added as an owner.`,
          variant: "default",
        });
        fetchUsers(); // Refresh user list
      }
    } catch (error) {
      console.error("Unexpected error adding owner:", error);
      toast({
        title: "Error",
        description: `Unexpected error: ${error}`,
        variant: "destructive",
      });
    } finally {
      setNewOwnerEmail(""); // Clear the input field
    }
  };
  
  const generateRandomPassword = () => {
    const length = 12;
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return password;
  };

  const openShoppingListDialog = async (shopper: Shopper) => {
    setSelectedShopper(shopper);
    setOpen(true);

    // Fetch shopping list items for the selected shopper
    try {
      const { data, error } = await supabase
        .from("shopping_list")
        .select("*")
        .eq("shopper_id", shopper.id);

      if (error) {
        console.error("Error fetching shopping list:", error);
        toast({
          title: "Error",
          description: "Failed to load shopping list.",
          variant: "destructive",
        });
      } else {
        setShoppingList(data || []);
      }
    } catch (error) {
      console.error("Unexpected error fetching shopping list:", error);
      toast({
        title: "Error",
        description: "Unexpected error loading shopping list.",
        variant: "destructive",
      });
    }
  };

  const closeShoppingListDialog = () => {
    setOpen(false);
    setSelectedShopper(null);
    setShoppingList([]);
  };

  return (
    <div className="container mx-auto py-10">
      <Tabs defaultValue="shoppers" className="w-[400px]">
        <TabsList>
          <TabsTrigger value="shoppers">Shoppers</TabsTrigger>
          <TabsTrigger value="owners">Owners</TabsTrigger>
        </TabsList>
        <TabsContent value="shoppers">
          <h1 className="text-2xl font-bold mb-4">Shopper Management</h1>
          <Table>
            <TableCaption>A list of all shoppers in your account.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shoppers.map((shopper) => (
                <TableRow key={shopper.id}>
                  <TableCell className="font-medium">{shopper.id}</TableCell>
                  <TableCell>{shopper.email}</TableCell>
                  <TableCell>
                    <Button onClick={() => openShoppingListDialog(shopper)}>
                      View Shopping List
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="owners">
          <h1 className="text-2xl font-bold mb-4">Owner Management</h1>
          <Table>
            <TableCaption>A list of all owners in your account.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {owners.map((owner) => (
                <TableRow key={owner.id}>
                  <TableCell className="font-medium">{owner.id}</TableCell>
                  <TableCell>{owner.email}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2">Add New Owner</h2>
            <div className="flex space-x-2">
              <Input
                type="email"
                placeholder="Enter owner email"
                value={newOwnerEmail}
                onChange={(e) => setNewOwnerEmail(e.target.value)}
              />
              <Button onClick={handleAddOwner}>Add Owner</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Shopping List Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Shopping List for {selectedShopper?.email}
            </DialogTitle>
          </DialogHeader>
          <div>
            {shoppingList.length > 0 ? (
              <ul>
                {shoppingList.map((item) => (
                  <li key={item.id} className="py-2">
                    Item ID: {item.product_id}, Scanned: {item.scanned ? "Yes" : "No"}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No items in the shopping list.</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" onClick={closeShoppingListDialog}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
