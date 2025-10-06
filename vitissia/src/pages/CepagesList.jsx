import React, { useEffect, useState } from 'react';
import useFetchCepages from '../hooks/useFetchCepages';
import ListeCepages from '../components/ListeCepages';
import CustomSelect from '../utils/CustomSelect';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { InputText } from 'primereact/inputtext';

const CepagesList = () => {
    const { cepages, fetchCepages, loading, error } = useFetchCepages();
    const [filteredData, setFilteredData] = useState([]);
    const [selectedVin, setSelectedVin] = useState("Tous");
    const [selectedTexte, setSelectedTexte] = useState('');
    const [selectedLangue, setSelectedLangue] = useState("Francais"); // Francais par défaut
    const [filtersVisible, setFiltersVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedCepage, setSelectedCepage] = useState(null);

    useEffect(() => { fetchCepages(); }, [fetchCepages]);

    useEffect(() => {
        const search = searchText.toLowerCase();
        // Normalisation Vin + filtre Langue exclusif (nouveau mapping: Fr=1, En=3)
        const normalized = cepages.map(c => ({ ...c, Vin: (c.Vin || '').toLowerCase().trim() }));
        let filtered = normalized.filter(c => selectedLangue === 'Francais' ? c.Langue === 1 : c.Langue === 3);
        if (selectedVin !== 'Tous') {
            filtered = filtered.filter(c => c.Vin === selectedVin.toLowerCase().trim());
        }
        if (search) {
            filtered = filtered.filter(c =>
                ((c.Texte || '').toLowerCase().includes(search)) ||
                ((c.Vin || '').toLowerCase().includes(search))
            );
        }
        setFilteredData(filtered);
        // Réinitialiser texte si langue change (éviter incohérence)
        setSelectedTexte('');
    }, [selectedVin, selectedLangue, cepages, searchText]);

    const optVin = ["Tous", ...new Set(
        cepages
            .filter(c => selectedLangue === 'Francais' ? c.Langue === 1 : c.Langue === 3)
            .map(c => (c.Vin || '').toLowerCase().trim())
            .filter(Boolean))]
        .map(v => v.charAt(0).toUpperCase() + v.slice(1));

    const optLangue = ["Francais", "Anglais"]; // Contrôle exclusif

    const handleRowClick = (rowData) => {
        setSelectedCepage(rowData.Cepage);
        setSelectedTexte(rowData.Texte || ''); // Toujours Texte
    };

    const clearSearch = () => setSearchText('');

    if (loading) return <Layout><div className="flex justify-center items-center h-screen text-gray-600 dark:text-gray-300">Chargement...</div></Layout>;
    if (error) return <Layout><div className="flex justify-center items-center h-screen text-red-500">Erreur : {error}</div></Layout>;

    return (
        <Layout>
            <div className="min-h-screen bg-white dark:bg-gray-900">
                {/* Header style breadcrumb + bouton filtres + recherche */}
                <div className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 px-4 py-5">
                    <div className="max-w-7xl mx-auto flex flex-col gap-4">
                        {/* <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400">
                            <Link to="/cepages" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Cépages</Link>
                            <span>/</span>
                            <span className="text-gray-400">Liste</span>
                        </div> */}
                        {/* Barre de recherche */}
                        <div className="relative max-w-xl">
                            <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <i className="pi pi-search text-gray-500 dark:text-gray-400"></i>
                                <InputText
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    placeholder="Rechercher (texte ou vin)..."
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
                        <div className="flex flex-wrap items-center gap-4">
                            <button
                                onClick={() => setFiltersVisible(v => !v)}
                                className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition"
                            >
                                <i className={`pi ${filtersVisible ? 'pi-minus' : 'pi-filter'}`}></i>
                                {filtersVisible ? 'Masquer filtres' : 'Afficher filtres'}
                            </button>
                        </div>
                        {filtersVisible && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-700/40 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                <CustomSelect label={'Langue'} options={optLangue} value={selectedLangue} onChange={setSelectedLangue} />
                                <CustomSelect label={'Vin'} options={optVin} value={selectedVin} onChange={setSelectedVin} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Contenu principal aligné sur Dictionnaire */}
                <div className="max-w-7xl mx-auto p-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                        {/* Liste gauche */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
                            <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600 flex items-center gap-3">
                                <i className="pi pi-list text-blue-600 dark:text-blue-400 text-xl"></i>
                                <div>
                                    <h2 className="text-lg font-semibold text-blue-600 dark:text-blue-400">Cépages ({filteredData.length})</h2>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        Langue : {selectedLangue} • Vin : {selectedVin}
                                    </p>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto" style={{ height: 'calc(100vh - 300px)' }}>
                                {/* On réutilise ListeCepages si elle gère l'affichage */}
                                <ListeCepages lstCepages={filteredData} loading={loading} onRowClick={handleRowClick} selectedCepage={selectedCepage} />
                            </div>
                        </div>

                        {/* Détail droite */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
                            <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600 flex items-center gap-3">
                                <i className="pi pi-book text-green-600 dark:text-green-400 text-xl"></i>
                                <h2 className="text-lg font-semibold text-green-600 dark:text-green-400">Description</h2>
                            </div>
                            <div className="p-4 flex-1" style={{ height: 'calc(100vh - 300px)' }}>
                                {selectedTexte ? (
                                    <div className="h-full overflow-y-auto custom-scroll">
                                        <p className="whitespace-pre-wrap text-gray-900 dark:text-white leading-relaxed text-justify">{selectedTexte}</p>
                                    </div>
                                ) : (
                                    <div className="h-full flex items-center justify-center">
                                        <div className="text-center max-w-sm">
                                            <i className="pi pi-arrow-left text-gray-300 dark:text-gray-600 text-5xl mb-4"></i>
                                            <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-2">Sélectionnez un cépage</h3>
                                            <p className="text-gray-400 dark:text-gray-500 text-sm">Cliquez sur un cépage dans la liste pour afficher sa description.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default CepagesList;
