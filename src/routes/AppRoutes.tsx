
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
  
  // Debug user state
  console.log("AppRoutes render - currentUser:", !!currentUser, "userRole:", userRole);

  // Simple state-based routing without excessive redirects
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Public route - Home */}
        <Route index element={
          !currentUser ? <HomePage /> :
          userRole === "owner" ? <Navigate to="/dashboard" replace /> :
          <Navigate to="/shop" replace />
        } />
        
        {/* Shopper routes */}
        <Route path="shop" element={
          !currentUser ? <Navigate to="/auth" replace /> :
          userRole === "owner" ? <Navigate to="/dashboard" replace /> :
          <ShopPage />
        } />
        
        <Route path="cart" element={
          !currentUser ? <Navigate to="/auth" replace /> :
          userRole === "owner" ? <Navigate to="/dashboard" replace /> :
          <CartPage />
        } />
        
        <Route path="search" element={
          !currentUser ? <Navigate to="/auth" replace /> :
          userRole === "owner" ? <Navigate to="/dashboard" replace /> :
          <SearchPage />
        } />
        
        <Route path="recipes" element={
          !currentUser ? <Navigate to="/auth" replace /> :
          userRole === "owner" ? <Navigate to="/dashboard" replace /> :
          <RecipesPage />
        } />
        
        {/* Owner route */}
        <Route path="dashboard" element={
          !currentUser ? <Navigate to="/auth" replace /> :
          userRole === "owner" ? <DashboardPage /> :
          <Navigate to="/shop" replace />
        } />
      </Route>
      
      {/* Auth route */}
      <Route path="/auth" element={
        currentUser ? (
          userRole === "owner" ? <Navigate to="/dashboard" replace /> : 
          <Navigate to="/shop" replace />
        ) : <AuthPage />
      } />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
