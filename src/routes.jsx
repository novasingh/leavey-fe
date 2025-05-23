import { Routes, Route, Navigate } from 'react-router-dom'
import { ForgotPassword, ForgotPasswordConfirmation, Login, PasswordReset, UserVerification } from './pages/auth'
import { Dashboard } from './pages/dashboard'
import MainLayout from './layouts/MainLayout'

// Create placeholder components for routes we haven't implemented yet
const PlaceholderPage = ({ title }) => (
  <MainLayout>
    <div className="text-center py-5">
      <h2>{title}</h2>
      <p className="text-muted">This page is under construction</p>
    </div>
  </MainLayout>
);

const Calendar = () => <PlaceholderPage title="Calendar" />;
const Team = () => <PlaceholderPage title="Team" />;
const LeaveRequests = () => <PlaceholderPage title="Leave Requests" />;
const Reports = () => <PlaceholderPage title="Reports" />;
const Documents = () => <PlaceholderPage title="Documents" />;
const Settings = () => <PlaceholderPage title="Settings" />;

const AppRoutes = () => (
  <Routes>
    {/* Auth Routes */}
    <Route path="/login" element={<Login />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/forgot-password-confirmation" element={<ForgotPasswordConfirmation />} />
    <Route path="/password-reset" element={<PasswordReset />} />
    <Route path="/user-verification" element={<UserVerification />} />
    
    {/* Dashboard Routes */}
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/calendar" element={<Calendar />} />
    <Route path="/team" element={<Team />} />
    <Route path="/leave-requests" element={<LeaveRequests />} />
    <Route path="/reports" element={<Reports />} />
    <Route path="/documents" element={<Documents />} />
    <Route path="/settings" element={<Settings />} />
    
    {/* Root and Not Found Routes */}
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
)

export default AppRoutes
