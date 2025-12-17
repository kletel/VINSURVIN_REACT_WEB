import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { InputText } from 'primereact/inputtext';
import { FilterMatchMode } from 'primereact/api';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { PrimeReactProvider } from 'primereact/api';
import config from '../config/config';
import authHeader from '../config/authHeader';
import CaveGrid from './CaveGrid';

const CAVE_STATE_KEY = 'caveListState';
const CAVES_CACHE_KEY = 'vitissia_caves_cache';

export default function LstCave({ listeCaves, refreshCaves, loading, error }) {
    let initialPersisted = {};
    try {
        const raw = sessionStorage.getItem(CAVE_STATE_KEY);
        if (raw) {
            initialPersisted = JSON.parse(raw) || {};
        }
    } catch (e) {
        initialPersisted = {};
    }
    const toast = useRef(null);
    const navigate = useNavigate();
    const [caves, setCaves] = useState(listeCaves);
    const [selectedCaves, setSelectedCaves] = useState(null);
    const [globalFilter, setGlobalFilter] = useState(initialPersisted.globalFilter ?? null);
    const dt = useRef(null);
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        Région: { value: null, matchMode: FilterMatchMode.EQUALS },
        Type: { value: null, matchMode: FilterMatchMode.EQUALS },
        Cave: { value: null, matchMode: FilterMatchMode.EQUALS },
        Millesime: { value: null, matchMode: FilterMatchMode.EQUALS },
    });

    const [visibleData, setVisibleData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [showSortDialog, setShowSortDialog] = useState(false);
    const [filterButtonRef, setFilterButtonRef] = useState(null);
    const [sortButtonRef, setSortButtonRef] = useState(null);
    const [mobileFilters, setMobileFilters] = useState(
        initialPersisted.mobileFilters ?? {
            caves: [],
            pays: null,
            couleur: null,
            type: null,
            douceur: null,
            contenant: null,
            millesime: null,
            note: null,
        }
    );
    const [sortField, setSortField] = useState(initialPersisted.sortField ?? 'Nom');
    const [sortOrder, setSortOrder] = useState(initialPersisted.sortOrder ?? 1);
    const [showEnCaveOnly, setShowEnCaveOnly] = useState(initialPersisted.showEnCaveOnly ?? false);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(initialPersisted.showFavoritesOnly ?? false);

    useEffect(() => {
        const stateToSave = {
            globalFilter,
            mobileFilters,
            sortField,
            sortOrder,
            showEnCaveOnly,
            showFavoritesOnly,
        };
        sessionStorage.setItem(CAVE_STATE_KEY, JSON.stringify(stateToSave));
    }, [globalFilter, mobileFilters, sortField, sortOrder, showEnCaveOnly, showFavoritesOnly]);


    const { regions, pays, types, millesime, totalPrice, totalResteFiltered, couleurs, douceurs, contenants } = useMemo(() => {
        const regions = [...new Set(listeCaves.map(cave => cave.Région))].filter(Boolean);
        const pays = [...new Set(listeCaves.map(cave => cave.Pays))].filter(Boolean);
        const types = [...new Set(listeCaves.map(cave => cave.Type))].filter(Boolean);
        const millesime = [...new Set(listeCaves.map(cave => cave.Millesime))].filter(Boolean);
        const couleurs = [...new Set(listeCaves.map(cave => cave.Couleur))].filter(Boolean);
        const douceurs = [...new Set(listeCaves.map(cave => cave.Douceur))].filter(Boolean);
        const contenants = [...new Set(listeCaves.map(cave => cave.Flacon))].filter(Boolean);
        const totalPrice = caves.reduce((sum, row) => sum + (row.valeurCave || 0), 0);
        const totalResteFiltered = caves.reduce((sum, row) => sum + (row.Reste_en_Cave || 0), 0);

        return { regions, pays, types, millesime, couleurs, douceurs, contenants, totalPrice, totalResteFiltered };
    }, [listeCaves, caves]);

    const [selectedCave, setSelectedCave] = useState(null);
    const [distinctCaves, setDistinctCaves] = useState([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const uuidUser = useMemo(() => sessionStorage.getItem('uuid_user'), []);

    useEffect(() => {
        if (!uuidUser) return;
        let aborted = false;
        const controller = new AbortController();
        const fetchDistinct = async () => {
            try {
                const resp = await fetch(`${config.apiBaseUrl}/4DACTION/react_getDistincteCaves?UUID_=${encodeURIComponent(uuidUser)}`, {
                    method: 'GET',
                    headers: authHeader(),
                    signal: controller.signal
                });
                if (!resp.ok) throw new Error('Erreur serveur');
                const data = await resp.json();
                if (aborted) return;
                if (Array.isArray(data)) {
                    setDistinctCaves([
                        { label: 'Toutes', value: 'Toutes' },
                        ...data.filter(Boolean).map(c => ({ label: c, value: c }))
                    ]);
                    localStorage.setItem('distinctCaves', JSON.stringify(data));
                } else {
                    console.warn('Format inattendu react_getDistincteCaves', data);
                }
            } catch (e) {
                if (e.name === 'AbortError') return;
                console.error('Echec récupération caves distinctes, fallback local:', e);
                const uniqueCaves = [...new Set(listeCaves.map(c => c.Cave))];
                setDistinctCaves([
                    { label: 'Toutes', value: 'Toutes' },
                    ...uniqueCaves.map(c => ({ label: c, value: c }))
                ]);
            }
        };
        fetchDistinct();
        return () => { aborted = true; controller.abort(); };
    }, [uuidUser, listeCaves]);

    useEffect(() => {
        setCaves(listeCaves);
        if (isMobile) {
            setVisibleData(listeCaves.slice(0, 20));
        }
    }, [listeCaves, isMobile]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleCaveChange = useCallback((value) => {
        setSelectedCave(value);
        const filteredCaves = (!value || value === "Toutes" || value.value === null || value.value === 'Toutes')
            ? listeCaves
            : listeCaves.filter((cave) => cave.Cave === (value.value || value));

        setCaves(filteredCaves);
        if (isMobile) {
            setVisibleData(filteredCaves.slice(0, 20));
        }
    }, [listeCaves, isMobile]);

    const loadMore = useCallback(() => {
        if (isLoading) return;
        setIsLoading(true);

        setTimeout(() => {
            const currentLength = visibleData.length;
            const newData = caves.slice(currentLength, currentLength + 20);
            setVisibleData(prev => [...prev, ...newData]);
            setIsLoading(false);
        }, 100);
    }, [caves, visibleData, isLoading]);

    const formatCurrency = useCallback((value) => {
        return (value || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
    }, []);

    const getCountryFlag = useCallback((pays) => {
        const countryFlags = {
            'France': '🇫🇷', 'Italie': '🇮🇹', 'Espagne': '🇪🇸', 'Portugal': '🇵🇹',
            'Allemagne': '🇩🇪', 'Autriche': '🇦🇹', 'Suisse': '🇨🇭', 'États-Unis': '🇺🇸',
            'Argentine': '🇦🇷', 'Chili': '🇨🇱', 'Australie': '🇦🇺', 'Nouvelle-Zélande': '🇳🇿',
            'Afrique du Sud': '🇿🇦', 'Grèce': '🇬🇷', 'Bulgarie': '🇧🇬', 'Roumanie': '🇷🇴',
            'Hongrie': '🇭🇺', 'République tchèque': '🇨🇿', 'Slovénie': '🇸🇮', 'Croatie': '🇭🇷',
            'Liban': '🇱🇧', 'Israël': '🇮🇱', 'Turquie': '🇹🇷', 'Maroc': '🇲🇦',
            'Tunisie': '🇹🇳', 'Algérie': '🇩🇿', 'Canada': '🇨🇦', 'Mexique': '🇲🇽',
            'Brésil': '🇧🇷', 'Uruguay': '🇺🇾', 'Chine': '🇨🇳', 'Japon': '🇯🇵',
            'Inde': '🇮🇳', 'Géorgie': '🇬🇪', 'Moldavie': '🇲🇩', 'Ukraine': '🇺🇦', 'Russie': '🇷🇺'
        };
        return countryFlags[pays] || '🌍';
    }, []);

    const getWineColorIcon = useCallback((couleur) => {
        if (!couleur) return '';
        const couleurLower = couleur.toLowerCase();
        if (couleurLower.includes('rouge')) return '/red.svg';
        if (couleurLower.includes('blanc')) return '/white.svg';
        if (couleurLower.includes('rosé') || couleurLower.includes('rose')) return '/rose.svg';
        return '';
    }, []);

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [vinToDelete, setVinToDelete] = useState(null);

    const confirmDeleteVin = useCallback((vin) => {
        setVinToDelete(vin);
        setShowDeleteDialog(true);
    }, []);

    const handleDeleteVin = async () => {
        if (!vinToDelete) return;

        try {
            const response = await fetch(`${config.apiBaseUrl}/4DACTION/react_supprimerCave?UUID_=${vinToDelete.UUID_}`, {
                method: 'GET',
                headers: authHeader(),
            });

            if (!response.ok) throw new Error('Erreur lors de la suppression du vin.');

            const data = await response.json();
            if (data.etat === "succes") {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Vin supprimé avec succès.',
                    life: 3000
                });

                setCaves((prevCaves) => {
                    const updated = prevCaves.filter((vin) => vin.UUID_ !== vinToDelete.UUID_);

                    try {
                        const rawCache = localStorage.getItem(CAVES_CACHE_KEY);
                        if (rawCache) {
                            const parsed = JSON.parse(rawCache);
                            if (Array.isArray(parsed)) {
                                const updatedCache = parsed.filter((vin) => vin.UUID_ !== vinToDelete.UUID_);
                                localStorage.setItem(CAVES_CACHE_KEY, JSON.stringify(updatedCache));
                            }
                        }
                    } catch (e) {
                        console.warn('Erreur maj cache après suppression', e);
                    }

                    return updated;
                });

                if (isMobile) {
                    setVisibleData((prevData) =>
                        prevData.filter((vin) => vin.UUID_ !== vinToDelete.UUID_)
                    );
                }

                if (typeof refreshCaves === 'function') {
                    refreshCaves();
                }
            } else {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Erreur lors de la suppression du vin.',
                    life: 3000
                });
            }
        } catch (error) {
            console.error('Erreur:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Erreur lors de la suppression du vin.',
                life: 3000
            });
        } finally {
            setShowDeleteDialog(false);
            setVinToDelete(null);
        }
    };


    const toggleFavori = async (uuid, shouldBeLiked, event) => {
        event.stopPropagation();

        const updateCaves = (prevCaves) =>
            prevCaves.map((vin) =>
                vin.UUID_ === uuid ? { ...vin, Coup_de_Coeur: shouldBeLiked } : vin
            );

        setCaves(updateCaves);
        if (isMobile) {
            setVisibleData(updateCaves);
        }

        try {
            const formData = new FormData();
            formData.append("UUID_", uuid);
            formData.append("Coup_de_Coeur", shouldBeLiked);

            const response = await fetch(`${config.apiBaseUrl}/4DACTION/react_putCaveFavori?UUID_=${uuid}`, {
                method: 'PUT',
                headers: authHeader(),
                body: formData,
            });

            const data = await response.json();
            if (data.entete !== "succes") {
                throw new Error();
            }
        } catch (err) {
            console.error('Erreur:', err);
            const revertCaves = (prevCaves) =>
                prevCaves.map((vin) =>
                    vin.UUID_ === uuid ? { ...vin, Coup_de_Coeur: !shouldBeLiked } : vin
                );
            setCaves(revertCaves);
            if (isMobile) {
                setVisibleData(revertCaves);
            }
        }
    };

    const formatRegionName = useCallback((region) => {
        if (region === "Provence-Alpes-Côte d'Azur") {
            return "PACA";
        }
        return region;
    }, []);

    const exportCSV = () => dt.current.exportCSV();
    const ajouterVin = () => navigate('/creation-vin');

    const goFavoris = () => {
        setShowFavoritesOnly((prev) => !prev);
    };

    const normalizeString = (str) =>
        str?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const filteredVisibleData = useMemo(() => {
        let data = caves;

        if (globalFilter) {
            const filterValue = normalizeString(globalFilter);

            data = data.filter(vin =>
                normalizeString(vin.Nom).includes(filterValue) ||
                normalizeString(vin.Pays).includes(filterValue) ||
                normalizeString(vin.Région).includes(filterValue) ||
                normalizeString(vin.Type).includes(filterValue) ||
                normalizeString(vin.Cave).includes(filterValue) ||
                normalizeString(vin.Appellation).includes(filterValue) ||
                vin.Valeur?.toString().includes(filterValue)
            );
        }

        if (showEnCaveOnly) {
            data = data.filter(v => (v.Reste_en_Cave || 0) > 0);
        }

        if (showFavoritesOnly) {
            data = data.filter(v => !!v.Coup_de_Coeur);
        }

        return data;
    }, [caves, globalFilter, showEnCaveOnly, showFavoritesOnly]);


    const getStarsForNote = useCallback((note) => {
        const noteValue = note || 0;
        let filledStars = 0;

        if (noteValue >= 95) filledStars = 3;
        else if (noteValue >= 91) filledStars = 2;
        else if (noteValue >= 87) filledStars = 1;
        else filledStars = 0;

        const stars = [];
        for (let i = 0; i < 3; i++) {
            stars.push(
                <i
                    key={i}
                    className={`pi ${i < filledStars ? 'pi-star-fill' : 'pi-star'} text-xs ${i < filledStars ? 'text-amber-500' : 'text-gray-300 dark:text-gray-500'}`}
                />
            );
        }
        return stars;
    }, []);

    const header = (
        <div className="flex gap-3 align-center justify-between p-0 bg-gray-900/60 dark:bg-gray-950/70 rounded-2xl shadow-lg border border-white/10 font-['Work_Sans',sans-serif]">
            <IconField iconPosition="left" className="flex-1">
                <InputText
                    type="search"
                    onInput={(e) => setGlobalFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-white/10 rounded-xl bg-black/40 text-gray-100 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/70 focus:border-emerald-400/70 transition duration-300 pl-8"
                    placeholder="Rechercher un vin..."
                />
            </IconField>
            <button
                onClick={ajouterVin}
                className="px-5 py-2.5 rounded-xl font-medium text-sm bg-gradient-to-r from-[#f97373] via-[#d41132] to-[#7f0b21] text-white shadow-md shadow-black/40 hover:shadow-lg hover:shadow-red-500/30 focus:outline-none focus:ring-2 focus:ring-red-400/70 focus:ring-offset-0 transition duration-300 transform hover:-translate-y-[1px] hover:scale-[1.02] active:scale-[0.97] flex items-center justify-center gap-2"
            >
                <i className="pi pi-plus text-sm"></i>
                <span>Ajouter un vin</span>
            </button>
        </div>
    );

    const onRowDoubleClick = (e) => navigate(`/vin/${e.data.UUID_}`);

    const applyMobileFilters = useCallback(() => {
        let filteredData = [...listeCaves];

        if (mobileFilters.caves.length > 0) {
            filteredData = filteredData.filter(cave =>
                mobileFilters.caves.includes(cave.Cave)
            );
        }

        if (mobileFilters.pays) {
            filteredData = filteredData.filter(cave => cave.Pays === mobileFilters.pays);
        }

        if (mobileFilters.couleur) {
            filteredData = filteredData.filter(cave => cave.Couleur === mobileFilters.couleur);
        }

        if (mobileFilters.type) {
            filteredData = filteredData.filter(cave => cave.Type === mobileFilters.type);
        }

        if (mobileFilters.douceur) {
            filteredData = filteredData.filter(cave => cave.Douceur === mobileFilters.douceur);
        }

        if (mobileFilters.contenant) {
            filteredData = filteredData.filter(cave => cave.Flacon === mobileFilters.contenant);
        }

        if (mobileFilters.millesime) {
            filteredData = filteredData.filter(cave => cave.Millesime === mobileFilters.millesime);
        }

        if (mobileFilters.note) {
            const noteRange = mobileFilters.note;
            filteredData = filteredData.filter(cave => {
                const note = cave.Note_sur_20 || 0;
                switch (noteRange) {
                    case '100': return note === 100;
                    case '95-99': return note >= 95 && note < 99;
                    case '91-94': return note >= 91 && note < 94;
                    case '87-90': return note >= 87 && note < 90;
                    case '84-87': return note >= 84 && note < 87;
                    default: return true;
                }
            });
        }

        filteredData.sort((a, b) => {
            let aVal = a[sortField];
            let bVal = b[sortField];

            if (sortField === 'Note_sur_20' || sortField === 'Valeur' || sortField === 'Millesime') {
                aVal = Number(aVal) || 0;
                bVal = Number(bVal) || 0;
            } else {
                aVal = String(aVal || '').toLowerCase();
                bVal = String(bVal || '').toLowerCase();
            }

            if (aVal < bVal) return -1 * sortOrder;
            if (aVal > bVal) return 1 * sortOrder;
            return 0;
        });

        setCaves(filteredData);
        if (isMobile) {
            setVisibleData(filteredData.slice(0, 20));
        }
    }, [listeCaves, mobileFilters, sortField, sortOrder, isMobile]);

    useEffect(() => {
        applyMobileFilters();
    }, [applyMobileFilters]);

    useEffect(() => {
        setMobileFilters(prev => {
            if (!prev) return prev;

            const cleaned = { ...prev };

            if (cleaned.pays && typeof cleaned.pays === 'object') {
                cleaned.pays = cleaned.pays.value || cleaned.pays.label || String(cleaned.pays);
            }

            if (Array.isArray(cleaned.caves)) {
                cleaned.caves = cleaned.caves.map(c =>
                    typeof c === 'string'
                        ? c
                        : (c.value || c.label || String(c))
                );
            }

            return cleaned;
        });
    }, []);

    const paysOptions = useMemo(() => {
        return (pays || [])
            .filter(Boolean)
            .map((p) => ({
                label: p,
                value: p,
            }));
    }, [pays]);

    const resetMobileFilters = () => {
        setMobileFilters({
            caves: [],
            pays: null,
            couleur: null,
            type: null,
            douceur: null,
            contenant: null,
            millesime: null,
            note: null
        });
    };

    const toggleSort = () => {
        setShowSortDialog(true);
    };

    useEffect(() => {
        const shouldLock = showMobileFilters || showSortDialog;

        if (shouldLock) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [showMobileFilters, showSortDialog]);

    return (
        <PrimeReactProvider value={{ hideOverlaysOnDocumentScrolling: true }}>
            <div className="h-full bg-gray-50 dark:bg-gray-900">
                {/* <Toast ref={toast} />

                Dialog de confirmation de suppression */}
                {/* Dialog de confirmation de suppression */}
                <Dialog
                    visible={showDeleteDialog}
                    onHide={() => setShowDeleteDialog(false)}
                    modal
                    dismissableMask
                    closable={false}
                    className="w-full max-w-md vitissia-delete-dialog"
                    breakpoints={{ '960px': '90vw', '640px': '95vw' }}
                >
                    <div
                        className="
                            relative overflow-hidden rounded-2xl
                            bg-slate-950/100 border border-red-500/50
                            shadow-[0_22px_55px_rgba(0,0,0,0.9)]
                            transition-all duration-200
                            font-['Work_Sans',sans-serif]
                        "
                    >
                        {/* Glows décoratifs rouges */}
                        <div className="pointer-events-none absolute -top-16 -right-10 w-40 h-40 rounded-full bg-red-500/35 blur-3xl" />
                        <div className="pointer-events-none absolute -bottom-20 -left-10 w-40 h-40 rounded-full bg-rose-500/25 blur-3xl" />

                        {/* Contenu */}
                        <div className="relative z-10 px-5 pt-5 pb-4">
                            <div className="flex items-start gap-4">
                                {/* Icône corbeille rouge – sans animation */}
                                <div
                                    className="
                        flex-shrink-0 w-12 h-12 rounded-2xl
                        bg-gradient-to-br from-[#f97373] via-[#d41132] to-[#8C2438]
                        flex items-center justify-center
                        shadow-[0_12px_30px_rgba(0,0,0,0.8)]
                    "
                                >
                                    <i className="pi pi-trash text-white text-xl" />
                                </div>

                                {/* Texte principal */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base md:text-lg font-semibold text-white mb-1">
                                        Supprimer ce vin ?
                                    </h3>
                                    <p className="text-xs md:text-sm text-white/70 leading-snug">
                                        Cette action est <span className="font-semibold text-red-300">irréversible</span>.
                                        Le vin sera définitivement retiré de votre cave.
                                    </p>

                                    {/* Récap du vin */}
                                    {vinToDelete && (
                                        <div className="
                            mt-3 px-3 py-2 rounded-xl
                            bg-white/5 border border-white/10
                            text-xs md:text-sm text-white/80
                            flex flex-col gap-0.5
                        ">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-semibold truncate">
                                                    {vinToDelete.Nom || 'Vin sans nom'}
                                                </span>
                                                {vinToDelete.Millesime && (
                                                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-white/80">
                                                        {vinToDelete.Millesime}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[11px] text-white/60 truncate">
                                                {[vinToDelete.Appellation, vinToDelete.Région, vinToDelete.Pays]
                                                    .filter(Boolean)
                                                    .join(' • ')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer / boutons */}
                        <div className="
            relative z-10 px-5 py-3
            flex items-center justify-end gap-3
            bg-slate-950/90 border-t border-white/10
        ">
                            <button
                                type="button"
                                onClick={() => setShowDeleteDialog(false)}
                                className="
                    px-4 py-2 rounded-xl text-xs md:text-sm font-medium
                    border border-white/20 text-white/80
                    bg-white/5 hover:bg-white/10
                    transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-white/30
                "
                            >
                                Annuler
                            </button>

                            <button
                                type="button"
                                onClick={handleDeleteVin}
                                className="
                    inline-flex items-center gap-2
                    px-4 py-2 rounded-xl text-xs md:text-sm font-semibold
                    bg-gradient-to-r from-[#f97373] via-[#d41132] to-[#8C2438]
                    text-white
                    shadow-[0_14px_35px_rgba(0,0,0,0.9)]
                    hover:brightness-110
                    transition-all duration-200
                    transform hover:-translate-y-[1px] active:translate-y-[1px]
                    focus:outline-none focus:ring-2 focus:ring-red-400/70
                "
                            >
                                <i className="pi pi-check text-sm" />
                                <span>Supprimer définitivement</span>
                            </button>
                        </div>
                    </div>
                </Dialog>

                {/* Dialog des filtres mobiles - Version optimisée */}
                <Dialog
                    visible={showMobileFilters}
                    onHide={() => setShowMobileFilters(false)}
                    closable={!isMobile}
                    header={
                        isMobile ? (
                            <div className="flex items-center justify-between w-full font-['Work_Sans',sans-serif]">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shadow-sm shadow-black/40">
                                        <i className="pi pi-filter text-emerald-300 text-xs"></i>
                                    </div>
                                    <span className="text-base font-semibold text-gray-50">
                                        Filtres de la cave
                                    </span>
                                </div>
                                <button
                                    onClick={() => setShowMobileFilters(false)}
                                    className="w-8 h-8 rounded-full bg.white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                                >
                                    <i className="pi pi-times text-gray-300 text-sm"></i>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 font-['Work_Sans',sans-serif]">
                                <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shadow-sm shadow-black/40">
                                    <i className="pi pi-filter text-emerald-300 text-sm"></i>
                                </div>
                                <span className="text-sm font-semibold text-gray-50">
                                    Filtres de recherche
                                </span>
                            </div>
                        )
                    }
                    className={isMobile
                        ? "vitissia-dialog cave-filters-dialog w-screen m-0 bg-transparent"
                        : "vitissia-dialog cave-filters-dialog"}
                    style={isMobile ? {
                        margin: 0,
                        borderRadius: 0,
                        height: '80vh',
                        maxHeight: '80vh'
                    } : {}}
                    position={isMobile ? "center" : "top-right"}
                    modal
                    blockScroll
                    dismissableMask
                    draggable={false}
                    resizable={false}
                    appendTo={document.body}
                    footer={
                        isMobile ? (
                            <div className="absolute bottom-0 left-0 right-0 bg-gray-950/95 border-t border-white/10 p-4 grid grid-cols-2 gap-3">
                                <button
                                    onClick={resetMobileFilters}
                                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-white/15 text-gray-200 bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium"
                                >
                                    <i className="pi pi-refresh text-xs opacity-80"></i>
                                    <span>Réinitialiser</span>
                                </button>
                                <button
                                    onClick={() => setShowMobileFilters(false)}
                                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30 hover:from-emerald-600 hover:to-teal-600 transition-colors text-sm font-semibold"
                                >
                                    <i className="pi pi-check text-xs"></i>
                                    <span>Appliquer</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2 justify-between p-4 bg-gray-950/90 border-t border-white/10">
                                <Button
                                    label="Réinitialiser"
                                    icon="pi pi-refresh"
                                    className="p-button-outlined text-xs font-medium border-white/20 text-gray-200 hover:bg-white/5"
                                    onClick={resetMobileFilters}
                                />
                                <div className="flex gap-2">
                                    <Button
                                        label="Annuler"
                                        className="p-button-text text-xs text-gray-300 p-2 bg-white/5 hover:bg-white/10 border border-white/10"
                                        onClick={() => setShowMobileFilters(false)}
                                    />
                                    <Button
                                        label="Appliquer"
                                        icon="pi pi-check"
                                        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-xs p-2 text-white border-none shadow-md shadow-emerald-500/30"
                                        onClick={() => setShowMobileFilters(false)}
                                    />
                                </div>
                            </div>
                        )
                    }
                >
                    <div
                        className={isMobile ? "p-3 pb-16 overflow-y-auto" : "p-4"}
                        style={isMobile ? { height: 'calc(70vh - 100px)' } : {}}
                    >
                        <div className={isMobile ? "space-y-5" : "space-y-4 font-['Work_Sans',sans-serif]"}>
                            {/* Section Localisation */}
                            <div
                                className={`rounded-2xl border shadow-lg backdrop-blur-md ${isMobile
                                    ? 'p-4 bg-gray-950/90 border-white/10'
                                    : 'p-3 bg-gray-950/80 border-white/10'
                                    }`}
                            >
                                <h3 className={`font-semibold text-gray-50 ${isMobile ? 'mb-4 text-base' : 'mb-3 text-sm'} flex items-center gap-2`}>
                                    <i className="pi pi-map-marker text-emerald-400"></i>
                                    Localisation
                                </h3>
                                <div className={isMobile ? "space-y-4" : "space-y-3"}>
                                    <div>
                                        <label className="block text-xs font-medium mb-2 text-gray-300">
                                            Caves
                                        </label>
                                        <MultiSelect
                                            value={mobileFilters.caves}
                                            options={distinctCaves
                                                .filter(c => c.value !== 'Toutes')
                                                .map(c => ({ label: c.label, value: c.value }))}
                                            onChange={(e) =>
                                                setMobileFilters(prev => ({ ...prev, caves: e.value }))
                                            }
                                            placeholder="Toutes les caves"
                                            className="w-full text-xs"
                                            maxSelectedLabels={isMobile ? 1 : 2}
                                            filter
                                            scrollHeight="200px"
                                            dropdownIcon="pi pi-chevron-down"
                                            panelClassName="cave-filters-panel"
                                            optionLabel="label"
                                            optionValue="value"
                                        />

                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium mb-2 text-gray-300">
                                            Pays
                                        </label>
                                        <Dropdown
                                            value={mobileFilters.pays}
                                            options={paysOptions}
                                            onChange={(e) =>
                                                setMobileFilters(prev => ({ ...prev, pays: e.value }))
                                            }
                                            placeholder="Tous les pays"
                                            className="w-full text-xs"
                                            showClear
                                            filter
                                            panelClassName="cave-filters-panel"
                                            optionLabel="label"
                                            optionValue="value"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section Caractéristiques */}
                            <div
                                className={`rounded-2xl border shadow-lg backdrop-blur-md ${isMobile
                                    ? 'p-4 bg-gray-950/90 border-white/10'
                                    : 'p-3 bg-gray-950/80 border-white/10'
                                    }`}
                            >
                                <h3 className={`font-semibold text-gray-50 ${isMobile ? 'mb-4 text-base' : 'mb-3 text-sm'} flex items-center gap-2`}>
                                    <i className="pi pi-tags text-emerald-400"></i>
                                    Caractéristiques
                                </h3>
                                <div className={isMobile ? "space-y-4" : "space-y-3"}>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium mb-2 text-gray-300">
                                                Couleur
                                            </label>
                                            <Dropdown
                                                value={mobileFilters.couleur}
                                                options={couleurs.map(c => ({ label: c, value: c }))}
                                                onChange={(e) => setMobileFilters(prev => ({ ...prev, couleur: e.value }))}
                                                placeholder="Toutes"
                                                className="w-full text-xs"
                                                showClear
                                                panelClassName="cave-filters-panel"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium mb-2 text-gray-300">
                                                Type
                                            </label>
                                            <Dropdown
                                                value={mobileFilters.type}
                                                options={types.map(t => ({ label: t, value: t }))}
                                                onChange={(e) => setMobileFilters(prev => ({ ...prev, type: e.value }))}
                                                placeholder="Tous"
                                                className="w-full text-xs"
                                                showClear
                                                panelClassName="cave-filters-panel"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium mb-2 text-gray-300">
                                                Contenant
                                            </label>
                                            <Dropdown
                                                value={mobileFilters.contenant}
                                                options={contenants.map(c => ({ label: c, value: c }))}
                                                onChange={(e) => setMobileFilters(prev => ({ ...prev, contenant: e.value }))}
                                                placeholder="Tous"
                                                className="w-full text-xs"
                                                showClear
                                                panelClassName="cave-filters-panel"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium mb-2 text-gray-300">
                                                Millésime
                                            </label>
                                            <Dropdown
                                                value={mobileFilters.millesime}
                                                options={millesime.sort((a, b) => b - a).map(m => ({ label: m, value: m }))}
                                                onChange={(e) => setMobileFilters(prev => ({ ...prev, millesime: e.value }))}
                                                placeholder="Tous"
                                                className="w-full text-xs"
                                                showClear
                                                filter
                                            />
                                        </div>
                                    </div>

                                    {mobileFilters.type && douceurs.length > 0 && (
                                        <div>
                                            <label className="block text-xs font-medium mb-2 text-gray-300">
                                                Douceur
                                            </label>
                                            <Dropdown
                                                value={mobileFilters.douceur}
                                                options={douceurs.map(d => ({ label: d, value: d }))}
                                                onChange={(e) => setMobileFilters(prev => ({ ...prev, douceur: e.value }))}
                                                placeholder="Toutes"
                                                className="w-full text-xs"
                                                showClear
                                                panelClassName="cave-filters-panel"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Section Qualité */}
                            <div
                                className={`rounded-2xl border shadow-lg backdrop-blur-md ${isMobile
                                    ? 'p-4 bg-gray-950/90 border-white/10'
                                    : 'p-3 bg-gray-950/80 border-white/10'
                                    }`}
                            >
                                <h3 className={`font-semibold text-gray-50 ${isMobile ? 'mb-4 text-base' : 'mb-3 text-sm'} flex items-center gap-2`}>
                                    <i className="pi pi-star text-amber-400"></i>
                                    Qualité
                                </h3>
                                <div>
                                    <label className="block text-xs font-medium mb-2 text-gray-300">
                                        Note
                                    </label>
                                    {isMobile ? (
                                        <div className="space-y-2">
                                            {[
                                                { label: '100 (Exceptionnel)', value: '100' },
                                                { label: '95-99 (Excellent)', value: '95-99' },
                                                { label: '91-94 (Très bon)', value: '91-94' },
                                                { label: '87-90 (Bon)', value: '87-90' },
                                                { label: '84-87 (Acceptable)', value: '84-87' },
                                            ].map((option) => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => setMobileFilters(prev => ({
                                                        ...prev,
                                                        note: prev.note === option.value ? null : option.value
                                                    }))}
                                                    className={`w-full flex items-center justify-between p-3 rounded-lg border text-xs transition-all duration-200 transform hover:-translate-y-[1px] ${mobileFilters.note === option.value
                                                        ? 'bg-emerald-500/15 border-emerald-400/80 text-emerald-200 shadow-sm shadow-emerald-500/30'
                                                        : 'bg-gray-900/60 border-white/10 text-gray-200 hover:bg-gray-900/80'
                                                        }`}
                                                >
                                                    <span className="font-medium">{option.label}</span>
                                                    {mobileFilters.note === option.value && (
                                                        <i className="pi pi-check text-emerald-400 text-xs"></i>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <Dropdown
                                            value={mobileFilters.note}
                                            options={[
                                                { label: '100 (Exceptionnel)', value: '100' },
                                                { label: '95-99 (Excellent)', value: '95-99' },
                                                { label: '91-94 (Très bon)', value: '91-94' },
                                                { label: '87-90 (Bon)', value: '87-90' },
                                                { label: '84-87 (Acceptable)', value: '84-87' },
                                            ]}
                                            onChange={(e) =>
                                                setMobileFilters(prev => ({ ...prev, note: e.value }))
                                            }
                                            placeholder="Toutes les notes"
                                            className="w-full text-xs"
                                            showClear
                                            panelClassName="cave-filters-panel"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </Dialog>

                {/* Dialog de tri */}
                <Dialog
                    visible={showSortDialog}
                    onHide={() => setShowSortDialog(false)}
                    header={
                        <div className="flex items-center gap-3 font-['Work_Sans',sans-serif]">
                            <div className="w-8 h-8 rounded-xl bg-[#8C2438] flex items-center justify-center shadow-md shadow-black/40">
                                <i className="pi pi-sort text-white text-sm"></i>
                            </div>
                            <span className="text-sm font-semibold text-slate-100">
                                Options de tri
                            </span>
                        </div>
                    }
                    className={isMobile ? "sort-dialog w-screen h-screen m-0" : "sort-dialog w-96"}
                    style={isMobile ? { margin: 0, borderRadius: 0 } : {}}
                    position={isMobile ? "center" : "top-right"}
                    modal={isMobile}
                    draggable={false}
                    resizable={false}
                    appendTo={document.body}
                    footer={
                        isMobile ? (
                            <div className="fixed bottom-0 left-0 right-0 bg-slate-950/95 border-t border-slate-800 p-4 grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setShowSortDialog(false)}
                                    className="flex items-center justify-center gap-2 py-3 px-4 border border-slate-700 text-slate-200 rounded-lg hover:bg-slate-900 transition-colors"
                                >
                                    <i className="pi pi-times text-sm"></i>
                                    <span className="text-sm font-medium">Annuler</span>
                                </button>
                                <button
                                    onClick={() => setShowSortDialog(false)}
                                    className="flex items-center justify-center gap-2 py-3 px-4 bg-[#8C2438] hover:bg-[#a52b42] text-white rounded-lg transition-colors shadow-md shadow-black/40"
                                >
                                    <i className="pi pi-check text-sm"></i>
                                    <span className="text-sm font-medium">Appliquer</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex justify-end gap-2 p-4 bg-slate-950/95 border-t border-slate-800">
                                <Button
                                    label="Annuler"
                                    className="p-button-text text-sm text-slate-200 p-2 hover:bg-slate-900 border border-slate-700"
                                    onClick={() => setShowSortDialog(false)}
                                />
                                <Button
                                    label="Appliquer"
                                    icon="pi pi-check"
                                    className="bg-[#8C2438] hover:bg-[#a52b42] text-sm p-2 text-white border-none shadow-md shadow-black/40"
                                    onClick={() => setShowSortDialog(false)}
                                />
                            </div>
                        )
                    }
                >
                    <div className={isMobile ? "p-4 pb-32 overflow-y-auto h-full" : "p-3"}>
                        <div className={isMobile ? "space-y-6" : "space-y-4"}>
                            {/* Champ de tri */}
                            <div>
                                <label
                                    className={`block text-sm font-medium ${isMobile ? 'mb-3' : 'mb-2'
                                        } text-slate-100`}
                                >
                                    Trier par
                                </label>
                                <div className="grid grid-cols-1 gap-2">
                                    {[
                                        { label: 'Nom', value: 'Nom', icon: 'pi-tag' },
                                        { label: 'Pays', value: 'Pays', icon: 'pi-globe' },
                                        { label: 'Région', value: 'Région', icon: 'pi-map-marker' },
                                        { label: 'Type', value: 'Type', icon: 'pi-tags' },
                                        { label: 'Millésime', value: 'Millesime', icon: 'pi-calendar' },
                                        { label: 'Note', value: 'Note_sur_20', icon: 'pi-star' },
                                        { label: 'Valeur', value: 'Valeur', icon: 'pi-euro' }
                                    ].map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => setSortField(option.value)}
                                            className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${sortField === option.value
                                                ? // ✅ ÉTAT SÉLECTIONNÉ : même couleur que les filtres mais plus claire
                                                'bg-[#8C2438] border-[#f97373] text-slate-50 shadow-md shadow-black/40'
                                                : // ✅ ÉTAT NORMAL
                                                'bg-slate-950/85 border-slate-700 text-slate-200 hover:bg-slate-900'
                                                }`}
                                        >
                                            <i
                                                className={`pi ${option.icon} text-lg ${sortField === option.value
                                                    ? 'text-amber-200'
                                                    : 'text-slate-400'
                                                    }`}
                                            ></i>
                                            <span className="font-medium">{option.label}</span>
                                            {sortField === option.value && (
                                                <i className="pi pi-check text-amber-200 ml-auto text-xs"></i>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Ordre de tri */}
                            <div>
                                <label
                                    className={`block text-sm font-medium ${isMobile ? 'mb-3' : 'mb-2'
                                        } text-slate-100`}
                                >
                                    Ordre de tri
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setSortOrder(1)}
                                        className={`flex items-center justify-center gap-2 p-4 rounded-lg border transition-all duration-200 ${sortOrder === 1
                                            ? 'bg-[#8C2438] border-[#f97373] text-slate-50 shadow-md shadow-black/40'
                                            : 'bg-slate-950/85 border-slate-700 text-slate-200 hover:bg-slate-900'
                                            }`}
                                    >
                                        <i className="pi pi-sort-alpha-down text-lg"></i>
                                        <span className="font-medium">A → Z</span>
                                    </button>
                                    <button
                                        onClick={() => setSortOrder(-1)}
                                        className={`flex items-center justify-center gap-2 p-4 rounded-lg border transition-all duration-200 ${sortOrder === -1
                                            ? 'bg-[#8C2438] border-[#f97373] text-slate-50 shadow-md shadow-black/40'
                                            : 'bg-slate-950/85 border-slate-700 text-slate-200 hover:bg-slate-900'
                                            }`}
                                    >
                                        <i className="pi pi-sort-alpha-up text-lg"></i>
                                        <span className="font-medium">Z → A</span>
                                    </button>
                                </div>
                            </div>

                            {/* Aperçu du tri actuel */}
                            <div className="bg-slate-950/85 border border-slate-700 rounded-lg p-3">
                                <div className="flex items-center gap-2 text-slate-100">
                                    <i className="pi pi-info-circle text-sky-300"></i>
                                    <span className="text-sm font-medium">
                                        Tri actuel :{' '}
                                        {[
                                            { label: 'Nom', value: 'Nom' },
                                            { label: 'Pays', value: 'Pays' },
                                            { label: 'Région', value: 'Région' },
                                            { label: 'Type', value: 'Type' },
                                            { label: 'Millésime', value: 'Millesime' },
                                            { label: 'Note', value: 'Note_sur_20' },
                                            { label: 'Valeur', value: 'Valeur' }
                                        ].find(f => f.value === sortField)?.label}{' '}
                                        ({sortOrder === 1 ? 'A→Z' : 'Z→A'})
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Dialog>



                {/* Interface unifiée pour mobile et desktop */}
                <div className="p-2 bg-gradient-to-b from-[#8C2438] via-[#5A1020] to-[#3B0B15] min-h-screen">
                    {/* Header avec recherche et compteur */}
                    <div className="flex gap-2 mb-2">
                        <div className="flex-1">
                            <IconField iconPosition="left">
                                <InputIcon className="pi pi-search" />
                                <InputText
                                    type="search"
                                    onInput={(e) => setGlobalFilter(e.target.value)}
                                    className="
                                        w-full px-3 py-2.5 text-sm
                                        rounded-xl
                                        bg-slate-950/70 dark:bg-slate-950/80
                                        border border-slate-700
                                        text-slate-100 placeholder:text-slate-400
                                        shadow-sm
                                        focus:outline-none
                                        focus:ring-2 focus:ring-rose-500/70 focus:border-rose-500/70
                                        transition duration-300
                                        pl-9
                                    "
                                    placeholder="Rechercher..."
                                />
                            </IconField>
                        </div>
                        <div className="
                                flex items-center
                                rounded-xl
                                px-3 py-2
                                bg-slate-950/70
                                border border-rose-500/70
                                shadow-sm shadow-black/40
                                min-w-fit
                            "
                        >
                            <i className="pi pi-info-circle text-slate-500 text-white text-xs mr-1"></i>
                            <span className="text-xs text-slate-600 font-medium text-white whitespace-nowrap">
                                {filteredVisibleData.length}/{listeCaves.length}
                            </span>
                        </div>
                    </div>

                    {/* 🔄 BOUTONS DE CONTRÔLE MIS À JOUR */}
                    <div className={`gap-2 mb-3 ${isMobile ? 'grid grid-cols-2 sm:grid-cols-5' : 'flex justify-between items-center'}`}>
                        {/* Ajouter un vin */}
                        <button
                            onClick={ajouterVin}
                            className="px-3 py-2 rounded-lg font-medium text-xs sm:text-sm bg-gradient-to-r from-[#f97373] via-[#d41132] to-[#7f0b21] text-white shadow-md shadow-black/40 hover:shadow-lg hover:shadow-red-500/30 focus:outline-none focus:ring-2 focus:ring-red-400/70 focus:ring-opacity-70 transition duration-300 transform hover:-translate-y-[1px] hover:scale-[1.02] active:scale-[0.97] flex items-center justify-center gap-1 col-span-2 sm:col-span-2 md:col-span-1"
                        >
                            <i className="pi pi-plus text-sm"></i>
                            <span>Ajouter un vin</span>
                        </button>

                        {isMobile ? (
                            <>
                                {/* Favoris (mobile) */}
                                <button
                                    onClick={goFavoris}
                                    aria-pressed={showFavoritesOnly}
                                    className={`relative px-2 py-2 rounded-lg shadow-sm focus:outline-none transition duration-300 flex items-center justify-center ${showFavoritesOnly
                                        ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white focus:ring-2 focus:ring-rose-400'
                                        : 'bg-white/95 dark:bg-gray-900/90 border border-rose-300 text-rose-600 hover:bg-rose-50/80'
                                        }`}
                                    title="Filtrer par favoris"
                                >
                                    <div className="flex flex-col items-center gap-0.5">
                                        <i className="pi pi-heart text-xs"></i>
                                        <span className="text-[10px] font-medium">Favoris</span>
                                    </div>
                                    <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${showFavoritesOnly ? 'bg-lime-400' : 'bg-transparent'}`}></span>
                                </button>

                                {/* Filtres (mobile) */}
                                <button
                                    ref={(el) => setFilterButtonRef(el)}
                                    onClick={() => setShowMobileFilters(true)}
                                    className={`px-2 py-2 rounded-lg shadow-sm flex items-center justify-center transition duration-300
    border border-blue-400/70
    ${showMobileFilters
                                            ? 'bg-blue-600 text-white focus:ring-2 focus:ring-blue-400/80'
                                            : 'bg-slate-950/70 text-blue-200 hover:bg-slate-900/80 focus:ring-2 focus:ring-blue-400/60'
                                        }`}

                                >
                                    <div className="flex flex-col items-center gap-0.5">
                                        <i className="pi pi-filter text-xs"></i>
                                        <span className="text-[10px] font-medium">Filtres</span>
                                    </div>
                                </button>

                                {/* Tri (mobile) */}
                                <button
                                    ref={(el) => setSortButtonRef(el)}
                                    onClick={toggleSort}
                                    className={`px-2 py-2 rounded-lg shadow-sm flex items-center justify-center transition duration-300
    border border-purple-400/70
    ${showSortDialog
                                            ? 'bg-purple-600 text-white focus:ring-2 focus:ring-purple-400/80'
                                            : 'bg-slate-950/70 text-purple-200 hover:bg-slate-900/80 focus:ring-2 focus:ring-purple-400/60'
                                        }`}

                                >
                                    <div className="flex flex-col items-center gap-0.5">
                                        <i className={`pi ${sortOrder === 1 ? 'pi-sort-alpha-down' : 'pi-sort-alpha-up'} text-xs`}></i>
                                        <span className="text-[10px] font-medium">Tri</span>
                                    </div>
                                </button>

                                {/* En cave (mobile) */}
                                <button
                                    onClick={() => setShowEnCaveOnly(prev => !prev)}
                                    aria-pressed={showEnCaveOnly}
                                    className={`relative px-2 py-2 rounded-lg font-medium shadow-sm flex items-center justify-center transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-0 ${showEnCaveOnly
                                        ? 'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-400'
                                        : 'bg-gradient-to-r from-amber-50 to-yellow-100 text-amber-700 hover:from-amber-100 hover:to-yellow-200 focus:ring-amber-300'
                                        }`}
                                    title="Afficher uniquement les vins avec stock > 0"
                                >
                                    <div className="flex flex-col items-center gap-0.5">
                                        <i className="pi pi-box text-xs"></i>
                                        <span className="text-[10px] font-medium">En cave</span>
                                    </div>
                                    <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${showEnCaveOnly ? 'bg-lime-400' : 'bg-transparent'}`}></span>
                                </button>
                            </>
                        ) : (
                            <div className="flex gap-2 items-center">
                                {/* En cave (desktop) */}
                                <button
                                    onClick={() => setShowEnCaveOnly(prev => !prev)}
                                    aria-pressed={showEnCaveOnly}
                                    className={`relative px-4 py-2 rounded-lg font-medium shadow-sm
            flex items-center justify-center gap-2
            transition duration-300 focus:outline-none
            ${showEnCaveOnly
                                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border border-amber-400 focus:ring-2 focus:ring-amber-300/80'
                                            : 'bg-slate-950/70 text-amber-200 border border-amber-400/70 hover:bg-slate-900/80 focus:ring-2 focus:ring-amber-300/60'
                                        }`}

                                >
                                    <i className="pi pi-box text-sm"></i>
                                    <span>En cave</span>
                                    <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${showEnCaveOnly ? 'bg-lime-400' : 'bg-transparent'}`}></span>
                                </button>

                                {/* Favoris (desktop) */}
                                <button
                                    onClick={goFavoris}
                                    aria-pressed={showFavoritesOnly}
                                    className={`relative px-4 py-2 rounded-lg font-medium shadow-sm
            flex items-center justify-center gap-2
            transition duration-300 focus:outline-none
            ${showFavoritesOnly
                                            ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white border border-rose-400 focus:ring-2 focus:ring-rose-300/80'
                                            : 'bg-slate-950/70 text-rose-200 border border-rose-400/70 hover:bg-slate-900/80 focus:ring-2 focus:ring-rose-300/60'
                                        }`}

                                >
                                    <i className="pi pi-heart text-sm"></i>
                                    <span>Favoris</span>
                                    <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${showFavoritesOnly ? 'bg-lime-400' : 'bg-transparent'}`}></span>
                                </button>

                                {/* Filtres (desktop) */}
                                <button
                                    ref={(el) => setFilterButtonRef(el)}
                                    onClick={() => setShowMobileFilters(true)}
                                    className={`px-4 py-2 font-medium rounded-lg shadow-sm flex items-center justify-center gap-2
    border border-blue-500/70
    ${showMobileFilters
                                            ? 'bg-blue-600 text-white focus:ring-2 focus:ring-blue-400/80'
                                            : 'bg-slate-950/70 text-blue-200 hover:bg-slate-900/80 focus:ring-2 focus:ring-blue-400/60'
                                        }`}

                                >
                                    <i className="pi pi-filter text-sm"></i>
                                    <span>Filtres</span>
                                </button>

                                {/* Tri (desktop) */}
                                <button
                                    ref={(el) => setSortButtonRef(el)}
                                    onClick={toggleSort}
                                    className={`px-4 py-2 font-medium rounded-lg shadow-sm flex items-center justify-center gap-2
    border border-blue-500/70
    ${showMobileFilters
                                            ? 'bg-blue-600 text-white focus:ring-2 focus:ring-blue-400/80'
                                            : 'bg-slate-950/70 text-blue-200 hover:bg-slate-900/80 focus:ring-2 focus:ring-blue-400/60'
                                        }`}

                                >
                                    <i className={`pi ${sortOrder === 1 ? 'pi-sort-alpha-down' : 'pi-sort-alpha-up'} text-sm`}></i>
                                    <span>Tri</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Grille responsive de cartes */}
                    <div className="pb-8">
                        <CaveGrid
                            items={filteredVisibleData}
                            isMobile={isMobile}
                            onToggleFavori={(uuid, shouldBeLiked, e) => toggleFavori(uuid, shouldBeLiked, e)}
                            onDelete={(vin) => {
                                confirmDeleteVin(vin);
                            }}
                            formatRegionName={formatRegionName}
                        />
                    </div>
                </div>
            </div>
        </PrimeReactProvider>
    );
}
