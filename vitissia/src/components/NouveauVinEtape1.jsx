import React, { useState, useContext, useEffect } from 'react';
import { FileUpload } from 'primereact/fileupload';
import { ProgressSpinner } from 'primereact/progressspinner';
import { ThemeContext } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const NouveauVinEtape1 = ({ onAnalyzeComplete, onManualMode, customBase64Uploader, isAnalyzing }) => {
    const { darkMode } = useContext(ThemeContext);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const analyzingSteps = [
        "Lecture de la photo",
        "Détection du texte sur l'étiquette",
        "Identification du domaine & de l'appellation",
        "Préparation de la fiche de vin"
    ];

    return (
        <div className="
            min-h-screen
            font-['Work_Sans',sans-serif]
            bg-gradient-to-b from-[#8C2438] via-[#5A1020] to-[#3B0B15]
            text-white
        ">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="
                    px-4 py-6 mb-4
                    border-b border-black/40
                    shadow-[0_18px_30px_-18px_rgba(0,0,0,0.9)]
                    bg-transparent
                    backdrop-blur-sm
                "
            >
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center gap-4 mb-1">
                        <motion.div
                            whileHover={{ scale: 1.05, rotate: -3 }}
                            whileTap={{ scale: 0.97 }}
                            transition={{ type: 'tween', duration: 0.15 }}
                            className="
                                w-14 h-14 sm:w-16 sm:h-16
                                bg-gray-900/70
                                rounded-2xl flex items-center justify-center
                                shadow-[0_14px_38px_rgba(255,255,255,0.35)]
                                flex-shrink-0
                            "
                        >
                            <i className="pi pi-camera text-white text-2xl sm:text-3xl" />
                        </motion.div>
                        <div className="min-w-0">
                            <h1 className="
                                text-2xl sm:text-3xl md:text-4xl
                                font-semibold
                                text-white
                                leading-tight
                                tracking-tight
                            ">
                                Analysez votre étiquette
                            </h1>
                            <p className="
                                text-sm sm:text-base mt-2
                                text-white/70
                            ">
                                Importez une photo et laissez notre IA extraire les informations
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Content */}
            <div className="max-w-7xl mx-auto py-6 sm:py-8 px-3 sm:px-4">
                {isMobile ? (
                    // ===== VERSION MOBILE =====
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="
                            bg-gray-800/50
                            shadow-[0_18px_55px_rgba(0,0,0,0.9)]
                            rounded-2xl mx-1
                            overflow-hidden
                            border border-gray-700
                            relative
                        "
                    >
                        {/* Liseré lumineux */}
                        <div className="
                            absolute inset-x-0 top-0 h-[1px]
                            bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent
                        " />
                        <div className="p-5 sm:p-6">
                            <AnimatePresence mode="wait">
                                {isAnalyzing ? (
                                    // ---------- LOADER MOBILE ----------
                                    <motion.div
                                        key="mobile-analyze"
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 6 }}
                                        transition={{ duration: 0.2 }}
                                        className="text-center py-6"
                                    >
                                        <div className="relative mb-6 flex items-center justify-center">
                                            <div className="w-28 h-28">
                                                <div className="relative w-full h-full flex items-center justify-center">
                                                    {/* Cercle + ProgressSpinner */}
                                                    <div className="
                                                        w-full h-full
                                                        rounded-full
                                                        bg-gradient-to-br from-emerald-500/15 via-teal-400/15 to-emerald-500/8
                                                        flex items-center justify-center
                                                        shadow-[0_0_45px_rgba(16,185,129,0.45)]
                                                    ">
                                                        <ProgressSpinner
                                                            style={{ width: '64px', height: '64px' }}
                                                            strokeWidth="3"
                                                            animationDuration=".8s"
                                                            className="text-emerald-300"
                                                        />
                                                    </div>

                                                    <motion.div
                                                        className="
                                                            absolute
                                                            w-10 h-10
                                                            rounded-full
                                                            bg-black/80
                                                            border border-emerald-300/70
                                                            flex items-center justify-center
                                                            shadow-[0_0_20px_rgba(16,185,129,0.8)]
                                                        "
                                                        animate={{ scale: [1, 1.06, 1] }}
                                                        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                                                    >
                                                        <i className="pi pi-brain text-emerald-100 text-lg" />
                                                    </motion.div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="max-w-xs mx-auto">
                                            <h3 className="text-lg font-semibold text-white mb-1">
                                                Analyse IA en cours
                                            </h3>
                                            <p className="text-white/80 text-xs mb-4">
                                                Votre étiquette est en train d’être lue et interprétée.
                                            </p>

                                            {/* Barre de progression animée */}
                                            <div className="mb-3">
                                                <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                                                    <motion.div
                                                        className="h-full w-1/2 bg-gradient-to-r from-emerald-400 via-emerald-200 to-white"
                                                        initial={{ x: '-60%' }}
                                                        animate={{ x: ['-60%', '110%'] }}
                                                        transition={{
                                                            repeat: Infinity,
                                                            duration: 1.8,
                                                            ease: 'easeInOut',
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Petites bulles + texte */}
                                            <div className="
                                                bg-black/45
                                                rounded-lg p-3
                                                shadow-[0_10px_30px_rgba(0,0,0,0.75)]
                                                border border-emerald-500/30
                                                mb-3
                                            ">
                                                <div className="flex items-center justify-center space-x-2 text-[11px] text-white/80">
                                                    <div className="flex space-x-1">
                                                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
                                                        <div
                                                            className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"
                                                            style={{ animationDelay: '0.1s' }}
                                                        />
                                                        <div
                                                            className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"
                                                            style={{ animationDelay: '0.2s' }}
                                                        />
                                                    </div>
                                                    <span>Extraction des informations en temps réel…</span>
                                                </div>
                                            </div>

                                            {/* Étapes d’analyse */}
                                            <div className="text-left text-[11px] text-white/80 space-y-1.5">
                                                {analyzingSteps.map((step, index) => (
                                                    <motion.div
                                                        key={step}
                                                        initial={{ opacity: 0, x: -6 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.08 * index, duration: 0.25 }}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <div className="
                                                            w-1.5 h-1.5 rounded-full
                                                            bg-emerald-400
                                                            shadow-[0_0_6px_rgba(16,185,129,0.8)]
                                                        " />
                                                        <span>{step}</span>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    // ---------- UPLOAD MOBILE ----------
                                    <motion.div
                                        key="mobile-upload"
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 6 }}
                                        transition={{ duration: 0.2 }}
                                        className="w-full max-w-sm mx-auto"
                                    >
                                        <div className="space-y-4">
                                            <div className="relative">
                                                <FileUpload
                                                    name="demo[]"
                                                    mode="basic"
                                                    chooseLabel=""
                                                    accept="image/*"
                                                    auto={true}
                                                    maxFileSize={90000000}
                                                    customUpload={true}
                                                    onSelect={customBase64Uploader}
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                    chooseOptions={{
                                                        className: "c-w-full h-full absolute inset-0 opacity-0 cursor-pointer"
                                                    }}
                                                />
                                                <motion.div
                                                    whileHover={{ scale: 1.02, y: -2 }}
                                                    whileTap={{ scale: 0.97 }}
                                                    transition={{ type: 'tween', duration: 0.15 }}
                                                    className="
                                                        text-center py-7
                                                        cursor-pointer
                                                        rounded-xl
                                                        bg-gray-900/80
                                                        hover:bg-gray-900
                                                        hover:shadow-[0_18px_45px_rgba(0,0,0,0.9)]
                                                        border border-gray-700
                                                        transition-all duration-200
                                                        group
                                                    "
                                                >
                                                    <div className="
                                                        w-20 h-20 mx-auto mb-3
                                                        bg-white/20
                                                        rounded-3xl flex items-center justify-center
                                                        shadow-[0_14px_38px_rgba(255,255,255,0.45)]
                                                        group-hover:shadow-[0_18px_50px_rgba(255,255,255,0.8)]
                                                        transition-all duration-200
                                                    ">
                                                        <i className="pi pi-camera text-white text-3xl group-hover:scale-110 transition-transform duration-200" />
                                                    </div>
                                                    <h2 className="
                                                        text-lg font-semibold text-white mb-1
                                                        group-hover:text-emerald-300
                                                        transition-colors duration-200
                                                    ">
                                                        Analysez votre vin
                                                    </h2>
                                                    <p className="
                                                        text-[13px] text-white/70
                                                        group-hover:text-white
                                                        transition-colors duration-200
                                                    ">
                                                        Importez une photo de l'étiquette
                                                    </p>
                                                </motion.div>
                                            </div>

                                            <div className="relative">
                                                <div className="absolute inset-0 flex items-center">
                                                    <div className="w-full border-t border-gray-700" />
                                                </div>
                                                <div className="relative flex justify-center text-xs">
                                                    <span className="
                                                        px-3
                                                        bg-gray-900/90
                                                        text-white
                                                        font-medium
                                                        rounded-full
                                                        border border-gray-700
                                                        shadow-[0_0_18px_rgba(0,0,0,0.6)]
                                                    ">
                                                        ou
                                                    </span>
                                                </div>
                                            </div>

                                            <motion.button
                                                whileHover={{ scale: 1.015, y: -1 }}
                                                whileTap={{ scale: 0.97 }}
                                                transition={{ type: 'tween', duration: 0.15 }}
                                                className="
                                                    w-full py-3
                                                    bg-gray-900/90
                                                    text-white
                                                    font-semibold text-xs
                                                    rounded-lg
                                                    hover:from-[#28101b] hover:to-[#200711]
                                                    border border-dashed border-gray-900/90
                                                    flex items-center justify-center gap-2
                                                    shadow-[0_10px_35px_rgba(0,0,0,0.85)]
                                                    transition-all duration-200
                                                "
                                                onClick={onManualMode}
                                            >
                                                <i className="pi pi-pencil text-sm" />
                                                Saisie manuelle
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                ) : (
                    // ===== VERSION DESKTOP =====
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.28, ease: 'easeOut' }}
                        className="
                            bg-gray-900/70
                            rounded-3xl
                            shadow-[0_28px_80px_rgba(0,0,0,0.95)]
                            border border-gray-700
                            overflow-hidden
                            relative
                        "
                    >
                        {/* Halo haut */}
                        <div className="
                            absolute inset-x-10 top-0 h-[1px]
                            bg-gradient-to-r from-transparent via-emerald-400/75 to-transparent
                        " />
                        <div className="p-8">
                            <AnimatePresence mode="wait">
                                {isAnalyzing ? (
                                    // ---------- LOADER DESKTOP ----------
                                    <motion.div
                                        key="desktop-analyze"
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 8 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex flex-col items-center justify-center py-14"
                                    >
                                        <div className="relative mb-8 flex items-center justify-center">
                                            <div className="w-40 h-40">
                                                <div className="relative w-full h-full flex items-center justify-center">
                                                    {/* halo */}
                                                    <div className="
                                                        absolute inset-4
                                                        rounded-full
                                                        bg-gradient-to-br from-emerald-500/12 via-emerald-400/8 to-emerald-500/4
                                                        blur-sm
                                                    " />
                                                    {/* cercle + spinner */}
                                                    <div className="
                                                        w-full h-full
                                                        rounded-full
                                                        bg-black/60
                                                        flex items-center justify-center
                                                        border border-emerald-400/30
                                                        shadow-[0_0_60px_rgba(16,185,129,0.65)]
                                                    ">
                                                        <ProgressSpinner
                                                            style={{ width: '90px', height: '90px' }}
                                                            strokeWidth="3"
                                                            animationDuration=".8s"
                                                            className="text-emerald-300"
                                                        />
                                                    </div>

                                                    {/* cerveau centre */}
                                                    <motion.div
                                                        className="
                                                            absolute
                                                            w-16 h-16
                                                            rounded-full
                                                            bg-black
                                                            border border-emerald-400/80
                                                            flex items-center justify-center
                                                            shadow-[0_0_40px_rgba(16,185,129,1)]
                                                        "
                                                        animate={{ scale: [1, 1.07, 1] }}
                                                        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                                                    >
                                                        <i className="pi pi-brain text-emerald-100 text-2xl" />
                                                    </motion.div>
                                                </div>
                                            </div>
                                        </div>

                                        <h3 className="text-2xl font-semibold text-white mb-2">
                                            Analyse IA en cours…
                                        </h3>
                                        <p className="text-white/80 text-base text-center max-w-xl mb-6">
                                            Notre intelligence artificielle lit l’étiquette, détecte les informations
                                            clés (domaine, appellation, millésime…) et prépare automatiquement votre fiche de vin.
                                        </p>

                                        {/* Barre de progression + texte */}
                                        <div className="w-full max-w-lg mx-auto space-y-3 mb-6">
                                            <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                                                <motion.div
                                                    className="h-full w-1/2 bg-gradient-to-r from-emerald-400 via-emerald-200 to-white"
                                                    initial={{ x: '-60%' }}
                                                    animate={{ x: ['-60%', '110%'] }}
                                                    transition={{
                                                        repeat: Infinity,
                                                        duration: 1.6,
                                                        ease: 'easeInOut',
                                                    }}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between text-xs text-white/70">
                                                <span>Analyse de l’étiquette…</span>
                                                <span>Génération de la fiche en cours</span>
                                            </div>
                                        </div>

                                        {/* Étapes d’analyse détaillées */}
                                        <div className="grid grid-cols-2 gap-3 max-w-xl mx-auto text-left text-xs text-white/80">
                                            {analyzingSteps.map((step, index) => (
                                                <motion.div
                                                    key={step}
                                                    initial={{ opacity: 0, x: -8 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.08 * index, duration: 0.25 }}
                                                    className="flex items-center gap-2"
                                                >
                                                    <div className="
                                                        w-1.5 h-1.5 rounded-full
                                                        bg-emerald-400
                                                        shadow-[0_0_6px_rgba(16,185,129,0.9)]
                                                    " />
                                                    <span>{step}</span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                ) : (
                                    // ---------- UPLOAD DESKTOP ----------
                                    <motion.div
                                        key="desktop-upload"
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 8 }}
                                        transition={{ duration: 0.2 }}
                                        className="max-w-4xl mx-auto text-center"
                                    >
                                        <div className="grid lg:grid-cols-1 gap-10 items-center">
                                            <div className="order-2 lg:order-1">
                                                <div className="relative">
                                                    <FileUpload
                                                        name="demo[]"
                                                        mode="basic"
                                                        chooseLabel=""
                                                        accept="image/*"
                                                        auto={true}
                                                        maxFileSize={90000000}
                                                        customUpload={true}
                                                        onSelect={customBase64Uploader}
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                        chooseOptions={{
                                                            className: "w-full h-full absolute inset-0 opacity-0 cursor-pointer"
                                                        }}
                                                    />
                                                    <motion.div
                                                        whileHover={{ scale: 1.03, y: -4 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        transition={{ type: 'tween', duration: 0.18 }}
                                                        className="
                                                            mb-10 cursor-pointer
                                                            group
                                                        "
                                                    >
                                                        <div className="
                                                            w-24 h-24 mx-auto mb-6
                                                            bg-gray-900/70
                                                            rounded-3xl flex items-center justify-center
                                                            shadow-[0_22px_60px_rgba(255,255,255,0.5)]
                                                            group-hover:shadow-[0_26px_80px_rgba(255,255,255,0.85)]
                                                            transition-all duration-200
                                                        ">
                                                            <i className="
                                                                pi pi-camera text-4xl
                                                                text-white
                                                                group-hover:scale-110
                                                                transition-transform duration-200
                                                            " />
                                                        </div>
                                                        <h2 className="
                                                            text-3xl font-semibold text-white mb-3
                                                            group-hover:text-emerald-300
                                                            transition-colors duration-200
                                                        ">
                                                            Analysez votre étiquette de vin
                                                        </h2>
                                                        <p className="
                                                            text-white/80 text-lg
                                                            group-hover:text-white
                                                            transition-colors duration-200
                                                        ">
                                                            Importez une photo de l'étiquette et laissez notre IA faire le travail
                                                        </p>
                                                    </motion.div>
                                                </div>

                                                <div className="mt-6 text-center">
                                                    <div className="relative">
                                                        <div className="absolute inset-0 flex items-center">
                                                            <div className="w-full border-t border-gray-700" />
                                                        </div>
                                                        <div className="relative flex justify-center text-sm">
                                                            <span className="
                                                                px-6
                                                                bg-gray-900/90
                                                                text-white
                                                                font-medium text-base
                                                                rounded-full
                                                                border border-gray-700
                                                                shadow-[0_0_22px_rgba(0,0,0,0.7)]
                                                            ">
                                                                ou
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <motion.button
                                                        whileHover={{ scale: 1.02, y: -2 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        transition={{ type: 'tween', duration: 0.18 }}
                                                        className="
                                                            mt-7 w-full py-5
                                                            bg-gray-900/90
                                                            text-white
                                                            font-semibold text-base
                                                            rounded-2xl
                                                            hover:from-[#28101b] hover:to-[#200711]
                                                            border-2 border-dashed border-gray-900/90
                                                            flex items-center justify-center gap-3
                                                            shadow-[0_18px_55px_rgba(0,0,0,0.95)]
                                                            transition-all duration-200
                                                        "
                                                        onClick={onManualMode}
                                                    >
                                                        <i className="pi pi-pencil text-xl" />
                                                        Remplir manuellement les informations
                                                    </motion.button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default NouveauVinEtape1;
