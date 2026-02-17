const INTERNAL_DOMAINS = ['kletel.net', 'vitissia.fr', 'benyamin.fr'];

function isInternalEmailValue(email) {
    const e = String(email || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '');
    if (!e) return false;
    return INTERNAL_DOMAINS.some((d) => e.endsWith(`@${d}`));
}

function parseBooleanResponse(text) {
    const t = String(text ?? "").trim().toLowerCase();
    if (!t) return null;
    if (t === "true" || t === "1") return true;
    if (t === "false" || t === "0") return false;

    try {
        const j = JSON.parse(text);
        if (typeof j?.isInternal === "boolean") return j.isInternal;
        if (typeof j?.ok === "boolean") return j.ok;
        return null;
    } catch {
        return null;
    }
}

export async function fetchAndStoreIsInternal({ apiBaseUrl, email }) {
    if (!email || !apiBaseUrl) return false;

    const url = `${apiBaseUrl}/4DACTION/react_isInternalEmail?email=${encodeURIComponent(email)}`;
    let isInternal = null;

    try {
        const res = await fetch(url, { method: "GET" });
        const raw = await res.text();

        // ✅ si l'API renvoie un booléen JSON classique
        const parsed = parseBooleanResponse(raw);
        if (parsed !== null) {
            isInternal = parsed;
        }
    } catch {
        // ignore
    }

    // ✅ fallback: règles locales (mêmes domaines que côté app)
    if (isInternal === null) {
        isInternal = isInternalEmailValue(email);
    }

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
