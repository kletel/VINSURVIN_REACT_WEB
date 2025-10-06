import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { FilterMatchMode } from 'primereact/api';

const ListeMillesimes = ({ lstMillesimes, loading, isMobile, darkMode }) => {
    const navigate = useNavigate();
    const [expandedRows, setExpandedRows] = useState([]);
    const [globalFilter, setGlobalFilter] = useState(null);
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });

    const onRowDoubleClick = (e) => {
        const searchParams = new URLSearchParams({
            filter: 'Millesime',
            value: e.data.Millesime
        });
        navigate(`/cave?${searchParams.toString()}`);
    };

    const headerTemplate = (data) => {
        return (
            <div className="flex items-center justify-between gap-4 cursor-pointer p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200" onClick={() => onRowDoubleClick({ data })}>
                <div className="flex items-center gap-4 cursor-pointer flex-1">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 rounded-lg flex items-center justify-center shadow-md">
                        <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{data.Millesime}</span>
                    </div>
                    <div className="flex flex-col text-sm flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-lg text-gray-900 dark:text-white">Millésime {data.Millesime}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-gray-600 dark:text-gray-400">
                            <p>Année : <span className="font-medium text-amber-600 dark:text-amber-400">{data.Annee}</span></p>
                            <p>Pays : <span className="font-medium text-amber-600 dark:text-amber-400">{data.Pays}</span></p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <i className="pi pi-arrow-right text-gray-400" style={{ fontSize: '1.2rem' }}></i>
                </div>
            </div>
        );
    };

    const header = (
        <div className="flex gap-4 items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg">
                    <i className="pi pi-search text-white text-sm"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Rechercher un millésime
                </h3>
            </div>
            <div className="flex-1 max-w-md">
                <div className="relative">
                    <i className="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    <InputText
                        type="search"
                        onInput={(e) => setGlobalFilter(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-300 ${
                            darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                        placeholder="Rechercher un millésime..."
                    />
                </div>
            </div>
        </div>
    );

    const millesimeBodyTemplate = (rowData) => {
        return (
            <div className="flex items-center justify-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">
                    {rowData.Millesime}
                </span>
            </div>
        );
    };

    const anneeBodyTemplate = (rowData) => {
        return (
            <div className="flex justify-center">
                <span className="font-medium text-amber-600 dark:text-amber-400">
                    {rowData.Annee}
                </span>
            </div>
        );
    };

    const regionBodyTemplate = (field) => (rowData) => {
        return (
            <div className="flex justify-center">
                <span className="font-medium text-amber-600 dark:text-amber-400">
                    {rowData[field] || '—'}
                </span>
            </div>
        );
    };

    const paysBodyTemplate = (rowData) => {
        return (
            <div className="flex justify-center">
                <span className="font-medium text-amber-600 dark:text-amber-400">
                    {rowData.Pays}
                </span>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Chargement des millésimes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {isMobile ? (
                <>
                    {header}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <DataTable
                            value={lstMillesimes}
                            rowGroupMode="subheader"
                            groupRowsBy="Millesime"
                            sortMode="multiple"
                            sortField="Millesime"
                            sortOrder={-1}
                            expandableRowGroups
                            expandedRows={expandedRows}
                            onRowToggle={(e) => setExpandedRows(e.data)}
                            rowGroupHeaderTemplate={headerTemplate}
                            footer={
                                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
                                    <div className="flex justify-center text-sm text-gray-600 dark:text-gray-400">
                                        <span>Total millésimes: <strong className="text-amber-600 dark:text-amber-400">{lstMillesimes.length}</strong></span>
                                    </div>
                                </div>
                            }
                            scrollable
                            scrollHeight="calc(100vh - 300px)"
                            globalFilterFields={['Millesime', 'Annee', 'Pays']}
                            globalFilter={globalFilter}
                            filters={filters}
                            onRowDoubleClick={onRowDoubleClick}
                            emptyMessage={
                                <div className="text-center py-8">
                                    <i className="pi pi-calendar text-gray-300 dark:text-gray-600 text-4xl mb-4"></i>
                                    <p className="text-gray-500 dark:text-gray-400">Aucun millésime trouvé</p>
                                </div>
                            }
                            className="border-none"
                        >
                            <Column field="Annee" header="Année" style={{ width: '30%' }} headerClassName="text-xs font-semibold text-gray-600 dark:text-gray-300" sortable></Column>
                            <Column field="Pays" header="Pays" style={{ width: '70%' }} headerClassName="text-xs font-semibold text-gray-600 dark:text-gray-300" sortable></Column>
                        </DataTable>
                    </div>
                </>
            ) : (
                <>
                    {header}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <DataTable
                            value={lstMillesimes}
                            onRowDoubleClick={onRowDoubleClick}
                            emptyMessage={
                                <div className="text-center py-12">
                                    <i className="pi pi-calendar text-gray-300 dark:text-gray-600 text-6xl mb-4"></i>
                                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Aucun millésime trouvé</h3>
                                    <p className="text-gray-500 dark:text-gray-400">Aucune donnée de millésime disponible</p>
                                </div>
                            }
                            scrollable
                            scrollHeight="calc(100vh - 350px)"
                            globalFilterFields={['Millesime', 'Annee', 'Pays', 'Bordeau_Rouge', 'Bordeau_Blanc_Liquoreux', 'Bordeau_Blanc_Sec', 'Bourgogne_Rouge', 'Bourgogne_Blanc', 'Champagne', 'Loire', 'Rhone', 'Alsace']}
                            globalFilter={globalFilter}
                            filters={filters}
                            showGridlines
                            stripedRows
                            className="border-none"
                            rowClassName="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                        >
                            <Column
                                field="Millesime"
                                header="Millésime"
                                footer={
                                    <div className="font-semibold text-amber-600 dark:text-amber-400">
                                        Total: {lstMillesimes.length}
                                    </div>
                                }
                                body={millesimeBodyTemplate}
                                sortable
                                style={{ minWidth: '8rem', textAlign: 'center' }}
                                headerClassName="bg-amber-50 dark:bg-amber-900/20 font-semibold text-gray-700 dark:text-gray-300"
                            ></Column>
                            <Column
                                field="Annee"
                                header="Année"
                                body={anneeBodyTemplate}
                                sortable
                                style={{ minWidth: '6rem', textAlign: 'center' }}
                                headerClassName="bg-amber-50 dark:bg-amber-900/20 font-semibold text-gray-700 dark:text-gray-300"
                            ></Column>
                            <Column
                                field="Bordeau_Rouge"
                                header="Bordeaux Rouge"
                                body={regionBodyTemplate('Bordeau_Rouge')}
                                sortable
                                style={{ minWidth: '8rem', textAlign: 'center' }}
                                headerClassName="bg-amber-50 dark:bg-amber-900/20 font-semibold text-gray-700 dark:text-gray-300"
                            ></Column>
                            <Column
                                field="Bordeau_Blanc_Liquoreux"
                                header="Bordeaux Blanc Liquoreux"
                                body={regionBodyTemplate('Bordeau_Blanc_Liquoreux')}
                                sortable
                                style={{ minWidth: '10rem', textAlign: 'center' }}
                                headerClassName="bg-amber-50 dark:bg-amber-900/20 font-semibold text-gray-700 dark:text-gray-300"
                            ></Column>
                            <Column
                                field="Bordeau_Blanc_Sec"
                                header="Bordeaux Blanc Sec"
                                body={regionBodyTemplate('Bordeau_Blanc_Sec')}
                                sortable
                                style={{ minWidth: '9rem', textAlign: 'center' }}
                                headerClassName="bg-amber-50 dark:bg-amber-900/20 font-semibold text-gray-700 dark:text-gray-300"
                            ></Column>
                            <Column
                                field="Bourgogne_Rouge"
                                header="Bourgogne Rouge"
                                body={regionBodyTemplate('Bourgogne_Rouge')}
                                sortable
                                style={{ minWidth: '8rem', textAlign: 'center' }}
                                headerClassName="bg-amber-50 dark:bg-amber-900/20 font-semibold text-gray-700 dark:text-gray-300"
                            ></Column>
                            <Column
                                field="Bourgogne_Blanc"
                                header="Bourgogne Blanc"
                                body={regionBodyTemplate('Bourgogne_Blanc')}
                                sortable
                                style={{ minWidth: '8rem', textAlign: 'center' }}
                                headerClassName="bg-amber-50 dark:bg-amber-900/20 font-semibold text-gray-700 dark:text-gray-300"
                            ></Column>
                            <Column
                                field="Champagne"
                                header="Champagne"
                                body={regionBodyTemplate('Champagne')}
                                sortable
                                style={{ minWidth: '7rem', textAlign: 'center' }}
                                headerClassName="bg-amber-50 dark:bg-amber-900/20 font-semibold text-gray-700 dark:text-gray-300"
                            ></Column>
                            <Column
                                field="Loire"
                                header="Loire"
                                body={regionBodyTemplate('Loire')}
                                sortable
                                style={{ minWidth: '6rem', textAlign: 'center' }}
                                headerClassName="bg-amber-50 dark:bg-amber-900/20 font-semibold text-gray-700 dark:text-gray-300"
                            ></Column>
                            <Column
                                field="Rhone"
                                header="Rhône"
                                body={regionBodyTemplate('Rhone')}
                                sortable
                                style={{ minWidth: '6rem', textAlign: 'center' }}
                                headerClassName="bg-amber-50 dark:bg-amber-900/20 font-semibold text-gray-700 dark:text-gray-300"
                            ></Column>
                            <Column
                                field="Alsace"
                                header="Alsace"
                                body={regionBodyTemplate('Alsace')}
                                sortable
                                style={{ minWidth: '6rem', textAlign: 'center' }}
                                headerClassName="bg-amber-50 dark:bg-amber-900/20 font-semibold text-gray-700 dark:text-gray-300"
                            ></Column>
                            <Column
                                field="Pays"
                                header="Pays"
                                body={paysBodyTemplate}
                                sortable
                                style={{ minWidth: '8rem', textAlign: 'center' }}
                                headerClassName="bg-amber-50 dark:bg-amber-900/20 font-semibold text-gray-700 dark:text-gray-300"
                            ></Column>
                        </DataTable>
                    </div>
                </>
            )}
        </div>
    );
};

export default ListeMillesimes;
