
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Services from "./pages/Services";
import Booking from "./pages/Booking";
import Login from "./pages/Login";
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';
import AdminDashboard from "./pages/AdminDashboard";
import BarberDashboard from "./pages/BarberDashboard";
import NotFound from "./pages/NotFound";

// Safari polyfill for structured clone algorithm
if (!window.structuredClone) {
  window.structuredClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
  };
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Add some retry logic and staleTime to improve cache handling
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false, // Prevent unnecessary refetches in Safari
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/login" element={<Login />} />
          <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
          <Route path="/TermsOfService" element={<TermsOfService />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/barber-dashboard" element={<BarberDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
