import { useEffect, useState } from "react";

function safeJson(raw) {
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}

function readSubscription() {
    // ✅ source principale
    const raw = localStorage.getItem("SUBSCRIPTION") || sessionStorage.getItem("SUBSCRIPTION");
    const parsed = safeJson(raw);
    if (parsed && typeof parsed === "object") return parsed;

    // ✅ fallback sur tes clés existantes
    const infoRaw = localStorage.getItem("subscriptionInfo") || sessionStorage.getItem("subscriptionInfo");
    return {
        isPremium:
            localStorage.getItem("isPremium") === "true" ||
            sessionStorage.getItem("isPremium") === "true",
        isExpired:
            localStorage.getItem("isExpired") === "true" ||
            sessionStorage.getItem("isExpired") === "true",
        subscriptionStatus:
            localStorage.getItem("subscriptionStatus") ||
            sessionStorage.getItem("subscriptionStatus") ||
            "unknown",
        subscriptionInfo: safeJson(infoRaw),
        updatedAt: Date.now(),
        source: "fallback",
    };
}

export function useSubscriptionStatus() {
    const [sub, setSub] = useState(readSubscription());

    useEffect(() => {
        // ✅ important: re-lire au mount (au cas où l’event a été manqué)
        setSub(readSubscription());
        const t = setTimeout(() => setSub(readSubscription()), 300);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        const onUpdate = (e) => setSub(e?.detail ?? readSubscription());
        const onLegacy = () => setSub(readSubscription());

        window.addEventListener("subscription:update", onUpdate);
        window.addEventListener("app-subscription-changed", onLegacy);

        return () => {
            window.removeEventListener("subscription:update", onUpdate);
            window.removeEventListener("app-subscription-changed", onLegacy);
        };
    }, []);

    return sub;
}
