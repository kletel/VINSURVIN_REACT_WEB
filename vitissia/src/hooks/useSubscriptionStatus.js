import { useCallback, useEffect, useState } from "react";

const ACTIVE_STATUSES = new Set([
    "active",
    "trial",
    "trialing",
    "in_grace_period",
    "grace_period",
    "billing_retry",
]);

const EXPIRED_STATUSES = new Set([
    "expired",
    "inactive",
    "canceled",
    "cancelled",
    "notsubscribed",
]);

function safeJson(raw) {
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}

function readStorage(key, where = "session") {
    if (typeof window === "undefined") return null;
    try {
        if (where === "session") return sessionStorage.getItem(key);
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

function toBool(value) {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") {
        if (value === 1) return true;
        if (value === 0) return false;
        return null;
    }
    if (typeof value === "string") {
        const v = value.trim().toLowerCase();
        if (v === "true" || v === "1") return true;
        if (v === "false" || v === "0") return false;
    }
    return null;
}

function normalizeStatus(value) {
    if (typeof value !== "string") return "";
    return value.trim();
}

function normalizeSubscription(payload, source) {
    if (!payload || typeof payload !== "object") return null;

    const status = normalizeStatus(
        payload.subscriptionStatus ?? payload.status ?? payload.state
    );
    const statusKey = status.toLowerCase();

    const premiumFlag = toBool(
        payload.isPremium ?? payload.premium ?? payload.entitled
    );
    const expiredFlag = toBool(payload.isExpired ?? payload.expired);

    const isPremium =
        premiumFlag !== null ? premiumFlag : ACTIVE_STATUSES.has(statusKey);
    const isExpired =
        expiredFlag !== null ? expiredFlag : EXPIRED_STATUSES.has(statusKey);

    const rawUpdatedAt = Number(payload.updatedAt);
    const updatedAt = Number.isFinite(rawUpdatedAt) ? rawUpdatedAt : 0;

    return {
        ...payload,
        isPremium,
        isExpired,
        subscriptionStatus: status || (isPremium ? "active" : "unknown"),
        subscriptionInfo: payload.subscriptionInfo ?? payload.info ?? null,
        updatedAt,
        source: payload.source || source,
        isInternal: toBool(payload.isInternal) === true,
    };
}

function pickFreshSubscription(sessionSub, localSub) {
    if (!sessionSub) return localSub;
    if (!localSub) return sessionSub;

    const hasSessionTs = (sessionSub.updatedAt || 0) > 0;
    const hasLocalTs = (localSub.updatedAt || 0) > 0;

    if (hasSessionTs && hasLocalTs) {
        return sessionSub.updatedAt >= localSub.updatedAt ? sessionSub : localSub;
    }

    // En cas de doute, on préfère sessionStorage (état de session courant).
    return sessionSub;
}

function readLegacySubscription() {
    const sessionPremium = toBool(readStorage("isPremium", "session"));
    const localPremium = toBool(readStorage("isPremium", "local"));
    const sessionExpired = toBool(readStorage("isExpired", "session"));
    const localExpired = toBool(readStorage("isExpired", "local"));

    const status =
        normalizeStatus(readStorage("subscriptionStatus", "session")) ||
        normalizeStatus(readStorage("subscriptionStatus", "local"));

    const subscriptionInfo =
        safeJson(readStorage("subscriptionInfo", "session")) ??
        safeJson(readStorage("subscriptionInfo", "local"));

    const isPremium = sessionPremium === true || localPremium === true;
    const statusKey = status.toLowerCase();
    const isExpired =
        sessionExpired !== null
            ? sessionExpired
            : localExpired !== null
                ? localExpired
                : EXPIRED_STATUSES.has(statusKey);

    return {
        isPremium,
        isExpired,
        subscriptionStatus: status || (isPremium ? "active" : "unknown"),
        subscriptionInfo,
        updatedAt: 0,
        source: "legacy",
    };
}

function readIsInternal() {
    const sessionInternal = toBool(readStorage("isInternal", "session"));
    const localInternal = toBool(readStorage("isInternal", "local"));
    return sessionInternal === true || localInternal === true;
}

export function readSubscriptionSnapshot() {
    const sessionSub = normalizeSubscription(
        safeJson(readStorage("SUBSCRIPTION", "session")),
        "session"
    );
    const localSub = normalizeSubscription(
        safeJson(readStorage("SUBSCRIPTION", "local")),
        "local"
    );

    const fresh = pickFreshSubscription(sessionSub, localSub);
    const legacy = readLegacySubscription();
    const isInternal = readIsInternal() || fresh?.isInternal === true;

    const isPremium = isInternal || !!fresh?.isPremium || !!legacy.isPremium;
    const subscriptionStatus =
        fresh?.subscriptionStatus ||
        legacy.subscriptionStatus ||
        (isPremium ? "active" : "unknown");
    const statusKey = String(subscriptionStatus || "").toLowerCase();
    const isExpired =
        fresh?.isExpired ??
        legacy.isExpired ??
        EXPIRED_STATUSES.has(statusKey);

    const updatedAt = Math.max(fresh?.updatedAt || 0, legacy.updatedAt || 0);

    return {
        isPremium,
        isExpired,
        subscriptionStatus,
        subscriptionInfo: fresh?.subscriptionInfo ?? legacy.subscriptionInfo ?? null,
        updatedAt,
        source: isInternal ? "internal" : (fresh?.source || legacy.source || "fallback"),
        isInternal,
    };
}

export function useSubscriptionStatus() {
    const [sub, setSub] = useState(() => readSubscriptionSnapshot());
    const [isHydrating, setIsHydrating] = useState(true);

    const refreshSubscription = useCallback(() => {
        setSub(readSubscriptionSnapshot());
    }, []);

    useEffect(() => {
        // Relire juste après le mount pour absorber les injections natives tardives.
        refreshSubscription();
        const t = setTimeout(() => {
            refreshSubscription();
            setIsHydrating(false);
        }, 300);
        return () => clearTimeout(t);
    }, [refreshSubscription]);

    useEffect(() => {
        const onUpdate = () => refreshSubscription();
        const onStorage = (e) => {
            const key = e?.key;
            if (!key) {
                refreshSubscription();
                return;
            }
            if (
                key === "SUBSCRIPTION" ||
                key === "isPremium" ||
                key === "isExpired" ||
                key === "subscriptionStatus" ||
                key === "subscriptionInfo" ||
                key === "isInternal"
            ) {
                refreshSubscription();
            }
        };
        const onVisibility = () => {
            if (document.visibilityState === "visible") refreshSubscription();
        };

        window.addEventListener("subscription:update", onUpdate);
        window.addEventListener("app-subscription-changed", onUpdate);
        window.addEventListener("storage", onStorage);
        window.addEventListener("focus", onUpdate);
        document.addEventListener("visibilitychange", onVisibility);

        return () => {
            window.removeEventListener("subscription:update", onUpdate);
            window.removeEventListener("app-subscription-changed", onUpdate);
            window.removeEventListener("storage", onStorage);
            window.removeEventListener("focus", onUpdate);
            document.removeEventListener("visibilitychange", onVisibility);
        };
    }, [refreshSubscription]);

    return {
        ...sub,
        isHydrating,
        refreshSubscription,
    };
}
