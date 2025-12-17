import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GiGrapes } from 'react-icons/gi';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import {
    FaUser,
    FaEnvelope,
    FaLock,
    FaBuilding,
    FaMapMarkerAlt,
    FaIdBadge,
    FaInfoCircle,
    FaPhone,
    FaShieldAlt,
} from 'react-icons/fa';

import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import Layout from '../components/Layout';
import useAuth from '../hooks/useAuth';
import useFetchCaves from '../hooks/useFetchCaves';
import useFetchFavoris from '../hooks/useFetchFavoris';


const Profil = () => {
    const navigate = useNavigate();
    const { user, updateProfile, deleteAccount, logout } = useAuth();

    const isUserLoading = !user;

    const initialFirstName =
        user?.firstName || user?.Prenom || (user?.nom_user?.split(' ')[0] ?? '');
    const initialLastName =
        user?.lastName ||
        user?.Nom ||
        (user?.nom_user?.split(' ').slice(1).join(' ') ?? '');
    const initialEmail = user?.email || user?.Email || user?.mail || '';
    const initialTelephone =
        user?.telephone || user?.Telephone || user?.phone || user?.Phone || '';

    const [formValues, setFormValues] = useState({
        firstName: initialFirstName,
        lastName: initialLastName,
        email: initialEmail,
        societe: user?.societe || user?.Societe || '',
        adresse: user?.adresse || user?.Adresse || '',
        codePostal: user?.codePostal || user?.CodePostal || '',
        ville: user?.ville || user?.Ville || '',
        pays: user?.pays || user?.Pays || '',
        numLicence: user?.numLicence || user?.NumLicence || '',
        remarqueProfile: user?.remarqueProfile || user?.RemarqueProfile || '',
        telephone: initialTelephone,
    });

    const societe = user?.societe || user?.Societe || '';
    const adresse = user?.adresse || user?.Adresse || '';
    const codePostal = user?.codePostal || user?.CodePostal || '';
    const ville = user?.ville || user?.Ville || '';
    const pays = user?.pays || user?.Pays || '';
    const numLicence = user?.numLicence || user?.NumLicence || '';
    const remarqueProfile =
        user?.remarqueProfile || user?.RemarqueProfile || '';

    useEffect(() => {
        setFormValues({
            firstName: initialFirstName,
            lastName: initialLastName,
            email: initialEmail,
            societe: user?.societe || user?.Societe || '',
            adresse: user?.adresse || user?.Adresse || '',
            codePostal: user?.codePostal || user?.CodePostal || '',
            ville: user?.ville || user?.Ville || '',
            pays: user?.pays || user?.Pays || '',
            numLicence: user?.numLicence || user?.NumLicence || '',
            remarqueProfile: user?.remarqueProfile || user?.RemarqueProfile || '',
            telephone: initialTelephone,
        });
    }, [initialFirstName, initialLastName, initialEmail, initialTelephone, user]);


    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [profileMessage, setProfileMessage] = useState('');
    const [passwordMessage, setPasswordMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailChangeMethod, setEmailChangeMethod] = useState('magic_link');
    const [newEmail, setNewEmail] = useState('');
    const [emailChangeLoading, setEmailChangeLoading] = useState(false);
    const [emailChangeMessage, setEmailChangeMessage] = useState('');

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [phoneError, setPhoneError] = useState('');
    const [a2fFlash, setA2fFlash] = useState(false);

    const { caves, fetchCaves } = useFetchCaves();
    const { favoris, fetchFavoris } = useFetchFavoris();

    const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);
    useEffect(() => {
        fetchCaves();
        fetchFavoris();
    }, [fetchCaves, fetchFavoris]);

    const stats = useMemo(() => {
        let bottles = 0;
        if (Array.isArray(caves)) {
            for (const v of caves) {
                const reste = parseFloat(v?.Reste);
                bottles += isNaN(reste) ? 1 : reste;
            }
        }
        const favorisCount = Array.isArray(favoris) ? favoris.length : 0;
        return { bottles, favorisCount };
    }, [caves, favoris]);

    const initials = useMemo(() => {
        const fn = formValues.firstName?.trim() || '';
        const ln = formValues.lastName?.trim() || '';
        if (!fn && !ln) return '';
        const letters = `${fn} ${ln}`
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((p) => p[0]?.toUpperCase())
            .join('');
        return letters || '';
    }, [formValues.firstName, formValues.lastName]);

    const handleChangeField = (field, value) => {
        setFormValues((prev) => ({ ...prev, [field]: value }));
    };

    const handleChangePasswordField = (field, value) => {
        setPasswordForm((prev) => ({ ...prev, [field]: value }));
    };

    const hasValidPhone = useMemo(() => {
        if (!formValues.telephone) return false;
        try {
            return isValidPhoneNumber(formValues.telephone);
        } catch {
            return false;
        }
    }, [formValues.telephone]);

    const previousHasPhoneRef = useRef(hasValidPhone);
    useEffect(() => {
        if (hasValidPhone && !previousHasPhoneRef.current) {
            setA2fFlash(true);
            const t = setTimeout(() => setA2fFlash(false), 700);
            previousHasPhoneRef.current = true;
            return () => clearTimeout(t);
        }
        if (!hasValidPhone) {
            previousHasPhoneRef.current = false;
        }
    }, [hasValidPhone]);

    const handlePhoneChange = (value) => {
        setFormValues((prev) => ({ ...prev, telephone: value || '' }));

        if (!value) {
            setPhoneError('');
            return;
        }
        let valid = false;
        try {
            valid = isValidPhoneNumber(value);
        } catch {
            valid = false;
        }
        if (!valid) {
            setPhoneError('Numéro invalide');
        } else {
            setPhoneError('');
        }
    };

    const handlePhoneBlur = () => {
        const value = formValues.telephone;
        if (!value) {
            setPhoneError('');
            return;
        }
        let valid = false;
        try {
            valid = isValidPhoneNumber(value);
        } catch {
            valid = false;
        }
        if (!valid) {
            setPhoneError('Numéro invalide');
        }
    };

    const handleSaveProfile = async () => {
        setErrorMessage('');
        setProfileMessage('');

        if (formValues.telephone && !hasValidPhone) {
            setErrorMessage('Le numéro de téléphone est invalide.');
            return;
        }

        setSavingProfile(true);
        try {
            if (typeof updateProfile === 'function') {
                await updateProfile(formValues);
            }
            setProfileMessage('Profil mis à jour avec succès ✅');
            setIsEditingProfile(false);
        } catch (e) {
            console.error(e);
            setErrorMessage("Une erreur est survenue lors de la mise à jour du profil.");
        } finally {
            setSavingProfile(false);
            setTimeout(() => {
                setProfileMessage('');
                setErrorMessage('');
            }, 4000);
        }
    };

    const handleSavePassword = async () => {
        setErrorMessage('');
        setPasswordMessage('');

        if (!passwordForm.newPassword || !passwordForm.currentPassword) {
            setErrorMessage('Merci de remplir tous les champs mot de passe.');
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setErrorMessage('La confirmation ne correspond pas au nouveau mot de passe.');
            return;
        }

        setSavingPassword(true);
        try {
            setPasswordMessage('Mot de passe mis à jour avec succès ✅');
            setIsEditingPassword(false);
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (e) {
            console.error(e);
            setErrorMessage("Une erreur est survenue lors de la mise à jour du mot de passe.");
        } finally {
            setSavingPassword(false);
            setTimeout(() => {
                setPasswordMessage('');
                setErrorMessage('');
            }, 4000);
        }
    };

    const handleRequestEmailChange = async () => {
        setErrorMessage('');
        setEmailChangeMessage('');

        if (!newEmail) {
            setErrorMessage('Merci de renseigner une nouvelle adresse email.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            setErrorMessage('Adresse email invalide.');
            return;
        }

        setEmailChangeLoading(true);
        try {
            if (typeof updateProfile === 'function' && typeof window !== 'undefined') {
                console.log('Demande de changement email', {
                    newEmail,
                    method: emailChangeMethod,
                });
            }

            setEmailChangeMessage(
                "Un lien de confirmation a été envoyé à votre nouvelle adresse pour valider le changement."
            );
            setShowEmailModal(false);
            setNewEmail('');
        } catch (e) {
            console.error(e);
            setErrorMessage(
                "Impossible d'envoyer le lien de changement d'email pour le moment."
            );
        } finally {
            setEmailChangeLoading(false);
            setTimeout(() => {
                setEmailChangeMessage('');
            }, 5000);
        }
    };

    const hasPhone = useMemo(
        () => !!(formValues.telephone && String(formValues.telephone).trim()),
        [formValues.telephone]
    );

    const handleDeleteAccountClick = () => {
        setShowDeleteAccountDialog(true);
    };

    const handleConfirmDeleteAccount = async () => {
        try {
            setIsDeletingAccount(true);

            await deleteAccount();
            await logout();
            navigate('/login');
        } catch (e) {
            console.error('[handleConfirmDeleteAccount] ERROR =>', e);
        } finally {
            setIsDeletingAccount(false);
            setShowDeleteAccountDialog(false);
        }
    };



    if (isUserLoading) {
        return (
            <Layout>
                <div className="min-h-screen bg-gradient-to-b from-[#8C2438] via-[#5A1020] to-[#3B0B15] text-white flex items-center justify-center px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="relative w-full max-w-md rounded-3xl border border-white/20 bg-black/30 backdrop-blur-2xl shadow-[0_20px_70px_rgba(0,0,0,0.8)] px-6 py-7 md:px-8 md:py-8 overflow-hidden"
                    >
                        {/* Glows */}
                        <div className="pointer-events-none absolute -top-24 -left-10 w-40 h-40 rounded-full bg-[#ff4b6a]/25 blur-3xl" />
                        <div className="pointer-events-none absolute -bottom-24 -right-10 w-40 h-40 rounded-full bg-[#b20e2a]/25 blur-3xl" />

                        <AnimatePresence mode="wait">
                            {hasValidPhone ? (
                                <motion.div
                                    key="a2f-on"
                                    initial={{ opacity: 0, y: -4, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: a2fFlash ? 1.05 : 1 }}
                                    exit={{ opacity: 0, y: -4, scale: 0.95 }}
                                    transition={{ duration: 0.25 }}
                                    className="
                    absolute top-4 right-4
                    inline-flex items-center gap-2
                    rounded-full
                    bg-gradient-to-r from-emerald-400/90 via-emerald-300/90 to-teal-300/90
                    px-3 py-1
                    text-[11px] font-semibold text-slate-950
                    shadow-[0_0_25px_rgba(16,185,129,0.75)]
                "
                                >
                                    <FaShieldAlt className="text-[10px]" />
                                    <span>A2F activée</span>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="a2f-off"
                                    initial={{ opacity: 0, y: -4, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -4, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="
                    absolute top-4 right-4
                    inline-flex items-center gap-2
                    rounded-full
                    bg-black/60
                    border border-white/30
                    px-3 py-1
                    text-[11px] font-medium text-red-100/85
                "
                                >
                                    <FaShieldAlt className="text-[10px] opacity-80" />
                                    <span>A2F disponible</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="relative flex flex-col items-center text-center space-y-4">
                            {/* Avatar / logo animé */}
                            <motion.div
                                initial={{ rotate: -10 }}
                                animate={{ rotate: 10 }}
                                transition={{
                                    repeat: Infinity,
                                    repeatType: 'reverse',
                                    duration: 1.4,
                                    ease: 'easeInOut',
                                }}
                                className="
                                    w-20 h-20 md:w-24 md:h-24
                                    rounded-3xl
                                    bg-gradient-to-br from-[#d41132] via-[#b20e2a] to-[#7f0b21]
                                    shadow-xl shadow-black/70
                                    flex items-center justify-center
                                "
                            >
                                <GiGrapes className="text-3xl md:text-4xl text-red-50 drop-shadow-lg" />
                            </motion.div>

                            {/* Titre */}
                            <div>
                                <p className="text-xs uppercase tracking-[0.26em] text-red-100/70 mb-1">
                                    Vitiss.IA
                                </p>
                                <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
                                    Chargement de votre profil
                                </h1>
                            </div>

                            {/* Sous-texte */}
                            <p className="text-sm text-red-100/80 max-w-sm">
                                Nous préparons vos informations, votre cave et vos favoris
                                pour une expérience sur mesure 🍷
                            </p>

                            {/* Barre de “progression” animée */}
                            <div className="mt-2 w-full max-w-xs">
                                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                                    <motion.div
                                        initial={{ x: '-100%' }}
                                        animate={{ x: '100%' }}
                                        transition={{
                                            repeat: Infinity,
                                            duration: 1.3,
                                            ease: 'easeInOut',
                                        }}
                                        className="h-full w-1/2 bg-gradient-to-r from-[#ffe3ea] via-white to-[#ff8ba1] opacity-80"
                                    />
                                </div>
                                <div className="mt-2 flex justify-center gap-1.5 text-[11px] text-red-100/70">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-200/80 animate-pulse" />
                                    <span>Connexion sécurisée à votre compte</span>
                                </div>
                            </div>

                            {/* petits “bullets” ambiance sommelier */}
                            <div className="mt-3 grid grid-cols-1 gap-1.5 text-[11px] text-red-100/75">
                                <div className="inline-flex items-center justify-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-200" />
                                    <span>Récupération de vos informations personnelles</span>
                                </div>
                                <div className="inline-flex items-center justify-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-200" />
                                    <span>Analyse de vos caves et favoris</span>
                                </div>
                                <div className="inline-flex items-center justify-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-200" />
                                    <span>Préparation des recommandations Vitiss.IA</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-b from-[#8C2438] via-[#5A1020] to-[#3B0B15] text-white font-['Work_Sans',sans-serif]">
                <div className="max-w-5xl mx-auto px-4 pt-24 pb-10 md:pt-24">
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="mb-6"
                    >
                        <p className="text-xs uppercase tracking-[0.18em] text-red-200/70 mb-2">
                            Espace personnel
                        </p>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                            Mon profil
                        </h1>
                        <p className="mt-1 text-sm text-red-100/80 max-w-xl">
                            Gérez vos informations, suivez votre cave et retrouvez vos favoris.
                        </p>
                    </motion.div>

                    <AnimatePresence>
                        {errorMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-4 rounded-xl bg-[#3b0b13]/90 border border-red-500/60 px-4 py-2 text-sm text-[#ffd7df] shadow-lg shadow-black/40"
                            >
                                {errorMessage}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <AnimatePresence>
                        {profileMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-4 rounded-xl bg-emerald-900/80 border border-emerald-400/60 px-4 py-2 text-sm text-emerald-50 shadow-lg shadow-black/40"
                            >
                                {profileMessage}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <AnimatePresence>
                        {passwordMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-4 rounded-xl bg-emerald-900/80 border border-emerald-400/60 px-4 py-2 text-sm text-emerald-50 shadow-lg shadow-black/40"
                            >
                                {passwordMessage}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6 mb-4">
                        <motion.div
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                            className="
                                relative h-full
                                rounded-3xl overflow-hidden
                                bg-[#14070a]/80
                                border border-white/15
                                backdrop-blur-2xl
                                shadow-[0_20px_60px_rgba(0,0,0,0.75)]
                                px-5 py-5 md:px-6 md:py-6
                            "
                        >
                            <div className="pointer-events-none absolute -top-24 -left-10 w-40 h-40 rounded-full bg-[#ff4b6a]/20 blur-3xl" />
                            <div className="pointer-events-none absolute -bottom-24 -right-10 w-40 h-40 rounded-full bg-[#b20e2a]/20 blur-3xl" />

                            <AnimatePresence mode="wait">
                                {hasValidPhone ? (
                                    <motion.div
                                        key="a2f-on"
                                        initial={{ opacity: 0, y: -4, scale: 0.9 }}
                                        animate={{ opacity: 1, y: 0, scale: a2fFlash ? 1.05 : 1 }}
                                        exit={{ opacity: 0, y: -4, scale: 0.95 }}
                                        transition={{ duration: 0.25 }}
                                        className="
                    absolute top-4 right-4
                    inline-flex items-center gap-2
                    rounded-full
                    bg-gradient-to-r from-emerald-400/90 via-emerald-300/90 to-teal-300/90
                    px-3 py-1
                    text-[11px] font-semibold text-slate-950
                    shadow-[0_0_25px_rgba(16,185,129,0.75)]
                "
                                    >
                                        <FaShieldAlt className="text-[10px]" />
                                        <span>A2F activée</span>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="a2f-off"
                                        initial={{ opacity: 0, y: -4, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -4, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="
                    absolute top-4 right-4
                    inline-flex items-center gap-2
                    rounded-full
                    bg-black/60
                    border border-white/30
                    px-3 py-1
                    text-[11px] font-medium text-red-100/85
                "
                                    >
                                        <FaShieldAlt className="text-[10px] opacity-80" />
                                        <span>A2F disponible</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="relative h-full flex flex-col items-center justify-center text-center">
                                <div className="relative">
                                    <div
                                        className="
                                            w-20 h-20 md:w-24 md:h-24
                                            rounded-3xl
                                            bg-gradient-to-br from-[#d41132] via-[#b20e2a] to-[#7f0b21]
                                            shadow-xl shadow-black/60
                                            flex items-center justify-center
                                            text-2xl md:text-3xl font-extrabold
                                        "
                                    >
                                        {initials || <GiGrapes />}
                                    </div>
                                    {user && (
                                        <span className="absolute -bottom-1 -right-1 flex items-center justify-center">
                                            <span className="relative flex">
                                                <span className="absolute inset-0 rounded-full bg-emerald-400/40 blur-[5px]" />
                                                <span className="relative w-4 h-4 rounded-full bg-emerald-400 ring-2 ring-[#1a090b]">
                                                    <span className="absolute inset-0 rounded-full animate-ping bg-emerald-300/70" />
                                                    <span className="absolute inset-[3px] rounded-full bg-white/80 mix-blend-overlay" />
                                                </span>
                                            </span>
                                        </span>
                                    )}
                                </div>

                                <div className="mt-4">
                                    <h2 className="text-lg md:text-xl font-semibold">
                                        {formValues.firstName || formValues.lastName
                                            ? `${formValues.firstName} ${formValues.lastName}`.trim()
                                            : 'Invité Vitissia'}
                                    </h2>
                                    <p className="mt-1 text-xs text-red-100/80">
                                        Vitiss.IA • Votre sommelier numérique
                                    </p>
                                </div>

                                <div className="mt-6 w-full">
                                    <p className="text-[11px] uppercase tracking-[0.18em] text-red-200/70 mb-2 text-left">
                                        Ma cave
                                    </p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => navigate('/cave')}
                                            className="
                                                group w-full h-full text-left
                                                rounded-2xl border border-white/15
                                                bg-white/5 hover:bg-white/10
                                                px-3 py-3
                                                transition-all duration-200
                                                focus:outline-none focus:ring-2 focus:ring-[#ff7a8b]/60
                                            "
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-black/40 ring-1 ring-white/20">
                                                    <GiGrapes className="text-lg text-red-100" />
                                                </span>
                                                <span className="text-[11px] uppercase tracking-[0.18em] text-red-100/80">
                                                    Cave
                                                </span>
                                            </div>
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-100">Bouteilles</p>
                                                <p className="text-xl font-semibold">
                                                    {stats.bottles ?? 0}
                                                </p>
                                            </div>
                                            <p className="mt-1 text-[11px] text-red-100/80 group-hover:text-red-50">
                                                Voir le détail de ma cave
                                            </p>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => navigate('/favoris')}
                                            className="
                                                group w-full h-full text-left
                                                rounded-2xl border border-white/15
                                                bg-white/5 hover:bg-white/10
                                                px-3 py-3
                                                transition-all duration-200
                                                focus:outline-none focus:ring-2 focus:ring-[#ff7a8b]/60
                                            "
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-black/40 ring-1 ring-white/20">
                                                    <i className="pi pi-heart text-sm text-red-200" />
                                                </span>
                                                <span className="text-[11px] uppercase tracking-[0.18em] text-red-100/80">
                                                    Favoris
                                                </span>
                                            </div>
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-100">Vins favoris</p>
                                                <p className="text-xl font-semibold">
                                                    {stats.favorisCount ?? 0}
                                                </p>
                                            </div>
                                            <p className="mt-1 text-[11px] text-red-100/80 group-hover:text-red-50">
                                                Accéder à mes favoris
                                            </p>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                            className="
                                relative rounded-3xl overflow-hidden
                                bg-[#1a090b]/85
                                border border-white/15
                                backdrop-blur-2xl
                                shadow-[0_20px_60px_rgba(0,0,0,0.75)]
                                px-5 py-5 md:px-6 md:py-6
                                flex flex-col
                            "
                        >
                            <div className="pointer-events-none absolute -top-24 -right-10 w-44 h-44 rounded-full bg-[#ff4b6a]/18 blur-3xl" />
                            <div className="pointer-events-none absolute -bottom-24 -left-10 w-44 h-44 rounded-full bg-[#b20e2a]/18 blur-3xl" />

                            <div className="relative flex-1 flex flex-col">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                                    <div>
                                        <h2 className="text-lg font-semibold">Informations personnelles</h2>
                                        <p className="text-xs text-red-100/80 mt-1">
                                            Modifiez votre nom, prénom ou adresse email.
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        {!isEditingProfile && (
                                            <button
                                                type="button"
                                                onClick={() => setIsEditingProfile(true)}
                                                className="
                                                    inline-flex items-center justify-center gap-2
                                                    rounded-xl px-3 py-2
                                                    bg-white/10 hover:bg-white/15
                                                    text-xs md:text-sm font-medium
                                                    border border-white/20
                                                    transition-all duration-200
                                                "
                                            >
                                                <i className="pi pi-pencil text-xs" />
                                                Modifier
                                            </button>
                                        )}
                                        {isEditingProfile && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsEditingProfile(false);
                                                        setFormValues({
                                                            ...formValues,
                                                            firstName: initialFirstName,
                                                            lastName: initialLastName,
                                                            email: initialEmail,
                                                            telephone: initialTelephone,
                                                            societe,
                                                            adresse,
                                                            codePostal,
                                                            ville,
                                                            pays,
                                                            numLicence,
                                                            remarqueProfile,
                                                        });
                                                    }}
                                                    className="
                                                        inline-flex items-center justify-center gap-2
                                                        rounded-xl px-3 py-2
                                                        bg-white/5 hover:bg-white/10
                                                        text-xs md:text-sm font-medium
                                                        border border-white/15
                                                        transition-all duration-200
                                                    "
                                                >
                                                    Annuler
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleSaveProfile}
                                                    disabled={savingProfile}
                                                    className={`
                                                        inline-flex items-center justify-center gap-2
                                                        rounded-xl px-3 py-2
                                                        bg-gradient-to-r from-[#d41132] via-[#b20e2a] to-[#7f0b21]
                                                        text-xs md:text-sm font-semibold
                                                        shadow-md shadow-black/40
                                                        transition-all duration-200
                                                        ${savingProfile
                                                            ? 'opacity-70 cursor-wait'
                                                            : 'hover:from-[#ff2852] hover:via-[#d41132] hover:to-[#8a0b23]'
                                                        }
                                                    `}
                                                >
                                                    {savingProfile && (
                                                        <span className="w-3.5 h-3.5 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />
                                                    )}
                                                    Enregistrer
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <ProfileField
                                            icon={<FaUser className="text-xs" />}
                                            label="Prénom"
                                            value={formValues.firstName}
                                            editable={isEditingProfile}
                                            onChange={(v) => handleChangeField('firstName', v)}
                                        />
                                        <ProfileField
                                            icon={<FaUser className="text-xs" />}
                                            label="Nom"
                                            value={formValues.lastName}
                                            editable={isEditingProfile}
                                            onChange={(v) => handleChangeField('lastName', v)}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <ProfileField
                                            icon={<FaEnvelope className="text-xs" />}
                                            label="Adresse email"
                                            value={formValues.email}
                                            editable={false}
                                            onChange={() => { }}
                                        />

                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <p className="text-[11px] text-red-100/80">
                                                Pour modifier votre email, passez par une vérification sécurisée.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => setShowEmailModal(true)}
                                                className="
                                                    inline-flex items-center justify-center gap-2
                                                    rounded-xl px-3 py-1.5
                                                    bg-white/10 hover:bg-white/15
                                                    text-[11px] font-medium
                                                    border border-white/20
                                                    transition-all duration-200
                                                "
                                            >
                                                <i className="pi pi-envelope text-[11px]" />
                                                Changer mon email
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-3 space-y-3">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs font-medium text-red-100/90 flex items-center gap-1.5">
                                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-black/40 text-[10px]">
                                                    <FaPhone className="text-[10px]" />
                                                </span>
                                                Téléphone
                                            </label>

                                            {isEditingProfile ? (
                                                <div
                                                    className="
                                                        mt-0.5 w-full rounded-xl
                                                        border border-white/20 bg-black/40
                                                        px-3 py-1.5
                                                        shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]
                                                    "
                                                >
                                                    <PhoneInput
                                                        international
                                                        defaultCountry="FR"
                                                        value={formValues.telephone || ''}
                                                        onChange={(val) => handleChangeField('telephone', val || '')}
                                                        onBlur={handlePhoneBlur}
                                                        className="flex items-center gap-2 text-sm text-gray-50"
                                                    />
                                                </div>
                                            ) : (
                                                <div
                                                    className="
                                                        mt-0.5 w-full rounded-xl
                                                        border border-white/15 bg-white/5
                                                        px-3 py-2 text-sm
                                                        text-gray-100 truncate
                                                    "
                                                >
                                                    {formValues.telephone ? (
                                                        formValues.telephone
                                                    ) : (
                                                        <span className="text-red-100/70">Non renseigné</span>
                                                    )}
                                                </div>
                                            )}

                                            {phoneError && (
                                                <p className="mt-1 text-[11px] text-red-200">
                                                    {phoneError}
                                                </p>
                                            )}

                                            {isEditingProfile && (
                                                <p className="mt-1 text-[11px] text-red-100/75">
                                                    Ce numéro pourra être utilisé pour renforcer la sécurité de votre compte.
                                                </p>
                                            )}
                                        </div>

                                        <motion.div
                                            key={hasPhone ? 'badge-on' : 'badge-off'}
                                            initial={{ opacity: 0, scale: 0.95, y: 6 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            transition={{ duration: 0.25, ease: 'easeOut' }}
                                            className={`
                                                rounded-2xl px-3 py-3 md:px-4 md:py-3.5
                                                flex flex-col justify-between
                                                border
                                                ${hasPhone
                                                    ? 'border-emerald-400/70 bg-emerald-900/40 shadow-[0_0_25px_rgba(16,185,129,0.45)]'
                                                    : 'border-white/15 bg-white/5'
                                                }
                                            `}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`
                                                            inline-flex items-center justify-center w-7 h-7 rounded-xl
                                                            ${hasPhone ? 'bg-emerald-500/20' : 'bg-black/40'}
                                                        `}
                                                    >
                                                        <i
                                                            className={`
                                                                text-[13px]
                                                                ${hasPhone
                                                                    ? 'pi pi-shield text-emerald-200'
                                                                    : 'pi pi-shield text-red-100/80'
                                                                }
                                                            `}
                                                        />
                                                    </span>
                                                    <div>
                                                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-red-100/80">
                                                            Sécurité
                                                        </p>
                                                        <p className="text-xs text-red-100/80">
                                                            {hasPhone
                                                                ? 'Numéro renseigné — protection renforcée possible.'
                                                                : 'Ajoutez un numéro pour activer la protection 2 étapes.'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {hasPhone && (
                                                    <span className="relative inline-flex">
                                                        <span className="absolute inset-0 rounded-full bg-emerald-400/40 blur-md" />
                                                        <span className="relative inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-emerald-500 text-[11px] font-semibold text-slate-950">
                                                            A2F prête
                                                        </span>
                                                    </span>
                                                )}
                                            </div>

                                            {!hasPhone && (
                                                <p className="mt-2 text-[11px] text-red-100/70">
                                                    La double authentification est recommandée pour
                                                    protéger vos caves et vos favoris.
                                                </p>
                                            )}
                                        </motion.div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-white/10">
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <div className="flex items-start gap-2">
                                            <span
                                                className="
                                                    inline-flex items-center justify-center w-7 h-7 rounded-xl
                                                    bg-black/40 ring-1 ring-white/25
                                                "
                                            >
                                                <FaLock className="text-xs" />
                                            </span>
                                            <div>
                                                <p className="text-sm font-medium">Mot de passe</p>

                                                <div className="mt-1 text-sm font-mono tracking-[0.28em] text-gray-100">
                                                    ********
                                                </div>

                                                <p className="mt-1 text-xs text-red-100/80">
                                                    Pour des raisons de sécurité, il n’est jamais affiché.
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setIsEditingPassword((prev) => !prev)}
                                            className="
                                                inline-flex items-center justify-center gap-2
                                                rounded-xl px-3 py-1.5
                                                bg-white/10 hover:bg-white/15
                                                text-[11px] font-medium
                                                border border-white/20
                                                transition-all duration-200
                                            "
                                        >
                                            <i className="pi pi-lock text-[11px]" />
                                            Modifier le mot de passe
                                        </button>
                                    </div>

                                    <AnimatePresence initial={false}>
                                        {isEditingPassword && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -6 }}
                                                className="mt-4 space-y-3 rounded-2xl bg-black/40 border border-white/15 px-4 py-4"
                                            >
                                                <PasswordField
                                                    label="Mot de passe actuel"
                                                    value={passwordForm.currentPassword}
                                                    onChange={(v) =>
                                                        handleChangePasswordField(
                                                            'currentPassword',
                                                            v
                                                        )
                                                    }
                                                />
                                                <PasswordField
                                                    label="Nouveau mot de passe"
                                                    value={passwordForm.newPassword}
                                                    onChange={(v) =>
                                                        handleChangePasswordField('newPassword', v)
                                                    }
                                                />
                                                <PasswordField
                                                    label="Confirmer le nouveau mot de passe"
                                                    value={passwordForm.confirmPassword}
                                                    onChange={(v) =>
                                                        handleChangePasswordField(
                                                            'confirmPassword',
                                                            v
                                                        )
                                                    }
                                                />

                                                <div className="flex justify-end gap-2 pt-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setIsEditingPassword(false);
                                                            setPasswordForm({
                                                                currentPassword: '',
                                                                newPassword: '',
                                                                confirmPassword: '',
                                                            });
                                                        }}
                                                        className="
                                            inline-flex items-center justify-center gap-2
                                            rounded-xl px-3 py-2
                                            bg-white/5 hover:bg-white/10
                                            text-xs font-medium
                                            border border-white/15
                                            transition-all duration-200
                                        "
                                                    >
                                                        Annuler
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={handleSavePassword}
                                                        disabled={savingPassword}
                                                        className={`
                                            inline-flex items-center justify-center gap-2
                                            rounded-xl px-3 py-2
                                            bg-gradient-to-r from-[#d41132] via-[#b20e2a] to-[#7f0b21]
                                            text-xs font-semibold
                                            shadow-md shadow-black/40
                                            transition-all duration-200
                                            ${savingPassword
                                                                ? 'opacity-70 cursor-wait'
                                                                : 'hover:from-[#ff2852] hover:via-[#d41132] hover:to-[#8a0b23]'
                                                            }
                                        `}
                                                    >
                                                        {savingPassword && (
                                                            <span className="w-3.5 h-3.5 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />
                                                        )}
                                                        Enregistrer le mot de passe
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            <AnimatePresence>
                                {showEmailModal && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.97 }}
                                        className="
                                                fixed inset-0 z-40 flex items-center justify-center px-4
                                                bg-black/60 backdrop-blur-sm
                                            "
                                    >
                                        <div
                                            className="
                                                    relative w-full max-w-md rounded-3xl
                                                    bg-[#1a090b]/95 border border-white/15
                                                    shadow-[0_20px_80px_rgba(0,0,0,0.9)]
                                                    px-5 py-5 md:px-6 md:py-6
                                                "
                                        >
                                            {/* Glow */}
                                            <div className="pointer-events-none absolute -top-20 -right-8 w-32 h-32 rounded-full bg-[#ff4b6a]/20 blur-3xl" />

                                            <div className="relative space-y-4">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="text-xs uppercase tracking-[0.18em] text-red-200/70 mb-1">
                                                            Sécurité du compte
                                                        </p>
                                                        <h3 className="text-base md:text-lg font-semibold">
                                                            Changer mon adresse email
                                                        </h3>
                                                        <p className="mt-1 text-xs text-red-100/80">
                                                            Un lien de validation sera envoyé pour confirmer votre nouvelle adresse.
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowEmailModal(false)}
                                                        className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-xs"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>

                                                {/* Choix de la méthode */}
                                                <div className="space-y-2">
                                                    <p className="text-[11px] font-medium text-red-100/80">
                                                        Méthode de changement
                                                    </p>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setEmailChangeMethod('magic_link')}
                                                            className={`
                                                                    rounded-2xl px-3 py-2 text-left text-xs
                                                                    border transition-all duration-200
                                                                    ${emailChangeMethod === 'magic_link'
                                                                    ? 'border-white/70 bg-white/10 shadow-[0_0_25px_rgba(255,255,255,0.25)]'
                                                                    : 'border-white/15 bg-white/5 hover:bg-white/10'}
                                                                `}
                                                        >
                                                            <span className="block font-semibold text-[12px] mb-0.5">
                                                                Lien sécurisé par email
                                                            </span>
                                                            <span className="text-[11px] text-red-100/80">
                                                                Standard, simple et recommandé.
                                                            </span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setEmailChangeMethod('code')}
                                                            className={`
                                                                    rounded-2xl px-3 py-2 text-left text-xs
                                                                    border transition-all duration-200
                                                                    ${emailChangeMethod === 'code'
                                                                    ? 'border-white/70 bg-white/10 shadow-[0_0_25px_rgba(255,255,255,0.25)]'
                                                                    : 'border-white/15 bg-white/5 hover:bg-white/10'}
                                                                `}
                                                        >
                                                            <span className="block font-semibold text-[12px] mb-0.5">
                                                                Code de vérification
                                                            </span>
                                                            <span className="text-[11px] text-red-100/80">
                                                                Envoi d&apos;un code à saisir.
                                                            </span>
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Nouvelle adresse email */}
                                                <div className="space-y-1.5">
                                                    <label className="text-[11px] font-medium text-red-100/90">
                                                        Nouvelle adresse email
                                                    </label>
                                                    <input
                                                        type="email"
                                                        value={newEmail}
                                                        onChange={(e) => setNewEmail(e.target.value)}
                                                        className="
                                                                block w-full rounded-xl
                                                                border border-white/20 bg-black/40
                                                                px-3 py-2
                                                                text-sm text-gray-50 placeholder-gray-400
                                                                focus:outline-none focus:ring-2 focus:ring-[#ff7a8b] focus:border-[#ff7a8b]
                                                                shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]
                                                            "
                                                        placeholder="exemple@domaine.fr"
                                                    />
                                                    <p className="text-[11px] text-red-100/70">
                                                        Votre email actuel : <span className="font-medium">{formValues.email || 'Non renseigné'}</span>
                                                    </p>
                                                </div>

                                                {/* Boutons */}
                                                <div className="flex justify-end gap-2 pt-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setShowEmailModal(false);
                                                            setNewEmail('');
                                                        }}
                                                        className="
                                                                inline-flex items-center justify-center gap-2
                                                                rounded-xl px-3 py-2
                                                                bg-white/5 hover:bg-white/10
                                                                text-xs font-medium
                                                                border border-white/15
                                                                transition-all duration-200
                                                            "
                                                    >
                                                        Annuler
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={handleRequestEmailChange}
                                                        disabled={emailChangeLoading}
                                                        className={`
                                                                inline-flex items-center justify-center gap-2
                                                                rounded-xl px-3 py-2
                                                                bg-gradient-to-r from-[#d41132] via-[#b20e2a] to-[#7f0b21]
                                                                text-xs font-semibold
                                                                shadow-md shadow-black/40
                                                                transition-all duration-200
                                                                ${emailChangeLoading ? 'opacity-70 cursor-wait' : 'hover:from-[#ff2852] hover:via-[#d41132] hover:to-[#8a0b23]'}
                                                            `}
                                                    >
                                                        {emailChangeLoading && (
                                                            <span className="w-3.5 h-3.5 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />
                                                        )}
                                                        Envoyer le lien
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                        className="
                        relative lg:col-span-2
                        rounded-3xl overflow-hidden
                        bg-[#1a090b]/85
                        border border-white/15
                        backdrop-blur-2xl
                        shadow-[0_20px_60px_rgba(0,0,0,0.75)]
                        px-5 py-5 md:px-6 md:py-6
                    "
                    >
                        <div className="pointer-events-none absolute -top-24 -left-10 w-44 h-44 rounded-full bg-[#ff4b6a]/18 blur-3xl" />
                        <div className="pointer-events-none absolute -bottom-24 -right-10 w-44 h-44 rounded-full bg-[#b20e2a]/18 blur-3xl" />

                        <div className="relative space-y-4">
                            <div className="flex items-center justify-between gap-2 mb-1">
                                <div>
                                    <h2 className="text-lg font-semibold">Informations complémentaires</h2>
                                    <p className="text-xs text-red-100/80 mt-1">
                                        Adresse, société et petite bio.
                                    </p>
                                </div>
                            </div>

                            {(formValues.adresse ||
                                formValues.ville ||
                                formValues.codePostal ||
                                formValues.pays ||
                                isEditingProfile) && (
                                    <div
                                        className="
                                        mt-1 rounded-2xl border border-white/12 bg-white/5
                                        px-3 py-3 md:px-4 md:py-3.5
                                        flex flex-col gap-2
                                    "
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-black/40 text-[11px]">
                                                <FaMapMarkerAlt />
                                            </span>
                                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-100/80">
                                                Coordonnées
                                            </p>
                                        </div>

                                        <div className="mt-1 space-y-2">
                                            <ProfileField
                                                label="Adresse"
                                                value={formValues.adresse}
                                                editable={isEditingProfile}
                                                onChange={(v) => handleChangeField('adresse', v)}
                                            />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                <ProfileField
                                                    label="Code postal"
                                                    value={formValues.codePostal}
                                                    editable={isEditingProfile}
                                                    onChange={(v) => handleChangeField('codePostal', v)}
                                                />
                                                <ProfileField
                                                    label="Ville"
                                                    value={formValues.ville}
                                                    editable={isEditingProfile}
                                                    onChange={(v) => handleChangeField('ville', v)}
                                                />
                                            </div>
                                            <ProfileField
                                                label="Pays"
                                                value={formValues.pays}
                                                editable={isEditingProfile}
                                                onChange={(v) => handleChangeField('pays', v)}
                                            />
                                        </div>
                                    </div>
                                )}

                            {formValues.societe && (
                                <ProfileField
                                    icon={<FaBuilding className="text-xs" />}
                                    label="Société"
                                    value={formValues.societe}
                                    editable={isEditingProfile}
                                    onChange={(v) => handleChangeField('societe', v)}
                                />
                            )}

                            {(formValues.remarqueProfile || isEditingProfile) && (
                                <div
                                    className="
                        mt-2 rounded-2xl border border-white/12 bg-black/35
                        px-3 py-3 md:px-4 md:py-3.5
                        flex flex-col gap-1
                    "
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-black/40 text-[11px]">
                                            <FaInfoCircle />
                                        </span>
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-100/80">
                                            À propos
                                        </p>
                                    </div>

                                    {isEditingProfile ? (
                                        <textarea
                                            className="
                                mt-0.5 block w-full rounded-xl
                                border border-white/20 bg-black/40
                                px-3 py-2
                                text-sm text-gray-50 placeholder-gray-400
                                focus:outline-none focus:ring-2 focus:ring-[#ff7a8b] focus:border-[#ff7a8b]
                                shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]
                                resize-y min-h-[80px]
                            "
                                            value={formValues.remarqueProfile ?? ''}
                                            onChange={(e) =>
                                                handleChangeField('remarqueProfile', e.target.value)
                                            }
                                            placeholder="Ajoutez quelques mots à propos de vous"
                                        />
                                    ) : (
                                        <p className="text-sm text-gray-100 leading-relaxed whitespace-pre-line">
                                            {formValues.remarqueProfile}
                                        </p>
                                    )}
                                </div>
                            )}
                            <div className="mt-4 flex justify-end">
                                <button
                                    type="button"
                                    className="
                                            inline-flex items-center justify-center gap-2
                                            rounded-xl px-4 py-2
                                            bg-gradient-to-r from-[#f97373] via-[#d41132] to-[#7f0b21]
                                            text-xs md:text-sm font-semibold text-white
                                            shadow-md shadow-black/40
                                            transition-all duration-200
                                            hover:from-[#ff2852] hover:via-[#d41132] hover:to-[#8a0b23]
                                            focus:outline-none focus:ring-2 focus:ring-red-400/70 focus:ring-offset-0
                                        "
                                    onClick={handleDeleteAccountClick}
                                >
                                    <i className="pi pi-trash text-xs" />
                                    <span>Supprimer ce compte</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
                                        {showDeleteAccountDialog && (
                                <div className="
        fixed inset-0 z-[9999]
        flex items-center justify-center
        bg-black/70 backdrop-blur-sm
    ">
                                    <div className="
            relative w-full max-w-md mx-4
            rounded-3xl
            bg-gradient-to-b from-[#3B0B15] via-[#260910] to-[#120509]
            border border-red-500/40
            shadow-[0_24px_80px_rgba(0,0,0,0.95)]
            p-5
            font-['Work_Sans',sans-serif]
            text-red-50
        ">
                                        {/* Glow décoratifs */}
                                        <div className="pointer-events-none absolute -top-16 -right-10 w-40 h-40 rounded-full bg-[#f97373]/25 blur-3xl" />
                                        <div className="pointer-events-none absolute -bottom-20 -left-10 w-40 h-40 rounded-full bg-[#d41132]/25 blur-3xl" />

                                        {/* Contenu */}
                                        <div className="relative z-10 space-y-4">
                                            {/* Header icon + titre */}
                                            <div className="flex items-center gap-3">
                                                <div className="
                        w-11 h-11 rounded-2xl
                        bg-gradient-to-br from-[#f97373] via-[#d41132] to-[#8C2438]
                        flex items-center justify-center
                        shadow-lg shadow-black/70
                    ">
                                                    <i className="pi pi-user-minus text-red-50 text-lg" />
                                                </div>
                                                <div>
                                                    <p className="text-[11px] uppercase tracking-[0.20em] text-red-200/70">
                                                        Compte utilisateur
                                                    </p>
                                                    <h3 className="text-sm sm:text-base font-semibold">
                                                        Supprimer mon compte
                                                    </h3>
                                                </div>
                                            </div>

                                            {/* Texte */}
                                            <div className="space-y-2 text-sm">
                                                <p>
                                                    Êtes-vous sûr de vouloir{' '}
                                                    <span className="font-semibold text-red-300">
                                                        supprimer définitivement votre compte
                                                    </span>
                                                    ?
                                                </p>
                                                <p className="text-xs text-red-200/80">
                                                    Cette action est irréversible : vos caves, favoris et paramètres
                                                    seront supprimés et ne pourront pas être récupérés.
                                                </p>
                                            </div>

                                            {/* Boutons */}
                                            <div className="mt-3 flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    disabled={isDeletingAccount}
                                                    onClick={() => !isDeletingAccount && setShowDeleteAccountDialog(false)}
                                                    className={`
                            inline-flex items-center justify-center
                            px-4 py-2 rounded-xl text-xs sm:text-sm font-medium
                            border border-red-400/50
                            bg-transparent
                            text-red-100
                            hover:bg-red-500/10
                            disabled:opacity-60 disabled:cursor-not-allowed
                            transition-colors duration-200
                        `}
                                                >
                                                    Annuler
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={handleConfirmDeleteAccount}
                                                    disabled={isDeletingAccount}
                                                    className={`
                            inline-flex items-center justify-center gap-2
                            px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold
                            bg-gradient-to-r from-[#f97373] via-[#d41132] to-[#8C2438]
                            text-red-50
                            shadow-[0_14px_40px_rgba(0,0,0,0.9)]
                            hover:brightness-110
                            disabled:opacity-60 disabled:cursor-not-allowed
                            transition duration-200
                        `}
                                                >
                                                    <i className={`pi ${isDeletingAccount ? 'pi-spinner pi-spin' : 'pi-trash'} text-xs sm:text-sm`} />
                                                    <span>{isDeletingAccount ? 'Suppression...' : 'Supprimer'}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
        </Layout>
    );
};

const ProfileField = ({ icon, label, value, editable, onChange }) => {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-red-100/90 flex items-center gap-1.5">
                {icon && (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-black/40 text-[10px]">
                        {icon}
                    </span>
                )}
                {label}
            </label>
            {editable ? (
                <input
                    type="text"
                    value={value ?? ''}
                    onChange={(e) => onChange(e.target.value)}
                    className="
                        mt-0.5 block w-full rounded-xl
                        border border-white/20 bg-black/40
                        px-3 py-2
                        text-sm text-gray-50 placeholder-gray-400
                        focus:outline-none focus:ring-2 focus:ring-[#ff7a8b] focus:border-[#ff7a8b]
                        shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]
                    "
                    placeholder={`Votre ${label.toLowerCase()}`}
                />
            ) : (
                <div
                    className="
                        mt-0.5 w-full rounded-xl
                        border border-white/15 bg-white/5
                        px-3 py-2 text-sm
                        text-gray-100 truncate
                    "
                >
                    {value || <span className="text-red-100/70">Non renseigné</span>}
                </div>
            )}
        </div>
    );
};


const PasswordField = ({ label, value, onChange }) => {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-red-100/90">{label}</label>
            <input
                type="password"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="
          mt-0.5 block w-full rounded-xl
          border border-white/20 bg-black/40
          px-3 py-2
          text-sm text-gray-50 placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-[#ff7a8b] focus:border-[#ff7a8b]
          shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]
        "
                placeholder="********"
            />
        </div>
    );
};

export default Profil;
