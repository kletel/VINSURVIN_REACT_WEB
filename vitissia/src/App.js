import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/NewDashboard";
import Vin from "./pages/Vin";
import NouveauVin from './pages/NouveauVin';
import Inscription from "./pages/Inscription";
import "./styles.css";

// Importer les styles de PrimeReact
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import { ThemeProvider } from './context/ThemeContext';
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import MillesimesList from './pages/MillesimesList';
import RepartitionPays from './pages/RepartitionPays';
import ProducteursList from './pages/ProducteursList';
import CepagesList from './pages/CepagesList';
import FavorisList from './pages/FavorisList';
import MetsVins from './pages/MetsVins';
import GererCave from './pages/GererCave';
import BottomBar from './components/BottomBar';
import Millesimes from './pages/Millesimes';
import Recette from './pages/Recette';
import Dictionnaire from './pages/Dictionnaire';
import VinsMets from './pages/VinsMets';
import Cave from './pages/Cave';
import MesRecettes from './pages/MesRecettes';
import Sommelier from './pages/Sommelier';
import SommelierForm from './pages/SommelierForm';
import ScrollToTop from './components/ScrollToTop';

function AppContent() {
  const isLoggedIn = !!sessionStorage.getItem('token');
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Pages où on ne veut pas afficher la navbar et bottombar
  const hideNavigation = ["/login", "/inscription", "/forgot-password", "/reset-password"].includes(location.pathname);



  return (
    <>
      {/* Navbar desktop et mobile */}
      {!hideNavigation && <Navbar />}

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
  {/* Public routes */}
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/producteurs" element={<ProducteursList />} />
  <Route path="/cepages" element={<CepagesList />} />
  <Route path="/mets-vins" element={<MetsVins />} />
  <Route path="/vins-mets" element={<VinsMets />} />
  <Route path="/recette" element={<Recette />} />
  <Route path="/dictionnaire" element={<Dictionnaire />} />
  <Route path="/" element={<Dashboard />} />
  <Route path="/sommelier" element={<Sommelier />} />

  {/* Protected routes (popup modal si non connecté) */}
  <Route path="/repartition-pays" element={<ProtectedRoute><RepartitionPays /></ProtectedRoute>} />
  <Route path="/millesimes" element={<ProtectedRoute><MillesimesList /></ProtectedRoute>} />
  <Route path="/vin/:UUID_" element={<ProtectedRoute><Vin /></ProtectedRoute>} />
  <Route path="/creation-vin" element={<NouveauVin />} />
  <Route path="/favoris" element={<ProtectedRoute><FavorisList /></ProtectedRoute>} />
  <Route path="/cave" element={<ProtectedRoute><Cave /></ProtectedRoute>} />
  <Route path="/gerer-cave" element={<ProtectedRoute><GererCave /></ProtectedRoute>} />
  <Route path="/mes-recettes" element={<ProtectedRoute><MesRecettes /></ProtectedRoute>} />
  <Route path="/sommelier/:id" element={<ProtectedRoute><SommelierForm /></ProtectedRoute>} />

      </Routes>

  {/* BottomBar mobile - Affichée en mobile, même sans authentification, sauf pages masquées */}
  {!hideNavigation && isMobile && (
        <>
          {/* Debug temporaire - à supprimer après test
          <div className="fixed bottom-20 right-4 bg-red-500 text-white p-2 rounded text-xs z-50">
            BottomBar devrait être visible
          </div>*/}
          <BottomBar />
        </>
      )}
    </>
  );
}

function App() {
  const isAuthenticated = !!sessionStorage.getItem('token');

  return (
    <ThemeProvider>
      <Router>
         <ScrollToTop />
        <div className="App min-h-screen flex flex-col">
          <div className="flex-1">
            <AppContent />
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;