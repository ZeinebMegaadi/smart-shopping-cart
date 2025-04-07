
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { products, categories } from "@/services/mockData";
import ProductCard from "@/components/shop/ProductCard";
import CategoryList from "@/components/shop/CategoryList";
import { ArrowRight, Search, ShoppingBag, Sparkles } from "lucide-react";

const HomePage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  
  // Get popular products
  const popularProducts = products.filter((product) => product.popular);
  
  // Get the products for the selected category, or popular products if no category selected
  const displayedProducts = selectedCategory
    ? products.filter((product) => product.category === selectedCategory).slice(0, 4)
    : popularProducts;
  
  useEffect(() => {
    setIsVisible(true);
  }, []);
    
  return (
    <div>
      {/* Hero section with enhanced visuals */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-20 md:py-28 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-float"></div>
          <div className="absolute bottom-10 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse-soft"></div>
          <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-white/10 rounded-full blur-lg animate-float" style={{ animationDelay: "1s" }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in">
              <span className="bg-clip-text text-transparent bg-gradient-to-br from-white to-white/80">
                Smart Shopping Made Simple
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Browse products, add to cart, and enjoy a seamless shopping experience with our smart cart technology.
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 hover:scale-105 transition-all duration-300 shadow-md"
                onClick={() => navigate("/shop")}
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Shop Now
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/20 transition-all hover:scale-105 duration-300"
                onClick={() => navigate("/auth")}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Categories section with animation */}
      <section className="py-16 md:py-24 bg-background">
        <div className={`container mx-auto px-4 transition-all duration-700 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 gradient-text">Shop by Category</h2>
            <p className="text-muted-foreground text-lg">Find what you need in our well-organized departments</p>
          </div>
          
          <div className="mb-10">
            <CategoryList 
              selectedCategory={selectedCategory} 
              onSelectCategory={(categoryId) => setSelectedCategory(categoryId)}
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {displayedProducts.map((product, index) => (
              <div 
                key={product.id} 
                className="animate-slide-up"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <Button 
              size="lg"
              onClick={() => navigate("/shop")}
              className="btn-hover shadow-sm"
            >
              View All Products <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </section>
      
      {/* Features section with enhanced visuals */}
      <section className="py-16 md:py-24 bg-muted/50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full"></div>
          <div className="absolute -bottom-40 -left-20 w-80 h-80 bg-secondary/5 rounded-full"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 gradient-text">Why Shop With Us</h2>
            <p className="text-muted-foreground text-lg">Our smart shopping cart system makes shopping easier and more enjoyable</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm hover-lift">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center">Easy Product Browsing</h3>
              <p className="text-muted-foreground text-center">
                Explore our products by category and subcategory to quickly find what you need.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm hover-lift">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary">
                  <circle cx="8" cy="21" r="1" />
                  <circle cx="19" cy="21" r="1" />
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center">Smart Cart System</h3>
              <p className="text-muted-foreground text-center">
                Add products to your cart with ease and manage quantities with our intuitive interface.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm hover-lift">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Sparkles className="h-8 w-8 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center">Recipe Recommendations</h3>
              <p className="text-muted-foreground text-center">
                Get personalized recipe recommendations based on your shopping cart items.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to action with enhanced visuals */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-accent to-accent/80 text-accent-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-5">Ready to Start Shopping?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Create an account today and experience our smart shopping cart system.
          </p>
          <Button 
            size="lg"
            className="bg-accent-foreground text-accent hover:bg-accent-foreground/90 transition-all hover:scale-105 duration-300 shadow-lg"
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
