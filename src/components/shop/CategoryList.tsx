
import { useState } from "react";
import { categories } from "@/services/mockData";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { AArrowDown, AArrowUp, ALargeSmall } from "lucide-react";

interface CategoryListProps {
  selectedCategory?: string;
  onSelectCategory: (categoryId: string) => void;
}

const CategoryList = ({ selectedCategory, onSelectCategory }: CategoryListProps) => {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Browse Categories</h2>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="w-8 h-8 text-muted-foreground hover:text-foreground"
          >
            <AArrowDown className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="w-8 h-8 text-muted-foreground hover:text-foreground"
          >
            <AArrowUp className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="w-8 h-8 text-muted-foreground hover:text-foreground"
          >
            <ALargeSmall className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-4 pb-4">
          <Button
            variant={!selectedCategory ? "default" : "outline"}
            className="flex flex-col items-center justify-center w-32 h-40 rounded-xl group"
            onClick={() => onSelectCategory("")}
          >
            <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">🛒</span>
            <span className="text-base font-semibold group-hover:text-primary-foreground">All Products</span>
          </Button>
          
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              className="flex flex-col items-center justify-center w-32 h-40 rounded-xl group"
              onClick={() => onSelectCategory(category.id)}
            >
              <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                {category.icon}
              </span>
              <span className="text-base font-semibold group-hover:text-primary-foreground whitespace-normal text-center">
                {category.name}
              </span>
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default CategoryList;
