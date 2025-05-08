
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import HomePage from "../pages/HomePage";
import AuthPage from "../pages/AuthPage";
import ShopPage from "../pages/ShopPage";
import DashboardPage from "../pages/DashboardPage";
import CartPage from "../pages/CartPage";
import NotFound from "../pages/NotFound";
import SearchPage from "../pages/SearchPage";
import RecipesPage from "../pages/RecipesPage";
import UserSettingsPage from "../pages/UserSettingsPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="auth" element={<AuthPage />} />
        <Route path="shop" element={<ShopPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="recipes" element={<RecipesPage />} />
        <Route path="settings" element={<UserSettingsPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
