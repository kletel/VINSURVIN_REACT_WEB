import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import useFetchAssociations from '../hooks/useFetchAssociations';
import config from '../config/config';
import authHeader from '../config/authHeader';
import Layout from '../components/Layout';
import { AutoComplete } from 'primereact/autocomplete';

const MetsVins = () => {
    const { associations, fetchAssociations, loading, error } = useFetchAssociations();
    const navigate = useNavigate();
    const toast = useRef(null);

    const [currentStep, setCurrentStep] = useState(1);
    const [selectedCategorie, setSelectedCategorie] = useState(null);
    const [selectedSousCategorie, setSelectedSousCategorie] = useState(null);
    const [selectedMet, setSelectedMet] = useState(null);
    const [expandedMet, setExpandedMet] = useState(null);
    const [loadingRecipeFor, setLoadingRecipeFor] = useState(null);

    const [searchActive, setSearchActive] = useState(false);
    const [searchPulse, setSearchPulse] = useState(false);

    // Recherche de plat
    const [metQuery, setMetQuery] = useState('');
    const [metSuggestions, setMetSuggestions] = useState([]);
    const [searchSelectedMet, setSearchSelectedMet] = useState(null);
    const [searchProvenances, setSearchProvenances] = useState([]); // {categorie, sousCategorie, vinsCount}
    const [recipesMap, setRecipesMap] = useState({});

    const [rehydrated, setRehydrated] = useState(false);

    const location = useLocation();
    const search = location.state?.search || '';

    useEffect(() => {
        fetchAssociations();
    }, [fetchAssociations]);

    const normalizeName = (str) => (str || '')
        .toString()
        .trim()
        .toLowerCase()
        .normalize('NFD').replace(/\p{Diacritic}/gu, '')
        .replace(/\s+/g, ' ');

    // Chargement ciblé des recettes pour le met recherché
    useEffect(() => {
        let aborted = false;
        const fetchRecetteForMet = async () => {
            try {
                if (!searchSelectedMet) { setRecipesMap({}); return; }
                const valeurs = encodeURIComponent(searchSelectedMet);
                const url = `${config.apiBaseUrl}/4DACTION/react_getRecettes?champs=nomMet&valeurs=${valeurs}`;
                const resp = await fetch(url, { method: 'GET', headers: authHeader() });
                if (!resp.ok) throw new Error('fetch recettes ciblée failed');
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
        fetchRecetteForMet();
        return () => { aborted = true; };
    }, [searchSelectedMet]);

    // Réhydratation
    useEffect(() => {
        if (!rehydrated && associations.length > 0) {
            const restoreFlag = sessionStorage.getItem('restoreMetsVins');
            const origin = sessionStorage.getItem('recetteOrigin');
            if (restoreFlag && origin === 'METS_VINS') {
                const raw = sessionStorage.getItem('metsVinsState');
                if (raw) {
                    try {
                        const st = JSON.parse(raw);
                        if (st.selectedCategorie) setSelectedCategorie(st.selectedCategorie);
                        if (st.selectedSousCategorie) setSelectedSousCategorie(st.selectedSousCategorie);
                        if (st.expandedMet) setExpandedMet(st.expandedMet);
                        if (st.currentStep) setCurrentStep(st.currentStep);
                    } catch (e) {
                        console.warn('Erreur réhydratation metsVinsState', e);
                    }
                }
                sessionStorage.removeItem('restoreMetsVins');
            }
            setRehydrated(true);
        }
    }, [associations, rehydrated]);

    // Données calculées
    const categories = [...new Set(associations.map(a => a.Categorie))];

    const sousCategories = selectedCategorie
        ? [...new Set(
            associations
                .filter(a => a.Categorie === selectedCategorie)
                .map(a => a.Sous_Categorie)
        )]
        : [];

    const mets = selectedSousCategorie
        ? [...new Set(
            associations
                .filter(a => a.Categorie === selectedCategorie && a.Sous_Categorie === selectedSousCategorie)
                .map(a => a.Met)
        )]
        : [];

    const getVinsByMet = (met) => {
        return [...new Set(
            associations
                .filter(a =>
                    a.Categorie === selectedCategorie &&
                    a.Sous_Categorie === selectedSousCategorie &&
                    a.Met === met
                )
                .map(a => a.Vin)
        )];
    };

    // Navigation
    const handleStepClick = (step) => {
        if (step <= currentStep) {
            setCurrentStep(step);
            if (step === 1) {
                setSelectedSousCategorie(null);
                setSelectedMet(null);
            } else if (step === 2) {
                setSelectedMet(null);
            }
        }
    };

    const handleCategorieSelect = (categorie) => {
        setSelectedCategorie(categorie);
        setSelectedSousCategorie(null);
        setSelectedMet(null);
        setCurrentStep(2);
    };

    const handleSousCategorieSelect = (sousCategorie) => {
        setSelectedSousCategorie(sousCategorie);
        setSelectedMet(null);
        setCurrentStep(3);
    };

    const handleMetToggle = (met) => {
        setExpandedMet(prev => prev === met ? null : met);
        setSelectedMet(met);
    };

    const generateRecipe = async (met, vinOpt) => {
        const stateSnapshot = {
            currentStep,
            selectedCategorie,
            selectedSousCategorie,
            expandedMet: met,
            timestamp: Date.now()
        };
        sessionStorage.setItem('recetteOrigin', 'METS_VINS');
        sessionStorage.setItem('metsVinsState', JSON.stringify(stateSnapshot));
        const recipeKey = met;
        setLoadingRecipeFor(recipeKey);
        try {
            const UUIDuser = sessionStorage.getItem('uuid_user');
            sessionStorage.setItem('vinName', vinOpt || '');
            sessionStorage.setItem('metName', met);
            navigate('/recette');
        } catch (err) {
            console.error('Erreur lors de la génération de la recette:', err);
            toast.current.show({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Erreur lors de la génération de la recette',
                life: 3000
            });
        } finally {
            setLoadingRecipeFor(null);
        }
    };

    // Recherche de plat: suggestions
    const normalizeString = (str) =>
        str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const searchMets = (e) => {
        const q = normalizeString(e.query || '');
        const all = Array.from(new Set(associations.map(a => a.Met).filter(Boolean)));

        const filtered = q
            ? all.filter(m => normalizeString(m).includes(q))
            : all.slice(0, 30);

        setMetSuggestions(filtered.sort());
    };

    const applyProvenance = (prov, met) => {
        setSelectedCategorie(prov.categorie);
        setSelectedSousCategorie(prov.sousCategorie);
        setCurrentStep(3);
        setExpandedMet(met);
    };

    const onSelectMetSuggestion = (e) => {
        const met = e.value;
        setMetQuery(met);
        setSearchSelectedMet(met);
        const subset = associations.filter(a => a.Met === met);
        const grouped = new Map();
        subset.forEach(a => {
            const key = `${a.Categorie}|||${a.Sous_Categorie}`;
            if (!grouped.has(key)) grouped.set(key, { categorie: a.Categorie, sousCategorie: a.Sous_Categorie, vins: new Set() });
            grouped.get(key).vins.add(a.Vin);
        });
        const provs = Array.from(grouped.values()).map(p => ({
            categorie: p.categorie,
            sousCategorie: p.sousCategorie,
            vinsCount: p.vins.size
        }));
        setSearchProvenances(provs);
        if (provs[0]) applyProvenance(provs[0], met);
    };

    const clearSearch = () => {
        setMetQuery('');
        setSearchSelectedMet(null);
        setSearchProvenances([]);
    };

    const searchMetCards = useMemo(() => {
        if (!searchSelectedMet) return [];
        const subset = associations.filter(a => a.Met === searchSelectedMet);
        const vinsSet = new Set();
        subset.forEach(a => { if (a.Vin) vinsSet.add(a.Vin); });
        return [{ met: searchSelectedMet, vins: Array.from(vinsSet) }];
    }, [searchSelectedMet, associations]);

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-screen bg-gradient-to-b from-[#8C2438] via-[#5A1020] to-[#3B0B15] font-['Work_Sans',sans-serif]">
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
                <div className="flex justify-center items-center h-screen bg-gradient-to-b from-[#8C2438] via-[#5A1020] to-[#3B0B15]  font-['Work_Sans',sans-serif]">
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
                        px-4 py-6 mb-4
                        border-b border-black/40
                        shadow-[0_18px_30px_-18px_rgba(0,0,0,0.9)]
                        bg-transparent
                    "
                >
                    <div className="max-w-6xl mx-auto">
                        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                            Associations Mets &amp; Vins
                        </h1>
                        <p className="mt-1 text-sm text-white/60">
                            Explorez vos mets préférés et découvrez les meilleurs accords.
                        </p>
                    </div>
                </div>



                <div className="max-w-6xl mx-auto p-4">
                    {/* Recherche de plat */}
                    <div className="mb-6">
                        <div
                            className={`
                                bg-gray-800/50 rounded-2xl p-4
                                border shadow-[0_18px_45px_rgba(0,0,0,0.9)]
                                transition-all duration-300
                                ${searchActive ? 'border-gray-400 shadow-[0_0_0_1px_rgba(148,163,184,0.7)]' : 'border-gray-700'}
                                ${searchPulse ? 'animate-[mets-ring_500ms_ease-out]' : ''}
                                metsvins-autocomplete-wrapper
                            `}
                        >
                            <label className="block text-xs font-medium text-white/70 mb-1.5">
                                Rechercher un met
                            </label>
                            <AutoComplete
                                value={metQuery}
                                suggestions={metSuggestions}
                                completeMethod={searchMets}
                                onChange={(e) => setMetQuery(e.value)}
                                onSelect={(e) => {
                                    onSelectMetSuggestion(e);
                                    setSearchPulse(true);
                                    setTimeout(() => setSearchPulse(false), 500);
                                }}
                                onFocus={() => {
                                    setSearchActive(true);
                                    searchMets({ query: metQuery || '' });
                                }}
                                onBlur={() => setSearchActive(false)}
                                placeholder="Ex: Poulet rôti, Sushi, Tarte aux pommes…"
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

                            {searchSelectedMet && (
                                <div className="mt-4">
                                    <div className="text-sm text-white/80 mb-2">
                                        Provenance pour <span className="font-semibold text-white">{searchSelectedMet}</span> :
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {searchProvenances.map((p, i) => (
                                            <button
                                                key={i}
                                                onClick={() => applyProvenance(p, searchSelectedMet)}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs
                                                           bg-gray-800/80 text-white border border-gray-600
                                                           hover:bg-gray-700 transition-colors"
                                                title={`${p.categorie} > ${p.sousCategorie}`}
                                            >
                                                <i className="pi pi-map-marker text-xs"></i>
                                                <span className="truncate max-w-[200px]">{p.categorie} › {p.sousCategorie}</span>
                                                <span className="ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                                                                 bg-black/60 text-white text-[10px] border border-gray-500/70">
                                                    <i className="pi pi-wine-glass text-[10px]"></i>
                                                    {p.vinsCount}
                                                </span>
                                            </button>
                                        ))}
                                        {searchProvenances.length === 0 && (
                                            <span className="text-xs text-white/60">Aucune provenance trouvée</span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stepper */}
                    {!searchSelectedMet && (
                        <div className="bg-gray-900/70 border border-gray-800 rounded-lg p-4 mb-6 shadow-[0_14px_40px_rgba(0,0,0,0.9)]">
                            <div className="flex items-center justify-between">
                                {[
                                    { title: 'Catégories', icon: 'pi-list', step: 1 },
                                    { title: 'Sous-catégories', icon: 'pi-tags', step: 2 },
                                    { title: 'Mets', icon: 'pi-star', step: 3 }
                                ].map((item, index) => (
                                    <React.Fragment key={item.step}>
                                        <div className="flex-1 flex justify-center">
                                            <button
                                                onClick={() => handleStepClick(item.step)}
                                                disabled={item.step > currentStep}
                                                className={`
                                                    w-full flex flex-col items-center
                                                    p-2 rounded-lg transition-colors
                                                    ${item.step <= currentStep ? 'text-white' : 'text-white/35'}
                                                    ${item.step === currentStep ? 'bg-gray-800/80' : 'bg-transparent'}
                                                `}
                                            >
                                                <i className={`pi ${item.icon} text-xl mb-1`}></i>
                                                <span className="text-xs font-medium uppercase tracking-wide">
                                                    {item.title}
                                                </span>
                                            </button>
                                        </div>
                                        {index < 2 && (
                                            <div
                                                className={`
                                                    flex-1 h-0.5 mx-2
                                                    ${item.step < currentStep ? 'bg-white/70' : 'bg-gray-700'}
                                                `}
                                            />
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Sélection actuelle */}
                    {!searchSelectedMet && (
                        <div className="bg-gray-900/80 border border-gray-800 rounded-lg p-4 mb-6 shadow-[0_14px_40px_rgba(0,0,0,1)]">
                            <div className="flex items-center gap-2 mb-2">
                                <i className="pi pi-info-circle text-sm"></i>
                                <span className="text-sm font-medium text-white">Vos sélections</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {selectedCategorie && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs
                                                     bg-gray-800 text-white border border-gray-600">
                                        <i className="pi pi-list mr-1 text-xs"></i>
                                        {selectedCategorie}
                                    </span>
                                )}
                                {selectedSousCategorie && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs
                                                     bg-gray-800 text-white border border-gray-600">
                                        <i className="pi pi-tags mr-1 text-xs"></i>
                                        {selectedSousCategorie}
                                    </span>
                                )}
                                {selectedMet && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs
                                                     bg-gray-800 text-white border border-gray-600">
                                        <i className="pi pi-star mr-1 text-xs"></i>
                                        {selectedMet}
                                    </span>
                                )}
                            </div>
                            <div className="mt-2 text-xs text-white/50">
                                Étape {currentStep}/3
                            </div>
                        </div>
                    )}

                    {/* Contenu principal */}
                    {!searchSelectedMet && (
                        <div className="bg-gray-900/80 rounded-lg border border-gray-800 shadow-[0_22px_70px_rgba(0,0,0,1)]">
                            {currentStep === 1 && (
                                <StepContent
                                    title="Sélectionnez une catégorie"
                                    items={categories}
                                    onSelect={handleCategorieSelect}
                                    icon="pi-list"
                                    bgColor="bg-gray-900"
                                    borderColor="border-gray-700"
                                />
                            )}

                            {currentStep === 2 && (
                                <StepContent
                                    title="Sélectionnez une sous-catégorie"
                                    items={sousCategories}
                                    onSelect={handleSousCategorieSelect}
                                    icon="pi-tags"
                                    bgColor="bg-gray-900"
                                    borderColor="border-gray-700"
                                    emptyMessage="Choisir une catégorie"
                                />
                            )}

                            {currentStep === 3 && (
                                <MetsExpandable
                                    mets={mets}
                                    expandedMet={expandedMet}
                                    onToggleMet={handleMetToggle}
                                    getVinsByMet={getVinsByMet}
                                    onRecipe={generateRecipe}
                                    loadingRecipeFor={loadingRecipeFor}
                                />
                            )}
                        </div>
                    )}

                    {/* Résultats de recherche */}
                    {searchSelectedMet && (
                        <div className="bg-gray-900/80 rounded-lg border border-gray-800 shadow-[0_22px_70px_rgba(0,0,0,1)] p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-white">
                                        Résultats pour « {searchSelectedMet} »
                                    </h2>
                                    <p className="text-sm text-white/60">
                                        {searchMetCards.length} provenance(s)
                                    </p>
                                </div>
                                <Button
                                    label="Effacer"
                                    icon="pi pi-times"
                                    className="p-button-text text-white"
                                    onClick={clearSearch}
                                />
                            </div>
                            {searchMetCards.length === 0 ? (
                                <div className="text-sm text-white/60">Aucun résultat</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {searchMetCards.map((card, idx) => (
                                        <div
                                            key={idx}
                                            className="group p-4 rounded-2xl border bg-gray-800/70 border-gray-700
                                                       shadow-[0_18px_45px_rgba(0,0,0,1)] hover:shadow-[0_24px_60px_rgba(0,0,0,1)]
                                                       transition-all hover:-translate-y-0.5"
                                        >
                                            <div className="w-full aspect-[16/9] rounded-xl overflow-hidden bg-gray-900 mb-3">
                                                {recipesMap[normalizeName(card.met)] ? (
                                                    <img
                                                        src={`data:image/jpeg;base64,${recipesMap[normalizeName(card.met)]}`}
                                                        alt={`Image recette pour ${card.met}`}
                                                        className="w-full h-full object-cover"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-white/30">
                                                        <i className="pi pi-image text-2xl"></i>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-start justify-between gap-2">
                                                <div
                                                    className="font-semibold text-base md:text-lg text-white truncate"
                                                    title={card.met}
                                                >
                                                    {card.met}
                                                </div>
                                            </div>
                                            <div className="mt-3 flex flex-wrap gap-1.5">
                                                {card.vins.length > 0 ? (
                                                    card.vins.map((v, i) => (
                                                        <span
                                                            key={i}
                                                            className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] md:text-xs
                                                                       bg-gray-900 text-white border border-gray-700"
                                                            title={v}
                                                        >
                                                            <i className="pi pi-wine-glass text-xs mr-1"></i>
                                                            {v}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-white/60">Aucun vin associé</span>
                                                )}
                                            </div>
                                            <div className="mt-4 flex justify-end">
                                                <Button
                                                    label="Voir recette"
                                                    icon="pi pi-book"
                                                    className="p-button-sm bg-gradient-to-r from-rose-500 to-orange-400 border-none px-4 py-2 text-white"
                                                    onClick={() => generateRecipe(card.met, card.vins[0])}
                                                    aria-label={`Voir recette pour ${card.met}`}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

// Contenu des étapes
const StepContent = ({ title, items, onSelect, icon, bgColor, borderColor, emptyMessage }) => {
    return (
        <div className="p-6">
            <div
                className={`flex flex-col sm:flex-row sm:items-center gap-3 mb-6 p-4 ${bgColor} ${borderColor}
                            border rounded-lg relative overflow-hidden`}
            >
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-20"></div>

                <div className="flex items-center gap-3 relative z-10">
                    <i className={`pi ${icon} text-2xl text-white`}></i>
                    <h2 className="text-2xl font-bold text-white">{title}</h2>
                </div>

                <div className="mt-2 sm:mt-0 sm:ml-auto flex items-center gap-2 relative z-10">
                    <span className="text-xs bg-black/40 shadow-sm text-white px-2 py-1 rounded-full border border-white/20">
                        {items.length} élément(s)
                    </span>
                </div>
            </div>

            {items.length === 0 ? (
                <div className="text-center py-16">
                    <i className={`pi ${icon} text-6xl text-white/20 mb-4`}></i>
                    <p className="text-lg text-white/70">
                        {emptyMessage || 'Aucun élément disponible'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => onSelect(item)}
                            className="group relative text-left p-4
                                       bg-gray-900/80 hover:bg-gray-800
                                       rounded-xl border border-gray-700
                                       transition-all focus:outline-none
                                       focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-rose-400 focus-visible:ring-offset-black
                                       shadow-[0_10px_30px_rgba(0,0,0,1)] hover:shadow-[0_16px_45px_rgba(0,0,0,1)]"
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-white pr-4 line-clamp-2">
                                    {item}
                                </span>
                                <span className="flex h-6 w-6 items-center justify-center rounded-full
                                                 bg-white/20 backdrop-blur-sm text-white text-[10px]
                                                 shadow-md group-hover:scale-110 transition-transform">
                                    <i className="pi pi-chevron-right text-xs"></i>
                                </span>
                            </div>
                            <div className="absolute inset-x-3 bottom-1 h-px
                                            bg-gradient-to-r from-transparent via-white/40 to-transparent
                                            opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// Mets expandable
const MetsExpandable = ({ mets, expandedMet, onToggleMet, getVinsByMet, onRecipe, loadingRecipeFor }) => {
    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-6 p-4 bg-gray-900 border border-gray-700 rounded-lg">
                <i className="pi pi-star text-2xl text-white"></i>
                <h2 className="text-2xl font-bold text-white">Sélectionnez un met</h2>
                <div className="ml-auto text-xs bg-black/50 shadow-sm text-white px-2 py-1 rounded-full border border-white/15">
                    {mets.length} élément(s)
                </div>
            </div>
            {mets.length === 0 ? (
                <div className="text-center py-16">
                    <i className="pi pi-star text-6xl text-white/20 mb-4"></i>
                    <p className="text-lg text-white/70">Choisir une sous-catégorie</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mets.map((met, idx) => {
                        const isOpen = expandedMet === met;
                        const vinsAssocies = getVinsByMet(met);
                        const isLoading = loadingRecipeFor === met;
                        return (
                            <div
                                key={idx}
                                className={`rounded-2xl border relative overflow-hidden transition-all ${isOpen
                                    ? 'border-rose-400 shadow-lg bg-gray-900'
                                    : 'border-gray-700 bg-gray-900/80 hover:border-rose-400'
                                    }`}
                            >
                                <button
                                    type="button"
                                    onClick={() => onToggleMet(met)}
                                    className="w-full text-left p-4 flex items-center justify-between gap-4 focus:outline-none"
                                    aria-expanded={isOpen}
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div
                                            className={`flex h-10 w-10 items-center justify-center rounded-full border text-white shadow-sm ${isOpen
                                                ? 'bg-rose-500/20 border-rose-400'
                                                : 'bg-gray-800 border-gray-600'
                                                }`}
                                        >
                                            <i className="pi pi-star text-lg"></i>
                                        </div>
                                        <div className="min-w-0">
                                            <span
                                                className="font-semibold text-white truncate"
                                                title={met}
                                            >
                                                {met}
                                            </span>
                                            <div className="mt-0.5 text-[11px] uppercase tracking-wide text-white/60 font-medium">
                                                {vinsAssocies.length} vin(s)
                                            </div>
                                        </div>
                                    </div>
                                    <span
                                        className={`flex h-8 w-8 items-center justify-center rounded-full border text-white/80 transition-transform ${isOpen
                                            ? 'rotate-180 bg-gray-800 border-rose-400'
                                            : 'bg-gray-800 border-gray-600 hover:border-rose-400'
                                            }`}
                                    >
                                        <i className={`pi ${isOpen ? 'pi-chevron-up' : 'pi-chevron-down'} text-sm`}></i>
                                    </span>
                                </button>
                                {isOpen && (
                                    <div className="px-5 pb-5 pt-1 space-y-4 border-t border-gray-700">
                                        <div className="flex flex-wrap gap-2">
                                            {vinsAssocies.length > 0 ? (
                                                vinsAssocies.map((vin, i) => (
                                                    <span
                                                        key={i}
                                                        className="inline-flex items-center px-3 py-1 rounded-full text-xs
                                                                   bg-black/60 text-white border border-gray-600"
                                                        title={vin}
                                                    >
                                                        {vin}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-white/60">
                                                    Aucun vin associé
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <button
                                                onClick={() => onRecipe(met, vinsAssocies[0])}
                                                disabled={isLoading}
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                                                           bg-gradient-to-r from-rose-500 to-orange-400 text-white text-sm font-medium
                                                           shadow-sm hover:from-rose-600 hover:to-orange-500
                                                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-400 focus:ring-offset-black
                                                           disabled:opacity-50"
                                                aria-label={`Voir recette pour ${met}`}
                                            >
                                                {isLoading ? (
                                                    <span className="flex items-center gap-2">
                                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                                        Chargement...
                                                    </span>
                                                ) : (
                                                    <>
                                                        <i className="pi pi-book"></i>
                                                        Voir recette
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MetsVins;
