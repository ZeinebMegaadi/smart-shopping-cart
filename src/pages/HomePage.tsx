
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { products, categories } from "@/services/mockData";
import ProductCard from "@/components/shop/ProductCard";
import CategoryList from "@/components/shop/CategoryList";
import { ArrowRight, Search } from "lucide-react";

const HomePage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("");
  
  // Get popular products
  const popularProducts = products.filter((product) => product.popular);
  
  // Get the products for the selected category, or popular products if no category selected
  const displayedProducts = selectedCategory
    ? products.filter((product) => product.category === selectedCategory).slice(0, 4)
    : popularProducts;
    
  return (
    <div>
      {/* Hero section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 animate-fade-in">
              Smart Shopping Made Simple
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Browse products, add to cart, and enjoy a seamless shopping experience.
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90"
                onClick={() => navigate("/shop")}
              >
                Shop Now
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/20"
                onClick={() => navigate("/auth")}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Categories section */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">Shop by Category</h2>
            <p className="text-muted-foreground">Find what you need in our well-organized departments</p>
          </div>
          
          <CategoryList 
            selectedCategory={selectedCategory} 
            onSelectCategory={(categoryId) => setSelectedCategory(categoryId)}
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="text-center">
            <Button 
              size="lg"
              onClick={() => navigate("/shop")}
            >
              View All Products <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
      
      {/* Features section */}
      <section className="py-12 md:py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">Why Shop With Us</h2>
            <p className="text-muted-foreground">Our smart shopping cart system makes shopping easier</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Easy Product Browsing</h3>
              <p className="text-muted-foreground">
                Explore our products by category and subcategory to quickly find what you need.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-secondary">
                  <circle cx="8" cy="21" r="1" />
                  <circle cx="19" cy="21" r="1" />
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">Smart Cart System</h3>
              <p className="text-muted-foreground">
                Add products to your cart with ease and manage quantities with our intuitive interface.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-accent-foreground">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">Seamless Checkout</h3>
              <p className="text-muted-foreground">
                Enjoy a smooth and secure checkout process with multiple payment options.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to action */}
      <section className="py-12 md:py-16 bg-accent text-accent-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Shopping?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Create an account today and experience our smart shopping cart system.
          </p>
          <Button 
            size="lg"
            className="bg-accent-foreground text-accent hover:bg-accent-foreground/90"
            onClick={() => navigate("/auth")}
          >
            Create Account
          </Button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
