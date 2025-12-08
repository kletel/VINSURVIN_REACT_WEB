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
    <div
      id="main-scroll"
      className={`min-h-screen bg-gradient-to-b from-[#8C2438] via-[#5A1020] to-[#3B0B15] ${
        isMobile ? 'main-content-mobile' : ''
      }`}
    >
      {children}
    </div>
  );
};

export default Layout;
