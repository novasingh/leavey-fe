// Sidebar.jsx
import React from 'react'
import { Link } from 'react-router-dom'

const Sidebar = () => (
  <aside style={{ width: 220, background: '#f4f4f4', padding: '1rem 0' }}>
    <nav>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li><Link to="/dashboard">Dashboard</Link></li>
        {/* Add more links here */}
      </ul>
    </nav>
  </aside>
)

export default Sidebar
