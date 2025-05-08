
import React, { useState, useEffect } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Edit, Save, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Product } from "@/services/mockData";

interface InventoryTableProps {
  initialProducts: Product[];
  onUpdateProduct?: (product: Product) => void;
}

export const InventoryTable = ({ initialProducts, onUpdateProduct }: InventoryTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editValues, setEditValues] = useState<Partial<Product>>({});
  const [products, setProducts] = useState<Product[]>(initialProducts);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);
  
  // Fixed filtering to eliminate excessive recursion in type checking
  const filteredProducts = React.useMemo(() => {
    if (searchTerm.trim() === "") return products;
    
    const searchLower = searchTerm.toLowerCase();
    return products.filter(product => {
      // Use optional chaining and nullish coalescing to avoid errors
      const name = product?.name?.toLowerCase() ?? "";
      const barcode = product?.barcodeId?.toLowerCase() ?? "";
      const category = product?.category?.toLowerCase() ?? "";
      const subcategory = product?.subcategory?.toLowerCase() ?? "";
      
      return (
        name.includes(searchLower) || 
        barcode.includes(searchLower) || 
        category.includes(searchLower) || 
        subcategory.includes(searchLower)
      );
    });
  }, [products, searchTerm]);
  
  const handleUpdateProduct = async (updatedProduct: Product) => {
    try {
      if (onUpdateProduct) {
        onUpdateProduct(updatedProduct);
      }
      setEditingProduct(null);
      setEditValues({});
    } catch (error) {
      console.error("Failed to update product:", error);
    }
  };
  
  const handleEditChange = (key: keyof Product, value: any) => {
    setEditValues({ ...editValues, [key]: value });
  };
  
  const handleSaveEdit = () => {
    if (editingProduct) {
      const updatedProduct = { ...editingProduct, ...editValues };
      handleUpdateProduct(updatedProduct);
    }
  };
  
  const handleCancelEdit = () => {
    setEditingProduct(null);
    setEditValues({});
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Inventory</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Aisle</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  {editingProduct?.id === product.id ? (
                    <>
                      <TableCell>{product.id}</TableCell>
                      <TableCell>
                        <Input 
                          value={editValues.name ?? product.name} 
                          onChange={(e) => handleEditChange("name", e.target.value)} 
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          value={editValues.category ?? product.category} 
                          onChange={(e) => handleEditChange("category", e.target.value)} 
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number"
                          value={editValues.price ?? product.price} 
                          onChange={(e) => handleEditChange("price", parseFloat(e.target.value))} 
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number"
                          value={editValues.quantityInStock ?? product.quantityInStock} 
                          onChange={(e) => handleEditChange("quantityInStock", parseInt(e.target.value, 10))} 
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          value={editValues.aisle ?? product.aisle} 
                          onChange={(e) => handleEditChange("aisle", e.target.value)} 
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="icon" onClick={handleSaveEdit}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={handleCancelEdit}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>{product.id}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.price.toFixed(2)} TND</TableCell>
                      <TableCell>{product.quantityInStock}</TableCell>
                      <TableCell>{product.aisle}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => setEditingProduct(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
