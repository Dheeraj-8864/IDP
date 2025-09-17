import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ProtectedRoute, AdminRoute, SuperAdminRoute, UserRoute } from "@/components/auth/ProtectedRoute";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import AdminLogs from "./pages/AdminLogs";
import AdminRequests from "./pages/AdminRequests";
import AdminDrones from "./pages/AdminDrones";
import AdminUsers from "./pages/AdminUsers";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminSettings from "./pages/AdminSettings";
import SuperAdminSystem from "./pages/SuperAdminSystem";
import SuperAdminUsers from "./pages/SuperAdminUsers";
import BrowseDrones from "./pages/BrowseDrones";
import MyRequests from "./pages/MyRequests";
import NewRequest from "./pages/NewRequest";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/user-dashboard" element={<UserRoute><UserDashboard /></UserRoute>} />
            <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/superadmin-dashboard" element={<SuperAdminRoute><SuperAdminDashboard /></SuperAdminRoute>} />
            <Route path="/admin/logs" element={<AdminRoute><AdminLogs /></AdminRoute>} />
            <Route path="/admin/requests" element={<AdminRoute><AdminRequests /></AdminRoute>} />
            <Route path="/admin/drones" element={<AdminRoute><AdminDrones /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
            <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
            <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
            <Route path="/superadmin/system" element={<SuperAdminRoute><SuperAdminSystem /></SuperAdminRoute>} />
            <Route path="/superadmin/users" element={<SuperAdminRoute><SuperAdminUsers /></SuperAdminRoute>} />
            <Route path="/drones" element={<ProtectedRoute><BrowseDrones /></ProtectedRoute>} />
            <Route path="/requests" element={<ProtectedRoute><MyRequests /></ProtectedRoute>} />
            <Route path="/request" element={<ProtectedRoute><NewRequest /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
