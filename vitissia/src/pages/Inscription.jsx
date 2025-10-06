import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import config from '../config/config';
import authHeader from '../config/authHeader';

const Inscription = () => {
    const navigate = useNavigate();
    const [prenom, setPrenom] = useState("");
    const [nom, setNom] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [statut, setStatut] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [version, setVersion] = useState("");

    useEffect(() => {
        fetch("/version.txt")
            .then(r => r.text())
            .then(t => setVersion(t.trim()))
            .catch(() => {});
    }, []);

    const validate = () => {
        setError("");
        setSuccess("");
        if (!prenom || !nom || !email || !password || !confirmPassword) {
            setError("Veuillez remplir tous les champs obligatoires.");
            return false;
        }
        const emailRegex = /[^@\s]+@[^@\s]+\.[^@\s]+/;
        if (!emailRegex.test(email)) {
            setError("Adresse email invalide.");
            return false;
        }
        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return false;
        }
        if (password.length < 6) {
            setError("Le mot de passe doit contenir au moins 6 caractères.");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            const formData = new FormData();
            formData.append("email", email);
            formData.append("pass", password);
            formData.append("nom", nom);
            formData.append("prenom", prenom);
            if (statut) formData.append("statut", statut);

            const resp = await fetch(`${config.apiBaseUrl}/4DACTION/react_inscription`, {
                method: 'POST',
                headers: authHeader(),
                body: formData,
            });

            const text = (await resp.text()).trim().toLowerCase();
            if (text.includes('succes')) {
                setSuccess("Inscription réussie. Vous pouvez vous connecter.");
                setTimeout(() => navigate('/login'), 800);
            } else if (text.includes('email')) {
                setError("Cet email existe déjà. Essayez de vous connecter ou utilisez une autre adresse.");
            } else {
                setError("Échec de l'inscription. Veuillez réessayer.");
            }
        } catch (err) {
            setError("Erreur réseau. Merci de réessayer.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative">
            {/* Fond héro */}
            <div className="absolute inset-0 -z-0">
                <img src="/bg-vigne.jpeg" alt="Vignes" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/20 to-transparent"></div>
            </div>

            {/* Contenu */}
            <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 w-full max-w-6xl rounded-3xl overflow-hidden backdrop-blur-xl bg-white/70 dark:bg-gray-900/60 border border-white/40 dark:border-gray-800 shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
                    {/* Colonne gauche */}
                    <div className="p-8 md:p-10 border-b lg:border-b-0 lg:border-r border-white/40 dark:border-gray-800">
                        <div className="flex items-center gap-2 mb-4">
                            <img src="/vitissia_LOGO.png" alt="Vitissia" className="h-9 w-auto drop-shadow" />
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">Rejoignez Vitissia</h1>
                        <p className="mt-2 text-sm text-white/90">Créez votre compte pour gérer vos caves, vos notes et vos favoris.</p>
                        <ul className="mt-5 space-y-2 text-sm text-white/90">
                            <li className="flex items-center gap-2"><i className="pi pi-check-circle text-emerald-300"></i> Création et gestion des caves</li>
                            <li className="flex items-center gap-2"><i className="pi pi-check-circle text-emerald-300"></i> Accords mets & vins personnalisés</li>
                            <li className="flex items-center gap-2"><i className="pi pi-check-circle text-emerald-300"></i> Suivi des favoris et dégustations</li>
                        </ul>
                        <div className="mt-6 rounded-2xl overflow-hidden border border-white/40 shadow-lg">
                            <img src="/vigne-card.png" alt="Illustration" className="w-full h-48 object-cover" loading="lazy" />
                        </div>
                    </div>

                    {/* Colonne droite - Formulaire */}
                    <div className="p-8 md:p-10 bg-white/80 dark:bg-gray-900/80">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Créer un compte</h2>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">C’est rapide et gratuit</p>
                        </div>

                        {error && (
                            <div className="mt-5 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800 text-sm">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="mt-5 p-3 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800 text-sm">
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Prénom</label>
                                    <input
                                        type="text"
                                        value={prenom}
                                        onChange={(e) => setPrenom(e.target.value)}
                                        required
                                        className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="Votre prénom"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom</label>
                                    <input
                                        type="text"
                                        value={nom}
                                        onChange={(e) => setNom(e.target.value)}
                                        required
                                        className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="Votre nom"
                                    />
                                </div>
                            </div>

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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirmer le mot de passe</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="********"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Statut (optionnel)</label>
                                <textarea
                                    value={statut}
                                    onChange={(e) => setStatut(e.target.value)}
                                    rows={3}
                                    className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
                                    placeholder="Décrivez votre profil, vos préférences…"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-600 text-white py-2.5 font-semibold shadow-lg shadow-emerald-700/20 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin"></span>
                                        Création…
                                    </>
                                ) : (
                                    <>
                                        <i className="pi pi-user-plus"></i>
                                        Créer un compte
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-5 flex items-center justify-between text-sm">
                            <div></div>
                            <div>
                                Déjà un compte ?{' '}
                                <button
                                    onClick={() => navigate('/login')}
                                    className="text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
                                >
                                    Se connecter
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

export default Inscription;