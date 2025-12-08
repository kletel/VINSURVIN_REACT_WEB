import React, { useState, useEffect, useMemo, useContext, useCallback, useRef } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import useFetchEnums from '../hooks/useFetchEnums';
import Select from 'react-select';
import CustomSelect from '../utils/CustomSelect';
import { ThemeContext } from '../context/ThemeContext';

const VinDegustation = ({ vin, isEditing, handleInputChange }) => {
  const { darkMode } = useContext(ThemeContext);
  const { enums, error, loading, fetchEnums } = useFetchEnums();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [limpidite, setLimpidite] = useState('');
  const [intensite, setIntensite] = useState('');
  const [couleur, setCouleur] = useState('');
  const [observationVue, setObservationVue] = useState('');
  const [aromesPrimairesOptions, setAromesPrimairesOptions] = useState([]);
  const [aromesSecondairesOptions, setAromesSecondairesOptions] = useState([]);
  const [aromesTertiairesOptions, setAromesTertiairesOptions] = useState([]);
  const [caractPrimairesOptions, setCaractPrimairesOptions] = useState([]);
  const [caractSecondairesOptions, setCaractSecondairesOptions] = useState([]);
  const [caractTertiairesOptions, setCaractTertiairesOptions] = useState([]);

  const [douceurPalais, setDouceurPalais] = useState('');
  const [aciditePalais, setAciditePalais] = useState('');
  const [tanninsPalais, setTanninsPalais] = useState('');
  const [alcoolPalais, setAlcoolPalais] = useState('');
  const [corpsPalais, setCorpsPalais] = useState('');
  const [intensiteSaveurPalais, setIntensiteSaveurPalais] = useState('');
  const [saveursPrimairesPalais, setSaveursPrimairesPalais] = useState({});
  const [texturePalais, setTexturePalais] = useState('');
  const [finalePalais, setFinalePalais] = useState('');
  const [observationPalais, setObservationPalais] = useState(''); // Ajout de l'état pour l'observation

  const [optionsInitialized, setOptionsInitialized] = useState(false);
  const [collapsedOeil, setCollapsedOeil] = useState(true);
  const [collapsedPalais, setCollapsedPalais] = useState(true);
  const [collapsedNez, setCollapsedNez] = useState(true);

  useEffect(() => {
    fetchEnums(); // Appeler fetchEnums au montage du composant
  }, [fetchEnums]);


  useEffect(() => {
    const limpiditeText = limpidite;
    const intensiteText = intensite;
    const couleurText = couleur;
    if (
      vin?.Degustation_Vue?.Limpidite !== limpiditeText ||
      vin?.Degustation_Vue?.Intensite !== intensiteText ||
      vin?.Degustation_Vue?.Couleur !== couleurText ||
      vin?.Degustation_Vue?.Observations !== observationVue
    ) {
      handleInputChange(
        {
          Limpidite: limpiditeText,
          Intensite: intensiteText,
          Couleur: couleurText,
          Observations: observationVue,
        },
        'Degustation_Vue'
      );
    }
  }, [limpidite, intensite, couleur, observationVue, handleInputChange, vin]);


  useEffect(() => {
    const previous = vin?.Degustation_Palais || {};
    const newState = {
      ...previous,
      Douceur: douceurPalais,
      Acidite: aciditePalais,
      Tannins: tanninsPalais,
      Alcool: alcoolPalais,
      Corps: corpsPalais,
      IntensiteSaveur: intensiteSaveurPalais,
      SaveursPrimaires: saveursPrimairesPalais,
      Texture: texturePalais,
      Finale: finalePalais,
      Observations: observationPalais, // Ajout de l'observation
    };
    const isDifferent = Object.keys(newState).some(
      (key) => newState[key] !== previous[key]
    );

    if (isDifferent) {
      handleInputChange(newState, 'Degustation_Palais');
    }
  }, [
    douceurPalais, aciditePalais, tanninsPalais, alcoolPalais,
    corpsPalais, intensiteSaveurPalais, saveursPrimairesPalais,
    texturePalais, finalePalais, observationPalais, // Ajout de l'observation
    handleInputChange, vin
  ]);
  const limpiditeLabels = enums?.Limpidite || ['Limpide', 'Terne', 'Trouble'];
  const intensiteLabels = enums?.Intensite || ['Pâle', 'Moyenne', 'Intense'];
  const couleurLabels = enums?.Couleur || {
    Blanc: ['Jaune-vert', 'Jaune-Citron', 'Or', 'Ambré', 'Brun'],
    Rosé: ['Rose', 'Saumon', 'Orangé'],
    Rouge: ['Violacé', 'Rubis', 'Grenat', 'Tuilé', 'Brun'],
  };
  const [isClearable, setIsClearable] = useState(true);
  const [isSearchable, setIsSearchable] = useState(true);



  const typeCouleur = vin.Couleur || 'Rouge';
  const couleurOptions = couleurLabels[typeCouleur] || [];

  const hasInitializedPalais = useRef(false); // flag pour empêcher les répétitions
  useEffect(() => {
    if (!hasInitializedPalais.current && vin?.Degustation_Palais) {
      const { Douceur, Acidite, Tannins, Alcool, Corps, IntensiteSaveur, SaveursPrimaires, Texture, Finale, Observations } = vin.Degustation_Palais;
      setDouceurPalais(Douceur || '');
      setAciditePalais(Acidite || '');
      setTanninsPalais(Tannins || '');
      setAlcoolPalais(Alcool || '');
      setCorpsPalais(Corps || '');
      setIntensiteSaveurPalais(IntensiteSaveur || '');
      setSaveursPrimairesPalais(SaveursPrimaires || {});
      setTexturePalais(Texture || '');
      setFinalePalais(Finale || '');
      setObservationPalais(Observations || '');
      hasInitializedPalais.current = true; // on empêche les prochaines exécutions
    }
  }, [vin]);

  useEffect(() => {
    if (vin?.Degustation_Vue) {
      setLimpidite((prev) => prev || vin.Degustation_Vue.Limpidite || '');
      setIntensite((prev) => prev || vin.Degustation_Vue.Intensite || '');
      setCouleur((prev) => prev || vin.Degustation_Vue.Couleur || '');
      setObservationVue((prev) => prev || vin.Degustation_Vue.Observations || '');
    }
  }, [vin]);

  const douceurTranquille = useMemo(() => {
    const douceurTranquilleEnum = enums.find((item) => item.titre === "Douceur Tranquille");
    return douceurTranquilleEnum?.Valeur_Enum?.Valeur.map((val) => ({
      label: val.Libelle,
      value: val.Libelle,
    })) || [];
  }, [enums]);

  const douceurEffervescent = useMemo(() => {
    const douceurEffervescentEnum = enums.find((item) => item.titre === "Douceur Effervescent");
    return douceurEffervescentEnum?.Valeur_Enum?.Valeur.map((val) => ({
      label: val.Libelle,
      value: val.Libelle,
    })) || [];
  }, [enums]);

  const douceurOptions = useMemo(() => {
    if (vin.Type === "Tranquille" || vin.Type === "VDN/VDL (vins mutés/fortifiés)") {
      return douceurTranquille;
    } else if (vin.Type === "Effervescent") {
      return douceurEffervescent;
    }
    return [];
  }, [vin.Type, douceurTranquille, douceurEffervescent]);

  const nezIntensite = useMemo(() => {
    const nezIntensiteEnum = enums.find((item) => item.titre === "Nez intensite");
    return nezIntensiteEnum?.Valeur_Enum?.Valeur.map((val) => ({
      label: val.Libelle,
      value: val.Libelle,
    })) || [];
  }, [enums]);
  const acidite = useMemo(() => {
    const aciditeEnum = enums.find((item) => item.titre === "Acidité");
    return aciditeEnum?.Valeur_Enum?.Valeur.map((val) => ({
      label: val.Libelle,
      value: val.Libelle,
    })) || [];
  }, [enums]);

  const tannins = useMemo(() => {
    const tanninsEnum = enums.find((item) => item.titre === "Tannins");
    return tanninsEnum?.Valeur_Enum?.Valeur.map((val) => ({
      label: val.Libelle,
      value: val.Libelle,
    })) || [];
  }, [enums]);

  const alcool = useMemo(() => {
    const alcoolEnum = enums.find((item) => item.titre === "Alcool");
    return alcoolEnum?.Valeur_Enum?.Valeur.map((val) => ({
      label: val.Libelle,
      value: val.Libelle,
    })) || [];
  }, [enums]);

  const corps = useMemo(() => {
    const corpsEnum = enums.find((item) => item.titre === "Corps");
    return corpsEnum?.Valeur_Enum?.Valeur.map((val) => ({
      label: val.Libelle,
      value: val.Libelle,
    })) || [];
  }, [enums]);

  const saveurPrimaire = useMemo(() => {
    const saveurPrimaireEnum = enums.find((item) => item.titre === "Saveurs primaires");
    return saveurPrimaireEnum?.Valeur_Enum?.Valeur.map((val, index) => {
      const [option1, option2, option3] = val.Libelle.split(' - ');
      return {
        id: index,
        label: val.Libelle,
        options: option3 ? [option1, option2, option3] : [option1, option2]
      };
    }) || [];
  }, [enums]);

  const texture = useMemo(() => {
    const textureEnum = enums.find((item) => item.titre === "Textures");
    return textureEnum?.Valeur_Enum?.Valeur.map((val) => ({
      label: val.Libelle,
      value: val.Libelle,
    })) || [];
  }, [enums]);

  const finale = useMemo(() => {
    const finaleEnum = enums.find((item) => item.titre === "Finale");
    return finaleEnum?.Valeur_Enum?.Valeur.map((val) => ({
      label: val.Libelle,
      value: val.Libelle,
    })) || [];
  }, [enums]);

  const intensiteSaveur = useMemo(() => {
    const intensiteSaveurEnum = enums.find((item) => item.titre === "Intensité des saveurs");
    return intensiteSaveurEnum?.Valeur_Enum?.Valeur.map((val) => ({
      label: val.Libelle,
      value: val.Libelle,
    })) || [];
  }, [enums]);
  const aromesPrimairesMemo = useMemo(() => {
    const aromesPrimairesEnum = enums.find((item) => item.titre === "Arômes Primaires");
    if (!aromesPrimairesEnum?.Valeur_Enum?.Valeur) return [];
    return aromesPrimairesEnum.Valeur_Enum.Valeur.map((category, index) => ({
      id: index,
      label: category.categorie,
      subOptions: category.libelle.map((libelle, subIndex) => ({
        id: `${index}-${subIndex}`,
        label: libelle,
        value: libelle,
        selected: false,
      })),
    }));
  }, [enums]);
  const caractPrimairesMemo = useMemo(() => {
    const caractPrimairesEnum = enums.find((item) => item.titre === "Arômes Primaires");
    if (!caractPrimairesEnum?.Valeur_Enum?.Valeur) return [];
    return caractPrimairesEnum.Valeur_Enum.Valeur.map((category, index) => ({
      id: index,
      label: category.categorie,
      subOptions: category.libelle.map((libelle, subIndex) => ({
        id: `${index}-${subIndex}`,
        label: libelle,
        value: libelle,
        selected: false,
      })),
    }));
  }, [enums]);

  const aromesSecondairesMemo = useMemo(() => {
    const aromesSecondairesEnum = enums.find((item) => item.titre === "Arômes Secondaires");
    if (!aromesSecondairesEnum?.Valeur_Enum?.Valeur) return [];
    return aromesSecondairesEnum.Valeur_Enum.Valeur.map((category, index) => ({
      id: index,
      label: category.categorie,
      subOptions: category.libelle.map((libelle, subIndex) => ({
        id: `${index}-${subIndex}`,
        label: libelle,
        value: libelle,
        selected: false,
      })),
    }));
  }, [enums]);
  const caractSecondairesMemo = useMemo(() => {
    const caractSecondairesEnum = enums.find((item) => item.titre === "Arômes Secondaires");
    if (!caractSecondairesEnum?.Valeur_Enum?.Valeur) return [];
    return caractSecondairesEnum.Valeur_Enum.Valeur.map((category, index) => ({
      id: index,
      label: category.categorie,
      subOptions: category.libelle.map((libelle, subIndex) => ({
        id: `${index}-${subIndex}`,
        label: libelle,
        value: libelle,
        selected: false,
      })),
    }));
  }, [enums]);



  const aromesTertiairesMemo = useMemo(() => {
    const aromesTertiairesEnum = enums.find((item) => item.titre === "Arômes Tertiaires");
    if (!aromesTertiairesEnum?.Valeur_Enum?.Valeur) return [];
    return aromesTertiairesEnum.Valeur_Enum.Valeur.map((category, index) => ({
      id: index,
      label: category.categorie,
      subOptions: category.libelle.map((libelle, subIndex) => ({
        id: `${index}-${subIndex}`,
        label: libelle,
        value: libelle,
        selected: false,
      })),
    }));
  }, [enums]);
  const caractTertiairesMemo = useMemo(() => {
    const caractTertiairesEnum = enums.find((item) => item.titre === "Arômes Tertiaires");
    if (!caractTertiairesEnum?.Valeur_Enum?.Valeur) return [];
    return caractTertiairesEnum.Valeur_Enum.Valeur.map((category, index) => ({
      id: index,
      label: category.categorie,
      subOptions: category.libelle.map((libelle, subIndex) => ({
        id: `${index}-${subIndex}`,
        label: libelle,
        value: libelle,
        selected: false,
      })),
    }));
  }, [enums]);



  useEffect(() => {
    const newAromesPrimairesOptions = aromesPrimairesMemo.map(option => ({
      ...option,
      subOptions: option.subOptions.map(sub => ({
        ...sub,
        selected: vin?.Degustation_Nez?.AromesPrimaires?.includes(sub.label) || false,
      })),
    }));
    const newAromesSecondairesOptions = aromesSecondairesMemo.map(option => ({
      ...option,
      subOptions: option.subOptions.map(sub => ({
        ...sub,
        selected: vin?.Degustation_Nez?.AromesSecondaires?.includes(sub.label) || false,
      })),
    }));
    const newAromesTertiairesOptions = aromesTertiairesMemo.map(option => ({
      ...option,
      subOptions: option.subOptions.map(sub => ({
        ...sub,
        selected: vin?.Degustation_Nez?.AromesTertiaires?.includes(sub.label) || false,
      })),
    }));

    setAromesPrimairesOptions(newAromesPrimairesOptions);
    setAromesSecondairesOptions(newAromesSecondairesOptions);
    setAromesTertiairesOptions(newAromesTertiairesOptions);

    // Initialiser Caractéristiques
    const newCaractPrimairesOptions = caractPrimairesMemo.map(option => ({
      ...option,
      subOptions: option.subOptions.map(sub => ({
        ...sub,
        selected: vin?.Degustation_Palais?.CaracteristiquesPrimaires?.includes(sub.label) || false,
      })),
    }));
    const newCaractSecondairesOptions = caractSecondairesMemo.map(option => ({
      ...option,
      subOptions: option.subOptions.map(sub => ({
        ...sub,
        selected: vin?.Degustation_Palais?.CaracteristiquesSecondaires?.includes(sub.label) || false,
      })),
    }));
    const newCaractTertiairesOptions = caractTertiairesMemo.map(option => ({
      ...option,
      subOptions: option.subOptions.map(sub => ({
        ...sub,
        selected: vin?.Degustation_Palais?.CaracteristiquesTertiaires?.includes(sub.label) || false,
      })),
    }));

    setCaractPrimairesOptions(newCaractPrimairesOptions);
    setCaractSecondairesOptions(newCaractSecondairesOptions);
    setCaractTertiairesOptions(newCaractTertiairesOptions);

    // Conditionnelle : on évite les boucles infinies
    const hasCaracts =
      (vin?.Degustation_Palais?.CaracteristiquesPrimaires?.length || 0) > 0 ||
      (vin?.Degustation_Palais?.CaracteristiquesSecondaires?.length || 0) > 0 ||
      (vin?.Degustation_Palais?.CaracteristiquesTertiaires?.length || 0) > 0;

    const hasAromes =
      (vin?.Degustation_Nez?.AromesPrimaires?.length || 0) > 0 ||
      (vin?.Degustation_Nez?.AromesSecondaires?.length || 0) > 0 ||
      (vin?.Degustation_Nez?.AromesTertiaires?.length || 0) > 0;

    if ((hasAromes || hasCaracts) &&
      (aromesPrimairesMemo.length > 0 || aromesSecondairesMemo.length > 0 || aromesTertiairesMemo.length > 0 ||
        caractPrimairesMemo.length > 0 || caractSecondairesMemo.length > 0 || caractTertiairesMemo.length > 0)) {
      setOptionsInitialized(true);
    } else if (!hasAromes && !hasCaracts) {
      setOptionsInitialized(true);
    }

  }, [
    vin,
    aromesPrimairesMemo, aromesSecondairesMemo, aromesTertiairesMemo,
    caractPrimairesMemo, caractSecondairesMemo, caractTertiairesMemo
  ]);

  useEffect(() => {
    if (!optionsInitialized) return;

    const extractSelectedLabels = (options) =>
      options.flatMap(option =>
        (option.subOptions || []).filter(sub => sub.selected).map(sub => sub.label)
      );

    const hasChanged = (options, original) => {
      const selected = extractSelectedLabels(options);
      return selected.join(',') !== (original || []).join(',');
    };

    const aromesChanged =
      hasChanged(aromesPrimairesOptions, vin?.Degustation_Nez?.AromesPrimaires) ||
      hasChanged(aromesSecondairesOptions, vin?.Degustation_Nez?.AromesSecondaires) ||
      hasChanged(aromesTertiairesOptions, vin?.Degustation_Nez?.AromesTertiaires);

    const caractChanged =
      hasChanged(caractPrimairesOptions, vin?.Degustation_Palais?.CaracteristiquesPrimaires) ||
      hasChanged(caractSecondairesOptions, vin?.Degustation_Palais?.CaracteristiquesSecondaires) ||
      hasChanged(caractTertiairesOptions, vin?.Degustation_Palais?.CaracteristiquesTertiaires);

    if (aromesChanged) {
      handleInputChange(
        {
          ...vin.Degustation_Nez,
          AromesPrimaires: extractSelectedLabels(aromesPrimairesOptions),
          AromesSecondaires: extractSelectedLabels(aromesSecondairesOptions),
          AromesTertiaires: extractSelectedLabels(aromesTertiairesOptions),
        },
        'Degustation_Nez'
      );
    }

    if (caractChanged) {
      handleInputChange(
        {
          ...vin.Degustation_Palais,
          CaracteristiquesPrimaires: extractSelectedLabels(caractPrimairesOptions),
          CaracteristiquesSecondaires: extractSelectedLabels(caractSecondairesOptions),
          CaracteristiquesTertiaires: extractSelectedLabels(caractTertiairesOptions),
        },
        'Degustation_Palais'
      );
    }
  }, [
    aromesPrimairesOptions, aromesSecondairesOptions, aromesTertiairesOptions,
    caractPrimairesOptions, caractSecondairesOptions, caractTertiairesOptions,
    handleInputChange, vin, optionsInitialized
  ]);


  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    `w-full ${isMobile ? 'p-3' : 'p-2'} ${
      darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-black border-gray-300'
    } border ${isMobile ? 'rounded-xl' : 'rounded-md'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
      isMobile ? 'text-base' : 'text-sm'
    }`;

  const getLabelStyles = () =>
    `block font-bold mb-2 text-gray-700 dark:text-gray-300 ${isMobile ? 'text-sm' : 'text-sm'}`;

  const handleAromeChange = useCallback((selectedOption, options, setOptions) => {
    const optionExists = options.some(option =>
      option.subOptions.some(sub => sub.id === selectedOption)
    );

    if (!optionExists) {
      console.warn("Option non trouvée:", selectedOption);
      return;
    }

    setOptions(prevOptions => {
      const updatedOptions = prevOptions.map(option => ({
        ...option,
        subOptions: option.subOptions.map(sub => {
          if (sub.id === selectedOption) {
            const newSelected = !sub.selected;
            return {
              ...sub,
              selected: newSelected,
            };
          }
          return sub;
        }),
      }));

      return updatedOptions;
    });
  }, []);

  const handleSaveurPrimaireChange = (categoryId, selectedOption) => {
    if (!isEditing) return;

    setSaveursPrimairesPalais(prev => ({
      ...prev,
      [categoryId]: selectedOption
    }));
  };

  useEffect(() => {
    if (vin?.Degustation_Palais) {
      setObservationPalais((prev) => (prev === '' ? vin.Degustation_Palais.Observations || '' : prev));
    }
  }, [vin]);

  const legendTemplateOeil = (options) => {
    return (
      <div
        className={`flex ${isMobile ? 'flex-col items-center' : 'items-center gap-2'} w-full p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer transition-all border-b border-gray-200 dark:border-gray-700`}
        onClick={options.onClick}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
            <img
              src="/images/oeil-vert.png"
              alt="Œil"
              className="w-6 h-6 object-cover rounded-full"
            />
          </div>
          <span className={`font-bold text-gray-800 dark:text-gray-200 ${isMobile ? 'text-sm' : 'text-base'}`}>
            L'œil
          </span>
        </div>
        {collapsedOeil && (
          <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 dark:text-gray-400 space-y-1`}>
            <div>Limpidité : <strong>{limpidite || '—'}</strong></div>
            <div>Intensité : <strong>{intensite || '—'}</strong></div>
            <div>Couleur : <strong>{couleur || '—'}</strong></div>
            <div>Observations : <strong>{observationVue ? observationVue.substring(0, 10) + '...' : '—'}</strong></div>
          </div>
        )}
      </div>
    );
  };

  const legendTemplatePalais = (options) => {
    const selectedCaractPrimaires = caractPrimairesOptions
      .flatMap(option => option.subOptions.filter(sub => sub.selected).map(sub => sub.label));
    const selectedCaractSecondaires = caractSecondairesOptions
      .flatMap(option => option.subOptions.filter(sub => sub.selected).map(sub => sub.label));
    const selectedCaractTertiaires = caractTertiairesOptions
      .flatMap(option => option.subOptions.filter(sub => sub.selected).map(sub => sub.label));

    const selectedSaveursPrimaires = Object.values(saveursPrimairesPalais).filter(Boolean);

    return (
      <div
        className={`flex ${isMobile ? 'flex-col items-center' : 'items-center gap-2'} w-full p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer transition-all border-b border-gray-200 dark:border-gray-700`}
        onClick={options.onClick}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
            <img
              src="/images/palais.png"
              alt="Palais"
              className="w-6 h-6 object-cover rounded-full"
            />
          </div>
          <span className={`font-bold text-gray-800 dark:text-gray-200 ${isMobile ? 'text-sm' : 'text-base'}`}>
            Palais
          </span>
        </div>
        {collapsedPalais && (
          <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 dark:text-gray-400 grid ${isMobile ? 'grid-cols-1 gap-1' : 'grid-cols-2 gap-2'}`}>
            <div>Douceur : <strong>{douceurPalais || '—'}</strong></div>
            <div>Acidité : <strong>{aciditePalais || '—'}</strong></div>
            <div>Tannins : <strong>{tanninsPalais || '—'}</strong></div>
            <div>Alcool : <strong>{alcoolPalais || '—'}</strong></div>
            <div>Corps : <strong>{corpsPalais || '—'}</strong></div>
            <div>Texture : <strong>{texturePalais || '—'}</strong></div>
            {selectedCaractPrimaires.length > 0 && (
              <div className={isMobile ? 'col-span-1' : 'col-span-2'}>
                Caract. Primaires : <strong>{selectedCaractPrimaires.slice(0, 2).join(', ')}...</strong>
              </div>
            )}
            {selectedSaveursPrimaires.length > 0 && (
              <div className={isMobile ? 'col-span-1' : 'col-span-2'}>
                Saveurs : <strong>{selectedSaveursPrimaires.slice(0, 2).join(', ')}...</strong>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const legendTemplateNez = (options) => {
    const selectedAromesPrimaires = aromesPrimairesOptions
      .flatMap(option => option.subOptions.filter(sub => sub.selected).map(sub => sub.label));
    const selectedAromesSecondaires = aromesSecondairesOptions
      .flatMap(option => option.subOptions.filter(sub => sub.selected).map(sub => sub.label));
    const selectedAromesTertiaires = aromesTertiairesOptions
      .flatMap(option => option.subOptions.filter(sub => sub.selected).map(sub => sub.label));

    return (
      <div
        className={`flex ${isMobile ? 'flex-col items-center' : 'items-center gap-2'} w-full p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer transition-all border-b border-gray-200 dark:border-gray-700`}
        onClick={options.onClick}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <img
              src="/images/nez-clipart.png"
              alt="Nez"
              className="w-6 h-6 object-cover rounded-full"
            />
          </div>
          <span className={`font-bold text-gray-800 dark:text-gray-200 ${isMobile ? 'text-sm' : 'text-base'}`}>
            Nez
          </span>
        </div>
        {collapsedNez && (
          <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 dark:text-gray-400 space-y-1`}>
            <div>Intensité : <strong>{vin?.Degustation_Nez?.Intensite || '—'}</strong></div>
            {selectedAromesPrimaires.length > 0 && (
              <div>Arômes Primaires : <strong>{selectedAromesPrimaires.slice(0, 2).join(', ')}...</strong></div>
            )}
            {selectedAromesSecondaires.length > 0 && (
              <div>Arômes Secondaires : <strong>{selectedAromesSecondaires.slice(0, 2).join(', ')}...</strong></div>
            )}
            {selectedAromesTertiaires.length > 0 && (
              <div>Arômes Tertiaires : <strong>{selectedAromesTertiaires.slice(0, 2).join(', ')}...</strong></div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) return <div>Chargement des énumérations...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className="min-h-full">
        <TabView
          className={isMobile ? 'mobile-degustation-tabs' : 'desktop-degustation-tabs'}
          panelContainerClassName={`${isMobile ? 'p-4 pb-8' : 'p-6'} min-h-[500px] overflow-auto`}
        >
          <TabPanel header="Header I" headerTemplate={legendTemplateOeil} key="tab1" headerClassName="flex align-items-center border-b">
            {isMobile && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <img src="/images/oeil-vert.png" alt="Œil" className="w-6 h-6 object-cover rounded-full" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Analyse visuelle
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Observez la limpidité, l'intensité et la couleur
                </p>
              </div>
            )}

            <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'}`}>
              <div className="field mb-4">
                <label className={getLabelStyles()}>Limpidité</label>
                <Select
                  isDisabled={!isEditing}
                  styles={getSelectStyles()}
                  classNamePrefix="Limpidite"
                  value={limpidite ? { label: limpidite, value: limpidite } : null}
                  isClearable={isClearable}
                  isSearchable={isSearchable}
                  name="Limpidite"
                  placeholder="Limpidité"
                  options={limpiditeLabels.map((label) => ({ label, value: label }))}
                  onChange={(selectedOption) => setLimpidite(selectedOption?.value || '')}
                  menuPortalTarget={isMobile ? document.body : undefined}
                />
              </div>

              <div className="field mb-4">
                <label className={getLabelStyles()}>Intensité</label>
                <Select
                  isDisabled={!isEditing}
                  styles={getSelectStyles()}
                  classNamePrefix="Intensite"
                  value={intensite ? { label: intensite, value: intensite } : null}
                  isClearable={isClearable}
                  isSearchable={isSearchable}
                  name="Intensite"
                  placeholder="Intensité"
                  options={intensiteLabels.map((label) => ({ label, value: label }))}
                  onChange={(selectedOption) => setIntensite(selectedOption?.value || '')}
                  menuPortalTarget={isMobile ? document.body : undefined}
                />
              </div>

              <div className="field mb-4">
                <label className={getLabelStyles()}>
                  Couleur <span className="text-red-500">({typeCouleur})</span>
                </label>
                <Select
                  isDisabled={!isEditing}
                  styles={getSelectStyles()}
                  classNamePrefix="Couleur"
                  value={couleur ? { label: couleur, value: couleur } : null}
                  isClearable={isClearable}
                  isSearchable={isSearchable}
                  name="Couleur"
                  placeholder="Couleur"
                  options={couleurOptions.map((label) => ({ label, value: label }))}
                  onChange={(selectedOption) => {
                    if (isEditing) {
                      setCouleur(selectedOption?.value || '');
                    }
                  }}
                  menuPortalTarget={isMobile ? document.body : undefined}
                />
              </div>

              <div className={`field mb-4 ${isMobile ? 'col-span-1' : 'col-span-1 lg:col-span-3'}`}>
                <label className={getLabelStyles()}>Observations</label>
                <textarea
                  name="Observations"
                  placeholder="Exemple : viscosité, brillance, dépôt, caractère perlant, bulles, etc."
                  rows={isMobile ? 4 : 3}
                  className={`${getInputStyles()} ${!isEditing ? 'pointer-events-none opacity-50' : ''}`}
                  onChange={(e) => setObservationVue(e.target.value)}
                  value={observationVue}
                  readOnly={!isEditing}
                />
              </div>
            </div>
          </TabPanel>

          <TabPanel headerTemplate={legendTemplateNez} headerClassName="flex align-items-center border-b" key="tab2">
            {isMobile && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <img src="/images/nez-clipart.png" alt="Nez" className="w-6 h-6 object-cover rounded-full" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Analyse olfactive
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Évaluez l'intensité et identifiez les arômes
                </p>
              </div>
            )}

            <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4'}`}>
              <div className="field mb-4">
                <label className={getLabelStyles()}>Nez Intensité</label>
                <Select
                  isDisabled={!isEditing}
                  styles={getSelectStyles()}
                  classNamePrefix="NezIntensite"
                  defaultValue={nezIntensite.find((option) => option.value === vin?.Degustation_Nez?.Intensite) || null}
                  isClearable={isClearable}
                  isSearchable={isSearchable}
                  name="Nez_Intensite"
                  placeholder="Intensité"
                  options={nezIntensite}
                  onChange={(selectedOption) =>
                    handleInputChange(
                      { ...vin.Degustation_Nez, Intensite: selectedOption?.value || '' },
                      'Degustation_Nez'
                    )
                  }
                  menuPortalTarget={isMobile ? document.body : undefined}
                />
              </div>

              <div className="field mb-4">
                <label className={getLabelStyles()}>Arômes Primaires</label>
                <CustomSelect
                  isDisabled={!isEditing}
                  options={aromesPrimairesOptions}
                  value={
                    aromesPrimairesOptions
                      .flatMap(option => option.subOptions.filter(sub => sub.selected).map(sub => sub.label))
                      .join(", ") || "Aucun Arôme Primaires sélectionné"
                  }
                  onChange={(selectedOption) => isEditing && handleAromeChange(selectedOption, aromesPrimairesOptions, setAromesPrimairesOptions)}
                  isNested={true}
                  className={`${getInputStyles()} ${!isEditing ? 'pointer-events-none opacity-50' : ''}`}
                />
              </div>

              <div className="field mb-4">
                <label className={getLabelStyles()}>Arômes Secondaires</label>
                <CustomSelect
                  options={aromesSecondairesOptions}
                  value={
                    aromesSecondairesOptions
                      .flatMap(option => option.subOptions.filter(sub => sub.selected).map(sub => sub.label))
                      .join(", ") || "Aucun Arôme Secondaire sélectionné"
                  }
                  onChange={(selectedOption) => isEditing && handleAromeChange(selectedOption, aromesSecondairesOptions, setAromesSecondairesOptions)}
                  isNested={true}
                  className={`${getInputStyles()} ${!isEditing ? 'pointer-events-none opacity-50' : ''}`}
                />
              </div>

              <div className="field mb-4">
                <label className={getLabelStyles()}>Arômes Tertiaires</label>
                <CustomSelect
                  options={aromesTertiairesOptions}
                  value={
                    aromesTertiairesOptions
                      .flatMap(option => option.subOptions.filter(sub => sub.selected).map(sub => sub.label))
                      .join(", ") || "Aucun Arôme Tertiaire sélectionné"
                  }
                  onChange={(selectedOption) => isEditing && handleAromeChange(selectedOption, aromesTertiairesOptions, setAromesTertiairesOptions)}
                  isNested={true}
                  className={`${getInputStyles()} ${!isEditing ? 'pointer-events-none opacity-50' : ''}`}
                />
              </div>
            </div>
          </TabPanel>

          <TabPanel headerTemplate={legendTemplatePalais} key="tab3" headerClassName="flex align-items-center border-b">
            {isMobile && (
              <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <img src="/images/palais.png" alt="Palais" className="w-6 h-6 object-cover rounded-full" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Analyse gustative
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Évaluez la structure et les saveurs en bouche
                </p>
              </div>
            )}

            <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'}`}>
              <div className='w-full'>
                <label className={getLabelStyles()}>
                  Douceur <span className="text-red-500">({vin.Type})</span>
                </label>
                <Select
                  isDisabled={!isEditing}
                  styles={getSelectStyles()}
                  classNamePrefix="Douceur"
                  defaultValue={douceurOptions.find((option) => option.value === vin?.Douceur) || null}
                  isClearable={isClearable}
                  isSearchable={isSearchable}
                  name="Douceur"
                  placeholder="Sélectionnez une douceur"
                  options={douceurOptions}
                  menuPortalTarget={isMobile ? document.body : undefined}
                  onChange={(selectedOption) => setDouceurPalais(selectedOption?.value || '')}
                />
              </div>

              {[
                { label: 'Acidité', value: aciditePalais, options: acidite, setter: setAciditePalais },
                { label: 'Tannins', value: tanninsPalais, options: tannins, setter: setTanninsPalais },
                { label: 'Alcool', value: alcoolPalais, options: alcool, setter: setAlcoolPalais },
                { label: 'Corps', value: corpsPalais, options: corps, setter: setCorpsPalais },
                { label: 'Intensité des saveurs', value: intensiteSaveurPalais, options: intensiteSaveur, setter: setIntensiteSaveurPalais },
              ].map(({ label, value, options, setter }, idx) => (
                <div className="field mb-4" key={idx}>
                  <label className={getLabelStyles()}>{label}</label>
                  <Select
                    isDisabled={!isEditing}
                    styles={getSelectStyles()}
                    classNamePrefix={label}
                    defaultValue={options.find((option) => option.value === value) || null}
                    isClearable={isClearable}
                    isSearchable={isSearchable}
                    name={label}
                    placeholder={label}
                    options={options}
                    menuPortalTarget={isMobile ? document.body : undefined}
                    onChange={(selectedOption) => setter(selectedOption?.value || '')}
                  />
                </div>
              ))}

              <h1 className={`text-center font-semibold border-t p-2 ${isMobile ? 'col-span-1 text-base' : 'col-span-1 sm:col-span-2 lg:col-span-3 text-sm sm:text-base lg:text-base'} text-gray-700 dark:text-gray-300`}>
                Caractéristiques des saveurs
              </h1>

              <div className="field mb-4">
                <label className={getLabelStyles()}>Caractéristiques Primaires</label>
                <CustomSelect
                  options={caractPrimairesOptions}
                  value={
                    caractPrimairesOptions
                      .flatMap(option => option.subOptions.filter(sub => sub.selected).map(sub => sub.label))
                      .join(", ") || "Aucun caractéristique Primaires"
                  }
                  onChange={(selectedOption) => isEditing && handleAromeChange(selectedOption, caractPrimairesOptions, setCaractPrimairesOptions)}
                  isNested={true}
                  className={`${getInputStyles()} ${!isEditing ? 'pointer-events-none opacity-50' : ''}`}
                />
              </div>

              <div className="field mb-4">
                <label className={getLabelStyles()}>Caractéristiques Secondaires</label>
                <CustomSelect
                  options={caractSecondairesOptions}
                  value={
                    caractSecondairesOptions
                      .flatMap(option => option.subOptions.filter(sub => sub.selected).map(sub => sub.label))
                      .join(", ") || "Aucun caractéristique Secondaire"
                  }
                  onChange={(selectedOption) => isEditing && handleAromeChange(selectedOption, caractSecondairesOptions, setCaractSecondairesOptions)}
                  isNested={true}
                  className={`${getInputStyles()} ${!isEditing ? 'pointer-events-none opacity-50' : ''}`}
                />
              </div>

              <div className={`field mb-4 ${isMobile ? 'col-span-1' : 'sm:col-span-2 lg:col-span-1'}`}>
                <label className={getLabelStyles()}>Caractéristiques Tertiaires</label>
                <CustomSelect
                  options={caractTertiairesOptions}
                  value={
                    caractTertiairesOptions
                      .flatMap(option => option.subOptions.filter(sub => sub.selected).map(sub => sub.label))
                      .join(", ") || "Aucun caractéristique Tertiaire"
                  }
                  onChange={(selectedOption) => isEditing && handleAromeChange(selectedOption, caractTertiairesOptions, setCaractTertiairesOptions)}
                  isNested={true}
                  className={`${getInputStyles()} ${!isEditing ? 'pointer-events-none opacity-50' : ''}`}
                />
              </div>

              <label className={`block font-semibold mt-2 border-t p-2 border-gray-400 text-gray-700 dark:text-gray-300 ${isMobile ? 'col-span-1 text-sm' : 'col-span-1 sm:col-span-2 lg:col-span-3 text-sm'}`}>
                Les saveurs primaires sont :
              </label>

              <div className={`field mb-4 border-b pb-2 border-gray-400 ${isMobile ? 'col-span-1' : 'col-span-1 sm:col-span-2 lg:col-span-3'}`}>
                <div className={`space-y-3 grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-4 lg:gap-4'}`}>
                  {saveurPrimaire.map((category) => (
                    <div key={category.id} className="border border-gray-300 dark:border-gray-600 rounded-lg p-3">
                      <h3 className={`font-semibold mb-2 text-gray-700 dark:text-gray-300 ${isMobile ? 'text-sm' : 'text-sm'}`}>{category.label} :</h3>
                      <div className="flex flex-wrap gap-2">
                        {category.options.map((option, optionIndex) => (
                          <label
                            key={optionIndex}
                            className={`flex items-center space-x-2 px-3 py-2 rounded-md border cursor-pointer transition-all ${saveursPrimairesPalais[category.id] === option
                                ? 'bg-blue-100 dark:bg-blue-900 border-blue-500 dark:border-blue-400'
                                : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                              } ${!isEditing ? 'pointer-events-none opacity-50' : ''}`}
                          >
                            <input
                              type="radio"
                              name={`saveur_${category.id}`}
                              value={option}
                              checked={saveursPrimairesPalais[category.id] === option}
                              onChange={() => handleSaveurPrimaireChange(category.id, option)}
                              disabled={!isEditing}
                              className="sr-only"
                            />
                            <span className={`text-gray-700 dark:text-gray-300 ${isMobile ? 'text-sm' : 'text-sm'}`}>
                              {option}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`field mb-4 mt-4 ${isMobile ? 'col-span-1' : 'col-span-1 sm:col-span-2 lg:col-span-3'}`}>
                <label className={getLabelStyles()}>Observations</label>
                <textarea
                  name="Observations"
                  placeholder="Exemple : sensations en bouche, astringence, amertume, etc."
                  rows={isMobile ? 4 : 3}
                  className={`${getInputStyles()} ${!isEditing ? 'pointer-events-none opacity-50' : ''}`}
                  onChange={(e) => setObservationPalais(e.target.value)}
                  value={observationPalais}
                  readOnly={!isEditing}
                />
              </div>

              {[
                { label: 'Texture', value: texturePalais, options: texture, setter: setTexturePalais },
                { label: 'Finale', value: finalePalais, options: finale, setter: setFinalePalais },
              ].map(({ label, value, options, setter }, idx) => (
                <div className="field mb-4" key={idx}>
                  <label className={getLabelStyles()}>{label}</label>
                  <Select
                    isDisabled={!isEditing}
                    styles={getSelectStyles()}
                    classNamePrefix={label}
                    defaultValue={options.find((option) => option.value === value) || null}
                    isClearable={isClearable}
                    isSearchable={isSearchable}
                    name={label}
                    placeholder={label}
                    options={options}
                    menuPortalTarget={isMobile ? document.body : undefined}
                    onChange={(selectedOption) => setter(selectedOption?.value || '')}
                  />
                </div>
              ))}
            </div>
          </TabPanel>
        </TabView>
      </div>
    </div>
  );
};

export default VinDegustation;
