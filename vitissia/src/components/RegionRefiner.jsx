import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const useDebounced = (value, delay = 250) => {
    const [v, setV] = useState(value);
    useEffect(() => {
        const id = setTimeout(() => setV(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);
    return v;
};

const uniq = (arr) => {
    const seen = new Set();
    return arr.filter((x) => {
        const k = (x || "").trim().toLowerCase();
        if (!k || seen.has(k)) return false;
        seen.add(k);
        return true;
    });
};

export default function RegionRefiner({
    refineRegion,
    setRefineRegion,
    defaultRegions = [],
    dark = false
}) {
    const [input, setInput] = useState(refineRegion || "");
    const [remote, setRemote] = useState([]);
    const [open, setOpen] = useState(false);
    const cacheRef = useRef(new Map());
    const debounced = useDebounced(input, 300);

    useEffect(() => {
        setRefineRegion(input.trim());
    }, [input, setRefineRegion]);

    useEffect(() => {
        const q = debounced.trim();
        if (q.length === 0) {
            setRemote([]);
            return;
        }

        if (cacheRef.current.has(q.toLowerCase())) {
            setRemote(cacheRef.current.get(q.toLowerCase()));
            return;
        }

        const sparql = `
      SELECT DISTINCT ?label WHERE {
        ?item wdt:P31 wd:Q39816 .
        ?item rdfs:label ?label .
        FILTER (lang(?label) IN ("fr","en"))
        FILTER (CONTAINS(LCASE(?label), LCASE("${q.replace(/"/g, '\\"')}")))
      }
      LIMIT 50
    `;
        const url = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(sparql)}`;

        fetch(url, { headers: { "Accept": "application/sparql-results+json" } })
            .then(r => r.json())
            .then(data => {
                const vals = (data?.results?.bindings || []).map(b => b.label.value);
                const cleaned = uniq(vals);
                cacheRef.current.set(q.toLowerCase(), cleaned);
                setRemote(cleaned);
            })
            .catch(() => setRemote([]));
    }, [debounced]);

    const localSuggestions = useMemo(() => {
        if (!defaultRegions?.length) return [];
        if (!input.trim()) return uniq(defaultRegions);
        const q = input.trim().toLowerCase();
        return uniq(defaultRegions.filter(r => (r || "").toLowerCase().includes(q)));
    }, [defaultRegions, input]);

    const mergedSuggestions = useMemo(() => {
        if (!input.trim()) return localSuggestions;
        return uniq([...localSuggestions, ...remote]);
    }, [input, localSuggestions, remote]);

    const pick = (val) => {
        setInput(val);
        setRefineRegion(val);
        setOpen(false);
    };

    return (
        <div>
            <div className="relative">
                <motion.input
                    type="text"
                    value={input}
                    onChange={(e) => { setInput(e.target.value); setOpen(true); }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={(e) => { if (e.key === "Enter") pick(input.trim()); }}
                    placeholder="Tapez une région (ex. Bourgogne)…"
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm shadow-sm outline-none transition
        ${dark
                            ? "bg-gray-800/60 border-gray-700 text-gray-100 focus:ring-2 focus:ring-emerald-500"
                            : "bg-white/70 border-gray-300 text-gray-800 focus:ring-2 focus:ring-emerald-500"}`}
                />

                <AnimatePresence>
                    {open && (
                        <motion.div
                            key="suggestions"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.18 }}
                            className={`absolute inset-x-0 top-full mt-2
              max-h-72 overflow-y-auto rounded-2xl border shadow-xl z-50
              ${dark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}
                            onMouseDown={(e) => e.preventDefault()}
                        >
                            {!input.trim() && localSuggestions.length > 0 && (
                                <div className="p-2">
                                    <p className={`px-2 py-1.5 text-xs uppercase tracking-wide ${dark ? "text-gray-400" : "text-gray-500"}`}>
                                        Suggestions populaires
                                    </p>
                                    {localSuggestions.map((r) => (
                                        <button
                                            key={`def-${r}`}
                                            type="button"
                                            onClick={() => pick(r)}
                                            className={`w-full text-left px-3 py-2 rounded-lg transition
                      ${dark ? "text-gray-100 hover:bg-gray-800" : "text-gray-800 hover:bg-emerald-50"}`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                    <div className={`my-2 border-t ${dark ? "border-gray-700" : "border-gray-200"}`} />
                                </div>
                            )}

                            <div className="p-2">
                                {(input.trim() ? mergedSuggestions : []).map((r) => (
                                    <button
                                        key={`sugg-${r}`}
                                        type="button"
                                        onClick={() => pick(r)}
                                        className={`w-full text-left px-3 py-2 rounded-lg transition
                    ${dark
                                                ? (refineRegion === r ? "bg-emerald-900/30 text-emerald-200" : "text-gray-100 hover:bg-gray-800")
                                                : (refineRegion === r ? "bg-emerald-100/70 text-emerald-900" : "text-gray-800 hover:bg-emerald-50")}`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {defaultRegions?.length > 0 && (
                <div className="flex flex-row flex-wrap gap-2 mt-3">
                    {defaultRegions.map((r) => (
                        <button
                            key={`pill-${r}`}
                            type="button"
                            onClick={() => pick(r)}
                            className={`px-3 py-1.5 rounded-full text-sm border transition-all
              ${refineRegion === r
                                    ? "bg-emerald-600 text-white border-emerald-700 shadow"
                                    : dark
                                        ? "bg-gray-800/60 text-gray-200 border-gray-700 hover:bg-gray-700/70"
                                        : "bg-white/70 text-gray-700 border-gray-300 hover:bg-emerald-50"}`}
                            title={r}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}