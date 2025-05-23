import { Routes, Route, Navigate } from 'react-router-dom'
import { ForgotPassword, ForgotPasswordConfirmation, Login, PasswordReset, UserVerification } from './pages/auth'
import { Dashboard } from './pages/dashboard';
import { Calendar } from './pages/calendar';
import { MyLeaves } from './pages/my-leaves';
import { Team } from './pages/team';
import { LeaveRequests } from './pages/leave-requests';
import { Reports } from './pages/reports';
import { Documents } from './pages/documents';
import { Settings } from './pages/settings';
import { Faq } from './pages/faq';
import { Profile } from './pages/profile';
import { Notifications } from './pages/notifications';
import MainLayout from './layouts/MainLayout'
import NotFound from './pages/status/NotFound';

// Wrapper for routes that require MainLayout
const ProtectedRoute = ({ children }) => {
  // Add authentication logic here later
  // For now, assume user is authenticated
  const isAuthenticated = true; 

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <MainLayout>{children}</MainLayout>;
};

const AppRoutes = () => (
  <Routes>
    {/* Auth Routes - These typically use BlankLayout or no layout */}
    <Route path="/login" element={<Login />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/forgot-password-confirmation" element={<ForgotPasswordConfirmation />} />
    <Route path="/password-reset" element={<PasswordReset />} />
    <Route path="/user-verification" element={<UserVerification />} />

    {/* Protected Routes with MainLayout */}
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/calender" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
    <Route path="/my-leaves" element={<ProtectedRoute><MyLeaves /></ProtectedRoute>} /> 
    <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
    <Route path="/leave-requests" element={<ProtectedRoute><LeaveRequests /></ProtectedRoute>} />
    <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
    <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
    <Route path="/faq" element={<ProtectedRoute><Faq /></ProtectedRoute>} />  
    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />   
    <Route path="/*" element={<ProtectedRoute><NotFound title="Page Not Found" /></ProtectedRoute>} />

    {/* Root and Not Found Routes */}
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="*" element={<NotFound />} /> {/* Catch-all for not found pages */}
  </Routes>
)

export default AppRoutes
