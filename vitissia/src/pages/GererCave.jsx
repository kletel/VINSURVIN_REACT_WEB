import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useFetchInformationsCaves from '../hooks/useFetchInformationsCaves';
import { Dropdown } from 'primereact/dropdown';

const GererCave = () => {
    const { informations, fetchInformationsCaves, loading, error } = useFetchInformationsCaves();

    const [selectedSousRubrique, setSelectedSousRubrique] = useState(null);
    const [selectedQuestion, setSelectedQuestion] = useState(null);

    useEffect(() => {
        fetchInformationsCaves();
    }, [fetchInformationsCaves]);

    // Filtrer uniquement les données de la rubrique "Bien gérer sa cave"
    const infosCave = informations.filter(info => info.Rubrique === "Bien gérer sa cave");

    const sousRubriques = [...new Set(infosCave.map(info => info.Sous_Rubrique))];

    const questions = selectedSousRubrique
        ? infosCave.filter(info => info.Sous_Rubrique === selectedSousRubrique)
        : [];

    const texte = selectedQuestion?.Texte_WP_FR || '';

    if (loading) return <div>Chargement...</div>;
    if (error) return <div>Erreur : {error}</div>;

    return (
        <div className="flex-1 p-6 lg:p-10">
            <div className="flex items-center bg-gray-900 drop-shadow-xl mb-6 px-8 rounded-lg w-full min-h-20">
                <div id="url" className="flex gap-x-2 font-semibold text-gray-400 text-sm sm:text-lg">
                    <Link to="/gerer-cave" className="hover:text-white decoration-teal-600 hover:underline hover:underline-offset-2 transition duration-200">
                        Bien gérer sa cave
                    </Link>
                    <span className="cursor-default">/</span>
                </div>
            </div>

            <div className="space-y-6">
                {/*  Menu Sous-Rubrique */}
                <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-700">Sous-rubrique :</label>
                    <Dropdown
                        value={selectedSousRubrique}
                        options={sousRubriques}
                        onChange={(e) => {
                            setSelectedSousRubrique(e.value);
                            setSelectedQuestion(null); // reset question
                        }}
                        placeholder="Choisissez une sous-rubrique"
                        className="w-full"
                    />
                </div>

                {/*  Liste des questions */}
                {selectedSousRubrique && (
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-700">Questions :</label>
                        <ul className="list-disc ml-5 space-y-1">
                            {questions.map((q, i) => (
                                <li
                                    key={i}
                                    onClick={() => setSelectedQuestion(q)}
                                    className={`cursor-pointer hover:underline ${selectedQuestion?.Titre_Info_Fr === q.Titre_Info_Fr ? 'text-blue-600 font-semibold' : ''}`}
                                >
                                    {q.Titre_Info_Fr}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/*  Zone de texte affichée */}
                {selectedQuestion && (
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-700">Contenu :</label>
                        <textarea
                            readOnly
                            value={texte}
                            rows={8}
                            className="w-full p-3 border border-gray-300 rounded bg-gray-50 text-gray-800"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default GererCave;
