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

// Anti-boucle : dédup des appels concurrents + cache court par email.
// Empêche qu'un re-render / effet mal câblé pilonne react_isInternalEmail.
const TTL_MS = 30_000;
const inflight = new Map(); // email normalisé -> Promise<boolean>
const cache = new Map();    // email normalisé -> { value: boolean, at: number }

function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
}

// Écrit le résultat dans le storage. Ne ré-émet les events QUE si la valeur
// a réellement changé, pour ne pas alimenter une boucle pilotée par event.
function persistResult(isInternal) {
    const v = isInternal ? "true" : "false";
    const prev = localStorage.getItem("isInternal");

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

    if (prev !== v) {
        window.dispatchEvent(new CustomEvent("subscription:update", { detail: merged }));
        window.dispatchEvent(new Event("app-subscription-changed"));
    }
}

async function resolveIsInternal(apiBaseUrl, email) {
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

    return isInternal;
}

export async function fetchAndStoreIsInternal({ apiBaseUrl, email }) {
    if (!email || !apiBaseUrl) return false;

    const key = normalizeEmail(email);

    // ✅ cache court : évite de rappeler l'API pour le même email en rafale
    const now = Date.now();
    const cached = cache.get(key);
    if (cached && (now - cached.at) < TTL_MS) {
        persistResult(cached.value);
        return cached.value;
    }

    // ✅ dédup : si un appel est déjà en vol pour cet email, on le partage
    if (inflight.has(key)) {
        return inflight.get(key);
    }

    const p = (async () => {
        try {
            const isInternal = await resolveIsInternal(apiBaseUrl, email);
            cache.set(key, { value: isInternal, at: Date.now() });
            persistResult(isInternal);
            return isInternal;
        } finally {
            inflight.delete(key);
        }
    })();

    inflight.set(key, p);
    return p;
}
