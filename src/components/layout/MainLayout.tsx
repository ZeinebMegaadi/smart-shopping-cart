
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { Toaster } from "@/components/ui/toaster";
import { useEffect, useState } from "react";

const MainLayout = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Add a small delay for entrance animation
    setTimeout(() => {
      setIsLoaded(true);
    }, 100);
  }, []);

  return (
    <div className={`flex flex-col min-h-screen bg-background overflow-hidden tech-bg transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl translate-y-1/3"></div>
      </div>
      
      <Header />
      
      <main className="flex-grow overflow-hidden relative z-10">
        <div className="page-transition animate-fade-in">
          <Outlet />
        </div>
      </main>
      
      <Footer />
      <Toaster />
      
      {/* Decorative elements */}
      <div className="fixed top-1/4 right-10 w-20 h-20 rounded-full border border-primary/20 opacity-20 animate-rotate-slow"></div>
      <div className="fixed bottom-1/3 left-10 w-32 h-32 rounded-full border border-secondary/20 opacity-10 animate-rotate-slow" style={{ animationDirection: 'reverse', animationDuration: '15s' }}></div>
    </div>
  );
};

export default MainLayout;
