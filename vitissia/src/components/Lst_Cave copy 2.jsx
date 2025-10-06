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
import { VirtualScroller } from 'primereact/virtualscroller';
import { PrimeReactProvider } from 'primereact/api';
import config from '../config/config';
import authHeader from '../config/authHeader';

export default function LstCave({ listeCaves, refreshCaves }) {
    const toast = useRef(null);
    const navigate = useNavigate();
    const [caves, setCaves] = useState(listeCaves);
    const [selectedCaves, setSelectedCaves] = useState(null);
    const [globalFilter, setGlobalFilter] = useState(null);
    const dt = useRef(null);
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        Région: { value: null, matchMode: FilterMatchMode.EQUALS },
        Type: { value: null, matchMode: FilterMatchMode.EQUALS },
        Cave: { value: null, matchMode: FilterMatchMode.EQUALS },
        Millesime: { value: null, matchMode: FilterMatchMode.EQUALS },
    });

    // Optimisation des données pour mobile
    const [visibleData, setVisibleData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // États pour les filtres mobiles
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [showSortDialog, setShowSortDialog] = useState(false);
    const [filterButtonRef, setFilterButtonRef] = useState(null);
    const [sortButtonRef, setSortButtonRef] = useState(null);
    const [mobileFilters, setMobileFilters] = useState({
        caves: [],
        pays: null,
        couleur: null,
        type: null,
        douceur: null,
        contenant: null,
        millesime: null,
        note: null
    });
    const [sortField, setSortField] = useState('Nom');
    const [sortOrder, setSortOrder] = useState(1); // 1 = ASC, -1 = DESC
    const [showEnCaveOnly, setShowEnCaveOnly] = useState(false);

    // Filtres optimisés avec useMemo
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
    // UUID utilisateur (plusieurs clés possibles en sessionStorage)
    const uuidUser = useMemo(() => sessionStorage.getItem('uuid_user'), []);

    // Récupération des caves distinctes via l'API (remplace le calcul local)
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
                const data = await resp.json(); // Doit être un tableau de chaînes
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
            setVisibleData(listeCaves.slice(0, 20)); // Charger initialement 20 éléments
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

    // Optimisation des fonctions avec useCallback
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
                toast.current.show({ severity: 'success', summary: 'Succès', detail: 'Vin supprimé avec succès.', life: 3000 });
                setCaves((prevCaves) => prevCaves.filter((vin) => vin.UUID_ !== vinToDelete.UUID_));
                if (isMobile) {
                    setVisibleData((prevData) => prevData.filter((vin) => vin.UUID_ !== vinToDelete.UUID_));
                }
            } else {
                toast.current.show({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de la suppression du vin.', life: 3000 });
            }
        } catch (error) {
            console.error('Erreur:', error);
            toast.current.show({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de la suppression du vin.', life: 3000 });
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
            if (data.entete === "succes") {
                toast.current.show({ severity: 'success', summary: 'Succès', detail: 'Favori mis à jour.', life: 3000 });
            } else {
                throw new Error();
            }
        } catch (err) {
            console.error('Erreur:', err);
            // Revert en cas d'échec
            const revertCaves = (prevCaves) =>
                prevCaves.map((vin) =>
                    vin.UUID_ === uuid ? { ...vin, Coup_de_Coeur: !shouldBeLiked } : vin
                );
            setCaves(revertCaves);
            if (isMobile) {
                setVisibleData(revertCaves);
            }
            toast.current.show({ severity: 'error', summary: 'Erreur', detail: 'Impossible de mettre à jour le favori.', life: 3000 });
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
    const goFavoris = () => navigate('/favoris');

    // Filtrer les données visibles en temps réel pour mobile et desktop
    const filteredVisibleData = useMemo(() => {
        let data = caves; // Utiliser caves au lieu de visibleData

        if (globalFilter) {
            const filterValue = globalFilter.toLowerCase();
            data = data.filter(vin =>
                vin.Nom?.toLowerCase().includes(filterValue) ||
                vin.Pays?.toLowerCase().includes(filterValue) ||
                vin.Région?.toLowerCase().includes(filterValue) ||
                vin.Type?.toLowerCase().includes(filterValue) ||
                vin.Cave?.toLowerCase().includes(filterValue) ||
                vin.Appellation?.toLowerCase().includes(filterValue) ||
                vin.Valeur?.toString().includes(filterValue)
            );
        }

        if (showEnCaveOnly) {
            data = data.filter(v => (v.Reste_en_Cave || 0) > 0);
        }

        return data;
    }, [caves, globalFilter, showEnCaveOnly]); // Supprimer isMobile de la dépendance

    // Fonction pour générer les étoiles selon la note
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

    // Template pour VirtualScroller - Version unifiée mobile/desktop
    const vinItemTemplate = (vin) => (
        <div className="px-2 py-1">
            <div
                onClick={() => navigate(`/vin/${vin.UUID_}`)}
                className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden group hover:border-blue-300 dark:hover:border-blue-600"
            >
                {/* Barre de couleur selon le type de vin */}
                <div className={`absolute top-0 left-0 w-1 h-full ${
                    vin.Couleur?.toLowerCase().includes('rouge') ? 'bg-red-500' :
                    vin.Couleur?.toLowerCase().includes('blanc') ? 'bg-yellow-400' :
                    vin.Couleur?.toLowerCase().includes('rosé') || vin.Couleur?.toLowerCase().includes('rose') ? 'bg-pink-400' :
                    'bg-gray-400'
                }`}></div>

                <div className="flex items-center p-4 gap-4">
                    {/* Image */}
                    <div className="relative flex-shrink-0">
                        <img
                            src={`data:image/jpeg;base64,${vin.base64_etiquette}`}
                            alt={vin.Nom}
                            className={`object-cover rounded border border-gray-200 dark:border-gray-600 shadow-sm group-hover:shadow-md transition-shadow duration-300 ${
                                isMobile ? 'w-14 h-18' : 'w-18 h-24'
                            }`}
                            loading="lazy"
                        />
                        {vin.Coup_de_Coeur && (
                            <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-sm">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                        )}
                    </div>

                    {/* Informations principales */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                                <h3 className={`font-semibold text-gray-900 dark:text-gray-100 truncate ${
                                    isMobile ? 'text-sm' : 'text-base'
                                }`}>
                                    {vin.Nom}
                                </h3>
                                <p className={`text-gray-500 dark:text-gray-400 truncate ${
                                    isMobile ? 'text-xs' : 'text-sm' } mt-0.5`}>
                                     • {vin.Millesime} • {vin.Producteur}
                                </p>
                            </div>

                            {/* Note avec étoiles */}
                            <div className="flex items-center gap-1 ml-2">
                                <div className="flex gap-0.5">
                                    {getStarsForNote(vin.Note_sur_20)}
                                </div>
                                <span className={`font-medium text-gray-700 dark:text-gray-300 ${
                                    isMobile ? 'text-xs' : 'text-sm'
                                }`}>
                                    {vin.Note_sur_20 || 0}
                                </span>
                            </div>
                        </div>

                        {/* Localisation */}
                        <div className={`text-gray-600 dark:text-gray-400 mb-2 ${
                            isMobile ? 'text-xs' : 'text-sm'
                        }`}>
                            <span className="inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                                {vin.Appellation}
                                {vin.Région && (
                                    <>
                                        <span className="mx-1">•</span>
                                        {formatRegionName(vin.Région)}
                                    </>
                                )}
                                <span className="mx-1">•</span>
                                {vin.Pays}
                            </span>
                        </div>

                        {/* Informations détaillées */}
                        <div className={`grid gap-x-4 gap-y-1 ${
                            isMobile ? 'grid-cols-2 text-xs' : 'grid-cols-4 text-sm'
                        }`}>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <span className="font-medium text-gray-700 dark:text-gray-300">Type:</span>
                                <span className="truncate">{vin.Type}</span>
                            </div>

                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <span className="font-medium text-gray-700 dark:text-gray-300">Stock:</span>
                                <span className={`font-medium ${
                                    vin.Reste_en_Cave > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                }`}>
                                    {vin.Reste_en_Cave || 0}
                                </span>
                            </div>

                            {!isMobile && (
                                <>
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                        <span className="font-medium text-gray-700 dark:text-gray-300">Cave:</span>
                                        <span className="truncate">{vin.Cave}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                        <span className="font-medium text-gray-700 dark:text-gray-300">Format:</span>
                                        <span className="truncate">{vin.Flacon}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Actions et prix */}
                    <div className="flex flex-col items-end gap-3 ml-2">
                        {/* Prix */}
                        <div className="text-right">
                            <div className={`font-bold text-gray-900 dark:text-gray-100 ${
                                isMobile ? 'text-sm' : 'text-base'
                            }`}>
                                {formatCurrency(vin.valeurCave || vin.Valeur_Euro || 0)}/stock
                            </div>
                            <div className={`text-gray-500 dark:text-gray-400 ${
                                isMobile ? 'text-xs' : 'text-sm'
                            }`}>
                                {formatCurrency(vin.Valeur || 0)}/unité
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            <button
                                className={`${isMobile ? 'w-8 h-8' : 'w-9 h-9'} rounded-lg border transition-all duration-200 flex items-center justify-center ${
                                    vin.Coup_de_Coeur
                                        ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                                        : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-500'
                                }`}
                                onClick={(e) => toggleFavori(vin.UUID_, !vin.Coup_de_Coeur, e)}
                                title={vin.Coup_de_Coeur ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                            >
                                <svg
                                    className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`}
                                    fill={vin.Coup_de_Coeur ? 'currentColor' : 'none'}
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </button>

                            {/* Bouton supprimer visible en mobile et desktop */}
                            <button
                                className={`${isMobile ? 'w-8 h-8' : 'w-9 h-9'} rounded-lg border border-gray-200 text-gray-400 hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:border-gray-600 dark:text-gray-500 dark:hover:bg-red-900/20 dark:hover:border-red-800 dark:hover:text-red-400 transition-all duration-200 flex items-center justify-center`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    confirmDeleteVin(vin);
                                }}
                                title="Supprimer"
                            >
                                <svg className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Indicateur d'état en bas */}
                <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>
            </div>
        </div>
    );

    const header = (
        <div className="flex gap-3 align-center justify-between p-0 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600">
            <IconField iconPosition="left" className="flex-1">
                <InputText
                    type="search"
                    onInput={(e) => setGlobalFilter(e.target.value)}
                    className="w-full p-3 border border-gray-200 dark:border-gray-500 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition duration-300 dark:bg-gray-700 dark:text-white bg-white"
                    placeholder="Rechercher un vin..."
                />
            </IconField>
            <button
                onClick={ajouterVin}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-xl shadow-md hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-50 transition duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            >
                <i className="pi pi-plus mr-2"></i>
                Ajouter un Vin
            </button>
        </div>
    );

    const onRowDoubleClick = (e) => navigate(`/vin/${e.data.UUID_}`);

    // Fonction pour appliquer les filtres mobiles
    const applyMobileFilters = useCallback(() => {
        let filteredData = [...listeCaves];

        // Filtre par caves
        if (mobileFilters.caves.length > 0) {
            filteredData = filteredData.filter(cave =>
                mobileFilters.caves.includes(cave.Cave)
            );
        }

        // Filtre par pays
        if (mobileFilters.pays) {
            filteredData = filteredData.filter(cave => cave.Pays === mobileFilters.pays);
        }

        // Filtre par couleur
        if (mobileFilters.couleur) {
            filteredData = filteredData.filter(cave => cave.Couleur === mobileFilters.couleur);
        }

        // Filtre par type
        if (mobileFilters.type) {
            filteredData = filteredData.filter(cave => cave.Type === mobileFilters.type);
        }

        // Filtre par douceur
        if (mobileFilters.douceur) {
            filteredData = filteredData.filter(cave => cave.Douceur === mobileFilters.douceur);
        }

        // Filtre par contenant
        if (mobileFilters.contenant) {
            filteredData = filteredData.filter(cave => cave.Flacon === mobileFilters.contenant);
        }

        // Filtre par millésime
        if (mobileFilters.millesime) {
            filteredData = filteredData.filter(cave => cave.Millesime === mobileFilters.millesime);
        }

        // Filtre par note
        if (mobileFilters.note) {
            const noteRange = mobileFilters.note;
            filteredData = filteredData.filter(cave => {
                const note = cave.Note_sur_20 || 0;
                switch (noteRange) {
                    case '95-100': return note >= 95 && note <= 100;
                    case '90-94': return note >= 90 && note < 95;
                    case '85-89': return note >= 85 && note < 90;
                    case '80-84': return note >= 80 && note < 85;
                    case '0-79': return note < 80;
                    default: return true;
                }
            });
        }
        // Tri
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
    //}, [mobileFilters, listeCaves, isMobile]);
    }, [listeCaves, mobileFilters, sortField, sortOrder, isMobile]);

    useEffect(() => {
        applyMobileFilters();
    }, [applyMobileFilters]);

    // Fonction pour réinitialiser les filtres
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

    // Fonction pour basculer le tri
    const toggleSort = () => {
        setShowSortDialog(true);
    };

    return (
        <PrimeReactProvider value={{ hideOverlaysOnDocumentScrolling: true }}>
            <div className="h-full bg-gray-50 dark:bg-gray-900">
                <Toast ref={toast} />

                {/* Dialog de confirmation de suppression */}
                <Dialog
                    visible={showDeleteDialog}
                    onHide={() => setShowDeleteDialog(false)}
                    header="Confirmation de suppression"
                    className="max-w-md"
                    footer={
                        <div className="flex gap-3 justify-end p-4">
                            <Button
                                label="Annuler"
                                icon="pi pi-times"
                                className="p-button-outlined border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors duration-200 p-2"
                                onClick={() => setShowDeleteDialog(false)}
                            />
                            <Button
                                label="Confirmer"
                                icon="pi pi-check"
                                className="bg-red-500 hover:bg-red-600 border-red-500 text-white transition-colors duration-200 p-2"
                                onClick={handleDeleteVin}
                            />
                        </div>
                    }
                >
                    <div className="flex items-center gap-4 p-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                            <i className="pi pi-exclamation-triangle text-orange-600 dark:text-orange-400 text-xl"></i>
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900 dark:text-gray-100">Supprimer ce vin</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Cette action est irréversible.</p>
                        </div>
                    </div>
                </Dialog>

                {/* Dialog des filtres mobiles - Version optimisée mobile */}
                <Dialog
                    visible={showMobileFilters}
                    onHide={() => setShowMobileFilters(false)}
                    header={
                        isMobile ? (
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-blue-500 rounded-md flex items-center justify-center">
                                        <i className="pi pi-filter text-white text-xs"></i>
                                    </div>
                                    <span className="text-base font-medium">Filtres</span>
                                </div>
                                <button
                                    onClick={() => setShowMobileFilters(false)}
                                    className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    <i className="pi pi-times text-gray-600 dark:text-gray-300 text-sm"></i>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <i className="pi pi-filter text-white text-sm"></i>
                                </div>
                                <span>Filtres de recherche</span>
                            </div>
                        )
                    }
                    className={isMobile ? "w-screen m-0" : "w-96"}
                    style={isMobile ? {
                        margin: 0,
                        borderRadius: 0,
                        height: '80vh',
                        maxHeight: '80vh'
                    } : {}}
                    position={isMobile ? "center" : "top-right"}
                    modal={isMobile}
                    draggable={false}
                    resizable={false}
                    appendTo={isMobile ? document.body : filterButtonRef}
                    footer={
                        isMobile ? (
                            <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 grid grid-cols-2 gap-3">
                                <button
                                    onClick={resetMobileFilters}
                                    className="flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <i className="pi pi-refresh text-sm"></i>
                                    <span className="text-sm font-medium">Réinitialiser</span>
                                </button>
                                <button
                                    onClick={() => setShowMobileFilters(false)}
                                    className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                                >
                                    <i className="pi pi-check text-sm"></i>
                                    <span className="text-sm font-medium">Appliquer</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2 justify-between p-4 bg-gray-50 dark:bg-gray-800">
                                <Button
                                    label="Réinitialiser"
                                    icon="pi pi-refresh"
                                    className="p-button-outlined text-sm border-gray-300 text-gray-600 hover:bg-gray-100"
                                    onClick={resetMobileFilters}
                                />
                                <div className="flex gap-2">
                                    <Button
                                        label="Annuler"
                                        className="p-button-text text-sm text-gray-600 p-2 bg-gray-300"
                                        onClick={() => setShowMobileFilters(false)}
                                    />
                                    <Button
                                        label="Appliquer"
                                        icon="pi pi-check"
                                        className="bg-blue-500 hover:bg-blue-600 text-sm p-2 text-white"
                                        onClick={() => setShowMobileFilters(false)}
                                    />
                                </div>
                            </div>
                        )
                    }
                >
                    <div className={isMobile ? "p-2 pb-16 overflow-y-auto" : "p-3"} style={isMobile ? { height: 'calc(70vh - 100px)' } : {}}>
                        <div className={isMobile ? "space-y-6" : "space-y-4"}>
                            {/* Section Localisation */}
                            <div className={`rounded-lg ${isMobile ? 'p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700' : 'p-3 bg-gray-50 dark:bg-gray-700'}`}>
                                <h3 className={`font-semibold text-gray-900 dark:text-gray-100 ${isMobile ? 'mb-4 text-base' : 'mb-3'} flex items-center gap-2`}>
                                    <i className="pi pi-map-marker text-blue-500"></i>
                                    Localisation
                                </h3>
                                <div className={isMobile ? "space-y-4" : "space-y-3"}>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Caves</label>
                                        <MultiSelect
                                            value={mobileFilters.caves}
                                            options={distinctCaves.filter(c => c.value !== 'Toutes').map(c => ({ label: c.label, value: c.value }))}
                                            onChange={(e) => setMobileFilters(prev => ({ ...prev, caves: e.value }))}
                                            placeholder="Toutes les caves"
                                            className={isMobile ? "w-full" : "w-64"}
                                            maxSelectedLabels={isMobile ? 1 : 2}
                                            filter
                                            scrollHeight="200px"
                                            dropdownIcon="pi pi-chevron-down"
                                            panelStyle={{
                                                position: 'relative',
                                                top: '0',
                                                left: '0',
                                                width: isMobile ? '100%' : '256px',
                                                maxHeight: '200px',
                                                overflow: 'auto'
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Pays</label>
                                        <Dropdown
                                            value={mobileFilters.pays}
                                            options={pays.map(p => ({ label: p, value: p }))}
                                            onChange={(e) => setMobileFilters(prev => ({ ...prev, pays: e.value }))}
                                            placeholder="Tous les pays"
                                            className="w-full"
                                            showClear
                                            filter
                                            appendTo="self"
                                            panelClassName="max-h-60"
                                            panelStyle={{ position: 'absolute', zIndex: 9999 }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section Caractéristiques */}
                            <div className={`rounded-lg ${isMobile ? 'p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700' : 'p-3 bg-gray-50 dark:bg-gray-700'}`}>
                                <h3 className={`font-semibold text-gray-900 dark:text-gray-100 ${isMobile ? 'mb-4 text-base' : 'mb-3'} flex items-center gap-2`}>
                                    <i className="pi pi-tags text-green-500"></i>
                                    Caractéristiques
                                </h3>
                                <div className={isMobile ? "space-y-4" : "space-y-3"}>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Couleur</label>
                                            <Dropdown
                                                value={mobileFilters.couleur}
                                                options={couleurs.map(c => ({ label: c, value: c }))}
                                                onChange={(e) => setMobileFilters(prev => ({ ...prev, couleur: e.value }))}
                                                placeholder="Toutes"
                                                className="w-full"
                                                showClear
                                                appendTo="self"
                                                panelClassName="max-h-60"
                                                panelStyle={{ position: 'absolute', zIndex: 9999 }}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Type</label>
                                            <Dropdown
                                                value={mobileFilters.type}
                                                options={types.map(t => ({ label: t, value: t }))}
                                                onChange={(e) => setMobileFilters(prev => ({ ...prev, type: e.value }))}
                                                placeholder="Tous"
                                                className="w-full"
                                                showClear
                                                appendTo="self"
                                                panelClassName="max-h-60"
                                                panelStyle={{ position: 'absolute', zIndex: 9999 }}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Contenant</label>
                                            <Dropdown
                                                value={mobileFilters.contenant}
                                                options={contenants.map(c => ({ label: c, value: c }))}
                                                onChange={(e) => setMobileFilters(prev => ({ ...prev, contenant: e.value }))}
                                                placeholder="Tous"
                                                className="w-full"
                                                showClear
                                                appendTo="self"
                                                panelClassName="max-h-60"
                                                panelStyle={{ position: 'absolute', zIndex: 9999 }}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Millésime</label>
                                            <Dropdown
                                                value={mobileFilters.millesime}
                                                options={millesime.sort((a, b) => b - a).map(m => ({ label: m, value: m }))}
                                                onChange={(e) => setMobileFilters(prev => ({ ...prev, millesime: e.value }))}
                                                placeholder="Tous"
                                                className="w-full"
                                                showClear
                                                filter
                                                appendTo="self"
                                                panelClassName="max-h-60"
                                                panelStyle={{ position: 'absolute', zIndex: 9999 }}
                                            />
                                        </div>
                                    </div>

                                    {/* Douceur conditionnelle */}
                                    {mobileFilters.type && douceurs.length > 0 && (
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Douceur</label>
                                            <Dropdown
                                                value={mobileFilters.douceur}
                                                options={douceurs.map(d => ({ label: d, value: d }))}
                                                onChange={(e) => setMobileFilters(prev => ({ ...prev, douceur: e.value }))}
                                                placeholder="Toutes"
                                                className="w-full"
                                                showClear
                                                appendTo="self"
                                                panelClassName={isMobile ? "max-h-60" : ""}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Section Qualité */}
                            <div className={`rounded-lg ${isMobile ? 'p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700' : 'p-3 bg-gray-50 dark:bg-gray-700'}`}>
                                <h3 className={`font-semibold text-gray-900 dark:text-gray-100 ${isMobile ? 'mb-4 text-base' : 'mb-3'} flex items-center gap-2`}>
                                    <i className="pi pi-star text-yellow-500"></i>
                                    Qualité
                                </h3>
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Note</label>
                                    {isMobile ? (
                                        <div className="space-y-2">
                                            {[
                                                { label: '95-100 (Exceptionnel)', value: '95-100' },
                                                { label: '90-94 (Excellent)', value: '90-94' },
                                                { label: '85-89 (Très bon)', value: '85-89' },
                                                { label: '80-84 (Bon)', value: '80-84' },
                                                { label: '0-79 (Acceptable)', value: '0-79' }
                                            ].map((option) => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => setMobileFilters(prev => ({
                                                        ...prev,
                                                        note: prev.note === option.value ? null : option.value
                                                    }))}
                                                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                                                        mobileFilters.note === option.value
                                                            ? 'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-600 dark:text-yellow-300'
                                                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                                                    }`}
                                                >
                                                    <span className="text-sm font-medium">{option.label}</span>
                                                    {mobileFilters.note === option.value && (
                                                        <i className="pi pi-check text-yellow-500"></i>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <Dropdown
                                            value={mobileFilters.note}
                                            options={[
                                                { label: '95-100 (Exceptionnel)', value: '95-100' },
                                                { label: '90-94 (Excellent)', value: '90-94' },
                                                { label: '85-89 (Très bon)', value: '85-89' },
                                                { label: '80-84 (Bon)', value: '80-84' },
                                                { label: '0-79 (Acceptable)', value: '0-79' }
                                            ]}
                                            onChange={(e) => setMobileFilters(prev => ({ ...prev, note: e.value }))}
                                            placeholder="Toutes les notes"
                                            className="w-full"
                                            showClear
                                            appendTo="self"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </Dialog>

                {/* Dialog de tri - Nouveau popup dédié */}
                <Dialog
                    visible={showSortDialog}
                    onHide={() => setShowSortDialog(false)}
                    header={
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                                <i className="pi pi-sort text-white text-sm"></i>
                            </div>
                            <span>Options de tri</span>
                        </div>
                    }
                    className={isMobile ? "w-screen h-screen m-0" : "w-96"}
                    style={isMobile ? { margin: 0, borderRadius: 0 } : {}}
                    position={isMobile ? "center" : "top-right"}
                    modal={isMobile}
                    draggable={false}
                    resizable={false}
                    appendTo={isMobile ? document.body : sortButtonRef}
                    footer={
                        isMobile ? (
                            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setShowSortDialog(false)}
                                    className="flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <i className="pi pi-times text-sm"></i>
                                    <span className="text-sm font-medium">Annuler</span>
                                </button>
                                <button
                                    onClick={() => setShowSortDialog(false)}
                                    className="flex items-center justify-center gap-2 py-3 px-4 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                                >
                                    <i className="pi pi-check text-sm"></i>
                                    <span className="text-sm font-medium">Appliquer</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex justify-end gap-2 p-4 bg-gray-50 dark:bg-gray-800">
                                <Button
                                    label="Annuler"
                                    className="p-button-text text-sm text-gray-600 p-2"
                                    onClick={() => setShowSortDialog(false)}
                                />
                                <Button
                                    label="Appliquer"
                                    icon="pi pi-check"
                                    className="bg-purple-500 hover:bg-purple-600 text-sm p-2 text-white"
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
                                <label className={`block text-sm font-medium ${isMobile ? 'mb-3' : 'mb-2'} text-gray-700 dark:text-gray-300`}>
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
                                            className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                                                sortField === option.value
                                                    ? 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-600 dark:text-purple-300'
                                                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                                            }`}
                                        >
                                            <i className={`pi ${option.icon} text-lg ${
                                                sortField === option.value ? 'text-purple-500' : 'text-gray-400'
                                            }`}></i>
                                            <span className="font-medium">{option.label}</span>
                                            {sortField === option.value && (
                                                <i className="pi pi-check text-purple-500 ml-auto"></i>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Ordre de tri */}
                            <div>
                                <label className={`block text-sm font-medium ${isMobile ? 'mb-3' : 'mb-2'} text-gray-700 dark:text-gray-300`}>
                                    Ordre de tri
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setSortOrder(1)}
                                        className={`flex items-center justify-center gap-2 p-4 rounded-lg border transition-all duration-200 ${
                                            sortOrder === 1
                                                ? 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-600 dark:text-purple-300'
                                                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                                        }`}
                                    >
                                        <i className="pi pi-sort-alpha-down text-lg"></i>
                                        <span className="font-medium">A → Z</span>
                                    </button>
                                    <button
                                        onClick={() => setSortOrder(-1)}
                                        className={`flex items-center justify-center gap-2 p-4 rounded-lg border transition-all duration-200 ${
                                            sortOrder === -1
                                                ? 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-600 dark:text-purple-300'
                                                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                                        }`}
                                    >
                                        <i className="pi pi-sort-alpha-up text-lg"></i>
                                        <span className="font-medium">Z → A</span>
                                    </button>
                                </div>
                            </div>

                            {/* Aperçu du tri actuel */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                    <i className="pi pi-info-circle"></i>
                                    <span className="text-sm font-medium">
                                        Tri actuel: {[
                                            { label: 'Nom', value: 'Nom' },
                                            { label: 'Pays', value: 'Pays' },
                                            { label: 'Région', value: 'Région' },
                                            { label: 'Type', value: 'Type' },
                                            { label: 'Millésime', value: 'Millesime' },
                                            { label: 'Note', value: 'Note_sur_20' },
                                            { label: 'Valeur', value: 'Valeur' }
                                        ].find(f => f.value === sortField)?.label} ({sortOrder === 1 ? 'A→Z' : 'Z→A'})
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Dialog>

                {/* Interface unifiée pour mobile et desktop */}
                <div className="p-2 bg-gray-50 dark:bg-gray-900 min-h-screen">
                    {/* Header avec recherche et compteur */}
                    <div className="flex gap-2 mb-2">
                        <div className="flex-1">
                            <IconField iconPosition="left">
                                <InputIcon className="pi pi-search" />
                                <InputText
                                    type="search"
                                    onInput={(e) => setGlobalFilter(e.target.value)}
                                    className="w-full p-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition duration-300 dark:bg-gray-700 dark:text-white bg-white pl-7"
                                    placeholder="Rechercher..."
                                />
                            </IconField>
                        </div>
                        <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg px-2 py-1.5 border border-gray-100 dark:border-gray-700 shadow-sm min-w-fit">
                            <i className="pi pi-info-circle text-slate-500 dark:text-slate-400 text-xs mr-1"></i>
                            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
                                {filteredVisibleData.length}/{listeCaves.length}
                            </span>
                        </div>
                    </div>

                    {/* Boutons de contrôle */}
                    <div className={`gap-2 mb-2 ${isMobile ? 'grid grid-cols-5' : 'flex justify-between'}`}>
                        <button
                            onClick={ajouterVin}
                            className="px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-lg shadow-sm hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-50 transition duration-300 flex items-center justify-center gap-1"
                        >
                            <i className="pi pi-plus text-sm"></i>
                            {!isMobile && <span>Ajouter un vin</span>}
                        </button>

                        {isMobile ? (
                            <>
                                <button
                                    onClick={goFavoris}
                                    className="px-3 py-2 bg-gradient-to-r from-rose-500 to-red-600 text-white font-medium rounded-lg shadow-sm hover:from-rose-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-opacity-50 transition duration-300 flex items-center justify-center gap-1"
                                    title="Voir les favoris"
                                >
                                    <i className="pi pi-heart text-sm"></i>
                                </button>
                                <button
                                    ref={(el) => setFilterButtonRef(el)}
                                    onClick={() => setShowMobileFilters(true)}
                                    className="px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg shadow-sm hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition duration-300 flex items-center justify-center gap-1"
                                >
                                    <i className="pi pi-filter text-sm"></i>
                                </button>
                                <button
                                    ref={(el) => setSortButtonRef(el)}
                                    onClick={toggleSort}
                                    className="px-3 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium rounded-lg shadow-sm hover:from-purple-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50 transition duration-300 flex items-center justify-center gap-1"
                                >
                                    <i className={`pi ${sortOrder === 1 ? 'pi-sort-alpha-down' : 'pi-sort-alpha-up'} text-sm`}></i>
                                </button>
                                <button
                                    onClick={() => setShowEnCaveOnly(prev => !prev)}
                                    className={`px-3 py-2 rounded-lg font-medium shadow-sm flex items-center justify-center gap-1 transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-0 ${showEnCaveOnly ? 'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-400' : 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 hover:from-amber-200 hover:to-yellow-200 focus:ring-amber-300'}`}
                                    title="Afficher uniquement les vins avec stock > 0"
                                >
                                    <i className="pi pi-box text-sm"></i>
                                </button>
                            </>
                        ) : (
                            <div className="flex gap-2 ">
                                <button
                                    onClick={() => setShowEnCaveOnly(prev => !prev)}
                                    className={`px-4 py-2 rounded-lg font-medium shadow-sm flex items-center justify-center gap-2 transition duration-300 focus:outline-none focus:ring-2 ${showEnCaveOnly ? 'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-400' : 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 hover:from-amber-200 hover:to-yellow-200 focus:ring-amber-300'}`}
                                >
                                    <i className="pi pi-box text-sm"></i>
                                    <span>En cave</span>
                                </button>
                                <button
                                    onClick={goFavoris}
                                    className="px-4 py-2 bg-gradient-to-r from-rose-500 to-red-600 text-white font-medium rounded-lg shadow-sm hover:from-rose-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-opacity-50 transition duration-300 flex items-center justify-center gap-2"
                                >
                                    <i className="pi pi-heart text-sm"></i>
                                    <span>Favoris</span>
                                </button>
                                <button
                                    ref={(el) => setFilterButtonRef(el)}
                                    onClick={() => setShowMobileFilters(true)}
                                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg shadow-sm hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition duration-300 flex items-center justify-center gap-2"
                                >
                                    <i className="pi pi-filter text-sm"></i>
                                    <span>Filtres</span>
                                </button>
                                <button
                                    ref={(el) => setSortButtonRef(el)}
                                    onClick={toggleSort}
                                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium rounded-lg shadow-sm hover:from-purple-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50 transition duration-300 flex items-center justify-center gap-2"
                                >
                                    <i className={`pi ${sortOrder === 1 ? 'pi-sort-alpha-down' : 'pi-sort-alpha-up'} text-sm`}></i>
                                    <span>Tri</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* VirtualScroller unifié */}
                    <div style={{ height: 'calc(100vh - 160px)' }}>
                        <VirtualScroller
                            items={filteredVisibleData}
                            itemSize={isMobile ? 120 : 140}
                            itemTemplate={vinItemTemplate}
                            className="border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                            style={{ width: '100%', height: '100%' }}
                        />
                    </div>
                </div>
            </div>
        </PrimeReactProvider>
    );
}