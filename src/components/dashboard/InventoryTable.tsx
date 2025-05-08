
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit, Trash, Check, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Product } from "@/services/mockData";

interface InventoryTableProps {
  initialProducts?: Product[];
}

const InventoryTable: React.FC<InventoryTableProps> = ({ initialProducts = [] }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);
  
  // Completely redesigned filtering function to avoid deep type instantiation
  const getFilteredProducts = (): Product[] => {
    if (!searchTerm) {
      return products;
    }
    
    const searchLower = searchTerm.toLowerCase();
    const result: Product[] = [];
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      if (!product) continue;
      
      const nameMatch = product.name && product.name.toLowerCase().includes(searchLower);
      const barcodeMatch = product.barcodeId && product.barcodeId.toLowerCase().includes(searchLower);
      const categoryMatch = product.category && product.category.toLowerCase().includes(searchLower);
      const subcategoryMatch = product.subcategory && product.subcategory.toLowerCase().includes(searchLower);
      
      if (nameMatch || barcodeMatch || categoryMatch || subcategoryMatch) {
        result.push(product);
      }
    }
    
    return result;
  };
  
  const filteredProducts = getFilteredProducts();
  
  const handleUpdateProduct = async (updatedProduct: Product) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          Product: updatedProduct.name,
          Category: updatedProduct.category,
          Subcategory: updatedProduct.subcategory,
          Aisle: updatedProduct.aisle,
          Price: updatedProduct.price,
          Stock: updatedProduct.quantityInStock
        })
        .eq('Barcode ID', Number(updatedProduct.barcodeId));
      
      if (error) throw error;
      
      setEditingProduct(null);
      
      toast({
        title: "Product updated",
        description: `${updatedProduct.name} has been updated successfully.`,
      });
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Update failed",
        description: "Could not update the product.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const productToDelete = products.find((p) => p.id === productId);
    
    if (productToDelete && confirm(`Are you sure you want to delete ${productToDelete.name}?`)) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('Barcode ID', Number(productToDelete.barcodeId));
        
        if (error) throw error;
        
        toast({
          title: "Product deleted",
          description: `${productToDelete.name} has been deleted.`,
          variant: "destructive",
        });
      } catch (error) {
        console.error('Error deleting product:', error);
        toast({
          title: "Delete failed",
          description: "Could not delete the product.",
          variant: "destructive"
        });
      }
    }
  };
  
  const handleAddProduct = async () => {
    const newProduct = {
      id: `product_${Date.now()}`,
      name: "New Product",
      description: "Product description",
      image: "/placeholder.svg",
      barcodeId: `B${Math.floor(1000 + Math.random() * 9000)}`,
      category: "pantry",
      subcategory: "Canned Goods",
      aisle: "E1",
      price: 9.99,
      quantityInStock: 100,
    };
    
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          Product: newProduct.name,
          Barcode_ID: Number(newProduct.barcodeId.replace('B', '')),
          Category: newProduct.category,
          Subcategory: newProduct.subcategory,
          Aisle: newProduct.aisle,
          Price: newProduct.price,
          Stock: newProduct.quantityInStock
        });
      
      if (error) throw error;
      
      setEditingProduct(newProduct);
      
      toast({
        title: "New product added",
        description: "Please update the product details.",
      });
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Add failed",
        description: "Could not add the product.",
        variant: "destructive"
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold">Inventory Management</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-8 w-full sm:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handleAddProduct}>
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Barcode ID</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Subcategory</TableHead>
                <TableHead>Aisle</TableHead>
                <TableHead>Price (TND)</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {editingProduct?.id === product.id ? (
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 mr-4">
                          <img
                            className="h-10 w-10 rounded object-cover"
                            src={product.image || "/placeholder.svg"}
                            alt={product.name || "Product"}
                          />
                        </div>
                        <Input
                          className="max-w-[200px]"
                          value={editingProduct.name}
                          onChange={(e) => setEditingProduct({
                            ...editingProduct,
                            name: e.target.value
                          })}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded object-cover"
                            src={product.image || "/placeholder.svg"}
                            alt={product.name || "Product"}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium">{product.name || "Unnamed Product"}</div>
                        </div>
                      </div>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {editingProduct?.id === product.id ? (
                      <Input
                        value={editingProduct.barcodeId}
                        onChange={(e) => setEditingProduct({
                          ...editingProduct,
                          barcodeId: e.target.value
                        })}
                      />
                    ) : (
                      <div className="text-sm">{product.barcodeId || "N/A"}</div>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {editingProduct?.id === product.id ? (
                      <Input
                        value={editingProduct.category}
                        onChange={(e) => setEditingProduct({
                          ...editingProduct,
                          category: e.target.value
                        })}
                      />
                    ) : (
                      <div className="text-sm">{product.category || "N/A"}</div>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {editingProduct?.id === product.id ? (
                      <Input
                        value={editingProduct.subcategory}
                        onChange={(e) => setEditingProduct({
                          ...editingProduct,
                          subcategory: e.target.value
                        })}
                      />
                    ) : (
                      <div className="text-sm">{product.subcategory || "N/A"}</div>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {editingProduct?.id === product.id ? (
                      <Input
                        value={editingProduct.aisle}
                        onChange={(e) => setEditingProduct({
                          ...editingProduct,
                          aisle: e.target.value
                        })}
                      />
                    ) : (
                      <div className="text-sm">{product.aisle || "N/A"}</div>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {editingProduct?.id === product.id ? (
                      <Input
                        type="number"
                        value={editingProduct.price}
                        onChange={(e) => setEditingProduct({
                          ...editingProduct,
                          price: parseFloat(e.target.value) || 0
                        })}
                      />
                    ) : (
                      <div className="text-sm">{product.price?.toFixed(2) || "0.00"}</div>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {editingProduct?.id === product.id ? (
                      <Input
                        type="number"
                        value={editingProduct.quantityInStock}
                        onChange={(e) => setEditingProduct({
                          ...editingProduct,
                          quantityInStock: parseInt(e.target.value) || 0
                        })}
                      />
                    ) : (
                      <div className={`text-sm ${(product.quantityInStock !== undefined && product.quantityInStock < 50) ? "text-red-500 font-medium" : ""}`}>
                        {product.quantityInStock !== undefined ? product.quantityInStock : "N/A"}
                      </div>
                    )}
                  </TableCell>
                  
                  <TableCell className="text-right">
                    {editingProduct?.id === product.id ? (
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleUpdateProduct(editingProduct)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={handleCancelEdit}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setEditingProduct({...product})}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="px-4 py-8 text-center text-muted-foreground">
            No products found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryTable;
