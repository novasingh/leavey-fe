// routes.jsx
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Login, ForgotPassword, UserVerification } from './pages/auth'
import { Dashboard } from './pages/dashboard'

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/user-verification" element={<UserVerification />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/" element={<Login />} />
  </Routes>
)

export default AppRoutes
