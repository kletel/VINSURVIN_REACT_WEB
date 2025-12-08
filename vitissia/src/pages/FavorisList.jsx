import React, { useEffect, useRef, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useFetchFavoris from '../hooks/useFetchFavoris';
import { Toast } from 'primereact/toast';
import { VirtualScroller } from 'primereact/virtualscroller';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { ThemeContext } from '../context/ThemeContext';

const FavorisList = () => {
    const { darkMode } = useContext(ThemeContext);
    const { favoris, fetchFavoris, loading, error } = useFetchFavoris();
    const navigate = useNavigate();
    const toast = useRef(null);

    const [filteredFavoris, setFilteredFavoris] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [regionFilter, setRegionFilter] = useState(null);
    const [typeFilter, setTypeFilter] = useState(null);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        fetchFavoris();
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            // Fermer les filtres mobiles si on passe en desktop
            if (window.innerWidth >= 768) {
                setShowMobileFilters(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        let filtered = favoris;

        // Filtre global
        if (globalFilter) {
            filtered = filtered.filter(item =>
                item.Nom?.toLowerCase().includes(globalFilter.toLowerCase()) ||
                item.Pays?.toLowerCase().includes(globalFilter.toLowerCase()) ||
                item.Région?.toLowerCase().includes(globalFilter.toLowerCase()) ||
                item.Type?.toLowerCase().includes(globalFilter.toLowerCase()) ||
                item.Domaine?.toLowerCase().includes(globalFilter.toLowerCase())
            );
        }

        // Filtre par région
        if (regionFilter) {
            filtered = filtered.filter(item => item.Région === regionFilter);
        }

        // Filtre par type
        if (typeFilter) {
            filtered = filtered.filter(item => item.Type === typeFilter);
        }

        setFilteredFavoris(filtered);
    }, [favoris, globalFilter, regionFilter, typeFilter]);

    const totalReste = filteredFavoris.reduce((sum, row) => sum + row.Reste_en_Cave, 0);
    const regions = [...new Set(favoris.map(fav => fav.Région))].filter(Boolean);
    const types = [...new Set(favoris.map(fav => fav.Type))].filter(Boolean);

    const getCountryFlag = (pays) => {
        const countryFlags = {
            'France': '🇫🇷',
            'Italie': '🇮🇹',
            'Espagne': '🇪🇸',
            'Portugal': '🇵🇹',
            'Allemagne': '🇩🇪',
            'Autriche': '🇦🇹',
            'Suisse': '🇨🇭',
            'États-Unis': '🇺🇸',
            'Argentine': '🇦🇷',
            'Chili': '🇨🇱',
            'Australie': '🇦🇺',
            'Nouvelle-Zélande': '🇳🇿',
            'Afrique du Sud': '🇿🇦',
            'Grèce': '🇬🇷'
        };
        return countryFlags[pays] || '🌍';
    };

    const getWineColorIcon = (couleur) => {
        if (!couleur) return '';
        const couleurLower = couleur.toLowerCase();
        if (couleurLower.includes('rouge')) return '/red.svg';
        if (couleurLower.includes('blanc')) return '/white.svg';
        if (couleurLower.includes('rosé') || couleurLower.includes('rose')) return '/rose.svg';
        return '';
    };

    const handleItemClick = (item) => {
        navigate(`/vin/${item.UUID_}`);
    };

    const itemTemplate = (item, options) => {
        return (
            <div
                className="p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
                onClick={() => handleItemClick(item)}
            >
                <div className="flex items-center gap-4">
                    {/* Image */}
                    <div className="flex-shrink-0">
                        <img
                            src={`data:image/jpeg;base64,${item.base64_132etiquette}`}
                            alt={item.Nom}
                            className="w-16 h-20 object-contain rounded-lg shadow-md"
                        />
                    </div>

                    {/* Contenu principal */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                {item.Nom}
                            </h3>
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <img
                                    src={getWineColorIcon(item.Couleur)}
                                    alt={item.Couleur}
                                    width={20}
                                    height={20}
                                    title={`Couleur: ${item.Couleur}`}
                                />
                                <i className="pi pi-heart-fill text-red-500 text-lg"></i>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <div>
                                <span className="font-medium">Domaine:</span> {item.Domaine || 'N/A'}
                            </div>
                            <div>
                                <span className="font-medium">Type:</span> {item.Type}
                            </div>
                            <div>
                                <span className="font-medium">Millésime:</span> {item.Millesime}
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="font-medium">Région:</span>
                                {item.Région}
                                <span className="text-lg" title={`Pays: ${item.Pays}`}>
                                    {getCountryFlag(item.Pays)}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-4">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                                    <i className="pi pi-archive mr-1"></i>
                                    En cave: {item.Reste_en_Cave}
                                </span>
                                {item.Valeur_Euro && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                                        <i className="pi pi-euro mr-1"></i>
                                        {item.Valeur_Euro.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                                    </span>
                                )}
                                {item.Note_sur_20 > 0 && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                                        <i className="pi pi-star-fill mr-1"></i>
                                        {item.Note_sur_20}/100
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-red-200 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Chargement de vos favoris...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <i className="pi pi-exclamation-triangle text-red-500 text-4xl mb-4"></i>
                    <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">Erreur de chargement</h3>
                    <p className="text-red-600 dark:text-red-300">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto p-4">
                {/* <Toast ref={toast} />*/}

                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
                                <i className="pi pi-heart-fill text-white text-lg"></i>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Mes Favoris
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {filteredFavoris.length} vin{filteredFavoris.length > 1 ? 's' : ''} favori{filteredFavoris.length > 1 ? 's' : ''}
                                    {filteredFavoris.length !== favoris.length && ` sur ${favoris.length}`}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Bouton pour afficher/masquer les filtres sur mobile */}
                            {isMobile && (
                                <button
                                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                                    className="px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg shadow-sm hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition duration-300 flex items-center gap-2"
                                >
                                    <i className={`pi ${showMobileFilters ? 'pi-times' : 'pi-filter'} text-sm`}></i>
                                    <span className="text-sm">
                                        {showMobileFilters ? 'Masquer' : 'Filtres'}
                                    </span>
                                </button>
                            )}

                            <div className="text-right">
                                <div className="text-sm text-gray-600 dark:text-gray-400">Total en cave</div>
                                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{totalReste}</div>
                            </div>
                        </div>
                    </div>

                    {/* Filtres */}
                    <div className={`${isMobile ? (showMobileFilters ? 'block' : 'hidden') : 'block'}`}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Recherche globale
                                </label>
                                <div className="relative">
                                    <i className="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                    <InputText
                                        type="search"
                                        value={globalFilter}
                                        onChange={(e) => setGlobalFilter(e.target.value)}
                                        className={`w-full pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-300 ${
                                            darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                        }`}
                                        placeholder="Rechercher un favori..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Région
                                </label>
                                <Dropdown
                                    value={regionFilter}
                                    options={regions}
                                    onChange={(e) => setRegionFilter(e.value)}
                                    placeholder="Toutes les régions"
                                    className="w-full"
                                    showClear
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Type
                                </label>
                                <Dropdown
                                    value={typeFilter}
                                    options={types}
                                    onChange={(e) => setTypeFilter(e.value)}
                                    placeholder="Tous les types"
                                    className="w-full"
                                    showClear
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Liste virtuelle */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {filteredFavoris.length === 0 ? (
                        <div className="text-center py-12">
                            <i className="pi pi-heart text-gray-300 dark:text-gray-600 text-6xl mb-4"></i>
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                {favoris.length === 0 ? 'Aucun favori enregistré' : 'Aucun résultat'}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                {favoris.length === 0
                                    ? 'Ajoutez des vins à vos favoris pour les retrouver ici'
                                    : 'Essayez de modifier vos critères de recherche'
                                }
                            </p>
                        </div>
                    ) : (
                        <VirtualScroller
                            items={filteredFavoris}
                            itemSize={140}
                            itemTemplate={itemTemplate}
                            className="border-none"
                            style={{ height: 'calc(100vh - 400px)' }}
                            showLoader
                            delay={250}
                        />
                    )}
                </div>

                {/* Footer avec statistiques */}
                {filteredFavoris.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mt-4">
                        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                            <span>
                                Affichage de <strong className="text-red-600 dark:text-red-400">{filteredFavoris.length}</strong> favori{filteredFavoris.length > 1 ? 's' : ''}
                                {filteredFavoris.length !== favoris.length && ` sur ${favoris.length}`}
                            </span>
                            <span>
                                Total en cave: <strong className="text-red-600 dark:text-red-400">{totalReste}</strong> bouteille{totalReste > 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FavorisList;
