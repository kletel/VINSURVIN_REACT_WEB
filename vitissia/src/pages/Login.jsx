import React, { useState, useEffect } from "react";
import "../styles/Login.css";
import useAuth from '../hooks/useAuth';
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";

const Login = () => {
    const {
        email,
        setEmail,
        password,
        setPassword,
        error,
        login,
        loginMobile,
    } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [localError, setLocalError] = useState("");
    const [version, setVersion] = useState("");
    const [isAutoLogging, setIsAutoLogging] = useState(false);
    const [hasProcessedLogin, setHasProcessedLogin] = useState(false);

    useEffect(() => {
        fetch("/version.txt")
            .then(response => response.text())
            .then(text => setVersion(text.trim()));
    }, []);

    // Auto-login via URL params (tokenTemp/token ou login/password)
    useEffect(() => {
        if (hasProcessedLogin) return;
        const autoLogin = async () => {
            const tokenTemp = searchParams.get('tokenTemp');
            const token = searchParams.get('token');
            const loginParam = searchParams.get('login');
            const passwordParam = searchParams.get('password');

            if (tokenTemp) {
                setIsAutoLogging(true);
                setHasProcessedLogin(true);
                try {
                    await loginMobile(tokenTemp, token);
                } catch (err) {
                    setLocalError("Erreur lors de la connexion automatique: " + err.message);
                } finally {
                    setIsAutoLogging(false);
                }
            } else if (loginParam && passwordParam) {
                setIsAutoLogging(true);
                setHasProcessedLogin(true);
                try {
                    const decodedLogin = decodeURIComponent(loginParam);
                    const decodedPassword = decodeURIComponent(passwordParam);
                    setEmail(decodedLogin);
                    setPassword(decodedPassword);
                    setTimeout(() => { login(); }, 100);
                } catch (err) {
                    setLocalError("Erreur lors de la connexion automatique");
                } finally {
                    setIsAutoLogging(false);
                }
            }
        };
        autoLogin();
    }, [hasProcessedLogin, login, loginMobile, searchParams, setEmail, setPassword]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email || !password) {
            setLocalError("Veuillez remplir tous les champs !");
            return;
        }

        const deviceUUID = localStorage.getItem("deviceUUID");
        if (deviceUUID) {
            sessionStorage.setItem("deviceUUID", deviceUUID);
        }

        login();
    };

    // === ÉCRAN AUTO-LOGIN ===
    if (isAutoLogging) {
        return (
            <div className="relative min-h-screen overflow-x-hidden touch-pan-y font-['Work_Sans',sans-serif]">
                {/* Fond assombri avec la même image */}
                <div className="absolute inset-0 -z-10">
                    <img
                        src="/bg-vigne.jpeg"
                        alt="Fond"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-[#14070a]/85 to-[#2b1419]/90" />
                </div>

                {/* Contenu centré, mais un seul niveau de min-h-screen */}
                <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="
                            w-full max-w-md
                            backdrop-blur-2xl
                            border border-white/10 rounded-2xl
                            shadow-[0_18px_60px_rgba(0,0,0,0.85)]
                            px-6 sm:px-8 py-8 text-center
                        "
                    >
                        <div className="flex justify-center mb-5">
                            <div className="w-14 h-14 rounded-full border-2 border-[#ff7a8b]/60 border-t-transparent animate-spin" />
                        </div>
                        <div className="text-base sm:text-lg font-semibold text-white">
                            Connexion automatique en cours…
                        </div>
                        <div className="text-xs sm:text-sm text-gray-200/90 mt-1">
                            Redirection vers le tableau de bord
                        </div>
                        {(localError || error) && (
                            <div className="mt-4 text-xs sm:text-sm text-[#ffd7df]">
                                {localError || error}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        );
    }

    // === ÉCRAN NORMAL ===
    return (
        <div className="relative min-h-screen overflow-x-hidden touch-pan-y font-['Work_Sans',sans-serif]">
            {/* Fond héro plein écran avec la même image */}
            <div className="absolute inset-0 -z-10">
                <img
                    src="/bg-vigne.jpeg"
                    alt="Vignes"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0" />
            </div>

            {/* Contenu principal — PAS de flex full-screen imbriqué */}
            <div className="relative z-10 px-4 py-8 md:py-10">
                <div className="
                    max-w-6xl mx-auto
                    md:min-h-[calc(100vh-4rem)]
                    md:flex md:items-center md:justify-center
                ">
                    <motion.div
                        initial={{ opacity: 0, y: 18, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="
                            grid grid-cols-1 lg:grid-cols-2
                            rounded-3xl overflow-hidden
                            bg-gradient-to-br from-[#1a090b]/95 via-[#221013]/95 to-[#2b1419]/95
                            border border-white/10
                            shadow-[0_26px_80px_rgba(0,0,0,0.9)]
                        "
                    >
                        {/* Glows décoratifs */}
                        <div className="pointer-events-none absolute -top-24 -left-16 w-40 sm:w-56 h-40 sm:h-56 rounded-full bg-[#ff4b6a]/22 blur-3xl" />
                        <div className="pointer-events-none absolute -bottom-28 -right-10 w-48 sm:w-64 h-48 sm:h-64 rounded-full bg-[#b20e2a]/26 blur-3xl" />

                        {/* Bloc intro gauche */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.35, ease: "easeOut" }}
                            className="relative p-6 sm:p-8 md:p-10 border-b lg:border-b-0 lg:border-r border-white/10"
                        >
                            <div className="flex items-center gap-3 mb-5">
                                <div className="inline-flex items-center justify-center rounded-xl bg-white/5 px-2.5 py-1 ring-1 ring-white/15">
                                    <img
                                        src="/vitissia_LOGO.png"
                                        alt="Vitissia"
                                        className="h-7 sm:h-8 w-auto select-none"
                                    />
                                </div>
                                <span className="text-[10px] sm:text-xs uppercase tracking-[0.18em] text-[#ffb5c3]">
                                    Vitiss.IA
                                </span>
                            </div>

                            <h1 className="text-2xl sm:text-3xl md:text-[2.1rem] font-extrabold tracking-tight text-white leading-snug">
                                Votre cave, boostée par l’IA
                            </h1>
                            <p className="mt-2 text-xs sm:text-sm text-gray-100/90 max-w-md">
                                Explorez toutes les fiches vins, remplissez vos notes, et laissez l’IA vous proposer
                                des recettes assorties parfaitement accordées.
                            </p>

                            <ul className="mt-5 space-y-2 text-xs sm:text-sm text-gray-100/90">
                                <li className="flex items-center gap-2">
                                    <i className="pi pi-sparkles text-[#ff7a8b]" />
                                    <span>Assistant IA pour guider vos choix de vins</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <i className="pi pi-check-circle text-[#ff7a8b]" />
                                    <span>Lire tous types de vins et compléter une fiche détaillée</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <i className="pi pi-check-circle text-[#ff7a8b]" />
                                    <span>Générer des recettes qui matchent avec votre bouteille</span>
                                </li>
                            </ul>

                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, delay: 0.1 }}
                                className="mt-6 rounded-2xl overflow-hidden border border-white/20 bg-white/5 backdrop-blur-sm shadow-xl"
                            >
                                <img
                                    src="/vigne-card.png"
                                    alt="Illustration Vitissia"
                                    className="w-full h-40 sm:h-48 object-cover"
                                    loading="lazy"
                                />
                            </motion.div>
                        </motion.div>

                        {/* Bloc formulaire droit */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.35, ease: "easeOut" }}
                            className="relative p-6 sm:p-8 md:p-10 bg-black/20 backdrop-blur-xl"
                        >
                            {/* Overlay verre subtil */}
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-white/0 to-black/40 rounded-b-3xl lg:rounded-none" />

                            <div className="relative">
                                <h2 className="text-xl sm:text-2xl font-bold text-white">
                                    Se connecter
                                </h2>
                                <p className="mt-1 text-xs sm:text-sm text-gray-200/90">
                                    Accédez à votre espace personnel Vitissia.
                                </p>
                            </div>

                            {(error || localError) && (
                                <div className="
                                    relative mt-5 p-3 rounded-xl
                                    bg-[#3b0b13]/80 border border-[#ff7a8b]/40
                                    text-xs sm:text-sm text-[#ffd7df]
                                    shadow-md shadow-black/40
                                ">
                                    {error || localError}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="relative mt-6 space-y-4">
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-100">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="
                                            mt-1 block w-full rounded-xl
                                            border border-white/20 bg-black/40
                                            px-3 py-2.5
                                            text-gray-50 placeholder-gray-400
                                            text-base md:text-sm 
                                            focus:outline-none focus:ring-2 focus:ring-[#ff7a8b] focus:border-[#ff7a8b]
                                            shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]
                                        "
                                        placeholder="vous@exemple.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-100">
                                        Mot de passe
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="
                                            mt-1 block w-full rounded-xl
                                            border border-white/20 bg-black/40
                                            px-3 py-2.5
                                            text-gray-50 placeholder-gray-400
                                            text-base md:text-sm 
                                            focus:outline-none focus:ring-2 focus:ring-[#ff7a8b] focus:border-[#ff7a8b]
                                            shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]
                                        "
                                        placeholder="********"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="
                                        w-full inline-flex items-center justify-center gap-2
                                        rounded-xl
                                        bg-gradient-to-r from-[#d41132] via-[#b20e2a] to-[#7f0b21]
                                        hover:from-[#ff2852] hover:via-[#d41132] hover:to-[#8a0b23]
                                        text-white py-2.5 font-semibold
                                        text-sm sm:text-base
                                        shadow-lg shadow-black/50
                                        transition-all duration-200
                                        active:scale-[0.97]
                                    "
                                >
                                    <i className="pi pi-sign-in" />
                                    Se connecter
                                </button>

                                <button
                                    type="button"
                                    onClick={() => navigate('/')}
                                    className="
                                        w-full inline-flex.items-center.justify-center.gap-2
                                        rounded-xl border border-white/25
                                        text-gray-100 hover:bg-white/10
                                        py-2.5 font-semibold
                                        text-sm sm:text-base
                                        transition-all.duration-200
                                    "
                                >
                                    <i className="pi pi-compass" />
                                    Continuer en visiteur
                                </button>
                            </form>

                            <div className="relative mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs sm:text-sm text-gray-200/90">
                                <button
                                    onClick={() => navigate('/forgot-password')}
                                    className="text-[#ff7a8b] hover:text-[#ffc2ce] transition-colors text-left"
                                >
                                    Mot de passe oublié ?
                                </button>
                                <div className="text-left sm:text-right">
                                    Pas de compte ?{" "}
                                    <button
                                        onClick={() => navigate('/inscription')}
                                        className="text-[#ff7a8b] hover:text-[#ffc2ce] transition-colors"
                                    >
                                        Créer un compte
                                    </button>
                                </div>
                            </div>

                            {version && (
                                <div className="relative mt-6 text-[10px] sm:text-[11px] text-gray-300/80">
                                    v{version}
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Login;
