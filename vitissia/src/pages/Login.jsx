import React, { useState, useEffect } from "react";
import "../styles/Login.css";
import useAuth from '../hooks/useAuth';
import { useNavigate, useSearchParams } from "react-router-dom";

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
        login();
    };

    // Affichage pendant la connexion automatique
    if (isAutoLogging) {
        return (
            <div className="min-h-screen relative px-4">
                <div className="absolute inset-0">
                    <img src="/bg-vigne.jpeg" alt="Fond" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/20 to-transparent"></div>
                </div>
                <div className="relative z-10 min-h-screen flex items-center justify-center">
                    <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/60 border border-white/40 dark:border-gray-800 rounded-2xl shadow-2xl p-10 text-center">
                        <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">Connexion automatique en cours…</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Redirection vers le tableau de bord</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative">
            {/* Fond héro plein écran */}
            <div className="absolute inset-0 -z-0">
                <img src="/bg-vigne.jpeg" alt="Vignes" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/20 to-transparent"></div>
            </div>

            {/* Contenu */}
            <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 w-full max-w-6xl rounded-3xl overflow-hidden backdrop-blur-xl bg-white/70 dark:bg-gray-900/60 border border-white/40 dark:border-gray-800 shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
                    {/* Bloc intro gauche */}
                    <div className="p-8 md:p-10 border-b lg:border-b-0 lg:border-r border-white/40 dark:border-gray-800">
                        <div className="flex items-center gap-2 mb-4">
                            <img src="/vitissia_LOGO.png" alt="Vitissia" className="h-9 w-auto drop-shadow" />
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">Votre cave, boostée par l’IA</h1>
                        <p className="mt-2 text-sm text-white/90">
                            Explorez toutes les fiches vins, remplissez vos notes, et laissez l’IA vous proposer des recettes assorties.
                        </p>
                        <ul className="mt-5 space-y-2 text-sm text-white/90">
                            <li className="flex items-center gap-2"><i className="pi pi-sparkles text-emerald-300"></i> Assistant IA pour vous guider dans vos choix</li>
                            <li className="flex items-center gap-2"><i className="pi pi-check-circle text-emerald-300"></i> Lire tous types de vins et compléter une fiche</li>
                            <li className="flex items-center gap-2"><i className="pi pi-check-circle text-emerald-300"></i> Générer des recettes qui matchent votre vin</li>
                        </ul>
                        <div className="mt-6 rounded-2xl overflow-hidden border border-white/40 shadow-lg">
                            <img src="/vigne-card.png" alt="Illustration Vitissia" className="w-full h-48 object-cover" loading="lazy" />
                        </div>
                    </div>

                    {/* Bloc formulaire droit */}
                    <div className="p-8 md:p-10 bg-white/80 dark:bg-gray-900/80">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Se connecter</h2>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Accédez à votre espace personnel</p>
                        </div>

                        {(error || localError) && (
                            <div className="mt-5 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800 text-sm">
                                {error || localError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="vous@exemple.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mot de passe</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="********"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-600 text-white py-2.5 font-semibold shadow-lg shadow-emerald-700/20"
                            >
                                <i className="pi pi-sign-in"></i>
                                Se connecter
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-300/70 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:border-emerald-800 dark:hover:bg-emerald-900/10 py-2.5 font-semibold"
                            >
                                <i className="pi pi-compass"></i>
                                Continuer en visiteur
                            </button>
                        </form>

                        <div className="mt-5 flex items-center justify-between text-sm">
                            <button
                                onClick={() => navigate('/forgot-password')}
                                className="text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
                            >
                                Mot de passe oublié ?
                            </button>
                            <div>
                                Pas de compte ?{' '}
                                <button
                                    onClick={() => navigate('/inscription')}
                                    className="text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
                                >
                                    Créer un compte
                                </button>
                            </div>
                        </div>

                        {version && (
                            <div className="mt-6 text-[11px] text-gray-500 dark:text-gray-400">v{version}</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
