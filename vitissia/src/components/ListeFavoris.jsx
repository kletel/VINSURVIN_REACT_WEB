import React from 'react';
import { GridComponent, ColumnsDirective, ColumnDirective, Inject, Sort, Search, Toolbar, VirtualScroll } from '@syncfusion/ej2-react-grids';

const ListeFavoris = ({ lstFavoris, loading = false }) => {
    const gridKey = lstFavoris.length > 0 ? lstFavoris[0].UUID_ : 'empty';

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
                    dataSource={lstFavoris}
                    allowSorting={true}
                    toolbar={['Search']}
                    enableStickyHeader={true}
                    enableVirtualization={true}
                    loadingIndicator={{ indicatorType: 'Shimmer' }}
                    height={520}
                    searchSettings={{ fields: ['Nom', 'Type', 'Region', 'Pays'], placeholder: 'Rechercher...' }}
                >
                    <ColumnsDirective>
                        <ColumnDirective field="Nom" headerText="Nom" width="150px" />
                        <ColumnDirective field="Type" headerText="Type" width="150px" />
                        <ColumnDirective field="Region" headerText="Région" width="150px" />
                        <ColumnDirective field="Pays" headerText="Pays" width="150px" />
                    </ColumnsDirective>
                    <Inject services={[Sort, Search, Toolbar, VirtualScroll]} />
                </GridComponent>
            </div>
        </div>
    );
};

export default ListeFavoris;
