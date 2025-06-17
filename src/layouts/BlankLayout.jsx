// BlankLayout.jsx
import React, { useState, useEffect } from 'react'
import CustomLoader from '../components/CustomLoader';

const BlankLayout = ({ children }) => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);
  if (loading) return <div style={{width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, display: 'flex', justifyContent: 'center', alignItems: 'center'}}><CustomLoader /></div>;
  return (
    <div className="blank-layout">
      {children}
    </div>
  );
}

export default BlankLayout
