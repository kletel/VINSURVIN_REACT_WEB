import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';

const ListeCepages = ({ lstCepages, loading = false, onRowClick, selectedCepage }) => {
    const [globalFilter, setGlobalFilter] = useState('');

    const emptyMessageTemplate = () => {
        if (loading) {
            return <div>Chargement...</div>;
        }
        return <div className="p-4 text-gray-500 text-start">Aucun résultat trouvé.</div>;
    };

    const renderHeader = () => (
        <div className="flex justify-end">
            <span className="p-input-icon-left">
                {/* <i className="pi pi-search" /> */}
                <InputText
                    type="search"
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Rechercher..."
                />
            </span>
        </div>
    );

    return (
        <div className="bg-white p-4 rounded-lg dark:bg-gray-800">
            <DataTable
                value={lstCepages.map(cepage => ({
                    ...cepage,
                    Vin: cepage.Vin.toLowerCase().trim().charAt(0).toUpperCase() + cepage.Vin.toLowerCase().trim().slice(1)
                }))}
                emptyMessage={emptyMessageTemplate()}
                scrollable
                scrollHeight="calc(100vh - 300px)"
                globalFilter={globalFilter}
                globalFilterFields={['Cepage', 'Vin']}
                //header={renderHeader()}
                onRowClick={(event) => onRowClick(event.data)}
                rowClassName={(data) => data.Cepage === selectedCepage ? 'bg-blue-50 dark:bg-blue-900/40 border-l-4 border-blue-500' : ''}
            >
                <Column field="Cepage" header="Cépage" sortable style={{ minWidth: '200px' }} />
                <Column field="Vin" header="Vin" sortable style={{ minWidth: '150px' }} />
            </DataTable>
        </div>
    );
};

export default ListeCepages;
