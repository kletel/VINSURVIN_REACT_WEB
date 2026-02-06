import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import RequirePremium from "./components/RequirePremium";
import Dashboard from "./pages/NewDashboard";
import Vin from "./pages/Vin";
import NouveauVin from './pages/NouveauVin';
import Inscription from "./pages/Inscription";
import RequireAuthForCave from "./components/RequireAuthForCave";
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
import Profil from "./pages/Profil";
import ScrollToTop from './components/ScrollToTop';
import Premium from './pages/Premium';
import { PrimeReactProvider } from 'primereact/api';

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

    useEffect(() => {
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }
    }, []);

    useEffect(() => {
        if (!window.ReactNativeWebView) {
            // ✅ on est sur le web => on nettoie les traces RN
            localStorage.removeItem("APP_HOST");
            sessionStorage.removeItem("APP_HOST");
            localStorage.removeItem("RN_ENV");
            sessionStorage.removeItem("RN_ENV");
        }
    }, []);


    const hideNavigation = ["/login", "/inscription", "/forgot-password", "/reset-password"].includes(location.pathname);

    return (
        <>
            {!hideNavigation && (
                // Navbar uniquement à partir de md (tablette / desktop)
                <div className="hidden md:block">
                    <Navbar />
                </div>
            )}


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
                <Route element={<RequirePremium redirectTo="/sommelier" />}>
                    <Route
                        path="/sommelier/:id"
                        element={
                            <RequireAuthForCave>
                                <SommelierForm />
                            </RequireAuthForCave>
                        }
                    />
                </Route>
                <Route
                    path="/profil"
                    element={
                        <ProtectedRoute>
                            <Profil />
                        </ProtectedRoute>
                    }
                />

            </Routes>

            {/* BottomBar mobile - Affichée en mobile, même sans authentification, sauf pages masquées */}
            {!hideNavigation && isMobile && (
                <>
                    <BottomBar />
                </>
            )}
        </>
    );
}

function App() {
    const isAuthenticated = !!sessionStorage.getItem('token');

    return (
        <PrimeReactProvider
            value={{
                ripple: true,
                inputStyle: 'outlined'
            }}
        >
            <ThemeProvider>
                <Router>
                    <ScrollToTop />
                    <div className="App min-h-screen flex flex-col bg-gradient-to-b from-[#8C2438] via-[#5A1020] to-[#3B0B15] ">
                        <div className="flex-1">
                            <AppContent />
                        </div>
                    </div>
                </Router>
            </ThemeProvider>
        </PrimeReactProvider>
    );
}

export default App;