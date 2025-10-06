import { React, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GridComponent, ColumnsDirective, ColumnDirective, Inject, Sort, Filter, Search, Toolbar, VirtualScroll } from '@syncfusion/ej2-react-grids';
import { DatePickerComponent } from '@syncfusion/ej2-react-calendars';

import CustomSelect from '../utils/CustomSelect';
import { formatCurrency } from '../utils/Format';

const ListPatient = ({ lstPatients, ExclusivePage = '', loading = false }) => {
    const navigate = useNavigate();

    const genderTemplate = (props) => {
        const value = props.Sexe?.toUpperCase();
        let label = '-';
        let color = 'border border-gray-400 text-gray-400';

        if (value === 'HOMME') {
            label = 'Homme';
            color = 'bg-blue-500 text-white';
        } else if (value === 'FEMME') {
            label = 'Femme';
            color = 'bg-pink-500 text-white';
        }

        return (
            <span className={`px-2 py-1 rounded ${color}`}>
                {label}
            </span>
        );
    };


    function emptyMessageTemplate() {
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

        return <div className="p-4 text-gray-500 text-start">Aucun résultat trouvé.</div>;
    }

    const [filtersVisible, setFiltersVisible] = useState(false);

    const [selectedSexe, setSelectedSexe] = useState("Tous");
    const [selectedVille, setSelectedVille] = useState("Toutes");
    const [selectedPays, setSelectedPays] = useState("Tous");

    const [filteredData, setFilteredData] = useState([]);

    useEffect(() => {
        let filtered = formattedData;

        if (selectedSexe !== "Tous") {
            filtered = filtered.filter(patient => patient.Sexe === selectedSexe);
        }

        if (selectedVille !== "Toutes") {
            filtered = filtered.filter(patient => patient.Ville === selectedVille);
        }

        if (selectedPays !== "Tous") {
            filtered = filtered.filter(patient => patient.Pays === selectedPays);
        }

        setFilteredData(filtered);
    }, [selectedSexe, selectedVille, selectedPays, lstPatients]);

    const optSexe = ["Tous", ...new Set(filteredData.map(p => p.Sexe).filter(Boolean))];
    const optVille = ["Toutes", ...new Set(filteredData.map(p => p.Ville).filter(Boolean))];
    const optPays = ["Tous", ...new Set(filteredData.map(p => p.Pays).filter(Boolean))];

    const handleRowDoubleClick = (event) => {
        const clickedRowData = event.rowData;
        console.log(clickedRowData);
        const uuid = clickedRowData.UUID_;
        if (uuid) navigate(`/patients/${uuid}`);
    };

    const normalizeSexe = (val) => {
        if (!val) return 'Non renseigné';
        const cleaned = val.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        const maleValues = ['h', 'homme', 'home', 'm', 'masculin'];
        const femaleValues = ['f', 'femme', 'feminin', 'féminin'];

        if (maleValues.includes(cleaned)) return 'Homme';
        if (femaleValues.includes(cleaned)) return 'Femme';

        return 'Non renseigné';
    };


    const formattedData = lstPatients.map(patient => ({
        ...patient,
        Sexe: normalizeSexe(patient.Sexe),
    }));

    const gridKey = filteredData.length > 0 ? filteredData[0].UUID_ : 'empty';

    console.log(formattedData);

    return (
        <div className="bg-white p-4 rounded-lg">
            <div className="flex lg:flex-row flex-col justify-between items-start lg:items-center mx-auto my-4 lg:my-8 px-6 pb-4 border-gray-300 border-b container">
                <div>
                    <h4 className="font-bold text-gray-800 text-2xl leading-tight">Patients</h4>
                    <ul className="flex md:flex-row flex-col items-start md:items-center mt-3 text-gray-600 text-sm">
                        <li className="flex items-center mt-3 md:mt-0 mr-3">
                            <span className="mr-2">
                                <i class="fa-solid fa-scroll"></i>
                            </span>
                            <div className="flex items-center gap-1">
                                {loading ? (
                                    <div className="bg-gray-200 rounded-md w-9 h-4 animate-pulse"></div>
                                ) : (
                                    <span>{filteredData.length}</span>
                                )}
                                {' '}{filteredData.length === 1 ? 'Patient' : 'Patients'}
                            </div>
                        </li>
                    </ul>
                </div>
                <div className="mt-6 lg:mt-0">
                    <button className="bg-teal-600 hover:bg-teal-500 px-8 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-offset-2 text-white text-sm transition duration-300 ease-in-out">
                        Ajouter un Patient
                    </button>
                </div>
            </div>
            <div className="lg:mx-auto mb-4 lg:mb-8 px-6 container">
                <div className="flex justify-start mb-4">
                    <button
                        onClick={() => setFiltersVisible(!filtersVisible)}
                        className="flex items-center text-gray-500 hover:text-teal-600 text-sm"
                    >
                        {filtersVisible ? (
                            <i className="fa-chevron-up fas"></i>
                        ) : (
                            <i className="fa-chevron-down fas"></i>
                        )}
                        <span className="ml-2">{filtersVisible ? 'Réduire' : 'Afficher'} les filtres</span>
                    </button>
                </div>
                {filtersVisible && (
                    <div id="cont_filtre" className="flex flex-wrap gap-4 pb-6 w-full">
                        <CustomSelect
                            label={"Genre"}
                            options={optSexe}
                            value={selectedSexe}
                            onChange={setSelectedSexe}
                        />
                        <CustomSelect
                            label={"Ville"}
                            options={optVille}
                            value={selectedVille}
                            onChange={setSelectedVille}
                        />
                        <CustomSelect
                            label={"Pays"}
                            options={optPays}
                            value={selectedPays}
                            onChange={setSelectedPays}
                        />
                    </div>
                )}

                <div className="border-2 border-gray-300 hover:border-teal-400 rounded w-full transition duration-300 ease-in-out grow">
                    <GridComponent
                        key={gridKey}
                        dataSource={filteredData}
                        allowSorting={true}
                        emptyRecordTemplate={emptyMessageTemplate.bind(this)}
                        recordDoubleClick={handleRowDoubleClick}
                        toolbar={['Search']}
                        enableStickyHeader={true}
                        enableVirtualization={true}
                        loadingIndicator={{ indicatorType: 'Shimmer' }}
                        height={520}
                        searchSettings={{ fields: ['Nom', 'Prenom', 'Ville'], placeholder: 'Rechercher...' }}
                    >
                        <ColumnsDirective>
                            <ColumnDirective field="Nom" headerText="Nom" width="150px" />
                            <ColumnDirective field="Prenom" headerText="Prénom" width="150px" />
                            <ColumnDirective field="Sexe" headerText="Genre" width="120px" template={genderTemplate} />
                            <ColumnDirective field="Date_naissance" headerText="Date de Naissance" width="160px" type="date" format="dd/MM/yyyy" />
                            <ColumnDirective field="Tel_portable" headerText="Téléphone" width="150px" />
                            <ColumnDirective field="Ville" headerText="Ville" width="150px" />
                            <ColumnDirective field="Pays" headerText="Pays" width="100px" />
                        </ColumnsDirective>
                        <Inject services={[Sort, Filter, Search, Toolbar, VirtualScroll]} />
                    </GridComponent>
                </div>
            </div>
        </div>
    );
};

export default ListPatient;
