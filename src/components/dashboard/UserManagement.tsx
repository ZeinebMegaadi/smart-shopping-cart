
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, UserCheck, UserX, ChevronDown, ChevronUp, Shield, list, ListCheck, ShoppingCart } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface ShoppingItem {
  id: string;
  name?: string;
  aisle?: string;
  checked: boolean;
  product_id?: number;
}

interface Shopper {
  id: string;
  email: string;
  rfid_tag?: string | null;
  name?: string;
  rfidCardId?: string;
  username?: string;
  shoppingList?: ShoppingItem[];
}

interface Owner {
  id: string;
  email: string;
  name?: string;
  storeId?: string;
}

interface UserManagementProps {
  initialShoppers?: Shopper[];
}

const UserManagement: React.FC<UserManagementProps> = ({ initialShoppers = [] }) => {
  const [shoppers, setShoppers] = useState<Shopper[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [sortField, setSortField] = useState<"name" | "email" | "role" | "listCount">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [activeTab, setActiveTab] = useState<"shoppers" | "owners">("shoppers");
  const [isLoading, setIsLoading] = useState(true);
  const [productData, setProductData] = useState<{[key: string]: any}>({});
  
  // Process initial shoppers data
  useEffect(() => {
    console.log("Initial shoppers data received in UserManagement:", initialShoppers);
    if (initialShoppers && Array.isArray(initialShoppers) && initialShoppers.length > 0) {
      const processedShoppers = initialShoppers.map(shopper => ({
        id: shopper.id,
        name: shopper.username || shopper.name || shopper.email?.split('@')[0] || 'Unknown',
        email: shopper.email || 'No email',
        rfidCardId: shopper.rfidCardId || shopper.rfid_tag || 'N/A',
        rfid_tag: shopper.rfid_tag,
        shoppingList: shopper.shoppingList || []
      }));
      
      console.log("Processed shoppers in UserManagement:", processedShoppers);
      setShoppers(processedShoppers);
      setIsLoading(false);
    }
  }, [initialShoppers]);

  // Fetch shoppers directly if needed
  useEffect(() => {
    const fetchShoppers = async () => {
      if (initialShoppers && initialShoppers.length > 0) {
        console.log("Using initial shoppers data, skipping direct fetch");
        return;
      }
      
      setIsLoading(true);
      try {
        console.log("Fetching shoppers directly from database...");
        const { data, error } = await supabase
          .from('shoppers')
          .select('*');
        
        if (error) {
          console.error("Error fetching shoppers:", error);
          toast({
            title: "Error fetching shoppers",
            description: error.message,
            variant: "destructive"
          });
          return;
        }
        
        console.log("Direct shoppers fetch result:", data);
        
        if (data && Array.isArray(data)) {
          const processedShoppers = data.map(shopper => ({
            id: shopper.id,
            name: shopper.username || shopper.email?.split('@')[0] || 'Unknown',
            email: shopper.email || 'No email',
            rfidCardId: shopper.rfid_tag || 'N/A',
            rfid_tag: shopper.rfid_tag,
            shoppingList: [] as ShoppingItem[]
          }));
          
          // Fetch shopping lists for each shopper
          for (const shopper of processedShoppers) {
            try {
              const { data: listData } = await supabase
                .from('shopping_list')
                .select('*')
                .eq('shopper_id', shopper.id);
                
              if (listData && Array.isArray(listData)) {
                shopper.shoppingList = listData.map(item => ({
                  id: item.id,
                  product_id: item.product_id,
                  aisle: 'Fetching...',
                  checked: item.scanned || false
                }));
                
                // Get product details for each item
                for (const item of shopper.shoppingList) {
                  if (item.product_id) {
                    await fetchProductDetails(item.product_id, item);
                  }
                }
              }
            } catch (listError) {
              console.error(`Error fetching shopping list for shopper ${shopper.id}:`, listError);
            }
          }
          
          console.log("Fully processed shoppers with lists:", processedShoppers);
          setShoppers(processedShoppers);
        }
      } catch (error) {
        console.error("Unexpected error in fetchShoppers:", error);
        toast({
          title: "Error loading shoppers",
          description: "Failed to load shopper data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchShoppers();
  }, [initialShoppers]);
  
  // Fetch product details to associate with shopping list items
  const fetchProductDetails = async (productId: number, item: ShoppingItem) => {
    if (productData[productId]) {
      item.name = productData[productId].Product;
      item.aisle = productData[productId].Aisle;
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('Barcode ID', productId)
        .single();
        
      if (error) {
        console.error(`Error fetching product ${productId}:`, error);
        return;
      }
      
      if (data) {
        // Cache the product data
        setProductData(prev => ({ ...prev, [productId]: data }));
        
        // Update the item
        item.name = data.Product;
        item.aisle = data.Aisle;
      }
    } catch (error) {
      console.error(`Error fetching product ${productId}:`, error);
    }
  };
  
  // Fetch owners data
  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const { data, error } = await supabase.from('owners').select('*');
        if (error) {
          console.error("Error fetching owners:", error);
          return;
        }
        
        console.log("Owners fetch result:", data);
        
        if (data) {
          const processedOwners = data.map(owner => ({
            id: owner.id,
            email: owner.email,
            name: owner.email?.split('@')[0] || 'Unknown',
            storeId: 'store_1'
          }));
          setOwners(processedOwners);
        }
      } catch (error) {
        console.error("Unexpected error in fetchOwners:", error);
      }
    };
    fetchOwners();
  }, []);

  // Set up real-time subscription for shoppers and shopping list changes
  useEffect(() => {
    // Shoppers channel
    const shoppersChannel = supabase
      .channel('custom-shoppers-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shoppers' },
        (payload) => {
          console.log('Shopper Change received (UserManagement):', payload);
          if (payload.eventType === 'INSERT') {
            const newShopper: Shopper = {
              id: payload.new.id,
              email: payload.new.email || 'No email',
              name: payload.new.username || payload.new.email?.split('@')[0] || 'Unknown',
              rfidCardId: payload.new.rfid_tag || 'N/A',
              rfid_tag: payload.new.rfid_tag,
              shoppingList: []
            };
            
            console.log("Adding new shopper to UserManagement state:", newShopper);
            setShoppers(prev => [...prev, newShopper]);
            toast({
              title: "New shopper added",
              description: `${payload.new.email} has joined`,
            });
          } else if (payload.eventType === 'UPDATE') {
            setShoppers(prev => 
              prev.map(shopper => 
                shopper.id === payload.new.id 
                ? {
                    ...shopper,
                    email: payload.new.email || shopper.email,
                    name: payload.new.username || payload.new.email?.split('@')[0] || shopper.name,
                    rfidCardId: payload.new.rfid_tag || shopper.rfidCardId,
                    rfid_tag: payload.new.rfid_tag
                  }
                : shopper
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setShoppers(prev => prev.filter(shopper => shopper.id !== payload.old.id));
          }
        }
      )
      .subscribe();
      
    // Shopping list channel
    const shoppingListChannel = supabase
      .channel('shopping-list-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shopping_list' },
        async (payload) => {
          console.log('Shopping list change received:', payload);
          
          if (payload.eventType === 'INSERT') {
            const shopperId = payload.new.shopper_id;
            const newItem: ShoppingItem = {
              id: payload.new.id,
              product_id: payload.new.product_id,
              checked: payload.new.scanned || false
            };
            
            // Fetch product details for the new item
            if (newItem.product_id) {
              await fetchProductDetails(newItem.product_id, newItem);
            }
            
            setShoppers(prev => 
              prev.map(shopper => {
                if (shopper.id === shopperId) {
                  return {
                    ...shopper,
                    shoppingList: [...(shopper.shoppingList || []), newItem]
                  };
                }
                return shopper;
              })
            );
          } else if (payload.eventType === 'UPDATE') {
            const shopperId = payload.new.shopper_id;
            setShoppers(prev => 
              prev.map(shopper => {
                if (shopper.id === shopperId && shopper.shoppingList) {
                  return {
                    ...shopper,
                    shoppingList: shopper.shoppingList.map(item => 
                      item.id === payload.new.id 
                        ? { ...item, checked: payload.new.scanned || false }
                        : item
                    )
                  };
                }
                return shopper;
              })
            );
          } else if (payload.eventType === 'DELETE') {
            const shopperId = payload.old.shopper_id;
            setShoppers(prev => 
              prev.map(shopper => {
                if (shopper.id === shopperId && shopper.shoppingList) {
                  return {
                    ...shopper,
                    shoppingList: shopper.shoppingList.filter(item => item.id !== payload.old.id)
                  };
                }
                return shopper;
              })
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(shoppersChannel);
      supabase.removeChannel(shoppingListChannel);
    };
  }, []);
  
  const handleSort = (field: "name" | "email" | "role" | "listCount") => {
    const isAsc = sortField === field && sortDirection === "asc";
    setSortField(field);
    setSortDirection(isAsc ? "desc" : "asc");
  };

  const toggleExpandUser = (userId: string) => {
    setExpandedUser(prevUser => prevUser === userId ? null : userId);
  };

  const filteredShoppers = shoppers
    .filter(shopper => {
      if (!shopper) return false;
      
      const shopperName = shopper.name || '';
      const shopperEmail = shopper.email || '';
      const shopperRfid = shopper.rfidCardId || shopper.rfid_tag || '';
      
      return shopperName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shopperEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shopperRfid.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      if (!a || !b) return 0;
      
      let comparison = 0;
      
      if (sortField === "name") {
        const nameA = a.name || '';
        const nameB = b.name || '';
        comparison = nameA.localeCompare(nameB);
      } else if (sortField === "email") {
        const emailA = a.email || '';
        const emailB = b.email || '';
        comparison = emailA.localeCompare(emailB);
      } else if (sortField === "listCount") {
        const listLengthA = a.shoppingList ? a.shoppingList.length : 0;
        const listLengthB = b.shoppingList ? b.shoppingList.length : 0;
        comparison = listLengthA - listLengthB;
      }
      
      return sortDirection === "asc" ? comparison : -comparison;
    });

  const filteredOwners = owners
    .filter(owner => {
      if (!owner) return false;
      
      const ownerName = owner.name || owner.email || '';
      const ownerEmail = owner.email || '';
      
      return ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ownerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      if (!a || !b) return 0;
      
      let comparison = 0;
      
      if (sortField === "name") {
        const nameA = a.name || a.email || '';
        const nameB = b.name || b.email || '';
        comparison = nameA.localeCompare(nameB);
      } else if (sortField === "email") {
        const emailA = a.email || '';
        const emailB = b.email || '';
        comparison = emailA.localeCompare(emailB);
      }
      
      return sortDirection === "asc" ? comparison : -comparison;
    });

  // Refresh data function
  const refreshData = async () => {
    setIsLoading(true);
    try {
      console.log("Manually refreshing shopper data...");
      
      const { data, error } = await supabase.from('shoppers').select('*');
      if (error) {
        console.error("Error refreshing shoppers:", error);
        toast({
          title: "Refresh failed",
          description: "Could not refresh shoppers data",
          variant: "destructive"
        });
        return;
      }
      
      console.log("Refresh result:", data);
      
      if (data && Array.isArray(data)) {
        const processedShoppers = data.map(shopper => ({
          id: shopper.id,
          name: shopper.username || shopper.email?.split('@')[0] || 'Unknown',
          email: shopper.email || 'No email',
          rfidCardId: shopper.rfid_tag || 'N/A',
          rfid_tag: shopper.rfid_tag,
          shoppingList: [] as ShoppingItem[]
        }));
        
        // Fetch shopping lists for each shopper
        for (const shopper of processedShoppers) {
          try {
            const { data: listData } = await supabase
              .from('shopping_list')
              .select('*')
              .eq('shopper_id', shopper.id);
              
            if (listData && Array.isArray(listData)) {
              shopper.shoppingList = listData.map(item => ({
                id: item.id,
                product_id: item.product_id,
                checked: item.scanned || false
              }));
              
              // Get product details for each item
              for (const item of shopper.shoppingList) {
                if (item.product_id) {
                  await fetchProductDetails(item.product_id, item);
                }
              }
            }
          } catch (listError) {
            console.error(`Error fetching shopping list for shopper ${shopper.id}:`, listError);
          }
        }
        
        console.log("Refreshed shoppers with lists:", processedShoppers);
        setShoppers(processedShoppers);
        toast({
          title: "Data refreshed",
          description: "Shoppers data has been updated"
        });
      }
    } catch (error) {
      console.error("Error in refresh:", error);
      toast({
        title: "Refresh failed",
        description: "An error occurred while refreshing data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">View and manage user accounts and shopping lists</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button onClick={refreshData} disabled={isLoading}>
            {isLoading ? "Refreshing..." : "Refresh Data"}
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "shoppers" | "owners")}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="shoppers" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            <span>Shoppers ({filteredShoppers.length})</span>
          </TabsTrigger>
          <TabsTrigger value="owners" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Store Owners ({filteredOwners.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shoppers" className="animate-fade-in">
          <Card className="border-gradient glass-effect hover-lift">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <p>Loading shoppers...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">Status</TableHead>
                      <TableHead 
                        className="cursor-pointer" 
                        onClick={() => handleSort("name")}
                      >
                        <div className="flex items-center">
                          Name
                          {sortField === "name" && (
                            sortDirection === "asc" ? 
                              <ChevronUp className="ml-1 h-4 w-4" /> : 
                              <ChevronDown className="ml-1 h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer" 
                        onClick={() => handleSort("email")}
                      >
                        <div className="flex items-center">
                          Email
                          {sortField === "email" && (
                            sortDirection === "asc" ? 
                              <ChevronUp className="ml-1 h-4 w-4" /> : 
                              <ChevronDown className="ml-1 h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead>RFID ID</TableHead>
                      <TableHead 
                        className="cursor-pointer" 
                        onClick={() => handleSort("listCount")}
                      >
                        <div className="flex items-center">
                          Items
                          {sortField === "listCount" && (
                            sortDirection === "asc" ? 
                              <ChevronUp className="ml-1 h-4 w-4" /> : 
                              <ChevronDown className="ml-1 h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead>Shopping List</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredShoppers.length > 0 ? (
                      filteredShoppers.map(shopper => {
                        if (!shopper) return null;
                        
                        const shoppingList = shopper.shoppingList || [];
                        const checkedItems = shoppingList.filter(item => item.checked).length;
                        const hasShoppingList = shoppingList.length > 0;
                        
                        return (
                          <React.Fragment key={shopper.id}>
                            <TableRow className="group hover:bg-muted/50 transition-colors">
                              <TableCell>
                                {hasShoppingList ? (
                                  <div className="flex w-8 h-8 items-center justify-center bg-primary/10 text-primary rounded-full">
                                    <ListCheck size={16} />
                                  </div>
                                ) : (
                                  <div className="flex w-8 h-8 items-center justify-center bg-muted/50 text-muted-foreground rounded-full">
                                    <UserX size={16} />
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="font-medium">{shopper.name || shopper.email?.split('@')[0] || 'Unknown'}</TableCell>
                              <TableCell>{shopper.email || 'No email'}</TableCell>
                              <TableCell>
                                <span className="px-2 py-1 rounded-full text-xs bg-secondary/20 text-secondary">
                                  {shopper.rfidCardId || shopper.rfid_tag || 'N/A'}
                                </span>
                              </TableCell>
                              <TableCell>
                                {hasShoppingList ? (
                                  <span className="font-medium">
                                    {checkedItems}/{shoppingList.length}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">No items</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleExpandUser(shopper.id)}
                                  className="group-hover:bg-primary/10 group-hover:text-primary"
                                >
                                  {expandedUser === shopper.id ? "Hide List" : "View List"}
                                  {expandedUser === shopper.id ? (
                                    <ChevronUp className="ml-1 h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="ml-1 h-4 w-4" />
                                  )}
                                </Button>
                              </TableCell>
                            </TableRow>
                            
                            {expandedUser === shopper.id && (
                              <TableRow>
                                <TableCell colSpan={6} className="p-0">
                                  <div className="bg-muted/30 p-4 border-t border-b rounded-md m-2 animate-fade-in">
                                    <h4 className="font-medium mb-2">{shopper.name || shopper.email?.split('@')[0] || 'Unknown'}'s Shopping List</h4>
                                    {shoppingList.length > 0 ? (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {shoppingList.map((item) => (
                                          <div
                                            key={item.id}
                                            className={`flex items-center p-2 rounded-md ${
                                              item.checked 
                                                ? 'bg-green-50 border border-green-200' 
                                                : 'bg-white border'
                                            }`}
                                          >
                                            <div 
                                              className={`w-4 h-4 rounded-full mr-3 ${
                                                item.checked ? 'bg-green-500' : 'bg-muted'
                                              }`}
                                            />
                                            <div className="flex-1">
                                              <p className={`font-medium ${
                                                item.checked ? 'line-through text-muted-foreground' : ''
                                              }`}>
                                                {item.name || `Product ID: ${item.product_id}` || 'Unnamed item'}
                                              </p>
                                              <p className="text-xs text-muted-foreground">
                                                Aisle: {item.aisle || 'Unknown'}
                                              </p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-muted-foreground">No items in shopping list</p>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <p className="text-muted-foreground">
                            {searchTerm 
                              ? 'No shoppers found matching your search' 
                              : isLoading 
                                ? 'Loading shoppers data...' 
                                : 'No shoppers in the database'
                            }
                          </p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={refreshData}
                            disabled={isLoading}
                          >
                            {isLoading ? "Refreshing..." : "Refresh Data"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="owners" className="animate-fade-in">
          <Card className="border-gradient glass-effect hover-lift">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">Status</TableHead>
                    <TableHead 
                      className="cursor-pointer" 
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center">
                        Name
                        {sortField === "name" && (
                          sortDirection === "asc" ? 
                            <ChevronUp className="ml-1 h-4 w-4" /> : 
                            <ChevronDown className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer" 
                      onClick={() => handleSort("email")}
                    >
                      <div className="flex items-center">
                        Email
                        {sortField === "email" && (
                          sortDirection === "asc" ? 
                            <ChevronUp className="ml-1 h-4 w-4" /> : 
                            <ChevronDown className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Store ID</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOwners.length > 0 ? (
                    filteredOwners.map(owner => (
                      <TableRow key={owner.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell>
                          <div className="flex w-8 h-8 items-center justify-center bg-secondary/10 text-secondary rounded-full">
                            <Shield size={16} />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{owner.name || owner.email?.split('@')[0] || 'Unknown'}</TableCell>
                        <TableCell>{owner.email || 'No email'}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full text-xs bg-primary/20 text-primary">
                            {owner.storeId || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" disabled>
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <p className="text-muted-foreground">No owners found matching your search</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagement;
