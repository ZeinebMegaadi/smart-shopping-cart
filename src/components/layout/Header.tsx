import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Search, ShoppingCart, Menu, X, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Header = () => {
  const { currentUser, logout, userRole } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const isOwner = userRole === "owner";
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  const handleLogout = () => {
    logout();
    navigate("/auth");
  };
  
  const getUserInitials = () => {
    if (!currentUser?.email) return "U";
    return currentUser.email
      .slice(0, 2)
      .toUpperCase();
  };
  
  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Redirect store owners to dashboard if they're trying to access shopper pages
  useEffect(() => {
    if (isOwner && 
        (location.pathname === "/shop" || 
         location.pathname === "/cart" || 
         location.pathname === "/recipes")) {
      navigate("/dashboard");
    }
  }, [location.pathname, isOwner, navigate]);

  return (
    <header 
      className={`sticky top-0 z-50 w-full ${
        scrolled ? "bg-white/95 shadow-md backdrop-blur-sm" : "bg-white"
      } transition-all duration-300`}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="bg-gradient-to-r from-primary to-secondary rounded-full w-10 h-10 flex items-center justify-center text-white font-bold text-lg">
            SC
          </div>
          <span className="text-xl font-bold hidden sm:inline-block">SmartCart</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {!isOwner && (
            <>
              <Link 
                to="/" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive("/") ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Home
              </Link>
              <Link 
                to="/shop" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive("/shop") ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Shop
              </Link>
              <Link 
                to="/recipes" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive("/recipes") ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Recipes
              </Link>
            </>
          )}
          
          {isOwner && (
            <Link 
              to="/dashboard" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/dashboard") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Dashboard
            </Link>
          )}
        </nav>
        
        {/* Actions */}
        <div className="flex items-center space-x-4">
          {!isOwner && (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                className="hidden sm:flex"
                onClick={() => navigate("/search")}
              >
                <Search size={20} />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative" 
                onClick={() => navigate("/cart")}
              >
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-secondary text-white"
                  >
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </>
          )}
          
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8 bg-primary text-white">
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  {isOwner && (
                    <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              variant="default" 
              size="sm" 
              className="hidden md:inline-flex"
              onClick={() => navigate("/auth")}
            >
              Sign In
            </Button>
          )}
          
          {/* Mobile menu toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 animate-fade-in">
          <div className="container px-4 py-3 space-y-3">
            {!isOwner && (
              <>
                <Link 
                  to="/"
                  className="block py-2 text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  to="/shop"
                  className="block py-2 text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Shop
                </Link>
                <Link 
                  to="/search"
                  className="block py-2 text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Search
                </Link>
                <Link 
                  to="/recipes"
                  className="block py-2 text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Recipes
                </Link>
              </>
            )}
            
            {isOwner && (
              <Link 
                to="/dashboard"
                className="block py-2 text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
            
            {!currentUser && (
              <Button 
                variant="default" 
                className="w-full"
                onClick={() => {
                  navigate("/auth");
                  setMobileMenuOpen(false);
                }}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
