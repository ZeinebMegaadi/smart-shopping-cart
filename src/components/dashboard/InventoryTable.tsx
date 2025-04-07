
import { useState } from "react";
import { products as initialProducts, Product } from "@/services/mockData";
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

const InventoryTable = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();
  
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcodeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.subcategory.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts((prevProducts) =>
      prevProducts.map((p) =>
        p.id === updatedProduct.id ? updatedProduct : p
      )
    );
    setEditingProduct(null);
    
    toast({
      title: "Product updated",
      description: `${updatedProduct.name} has been updated successfully.`,
    });
  };

  const handleDeleteProduct = (productId: string) => {
    const productToDelete = products.find((p) => p.id === productId);
    
    if (confirm(`Are you sure you want to delete ${productToDelete?.name}?`)) {
      setProducts((prevProducts) =>
        prevProducts.filter((p) => p.id !== productId)
      );
      
      toast({
        title: "Product deleted",
        description: `${productToDelete?.name} has been deleted.`,
        variant: "destructive",
      });
    }
  };
  
  const handleAddProduct = () => {
    const newProduct: Product = {
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
    
    setProducts([newProduct, ...products]);
    setEditingProduct(newProduct);
    
    toast({
      title: "New product added",
      description: "Please update the product details.",
    });
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
                            src={product.image}
                            alt={product.name}
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
                            src={product.image}
                            alt={product.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium">{product.name}</div>
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
                      <div className="text-sm">{product.barcodeId}</div>
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
                      <div className="text-sm">{product.category}</div>
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
                      <div className="text-sm">{product.subcategory}</div>
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
                      <div className="text-sm">{product.aisle}</div>
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
                      <div className="text-sm">{product.price.toFixed(2)}</div>
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
                      <div className={`text-sm ${product.quantityInStock < 50 ? "text-red-500 font-medium" : ""}`}>
                        {product.quantityInStock}
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
