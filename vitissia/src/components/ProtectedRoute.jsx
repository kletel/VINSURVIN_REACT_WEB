// components/ProtectedRoute.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import LoginRequiredModal from "./LoginRequiredModal";
import { hasStoredToken, syncTokenToSession } from "../hooks/useAuth";

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    syncTokenToSession();
    return hasStoredToken();
  });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const refreshAuthState = () => {
      syncTokenToSession();
      setIsLoggedIn(hasStoredToken());
    };
    refreshAuthState();
    window.addEventListener("app-auth-changed", refreshAuthState);
    window.addEventListener("storage", refreshAuthState);
    return () => {
      window.removeEventListener("app-auth-changed", refreshAuthState);
      window.removeEventListener("storage", refreshAuthState);
    };
  }, []);

  // Dès qu'on détecte "pas connecté" → on affiche la modale
  useEffect(() => {
    if (!isLoggedIn) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [isLoggedIn]);

  if (isLoggedIn) {
    // Utilisateur connecté → on affiche le contenu protégé
    return children;
  }

  return (
    <>
      <LoginRequiredModal
        visible={showModal}
        onLogin={() => {
          setShowModal(false);
          navigate("/login", {
            state: { from: location.pathname },
          });
        }}
        onCancel={() => {
          setShowModal(false);
          navigate("/"); // retour au dashboard visiteur
        }}
      />

      {/* fond de repli derrière la modale si elle est fermée */}
      <div className="min-h-[60vh] bg-[#3B0B15]" />
    </>
  );
};

export default ProtectedRoute;
