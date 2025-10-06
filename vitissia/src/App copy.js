import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
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

function AppContent() {
  const isLoggedIn = !!sessionStorage.getItem('token');
  const location = useLocation();

  return (
    <>
      {location.pathname !== "/login" && location.pathname !== "/inscription" && location.pathname !== "/forgot-password" && location.pathname !== "/reset-password" && <Navbar />}
      <Routes>
        <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/vin/:UUID_" element={<Vin />} />
        <Route path="/creation-vin" element={<NouveauVin />} />
        <Route path="/millesimes" element={<MillesimesList />} />
        <Route path="/repartition-pays" element={<RepartitionPays />} />
        <Route path="/producteurs" element={<ProducteursList />} />
        <Route path="/cepages" element={<CepagesList />} />
        <Route path="/favoris" element={<FavorisList />} />
        <Route path="/mets-vins" element={<MetsVins />} />
        <Route path="/gerer-cave" element={<GererCave />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/cave" element={<Dashboard />} />
      </Routes>
    </>
  );
}

function App() {
  const isAuthenticated = !!sessionStorage.getItem('token');

  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <div className={`main-content ${isAuthenticated ? 'pb-16 md:pb-0' : ''}`}>
            <AppContent />
          </div>
          {isAuthenticated && <BottomBar />}
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;