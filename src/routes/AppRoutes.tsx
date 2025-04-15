
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import NotFound from "@/pages/NotFound";
import HomePage from "@/pages/HomePage";
import AuthPage from "@/pages/AuthPage";
import ShopPage from "@/pages/ShopPage";
import CartPage from "@/pages/CartPage";
import SearchPage from "@/pages/SearchPage";
import DashboardPage from "@/pages/DashboardPage";
import RecipesPage from "@/pages/RecipesPage";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

const AppRoutes = () => {
  const { currentUser, userRole, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication and user role
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-md p-8 space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-8 w-1/2 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Public routes */}
        <Route index element={
          currentUser 
            ? (userRole === "owner" ? <Navigate to="/dashboard" /> : <Navigate to="/shop" />)
            : <HomePage />
        } />
        
        {/* Protected shopper routes */}
        <Route path="shop" element={
          currentUser
            ? (userRole === "owner" ? <Navigate to="/dashboard" /> : <ShopPage />)
            : <Navigate to="/auth" />
        } />
        <Route path="cart" element={
          currentUser
            ? (userRole === "owner" ? <Navigate to="/dashboard" /> : <CartPage />)
            : <Navigate to="/auth" />
        } />
        <Route path="search" element={
          currentUser
            ? (userRole === "owner" ? <Navigate to="/dashboard" /> : <SearchPage />)
            : <Navigate to="/auth" />
        } />
        <Route path="recipes" element={
          currentUser
            ? (userRole === "owner" ? <Navigate to="/dashboard" /> : <RecipesPage />)
            : <Navigate to="/auth" />
        } />
        
        {/* Protected owner route */}
        <Route 
          path="dashboard" 
          element={
            currentUser
              ? (userRole === "owner" ? <DashboardPage /> : <Navigate to="/shop" />)
              : <Navigate to="/auth" />
          } 
        />
      </Route>
      
      {/* Auth route - redirect if already logged in */}
      <Route 
        path="/auth" 
        element={
          currentUser 
            ? (userRole === "owner" ? <Navigate to="/dashboard" /> : <Navigate to="/shop" />)
            : <AuthPage />
        } 
      />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
