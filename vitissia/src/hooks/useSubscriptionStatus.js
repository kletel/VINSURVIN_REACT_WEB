import { useEffect, useState } from "react";

function readSubscription() {
    try {
        const raw = localStorage.getItem("SUBSCRIPTION") || sessionStorage.getItem("SUBSCRIPTION");
        if (raw) return JSON.parse(raw);
    } catch { }
    return {
        isPremium: (localStorage.getItem("isPremium") === "true") || (sessionStorage.getItem("isPremium") === "true"),
        isExpired: false,
        subscriptionStatus: "unknown",
        subscriptionInfo: null,
        updatedAt: 0,
    };
}

export function useSubscriptionStatus() {
    const [sub, setSub] = useState(readSubscription());

    useEffect(() => {
        const onUpdate = (e) => {
            // event CustomEvent("subscription:update")
            const next = e?.detail ?? readSubscription();
            setSub(next);
        };

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
