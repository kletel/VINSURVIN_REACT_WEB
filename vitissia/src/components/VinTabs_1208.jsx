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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // États locaux pour les valeurs sélectionnées
  const [elevage, setElevage] = useState(vin?.Elevage || '');
  const [contenant, setContenant] = useState(vin?.Flacon || '');
  const [lieuAchat, setLieuAchat] = useState(vin?.Lieu_Achat || '');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const getSelectStyles = () => ({
    control: (baseStyles, state) => ({
      ...baseStyles,
      minHeight: isMobile ? '48px' : '52px',
      backgroundColor: darkMode ? '#374151' : 'white',
      borderColor: darkMode ? '#4b5563' : '#d1d5db',
      borderRadius: isMobile ? '12px' : '8px',
      boxShadow: state.isFocused ? `0 0 0 2px ${darkMode ? '#3b82f6' : '#3b82f6'}` : 'none',
      fontSize: isMobile ? '14px' : '16px',
    }),
    singleValue: (baseStyles) => ({
      ...baseStyles,
      color: darkMode ? 'white' : 'black',
    }),
    menu: (baseStyles) => ({
      ...baseStyles,
      backgroundColor: darkMode ? '#374151' : 'white',
      borderRadius: isMobile ? '12px' : '8px',
      zIndex: 9999,
    }),
    option: (baseStyles, state) => ({
      ...baseStyles,
      backgroundColor: state.isFocused ? (darkMode ? '#4b5563' : '#f3f4f6') : 'transparent',
      color: darkMode ? 'white' : 'black',
      fontSize: isMobile ? '14px' : '16px',
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  });

  const getInputStyles = () =>
    `w-full ${isMobile ? 'p-3' : 'px-2 py-2'} ${
      darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-black border-gray-300'
    } border ${isMobile ? 'rounded-xl' : 'rounded-md'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
      isMobile ? 'text-base' : 'text-sm'
    }`;

  return (
    <div className={`${isMobile ? 'bg-transparent' : 'bg-white dark:bg-gray-800'}`}>
      <TabView
        className={isMobile ? 'mobile-tabs' : 'desktop-tabs'}
        panelContainerClassName={`${isMobile ? 'p-4' : 'p-6'} min-h-[400px] overflow-auto`}
      >
        <TabPanel
          header={
            <div className="flex items-center gap-2">
              <i className="pi pi-home text-green-600 dark:text-green-400"></i>
              <span className={`font-semibold ${isMobile ? 'text-sm' : 'text-base'}`}>
                Cave
              </span>
            </div>
          }
          headerClassName="flex align-items-center"
        >
          <div className={`${isMobile ? 'space-y-4' : 'space-y-6'}`}>
            {isMobile && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <i className="pi pi-home text-white text-sm"></i>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Informations cave
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Gérez les détails de stockage et d'achat
                </p>
              </div>
            )}

            <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6'}`}>
              <div>
                <label className={`block font-bold mb-2 text-gray-700 dark:text-gray-300 ${isMobile ? 'text-sm' : 'text-sm'}`}>
                  Élevage
                </label>
                <Select
                  isDisabled={!isEditing}
                  styles={getSelectStyles()}
                  classNamePrefix="Elevage"
                  value={elevageOptions.find((option) => option.value === vin?.Elevage) || null}
                  isClearable={true}
                  isSearchable={true}
                  name="Elevage"
                  placeholder="Élevage"
                  options={elevageOptions}
                  onChange={(selectedOption) => handleInputChange(selectedOption?.label || '', 'Elevage')}
                  menuPortalTarget={isMobile ? document.body : undefined}
                />
              </div>

              <div>
                <label className={`block font-bold mb-2 text-gray-700 dark:text-gray-300 ${isMobile ? 'text-sm' : 'text-sm'}`}>
                  Contenant
                </label>
                <Select
                  isDisabled={!isEditing}
                  styles={getSelectStyles()}
                  classNamePrefix="Contenant"
                  value={contenantOptions.find((option) => option.value === vin?.Flacon) || null}
                  isClearable={true}
                  isSearchable={true}
                  name="Contenant"
                  placeholder="Contenant"
                  options={contenantOptions}
                  onChange={(selectedOption) => handleInputChange(selectedOption?.label || '', 'Flacon')}
                  menuPortalTarget={isMobile ? document.body : undefined}
                />
              </div>

              <div>
                <label className={`block font-bold mb-2 text-gray-700 dark:text-gray-300 ${isMobile ? 'text-sm' : 'text-sm'}`}>
                  Lieu d'achat
                </label>
                <Select
                  isDisabled={!isEditing}
                  styles={getSelectStyles()}
                  classNamePrefix="LieuAchat"
                  value={lieuAchatOptions.find((option) => option.value === vin?.Lieu_Achat) || null}
                  isClearable={true}
                  isSearchable={true}
                  name="Lieu_Achat"
                  placeholder="Lieu d'achat"
                  options={lieuAchatOptions}
                  onChange={(selectedOption) => handleInputChange(selectedOption?.label || '', 'Lieu_Achat')}
                  menuPortalTarget={isMobile ? document.body : undefined}
                />
              </div>

              {[
                { label: "Date d'Achat", name: "Date_Achat", type: "date" },
                { label: "Prix d'achat unitaire (€)", name: "Prix_Achat", type: "number" },
                { label: "Quantité", name: "Qte", type: "number" },
                { label: "Dont Bue", name: "Dont_Bue", type: "number" },
                { label: "Reste en Cave", name: "Reste_en_Cave", type: "number", readOnly: true },
                { label: "Valeur de la cave (€)", name: "valeurCave", type: "number", readOnly: true },
                { label: "Apogée", name: "Apogee", type: "number" },
                { label: "À boire avant", name: "Apogee_Max", type: "number" },
              ].map(({ label, name, type, readOnly }) => (
                <div key={name}>
                  <label className={`block font-bold mb-2 text-gray-700 dark:text-gray-300 ${isMobile ? 'text-sm' : 'text-sm'}`}>
                    {label}
                  </label>
                  <input
                    type={type}
                    name={name}
                    value={
                      type === "date"
                        ? vin[name] === "0000-00-00" || !vin[name]
                          ? ""
                          : vin[name]
                        : isNaN(vin[name]) || vin[name] === null
                          ? ""
                          : vin[name]
                    }
                    onChange={handleInputChange}
                    readOnly={readOnly || !isEditing}
                    disabled={readOnly || !isEditing}
                    className={`${getInputStyles()} ${readOnly ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : ''}`}
                    placeholder={label}
                  />
                </div>
              ))}
            </div>
          </div>
        </TabPanel>

        <TabPanel
          header={
            <div className="flex items-center gap-2">
              <i className="pi pi-wine-glass text-purple-600 dark:text-purple-400"></i>
              <span className={`font-semibold ${isMobile ? 'text-sm' : 'text-base'}`}>
                Dégustation
              </span>
            </div>
          }
          headerClassName="flex align-items-center"
        >
          <div className={`${isMobile ? 'space-y-4' : 'space-y-6'}`}>
            {/* {isMobile && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <i className="pi pi-wine-glass text-white text-sm"></i>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Notes de dégustation
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Analysez l'œil, le nez et le palais de votre vin
                </p>
              </div>
            )} */}
            <VinDegustation vin={vin} isEditing={isEditing} handleInputChange={handleInputChange} />
          </div>
        </TabPanel>

        <TabPanel
          header={
            <div className="flex items-center gap-2">
              <i className="pi pi-user text-orange-600 dark:text-orange-400"></i>
              <span className={`font-semibold ${isMobile ? 'text-sm' : 'text-base'}`}>
                Producteur
              </span>
            </div>
          }
          headerClassName="flex align-items-center"
        >
          <div className={`${isMobile ? 'space-y-4' : 'space-y-6'}`}>
            {isMobile && (
              <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                    <i className="pi pi-user text-white text-sm"></i>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Informations producteur
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Détails sur le domaine et le vigneron
                </p>
              </div>
            )}

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-xl p-6 border border-blue-200 dark:border-blue-800 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="pi pi-cog text-white text-2xl animate-spin"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Fonctionnalité en développement
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Cette section sera bientôt disponible pour enrichir vos informations sur le producteur.
              </p>
            </div>
          </div>
        </TabPanel>
      </TabView>
    </div>
  );
};

export default VinTabs;
