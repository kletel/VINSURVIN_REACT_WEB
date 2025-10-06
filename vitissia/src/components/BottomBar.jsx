import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import LoginRequiredModal from './LoginRequiredModal';

const BottomBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!sessionStorage.getItem('token');
  const [showLoginModal, setShowLoginModal] = useState(false);

  const menuItems = [
    {
      path: "/cave",
      icon: "pi pi-home",
      label: "Cave",
      activeColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      path: "/vins-mets",
      icon: "pi pi-search",
      label: "Vin",
      activeColor: "text-blue-600 dark:text-blue-400",
    },
    {
      path: "/creation-vin",
      icon: "pi pi-plus-circle",
      label: "Ajouter",
      activeColor: "text-blue-600 dark:text-blue-400",
    },
    {
      path: "/mets-vins",
      icon: "pi pi-search",
      label: "Met",
      activeColor: "text-blue-600 dark:text-blue-400",
    },
    {
      path: "/dictionnaire",
      icon: "pi pi-book",
      label: "Dictionnaire",
      activeColor: "text-purple-600 dark:text-purple-400",
    },
    {
      path: "/mes-recettes",
      icon: "pi pi-heart",
      label: "Recettes",
      activeColor: "text-rose-600 dark:text-rose-400",
    },
     {
      path: "/sommelier",
      icon: "pi pi-info",
      label: "Sommelier",
      activeColor: "text-blue-600 dark:text-blue-400",
    },
  ];
console.log('showloginmodal',showLoginModal)
  const isActive = (path) => {
    if (path === "/cave") {
      // Désactiver sur le dashboard
      if (location.pathname === "/" || location.pathname === "/dashboard") {
        return false;
      }
      return location.pathname === "/cave";
    }
    return location.pathname === path;
  };

  const protectedPaths = new Set([
    '/cave', '/favoris', '/gerer-cave', '/mes-recettes', '/repartition-pays', '/millesimes', '/vin'
  ]);

  const handleClick = (path) => {
    if (!isLoggedIn && [...protectedPaths].some(p => path.startsWith(p))) {
      setShowLoginModal(true);
      return;
    }
    navigate(path);
  };

  const hideRoutes = new Set(["/login", "/inscription", "/forgot-password", "/reset-password"]);
  const hideOnThisRoute = hideRoutes.has(location.pathname);

  if (hideOnThisRoute) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-[9999] safe-area-pb md:hidden">
      <div className="flex justify-around items-center py-2 px-1">
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => handleClick(item.path)}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 min-w-0 flex-1 max-w-20 ${
                active
                  ? `${item.activeColor} bg-gray-50 dark:bg-gray-700/50`
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <i className={`${item.icon} text-lg mb-1`}></i>
              <span
                className={`text-xs font-medium truncate ${
                  active ? "font-semibold" : ""
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
      <LoginRequiredModal
        visible={showLoginModal}
        onLogin={() => { setShowLoginModal(false); navigate('/login'); }}
        onCancel={() => setShowLoginModal(false)}
      />
    </div>
  );
};

export default BottomBar;
