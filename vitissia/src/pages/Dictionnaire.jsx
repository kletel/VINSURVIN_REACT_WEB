import React, { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import useFetchVocabulaires from '../hooks/useFetchVocabulaires';
import Layout from '../components/Layout';

const Dictionnaire = () => {
    const { vocabulaires, loading, error, fetchVocabulaires } = useFetchVocabulaires();
    const [searchText, setSearchText] = useState('');
    const [filteredVocabulaires, setFilteredVocabulaires] = useState([]);
    const [openVocabUUID,setOpenVocabUUID]=useState(null);

    useEffect(() => {
        if (vocabulaires.length === 0) {
            fetchVocabulaires();
        }
    }, [vocabulaires.length, fetchVocabulaires]);

    const normalizeString = (str) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    useEffect(() => {
        if (searchText.trim() === '') {
            setFilteredVocabulaires(vocabulaires);
        } else {
            const filtered = vocabulaires.filter(vocab =>
                normalizeString(vocab.Nom_Fr).includes(normalizeString(searchText)) ||
                normalizeString(vocab.Texte).includes(normalizeString(searchText))
            );
            setFilteredVocabulaires(filtered);
        }
    }, [searchText, vocabulaires]);

    const clearSearch = () => {
        setSearchText('');
    };

     const toggleVocab = (vocab)=>{
        setOpenVocabUUID(prev=>
            prev=== vocab.UUID_ ? null : vocab.UUID_
        );
    } ;

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-screen">
                    <div className="text-center">
                        <ProgressSpinner style={{ width: '50px', height: '50px' }} />
                        <p className="text-xl font-semibold text-gray-600 dark:text-gray-300 mt-4">
                            Chargement du dictionnaire...
                        </p>
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
                        <Button label="Réessayer" icon="pi pi-refresh" onClick={fetchVocabulaires} />
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-white dark:bg-gray-900">
                {/* Barre de recherche */}
                <div className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 px-4 py-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="relative">
                            <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <i className="pi pi-search text-gray-500 dark:text-gray-400"></i>
                                <InputText
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    placeholder="Rechercher un terme..."
                                    className="flex-1 bg-transparent border-none focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                />
                                {searchText && (
                                    <button
                                        onClick={clearSearch}
                                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                    >
                                        <i className="pi pi-times-circle"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto p-4">
                    {/* Contenu principal */}
                    {filteredVocabulaires.length === 0 && searchText.trim() !== '' ? (
                        // Aucun résultat trouvé
                        <div className="text-center py-16">
                            <i className="pi pi-search text-gray-300 dark:text-gray-600 text-6xl mb-4"></i>
                            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Aucun terme trouvé
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Essayez avec un autre terme de recherche
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 h-full">
                            {/* Liste des termes (côté gauche) */}
                            <div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                {/* En-tête de la liste */}
                                <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                                    <div className="flex items-center gap-3">
                                        <i className="pi pi-book text-blue-600 dark:text-blue-400 text-xl"></i>
                                        <div>
                                            <h2 className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                                {searchText.trim() !== ''
                                                    ? `Résultats pour "${searchText}"`
                                                    : 'Dictionnaire'
                                                }
                                            </h2>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                {filteredVocabulaires.length} terme(s)
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Liste scrollable des termes */}
                                <div className="overflow-y-auto" style={{ height: 'calc(100vh - 300px)' }}>
                                    {filteredVocabulaires.map((vocabulaire, index) => (
                                        <React.Fragment key={vocabulaire.UUID_}>
                                            <button
                                                onClick={() => toggleVocab(vocabulaire)}
                                                className={`w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${openVocabUUID === vocabulaire.UUID_
                                                    ? 'bg-blue-50 dark:bg-blue-900/20 border-r-4 border-blue-500'
                                                    : ''
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <i className="pi pi-file-text text-blue-600 dark:text-blue-400"></i>
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {vocabulaire.Nom_Fr}
                                                    </span>
                                                    <div className="ml-auto">
                                                        {openVocabUUID === vocabulaire.UUID_ ? (
                                                            <>
                                                                <i className="pi pi-angle-right text-blue-600 dark:text-blue-400"></i>
                                                            </>
                                                        ) : (
                                                            <i className="pi pi-angle-down text-gray-400"></i>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                            {/* Definition qui déplie */}
                                            {openVocabUUID === vocabulaire.UUID_ && (
                                                <div className="bg-white dark:bg-gray-800 p-7 pl-16 text-sm text-gray-700 dark:text-gray-300">
                                                    <p className='text-lg font-bold'>Définition</p>
                                                    <p className='text-base'>{vocabulaire.Texte}</p>
                                                </div>
                                            )}

                                            {index < filteredVocabulaires.length - 1 && (
                                                <div className="border-b border-gray-200 dark:border-gray-600 ml-12"></div>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                            </div>

                            {/* Zone de définition (côté droit) */}
                            {/*<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">*/}
                                {/* En-tête de la définition */}
                               {/* <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                                    <div className="flex items-center gap-3">
                                        <i className="pi pi-comment text-green-600 dark:text-green-400 text-xl"></i>
                                        <h2 className="text-lg font-semibold text-green-600 dark:text-green-400">
                                            Définition
                                        </h2>
                                    </div>
                                </div>*/}

                                {/* Contenu de la définition */}
                                {/*<div className="p-4" style={{ height: 'calc(100vh - 300px)' }}>
                                    {selectedVocabulaire ? (
                                        <div className="h-full flex flex-col">*/}
                                            {/* Titre du terme */}
                                            {/*<div className="mb-4">
                                                <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                    {selectedVocabulaire.Nom_Fr}
                                                </h3>
                                                <div className="mt-2 h-px bg-gray-200 dark:bg-gray-600"></div>
                                            </div>*/}

                                            {/* Zone de texte avec la définition */}
                                          {/*  <div className="flex-1 overflow-y-auto">
                                                <p className="text-gray-900 dark:text-white leading-relaxed text-justify">
                                                    {selectedVocabulaire.Texte}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (                                         // Message d'invitation à sélectionner un terme
*/}
                              {/*          <div className="h-full flex items-center justify-center">
                                            <div className="text-center">
                                                <i className="pi pi-arrow-left text-gray-300 dark:text-gray-600 text-6xl mb-4"></i>
                                                <h3 className="text-xl font-semibold text-gray-500 dark:text-gray-400 mb-2">
                                                    Sélectionnez un terme
                                                </h3>
                                                <p className="text-gray-400 dark:text-gray-500 text-center max-w-sm">
                                                    Choisissez un terme dans la liste pour voir sa définition
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>*/}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Dictionnaire;
