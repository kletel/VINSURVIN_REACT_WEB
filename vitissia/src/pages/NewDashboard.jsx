import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { IconVin } from '../components/CustomIcons'; // On garde seulement IconVin
import useFetchCaves from '../hooks/useFetchCaves';
import useFetchAssociations from '../hooks/useFetchAssociations';
import useFetchVocabulaires from '../hooks/useFetchVocabulaires';
import useFetchFavoris from '../hooks/useFetchFavoris';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { InputText } from 'primereact/inputtext';
import FooterLinks from "../components/FooterLinks";

// 🔥 Nouveaux icônes pour les tuiles
import { GiWineBottle, GiKnifeFork, GiOpenBook } from 'react-icons/gi';

// Tuile façon VinConseil : image assombrie + texte direct, plus de bloc blanc
function Tile({ title, subtitle, img, onOpen, extra, Icon, mounted, delay = 0 }) {
    return (
        <div
            onClick={onOpen}
            onKeyDown={(e) => { if (e.key === 'Enter') onOpen(); }}
            role="button"
            tabIndex={0}
            className={`
                group relative isolate overflow-hidden rounded-2xl
                shadow-lg ring-1 ring-black/40 bg-black
                focus:outline-none text-left cursor-pointer
                transition-all duration-700 ease-out
                ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
                hover:shadow-2xl
            `}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {/* Image de fond */}
            <img
                src={img}
                alt={title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Assombrissement type maquette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/10 group-hover:from-black/90 group-hover:via-black/55" />

            {/* Badge feuille décoratif */}
            <div className="pointer-events-none absolute -left-2 -top-2 rotate-[-12deg]">
                <span className="inline-flex items-center gap-1 rounded-xl bg-red-700/90 text-white text-[10px] px-2 py-1 ring-1 ring-white/30 shadow-sm">
                    <span>🍃</span> Vitiss.IA
                </span>
            </div>

            {/* Contenu texte directement sur l'image assombrie */}
            <div className="relative z-10 flex h-full min-h-[220px] flex-col justify-end p-4 pb-5">
                <div className="flex items-center gap-3">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/40">
                        {Icon ? <Icon className="h-5 w-5" /> : null}
                    </span>
                    <h3 className="text-[20px] font-bold tracking-tight text-white">
                        {title}
                    </h3>
                </div>

                <p className="mt-2 text-sm text-gray-100">
                    {subtitle}
                </p>

                {extra ? (
                    <div className="mt-3 text-sm text-gray-100">
                        {extra}
                    </div>
                ) : null}

                <div className="mt-4 flex items-center gap-2 text-sm font-medium">
                    <span className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium ring-1 ring-inset ring-white/40 bg-red-700 text-white group-hover:bg-red-600 transition-all duration-300 ">
                        Ouvrir <i className="pi pi-chevron-right text-xs" />
                    </span>
                </div>
            </div>
        </div>
    );
}

// Helper: index stable par jour (ne change pas au refresh)
function stableIndex(seedKey, len) {
    if (!len) return 0;
    const d = new Date();
    const seed = `${seedKey}-${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    return h % len;
}

const getCavesCacheKey = (uuid) => (uuid ? `vitissia_caves_cache_${uuid}` : null);

const NewDashboard = () => {
    const navigate = useNavigate();
    const [showMesCavesPopup, setShowMesCavesPopup] = useState(false);
    const [showMesRecettesPopup, setShowMesRecettesPopup] = useState(false);
    const uuidUser = sessionStorage.getItem('uuid_user');
    const cavesCacheKey = getCavesCacheKey(uuidUser);

    // Animations d’entrée
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 50);
        return () => clearTimeout(t);
    }, []);

    // Données dynamiques via APIs
    const { caves, fetchCaves } = useFetchCaves();
    const { associations, fetchAssociations } = useFetchAssociations();
    const { vocabulaires, fetchVocabulaires } = useFetchVocabulaires();
    const { favoris, fetchFavoris } = useFetchFavoris();

    // Récherche met
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (Array.isArray(caves) && caves.length > 0) {
            try {
                if (cavesCacheKey) {
                    localStorage.setItem(cavesCacheKey, JSON.stringify(caves));
                }
            } catch (e) {
                console.warn('Erreur écriture cache caves depuis Dashboard', e);
            }
        }
    }, [caves, cavesCacheKey]);

    useEffect(() => {
        fetchCaves();
        fetchAssociations();
        fetchVocabulaires();
        fetchFavoris();
    }, [fetchCaves, fetchAssociations, fetchVocabulaires, fetchFavoris]);

    // Stats caves depuis l'API
    const statsCave = useMemo(() => {
        if (!Array.isArray(caves) || caves.length === 0) return { bottles: 0, regions: 0 };
        let bottles = 0;
        const regions = new Set();
        for (const v of caves) {
            const reste = parseFloat(v?.Reste);
            bottles += isNaN(reste) ? 1 : reste;
            const r = v?.['Région'] || v?.Region || v?.region;
            if (r) regions.add(r);
        }
        return { bottles, regions: regions.size };
    }, [caves]);

    const favorisCount = Array.isArray(favoris) ? favoris.length : 0;

    // Listes uniques issues des associations
    const uniqueMets = useMemo(
        () => Array.from(new Set((associations || []).map(a => a?.Met).filter(Boolean))),
        [associations]
    );
    const uniqueVins = useMemo(
        () => Array.from(new Set((associations || []).map(a => a?.Vin).filter(Boolean))),
        [associations]
    );

    // Sélections du jour (stables pour la journée)
    const motJour = useMemo(() => {
        if (!Array.isArray(vocabulaires) || vocabulaires.length === 0) return '';
        const idx = stableIndex('mot', vocabulaires.length);
        const item = vocabulaires[idx];
        return item?.Nom_Fr || item?.Nom || '';
    }, [vocabulaires]);

    const metJour = useMemo(() => {
        if (uniqueMets.length === 0) return '';
        return uniqueMets[stableIndex('met', uniqueMets.length)] || '';
    }, [uniqueMets]);

    const vinJour = useMemo(() => {
        if (uniqueVins.length === 0) return '';
        return uniqueVins[stableIndex('vin', uniqueVins.length)] || '';
    }, [uniqueVins]);

    const getMetsForVinDuJour = (vin) => {
        const subset = associations.filter(a => a.Vin === vin);
        const grouped = new Map();

        subset.forEach(a => {
            const met = a.Met;
            if (!grouped.has(met)) grouped.set(met, new Map());
            const key = `${a.Categorie}|||${a.Sous_Categorie}`;
            grouped.get(met).set(key, { categorie: a.Categorie, sousCategorie: a.Sous_Categorie });
        });

        return Array.from(grouped.entries()).map(([met, pathsMap]) => ({
            met,
            paths: Array.from(pathsMap.values())
        }));
    };
    /*bg-gradient-to-b from-[#5A1020] via-[#3B0B15] to-[#24060C]*/
    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-b from-[#8C2438] via-[#5A1020] to-[#3B0B15] font-['Work_Sans',sans-serif]">

                <div className="max-w-6xl mx-auto p-4">
                    <h1 className="text-[28px] font-bold text-white mb-2 tracking-tight">
                        Bonjour, que souhaitez-vous faire ?
                    </h1>
                    <p
                        className={`
                            text-sm text-white
                            transition-opacity duration-700
                            ${mounted ? 'opacity-100' : 'opacity-0'}
                        `}
                    >
                        Accédez rapidement à vos fonctionnalités clés.
                    </p>

                    <div className="mt-6">
                        <Tile
                            Icon={GiOpenBook}
                            title="Gabriel, Mon Sommelier-Conseil"
                            subtitle="Sélectionnez les meilleurs vins"
                            img="/bg-wine.webp"
                            onOpen={() => {
                                navigate('/sommelier');
                            }}
                            mounted={mounted}
                            delay={350}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
                        <Tile
                            Icon={GiWineBottle}
                            title="Mes caves"
                            subtitle="Gérez et explorez toutes vos bouteilles"
                            img="/cave-card.webp"
                            onOpen={() => {
                                const isLoggedIn = !!sessionStorage.getItem('token');
                                if (isLoggedIn) {
                                    navigate('/cave');
                                } else {
                                    setShowMesCavesPopup(true);
                                }
                            }}
                            extra={
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                    <span className="inline-flex items-center rounded-lg px-2.5 py-1 ring-1 ring-white/40 bg-black/40 text-gray-100">
                                        Bouteilles: {statsCave.bottles || '—'}
                                    </span>
                                    <span className="inline-flex items-center rounded-lg px-2.5 py-1 ring-1 ring-white/40 bg-black/40 text-gray-100">
                                        Régions: {statsCave.regions || '—'}
                                    </span>
                                    <span className="inline-flex items-center rounded-lg px-2.5 py-1 ring-1 ring-white/40 bg-black/40 text-gray-100">
                                        Favoris: {favorisCount || '—'}
                                    </span>
                                </div>
                            }
                            mounted={mounted}
                            delay={0}
                        />

                        <Tile
                            Icon={GiKnifeFork}
                            title="Rechercher un met"
                            subtitle="Trouvez les vins adaptés à votre plat"
                            img="/met-card.webp"
                            extra={
                                <div className="flex flex-wrap items-center gap-3">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            try {
                                                sessionStorage.setItem('metName', metJour || '');
                                                sessionStorage.removeItem('recetteUUID');
                                                sessionStorage.removeItem('vinName');
                                            } catch (_) { }
                                            navigate('/recette');
                                        }}
                                        className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm ring-1 ring-inset ring-white/40 bg-white/80 hover:bg-white text-emerald-900"
                                    >
                                        <i className="pi pi-external-link text-xs" /> Plat du jour: <strong>{metJour || '—'}</strong>
                                    </button>
                                </div>
                            }
                            onOpen={() => navigate('/mets-vins', { state: { search } })}
                            mounted={mounted}
                            delay={100}
                        />

                        <Tile
                            Icon={IconVin}
                            title="Rechercher un vin"
                            subtitle="Découvrez les mets qui s’accordent au vin"
                            img="/vin-card.webp"
                            onOpen={() => navigate('/vins-mets')}
                            extra={
                                <div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            try {
                                                const vin = vinJour || '';
                                                sessionStorage.setItem('vinName', vin);
                                                sessionStorage.removeItem('recetteUUID');
                                                const mets = getMetsForVinDuJour(vin);
                                                sessionStorage.setItem('metsForVin', JSON.stringify(mets));
                                            } catch (_) { }
                                            navigate('/vins-mets');
                                        }}
                                        className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm ring-1 ring-inset ring-white/40 bg-white/80 hover:bg-white text-emerald-900"
                                    >
                                        <i className="pi pi-external-link text-xs" /> Vin du jour: <strong>{vinJour || '—'}</strong>
                                    </button>
                                </div>
                            }
                            mounted={mounted}
                            delay={200}
                        />

                        {/* Dictionnaire */}
                        <Tile
                            Icon={GiOpenBook}
                            title="Dictionnaire"
                            subtitle="Termes, arômes et technique"
                            img="/dico-card.webp"
                            onOpen={() => navigate('/dictionnaire')}
                            extra={
                                <div className="text-sm text-gray-100">
                                    Mot du jour: <strong>{motJour || '—'}</strong>
                                </div>
                            }
                            mounted={mounted}
                            delay={300}
                        />

                        {/* Mes recettes */}
                        <Tile
                            Icon={GiOpenBook}
                            title="Mes recettes"
                            subtitle="Vos recettes favorites et sauvegardées"
                            img="/recette-card.webp"
                            onOpen={() => {
                                const isLoggedIn = !!sessionStorage.getItem('token');
                                if (isLoggedIn) {
                                    navigate('/mes-recettes');
                                } else {
                                    setShowMesRecettesPopup(true);
                                }
                            }}
                            mounted={mounted}
                            delay={350}
                        />
                    </div>

                    {/* Popup sans redirection pour "Mes caves" */}
                    {showMesCavesPopup && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center">
                            <div className="absolute inset-0 bg-black/40" onClick={() => setShowMesCavesPopup(false)} />
                            <div className="relative mx-4 w-full max-w-md rounded-2xl overflow-hidden backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/40 dark:border-gray-800 shadow-2xl">
                                <div className="p-5">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                                            <i className="pi pi-info-circle" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Mes caves</h3>
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        Vous restez sur le tableau de bord. Utilisez le menu ou la recherche pour consulter vos caves.
                                    </p>
                                    <div className="mt-4 flex justify-end gap-2">
                                        <button
                                            onClick={() => setShowMesCavesPopup(false)}
                                            className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                                        >
                                            Fermer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Popup sans redirection pour "Mes recettes" */}
                    {showMesRecettesPopup && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center">
                            <div className="absolute inset-0 bg-black/40" onClick={() => setShowMesRecettesPopup(false)} />
                            <div className="relative mx-4 w-full max-w-md rounded-2xl overflow-hidden backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/40 dark:border-gray-800 shadow-2xl">
                                <div className="p-5">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                                            <i className="pi pi-info-circle" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Mes Recettes</h3>
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        Vous restez sur le tableau de bord. Utilisez le menu ou la recherche pour consulter vos recettes.
                                    </p>
                                    <div className="mt-4 flex justify-end gap-2">
                                        <button
                                            onClick={() => setShowMesRecettesPopup(false)}
                                            className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                                        >
                                            Fermer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Bandeau nature: Scannez un vin */}
                    <div
                        className={`
                            mt-8 rounded-2xl overflow-hidden ring-1 ring-emerald-900/10 shadow-md
                            transition-all duration-700
                            ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}
                        `}
                        style={{ backgroundImage: "url('/bg-vigne.webp')", backgroundSize: 'cover', backgroundPosition: 'center' }}
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/50 via-emerald-800/30 to-emerald-700/30"></div>
                            <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <h2 className="text-white text-xl sm:text-2xl font-semibold">Scannez un vin</h2>
                                    <p className="text-emerald-50 text-sm mt-1">
                                        Ajoutez rapidement une bouteille depuis l’appareil photo.
                                    </p>
                                </div>
                                <button
                                    onClick={() => navigate('/creation-vin')}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 bg-red-700 hover:bg-red-600 transition-all duration-300 text-white font-medium ring-1 ring-emerald-900/10"
                                >
                                    <i className="pi pi-camera" /> Analyser une étiquette
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
               
        </Layout>
        
    );
};

export default NewDashboard;
