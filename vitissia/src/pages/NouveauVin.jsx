import React, { useEffect, useState, useRef, useMemo, useContext } from 'react';
import { Toast } from 'primereact/toast';
import { useNavigate } from 'react-router-dom';
import authHeader from '../config/authHeader';
import config from '../config/config';
import useFetchPays from '../hooks/useFetchPays';
import useFetchRegions from '../hooks/useFetchRegions';
import useFetchEnums from '../hooks/useFetchEnums';
import imageCompression from "browser-image-compression";
import { ThemeContext } from '../context/ThemeContext';
import NouveauVinEtape1 from '../components/NouveauVinEtape1';
import NouveauVinEtape2 from '../components/NouveauVinEtape2';
import { Dialog } from 'primereact/dialog';
import LoginRequiredModal from '../components/LoginRequiredModal';
import CreatableSelect from 'react-select/creatable';
import { convertToJpegSameSize } from '../utils/imageUtils';
import { motion, AnimatePresence } from 'framer-motion';

const NouveauVinLoadingScreen = () => {
    const fakeInputs = Array.from({ length: 6 });

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-10 font-['Work_Sans',sans-serif]">
            <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="
                    relative w-full max-w-5xl
                    rounded-3xl
                    bg-black/40 border border-white/12
                    shadow-[0_32px_90px_rgba(0,0,0,0.95)]
                    overflow-hidden backdrop-blur-2xl
                "
            >
                {/* Glows de fond */}
                <div className="pointer-events-none absolute -top-32 -left-20 w-64 h-64 rounded-full bg-[#f97373]/22 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-28 -right-16 w-72 h-72 rounded-full bg-[#7f0b21]/28 blur-3xl" />
                <div className="pointer-events-none absolute top-1/3 -right-8 w-40 h-40 rounded-full bg-[#22c55e]/14 blur-3xl" />

                <div className="relative grid md:grid-cols-[1.2fr,1fr] gap-8 p-6 md:p-8">
                    {/* Colonne gauche : texte / étapes */}
                    <div className="flex flex-col justify-between gap-6">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/15 shadow-sm shadow-black/40">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                <span className="text-[11px] tracking-[0.18em] uppercase text-emerald-100/90">
                                    Assistant d’ajout de vin
                                </span>
                            </div>

                            <div>
                                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                                    Ouverture de l’étape 1
                                </h1>
                                <p className="mt-2 text-sm md:text-[15px] text-red-100/85 max-w-xl">
                                    Nous préparons l’écran où vous pourrez choisir entre
                                    ajouter votre vin manuellement ou utiliser notre IA
                                    à partir d’une photo d’étiquette.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3 mt-2">
                            {[
                                'Initialisation de l’écran d’ajout (étape 1)',
                                'Chargement des options nécessaires (pays, régions, couleurs…)',
                                'Mise en place de l’analyse IA par photo',
                            ].map((label, index) => (
                                <motion.div
                                    key={label}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.15 * index, duration: 0.3 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="relative">
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/90 block" />
                                        <span className="absolute inset-0 rounded-full bg-emerald-400/40 blur-[6px] animate-ping" />
                                    </div>
                                    <p className="text-xs md:text-sm text-red-100/80">
                                        {label}
                                    </p>
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-2 space-y-2">
                            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                                <motion.div
                                    initial={{ x: '-60%' }}
                                    animate={{ x: ['-60%', '110%'] }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 1.8,
                                        ease: 'easeInOut',
                                    }}
                                    className="h-full w-1/2 bg-gradient-to-r from-[#ffe3ea] via-white to-[#ff8ba1] opacity-90"
                                />
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-red-100/75">
                                <span>Préparation de l’assistant d’ajout…</span>
                                <span className="hidden sm:inline">
                                    L’étape 1 va apparaître dans un instant.
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Colonne droite : skeleton "formulaire" */}
                    <div className="flex flex-col gap-4 md:gap-5">
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, ease: 'easeOut', delay: 0.1 }}
                            className="rounded-2xl bg-slate-950/70 border border-white/10 shadow-[0_22px_55px_rgba(0,0,0,0.9)] p-4 space-y-3"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-3.5 w-1/2 rounded-full bg-white/12 animate-pulse" />
                                <div className="ml-auto h-3 w-16 rounded-full bg-white/8 animate-pulse" />
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-1">
                                {fakeInputs.map((_, idx) => (
                                    <div key={idx} className="space-y-1.5">
                                        <div className="h-2 w-16 rounded-full bg-white/12" />
                                        <div className="h-7 rounded-xl bg-white/6 border border-white/10 animate-pulse" />
                                    </div>
                                ))}
                            </div>

                            <div className="pt-1 flex items-center justify-between">
                                <div className="h-3 w-24 rounded-full bg-white/10 animate-pulse" />
                                <div className="h-8 w-28 rounded-xl bg-white/12 animate-pulse" />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const NouveauVin = () => {
    const [vin, setVin] = useState({});
    const [initialVin, setInitialVin] = useState(null);
    const [distinctCaves, setDistinctCaves] = useState([]);
    const [showAddCaveDialog, setShowAddCaveDialog] = useState(false);
    const [newCaveName, setNewCaveName] = useState("");
    const navigate = useNavigate();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const UUIDuser = sessionStorage.getItem('uuid_user');
    const toast = useRef(null);
    const [errorRegion, setErrorRegion] = useState("");
    const [errorCouleur, setErrorCouleur] = useState("");
    const [currentStep, setCurrentStep] = useState(1);
    const [showPlacementDialog, setShowPlacementDialog] = useState(false);
    const [placementMode, setPlacementMode] = useState(null); 
    const [tempCaveOption, setTempCaveOption] = useState(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const DEBUG_ALWAYS_LOADING = true; 

    const caveOptionsNoDegustation = useMemo(() =>
        distinctCaves.filter(c => {
            const s = (c.label || c.value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
            return s !== 'degustation';
        })
        , [distinctCaves]);

    const shouldAnalyze = useRef(false);
    const { darkMode } = useContext(ThemeContext);

    useEffect(() => {
        fetch(`${config.apiBaseUrl}/4DACTION/react_createCave`)
            .then(response => response.json())
            .then(data => {
                const targetName = 'Cave principale';
                const storedCavesRaw = JSON.parse(localStorage.getItem("distinctCaves")) || [];
                let updatedStored = storedCavesRaw;
                if (!storedCavesRaw.some(c => (c || '').toLowerCase() === targetName.toLowerCase())) {
                    updatedStored = [targetName, ...storedCavesRaw];
                    localStorage.setItem('distinctCaves', JSON.stringify(updatedStored));
                }
                const cavesFormatted = updatedStored.map(c => ({ label: c, value: c }));
                setDistinctCaves(cavesFormatted);
                setVin({
                    ...data,
                    Flacon: data.Flacon || 'Bouteille 75 cl',
                    Qte: 1,
                    Reste_en_Cave: 1,
                    Cave: data.Cave && data.Cave.trim() !== '' ? data.Cave : targetName
                });
                setInitialVin(data);
            })
            .catch(error => console.error('Erreur lors de la récupération du modèle:', error))
        // Charger les valeurs distinctes des caves
        console.log("caves distinctes :", distinctCaves);
        const storedCaves = JSON.parse(localStorage.getItem("distinctCaves")) || [];
        const cavesFormatted = storedCaves.map(c => ({ label: c, value: c }));
        setDistinctCaves(cavesFormatted);
    }, []);


    const handleCaveChange = (value) => {
        setVin((prevVin) => ({
            ...prevVin,
            Cave: value, // Mettre à jour la cave sélectionnée
        }));
    };

    const { lesPays, fetchLesPays } = useFetchPays();

    const { regions, fetchRegions, ajouterRegionIA } = useFetchRegions();


    useEffect(() => {
        if (!lesPays || lesPays.length === 0) {
            fetchLesPays(); // Appeler uniquement si lesPays est vide
        }
    }, [lesPays, fetchLesPays]);

    useEffect(() => {
        if (!regions || regions.length === 0) {
            fetchRegions(); // Appeler uniquement si regions est vide
        }

    }, [regions, fetchRegions]);


    const { enums, error, loading, fetchEnums } = useFetchEnums();
    useEffect(() => {
        fetchEnums(); // Appeler fetchEnums au montage du composant
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

    const defaultCountry = "" //optionsPays.find((pays) => pays.label === "France");
    const defaultCountryValue = vin?.Pays
        ? optionsPays.find((pays) => pays.label === vin.Pays) // Trouver l'option correspondant à vin.Pays
        : defaultCountry;
    const defaultRegion = ""//optionsRegions.find((region) => region.label === "Bourgogne");
    const defaultRegionValue = vin?.Région
        ? optionsRegions.find((region) => region.label === vin.Région)
        : defaultRegion;

    const [isClearable, setIsClearable] = useState(true);
    const [isSearchable, setIsSearchable] = useState(true);

    const optionCouleur = [
        { label: 'Rouge', value: 'Rouge' },
        { label: 'Blanc', value: 'Blanc' },
        { label: 'Rosé', value: 'Rosé' },
    ]

    const handleCountryChange = (selectedOption) => {
        const selectedCountry = selectedOption?.value || ''; // Récupérer la valeur du pays sélectionné
        handleInputChange(selectedOption?.label || '', 'Pays'); // Mettre à jour le pays dans l'état `vin`

        // Filtrer les régions en fonction du pays sélectionné (seulement si c'est un pays des options)
        const matchingCountryOption = optionsPays.find(pays => pays.label === selectedOption?.label);
        if (matchingCountryOption) {
            const newFilteredRegions = optionsRegions.filter(
                (region) => region.value === matchingCountryOption.value
            );
            setFilteredRegions(newFilteredRegions);
        } else {
            // Si c'est un pays personnalisé, afficher toutes les régions
            setFilteredRegions(optionsRegions);
        }
    };

    useEffect(() => {
        if (vin?.Pays) {
            const selectedCountry = optionsPays.find((pays) => pays.label === vin.Pays)?.value || '';
            const newFilteredRegions = optionsRegions.filter(
                (region) => region.value === selectedCountry
            );
            // Ne mettez à jour que si les régions filtrées sont différentes
            if (JSON.stringify(filteredRegions) !== JSON.stringify(newFilteredRegions)) {
                setFilteredRegions(newFilteredRegions);
            }
        }
    }, [vin, optionsPays, optionsRegions, filteredRegions]);

    const handleInputChange = (e, customName) => {
        if (customName) {
            if (customName === 'Note_sur_100') {
                console.debug('[NOTE] set Note_sur_100 =', e, 'type=', typeof e);
            }
            setVin((prevVin) => {
                const updatedVin = { ...prevVin, [customName]: e };
                if (customName === "Valeur" || customName === "Reste_en_Cave" || customName === "Dont_Bue" || customName === "Qte") {
                    updatedVin.Reste_en_Cave = (updatedVin.Qte || 0) - (updatedVin.Dont_Bue || 0);
                    updatedVin.valeurCave = (updatedVin.Reste_en_Cave || 0) * (updatedVin.Valeur || 0);
                }
                return updatedVin;
            });
        } else if (e?.target) {
            const { name, value } = e.target;
            if (name === 'Note_sur_100') {
                console.debug('[NOTE] set Note_sur_100 =', value, 'type=', typeof value);
            }
            setVin((prevVin) => {
                const updatedVin = { ...prevVin, [name]: value };
                if (name === "Valeur" || name === "Reste_en_Cave" || name === "Dont_Bue" || name === "Qte") {
                    updatedVin.Reste_en_Cave = (updatedVin.Qte || 0) - (updatedVin.Dont_Bue || 0);
                    updatedVin.valeurCave = (updatedVin.Reste_en_Cave || 0) * (updatedVin.Valeur || 0);
                }
                return updatedVin;
            });
        } else if (e?.name) {
            if (e.name === 'Note_sur_100') {
                console.debug('[NOTE] set Note_sur_100 =', e.value, 'type=', typeof e.value);
            }
            setVin((prevVin) => {
                const updatedVin = { ...prevVin, [e.name]: e.value };
                if (e.name === "Valeur" || e.name === "Reste_en_Cave" || e.name === "Dont_Bue" || e.name === "Qte") {
                    updatedVin.Reste_en_Cave = (updatedVin.Qte || 0) - (updatedVin.Dont_Bue || 0);
                    updatedVin.valeurCave = (updatedVin.Reste_en_Cave || 0) * (updatedVin.Valeur || 0);
                }
                return updatedVin;
            });
        }
    };
    const getModifiedFields = () => {
        const modifiedFields = {};

        Object.keys(vin).forEach((key) => {
            if (vin[key] !== initialVin[key]) {
                modifiedFields[key] = vin[key];
            }
        });

        return modifiedFields;
    };
    const handleSave = async () => {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                setShowLoginModal(true);
                return;
            }
            const modifiedVin = getModifiedFields();

            if (modifiedVin.Note_sur_100 !== undefined) {
                modifiedVin.Note_sur_20 = Number(modifiedVin.Note_sur_100);
            }
            const modifiedVinJson = JSON.stringify(modifiedVin);

            console.group('[SAVE] Payload envoyé à 4D');
            console.table(modifiedVin); // lisible
            console.log('Note_sur_100 =', modifiedVin.Note_sur_100, 'type=', typeof modifiedVin.Note_sur_100);
            console.groupEnd();


            const formData = new FormData();
            formData.append("champsModif", modifiedVinJson);
            formData.append("action", "creation");
            formData.append("UUIDuser", UUIDuser);
            // Ajouter le token pour 4D en paramètre supplémentaire
            formData.append('token', token);
            const response = await fetch(`${config.apiBaseUrl}/4DACTION/react_putCave`, {
                method: 'PUT',  // ou 'PATCH' selon l'API
                headers: authHeader(),
                body: formData,
            });
            if (!response.ok) {
                throw new Error('Erreur lors de la sauvegarde');
            }
            const updatedCave = await response.json();
            toast.current.show({ severity: 'success', summary: 'Succès', detail: 'Modifications enregistrées.', life: 3000 });
            setVin(updatedCave);
            setInitialVin(updatedCave);
            navigate(`/vin/${updatedCave.UUID_}`);
        } catch (error) {
            toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'Erreur lors de sauvegarde', life: 3000 });
        }
    };

    const customBase64Uploader = async (event) => {
        const file = event.files[0];
        if (!file) return;

        try {
            // 1. D'abord, on force le JPEG si besoin (sans changer la taille en pixels)
            let workingFile = file;

            if (file.type !== 'image/jpeg') {
                // même si l'image est petite → on la convertit en JPEG
                workingFile = await convertToJpegSameSize(file, 0.95);
            }

            // 2. On calcule la taille APRÈS conversion éventuelle
            let sizeMB = workingFile.size / 1024 / 1024;

            if (sizeMB <= 0.256) {
                // Fichier assez petit → on NE recompresse pas,
                // on lit juste le JPEG tel quel
                const reader = new FileReader();
                reader.readAsDataURL(workingFile);
                reader.onload = () => {
                    const base64String = reader.result.split(',')[1];
                    setVin((prevVin) => ({
                        ...prevVin,
                        base64_etiquette: base64String,
                        // optionnel mais propre :
                        mimeType_etiquette: 'image/jpeg',
                    }));
                    shouldAnalyze.current = true;
                };
            } else {
                // Fichier trop volumineux → on passe par browser-image-compression
                const options = {
                    maxSizeMB: 0.256,
                    maxWidthOrHeight: 1024,
                    useWebWorker: true,
                    fileType: 'image/jpeg',
                };

                const compressedFile = await imageCompression(workingFile, options);

                const reader = new FileReader();
                reader.readAsDataURL(compressedFile);
                reader.onload = () => {
                    const base64String = reader.result.split(',')[1];
                    setVin((prevVin) => ({
                        ...prevVin,
                        base64_etiquette: base64String,
                        mimeType_etiquette: 'image/jpeg',
                    }));
                    shouldAnalyze.current = true;
                };
            }
        } catch (error) {
            console.error('Erreur lors du traitement de l\'image :', error);
        }
    };
    //test isAnalyzing
    useEffect(() => {
        if (vin?.base64_etiquette && shouldAnalyze.current) {
            AnalyseIA(); // Appeler AnalyseIA uniquement si le drapeau est activé
            shouldAnalyze.current = false; // Réinitialiser le drapeau après l'appel
        }
    }, [vin?.base64_etiquette]);

    const customBase64UploaderSansIA = async (event) => {
        const file = event.files[0];
        if (!file) return;

        try {
            let workingFile = file;

            if (file.type !== 'image/jpeg') {
                workingFile = await convertToJpegSameSize(file, 0.95);
            }

            let sizeMB = workingFile.size / 1024 / 1024;

            if (sizeMB <= 0.256) {
                const reader = new FileReader();
                reader.readAsDataURL(workingFile);
                reader.onload = () => {
                    const base64String = reader.result.split(',')[1];
                    setVin((prevVin) => ({
                        ...prevVin,
                        base64_etiquette: base64String,
                        mimeType_etiquette: 'image/jpeg',
                    }));
                };
            } else {
                const options = {
                    maxSizeMB: 0.256,
                    maxWidthOrHeight: 1024,
                    useWebWorker: true,
                    fileType: 'image/jpeg',
                };
                const compressedFile = await imageCompression(workingFile, options);

                const reader = new FileReader();
                reader.readAsDataURL(compressedFile);
                reader.onload = () => {
                    const base64String = reader.result.split(',')[1];
                    setVin((prevVin) => ({
                        ...prevVin,
                        base64_etiquette: base64String,
                        mimeType_etiquette: 'image/jpeg',
                    }));
                };
            }
        } catch (error) {
            console.error('Erreur lors du traitement de l\'image :', error);
        }
    };


    const handleRegionValidation = async (regionIA, paysIA) => {
        const regionTrouvee = optionsRegions.find((region) =>
            region.label.toLowerCase().includes(regionIA.toLowerCase())
        );

        if (!regionTrouvee) {
            try {
                const newRegion = await ajouterRegionIA(paysIA, regionIA);
                toast.current.show({
                    severity: 'success',
                    summary: 'Succès',
                    detail: `Région "${regionIA}" ajoutée avec succès.`,
                    life: 3000,
                });
                await fetchRegions(); // Recharger les régions après l'ajout
                toast.current.show({
                    severity: 'success',
                    summary: 'Succès',
                    detail: `Région "${regionIA}" ajoutée avec succès.`,
                    life: 3000,
                });

                await fetchRegions(); // Recharger les régions après l'ajout

                // Recalculer les optionsRegions après fetchRegions
                const updatedOptionsRegions = regions.map((region) => ({
                    label: region.Nom_Fr,
                    value: region.Ref_Pays,
                }));

                // Rechercher la région ajoutée dans les options mises à jour
                const updatedRegion = updatedOptionsRegions.find((region) =>
                    region.label.toLowerCase().includes(regionIA.toLowerCase())
                );

                if (updatedRegion) {
                    setFilteredRegions([updatedRegion]); // Mettre à jour les régions filtrées
                    setErrorRegion(""); // Réinitialiser l'erreur
                }
            } catch (error) {
                toast.current.show({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: `Impossible d'ajouter la région "${regionIA}".`,
                    life: 3000,
                });
            }
        }
    };

    const traiterAnalyseIA = (jsonAtraite) => {
        // Liste des clés à ne PAS inclure dans Remarque
        //console.log("jsonAtraite", jsonAtraite);
        const keysExclues = [
            "nom", "region", "pays", "appellation", "millesime", "type_de_vin",
            "APOGEE", "taux_d_alcool", "prix_moyen", "cepages"
        ];

        const remarques = Object.entries(jsonAtraite)
            .filter(([key]) => !keysExclues.includes(key)) // Exclure les champs déjà utilisés
            .map(([key, value]) => {
                if (key === "producteur") {
                    return `producteur : ${jsonAtraite.domaine || "NC"}`;
                }
                return `${key.replace(/_/g, " ")} : ${value}`;
            })
            .join(", "); // Joindre en une seule chaîne



        const updatedRemarques = remarques
            .replace(/région/g, "Région")
            .replace(/null/g, "NC")
            .replace(/cépages/g, "cépage(s)");

        const regionIA = jsonAtraite.région || jsonAtraite.region || ""; // Récupérer la région de l'analyse IA
        const paysIA = jsonAtraite.pays || ""; // Récupérer le pays de l'analyse IA

        // Normaliser certaines régions spécifiques
        const regionNormalisee = regionIA === "Bordeaux" ? "Bordelais" : regionIA;

        handleRegionValidation(regionNormalisee, paysIA); // Valider ou ajouter la région

        const regionTrouvee = optionsRegions.find((region) =>
            region.label.toLowerCase().includes(regionNormalisee.toLowerCase()) // Recherche insensible à la casse
        );
        if (regionTrouvee) {
            setFilteredRegions([regionTrouvee]);
            setErrorRegion(""); // Réinitialiser l'erreur
        } else {
            setErrorRegion(`Région non trouvée : ${regionNormalisee}`);
            // Même si la région n'est pas trouvée, on l'affecte quand même
        }

        // Recherche de la couleur correspondante
        const couleurIA = jsonAtraite.couleur || ""; // Récupérer la couleur de l'analyse IA
        const couleurTrouvee = optionCouleur.find((couleur) =>
            couleur.label.toLowerCase() === couleurIA.toLowerCase() // Recherche exacte insensible à la casse
        );
        //console.log("couleurTrouvee", couleurTrouvee);
        if (couleurTrouvee) {
            setErrorCouleur(""); // Réinitialiser l'erreur
        } else {
            setErrorCouleur(`Couleur non trouvée : ${couleurIA}`);
        }

        const typeIA = jsonAtraite.type_de_vin || jsonAtraite.type || "";
        const typeTrouve = typeIA.toLowerCase() === "vin tranquille"
            ? optionTypeVin.find((option) => option.label.toLowerCase() === "tranquille")
            : optionTypeVin.find((option) => option.label.toLowerCase() === typeIA.toLowerCase());
        console.log("jsonAtraite", jsonAtraite);
        setVin((prevVin) => ({
            ...prevVin,
            Association_Mets: jsonAtraite.degustation,
            Domaine: jsonAtraite.domaine || jsonAtraite.nom_domaine || "", // Utiliser le domaine ou le nom du domaine
            Producteur: jsonAtraite.producteur.nom || jsonAtraite.producteur.nom || "",///
            Nom: jsonAtraite.nom ?? "", // Si undefined → ""
            Douceur: jsonAtraite.douceur ?? "",///
            Sous_Region: jsonAtraite.sous_region || jsonAtraite.sous_région || "",///
            Producteur_Adresse: jsonAtraite.producteur.adresse || "", ///
            Région: regionTrouvee ? regionTrouvee.label : regionNormalisee, // Utilise toujours regionNormalisee même si non trouvée
            Couleur: couleurTrouvee ? couleurTrouvee.label : couleurIA, // Utilise toujours couleurIA même si non trouvée
            Pays: jsonAtraite.pays ?? "", // Utilise toujours le pays de l'IA
            Appellation: jsonAtraite.appellation ?? "",
            Millesime: jsonAtraite.millesime || jsonAtraite["millésime"] || "",
            Type: typeTrouve ? typeTrouve.label : typeIA,
            Apogee: jsonAtraite.APOGEE ? jsonAtraite.APOGEE.split("-")[0] : "", // Vérifie que APOGEE existe
            Apogee_Max: jsonAtraite.APOGEE ? jsonAtraite.APOGEE.split("-")[1] : "",
            TypeAlcool: jsonAtraite.type_alcool || "",
            Alcool: jsonAtraite.taux_d_alcool
                ? parseFloat(jsonAtraite.taux_d_alcool)
                : (jsonAtraite.alcool ? parseFloat(jsonAtraite.alcool) : 0),
            Prix_Achat: (() => {
                const prixStr =
                    typeof jsonAtraite["prix moyen"] === "string"
                        ? jsonAtraite["prix moyen"]
                        : (typeof jsonAtraite.prix_moyen === "string"
                            ? jsonAtraite.prix_moyen
                            : null);

                if (prixStr) {
                    const matchRange = prixStr.match(/(\d+(?:[\.,]\d+)?)\s*[-–]\s*(\d+(?:[\.,]\d+)?)/); // ex: "80-100"
                    if (matchRange) {
                        const min = parseFloat(matchRange[1].replace(",", "."));
                        const max = parseFloat(matchRange[2].replace(",", "."));
                        return (min + max) / 2;
                    } else {
                        const num = parseFloat(prixStr.replace(/[^\d.,]/g, "").replace(",", "."));
                        return isNaN(num) ? 0 : num;
                    }
                } else if (typeof jsonAtraite.prix_moyen === "number") {
                    return jsonAtraite.prix_moyen;
                } else {
                    return 0;
                }
            })(),
            Valeur: (() => {
                const prixStr =
                    typeof jsonAtraite["prix moyen"] === "string"
                        ? jsonAtraite["prix moyen"]
                        : (typeof jsonAtraite.prix_moyen === "string"
                            ? jsonAtraite.prix_moyen
                            : null);

                if (prixStr) {
                    const matchRange = prixStr.match(/(\d+(?:[\.,]\d+)?)\s*[-–]\s*(\d+(?:[\.,]\d+)?)/); // ex: "80-100"
                    if (matchRange) {
                        const min = parseFloat(matchRange[1].replace(",", "."));
                        const max = parseFloat(matchRange[2].replace(",", "."));
                        return (min + max) / 2;
                    } else {
                        const num = parseFloat(prixStr.replace(/[^\d.,]/g, "").replace(",", "."));
                        return isNaN(num) ? 0 : num;
                    }
                } else if (typeof jsonAtraite.prix_moyen === "number") {
                    return jsonAtraite.prix_moyen;
                } else {
                    return 0;
                }
            })(),
            valeurCave: (() => {
                const prixStr =
                    typeof jsonAtraite["prix moyen"] === "string"
                        ? jsonAtraite["prix moyen"]
                        : (typeof jsonAtraite.prix_moyen === "string"
                            ? jsonAtraite.prix_moyen
                            : null);

                if (prixStr) {
                    const matchRange = prixStr.match(/(\d+(?:[\.,]\d+)?)\s*[-–]\s*(\d+(?:[\.,]\d+)?)/); // ex: "80-100"
                    if (matchRange) {
                        const min = parseFloat(matchRange[1].replace(",", "."));
                        const max = parseFloat(matchRange[2].replace(",", "."));
                        return (min + max) / 2;
                    } else {
                        const num = parseFloat(prixStr.replace(/[^\d.,]/g, "").replace(",", "."));
                        return isNaN(num) ? 0 : num;
                    }
                } else if (typeof jsonAtraite.prix_moyen === "number") {
                    return jsonAtraite.prix_moyen;
                } else {
                    return 0;
                }
            })(),
            Cepage: (() => {
                const rawCepages = jsonAtraite.cepages || jsonAtraite["cépages"];
                if (Array.isArray(rawCepages)) {
                    return rawCepages.join(", ");
                } else if (typeof rawCepages === "string") {
                    return rawCepages;
                } else {
                    return "";
                }
            })(),
            //Remarques: "", // Ajout des autres champs dynamiquement
            RemarquesIA: updatedRemarques,
            Reste_en_Cave: 1,
        }));

    };

    const AnalyseIA = async (retryCount = 0) => {
        try {
            setIsAnalyzing(true);
            const formData = new FormData();
            formData.append("b64", vin.base64_etiquette);
            formData.append("uuidUser", UUIDuser);
            const response = await fetch(`${config.apiBaseUrl}/4DACTION/react_analyseIA`, {
                method: 'POST',
                headers: authHeader(),
                body: formData,
            });
            if (!response.ok) {
                throw new Error("Erreur lors de l'analyse");
            }
            const jsonAtraite = await response.json();
            if (!jsonAtraite || Object.keys(jsonAtraite).length === 0) {
                if (retryCount < 2) {
                    toast.current.show({ severity: 'warn', summary: 'Tentative échouée', detail: `Réponse vide, tentative ${retryCount + 2}...`, life: 3000 });
                    await AnalyseIA(retryCount + 1);
                    return;
                } else {
                    throw new Error("Réponse vide après trois tentatives");
                }
            }
            console.log("jsonAtraite", jsonAtraite);
            traiterAnalyseIA(jsonAtraite);
            toast.current.show({ severity: 'success', summary: 'Succès', detail: 'Analyse réussie', life: 3000 });
            // Ancien: setCurrentStep(2)
            setShowPlacementDialog(true);
        } catch (error) {
            if (retryCount < 2) {
                toast.current.show({ severity: 'warn', summary: 'Tentative échouée', detail: `Erreur lors de la tentative ${retryCount + 1}, nouvelle tentative...`, life: 3000 });
                await AnalyseIA(retryCount + 1);
            } else {
                toast.current.show({ severity: 'error', summary: 'Erreur', detail: "Erreur lors de l'analyse après trois tentatives", life: 3000 });
                // En cas d'échec final, afficher quand même le choix de placement
                setShowPlacementDialog(true);
            }
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleManualMode = () => {
        setShowPlacementDialog(true);
    };

    const handleBack = () => {
        setCurrentStep(1);
    };

    const getNoteDescription = (value) => {
        const v = Number.isFinite(value) ? Math.max(0, Math.min(100, Math.round(value))) : 0;

        if (v === 0) return 'Non noté';
        if (v < 82) return 'Médiocre';
        if (v < 85) return 'Correct';
        if (v < 87) return 'Bon';
        if (v < 90) return 'Très bon';
        if (v < 93) return 'Excellent';
        if (v < 97) return 'Exceptionnel';
        return 'Grand Cru';
    };

    const addCaveDialogFooter = (
        <div>
            <button
                onClick={() => setShowAddCaveDialog(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition mr-2"
            >
                Annuler
            </button>
            <button
                onClick={() => {
                    if (newCaveName.trim() !== "" && !distinctCaves.some(cave => cave.label === newCaveName)) {
                        const updatedCaves = [...distinctCaves, { label: newCaveName, value: newCaveName }];
                        setDistinctCaves(updatedCaves);
                        localStorage.setItem("distinctCaves", JSON.stringify(updatedCaves.map(c => c.value))); // Stocker uniquement les valeurs
                        setVin((prevVin) => ({ ...prevVin, Cave: newCaveName })); // Sélectionner la nouvelle cave
                        setShowAddCaveDialog(false);
                        setNewCaveName("");
                    }
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
                Ajouter
            </button>
        </div>
    );

    useEffect(() => {
        if (showPlacementDialog) {
            const def = distinctCaves.find(c => (c.label || '').toLowerCase() === 'cave principale');
            setTempCaveOption(def || null);
            setPlacementMode(null);
        }
    }, [showPlacementDialog, distinctCaves]);

    // Handlers pour le choix de placement
    const handleChooseDegustation = () => {
        setVin(prev => {
            const qte = 0;
            const dontBue = prev?.Dont_Bue || 0;
            const valeur = prev?.Valeur || 0;
            const reste = (qte || 0) - (dontBue || 0);
            return { ...prev, Cave: 'Dégustation', Qte: qte, Reste_en_Cave: reste, valeurCave: (reste || 0) * valeur };
        });
        setShowPlacementDialog(false);
        setCurrentStep(2);
    };

    const handleChooseCave = () => {
        setPlacementMode('cave');
    };

    const handleConfirmCavePlacement = () => {
        const chosen = tempCaveOption;
        const fallback = distinctCaves.find(c => (c.label || '').toLowerCase() === 'cave principale') || null;
        const finalChoice = chosen || fallback;
        if (!finalChoice) {
            toast.current?.show({ severity: 'warn', summary: 'Choix manquant', detail: 'Sélectionnez une cave.', life: 2000 });
            return;
        }
        const value = finalChoice.value || finalChoice.label;
        setVin(prev => ({ ...prev, Cave: value }));
        // Ajouter à la liste si nouveau
        if (!distinctCaves.some(c => (c.label || '') === value)) {
            const updated = [...distinctCaves, { label: value, value }];
            setDistinctCaves(updated);
            localStorage.setItem('distinctCaves', JSON.stringify(updated.map(c => c.value)));
        }
        setShowPlacementDialog(false);
        setCurrentStep(2);
    };

    const selectStyles = {
        control: (base, state) => ({
            ...base,
            backgroundColor: '#020617', // bg-slate-950
            borderColor: state.isFocused ? '#22c55e' : '#1f2937', // emerald / gray-800
            boxShadow: state.isFocused
                ? '0 0 0 1px rgba(34,197,94,0.6)'
                : 'none',
            borderRadius: 12,
            minHeight: 44,
            ':hover': {
                borderColor: '#22c55e',
            },
        }),
        menu: (base) => ({
            ...base,
            backgroundColor: '#020617',
            borderRadius: 12,
            border: '1px solid #1f2937',
            overflow: 'hidden',
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected
                ? 'rgba(34,197,94,0.25)'
                : state.isFocused
                    ? 'rgba(34,197,94,0.15)'
                    : 'transparent',
            color: '#e5e7eb',
            cursor: 'pointer',
            ':active': {
                ...base[':active'],
                backgroundColor: 'rgba(34,197,94,0.3)',
            },
        }),
        singleValue: (base) => ({
            ...base,
            color: '#f9fafb',
        }),
        placeholder: (base) => ({
            ...base,
            color: '#6b7280',
        }),
        input: (base) => ({
            ...base,
            color: '#f9fafb',
        }),
        menuPortal: (base) => ({
            ...base,
            zIndex: 9999,
        }),
    };

    const isVinReady = vin && Object.keys(vin).length > 0;


    var bas64Vide = ""
    if (!vin) {
        return (
            <div className="bg-gradient-to-b from-[#8C2438] via-[#5A1020] to-[#3B0B15] text-white">
                <Toast ref={toast} />
                <NouveauVinLoadingScreen />
            </div>
        );
    }
    return (
        <div className="bg-gradient-to-b from-[#8C2438] via-[#5A1020] to-[#3B0B15]">
            <Toast ref={toast} />
            <LoginRequiredModal
                visible={showLoginModal}
                onLogin={() => { setShowLoginModal(false); navigate('/login'); }}
                onCancel={() => setShowLoginModal(false)}
            />
            <Dialog
                visible={showPlacementDialog}
                onHide={() => {
                    setShowPlacementDialog(false);
                    setPlacementMode(null);
                    setTempCaveOption(null);
                }}
                header={null}
                closable={false}
                modal
                dismissableMask
                appendTo={document.body}
                blockScroll
                draggable={false}
                resizable={false}
                className="w-full max-w-lg"
                contentClassName="!bg-transparent !border-none !p-0"
                breakpoints={{ '960px': '95vw', '640px': '100vw' }}
            >
                <div
                    className="
            bg-[#14040A]
            text-white
            rounded-3xl
            border border-white/10
            shadow-[0_28px_80px_rgba(0,0,0,0.95)]
            overflow-hidden
        "
                >
                    {/* Header custom */}
                    <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-white/10 flex items-center gap-3">
                        <div className="
                w-10 h-10 sm:w-11 sm:h-11
                rounded-2xl
                bg-gray-900/80
                flex items-center justify-center
                shadow-[0_16px_40px_rgba(0,0,0,0.8)]
            ">
                            <i className="pi pi-map-marker text-sm sm:text-base text-emerald-300" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-base sm:text-lg md:text-xl font-semibold leading-snug">
                                Où placer ce vin ?
                            </h2>
                            <p className="text-xs sm:text-sm text-white/70 mt-0.5">
                                Ajoutez-le pour une dégustation immédiate ou rangez-le dans l’une de vos caves.
                            </p>
                        </div>
                    </div>

                    {/* Contenu */}
                    <div className="px-5 sm:px-6 py-5 sm:py-6 space-y-5 sm:space-y-6">
                        {/* Boutons principaux */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <button
                                onClick={handleChooseDegustation}
                                className="
                        group
                        p-4 sm:p-5
                        rounded-2xl
                        border border-red-500/40
                        bg-gradient-to-br from-[#3B0B15] to-[#1C090F]
                        hover:from-[#4A101E] hover:to-[#230A14]
                        transition-all duration-200
                        shadow-[0_16px_45px_rgba(0,0,0,0.9)]
                        flex flex-col items-start justify-between
                        min-h-[96px]
                    "
                            >
                                <div className="flex items-center gap-2.5 mb-1.5">
                                    <div className="
                            w-8 h-8
                            rounded-xl
                            bg-black/50
                            flex items-center justify-center
                            border border-red-500/50
                        ">
                                        <i className="pi pi-glass text-xs text-red-300" />
                                    </div>
                                    <span className="font-semibold text-sm sm:text-base">
                                        Dégustation
                                    </span>
                                </div>
                                <p className="text-xs sm:text-sm text-white/75 text-left">
                                    Vin à ouvrir rapidement, non comptabilisé dans le stock de cave.
                                </p>
                            </button>

                            <button
                                onClick={handleChooseCave}
                                className="
                        group
                        p-4 sm:p-5
                        rounded-2xl
                        border border-emerald-500/40
                        bg-gradient-to-br from-[#111827] to-[#020617]
                        hover:from-[#0f172a] hover:to-[#020617]
                        transition-all duration-200
                        shadow-[0_16px_45px_rgba(0,0,0,0.9)]
                        flex flex-col items-start justify-between
                        min-h-[96px]
                    "
                            >
                                <div className="flex items-center gap-2.5 mb-1.5">
                                    <div className="
                            w-8 h-8
                            rounded-xl
                            bg-black/50
                            flex items-center justify-center
                            border border-emerald-500/50
                        ">
                                        <i className="pi pi-box text-xs text-emerald-300" />
                                    </div>
                                    <span className="font-semibold text-sm sm:text-base">
                                        En cave
                                    </span>
                                </div>
                                <p className="text-xs sm:text-sm text-white/75 text-left">
                                    Stocker le vin dans l’une de vos caves et l’ajouter à votre inventaire.
                                </p>
                            </button>
                        </div>

                        {/* Choix de cave */}
                        {placementMode === 'cave' && (
                            <div className="mt-1 space-y-3">
                                <label className="block text-xs sm:text-sm font-semibold text-white/80">
                                    Sélectionnez ou créez une cave
                                </label>
                                <CreatableSelect
                                    value={tempCaveOption}
                                    options={caveOptionsNoDegustation}
                                    onChange={(opt) =>
                                        setTempCaveOption(
                                            opt ? { label: opt.label, value: opt.value || opt.label } : null
                                        )
                                    }
                                    placeholder="Choisir ou créer une cave"
                                    isClearable
                                    isSearchable
                                    menuPortalTarget={document.body}
                                    formatCreateLabel={(inputValue) => `Créer "${inputValue}"`}
                                    styles={{
                                        control: (base, state) => ({
                                            ...base,
                                            backgroundColor: '#020617',
                                            borderRadius: '0.75rem',
                                            borderColor: state.isFocused
                                                ? 'rgba(16,185,129,0.9)'
                                                : 'rgba(148,163,184,0.6)',
                                            boxShadow: 'none',
                                            minHeight: '2.75rem',
                                            fontSize: '0.875rem',
                                            color: '#e5e7eb',
                                        }),
                                        singleValue: (base) => ({
                                            ...base,
                                            color: '#e5e7eb',
                                        }),
                                        menu: (base) => ({
                                            ...base,
                                            backgroundColor: '#020617',
                                            borderRadius: '0.75rem',
                                            overflow: 'hidden',
                                        }),
                                        option: (base, state) => ({
                                            ...base,
                                            fontSize: '0.875rem',
                                            padding: '0.5rem 0.75rem',
                                            backgroundColor: state.isFocused
                                                ? 'rgba(16,185,129,0.12)'
                                                : 'transparent',
                                            color: '#e5e7eb',
                                        }),
                                        placeholder: (base) => ({
                                            ...base,
                                            color: 'rgba(148,163,184,0.8)',
                                        }),
                                        input: (base) => ({
                                            ...base,
                                            color: '#e5e7eb',
                                        }),
                                        menuPortal: (base) => ({
                                            ...base,
                                            zIndex: 9999,
                                        }),
                                    }}
                                />

                                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-1">
                                    <button
                                        onClick={() => {
                                            setPlacementMode(null);
                                            setTempCaveOption(null);
                                        }}
                                        className="
                                px-4 py-2
                                rounded-xl
                                border border-white/10
                                bg-black/30
                                text-xs sm:text-sm
                                hover:bg-black/50
                                transition-colors
                            "
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={handleConfirmCavePlacement}
                                        className="
                                px-4 sm:px-5 py-2
                                rounded-xl
                                bg-emerald-600
                                hover:bg-emerald-700
                                text-xs sm:text-sm font-semibold
                                shadow-[0_12px_35px_rgba(16,185,129,0.45)]
                                transition-all
                            "
                                    >
                                        Valider
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Dialog>
            {currentStep === 1 ? (
              <NouveauVinEtape1                    onAnalyzeComplete={() => setCurrentStep(2)}
                   onManualMode={handleManualMode}
                    customBase64Uploader={customBase64Uploader}
                   isAnalyzing={isAnalyzing}
               />
           ) : isVinReady ? (
               <NouveauVinEtape2
                   vin={vin}
                    handleInputChange={handleInputChange}
                    handleSave={handleSave}
                    customBase64UploaderSansIA={customBase64UploaderSansIA}
                    getNoteDescription={getNoteDescription}
                    optionsPays={optionsPays}
                    filteredRegions={filteredRegions}
                   optionCouleur={optionCouleur}
                    optionTypeVin={optionTypeVin}                    distinctCaves={distinctCaves}
                    defaultCountryValue={defaultCountryValue}
                   defaultRegionValue={defaultRegionValue}
                   handleCountryChange={handleCountryChange}
                    errorRegion={errorRegion}
                   errorCouleur={errorCouleur}
                   showAddCaveDialog={showAddCaveDialog}                   setShowAddCaveDialog={setShowAddCaveDialog}
                    newCaveName={newCaveName}
                   setNewCaveName={setNewCaveName}
                   handleCaveChange={handleCaveChange}                    addCaveDialogFooter={addCaveDialogFooter}
                   onBack={handleBack}
                />
            ) : (
                <NouveauVinLoadingScreen />
           )}
        </div >
    );
};

export default NouveauVin;