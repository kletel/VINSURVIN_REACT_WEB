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

    // Recherche de vin
    const [vinQuery, setVinQuery] = useState('');
    const [vinSuggestions, setVinSuggestions] = useState([]);
    const [selectedVin, setSelectedVin] = useState(null);
    const [metsForSelectedVin, setMetsForSelectedVin] = useState([]); // [{ met, paths: [{categorie, sousCategorie}] }]
    const [metFilter, setMetFilter] = useState('');
    const [sortMode, setSortMode] = useState('alpha'); // 'alpha' | 'provenance'
    const [recipesMap, setRecipesMap] = useState({}); // { [normalizedMetName]: base64 | null }

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

        // Regrouper par met et collecter les couples catégorie/sous-catégorie
        const subset = associations.filter(a => a.Vin === vin);
        const grouped = new Map(); // met -> Map(key, {categorie, sousCategorie})
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

    // Normalisation de nom pour matcher recettes ⇄ mets
    const normalizeName = (str) => (str || '')
        .toString()
        .trim()
        .toLowerCase()
        .normalize('NFD').replace(/\p{Diacritic}/gu, '')
        .replace(/\s+/g, ' ');

    // Chargement ciblé des recettes: on envoie la liste des mets visibles (séparés par virgule)
    useEffect(() => {
        let aborted = false;
        const loadImagesForMets = async () => {
            try {
                if (!selectedVin || metsForSelectedVin.length === 0) { setRecipesMap({}); return; }
                const mets = Array.from(new Set(metsForSelectedVin.map(m => m.met).filter(Boolean)));
                if (mets.length === 0) { setRecipesMap({}); return; }
                const valeurs = encodeURIComponent(mets.join(','));
                const url = `${config.apiBaseUrl}/4DACTION/react_getRecettes?champs=nomMet&valeurs=${valeurs}`;
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
                if (!aborted) setRecipesMap(map);
            } catch (e) {
                if (!aborted) setRecipesMap({});
            }
        };
        loadImagesForMets();
        return () => { aborted = true; };
    }, [selectedVin, metsForSelectedVin]);

    // Debug: afficher le mapping pour les mets visibles
    useEffect(() => {
        if (!selectedVin || filteredAndSortedMets.length === 0) return;
        const report = filteredAndSortedMets.map((m) => {
            const key = normalizeName(m.met);
            const img = recipesMap[key] || null;
            return { met: m.met, key, hasImage: !!img, imgLen: img ? img.length : 0 };
        });
        console.table(report);
        // Logs additionnels pour vérifier une entrée spécifique si besoin
        if (report.length > 0) {
            const sample = report[0];
            console.log('[VinsMets] Sample mapping check — Association.Met:', sample.met, '→ key:', sample.key, 'exists in recipesMap:', sample.key in recipesMap);
        }
        const withImg = report.filter(r => r.hasImage).length;
        if (withImg === 0) {
            console.warn('[VinsMets] Aucune image trouvée pour les mets affichés. Vérifiez la correspondance des noms entre Association et Recettes.');
        }
    }, [selectedVin, filteredAndSortedMets, recipesMap]);

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
                <div className="flex justify-center items-center h-screen">
                    <div className="text-center">
                        <ProgressSpinner style={{ width: '50px', height: '50px' }} />
                        <p className="text-xl font-semibold text-gray-600 dark:text-gray-300 mt-4">
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
                <div className="flex justify-center items-center h-screen">
                    <div className="text-center">
                        <i className="pi pi-exclamation-triangle text-red-500 text-6xl mb-4"></i>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Erreur</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                        <Button label="Réessayer" icon="pi pi-refresh" onClick={fetchAssociations} />
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <Toast ref={toast} />
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur shadow-lg border-b border-gray-200 dark:border-gray-700 px-4 py-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">Rechercher un vin</h1>
                                <p className="mt-1 text-sm md:text-base text-gray-600 dark:text-gray-300">Trouvez un vin et explorez instantanément tous les mets associés.</p>
                            </div>
                            {selectedVin && (
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                                        <i className="pi pi-wine-bottle text-sm"></i>
                                        <span className="font-medium">{selectedVin}</span>
                                    </span>
                                    <Button label="Changer" className="p-button-text" icon="pi pi-refresh" onClick={clearSelectedVin} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto p-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Panneau gauche: recherche + suggestions */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-4 space-y-4">
                                <div className="bg-white/95 dark:bg-gray-800/95 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm">
                                    {/*<div className="flex items-center gap-3 mb-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow">
                      <i className="pi pi-search text-lg"></i>
                    </span>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Rechercher un vin</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Saisissez un nom de vin pour voir tous les mets correspondants</p>
                    </div>
                  </div>*/}
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom du vin</label>
                                    <AutoComplete
                                        value={vinQuery}
                                        suggestions={vinSuggestions}
                                        completeMethod={searchVins}
                                        onChange={(e) => setVinQuery(e.value)}
                                        onSelect={onSelectVin}
                                        placeholder="Ex: Bordeaux, Chardonnay, Beaujolais…"
                                        className="w-full text-base"
                                        dropdown
                                    />
                                </div>

                                {!selectedVin && (
                                    <div className="bg-white/95 dark:bg-gray-800/95 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm">
                                        <div className="flex items-center gap-2 mb-3">
                                            <i className="pi pi-sparkles text-amber-500"></i>
                                            <h4 className="font-semibold text-gray-900 dark:text-white">Suggestions populaires</h4>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {quickSuggestions.map((vin, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => onSelectVin({ value: vin })}
                                                    className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm"
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
                                    <div className="text-center max-w-md">
                                        <div className="mx-auto mb-3 h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow">
                                            <i className="pi pi-compass text-2xl"></i>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Commencez par choisir un vin</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Utilisez la recherche à gauche ou sélectionnez l’une des suggestions pour afficher les mets associés.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white/95 dark:bg-gray-800/95 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                        <div className="text-base md:text-lg text-gray-700 dark:text-gray-200">
                                            Mets associés à <span className="font-semibold text-gray-900 dark:text-white">{selectedVin}</span>
                                            {metsForSelectedVin.length > 0 && (
                                                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">• {metsForSelectedVin.length} résultat(s)</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="relative">
                                                <i className="pi pi-filter text-gray-500 dark:text-gray-400 absolute left-2 top-1/2 -translate-y-1/2 text-xs"></i>
                                                <input
                                                    value={metFilter}
                                                    onChange={(e) => setMetFilter(e.target.value)}
                                                    placeholder="Filtrer les mets…"
                                                    className="pl-7 pr-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                                />
                                            </div>
                                            <div className="hidden md:flex items-center gap-1">
                                                <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">Trier:</span>
                                                <button
                                                    onClick={() => setSortMode('alpha')}
                                                    aria-pressed={sortMode === 'alpha'}
                                                    className={`px-2.5 py-1 rounded-md text-xs border ${sortMode === 'alpha' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'}`}
                                                >
                                                    A → Z
                                                </button>
                                                <button
                                                    onClick={() => setSortMode('provenance')}
                                                    aria-pressed={sortMode === 'provenance'}
                                                    className={`px-2.5 py-1 rounded-md text-xs border ${sortMode === 'provenance' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'}`}
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
                                                    className="group p-4 rounded-2xl border bg-white/90 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                                                >
                                                    {/* Image de recette */}
                                                    <div className="w-full aspect-[16/9] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 mb-3">
                                                        {recipesMap[normalizeName(item.met)] ? (
                                                            <img
                                                                src={`data:image/jpeg;base64,${recipesMap[normalizeName(item.met)]}`}
                                                                alt={`Image recette pour ${item.met}`}
                                                                className="w-full h-full object-cover"
                                                                loading="lazy"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                                                                <i className="pi pi-image text-2xl"></i>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="font-semibold text-base md:text-lg text-gray-900 dark:text-white truncate" title={item.met}>{item.met}</div>
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] md:text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700 whitespace-nowrap">
                                                            <i className="pi pi-diagram-tree text-[10px]"></i>
                                                            {item.paths.length}
                                                        </span>
                                                    </div>
                                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                                        {item.paths.map((p, j) => (
                                                            <span
                                                                key={j}
                                                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] md:text-xs border ${getCategoryClasses(p.categorie)}`}
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
                                                            className="p-button-sm"
                                                            onClick={() => handleVoirRecette(item.met)}
                                                            aria-label={`Voir recette pour ${item.met}`}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">Aucun met correspondant</div>
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
