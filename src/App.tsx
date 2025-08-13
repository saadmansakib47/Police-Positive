import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Layout from "./components/layout/Layout";
import Index from "./pages/Index";
import About from "./pages/About";
import Features from "./pages/Features";
import Contact from "./pages/Contact";
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
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
