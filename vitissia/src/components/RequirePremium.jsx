// components/RequirePremium.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSubscriptionStatus } from "../hooks/useSubscriptionStatus";
import { openSubscriptionScreen, isRunningInRNWebView } from "../utils/rnBridge";

const readIsInternal = () =>
  (localStorage.getItem("isInternal") === "true") ||
  (sessionStorage.getItem("isInternal") === "true");

export default function RequirePremium({ redirectTo = "/sommelier" }) {
  const sub = useSubscriptionStatus();
  const location = useLocation();

  const inRN = isRunningInRNWebView();
  const isPremium = !!sub?.isPremium;

  // ✅ internal bypass
  const isInternal = readIsInternal();

  // ✅ premium effectif
  const effectivePremium = isPremium || isInternal;

  // Tant que l’injection n’est pas arrivée, status peut être unknown
  const isUnknown =
    inRN && (!sub?.subscriptionStatus || sub.subscriptionStatus === "unknown");

  const [asked, setAsked] = useState(false);
  const lastAskRef = useRef(0);

  const resetOpenState = useCallback(() => {
    setAsked(false);
    lastAskRef.current = 0;
  }, []);

  useEffect(() => {
    // ✅ si on change de page, on autorise une nouvelle ouverture de paywall
    resetOpenState();
  }, [location.pathname, resetOpenState]);

  useEffect(() => {
    // ✅ quand le WebView redevient actif (fermeture paywall), on ré-autorise
    const onFocus = () => resetOpenState();
    const onVisibility = () => {
      if (document.visibilityState === "visible") resetOpenState();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [resetOpenState]);

  const tryOpenPaywall = useCallback((opts = {}) => {
    if (!inRN) return false;
    const force = !!opts.force;
    const now = Date.now();
    const COOLDOWN_MS = 2500;
    if (!force && now - lastAskRef.current < COOLDOWN_MS) return false;
    lastAskRef.current = now;
    setAsked(true);
    openSubscriptionScreen();
    return true;
  }, [inRN, openSubscriptionScreen]);

  useEffect(() => {
    if (!inRN) return;

    // ✅ si internal OU premium => pas de paywall
    if (effectivePremium) return;

    if (isUnknown) return;

    if (asked) return;
    tryOpenPaywall();
  }, [inRN, effectivePremium, isUnknown, asked, tryOpenPaywall]);

  // ✅ si premium OU internal => ok
  if (effectivePremium) return <Outlet />;

  if (inRN) {
    return (
      <div style={{ padding: 24, color: "white" }}>
        <h2 style={{ marginBottom: 8 }}>
          {asked ? "Ouverture des offres…" : "Vérification de l’abonnement…"}
        </h2>
        <p style={{ opacity: 0.85 }}>
          {isUnknown ? "Veuillez patienter une seconde." : "Cette fonctionnalité nécessite un accès Premium."}
        </p>
        <button
          onClick={() => tryOpenPaywall({ force: true })}
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

  return <Navigate to={redirectTo} replace state={{ from: location }} />;
}
