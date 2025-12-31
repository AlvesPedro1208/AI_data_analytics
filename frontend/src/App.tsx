import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Product from "./pages/Product";
import Integrations from "./pages/Integrations";
import MetaDados from "./pages/MetaDados";
import Settings from "./pages/Settings";
import OAuthCallback from "./pages/OAuthCallback";
import NotFound from "./pages/NotFound";

import { ThemeProvider } from "@/components/theme-provider";
import { IntegrationsProvider } from "@/contexts/IntegrationsContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <IntegrationsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/product" element={<Product />} />
              <Route path="/product/integrations" element={<Integrations />} />
              <Route path="/product/meta/dados" element={<MetaDados />} />
              <Route path="/product/settings" element={<Settings />} />
              <Route path="/oauth/callback" element={<OAuthCallback />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </IntegrationsProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;