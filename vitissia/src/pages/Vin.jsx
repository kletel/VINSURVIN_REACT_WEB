import React, { useEffect, useState, useRef, useMemo, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useFetchCaves from '../hooks/useFetchCaves';
import useFetchPays from '../hooks/useFetchPays';
import useFetchRegions from '../hooks/useFetchRegions';
import { Rating } from 'primereact/rating';
import ReactStars from 'react-rating-stars-component';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import config from '../config/config';
import authHeader from '../config/authHeader';
import VinTabs from '../components/VinTabs';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import imageCompression from "browser-image-compression";
import useFetchEnums from '../hooks/useFetchEnums';
import { Slider } from 'primereact/slider';
import { ThemeContext } from '../context/ThemeContext';
import { Dialog } from 'primereact/dialog';
import Layout from '../components/Layout';
import FancyNoteSlider from '../components/FancyNoteSlider';
import { motion } from 'framer-motion';

const MotionDiv = motion.div;
const MotionButton = motion.button;

const VinLoadingScreen = () => {
    const fakeChips = ['Appellation', 'Millesime', 'Pays', 'Type'];

    return (
        <div className="bg-gradient-to-b from-[#8C2438] via-[#5A1020] to-[#3B0B15] min-h-screen font-['Work_Sans',sans-serif] text-white">
            <div className="max-w-5xl mx-auto px-4 pt-8 pb-12">
                <div className="flex items-center justify-between mb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/20 border border-white/15 shadow-sm shadow-black/40">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-xs text-emerald-100/90 font-medium">
                            Préparation de la fiche vin...
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="flex justify-center items-center bg-gray-900/70 border border-white/10 rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.9)] p-6"
                    >
                        <div className="w-52 sm:w-64 md:w-72 h-[22rem] rounded-2xl bg-gradient-to-b from-slate-800 via-slate-900 to-black border border-white/15 shadow-[0_18px_45px_rgba(0,0,0,0.9)] overflow-hidden relative">
                            <div className="absolute inset-x-5 top-16 h-24 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
                            <div className="absolute inset-x-6 bottom-10 h-10 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
                            <motion.div
                                className="absolute top-8 bottom-8 left-[18%] w-1.5 bg-gradient-to-b from-white/40 via-white/5 to-transparent opacity-60"
                                initial={{ opacity: 0.2 }}
                                animate={{ opacity: [0.2, 0.8, 0.2] }}
                                transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                            />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut', delay: 0.05 }}
                        className="flex-auto p-6 bg-gray-900/70 border border-white/10 rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.9)]"
                    >
                        <div className="space-y-2 mb-4">
                            <div className="h-5 w-2/3 rounded-full bg-white/15 animate-pulse" />
                            <div className="h-3 w-1/3 rounded-full bg-white/10 animate-pulse" />
                            <div className="h-2.5 w-1/2 rounded-full bg-white/10 animate-pulse" />
                        </div>

                        <div className="flex flex-wrap gap-2 mb-5">
                            {fakeChips.map((chip, i) => (
                                <div
                                    key={chip + i}
                                    className="h-6 px-4 rounded-full bg-white/5 border border-white/15 animate-pulse"
                                />
                            ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="space-y-1">
                                    <div className="h-2.5 w-20 rounded-full bg-white/15" />
                                    <div className="h-3 w-3/4 rounded-full bg-white/10 animate-pulse" />
                                </div>
                            ))}
                        </div>

                        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <div className="h-2.5 w-16 rounded-full bg-white/15 mb-2" />
                                <div className="h-3.5 w-32 rounded-full bg-white/10 animate-pulse mb-1" />
                                <div className="h-2.5 w-24 rounded-full bg-white/10 animate-pulse" />
                            </div>
                            <div>
                                <div className="h-2.5 w-24 rounded-full bg-white/15 mb-2" />
                                <div className="h-10 w-32 rounded-xl bg-white/5 border border-white/15 animate-pulse" />
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-red-100/80">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-ping" />
                        <span>On lit l’étiquette, on vérifie l’appellation et on décante les infos…</span>
                    </div>
                    <span className="text-[11px] text-red-100/70">
                        Astuce : tu pourras ensuite modifier la fiche, noter le vin et l’associer à des mets.
                    </span>
                </div>
            </div>
        </div>
    );
};

const getCavesCacheKey = (uuid) => (uuid ? `vitissia_caves_cache_${uuid}` : null);
const getDistinctCavesKey = (uuid) => (uuid ? `distinctCaves_${uuid}` : 'distinctCaves');

const Vin = () => {
    const { UUID_ } = useParams();
    const navigate = useNavigate();
    const { cave, error, loading, fetchCave, fetchCaves } = useFetchCaves();
    const { enums, fetchEnums } = useFetchEnums();
    const [vin, setVin] = useState(null);
    const [initialVin, setInitialVin] = useState(cave);
    const [isEditing, setIsEditing] = useState(false);
    const toast = useRef(null);
    const { lesPays, fetchLesPays } = useFetchPays();
    const { regions, fetchRegions } = useFetchRegions();
    const { darkMode } = useContext(ThemeContext);
    const [distinctCaves, setDistinctCaves] = useState([]);
    const [showAddCaveDialog, setShowAddCaveDialog] = useState(false);
    const [newCaveName, setNewCaveName] = useState("");
    const [associationsMets, setAssociationsMets] = useState([]);
    const [loadingRecipeForMet, setLoadingRecipeForMet] = useState(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const uuidUser = sessionStorage.getItem('uuid_user');
    const CAVES_CACHE_KEY = getCavesCacheKey(uuidUser);
    const distinctCavesKey = getDistinctCavesKey(uuidUser);

    const confirmDelete = () => setShowDeleteDialog(true);
    const handleDelete = async () => {
        try {
            const response = await fetch(
                `${config.apiBaseUrl}/4DACTION/react_supprimerCave?UUID_=${UUID_}`,
                {
                    method: 'GET',
                    headers: authHeader(),
                }
            );
            if (!response.ok) throw new Error('Erreur lors de la suppression');
            const data = await response.json();
            if (data.etat === 'succes') {
                try {
                    if (CAVES_CACHE_KEY) {
                        const raw = localStorage.getItem(CAVES_CACHE_KEY);
                        if (raw) {
                            const arr = JSON.parse(raw);
                            if (Array.isArray(arr)) {
                                const next = arr.filter((v) => v.UUID_ !== UUID_);
                                localStorage.setItem(CAVES_CACHE_KEY, JSON.stringify(next));
                            }
                        }
                    }
                } catch (e) {
                    console.warn('Erreur mise à jour cache après suppression', e);
                }

                toast.current?.show({
                    severity: 'success',
                    summary: 'Supprimé',
                    detail: 'Le vin a été supprimé.',
                    life: 2500
                });

                navigate('/cave');
            } else {
                throw new Error('Echec API');
            }
        } catch (e) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: "Suppression impossible.",
                life: 3000
            });
        } finally {
            setShowDeleteDialog(false);
        }
    };

    useEffect(() => {
        const storedCaves = JSON.parse(localStorage.getItem(distinctCavesKey)) || [];
        const cavesFormatted = storedCaves.map(c => ({ label: c, value: c }));
        setDistinctCaves(cavesFormatted);
    }, [distinctCavesKey]);

    const handleCaveChange = (value) => {
        setVin((prevVin) => ({
            ...prevVin,
            Cave: value,
        }));
    };

    useEffect(() => {
        fetchEnums();
    }, [fetchEnums]);

    const optionTypeVin = useMemo(() => {
        const typeVinEnum = enums.find((item) => item.titre === "Type de vin");
        return typeVinEnum?.Valeur_Enum?.Valeur.map((val) => ({
            label: val.Libelle,
            value: val.Libelle,
        })) || [];
    }, [enums]);

    const optionsPays = useMemo(() => lesPays.map((pays) => ({
        label: pays.Nom_Fr,
        value: pays.Ref_Pays,
    })), [lesPays]);

    const optionsRegions = useMemo(() => regions.map((region) => ({
        label: region.Nom_Fr,
        value: region.Ref_Pays,
    })), [regions]);

    const [filteredRegions, setFilteredRegions] = useState(optionsRegions);
    useEffect(() => {
        setFilteredRegions(optionsRegions);
    }, [optionsRegions]);

    const defaultCountry = "";
    const defaultCountryValue = vin?.Pays
        ? optionsPays.find((pays) => pays.label === vin.Pays)
        : defaultCountry;
    const defaultRegion = "";
    const defaultRegionValue = vin?.Région
        ? optionsRegions.find((region) => region.label === vin.Région)
        : defaultRegion;

    const [isClearable, setIsClearable] = useState(true);
    const [isSearchable, setIsSearchable] = useState(true);

    const optionCouleur = [
        { label: 'Rouge', value: 'Rouge' },
        { label: 'Blanc', value: 'Blanc' },
        { label: 'Rosé', value: 'Rosé' },
    ];

    const handleCountryChange = (selectedOption) => {
        const selectedCountry = selectedOption?.value || '';
        handleInputChange(selectedOption?.label || '', 'Pays');

        const matchingCountryOption = optionsPays.find(pays => pays.label === selectedOption?.label);
        if (matchingCountryOption) {
            const newFilteredRegions = optionsRegions.filter(
                (region) => region.value === matchingCountryOption.value
            );
            setFilteredRegions(newFilteredRegions);
        } else {
            setFilteredRegions(optionsRegions);
        }
    };

    useEffect(() => {
        fetchCave(UUID_);
    }, [UUID_, fetchCave]);

    useEffect(() => {
        setVin(cave);
        setInitialVin(cave);
        if (cave && cave.Nom) {
            fetchDegustationVin(cave);
        }
    }, [cave]);

    const fetchDegustationVin = async (vinData) => {
        try {
            const UUIDuser = sessionStorage.getItem('uuid_user');
            const params = new URLSearchParams({
                UUID_: UUID_,
                UUIDuser: UUIDuser,
                nomVin: vinData.Nom || ''
            });

            const response = await fetch(`${config.apiBaseUrl}/4DACTION/react_getDegustationVin?${params}`, {
                method: 'GET',
                headers: authHeader(),
            });

            if (response.ok) {
                const data = await response.json();
                if (data && Array.isArray(data)) {
                    setAssociationsMets(data);
                }
            }
        } catch (err) {
            console.error('Erreur lors de la récupération des associations mets:', err);
        }
    };

    useEffect(() => {
        if (vin?.Pays) {
            const selectedCountry = optionsPays.find((pays) => pays.label === vin.Pays)?.value || '';
            const newFilteredRegions = optionsRegions.filter(
                (region) => region.value === selectedCountry
            );
            if (JSON.stringify(filteredRegions) !== JSON.stringify(newFilteredRegions)) {
                setFilteredRegions(newFilteredRegions);
            }
        }
    }, [vin, optionsPays, optionsRegions, filteredRegions]);

    const handleInputChange = (e, customName) => {
        if (customName) {
            setVin((prevVin) => {
                const updatedVin = { ...prevVin, [customName]: e };
                if (customName === "Valeur" || customName === "Qte") {
                    updatedVin.valeurCave = (updatedVin.Qte || 0) * (updatedVin.Valeur || 0);
                }
                return updatedVin;
            });
        } else if (e?.target) {
            const { name, value } = e.target;
            setVin((prevVin) => {
                const updatedVin = { ...prevVin, [name]: value };
                if (name === "Valeur" || name === "Qte") {
                    updatedVin.valeurCave = (updatedVin.Qte || 0) * (updatedVin.Valeur || 0);
                }
                return updatedVin;
            });
        }
    };

    const getModifiedFields = () => {
        const modified = {};
        Object.keys(vin).forEach((key) => {
            if (vin[key] !== initialVin[key]) {
                modified[key] = vin[key];
            }
        });

        return modified;
    };

    const handleSave = async () => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Connexion requise',
                detail: 'Connectez-vous pour enregistrer des modifications.',
                life: 3000
            });
            return;
        }

        if (!vin) return;

        const modifiedVin = getModifiedFields();

        try {
            const formData = new FormData();
            formData.append("UUID_", vin.UUID_);
            formData.append("champsModif", JSON.stringify(modifiedVin));
            formData.append("token", token);

            const headers = authHeader();
            if (headers['Content-Type']) {
                delete headers['Content-Type'];
            }

            const response = await fetch(
                `${config.apiBaseUrl}/4DACTION/react_putCave?UUID_=${vin.UUID_}`,
                {
                    method: 'PUT',
                    headers,
                    body: formData,
                }
            );

            if (!response.ok) {
                const errorText = await response.text().catch(() => '');
                console.error('Erreur HTTP putCave', response.status, errorText);
                throw new Error('Erreur sauvegarde');
            }

            let updated;
            const rawText = await response.text();

            if (rawText && rawText.trim() !== '') {
                try {
                    updated = JSON.parse(rawText);
                } catch (err) {
                    console.warn('Réponse non-JSON du serveur, on garde les données locales :', rawText);
                    updated = { ...vin, ...modifiedVin };
                }
            } else {
                updated = { ...vin, ...modifiedVin };
            }

            setVin(updated);
            setInitialVin(updated);
            setIsEditing(false);

            try {
                if (CAVES_CACHE_KEY) {
                    const raw = localStorage.getItem(CAVES_CACHE_KEY);
                    if (raw) {
                        const arr = JSON.parse(raw);
                        if (Array.isArray(arr)) {
                            const next = arr.map((item) =>
                                item.UUID_ === updated.UUID_ ? { ...item, ...updated } : item
                            );
                            localStorage.setItem(CAVES_CACHE_KEY, JSON.stringify(next));
                        }
                    }
                }
            } catch (e) {
                console.warn('Erreur mise à jour cache caves après édition', e);
            }

            toast.current.show({
                severity: 'success',
                summary: 'Succès',
                detail: 'Modifications enregistrées.',
                life: 3000
            });
        } catch (e) {
            console.error(e);
            toast.current.show({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Erreur lors de la sauvegarde.',
                life: 3000
            });
        }
    };

    const handleCancel = () => {
        setVin(initialVin);
        setIsEditing(false);
    };

    const customBase64Uploader = async (event) => {
        const file = event.files[0];
        if (file) {
            try {
                const sizeMB = file.size / 1024 / 1024;

                if (sizeMB <= 0.256) {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => {
                        const base64String = reader.result.split(",")[1];
                        setVin((prevVin) => ({ ...prevVin, base64_etiquette: base64String }));
                    };
                } else {
                    const options = {
                        maxSizeMB: 0.256,
                        maxWidthOrHeight: 1024,
                        useWebWorker: true,
                    };
                    const compressedFile = await imageCompression(file, options);
                    const reader = new FileReader();
                    reader.readAsDataURL(compressedFile);
                    reader.onload = () => {
                        const base64String = reader.result.split(",")[1];
                        setVin((prevVin) => ({ ...prevVin, base64_etiquette: base64String }));
                    };
                }
            } catch (error) {
                console.error("Erreur lors du traitement de l'image :", error);
            }
        }
    };

    const addCaveDialogFooter = (
        <div>
            <button
                onClick={() => setShowAddCaveDialog(false)}
                className="px-4 py-2 rounded-lg border border-white/20 text-white/80 bg-transparent hover:bg-white/10 transition-all duration-200"
            >
                Annuler
            </button>
            <button
                onClick={() => {
                    if (newCaveName.trim() !== "" && !distinctCaves.some(cave => cave.label === newCaveName)) {
                        const updatedCaves = [...distinctCaves, { label: newCaveName, value: newCaveName }];
                        setDistinctCaves(updatedCaves);
                        localStorage.setItem(distinctCavesKey, JSON.stringify(updatedCaves.map(c => c.value)));
                        setVin((prevVin) => ({ ...prevVin, Cave: newCaveName }));
                        setShowAddCaveDialog(false);
                        setNewCaveName("");
                    }
                }}
                className="px-4 py-2 rounded-lg bg-white/20 text-white font-semibold hover:bg-white/30 shadow-[0_10px_30px_rgba(0,0,0,0.7)] transition-all duration-200"
            >
                Ajouter
            </button>
        </div>
    );

    const associationMetsList = useMemo(() => {
        if (vin?.Association_Mets) {
            return vin.Association_Mets.split(',').map(item => item.trim()).filter(item => item);
        }
        return [];
    }, [vin?.Association_Mets]);

    const toggleFavori = async (vin, setVin, toast) => {
        try {
            const newFavoriState = !vin.Coup_de_Coeur;

            setVin((prev) => ({ ...prev, Coup_de_Coeur: newFavoriState }));

            const formData = new FormData();
            formData.append("UUID_", vin.UUID_);
            formData.append("Coup_de_Coeur", newFavoriState);

            const response = await fetch(
                `${config.apiBaseUrl}/4DACTION/react_putCaveFavori?UUID_=${vin.UUID_}`,
                {
                    method: "PUT",
                    headers: authHeader(),
                    body: formData,
                }
            );

            const data = await response.json();

            if (data.entete === "succes") {
                toast.current.show({
                    severity: "success",
                    summary: "Succès",
                    detail: newFavoriState
                        ? "Vin ajouté aux favoris."
                        : "Vin retiré des favoris.",
                    life: 3000,
                });
            } else {
                throw new Error("Erreur API");
            }
        } catch (err) {
            console.error("Erreur mise à jour favori:", err);

            setVin((prev) => ({
                ...prev,
                Coup_de_Coeur: !prev.Coup_de_Coeur,
            }));

            toast.current.show({
                severity: "error",
                summary: "Erreur",
                detail: "Impossible de mettre à jour le favori.",
                life: 3000,
            });
        }
    };

    const formatRegionName = useCallback((region) => {
        if (region === "Provence-Alpes-Côte d'Azur") {
            return "PACA";
        }
        return region;
    }, []);

    const handleMetClick = async (met) => {
        sessionStorage.setItem('recetteOrigin', 'VIN_DETAIL');
        sessionStorage.setItem('vinDetailUUID', UUID_);
        sessionStorage.removeItem('metsVinsState');

        setLoadingRecipeForMet(met.nomMet);
        try {
            const UUIDuser = sessionStorage.getItem('uuid_user');
            const formData = new FormData();
            formData.append("met", met.nomMet);
            formData.append("uuidUser", UUIDuser);
            formData.append("uuidAssociation", met.UUID_ || '');

            sessionStorage.setItem('vinName', vin.Nom);
            sessionStorage.setItem('metName', met.nomMet);
            sessionStorage.setItem('recetteUUID', met.UUID_Recette || '');
            navigate('/recette');
        } catch (err) {
            console.error('Erreur lors de la récupération de la recette:', err);
            toast.current.show({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Erreur lors de la récupération de la recette',
                life: 3000
            });
        } finally {
            setLoadingRecipeForMet(null);
        }
    };

    if (loading && !vin) {
        return (
            <Layout>
                <VinLoadingScreen />
            </Layout>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-gradient-to-b from-[#8C2438] via-[#5A1020] to-[#3B0B15] font-['Work_Sans',sans-serif] text-red-300">
                Erreur: {error}
            </div>
        );
    }

    const getNoteDescription = (value) => {
        if (value === 0) return 'Non noté';
        if (value < 84) return 'Médiocre';
        if (value >= 84 && value <= 86) return 'Acceptable';
        if (value >= 87 && value <= 90) return 'Bon';
        if (value >= 91 && value <= 94) return 'Très bon';
        if (value >= 95 && value <= 99) return 'Excellent';
        if (value === 100) return 'Exceptionnel';
    };

    return (
        <Layout>
            <div className="bg-gradient-to-b from-[#8C2438] via-[#5A1020] to-[#3B0B15] min-h-screen font-['Work_Sans',sans-serif] text-white">
                {/* <Toast ref={toast} />*/}
                <div className="max-w-6xl mx-auto px-4 pt-6">
                    <MotionButton
                        whileHover={{ scale: 1.03, x: -2 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/25 text-sm text-white/90 hover:bg-white/20 hover:text-white shadow-[0_10px_25px_rgba(0,0,0,0.6)] transition-all duration-200"
                    >
                        <i className="pi pi-arrow-left text-xs" />
                        <span>Retour</span>
                    </MotionButton>
                </div>

                {vin && (
                    <div className="max-w-6xl mx-auto px-4 py-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Image */}
                            <MotionDiv
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                                className="flex justify-center items-center bg-gray-900/70 border border-white/10 rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.9)] p-6"
                            >
                                <img
                                    src={`data:image/jpeg;base64,${vin.base64_etiquettecomplet}`}
                                    alt="Cave"
                                    className="w-72 sm:w-80 md:w-96 h-[26rem] object-contain transition-transform duration-300 ease-out hover:scale-105 border border-white/20 rounded-2xl shadow-[0_18px_45px_rgba(0,0,0,0.85)] cursor-pointer bg-black/40"
                                />
                            </MotionDiv>

                            {/* Infos vin */}
                            <MotionDiv
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, ease: 'easeOut', delay: 0.05 }}
                                className="flex-auto p-6 bg-gray-900/70 border border-white/10 rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.9)]"
                            >
                                {/* Favori */}
                                <div className="relative flex justify-end mb-4">
                                    <MotionButton
                                        whileHover={{ scale: 1.1, rotate: vin.Coup_de_Coeur ? 0 : 5 }}
                                        whileTap={{ scale: 0.9 }}
                                        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                                        className={`w-11 h-11 rounded-xl border flex items-center justify-center shadow-[0_0_25px_rgba(0,0,0,0.7)] backdrop-blur-sm ${vin.Coup_de_Coeur
                                            ? 'bg-white/20 border-rose-400/70 text-rose-300 shadow-[0_0_30px_rgba(251,113,133,0.7)]'
                                            : 'bg-white/10 border-white/30 text-white/70 hover:bg-white/20 hover:text-white'
                                            }`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleFavori(vin, setVin, toast);
                                        }}
                                        title={vin.Coup_de_Coeur ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                                    >
                                        <svg
                                            className="w-6 h-6"
                                            fill={vin.Coup_de_Coeur ? 'currentColor' : 'none'}
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.5}
                                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                            />
                                        </svg>
                                    </MotionButton>
                                </div>

                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="Nom"
                                        value={vin.Nom || ''}
                                        onChange={handleInputChange}
                                        readOnly={!isEditing}
                                        className="w-full bg-transparent text-2xl font-semibold text-white border-b border-white/30 focus:outline-none focus:border-white focus:ring-0 pb-1"
                                    />
                                ) : (
                                    <h1 className="text-2xl font-semibold text-white mb-2">{vin.Nom}</h1>
                                )}

                                {isEditing ? (
                                    <div className="flex items-center gap-2 mt-1">
                                        <i className="pi pi-building text-white text-sm" />
                                        <input
                                            type="text"
                                            name="Domaine"
                                            value={vin.Domaine || ''}
                                            onChange={handleInputChange}
                                            readOnly={!isEditing}
                                            placeholder='Domaine'
                                            className="w-full bg-transparent border-b border-white/25 focus:outline-none focus:border-white text-sm text-white placeholder-white/40 py-1"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 mt-1">
                                        <i className="pi pi-building text-white text-sm" />
                                        <p className="text-sm font-medium text-white/80">
                                            Domaine : {vin.Domaine}
                                        </p>
                                    </div>
                                )}

                                <p className="text-xs text-white/60 mt-2 mb-6">
                                    {vin.Appellation} · {vin.Millesime} · {vin.Type}
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                                    {/* Pays */}
                                    <div className={`mb-3 ${!isEditing ? 'pb-1 border-b border-white/10' : ''}`}>
                                        <label
                                            className={`block text-xs font-semibold mb-1 ${isEditing ? 'text-white/70' : 'text-white/80'
                                                }`}
                                        >
                                            Pays :
                                        </label>
                                        {isEditing ? (
                                            <CreatableSelect
                                                styles={{
                                                    control: (baseStyles, state) => ({
                                                        ...baseStyles,
                                                        boxShadow: state.isFocused ? '0 0 0 1px rgba(255,255,255,0.35)' : 'none',
                                                        borderRadius: 10,
                                                        backgroundColor: 'rgba(15,23,42,0.8)',
                                                        color: 'white',
                                                        border: '1px solid rgba(255,255,255,0.2)',
                                                    }),
                                                    singleValue: (baseStyles) => ({
                                                        ...baseStyles,
                                                        color: 'white',
                                                    }),
                                                    menu: (baseStyles) => ({
                                                        ...baseStyles,
                                                        backgroundColor: '#020617',
                                                    }),
                                                    option: (baseStyles, state) => ({
                                                        ...baseStyles,
                                                        backgroundColor: state.isFocused ? 'rgba(148,163,184,0.25)' : 'transparent',
                                                        color: 'white',
                                                    }),
                                                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                                }}
                                                classNamePrefix="Pays"
                                                value={vin?.Pays ? { label: vin.Pays, value: vin.Pays } : null}
                                                isClearable={isClearable}
                                                isSearchable={isSearchable}
                                                name="Nom_Fr"
                                                placeholder="Pays"
                                                options={optionsPays}
                                                onChange={handleCountryChange}
                                                formatCreateLabel={(inputValue) => `Créer "${inputValue}"`}
                                            />
                                        ) : (
                                            <p className="text-sm text-white/70">{vin.Pays || '-'}</p>
                                        )}
                                    </div>

                                    {/* Région */}
                                    <div className={`mb-3 ${!isEditing ? 'pb-1 border-b border-white/10' : ''}`}>
                                        <label
                                            className={`block text-xs font-semibold mb-1 ${isEditing ? 'text-white/70' : 'text-white/80'
                                                }`}
                                        >
                                            Région :
                                        </label>
                                        {isEditing ? (
                                            <CreatableSelect
                                                styles={{
                                                    control: (baseStyles, state) => ({
                                                        ...baseStyles,
                                                        boxShadow: state.isFocused ? '0 0 0 1px rgba(255,255,255,0.35)' : 'none',
                                                        borderRadius: 10,
                                                        backgroundColor: 'rgba(15,23,42,0.8)',
                                                        color: 'white',
                                                        border: '1px solid rgba(255,255,255,0.2)',
                                                    }),
                                                    singleValue: (baseStyles) => ({
                                                        ...baseStyles,
                                                        color: 'white',
                                                    }),
                                                    menu: (baseStyles) => ({
                                                        ...baseStyles,
                                                        backgroundColor: '#020617',
                                                    }),
                                                    option: (baseStyles, state) => ({
                                                        ...baseStyles,
                                                        backgroundColor: state.isFocused ? 'rgba(148,163,184,0.25)' : 'transparent',
                                                        color: 'white',
                                                    }),
                                                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                                }}
                                                classNamePrefix="Région"
                                                value={vin?.Région ? { label: vin.Région, value: vin.Région } : null}
                                                isClearable={isClearable}
                                                isSearchable={isSearchable}
                                                name="Nom_Fr"
                                                placeholder="Région"
                                                options={filteredRegions}
                                                onChange={(selectedOption) => handleInputChange(selectedOption?.label || '', 'Région')}
                                                formatCreateLabel={(inputValue) => `Créer "${inputValue}"`}
                                            />
                                        ) : (
                                            <p className="text-sm text-white/70">{vin.Région || '-'}</p>
                                        )}
                                    </div>

                                    {/* Sous région */}
                                    <div className={`mb-3 ${!isEditing ? 'pb-1 border-b border-white/10' : ''}`}>
                                        <label
                                            className={`block text-xs font-semibold mb-1 ${isEditing ? 'text-white/70' : 'text-white/80'
                                                }`}
                                        >
                                            Sous région :
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="Sous_Region"
                                                value={vin.Sous_Region || ''}
                                                onChange={handleInputChange}
                                                className="w-full p-2 rounded-lg bg-gray-900/70 border border-white/20 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/60"
                                                placeholder="Sous région"
                                            />
                                        ) : (
                                            <p className="text-sm text-white/70">{vin.Sous_Region || '-'}</p>
                                        )}
                                    </div>

                                    {/* Appellation / Producteur / Millesime / Cépage / Alcool */}
                                    {[
                                        ['Appellation', vin.Appellation],
                                        ['Producteur', vin.Producteur],
                                        ['Millesime', vin.Millesime],
                                        ['Cépage', vin.Cepage],
                                        ['Alcool', vin.Alcool],
                                    ].map(([label, value], idx) => (
                                        <div key={idx} className={`mb-3 ${!isEditing ? 'pb-1 border-b border-white/10' : ''}`}>
                                            <label
                                                className={`block text-xs font-semibold mb-1 ${isEditing ? 'text-white/70' : 'text-white/80'
                                                    }`}
                                            >
                                                {label}
                                            </label>

                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    name={label}
                                                    value={value || ''}
                                                    onChange={handleInputChange}
                                                    className="w-full p-2 rounded-lg bg-gray-900/70 border border-white/20 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/60"
                                                />
                                            ) : (
                                                <p className="text-sm text-white/70">{value || '-'}</p>
                                            )}
                                        </div>
                                    ))}

                                    {/* Couleur */}
                                    <div className={`mb-3 ${!isEditing ? 'pb-1 border-b border-white/10' : ''}`}>
                                        <label
                                            className={`block text-xs font-semibold mb-1 ${isEditing ? 'text-white/70' : 'text-white/80'
                                                }`}
                                        >
                                            Couleur
                                        </label>
                                        {isEditing ? (
                                            <CreatableSelect
                                                classNamePrefix="Couleur"
                                                styles={{
                                                    control: (baseStyles, state) => ({
                                                        ...baseStyles,
                                                        boxShadow: state.isFocused ? '0 0 0 1px rgba(255,255,255,0.35)' : 'none',
                                                        borderRadius: 10,
                                                        backgroundColor: 'rgba(15,23,42,0.8)',
                                                        color: 'white',
                                                        border: '1px solid rgba(255,255,255,0.2)',
                                                    }),
                                                    singleValue: (baseStyles) => ({
                                                        ...baseStyles,
                                                        color: 'white',
                                                    }),
                                                    menu: (baseStyles) => ({
                                                        ...baseStyles,
                                                        backgroundColor: '#020617',
                                                    }),
                                                    option: (baseStyles, state) => ({
                                                        ...baseStyles,
                                                        backgroundColor: state.isFocused ? 'rgba(148,163,184,0.25)' : 'transparent',
                                                        color: 'white',
                                                    }),
                                                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                                }}
                                                value={vin?.Couleur ? { label: vin.Couleur, value: vin.Couleur } : null}
                                                isClearable={isClearable}
                                                isSearchable={isSearchable}
                                                placeholder="Couleur"
                                                options={optionCouleur}
                                                onChange={(selectedOption) => handleInputChange(selectedOption?.value || selectedOption?.label || '', 'Couleur')}
                                                formatCreateLabel={(inputValue) => `Créer "${inputValue}"`}
                                            />
                                        ) : (
                                            <p className="text-sm text-white/70">{vin.Couleur || '-'}</p>
                                        )}
                                    </div>

                                    {/* Type */}
                                    <div className={`mb-3 ${!isEditing ? 'pb-1 border-b border-white/10' : ''}`}>
                                        <label
                                            className={`block text-xs font-semibold mb-1 ${isEditing ? 'text-white/70' : 'text-white/80'
                                                }`}
                                        >
                                            Type
                                        </label>
                                        {isEditing ? (
                                            <CreatableSelect
                                                classNamePrefix="Type"
                                                styles={{
                                                    control: (baseStyles, state) => ({
                                                        ...baseStyles,
                                                        boxShadow: state.isFocused ? '0 0 0 1px rgba(255,255,255,0.35)' : 'none',
                                                        borderRadius: 10,
                                                        backgroundColor: 'rgba(15,23,42,0.8)',
                                                        color: 'white',
                                                        border: '1px solid rgba(255,255,255,0.2)',
                                                    }),
                                                    singleValue: (baseStyles) => ({
                                                        ...baseStyles,
                                                        color: 'white',
                                                    }),
                                                    menu: (baseStyles) => ({
                                                        ...baseStyles,
                                                        backgroundColor: '#020617',
                                                    }),
                                                    option: (baseStyles, state) => ({
                                                        ...baseStyles,
                                                        backgroundColor: state.isFocused ? 'rgba(148,163,184,0.25)' : 'transparent',
                                                        color: 'white',
                                                    }),
                                                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                                }}
                                                value={vin?.Type ? { label: vin.Type, value: vin.Type } : null}
                                                isClearable={isClearable}
                                                isSearchable={isSearchable}
                                                placeholder="Type"
                                                options={optionTypeVin}
                                                onChange={(selectedOption) => handleInputChange(selectedOption?.value || selectedOption?.label || '', 'Type')}
                                                formatCreateLabel={(inputValue) => `Créer "${inputValue}"`}
                                            />
                                        ) : (
                                            <p className="text-sm text-white/70">{vin.Type || '-'}</p>
                                        )}
                                    </div>

                                    {/* Valeur */}
                                    <div className={`mb-3 ${!isEditing ? 'pb-1 border-b border-white/10' : ''}`}>
                                        <label
                                            className={`block text-xs font-semibold mb-1 ${isEditing ? 'text-white/70' : 'text-white/80'
                                                }`}
                                        >
                                            Valeur (€)
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                name="Valeur"
                                                value={vin.Valeur || ''}
                                                onChange={handleInputChange}
                                                className="w-full p-2 rounded-lg bg-gray-900/70 border border-white/20 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/60"
                                            />
                                        ) : (
                                            <p className="text-sm text-white/70">
                                                {vin.Valeur?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) || '-'}
                                            </p>
                                        )}
                                    </div>

                                    {/* Cave */}
                                    <div className={`mb-3 ${!isEditing ? 'pb-1 border-b border-white/10' : ''}`}>
                                        <label
                                            className={`block text-xs font-semibold mb-1 ${isEditing ? 'text-white/70' : 'text-white/80'
                                                }`}
                                        >
                                            Cave
                                        </label>
                                        {isEditing ? (
                                            <div className="flex items-center gap-2 w-full">
                                                <Select
                                                    classNamePrefix="Cave"
                                                    styles={{
                                                        control: (baseStyles, state) => ({
                                                            ...baseStyles,
                                                            boxShadow: state.isFocused ? '0 0 0 1px rgba(255,255,255,0.35)' : 'none',
                                                            borderRadius: 10,
                                                            backgroundColor: 'rgba(15,23,42,0.8)',
                                                            color: 'white',
                                                            border: '1px solid rgba(255,255,255,0.2)',
                                                        }),
                                                        singleValue: (baseStyles) => ({
                                                            ...baseStyles,
                                                            color: 'white',
                                                        }),
                                                        menu: (baseStyles) => ({
                                                            ...baseStyles,
                                                            backgroundColor: '#020617',
                                                        }),
                                                        option: (baseStyles, state) => ({
                                                            ...baseStyles,
                                                            backgroundColor: state.isFocused ? 'rgba(148,163,184,0.25)' : 'transparent',
                                                            color: 'white',
                                                        }),
                                                    }}
                                                    value={distinctCaves.find((option) => option.value === vin?.Cave) || null}
                                                    isClearable={isClearable}
                                                    isSearchable={isSearchable}
                                                    name="Cave"
                                                    placeholder="Cave"
                                                    options={distinctCaves}
                                                    onChange={(selectedOption) => handleInputChange(selectedOption?.value || '', 'Cave')}
                                                />
                                            </div>
                                        ) : (
                                            <p className="text-sm text-white/70">{vin.Cave || '-'}</p>
                                        )}
                                    </div>

                                    {/* Lieu stockage */}
                                    <div className={`mb-3 ${!isEditing ? 'pb-1 border-b border-white/10' : ''}`}>
                                        <label
                                            className={`block text-xs font-semibold mb-1 ${isEditing ? 'text-white/70' : 'text-white/80'
                                                }`}
                                        >
                                            Lieu de stockage
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="Etagere"
                                                value={vin.Etagere || ''}
                                                onChange={handleInputChange}
                                                className="w-full p-2 rounded-lg bg-gray-900/70 border border-white/20 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/60"
                                                placeholder="Étagère"
                                            />
                                        ) : (
                                            <p className="text-sm text-white/70">{vin.Etagere || '-'}</p>
                                        )}
                                    </div>

                                    {/* Note */}
                                    <div className={`mb-3 ${!isEditing ? 'pb-1 border-b border-white/10' : ''}`}>
                                        <label
                                            className={`block text-sm font-semibold mb-1 ${isEditing ? 'text-white/70' : 'text-white/80'
                                                }`}
                                        >
                                            Note
                                        </label>

                                        {isEditing ? (
                                            <>
                                                <div className="flex items-center gap-4">
                                                    <FancyNoteSlider
                                                        min={84}
                                                        max={100}
                                                        value={Math.max(Number(vin?.Note_sur_20 ?? 84), 84)}
                                                        onChange={(val) =>
                                                            setVin((prev) => ({
                                                                ...prev,
                                                                Note_sur_20: val,
                                                            }))
                                                        }
                                                    />

                                                    <span className="text-lg font-semibold w-16 text-center">
                                                        {vin?.Note_sur_20}/100
                                                    </span>
                                                </div>

                                                <div className="text-xs text-white/60 mt-1 italic">
                                                    {getNoteDescription(vin?.Note_sur_20)}
                                                </div>
                                            </>
                                        ) : (
                                            <p className="text-sm text-white/70">
                                                {vin?.Note_sur_20 || '-'} / 100 ({getNoteDescription(vin?.Note_sur_20)})
                                            </p>
                                        )}
                                    </div>

                                    {/* Associations vin */}
                                    {(associationsMets.length > 0 || associationMetsList.length > 0) && (
                                        <div className={`mb-3 ${!isEditing ? 'pb-1 border-b border-white/10' : ''}`}>
                                            <label
                                                className={`block text-sm font-semibold mb-1 ${isEditing ? 'text-white/70' : 'text-white/80'
                                                    }`}
                                            >
                                                Association vin :
                                            </label>

                                            {isEditing ? (
                                                <>
                                                    {associationsMets.length > 0 && (
                                                        <div className="mb-2">
                                                            <div className="flex flex-wrap gap-1">
                                                                {associationsMets.map((met, index) => (
                                                                    <span
                                                                        key={index}
                                                                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-900/40 text-green-200 border border-green-500/40"
                                                                    >
                                                                        {met.nomMet}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div>
                                                    {associationsMets.length > 0 && (
                                                        <div className="mb-2">
                                                            <div className="flex flex-wrap gap-1">
                                                                {associationsMets.map((met, index) => (
                                                                    <button
                                                                        key={index}
                                                                        onClick={() => handleMetClick(met)}
                                                                        disabled={loadingRecipeForMet === met.nomMet}
                                                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs border transition-colors cursor-pointer ${loadingRecipeForMet === met.nomMet
                                                                            ? 'bg-white/10 text-white border-white/30'
                                                                            : 'bg-green-900/40 text-green-200 border-green-500/40 hover:bg-green-700/50'
                                                                            }`}
                                                                    >
                                                                        {loadingRecipeForMet === met.nomMet ? (
                                                                            <>
                                                                                <div className="animate-spin rounded-full h-3 w-3 border border-green-400 border-t-transparent mr-1"></div>
                                                                                Chargement...
                                                                            </>
                                                                        ) : (
                                                                            met.nomMet
                                                                        )}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Remarques */}
                                    <textarea
                                        value={vin.Remarques}
                                        name="Remarques"
                                        disabled={!isEditing}
                                        rows={4}
                                        className="mb-4 w-full p-3 rounded-xl bg-gray-900/70 border border-white/20 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/60 col-span-1 md:col-span-2"
                                        placeholder="Description..."
                                        onChange={handleInputChange}
                                    />

                                    {/* Quantité */}
                                    <div className="flex items-center border border-white/25 rounded-xl px-4 py-2 w-fit select-none bg-white/5">
                                        <button
                                            onClick={() => {
                                                const newQte = Math.max((vin.Qte || 0) - 1, 0);
                                                handleInputChange(newQte, 'Qte');
                                            }}
                                            disabled={!isEditing}
                                            className="text-xl font-light px-2 hover:text-white disabled:text-white/30"
                                        >
                                            −
                                        </button>
                                        <input
                                            type="number"
                                            min="0"
                                            value={vin.Qte || 0}
                                            onChange={(e) => {
                                                const newQte = Math.max(parseInt(e.target.value || '0', 10), 0);
                                                isEditing && handleInputChange(newQte, 'Qte');
                                            }}
                                            readOnly={!isEditing}
                                            className="no-spinner mx-4 w-12 text-center bg-transparent text-md font-medium text-white focus:outline-none"
                                        />
                                        <button
                                            onClick={() => {
                                                const newQte = (vin.Qte || 0) + 1;
                                                handleInputChange(newQte, 'Qte');
                                            }}
                                            disabled={!isEditing}
                                            className="text-xl font-light px-2 hover:text-white disabled:text-white/30"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Boutons actions */}
                                <div className="mt-6 flex justify-end space-x-4">
                                    {isEditing ? (
                                        <>
                                            <MotionButton
                                                whileHover={{ scale: 1.03, y: -1 }}
                                                whileTap={{ scale: 0.96 }}
                                                onClick={confirmDelete}
                                                className="px-6 py-2 rounded-xl bg-red-600/90 text-white text-sm font-semibold hover:bg-red-500 shadow-[0_12px_30px_rgba(220,38,38,0.6)] transition-all duration-200"
                                            >
                                                Supprimer
                                            </MotionButton>
                                            <MotionButton
                                                whileHover={{ scale: 1.03, y: -1 }}
                                                whileTap={{ scale: 0.96 }}
                                                onClick={handleSave}
                                                className="px-6 py-2 rounded-xl bg-white/20 text-white text-sm font-semibold border border-white/30 hover:bg-white/30 shadow-[0_12px_30px_rgba(0,0,0,0.8)] transition-all duration-200"
                                            >
                                                Enregistrer
                                            </MotionButton>
                                            <button
                                                onClick={handleCancel}
                                                className="px-6 py-2 rounded-xl border border-white/25 text-white/80 text-sm hover:bg-white/10 transition-all duration-200"
                                            >
                                                Annuler
                                            </button>
                                        </>
                                    ) : (
                                        <MotionButton
                                            whileHover={{ scale: 1.03, y: -1 }}
                                            whileTap={{ scale: 0.96 }}
                                            onClick={() => {
                                                setIsEditing(true);

                                                if (!lesPays || lesPays.length === 0) {
                                                    fetchLesPays();
                                                }
                                                if (!regions || regions.length === 0) {
                                                    fetchRegions();
                                                }
                                            }}
                                            className="px-6 py-2 rounded-xl bg-white/20 text-white text-sm font-semibold border border-white/30 hover:bg-white/30 shadow-[0_12px_30px_rgba(0,0,0,0.8)] transition-all duration-200"
                                        >
                                            Modifier
                                        </MotionButton>
                                    )}
                                </div>

                                {/* Dialog suppression – même style que la liste */}
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
            bg-slate-950/95 border border-red-500/50
            shadow-[0_22px_55px_rgba(0,0,0,0.9)]
            transition-all duration-200
            font-['Work_Sans',sans-serif]
        "
                                    >
                                        {/* Glows rouges décoratifs */}
                                        <div className="pointer-events-none absolute -top-16 -right-10 w-40 h-40 rounded-full bg-red-500/35 blur-3xl" />
                                        <div className="pointer-events-none absolute -bottom-20 -left-10 w-40 h-40 rounded-full bg-rose-500/25 blur-3xl" />

                                        {/* Contenu principal */}
                                        <div className="relative z-10 px-5 pt-5 pb-4">
                                            <div className="flex items-start gap-4">
                                                {/* Icône corbeille rouge (sans animation) */}
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

                                                {/* Texte */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-base md:text-lg font-semibold text-white mb-1">
                                                        Supprimer ce vin ?
                                                    </h3>
                                                    <p className="text-xs md:text-sm text-white/70 leading-snug">
                                                        Cette action est <span className="font-semibold text-red-300">irréversible</span>.
                                                        Le vin sera définitivement retiré de votre cave.
                                                    </p>

                                                    {/* Récap du vin courant */}
                                                    {vin && (
                                                        <div className="
                            mt-3 px-3 py-2 rounded-xl
                            bg-white/5 border border-white/10
                            text-xs md:text-sm text-white/80
                            flex flex-col gap-0.5
                        ">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <span className="font-semibold truncate">
                                                                    {vin.Nom || 'Vin sans nom'}
                                                                </span>
                                                                {vin.Millesime && (
                                                                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-white/80">
                                                                        {vin.Millesime}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="text-[11px] text-white/60 truncate">
                                                                {[vin.Appellation, vin.Région, vin.Pays]
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
                                                onClick={handleDelete}
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

                            </MotionDiv>
                        </div>

                        {/* Onglets vin */}
                        <div className="mt-8">
                            <div className="rounded-3xl bg-gray-900/70 border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.95)] overflow-hidden">
                                <VinTabs
                                    vin={vin}
                                    setVin={setVin}
                                    isEditing={isEditing}
                                    handleInputChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <Dialog
                            visible={showAddCaveDialog}
                            onHide={() => setShowAddCaveDialog(false)}
                            header="Ajouter une nouvelle cave"
                            footer={addCaveDialogFooter}
                            className="max-w-md"
                        >
                            <input
                                type="text"
                                value={newCaveName}
                                onChange={(e) => setNewCaveName(e.target.value)}
                                placeholder="Nom de la cave"
                                className="w-full p-2 rounded-lg bg-gray-900/70 border border-white/25 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/60"
                            />
                        </Dialog>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Vin;
