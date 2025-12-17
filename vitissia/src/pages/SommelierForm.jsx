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
import RegionRefiner from "../components/RegionRefiner"

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
    const [vinChoice, setVinChoice] = useState('acheter');
    const [aperitif, setAperitif] = useState('false');
    const [digestif, setDigestif] = useState('false');
    const [budget, setBudget] = useState(0);
    const [refine, setRefine] = useState('false');
    /*const [refineCouleur, setRefineCouleur] = useState('');
    const [refineRegion, setRefineRegion] = useState('');
    const [refineRegionInput, setRefineRegionInput] = useState('');*/
    const [refineFree, setRefineFree] = useState('');
    const [refineSummary, setRefineSummary] = useState('');
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
    const [hasRunFinalAnalyse, setHasRunFinalAnalyse] = useState(false);
    const [rayonMessage, setRayonMessage] = useState(null);
    const [restoProfil, setRestoProfil] = useState(null);
    const [restoProfilMessage, setRestoProfilMessage] = useState(null);
    const [fileUploadVersion, setFileUploadVersion] = useState(0);
    const [filters, setFilters] = useState({
        contenance: "",
        couleur: "",
        region: "",
    });
    const [stepError, setStepError] = useState('');
    const [imageError, setImageError] = useState(null);

    const toast = useRef(null);

    const navigate = useNavigate();

    const returnToSommelierMenu = () => {
        Storage.removeItem("lastSommelierResult");
        setOldResult(null);
        setShowOldResult(false);

        restartHandler();

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

    const choiceLabels = {
        plat: "Choisir une boisson ou un vin pour un menu ou un plat",
        cave: "Analyser et équilibrer ma cave",
        rayon: "Choisir un vin dans un rayon",
        restaurant: "Choisir un vin au restaurant",
    };

    const currentChoiceLabel = choiceLabels[id];

    const analyseResult = async (retryCount = 0, vinsfiltre = vinsFiltre, platsChoisi = selectedPlats, typeCase = 'conseilVin') => {
        try {
            const vinsPropres = (vinsfiltre || []).filter((v) => {
                return v?.couleur || v?.appellation || (Array.isArray(v?.format) && v.format.length);
            });
            const string = JSON.stringify(vinsFiltre)
            setIsAnalyzing(true);
            const formData = new FormData();

            const platsString = Array.isArray(platsChoisi)
                ? platsChoisi.map(p => (typeof p === "string" ? p.trim() : "")).filter(Boolean).join(", ")
                : (platsChoisi ?? "");

            formData.append("platsChoisi", platsString);

            formData.append("uuidUser", UUIDuser);
            formData.append("uuidTable", UUIDTable);
            /*formData.append("budget", budget);*/
            formData.append("bouteille", bouteille);
            formData.append("choice", vinChoice);
            formData.append("typeCase", typeCase);
            formData.append("vinsfiltre", string);
            formData.append("equilibre", equilibre);
            formData.append("dansrayon", dansRayon);
            formData.append("adaptePlat", adaptePlat);
            formData.append("aperitif", aperitif);
            formData.append("digestif", digestif);
            formData.append("token", token);
            formData.append("refine", refine);
            if (refine === 'true') {
                /*formData.append("ref_couleur", refineCouleur || '');
                formData.append("ref_region", refineRegion || '');*/
                formData.append("refine_free", refineFree || '');
            }

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

            if (typeCase === "rayonPlatSupermarche") {
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

                const rayonItem =
                    conseilArr.find(
                        (i) =>
                            i.rayon ||
                            i.message ||
                            i.texte ||
                            i.profil
                    ) || jsonAtraite;

                const rayonObj =
                    rayonItem.profil && typeof rayonItem.profil === "object"
                        ? rayonItem.profil
                        : rayonItem;

                setRayonProfil(rayonObj);
                setRayonMessage(rayonObj.message || rayonObj.texte || null);

                setCurrentStep(3);

                return;
            }

            if (typeCase === "restoPlatProfil") {
                const profil =
                    jsonAtraite?.profil ||
                    (Array.isArray(jsonAtraite?.conseil) ? jsonAtraite.conseil[0]?.profil : null) ||
                    null;

                const msg =
                    jsonAtraite?.message ||
                    jsonAtraite?.texte ||
                    (Array.isArray(jsonAtraite?.conseil) ? jsonAtraite.conseil[0]?.message : null) ||
                    null;

                setRestoProfil(profil);
                setRestoProfilMessage(msg);

                setCurrentStep(5);
                return;
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

                setCurrentStep(3);

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
            //setCurrentStep(prev => (prev >= 100 ? 100 : prev + 1));
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
        const file = event.files?.[0];
        if (!file) return;

        setImageError(null);

        try {
            const sizeMB = file.size / 1024 / 1024;
            console.log("📸 Taille image originale:", sizeMB.toFixed(2), "Mo", " - name:", file.name);

            let processedFile = file;

            if (sizeMB > 25) {
                const msg = "La photo est trop lourde pour être analysée. Merci de la recadrer ou de réduire sa résolution.";
                console.warn("[IMAGE] trop lourde >", sizeMB, "Mo");
                setImageError({ code: 'IMAGE_TOO_LARGE', message: msg });
                toast.current?.show({
                    severity: 'error',
                    summary: 'Image trop lourde',
                    detail: msg,
                    life: 5000,
                });
                return;
            }

            if (sizeMB <= 5) {
                console.log("✅ Pas de compression nécessaire (<= 5 Mo)");
            } else {
                let options;

                if (sizeMB <= 10) {
                    options = {
                        maxSizeMB: 4,
                        maxWidthOrHeight: 2500,
                        initialQuality: 0.9,
                        useWebWorker: true,
                    };
                } else {
                    options = {
                        maxSizeMB: 4,
                        maxWidthOrHeight: 2000,
                        initialQuality: 0.85,
                        useWebWorker: true,
                    };
                }

                console.log("⚙️ Compression en cours avec options:", options);
                processedFile = await imageCompression(file, options);

                const afterMB = processedFile.size / 1024 / 1024;
                console.log("📦 Taille après compression:", afterMB.toFixed(2), "Mo");
            }

            const reader = new FileReader();

            reader.onload = () => {
                try {
                    const result = reader.result;
                    if (!result || typeof result !== 'string') {
                        throw new Error("reader.result vide ou invalide");
                    }

                    const base64String = result.split(",")[1];
                    if (!base64String) {
                        throw new Error("Impossible d'extraire le base64 de l'image");
                    }

                    setImage((prevImg) => ({
                        ...prevImg,
                        image: base64String,
                        typeData,
                        typeCategorie,
                    }));

                    shouldAnalyze.current = true;
                } catch (err) {
                    console.error("Erreur lors de la conversion base64:", err);
                    const msg = "Impossible de préparer cette photo pour l'analyse. Essaie de la reprendre ou d'en choisir une autre.";
                    setImageError({ code: 'IMAGE_READ_ERROR', message: msg });
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Erreur image',
                        detail: msg,
                        life: 4000,
                    });
                }
            };

            reader.onerror = (e) => {
                console.error("FileReader error:", e);
                const msg = "Erreur lors de la lecture de l'image. Merci de réessayer.";
                setImageError({ code: 'IMAGE_READ_ERROR', message: msg });
                toast.current?.show({
                    severity: 'error',
                    summary: 'Erreur image',
                    detail: msg,
                    life: 4000,
                });
            };

            reader.readAsDataURL(processedFile);
        } catch (error) {
            console.error("Erreur globale lors du traitement de l'image :", error);
            const msg = "Une erreur inattendue est survenue avec la photo.";
            setImageError({ code: 'IMAGE_UNKNOWN_ERROR', message: msg });
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur image',
                detail: msg,
                life: 4000,
            });
        }
    };

    const ImageErrorBanner = ({ message }) => {
        if (!message) return null;
        return (
            <div
                className="
        mt-4 w-full rounded-2xl
        border border-rose-500/60
        bg-gradient-to-r from-rose-900/80 via-gray-900/90 to-rose-900/70
        px-4 py-3
        shadow-[0_10px_30px_rgba(0,0,0,0.7)]
        text-sm text-rose-50
        flex items-start gap-3
      "
            >
                <div
                    className="
          mt-0.5 inline-flex h-6 w-6
          items-center justify-center
          rounded-full bg-rose-500
          text-xs font-bold shadow
        "
                >
                    !
                </div>
                <p className="leading-snug">
                    {message}
                </p>
            </div>
        );
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
            setImageError(null);
            setIsAnalyzing(true);
            if (!image || !image.image) {
                const msg = "Aucune image valide n'a été reçue. Merci de reprendre la photo.";
                console.warn("[AnalyseSommelier] image manquante");
                setImageError({ code: 'NO_IMAGE', message: msg });
                toast.current?.show({
                    severity: 'error',
                    summary: 'Aucune image',
                    detail: msg,
                    life: 4000,
                });
                return;
            }
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

            setCurrentStep((prev) => {
                if (id === 'restaurant') {
                    if (!manual && prev === 2 && image?.typeCategorie === 'carte' && image?.typeData === 'plat') {
                        return 3;
                    }

                    if (prev === 5 && image?.typeCategorie === 'carte' && image?.typeData === 'vin') {
                        return 6;
                    }
                }

                if (id === 'rayon') {
                    if (rayonMode === 'best' && prev === 2 && image?.typeCategorie === 'rayon') {
                        return 3;
                    }

                    if (rayonMode === 'plat' && prev === 3 && image?.typeCategorie === 'rayon') {
                        return 4;
                    }
                }

                return prev;
            });

        } catch (error) {
            if (retryCount < 2) {
                toast.current.show({
                    severity: 'warn',
                    summary: 'Tentative échouée',
                    detail: `Erreur lors de la tentative ${retryCount + 1}, nouvelle tentative...`,
                    life: 3000
                });
                await AnalyseSommelier(retryCount + 1);
            } else {
                toast.current.show({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: "Erreur lors de l'analyse après trois tentatives",
                    life: 3000
                });
            }
        } finally {
            setIsAnalyzing(false);
            clearFile.current = false;
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

    const StepErrorBanner = ({ message }) => (
        <AnimatePresence>
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                    className="
                    mt-4 w-full rounded-2xl
                    border border-rose-500/60
                    bg-gradient-to-r from-rose-900/80 via-gray-900/90 to-rose-900/70
                    px-4 py-3
                    shadow-[0_10px_30px_rgba(0,0,0,0.7)]
                    text-sm text-rose-50
                    flex items-start gap-3
                "
                >
                    <div
                        className="
                        mt-0.5 inline-flex h-6 w-6
                        items-center justify-center
                        rounded-full bg-rose-500
                        text-xs font-bold shadow
                    "
                    >
                        !
                    </div>
                    <p className="leading-snug">
                        {message}
                    </p>
                </motion.div>
            )}
        </AnimatePresence>
    );

    const handleRestaurantWineCardsDone = () => {
        const platsArray = (
            manual
                ? repas
                : selectedPlats && selectedPlats.length > 0
                    ? selectedPlats
                    : repas
        )
            .map((p) => (typeof p === 'string' ? p.trim() : ''))
            .filter((p) => p !== '');

        const missing = [];

        if (!platsArray.length) {
            missing.push("ajouter au moins un plat");
        }

        if (missing.length > 0) {
            setStepError(
                "Pour passer à l’étape suivante, il te manque encore : " +
                missing.join(", ") +
                "."
            );
            return;
        }

        setStepError('');

        const platsFinal = platsArray.join(', ');

        analyseResult(
            0,
            vinsFiltre,
            platsFinal,
            'conseilVin',
        );

        setCurrentStep(100);
    };

    useEffect(() => {
        if (id === 'restaurant') return;

        if (currentStep === 100 && !hasRunFinalAnalyse) {
            setHasRunFinalAnalyse(true);

            analyseResult(0, vinsFiltre, repas, "conseilVin");
        }
    }, [currentStep, hasRunFinalAnalyse, id, vinsFiltre, repas, rayonMode]);


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

    const FileUploadField = ({ onSelect, label, disabled = false, version = 0 }) => (
        <div className="relative w-full">
            <label className="block mb-2 text-sm font-medium text-slate-800">
                {label} :
            </label>

            <FileUpload
                key={version}
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

            <div
                className={`mb-12 h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center 
            bg-gradient-to-br from-rose-50/90 via-rose-50/70 to-stone-50/80 
            dark:from-slate-900/80 dark:via-slate-900/90 dark:to-slate-950/90 
            ${disabled ? 'border-slate-300/70' : 'border-rose-400/80 hover:border-rose-500'} 
            cursor-pointer hover:scale-[1.03] active:scale-[0.97] transition-transform duration-300 shadow-sm`}
            >
                <i
                    className={`pi pi-camera text-2xl mb-2 
                ${disabled ? 'text-slate-400' : 'text-rose-600 dark:text-rose-300'}`}
                ></i>
                <p
                    className={`text-sm font-medium 
                ${disabled ? 'text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}
                >
                    {disabled ? 'Veuillez remplir le champ ci-dessus' : 'Déposez votre image ici ou cliquez pour sélectionner'}
                </p>
                {!disabled && (
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Formats acceptés : JPG, PNG, HEIC — taille max 90 Mo
                    </p>
                )}
            </div>
        </div>
    );

    const isRepasValid = repas.every(p => p.trim() !== '');
    const isCaveValid = Number(bouteille) > 0 && Number(budget) > 0;

    const nextStepHandler = () => {
        setCurrentStep(currentStep + 1)
    }

    const lastStepHandler = () => {
        setIsAnalyzing(false);
        setHasRunFinalAnalyse(false);

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

    const isWine = (item) =>
        item?.couleur ||
        item?.appellation ||
        (Array.isArray(item?.format) && item.format.length);

    const allWines = (resultAnalyseSommelier?.result?.result || []).filter(isWine);

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

    const handleValidatePlat = () => {
        const missing = [];

        if (!aperitif) {
            missing.push("indiquer si tu souhaites un apéritif");
        }
        if (!digestif) {
            missing.push("indiquer si tu souhaites un digestif");
        }

        const platsNettoyés = (repas || [])
            .map((p) => (typeof p === 'string' ? p.trim() : ''))
            .filter((p) => p !== '');

        if (platsNettoyés.length === 0) {
            missing.push("ajouter au moins un plat");
        }

        if (refine === 'true' && !refineFree.trim()) {
            missing.push("ajouter quelques précisions dans le champ d’affinage");
        }

        if (missing.length > 0) {
            setStepError(
                "Pour passer à l’étape suivante, il te manque encore : " +
                missing.join(", ") +
                "."
            );
            return;
        }

        setStepError('');
        analyseResult(0, '', repas, 'conseilPlat');
    };

    const handleRayonPlatProfil = () => {
        const platsNettoyes = (repas || [])
            .map((p) => (typeof p === "string" ? p.trim() : ""))
            .filter((p) => p !== "");

        if (!platsNettoyes.length) {
            setStepError("Pour continuer, ajoute au moins un plat.");
            return;
        }

        setStepError("");

        setRepas(platsNettoyes);

        analyseResult(
            0,
            vinsFiltre,
            platsNettoyes,
            "rayonPlatSupermarche"
        );

        setCurrentStep(2);
    };

    const handleRestaurantStep4Validate = () => {
        if (!selectedPlats || selectedPlats.length === 0) {
            setStepError("Pour continuer, sélectionne au moins un plat dans la liste.");
            return;
        }
        setStepError('');

        const platsArray = selectedPlats
            .map((p) => (typeof p === 'string' ? p.trim() : ''))
            .filter((p) => p !== '');

        setRepas(platsArray);

        analyseResult(
            0,
            '',
            platsArray,
            'restoPlatProfil'
        );
    };

    const handleRestaurantStep7Next = () => {
        const platsArray = (
            manual
                ? repas
                : selectedPlats && selectedPlats.length > 0
                    ? selectedPlats
                    : repas
        )
            .map((p) => (typeof p === 'string' ? p.trim() : ''))
            .filter((p) => p !== '');

        const missing = [];

        if (!platsArray.length) {
            missing.push("ajouter au moins un plat");
        }

        if (!vinsFiltre || vinsFiltre.length === 0) {
            missing.push("choisir au moins un vin (ou ajuster les filtres)");
        }

        if (missing.length > 0) {
            setStepError(
                "Pour passer à l’étape suivante, il te manque encore : " +
                missing.join(", ") +
                "."
            );
            return;
        }

        setStepError('');

        const platsFinal = platsArray.join(', ');

        analyseResult(
            0,
            vinsFiltre,
            platsFinal,
            'conseilVin',
        );
        setCurrentStep(100);
    };

    const handleRestaurantManualStep2Validate = () => {
        const platsNettoyés = (repas || [])
            .map((p) => (typeof p === 'string' ? p.trim() : ''))
            .filter((p) => p !== '');

        if (!platsNettoyés.length) {
            setStepError("Pour continuer, ajoute au moins un plat.");
            return;
        }

        setStepError('');
        setSelectedPlats(platsNettoyés);

        analyseResult(
            0,
            '',
            platsNettoyés,
            'restoPlatProfil'
        );
    };

    const hasRepas = repas.some(p => p.trim() !== '');
    const isPlatFlowValid =
        repas.every(p => p.trim() !== '') &&
        vinChoice;


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
                        {currentStep === 1 && (
                            <div className="w-full max-w-3xl mx-auto p-6 rounded-3xl bg-gray-900/70 border border-gray-800 shadow-xl backdrop-blur-xl font-['Work_Sans',sans-serif]">
                                <h1 className="text-xl font-semibold text-gray-50">
                                    Voulez-vous prendre une photo de votre carte des plats ou saisir manuellement votre choix ?
                                </h1>
                                <div className="flex flex-wrap gap-4 mt-6">
                                    <button
                                        onClick={() => {
                                            setManual(false);
                                            setCurrentStep(2);
                                        }}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold 
                                bg-white/20 text-gray-50 border border-white/25 
                                shadow-md hover:bg-white/30 hover:border-white/40 hover:shadow-lg 
                                transition-all duration-300 backdrop-blur-md"
                                    >
                                        <span className="pi pi-camera mt-0.5 mr-1" /> Photo
                                    </button>

                                    <button
                                        onClick={() => {
                                            setManual(true);
                                            setCurrentStep(2);
                                        }}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold 
                                bg-transparent text-gray-100 border border-gray-600 
                                hover:bg-white/10 transition-all duration-300"
                                    >
                                        <span className="pi pi-pencil mt-0.5 mr-1" /> Saisie manuelle
                                    </button>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && manual === false && (
                            <div className="w-full max-w-3xl mx-auto p-6 rounded-3xl bg-gray-900/70 border border-gray-800 shadow-xl backdrop-blur-xl font-['Work_Sans',sans-serif]">
                                <FileUploadField
                                    label={'Votre carte de plats'}
                                    onSelect={(e) => imageBase64Uploader(e, 'carte', 'plat')}
                                    version={fileUploadVersion}
                                />
                            </div>
                        )}

                        {currentStep === 2 && manual === true && (
                            <div className="w-full max-w-3xl mx-auto space-y-8 p-6 rounded-3xl bg-gray-900/70 border border-gray-800 shadow-xl backdrop-blur-xl font-['Work_Sans',sans-serif]">
                                <motion.h3
                                    className="text-lg font-bold text-gray-50 flex items-center gap-2"
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
                                            <label className="text-sm font-medium text-gray-200 min-w-[90px]">
                                                Plat {index + 1}
                                            </label>

                                            <input
                                                type="text"
                                                value={plat}
                                                onChange={(e) => handleRepasChange(index, e.target.value)}
                                                className="w-full sm:flex-1 rounded-lg border border-gray-700 bg-gray-950/40 px-3 py-2 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 outline-none transition-all duration-300 shadow-sm"
                                                placeholder="Entrée / Plat / Fromages / Dessert"
                                            />

                                            {repas.length > 1 && (
                                                <motion.button
                                                    whileHover={{ scale: 1.15, rotate: 10 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => removeRepas(index)}
                                                    className="text-red-400 hover:text-red-300 transition-all duration-200"
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
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white/20 hover:bg-white/30 text-gray-50 rounded-lg shadow-md border border-white/25 transition-all duration-300 backdrop-blur-md"
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
                                        disabled={!hasRepas}
                                        whileHover={hasRepas ? { scale: 1.05 } : {}}
                                        whileTap={hasRepas ? { scale: 0.95 } : {}}
                                        className={`flex items-center gap-2 px-5 py-2 font-semibold rounded-lg shadow-md transition-all duration-300 ${hasRepas
                                            ? 'bg-white/20 text-gray-50 border border-white/25 hover:bg-white/30 hover:border-white/40'
                                            : 'bg-gray-700 cursor-not-allowed text-gray-300'
                                            }`}
                                        onClick={handleRestaurantManualStep2Validate}
                                    >
                                        <FiCheckCircle size={18} />
                                        Valider
                                    </motion.button>
                                </motion.div>
                                {stepError && <StepErrorBanner message={stepError} />}
                            </div>
                        )}

                        {currentStep === 3 && manual === false && (
                            <div className="w-full max-w-3xl mx-auto p-6 rounded-3xl bg-gray-900/70 border border-gray-800 shadow-xl backdrop-blur-xl font-['Work_Sans',sans-serif]">
                                <h1 className="text-lg font-semibold text-gray-50">
                                    Voulez-vous ajouter une nouvelle image ?
                                </h1>
                                <div className="flex flex-wrap gap-4 mt-4">
                                    <button
                                        onClick={() => {
                                            setCurrentStep(2);
                                            setFileUploadVersion(v => v + 1);
                                        }}
                                        className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold bg-white/20 text-gray-50 border border-white/25 shadow-md hover:bg-white/30 hover:border-white/40 hover:shadow-lg transition-all backdrop-blur-md"
                                    >
                                        oui
                                    </button>

                                    <button
                                        onClick={() => {
                                            setCurrentStep(4);
                                            fetchPlats(UUIDTable);
                                        }}
                                        className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold bg-transparent text-gray-100 border border-gray-600 hover:bg-white/10 shadow-md transition-all"
                                    >
                                        non
                                    </button>
                                </div>
                            </div>
                        )}

                        {currentStep === 4 && platsCarte && manual === false && (() => {
                            const normalizedPlats = normalizePlatsData(platsCarte.Plats);

                            return (
                                <div className="w-full max-w-3xl mx-auto p-6 rounded-3xl bg-gray-900/70 border border-gray-800 shadow-xl backdrop-blur-xl font-['Work_Sans',sans-serif]">
                                    <h2 className="font-semibold text-lg text-gray-50">
                                        Quels plats voulez-vous utiliser ?
                                    </h2>

                                    {Object.entries(normalizedPlats).map(([category, dishes], index) => (
                                        <div
                                            key={index}
                                            className="mb-6 border-b border-gray-700 pb-3"
                                        >
                                            <h2 className="text-lg font-semibold capitalize mb-2 mt-2 text-gray-200">
                                                {category.replace(/_/g, ' ')}
                                            </h2>

                                            {dishes.map((dishObj, i) => {
                                                const dishName = dishObj.nom;

                                                return (
                                                    <div
                                                        key={i}
                                                        className="p-2 rounded-lg hover:bg-white/5 transition"
                                                    >
                                                        <label className="flex items-center gap-2 text-sm text-gray-200">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedPlats.includes(dishName)}
                                                                onChange={() => handleCheckboxChange(dishName)}
                                                                className="rounded border-gray-500 text-emerald-400 focus:ring-emerald-500 bg-gray-900"
                                                            />
                                                            <span>{dishName}</span>
                                                        </label>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}

                                    {stepError && <StepErrorBanner message={stepError} />}

                                    <button
                                        onClick={handleRestaurantStep4Validate}
                                        className="mt-4 inline-flex items-center justify-center px-6 py-2.5 bg-white/20 text-gray-50 font-semibold rounded-xl border border-white/25 hover:bg-white/30 hover:border-white/40 shadow-md hover:shadow-lg transition duration-200 backdrop-blur-md"
                                    >
                                        Valider
                                    </button>
                                </div>
                            );
                        })()}

                        {currentStep === 5 && (
                            <div className="w-full max-w-3xl mx-auto p-6 rounded-3xl bg-gray-900/70 border border-gray-800 shadow-xl backdrop-blur-xl font-['Work_Sans',sans-serif]">
                                {restoProfil && (
                                    <div className="mt-3 space-y-2 text-sm text-gray-200">
                                        {/* Phrase récap globale */}
                                        <p>
                                            Le vin recommandé par notre sommelier pour accompagner votre plat
                                            {repas && repas.length > 0 && repas[0]?.trim()
                                                ? ` "${repas[0].trim()}"`
                                                : ""}{" "}
                                            est un vin
                                            {restoProfil.couleur ? ` ${restoProfil.couleur.toLowerCase()}` : ""}
                                            {restoProfil.region ? ` de la région ${restoProfil.region}` : ""}
                                            {restoProfil.type || restoProfil.style
                                                ? ` de type ${(restoProfil.type || restoProfil.style).toLowerCase()}`
                                                : ""}.
                                        </p>
                                    </div>
                                )}

                                <FileUploadField
                                    label={'La carte des vins'}
                                    onSelect={(e) => imageBase64Uploader(e, 'carte', 'vin')}
                                    version={fileUploadVersion}
                                />
                            </div>
                        )}

                        {currentStep === 6 && (
                            <div className="w-full max-w-3xl mx-auto p-6 rounded-3xl bg-gray-900/70 border border-gray-800 shadow-xl backdrop-blur-xl font-['Work_Sans',sans-serif]">
                                <h1 className="text-lg font-semibold text-gray-50">
                                    Voulez-vous ajouter une nouvelle image ?
                                </h1>
                                <div className="flex flex-wrap gap-4 mt-4">
                                    <button
                                        onClick={() => {
                                            setCurrentStep(5);
                                            setFileUploadVersion(v => v + 1);
                                        }}
                                        className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold bg-white/20 text-gray-50 border border-white/25 shadow-md hover:bg-white/30 hover:border-white/40 hover:shadow-lg transition-all backdrop-blur-md"
                                    >
                                        oui
                                    </button>

                                    <button
                                        onClick={handleRestaurantWineCardsDone}
                                        className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold bg-transparent text-gray-100 border border-gray-600 hover:bg-white/10 shadow-md transition-all"
                                    >
                                        non
                                    </button>
                                </div>
                            </div>
                        )}

                        {/*{currentStep === 7 && (
                            <div className="w-full max-w-5xl mx-auto p-6 rounded-3xl bg-gray-900/70 border border-gray-800 shadow-xl backdrop-blur-xl font-['Work_Sans',sans-serif]">
                                <div>
                                    <h2 className="font-semibold text-lg mb-2 text-gray-50">
                                        Choisissez vos préférences :
                                    </h2>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-2 mt-5">
                                        <div className="relative">
                                            <button
                                                className="bg-white/10 text-gray-50 py-2 px-4 rounded-xl w-full border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-200 backdrop-blur-md"
                                                onClick={clearFilters}
                                            >
                                                Tous
                                            </button>
                                        </div>

                                        <div className="relative">
                                            <button
                                                className="bg-white/10 text-gray-50 py-2 px-4 rounded-xl w-full border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-200 backdrop-blur-md"
                                                onClick={() =>
                                                    setShowDropdown(
                                                        showDropdown === 'contenance' ? null : 'contenance',
                                                    )
                                                }
                                            >
                                                Contenance
                                            </button>
                                        </div>
                                    </div>

                                    {showDropdown && (
                                        <div className="mt-2">
                                            <select
                                                className="w-full max-w-sm p-2.5 border border-gray-600 rounded-xl bg-gray-950/90 text-gray-50 shadow-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                value={filters[showDropdown] || ''}
                                                onChange={(e) =>
                                                    handleFilterChange(showDropdown, e.target.value)
                                                }
                                            >
                                                <option value="" className="bg-gray-950 text-gray-50">
                                                    -- Sélectionner --
                                                </option>
                                                {showDropdown === 'contenance' &&
                                                    getContenances().map((c, i) => (
                                                        <option
                                                            key={i}
                                                            value={c}
                                                            className="bg-gray-950 text-gray-50"
                                                        >
                                                            {c}
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>
                                    )}

                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {filters.contenance && (
                                            <span
                                                onClick={() => clearSingleFilter('contenance')}
                                                className="cursor-pointer bg-white/10 text-gray-100 text-xs px-3 py-1 rounded-full select-none flex items-center gap-1 border border-gray-500 hover:bg-white/20 transition"
                                                title="Supprimer ce filtre"
                                            >
                                                Contenance: {filters.contenance} <strong>×</strong>
                                            </span>
                                        )}
                                    </div>

                                    <div className="overflow-auto bg-gray-950/85 text-gray-50 shadow-lg rounded-3xl max-h-[400px] lg:max-h-[600px] p-4 space-y-4 mt-5 border border-gray-700">
                                        {vinsFiltre.length === 0 && (
                                            <p className="text-gray-400 italic text-sm">
                                                Aucun vin ne correspond aux filtres sélectionnés.
                                            </p>
                                        )}
                                        {vinsFiltre.map((vin, index) => (
                                            <div
                                                key={index}
                                                className="border-b border-gray-700 pb-2 last:border-none last:pb-0"
                                            >
                                                <div className="font-semibold text-gray-100">
                                                    {vin.nom}
                                                </div>
                                                <div className="text-sm text-gray-200">
                                                    <span className="mr-3">
                                                        Couleur : {vin.couleur}{' '}
                                                    </span>
                                                    <span className="mr-3">
                                                        Région : {vin.région ?? 'Région inconnue'}
                                                    </span>
                                                    <span className="ml-3">
                                                        Appellation :{' '}
                                                        {vin.appellation ?? 'Appellation inconnue'}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-200/90 italic">
                                                    {vin.caractéristique}
                                                </div>
                                                <div className="mt-1 flex flex-wrap gap-2 text-sm">
                                                    {vin.format?.map((f, i) => (
                                                        <span
                                                            key={i}
                                                            className="bg-white/5 px-2 py-1 rounded-full border border-gray-600"
                                                        >
                                                            {f.contenance} - {formatPrice(f.prix)}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {stepError && <StepErrorBanner message={stepError} />}

                                <div className="flex justify-end mt-6">
                                    <button
                                        onClick={handleRestaurantStep7Next}
                                        className="mt-4 px-6 py-2.5 bg-white/20 text-gray-50 rounded-xl border border-white/25 hover:bg-white/30 hover:border-white/40 shadow-md hover:shadow-lg transition backdrop-blur-md"
                                    >
                                        Suivant
                                    </button>
                                </div>
                            </div>
                        )}*/}
                    </>
                );

            case 'rayon':
                return (
                    <>
                        {currentStep === 1 && (
                            <div className="w-full max-w-3xl mx-auto p-6 rounded-3xl bg-gray-900/70 border border-gray-800 shadow-xl backdrop-blur-xl font-['Work_Sans',sans-serif]">
                                <h1 className="text-lg font-semibold text-gray-50">
                                    Le vin le plus intéressant de ce rayon ou vin adapté à un plat ?
                                </h1>
                                <div className="flex flex-wrap gap-4 mt-4">
                                    <button
                                        onClick={() => {
                                            setAdaptePlat(false);
                                            setRayonMode('best');
                                            setCurrentStep(2);
                                        }}
                                        className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold bg-white/20 text-gray-50 border border-white/25 shadow-md hover:bg:white/30 hover:border-white/40 hover:shadow-lg transition-all backdrop-blur-md"
                                    >
                                        Plus intéressant
                                    </button>

                                    <button
                                        onClick={() => {
                                            setAdaptePlat(true);
                                            setRayonMode('plat');
                                            setCurrentStep(2);
                                        }}
                                        className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold bg-transparent text-gray-100 border border-gray-600 hover:bg-white/10 transition"
                                    >
                                        Adapté à mon/mes plats
                                    </button>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && rayonMode === 'best' && (
                            <div className="relative w-full max-w-3xl mx-auto p-6 rounded-3xl bg-gray-900/70 border border-gray-800 shadow-xl backdrop-blur-xl font-['Work_Sans',sans-serif]">
                                <FileUploadField
                                    label={'Votre image de rayon'}
                                    onSelect={(e) => imageBase64Uploader(e, 'rayon', 'vin')}
                                    version={fileUploadVersion}
                                />
                            </div>
                        )}

                        {currentStep === 3 && rayonMode === 'best' && (
                            <div className="w-full max-w-3xl mx-auto p-6 rounded-3xl bg-gray-900/70 border border-gray-800 shadow-xl backdrop-blur-xl font-['Work_Sans',sans-serif]">
                                <h1 className="text-lg font-semibold text-gray-50">
                                    Voulez-vous ajouter une nouvelle image ?
                                </h1>
                                <div className="flex flex-wrap gap-4 mt-4">
                                    <button
                                        onClick={() => {
                                            setCurrentStep(2);
                                            setFileUploadVersion(v => v + 1);
                                        }}
                                        className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold bg-white/20 text-gray-50 border border-white/25 shadow-md hover:bg:white/30 hover:border-white/40 hover:shadow-lg transition-all backdrop-blur-md"
                                    >
                                        oui
                                    </button>

                                    <button
                                        onClick={() => setCurrentStep(100)}
                                        className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold bg-transparent text-gray-100 border border-gray-600 hover:bg-white/10 shadow-md transition"
                                    >
                                        non
                                    </button>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && rayonMode === 'plat' && (
                            <div className="w-full max-w-3xl mx-auto space-y-8 p-6 rounded-3xl bg-gray-900/70 border border-gray-800 shadow-xl backdrop-blur-xl font-['Work_Sans',sans-serif] transition-all duration-500">
                                <motion.h3
                                    className="text-lg font-bold text-gray-50 flex items-center gap-2"
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
                                            <label className="text-sm font-medium text-gray-200 min-w-[90px]">
                                                Plat {index + 1}
                                            </label>

                                            <input
                                                type="text"
                                                value={plat}
                                                onChange={(e) => handleRepasChange(index, e.target.value)}
                                                className="w-full sm:flex-1 rounded-lg border border-gray-700 bg-gray-950/40 px-3 py-2 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 outline-none transition-all duration-300 shadow-sm"
                                                placeholder="Entrée / Plat / Fromages / Dessert"
                                            />

                                            {repas.length > 1 && (
                                                <motion.button
                                                    whileHover={{ scale: 1.15, rotate: 10 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => removeRepas(index)}
                                                    className="text-red-400 hover:text-red-300 transition-all duration-200"
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
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white/20 hover:bg-white/30 text-gray-50 rounded-lg shadow-md border border-white/25 transition-all duration-300 backdrop-blur-md"
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
                                        disabled={!hasRepas}
                                        whileHover={hasRepas ? { scale: 1.05 } : {}}
                                        whileTap={hasRepas ? { scale: 0.95 } : {}}
                                        className={`flex items-center gap-2 px-5 py-2 font-semibold rounded-lg shadow-md transition-all duration-300 ${hasRepas
                                            ? 'bg-white/20 text-gray-50 border border-white/25 hover:bg-white/30 hover:border-white/40'
                                            : 'bg-gray-700 cursor-not-allowed text-gray-300'
                                            }`}
                                        onClick={handleRayonPlatProfil}
                                    >
                                        <FiCheckCircle size={18} />
                                        Valider
                                    </motion.button>
                                </motion.div>
                            </div>
                        )}

                        {currentStep === 3 && rayonMode === 'plat' && (
                            <div className="w-full max-w-3xl mx-auto space-y-6 p-6 rounded-3xl bg-gray-900/70 border border-gray-800 shadow-xl backdrop-blur-xl font-['Work_Sans',sans-serif]">
                                <h2 className="text-lg font-semibold text-gray-50">
                                    Profil conseillé pour ton plat
                                </h2>

                                {rayonProfil && (
                                    <div className="space-y-2 text-sm text-gray-200">
                                        {/* Phrase globale */}
                                        <p>
                                            Notre sommelier vous conseille pour votre plat
                                            {repas && repas.length > 0 && repas[0]?.trim()
                                                ? ` "${repas[0].trim()}"`
                                                : ""}{" "}
                                            un vin
                                            {rayonProfil.couleur
                                                ? ` ${rayonProfil.couleur.toLowerCase()}`
                                                : ""}
                                            {rayonProfil.region
                                                ? ` de la région ${rayonProfil.region}`
                                                : ""}
                                        </p>
                                    </div>
                                )}

                                <p className="text-sm text-gray-400">
                                    Maintenant envoie l’image du rayon, on te conseillera les meilleurs vins pour ton plat.
                                </p>

                                <FileUploadField
                                    label={'Votre image de rayon'}
                                    onSelect={(e) => imageBase64Uploader(e, 'rayon', 'vin')}
                                    version={fileUploadVersion}
                                />

                                <div className="flex justify-end">
                                    <button
                                        onClick={() => setCurrentStep(4)}
                                        className="px-6 py-2.5 bg-white/20 text-gray-50 rounded-xl border border-white/25 hover:bg-white/30 hover:border-white/40 shadow-md hover:shadow-lg transition-all backdrop-blur-md"
                                    >
                                        Continuer
                                    </button>
                                </div>
                            </div>
                        )}

                        {currentStep === 4 && rayonMode === 'plat' && (
                            <div className="w-full max-w-3xl mx-auto p-6 rounded-3xl bg-gray-900/70 border border-gray-800 shadow-xl backdrop-blur-xl font-['Work_Sans',sans-serif]">
                                <h1 className="text-lg font-semibold text-gray-50">
                                    Voulez-vous ajouter une nouvelle image ?
                                </h1>
                                <div className="flex flex-wrap gap-4 mt-4">
                                    <button
                                        onClick={() => {
                                            setCurrentStep(3);
                                            setFileUploadVersion(v => v + 1);
                                        }}
                                        className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold bg-white/20 text-gray-50 border border-white/25 shadow-md hover:bg:white/30 hover:border-white/40 hover:shadow-lg transition-all backdrop-blur-md"
                                    >
                                        oui
                                    </button>

                                    <button
                                        onClick={() => setCurrentStep(100)}
                                        className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold bg-transparent text-gray-100 border border-gray-600 hover:bg-white/10 shadow-md transition"
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
                        <div className="w-full max-w-3xl mx-auto space-y-8 p-6 rounded-3xl bg-gray-900/70 border border-gray-800 shadow-xl backdrop-blur-xl font-['Work_Sans',sans-serif]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <motion.div
                                    className="space-y-3"
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <h4 className="text-md font-semibold text-gray-50">
                                        Apéritif :
                                    </h4>

                                    <div className="flex flex-row flex-wrap gap-3">
                                        {[
                                            { label: 'Oui', value: 'true' },
                                            { label: 'Non, Merci', value: 'false' },
                                        ].map(({ label, value }) => (
                                            <label
                                                key={value}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer border transition-all duration-300 ${aperitif === value
                                                    ? 'bg-white/20 text-gray-50 border-white/40 shadow-md'
                                                    : 'bg-white/5 border-gray-700 hover:bg-white/10'
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

                                <motion.div
                                    className="space-y-3"
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.05 }}
                                >
                                    <h4 className="text-md font-semibold text-gray-50">
                                        Digestif :
                                    </h4>

                                    <div className="flex flex-row flex-wrap gap-3">
                                        {[
                                            { label: 'Oui', value: 'true' },
                                            { label: 'Non, Merci', value: 'false' },
                                        ].map(({ label, value }) => (
                                            <label
                                                key={value}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer border transition-all duration-300 ${digestif === value
                                                    ? 'bg-white/20 text-gray-50 border-white/40 shadow-md'
                                                    : 'bg-white/5 border-gray-700 hover:bg-white/10'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="digestifOption"
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
                            </div>

                            <motion.h3
                                className="text-lg font-bold text-gray-50 flex items-center gap-2"
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
                                        <label className="text-sm font-medium text-gray-200 min-w-[90px]">
                                            Plat {index + 1}
                                        </label>
                                        <input
                                            type="text"
                                            value={plat}
                                            onChange={(e) => handleRepasChange(index, e.target.value)}
                                            className="w-full sm:flex-1 rounded-lg border border-gray-700 bg-gray-950/40 px-3 py-2 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 outline-none transition-all duration-300 shadow-sm"
                                            placeholder="Entrée / Plat / Fromages / Dessert"
                                        />
                                        {repas.length > 1 && (
                                            <motion.button
                                                whileHover={{ scale: 1.15, rotate: 10 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => removeRepas(index)}
                                                className="text-red-400 hover:text-red-300 transition-all duration-200"
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
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white/20 hover:bg-white/30 text-gray-50 rounded-lg shadow-md border border-white/25 transition-all duration-300 backdrop-blur-md"
                            >
                                <FiPlusCircle size={16} />
                                Ajouter un plat
                            </motion.button>

                            <motion.div
                                className="mt-8 space-y-4"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.45 }}
                            >
                                <h4 className="text-md font-semibold text-gray-50">
                                    Compléter votre demande :
                                </h4>

                                <div className="flex flex-row flex-wrap gap-3">
                                    {[
                                        { label: 'Oui', value: 'true' },
                                        { label: 'Non, Merci', value: 'false' },
                                    ].map(({ label, value }) => (
                                        <motion.label
                                            key={value}
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer border transition-all duration-300 ${refine === value
                                                ? 'bg-white/20 text-gray-50 border-white/40 shadow-md'
                                                : 'bg-white/5 border-gray-700 hover:bg-white/10'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="refineOption"
                                                value={value}
                                                checked={refine === value}
                                                onChange={(e) => setRefine(e.target.value)}
                                                className="hidden"
                                            />
                                            <span>{label}</span>
                                        </motion.label>
                                    ))}
                                </div>

                                <AnimatePresence>
                                    {refine === 'true' && (
                                        <motion.div
                                            key="refine-fields"
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            transition={{ duration: 0.35 }}
                                            className="space-y-5"
                                        >
                                            <div>
                                                <p className="text-sm font-medium text-gray-200 mb-2">
                                                    Complément libre
                                                </p>

                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={refineFree}
                                                        onChange={(e) => setRefineFree(e.target.value)}
                                                        placeholder="Complément sur le plat, tes goûts, le contexte (ex : plat épicé, pas de vin sucré, plutôt léger, etc.)"
                                                        className="w-full rounded-lg border border-gray-700 bg-gray-950/40 px-3 py-2 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 outline-none transition-all.duration-300 shadow-sm"
                                                    />
                                                </div>
                                            </div>

                                            {refineFree && (
                                                <div className="text-sm text-gray-200">
                                                    <span className="font-medium">Sélection :</span>{' '}
                                                    {[refineFree && `Affinage: ${refineFree}`]
                                                        .filter(Boolean)
                                                        .join(' · ')}
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>

                            {/*<AnimatePresence>
                                {['acheter', 'mix'].includes(vinChoice) && (
                                    <motion.div
                                        key="budget"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.4 }}
                                        className="mt-6"
                                    >
                                        <h3 className="text-lg font-semibold mb-4 text-gray-50">
                                            Budget Maximum
                                        </h3>

                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {[
                                                { label: '30 €', value: '30' },
                                                { label: '50 €', value: '50' },
                                                { label: '80 €', value: '80' },
                                                { label: '120 €', value: '120' },
                                                { label: '150 €', value: '150' },
                                                {
                                                    label: 'Pas de limite',
                                                    value: 'pas de limite, plus de 150',
                                                },
                                            ].map(({ label, value }) => (
                                                <motion.label
                                                    key={value}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className={`flex items-center justify-center px-3 py-2 rounded-lg border text-sm font-medium cursor-pointer transition-all duration-300 ${budget == value
                                                        ? 'bg-white/20 text-gray-50 border-white/40 shadow-md'
                                                        : 'bg-white/5 border-gray-700 hover:bg-white/10'
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
                            */}

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
                                        ? 'bg-white/20 text-gray-50 border border-white/25 hover:bg-white/30 hover:border-white/40'
                                        : 'bg-gray-600 cursor-not-allowed text-gray-300'
                                        }`}
                                    onClick={handleValidatePlat}
                                >
                                    <FiCheckCircle size={18} />
                                    Valider
                                </motion.button>
                            </motion.div>
                            {stepError && <StepErrorBanner message={stepError} />}

                        </div>
                    </>
                );

            case 'cave':
                analyseResult(0, '', selectedPlats, 'conseilCave');
            default:
                return null;
        }
    };

    const restartHandler = () => {
        setIsAnalyzing(false)
        setImage(null)
        setUUIDTable('')
        setRepas([''])
        setVinChoice('acheter')
        setBudget(0)
        setBouteille(0)
        setCurrentStep(1)
        setVinResult(null)
        setConseilResult(null)
        setSelectedPlats([])
        setManual(false)
        setAdaptePlat(true)
        setEquilibre('')
        setAperitif('false')
        setDigestif('false')
    }

    const normalizeConseilData = (rawData) => {
        if (!rawData) return {};

        const conseilArray = Array.isArray(rawData)
            ? rawData
            : rawData.conseil || rawData.result || [];

        const categorized = {};

        conseilArray.forEach((item) => {
            if (!item || typeof item !== "object") return;

            const explicitCategory =
                item.catégorie ||
                item.categorie ||
                item.category ||
                item.typeCategorie ||
                null;

            if (explicitCategory) {
                const categoryName = String(explicitCategory).trim();

                if (!categoryName || categoryName.toLowerCase() === "vraiplat") {
                    return;
                }

                const vinCandidate =
                    (item.vin && typeof item.vin === "object" ? item.vin :
                        item.Vin && typeof item.Vin === "object" ? item.Vin :
                            item);

                if (
                    vinCandidate &&
                    typeof vinCandidate === "object" &&
                    ("nom" in vinCandidate || "nomvin" in vinCandidate || "Nom" in vinCandidate)
                ) {
                    if (!categorized[categoryName]) categorized[categoryName] = [];
                    categorized[categoryName].push(vinCandidate);
                }

                return;
            }

            Object.entries(item).forEach(([categoryName, vin]) => {
                if (categoryName === "vraiplat") return;
                if (!vin || typeof vin !== "object") return;

                if (!("nom" in vin || "nomvin" in vin || "Nom" in vin)) return;

                if (!categorized[categoryName]) categorized[categoryName] = [];
                categorized[categoryName].push(vin);
            });
        });

        return categorized;
    };

    const extractCaveMatchesFromVinResult = (vinResults) => {
        if (!vinResults || !Array.isArray(vinResults.conseil)) return [];

        const matches = [];

        vinResults.conseil.forEach((item) => {
            if (!item) return;

            const target = {
                plat:
                    typeof item.plat === 'string'
                        ? item.plat
                        : item.plat?.plat || null,
                nomvin: item.nomvin || item.nom || item.Nom || '',
                couleur: item.couleur || item.Couleur || '',
                appellation: item.appellation || item.Appellation || '',
                region:
                    item.region ||
                    item.Region ||
                    item.région ||
                    item.Région ||
                    'Non précisée',
            };

            // 🔹 Nouveau : on boucle sur item.vinsCave (tableau 0–3 vins de la cave)
            if (Array.isArray(item.vinsCave)) {
                item.vinsCave.forEach((vc) => {
                    if (!vc || typeof vc !== 'object') return;

                    const taux =
                        typeof vc.tauxCorrespondanceCave === 'number'
                            ? vc.tauxCorrespondanceCave
                            : null;

                    matches.push({
                        target,
                        cave: vc,
                        taux,
                        commentaireCave:
                            typeof vc.commentaireCave === 'string'
                                ? vc.commentaireCave
                                : null,
                        commentaireComparaisonCave:
                            typeof vc.commentaireComparaisonCave === 'string'
                                ? vc.commentaireComparaisonCave
                                : null,
                    });
                });
            }
        });

        return matches;
    };

    const vinResultNormalize = (vinResults) => {
        if (!vinResults || !Array.isArray(vinResults.conseil)) {
            return {};
        }

        const grouped = {
            Aperitif: [],
            Digestif: []
        };

        const sanitizeVin = (vin) => {
            if (!vin || typeof vin !== 'object') return vin;
            const { commentaireComparaisonCave, ...rest } = vin;
            return rest;
        };

        vinResults.conseil.forEach(item => {
            if (item.vinaperitif) {
                const rawVin = typeof item.vinaperitif === 'object'
                    ? item.vinaperitif
                    : { nomvin: item.vinaperitif, ...item };

                const vin = sanitizeVin(rawVin);

                grouped.Aperitif.push({
                    ...vin,
                    region: vin.region || vin.région || "Non précisée"
                });
            }

            if (item.vindigestif) {
                const rawVin = typeof item.vindigestif === 'object'
                    ? item.vindigestif
                    : { nomvin: item.vindigestif, ...item };

                const vin = sanitizeVin(rawVin);

                grouped.Digestif.push({
                    ...vin,
                    region: vin.region || vin.région || "Non précisée"
                });
            }

            if (item.plat) {
                const rawPlatData = typeof item.plat === 'object' ? item.plat : item;
                const platData = sanitizeVin(rawPlatData);

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

    const getCommentaireGlobal = (data) => {
        if (!data) return null;

        if (typeof data.commentaireGlobal === "string" && data.commentaireGlobal.trim()) {
            return data.commentaireGlobal.trim();
        }

        const arr = Array.isArray(data)
            ? data
            : data.conseil || data.result || [];

        for (const item of arr) {
            if (item && typeof item.commentaireGlobal === "string" && item.commentaireGlobal.trim()) {
                return item.commentaireGlobal.trim();
            }
        }

        return null;
    };

    const GlobalCommentBanner = ({ text }) => {
        if (!text) return null;

        return (
            <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="
                max-w-3xl mx-auto mb-8
                rounded-3xl border border-emerald-500/50
                bg-gradient-to-r from-emerald-900/85 via-gray-900/95 to-emerald-900/80
                px-5 py-4
                shadow-[0_18px_40px_rgba(0,0,0,0.75)]
            "
            >
                <div className="flex gap-3">
                    <div className="flex-1">
                        <p className="text-[10px] sm:text-xs uppercase tracking-[0.16em] text-emerald-200/80">
                            Commentaire global du sommelier
                        </p>
                        <p className="mt-1 text-sm sm:text-base text-emerald-50 leading-relaxed">
                            {text}
                        </p>
                    </div>
                </div>
            </motion.div>
        );
    };

    const vinCouleurCard = {
        rouge:
            'bg-gradient-to-br from-red-900/70 via-red-900/30 to-gray-900/70 border-red-500/60',
        blanc:
            'bg-gradient-to-br from-amber-500/25 via-amber-400/10 to-gray-900/70 border-amber-300/70',
        rosé:
            'bg-gradient-to-br from-pink-600/30 via-pink-500/10 to-gray-900/70 border-pink-400/70',
        rose:
            'bg-gradient-to-br from-pink-600/30 via-pink-500/10 to-gray-900/70 border-pink-400/70',
        default: 'bg-gray-900/70 border-gray-700',
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
        <div className="font-['Work_Sans',sans-serif] text-gray-100">
            <div className=" px-4 py-6 mb-4 border-b border-black/40 shadow-[0_18px_30px_-18px_rgba(0,0,0,0.9)] bg-transparent">
                <div className="max-w-6xl mx-auto">
                    {id !== 'plat' ? (
                        <h1 className="text-2xl font-semibold text-white tracking-tight">
                            Gabriel vous donne les meilleurs choix.
                        </h1>
                    ) : (
                        <h1 className="text-2xl font-semibold text-white tracking-tight">
                            Gabriel sélectionne les meilleurs vins pour vous.
                        </h1>
                    )}

                    {currentChoiceLabel && (
                        <p className="mt-1 text-sm text-gray-300">
                            {currentChoiceLabel}
                        </p>
                    )}
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
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white/20 border border-white/15 text-gray-100 rounded-lg hover:bg-white/30 hover:border-white/40 transition-all duration-300 shadow-md backdrop-blur-md"
                >
                    <i className="pi pi-arrow-left text-gray-200"></i>
                    {currentStep === 1 ? 'Retour au menu' : 'Étape précédente'}
                </motion.button>
            </div>

            {/* Carte principale */}
            <div className="bg-gray-900/70 border border-gray-800/80 rounded-2xl mt-8 px-4 sm:px-10 w-full max-w-sm sm:max-w-4xl mx-auto shadow-2xl mb-6 backdrop-blur-2xl">
                <motion.div
                    className="relative flex flex-col px-6 pb-6 transition-all duration-500"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {/* 🧩 CAS 2 : en cours d’analyse */}
                    {isAnalyzing ? (
                        <div className="mt-5 flex items-center justify-center">
                            <i className="pi pi-spinner pi-spin text-2xl text-emerald-400" />
                            <span className="ml-2 text-sm text-gray-100/90">
                                Analyse en cours...
                            </span>
                        </div>
                    ) : (
                        !vinResult &&
                        !conseilResult && (
                            <div className="mt-4 space-y-4">
                                {renderForm()}
                            </div>
                        )
                    )}

                    {/* 🧩 CAS 3 : résultat des conseils (affiché seulement si PAS de vinResult) */}
                    {conseilResult &&
                        !vinResult &&
                        !isAnalyzing &&
                        conseilResult?.vraiPlat !== false &&
                        (() => {
                            const categories = normalizeConseilData(conseilResult);
                            const groupedByColor = groupByColor(conseilResult?.conseil);

                            return (
                                <div className="mt-10">
                                    <motion.h1
                                        className="text-3xl sm:text-2xl font-semibold text-center text-emerald-300 mb-10"
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        Gabriel vous recommande :
                                    </motion.h1>

                                    <GlobalCommentBanner text={getCommentaireGlobal(conseilResult)} />

                                    <AnimatePresence>
                                        {id !== 'cave' ? (
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
                                                        <h2 className="text-xl sm:text-lg font-bold text-emerald-300 mb-4 flex items-center gap-2">
                                                            <FiStar className="text-emerald-400" />
                                                            {category === 'Le Top' ? ' Le Choix Idéal' : category}
                                                        </h2>

                                                        <div className="space-y-4">
                                                            {Array.isArray(vins) &&
                                                                vins.map((vin, index) => {
                                                                    const region = vin.region || vin.région || 'Non précisée';
                                                                    return (
                                                                        <motion.div
                                                                            key={index}
                                                                            whileHover={{ scale: 1.02 }}
                                                                            whileTap={{ scale: 0.98 }}
                                                                            className="p-5 rounded-2xl bg-gray-900/70 border border-emerald-500/30 shadow-lg hover:shadow-emerald-400/30 transition-all duration-300 backdrop-blur-md"
                                                                        >
                                                                            <div className="flex items-center gap-2 mb-2">
                                                                                <FiWine className="text-emerald-400" />
                                                                                <p className="font-semibold text-gray-50">
                                                                                    {vin.nom}
                                                                                </p>
                                                                            </div>
                                                                            <p className="text-sm text-gray-200">
                                                                                <strong>Couleur :</strong> {vin.couleur}
                                                                            </p>
                                                                            {vin.appellation && (
                                                                                <p className="text-sm text-gray-200">
                                                                                    <strong>Appellation :</strong>{' '}
                                                                                    {vin.appellation}
                                                                                </p>
                                                                            )}
                                                                            <p className="text-sm text-gray-200">
                                                                                <strong>Région :</strong> {region}
                                                                            </p>
                                                                            {vin.prix && (
                                                                                <div className="text-sm text-gray-200 mt-1">
                                                                                    <strong>Prix :</strong>{' '}
                                                                                    {Array.isArray(vin.prix)
                                                                                        ? vin.prix.map((p, i) => {
                                                                                            if (
                                                                                                typeof p === 'object' &&
                                                                                                p !== null
                                                                                            ) {
                                                                                                return (
                                                                                                    <span
                                                                                                        key={i}
                                                                                                        className="inline-block bg-white/10 px-2 py-1 rounded mr-2"
                                                                                                    >
                                                                                                        {p.contenance
                                                                                                            ? `${p.contenance} — `
                                                                                                            : ''}
                                                                                                        {p.prix ??
                                                                                                            'Non précisé'}
                                                                                                    </span>
                                                                                                );
                                                                                            }
                                                                                            if (typeof p === 'number') {
                                                                                                return (
                                                                                                    <span
                                                                                                        key={i}
                                                                                                        className="inline-block bg-white/10 px-2 py-1 rounded mr-2"
                                                                                                    >
                                                                                                        {p.toFixed(2)} €
                                                                                                    </span>
                                                                                                );
                                                                                            }
                                                                                            if (typeof p === 'string') {
                                                                                                return (
                                                                                                    <span
                                                                                                        key={i}
                                                                                                        className="inline-block bg-white/10 px-2 py-1 rounded mr-2"
                                                                                                    >
                                                                                                        {p.includes('€')
                                                                                                            ? p
                                                                                                            : `${p} €`}
                                                                                                    </span>
                                                                                                );
                                                                                            }
                                                                                            return null;
                                                                                        })
                                                                                        : formatPrice(vin.prix)}
                                                                                </div>
                                                                            )}
                                                                            {(vin.commentaireVin || vin.commentaire) && (
                                                                                <div className="mt-4">
                                                                                    <p className="text-[10px] sm:text-xs uppercase tracking-[0.16em] text-emerald-200/80">
                                                                                        Commentaire du sommelier
                                                                                    </p>

                                                                                    <div className="relative mt-2 rounded-2xl border border-emerald-400/40 bg-gradient-to-br from-emerald-900/70 via-gray-900/80 to-black/80 px-4 py-3 shadow-[0_12px_30px_rgba(0,0,0,0.6)]">
                                                                                        <p className="text-[11px] sm:text-[12px] text-emerald-50 leading-relaxed pl-4">
                                                                                            {vin.commentaireVin || vin.commentaire}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </motion.div>
                                                                    );
                                                                })}
                                                        </div>
                                                    </motion.div>
                                                ))}

                                                {/* Ancien résultat conseil */}
                                                {oldResult && showOldResult && oldResult.conseilResult && (
                                                    <div className="w-full border-t border-gray-700 pt-8">
                                                        <h2 className="text-xl font-semibold text-center text-gray-50 mb-6">
                                                            Ancien résultat sauvegardé
                                                        </h2>
                                                        <div className="flex flex-col lg:flex-row lg:flex-wrap lg:justify-center lg:items-start gap-10 lg:gap-8">
                                                            {Object.entries(
                                                                normalizeConseilData(
                                                                    oldResult.conseilResult?.conseil ||
                                                                    oldResult.conseilResult
                                                                )
                                                            ).map(([category, vins], i) => (
                                                                <motion.div
                                                                    key={`old-${category}`}
                                                                    className="flex-1 min-w-[280px] max-w-sm mx-auto"
                                                                    initial={{ opacity: 0, y: 20 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    transition={{ delay: i * 0.1, duration: 0.4 }}
                                                                >
                                                                    <h3 className="text-lg font-bold text-amber-300 mb-4">
                                                                        {category}
                                                                    </h3>
                                                                    <div className="space-y-3">
                                                                        {vins.map((vin, j) => (
                                                                            <div
                                                                                key={j}
                                                                                className="p-3 bg-gray-900/70 rounded-lg shadow-sm border border-amber-400/40"
                                                                            >
                                                                                <p className="font-medium text-gray-50">
                                                                                    {vin.nom}
                                                                                </p>
                                                                                <p className="text-sm text-gray-200">
                                                                                    <strong>Région :</strong>{' '}
                                                                                    {vin.region ||
                                                                                        vin['région'] ||
                                                                                        vin.Region ||
                                                                                        'Non précisée'}
                                                                                </p>
                                                                                <p className="text-sm text-gray-200">
                                                                                    <strong>Couleur :</strong>{' '}
                                                                                    {vin.couleur || 'Non précisée'}
                                                                                </p>
                                                                                {vin.prix !== undefined && (
                                                                                    <p className="text-sm text-gray-200">
                                                                                        <strong>Prix :</strong>{' '}
                                                                                        {typeof vin.prix === 'number'
                                                                                            ? `${vin.prix.toFixed(2)} €`
                                                                                            : Array.isArray(vin.prix)
                                                                                                ? vin.prix.map((p, i) => (
                                                                                                    <span
                                                                                                        key={i}
                                                                                                        className="inline-block px-2 py-1 rounded mr-2 bg-white/5"
                                                                                                    >
                                                                                                        {typeof p === 'object'
                                                                                                            ? `${p.contenance || ''} ${p.prix || ''
                                                                                                            }`
                                                                                                            : `${p} €`}
                                                                                                    </span>
                                                                                                ))
                                                                                                : vin.prix || 'Non précisé'}
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

                                                {/* Bouton toggle ancien résultat */}
                                                {oldResult && (
                                                    <div className="w-full flex justify-center mt-10">
                                                        <motion.button
                                                            onClick={() => setShowOldResult((s) => !s)}
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/20 text-gray-50 font-semibold shadow-lg hover:bg-white/30 transition-all duration-300 backdrop-blur-md"
                                                        >
                                                            <i className="pi pi-history"></i>
                                                            {showOldResult
                                                                ? "Masquer l'ancien résultat"
                                                                : "Afficher l'ancien résultat"}
                                                        </motion.button>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            // MODE "CAVE"
                                            <motion.div
                                                className="mt-8 gap-6 auto-rows-fr"
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
                                                        className={`flex flex-col p-6 rounded-2xl shadow-lg backdrop-blur-md border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 mb-4 ${vinCouleurCard[color.toLowerCase()] || vinCouleurCard.default
                                                            }`}
                                                    >
                                                        {/* Header couleur */}
                                                        <div className="flex items-center justify-between gap-3 mb-4">
                                                            <h2 className="text-lg font-semibold text-gray-50 flex items-center gap-2">
                                                                <span
                                                                    className={`inline-flex h-2.5 w-2.5 rounded-full ${color.toLowerCase() === 'rouge'
                                                                        ? 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]'
                                                                        : color.toLowerCase() === 'blanc'
                                                                            ? 'bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.8)]'
                                                                            : color.toLowerCase() === 'rosé' || color.toLowerCase() === 'rose'
                                                                                ? 'bg-pink-400 shadow-[0_0_8px_rgba(244,114,182,0.8)]'
                                                                                : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                                                                        }`}
                                                                />
                                                                <span className="uppercase tracking-wide text-xs sm:text-sm text-gray-200">
                                                                    {color}
                                                                </span>
                                                            </h2>

                                                            {/* Nombre de vins (plus petit) */}
                                                            <span className="text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full bg-black/20 border border-white/10 text-gray-200">
                                                                {vins.length} vin{vins.length > 1 ? 's' : ''}
                                                            </span>
                                                        </div>

                                                        {/* Liste des vins */}
                                                        <div className="space-y-3">
                                                            {vins.map((vin, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="rounded-xl border border-white/10 bg-black/15 px-3 py-3 sm:px-4 sm:py-3.5 text-[11px] sm:text-[12px] lg:text-[10px] text-gray-100 flex flex-col gap-3 text-left"
                                                                >
                                                                    {/* Infos du vin en colonne, alignées à gauche */}
                                                                    <div className="flex flex-col gap-1.5">
                                                                        <div>
                                                                            <span className="text-gray-400 uppercase tracking-wide text-[9px] mr-1">
                                                                                Type :
                                                                            </span>
                                                                            <span className="font-semibold">
                                                                                {vin.type || 'Non précisé'}
                                                                            </span>
                                                                        </div>

                                                                        <div>
                                                                            <span className="text-gray-400 uppercase tracking-wide text-[9px] mr-1">
                                                                                Région :
                                                                            </span>
                                                                            <span>
                                                                                {vin.region || 'Non précisée'}
                                                                            </span>
                                                                        </div>

                                                                        <div>
                                                                            <span className="text-gray-400 uppercase tracking-wide text-[9px] mr-1">
                                                                                Potentiel de garde :
                                                                            </span>
                                                                            <span>
                                                                                {vin.tempsDeGarde || 'Non renseigné'}
                                                                            </span>
                                                                        </div>

                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-gray-400 uppercase tracking-wide text-[9px]">
                                                                                Quantité conseillée :
                                                                            </span>
                                                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/10 border border-emerald-400/40 text-emerald-200 font-semibold text-[10px]">
                                                                                {vin.quantite ?? 0} bouteille{vin.quantite > 1 ? 's' : ''}
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    {/* Commentaire mis en valeur */}
                                                                    <div className="mt-1">
                                                                        <p className="text-gray-400 uppercase tracking-wide text-[9px] mb-1">
                                                                            Commentaire du sommelier
                                                                        </p>

                                                                        <div className="relative rounded-2xl border border-emerald-400/40 bg-gradient-to-br from-emerald-900/60 via-gray-900/80 to-black/70 px-3.5 mt-[10px] py-3 shadow-[0_12px_30px_rgba(0,0,0,0.65)]">
                                                                            <p className="text-[11px] sm:text-[12px] lg:text-[11px] text-emerald-50 leading-relaxed">
                                                                                {vin.commentaire || 'Aucune information supplémentaire'}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })()}

                    {/* 🧩 CAS 4 : résultat des vins */}
                    {vinResult &&
                        !isAnalyzing &&
                        vinResult?.vraiPlat !== false &&
                        (() => {
                            const groupedByPlat = vinResultNormalize(vinResult);
                            const affinInvalid = vinResult?.vraiAffin === false;
                            const caveMatches = extractCaveMatchesFromVinResult(vinResult);
                            return (
                                <div className="mt-10">
                                    <motion.h1
                                        className="text-3xl sm:text-2xl font-semibold text-center mb-10"
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        Notre sommelier vous conseille :
                                    </motion.h1>

                                    <GlobalCommentBanner text={getCommentaireGlobal(vinResult)} />


                                    <div className="space-y-10">
                                        {['Aperitif', ...Object.keys(groupedByPlat).filter((k) => k !== 'Aperitif' && k !== 'Digestif'), 'Digestif']
                                            .filter((key) => groupedByPlat[key]?.length > 0)
                                            .map((plat, i) => {
                                                const vins = groupedByPlat[plat];
                                                const sectionTitle =
                                                    plat === 'Aperitif'
                                                        ? 'En apéritif'
                                                        : plat === 'Digestif'
                                                            ? 'En digestif'
                                                            : `Votre plat choisi : ${plat.charAt(0).toUpperCase() + plat.slice(1)}`;

                                                return (
                                                    <motion.div
                                                        key={plat}
                                                        className=""
                                                        initial={{ opacity: 0, y: 25 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: i * 0.15 }}
                                                    >
                                                        <h2 className="text-xl font-bold text-gray-50 mb-6 flex items-center gap-2">
                                                            {sectionTitle}
                                                        </h2>

                                                        <div
                                                            className={
                                                                vins.length > 1
                                                                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'
                                                                    : 'flex justify-center items-center w-full'
                                                            }
                                                        >
                                                            {vins
                                                                .filter(
                                                                    (vin) =>
                                                                        vin &&
                                                                        (vin.nomvin ||
                                                                            vin.nom ||
                                                                            vin.Nom ||
                                                                            vin.vindigestif)
                                                                )
                                                                .map((vin, index) => {
                                                                    const hasCaveData =
                                                                        !!vin.UUID_ || !!vin.base64_132etiquette;
                                                                    const imgSrc = vin.base64_132etiquette
                                                                        ? `data:image/jpeg;base64,${vin.base64_132etiquette}`
                                                                        : '/images/default-avatar.jpg';

                                                                    const isAperitifOrDigestif = plat === 'Aperitif' || plat === 'Digestif';
                                                                    const mainComment =
                                                                        isAperitifOrDigestif
                                                                            ? (vin.commentaire || vin.commentaireVin)
                                                                            : (vin.commentaireVin || vin.commentaire);

                                                                    const caveComment = vin.commentaireComparaisonCave;

                                                                    return (
                                                                        <motion.div
                                                                            key={index}
                                                                            whileHover={{
                                                                                scale: hasCaveData ? 1.03 : 1,
                                                                            }}
                                                                            onClick={() =>
                                                                                hasCaveData &&
                                                                                navigate(`/vin/${vin.UUID_}`)
                                                                            }
                                                                            className={`rounded-xl border border-emerald-400/40 bg-white/5 p-4 shadow-md transition-all duration-300 flex flex-col gap-3 backdrop-blur-md ${hasCaveData
                                                                                ? 'cursor-pointer hover:shadow-emerald-400/30 hover:bg-white/10'
                                                                                : 'cursor-default'
                                                                                }`}
                                                                        >

                                                                            {hasCaveData ? (
                                                                                <div className="flex items-start gap-3">
                                                                                    <div className="flex-shrink-0">
                                                                                        <img
                                                                                            src={imgSrc}
                                                                                            alt={vin.nomvin || 'Vin'}
                                                                                            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-gray-600 shadow-sm"
                                                                                            loading="lazy"
                                                                                        />
                                                                                    </div>
                                                                                    <div className="flex-1">
                                                                                        <p className="text-sm text-gray-100">
                                                                                            <strong>Nom :</strong>{' '}
                                                                                            {vin.nomvin ||
                                                                                                vin.nom ||
                                                                                                vin.Nom}
                                                                                        </p>
                                                                                        <p className="text-sm text-gray-100">
                                                                                            <strong>Couleur :</strong>{' '}
                                                                                            {vin.couleur || vin.Couleur}
                                                                                        </p>
                                                                                        <p className="text-sm text-gray-100">
                                                                                            <strong>Appellation :</strong>{' '}
                                                                                            {vin.appellation ||
                                                                                                vin.Appellation}
                                                                                        </p>
                                                                                        <p className="text-sm text-gray-100">
                                                                                            <strong>Région :</strong>{' '}
                                                                                            {vin.region ||
                                                                                                vin.Region ||
                                                                                                vin.région ||
                                                                                                vin.Région}
                                                                                        </p>

                                                                                        {vin.prix && (
                                                                                            <div className="text-sm text-gray-200 mt-1">
                                                                                                <strong>Prix :</strong>{' '}
                                                                                                {Array.isArray(vin.prix)
                                                                                                    ? vin.prix.map(
                                                                                                        (p, i) => (
                                                                                                            <span
                                                                                                                key={i}
                                                                                                                className="inline-block bg-white/10 px-2 py-1 rounded mr-2"
                                                                                                            >
                                                                                                                {p.contenance}{' '}
                                                                                                                —{' '}
                                                                                                                {p.prix}
                                                                                                            </span>
                                                                                                        )
                                                                                                    )
                                                                                                    : formatPrice(
                                                                                                        vin.prix
                                                                                                    )}
                                                                                            </div>
                                                                                        )}

                                                                                        {vin.Etagere && (
                                                                                            <p className="text-sm text-gray-100 mt-1">
                                                                                                <strong>
                                                                                                    Lieu de stockage :
                                                                                                </strong>{' '}
                                                                                                {vin.Etagere}
                                                                                            </p>
                                                                                        )}

                                                                                        {typeof vin.tauxCorrespondancePlat === 'number' && (
                                                                                            <p className="mt-1 text-xs text-emerald-300">
                                                                                                Taux de correspondance avec le plat :{' '}
                                                                                                <span className="font-semibold">
                                                                                                    {vin.tauxCorrespondancePlat}%
                                                                                                </span>
                                                                                            </p>
                                                                                        )}

                                                                                    </div>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="mt-2">
                                                                                    <p className="text-sm text-gray-100">
                                                                                        <strong>Nom :</strong>{' '}
                                                                                        {vin.nomvin ||
                                                                                            vin.nom ||
                                                                                            vin.Nom}
                                                                                    </p>
                                                                                    <p className="text-sm text-gray-100">
                                                                                        <strong>Couleur :</strong>{' '}
                                                                                        {vin.couleur || vin.Couleur}
                                                                                    </p>
                                                                                    <p className="text-sm text-gray-100">
                                                                                        <strong>Appellation :</strong>{' '}
                                                                                        {vin.appellation ||
                                                                                            vin.Appellation}
                                                                                    </p>
                                                                                    <p className="text-sm text-gray-100">
                                                                                        <strong>Région :</strong>{' '}
                                                                                        {vin.region ||
                                                                                            vin.Region ||
                                                                                            vin.région ||
                                                                                            vin.Région}
                                                                                    </p>
                                                                                    {vin.prix && (
                                                                                        <div className="text-sm text-gray-200 mt-1">
                                                                                            <strong>Prix :</strong>{' '}
                                                                                            {Array.isArray(vin.prix)
                                                                                                ? vin.prix.map((p, i) => (
                                                                                                    <span
                                                                                                        key={i}
                                                                                                        className="inline-block bg-white/10 px-2 py-1 rounded mr-2"
                                                                                                    >
                                                                                                        {p.contenance}{' '}
                                                                                                        — {p.prix}
                                                                                                    </span>
                                                                                                ))
                                                                                                : formatPrice(vin.prix)}
                                                                                        </div>
                                                                                    )}

                                                                                    {typeof vin.tauxCorrespondancePlat === 'number' && (
                                                                                        <p className="mt-1 text-xs text-emerald-300">
                                                                                            Taux de correspondance avec le plat :{' '}
                                                                                            <span className="font-semibold">
                                                                                                {vin.tauxCorrespondancePlat}%
                                                                                            </span>
                                                                                        </p>
                                                                                    )}

                                                                                </div>
                                                                            )}
                                                                            {mainComment && (
                                                                                <p className="mt-3 text-xs sm:text-sm text-emerald-100/95 italic leading-snug">
                                                                                    {mainComment}
                                                                                </p>
                                                                            )}

                                                                            {caveComment && caveComment !== mainComment && (
                                                                                <p className="mt-2 text-xs sm:text-sm text-emerald-200/95 italic leading-snug">
                                                                                    {caveComment}
                                                                                </p>
                                                                            )}
                                                                        </motion.div>
                                                                    );
                                                                })}
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}

                                        {/* Ancien résultat vin 
                                        {oldResult && showOldResult && oldResult?.vinResult && (
                                            <div className="mt-12 border-t border-gray-700 pt-8">
                                                <h2 className="text-2xl font-semibold text-center text-gray-50 mb-8">
                                                    Ancien résultat sauvegardé
                                                </h2>

                                                {(() => {
                                                    const groupedByPlatOld = vinResultNormalize(oldResult.vinResult);
                                                    return (
                                                        <div className="space-y-10">
                                                            {[
                                                                'Aperitif',
                                                                ...Object.keys(groupedByPlatOld).filter(
                                                                    (k) =>
                                                                        k !== 'Aperitif' && k !== 'Digestif'
                                                                ),
                                                                'Digestif',
                                                            ]
                                                                .filter(
                                                                    (key) => groupedByPlatOld[key]?.length > 0
                                                                )
                                                                .map((plat, i) => {
                                                                    const vins = groupedByPlatOld[plat];
                                                                    const sectionTitle =
                                                                        plat === 'Aperitif'
                                                                            ? 'En apéritif'
                                                                            : plat === 'Digestif'
                                                                                ? 'En digestif'
                                                                                : `Votre plat : ${plat.charAt(0).toUpperCase() +
                                                                                plat.slice(1)
                                                                                }`;

                                                                    return (
                                                                        <motion.div
                                                                            key={plat}
                                                                            className="rounded-2xl p-6 bg-gray-900/70 shadow-lg border border-amber-400/40 backdrop-blur-md"
                                                                            initial={{ opacity: 0, y: 25 }}
                                                                            animate={{ opacity: 1, y: 0 }}
                                                                            transition={{ delay: i * 0.15 }}
                                                                        >
                                                                            <h2 className="text-xl font-bold text-gray-50 mb-6 flex items-center gap-2">
                                                                                {sectionTitle}
                                                                            </h2>

                                                                            <div
                                                                                className={
                                                                                    vins.length > 1
                                                                                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'
                                                                                        : 'flex justify-center items-center w-full'
                                                                                }
                                                                            >
                                                                                {vins
                                                                                    .filter(
                                                                                        (vin) =>
                                                                                            vin &&
                                                                                            (vin.nomvin ||
                                                                                                vin.nom ||
                                                                                                vin.Nom ||
                                                                                                vin.vindigestif)
                                                                                    )
                                                                                    .map((vin, index) => {
                                                                                        const hasCaveData =
                                                                                            !!vin.UUID_ ||
                                                                                            !!vin.base64_132etiquette;
                                                                                        const imgSrc =
                                                                                            vin.base64_132etiquette
                                                                                                ? `data:image/jpeg;base64,${vin.base64_132etiquette}`
                                                                                                : '/images/default-avatar.jpg';
                                                                                        const isAperitifOrDigestif = plat === 'Aperitif' || plat === 'Digestif';
                                                                                        const commentaire =
                                                                                            isAperitifOrDigestif
                                                                                                ? (vin.commentaire || vin.commentaireVin) // priorité au champ "commentaire" du JSON apéro/digestif
                                                                                                : (vin.commentaireVin || vin.commentaire);

                                                                                        return (
                                                                                            <motion.div
                                                                                                key={index}
                                                                                                whileHover={{
                                                                                                    scale: 1.03,
                                                                                                }}
                                                                                                onClick={() =>
                                                                                                    hasCaveData &&
                                                                                                    navigate(
                                                                                                        `/vin/${vin.UUID_}`
                                                                                                    )
                                                                                                }
                                                                                                className="rounded-xl border border-amber-400/60 bg-white/5 p-4 shadow-md hover:shadow-amber-300/20 transition-all duration-300 flex flex-col gap-3 backdrop-blur-md"
                                                                                            >
                                                                                                {!hasCaveData && (
                                                                                                    <div className="mb-2 text-center">
                                                                                                        <span className="text-amber-300 font-semibold italic">
                                                                                                            Notre sommelier vous proposait :
                                                                                                        </span>
                                                                                                    </div>
                                                                                                )}

                                                                                                {hasCaveData ? (
                                                                                                    <div className="flex items-start gap-3">
                                                                                                        <div className="flex-shrink-0">
                                                                                                            <img
                                                                                                                src={imgSrc}
                                                                                                                alt={
                                                                                                                    vin.nomvin ||
                                                                                                                    'Vin'
                                                                                                                }
                                                                                                                className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-gray-600 shadow-sm"
                                                                                                                loading="lazy"
                                                                                                            />
                                                                                                        </div>
                                                                                                        <div className="flex-1">
                                                                                                            <p className="text-sm text-gray-100">
                                                                                                                <strong>
                                                                                                                    Nom :
                                                                                                                </strong>{' '}
                                                                                                                {vin.nomvin ||
                                                                                                                    vin.nom ||
                                                                                                                    vin.Nom}
                                                                                                            </p>
                                                                                                            <p className="text-sm text-gray-100">
                                                                                                                <strong>
                                                                                                                    Couleur :
                                                                                                                </strong>{' '}
                                                                                                                {vin.couleur ||
                                                                                                                    vin.Couleur}
                                                                                                            </p>
                                                                                                            <p className="text-sm text-gray-100">
                                                                                                                <strong>
                                                                                                                    Appellation
                                                                                                                    :
                                                                                                                </strong>{' '}
                                                                                                                {vin.appellation ||
                                                                                                                    vin.Appellation}
                                                                                                            </p>
                                                                                                            <p className="text-sm text-gray-100">
                                                                                                                <strong>
                                                                                                                    Région :
                                                                                                                </strong>{' '}
                                                                                                                {vin.region ||
                                                                                                                    vin.Region ||
                                                                                                                    vin.région ||
                                                                                                                    vin.Région}
                                                                                                            </p>

                                                                                                            {vin.prix && (
                                                                                                                <div className="text-sm text-gray-200 mt-1">
                                                                                                                    <strong>
                                                                                                                        Prix :
                                                                                                                    </strong>{' '}
                                                                                                                    {Array.isArray(
                                                                                                                        vin.prix
                                                                                                                    )
                                                                                                                        ? vin.prix.map(
                                                                                                                            (
                                                                                                                                p,
                                                                                                                                i
                                                                                                                            ) => (
                                                                                                                                <span
                                                                                                                                    key={
                                                                                                                                        i
                                                                                                                                    }
                                                                                                                                    className="inline-block bg-white/10 px-2 py-1 rounded mr-2"
                                                                                                                                >
                                                                                                                                    {
                                                                                                                                        p.contenance
                                                                                                                                    }{' '}
                                                                                                                                    —{' '}
                                                                                                                                    {
                                                                                                                                        p.prix
                                                                                                                                    }
                                                                                                                                </span>
                                                                                                                            )
                                                                                                                        )
                                                                                                                        : formatPrice(
                                                                                                                            vin.prix
                                                                                                                        )}
                                                                                                                </div>
                                                                                                            )}

                                                                                                            {vin.Etagere && (
                                                                                                                <p className="text-sm text-gray-100 mt-1">
                                                                                                                    <strong>
                                                                                                                        Lieu de
                                                                                                                        stockage
                                                                                                                        :
                                                                                                                    </strong>{' '}
                                                                                                                    {
                                                                                                                        vin.Etagere
                                                                                                                    }
                                                                                                                </p>
                                                                                                            )}
                                                                                                        </div>
                                                                                                    </div>
                                                                                                ) : (
                                                                                                    <div className="mt-2">
                                                                                                        <p className="text-sm text-gray-100">
                                                                                                            <strong>
                                                                                                                Nom :
                                                                                                            </strong>{' '}
                                                                                                            {vin.nomvin ||
                                                                                                                vin.nom ||
                                                                                                                vin.Nom}
                                                                                                        </p>
                                                                                                        <p className="text-sm text-gray-100">
                                                                                                            <strong>
                                                                                                                Couleur :
                                                                                                            </strong>{' '}
                                                                                                            {vin.couleur ||
                                                                                                                vin.Couleur}
                                                                                                        </p>
                                                                                                        <p className="text-sm text-gray-100">
                                                                                                            <strong>
                                                                                                                Appellation :
                                                                                                            </strong>{' '}
                                                                                                            {vin.appellation ||
                                                                                                                vin.Appellation}
                                                                                                        </p>
                                                                                                        <p className="text-sm text-gray-100">
                                                                                                            <strong>
                                                                                                                Région :
                                                                                                            </strong>{' '}
                                                                                                            {vin.region ||
                                                                                                                vin.Region ||
                                                                                                                vin.région ||
                                                                                                                vin.Région}
                                                                                                        </p>
                                                                                                        {vin.prix && (
                                                                                                            <div className="text-sm text-gray-200 mt-1">
                                                                                                                <strong>
                                                                                                                    Prix :
                                                                                                                </strong>{' '}
                                                                                                                {Array.isArray(
                                                                                                                    vin.prix
                                                                                                                )
                                                                                                                    ? vin.prix.map(
                                                                                                                        (
                                                                                                                            p,
                                                                                                                            i
                                                                                                                        ) => (
                                                                                                                            <span
                                                                                                                                key={
                                                                                                                                    i
                                                                                                                                }
                                                                                                                                className="inline-block bg-white/10 px-2 py-1 rounded mr-2"
                                                                                                                            >
                                                                                                                                {
                                                                                                                                    p.contenance
                                                                                                                                }{' '}
                                                                                                                                —{' '}
                                                                                                                                {
                                                                                                                                    p.prix
                                                                                                                                }
                                                                                                                            </span>
                                                                                                                        )
                                                                                                                    )
                                                                                                                    : formatPrice(
                                                                                                                        vin.prix
                                                                                                                    )}
                                                                                                            </div>
                                                                                                        )}
                                                                                                    </div>
                                                                                                )}
                                                                                                {commentaire && (
                                                                                                    <p className="mt-3 text-xs sm:text-sm text-emerald-100/95 italic leading-snug">
                                                                                                        {commentaire}
                                                                                                    </p>
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

                                        {/* Bouton similarité cave 
                                            {missingWines.length > 0 && (
                                            <div className="flex justify-center mt-8">
                                                <motion.button
                                                    onClick={() => {
                                                        const oldData = {
                                                            vinResult,
                                                            conseilResult,
                                                            missingWines,
                                                            uuid:
                                                                vinResult?.uuid ||
                                                                conseilResult?.uuid ||
                                                                UUIDTable ||
                                                                null,
                                                            timestamp: new Date().toISOString(),
                                                        };
                                                        localStorage.setItem(
                                                            'lastSommelierResult',
                                                            JSON.stringify(oldData)
                                                        );
                                                        setOldResult(oldData);

                                                        setShowSimilarPanel((s) => !s);
                                                    }}
                                                    whileHover={{ scale: 1.06 }}
                                                    whileTap={{ scale: 0.96 }}
                                                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/20 text-gray-50 font-semibold shadow-lg hover:bg-white/30 transition-all backdrop-blur-md"
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
                                                    className="mt-8 mx-auto w-full max-w-3xl rounded-2xl border border-indigo-400/40 bg-gray-900/70 shadow-xl backdrop-blur-2xl p-6"
                                                >
                                                    <motion.h3
                                                        initial={{ opacity: 0, y: -8 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="text-xl font-bold text-indigo-200 flex items-center gap-2 mb-4"
                                                    >
                                                        <i className="pi pi-sparkles"></i>
                                                        Vins non présents dans votre cave
                                                    </motion.h3>

                                                    <div className="flex items-center justify-between mb-4 gap-4">
                                                        <span className="text-sm text-gray-200">
                                                            Sélectionnez les vins pour lesquels vous souhaitez une alternative
                                                            présente dans votre cave.
                                                        </span>
                                                        <button
                                                            onClick={() => {
                                                                if (
                                                                    selectedMissing.size === missingWines.length
                                                                ) {
                                                                    setSelectedMissing(new Set());
                                                                } else {
                                                                    setSelectedMissing(
                                                                        new Set(
                                                                            missingWines.map((m) => m.name)
                                                                        )
                                                                    );
                                                                }
                                                            }}
                                                            className="text-sm px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition"
                                                        >
                                                            {selectedMissing.size === missingWines.length
                                                                ? 'Tout désélectionner'
                                                                : 'Tout sélectionner'}
                                                        </button>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {missingWines.map((m, idx) => {
                                                            const checked = selectedMissing.has(m.name);
                                                            return (
                                                                <motion.label
                                                                    key={m.name + idx}
                                                                    whileHover={{ scale: 1.02 }}
                                                                    className={`group cursor-pointer rounded-xl border p-4 shadow-sm transition-all backdrop-blur-md
                                                                    ${checked
                                                                            ? 'bg-indigo-600/80 text-white border-indigo-300 shadow-indigo-300/40'
                                                                            : 'bg-white/5 border-gray-700'
                                                                        }`}
                                                                >
                                                                    <div className="flex items-start gap-3">
                                                                        <input
                                                                            type="checkbox"
                                                                            aria-label={`sélectionner ${m.name}`}
                                                                            checked={checked}
                                                                            onChange={() => {
                                                                                setSelectedMissing((prev) => {
                                                                                    const copy = new Set(prev);
                                                                                    if (copy.has(m.name)) {
                                                                                        copy.delete(m.name);
                                                                                    } else {
                                                                                        copy.add(m.name);
                                                                                    }
                                                                                    return copy;
                                                                                });
                                                                            }}
                                                                            className="mt-1 accent-indigo-400 scale-110"
                                                                        />
                                                                        <div className="flex-1">
                                                                            <div className="font-semibold">
                                                                                {m.name}
                                                                            </div>
                                                                            <div
                                                                                className={`text-xs mt-1 ${checked
                                                                                    ? 'text-indigo-100'
                                                                                    : 'text-gray-300'
                                                                                    }`}
                                                                            >
                                                                                Contexte : {m.context}
                                                                            </div>
                                                                        </div>
                                                                        <motion.div
                                                                            initial={{
                                                                                opacity: 0.4,
                                                                                scale: 0.95,
                                                                            }}
                                                                            animate={{
                                                                                opacity: checked ? 1 : 0.4,
                                                                                scale: checked ? 1 : 0.95,
                                                                            }}
                                                                            className={`px-2 py-0.5 text-xs rounded-full border
                                                                            ${checked
                                                                                    ? 'bg-white/20 border-white/40'
                                                                                    : 'bg-white/5 border-gray-500'
                                                                                }`}
                                                                        >
                                                                            À rapprocher
                                                                        </motion.div>
                                                                    </div>
                                                                </motion.label>
                                                            );
                                                        })}
                                                    </div>

                                                    <div className="flex items-center justify-end gap-3 mt-6">
                                                        <button
                                                            onClick={() => setShowSimilarPanel(false)}
                                                            className="px-4 py-2 rounded-lg border border-gray-600 bg-white/5 hover:bg-white/10 transition"
                                                        >
                                                            Annuler
                                                        </button>

                                                        <motion.button
                                                            disabled={
                                                                selectedMissing.size === 0 || simLoading
                                                            }
                                                            whileHover={
                                                                selectedMissing.size > 0 &&
                                                                    !simLoading
                                                                    ? { scale: 1.03 }
                                                                    : {}
                                                            }
                                                            whileTap={
                                                                selectedMissing.size > 0 &&
                                                                    !simLoading
                                                                    ? { scale: 0.97 }
                                                                    : {}
                                                            }
                                                            onClick={async () => {
                                                                try {
                                                                    setSimLoading(true);

                                                                    const oldData = {
                                                                        vinResult,
                                                                        conseilResult,
                                                                        missingWines,
                                                                        uuid:
                                                                            vinResult?.uuid ||
                                                                            conseilResult?.uuid ||
                                                                            UUIDTable ||
                                                                            null,
                                                                        timestamp:
                                                                            new Date().toISOString(),
                                                                    };
                                                                    localStorage.setItem(
                                                                        'lastSommelierResult',
                                                                        JSON.stringify(oldData)
                                                                    );
                                                                    setOldResult(oldData);

                                                                    const body = new FormData();
                                                                    body.append(
                                                                        'uuidTable',
                                                                        vinResult?.uuid ||
                                                                        conseilResult?.uuid ||
                                                                        UUIDTable ||
                                                                        ''
                                                                    );
                                                                    body.append('uuidUser', UUIDuser);
                                                                    body.append('typeCase', 'similarFromCave');
                                                                    body.append(
                                                                        'vinsDemandes',
                                                                        JSON.stringify(
                                                                            Array.from(selectedMissing)
                                                                        )
                                                                    );
                                                                    body.append('token', token);

                                                                    const res = await fetch(
                                                                        `${config.apiBaseUrl}/4DACTION/react_conseilPlatIA`,
                                                                        {
                                                                            method: 'POST',
                                                                            headers: authHeader(),
                                                                            body,
                                                                        }
                                                                    );

                                                                    if (!res.ok)
                                                                        throw new Error('Erreur serveur');
                                                                    const data = await res.json();
                                                                    setSimMatches({
                                                                        matches: (data.conseil || []).map(
                                                                            (m) => ({
                                                                                ...m,
                                                                                target: {
                                                                                    nom:
                                                                                        m?.target?.nom ||
                                                                                        m?.target?.Nom ||
                                                                                        '',
                                                                                    appellation:
                                                                                        m?.target?.appellation ||
                                                                                        m?.target
                                                                                            ?.Appellation ||
                                                                                        '',
                                                                                    region:
                                                                                        m?.target?.region ||
                                                                                        m?.target?.Region ||
                                                                                        m?.target?.Région ||
                                                                                        '',
                                                                                },
                                                                                match: {
                                                                                    Nom:
                                                                                        m?.match?.Nom ||
                                                                                        m?.match?.nom ||
                                                                                        '',
                                                                                    Appellation:
                                                                                        m?.match?.Appellation ||
                                                                                        m?.match
                                                                                            ?.appellation ||
                                                                                        '',
                                                                                    Région:
                                                                                        m?.match?.Région ||
                                                                                        m?.match?.Region ||
                                                                                        m?.match?.region ||
                                                                                        '',
                                                                                    UUID_:
                                                                                        m?.match?.UUID_ ||
                                                                                        m?.match?.uuid ||
                                                                                        '',
                                                                                    base64_132etiquette:
                                                                                        m?.match
                                                                                            ?.base64_132etiquette ||
                                                                                        '',
                                                                                },
                                                                                score:
                                                                                    typeof m?.score === 'number'
                                                                                        ? m.score
                                                                                        : null,
                                                                            })
                                                                        ),
                                                                    });
                                                                    toast.current?.show({
                                                                        severity: 'success',
                                                                        summary: 'OK',
                                                                        detail: 'Recherche de similitudes effectuée',
                                                                        life: 2500,
                                                                    });
                                                                } catch (e) {
                                                                    toast.current?.show({
                                                                        severity: 'error',
                                                                        summary: 'Erreur',
                                                                        detail: "Impossible d'obtenir les correspondances",
                                                                        life: 3500,
                                                                    });
                                                                } finally {
                                                                    setSimLoading(false);
                                                                }
                                                            }}
                                                            className={`px-5 py-2.5 rounded-lg font-semibold shadow
                                                            ${selectedMissing.size === 0 ||
                                                                    simLoading
                                                                    ? 'bg-gray-700 text-gray-300 cursor-not-allowed'
                                                                    : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                                                                }`}
                                                        >
                                                            {simLoading ? 'Recherche...' : 'Lancer la recherche'}
                                                        </motion.button>
                                                    </div>

                                                    {simMatches?.matches?.length > 0 && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 14 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="mt-8"
                                                        >
                                                            <h4 className="font-bold text-gray-50 mb-3">
                                                                Correspondances trouvées dans votre cave
                                                            </h4>

                                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                {simMatches.matches.map((m, i) => {
                                                                    const target = m?.target || {};
                                                                    const targetLabel = [
                                                                        target.nom,
                                                                        target.appellation,
                                                                        target.region,
                                                                    ]
                                                                        .filter(Boolean)
                                                                        .join(' · ');

                                                                    const match = m?.match || {};
                                                                    const nom =
                                                                        match.Nom || match.nom || '';
                                                                    const appellation =
                                                                        match.Appellation ||
                                                                        match.appellation ||
                                                                        '';
                                                                    const region =
                                                                        match.Région ||
                                                                        match.Region ||
                                                                        match.region ||
                                                                        '';
                                                                    const uuid =
                                                                        match.UUID_ || match.uuid || '';
                                                                    const imgB64 =
                                                                        match.base64_132etiquette || '';
                                                                    const imgSrc = imgB64
                                                                        ? `data:image/jpeg;base64,${imgB64}`
                                                                        : '/images/default-avatar.jpg';

                                                                    const isClickable = !!uuid;

                                                                    return (
                                                                        <motion.div
                                                                            key={i}
                                                                            whileHover={{
                                                                                scale: isClickable ? 1.02 : 1,
                                                                            }}
                                                                            onClick={
                                                                                isClickable
                                                                                    ? () =>
                                                                                        navigate(
                                                                                            `/vin/${uuid}`
                                                                                        )
                                                                                    : undefined
                                                                            }
                                                                            onKeyDown={
                                                                                isClickable
                                                                                    ? (e) => {
                                                                                        if (e.key === 'Enter')
                                                                                            navigate(
                                                                                                `/vin/${uuid}`
                                                                                            );
                                                                                    }
                                                                                    : undefined
                                                                            }
                                                                            role={
                                                                                isClickable
                                                                                    ? 'button'
                                                                                    : undefined
                                                                            }
                                                                            tabIndex={
                                                                                isClickable ? 0 : -1
                                                                            }
                                                                            className={`rounded-xl border bg-white/5 p-4 shadow transition backdrop-blur-md
                                                                            ${isClickable
                                                                                    ? 'cursor-pointer hover:shadow-indigo-300/30 hover:bg-white/10'
                                                                                    : 'cursor-default border-gray-700'
                                                                                }`}
                                                                            aria-label={
                                                                                isClickable
                                                                                    ? `Voir la fiche du vin ${nom}`
                                                                                    : undefined
                                                                            }
                                                                        >
                                                                            <div className="text-sm text-gray-300 mb-2">
                                                                                Cible :{' '}
                                                                                <span className="font-medium text-gray-50">
                                                                                    {targetLabel || '—'}
                                                                                </span>
                                                                            </div>

                                                                            {nom ? (
                                                                                <>
                                                                                    <img
                                                                                        className="w-20 h-20 object-cover rounded-lg border border-gray-600 mb-3"
                                                                                        src={imgSrc}
                                                                                        alt={nom}
                                                                                        loading="lazy"
                                                                                        draggable={false}
                                                                                    />
                                                                                    <div className="grid grid-cols-[100px,1fr] gap-x-2 gap-y-1 text-sm text-gray-100">
                                                                                        <div className="text-gray-400 flex items-center min-h-[1.75rem]">
                                                                                            Nom :
                                                                                        </div>
                                                                                        <div className="min-h-[1.75rem] flex items-center">
                                                                                            <span className="break-words whitespace-pre-wrap">
                                                                                                {nom}
                                                                                            </span>
                                                                                        </div>

                                                                                        <div className="text-gray-400 flex items-center min-h-[1.75rem]">
                                                                                            Appellation :
                                                                                        </div>
                                                                                        <div className="min-h-[1.75rem] flex items-center">
                                                                                            <span className="break-words whitespace-pre-wrap">
                                                                                                {appellation || '—'}
                                                                                            </span>
                                                                                        </div>

                                                                                        <div className="text-gray-400 flex items-center min-h-[1.75rem]">
                                                                                            Région :
                                                                                        </div>
                                                                                        <div className="min-h-[1.75rem] flex items-center">
                                                                                            <span className="break-words whitespace-pre-wrap">
                                                                                                {region || '—'}
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>

                                                                                    {typeof m.score === 'number' && (
                                                                                        <div className="mt-2 text-xs text-gray-400">
                                                                                            Score de proximité :{' '}
                                                                                            {Math.round(
                                                                                                m.score * 100
                                                                                            )}
                                                                                            %
                                                                                        </div>
                                                                                    )}
                                                                                </>
                                                                            ) : (
                                                                                <div className="text-sm text-gray-400 italic">
                                                                                    Aucune correspondance
                                                                                </div>
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
                                        */}

                                    </div>

                                    {caveMatches.length > 0 && (
                                        <div className="mt-12">
                                            <h2 className="text-2xl font-semibold text-center mb-6">
                                                Vins correspondants dans votre cave
                                            </h2>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {caveMatches.map((match, idx) => {
                                                    const { target, cave } = match;
                                                    const imgSrc = cave.base64_132etiquette
                                                        ? `data:image/jpeg;base64,${cave.base64_132etiquette}`
                                                        : '/images/default-avatar.jpg';
                                                    const isClickable = !!cave.UUID_;
                                                    const taux =
                                                        typeof match.taux === 'number'
                                                            ? match.taux
                                                            : typeof cave.tauxCorrespondanceCave === 'number'
                                                                ? cave.tauxCorrespondanceCave
                                                                : typeof cave.tauxCorrespondance === 'number'
                                                                    ? cave.tauxCorrespondance
                                                                    : null;

                                                    const targetLabelParts = [
                                                        target.nomvin,
                                                        target.appellation,
                                                        target.region,
                                                    ].filter(Boolean);
                                                    const targetLabel = targetLabelParts.join(' · ');

                                                    return (
                                                        <motion.div
                                                            key={idx}
                                                            whileHover={isClickable ? { scale: 1.03 } : {}}
                                                            whileTap={isClickable ? { scale: 0.97 } : {}}
                                                            onClick={
                                                                isClickable ? () => navigate(`/vin/${cave.UUID_}`) : undefined
                                                            }
                                                            className={`h-full flex flex-col rounded-2xl p-4 bg-gray-900/80 border shadow-md backdrop-blur-md transition-all
                            ${isClickable
                                                                    ? 'cursor-pointer border-emerald-400/60 hover:shadow-emerald-300/40 hover:bg-gray-900'
                                                                    : 'cursor-default border-gray-700'
                                                                }`}
                                                        >
                                                            {/* Vin conseillé / plat cible */}
                                                            <p className="text-xs text-gray-300 mb-2 text-center min-h-[40px] flex flex-col items-center justify-center">
                                                                <span className="font-semibold text-gray-100">
                                                                    Vin conseillé pour : {target.plat || 'le plat'}
                                                                </span>
                                                                <span className="mt-1 block text-[11px] sm:text-xs text-gray-200">
                                                                    {targetLabel || '—'}
                                                                </span>
                                                            </p>

                                                            {/* Fiche du vin de la cave */}
                                                            <div className="mt-3 flex flex-col items-center min-h-[170px]">
                                                                <img
                                                                    src={imgSrc}
                                                                    alt={cave.Nom || cave.nom || target.nomvin || 'Vin'}
                                                                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-gray-600 shadow-sm"
                                                                    loading="lazy"
                                                                />

                                                                <div className="mt-3 text-sm text-gray-100 space-y-1 w-full">
                                                                    <p className="font-medium">
                                                                        {cave.Nom || cave.nom || 'Nom inconnu'}
                                                                    </p>
                                                                    <p>
                                                                        <strong>Appellation :</strong>{' '}
                                                                        {cave.Appellation || cave.appellation || '—'}
                                                                    </p>
                                                                    <p>
                                                                        <strong>Région :</strong>{' '}
                                                                        {cave.Région ||
                                                                            cave.Region ||
                                                                            cave.region ||
                                                                            '—'}
                                                                    </p>

                                                                    {typeof taux === 'number' && (
                                                                        <p className="mt-1 text-xs text-emerald-300">
                                                                            Taux de correspondance avec le plat :{' '}
                                                                            <span className="font-semibold">
                                                                                {taux}%
                                                                            </span>
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Commentaires sur le vin de cave */}
                                                            <div className="mt-3 text-xs sm:text-sm text-emerald-100/95 italic leading-snug min-h-[56px] space-y-1">
                                                                {match.commentaireCave && (
                                                                    <p>{match.commentaireCave}</p>
                                                                )}

                                                                {match.commentaireComparaisonCave && (
                                                                    <p>{match.commentaireComparaisonCave}</p>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {affinInvalid && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="mt-6 rounded-2xl p-5 bg-gray-900/70 border border-emerald-500/40 shadow backdrop-blur-md"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                                <p className="text-sm sm:text-base text-emerald-100">
                                                    <span className="font-semibold">Information :</span>{' '}
                                                    les vins ci-dessous ont été retournés
                                                    <span className="font-semibold"> sans filtrage</span> car
                                                    la demande saisie n’a pas été reconnue comme une demande
                                                    valide. Vous pouvez réessayer en entrant une autre demande.
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Bouton restart */}
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
                                            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/20 text-gray-50 font-semibold shadow-lg hover:bg-white/30 hover:shadow-emerald-300/40 transition-all duration-300 backdrop-blur-md"
                                        >
                                            <FiRefreshCcw size={18} />
                                            Recommencer
                                        </motion.button>
                                    </motion.div>
                                </div>
                            );
                        })()}
                </motion.div>

                {/*Afficher Toast*/}
                <Toast ref={toast} position="bottom-right" />
            </div>
        </div>
    );
}

export default SommelierForm