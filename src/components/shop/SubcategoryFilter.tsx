
import { subcategories } from "@/services/mockData";
import { Button } from "@/components/ui/button";

interface SubcategoryFilterProps {
  categoryId: string;
  selectedSubcategory: string;
  onSelectSubcategory: (subcategory: string) => void;
}

const SubcategoryFilter = ({
  categoryId,
  selectedSubcategory,
  onSelectSubcategory,
}: SubcategoryFilterProps) => {
  if (!categoryId || !subcategories[categoryId as keyof typeof subcategories]) {
    return null;
  }

  const categorySubcategories = subcategories[categoryId as keyof typeof subcategories];

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3">Filter by Type</h3>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedSubcategory === "" ? "default" : "outline"}
          size="sm"
          onClick={() => onSelectSubcategory("")}
        >
          All
        </Button>
        
        {categorySubcategories.map((subcategory) => (
          <Button
            key={subcategory}
            variant={selectedSubcategory === subcategory ? "default" : "outline"}
            size="sm"
            onClick={() => onSelectSubcategory(subcategory)}
          >
            {subcategory}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default SubcategoryFilter;
