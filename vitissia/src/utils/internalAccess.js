function parseBooleanResponse(text) {
    const t = String(text ?? "").trim().toLowerCase();
    if (!t) return false;
    if (t === "true" || t === "1") return true;
    if (t === "false" || t === "0") return false;

    try {
        const j = JSON.parse(text);
        return !!(j?.isInternal ?? j?.ok);
    } catch {
        return false;
    }
}

export async function fetchAndStoreIsInternal({ apiBaseUrl, email }) {
    const url = `${apiBaseUrl}/4DACTION/react_isInternalEmail?email=${encodeURIComponent(email)}`;
    const res = await fetch(url, { method: "GET" });
    const data = await res.json();

    const isInternal = !!data?.isInternal; // ✅ c’est ça la vraie valeur
    const v = isInternal ? "true" : "false";

    localStorage.setItem("isInternal", v);
    sessionStorage.setItem("isInternal", v);

    // ✅ Force premium côté web si internal
    const raw = localStorage.getItem("SUBSCRIPTION") || sessionStorage.getItem("SUBSCRIPTION");
    let sub = {};
    try { sub = raw ? JSON.parse(raw) : {}; } catch { }

    const merged = {
        ...sub,
        isPremium: isInternal ? true : false,
        subscriptionStatus: isInternal ? "active" : "inactive",
        source: isInternal ? "internal" : "web",

        updatedAt: Date.now(),
    };

    localStorage.setItem("SUBSCRIPTION", JSON.stringify(merged));
    sessionStorage.setItem("SUBSCRIPTION", JSON.stringify(merged));

    window.dispatchEvent(new CustomEvent("subscription:update", { detail: merged }));
    window.dispatchEvent(new Event("app-subscription-changed"));

    return isInternal;
}

