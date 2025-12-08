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

  console.log('showloginmodal', showLoginModal);

  const isActive = (path) => {
    if (path === "/cave") {
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
    <div
      className="
        fixed bottom-0 left-0 right-0
        md:hidden
        z-[9999]
        backdrop-blur-xl
        bg-black
        border-t border-white/10
        shadow-[0_-4px_18px_rgba(0,0,0,0.6)]
        safe-area-pb
      "
    >
      <div className="flex justify-around items-center px-2 pt-1 pb-2 gap-1">
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => handleClick(item.path)}
              className={`
                flex flex-col items-center justify-center
                py-1.5 px-2
                rounded-2xl
                transition-all duration-200
                min-w-0 flex-1 max-w-[88px]
                ${active
                  ? `
                      text-white
                      bg-gradient-to-t from-[#7f0b21] via-[#b20e2a] to-[#d41132]
                      shadow-[0_0_14px_rgba(212,17,50,0.55)]
                      scale-[1.02]
                    `
                  : `
                      text-gray-300/90
                      hover:text-white
                      hover:bg-white/5
                    `
                }
              `}
            >
              <i
                className={`
                  ${item.icon}
                  text-[18px]
                  mb-0.5
                  ${active ? 'opacity-100' : 'opacity-90'}
                `}
              />
              <span
                className={`
                  text-[11px] font-medium truncate max-w-full leading-tight
                  ${active ? 'font-semibold' : ''}
                `}
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
