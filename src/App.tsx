import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Changelog from "./pages/Changelog";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Methodology from "./pages/Methodology";
import Plan from "./pages/Plan";
import NotFound from "./pages/NotFound";
import CookieConsent from "./components/CookieConsent";

const Support = lazy(() => import("./pages/Support"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/changelog" element={<Changelog />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/methodology" element={<Methodology />} />
          <Route path="/account/plan" element={<Plan />} />
          <Route path="/support" element={<Suspense fallback={null}><Support /></Suspense>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE — and to scripts/static-routes.mjs */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <CookieConsent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
