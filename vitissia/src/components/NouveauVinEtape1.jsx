import React, { useState, useContext, useEffect } from 'react';
import { FileUpload } from 'primereact/fileupload';
import { ProgressSpinner } from 'primereact/progressspinner';
import { ThemeContext } from '../context/ThemeContext';
import imageCompression from "browser-image-compression";
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
                    // Version Mobile
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
                                    <motion.div
                                        key="mobile-analyze"
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 6 }}
                                        transition={{ duration: 0.2 }}
                                        className="text-center py-6"
                                    >
                                        <div className="relative mb-6">
                                            <div className="
                                                w-24 h-24 mx-auto mb-4
                                                rounded-full
                                                bg-gradient-to-br from-emerald-500/15 via-teal-400/15 to-emerald-500/8
                                                flex items-center justify-center
                                                shadow-[0_0_45px_rgba(16,185,129,0.45)]
                                            ">
                                                <ProgressSpinner
                                                    style={{ width: '60px', height: '60px' }}
                                                    strokeWidth="3"
                                                    animationDuration=".8s"
                                                    className="text-emerald-300"
                                                />
                                            </div>
                                            <motion.div
                                                animate={{ y: [-3, 3, -3] }}
                                                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                                                className="absolute inset-0 flex items-center justify-center"
                                            >
                                                <div className="
                                                    w-10 h-10
                                                    bg-black/75
                                                    border border-emerald-400/60
                                                    rounded-full flex items-center justify-center
                                                    shadow-[0_0_25px_rgba(16,185,129,0.7)]
                                                    mt-6
                                                ">
                                                    <i className="pi pi-brain text-emerald-200 text-lg" />
                                                </div>
                                            </motion.div>
                                        </div>

                                        <div className="max-w-xs mx-auto">
                                            <h3 className="text-lg font-semibold text-white mb-2">
                                                Analyse en cours
                                            </h3>
                                            <p className="text-white/80 text-xs mb-4">
                                                Extraction des informations de votre étiquette...
                                            </p>

                                            <div className="
                                                bg-black/45
                                                rounded-lg p-3
                                                shadow-[0_10px_30px_rgba(0,0,0,0.75)]
                                                border border-emerald-500/30
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
                                                    <span>Analyse IA en temps réel...</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
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
                    // Version Desktop
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
                                    <motion.div
                                        key="desktop-analyze"
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 8 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex flex-col items-center justify-center py-16"
                                    >
                                        <div className="relative mb-7">
                                            <ProgressSpinner
                                                style={{ width: '95px', height: '95px' }}
                                                strokeWidth="3"
                                                animationDuration=".8s"
                                                className="text-emerald-300"
                                            />
                                            <motion.div
                                                animate={{ y: [-4, 4, -4] }}
                                                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                                                className="absolute inset-0 flex items-center justify-center"
                                            >
                                                <div className="
                                                    w-16 h-16
                                                    bg-black/80
                                                    border border-emerald-400/70
                                                    rounded-full flex items-center justify-center
                                                    shadow-[0_0_35px_rgba(16,185,129,0.8)]
                                                ">
                                                    <i className="pi pi-brain text-emerald-200 text-2xl" />
                                                </div>
                                            </motion.div>
                                        </div>
                                        <h3 className="text-2xl font-semibold text-white mb-3">
                                            Analyse IA en cours...
                                        </h3>
                                        <p className="
                                            text-white/80 text-base text-center max-w-xl
                                        ">
                                            Notre intelligence artificielle analyse votre étiquette pour extraire automatiquement toutes les informations pertinentes.
                                        </p>
                                    </motion.div>
                                ) : (
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
