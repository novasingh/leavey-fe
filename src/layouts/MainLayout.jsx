// MainLayout.jsx
import React from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

const MainLayout = ({ children }) => (
  <div className="main-layout" style={{ display: 'flex', minHeight: '100vh' }}>
    <Sidebar />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, padding: '1rem' }}>
        {children}
      </main>
    </div>
  </div>
)

export default MainLayout
