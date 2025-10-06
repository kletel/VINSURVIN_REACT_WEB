import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useBottomBar = () => {
  const [shouldShowBottomBar, setShouldShowBottomBar] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const isLoggedIn = !!sessionStorage.getItem('token');
    const isMobile = window.innerWidth < 768;
    const hidePages = ["/login", "/inscription", "/forgot-password", "/reset-password"];
    const shouldHide = hidePages.includes(location.pathname);

    console.log('BottomBar check:', { isLoggedIn, isMobile, shouldHide });

    setShouldShowBottomBar(isLoggedIn && isMobile && !shouldHide);
  }, [location.pathname]);

  return shouldShowBottomBar;
};
