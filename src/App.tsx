import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import StockDetail from "./pages/StockDetail";
import TradingDashboard from "./pages/TradingDashboard";
import StockCompare from "./pages/StockCompare";
import ChatResearch from "./pages/ChatResearch";
import AccountSettings from "./pages/AccountSettings";
import CreateAccount from "./pages/CreateAccount";
import SignIn from "./pages/SignIn";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { supabase } from "./integrations/supabase/client";
import { PortfolioProvider } from "./hooks/usePortfolioContext";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/signin" element={<SignIn />} />
                  <Route path="/signup" element={<CreateAccount />} />
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/trading" element={
                    <ProtectedRoute>
                      <TradingDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/trading-dashboard" element={
                    <Navigate to="/trading" replace />
                  } />
                  <Route path="/chat-research" element={
                    <ProtectedRoute>
                      <ChatResearch />
                    </ProtectedRoute>
                  } />
                  <Route path="/stock/:symbol" element={
                    <ProtectedRoute>
                      <StockDetail />
                    </ProtectedRoute>
                  } />
                  <Route path="/stock-compare" element={
                    <ProtectedRoute>
                      <StockCompare />
                    </ProtectedRoute>
                  } />
                  <Route path="/account-settings" element={
                    <ProtectedRoute>
                      <AccountSettings />
                    </ProtectedRoute>
                  } />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
