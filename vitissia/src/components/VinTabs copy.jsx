import React, { useMemo, useEffect, useState, useContext} from 'react';
import useFetchEnums from '../hooks/useFetchEnums';
import Select from 'react-select';
import { TabView, TabPanel } from 'primereact/tabview';
import '../styles/VinTabs.css';
import VinDegustation from '../components/VinDegustation';
import { ThemeContext } from '../context/ThemeContext';

const VinTabs = ({ vin, isEditing, handleInputChange }) => {
  const { enums, fetchEnums } = useFetchEnums();
  const { darkMode } = useContext(ThemeContext);

  // États locaux pour les valeurs sélectionnées
  const [elevage, setElevage] = useState(vin?.Elevage || '');
  const [contenant, setContenant] = useState(vin?.Flacon || '');
  const [lieuAchat, setLieuAchat] = useState(vin?.Lieu_Achat || '');

  useEffect(() => {
    setElevage(vin?.Elevage || '');
    setContenant(vin?.Flacon || '');
    setLieuAchat(vin?.Lieu_Achat || '');
  }, []); // Pas de dépendances pour exécuter uniquement au montage

  useEffect(() => {
    fetchEnums(); // Appeler fetchEnums au montage du composant
  }, [fetchEnums]);

  const elevageOptions = useMemo(() => {
    const elevageEnum = enums.find((item) => item.titre === "Elevage");
    return elevageEnum?.Valeur_Enum?.Valeur.map((val) => ({
      label: val.Libelle,
      value: val.Libelle,
    })) || [];
  }, [enums]);

  const contenantOptions = useMemo(() => {
    const contenantEnum = enums.find((item) => item.titre === "Contenant");
    return contenantEnum?.Valeur_Enum?.Valeur.map((val) => ({
      label: val.Libelle,
      value: val.Libelle,
    })) || [];
  }, [enums]);
  const lieuAchatOptions = useMemo(() => {
    const lieuAchatEnum = enums.find((item) => item.titre === "Lieu d'achat");
    return lieuAchatEnum?.Valeur_Enum?.Valeur.map((val) => ({
      label: val.Libelle,
      value: val.Libelle,
    })) || [];
  }, [enums]);

  return (
    <div className="dark:bg-[#1e1e1e] bg-opacity-90 shadow-lg text-black dark:bg-[#1a1a1a] md:pt-4">
      <TabView
        className="text-sm md:text-lg centered-tab-headers custom-tabview p-0 m-0"
        panelContainerClassName="p-0 dark:bg-[#1e1e1e]"
      >
        <TabPanel header="Cave" leftIcon="pi pi-home mr-2" className="text-sm md:text-md hover:text-[#f0cd7b] dark:hover:text-[#f0cd7b] p-1 border border-gray-400 dark:border-[#888] dark:text-white">

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 text-sm md:text-base p-0 sm:p-1 lg:p-2">
            <div>
              <label className="block text-sm text-black dark:text-[#f0cd7b] font-semibold mb-1">Élevage :</label>
              <Select
                //className="basic-single rounded-md border border-[#444] text-black"
                isDisabled={!isEditing}
                styles={{
                  control: (baseStyles, state) => ({
                    ...baseStyles,
                    boxShadow: state.isFocused ? '0 0 0 1px grey' : 'none',
                    borderRadius: '0',
                    backgroundColor: darkMode ? '#2b2b2b' : 'white', // Utilisation de darkMode
                    color: darkMode ? 'white' : 'black', // Texte adapté au mode
                    border: `1px solid ${darkMode ? '#444' : '#ccc'} !important`,
                  }),
                  singleValue: (baseStyles) => ({
                    ...baseStyles,
                    color: darkMode ? 'white' : 'black', // Texte sélectionné
                  }),
                  menu: (baseStyles) => ({
                    ...baseStyles,
                    backgroundColor: darkMode ? '#2b2b2b' : 'white', // Fond du menu
                  }),
                  option: (baseStyles, state) => ({
                    ...baseStyles,
                    backgroundColor: state.isFocused
                      ? (darkMode ? '#444' : '#f0f0f0') // Survol
                      : (darkMode ? '#2b2b2b' : 'white'),
                    color: darkMode ? 'white' : 'black',
                  }),
                }}
                classNamePrefix="Elevage"
                value={elevageOptions.find((option) => option.value === vin?.Elevage) || ''}
                isClearable={true}
                isSearchable={true}
                name="Elevage"
                placeholder="Élevage"
                options={elevageOptions}
                onChange={(selectedOption) => handleInputChange(selectedOption?.label || '', 'Elevage')}
              />
            </div>
            <div>
              <label className="block text-sm text-black dark:text-[#f0cd7b] font-semibold mb-1">Contenant :</label>
              <Select
                //className="basic-single rounded-md border border-[#444] text-black"
                isDisabled={!isEditing}
                styles={{
                  control: (baseStyles, state) => ({
                    ...baseStyles,
                    boxShadow: state.isFocused ? '0 0 0 1px grey' : 'none',
                    borderRadius: '0',
                    backgroundColor: darkMode ? '#2b2b2b' : 'white', // Utilisation de darkMode
                    color: darkMode ? 'white' : 'black', // Texte adapté au mode
                    border: `1px solid ${darkMode ? '#444' : '#ccc'} !important`,
                  }),
                  singleValue: (baseStyles) => ({
                    ...baseStyles,
                    color: darkMode ? 'white' : 'black', // Texte sélectionné
                  }),
                  menu: (baseStyles) => ({
                    ...baseStyles,
                    backgroundColor: darkMode ? '#2b2b2b' : 'white', // Fond du menu
                  }),
                  option: (baseStyles, state) => ({
                    ...baseStyles,
                    backgroundColor: state.isFocused
                      ? (darkMode ? '#444' : '#f0f0f0') // Survol
                      : (darkMode ? '#2b2b2b' : 'white'),
                    color: darkMode ? 'white' : 'black',
                  }),
                }}
                classNamePrefix="Contenant"
                value={contenantOptions.find((option) => option.value === vin?.Flacon) || ''}
                isClearable={true}
                isSearchable={true}
                name="Contenant"
                placeholder="Contenant"
                options={contenantOptions}
                onChange={(selectedOption) => handleInputChange(selectedOption?.label || '', 'Flacon')}
              />
            </div>
            <div>
              <label className="block text-sm text-black dark:text-[#f0cd7b] font-semibold mb-1">Lieu d'achat :</label>
              <Select
                //className="basic-single rounded-md border border-[#444] text-black"
                isDisabled={!isEditing}
                styles={{
                  control: (baseStyles, state) => ({
                    ...baseStyles,
                    boxShadow: state.isFocused ? '0 0 0 1px grey' : 'none',
                    borderRadius: '0',
                    backgroundColor: darkMode ? '#2b2b2b' : 'white', // Utilisation de darkMode
                    color: darkMode ? 'white' : 'black', // Texte adapté au mode
                    border: `1px solid ${darkMode ? '#444' : '#ccc'} !important`,
                  }),
                  singleValue: (baseStyles) => ({
                    ...baseStyles,
                    color: darkMode ? 'white' : 'black', // Texte sélectionné
                  }),
                  menu: (baseStyles) => ({
                    ...baseStyles,
                    backgroundColor: darkMode ? '#2b2b2b' : 'white', // Fond du menu
                  }),
                  option: (baseStyles, state) => ({
                    ...baseStyles,
                    backgroundColor: state.isFocused
                      ? (darkMode ? '#444' : '#f0f0f0') // Survol
                      : (darkMode ? '#2b2b2b' : 'white'),
                    color: darkMode ? 'white' : 'black',
                  }),
                }}
                classNamePrefix="LieuAchat"
                value={lieuAchatOptions.find((option) => option.value === vin?.Lieu_Achat) || ''}
                isClearable={true}
                isSearchable={true}
                name="Lieu_Achat"
                placeholder="Lieu d'achat"
                options={lieuAchatOptions}
                onChange={(selectedOption) => handleInputChange(selectedOption?.label || '', 'Lieu_Achat')}
              />
            </div>
            {[
              { label: "Date d'Achat", name: "Date_Achat", type: "date" },
              { label: "Prix d'achat unitaire", name: "Prix_Achat", type: "number" },
              { label: "Quantité", name: "Qte", type: "number" },
              { label: "Dont Bue", name: "Dont_Bue", type: "number" },
              { label: "Reste en Cave (Qte - bue)", name: "Reste_en_Cave", type: "number", readOnly: true },
              { label: "Valeur de la cave", name: "valeurCave", type: "number", readOnly: true },
              { label: "Apogée", name: "Apogee", type: "number" },
              { label: "À boire avant", name: "Apogee_Max", type: "number" },
            ].map(({ label, name, type, readOnly }) => (
              <div key={name}>
                <label className="block text-black dark:text-[#f0cd7b] font-semibold mb-1">{label}:</label>
                <div className="relative">
                  <input
                    type={type}
                    name={name}
                    value={
                      type === "date"
                        ? vin[name] === "0000-00-00" || !vin[name]
                          ? "" // Remplace les dates invalides par une chaîne vide
                          : vin[name]
                        : isNaN(vin[name]) || vin[name] === null
                          ? "" // Remplace NaN ou null par une chaîne vide
                          : vin[name]
                    }
                    onChange={handleInputChange}
                    readOnly={readOnly || !isEditing} // Applique readonly si spécifié ou si non en mode édition
                    className="w-full px-1 py-1 dark:bg-[#2a2a2a] bg-white dark:text-white text-black border border-[#444] focus:outline-none focus:ring-2 focus:ring-[#f0cd7b]"
                  />
                </div>
              </div>
            ))}
          </div>
        </TabPanel>
        <TabPanel header="Dégustation" rightIcon="pi pi-user ml-2" className="text-sm md:text-md hover:text-[#f0cd7b] dark:hover:text-[#f0cd7b]  border-y border-gray-400 dark:border-[#888] dark:text-white p-0 m-0"> {/*hover:text-[#f0cd7b] */}
          <VinDegustation vin={vin} isEditing={isEditing} handleInputChange={handleInputChange} />
        </TabPanel>

        <TabPanel header="Producteur" leftIcon="pi pi-search mr-2" rightIcon="pi pi-cog ml-2" className="text-sm md:text-md hover:text-[#f0cd7b] dark:hover:text-[#f0cd7b] p-1 border border-gray-400 dark:border-[#888] dark:text-white">
          <p className="text-gray-300 italic">En cours...</p>
        </TabPanel>
      </TabView>
    </div>
  );
};

export default VinTabs;
