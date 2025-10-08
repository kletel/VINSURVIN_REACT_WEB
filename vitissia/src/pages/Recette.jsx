import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import config from '../config/config';
import authHeader from '../config/authHeader';
import Layout from '../components/Layout';
import LoginRequiredModal from '../components/LoginRequiredModal';

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

    // Récupère l'état de favori depuis l'API une fois la recette chargée
    useEffect(() => {
        const tryFetchFav = async () => {
            try {
                if (!recette) return;
                const UUID_User = sessionStorage.getItem('uuid_user');
                const recetteUUID = sessionStorage.getItem('recetteUUID');
                const UUID_Met = recette?.UUID_Met || recette?.UUID_ || recetteUUID;
                if (!UUID_User || !UUID_Met) return;

                const url = `${config.apiBaseUrl}/4DACTION/react_getRecetteFavori?UUID_User=${encodeURIComponent(UUID_User)}&UUID_Met=${encodeURIComponent(UUID_Met)}`;
                const resp = await fetch(url, { method: 'GET', headers: authHeader() });
                if (!resp.ok) return;
                const data = await resp.json();
                // data.Recette_Utilisateur?.Favori (boolean)
                const fav = !!(data && (data.Recette_Utilisateur?.Favori ?? data.Favori));
                setIsFav(fav);
                const save = !!(data && (
                    data.Recette_Utilisateur?.Enregistre ??
                    data.Recette_Utilisateur?.Enregistrer ??
                    data.Enregistre ??
                    data.Enregistrer
                ));
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

            // Récupérer les paramètres depuis le sessionStorage
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
                uuidRecette: recetteUUID || ''
            });

            // Appeler l'API react_getRecette
            const response = await fetch(`${config.apiBaseUrl}/4DACTION/react_getRecette?${params}`, {
                method: 'GET',
                headers: authHeader(),
            });

            if (response.ok) {
                const data = await response.json();

                setRecette(data);
                setVin(vinName);
                setMet(metName);
                loadInstructionSteps(data);

                // Nettoyer le sessionStorage après utilisation
                //sessionStorage.removeItem('metName');
                //sessionStorage.removeItem('recetteUUID');
                //sessionStorage.removeItem('vinName');
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

                // Initialiser les timers pour chaque étape
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
        return text.split('\n')
            .map(ingredient => ingredient.trim())
            .filter(ingredient => ingredient.length > 0);
    };

    const parseInstructions = (text) => {
        if (!text) return [];
        const trimmedText = text.trim();

        // Vérifier s'il y a une numérotation
        const numberedRegex = /(?:(?:^|\n)\d+\.\s?)/g;
        const matches = trimmedText.match(numberedRegex);

        if (matches && matches.length > 1) {
            // Séparer par numérotation
            const stepRegex = /(?<=\d+\.\s)([^0-9]+?)(?=(?:\d+\.\s)|$)/g;
            const steps = [];
            let match;
            while ((match = stepRegex.exec(trimmedText)) !== null) {
                steps.push(match[1].trim());
            }
            return steps.filter(step => step.length > 0);
        } else {
            // Séparer par points
            return trimmedText.split('.')
                .map(instruction => instruction.trim())
                .filter(instruction => instruction.length > 0);
        }
    };

    const toggleTimer = (index) => {
        if (activeTimers[index]) {
            // Arrêter le timer
            clearInterval(activeTimers[index]);
            setActiveTimers(prev => {
                const newTimers = { ...prev };
                delete newTimers[index];
                return newTimers;
            });
        } else {
            // Démarrer le timer
            const timerId = setInterval(() => {
                setStepTimers(prev => {
                    const newTimers = { ...prev };
                    if (newTimers[index] > 0) {
                        newTimers[index] = newTimers[index] - 1;
                    } else {
                        // Timer terminé
                        clearInterval(activeTimers[index]);
                        setActiveTimers(current => {
                            const updated = { ...current };
                            delete updated[index];
                            return updated;
                        });
                    }
                    return newTimers;
                });
            }, 1000);

            setActiveTimers(prev => ({ ...prev, [index]: timerId }));
        }
    };

    const markStepCompleted = (index) => {
        // Arrêter le timer si actif
        if (activeTimers[index]) {
            clearInterval(activeTimers[index]);
            setActiveTimers(prev => {
                const newTimers = { ...prev };
                delete newTimers[index];
                return newTimers;
            });
        }

        setCompletedSteps(prev => {
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
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Génération étoiles difficulté
    const getDifficultyStars = (raw) => {
        const label = (raw || 'Moyenne').trim();
        const lower = label.toLowerCase();
        let count = 2; // Moyenne par défaut
        if (lower.startsWith('fac')) count = 1; // Facile
        else if (lower.startsWith('dif')) count = 3; // Difficile
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
            if (action === 'favori') setFavLoading(true); else setSaveLoading(true);

            const form = new FormData();
            form.append('UUID_User', UUID_User);
            form.append('UUID_Met', UUID_Met);
            form.append('token', token);
            form.append('action', action);
            if (typeof boolValue !== 'undefined') {
                form.append('bool', (!!boolValue).toString());
            }

            const url = `${config.apiBaseUrl}/4DACTION/react_putRecetteUtilisateur`;
            const resp = await fetch(url, { method: 'PUT', headers: authHeader(), body: form });
            const json = await resp.json().catch(() => ({}));
            if (resp.ok && (json.entete === 'succes' || json.success === true || json.status === 'ok')) {
                if (action === 'favori') {
                    setIsFav((v) => !v);
                    toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Favori mis à jour', life: 2500 });
                } else if (action === 'enregistrer') {
                    setIsEnregistre((v) => !v);
                    toast.current?.show({ severity: 'success', summary: 'Enregistré', detail: 'État d\'enregistrement mis à jour', life: 2500 });
                }
            } else {
                throw new Error('update-failed');
            }
        } catch (e) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Impossible de mettre à jour', life: 3000 });
        } finally {
            setFavLoading(false);
            setSaveLoading(false);
        }
    };

    const toggleFavoriRecette = async () => {
        // action favori avec bool toggle
        return updateRecetteUtilisateur('favori', !isFav);
    };

    const enregistrerRecette = async () => {
        // envoyer bool comme pour favori: toggle de l'état actuel
        return updateRecetteUtilisateur('enregistrer', !isEnregistre);
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-xl font-semibold text-gray-600 dark:text-gray-300">Chargement de la recette...</p>
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
                        <Button label="Retour" icon="pi pi-arrow-left" onClick={() => navigate(-1)} />
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <Toast ref={toast} position="bottom-right" />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                {/* Header avec bouton retour + favori */}
                <div className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 px-4 py-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex items-center gap-4 justify-between">
                            <div className="flex items-center gap-4">
                                <Button
                                    icon="pi pi-arrow-left"
                                    label="Retour"
                                    className="p-button-outlined"
                                    onClick={() => {
                                        const origin = sessionStorage.getItem('recetteOrigin');
                                        if (origin === 'METS_VINS') {
                                            sessionStorage.setItem('restoreMetsVins', '1');
                                            navigate('/mets-vins');
                                        } else if (origin === 'VIN_DETAIL') {
                                            const uuid = sessionStorage.getItem('vinDetailUUID');
                                            if (uuid) navigate(`/vin/${uuid}`); else navigate(-1);
                                        } else {
                                            navigate(-1);
                                        }
                                    }}
                                />
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recette</h1>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* Bouton Favori */}
                                <button
                                    onClick={() => {
                                        toggleFavoriRecette();
                                        // Lance l’animation au clic
                                        const btn = document.getElementById('btn-fav');
                                        if (btn) {
                                            btn.classList.add('animate-bounce-once');
                                            setTimeout(() => btn.classList.remove('animate-bounce-once'), 600);
                                        }
                                    }}
                                    disabled={favLoading}
                                    id="btn-fav"
                                    className={`
            relative inline-flex items-center justify-center h-10 w-10 rounded-full ring-1 ring-gray-300 transition-all
            ${isFav ? 'text-red-600 bg-red-50 scale-110' : 'text-gray-500 hover:bg-red-50 hover:scale-105'}
        `}
                                    title={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                                    aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                                >
                                    <i
                                        className={`pi pi-heart text-xl transition-all duration-300 ${isFav ? 'text-red-600' : 'text-gray-500'
                                            }`}
                                    />
                                    {favLoading && (
                                        <span className="absolute inset-0 rounded-full bg-red-100 opacity-50 animate-ping"></span>
                                    )}
                                </button>

                                {/* Bouton Enregistrer */}
                                <button
                                    onClick={() => {
                                        enregistrerRecette();
                                        const btn = document.getElementById('btn-save');
                                        if (btn) {
                                            btn.classList.add('animate-bounce-once');
                                            setTimeout(() => btn.classList.remove('animate-bounce-once'), 600);
                                        }
                                    }}
                                    disabled={saveLoading}
                                    id="btn-save"
                                    className={`
            relative inline-flex items-center justify-center h-10 w-10 rounded-full ring-1 ring-gray-300 transition-all
            ${isEnregistre ? 'text-yellow-500 bg-yellow-50 scale-110' : 'text-gray-500 hover:bg-yellow-50 hover:scale-105'}
        `}
                                    title={isEnregistre ? 'Déjà enregistrée' : 'Enregistrer la recette'}
                                    aria-label={isEnregistre ? 'Déjà enregistrée' : 'Enregistrer la recette'}
                                >
                                    <i
                                        className={`pi pi-bookmark text-xl transition-all duration-300 ${isEnregistre ? 'text-yellow-500' : 'text-gray-500'
                                            }`}
                                    />
                                    {saveLoading && (
                                        <span className="absolute inset-0 rounded-full bg-yellow-100 opacity-50 animate-ping"></span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto">
                    {/* Image héro */}
                    <div className="relative h-64 md:h-80 bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400">
                        {recette?.imageBase64 ? (
                            <img
                                src={`data:image/jpeg;base64,${recette.imageBase64}`}
                                alt={recette.nomPlat}
                                className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => setShowImagePopup(true)}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center text-white">
                                    <i className="pi pi-image text-6xl mb-4 opacity-80"></i>
                                    <p className="text-lg opacity-70">Image non disponible</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Contenu principal */}
                    <div className="bg-white dark:bg-gray-800 -mt-8 mx-4 rounded-t-3xl shadow-2xl">
                        <div className="p-6 md:p-8 space-y-8">
                            {/* En-tête */}
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                    {recette?.nomPlat}
                                </h1>
                                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                    <i className="pi pi-glass text-xl"></i>
                                    {vin && <span className="text-lg font-medium italic">Accompagné de {vin}</span>}
                                </div>
                            </div>

                            {/* Cartes d'informations */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {recette?.prixMet && (
                                    <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl text-center border border-green-200 dark:border-green-800">
                                        <i className="pi pi-euro text-2xl text-green-600 dark:text-green-400 mb-2"></i>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Prix</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">{recette.prixMet}</p>
                                    </div>
                                )}

                                {recette?.tempsPrepaMet && (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl text-center border border-blue-200 dark:border-blue-800">
                                        <i className="pi pi-clock text-2xl text-blue-600 dark:text-blue-400 mb-2"></i>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Préparation</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">{recette.tempsPrepaMet}</p>
                                    </div>
                                )}

                                {/* Carte Difficulté dynamique */}
                                {(() => {
                                    const { label, count } = getDifficultyStars(recette?.difficulte);
                                    return (
                                        <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-xl text-center border border-orange-200 dark:border-orange-800">
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Difficulté</p>
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                {Array.from({ length: count }).map((_, i) => (
                                                    <i key={i} className="pi pi-star text-2xl text-orange-600 dark:text-orange-400" />
                                                ))}
                                                <span className="sr-only">{count} étoile(s)</span>
                                            </div>
                                            <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Ingrédients */}
                            <div>
                                <div className="flex items-center gap-3 mb-6">
                                    <i className="pi pi-list text-2xl text-green-600 dark:text-green-400"></i>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Ingrédients</h2>
                                </div>

                                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800">
                                    <div className="space-y-3">
                                        {parseIngredients(recette?.ingredientsMet).map((ingredient, index) => (
                                            <div key={index} className="flex items-start gap-3">
                                                <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                                                <span className="text-gray-900 dark:text-white">{ingredient}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Instructions */}
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <i className="pi pi-file-text text-2xl text-blue-600 dark:text-blue-400"></i>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Instructions</h2>
                                    </div>
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                                    {instructionSteps.length > 0 ? (
                                        // Instructions détaillées avec timers
                                        <div className="space-y-6">
                                            {instructionSteps.map((step, index) => {
                                                const isCompleted = completedSteps.has(index);
                                                const timeRemaining = stepTimers[index] || 0;
                                                const isTimerActive = activeTimers[index] != null;

                                                return (
                                                    <div key={index} className={`p-4 rounded-lg border ${isCompleted ? 'bg-gray-100 dark:bg-gray-700 opacity-60' : 'bg-white dark:bg-gray-800'} border-gray-200 dark:border-gray-600`}>
                                                        <div className="flex items-start gap-4">
                                                            {/* Numéro d'étape */}
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}>
                                                                {isCompleted ? <i className="pi pi-check"></i> : index + 1}
                                                            </div>

                                                            {/* Contenu */}
                                                            <div className="flex-1">
                                                                <p className={`text-gray-900 dark:text-white mb-3 ${isCompleted ? 'line-through text-gray-500' : ''}`}>
                                                                    {step.instruction}
                                                                </p>

                                                                {/* Contrôles */}
                                                                <div className="flex items-center gap-4 flex-wrap">
                                                                    {/* Timer */}
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg">
                                                                            <span className="text-sm font-mono text-orange-600 dark:text-orange-400">
                                                                                <i className="pi pi-clock mr-1"></i>
                                                                                {formatTime(timeRemaining)}
                                                                            </span>
                                                                        </div>

                                                                        <Button
                                                                            icon={`pi ${isTimerActive ? 'pi-pause' : 'pi-play'}`}
                                                                            className={`p-button-rounded p-button-sm ${isTimerActive ? 'p-button-danger' : 'p-button-warning'}`}
                                                                            onClick={() => toggleTimer(index)}
                                                                            disabled={isCompleted}
                                                                            size="small"
                                                                        />
                                                                    </div>

                                                                    {/* Bouton de completion */}
                                                                    <Button
                                                                        label={isCompleted ? 'Annuler' : 'Réalisé'}
                                                                        icon={`pi ${isCompleted ? 'pi-undo' : 'pi-check'}`}
                                                                        className={`p-button-sm ${isCompleted ? 'p-button-secondary' : 'p-button-success'}`}
                                                                        onClick={() => markStepCompleted(index)}
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
                                        // Instructions simples
                                        <div className="space-y-4">
                                            {parseInstructions(recette?.instructionMet).map((instruction, index) => (
                                                <div key={index} className="flex items-start gap-4">
                                                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                                                        {index + 1}
                                                    </div>
                                                    <span className="text-gray-900 dark:text-white">{instruction}</span>
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
                                        <i className="pi pi-lightbulb text-2xl text-orange-600 dark:text-orange-400"></i>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Conseils du chef</h2>
                                    </div>

                                    <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-xl border border-orange-200 dark:border-orange-800">
                                        <p className="text-gray-900 dark:text-white leading-relaxed">{recette.indicationMet}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Popup d'image */}
            <Dialog
                visible={showImagePopup}
                onHide={() => setShowImagePopup(false)}
                header={recette?.nomPlat}
                className="w-full max-w-4xl mx-4"
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
                onLogin={() => { setShowLoginModal(false); navigate('/login'); }}
                onCancel={() => setShowLoginModal(false)}
            />
        </Layout>
    );
};

export default Recette;
