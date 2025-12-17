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
    const [telephone, setTelephone] = useState("");

    useEffect(() => {
        fetch("/version.txt")
            .then(r => r.text())
            .then(t => setVersion(t.trim()))
            .catch(() => { });
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

            if (telephone) formData.append("telephone", telephone);

            const deviceUUID = localStorage.getItem("deviceUUID");
            if (deviceUUID) formData.append("deviceUUID", deviceUUID);

            const resp = await fetch(`${config.apiBaseUrl}/4DACTION/react_inscription`, {
                method: "POST",
                headers: authHeader(),
                body: formData,
            });

            // 🔧 Fix : on lit d'abord le texte, puis on essaie de parser en JSON
            const rawText = await resp.text();
            let data = rawText;

            try {
                const parsed = JSON.parse(rawText);
                data = parsed;
            } catch {
                // pas du JSON, on garde la string brute
            }

            console.log("RAW inscription response:", rawText);
            console.log("PARSED inscription response:", data);

            if (data?.accessToken) {
                sessionStorage.setItem("token", data.accessToken);
                if (data.uuid_user) sessionStorage.setItem("uuid_user", data.uuid_user);
                if (data.nom_user) sessionStorage.setItem("nom_user", data.nom_user);

                setSuccess("Inscription réussie. Connexion automatique…");
                setTimeout(() => navigate("/dashboard"), 600);
            } else if (typeof data === "string" && data.toLowerCase().includes("succes")) {
                setSuccess("Inscription réussie. Vous pouvez vous connecter.");
                setTimeout(() => navigate("/login"), 800);
            } else if (typeof data === "string" && data.toLowerCase().includes("email")) {
                setError("Cet email existe déjà. Essayez de vous connecter ou utilisez une autre adresse.");
            } else {
                setError("Échec de l'inscription. Veuillez réessayer.");
            }
        } catch (err) {
            console.error(err);
            setError("Erreur réseau. Merci de réessayer.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative font-['Work_Sans',sans-serif]">
            {/* Fond héro */}
            <div className="absolute inset-0 -z-0">
                <img
                    src="/bg-vigne.jpeg"
                    alt="Vignes"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-[#14070a]/85 to-[#2b1419]/90" />
            </div>

            {/* Contenu */}
            <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10">
                <div
                    className="
                        grid grid-cols-1 lg:grid-cols-2
                        w-full max-w-6xl
                        rounded-3xl overflow-hidden
                        backdrop-blur-2xl
                        bg-gradient-to-br from-[#1a090b]/95 via-[#221013]/95 to-[#2b1419]/95
                        border border-white/10
                        shadow-[0_26px_80px_rgba(0,0,0,0.9)]
                    "
                >
                    {/* Colonne gauche */}
                    <div className="relative p-8 md:p-10 border-b lg:border-b-0 lg:border-r border-white/10">
                        {/* Glow décoratif */}
                        <div className="pointer-events-none absolute -top-24 -left-16 w-40 h-40 rounded-full bg-[#ff4b6a]/22 blur-3xl" />

                        <div className="relative">
                            <div className="flex items-center gap-2 mb-4">
                                <img
                                    src="/vitissia_LOGO.png"
                                    alt="Vitissia"
                                    className="h-9 w-auto drop-shadow"
                                />
                                <span className="text-[10px] uppercase tracking-[0.18em] text-[#ffb5c3]">
                                    Vitiss.IA
                                </span>
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
                                Rejoignez Vitissia
                            </h1>
                            <p className="mt-2 text-sm text-gray-100/90">
                                Créez votre compte pour gérer vos caves, vos notes et vos favoris.
                            </p>
                            <ul className="mt-5 space-y-2 text-sm text-gray-100/90">
                                <li className="flex items-center gap-2">
                                    <i className="pi pi-check-circle text-[#ff7a8b]" />
                                    <span>Création et gestion des caves</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <i className="pi pi-check-circle text-[#ff7a8b]" />
                                    <span>Accords mets & vins personnalisés</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <i className="pi pi-check-circle text-[#ff7a8b]" />
                                    <span>Suivi des favoris et dégustations</span>
                                </li>
                            </ul>
                            <div className="mt-6 rounded-2xl overflow-hidden border border-white/20 shadow-lg bg-white/5">
                                <img
                                    src="/vigne-card.png"
                                    alt="Illustration"
                                    className="w-full h-48 object-cover"
                                    loading="lazy"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Colonne droite - Formulaire */}
                    <div className="relative p-8 md:p-10 bg-black/30 backdrop-blur-xl">
                        {/* Overlay verre */}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-white/0 to-black/50 rounded-3xl lg:rounded-none" />

                        <div className="relative">
                            <div>
                                <h2 className="text-2xl font-bold text-white">
                                    Créer un compte
                                </h2>
                                <p className="mt-1 text-sm text-gray-200/90">
                                    C’est rapide et gratuit.
                                </p>
                            </div>

                            {success && (
                                <div
                                    className="
                                        mt-5 p-3 rounded-lg
                                        bg-emerald-950/40
                                        text-emerald-200
                                        border border-emerald-500/60
                                        text-sm
                                        shadow-md shadow-black/40
                                    "
                                >
                                    {success}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-100">
                                            Prénom
                                        </label>
                                        <input
                                            type="text"
                                            value={prenom}
                                            onChange={(e) => setPrenom(e.target.value)}
                                            required
                                            className="
                                                mt-1 block w-full rounded-xl
                                                border border-white/20
                                                bg-black/40
                                                px-3 py-2.5
                                                text-gray-50 placeholder-gray-400
                                                focus:outline-none focus:ring-2
                                                focus:ring-[#ff7a8b] focus:border-[#ff7a8b]
                                                shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]
                                            "
                                            placeholder="Votre prénom"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-100">
                                            Nom
                                        </label>
                                        <input
                                            type="text"
                                            value={nom}
                                            onChange={(e) => setNom(e.target.value)}
                                            required
                                            className="
                                                mt-1 block w-full rounded-xl
                                                border border-white/20
                                                bg-black/40
                                                px-3 py-2.5
                                                text-gray-50 placeholder-gray-400
                                                focus:outline-none focus:ring-2
                                                focus:ring-[#ff7a8b] focus:border-[#ff7a8b]
                                                shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]
                                            "
                                            placeholder="Votre nom"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-100">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="
                                            mt-1 block w-full rounded-xl
                                            border border-white/20
                                            bg-black/40
                                            px-3 py-2.5
                                            text-gray-50 placeholder-gray-400
                                            focus:outline-none focus:ring-2
                                            focus:ring-[#ff7a8b] focus:border-[#ff7a8b]
                                            shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]
                                        "
                                        placeholder="vous@exemple.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-100">
                                        Téléphone (optionnel)
                                    </label>
                                    <input
                                        type="tel"
                                        value={telephone}
                                        onChange={(e) => setTelephone(e.target.value)}
                                        className="
                                            mt-1 block w-full rounded-xl
                                            border border-white/20
                                            bg-black/40
                                            px-3 py-2.5
                                            text-gray-50 placeholder-gray-400
                                            focus:outline-none focus:ring-2
                                            focus:ring-[#ff7a8b] focus:border-[#ff7a8b]
                                            shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]
                                        "
                                        placeholder="Ex : +33 6 12 34 56 78"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-100">
                                            Mot de passe
                                        </label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="
                                                mt-1 block w-full rounded-xl
                                                border border-white/20
                                                bg-black/40
                                                px-3 py-2.5
                                                text-gray-50 placeholder-gray-400
                                                focus:outline-none focus:ring-2
                                                focus:ring-[#ff7a8b] focus:border-[#ff7a8b]
                                                shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]
                                            "
                                            placeholder="********"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-100">
                                            Confirmer le mot de passe
                                        </label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            className="
                                                mt-1 block w-full rounded-xl
                                                border border-white/20
                                                bg-black/40
                                                px-3 py-2.5
                                                text-gray-50 placeholder-gray-400
                                                focus:outline-none focus:ring-2
                                                focus:ring-[#ff7a8b] focus:border-[#ff7a8b]
                                                shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]
                                            "
                                            placeholder="********"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-100">
                                        Statut (optionnel)
                                    </label>
                                    <textarea
                                        value={statut}
                                        onChange={(e) => setStatut(e.target.value)}
                                        rows={3}
                                        className="
                                            mt-1 block w-full rounded-xl
                                            border border-white/20
                                            bg-black/40
                                            px-3 py-2.5
                                            text-gray-50 placeholder-gray-400
                                            focus:outline-none focus:ring-2
                                            focus:ring-[#ff7a8b] focus:border-[#ff7a8b]
                                            resize-y
                                            shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]
                                        "
                                        placeholder="Décrivez votre profil, vos préférences…"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="
                                        w-full inline-flex items-center justify-center gap-2
                                        rounded-xl
                                        bg-gradient-to-r from-[#d41132] via-[#b20e2a] to-[#7f0b21]
                                        hover:from-[#ff2852] hover:via-[#d41132] hover:to-[#8a0b23]
                                        text-white py-2.5 font-semibold
                                        text-sm sm:text-base
                                        shadow-lg shadow-black/60
                                        disabled:opacity-60 disabled:cursor-not-allowed
                                        transition-all duration-200
                                        active:scale-[0.97]
                                    "
                                >
                                    {loading ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                                            Création…
                                        </>
                                    ) : (
                                        <>
                                            <i className="pi pi-user-plus" />
                                            Créer un compte
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-5 flex items-center justify-between text-sm text-gray-200/90">
                                <div></div>
                                <div>
                                    Déjà un compte ?{" "}
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="text-[#ff7a8b] hover:text-[#ffc2ce] transition-colors"
                                    >
                                        Se connecter
                                    </button>
                                </div>
                            </div>

                            {version && (
                                <div className="mt-6 text-[11px] text-gray-300/80">
                                    v{version}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 🔔 POPUP ERREUR */}
            {error && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    {/* Fond sombre cliquable pour fermer */}
                    <div
                        className="absolute inset-0 bg-black/60"
                        onClick={() => setError("")}
                    />
                    {/* Contenu du popup */}
                    <div
                        className="
                            relative z-10 w-full max-w-md
                            rounded-2xl
                            bg-[#3b0b13]/95
                            border border-[#ff7a8b]/70
                            shadow-[0_24px_80px_rgba(0,0,0,0.9)]
                            px-5 py-4
                            text-sm text-[#ffd7df]
                        "
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                                <div
                                    className="
                                        flex-shrink-0 w-9 h-9 rounded-xl
                                        bg-gradient-to-br from-[#ff7a8b] via-[#ff4b6a] to-[#b20e2a]
                                        flex items-center justify-center
                                        shadow-md shadow-black/60
                                    "
                                >
                                    <i className="pi pi-exclamation-triangle text-white text-base" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold mb-1">
                                        Une erreur est survenue
                                    </h3>
                                    <p className="text-xs md:text-sm leading-snug">
                                        {error}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setError("")}
                                className="
                                    ml-2 inline-flex items-center justify-center
                                    w-7 h-7 rounded-full
                                    bg-black/40 hover:bg-black/60
                                    border border-white/20
                                    text-xs text-[#ffd7df]
                                    transition-colors
                                "
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mt-3 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setError("")}
                                className="
                                    inline-flex items-center justify-center gap-2
                                    rounded-xl px-3 py-1.5
                                    bg-white/10 hover:bg-white/15
                                    text-[12px] font-medium
                                    border border-white/25
                                    transition-colors
                                "
                            >
                                <i className="pi pi-check text-[11px]" />
                                Compris
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inscription;
