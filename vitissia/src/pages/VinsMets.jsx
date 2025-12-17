import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import useFetchAssociations from '../hooks/useFetchAssociations';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Button } from 'primereact/button';
import { AutoComplete } from 'primereact/autocomplete';
import { Toast } from 'primereact/toast';
import config from '../config/config';
import authHeader from '../config/authHeader';

const VinsMets = () => {
    const { associations, fetchAssociations, loading, error } = useFetchAssociations();
    const toast = useRef(null);
    const navigate = useNavigate();

    const [vinQuery, setVinQuery] = useState('');
    const [vinSuggestions, setVinSuggestions] = useState([]);
    const [selectedVin, setSelectedVin] = useState(null);
    const [metsForSelectedVin, setMetsForSelectedVin] = useState([]);
    const [metFilter, setMetFilter] = useState('');
    const [sortMode, setSortMode] = useState('alpha');
    const [recipesMap, setRecipesMap] = useState({});

    const [imageLoadedMap, setImageLoadedMap] = useState({});
    const [recipesLoading, setRecipesLoading] = useState(false);

    const handleImageLoaded = (key) => {
        setImageLoadedMap((prev) => ({
            ...prev,
            [key]: true,
        }));
    };

    useEffect(() => {
        fetchAssociations();
    }, [fetchAssociations]);

    useEffect(() => {
        if (associations.length > 0 && selectedVin && metsForSelectedVin.length === 0) {
            console.log('[VinsMets] Recalcul des mets pour', selectedVin, 'après fetch');
            const subset = associations.filter(a => a.Vin === selectedVin);
            const grouped = new Map();
            subset.forEach(a => {
                const met = a.Met;
                if (!grouped.has(met)) grouped.set(met, new Map());
                const key = `${a.Categorie}|||${a.Sous_Categorie}`;
                grouped.get(met).set(key, { categorie: a.Categorie, sousCategorie: a.Sous_Categorie });
            });
            const mets = Array.from(grouped.entries()).map(([met, pathsMap]) => ({
                met,
                paths: Array.from(pathsMap.values())
            }));
            setMetsForSelectedVin(mets);
        }
    }, [associations, selectedVin]);

    useEffect(() => {
        const storedVin = sessionStorage.getItem('vinName');
        const metsForVin = sessionStorage.getItem('metsForVin');

        let metsForVinparse = [];
        try {
            metsForVinparse = JSON.parse(metsForVin);
            if (!Array.isArray(metsForVinparse)) metsForVinparse = [];
        } catch {
            metsForVinparse = [];
        }

        if (storedVin) {
            setVinQuery(storedVin);
            setSelectedVin(storedVin);
            setMetsForSelectedVin(metsForVinparse);
            sessionStorage.removeItem('vinName');
            sessionStorage.removeItem('metsForVin');
        }
    }, []);

    const allVins = useMemo(() => Array.from(new Set(associations.map(a => a.Vin).filter(Boolean))).sort(), [associations]);
    const quickSuggestions = useMemo(() => allVins.slice(0, 18), [allVins]);

    const normalizeString = (str) =>
        str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const searchVins = (e) => {
        const q = normalizeString(e.query || '');
        const filtered = q ? allVins.filter(v => normalizeString(v).includes(q)) : allVins.slice(0, 30);
        setVinSuggestions(filtered);
    };

    const onSelectVin = (e) => {
        const vin = e.value;
        setVinQuery(vin);
        setSelectedVin(vin);

        const subset = associations.filter(a => a.Vin === vin);
        const grouped = new Map(); 
        subset.forEach(a => {
            const met = a.Met;
            if (!grouped.has(met)) grouped.set(met, new Map());
            const key = `${a.Categorie}|||${a.Sous_Categorie}`;
            grouped.get(met).set(key, { categorie: a.Categorie, sousCategorie: a.Sous_Categorie });
        });

        const mets = Array.from(grouped.entries()).map(([met, pathsMap]) => ({
            met,
            paths: Array.from(pathsMap.values())
        }));
        console.log('mets', mets)
        setMetsForSelectedVin(mets);
    };

    const clearSelectedVin = () => {
        setSelectedVin(null);
        setVinQuery('');
        setMetsForSelectedVin([]);
        setMetFilter('');
    };

    const filteredAndSortedMets = useMemo(() => {
        let list = metsForSelectedVin;
        console.log("list", list)
        if (metFilter.trim()) {
            const q = metFilter.toLowerCase();
            list = list.filter(item => item.met.toLowerCase().includes(q));
        }
        if (sortMode === 'alpha') {
            list = [...list].sort((a, b) => a.met.localeCompare(b.met, 'fr', { sensitivity: 'base' }));
        } else if (sortMode === 'provenance') {
            list = [...list].sort((a, b) => (b.paths?.length || 0) - (a.paths?.length || 0));
        }
        return list;
    }, [metsForSelectedVin, metFilter, sortMode]);

    const normalizeName = (str) => (str || '')
        .toString()
        .trim()
        .toLowerCase()
        .normalize('NFD').replace(/\p{Diacritic}/gu, '')
        .replace(/\s+/g, ' ');

    useEffect(() => {
        if (!selectedVin || filteredAndSortedMets.length === 0) return;
        const report = filteredAndSortedMets.map((m) => {
            const key = normalizeName(m.met);
            const img = recipesMap[key] || null;
            return { met: m.met, key, hasImage: !!img, imgLen: img ? img.length : 0 };
        });
        console.table(report);
        if (report.length > 0) {
            const sample = report[0];
            console.log('[VinsMets] Sample mapping check — Association.Met:', sample.met, '→ key:', sample.key, 'exists in recipesMap:', sample.key in recipesMap);
        }
        const withImg = report.filter(r => r.hasImage).length;
        if (withImg === 0) {
            console.warn('[VinsMets] Aucune image trouvée pour les mets affichés. Vérifiez la correspondance des noms entre Association et Recettes.');
        }
    }, [selectedVin, filteredAndSortedMets, recipesMap]);

    const recipesCacheRef = useRef({}); // vin -> map images

    useEffect(() => {
        let aborted = false;

        const loadImagesForMets = async () => {
            if (!selectedVin || metsForSelectedVin.length === 0) {
                setRecipesMap({});
                setRecipesLoading(false);
                return;
            }

            // 🔹 Si on a déjà les images en cache pour ce vin → on les réutilise
            if (recipesCacheRef.current[selectedVin]) {
                setRecipesMap(recipesCacheRef.current[selectedVin]);
                setRecipesLoading(false);
                return;
            }

            const mets = Array.from(
                new Set(metsForSelectedVin.map(m => m.met).filter(Boolean))
            );

            if (mets.length === 0) {
                setRecipesMap({});
                setRecipesLoading(false);
                return;
            }

            setRecipesLoading(true);
            setImageLoadedMap({});

            const valeurs = encodeURIComponent(mets.join(','));
            const url = `${config.apiBaseUrl}/4DACTION/react_getRecettes?champs=nomMet&valeurs=${valeurs}`;

            try {
                const resp = await fetch(url, { method: 'GET', headers: authHeader() });
                if (!resp.ok) throw new Error('fetch recettes ciblées failed');

                const data = await resp.json();
                const map = {};
                (Array.isArray(data) ? data : []).forEach((r) => {
                    const name = r?.nomMet || '';
                    const img = r?.imageBase64 ?? null;
                    const key = normalizeName(name);
                    if (key && !(key in map)) map[key] = img;
                });

                if (!aborted) {
                    recipesCacheRef.current[selectedVin] = map;
                    setRecipesMap(map);
                }
            } catch (e) {
                if (!aborted) {
                    setRecipesMap({});
                }
            } finally {
                if (!aborted) setRecipesLoading(false);
            }
        };

        loadImagesForMets();
        return () => { aborted = true; };
    }, [selectedVin, metsForSelectedVin]);

    const getCategoryClasses = (categorie) => {
        const cat = (categorie || '').toLowerCase();
        if (cat.includes('viande') || cat.includes('boeuf') || cat.includes('agneau')) return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
        if (cat.includes('poisson') || cat.includes('fruits de mer')) return 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800';
        if (cat.includes('fromage')) return 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
        if (cat.includes('dessert')) return 'bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800';
        if (cat.includes('volaille') || cat.includes('poulet')) return 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800';
        if (cat.includes('légume') || cat.includes('legume')) return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
        return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    };

    const handleVoirRecette = (metName) => {
        try {
            sessionStorage.setItem('recetteOrigin', 'RECHERCHE_VIN');
            sessionStorage.setItem('vinName', selectedVin || '');
            sessionStorage.setItem('metName', metName || '');
            sessionStorage.removeItem('recetteUUID');
            navigate('/recette');
        } catch (e) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: "Impossible d'ouvrir la recette", life: 2500 });
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-screen bg-gradient-to-b from-[#8C2438] via-[#5A1020] to-[#3B0B15] font-['Work_Sans',sans-serif] text-white">
                    <div className="text-center text-white/80">
                        <ProgressSpinner style={{ width: '50px', height: '50px' }} />
                        <p className="text-xl font-semibold mt-4">
                            Chargement des associations...
                        </p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-screen bg-gradient-to-b from-[#8C2438] via-[#5A1020] to-[#3B0B15] font-['Work_Sans',sans-serif] text-white">
                    <div className="text-center text-white/80">
                        <i className="pi pi-exclamation-triangle text-red-400 text-6xl mb-4"></i>
                        <h2 className="text-2xl font-bold mb-2 text-white">Erreur</h2>
                        <p className="mb-4">{error}</p>
                        <Button label="Réessayer" icon="pi pi-refresh" onClick={fetchAssociations} />
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            {/* <Toast ref={toast} />*/}
            <div className="min-h-screen bg-gradient-to-b from-[#8C2438] via-[#5A1020] to-[#3B0B15] font-['Work_Sans',sans-serif] text-white">
                {/* Header */}
                <div
                    className="
                        px-4 py-6 mb-6
                        border-b border-black/30
                        shadow-[0_18px_30px_-18px_rgba(0,0,0,0.9)]
                        bg-transparent
                    "
                >
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                                    Rechercher un vin
                                </h1>
                                <p className="mt-1 text-sm md:text-base text-white/70">
                                    Trouvez un vin et explorez instantanément tous les mets associés.
                                </p>
                            </div>
                            {selectedVin && (
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-800/70 border border-gray-600 text-white shadow-sm">
                                        <i className="pi pi-wine-bottle text-sm"></i>
                                        <span className="font-medium truncate max-w-[220px]">{selectedVin}</span>
                                    </span>
                                    <Button
                                        label="Changer"
                                        icon="pi pi-refresh"
                                        className="p-button-text p-button-sm !text-white"
                                        onClick={clearSelectedVin}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto p-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-1">
                            <div className="sticky top-4 space-y-4">
                                <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5 shadow-[0_18px_45px_rgba(0,0,0,0.9)] backdrop-blur metsvins-autocomplete-wrapper">
                                    <label className="block text-sm font-medium text-white/80 mb-2">
                                        Nom du vin
                                    </label>
                                    <AutoComplete
                                        value={vinQuery}
                                        suggestions={vinSuggestions}
                                        completeMethod={searchVins}
                                        onChange={(e) => setVinQuery(e.value)}
                                        onSelect={onSelectVin}
                                        placeholder="Ex: Bordeaux, Beaujolais, Ajaccio…"
                                        className="w-full text-base"
                                        dropdown
                                        inputClassName="
                                            !bg-gray-800/50
                                            !text-white
                                            !border-gray-700
                                            placeholder:!text-gray-400
                                            focus:!border-gray-400
                                            focus:!shadow-none
                                        "
                                        panelClassName="metsvins-autocomplete-panel"
                                    />
                                </div>

                                {/* Suggestions populaires */}
                                {!selectedVin && (
                                    <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5 shadow-[0_18px_45px_rgba(0,0,0,0.9)]">
                                        <div className="flex items-center gap-2 mb-3">
                                            <i className="pi pi-sparkles text-amber-400"></i>
                                            <h4 className="font-semibold text-white">
                                                Suggestions populaires
                                            </h4>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {quickSuggestions.map((vin, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => onSelectVin({ value: vin })}
                                                    className="
                                                        px-3 py-1.5 rounded-full
                                                        bg-gray-900/70 border border-gray-700
                                                        text-xs text-white
                                                        hover:bg-gray-700
                                                        transition-all
                                                        hover:-translate-y-0.5
                                                    "
                                                >
                                                    {vin}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Panneau droit: résultats */}
                        <div className="lg:col-span-2">
                            {!selectedVin ? (
                                <div className="h-full flex items-center justify-center">
                                    <div className="text-center max-w-md bg-gray-800/50 border border-gray-700 rounded-2xl px-8 py-10 shadow-[0_18px_45px_rgba(0,0,0,0.9)]">
                                        <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-lg">
                                            <i className="pi pi-compass text-2xl"></i>
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-1">
                                            Commencez par choisir un vin
                                        </h3>
                                        <p className="text-sm text-white/70">
                                            Utilisez la recherche à gauche ou sélectionnez l’une des suggestions pour afficher les mets associés.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5 shadow-[0_18px_45px_rgba(0,0,0,0.9)]">
                                    <div className="flex flex-col gap-3">
                                        {/* Titre + compteur */}
                                        <div className="text-base md:text-lg text-white">
                                            Mets associés à{' '}
                                            <span className="font-semibold text-white">
                                                {selectedVin}
                                            </span>
                                            {metsForSelectedVin.length > 0 && (
                                                <span className="ml-2 text-sm text-white/60">
                                                    • {metsForSelectedVin.length} résultat(s)
                                                </span>
                                            )}
                                        </div>

                                        {/* Zone filtres + tri, toujours en dessous du titre */}
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
                                            <div className="relative w-full sm:w-56 md:w-64">
                                                <i className="pi pi-filter text-white/50 absolute left-2 top-1/2 -translate-y-1/2 text-xs"></i>
                                                <input
                                                    value={metFilter}
                                                    onChange={(e) => setMetFilter(e.target.value)}
                                                    placeholder="Filtrer les mets…"
                                                    className="
                                                        w-full
                                                        pl-7 pr-3 py-2
                                                        rounded-lg
                                                        border border-gray-700
                                                        bg-gray-900/80
                                                        text-xs sm:text-sm text-white
                                                        placeholder:text-gray-500
                                                        focus:outline-none focus:ring-2 focus:ring-rose-400/60 focus:border-rose-400
                                                        transition-all
                                                    "
                                                />
                                            </div>

                                            {/* Boutons de tri */}
                                            <div className="flex items-center justify-start gap-1.5">
                                                <span className="hidden sm:inline text-[11px] md:text-xs text-white/50 mr-1">
                                                    Trier :
                                                </span>

                                                <button
                                                    onClick={() => setSortMode('alpha')}
                                                    aria-pressed={sortMode === 'alpha'}
                                                    className={`
                                                        inline-flex items-center justify-center
                                                        min-w-[90px]
                                                        px-3 py-1.5
                                                        rounded-md text-[11px] sm:text-xs border transition-all
                                                        ${sortMode === 'alpha'
                                                            ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                                                            : 'bg-gray-900/70 border-gray-700 text-white/80 hover:bg-gray-800'
                                                        }
                                                    `}
                                                >
                                                    A → Z
                                                </button>

                                                <button
                                                    onClick={() => setSortMode('provenance')}
                                                    aria-pressed={sortMode === 'provenance'}
                                                    className={`
                                                        inline-flex items-center justify-center
                                                        min-w-[110px]
                                                        px-3 py-1.5
                                                        rounded-md text-[11px] sm:text-xs border transition-all
                                                        ${sortMode === 'provenance'
                                                            ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                                                            : 'bg-gray-900/70 border-gray-700 text-white/80 hover:bg-gray-800'
                                                        }
                                                    `}
                                                >
                                                    + provenance
                                                </button>
                                            </div>
                                        </div>
                                    </div>


                                    {filteredAndSortedMets.length > 0 ? (
                                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                            {filteredAndSortedMets.map((item, i) => (
                                                <div
                                                    key={i}
                                                    className="
                                                        group p-4 rounded-2xl border
                                                        bg-gray-900/80 border-gray-700
                                                        shadow-[0_18px_45px_rgba(0,0,0,1)]
                                                        hover:shadow-[0_24px_60px_rgba(0,0,0,1)]
                                                        transition-all hover:-translate-y-0.5
                                                    "
                                                >
                                                    {(() => {
                                                        const key = normalizeName(item.met);
                                                        const imgBase64 = recipesMap[key] || null;
                                                        const hasImage = !!imgBase64;
                                                        const isLoaded = !!imageLoadedMap[key];

                                                        return (
                                                            <div className="w-full aspect-[16/9] rounded-xl overflow-hidden bg-gray-900 mb-3 relative">
                                                                {hasImage ? (
                                                                    <>
                                                                        <img
                                                                            src={`data:image/jpeg;base64,${imgBase64}`}
                                                                            alt={`Image recette pour ${item.met}`}
                                                                            className="
                                                                                w-full h-full object-cover 
                                                                                transition-transform duration-300 
                                                                                group-hover:scale-[1.03]
                                                                            "
                                                                            loading="lazy"
                                                                            onLoad={() => handleImageLoaded(key)}
                                                                        />

                                                                        {!isLoaded && (
                                                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
                                                                                <i className="pi pi-spin pi-spinner text-white/80 text-2xl" />
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                ) : recipesLoading ? (
                                                                    <div className="w-full h-full flex items-center justify-center text-white/50">
                                                                        <i className="pi pi-spin pi-spinner text-2xl" />
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-full h-full flex flex-col items-center justify-center text-white/40 text-xs">
                                                                        <i className="pi pi-image text-xl mb-1"></i>
                                                                        <span>Aucune image fournie</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })()}

                                                    <div className="flex items-start justify-between gap-2">
                                                        <div
                                                            className="font-semibold text-base md:text-lg text-white truncate"
                                                            title={item.met}
                                                        >
                                                            {item.met}
                                                        </div>
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] md:text-xs bg-purple-900/40 text-purple-200 border border-purple-500/60 whitespace-nowrap">
                                                            <i className="pi pi-diagram-tree text-[10px]"></i>
                                                            {item.paths.length}
                                                        </span>
                                                    </div>
                                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                                        {item.paths.map((p, j) => (
                                                            <span
                                                                key={j}
                                                                className={`
                                                                    inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] md:text-xs border
                                                                    ${getCategoryClasses(p.categorie)}
                                                                `}
                                                                title={`${p.categorie} > ${p.sousCategorie}`}
                                                            >
                                                                <i className="pi pi-tag text-xs"></i>
                                                                {p.categorie} › {p.sousCategorie}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <div className="mt-4 flex justify-end">
                                                        <Button
                                                            label="Voir recette"
                                                            icon="pi pi-book"
                                                            className="p-button-sm px-4 py-2 bg-gradient-to-r from-rose-500 to-orange-400 border-none text-white shadow-sm hover:from-rose-600 hover:to-orange-500 transition-all"
                                                            onClick={() => handleVoirRecette(item.met)}
                                                            aria-label={`Voir recette pour ${item.met}`}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="mt-6 text-sm text-white/60">
                                            Aucun met correspondant
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default VinsMets;
