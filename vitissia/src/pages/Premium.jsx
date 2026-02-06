// pages/Premium.jsx
import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { isRunningInRNWebView, openSubscriptionScreen } from "../utils/rnBridge";
import { useSubscriptionStatus } from "../hooks/useSubscriptionStatus";

export default function Premium() {
  const location = useLocation();
  const navigate = useNavigate();
  const sub = useSubscriptionStatus();

  const inRN = isRunningInRNWebView();
  const isPremium = !!sub?.isPremium;

  const fromPath = useMemo(() => {
    // Là où l’utilisateur voulait aller (depuis RequirePremium)
    return location.state?.from?.pathname || "/sommelier";
  }, [location.state]);

  // Si déjà premium, on renvoie vers la cible
  if (isPremium) {
    // replace pour éviter de revenir sur premium via back
    navigate(fromPath, { replace: true });
    return null;
  }

  const handleSubscribe = () => {
    if (inRN) {
      openSubscriptionScreen();
      return;
    }

    // ✅ WEB: remplace par ton URL de pricing/checkout (Stripe, etc.)
    // Exemple :
    // window.location.href = "https://ton-site.fr/pricing";
    alert("TODO: brancher la page de paiement web (Stripe/pricing).");
  };

  const handleRestore = () => {
    if (inRN) {
      // Option 1 : tu ajoutes un message RN "RESTORE_PURCHASES"
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({ type: "RESTORE_PURCHASES" })
        );
      }
      return;
    }

    alert("Restauration disponible dans l’app mobile (iOS/Android).");
  };

  const handleBack = () => {
    // si on vient d’un guard, retour vers sommelier ou vers fromPath
    navigate(fromPath, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#8C2438] via-[#5A1020] to-[#3B0B15]">
      <div className="font-['Work_Sans',sans-serif] max-w-3xl mx-auto px-4 py-10">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 border border-white/15 shadow-lg">
            <i className="pi pi-lock text-white text-2xl" />
          </div>

          <h1 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            Accès Premium requis
          </h1>

          <p className="mt-2 text-sm md:text-base text-gray-100/90">
            Cette fonctionnalité du sommelier est réservée aux abonnés Premium.
          </p>

          <div className="mt-3 text-[11px] text-gray-200/70">
            Destination demandée :{" "}
            <span className="font-mono">{fromPath}</span>
          </div>
        </div>

        {/* Cards avantages */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 bg-black/20 backdrop-blur-xl p-5 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <i className="pi pi-sparkles text-[#ffb5c3]" />
              </div>
              <div className="text-white font-semibold">Sommelier IA</div>
            </div>
            <p className="mt-2 text-sm text-gray-100/85">
              Recommandations de vins, analyse de carte, sélection instantanée.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 backdrop-blur-xl p-5 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <i className="pi pi-database text-[#ffb5c3]" />
              </div>
              <div className="text-white font-semibold">Cave & équilibre</div>
            </div>
            <p className="mt-2 text-sm text-gray-100/85">
              Analyse de cave, conseils pour diversifier, suivi intelligent.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 backdrop-blur-xl p-5 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <i className="pi pi-shield text-[#ffb5c3]" />
              </div>
              <div className="text-white font-semibold">Accès illimité</div>
            </div>
            <p className="mt-2 text-sm text-gray-100/85">
              Accédez à toutes les fonctions Premium sans limitation.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 backdrop-blur-xl p-5 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <i className="pi pi-refresh text-[#ffb5c3]" />
              </div>
              <div className="text-white font-semibold">Restauration</div>
            </div>
            <p className="mt-2 text-sm text-gray-100/85">
              Vous avez déjà acheté ? Restaurez vos achats en un clic.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 rounded-3xl border border-white/10 bg-black/25 backdrop-blur-xl p-6 shadow-2xl">
          <div className="text-white font-semibold text-lg">
            Débloquez Premium
          </div>
          <p className="mt-1 text-sm text-gray-100/85">
            {inRN
              ? "Les offres s’ouvrent dans le paywall de l’application."
              : "Vous allez être redirigé vers la page d’abonnement web."}
          </p>

          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSubscribe}
              className="
                inline-flex items-center justify-center gap-2
                rounded-xl
                bg-gradient-to-r from-[#d41132] via-[#b20e2a] to-[#7f0b21]
                hover:from-[#ff2852] hover:via-[#d41132] hover:to-[#8a0b23]
                text-white py-2.5 px-4 font-semibold
                shadow-lg shadow-black/50
                transition-all duration-200
                active:scale-[0.98]
              "
            >
              <i className="pi pi-credit-card" />
              S’abonner / Voir les offres
            </button>

            <button
              onClick={handleRestore}
              className="
                inline-flex items-center justify-center gap-2
                rounded-xl border border-white/25
                text-gray-100 hover:bg-white/10
                py-2.5 px-4 font-semibold
                transition-all duration-200
              "
            >
              <i className="pi pi-refresh" />
              Restaurer mes achats
            </button>

            <button
              onClick={handleBack}
              className="
                inline-flex items-center justify-center gap-2
                rounded-xl border border-white/25
                text-gray-100 hover:bg-white/10
                py-2.5 px-4 font-semibold
                transition-all duration-200
              "
            >
              <i className="pi pi-arrow-left" />
              Retour
            </button>
          </div>

          <div className="mt-4 text-[11px] text-gray-200/70">
            Astuce : si vous venez d’acheter dans l’app, fermez le paywall puis
            revenez ici — le statut se mettra à jour.
          </div>
        </div>
      </div>
    </div>
  );
}
