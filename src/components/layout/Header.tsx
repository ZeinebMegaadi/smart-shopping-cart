
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Home, ShoppingBag, Search, Menu, Settings, LogOut, ChefHat } from "lucide-react";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useCart } from "@/contexts/CartContext";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, userRole } = useAuthStatus();
  const { totalItems } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Handle scroll event to change header style
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  // Get initials from email or use fallback
  const getInitials = async () => {
    const { data } = await supabase.auth.getSession();
    const email = data.session?.user?.email || "";
    return email.substring(0, 2).toUpperCase();
  };

  const [initials, setInitials] = useState("U");

  useEffect(() => {
    if (isAuthenticated) {
      getInitials().then(setInitials);
    }
  }, [isAuthenticated]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-200",
        isScrolled
          ? "bg-background/80 backdrop-blur-sm shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to="/"
              className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70"
            >
              Smart Cart
            </Link>
          </div>

          {/* Desktop Navigation */}
          {!isMobile && (
            <NavigationMenu className="hidden md:flex mx-auto">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link to="/" className={navigationMenuTriggerStyle()}>
                    <Home className="mr-2 h-4 w-4" />
                    Home
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/shop" className={navigationMenuTriggerStyle()}>
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Shop
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/recipes" className={navigationMenuTriggerStyle()}>
                    <ChefHat className="mr-2 h-4 w-4" />
                    Recipes
                  </Link>
                </NavigationMenuItem>
                {userRole === "owner" && (
                  <NavigationMenuItem>
                    <Link to="/dashboard" className={navigationMenuTriggerStyle()}>
                      Dashboard
                    </Link>
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
            </NavigationMenu>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              onClick={() => navigate("/search")}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Cart Button */}
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground relative"
              onClick={() => navigate("/cart")}
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center">
                  {totalItems}
                </Badge>
              )}
            </Button>

            {/* User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => navigate("/auth")} size="sm">
                Sign In
              </Button>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <div className="grid gap-4 py-4">
                    <Link
                      to="/"
                      className="flex items-center gap-2 px-3 py-2 text-lg font-medium rounded-md hover:bg-accent"
                    >
                      <Home className="h-5 w-5" />
                      Home
                    </Link>
                    <Link
                      to="/shop"
                      className="flex items-center gap-2 px-3 py-2 text-lg font-medium rounded-md hover:bg-accent"
                    >
                      <ShoppingBag className="h-5 w-5" />
                      Shop
                    </Link>
                    <Link
                      to="/recipes"
                      className="flex items-center gap-2 px-3 py-2 text-lg font-medium rounded-md hover:bg-accent"
                    >
                      <ChefHat className="h-5 w-5" />
                      Recipes
                    </Link>
                    <Link
                      to="/cart"
                      className="flex items-center gap-2 px-3 py-2 text-lg font-medium rounded-md hover:bg-accent"
                    >
                      <ShoppingBag className="h-5 w-5" />
                      Cart {totalItems > 0 && `(${totalItems})`}
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center gap-2 px-3 py-2 text-lg font-medium rounded-md hover:bg-accent"
                    >
                      <Settings className="h-5 w-5" />
                      Settings
                    </Link>
                    {userRole === "owner" && (
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-2 px-3 py-2 text-lg font-medium rounded-md hover:bg-accent"
                      >
                        Dashboard
                      </Link>
                    )}
                    {isAuthenticated ? (
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    ) : (
                      <Button
                        className="mt-4"
                        onClick={() => navigate("/auth")}
                      >
                        Sign In
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
