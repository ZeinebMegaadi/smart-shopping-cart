
import React, { useState } from "react";
import { shoppers, owners } from "@/services/mockData";
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
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, UserCheck, UserX, ChevronDown, ChevronUp, Shield } from "lucide-react";

interface ShoppingListItem {
  id: string;
  productId: string;
  name: string;
  aisle: string;
  checked: boolean;
}

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [sortField, setSortField] = useState<"name" | "email" | "role" | "listCount">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [activeTab, setActiveTab] = useState<"shoppers" | "owners">("shoppers");
  
  const toggleExpandUser = (userId: string) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };
  
  const handleSort = (field: "name" | "email" | "role" | "listCount") => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  
  // Filter shoppers based on search term
  const filteredShoppers = shoppers
    .filter(shopper => 
      shopper.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shopper.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shopper.rfidCardId.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortField === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === "email") {
        comparison = a.email.localeCompare(b.email);
      } else if (sortField === "listCount") {
        comparison = a.shoppingList.length - b.shoppingList.length;
      }
      
      return sortDirection === "asc" ? comparison : -comparison;
    });

  // Filter owners based on search term
  const filteredOwners = owners
    .filter(owner => 
      owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortField === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === "email") {
        comparison = a.email.localeCompare(b.email);
      }
      
      return sortDirection === "asc" ? comparison : -comparison;
    });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">View and manage user accounts and shopping lists</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "shoppers" | "owners")}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="shoppers" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            <span>Shoppers</span>
          </TabsTrigger>
          <TabsTrigger value="owners" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Store Owners</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shoppers" className="animate-fade-in">
          <Card className="border-gradient glass-effect hover-lift">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">Status</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                      <div className="flex items-center">
                        Name
                        {sortField === "name" && (
                          sortDirection === "asc" ? 
                            <ChevronUp className="ml-1 h-4 w-4" /> : 
                            <ChevronDown className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("email")}>
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
                    <TableHead className="cursor-pointer" onClick={() => handleSort("listCount")}>
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
                  {filteredShoppers.map(shopper => {
                    const shoppingList = shopper.shoppingList;
                    const checkedItems = shoppingList.filter(item => item.checked).length;
                    const hasShoppingList = shoppingList.length > 0;
                    
                    return (
                      <React.Fragment key={shopper.id}>
                        <TableRow className="group hover:bg-muted/50 transition-colors">
                          <TableCell>
                            {hasShoppingList ? (
                              <div className="flex w-8 h-8 items-center justify-center bg-primary/10 text-primary rounded-full">
                                <UserCheck size={16} />
                              </div>
                            ) : (
                              <div className="flex w-8 h-8 items-center justify-center bg-muted/50 text-muted-foreground rounded-full">
                                <UserX size={16} />
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{shopper.name}</TableCell>
                          <TableCell>{shopper.email}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 rounded-full text-xs bg-secondary/20 text-secondary">
                              {shopper.rfidCardId}
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
                            {hasShoppingList ? (
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
                            ) : (
                              <Button variant="ghost" size="sm" disabled>
                                No List
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                        
                        {/* Expanded shopping list */}
                        {expandedUser === shopper.id && (
                          <TableRow>
                            <TableCell colSpan={6} className="p-0">
                              <div className="bg-muted/30 p-4 border-t border-b rounded-md m-2 animate-fade-in">
                                <h4 className="font-medium mb-2">{shopper.name}'s Shopping List</h4>
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
                                            {item.name}
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            Aisle: {item.aisle}
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
                  })}
                  
                  {filteredShoppers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <p className="text-muted-foreground">No shoppers found matching your search</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <div className="text-center text-xs text-muted-foreground mt-4">
            Showing {filteredShoppers.length} of {shoppers.length} shoppers
          </div>
        </TabsContent>

        <TabsContent value="owners" className="animate-fade-in">
          <Card className="border-gradient glass-effect hover-lift">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">Status</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                      <div className="flex items-center">
                        Name
                        {sortField === "name" && (
                          sortDirection === "asc" ? 
                            <ChevronUp className="ml-1 h-4 w-4" /> : 
                            <ChevronDown className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("email")}>
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
                  {filteredOwners.map(owner => (
                    <TableRow key={owner.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell>
                        <div className="flex w-8 h-8 items-center justify-center bg-secondary/10 text-secondary rounded-full">
                          <Shield size={16} />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{owner.name}</TableCell>
                      <TableCell>{owner.email}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full text-xs bg-primary/20 text-primary">
                          {owner.storeId}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" disabled>
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {filteredOwners.length === 0 && (
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
          
          <div className="text-center text-xs text-muted-foreground mt-4">
            Showing {filteredOwners.length} of {owners.length} store owners
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagement;
