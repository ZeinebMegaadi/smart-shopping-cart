
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import NotFound from "@/pages/NotFound";
import HomePage from "@/pages/HomePage";
import AuthPage from "@/pages/AuthPage";
import ShopPage from "@/pages/ShopPage";
import CartPage from "@/pages/CartPage";
import SearchPage from "@/pages/SearchPage";
import DashboardPage from "@/pages/DashboardPage";
import RecipesPage from "@/pages/RecipesPage";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStatus } from "@/hooks/useAuthStatus";

const AppRoutes = () => {
  const { isAuthenticated, userRole, isLoading } = useAuthStatus();
  
  // Show loading state while checking authentication
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
        {/* Home route - redirect based on auth status and role */}
        <Route 
          index 
          element={
            isAuthenticated ? (
              userRole === "owner" ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/shop" replace />
              )
            ) : (
              <HomePage />
            )
          } 
        />
        
        {/* Shopper routes - protected */}
        <Route 
          path="shop" 
          element={
            isAuthenticated ? (
              userRole === "owner" ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <ShopPage />
              )
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
        
        <Route 
          path="cart" 
          element={
            isAuthenticated ? (
              userRole === "owner" ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <CartPage />
              )
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
        
        <Route 
          path="search" 
          element={
            isAuthenticated ? (
              userRole === "owner" ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <SearchPage />
              )
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
        
        <Route 
          path="recipes" 
          element={
            isAuthenticated ? (
              userRole === "owner" ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <RecipesPage />
              )
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
        
        {/* Owner route - protected */}
        <Route 
          path="dashboard" 
          element={
            isAuthenticated ? (
              userRole === "owner" ? (
                <DashboardPage />
              ) : (
                <Navigate to="/shop" replace />
              )
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
      </Route>
      
      {/* Auth route */}
      <Route 
        path="/auth" 
        element={
          isAuthenticated ? (
            userRole === "owner" ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/shop" replace />
            )
          ) : (
            <AuthPage />
          )
        } 
      />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
