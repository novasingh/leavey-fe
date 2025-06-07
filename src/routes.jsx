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
import { LeavesApproval } from './pages/leaves-approval';
import { LeavesHistory } from './pages/leaves-history';
import { Department } from './pages/department';
import { Role } from './pages/role';
import { LeaveSetting } from './pages/leave-setting';
import { Employees } from './pages/employees';
import MainLayout from './layouts/MainLayout'
import NotFound from './pages/status/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

// Wrapper for routes that require MainLayout and authentication
const ProtectedMainLayoutRoute = ({ children }) => {
  return (
    <ProtectedRoute>
      <MainLayout>{children}</MainLayout>
    </ProtectedRoute>
  );
};

const AppRoutes = () => (
  <Routes>
    {/* Auth Routes - These typically use BlankLayout or no layout */}
    <Route path="/login" element={<Login />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/forgot-password-confirmation" element={<ForgotPasswordConfirmation />} />
    <Route path="/password-reset" element={<PasswordReset />} />
    <Route path="/user-verification" element={<UserVerification />} />    {/* Protected Routes with MainLayout */}    <Route path="/dashboard" element={<ProtectedMainLayoutRoute><Dashboard /></ProtectedMainLayoutRoute>} />
    <Route path="/calender" element={<ProtectedMainLayoutRoute><Calendar /></ProtectedMainLayoutRoute>} />
    <Route path="/my-leaves" element={<ProtectedMainLayoutRoute><MyLeaves /></ProtectedMainLayoutRoute>} />
    <Route path="/leaves-approval" element={<ProtectedMainLayoutRoute><LeavesApproval /></ProtectedMainLayoutRoute>} />
    <Route path="/leaves-history" element={<ProtectedMainLayoutRoute><LeavesHistory /></ProtectedMainLayoutRoute>} />
    <Route path="/departments" element={<ProtectedMainLayoutRoute><Department /></ProtectedMainLayoutRoute>} />
    <Route path="/role" element={<ProtectedMainLayoutRoute><Role /></ProtectedMainLayoutRoute>} />
    <Route path="/leave-setting" element={<ProtectedMainLayoutRoute><LeaveSetting /></ProtectedMainLayoutRoute>} />
    <Route path="/employees" element={<ProtectedMainLayoutRoute><Employees /></ProtectedMainLayoutRoute>} />
    <Route path="/team" element={<ProtectedMainLayoutRoute><Team /></ProtectedMainLayoutRoute>} />
    <Route path="/leave-requests" element={<ProtectedMainLayoutRoute><LeaveRequests /></ProtectedMainLayoutRoute>} />
    <Route path="/reports" element={<ProtectedMainLayoutRoute><Reports /></ProtectedMainLayoutRoute>} />
    <Route path="/documents" element={<ProtectedMainLayoutRoute><Documents /></ProtectedMainLayoutRoute>} />
    <Route path="/settings" element={<ProtectedMainLayoutRoute><Settings /></ProtectedMainLayoutRoute>} />
    <Route path="/faq" element={<ProtectedMainLayoutRoute><Faq /></ProtectedMainLayoutRoute>} />
    <Route path="/profile" element={<ProtectedMainLayoutRoute><Profile /></ProtectedMainLayoutRoute>} />
    <Route path="/notifications" element={<ProtectedMainLayoutRoute><Notifications /></ProtectedMainLayoutRoute>} />
    <Route path="/*" element={<ProtectedMainLayoutRoute><NotFound title="Page Not Found" /></ProtectedMainLayoutRoute>} />

    {/* Root and Not Found Routes */}
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="*" element={<NotFound />} /> {/* Catch-all for not found pages */}
  </Routes>
)

export default AppRoutes
