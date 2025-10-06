import React, { useEffect, useState } from 'react';
//import { GridComponent, ColumnsDirective, ColumnDirective, Inject, Sort, Search, Toolbar, VirtualScroll } from '@syncfusion/ej2-react-grids';
import { GridComponent, ColumnsDirective, ColumnDirective, Inject, Sort, Filter, Search, Toolbar, VirtualScroll } from '@syncfusion/ej2-react-grids';
import CustomSelect from '../utils/CustomSelect';

const ListeMillesimes = ({ lstMillesimes, loading = false }) => {
    const [filteredData, setFilteredData] = useState([]);
    const [selectedPays, setSelectedPays] = useState("France");

    useEffect(() => {
        let filtered = lstMillesimes;

        if (selectedPays !== "Tous") {
            filtered = filtered.filter(millesime => millesime.Pays === selectedPays);
        }

        setFilteredData(filtered);
    }, [selectedPays, lstMillesimes]);

    const optPays = ["Tous", ...new Set(lstMillesimes.map(millesime => millesime.Pays).filter(Boolean))].sort();

    const emptyMessageTemplate = () => {
        if (loading) {
            const numberOfMessages = 15;
            return (
                <div>
                    {Array.from({ length: numberOfMessages }).map((_, index) => (
                        <div key={index} className="flex flex-row flex-start gap-4 p-3 border-b-2 text-gray-500">
                            {Array.from({ length: 5 }).map((_, subIndex) => (
                                <div
                                    key={subIndex}
                                    className="bg-gray-200 rounded-md h-4 animate-pulse"
                                    style={{
                                        width: `${Math.floor(Math.random() * (40 - 10 + 1)) + 10}rem`,
                                    }}
                                ></div>
                            ))}
                        </div>
                    ))}
                </div>
            );
        }

        // Assurez-vous que ce retour est un élément React valide
        return <div className="p-4 text-gray-500 text-start">Aucun résultat trouvé.</div>;
    };

    const handleRowDoubleClick = (event) => {
        const clickedRowData = event.rowData;
        const uuid = clickedRowData.UUID_;
        console.log('Double-clicked row:', clickedRowData);
    };
    const gridKey = filteredData.length > 0 ? filteredData[0].UUID_ : 'empty';

    return (
        <div className="bg-white p-4 rounded-lg">
            <div className="mb-4">
                <CustomSelect
                    label={"Pays"}
                    options={optPays}
                    value={selectedPays}
                    onChange={setSelectedPays}
                />
            </div>
            <div className="border-2 border-gray-300 hover:border-teal-400 rounded w-full transition duration-300 ease-in-out grow">
                <GridComponent
                    key={gridKey}
                    dataSource={filteredData}
                    allowSorting={true}
                    //emptyRecordTemplate={emptyMessageTemplate.bind(this)}
                    recordDoubleClick={handleRowDoubleClick}
                    toolbar={['Search']}
                    enableStickyHeader={true}
                    enableVirtualization={true}
                    loadingIndicator={{ indicatorType: 'Shimmer' }}
                    height={520}
                    searchSettings={{ fields: ['Annee', 'Pays'], placeholder: 'Rechercher...' }}
                >
                    <ColumnsDirective>
                        <ColumnDirective field="Annee" headerText="Année" width="100px" />
                        <ColumnDirective field="Bordeau_Rouge" headerText="Bordeaux Rouge" width="150px" />
                        <ColumnDirective field="Bordeau_Blanc_Liquoreux" headerText="Bordeaux Blanc Liquoreux" width="200px" />
                        <ColumnDirective field="Bordeau_Blanc_Sec" headerText="Bordeaux Blanc Sec" width="150px" />
                        <ColumnDirective field="Bourgogne_Rouge" headerText="Bourgogne Rouge" width="150px" />
                        <ColumnDirective field="Bourgogne_Blanc" headerText="Bourgogne Blanc" width="150px" />
                        <ColumnDirective field="Champagne" headerText="Champagne" width="150px" />
                        <ColumnDirective field="Loire" headerText="Loire" width="150px" />
                        <ColumnDirective field="Rhone" headerText="Rhône" width="150px" />
                        <ColumnDirective field="Alsace" headerText="Alsace" width="150px" />
                        <ColumnDirective field="Pays" headerText="Pays" width="150px" />
                    </ColumnsDirective>
                    <Inject services={[Sort, Search, Toolbar, VirtualScroll]} />
                </GridComponent>
            </div>
        </div>
    );
};

export default ListeMillesimes;
