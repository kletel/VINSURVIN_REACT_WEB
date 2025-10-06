import React from 'react';
import { GridComponent, ColumnsDirective, ColumnDirective, Inject, Sort, Search, Toolbar, VirtualScroll } from '@syncfusion/ej2-react-grids';
import { Dropdown } from 'primereact/dropdown';

const ListeCepages = ({ lstCepages, loading = false, onRowClick }) => {
    const gridKey = lstCepages.length > 0 ? lstCepages[0].UUID_ : 'empty';

    const emptyMessageTemplate = () => {
        if (loading) {
            return <div>Chargement...</div>;
        }
        return <div className="p-4 text-gray-500 text-start">Aucun résultat trouvé.</div>;
    };

    return (
        <div className="bg-white p-4 rounded-lg">
            <div className="border-2 border-gray-300 hover:border-teal-400 rounded w-full transition duration-300 ease-in-out grow">

                <GridComponent
                    key={gridKey}
                    dataSource={lstCepages.map(cepage => ({
                        ...cepage,
                        Vin: cepage.Vin.toLowerCase().trim().charAt(0).toUpperCase() + cepage.Vin.toLowerCase().trim().slice(1) // Uniformiser la casse et capitaliser
                    }))}
                    allowSorting={true}
                    toolbar={['Search']}
                    enableStickyHeader={true}
                    enableVirtualization={true}
                    loadingIndicator={{ indicatorType: 'Shimmer' }}
                    height={520}
                    searchSettings={{ fields: ['Cepage', 'Vin'], placeholder: 'Rechercher...' }}
                    rowSelected={(event) => onRowClick(event.data)}
                >
                    <ColumnsDirective>
                        <ColumnDirective field="Cepage" headerText="Cépage" width="200px" />
                        <ColumnDirective field="Vin" headerText="Vin" width="150px" filter={true}  />
                    </ColumnsDirective>
                    <Inject services={[Sort, Search, Toolbar, VirtualScroll]} />
                </GridComponent>
            </div>
        </div>
    );
};

export default ListeCepages;
