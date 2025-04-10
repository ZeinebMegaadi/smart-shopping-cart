
import React, { useState } from "react";
import { users } from "@/services/mockData";
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
import { Search, UserCheck, UserX, ChevronDown, ChevronUp } from "lucide-react";

// Mock shopping lists for demo purposes
// In a real app, this would come from a database
const mockShoppingLists = {
  "user_1": [
    { id: "1", name: "Water bottle Sabrine 1.5L", aisle: "A2", checked: true },
    { id: "2", name: "Chocolate Maestro", aisle: "C5", checked: false },
    { id: "3", name: "Corn oil Cristal 0.9L", aisle: "B3", checked: true },
  ],
  "user_2": [
    { id: "4", name: "Cake Flour Warda 1kg", aisle: "D1", checked: false },
    { id: "5", name: "Dry yeast", aisle: "D2", checked: true },
  ],
  "user_3": [
    { id: "6", name: "Salt 500g Le Flamant", aisle: "B4", checked: false },
  ],
};

interface ShoppingListItem {
  id: string;
  name: string;
  aisle: string;
  checked: boolean;
}

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [sortField, setSortField] = useState<"name" | "email" | "role" | "listCount">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
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
  
  // Filter users based on search term
  const filteredUsers = users
    .filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortField === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === "email") {
        comparison = a.email.localeCompare(b.email);
      } else if (sortField === "role") {
        comparison = a.role.localeCompare(b.role);
      } else if (sortField === "listCount") {
        const aCount = mockShoppingLists[a.id as keyof typeof mockShoppingLists]?.length || 0;
        const bCount = mockShoppingLists[b.id as keyof typeof mockShoppingLists]?.length || 0;
        comparison = aCount - bCount;
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
                <TableHead className="cursor-pointer" onClick={() => handleSort("role")}>
                  <div className="flex items-center">
                    Role
                    {sortField === "role" && (
                      sortDirection === "asc" ? 
                        <ChevronUp className="ml-1 h-4 w-4" /> : 
                        <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </TableHead>
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
              {filteredUsers.map(user => {
                const userShoppingList = mockShoppingLists[user.id as keyof typeof mockShoppingLists] || [];
                const checkedItems = userShoppingList.filter(item => item.checked).length;
                const hasShoppingList = userShoppingList.length > 0;
                
                return (
                  <React.Fragment key={user.id}>
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
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.role === 'owner' 
                            ? 'bg-secondary/20 text-secondary' 
                            : 'bg-primary/20 text-primary'
                        }`}>
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        {hasShoppingList ? (
                          <span className="font-medium">
                            {checkedItems}/{userShoppingList.length}
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
                            onClick={() => toggleExpandUser(user.id)}
                            className="group-hover:bg-primary/10 group-hover:text-primary"
                          >
                            {expandedUser === user.id ? "Hide List" : "View List"}
                            {expandedUser === user.id ? (
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
                    {expandedUser === user.id && (
                      <TableRow>
                        <TableCell colSpan={6} className="p-0">
                          <div className="bg-muted/30 p-4 border-t border-b rounded-md m-2 animate-fade-in">
                            <h4 className="font-medium mb-2">{user.name}'s Shopping List</h4>
                            {userShoppingList.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {userShoppingList.map((item: ShoppingListItem) => (
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
              
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <p className="text-muted-foreground">No users found matching your search</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="text-center text-xs text-muted-foreground">
        Showing {filteredUsers.length} of {users.length} users
      </div>
    </div>
  );
};

export default UserManagement;
