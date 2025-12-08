import React, { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import useFetchVocabulaires from '../hooks/useFetchVocabulaires';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';

const MotionDiv = motion.div;
const MotionButton = motion.button;

const Dictionnaire = () => {
    const { vocabulaires, loading, error, fetchVocabulaires } = useFetchVocabulaires();
    const [searchText, setSearchText] = useState('');
    const [filteredVocabulaires, setFilteredVocabulaires] = useState([]);
    const [openVocabUUID, setOpenVocabUUID] = useState(null);

    useEffect(() => {
        if (vocabulaires.length === 0) {
            fetchVocabulaires();
        }
    }, [vocabulaires.length, fetchVocabulaires]);

    const normalizeString = (str) =>
        str
            ?.normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "");

    useEffect(() => {
        if (searchText.trim() === '') {
            setFilteredVocabulaires(vocabulaires);
        } else {
            const normSearch = normalizeString(searchText);
            const filtered = vocabulaires.filter((vocab) => {
                const nom = normalizeString(vocab.Nom_Fr || '');
                const texte = normalizeString(vocab.Texte || '');
                return nom.includes(normSearch) || texte.includes(normSearch);
            });
            setFilteredVocabulaires(filtered);
        }
    }, [searchText, vocabulaires]);

    const clearSearch = () => {
        setSearchText('');
    };

    const toggleVocab = (vocab) => {
        setOpenVocabUUID((prev) => (prev === vocab.UUID_ ? null : vocab.UUID_));
    };

    // --- ÉTAT LOADING ---
    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center font-['Work_Sans',sans-serif]">
                    <MotionDiv
                        initial={{ opacity: 0, scale: 0.9, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="flex flex-col items-center text-center px-6 py-8 rounded-2xl bg-gray-900/70 border border-white/10 shadow-[0_18px_50px_rgba(0,0,0,0.85)]"
                    >
                        <ProgressSpinner style={{ width: '50px', height: '50px' }} />
                        <p className="mt-4 text-base md:text-lg font-semibold text-gray-100">
                            Chargement du dictionnaire...
                        </p>
                    </MotionDiv>
                </div>
            </Layout>
        );
    }

    // --- ÉTAT ERREUR ---
    if (error) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center font-['Work_Sans',sans-serif]">
                    <MotionDiv
                        initial={{ opacity: 0, scale: 0.9, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="text-center px-6 py-8 rounded-2xl bg-gray-900/70 border border-[#ff7a8b]/40 shadow-[0_18px_50px_rgba(0,0,0,0.9)]"
                    >
                        <i className="pi pi-exclamation-triangle text-[#ffb5c3] text-5xl mb-4"></i>
                        <h2 className="text-2xl font-bold text-white mb-2">Erreur</h2>
                        <p className="text-sm md:text-base text-[#ffd7df] mb-4">{error}</p>
                        <Button
                            label="Réessayer"
                            icon="pi pi-refresh"
                            onClick={fetchVocabulaires}
                            className="p-button-rounded p-button-outlined"
                        />
                    </MotionDiv>
                </div>
            </Layout>
        );
    }

    // --- VUE NORMALE ---
    return (
        <Layout>
            <div className="min-h-screen font-['Work_Sans',sans-serif]">
                {/* BARRE DE RECHERCHE */}
                <div className="border-b border-white/10 backdrop-blur-md">
                    <MotionDiv
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="max-w-6xl mx-auto px-4 py-4 md:py-5"
                    >
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white">
                                        Dictionnaire des termes
                                    </h1>
                                    <p className="text-xs md:text-sm text-gray-200/85">
                                        Recherchez un terme œnologique et affichez sa définition.
                                    </p>
                                </div>
                            </div>

                            <div className="relative mt-2">
                                <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-gray-900/70 border border-white/15 shadow-[0_8px_30px_rgba(0,0,0,0.65)]">
                                    <i className="pi pi-search text-gray-300"></i>
                                    <InputText
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                        placeholder="Rechercher un terme..."
                                        className="
                                            flex-1 bg-transparent border-none
                                            focus:outline-none focus:ring-0
                                            text-gray-50 placeholder-gray-400
                                        "
                                    />
                                    {searchText && (
                                        <button
                                            onClick={clearSearch}
                                            className="text-gray-300 hover:text-gray-100 transition-colors"
                                        >
                                            <i className="pi pi-times-circle" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </MotionDiv>
                </div>

                <div className="max-w-7xl mx-auto p-4">
                    {/* AUCUN RÉSULTAT */}
                    {filteredVocabulaires.length === 0 && searchText.trim() !== '' ? (
                        <MotionDiv
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                            className="text-center py-16 text-gray-200/85"
                        >
                            <i className="pi pi-search text-gray-500 text-5xl mb-4"></i>
                            <h3 className="text-xl font-semibold mb-2">
                                Aucun terme trouvé
                            </h3>
                            <p className="text-sm text-gray-300/90">
                                Essayez avec un autre terme de recherche.
                            </p>
                        </MotionDiv>
                    ) : (
                        <MotionDiv
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="grid grid-cols-1 gap-6 h-full"
                        >
                            {/* LISTE DES TERMES */}
                            <div>
                                <div
                                    className="
                                        bg-gray-900/70
                                        rounded-2xl shadow-[0_18px_50px_rgba(0,0,0,0.9)]
                                        border border-white/10 overflow-hidden
                                        relative
                                    "
                                >
                                    {/* Glow subtil */}
                                    <div className="pointer-events-none absolute -top-24 -left-16 w-40 h-40 rounded-full bg-white/5 blur-3xl" />
                                    <div className="pointer-events-none absolute -bottom-32 -right-10 w-56 h-56 rounded-full bg-white/10 blur-3xl" />

                                    {/* En-tête */}
                                    <div className="px-4 py-3 border-b border-white/10 bg-gray-950/80 relative">
                                        <div className="flex items-center gap-3">
                                            <i className="pi pi-book text-[#ff7a8b] text-xl" />
                                            <div>
                                                <h2 className="text-lg font-semibold text-white">
                                                    {searchText.trim() !== ''
                                                        ? `Résultats pour "${searchText}"`
                                                        : 'Dictionnaire'}
                                                </h2>
                                                <p className="text-xs text-gray-300/80">
                                                    {filteredVocabulaires.length} terme(s)
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Liste scrollable */}
                                    <div
                                        className="overflow-y-auto custom-scroll relative"
                                        style={{ height: 'calc(100vh - 300px)' }}
                                    >
                                        {filteredVocabulaires.map((vocabulaire, index) => (
                                            <React.Fragment key={vocabulaire.UUID_}>
                                                <MotionButton
                                                    onClick={() => toggleVocab(vocabulaire)}
                                                    whileHover={{ x: 2 }}
                                                    whileTap={{ scale: 0.99 }}
                                                    transition={{ duration: 0.15, ease: 'easeOut' }}
                                                    className={`
                                                        w-full text-left px-4 py-3
                                                        transition-colors
                                                        flex flex-col relative
                                                        ${openVocabUUID === vocabulaire.UUID_
                                                            ? 'bg-gray-900/70 border-l-4 border-[#ff7a8b]'
                                                            : 'bg-transparent hover:bg-white/5'
                                                        }
                                                    `}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <i className="pi pi-file-text text-[#ff7a8b]" />
                                                        <span className="font-medium text-gray-50">
                                                            {vocabulaire.Nom_Fr}
                                                        </span>
                                                        <div className="ml-auto">
                                                            {openVocabUUID === vocabulaire.UUID_ ? (
                                                                <i className="pi pi-angle-up text-[#ff7a8b]" />
                                                            ) : (
                                                                <i className="pi pi-angle-down text-gray-400" />
                                                            )}
                                                        </div>
                                                    </div>
                                                </MotionButton>

                                                {/* Définition dépliée */}
                                                {openVocabUUID === vocabulaire.UUID_ && (
                                                    <MotionDiv
                                                        initial={{ opacity: 0, y: -4 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.18, ease: 'easeOut' }}
                                                        className="bg-gray-950/80 px-7 py-4 text-sm text-gray-100"
                                                    >
                                                        <p className="text-xs uppercase tracking-[0.12em] text-[#ffb5c3] mb-1">
                                                            Définition
                                                        </p>
                                                        <p className="text-sm md:text-base leading-relaxed">
                                                            {vocabulaire.Texte}
                                                        </p>
                                                    </MotionDiv>
                                                )}

                                                {index < filteredVocabulaires.length - 1 && (
                                                    <div className="border-b border-white/10 ml-10" />
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </MotionDiv>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Dictionnaire;