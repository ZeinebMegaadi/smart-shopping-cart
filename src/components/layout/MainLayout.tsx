
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { Toaster } from "@/components/ui/toaster";

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background overflow-hidden">
      <Header />
      <main className="flex-grow overflow-hidden">
        <div className="animate-slide-up">
          <Outlet />
        </div>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
};

export default MainLayout;
