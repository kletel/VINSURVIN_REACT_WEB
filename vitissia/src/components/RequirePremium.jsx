// components/RequirePremium.jsx
import React, { useEffect, useState, useRef } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSubscriptionStatus } from "../hooks/useSubscriptionStatus";
import { openSubscriptionScreen, isRunningInRNWebView } from "../utils/rnBridge";

export default function RequirePremium({ redirectTo = "/sommelier" }) {
  const sub = useSubscriptionStatus();
  const location = useLocation();

  const inRN = isRunningInRNWebView();
  const isPremium = !!sub?.isPremium;

  // Tant que l’injection n’est pas arrivée, status peut être unknown
  const isUnknown =
    inRN && (!sub?.subscriptionStatus || sub.subscriptionStatus === "unknown");

  // anti-boucle
  const [asked, setAsked] = useState(false);
  const lastAskRef = useRef(0);

  useEffect(() => {
    if (!inRN) return;
    if (isPremium) return;

    const now = Date.now();
    const COOLDOWN_MS = 2500;

    // si on a déjà demandé récemment, on ne spam pas
    if (asked) return;
    if (now - lastAskRef.current < COOLDOWN_MS) return;

    lastAskRef.current = now;
    setAsked(true);

    // ✅ comportement voulu : si pas premium => ouvrir le paywall
    openSubscriptionScreen();
  }, [inRN, isPremium, asked]);

  // ✅ si premium => ok
  if (isPremium) return <Outlet />;

  // ✅ RN : pas de Navigate, pas de page premium
  if (inRN) {
    // écran neutre : soit on attend l’injection, soit on vient de demander l’ouverture du paywall
    return (
      <div style={{ padding: 24, color: "white" }}>
        <h2 style={{ marginBottom: 8 }}>
          {asked ? "Ouverture des offres…" : "Vérification de l’abonnement…"}
        </h2>
        <p style={{ opacity: 0.85 }}>
          {isUnknown
            ? "Veuillez patienter une seconde."
            : "Cette fonctionnalité nécessite un accès Premium."}
        </p>

        {/* bouton de secours si jamais l’ouverture auto ne se fait pas */}
        <button
          onClick={() => openSubscriptionScreen()}
          style={{
            marginTop: 16,
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.3)",
            background: "rgba(255,255,255,0.12)",
            color: "white",
            cursor: "pointer",
          }}
        >
          Voir les offres
        </button>
      </div>
    );
  }

  // ✅ Web normal
  return <Navigate to={redirectTo} replace state={{ from: location }} />;
}
