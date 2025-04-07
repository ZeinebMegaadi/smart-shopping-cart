
import { useState } from "react";
import { categories } from "@/services/mockData";
import { Link } from "react-router-dom";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface CategoryListProps {
  selectedCategory?: string;
  onSelectCategory: (categoryId: string) => void;
}

const CategoryList = ({ selectedCategory, onSelectCategory }: CategoryListProps) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Categories</h2>
      <ScrollArea className="w-full whitespace-nowrap pb-4">
        <div className="flex space-x-4">
          <Button
            variant={!selectedCategory ? "default" : "outline"}
            className="flex flex-col items-center px-6"
            onClick={() => onSelectCategory("")}
          >
            <span className="text-2xl">🛒</span>
            <span className="mt-1">All</span>
          </Button>
          
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              className="flex flex-col items-center px-6"
              onClick={() => onSelectCategory(category.id)}
            >
              <span className="text-2xl">{category.icon}</span>
              <span className="mt-1 whitespace-nowrap">{category.name}</span>
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default CategoryList;
