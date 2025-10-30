import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Buy from "./pages/Buy";
import PropertyDetails from "./pages/PropertyDetails";
import Sell from "./pages/Sell";
import Manage from "./pages/Manage";
import Rent from "./pages/Rent";
import Services from "./pages/Services";
import Auth from "./pages/Auth";
import Dashboard from "@/pages/Dashboard";
import NotFound from "./pages/NotFound";
import Profile from "@/pages/Profile";
import CreateProperty from "@/pages/CreateProperty";
import PWAInstallPrompt from "@/components/PWAInstallPrompt"; // Add this import
import About from "./pages/About";
import Contact from "./pages/Contact";
import Faq from '@/pages/Faq';
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/buy" element={<Buy />} />
            <Route path="/property/:id" element={<PropertyDetails />} />
            <Route path="/sell" element={<Sell />} />
            <Route path="/manage" element={<Manage />} />
            <Route path="/rent" element={<Rent />} />
            <Route path="/services" element={<Services />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />



            {/* Protected Routes */}
            <Route 
              path="/dashboard/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/dashboard/seller/create" 
              element={
                <ProtectedRoute>
                  <CreateProperty />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/create-property" 
              element={
                <ProtectedRoute>
                  <CreateProperty />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/dashboard/seller" 
              element={
                <ProtectedRoute requiredRole="seller">
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/dashboard/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <Dashboard />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          {/* PWA Install Prompt - Appears on all pages */}
          <PWAInstallPrompt />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;