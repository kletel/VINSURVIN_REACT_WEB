import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';

const ListeProducteurs = ({ lstProducteurs, loading = false }) => {
    const [globalFilter, setGlobalFilter] = useState('');
    const [selectedSociete, setSelectedSociete] = useState("Tous");

    const societeOptions = ["Tous", ...new Set(lstProducteurs.map(producteur => producteur.Societe).filter(Boolean))].sort();

    const emptyMessageTemplate = () => {
        if (loading) {
            return <div>Chargement...</div>;
        }
        return <div className="p-4 text-gray-500 text-start">Aucun résultat trouvé.</div>;
    };

    const renderHeader = () => (
        <div className="flex justify-between items-center">
            <Dropdown
                value={selectedSociete}
                options={societeOptions}
                onChange={(e) => setSelectedSociete(e.value || "Tous")}
                placeholder="Filtrer par Société"
                className="p-column-filter"
                showClear
                style={{ minWidth: '12rem' }}
            />
            <span className="p-input-icon-left">
                {/* <i className="pi pi-search" /> */}
                <input
                    type="search"
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Rechercher..."
                    className="p-inputtext p-component"
                />
            </span>
        </div>
    );

    const filteredData = selectedSociete === "Tous"
        ? lstProducteurs
        : lstProducteurs.filter(producteur => producteur.Societe === selectedSociete);

    return (
        <div className="bg-white p-4 rounded-lg">
            <DataTable
                value={filteredData}
                emptyMessage={emptyMessageTemplate()}
                scrollable
                scrollHeight="calc(100vh - 300px)"
                globalFilter={globalFilter}
                globalFilterFields={['Societe', 'Nom', 'Ville', 'Tel', 'Mail']}
                paginator
                rows={10}
                header={renderHeader()}
            >
                <Column field="Societe" header="Société" sortable style={{ minWidth: '150px' }} />
                <Column field="Nom" header="Nom" sortable style={{ minWidth: '150px' }} />
                <Column field="Ville" header="Ville" sortable style={{ minWidth: '150px' }} />
                <Column field="Tel" header="Téléphone" sortable style={{ minWidth: '150px' }} />
                <Column field="Mail" header="Email" sortable style={{ minWidth: '200px' }} />
            </DataTable>
        </div>
    );
};

export default ListeProducteurs;
