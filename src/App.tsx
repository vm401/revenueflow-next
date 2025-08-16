import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Overview from "./pages/Overview";
import Campaigns from "./pages/Campaigns";
import Upload from "./pages/Upload";
import Creatives from "./pages/Creatives";
import Apps from "./pages/Apps";
import Exchanges from "./pages/Exchanges";
import Inventory from "./pages/Inventory";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

// Enhanced QueryClient configuration for production
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors except 408, 429
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          if (error?.response?.status === 408 || error?.response?.status === 429) {
            return failureCount < 2;
          }
          return false;
        }
        // Retry on network errors and 5xx errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: false, // Don't retry mutations by default
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DataProvider>
          <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route 
                path="/overview" 
                element={
                  <ProtectedRoute>
                    <Overview />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/campaigns" 
                element={
                  <ErrorBoundary>
                    <Campaigns />
                  </ErrorBoundary>
                } 
              />
              <Route 
                path="/upload" 
                element={
                  <ErrorBoundary>
                    <Upload />
                  </ErrorBoundary>
                } 
              />
              <Route 
                path="/creatives" 
                element={
                  <ProtectedRoute>
                    <Creatives />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/apps" 
                element={
                  <ProtectedRoute>
                    <Apps />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/exchanges" 
                element={
                  <ProtectedRoute>
                    <Exchanges />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/inventory" 
                element={
                  <ProtectedRoute>
                    <Inventory />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          {/* React Query Devtools - only in development */}
          {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
          </TooltipProvider>
        </DataProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
