
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
  const { currentUser, userRole } = useAuth();
  const location = useLocation();

  // Handle route redirection based on user role
  useEffect(() => {
    if (currentUser && userRole) {
      // After login, direct users based on their role
      if (location.pathname === "/auth" || location.pathname === "/") {
        if (userRole === "owner") {
          // Use window.location to avoid React Router for this initial redirect
          window.location.href = "/dashboard";
        } else {
          window.location.href = "/shop";
        }
      }
    }
  }, [currentUser, userRole, location]);

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="shop" element={<ShopPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="recipes" element={<RecipesPage />} />
      </Route>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
