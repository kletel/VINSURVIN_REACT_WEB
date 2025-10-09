import React, { useState, useContext, useEffect } from 'react';
import { FileUpload } from 'primereact/fileupload';
import { ProgressSpinner } from 'primereact/progressspinner';
import { ThemeContext } from '../context/ThemeContext';
import imageCompression from "browser-image-compression";

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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                            <i className="pi pi-camera text-white text-2xl sm:text-3xl"></i>
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                                Analysez votre étiquette
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg mt-2">
                                Importez une photo et laissez notre IA extraire les informations
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto py-8">
                {isMobile ? (
                    // Version Mobile
                    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl mx-4 overflow-hidden border border-gray-100 dark:border-gray-700">
                        <div className="p-6">
                            {isAnalyzing ? (
                                <div className="text-center py-8">
                                    <div className="relative mb-6">
                                        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center shadow-xl">
                                            <ProgressSpinner
                                                style={{ width: '60px', height: '60px' }}
                                                strokeWidth="3"
                                                animationDuration=".8s"
                                                className="text-emerald-500"
                                            />
                                        </div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg mt-6">
                                                <i className="pi pi-brain text-emerald-600 dark:text-emerald-400 text-lg animate-pulse"></i>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="max-w-sm mx-auto">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                            {/* 🤖 */}Analyse en cours
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                                            Extraction des informations...
                                        </p>

                                        <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-lg">
                                            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                                                <div className="flex space-x-1">
                                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></div>
                                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                </div>
                                                <span>Analyse IA...</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full max-w-sm mx-auto">
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
                                                    className: "w-full h-full absolute inset-0 opacity-0 cursor-pointer"
                                                }}
                                            />
                                            <div className="text-center py-8 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-all duration-300">
                                                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 group">
                                                    <i className="pi pi-camera text-white text-3xl group-hover:animate-pulse group-active:animate-ping"></i>
                                                </div>
                                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                                                    Analysez votre vin
                                                </h2>
                                                <p className="text-gray-600 dark:text-gray-400 text-sm group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors duration-300">
                                                    Importez une photo de l'étiquette
                                                </p>
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                                            </div>
                                            <div className="relative flex justify-center text-sm">
                                                <span className="px-3 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">
                                                    ou
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            className="w-full py-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-sm rounded-lg hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-300 border-2 border-dashed border-gray-400 dark:border-gray-500 flex items-center justify-center gap-2"
                                            onClick={onManualMode}
                                        >
                                            <i className="pi pi-pencil text-sm"></i>
                                            ✏️ Saisie manuelle
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    // Version Desktop
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="p-8">
                            {isAnalyzing ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <div className="relative mb-8">
                                        <ProgressSpinner
                                            style={{ width: '100px', height: '100px' }}
                                            strokeWidth="3"
                                            animationDuration=".8s"
                                            className="text-emerald-500"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg">
                                                <i className="pi pi-brain text-emerald-600 dark:text-emerald-400 text-2xl animate-pulse"></i>
                                            </div>
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                        Analyse IA en cours...
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-lg text-center max-w-md">
                                        Notre intelligence artificielle analyse votre étiquette pour extraire automatiquement toutes les informations
                                    </p>
                                </div>
                            ) : (
                                <div className="max-w-4xl mx-auto text-center">
                                    <div className="grid lg:grid-cols-1 gap-12 items-center">
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
                                                <div className="mb-12 cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-300 group">
                                                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-3xl flex items-center justify-center shadow-lg hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 hover:from-emerald-200 hover:to-teal-200 dark:hover:from-emerald-800/40 dark:hover:to-teal-800/40">
                                                        <i className="pi pi-camera text-4xl text-emerald-600 dark:text-emerald-400 group-hover:animate-bounce group-active:animate-ping transition-all duration-300"></i>
                                                    </div>
                                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                                                        Analysez votre étiquette de vin
                                                    </h2>
                                                    <p className="text-gray-600 dark:text-gray-400 text-xl group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors duration-300">
                                                        Importez une photo de l'étiquette et laissez notre IA faire le travail
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-8 text-center">
                                                <div className="relative">
                                                    <div className="absolute inset-0 flex items-center">
                                                        <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                                                    </div>
                                                    <div className="relative flex justify-center text-sm">
                                                        <span className="px-6 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-semibold text-lg">
                                                            ou
                                                        </span>
                                                    </div>
                                                </div>

                                                <button
                                                    className="mt-8 w-full py-6 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 font-bold text-lg rounded-2xl hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 transition duration-300 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center gap-3"
                                                    onClick={onManualMode}
                                                >
                                                    <i className="pi pi-pencil text-xl"></i>
                                                    ✏️ Remplir manuellement les informations
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NouveauVinEtape1;
