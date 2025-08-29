import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from '@/contexts/NotificationContext';
import Layout from "./components/layout/Layout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import About from "./pages/About";
import Features from "./pages/Features";
import Contact from "./pages/Contact";
import News from "./pages/News";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Operator from "./pages/Operator";
import Supervisor from "./pages/Supervisor";
import Civilian from "./pages/Civilian";
import Report from "./pages/Report";
import Track from "./pages/Track";
import Patrol from "./pages/Patrol";
import NotFound from "./pages/NotFound";
import SafetyTips from "./pages/SafetyTips";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <AuthProvider>
          <NotificationProvider>
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
                    <Route path="news" element={<News />} />
                    <Route path="safety-tips" element={<SafetyTips />} />

                    {/* Role-specific */}
                    <Route
                      path="operator"
                      element={
                        <ProtectedRoute allowedRoles={['civilian', 'operator', 'supervisor']}>
                          <Operator />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="supervisor"
                      element={
                        <ProtectedRoute allowedRoles={['civilian', 'operator', 'supervisor']}>
                          <Supervisor />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="civilian"
                      element={
                        <ProtectedRoute allowedRoles={['civilian', 'operator', 'supervisor']}>
                          <Civilian />
                        </ProtectedRoute>
                      }
                    />

                    {/* General protected */}
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
          </NotificationProvider>
        </AuthProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
