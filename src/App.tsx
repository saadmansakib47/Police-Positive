import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
<<<<<<< HEAD
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
=======
import Layout from "./components/layout/Layout";
>>>>>>> dev
import Index from "./pages/Index";
import About from "./pages/About";
import Features from "./pages/Features";
import Contact from "./pages/Contact";
<<<<<<< HEAD
import Login from "./pages/Login";
import Register from "./pages/Register";
=======
>>>>>>> dev
import Operator from "./pages/Operator";
import Supervisor from "./pages/Supervisor";
import Civilian from "./pages/Civilian";
import Report from "./pages/Report";
import Track from "./pages/Track";
import Patrol from "./pages/Patrol";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
<<<<<<< HEAD
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected routes with layout */}
              <Route element={<Layout />}>
                <Route index element={<Index />} />
                <Route path="about" element={<About />} />
                <Route path="features" element={<Features />} />
                <Route path="contact" element={<Contact />} />

                {/* Role-specific protected routes */}
                <Route 
                  path="operator" 
                  element={
                    <ProtectedRoute allowedRoles={['operator', 'supervisor']}>
                      <Operator />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="supervisor" 
                  element={
                    <ProtectedRoute allowedRoles={['supervisor']}>
                      <Supervisor />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="civilian" 
                  element={
                    <ProtectedRoute allowedRoles={['civilian']}>
                      <Civilian />
                    </ProtectedRoute>
                  } 
                />

                {/* General protected routes */}
                <Route 
                  path="report" 
                  element={
                    <ProtectedRoute>
                      <Report />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="track" 
                  element={
                    <ProtectedRoute>
                      <Track />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="patrol" 
                  element={
                    <ProtectedRoute allowedRoles={['operator', 'supervisor']}>
                      <Patrol />
                    </ProtectedRoute>
                  } 
                />

                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
=======
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Index />} />
              <Route path="about" element={<About />} />
              <Route path="features" element={<Features />} />
              <Route path="contact" element={<Contact />} />

              {/* Role views */}
              <Route path="operator" element={<Operator />} />
              <Route path="supervisor" element={<Supervisor />} />
              <Route path="civilian" element={<Civilian />} />

              {/* Actions */}
              <Route path="report" element={<Report />} />
              <Route path="track" element={<Track />} />
              <Route path="patrol" element={<Patrol />} />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
>>>>>>> dev
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
