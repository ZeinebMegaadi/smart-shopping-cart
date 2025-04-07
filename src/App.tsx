
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import MainLayout from "./components/layout/MainLayout";
import NotFound from "./pages/NotFound";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import ShopPage from "./pages/ShopPage";
import CartPage from "./pages/CartPage";
import SearchPage from "./pages/SearchPage";
import DashboardPage from "./pages/DashboardPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<HomePage />} />
                <Route path="shop" element={<ShopPage />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="search" element={<SearchPage />} />
                <Route path="dashboard" element={<DashboardPage />} />
              </Route>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
