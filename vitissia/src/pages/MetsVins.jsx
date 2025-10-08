import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import useFetchAssociations from '../hooks/useFetchAssociations';
import config from '../config/config';
import authHeader from '../config/authHeader';
import Layout from '../components/Layout';
import { AutoComplete } from 'primereact/autocomplete';
import { useLocation } from 'react-router-dom';

const MetsVins = () => {
    const { associations, fetchAssociations, loading, error } = useFetchAssociations();
    const navigate = useNavigate();
    const toast = useRef(null);

    const [currentStep, setCurrentStep] = useState(1);
    const [selectedCategorie, setSelectedCategorie] = useState(null);
    const [selectedSousCategorie, setSelectedSousCategorie] = useState(null);
    const [selectedMet, setSelectedMet] = useState(null); // conservé si besoin futur
    const [expandedVin, setExpandedVin] = useState(null); // legacy (plus utilisé)
    const [expandedMet, setExpandedMet] = useState(null); // nouveau: met déplié
    const [selectedVin, setSelectedVin] = useState('');
    const [selectedMetForRecipe, setSelectedMetForRecipe] = useState('');
    const [loadingRecipeFor, setLoadingRecipeFor] = useState(null); // Pour gérer le chargement par met spécifique

    // Recherche de plat
    const [metQuery, setMetQuery] = useState('');
    const [metSuggestions, setMetSuggestions] = useState([]);
    const [searchSelectedMet, setSearchSelectedMet] = useState(null);
    const [searchProvenances, setSearchProvenances] = useState([]); // {categorie, sousCategorie, vinsCount}
    // Images recettes (mapping nomMet -> imageBase64)
    const [recipesMap, setRecipesMap] = useState({});

    // Restauration (après retour de la page Recette)
    const [rehydrated, setRehydrated] = useState(false);

    //Recherche depuis accueil
    const location = useLocation();
    const search = location.state?.search || '';

    useEffect(() => {
        fetchAssociations();
    }, [fetchAssociations]);

    // Normalisation de nom pour matcher recettes ⇄ mets
    const normalizeName = (str) => (str || '')
        .toString()
        .trim()
        .toLowerCase()
        .normalize('NFD').replace(/\p{Diacritic}/gu, '')
        .replace(/\s+/g, ' ');

    // Chargement ciblé des recettes (images) pour le met recherché
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

    // Réhydrater l'état après que les associations soient chargées
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

    const vins = selectedMet
        ? [...new Set(
            associations
                .filter(a =>
                    a.Categorie === selectedCategorie &&
                    a.Sous_Categorie === selectedSousCategorie &&
                    a.Met === selectedMet
                )
                .map(a => a.Vin)
        )]
        : [];

    // Nouveau helper: vins par met
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

    // Fonctions de navigation
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

    const handleMetSelect = (met) => {
        // Désormais on ne passe plus à une étape 4, on déplie simplement
        setExpandedMet(prev => prev === met ? null : met);
    };

    const handleMetToggle = (met) => {
        setExpandedMet(prev => prev === met ? null : met);
    };

    const generateRecipe = async (met, vinOpt) => {
        // Sauvegarde état courant pour retour
        const stateSnapshot = {
            currentStep,
            selectedCategorie,
            selectedSousCategorie,
            expandedMet: met, // on force l'ouverture sur celui cliqué
            timestamp: Date.now()
        };
        sessionStorage.setItem('recetteOrigin', 'METS_VINS');
        sessionStorage.setItem('metsVinsState', JSON.stringify(stateSnapshot));
        const recipeKey = met; // clé basée uniquement sur le met
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

    const getMetsByVin = (vin) => {
        return [...new Set(
            associations
                .filter(a => a.Vin === vin)
                .map(a => a.Met)
        )];
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
        // Construire les provenances (cat/sous-cat) pour ce met
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
        // Appliquer la première provenance par défaut
        if (provs[0]) applyProvenance(provs[0], met);
    };

    const clearSearch = () => {
        setMetQuery('');
        setSearchSelectedMet(null);
        setSearchProvenances([]);
    };

    // Résultats cartes pour le met recherché: une carte par provenance (cat/sous-cat) avec vins associés
    const searchMetCards = useMemo(() => {
        if (!searchSelectedMet) return [];
        // Dédupliquer par met uniquement et rassembler tous les vins associés
        const subset = associations.filter(a => a.Met === searchSelectedMet);
        const vinsSet = new Set();
        subset.forEach(a => { if (a.Vin) vinsSet.add(a.Vin); });
        return [{ met: searchSelectedMet, vins: Array.from(vinsSet) }];
    }, [searchSelectedMet, associations]);
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

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 px-4 py-6">
                    <div className="max-w-6xl mx-auto">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Associations Mets & Vins</h1>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto p-4">
                    {/* Recherche de plat */}
                    <div className="mb-6">
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                {/*<span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow">
                                    <i className="pi pi-search"></i>
                                </span>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Rechercher un plat</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Tapez pour trouver un met puis affichez sa provenance</p>
                                </div>*/}
                            </div>
                            <AutoComplete
                                value={metQuery}
                                suggestions={metSuggestions}
                                completeMethod={searchMets}
                                onChange={(e) => setMetQuery(e.value)}
                                onSelect={onSelectMetSuggestion}
                                placeholder="Ex: Poulet rôti, Sushi, Tarte aux pommes…"
                                className="w-full"
                                dropdown
                            />

                            {searchSelectedMet && (
                                <div className="mt-4">
                                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                        Provenance pour <span className="font-semibold">{searchSelectedMet}</span>:
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {searchProvenances.map((p, i) => (
                                            <button
                                                key={i}
                                                onClick={() => applyProvenance(p, searchSelectedMet)}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                                                title={`${p.categorie} > ${p.sousCategorie}`}
                                            >
                                                <i className="pi pi-map-marker"></i>
                                                <span className="truncate max-w-[200px]">{p.categorie} › {p.sousCategorie}</span>
                                                <span className="ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/70 dark:bg-gray-800/60 text-gray-700 dark:text-gray-200 border border-blue-200/50 dark:border-blue-800/40">
                                                    <i className="pi pi-wine-glass text-xs"></i>
                                                    {p.vinsCount}
                                                </span>
                                            </button>
                                        ))}
                                        {searchProvenances.length === 0 && (
                                            <span className="text-xs text-gray-500 dark:text-gray-400">Aucune provenance trouvée</span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stepper Header */}
                    {!searchSelectedMet && (
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-6">
                            <div className="flex items-center justify-between">
                                {[
                                    { title: 'Catégories', icon: 'pi-list', step: 1 },
                                    { title: 'Sous-catégories', icon: 'pi-tags', step: 2 },
                                    { title: 'Mets', icon: 'pi-star', step: 3 }
                                ].map((item, index) => (
                                    <React.Fragment key={item.step}>
                                        <button
                                            onClick={() => handleStepClick(item.step)}
                                            disabled={item.step > currentStep}
                                            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${item.step <= currentStep
                                                ? 'text-blue-600 dark:text-blue-400'
                                                : 'text-gray-400 dark:text-gray-500'
                                                } ${item.step === currentStep ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`}
                                        >
                                            <i className={`pi ${item.icon} text-xl mb-1`}></i>
                                            <span className="text-xs font-medium">{item.title}</span>
                                        </button>
                                        {index < 2 && (
                                            <div className={`flex-1 h-0.5 mx-2 ${item.step < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                                                }`}></div>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Selection Summary */}
                    {!searchSelectedMet && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <i className="pi pi-info-circle text-blue-600 dark:text-blue-400"></i>
                                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Vos sélections</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {selectedCategorie && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800">
                                        <i className="pi pi-list mr-1"></i>
                                        {selectedCategorie}
                                    </span>
                                )}
                                {selectedSousCategorie && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                        <i className="pi pi-tags mr-1"></i>
                                        {selectedSousCategorie}
                                    </span>
                                )}
                                {selectedMet && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                        <i className="pi pi-star mr-1"></i>
                                        {selectedMet}
                                    </span>
                                )}
                            </div>
                            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                Étape {currentStep}/3
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    {!searchSelectedMet && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                            {currentStep === 1 && (
                                <StepContent
                                    title="Sélectionnez une catégorie"
                                    items={categories}
                                    onSelect={handleCategorieSelect}
                                    icon="pi-list"
                                    color="text-green-600"
                                    bgColor="bg-green-50 dark:bg-green-900/20"
                                    borderColor="border-green-200 dark:border-green-800"
                                />
                            )}

                            {currentStep === 2 && (
                                <StepContent
                                    title="Sélectionnez une sous-catégorie"
                                    items={sousCategories}
                                    onSelect={handleSousCategorieSelect}
                                    icon="pi-tags"
                                    color="text-blue-600"
                                    bgColor="bg-blue-50 dark:bg-blue-900/20"
                                    borderColor="border-blue-200 dark:border-blue-800"
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

                    {/* Résultats de recherche: cartes du met sélectionné */}
                    {searchSelectedMet && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Résultats pour "{searchSelectedMet}"</h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{searchMetCards.length} provenance(s)</p>
                                </div>
                                <Button label="Effacer" icon="pi pi-times" className="p-button-text" onClick={clearSearch} />
                            </div>
                            {searchMetCards.length === 0 ? (
                                <div className="text-sm text-gray-500 dark:text-gray-400">Aucun résultat</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {searchMetCards.map((card, idx) => (
                                        <div key={idx} className="group p-4 rounded-2xl border bg-white/90 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
                                            {/* Image du met */}
                                            <div className="w-full aspect-[16/9] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 mb-3">
                                                {recipesMap[normalizeName(card.met)] ? (
                                                    <img
                                                        src={`data:image/jpeg;base64,${recipesMap[normalizeName(card.met)]}`}
                                                        alt={`Image recette pour ${card.met}`}
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
                                                <div className="font-semibold text-base md:text-lg text-gray-900 dark:text-white truncate" title={card.met}>{card.met}</div>
                                            </div>
                                            <div className="mt-3 flex flex-wrap gap-1.5">
                                                {card.vins.length > 0 ? (
                                                    card.vins.map((v, i) => (
                                                        <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] md:text-xs bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800" title={v}>
                                                            <i className="pi pi-wine-glass text-xs"></i>
                                                            {v}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">Aucun vin associé</span>
                                                )}
                                            </div>
                                            <div className="mt-4 flex justify-end">
                                                <Button
                                                    label="Voir recette"
                                                    icon="pi pi-book"
                                                    className="p-button-sm"
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

            {/* Dialog de confirmation pour la recette */}
            {/* Dialog supprimé - génération directe au clic de l'icône */}
        </Layout>
    );
};

// Composant pour le contenu de chaque étape
const StepContent = ({ title, items, onSelect, icon, color, bgColor, borderColor, emptyMessage }) => {
    return (
        <div className="p-6">
            <div className={`flex items-center gap-3 mb-6 p-4 ${bgColor} ${borderColor} border rounded-lg relative overflow-hidden`}>
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/5 to-transparent dark:via-white/10 opacity-0 animate-pulse-slow"></div>
                <i className={`pi ${icon} text-2xl ${color}`}></i>
                <h2 className={`text-2xl font-bold ${color}`}>{title}</h2>
                <div className="ml-auto flex items-center gap-2">
                    <span className="text-xs bg-white dark:bg-gray-800 shadow-sm text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full border border-gray-200 dark:border-gray-600">
                        {items.length} élément(s)
                    </span>
                </div>
            </div>
            {items.length === 0 ? (
                <div className="text-center py-16">
                    <i className={`pi ${icon} text-6xl text-gray-300 dark:text-gray-600 mb-4`}></i>
                    <p className="text-lg text-gray-500 dark:text-gray-400">
                        {emptyMessage || 'Aucun élément disponible'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => onSelect(item)}
                            className="group relative text-left p-4 bg-gray-50/60 dark:bg-gray-700/60 hover:bg-white dark:hover:bg-gray-600 rounded-xl border border-gray-200 dark:border-gray-600 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 shadow-sm hover:shadow-md"
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-900 dark:text-white pr-4 line-clamp-2">
                                    {item}
                                </span>
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-blue-500 to-blue-600 text-white text-[10px] shadow-md group-hover:scale-110 transition-transform">
                                    <i className="pi pi-chevron-right text-xs"></i>
                                </span>
                            </div>
                            <div className="absolute inset-x-3 bottom-1 h-px bg-gradient-to-r from-transparent via-gray-300/70 dark:via-gray-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// Nouveau composant: Mets expandable avec vins
const MetsExpandable = ({ mets, expandedMet, onToggleMet, getVinsByMet, onRecipe, loadingRecipeFor }) => {
    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                <i className="pi pi-star text-2xl text-purple-600"></i>
                <h2 className="text-2xl font-bold text-purple-600">Sélectionnez un met</h2>
                <div className="ml-auto text-xs bg-white dark:bg-gray-800 shadow-sm text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full border border-gray-200 dark:border-gray-600">
                    {mets.length} élément(s)
                </div>
            </div>
            {mets.length === 0 ? (
                <div className="text-center py-16">
                    <i className="pi pi-star text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
                    <p className="text-lg text-gray-500 dark:text-gray-400">Choisir une sous-catégorie</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mets.map((met, idx) => {
                        const isOpen = expandedMet === met;
                        const vinsAssocies = getVinsByMet(met);
                        const isLoading = loadingRecipeFor === met;
                        return (
                            <div key={idx} className={`rounded-2xl border relative overflow-hidden transition-all ${isOpen ? 'border-purple-300 dark:border-purple-600 shadow-md bg-white/80 dark:bg-gray-800/70' : 'border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/40 hover:border-purple-300 dark:hover:border-purple-600'}`}>
                                <button
                                    type="button"
                                    onClick={() => onToggleMet(met)}
                                    className="w-full text-left p-4 flex items-center justify-between gap-4 focus:outline-none"
                                    aria-expanded={isOpen}
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-full border text-purple-600 shadow-sm ${isOpen ? 'bg-purple-100 border-purple-300 dark:bg-purple-900/40 dark:border-purple-700' : 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800'}`}>
                                            <i className="pi pi-star text-lg"></i>
                                        </div>
                                        <div className="min-w-0">
                                            <span className="font-semibold text-gray-900 dark:text-white truncate" title={met}>{met}</span>
                                            <div className="mt-0.5 text-[11px] uppercase tracking-wide text-purple-500/70 dark:text-purple-300/60 font-medium">{vinsAssocies.length} vin(s)</div>
                                        </div>
                                    </div>
                                    <span className={`flex h-8 w-8 items-center justify-center rounded-full border text-gray-400 transition-transform ${isOpen ? 'rotate-180 bg-purple-50 border-purple-200 dark:bg-purple-900/30 dark:border-purple-700' : 'bg-gray-50 border-gray-200 dark:bg-gray-700/60 dark:border-gray-600 hover:bg-purple-50 hover:border-purple-200 dark:hover:bg-purple-900/30 dark:hover:border-purple-700'}`}>
                                        <i className={`pi ${isOpen ? 'pi-chevron-up' : 'pi-chevron-down'} text-sm`}></i>
                                    </span>
                                </button>
                                {isOpen && (
                                    <div className="px-5 pb-5 pt-1 space-y-4 border-t border-gray-100 dark:border-gray-700">
                                        <div className="flex flex-wrap gap-2">
                                            {vinsAssocies.length > 0 ? (
                                                vinsAssocies.map((vin, i) => (
                                                    <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700" title={vin}>{vin}</span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-gray-500 dark:text-gray-400">Aucun vin associé</span>
                                            )}
                                        </div>
                                        <div>
                                            <button
                                                onClick={() => onRecipe(met, vinsAssocies[0])}
                                                disabled={isLoading}
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium shadow-sm hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
                                                aria-label={`Voir recette pour ${met}`}
                                            >
                                                {isLoading ? (
                                                    <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>Chargement...</span>
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
