import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import imageCompression from "browser-image-compression";
import config from '../config/config';
import authHeader from '../config/authHeader';
import useFetchPlats from '../hooks/useFetchPlats';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import { FiTrash2, FiPlusCircle, FiCheckCircle, FiRefreshCcw, FiStar } from "react-icons/fi";
import { FaWineGlassAlt as FiWine } from "react-icons/fa";

const SommelierForm = () => {
    const { id } = useParams();
    const UUIDuser = sessionStorage.getItem('uuid_user');
    const token = sessionStorage.getItem('token');
    console.log(token);

    const { fetchPlats, platsCarte } = useFetchPlats();

    const shouldAnalyze = useRef(false);
    const [image, setImage] = useState(null);
    const [vinResult, setVinResult] = useState(null);
    const [UUIDTable, setUUIDTable] = useState('');
    const [repas, setRepas] = useState(['']);
    const [vinChoice, setVinChoice] = useState('cave');
    const [aperitif, setAperitif] = useState(false);
    const [digestif, setDigestif] = useState(false);
    const [budget, setBudget] = useState(0);
    const [bouteille, setBouteille] = useState(0);
    const [currentStep, setCurrentStep] = useState(1);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [selectedPlats, setSelectedPlats] = useState([]);
    const [conseilResult, setConseilResult] = useState(null);
    const [manual, setManual] = useState(false);
    const [resultAnalyseSommelier, setResultAnalyseSommelier] = useState([]);
    const [vinsFiltre, setVinsFiltre] = useState([]);
    const [showDropdown, setShowDropdown] = useState(null);
    const [dansRayon, setDansRayon] = useState(false);
    const [adaptePlat, setAdaptePlat] = useState(true);
    const [equilibre, setEquilibre] = useState('');
    const [showOldResult, setShowOldResult] = useState(false);
    const [rayonMode, setRayonMode] = useState(null);
    const [rayonProfil, setRayonProfil] = useState(null);
    const [filters, setFilters] = useState({
        contenance: "",
        couleur: "",
        region: "",
    });

    const toast = useRef(null);

    const navigate = useNavigate();

    const returnToSommelierMenu = () => {
        Storage.removeItem("lastSommelierResult");
        setOldResult(null);
        setShowOldResult(false);

        // reset complet de l'écran
        restartHandler();

        // navigate (replace pour éviter revenir avec back)
        navigate('/sommelier', { replace: true });
    };
    const handleCheckboxChange = (item) => {
        setSelectedPlats(prev =>
            prev.includes(item)
                ? prev.filter(p => p !== item)
                : [...prev, item]
        );
    };

    const loadOldResult = () => {
        const raw = localStorage.getItem("lastSommelierResult");
        try { return raw ? JSON.parse(raw) : null; } catch { return null; }
    };
    const saveOldResult = (data) => {
        localStorage.setItem("lastSommelierResult", JSON.stringify(data));
        setOldResult(data);
        setShowOldResult(false);
    };
    const clearOldResult = () => {
        localStorage.removeItem("lastSommelierResult");
        setOldResult(null);
        setShowOldResult(false);
    };

    console.log("step", currentStep)

    const analyseResult = async (retryCount = 0, vinsfiltre = vinsFiltre, platsChoisi = selectedPlats, typeCase = 'conseilVin') => {
        try {
            const string = JSON.stringify(vinsFiltre)
            setIsAnalyzing(true);
            const formData = new FormData();

            formData.append("platsChoisi", platsChoisi);
            formData.append("uuidUser", UUIDuser);
            formData.append("uuidTable", UUIDTable);
            formData.append("budget", budget);
            formData.append("bouteille", bouteille);
            formData.append("typeCase", typeCase);
            formData.append("choice", vinChoice);
            formData.append("vinsfiltre", string);
            formData.append("equilibre", equilibre);
            formData.append("dansrayon", dansRayon);
            formData.append("adaptePlat", adaptePlat);
            formData.append("aperitif", aperitif);
            formData.append("digestif", digestif);
            formData.append("token", token);

            const response = await fetch(`${config.apiBaseUrl}/4DACTION/react_conseilPlatIA`, {
                method: 'POST',
                headers: authHeader(),
                body: formData,
            });
            console.log("response", response)
            if (!response.ok) {
                throw new Error("Erreur lors de l'analyse");
            }
            const jsonAtraite = await response.json();
            console.log("jsontraiter", jsonAtraite)
            if (!jsonAtraite || Object.keys(jsonAtraite).length === 0) {
                if (retryCount < 2) {
                    toast.current.show({ severity: 'warn', summary: 'Tentative échouée', detail: `Réponse vide, tentative ${retryCount + 2}...`, life: 3000 });
                    await analyseResult(retryCount + 1, typeCase);
                    return;
                } else {
                    throw new Error("Réponse vide après trois tentatives");
                }
            }

            if (typeCase === "rayonPlatProfil") {
                if (Array.isArray(jsonAtraite) && jsonAtraite[0]?.vraiplat === false) {
                    setVinResult({ vraiPlat: false, vraiplat: false });
                    return;
                }
                if (jsonAtraite?.vraiplat === false || jsonAtraite?.vraiPlat === false) {
                    setVinResult({ vraiPlat: false, vraiplat: false });
                    return;
                }

                const conseilArr = Array.isArray(jsonAtraite?.conseil)
                    ? jsonAtraite.conseil
                    : [];

                const profilItem = conseilArr.find((i) => i.profil);
                const platFlagItem = conseilArr.find(
                    (i) => typeof i.vraiplat === "boolean" || typeof i.vraiPlat === "boolean"
                );

                if (
                    platFlagItem &&
                    (platFlagItem.vraiplat === false || platFlagItem.vraiPlat === false)
                ) {
                    setVinResult({ vraiPlat: false, vraiplat: false });
                    return;
                }

                const profil =
                    profilItem?.profil ||
                    jsonAtraite?.profil ||
                    null;

                setRayonProfil(profil);

                setCurrentStep(2);

                toast.current.show({
                    severity: "success",
                    summary: "OK",
                    detail: "Profil récupéré",
                    life: 3000,
                });
                return;
            }
            if (typeCase == "conseilPlat")
                traiterImageIA(jsonAtraite)
            else if ((typeCase == "conseilVin") || (typeCase == "conseilCave"))
                traiterConseilIA(jsonAtraite);

            const platNonValide =
                jsonAtraite?.vraiPlat === false ||
                jsonAtraite?.vraiplat === false ||
                (Array.isArray(jsonAtraite?.conseil) &&
                    jsonAtraite.conseil.some(
                        (c) => c.vraiplat === false || c.vraiPlat === false
                    ));

            if (platNonValide) {
                if (typeCase === "conseilVin" || typeCase === "conseilCave") {
                    setConseilResult({ ...jsonAtraite, vraiPlat: false, vraiplat: false });
                } else if (typeCase === "conseilPlat") {
                    setVinResult({ ...jsonAtraite, vraiPlat: false, vraiplat: false });
                }
                return;
            }
            toast.current.show({ severity: 'success', summary: 'Succès', detail: 'Analyse réussie', life: 3000 });
        } catch (error) {
            if (retryCount < 2) {
                toast.current.show({ severity: 'warn', summary: 'Tentative échouée', detail: `Erreur lors de la tentative ${retryCount + 1}, nouvelle tentative...`, life: 3000 });
                await analyseResult(retryCount + 1, vinsFiltre, selectedPlats, typeCase);
            } else {
                toast.current.show({ severity: 'error', summary: 'Erreur', detail: "Erreur lors de l'analyse après trois tentatives", life: 3000 });
            }
        } finally {
            setIsAnalyzing(false);
            clearFile.current = false
            setCurrentStep(prev => (prev >= 100 ? 100 : prev + 1));
        }
    };

    const handleRepasChange = (index, value) => {
        const updatedRepas = [...repas];
        updatedRepas[index] = value;
        setRepas(updatedRepas);
    };

    const addRepas = () => {
        setRepas([...repas, '']);
    };

    const removeRepas = (index) => {
        const updatedRepas = repas.filter((_, i) => i !== index);
        setRepas(updatedRepas);
    };

    const clearFile = useRef(true);

    const imageBase64Uploader = async (event, typeCategorie = 'carte', typeData = 'vin') => {
        const file = event.files[0];
        if (file) {
            try {
                const sizeMB = file.size / 1024 / 1024;

                if (sizeMB <= 0.256) {
                    // Si le fichier est déjà assez petit, on ne le compresse pas
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => {

                        const base64String = reader.result.split(",")[1];
                        setImage((prevImg) => ({
                            ...prevImg,
                            image: base64String,
                            typeData: typeData,
                            typeCategorie: typeCategorie

                        }));


                        shouldAnalyze.current = true;
                    };
                } else {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => {

                        const base64String = reader.result.split(",")[1];
                        setImage((prevImg) => ({
                            ...prevImg,
                            image: base64String,
                            typeData: typeData,
                            typeCategorie: typeCategorie

                        }));

                        shouldAnalyze.current = true;
                    };
                }
            } catch (error) {
                console.error("Erreur lors du traitement de l'image :", error);
            }
        }
    };

    useEffect(() => {
        console.log("image", image)
        if (image?.image && shouldAnalyze.current) {
            AnalyseSommelier(0);
            shouldAnalyze.current = false;
        }
    }, [image?.image]);


    const traiterImageIA = (jsonAtraite) => {
        if (jsonAtraite) {
            setVinResult(jsonAtraite);
        }
        else {
            console.warn("Aucun conseil trouvé dans les données", jsonAtraite);
        }
    };

    const traiterConseilIA = (jsonAtraite) => {
        if (jsonAtraite)
            setConseilResult(jsonAtraite);
        else {
            console.warn("Aucun conseil trouvé dans les données", jsonAtraite);
        }
    };

    const AnalyseSommelier = async (retryCount = 0) => {
        try {
            console.log("image", image)
            setIsAnalyzing(true);
            const formData = new FormData();
            if (image)
                formData.append("b64", image.image);
            formData.append("typeData", image.typeData);
            formData.append("typeCategorie", image.typeCategorie);
            formData.append("uuidUser", UUIDuser);
            formData.append("uuidTable", UUIDTable);
            formData.append("budget", budget);
            formData.append("bouteille", bouteille);
            formData.append("token", token);

            const response = await fetch(`${config.apiBaseUrl}/4DACTION/react_analyseSommelier`, {
                method: 'POST',
                headers: authHeader(),
                body: formData,
            });
            console.log("response", response)
            if (!response.ok) {
                throw new Error("Erreur lors de l'analyse");
            }
            const jsonAtraite = await response.json();
            console.log("jsontraiter", jsonAtraite)
            if (!jsonAtraite || Object.keys(jsonAtraite).length === 0) {
                if (retryCount < 2) {
                    toast.current.show({ severity: 'warn', summary: 'Tentative échouée', detail: `Réponse vide, tentative ${retryCount + 2}...`, life: 3000 });
                    await AnalyseSommelier(retryCount + 1);
                    return;
                } else {
                    throw new Error("Réponse vide après trois tentatives");
                }
            }
            console.log("jsonAtraite", jsonAtraite);
            setUUIDTable(jsonAtraite.uuid)
            setResultAnalyseSommelier((prev) => {
                if (!prev || !prev.result || !prev.result.result) {
                    return jsonAtraite;
                }

                return {
                    ...prev,
                    ...jsonAtraite,
                    result: {
                        ...prev.result,
                        ...jsonAtraite.result,
                        result: [
                            ...(prev.result.result || []),
                            ...(jsonAtraite.result?.result || [])
                        ]
                    }
                };
            });

            toast.current.show({ severity: 'success', summary: 'Succès', detail: 'Analyse réussie', life: 3000 });
        } catch (error) {
            if (retryCount < 2) {
                toast.current.show({ severity: 'warn', summary: 'Tentative échouée', detail: `Erreur lors de la tentative ${retryCount + 1}, nouvelle tentative...`, life: 3000 });
                await AnalyseSommelier(retryCount + 1);
            } else {
                toast.current.show({ severity: 'error', summary: 'Erreur', detail: "Erreur lors de l'analyse après trois tentatives", life: 3000 });
            }
        } finally {
            setIsAnalyzing(false);
            clearFile.current = false
            setCurrentStep(prev => (prev >= 100 ? 100 : prev + 1));
        }
    };

    // === états "similaires dans ma cave" ===
    const [showSimilarPanel, setShowSimilarPanel] = useState(false);
    const [missingWines, setMissingWines] = useState([]);
    const [selectedMissing, setSelectedMissing] = useState(new Set());
    const [simLoading, setSimLoading] = useState(false);
    const [simMatches, setSimMatches] = useState(null);

    const getVinName = (v) => v?.nomvin || v?.nom || v?.Nom || v?.vindigestif || "";
    const hasCaveDataFn = (v) => !!(v?.UUID_ || v?.base64_132etiquette);

    useEffect(() => {
        const collect = [];

        if (vinResult?.conseil?.length) {
            vinResult.conseil.forEach(item => {
                if (item.nomvin && !hasCaveDataFn(item)) {
                    collect.push({ name: getVinName(item), context: "plat" });
                }
                if (item.vinaperitif && !hasCaveDataFn(item.vinaperitif)) {
                    collect.push({ name: getVinName(item.vinaperitif), context: "apéritif" });
                }
                if (item.vindigestif && !hasCaveDataFn(item.vindigestif)) {
                    collect.push({ name: getVinName(item.vindigestif), context: "digestif" });
                }
            });
        }

        if (conseilResult?.conseil?.length) {
            conseilResult.conseil.forEach(obj => {
                Object.values(obj).forEach(v => {
                    if (v && typeof v === "object" && getVinName(v) && !hasCaveDataFn(v)) {
                        collect.push({ name: getVinName(v), context: "catégorie" });
                    }
                });
            });
        }

        const seen = new Set();
        const dedup = collect.filter(x => {
            const k = x.name.trim().toLowerCase();
            if (!k || seen.has(k)) return false;
            seen.add(k);
            return true;
        });

        setMissingWines(dedup);
        setSelectedMissing(new Set());
        setSimMatches(null);
    }, [vinResult, conseilResult]);


    useEffect(() => {
        if (currentStep === 100) {
            analyseResult(0, vinsFiltre, repas, "conseilVin");
        }
    }, [currentStep]);

    useEffect(() => {
        const platInvalide =
            conseilResult?.vraiPlat === false ||
            conseilResult?.vraiplat === false ||
            vinResult?.vraiPlat === false ||
            vinResult?.vraiplat === false;

        if (platInvalide) {
            Swal.fire({
                title: '🍽️ Plat non reconnu',
                html: `
        <p style="font-size: 1rem; color:#374151; margin-top:8px">
          Le plat que vous avez saisi n’est pas reconnu comme un plat existant.<br/>
          Souhaitez-vous recommencer votre saisie ?
        </p>
      `,
                icon: 'warning',
                background: 'rgba(255, 255, 255, 0.85)',
                color: '#111827',
                confirmButtonText: 'Recommencer',
                cancelButtonText: 'Retour au sommelier',
                showCancelButton: true,
                confirmButtonColor: '#16a34a',
                cancelButtonColor: '#6b7280',
                reverseButtons: true,
                allowOutsideClick: true,
                showClass: {
                    popup: 'animate__animated animate__fadeInDown animate__faster',
                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOutUp animate__faster',
                },
                customClass: {
                    popup: 'rounded-3xl shadow-2xl backdrop-blur-lg border border-gray-200',
                    title: 'font-bold text-xl text-gray-800',
                },
            }).then((result) => {
                if (result.isConfirmed) {
                    restartHandler();
                } else {
                    returnToSommelierMenu();
                }
            });
        }
    }, [vinResult, conseilResult]);

    const FileUploadField = ({ onSelect, label, disabled = false }) => (
        <div className="relative w-full">
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                {label} :
            </label>

            <FileUpload
                name="demo[]"
                mode="basic"
                chooseLabel=""
                accept="image/*"
                auto={true}
                maxFileSize={90000000}
                customUpload={true}
                onSelect={onSelect}
                disabled={disabled}
                className={`absolute inset-0 opacity-0 cursor-pointer z-10 ${disabled ? 'pointer-events-none' : ''}`}
                chooseOptions={{
                    className: "w-full h-full absolute inset-0 opacity-0 cursor-pointer",
                }}
            />

            <div className={`mb-12 h-48 border-2 border-dashed ${disabled ? 'border-gray-300' : 'border-emerald-400'} rounded-lg flex flex-col items-center justify-center text-center bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-300 group`}>
                <i className={`pi pi-camera text-2xl ${disabled ? 'text-gray-400' : 'text-emerald-600 dark:text-emerald-400'} mb-2`}></i>
                <p className={`text-sm ${disabled ? 'text-gray-400' : 'text-emerald-700 dark:text-emerald-300'} font-medium`}>
                    {disabled ? 'Veuillez remplir le champ ci-dessus' : 'Placer votre image ici'}
                </p>
            </div>
        </div>
    );

    const isRepasValid = repas.every(p => p.trim() !== '') && vinChoice && (vinChoice !== 'acheter' || budget != 0);
    const isCaveValid = Number(bouteille) > 0 && Number(budget) > 0;

    const nextStepHandler = () => {
        setCurrentStep(currentStep + 1)
    }

    const lastStepHandler = () => {
        setIsAnalyzing(false);

        setCurrentStep(prev => {
            if (vinResult || conseilResult) {
                const oldData = { vinResult, conseilResult, timestamp: new Date().toISOString() };
                localStorage.setItem("lastSommelierResult", JSON.stringify(oldData));
                setOldResult(oldData);
                setVinResult(null);
                setConseilResult(null);
                setShowOldResult(false);
            }

            if (prev >= 100) {
                if (id === 'restaurant') return 5;
                if (id === 'rayon' && adaptePlat) return 4;
                if (id === 'rayon' && !adaptePlat) return 3;
                if (id === 'plat') return 1;
                return 1;
            }

            return Math.max(1, prev - 1);
        });
    };

    const [oldResult, setOldResult] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem("lastSommelierResult");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setOldResult(parsed);
            } catch {
                localStorage.removeItem("lastSommelierResult");
            }
        }
    }, []);

    useEffect(() => {
        if (currentStep === 100) {
            const stored = loadOldResult();
            setOldResult(stored);
            setShowOldResult(false);
        }
    }, [currentStep]);


    const normalizePlatsData = (platsObject) => {
        const grouped = {};

        for (const dish of platsObject.result) {
            const category = dish.categorie || "Autres";

            if (!grouped[category]) {
                grouped[category] = [];
            }

            grouped[category].push({ nom: dish.nom });
        }

        return grouped;
    }

    const allWines = resultAnalyseSommelier?.result?.result || [];

    useEffect(() => {
        const filtered = allWines
            .filter((vin) => {
                const matchesCouleur = filters.couleur ? vin.couleur === filters.couleur : true;
                const matchesRegion = filters.region ? vin.région === filters.region : true;
                const matchesContenance = filters.contenance
                    ? vin.format?.some((f) => f.contenance === filters.contenance)
                    : true;

                return matchesCouleur && matchesRegion && matchesContenance;
            })
            .map((vin) => {
                if (filters.contenance) {
                    const filteredFormats = vin.format?.filter(
                        (f) => f.contenance === filters.contenance
                    );

                    return {
                        ...vin,
                        format: filteredFormats,
                    };
                }
                return vin;
            });

        const isEqual = JSON.stringify(filtered) === JSON.stringify(vinsFiltre);
        if (!isEqual) {
            setVinsFiltre(filtered);
        }
    }, [filters, allWines]);

    const formatPrice = (prix) => {
        if (!prix) return "Non précisé";

        if (typeof prix === "string" && prix.includes("€")) {
            return prix;
        }

        const value = parseFloat(prix);
        if (!isNaN(value)) {
            return `${value.toFixed(2)}€`;
        }

        return prix;
    };

    const renderForm = () => {

        const getContenances = () => {
            const set = new Set();
            allWines.forEach((vin) =>
                vin.format?.forEach((f) => f.contenance && set.add(f.contenance))
            );
            return Array.from(set).sort();
        };

        const getCouleurs = () => {
            const set = new Set();
            allWines.forEach((vin) => vin.couleur && set.add(vin.couleur));
            return Array.from(set).sort();
        };

        const getRegions = () => {
            const set = new Set();
            allWines.forEach((vin) => set.add(vin.région ?? "Inconnu"));
            return Array.from(set).sort();
        };

        const handleFilterChange = (type, value) => {
            setFilters((prev) => ({
                ...prev,
                [type]: value,
            }));
            setShowDropdown(null);
        };

        const clearFilters = () => {
            setFilters({ contenance: "", couleur: "", region: "" });
            setShowDropdown(null);
        };

        const clearSingleFilter = (type) => {
            setFilters((prev) => ({ ...prev, [type]: "" }));
        };

        console.log("🔢 Étape actuelle :", currentStep);
        switch (id) {
            case 'restaurant':
                return (
                    <>
                        {currentStep == 1 &&
                            <>
                                <FileUploadField
                                    label={"La carte des vins:"}
                                    onSelect={(e) => imageBase64Uploader(e, 'carte', 'vin')}
                                />
                            </>}

                        {currentStep == 2 &&
                            <div>
                                <h1>Voulez-vous ajouter une nouvelle image? </h1>
                                <div className="flex gap-4 mt-4">
                                    <button
                                        onClick={() => setCurrentStep(1)}
                                        className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                                    >
                                        oui
                                    </button>

                                    <button
                                        onClick={() => setCurrentStep(3)}
                                        className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                                    >
                                        non
                                    </button>
                                </div>

                            </div>

                        }

                        {currentStep == 3 && (
                            <div>
                                <div>
                                    <div>
                                        <h2 className="font-semibold text-lg mb-2">Choisissez vos préférences :</h2>
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 p-2 mt-5">
                                            <div className="relative">
                                                <button
                                                    className="bg-gray-200 py-2 px-4 rounded w-full hover:bg-gray-300 transition"
                                                    onClick={clearFilters}
                                                >
                                                    Tous
                                                </button>
                                            </div>

                                            <div className="relative">
                                                <button
                                                    className="bg-gray-200 py-2 px-4 rounded w-full hover:bg-gray-300 transition"
                                                    onClick={() => setShowDropdown(showDropdown === "contenance" ? null : "contenance")}
                                                >
                                                    Contenance
                                                </button>
                                            </div>

                                            <div className="relative">
                                                <button
                                                    className="bg-gray-200 py-2 px-4 rounded w-full hover:bg-gray-300 transition"
                                                    onClick={() => setShowDropdown(showDropdown === "couleur" ? null : "couleur")}
                                                >
                                                    Couleur
                                                </button>
                                            </div>

                                            <div className="relative">
                                                <button
                                                    className="bg-gray-200 py-2 px-4 rounded w-full hover:bg-gray-300 transition"
                                                    onClick={() => setShowDropdown(showDropdown === "region" ? null : "region")}
                                                >
                                                    Région
                                                </button>
                                            </div>
                                        </div>

                                        {showDropdown && (
                                            <div className="mt-2">
                                                <select
                                                    className="w-full max-w-sm p-2 border border-gray-300 rounded bg-white shadow-md"
                                                    value={filters[showDropdown] || ""}
                                                    onChange={(e) => handleFilterChange(showDropdown, e.target.value)}
                                                >
                                                    <option value="">-- Sélectionner --</option>
                                                    {showDropdown === "contenance" &&
                                                        getContenances().map((c, i) => (
                                                            <option key={i} value={c}>
                                                                {c}
                                                            </option>
                                                        ))}

                                                    {showDropdown === "couleur" &&
                                                        getCouleurs().map((c, i) => (
                                                            <option key={i} value={c}>
                                                                {c}
                                                            </option>
                                                        ))}

                                                    {showDropdown === "region" &&
                                                        getRegions().map((r, i) => (
                                                            <option key={i} value={r}>
                                                                {r}
                                                            </option>
                                                        ))}
                                                </select>
                                            </div>
                                        )}
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {filters.contenance && (
                                                <span
                                                    onClick={() => clearSingleFilter("contenance")}
                                                    className="cursor-pointer bg-green-200 text-green-800 text-xs px-3 py-1 rounded-full select-none flex items-center gap-1"
                                                    title="Supprimer ce filtre"
                                                >
                                                    Contenance: {filters.contenance} <strong>×</strong>
                                                </span>
                                            )}
                                            {filters.couleur && (
                                                <span
                                                    onClick={() => clearSingleFilter("couleur")}
                                                    className="cursor-pointer bg-blue-200 text-blue-800 text-xs px-3 py-1 rounded-full select-none flex items-center gap-1"
                                                    title="Supprimer ce filtre"
                                                >
                                                    Couleur: {filters.couleur} <strong>×</strong>
                                                </span>
                                            )}
                                            {filters.region && (
                                                <span
                                                    onClick={() => clearSingleFilter("region")}
                                                    className="cursor-pointer bg-purple-200 text-purple-800 text-xs px-3 py-1 rounded-full select-none flex items-center gap-1"
                                                    title="Supprimer ce filtre"
                                                >
                                                    Région: {filters.region} <strong>×</strong>
                                                </span>
                                            )}
                                        </div>

                                        {/* Liste des vins triés */}
                                        <div className="overflow-auto bg-white shadow-lg rounded-lg max-h-[400px] lg:max-h-[600px] p-4 space-y-4 mt-5 border border-black-300">
                                            {vinsFiltre.length === 0 && (
                                                <p className="text-gray-500 italic">
                                                    Aucun vin ne correspond aux filtres sélectionnés.
                                                </p>
                                            )}
                                            {vinsFiltre.map((vin, index) => (
                                                <div key={index} className="border-b pb-2">
                                                    <div className="font-semibold">{vin.nom}</div>
                                                    <div className="text-sm text-gray-600">
                                                        <span className="mr-3">Couleur : {vin.couleur} </span>{" "}
                                                        <span className="mr-3">
                                                            Région : {vin.région ?? "Région inconnue"}
                                                        </span>{" "}
                                                        <span className="ml-3">
                                                            Appellation : {vin.appellation ?? "Appellation inconnue"}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-gray-700 italic">{vin.caractéristique}</div>
                                                    <div className="mt-1 flex flex-wrap gap-2 text-sm">
                                                        {vin.format?.map((f, i) => (
                                                            <span key={i} className="bg-gray-100 px-2 py-1 rounded">
                                                                {f.contenance} - {formatPrice(f.prix)}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className='flex justify-end'>

                                        <button
                                            onClick={() => setCurrentStep(4)}
                                            className="mt-4 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                                        >
                                            Suivant
                                        </button>
                                    </div>
                                </div>

                            </div>
                        )
                        }
                        {currentStep == 4 &&
                            <div>
                                <h1>Voulez-vous prendre un photo de votre carte des plats ou saisir manuellement votre choix? </h1>
                                <div className="flex gap-4 mt-4">
                                    <button
                                        onClick={() => {
                                            setManual(false);
                                            setCurrentStep(5);
                                        }}
                                        className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                                    >
                                        <span className='pi pi-camera mr-2 mt-2'></span> Photo
                                    </button>

                                    <button
                                        onClick={() => {
                                            setManual(true);
                                            setCurrentStep(5);
                                        }}
                                        className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                                    >
                                        <span className='pi pi-pencil mr-2 mt-2'></span>Saisie Manuelle
                                    </button>
                                </div>

                            </div>

                        }
                        {currentStep == 5 && manual == false &&
                            <div>

                                <FileUploadField
                                    label={"Votre carte de plat:"}
                                    onSelect={(e) => imageBase64Uploader(e, 'carte', 'plat')}
                                />

                            </div>
                        }

                        {currentStep == 5 && manual == true && (
                            <div className="w-full max-w-3xl mx-auto space-y-8 p-6 rounded-2xl bg-gradient-to-b from-white/80 to-emerald-50/70 dark:from-gray-800/80 dark:to-gray-900/80 shadow-lg backdrop-blur-xl transition-all duration-500">
                                <motion.h3
                                    className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    Saisissez vos plats
                                </motion.h3>

                                <AnimatePresence>
                                    {repas.map((plat, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.3 }}
                                            className="flex flex-col sm:flex-row items-center gap-3 w-full"
                                        >
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-200 min-w-[90px]">
                                                Plat {index + 1}
                                            </label>

                                            <input
                                                type="text"
                                                value={plat}
                                                onChange={(e) => handleRepasChange(index, e.target.value)}
                                                className="w-full sm:flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/50 px-3 py-2 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 outline-none transition-all duration-300 shadow-sm"
                                                placeholder="Entrée / Plat / Fromages / Dessert"
                                            />

                                            {repas.length > 1 && (
                                                <motion.button
                                                    whileHover={{ scale: 1.15, rotate: 10 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => removeRepas(index)}
                                                    className="text-red-500 hover:text-red-700 transition-all duration-200"
                                                    title="Supprimer"
                                                >
                                                    <FiTrash2 size={18} />
                                                </motion.button>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                <motion.button
                                    type="button"
                                    onClick={addRepas}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-md transition-all duration-300"
                                >
                                    <FiPlusCircle size={16} />
                                    Ajouter un plat
                                </motion.button>

                                <motion.div
                                    className="flex justify-end mt-6"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <motion.button
                                        disabled={!isRepasValid}
                                        whileHover={isRepasValid ? { scale: 1.05 } : {}}
                                        whileTap={isRepasValid ? { scale: 0.95 } : {}}
                                        className={`flex items-center gap-2 px-5 py-2 font-semibold rounded-lg shadow-md transition-all duration-300 ${isRepasValid
                                            ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:shadow-lg hover:from-emerald-500 hover:to-teal-400"
                                            : "bg-gray-400 cursor-not-allowed text-white"
                                            }`}
                                        onClick={() => {
                                            setCurrentStep(100);
                                            setSelectedPlats([...repas]);
                                            analyseResult(0, vinsFiltre, repas, "conseilVin");
                                        }}
                                    >
                                        <FiCheckCircle size={18} />
                                        Valider
                                    </motion.button>
                                </motion.div>
                            </div>
                        )}

                        {currentStep == 6 && manual == false &&
                            <div>
                                <h1>Voulez-vous ajouter une nouvelle image? </h1>
                                <div className="flex gap-4 mt-4">
                                    <button
                                        onClick={() => { setCurrentStep(5) }}
                                        className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                                    >
                                        oui
                                    </button>

                                    <button
                                        onClick={() => {
                                            setCurrentStep(7);
                                            fetchPlats(UUIDTable);
                                        }}
                                        className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                                    >
                                        non
                                    </button>
                                </div>

                            </div>
                        }

                        {currentStep === 7 && platsCarte && manual === false && (() => {
                            const normalizedPlats = normalizePlatsData(platsCarte.Plats);

                            return (
                                <div>
                                    <h2 className="font-semibold text-lg">Quels plats voulez-vous utiliser ?</h2>

                                    {Object.entries(normalizedPlats).map(([category, dishes], index) => (
                                        <div key={index} className="mb-6">
                                            <h2 className="text-lg font-semibold capitalize mb-2 underline mt-2">
                                                {category.replace(/_/g, ' ')}
                                            </h2>

                                            {dishes.map((dishObj, i) => {
                                                const dishName = dishObj.nom;

                                                return (
                                                    <div key={i} className="p-2">
                                                        <label className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedPlats.includes(dishName)}
                                                                onChange={() => handleCheckboxChange(dishName)}
                                                            />
                                                            <span>{dishName}</span>
                                                        </label>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}

                                    <button
                                        onClick={() => analyseResult(0, vinsFiltre, selectedPlats, "conseilVin")}
                                        className="mt-4 px-6 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700 transition duration-200 shadow"
                                    >
                                        Valider
                                    </button>
                                </div>
                            );
                        })()}

                    </>
                );

            case 'rayon':
                return (
                    <>
                        {currentStep === 1 && (
                            <div>
                                <h1>Le vin le plus intéressant de ce rayon ou vin adapté à un plat ?</h1>
                                <div className="flex gap-4 mt-4">
                                    <button
                                        onClick={() => {
                                            setAdaptePlat(false);
                                            setRayonMode('best');
                                            setCurrentStep(2);
                                        }}
                                        className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                                    >
                                        Plus intéressant
                                    </button>

                                    <button
                                        onClick={() => {
                                            setAdaptePlat(true);
                                            setRayonMode('plat');
                                            setCurrentStep(2);
                                        }}
                                        className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                                    >
                                        Adapté à mon/mes plats
                                    </button>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && rayonMode === 'best' && (
                            <div className="relative w-full">
                                <FileUploadField
                                    label={"Votre image de rayon"}
                                    onSelect={(e) => imageBase64Uploader(e, 'rayon', 'vin')}
                                />
                            </div>
                        )}

                        {currentStep === 3 && rayonMode === 'best' && (
                            <div>
                                <h1>Voulez-vous ajouter une nouvelle image ?</h1>
                                <div className="flex gap-4 mt-4">
                                    <button
                                        onClick={() => setCurrentStep(2)}
                                        className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                                    >
                                        oui
                                    </button>

                                    <button
                                        onClick={() => setCurrentStep(100)}
                                        className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                                    >
                                        non
                                    </button>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && rayonMode === 'plat' && (
                            <div className="w-full max-w-3xl mx-auto space-y-8 p-6 rounded-2xl bg-gradient-to-b from-white/80 to-emerald-50/70 dark:from-gray-800/80 dark:to-gray-900/80 shadow-lg backdrop-blur-xl transition-all duration-500">

                                <motion.h3
                                    className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    Vos plats à associer
                                </motion.h3>

                                <AnimatePresence>
                                    {repas.map((plat, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.3 }}
                                            className="flex flex-col sm:flex-row items-center gap-3 w-full"
                                        >
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-200 min-w-[90px]">
                                                Plat {index + 1}
                                            </label>

                                            <input
                                                type="text"
                                                value={plat}
                                                onChange={(e) => handleRepasChange(index, e.target.value)}
                                                className="w-full sm:flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/50 px-3 py-2 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 outline-none transition-all duration-300 shadow-sm"
                                                placeholder="Entrée / Plat / Fromages / Dessert"
                                            />

                                            {repas.length > 1 && (
                                                <motion.button
                                                    whileHover={{ scale: 1.15, rotate: 10 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => removeRepas(index)}
                                                    className="text-red-500 hover:text-red-700 transition-all duration-200"
                                                    title="Supprimer"
                                                >
                                                    <FiTrash2 size={18} />
                                                </motion.button>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                <motion.button
                                    type="button"
                                    onClick={addRepas}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-md transition-all duration-300"
                                >
                                    <FiPlusCircle size={16} />
                                    Ajouter un plat
                                </motion.button>

                                <motion.div
                                    className="flex justify-end mt-6"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <motion.button
                                        disabled={!isRepasValid}
                                        whileHover={isRepasValid ? { scale: 1.05 } : {}}
                                        whileTap={isRepasValid ? { scale: 0.95 } : {}}
                                        className={`flex items-center gap-2 px-5 py-2 font-semibold rounded-lg shadow-md transition-all duration-300 ${isRepasValid
                                            ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:shadow-lg hover:from-emerald-500 hover:to-teal-400"
                                            : "bg-gray-400 cursor-not-allowed text-white"
                                            }`}
                                        onClick={() => {
                                            analyseResult(0, "", repas, "rayonPlatProfil");
                                        }}
                                    >
                                        <FiCheckCircle size={18} />
                                        Demander le profil
                                    </motion.button>
                                </motion.div>
                            </div>
                        )}

                        {currentStep === 3 && rayonMode === 'plat' && (
                            <div className="space-y-6 p-6">
                                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                                    Profil conseillé pour ton plat
                                </h2>

                                {rayonProfil ? (
                                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 dark:bg-gray-800/50 dark:border-emerald-900/40 space-y-1">
                                        {rayonProfil.couleur && (
                                            <p className="text-gray-700 dark:text-gray-100">
                                                <strong>Couleur :</strong> {rayonProfil.couleur}
                                            </p>
                                        )}
                                        {rayonProfil.region && (
                                            <p className="text-gray-700 dark:text-gray-100">
                                                <strong>Région :</strong> {rayonProfil.region}
                                            </p>
                                        )}
                                        {rayonProfil.type && (
                                            <p className="text-gray-700 dark:text-gray-100">
                                                <strong>Type :</strong> {rayonProfil.type}
                                            </p>
                                        )}
                                        {rayonProfil.prix && (
                                            <p className="text-gray-700 dark:text-gray-100">
                                                <strong>Budget :</strong> {rayonProfil.prix}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic">
                                        Pas de détail retourné par l’IA.
                                    </p>
                                )}

                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Maintenant envoie l’image du rayon, on te conseillera les meilleurs vins pour ton plat
                                </p>

                                <FileUploadField
                                    label={"Votre image de rayon"}
                                    onSelect={(e) => imageBase64Uploader(e, 'rayon', 'vin')}
                                />

                                <div className="flex justify-end">
                                    <button
                                        onClick={() => setCurrentStep(4)}
                                        className="px-6 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
                                    >
                                        Continuer
                                    </button>
                                </div>
                            </div>
                        )}

                        {currentStep === 4 && rayonMode === 'plat' && (
                            <div>
                                <h1>Voulez-vous ajouter une nouvelle image ?</h1>
                                <div className="flex gap-4 mt-4">
                                    <button
                                        onClick={() => setCurrentStep(3)}
                                        className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                                    >
                                        oui
                                    </button>

                                    <button
                                        onClick={() => setCurrentStep(100)}
                                        className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                                    >
                                        non
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                );

            case 'plat':
                return (
                    <>
                        <div className="w-full max-w-3xl mx-auto space-y-8 p-6 rounded-2xl bg-gradient-to-b from-white/80 to-emerald-50/70 dark:from-gray-800/80 dark:to-gray-900/80 shadow-lg backdrop-blur-xl transition-all duration-500">

                            <motion.div
                                className="mt-6 space-y-3"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <h4 className="text-md font-semibold text-gray-800 dark:text-gray-100">
                                    Apéritif :
                                </h4>

                                <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                                    {[
                                        { label: "Oui", value: "true" },
                                        { label: "Non, Merci", value: "false" }
                                    ].map(({ label, value }) => (
                                        <label
                                            key={value}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer border transition-all duration-300 ${aperitif === value
                                                ? "bg-emerald-600 text-white border-emerald-700 shadow-md"
                                                : "bg-white/70 dark:bg-gray-800/60 border-gray-300 dark:border-gray-700 hover:bg-emerald-50 dark:hover:bg-gray-700/70"
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="aperitifOption"
                                                value={value}
                                                checked={aperitif === value}
                                                onChange={(e) => setAperitif(e.target.value)}
                                                className="hidden"
                                            />
                                            <span>{label}</span>
                                        </label>
                                    ))}
                                </div>
                            </motion.div>

                            <motion.h3
                                className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                            >
                                Votre choix des plats
                            </motion.h3>

                            <AnimatePresence>
                                {repas.map((plat, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3 }}
                                        className="flex flex-col sm:flex-row items-center gap-3 w-full"
                                    >
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-200 min-w-[90px]">
                                            Plat {index + 1}
                                        </label>
                                        <input
                                            type="text"
                                            value={plat}
                                            onChange={(e) => handleRepasChange(index, e.target.value)}
                                            className="w-full sm:flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/50 px-3 py-2 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 outline-none transition-all duration-300 shadow-sm"
                                            placeholder="Entrée / Plat / Fromages / Dessert"
                                        />
                                        {repas.length > 1 && (
                                            <motion.button
                                                whileHover={{ scale: 1.15, rotate: 10 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => removeRepas(index)}
                                                className="text-red-500 hover:text-red-700 transition-all duration-200"
                                                title="Supprimer"
                                            >
                                                <FiTrash2 size={18} />
                                            </motion.button>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            <motion.button
                                type="button"
                                onClick={addRepas}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-md transition-all duration-300"
                            >
                                <FiPlusCircle size={16} />
                                Ajouter un plat
                            </motion.button>

                            <motion.div
                                className="mt-6 space-y-3"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <h4 className="text-md font-semibold text-gray-800 dark:text-gray-100">
                                    Digestif :
                                </h4>

                                <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                                    {[
                                        { label: "Oui", value: "true" },
                                        { label: "Non, Merci", value: "false" }
                                    ].map(({ label, value }) => (
                                        <label
                                            key={value}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer border transition-all duration-300 ${digestif === value
                                                ? "bg-emerald-600 text-white border-emerald-700 shadow-md"
                                                : "bg-white/70 dark:bg-gray-800/60 border-gray-300 dark:border-gray-700 hover:bg-emerald-50 dark:hover:bg-gray-700/70"
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="aperitifOption"
                                                value={value}
                                                checked={digestif === value}
                                                onChange={(e) => setDigestif(e.target.value)}
                                                className="hidden"
                                            />
                                            <span>{label}</span>
                                        </label>
                                    ))}
                                </div>
                            </motion.div>

                            <motion.div
                                className="mt-6 space-y-3"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <h4 className="text-md font-semibold text-gray-800 dark:text-gray-100">
                                    Sélection du vin :
                                </h4>

                                <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                                    {[
                                        { label: "Prendre dans la cave", value: "cave" },
                                        { label: "Accord mets-vin", value: "acheter" },
                                        { label: "Mixer les deux options", value: "mix" },
                                    ].map(({ label, value }) => (
                                        <label
                                            key={value}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer border transition-all duration-300 ${vinChoice === value
                                                ? "bg-emerald-600 text-white border-emerald-700 shadow-md"
                                                : "bg-white/70 dark:bg-gray-800/60 border-gray-300 dark:border-gray-700 hover:bg-emerald-50 dark:hover:bg-gray-700/70"
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="vinOption"
                                                value={value}
                                                checked={vinChoice === value}
                                                onChange={(e) => setVinChoice(e.target.value)}
                                                className="hidden"
                                            />
                                            <span>{label}</span>
                                        </label>
                                    ))}
                                </div>
                            </motion.div>

                            <AnimatePresence>
                                {["acheter", "mix"].includes(vinChoice) && (
                                    <motion.div
                                        key="budget"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.4 }}
                                        className="mt-6"
                                    >
                                        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
                                            Budget Maximum
                                        </h3>

                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {[
                                                { label: "30 €", value: "30" },
                                                { label: "50 €", value: "50" },
                                                { label: "80 €", value: "80" },
                                                { label: "120 €", value: "120" },
                                                { label: "150 €", value: "150" },
                                                { label: "Pas de limite", value: "pas de limite, plus de 150" },
                                            ].map(({ label, value }) => (
                                                <motion.label
                                                    key={value}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className={`flex items-center justify-center px-3 py-2 rounded-lg border text-sm font-medium cursor-pointer transition-all duration-300 ${budget == value
                                                        ? "bg-emerald-600 text-white border-emerald-700 shadow-md"
                                                        : "bg-white/70 dark:bg-gray-800/60 border-gray-300 dark:border-gray-700 hover:bg-emerald-50 dark:hover:bg-gray-700/70"
                                                        }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="budget"
                                                        value={value}
                                                        checked={budget == value}
                                                        onChange={(e) => setBudget(e.target.value)}
                                                        className="hidden"
                                                    />
                                                    {label}
                                                </motion.label>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <motion.div
                                className="flex justify-end mt-6"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <motion.button
                                    disabled={!isRepasValid}
                                    whileHover={isRepasValid ? { scale: 1.05 } : {}}
                                    whileTap={isRepasValid ? { scale: 0.95 } : {}}
                                    className={`flex items-center gap-2 px-5 py-2 font-semibold rounded-lg shadow-md transition-all duration-300 ${isRepasValid
                                        ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:shadow-lg hover:from-emerald-500 hover:to-teal-400"
                                        : "bg-gray-400 cursor-not-allowed text-white"
                                        }`}
                                    onClick={() => analyseResult(0, '', repas, "conseilPlat")}
                                >
                                    <FiCheckCircle size={18} />
                                    Valider
                                </motion.button>
                            </motion.div>
                        </div>
                    </>
                );

            case 'cave':

                analyseResult(0, '', selectedPlats, "conseilCave")
            default:
                return null;
        }
    };

    const restartHandler = () => {
        setIsAnalyzing(false)
        setImage(null)
        setUUIDTable('')
        setRepas([''])
        setVinChoice('cave')
        setBudget(0)
        setBouteille(0)
        setCurrentStep(1)
        setVinResult(null)
        setConseilResult(null)
        setSelectedPlats([])
        setManual(false)
        setAdaptePlat(true)
        setEquilibre('')
        setAperitif(false)
        setDigestif(false)
    }

    const normalizeConseilData = (rawData) => {
        if (!rawData) return {};

        const conseilArray = Array.isArray(rawData)
            ? rawData
            : rawData.conseil || [];

        const categorized = {};

        conseilArray.forEach(item => {
            if (typeof item !== "object" || item === null) return;

            Object.entries(item).forEach(([categoryName, vin]) => {
                if (categoryName === "vraiplat") return;
                if (vin && typeof vin === "object" && (("nom" in vin) || ("nomvin" in vin))) {
                    if (!categorized[categoryName]) categorized[categoryName] = [];
                    categorized[categoryName].push(vin);
                }
            });
        });

        return categorized;
    };

    const vinResultNormalize = (vinResults) => {
        if (!vinResults || !Array.isArray(vinResults.conseil)) {
            return {};
        }

        const grouped = {
            Aperitif: [],
            Digestif: []
        };

        vinResults.conseil.forEach(item => {
            if (item.vinaperitif) {
                const vin = typeof item.vinaperitif === 'object'
                    ? item.vinaperitif
                    : { nomvin: item.vinaperitif, ...item };

                grouped.Aperitif.push({
                    ...vin,
                    region: vin.region || vin.région || "Non précisée"
                });
            }

            if (item.vindigestif) {
                const vin = typeof item.vindigestif === 'object'
                    ? item.vindigestif
                    : { nomvin: item.vindigestif, ...item };

                grouped.Digestif.push({
                    ...vin,
                    region: vin.region || vin.région || "Non précisée"
                });
            }

            if (item.plat) {
                const platData = typeof item.plat === 'object' ? item.plat : item;
                const platName = platData.plat || platData.nomvin || "Autre";

                if (!grouped[platName]) {
                    grouped[platName] = [];
                }

                grouped[platName].push({
                    ...platData,
                    region: platData.region || platData.région || "Non précisée"
                });
            }
        });

        return grouped;
    };

    const vinCouleurCard = {
        rouge: 'bg-red-100 border-red-500 text-red-800',
        blanc: 'bg-yellow-100 border-yellow-500 text-yellow-800',
        rosé: 'bg-pink-100 border-pink-500 text-pink-800',
        default: 'bg-gray-100 border-gray-400 text-gray-800',
    };

    const groupByColor = (conseils) => {
        const grouped = {};

        conseils.forEach((item) => {
            const color = item.couleur;
            if (!grouped[color]) {
                grouped[color] = [];
            }
            grouped[color].push(item);
        });

        return grouped;
    };

    return (
        <div>
            <div className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 px-4 py-6">
                <div className="max-w-6xl mx-auto">
                    {id != 'plat' ? <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gabriel vous donne les meilleurs choix. </h1>
                        : <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gabriel sélectionne les meilleurs vins pour vous. </h1>}
                </div>
            </div>
            <div className="max-w-4xl mx-auto mt-4 flex justify-start">
                <motion.button
                    onClick={() => {
                        if (currentStep === 1) {
                            localStorage.removeItem("lastSommelierResult");
                            setOldResult(null);
                            navigate('/sommelier');
                        } else {
                            lastStepHandler();
                        }
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-100 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300 shadow-sm"
                >
                    <i className="pi pi-arrow-left text-gray-600"></i>
                    {currentStep === 1 ? 'Retour au menu' : 'Étape précédente'}
                </motion.button>
            </div>

            <div className='bg-white rounded-2xl border mt-8 px-4 sm:px-10 w-full max-w-sm sm:max-w-4xl mx-auto'>
                <div className="relative flex flex-col bg-white dark:bg-gray-800 px-6 pb-6 transition-all duration-500">

                    {/* 🧩 CAS 2 : en cours d’analyse */}
                    {isAnalyzing ? (
                        <div className="mt-5 flex items-center justify-center">
                            <i className="pi pi-spinner pi-spin text-2xl text-blue-500 dark:text-white" />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Analyse en cours...</span>
                        </div>
                    ) : (
                        !vinResult && !conseilResult && (
                            <div className="mt-4 space-y-4">
                                {renderForm()}
                            </div>
                        )
                    )}

                    {/* 🧩 CAS 3 : résultat des conseils (affiché seulement si PAS de vinResult) */}
                    {conseilResult && !vinResult && !isAnalyzing && conseilResult?.vraiPlat !== false && (() => {
                        const categories = normalizeConseilData(conseilResult);
                        const groupedByColor = groupByColor(conseilResult?.conseil);

                        return (
                            <div className="mt-10">
                                <motion.h1
                                    className="text-3xl sm:text-2xl font-semibold text-center text-emerald-700 dark:text-emerald-400 mb-10"
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    Gabriel vous recommande :
                                </motion.h1>

                                <AnimatePresence>
                                    {id !== "cave" ? (
                                        <div className="flex flex-col lg:flex-row lg:flex-wrap lg:justify-center lg:items-start gap-10 lg:gap-8">
                                            {/* --- Résultat ACTUEL --- */}
                                            {Object.entries(categories).map(([category, vins], i) => (
                                                <motion.div
                                                    key={category}
                                                    className="flex-1 min-w-[280px] max-w-sm"
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.15, duration: 0.5 }}
                                                >
                                                    <h2 className="text-xl sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 mb-4 flex items-center gap-2">
                                                        <FiStar className="text-emerald-500" />
                                                        {category === "Le Top" ? " Le Choix Idéal" : category}
                                                    </h2>

                                                    <div className="space-y-4">
                                                        {Array.isArray(vins) && vins.map((vin, index) => {
                                                            const region = vin.region || vin.région || "Non précisée";
                                                            return (
                                                                <motion.div
                                                                    key={index}
                                                                    whileHover={{ scale: 1.02 }}
                                                                    whileTap={{ scale: 0.98 }}
                                                                    className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50
                                                                    dark:from-gray-800 dark:to-gray-900
                                                                    border border-emerald-200 dark:border-gray-700
                                                                    shadow-lg hover:shadow-emerald-300/30 transition-all duration-300
                                                                    backdrop-blur-md"
                                                                >
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <FiWine className="text-emerald-500" />
                                                                        <p className="font-semibold text-gray-900 dark:text-gray-100">{vin.nom}</p>
                                                                    </div>
                                                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                                                        <strong>Couleur :</strong> {vin.couleur}
                                                                    </p>
                                                                    {vin.appellation && (
                                                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                                                            <strong>Appellation :</strong> {vin.appellation}
                                                                        </p>
                                                                    )}
                                                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                                                        <strong>Région :</strong> {region}
                                                                    </p>
                                                                    {vin.prix && (
                                                                        <div className="text-sm text-gray-700 dark:text-gray-300">
                                                                            <strong>Prix :</strong>{" "}
                                                                            {Array.isArray(vin.prix)
                                                                                ? vin.prix.map((p, i) => {
                                                                                    if (typeof p === "object" && p !== null) {
                                                                                        return (
                                                                                            <span key={i} className="inline-block bg-gray-100 px-2 py-1 rounded mr-2">
                                                                                                {p.contenance ? `${p.contenance} — ` : ""}
                                                                                                {p.prix ?? "Non précisé"}
                                                                                            </span>
                                                                                        );
                                                                                    }
                                                                                    if (typeof p === "number") {
                                                                                        return (
                                                                                            <span key={i} className="inline-block bg-gray-100 px-2 py-1 rounded mr-2">
                                                                                                {p.toFixed(2)} €
                                                                                            </span>
                                                                                        );
                                                                                    }
                                                                                    if (typeof p === "string") {
                                                                                        return (
                                                                                            <span key={i} className="inline-block bg-gray-100 px-2 py-1 rounded mr-2">
                                                                                                {p.includes("€") ? p : `${p} €`}
                                                                                            </span>
                                                                                        );
                                                                                    }
                                                                                    return null;
                                                                                })
                                                                                : formatPrice(vin.prix)}
                                                                        </div>
                                                                    )}
                                                                </motion.div>
                                                            );
                                                        })}
                                                    </div>
                                                </motion.div>
                                            ))}

                                            {oldResult && showOldResult && oldResult.conseilResult && (
                                                <div className="w-full border-t border-gray-300 dark:border-gray-700 pt-8">
                                                    <h2 className="text-xl font-semibold text-center text-gray-800 dark:text-gray-200 mb-6">
                                                        Ancien résultat sauvegardé
                                                    </h2>
                                                    <div className="flex flex-col lg:flex-row lg:flex-wrap lg:justify-center lg:items-start gap-10 lg:gap-8">
                                                        {Object.entries(
                                                            normalizeConseilData(oldResult.conseilResult?.conseil || oldResult.conseilResult)
                                                        ).map(([category, vins], i) => (
                                                            <motion.div
                                                                key={`old-${category}`}
                                                                className="flex-1 min-w-[280px] max-w-sm mx-auto"
                                                                initial={{ opacity: 0, y: 20 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: i * 0.1, duration: 0.4 }}
                                                            >
                                                                <h3 className="text-lg font-bold text-amber-600 mb-4">{category}</h3>
                                                                <div className="space-y-3">
                                                                    {vins.map((vin, j) => (
                                                                        <div
                                                                            key={j}
                                                                            className="p-3 bg-amber-50 dark:bg-gray-800 rounded-lg shadow-sm border border-amber-200"
                                                                        >
                                                                            <p className="font-medium text-gray-900 dark:text-gray-100">{vin.nom}</p>
                                                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                                                <strong>Région :</strong>{" "}
                                                                                {vin.region || vin["région"] || vin.Region || "Non précisée"}
                                                                            </p>
                                                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                                                <strong>Couleur :</strong> {vin.couleur || "Non précisée"}
                                                                            </p>
                                                                            {vin.prix !== undefined && (
                                                                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                                                                    <strong>Prix :</strong>{" "}
                                                                                    {typeof vin.prix === "number"
                                                                                        ? `${vin.prix.toFixed(2)} €`
                                                                                        : Array.isArray(vin.prix)
                                                                                            ? vin.prix.map((p, i) => (
                                                                                                <span key={i} className="inline-block px-2 py-1 rounded mr-2">
                                                                                                    {typeof p === "object"
                                                                                                        ? `${p.contenance || ""} ${p.prix || ""}`
                                                                                                        : `${p} €`}
                                                                                                </span>
                                                                                            ))
                                                                                            : vin.prix || "Non précisé"}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {oldResult && (
                                                <div className="w-full flex justify-center mt-10">
                                                    <motion.button
                                                        onClick={() => setShowOldResult(s => !s)}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 text-white font-semibold shadow-lg hover:bg-amber-600 transition-all duration-300"
                                                    >
                                                        <i className="pi pi-history"></i>
                                                        {showOldResult ? "Masquer l'ancien résultat" : "Afficher l'ancien résultat"}
                                                    </motion.button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <motion.div
                                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            {Object.entries(groupedByColor).map(([color, vins], i) => (
                                                <motion.div
                                                    key={color}
                                                    initial={{ opacity: 0, y: 30 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.1 }}
                                                    className={`p-6 rounded-2xl shadow-lg backdrop-blur-md border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${vinCouleurCard[color.toLowerCase()] ||
                                                        "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900"
                                                        }`}
                                                >
                                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                                        {color}
                                                    </h2>
                                                    {vins.map((vin, index) => (
                                                        <div
                                                            key={index}
                                                            className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700 last:border-none last:pb-0"
                                                        >
                                                            <p className="text-sm text-gray-800 dark:text-gray-200">
                                                                <strong>Type :</strong> {vin.type}
                                                            </p>
                                                            <p className="text-sm text-gray-800 dark:text-gray-200">
                                                                <strong>Région :</strong> {vin.region}
                                                            </p>
                                                            <p className="text-sm text-gray-800 dark:text-gray-200">
                                                                <strong>Garde :</strong> {vin.tempsDeGarde}
                                                            </p>
                                                            <p className="text-sm text-gray-800 dark:text-gray-200">
                                                                <strong>Quantité :</strong> {vin.quantite} bouteille(s)
                                                            </p>
                                                        </div>
                                                    ))}
                                                </motion.div>
                                            ))}

                                            {oldResult && showOldResult && oldResult.conseilResult && (
                                                <div className="col-span-full mt-12 border-t border-gray-300 dark:border-gray-700 pt-8">
                                                    <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-gray-200 mb-8">
                                                        Ancien résultat sauvegardé
                                                    </h2>
                                                </div>
                                            )}

                                            {oldResult && (
                                                <div className="col-span-full flex justify-center mt-10">
                                                    <motion.button
                                                        onClick={() => setShowOldResult(s => !s)}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 text-white font-semibold shadow-lg hover:bg-amber-600 transition-all duration-300"
                                                    >
                                                        <i className="pi pi-history"></i>
                                                        {showOldResult ? "Masquer l'ancien résultat" : "Afficher l'ancien résultat"}
                                                    </motion.button>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })()}


                    {/* 🧩 CAS 4 : résultat des vins */}
                    {vinResult && !isAnalyzing && vinResult?.vraiPlat !== false && (() => {
                        const groupedByPlat = vinResultNormalize(vinResult);
                        return (
                            <div className="mt-10">
                                <motion.h1
                                    className="text-3xl sm:text-2xl italic font-semibold text-center text-emerald-700 dark:text-emerald-400 mb-10"
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    Notre IA vous suggère :
                                </motion.h1>

                                <div className="space-y-10">
                                    {["Aperitif", ...Object.keys(groupedByPlat).filter(k => k !== "Aperitif" && k !== "Digestif"), "Digestif"]
                                        .filter(key => groupedByPlat[key]?.length > 0)
                                        .map((plat, i) => {
                                            const vins = groupedByPlat[plat];
                                            const sectionTitle =
                                                plat === "Aperitif"
                                                    ? "En apéritif"
                                                    : plat === "Digestif"
                                                        ? "En digestif"
                                                        : `Votre plat : ${plat.charAt(0).toUpperCase() + plat.slice(1)}`;

                                            return (
                                                <motion.div
                                                    key={plat}
                                                    className="rounded-2xl p-6 bg-gradient-to-br from-white to-emerald-50 dark:from-gray-800 dark:to-gray-900 shadow-lg border border-emerald-200 dark:border-gray-700"
                                                    initial={{ opacity: 0, y: 25 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.15 }}
                                                >
                                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                                        {sectionTitle}
                                                    </h2>

                                                    <div className={vins.length > 1 ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" : "flex justify-center items-center w-full"}>
                                                        {vins
                                                            .filter(vin => vin && (vin.nomvin || vin.nom || vin.Nom || vin.vindigestif))
                                                            .map((vin, index) => {
                                                                const hasCaveData = !!vin.UUID_ || !!vin.base64_132etiquette;
                                                                const imgSrc = vin.base64_132etiquette
                                                                    ? `data:image/jpeg;base64,${vin.base64_132etiquette}`
                                                                    : "/images/default-avatar.jpg";

                                                                return (
                                                                    <motion.div
                                                                        key={index}
                                                                        whileHover={{ scale: hasCaveData ? 1.03 : 1 }}
                                                                        onClick={() => hasCaveData && navigate(`/vin/${vin.UUID_}`)}
                                                                        className={`rounded-xl border border-emerald-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/60 p-4 shadow-md transition-all duration-300 flex flex-col gap-3 ${hasCaveData ? "cursor-pointer hover:shadow-emerald-400/20" : "cursor-default"
                                                                            }`}
                                                                    >
                                                                        {!hasCaveData && (
                                                                            <div className="mb-2 text-center">
                                                                                <span className="text-emerald-700 dark:text-emerald-400 font-semibold italic">
                                                                                    Notre IA vous propose d’acheter :
                                                                                </span>
                                                                            </div>
                                                                        )}

                                                                        {hasCaveData ? (
                                                                            <div className="flex items-start gap-3">
                                                                                <div className="flex-shrink-0">
                                                                                    <img
                                                                                        src={imgSrc}
                                                                                        alt={vin.nomvin || "Vin"}
                                                                                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm"
                                                                                        loading="lazy"
                                                                                    />
                                                                                </div>
                                                                                <div className="flex-1">
                                                                                    <p className="text-sm text-gray-800 dark:text-gray-100">
                                                                                        <strong>Nom :</strong> {vin.nomvin || vin.nom || vin.Nom}
                                                                                    </p>
                                                                                    <p className="text-sm text-gray-800 dark:text-gray-100">
                                                                                        <strong>Couleur :</strong> {vin.couleur || vin.Couleur}
                                                                                    </p>
                                                                                    <p className="text-sm text-gray-800 dark:text-gray-100">
                                                                                        <strong>Appellation :</strong> {vin.appellation || vin.Appellation}
                                                                                    </p>
                                                                                    <p className="text-sm text-gray-800 dark:text-gray-100">
                                                                                        <strong>Région :</strong> {vin.region || vin.Region || vin.région || vin.Région}
                                                                                    </p>

                                                                                    {vin.prix && (
                                                                                        <div className="text-sm text-gray-700 dark:text-gray-300">
                                                                                            <strong>Prix :</strong>{" "}
                                                                                            {Array.isArray(vin.prix)
                                                                                                ? vin.prix.map((p, i) => (
                                                                                                    <span key={i} className="inline-block bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded mr-2">
                                                                                                        {p.contenance} — {p.prix}
                                                                                                    </span>
                                                                                                ))
                                                                                                : formatPrice(vin.prix)}
                                                                                        </div>
                                                                                    )}

                                                                                    {vin.Etagere && (
                                                                                        <p className="text-sm text-gray-800 dark:text-gray-100 mt-1">
                                                                                            <strong>Lieu de stockage :</strong> {vin.Etagere}
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="mt-2">
                                                                                <p className="text-sm text-gray-800 dark:text-gray-100">
                                                                                    <strong>Nom :</strong> {vin.nomvin || vin.nom || vin.Nom}
                                                                                </p>
                                                                                <p className="text-sm text-gray-800 dark:text-gray-100">
                                                                                    <strong>Couleur :</strong> {vin.couleur || vin.Couleur}
                                                                                </p>
                                                                                <p className="text-sm text-gray-800 dark:text-gray-100">
                                                                                    <strong>Appellation :</strong> {vin.appellation || vin.Appellation}
                                                                                </p>
                                                                                <p className="text-sm text-gray-800 dark:text-gray-100">
                                                                                    <strong>Région :</strong> {vin.region || vin.Region || vin.région || vin.Région}
                                                                                </p>
                                                                                {vin.prix && (
                                                                                    <div className="text-sm text-gray-700 dark:text-gray-300">
                                                                                        <strong>Prix :</strong>{" "}
                                                                                        {Array.isArray(vin.prix)
                                                                                            ? vin.prix.map((p, i) => (
                                                                                                <span key={i} className="inline-block bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded mr-2">
                                                                                                    {p.contenance} — {p.prix}
                                                                                                </span>
                                                                                            ))
                                                                                            : formatPrice(vin.prix)}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </motion.div>
                                                                );
                                                            })}
                                                    </div>
                                                </motion.div>
                                            );
                                        })}

                                    {oldResult && showOldResult && oldResult?.vinResult && (
                                        <div className="mt-12 border-t border-gray-300 dark:border-gray-700 pt-8">
                                            <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-gray-200 mb-8">
                                                Ancien résultat sauvegardé
                                            </h2>

                                            {(() => {
                                                const groupedByPlatOld = vinResultNormalize(oldResult.vinResult);
                                                return (
                                                    <div className="space-y-10">
                                                        {["Aperitif", ...Object.keys(groupedByPlatOld).filter(k => k !== "Aperitif" && k !== "Digestif"), "Digestif"]
                                                            .filter(key => groupedByPlatOld[key]?.length > 0)
                                                            .map((plat, i) => {
                                                                const vins = groupedByPlatOld[plat];
                                                                const sectionTitle =
                                                                    plat === "Aperitif"
                                                                        ? "En apéritif"
                                                                        : plat === "Digestif"
                                                                            ? "En digestif"
                                                                            : `Votre plat : ${plat.charAt(0).toUpperCase() + plat.slice(1)}`;

                                                                return (
                                                                    <motion.div
                                                                        key={plat}
                                                                        className="rounded-2xl p-6 bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-800 dark:to-gray-900 shadow-lg border border-amber-300 dark:border-gray-700"
                                                                        initial={{ opacity: 0, y: 25 }}
                                                                        animate={{ opacity: 1, y: 0 }}
                                                                        transition={{ delay: i * 0.15 }}
                                                                    >
                                                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                                                            {sectionTitle}
                                                                        </h2>

                                                                        <div className={vins.length > 1 ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" : "flex justify-center items-center w-full"}>
                                                                            {vins
                                                                                .filter(vin => vin && (vin.nomvin || vin.nom || vin.Nom || vin.vindigestif))
                                                                                .map((vin, index) => {
                                                                                    const hasCaveData = !!vin.UUID_ || !!vin.base64_132etiquette;
                                                                                    const imgSrc = vin.base64_132etiquette
                                                                                        ? `data:image/jpeg;base64,${vin.base64_132etiquette}`
                                                                                        : "/images/default-avatar.jpg";

                                                                                    return (
                                                                                        <motion.div
                                                                                            key={index}
                                                                                            whileHover={{ scale: 1.03 }}
                                                                                            onClick={() => hasCaveData && navigate(`/vin/${vin.UUID_}`)}
                                                                                            className="rounded-xl border border-amber-400 dark:border-gray-700 bg-white/70 dark:bg-gray-800/60 p-4 shadow-md hover:shadow-amber-300/20 transition-all duration-300 flex flex-col gap-3"
                                                                                        >
                                                                                            {!hasCaveData && (
                                                                                                <div className="mb-2 text-center">
                                                                                                    <span className="text-amber-700 dark:text-amber-400 font-semibold italic">
                                                                                                        Notre IA vous proposait :
                                                                                                    </span>
                                                                                                </div>
                                                                                            )}

                                                                                            {hasCaveData ? (
                                                                                                <div className="flex items-start gap-3">
                                                                                                    <div className="flex-shrink-0">
                                                                                                        <img
                                                                                                            src={imgSrc}
                                                                                                            alt={vin.nomvin || "Vin"}
                                                                                                            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm"
                                                                                                            loading="lazy"
                                                                                                        />
                                                                                                    </div>
                                                                                                    <div className="flex-1">
                                                                                                        <p className="text-sm text-gray-800 dark:text-gray-100">
                                                                                                            <strong>Nom :</strong> {vin.nomvin || vin.nom || vin.Nom}
                                                                                                        </p>
                                                                                                        <p className="text-sm text-gray-800 dark:text-gray-100">
                                                                                                            <strong>Couleur :</strong> {vin.couleur || vin.Couleur}
                                                                                                        </p>
                                                                                                        <p className="text-sm text-gray-800 dark:text-gray-100">
                                                                                                            <strong>Appellation :</strong> {vin.appellation || vin.Appellation}
                                                                                                        </p>
                                                                                                        <p className="text-sm text-gray-800 dark:text-gray-100">
                                                                                                            <strong>Région :</strong> {vin.region || vin.Region || vin.région || vin.Région}
                                                                                                        </p>

                                                                                                        {vin.prix && (
                                                                                                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                                                                                                <strong>Prix :</strong>{" "}
                                                                                                                {Array.isArray(vin.prix)
                                                                                                                    ? vin.prix.map((p, i) => (
                                                                                                                        <span key={i} className="inline-block bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded mr-2">
                                                                                                                            {p.contenance} — {p.prix}
                                                                                                                        </span>
                                                                                                                    ))
                                                                                                                    : formatPrice(vin.prix)}
                                                                                                            </div>
                                                                                                        )}

                                                                                                        {vin.Etagere && (
                                                                                                            <p className="text-sm text-gray-800 dark:text-gray-100 mt-1">
                                                                                                                <strong>Lieu de stockage :</strong> {vin.Etagere}
                                                                                                            </p>
                                                                                                        )}
                                                                                                    </div>
                                                                                                </div>
                                                                                            ) : (
                                                                                                <div className="mt-2">
                                                                                                    <p className="text-sm text-gray-800 dark:text-gray-100">
                                                                                                        <strong>Nom :</strong> {vin.nomvin || vin.nom || vin.Nom}
                                                                                                    </p>
                                                                                                    <p className="text-sm text-gray-800 dark:text-gray-100">
                                                                                                        <strong>Couleur :</strong> {vin.couleur || vin.Couleur}
                                                                                                    </p>
                                                                                                    <p className="text-sm text-gray-800 dark:text-gray-100">
                                                                                                        <strong>Appellation :</strong> {vin.appellation || vin.Appellation}
                                                                                                    </p>
                                                                                                    <p className="text-sm text-gray-800 dark:text-gray-100">
                                                                                                        <strong>Région :</strong> {vin.region || vin.Region || vin.région || vin.Région}
                                                                                                    </p>
                                                                                                    {vin.prix && (
                                                                                                        <div className="text-sm text-gray-700 dark:text-gray-300">
                                                                                                            <strong>Prix :</strong>{" "}
                                                                                                            {Array.isArray(vin.prix)
                                                                                                                ? vin.prix.map((p, i) => (
                                                                                                                    <span key={i} className="inline-block bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded mr-2">
                                                                                                                        {p.contenance} — {p.prix}
                                                                                                                    </span>
                                                                                                                ))
                                                                                                                : formatPrice(vin.prix)}
                                                                                                        </div>
                                                                                                    )}
                                                                                                </div>
                                                                                            )}
                                                                                        </motion.div>
                                                                                    );
                                                                                })}
                                                                        </div>
                                                                    </motion.div>
                                                                );
                                                            })}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}

                                    {oldResult && (
                                        <div className="flex justify-center mt-10">
                                            <motion.button
                                                onClick={() => setShowOldResult(s => !s)}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 text-white font-semibold shadow-lg hover:bg-amber-600 transition-all duration-300"
                                            >
                                                <i className="pi pi-history"></i>
                                                {showOldResult ? "Masquer l'ancien résultat" : "Afficher l'ancien résultat"}
                                            </motion.button>
                                        </div>
                                    )}

                                    {missingWines.length > 0 && (
                                        <div className="flex justify-center mt-8">
                                            <motion.button
                                                onClick={() => {
                                                    const oldData = {
                                                        vinResult,
                                                        conseilResult,
                                                        missingWines,
                                                        uuid: vinResult?.uuid || conseilResult?.uuid || UUIDTable || null,
                                                        timestamp: new Date().toISOString(),
                                                    };
                                                    localStorage.setItem("lastSommelierResult", JSON.stringify(oldData));
                                                    setOldResult(oldData);

                                                    // 2) on ouvre le panneau
                                                    setShowSimilarPanel(s => !s);
                                                }}
                                                whileHover={{ scale: 1.06 }}
                                                whileTap={{ scale: 0.96 }}
                                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                                            >
                                                <i className="pi pi-compass"></i>
                                                Trouver des vins similaires dans ma cave
                                            </motion.button>
                                        </div>
                                    )}

                                    <AnimatePresence>
                                        {showSimilarPanel && (
                                            <motion.div
                                                key="similar-panel"
                                                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 24, scale: 0.98 }}
                                                transition={{ duration: 0.35 }}
                                                className="mt-8 mx-auto w-full max-w-3xl rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-gradient-to-b from-white/70 to-indigo-50/60 dark:from-gray-800/70 dark:to-gray-900/60 shadow-xl backdrop-blur-xl p-6"
                                            >
                                                <motion.h3
                                                    initial={{ opacity: 0, y: -8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="text-xl font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-2 mb-4"
                                                >
                                                    <i className="pi pi-sparkles"></i>
                                                    Vins non présents dans votre cave
                                                </motion.h3>

                                                {/* barre d’actions */}
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="text-sm text-gray-600 dark:text-gray-300">
                                                        Sélectionnez les vins pour lesquels vous souhaitez une alternative présente dans votre cave.
                                                    </span>
                                                    <button
                                                        onClick={() => {
                                                            if (selectedMissing.size === missingWines.length) {
                                                                setSelectedMissing(new Set());
                                                            } else {
                                                                setSelectedMissing(new Set(missingWines.map(m => m.name)));
                                                            }
                                                        }}
                                                        className="text-sm px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                                                    >
                                                        {selectedMissing.size === missingWines.length ? "Tout désélectionner" : "Tout sélectionner"}
                                                    </button>
                                                </div>

                                                {/* liste checkable */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {missingWines.map((m, idx) => {
                                                        const checked = selectedMissing.has(m.name);
                                                        return (
                                                            <motion.label
                                                                key={m.name + idx}
                                                                whileHover={{ scale: 1.02 }}
                                                                className={`group cursor-pointer rounded-xl border p-4 shadow-sm transition-all
                                                                ${checked
                                                                        ? "bg-indigo-600 text-white border-indigo-700 shadow-indigo-300/40"
                                                                        : "bg-white/70 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700"
                                                                    }`}
                                                            >
                                                                <div className="flex items-start gap-3">
                                                                    <input
                                                                        type="checkbox"
                                                                        aria-label={`sélectionner ${m.name}`}
                                                                        checked={checked}
                                                                        onChange={() => {
                                                                            setSelectedMissing(prev => {
                                                                                const copy = new Set(prev);
                                                                                if (copy.has(m.name)) copy.delete(m.name); else copy.add(m.name);
                                                                                return copy;
                                                                            });
                                                                        }}
                                                                        className="mt-1 accent-indigo-600 scale-110"
                                                                    />
                                                                    <div className="flex-1">
                                                                        <div className="font-semibold">{m.name}</div>
                                                                        <div className={`text-xs mt-1 ${checked ? "text-indigo-100" : "text-gray-500 dark:text-gray-400"}`}>
                                                                            Contexte : {m.context}
                                                                        </div>
                                                                    </div>
                                                                    <motion.div
                                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                                        animate={{ opacity: checked ? 1 : 0.4, scale: checked ? 1 : 0.95 }}
                                                                        className={`px-2 py-0.5 text-xs rounded-full border
                                                                        ${checked
                                                                                ? "bg-white/20 border-white/40"
                                                                                : "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                                                                            }`}
                                                                    >
                                                                        À rapprocher
                                                                    </motion.div>
                                                                </div>
                                                            </motion.label>
                                                        );
                                                    })}
                                                </div>

                                                {/* actions en bas */}
                                                <div className="flex items-center justify-end gap-3 mt-6">
                                                    <button
                                                        onClick={() => setShowSimilarPanel(false)}
                                                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                                    >
                                                        Annuler
                                                    </button>

                                                    <motion.button
                                                        disabled={selectedMissing.size === 0 || simLoading}
                                                        whileHover={selectedMissing.size > 0 && !simLoading ? { scale: 1.03 } : {}}
                                                        whileTap={selectedMissing.size > 0 && !simLoading ? { scale: 0.97 } : {}}
                                                        onClick={async () => {
                                                            try {
                                                                setSimLoading(true);

                                                                const oldData = {
                                                                    vinResult,
                                                                    conseilResult,
                                                                    missingWines,
                                                                    uuid: vinResult?.uuid || conseilResult?.uuid || UUIDTable || null,
                                                                    timestamp: new Date().toISOString(),
                                                                };
                                                                localStorage.setItem("lastSommelierResult", JSON.stringify(oldData));
                                                                setOldResult(oldData);

                                                                // Appel back : on envoie la liste de noms à rapprocher
                                                                const body = new FormData();
                                                                body.append("uuidTable", vinResult?.uuid || conseilResult?.uuid || UUIDTable || "");
                                                                body.append("typeCase", "similarFromCave");
                                                                body.append("vinsDemandes", JSON.stringify(Array.from(selectedMissing)));
                                                                body.append("token", token);

                                                                const res = await fetch(`${config.apiBaseUrl}/4DACTION/react_conseilPlatIA`, {
                                                                    method: "POST",
                                                                    headers: authHeader(),
                                                                    body
                                                                });

                                                                if (!res.ok) throw new Error("Erreur serveur");
                                                                const data = await res.json();
                                                                setSimMatches({
                                                                    matches: (data.conseil || []).map((m) => ({
                                                                        ...m,
                                                                        target: {
                                                                            nom: m?.target?.nom || m?.target?.Nom || "",
                                                                            appellation: m?.target?.appellation || m?.target?.Appellation || "",
                                                                            region: m?.target?.region || m?.target?.Region || m?.target?.Région || ""
                                                                        },
                                                                        match: {
                                                                            Nom: m?.match?.Nom || m?.match?.nom || "",
                                                                            Appellation: m?.match?.Appellation || m?.match?.appellation || "",
                                                                            Région: m?.match?.Région || m?.match?.Region || m?.match?.region || "",
                                                                            UUID_: m?.match?.UUID_ || m?.match?.uuid || "",
                                                                            base64_132etiquette: m?.match?.base64_132etiquette || "",
                                                                        },
                                                                        score: typeof m?.score === "number" ? m.score : null,
                                                                    })),
                                                                });
                                                                toast.current?.show({ severity: 'success', summary: 'OK', detail: 'Recherche de similitudes effectuée', life: 2500 });
                                                            } catch (e) {
                                                                toast.current?.show({ severity: 'error', summary: 'Erreur', detail: "Impossible d'obtenir les correspondances", life: 3500 });
                                                            } finally {
                                                                setSimLoading(false);
                                                            }
                                                        }}
                                                        className={`px-5 py-2.5 rounded-lg font-semibold shadow
                                                        ${selectedMissing.size === 0 || simLoading
                                                                ? "bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-not-allowed"
                                                                : "bg-indigo-600 hover:bg-indigo-700 text-white"
                                                            }`}
                                                    >
                                                        {simLoading ? "Recherche..." : "Lancer la recherche"}
                                                    </motion.button>
                                                </div>

                                                {/* affichage des matches */}
                                                {simMatches?.matches?.length > 0 && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 14 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="mt-8"
                                                    >
                                                        <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-3">
                                                            Correspondances trouvées dans votre cave
                                                        </h4>

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            {simMatches.matches.map((m, i) => {
                                                                const target = m?.target || {};
                                                                const targetLabel = [target.nom, target.appellation, target.region].filter(Boolean).join(" · ");

                                                                const match = m?.match || {};
                                                                const nom = match.Nom || match.nom || "";
                                                                const appellation = match.Appellation || match.appellation || "";
                                                                const region = match.Région || match.Region || match.region || "";
                                                                const uuid = match.UUID_ || match.uuid || "";
                                                                const imgB64 = match.base64_132etiquette || "";
                                                                const imgSrc = imgB64 ? `data:image/jpeg;base64,${imgB64}` : "/images/default-avatar.jpg";

                                                                const isClickable = !!uuid;

                                                                return (
                                                                    <motion.div
                                                                        key={i}
                                                                        whileHover={{ scale: isClickable ? 1.02 : 1 }}
                                                                        onClick={isClickable ? () => navigate(`/vin/${uuid}`) : undefined}
                                                                        onKeyDown={
                                                                            isClickable
                                                                                ? (e) => {
                                                                                    if (e.key === "Enter") navigate(`/vin/${uuid}`);
                                                                                }
                                                                                : undefined
                                                                        }
                                                                        role={isClickable ? "button" : undefined}
                                                                        tabIndex={isClickable ? 0 : -1}
                                                                        className={`rounded-xl border bg-white/70 dark:bg-gray-800/60 p-4 shadow transition
                                                                        ${isClickable ? "cursor-pointer hover:shadow-indigo-300/30" : "cursor-default"}`}
                                                                        aria-label={isClickable ? `Voir la fiche du vin ${nom}` : undefined}
                                                                    >
                                                                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                                                            Cible : <span className="font-medium">{targetLabel || "—"}</span>
                                                                        </div>

                                                                        {nom ? (
                                                                            <>
                                                                                {/* image */}
                                                                                <img
                                                                                    className="w-20 h-20 object-cover rounded-lg border mb-3"
                                                                                    src={imgSrc}
                                                                                    alt={nom}
                                                                                    loading="lazy"
                                                                                    draggable={false}
                                                                                />
                                                                                <div className="grid grid-cols-[100px,1fr] gap-x-2 gap-y-1 text-sm text-gray-800 dark:text-gray-100">
                                                                                    <div className="text-gray-500 dark:text-gray-400 flex items-center min-h-[1.75rem]">Nom :</div>
                                                                                    <div className="min-h-[1.75rem] flex items-center">
                                                                                        <span className="break-words whitespace-pre-wrap">{nom}</span>
                                                                                    </div>

                                                                                    <div className="text-gray-500 dark:text-gray-400 flex items-center min-h-[1.75rem]">Appellation :</div>
                                                                                    <div className="min-h-[1.75rem] flex items-center">
                                                                                        <span className="break-words whitespace-pre-wrap">{appellation || "—"}</span>
                                                                                    </div>

                                                                                    <div className="text-gray-500 dark:text-gray-400 flex items-center min-h-[1.75rem]">Région :</div>
                                                                                    <div className="min-h-[1.75rem] flex items-center">
                                                                                        <span className="break-words whitespace-pre-wrap">{region || "—"}</span>
                                                                                    </div>
                                                                                </div>

                                                                                {typeof m.score === "number" && (
                                                                                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                                                        Score de proximité : {Math.round(m.score * 100)}%
                                                                                    </div>
                                                                                )}
                                                                            </>
                                                                        ) : (
                                                                            <div className="text-sm text-gray-500 dark:text-gray-400 italic">Aucune correspondance</div>
                                                                        )}
                                                                    </motion.div>
                                                                );
                                                            })}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* bouton Recommencer en dessous si tu veux conserver */}
                                <motion.div
                                    className="flex justify-center mt-12"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <motion.button
                                        onClick={restartHandler}
                                        whileHover={{ scale: 1.08, rotate: 2 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold shadow-lg hover:shadow-emerald-300/40 transition-all duration-300"
                                    >
                                        <FiRefreshCcw size={18} />
                                        Recommencer
                                    </motion.button>
                                </motion.div>
                            </div>
                        );
                    })()}
                </div>

                {/*Afficher Toast*/}
                <Toast ref={toast} position="bottom-right" />
            </div>
        </div>

    )

}

export default SommelierForm