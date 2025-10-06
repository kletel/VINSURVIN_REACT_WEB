import React, { useMemo, useEffect, useState, useContext, useRef } from 'react';
import useFetchEnums from '../hooks/useFetchEnums';
import Select from 'react-select';
import { TabView, TabPanel } from 'primereact/tabview';
import '../styles/VinTabs.css';
import VinDegustation from '../components/VinDegustation';
import { ThemeContext } from '../context/ThemeContext';
import authHeader from '../config/authHeader';
import config from '../config/config';
import useFetchRegions from '../hooks/useFetchRegions';
import { Toast } from 'primereact/toast';


const VinTabs = ({ vin ,setVin, isEditing, handleInputChange }) => {
  const { enums, fetchEnums } = useFetchEnums();
  const { darkMode } = useContext(ThemeContext);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const toast = useRef(null);
  const UUIDuser = sessionStorage.getItem('uuid_user');

  // États locaux pour les valeurs sélectionnées
  const [elevage, setElevage] = useState(vin?.Elevage || '');
  const [contenant, setContenant] = useState(vin?.Flacon || '');
  const [lieuAchat, setLieuAchat] = useState(vin?.Lieu_Achat || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showPlacementDialog, setShowPlacementDialog] = useState(false);

  //Regenère IA
  const { regions, fetchRegions, ajouterRegionIA } = useFetchRegions();
  const optionsRegions = useMemo(() => regions.map((region) => ({
    label: region.Nom_Fr,
    value: region.Ref_Pays,
  })), [regions]);

  const [filteredRegions, setFilteredRegions] = useState(optionsRegions);
  const [errorRegion, setErrorRegion] = useState("");
  const [errorCouleur, setErrorCouleur] = useState("");

  const optionCouleur = [
    { label: 'Rouge', value: 'Rouge' },
    { label: 'Blanc', value: 'Blanc' },
    { label: 'Rosé', value: 'Rosé' },
  ]

  const optionTypeVin = useMemo(() => {
    const typeVinEnum = enums.find((item) => item.titre === "Type de vin");
    return typeVinEnum?.Valeur_Enum?.Valeur.map((val) => ({
      label: val.Libelle,
      value: val.Libelle,
    })) || [];
  }, [enums]);

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
    `w-full ${isMobile ? 'p-3' : 'px-2 py-2'} ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-black border-gray-300'
    } border ${isMobile ? 'rounded-xl' : 'rounded-md'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isMobile ? 'text-base' : 'text-sm'
    }`;


  const handleRegionValidation = async (regionIA, paysIA) => {
    const regionTrouvee = optionsRegions.find((region) =>
      region.label.toLowerCase().includes(regionIA.toLowerCase())
    );

    if (!regionTrouvee) {
      try {
        const newRegion = await ajouterRegionIA(paysIA, regionIA);

        await fetchRegions(); // Recharger les régions après l'ajout

        // Recalculer les optionsRegions après fetchRegions
        const updatedOptionsRegions = regions.map((region) => ({
          label: region.Nom_Fr,
          value: region.Ref_Pays,
        }));

        // Rechercher la région ajoutée dans les options mises à jour
        const updatedRegion = updatedOptionsRegions.find((region) =>
          region.label.toLowerCase().includes(regionIA.toLowerCase())
        );

        if (updatedRegion) {
          setFilteredRegions([updatedRegion]); // Mettre à jour les régions filtrées
          setErrorRegion(""); // Réinitialiser l'erreur
        }
      } catch (error) {
        console.error(error)
      }
    }
  };

  const traiterAnalyseIA = (jsonAtraite) => {
    // Liste des clés à ne PAS inclure dans Remarque
    //console.log("jsonAtraite", jsonAtraite);
    const keysExclues = [
      "nom", "region", "pays", "appellation", "millesime", "type_de_vin",
      "APOGEE", "taux_d_alcool", "prix_moyen", "cepages"
    ];

    const remarques = Object.entries(jsonAtraite)
      .filter(([key]) => !keysExclues.includes(key)) // Exclure les champs déjà utilisés
      .map(([key, value]) => {
        if (key === "producteur") {
          return `producteur : ${jsonAtraite.domaine || "NC"}`;
        }
        return `${key.replace(/_/g, " ")} : ${value}`;
      })
      .join(", "); // Joindre en une seule chaîne



    const updatedRemarques = remarques
      .replace(/région/g, "Région")
      .replace(/null/g, "NC")
      .replace(/cépages/g, "cépage(s)");

    const regionIA = jsonAtraite.région || jsonAtraite.region || ""; // Récupérer la région de l'analyse IA
    const paysIA = jsonAtraite.pays || ""; // Récupérer le pays de l'analyse IA

    // Normaliser certaines régions spécifiques
    const regionNormalisee = regionIA === "Bordeaux" ? "Bordelais" : regionIA;

    handleRegionValidation(regionNormalisee, paysIA); // Valider ou ajouter la région

    const regionTrouvee = optionsRegions.find((region) =>
      region.label.toLowerCase().includes(regionNormalisee.toLowerCase()) // Recherche insensible à la casse
    );
    if (regionTrouvee) {
      setFilteredRegions([regionTrouvee]);
      setErrorRegion(""); // Réinitialiser l'erreur
    } else {
      setErrorRegion(`Région non trouvée : ${regionNormalisee}`);
      // Même si la région n'est pas trouvée, on l'affecte quand même
    }

    // Recherche de la couleur correspondante
    const couleurIA = jsonAtraite.couleur || ""; // Récupérer la couleur de l'analyse IA
    const couleurTrouvee = optionCouleur.find((couleur) =>
      couleur.label.toLowerCase() === couleurIA.toLowerCase() // Recherche exacte insensible à la casse
    );
    //console.log("couleurTrouvee", couleurTrouvee);
    if (couleurTrouvee) {
      setErrorCouleur(""); // Réinitialiser l'erreur
    } else {
      setErrorCouleur(`Couleur non trouvée : ${couleurIA}`);
    }

    const typeIA = jsonAtraite.type_de_vin || jsonAtraite.type || "";
    const typeTrouve = typeIA.toLowerCase() === "vin tranquille"
      ? optionTypeVin.find((option) => option.label.toLowerCase() === "tranquille")
      : optionTypeVin.find((option) => option.label.toLowerCase() === typeIA.toLowerCase());
    console.log("jsonAtraite", jsonAtraite);
    setVin((prevVin) => ({
      ...prevVin,
      Association_Mets: jsonAtraite.degustation,
      Domaine: jsonAtraite.domaine || jsonAtraite.nom_domaine || "", // Utiliser le domaine ou le nom du domaine
      Producteur: jsonAtraite.producteur.nom || jsonAtraite.producteur.nom || "",///
      Nom: jsonAtraite.nom ?? "", // Si undefined → ""
      Douceur: jsonAtraite.douceur ?? "",///
      Sous_Region: jsonAtraite.sous_region || jsonAtraite.sous_région || "",///
      Producteur_Adresse: jsonAtraite.producteur.adresse || "", ///
      Région: regionTrouvee ? regionTrouvee.label : regionNormalisee, // Utilise toujours regionNormalisee même si non trouvée
      Couleur: couleurTrouvee ? couleurTrouvee.label : couleurIA, // Utilise toujours couleurIA même si non trouvée
      Pays: jsonAtraite.pays ?? "", // Utilise toujours le pays de l'IA
      Appellation: jsonAtraite.appellation ?? "",
      Millesime: jsonAtraite.millesime || jsonAtraite["millésime"] || "",
      Type: typeTrouve ? typeTrouve.label : typeIA,
      Apogee: jsonAtraite.APOGEE ? jsonAtraite.APOGEE.split("-")[0] : "", // Vérifie que APOGEE existe
      Apogee_Max: jsonAtraite.APOGEE ? jsonAtraite.APOGEE.split("-")[1] : "",
      TypeAlcool: jsonAtraite.type_alcool || "",
      Alcool: jsonAtraite.taux_d_alcool
        ? parseFloat(jsonAtraite.taux_d_alcool)
        : (jsonAtraite.alcool ? parseFloat(jsonAtraite.alcool) : 0),
      Prix_Achat: (() => {
        const prixStr =
          typeof jsonAtraite["prix moyen"] === "string"
            ? jsonAtraite["prix moyen"]
            : (typeof jsonAtraite.prix_moyen === "string"
              ? jsonAtraite.prix_moyen
              : null);

        if (prixStr) {
          const matchRange = prixStr.match(/(\d+(?:[\.,]\d+)?)\s*[-–]\s*(\d+(?:[\.,]\d+)?)/); // ex: "80-100"
          if (matchRange) {
            const min = parseFloat(matchRange[1].replace(",", "."));
            const max = parseFloat(matchRange[2].replace(",", "."));
            return (min + max) / 2;
          } else {
            const num = parseFloat(prixStr.replace(/[^\d.,]/g, "").replace(",", "."));
            return isNaN(num) ? 0 : num;
          }
        } else if (typeof jsonAtraite.prix_moyen === "number") {
          return jsonAtraite.prix_moyen;
        } else {
          return 0;
        }
      })(),
      Valeur: (() => {
        const prixStr =
          typeof jsonAtraite["prix moyen"] === "string"
            ? jsonAtraite["prix moyen"]
            : (typeof jsonAtraite.prix_moyen === "string"
              ? jsonAtraite.prix_moyen
              : null);

        if (prixStr) {
          const matchRange = prixStr.match(/(\d+(?:[\.,]\d+)?)\s*[-–]\s*(\d+(?:[\.,]\d+)?)/); // ex: "80-100"
          if (matchRange) {
            const min = parseFloat(matchRange[1].replace(",", "."));
            const max = parseFloat(matchRange[2].replace(",", "."));
            return (min + max) / 2;
          } else {
            const num = parseFloat(prixStr.replace(/[^\d.,]/g, "").replace(",", "."));
            return isNaN(num) ? 0 : num;
          }
        } else if (typeof jsonAtraite.prix_moyen === "number") {
          return jsonAtraite.prix_moyen;
        } else {
          return 0;
        }
      })(),
      valeurCave: (() => {
        const prixStr =
          typeof jsonAtraite["prix moyen"] === "string"
            ? jsonAtraite["prix moyen"]
            : (typeof jsonAtraite.prix_moyen === "string"
              ? jsonAtraite.prix_moyen
              : null);

        if (prixStr) {
          const matchRange = prixStr.match(/(\d+(?:[\.,]\d+)?)\s*[-–]\s*(\d+(?:[\.,]\d+)?)/); // ex: "80-100"
          if (matchRange) {
            const min = parseFloat(matchRange[1].replace(",", "."));
            const max = parseFloat(matchRange[2].replace(",", "."));
            return (min + max) / 2;
          } else {
            const num = parseFloat(prixStr.replace(/[^\d.,]/g, "").replace(",", "."));
            return isNaN(num) ? 0 : num;
          }
        } else if (typeof jsonAtraite.prix_moyen === "number") {
          return jsonAtraite.prix_moyen;
        } else {
          return 0;
        }
      })(),
      Cepage: (() => {
        const rawCepages = jsonAtraite.cepages || jsonAtraite["cépages"];
        if (Array.isArray(rawCepages)) {
          return rawCepages.join(", ");
        } else if (typeof rawCepages === "string") {
          return rawCepages;
        } else {
          return "";
        }
      })(),
      //Remarques: "", // Ajout des autres champs dynamiquement
      RemarquesIA: updatedRemarques,
      Reste_en_Cave: 1,
    }));

  };
  const reModifIA = async (retryCount = 0) => {
    try {
      console.log("vin",vin)
      setIsAnalyzing(true);
      const formData = new FormData();
      if(vin.base64_etiquette)
        formData.append("b64", vin.base64_etiquette);
      else
        formData.append("b64", vin.base64_etiquettecomplet);

      formData.append("uuidUser", UUIDuser);
      const response = await fetch(`${config.apiBaseUrl}/4DACTION/react_modifIA`, {
        method: 'POST',
        headers: authHeader(),
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Erreur lors de l'analyse");
      }

      const jsonAtraite = await response.json();
      if (!jsonAtraite || Object.keys(jsonAtraite).length === 0) {
        if (retryCount < 2) {
          await reModifIA(retryCount + 1);
          return;
        } else {
          throw new Error("Réponse vide après trois tentatives");
        }
      }
      console.log("jsonAtraitetabs", jsonAtraite);
      traiterAnalyseIA(jsonAtraite);
      // Ancien: setCurrentStep(2)
      setShowPlacementDialog(true);
    } catch (error) {
      if (retryCount < 2) {
        await reModifIA(retryCount + 1);
      } else {
        // En cas d'échec final, afficher quand même le choix de placement
        setShowPlacementDialog(true);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

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
              <div className={`mb-4 ${!isEditing ? 'pb-1 border-b' : ''}`}>
                <label className={`block text-sm font-semibold mb-1 ${isEditing
                  ? 'text-gray-600 dark:text-gray-400'
                  : 'text-gray-800 dark:text-gray-300'
                  }`}>
                  Élevage
                </label>
                {isEditing ? (
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
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{vin?.Elevage || '-'}</p>
                )}
              </div>

              <div className={`mb-4 ${!isEditing ? 'pb-1 border-b' : ''}`}>
                <label className={`block text-sm font-semibold mb-1 ${isEditing
                  ? 'text-gray-600 dark:text-gray-400'
                  : 'text-gray-800 dark:text-gray-300'
                  }`}>
                  Contenant
                </label>
                {isEditing ? (
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
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{vin?.Flacon || '-'}</p>
                )}
              </div>

              <div className={`mb-4 ${!isEditing ? 'pb-1 border-b' : ''}`}>
                <label className={`block text-sm font-semibold mb-1 ${isEditing
                  ? 'text-gray-600 dark:text-gray-400'
                  : 'text-gray-800 dark:text-gray-300'
                  }`}>
                  Lieu d'achat
                </label>
                {isEditing ? (
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
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{vin?.Lieu_Achat || '-'}</p>
                )}
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
                <div key={name} className={`mb-4 ${!isEditing ? 'pb-1 border-b' : ''}`}>
                  <label className={`block text-sm font-semibold mb-1 ${isEditing
                    ? 'text-gray-600 dark:text-gray-400'
                    : 'text-gray-800 dark:text-gray-300'
                    }`}>
                    {label}
                  </label>
                  {isEditing ? (
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
                      className={`w-full p-2 bg-white dark:bg-[#2b2b2b] border border-gray-300 dark:border-[#444] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#888] ${readOnly ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : ''}`}
                      placeholder={label}
                    />
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {type === "date"
                        ? vin[name] === "0000-00-00" || !vin[name]
                          ? "-"
                          : new Date(vin[name]).toLocaleDateString('fr-FR')
                        : isNaN(vin[name]) || vin[name] === null || vin[name] === ""
                          ? "-"
                          : type === "number" && (name === "Prix_Achat" || name === "valeurCave")
                            ? `${vin[name]}€`
                            : vin[name]
                      }
                    </p>
                  )}
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
                  Analysez l'œil, le nez et le paflais de votre vin
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

        <TabPanel
          header={
            <div className="flex items-center gap-2">
              <i className="pi pi-microchip-ai text-blue-600 dark:text-blue-400"></i>
              <span className={`font-semibold ${isMobile ? 'text-sm' : 'text-base'}`}>
                Résultat IA
              </span>
            </div>
          }
          headerClassName="flex align-items-center"
        >
          <div className='flex flex-col'>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              Informations Récupérées
            </h1>

            {isAnalyzing ? (
              <div className="mt-5 flex items-center justify-center">
                <i className="pi pi-spinner pi-spin text-2xl text-blue-500 dark:text-white" />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Analyse en cours...</span>
              </div>
            ) : (
              <>
              <div className='mt-2'>
                <p className="">
                  {vin.RemarquesIA &&
                    vin.RemarquesIA.split(",").map((item, index) => (
                      <span key={index}>
                        {item.trim()}
                        <br />
                      </span>
                    ))}
                </p>
              </div>

                {isEditing && <button
                  className="self-center w-32 px-6 py-2 mt-5 bg-blue-500 text-white text-sm font-semibold hover:bg-indigo-500 transition dark:text-black dark:hover:bg-[#ffde9b] dark:bg-[#ffde9b] hover:scale-105 dark:hover:scale-100 transition-all duration-300"
                  onClick={async () => {
                    await reModifIA();
                  }
                  }
                >
                  Re-Génerer
                </button>}
              </>
            )}
          </div>



        </TabPanel>
      </TabView>
    </div>
  );
};

export default VinTabs;
