import React from 'react';
import { Dialog } from 'primereact/dialog';
import { useNavigate } from 'react-router-dom';

export default function LoginRequiredModal({ visible, onLogin, onCancel }) {
  const navigate = useNavigate();

  return (
    <Dialog
      visible={visible}
      onHide={onCancel}
      modal
      dismissableMask
      style={{ width: '760px', maxWidth: '96vw' }}
      breakpoints={{ '960px': '95vw', '640px': '98vw' }}
      className="login-required-modal"
      header={null}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden rounded-2xl">
        {/* Colonne gauche - Accroche/illustration */}
        <div className="relative p-6 md:p-7 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-800 border border-gray-100 dark:border-gray-700 md:border-r-0 rounded-2xl md:rounded-r-none">
          <div className="flex items-center gap-2 mb-3">
            <img src="/vitissia_LOGO.png" alt="Vitissia" className="h-8 w-auto" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 leading-snug">
            Vitissia avec IA intégrée
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Explorez le livre de cave, lisez toutes les fiches vins et laissez l’IA vous proposer des recettes assorties. Connectez-vous pour gérer vos caves et ajouter vos bouteilles.
          </p>

          <ul className="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-center gap-2"><i className="pi pi-sparkles text-emerald-500"></i> Assistant IA pour guider vos choix</li>
            <li className="flex items-center gap-2"><i className="pi pi-check-circle text-emerald-500"></i> Lire tous types de vins et compléter une fiche</li>
            <li className="flex items-center gap-2"><i className="pi pi-check-circle text-emerald-500"></i> Générer des recettes adaptées à votre vin</li>
            <li className="flex items-center gap-2"><i className="pi pi-check-circle text-emerald-500"></i> Suivre votre stock et vos favoris</li>
          </ul>

          <div className="mt-6 md:mt-8 relative">
            <div className="rounded-xl overflow-hidden border border-emerald-200/60 dark:border-gray-700 shadow-sm">
              <img
                src="/images/bg-verre.jpg"
                alt="Illustration"
                className="w-full h-40 object-cover"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-3 -right-3 hidden md:block bg-white/80 dark:bg-gray-900/80 backdrop-blur px-3 py-1 rounded-full text-[11px] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shadow">
              Accès complet après connexion
            </div>
          </div>
        </div>

        {/* Colonne droite - Appel à l'action */}
        <div className="p-6 md:p-7 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl md:rounded-l-none md:border-l-0">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Connexion requise</h4>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Cette section est réservée aux utilisateurs connectés.</p>
            </div>
           {/* <button
              onClick={onCancel}
              className="w-9 h-9 inline-flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
              aria-label="Fermer"
            >
              <i className="pi pi-times"></i>
            </button>*/}
          </div>

          <div className="mt-6 space-y-3">
            <button
              onClick={onLogin}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 font-medium shadow-sm"
            >
              <i className="pi pi-sign-in"></i>
              Se connecter
            </button>

            <button
              onClick={onCancel}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 py-2.5 font-medium"
            >
              Continuer en visiteur
            </button>

            <div className="text-center">
              <button
                onClick={() => navigate('/inscription')}
                className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
              >
                Créer un compte
              </button>
            </div>
          </div>

          <div className="mt-6 text-[12px] text-gray-500 dark:text-gray-400">
            En vous connectant, vous acceptez nos conditions d’utilisation et notre politique de confidentialité.
          </div>
        </div>
      </div>
    </Dialog>
  );
}
