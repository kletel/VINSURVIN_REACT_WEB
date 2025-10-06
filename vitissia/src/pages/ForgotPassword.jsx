import React, { useState, useEffect } from "react";
import config from "../config/config";
import authHeader from '../config/authHeader';
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [version, setVersion] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/version.txt")
      .then(r => r.text())
      .then(t => setVersion(t.trim()))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const formData = new FormData();
      formData.append("email", email);
      const response = await fetch(`${config.apiBaseUrl}/4DACTION/react_forgotPass`, {
        method: "POST",
        headers: authHeader(),
        body: formData,
      });

      if (!response.ok) throw new Error("Erreur lors de l'envoi du lien de réinitialisation.");

      setMessage("Un lien de réinitialisation a été envoyé à votre adresse e-mail.");
    } catch (err) {
      setError(err.message);
    }
  };

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
            <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">Réinitialiser votre accès</h1>
            <p className="mt-2 text-sm text-white/90">
              Saisissez votre adresse e-mail pour recevoir un lien de réinitialisation.
            </p>
            <div className="mt-6 rounded-2xl overflow-hidden border border-white/40 shadow-lg">
              <img src="/vigne-card.png" alt="Illustration Vitissia" className="w-full h-48 object-cover" loading="lazy" />
            </div>
          </div>

          {/* Bloc formulaire droit */}
          <div className="p-8 md:p-10 bg-white/80 dark:bg-gray-900/80">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Mot de passe oublié</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Renseignez votre email pour recevoir le lien</p>
            </div>

            {message && (
              <div className="mt-5 p-3 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800 text-sm">
                {message}
              </div>
            )}
            {error && (
              <div className="mt-5 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Adresse e-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="vous@exemple.com"
                />
              </div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-600 text-white py-2.5 font-semibold shadow-lg shadow-emerald-700/20"
              >
                <i className="pi pi-envelope"></i>
                Envoyer le lien
              </button>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-300/70 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:border-emerald-800 dark:hover:bg-emerald-900/10 py-2.5 font-semibold"
              >
                <i className="pi pi-sign-in"></i>
                Retour à la connexion
              </button>
            </form>

            {version && (
              <div className="mt-6 text-[11px] text-gray-500 dark:text-gray-400">v{version}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;