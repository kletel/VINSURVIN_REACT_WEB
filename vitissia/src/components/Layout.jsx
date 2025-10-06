import React, { useState, useEffect } from 'react';

const Layout = ({ children }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={`min-h-screen ${isMobile ? 'main-content-mobile' : ''}`}>
      {children}
    </div>
  );
};

export default Layout;
