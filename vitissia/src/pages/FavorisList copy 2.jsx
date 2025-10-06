/*import React, { useEffect, useRef, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useFetchFavoris from '../hooks/useFetchFavoris';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Panel } from 'primereact/panel';
import { IconField } from 'primereact/iconfield';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { FilterMatchMode } from 'primereact/api';
import { ThemeContext } from '../context/ThemeContext';

const FavorisList = () => {
    const { darkMode } = useContext(ThemeContext);
    const { favoris, fetchFavoris, loading, error } = useFetchFavoris();
    const navigate = useNavigate();
    const toast = useRef(null);
    const totalReste = favoris.reduce((sum, row) => sum + row.Reste_en_Cave, 0);

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [expandedRows, setExpandedRows] = useState([]);
    const [globalFilter, setGlobalFilter] = useState(null);
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        Région: { value: null, matchMode: FilterMatchMode.EQUALS },
        Type: { value: null, matchMode: FilterMatchMode.EQUALS },
    });

    useEffect(() => {
        fetchFavoris();
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const onRowDoubleClick = (e) => {
        navigate(`/vin/${e.data.UUID_}`);
    };

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
            'Grèce': '🇬🇷',
            'Bulgarie': '🇧🇬',
            'Roumanie': '🇷🇴',
            'Hongrie': '🇭🇺',
            'République tchèque': '🇨🇿',
            'Slovénie': '🇸🇮',
            'Croatie': '🇭🇷',
            'Liban': '🇱🇧',
            'Israël': '🇮🇱',
            'Turquie': '🇹🇷',
            'Maroc': '🇲🇦',
            'Tunisie': '🇹🇳',
            'Algérie': '🇩🇿',
            'Canada': '🇨🇦',
            'Mexique': '🇲🇽',
            'Brésil': '🇧🇷',
            'Uruguay': '🇺🇾',
            'Chine': '🇨🇳',
            'Japon': '🇯🇵',
            'Inde': '🇮🇳',
            'Géorgie': '🇬🇪',
            'Moldavie': '🇲🇩',
            'Ukraine': '🇺🇦',
            'Russie': '🇷🇺'
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

    const headerTemplate = (data) => {
        const imageBase64 = data.base64_etiquette;
        return (
            <div className="flex items-center justify-between gap-4 cursor-pointer px-4 py-0 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200" onClick={() => onRowDoubleClick({ data })}>
                <div className="flex items-center gap-4 cursor-pointer flex-1">
                    <img
                        alt="Favori"
                        src={`data:image/jpeg;base64,${imageBase64}`}
                        className="w-20 h-auto rounded-lg object-cover flex-shrink-0 shadow-md"
                    />
                    <div className="flex flex-col text-sm flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-lg text-gray-900 dark:text-white">{data.Nom}</span>
                            <div className="flex items-center gap-1">
                                <img
                                    src={getWineColorIcon(data.Couleur)}
                                    alt={data.Couleur}
                                    width={24}
                                    height={24}
                                    title={`Couleur: ${data.Couleur}`}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-gray-600 dark:text-gray-400">
                            <p>Millésime : <span className="font-medium">{data.Millesime}</span></p>
                            <p>Type : <span className="font-medium">{data.Type}</span></p>
                            <p className="col-span-2">Région : <span className="font-medium">{data.Région}</span> <span className="text-lg" title={`Pays: ${data.Pays}`}> {getCountryFlag(data.Pays)} </span></p>
                            <p className="col-span-2">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                                    <i className="pi pi-heart-fill mr-1"></i>
                                    Reste en cave : {data.Reste_en_Cave}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <i className="pi pi-heart-fill text-red-500" style={{ fontSize: '1.5rem' }}></i>
                </div>
            </div>
        );
    };

    const header = (
        <div className="flex gap-4 items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
                    <i className="pi pi-heart-fill text-white text-lg"></i>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Mes Favoris
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {favoris.length} vin{favoris.length > 1 ? 's' : ''} favori{favoris.length > 1 ? 's' : ''}
                    </p>
                </div>
            </div>
            <div className="flex-1 max-w-md">
                <div className="relative">
                    <i className="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    <InputText
                        type="search"
                        onInput={(e) => setGlobalFilter(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-300 ${
                            darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                        placeholder="Rechercher un favori..."
                    />
                </div>
            </div>
        </div>
    );

    // Filtres pour les colonnes
    const regions = favoris.map(fav => fav.Région).filter((value, index, self) => self.indexOf(value) === index);
    const types = favoris.map(fav => fav.Type).filter((value, index, self) => self.indexOf(value) === index);

    const typesFilterTemplate = (options) => {
        return (
            <Dropdown
                value={options.value}
                options={types}
                onChange={(e) => options.filterApplyCallback(e.value)}
                placeholder="Choisir"
                className="p-column-filter"
                showClear
                style={{ minWidth: '12rem' }}
            />
        );
    };

    const regionsFilterTemplate = (options) => {
        return (
            <Dropdown
                value={options.value}
                options={regions}
                onChange={(e) => options.filterApplyCallback(e.value)}
                placeholder="Choisir"
                className="p-column-filter"
                showClear
                style={{ minWidth: '12rem' }}
            />
        );
    };

    const imageBodyTemplate = (rowData) => {
        const imageBase64 = rowData.base64_etiquette;
        return (
            <div className="flex justify-center">
                <img
                    src={`data:image/jpeg;base64,${imageBase64}`}
                    alt="Vin"
                    className="shadow-md rounded-lg hover:shadow-lg transition-shadow duration-200"
                    style={{
                        width: '64px',
                        height: '64px',
                        objectFit: 'contain'
                    }}
                />
            </div>
        );
    };

    const priceBodyTemplate = (rowData) => {
        return (
            <span className="font-medium text-green-600 dark:text-green-400">
                {rowData.Valeur_Euro.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </span>
        );
    };

    const resteCaveBodyTemplate = (rowData) => {
        return (
            <div className="flex justify-center">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                    {rowData.Reste_en_Cave}
                </span>
            </div>
        );
    };

    const favoriBodyTemplate = (rowData) => {
        return (
            <div className="flex justify-center items-center">
                <i
                    className={`pi ${rowData.Coup_de_Coeur ? 'pi-heart-fill text-red-500' : 'pi-heart text-gray-400'}`}
                    style={{ fontSize: '1.5rem' }}
                ></i>
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
                <Toast ref={toast} />

                {isMobile ? (
                    <div className="space-y-4">
                        {header}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                            <DataTable
                                value={favoris}
                                rowGroupMode="subheader"
                                groupRowsBy="UUID_"
                                sortMode="multiple"
                                sortField="Nom"
                                sortOrder={1}
                                expandableRowGroups
                                expandedRows={expandedRows}
                                onRowToggle={(e) => setExpandedRows(e.data)}
                                rowGroupHeaderTemplate={headerTemplate}
                                className="border-none text-sm" // ou text-xs
                                footer={
                                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
                                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                            <span>Total favoris: <strong className="text-red-600 dark:text-red-400">{favoris.length}</strong></span>
                                            <span>Reste total: <strong className="text-red-600 dark:text-red-400">{totalReste}</strong></span>
                                        </div>
                                    </div>
                                }
                                scrollable
                                scrollHeight="calc(100vh - 250px)"
                                globalFilterFields={['Nom', 'Pays', 'Région', 'Type']}
                                globalFilter={globalFilter}
                                filters={filters}
                                onRowDoubleClick={onRowDoubleClick}
                                emptyMessage={
                                    <div className="text-center py-8">
                                        <i className="pi pi-heart text-gray-300 dark:text-gray-600 text-4xl mb-4"></i>
                                        <p className="text-gray-500 dark:text-gray-400">Aucun favori enregistré</p>
                                    </div>
                                }
                                className="border-none"
                            >
                                <Column field="Type" header="Type" style={{ width: '30%' }} headerClassName="text-xs font-semibold text-gray-600 dark:text-gray-300" sortable filter filterElement={typesFilterTemplate} showFilterMatchModes={false}></Column>
                                <Column field="Région" header="Région" style={{ width: '35%' }} headerClassName="text-xs font-semibold text-gray-600 dark:text-gray-300" sortable filter filterElement={regionsFilterTemplate} showFilterMatchModes={false}></Column>
                                <Column field="Millesime" header="Millésime" style={{ width: '35%' }} headerClassName="text-xs font-semibold text-gray-600 dark:text-gray-300" sortable></Column>
                            </DataTable>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {header}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <DataTable
                                value={favoris}
                                onRowDoubleClick={onRowDoubleClick}
                                emptyMessage={
                                    <div className="text-center py-12">
                                        <i className="pi pi-heart text-gray-300 dark:text-gray-600 text-6xl mb-4"></i>
                                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Aucun favori enregistré</h3>
                                        <p className="text-gray-500 dark:text-gray-400">Ajoutez des vins à vos favoris pour les retrouver ici</p>
                                    </div>
                                }
                                scrollable
                                scrollHeight="calc(100vh - 300px)"
                                globalFilterFields={['Nom', 'Pays', 'Région', 'Type']}
                                globalFilter={globalFilter}
                                filters={filters}
                                showGridlines
                                stripedRows
                                className="border-none"
                                rowClassName="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                            >
                                <Column
                                    field="Nom"
                                    header="Nom du vin"
                                    footer={
                                        <div className="font-semibold text-red-600 dark:text-red-400">
                                            Total: {favoris.length} favori{favoris.length > 1 ? 's' : ''}
                                        </div>
                                    }
                                    sortable
                                    style={{ minWidth: '18rem', textAlign: 'center' }}
                                    headerClassName="bg-red-50 dark:bg-red-900/20 font-semibold text-gray-700 dark:text-gray-300"
                                ></Column>
                                <Column
                                    field="Type"
                                    header="Type"
                                    sortable
                                    style={{ minWidth: '8rem', textAlign: 'center' }}
                                    filter
                                    filterElement={typesFilterTemplate}
                                    showFilterMatchModes={false}
                                    headerClassName="bg-red-50 dark:bg-red-900/20 font-semibold text-gray-700 dark:text-gray-300"
                                ></Column>
                                <Column
                                    field="image"
                                    header="Étiquette"
                                    body={imageBodyTemplate}
                                    style={{ textAlign: 'center', width: '100px' }}
                                    headerClassName="bg-red-50 dark:bg-red-900/20 font-semibold text-gray-700 dark:text-gray-300"
                                ></Column>
                                <Column
                                    field="Pays"
                                    header="Pays"
                                    sortable
                                    style={{ minWidth: '12rem', textAlign: 'center' }}
                                    headerClassName="bg-red-50 dark:bg-red-900/20 font-semibold text-gray-700 dark:text-gray-300"
                                ></Column>
                                <Column
                                    field="Région"
                                    header="Région"
                                    sortable
                                    style={{ minWidth: '11rem', textAlign: 'center' }}
                                    filter
                                    filterElement={regionsFilterTemplate}
                                    showFilterMatchModes={false}
                                    headerClassName="bg-red-50 dark:bg-red-900/20 font-semibold text-gray-700 dark:text-gray-300"
                                ></Column>
                                <Column
                                    field="Reste_en_Cave"
                                    header="En cave"
                                    footer={
                                        <div className="font-semibold text-red-600 dark:text-red-400">
                                            Total: {totalReste}
                                        </div>
                                    }
                                    body={resteCaveBodyTemplate}
                                    sortable
                                    style={{ minWidth: '8rem', textAlign: 'center' }}
                                    headerClassName="bg-red-50 dark:bg-red-900/20 font-semibold text-gray-700 dark:text-gray-300"
                                ></Column>
                                <Column
                                    field="Millesime"
                                    header="Millésime"
                                    sortable
                                    style={{ minWidth: '7rem', textAlign: 'center' }}
                                    headerClassName="bg-red-50 dark:bg-red-900/20 font-semibold text-gray-700 dark:text-gray-300"
                                ></Column>
                                <Column
                                    field="Valeur_Euro"
                                    header="Prix"
                                    body={priceBodyTemplate}
                                    sortable
                                    style={{ minWidth: '8rem', textAlign: 'center' }}
                                    headerClassName="bg-red-50 dark:bg-red-900/20 font-semibold text-gray-700 dark:text-gray-300"
                                ></Column>
                                <Column
                                    field="Coup_de_Coeur"
                                    header="Favori"
                                    body={favoriBodyTemplate}
                                    style={{ minWidth: '8rem', textAlign: 'center' }}
                                    headerClassName="bg-red-50 dark:bg-red-900/20 font-semibold text-gray-700 dark:text-gray-300"
                                ></Column>
                            </DataTable>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FavorisList;
*/