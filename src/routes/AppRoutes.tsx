
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
import { useEffect } from "react";

const AppRoutes = () => {
  const { currentUser, userRole, isLoading } = useAuth();
  const location = useLocation();
  
  // Debug user state - but don't log on every render to avoid console spam
  useEffect(() => {
    console.log("AppRoutes mounted - currentUser:", !!currentUser, "userRole:", userRole);
  }, [currentUser?.id, userRole]);

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
  
  // Simple state-based routing without excessive redirects
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Public route - Home */}
        <Route index element={
          !currentUser ? <HomePage /> :
          userRole === "owner" ? <Navigate to="/dashboard" replace state={{ from: location }} /> :
          <Navigate to="/shop" replace state={{ from: location }} />
        } />
        
        {/* Shopper routes */}
        <Route path="shop" element={
          !currentUser ? <Navigate to="/auth" replace state={{ from: location }} /> :
          userRole === "owner" ? <Navigate to="/dashboard" replace state={{ from: location }} /> :
          <ShopPage />
        } />
        
        <Route path="cart" element={
          !currentUser ? <Navigate to="/auth" replace state={{ from: location }} /> :
          userRole === "owner" ? <Navigate to="/dashboard" replace state={{ from: location }} /> :
          <CartPage />
        } />
        
        <Route path="search" element={
          !currentUser ? <Navigate to="/auth" replace state={{ from: location }} /> :
          userRole === "owner" ? <Navigate to="/dashboard" replace state={{ from: location }} /> :
          <SearchPage />
        } />
        
        <Route path="recipes" element={
          !currentUser ? <Navigate to="/auth" replace state={{ from: location }} /> :
          userRole === "owner" ? <Navigate to="/dashboard" replace state={{ from: location }} /> :
          <RecipesPage />
        } />
        
        {/* Owner route */}
        <Route path="dashboard" element={
          !currentUser ? <Navigate to="/auth" replace state={{ from: location }} /> :
          userRole === "owner" ? <DashboardPage /> :
          <Navigate to="/shop" replace state={{ from: location }} />
        } />
      </Route>
      
      {/* Auth route */}
      <Route path="/auth" element={
        currentUser ? (
          userRole === "owner" ? <Navigate to="/dashboard" replace state={{ from: location }} /> : 
          <Navigate to="/shop" replace state={{ from: location }} />
        ) : <AuthPage />
      } />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
