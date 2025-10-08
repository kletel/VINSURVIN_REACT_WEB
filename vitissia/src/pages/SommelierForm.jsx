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

    const { fetchPlats, platsCarte } = useFetchPlats();

    const shouldAnalyze = useRef(false);
    const [image, setImage] = useState(null);
    const [vinResult, setVinResult] = useState(null);
    const [UUIDTable, setUUIDTable] = useState('');
    const [repas, setRepas] = useState(['']);
    const [vinChoice, setVinChoice] = useState('cave');
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
    const [filters, setFilters] = useState({
        contenance: "",
        couleur: "",
        region: "",
    });

    const toast = useRef(null);

    const navigate = useNavigate();

    const returnToSommelierMenu = () => {
        navigate('/sommelier');
    };
    const handleCheckboxChange = (item) => {
        setSelectedPlats(prev =>
            prev.includes(item)
                ? prev.filter(p => p !== item)
                : [...prev, item]
        );
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

            if (typeCase == "conseilPlat")
                traiterImageIA(jsonAtraite)
            else if ((typeCase == "conseilVin") || (typeCase == "conseilCave"))
                traiterConseilIA(jsonAtraite);

            if (
                jsonAtraite?.vraiPlat === false ||
                (jsonAtraite?.conseil && jsonAtraite.conseil.vraiPlat === false)
            ) {
                return;
            }
            toast.current.show({ severity: 'success', summary: 'Succès', detail: 'Analyse réussie', life: 3000 });
        } catch (error) {
            if (retryCount < 2) {
                toast.current.show({ severity: 'warn', summary: 'Tentative échouée', detail: `Erreur lors de la tentative ${retryCount + 1}, nouvelle tentative...`, life: 3000 });
                await analyseResult(retryCount + 1, typeCase);
            } else {
                toast.current.show({ severity: 'error', summary: 'Erreur', detail: "Erreur lors de l'analyse après trois tentatives", life: 3000 });
            }
        } finally {
            setIsAnalyzing(false);
            clearFile.current = false
            setCurrentStep(currentStep + 1)

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
                    // Options de compression seulement si le fichier est trop volumineux
                    const options = {
                        maxSizeMB: 0.256,
                        maxWidthOrHeight: 800,
                        // maxWidthOrHeight: 1024,
                        useWebWorker: true,
                    };
                    const compressedFile = await imageCompression(file, options);
                    const reader = new FileReader();
                    reader.readAsDataURL(compressedFile);
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
            AnalyseSommelier(0); // Appeler AnalyseIA uniquement si le drapeau est activé
            shouldAnalyze.current = false; // Réinitialiser le drapeau après l'appel
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
            setCurrentStep(currentStep + 1)

        }
    };

    useEffect(() => {
        const platInvalide =
            conseilResult?.vraiPlat === false || vinResult?.vraiPlat === false;

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


    {/*const AnalyseImageIA = async (retryCount = 0) => {
        try {
            setIsAnalyzing(true);
            const formData = new FormData();
            if (image)
                formData.append("b64", image.image);
            formData.append("uuidUser", UUIDuser);
            formData.append("caseId", id);
            formData.append("plats", repas);
            formData.append("choice", vinChoice);
            formData.append("parPlat", parPlat);
            formData.append("budget", budget);
            formData.append("bouteille", bouteille);


            const response = await fetch(`${config.apiBaseUrl}/4DACTION/react_imageIA`, {
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
                    await AnalyseImageIA(retryCount + 1);
                    return;
                } else {
                    throw new Error("Réponse vide après trois tentatives");
                }
            }
            console.log("jsonAtraite", jsonAtraite);
            traiterImageIA(jsonAtraite);
            toast.current.show({ severity: 'success', summary: 'Succès', detail: 'Analyse réussie', life: 3000 });
            setCurrentStep(currentStep + 1)
        } catch (error) {
            if (retryCount < 2) {
                toast.current.show({ severity: 'warn', summary: 'Tentative échouée', detail: `Erreur lors de la tentative ${retryCount + 1}, nouvelle tentative...`, life: 3000 });
                await AnalyseImageIA(retryCount + 1);
            } else {
                toast.current.show({ severity: 'error', summary: 'Erreur', detail: "Erreur lors de l'analyse après trois tentatives", life: 3000 });
            }
        } finally {
            setIsAnalyzing(false);
            clearFile.current = false


        }
    };*/}

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
        setCurrentStep(currentStep - 1)
    }

    /* function getContenances(data) {
         const contenancesSet = new Set();
 
         if (
             data &&
             data.result &&
             Array.isArray(data.result.result)
         ) {
             for (const vin of data.result.result) {
                 if (Array.isArray(vin.format)) {
                     for (const entry of vin.format) {
                         if (entry.contenance) {
                             contenancesSet.add(entry.contenance);
                         }
                     }
                 }
             }
         }
 
         return Array.from(contenancesSet);
     }*/

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
                                        {/* Badges des filtres */}
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
                                    🍽️ Saisissez vos plats
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
                        {currentStep == 1 &&

                            <div className="relative w-full">
                                <FileUploadField label={"Votre image de rayon"}
                                    onSelect={(e) => imageBase64Uploader(e, 'rayon', 'vin')}
                                />

                            </div>
                        }

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

                        {currentStep == 3 &&
                            <div>
                                <h1>Le vin le plus intéressant de ce rayon ou vin adapté à un plat? </h1>
                                <div className="flex gap-4 mt-4">
                                    <button
                                        onClick={() => {
                                            setAdaptePlat(false);
                                            setCurrentStep(100);
                                            analyseResult(0, repas, "conseilVin");
                                        }}
                                        className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                                    >
                                        Plus intéressant
                                    </button>

                                    <button
                                        onClick={() => {
                                            setAdaptePlat(true);
                                            setCurrentStep(4);
                                        }}
                                        className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                                    >
                                        Adapté à mon/mes plats
                                    </button>
                                </div>

                            </div>
                        }

                        {currentStep === 4 && adaptePlat && (
                            <div className="w-full max-w-3xl mx-auto space-y-8 p-6 rounded-2xl bg-gradient-to-b from-white/80 to-emerald-50/70 dark:from-gray-800/80 dark:to-gray-900/80 shadow-lg backdrop-blur-xl transition-all duration-500">

                                <motion.h3
                                    className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    🍽️ Vos plats à associer
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
                                            analyseResult(0, "", repas, "conseilVin");
                                        }}
                                    >
                                        <FiCheckCircle size={18} />
                                        Valider
                                    </motion.button>
                                </motion.div>
                            </div>
                        )}


                    </>
                );

            case 'plat':
                return (
                    <>
                        <div className="w-full max-w-3xl mx-auto space-y-8 p-6 rounded-2xl bg-gradient-to-b from-white/80 to-emerald-50/70 dark:from-gray-800/80 dark:to-gray-900/80 shadow-lg backdrop-blur-xl transition-all duration-500">
                            <motion.h3
                                className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                            >
                                🍽️ Votre choix des plats
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
                                    🍷 Sélection du vin :
                                </h4>

                                <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                                    {[
                                        { label: "Prendre dans la cave", value: "cave" },
                                        { label: "Acheter un nouveau vin", value: "acheter" },
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
                                            💰 Budget Maximum
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
                return (

                    {/* <>

                        {currentStep == 1 && <div>
                            <h1 className="text-lg font-bold">Souhaitez-vous acheter des vins à partir d’un rayon en photo ou obtenir des recommandations générales?</h1>
                            <div className="flex gap-4 mt-4">
                                <button
                                    onClick={() => {
                                        setDansRayon(true);
                                        setCurrentStep(2);
                                    }}
                                    className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                                >
                                    <span className='pi pi-camera mr-2 mt-2'></span>Photo
                                </button>

                                <button
                                    onClick={() => {
                                        setDansRayon(false);
                                        setCurrentStep(3);
                                    }}
                                    className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                                >
                                    <span className='pi pi-pencil mr-2 mt-2'></span>Recommendations générales
                                </button>
                            </div>

                        </div>}

                        {currentStep == 2 && dansRayon == true && <div className="relative w-full">
                            <FileUploadField label={"Votre image de rayon:"}
                                onSelect={(e) => imageBase64Uploader(e, 'cave', 'vin')}
                            />
                        </div>}

                        {currentStep == 3 &&
                            <div>
                                <h1 className="text-lg font-bold">Sur quel critère souhaitez-vous équilibrer votre cave?</h1>
                                <div className="flex gap-4 mt-5">
                                    <button
                                        onClick={() => {
                                            setEquilibre('region');
                                            setCurrentStep(4);
                                        }}
                                        className="px-6 py-4 bg-green-600 text-white rounded hover:bg-green-700 transition"
                                    >
                                        Région des vins
                                    </button>

                                    <button
                                        onClick={() => {
                                            setEquilibre('garde');
                                            setCurrentStep(4);
                                        }}
                                        className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                                    >
                                        Période de garde des vins
                                    </button>

                                    <button
                                        onClick={() => {
                                            setEquilibre('type');
                                            setCurrentStep(4);
                                        }}
                                        className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                                    >
                                        Type des vins
                                    </button>
                                </div>

                            </div>}

                        {currentStep == 4 &&
                            <div className='grid grid-rows-3'>
                                <label className="block text-sm font-medium">Nombre de bouteilles à acheter</label>
                                <input type="number" className="form-input rounded-sm ring ring-neutral-300 p-2"
                                    onChange={(e) => { setBouteille(e.target.value) }}
                                />
                                <label className="block text-sm font-medium mt-2 ">Budget (€)</label>
                                <input type="number" className="form-input rounded-sm ring ring-neutral-300 p-2" placeholder='€'
                                    onChange={(e) => { setBudget(e.target.value) }}
                                />

                                <button
                                    disabled={!isCaveValid}
                                    className={`px-4 py-2 rounded-md transition mt-4 ${isCaveValid ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                    onClick={() => {
                                        setCurrentStep(100);
                                        analyseResult(0, '', selectedPlats, "conseilCave");
                                    }}
                                >
                                    Valider
                                </button>

                            </div>}
                    </>*/}
                );

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
    }

    //Normaliser le format de réponse
    const normalizeConseilData = (rawData) => {
        if (!rawData || !rawData.conseil) return {};

        let conseil = rawData.conseil;

        conseil = Array.isArray(conseil)
            ? conseil.filter(item =>
                typeof item === "object" &&
                item !== null &&
                Object.values(item).some(v => typeof v === "object" && v !== null && "nom" in v)
            )
            : conseil;

        if (typeof conseil === "object" && !Array.isArray(conseil)) {
            return { "Recommandé": [conseil] };
        }

        if (Array.isArray(conseil)) {
            const categorized = {};
            conseil.forEach(item => {
                const categoryName = Object.keys(item)[0];
                const vin = item[categoryName];
                if (typeof vin === "object" && vin !== null) {
                    if (!categorized[categoryName]) categorized[categoryName] = [];
                    categorized[categoryName].push(vin);
                }
            });
            return categorized;
        }

        return {};
    };


    const vinResultNormalize = (vinResults) => {
        if (!vinResults || !Array.isArray(vinResults.conseil)) {
            return {};
        }

        return vinResults.conseil.reduce((acc, vin) => {
            const plat = vin.plat || "Autre";

            if (!acc[plat]) {
                acc[plat] = [];
            }

            acc[plat].push({
                ...vin,
                region: vin.region || vin.région || "Non précisée"
            });

            return acc;
        }, {});
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
                        : <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gabriel sélectionne les meillures vins pour vous. </h1>}
                </div>
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

                    {/* 🧩 CAS 3 : résultat des conseils */}

                    {conseilResult && !isAnalyzing && conseilResult?.vraiPlat !== false && (() => {
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
                                    🍷 Gabriel vous recommande :
                                </motion.h1>

                                <AnimatePresence>
                                    {id !== "cave" ? (
                                        <div
                                            className="flex flex-col gap-10
                                                lg:flex-row lg:flex-wrap lg:justify-center lg:items-start lg:gap-8"
                                        >
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
                                                        {Array.isArray(vins) &&
                                                            vins.map((vin, index) => {
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
                                                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                                                <strong>Prix :</strong> {formatPrice(vin.prix)}
                                                                            </p>
                                                                        )}
                                                                    </motion.div>
                                                                );
                                                            })}
                                                    </div>
                                                </motion.div>
                                            ))}
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
                                                    className={`p-6 rounded-2xl shadow-lg backdrop-blur-md border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${vinCouleurCard[color.toLowerCase()] || "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900"
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
                                                            <p className="text-sm text-gray-800 dark:text-gray-200"><strong>Type :</strong> {vin.type}</p>
                                                            <p className="text-sm text-gray-800 dark:text-gray-200"><strong>Région :</strong> {vin.region}</p>
                                                            <p className="text-sm text-gray-800 dark:text-gray-200"><strong>Garde :</strong> {vin.tempsDeGarde}</p>
                                                            <p className="text-sm text-gray-800 dark:text-gray-200"><strong>Quantité :</strong> {vin.quantite} bouteille(s)</p>
                                                        </div>
                                                    ))}
                                                </motion.div>
                                            ))}
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
                                    🤖 Notre IA vous suggère :
                                </motion.h1>

                                <div className="space-y-10">
                                    {Object.entries(groupedByPlat).map(([plat, vins], i) => (
                                        <motion.div
                                            key={plat}
                                            className="rounded-2xl p-6 bg-gradient-to-br from-white to-emerald-50 dark:from-gray-800 dark:to-gray-900 shadow-lg border border-emerald-200 dark:border-gray-700"
                                            initial={{ opacity: 0, y: 25 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.15 }}
                                        >
                                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                                <FiWine className="text-emerald-600" />
                                                {plat}
                                            </h2>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                                {vins.map((vin, index) => (
                                                    <motion.div
                                                        key={index}
                                                        whileHover={{ scale: 1.03 }}
                                                        className="rounded-xl border border-emerald-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/60 p-4 shadow-md hover:shadow-emerald-400/20 transition-all duration-300"
                                                    >
                                                        <p className="text-sm text-gray-800 dark:text-gray-100">
                                                            <strong>Nom :</strong> {vin.nom}
                                                        </p>
                                                        <p className="text-sm text-gray-800 dark:text-gray-100">
                                                            <strong>Couleur :</strong> {vin.couleur}
                                                        </p>
                                                        <p className="text-sm text-gray-800 dark:text-gray-100">
                                                            <strong>Appellation :</strong> {vin.appellation}
                                                        </p>
                                                        <p className="text-sm text-gray-800 dark:text-gray-100">
                                                            <strong>Région :</strong> {vin.region}
                                                        </p>
                                                        {vin.prix && (
                                                            <p className="text-sm text-gray-800 dark:text-gray-100">
                                                                <strong>Prix :</strong> {formatPrice(vin.prix)}
                                                            </p>
                                                        )}
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

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