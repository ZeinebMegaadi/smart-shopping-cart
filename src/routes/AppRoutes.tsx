
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
import { useEffect } from "react";

const AppRoutes = () => {
  const { currentUser, userRole, isLoading } = useAuth();
  const location = useLocation();

  // Handle route redirection based on user role
  useEffect(() => {
    if (!isLoading && currentUser && userRole) {
      // After login, direct users based on their role
      if (location.pathname === "/auth" || location.pathname === "/") {
        if (userRole === "owner") {
          // Navigate owners to dashboard
          window.location.href = "/dashboard";
        } else if (userRole === "shopper") {
          // Navigate shoppers to shop
          window.location.href = "/shop";
        }
      }
    }
  }, [currentUser, userRole, location.pathname, isLoading]);

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="shop" element={<ShopPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route 
          path="dashboard" 
          element={
            currentUser ? 
              userRole === "owner" ? <DashboardPage /> : <Navigate to="/shop" />
              : <Navigate to="/auth" />
          } 
        />
        <Route path="recipes" element={<RecipesPage />} />
      </Route>
      <Route 
        path="/auth" 
        element={currentUser ? <Navigate to={userRole === "owner" ? "/dashboard" : "/shop"} /> : <AuthPage />} 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
