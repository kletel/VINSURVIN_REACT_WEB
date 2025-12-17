import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { motion } from 'framer-motion';
import { GiGrapes } from 'react-icons/gi';
import config from '../config/config';
import authHeader from '../config/authHeader';
import Layout from '../components/Layout';
import LoginRequiredModal from '../components/LoginRequiredModal';

const RecetteLoadingScreen = () => {
    const fakeSteps = Array.from({ length: 4 });
    const fakeIngredients = Array.from({ length: 6 });

    const ingredientPlaceholders = [
        'Analyse du plat et du contexte',
        'Sélection des ingrédients principaux',
        'Ajustement des quantités pour 2 à 4 personnes',
        'Optimisation selon le type de cuisson',
        'Ajout des assaisonnements & garnitures',
        'Vérification de la cohérence de la liste'
    ];

    const stepPlaceholders = [
        'Étape 1 – Préparation des ingrédients',
        'Étape 2 – Cuisson principale & surveillance',
        'Étape 3 – Temps de repos & finitions',
        'Étape 4 – Dressage et service'
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#8C2438] via-[#5A1020] to-[#3B0B15] text-white flex items-center justify-center px-4 font-['Work_Sans',sans-serif]">
            <div className="relative w-full max-w-3xl rounded-3xl border border-white/15 bg-black/35 backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.95)] p-6 md:p-8 overflow-hidden">

                {/* Glows de fond */}
                <div className="pointer-events-none absolute -top-24 -left-10 w-40 h-40 rounded-full bg-amber-400/25 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -right-4 w-44 h-44 rounded-full bg-rose-500/25 blur-3xl" />

                {/* Contenu principal */}
                <div className="relative flex flex-col gap-6">
                    {/* Header */}
                    <div className="flex items-center gap-4">
                        {/* Icône Vitissia animée */}
                        <motion.div
                            initial={{ rotate: -8, y: 6, scale: 0.9 }}
                            animate={{ rotate: 8, y: -4, scale: 1 }}
                            transition={{
                                repeat: Infinity,
                                repeatType: 'reverse',
                                duration: 1.5,
                                ease: 'easeInOut',
                            }}
                            className="
                                w-16 h-16 md:w-20 md:h-20
                                rounded-3xl
                                bg-gradient-to-br from-[#d41132] via-[#b20e2a] to-[#7f0b21]
                                shadow-xl shadow-black/70
                                flex items-center justify-center
                            "
                        >
                            <GiGrapes className="text-3xl md:text-4xl text-red-50 drop-shadow-lg" />
                        </motion.div>

                        <div className="flex-1">
                            <p className="text-[11px] uppercase tracking-[0.25em] text-amber-100/70 mb-1">
                                Vitiss.IA • Recette en cours de génération
                            </p>
                            <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
                                Notre IA prépare ta recette
                            </h1>
                            <p className="mt-1 text-xs md:text-sm text-amber-50/80 max-w-md">
                                Nous analysons ton plat, générons la liste d&apos;ingrédients,
                                les étapes de préparation et les temps de cuisson optimisés.
                            </p>
                        </div>
                    </div>

                    {/* Barre de progression animée */}
                    <div className="mt-2">
                        <div className="h-2 rounded-full bg-white/10 overflow-hidden relative">
                            <motion.div
                                className="
                                    absolute inset-y-0
                                    w-full
                                    bg-gradient-to-r from-amber-100 via-white to-rose-200
                                    opacity-90
                                "
                                initial={{ x: '-100%' }}
                                animate={{ x: '100%' }}
                                transition={{
                                    repeat: Infinity,
                                    repeatType: 'loop',
                                    duration: 1.8,
                                    ease: 'linear',
                                }}
                            />
                        </div>


                        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-amber-100/80">
                            <span className="inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                                Analyse du plat par Vitiss.IA
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-300 animate-pulse delay-150" />
                                Génération des ingrédients & quantités
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-300 animate-pulse delay-300" />
                                Création des étapes & temps de préparation
                            </span>
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="
                                rounded-2xl border border-white/12 bg-white/5
                                shadow-[0_16px_50px_rgba(0,0,0,0.8)]
                                p-4 md:p-5
                                flex flex-col gap-3
                            "
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-7 h-7 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                    <i className="pi pi-list text-emerald-200 text-xs" />
                                </span>
                                <p className="text-xs uppercase tracking-[0.18em] text-emerald-100/90">
                                    Ingrédients en génération
                                </p>
                            </div>

                            <div className="space-y-2.5">
                                {fakeIngredients.map((_, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.05 * idx }}
                                        className="flex items-center gap-3"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-300/90 flex-shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-[12px] text-emerald-50/90">
                                                {ingredientPlaceholders[idx % ingredientPlaceholders.length]}
                                            </p>
                                            <div className="mt-1 h-1.5 rounded-full bg-white/10 animate-pulse w-3/4" />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                        
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="
                                rounded-2xl border border-white/12 bg-white/5
                                shadow-[0_16px_50px_rgba(0,0,0,0.8)]
                                p-4 md:p-5
                                flex flex-col gap-3
                            "
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-7 h-7 rounded-xl bg-sky-500/20 flex items-center justify-center">
                                    <i className="pi pi-file text-sky-200 text-xs" />
                                </span>
                                <p className="text-xs uppercase tracking-[0.18em] text-sky-100/90">
                                    Étapes & temps de préparation
                                </p>
                            </div>

                            <div className="space-y-3">
                                {fakeSteps.map((_, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.07 * idx }}
                                        className="flex gap-3 items-start"
                                    >
                                        <div className="w-7 h-7 rounded-full bg-sky-500/80 flex items-center justify-center text-[11px] font-semibold shadow-md shadow-black/70 flex-shrink-0">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1 space-y-1.5">
                                            <p className="text-[12px] text-sky-50/95 font-medium">
                                                {stepPlaceholders[idx % stepPlaceholders.length]}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="h-2.5 px-3 py-3 rounded-full bg-black/30 border border-white/10 flex items-center justify-center text-[9px] uppercase tracking-[0.12em] text-amber-100/90">
                                                    <span>Temps en cours de calcul…</span>
                                                </div>
                                                <div className="h-5 w-5 rounded-full bg-white/10 border border-white/15 flex items-center justify-center">
                                                    <i className="pi pi-spin pi-spinner text-[10px] text-amber-100" />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-amber-50/75">
                        <span>
                            Prépare déjà ton plan de travail : la recette arrive dans quelques secondes.
                        </span>
                        <span className="hidden sm:inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            Vitiss.IA synchronise plat, ingrédients et étapes
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};


const Recette = () => {
    const [recette, setRecette] = useState(null);
    const [vin, setVin] = useState('');
    const [met, setMet] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showImagePopup, setShowImagePopup] = useState(false);
    const [completedSteps, setCompletedSteps] = useState(new Set());
    const [activeTimers, setActiveTimers] = useState({});
    const [stepTimers, setStepTimers] = useState({});
    const [instructionSteps, setInstructionSteps] = useState([]);
    const [isFav, setIsFav] = useState(false);
    const [favLoading, setFavLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [isEnregistre, setIsEnregistre] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const toast = useRef(null);
    const navigate = useNavigate();
    const isLoggedIn = !!sessionStorage.getItem('token');

    useEffect(() => {
        loadRecetteFromAPI();
    }, []);

    useEffect(() => {
        const tryFetchFav = async () => {
            try {
                if (!recette) return;
                const UUID_User = sessionStorage.getItem('uuid_user');
                const recetteUUID = sessionStorage.getItem('recetteUUID');
                const UUID_Met = recette?.UUID_Met || recette?.UUID_ || recetteUUID;
                if (!UUID_User || !UUID_Met) return;

                const url = `${config.apiBaseUrl}/4DACTION/react_getRecetteFavori?UUID_User=${encodeURIComponent(
                    UUID_User
                )}&UUID_Met=${encodeURIComponent(UUID_Met)}`;
                const resp = await fetch(url, { method: 'GET', headers: authHeader() });
                if (!resp.ok) return;
                const data = await resp.json();
                const fav = !!(data && (data.Recette_Utilisateur?.Favori ?? data.Favori));
                setIsFav(fav);
                const save = !!(
                    data &&
                    (data.Recette_Utilisateur?.Enregistre ??
                        data.Recette_Utilisateur?.Enregistrer ??
                        data.Enregistre ??
                        data.Enregistrer)
                );
                setIsEnregistre(save);
            } catch (e) {
                // ignore
            }
        };
        tryFetchFav();
    }, [recette]);

    const loadRecetteFromAPI = async () => {
        try {
            setIsLoading(true);

            const metName = sessionStorage.getItem('metName');
            const recetteUUID = sessionStorage.getItem('recetteUUID');
            const vinName = sessionStorage.getItem('vinName');

            if (!metName) {
                setError('Nom du met non trouvé');
                setIsLoading(false);
                return;
            }

            const params = new URLSearchParams({
                met: metName,
                uuidRecette: recetteUUID || '',
            });

            const response = await fetch(
                `${config.apiBaseUrl}/4DACTION/react_getRecette?${params}`,
                {
                    method: 'GET',
                    headers: authHeader(),
                }
            );

            if (response.ok) {
                const data = await response.json();

                setRecette(data);
                setVin(vinName);
                setMet(metName);
                loadInstructionSteps(data);
            } else {
                setError('Impossible de charger la recette');
            }
        } catch (err) {
            console.error('Erreur lors du chargement de la recette:', err);
            setError('Erreur lors du chargement de la recette');
        } finally {
            setIsLoading(false);
        }
    };

    const loadInstructionSteps = (recetteData) => {
        if (recetteData.instructionDetail) {
            try {
                const decodedInstructions = JSON.parse(recetteData.instructionDetail);
                setInstructionSteps(decodedInstructions);

                const timers = {};
                decodedInstructions.forEach((step, index) => {
                    const minutes = parseInt(step.temps) || 0;
                    timers[index] = minutes * 60;
                });
                setStepTimers(timers);
            } catch (err) {
                console.error('Erreur lors du décodage des instructions:', err);
                setInstructionSteps([]);
            }
        }
    };

    const parseIngredients = (text) => {
        if (!text) return [];
        return text
            .split('\n')
            .map((ingredient) => ingredient.trim())
            .filter((ingredient) => ingredient.length > 0);
    };

    const parseInstructions = (text) => {
        if (!text) return [];
        const trimmedText = text.trim();

        const numberedRegex = /(?:(?:^|\n)\d+\.\s?)/g;
        const matches = trimmedText.match(numberedRegex);

        if (matches && matches.length > 1) {
            const stepRegex = /(?<=\d+\.\s)([^0-9]+?)(?=(?:\d+\.\s)|$)/g;
            const steps = [];
            let match;
            while ((match = stepRegex.exec(trimmedText)) !== null) {
                steps.push(match[1].trim());
            }
            return steps.filter((step) => step.length > 0);
        } else {
            return trimmedText
                .split('.')
                .map((instruction) => instruction.trim())
                .filter((instruction) => instruction.length > 0);
        }
    };

    const toggleTimer = (index) => {
        if (activeTimers[index]) {
            clearInterval(activeTimers[index]);
            setActiveTimers((prev) => {
                const newTimers = { ...prev };
                delete newTimers[index];
                return newTimers;
            });
        } else {
            const timerId = setInterval(() => {
                setStepTimers((prev) => {
                    const newTimers = { ...prev };
                    if (newTimers[index] > 0) {
                        newTimers[index] = newTimers[index] - 1;
                    } else {
                        clearInterval(activeTimers[index]);
                        setActiveTimers((current) => {
                            const updated = { ...current };
                            delete updated[index];
                            return updated;
                        });
                    }
                    return newTimers;
                });
            }, 1000);

            setActiveTimers((prev) => ({ ...prev, [index]: timerId }));
        }
    };

    const markStepCompleted = (index) => {
        if (activeTimers[index]) {
            clearInterval(activeTimers[index]);
            setActiveTimers((prev) => {
                const newTimers = { ...prev };
                delete newTimers[index];
                return newTimers;
            });
        }

        setCompletedSteps((prev) => {
            const newCompleted = new Set(prev);
            if (newCompleted.has(index)) {
                newCompleted.delete(index);
            } else {
                newCompleted.add(index);
            }
            return newCompleted;
        });
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
            .toString()
            .padStart(2, '0')}`;
    };

    const getDifficultyStars = (raw) => {
        const label = (raw || 'Moyenne').trim();
        const lower = label.toLowerCase();
        let count = 2;
        if (lower.startsWith('fac')) count = 1;
        else if (lower.startsWith('dif')) count = 3;
        const norm = label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
        return { label: norm, count };
    };

    const updateRecetteUtilisateur = async (action, boolValue) => {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                setShowLoginModal(true);
                return;
            }
            const UUID_User = sessionStorage.getItem('uuid_user');
            const recetteUUID = sessionStorage.getItem('recetteUUID');
            const UUID_Met = recette?.UUID_Met || recette?.UUID_ || recetteUUID;
            if (!UUID_User || !UUID_Met) return;
            if (action === 'favori') setFavLoading(true);
            else setSaveLoading(true);

            const form = new FormData();
            form.append('UUID_User', UUID_User);
            form.append('UUID_Met', UUID_Met);
            form.append('token', token);
            form.append('action', action);
            if (typeof boolValue !== 'undefined') {
                form.append('bool', (!!boolValue).toString());
            }

            const url = `${config.apiBaseUrl}/4DACTION/react_putRecetteUtilisateur`;
            const resp = await fetch(url, {
                method: 'PUT',
                headers: authHeader(),
                body: form,
            });
            const json = await resp.json().catch(() => ({}));
            if (
                resp.ok &&
                (json.entete === 'succes' || json.success === true || json.status === 'ok')
            ) {
                if (action === 'favori') {
                    setIsFav((v) => !v);
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'Favori mis à jour',
                        life: 2500,
                    });
                } else if (action === 'enregistrer') {
                    setIsEnregistre((v) => !v);
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Enregistré',
                        detail: "État d'enregistrement mis à jour",
                        life: 2500,
                    });
                }
            } else {
                throw new Error('update-failed');
            }
        } catch (e) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Impossible de mettre à jour',
                life: 3000,
            });
        } finally {
            setFavLoading(false);
            setSaveLoading(false);
        }
    };

    const toggleFavoriRecette = async () => {
        return updateRecetteUtilisateur('favori', !isFav);
    };

    const enregistrerRecette = async () => {
        return updateRecetteUtilisateur('enregistrer', !isEnregistre);
    };

    if (isLoading) {
        return (
            <Layout>
                <RecetteLoadingScreen />
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-screen bg-[#3B0B15] font-['Work_Sans',sans-serif]">
                    <div className="text-center bg-gray-900/80 px-8 py-6 rounded-2xl border border-red-500/40 shadow-[0_18px_50px_rgba(0,0,0,0.85)]">
                        <i className="pi pi-exclamation-triangle text-red-400 text-6xl mb-4"></i>
                        <h2 className="text-2xl font-bold text-gray-50 mb-2">Erreur</h2>
                        <p className="text-gray-300 mb-4">{error}</p>
                        <Button
                            label="Retour"
                            icon="pi pi-arrow-left"
                            onClick={() => navigate(-1)}
                            className="p-button-rounded p-button-text text-sm"
                        />
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            {/* <Toast ref={toast} />*/}

            <div className="min-h-screen bg-gradient-to-b from-[#8C2438] via-[#5A1020] to-[#3B0B15] font-['Work_Sans',sans-serif] text-gray-100">
                {/* Header */}
                <div className=" px-4 py-6
                        border-b border-black/30
                        shadow-[0_18px_30px_-18px_rgba(0,0,0,0.9)]
                        bg-transparent">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex items-center gap-4 justify-between">
                            <div className="flex items-center gap-4">
                                <Button
                                    icon="pi pi-arrow-left"
                                    label="Retour"
                                    className="p-button-outlined p-button-sm md:p-button-md border-gray-600 text-gray-100 hover:bg-gray-800 px-4 py-2"
                                    onClick={() => {
                                        const origin = sessionStorage.getItem('recetteOrigin');
                                        if (origin === 'METS_VINS') {
                                            sessionStorage.setItem('restoreMetsVins', '1');
                                            navigate('/mets-vins');
                                        } else if (origin === 'VIN_DETAIL') {
                                            const uuid = sessionStorage.getItem('vinDetailUUID');
                                            if (uuid) navigate(`/vin/${uuid}`);
                                            else navigate(-1);
                                        } else {
                                            navigate(-1);
                                        }
                                    }}
                                />
                                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-50">
                                    Recette
                                </h1>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* Favori */}
                                <button
                                    onClick={() => {
                                        toggleFavoriRecette();
                                        const btn = document.getElementById('btn-fav');
                                        if (btn) {
                                            btn.classList.add('animate-bounce-once');
                                            setTimeout(
                                                () => btn.classList.remove('animate-bounce-once'),
                                                600
                                            );
                                        }
                                    }}
                                    disabled={favLoading}
                                    id="btn-fav"
                                    className={`
                                        relative inline-flex items-center justify-center h-10 w-10 rounded-full ring-1 ring-gray-700 bg-gray-900/70 transition-all duration-200
                                        ${isFav ? 'text-red-400 scale-110 shadow-[0_0_0_1px_rgba(248,113,113,0.4)]' : 'text-gray-400 hover:bg-gray-800 hover:scale-105'}
                                    `}
                                    title={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                                    aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                                >
                                    <i
                                        className={`pi pi-heart text-xl transition-all duration-300 ${isFav ? 'text-red-400' : 'text-gray-400'
                                            }`}
                                    />
                                    {favLoading && (
                                        <span className="absolute inset-0 rounded-full bg-red-400/20 opacity-70 animate-ping"></span>
                                    )}
                                </button>

                                {/* Enregistrer */}
                                <button
                                    onClick={() => {
                                        enregistrerRecette();
                                        const btn = document.getElementById('btn-save');
                                        if (btn) {
                                            btn.classList.add('animate-bounce-once');
                                            setTimeout(
                                                () => btn.classList.remove('animate-bounce-once'),
                                                600
                                            );
                                        }
                                    }}
                                    disabled={saveLoading}
                                    id="btn-save"
                                    className={`
                                        relative inline-flex items-center justify-center h-10 w-10 rounded-full ring-1 ring-gray-700 bg-gray-900/70 transition-all duration-200
                                        ${isEnregistre
                                            ? 'text-amber-400 scale-110 shadow-[0_0_0_1px_rgba(251,191,36,0.4)]'
                                            : 'text-gray-400 hover:bg-gray-800 hover:scale-105'
                                        }
                                    `}
                                    title={
                                        isEnregistre
                                            ? 'Déjà enregistrée'
                                            : 'Enregistrer la recette'
                                    }
                                    aria-label={
                                        isEnregistre
                                            ? 'Déjà enregistrée'
                                            : 'Enregistrer la recette'
                                    }
                                >
                                    <i
                                        className={`pi pi-bookmark text-xl transition-all duration-300 ${isEnregistre ? 'text-amber-400' : 'text-gray-400'
                                            }`}
                                    />
                                    {saveLoading && (
                                        <span className="absolute inset-0 rounded-full bg-amber-300/20 opacity-70 animate-ping"></span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto">
                    {/* Hero */}
                    <div
                        className="
                            relative
                            rounded-t-3xl
                            overflow-hidden
                            border border-gray-800/80
                            bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950
                            shadow-[0_22px_60px_rgba(0,0,0,0.9)]
                        "
                    >
                        {/* Container ratio pour une belle hauteur */}
                        <div className="relative w-full pt-[46%] md:pt-[36%]">
                            {recette?.imageBase64 ? (
                                <img
                                    src={`data:image/jpeg;base64,${recette.imageBase64}`}
                                    alt={recette.nomPlat}
                                    className="
                                        absolute inset-0
                                        w-full h-full
                                        object-cover
                                        cursor-pointer
                                        transition-transform duration-700 ease-out
                                        hover:scale-[1.05]
                                    "
                                    onClick={() => setShowImagePopup(true)}
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center text-gray-100">
                                        <i className="pi pi-image text-6xl mb-4 opacity-70"></i>
                                        <p className="text-lg opacity-70">Image non disponible</p>
                                    </div>
                                </div>
                            )}

                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                        </div>
                    </div>

                    {/* Contenu principal */}
                    <div className="bg-gray-950/90 border border-gray-800 rounded-b-3xl shadow-[0_22px_60px_rgba(0,0,0,0.95)] backdrop-blur-sm">
                        <div className="p-6 md:p-8 space-y-8">
                            <div className="space-y-2">
                                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-50 mb-2">
                                    {recette?.nomPlat}
                                </h1>
                                <div className="flex items-center gap-2 text-rose-300">
                                    <i className="pi pi-glass text-xl"></i>
                                    {vin && (
                                        <span className="text-lg font-medium italic">
                                            Accompagné de {vin}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Cartes infos */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {recette?.prixMet && (
                                    <div className="bg-emerald-900/30 p-6 rounded-xl text-center border border-emerald-500/40 shadow-[0_10px_30px_rgba(0,0,0,0.6)] transition-transform duration-200 hover:-translate-y-0.5 hover:border-emerald-300/80">
                                        <i className="pi pi-euro text-2xl text-emerald-300 mb-2"></i>
                                        <p className="text-xs uppercase tracking-[0.15em] text-emerald-200/80">
                                            Prix
                                        </p>
                                        <p className="mt-1 text-lg font-semibold text-gray-50">
                                            {recette.prixMet}
                                        </p>
                                    </div>
                                )}

                                {recette?.tempsPrepaMet && (
                                    <div className="bg-sky-900/30 p-6 rounded-xl text-center border border-sky-500/40 shadow-[0_10px_30px_rgba(0,0,0,0.6)] transition-transform duration-200 hover:-translate-y-0.5 hover:border-sky-300/80">
                                        <i className="pi pi-clock text-2xl text-sky-300 mb-2"></i>
                                        <p className="text-xs uppercase tracking-[0.15em] text-sky-200/80">
                                            Préparation
                                        </p>
                                        <p className="mt-1 text-lg font-semibold text-gray-50">
                                            {recette.tempsPrepaMet}
                                        </p>
                                    </div>
                                )}

                                {(() => {
                                    const { label, count } = getDifficultyStars(recette?.difficulte);
                                    return (
                                        <div className="bg-amber-900/30 p-6 rounded-xl text-center border border-amber-500/40 shadow-[0_10px_30px_rgba(0,0,0,0.6)] transition-transform duration-200 hover:-translate-y-0.5 hover:border-amber-300/80">
                                            <p className="text-xs uppercase tracking-[0.15em] text-amber-200/80 mb-2">
                                                Difficulté
                                            </p>
                                            <div className="flex items-center justify-center gap-2 mb-1">
                                                {Array.from({ length: count }).map((_, i) => (
                                                    <i
                                                        key={i}
                                                        className="pi pi-star text-2xl text-amber-300"
                                                    />
                                                ))}
                                                <span className="sr-only">{count} étoile(s)</span>
                                            </div>
                                            <p className="text-lg font-semibold text-gray-50">
                                                {label}
                                            </p>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Ingrédients */}
                            <div>
                                <div className="flex items-center gap-3 mb-6">
                                    <i className="pi pi-list text-2xl text-emerald-300"></i>
                                    <h2 className="text-2xl font-bold text-gray-50">
                                        Ingrédients
                                    </h2>
                                </div>

                                <div className="bg-gray-900/70 p-6 rounded-xl border border-gray-800 shadow-[0_12px_35px_rgba(0,0,0,0.8)]">
                                    <div className="space-y-3">
                                        {parseIngredients(recette?.ingredientsMet).map(
                                            (ingredient, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-start gap-3 group"
                                                >
                                                    <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2 flex-shrink-0 group-hover:scale-125 transition-transform" />
                                                    <span className="text-gray-100">
                                                        {ingredient}
                                                    </span>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Instructions */}
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <i className="pi pi-file-text text-2xl text-sky-300"></i>
                                        <h2 className="text-2xl font-bold text-gray-50">
                                            Instructions
                                        </h2>
                                    </div>
                                </div>

                                <div className="bg-gray-900/70 p-6 rounded-xl border border-gray-800 shadow-[0_12px_35px_rgba(0,0,0,0.8)]">
                                    {instructionSteps.length > 0 ? (
                                        <div className="space-y-6">
                                            {instructionSteps.map((step, index) => {
                                                const isCompleted = completedSteps.has(index);
                                                const timeRemaining = stepTimers[index] || 0;
                                                const isTimerActive =
                                                    activeTimers[index] != null;

                                                return (
                                                    <div
                                                        key={index}
                                                        className={`p-4 rounded-lg border transition-all duration-200 transform ${isCompleted
                                                            ? 'bg-gray-800/40 border-gray-700 opacity-70'
                                                            : 'bg-gray-950/80 border-gray-800 hover:-translate-y-0.5 hover:border-sky-400/70'
                                                            }`}
                                                    >
                                                        <div className="flex items-start gap-4">
                                                            <div
                                                                className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ${isCompleted
                                                                    ? 'bg-emerald-500'
                                                                    : 'bg-sky-500'
                                                                    }`}
                                                            >
                                                                {isCompleted ? (
                                                                    <i className="pi pi-check"></i>
                                                                ) : (
                                                                    index + 1
                                                                )}
                                                            </div>

                                                            <div className="flex-1">
                                                                <p
                                                                    className={`text-gray-100 mb-3 ${isCompleted
                                                                        ? 'line-through text-gray-500'
                                                                        : ''
                                                                        }`}
                                                                >
                                                                    {step.instruction}
                                                                </p>

                                                                <div className="flex items-center gap-4 flex-wrap">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="bg-gray-900/70 border border-gray-700 px-3 py-1 rounded-lg">
                                                                            <span className="text-sm font-mono text-amber-300">
                                                                                <i className="pi pi-clock mr-1"></i>
                                                                                {formatTime(
                                                                                    timeRemaining
                                                                                )}
                                                                            </span>
                                                                        </div>

                                                                        <Button
                                                                            icon={`pi ${isTimerActive
                                                                                ? 'pi-pause'
                                                                                : 'pi-play'
                                                                                }`}
                                                                            className={`p-button-rounded p-button-sm ${isTimerActive
                                                                                ? 'p-button-danger'
                                                                                : 'p-button-warning'
                                                                                }`}
                                                                            onClick={() =>
                                                                                toggleTimer(
                                                                                    index
                                                                                )
                                                                            }
                                                                            disabled={isCompleted}
                                                                            size="small"
                                                                        />
                                                                    </div>

                                                                    <Button
                                                                        label={
                                                                            isCompleted
                                                                                ? 'Annuler'
                                                                                : 'Réalisé'
                                                                        }
                                                                        icon={`pi ${isCompleted
                                                                            ? 'pi-undo'
                                                                            : 'pi-check'
                                                                            }`}
                                                                        className={`p-button-sm ${isCompleted
                                                                            ? 'p-button-secondary'
                                                                            : 'p-button-success'
                                                                            }`}
                                                                        onClick={() =>
                                                                            markStepCompleted(
                                                                                index
                                                                            )
                                                                        }
                                                                        size="small"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {parseInstructions(
                                                recette?.instructionMet
                                            ).map((instruction, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-start gap-4"
                                                >
                                                    <div className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-md">
                                                        {index + 1}
                                                    </div>
                                                    <span className="text-gray-100">
                                                        {instruction}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Conseils du chef */}
                            {recette?.indicationMet && (
                                <div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <i className="pi pi-lightbulb text-2xl text-amber-300"></i>
                                        <h2 className="text-2xl font-bold text-gray-50">
                                            Conseils du chef
                                        </h2>
                                    </div>

                                    <div className="bg-amber-900/25 p-6 rounded-xl border border-amber-500/40 shadow-[0_12px_35px_rgba(0,0,0,0.8)]">
                                        <p className="text-gray-100 leading-relaxed">
                                            {recette.indicationMet}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Popup image */}
            <Dialog
                visible={showImagePopup}
                onHide={() => setShowImagePopup(false)}
                header={recette?.nomPlat}
                className="w-full max-w-4xl mx-4 vitissia-dialog"
                modal
                draggable={false}
                resizable={false}
            >
                {recette?.imageBase64 && (
                    <div className="bg-black rounded-lg overflow-hidden">
                        <img
                            src={`data:image/jpeg;base64,${recette.imageBase64}`}
                            alt={recette.nomPlat}
                            className="w-full h-auto max-h-96 object-contain"
                        />
                    </div>
                )}
            </Dialog>

            <LoginRequiredModal
                visible={showLoginModal}
                onLogin={() => {
                    setShowLoginModal(false);
                    navigate('/login');
                }}
                onCancel={() => setShowLoginModal(false)}
            />
        </Layout>
    );
};

export default Recette;
