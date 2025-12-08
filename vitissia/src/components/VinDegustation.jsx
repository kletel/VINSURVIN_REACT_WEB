// VinDegustation.jsx
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
    const [activeInnerIndex, setActiveInnerIndex] = useState(0);

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
    const [observationPalais, setObservationPalais] = useState('');

    const [optionsInitialized, setOptionsInitialized] = useState(false);

    useEffect(() => {
        fetchEnums();
    }, [fetchEnums]);

    useEffect(() => {
        const limpiditeText = limpidite;
        const intensiteText = intensite;
        const couleurText = couleur;
        if (
            vin?.Degustation_Vue &&
            (
                vin.Degustation_Vue.Limpidite !== limpiditeText ||
                vin.Degustation_Vue.Intensite !== intensiteText ||
                vin.Degustation_Vue.Couleur !== couleurText ||
                vin.Degustation_Vue.Observations !== observationVue
            )
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
            Observations: observationPalais,
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
        texturePalais, finalePalais, observationPalais,
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

    const hasInitializedPalais = useRef(false);
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
            hasInitializedPalais.current = true;
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
            backgroundColor: darkMode ? '#111827' : '#ffffff',
            borderColor: darkMode ? '#374151' : '#d1d5db',
            borderRadius: isMobile ? '12px' : '10px',
            boxShadow: state.isFocused ? '0 0 0 1px #f0cd7b' : 'none',
            fontSize: isMobile ? '14px' : '15px',
        }),
        singleValue: (baseStyles) => ({
            ...baseStyles,
            color: darkMode ? '#f9fafb' : '#111827',
        }),
        menu: (baseStyles) => ({
            ...baseStyles,
            backgroundColor: darkMode ? '#020617' : '#ffffff',
            borderRadius: isMobile ? '12px' : '10px',
            zIndex: 9999,
        }),
        option: (baseStyles, state) => ({
            ...baseStyles,
            backgroundColor: state.isFocused
                ? (darkMode ? 'rgba(148,163,184,0.25)' : '#f3f4f6')
                : 'transparent',
            color: darkMode ? '#f9fafb' : '#111827',
            fontSize: isMobile ? '14px' : '15px',
        }),
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    });

    const getInputStyles = () =>
        `w-full ${isMobile ? 'p-3' : 'px-3 py-2'} 
         ${darkMode ? 'bg-gray-900/80 text-gray-100 border-gray-700' : 'bg-white text-gray-900 border-gray-300'}
         border ${isMobile ? 'rounded-xl' : 'rounded-lg'}
         focus:outline-none focus:ring-2 focus:ring-[#f0cd7b] focus:border-[#f0cd7b]
         ${isMobile ? 'text-sm' : 'text-sm'} resize-none`;

    const getLabelStyles = () =>
        `block font-semibold mb-2 text-gray-200 ${isMobile ? 'text-sm' : 'text-xs uppercase tracking-wide'}`;

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

    // === HEADERS TABS DÉGUSTATION (ŒIL / NEZ / PALAIS) ===

    const legendTemplateOeil = (options) => {
        const isActive = options.selected;

        return (
            <button
                type="button"
                className={`${options.className} !border-0 !bg-transparent w-full`}
                onClick={options.onClick}
            >
                <div
                    className={`
                    flex flex-col items-center justify-between
                    w-full h-full
                    min-h-[110px] sm:min-h-[120px]
                    px-3 py-2 rounded-xl
                    transition-all duration-200
                    ${isActive
                            ? 'bg-white/5 shadow-[0_8px_28px_rgba(0,0,0,0.85)] border border-white/20'
                            : 'bg-transparent opacity-75 hover:opacity-100 hover:bg-white/5 hover:-translate-y-0.5'}
                `}
                >
                    <span className={`
                        font-semibold text-center
                        ${isMobile ? 'text-xs' : 'text-sm'}
                        ${isActive ? 'text-[#f0cd7b]' : 'text-gray-100'}
                    `}>
                        L&apos;ŒIL
                    </span>
                    <div className="mt-1 text-[10px] sm:text-[11px] text-gray-300 text-center space-y-0.5">
                        <div>Limpidité : <span className="font-semibold text-gray-100">{limpidite || '—'}</span></div>
                        <div>Intensité : <span className="font-semibold text-gray-100">{intensite || '—'}</span></div>
                        <div>Couleur : <span className="font-semibold text-gray-100">{couleur || '—'}</span></div>
                    </div>
                </div>
            </button>
        );
    };

    const legendTemplateNez = (options) => {
        const isActive = options.selected;

        const selectedAromesPrimaires = aromesPrimairesOptions
            .flatMap(option => option.subOptions.filter(sub => sub.selected).map(sub => sub.label));
        const selectedAromesSecondaires = aromesSecondairesOptions
            .flatMap(option => option.subOptions.filter(sub => sub.selected).map(sub => sub.label));
        const selectedAromesTertiaires = aromesTertiairesOptions
            .flatMap(option => option.subOptions.filter(sub => sub.selected).map(sub => sub.label));

        return (
            <button
                type="button"
                className={`${options.className} !border-0 !bg-transparent w-full`}
                onClick={options.onClick}
            >
                <div
                    className={`
        flex flex-col items-center justify-between
        w-full h-full
        min-h-[110px] sm:min-h-[120px]
        px-3 py-2 rounded-xl
        transition-all duration-200
        ${isActive
                            ? 'bg-white/5 shadow-[0_8px_28px_rgba(0,0,0,0.85)] border border-white/20'
                            : 'bg-transparent opacity-75 hover:opacity-100 hover:bg-white/5 hover:-translate-y-0.5'}
    `}
                >

                    <span className={`
                        font-semibold text-center
                        ${isMobile ? 'text-xs' : 'text-sm'}
                        ${isActive ? 'text-[#f0cd7b]' : 'text-gray-100'}
                    `}>
                        NEZ
                    </span>
                    <div className="mt-1 text-[10px] sm:text-[11px] text-gray-300 text-center space-y-0.5">
                        <div>Intensité : <span className="font-semibold text-gray-100">{vin?.Degustation_Nez?.Intensite || '—'}</span></div>
                        {selectedAromesPrimaires.length > 0 && (
                            <div>Arômes 1. : <span className="font-semibold text-gray-100">{selectedAromesPrimaires.slice(0, 2).join(', ')}{selectedAromesPrimaires.length > 2 ? '…' : ''}</span></div>
                        )}
                        {selectedAromesSecondaires.length > 0 && (
                            <div>Arômes 2. : <span className="font-semibold text-gray-100">{selectedAromesSecondaires.slice(0, 2).join(', ')}{selectedAromesSecondaires.length > 2 ? '…' : ''}</span></div>
                        )}
                        {selectedAromesTertiaires.length > 0 && (
                            <div>Arômes 3. : <span className="font-semibold text-gray-100">{selectedAromesTertiaires.slice(0, 2).join(', ')}{selectedAromesTertiaires.length > 2 ? '…' : ''}</span></div>
                        )}
                    </div>
                </div>
            </button>
        );
    };

    const legendTemplatePalais = (options) => {
        const isActive = options.selected;

        const selectedCaractPrimaires = caractPrimairesOptions
            .flatMap(option => option.subOptions.filter(sub => sub.selected).map(sub => sub.label));
        const selectedSaveursPrimaires = Object.values(saveursPrimairesPalais).filter(Boolean);

        return (
            <button
                type="button"
                className={`${options.className} !border-0 !bg-transparent w-full`}
                onClick={options.onClick}
            >
                <div
                    className={`
        flex flex-col items-center justify-between
        w-full h-full
        min-h-[110px] sm:min-h-[120px]
        px-3 py-2 rounded-xl
        transition-all duration-200
        ${isActive
                            ? 'bg-white/5 shadow-[0_8px_28px_rgba(0,0,0,0.85)] border border-white/20'
                            : 'bg-transparent opacity-75 hover:opacity-100 hover:bg-white/5 hover:-translate-y-0.5'}
    `}
                >

                    <span className={`
                        font-semibold text-center
                        ${isMobile ? 'text-xs' : 'text-sm'}
                        ${isActive ? 'text-[#f0cd7b]' : 'text-gray-100'}
                    `}>
                        PALAIS
                    </span>
                    <div className="mt-1 text-[10px] sm:text-[11px] text-gray-300 text-center space-y-0.5">
                        <div>Douceur : <span className="font-semibold text-gray-100">{douceurPalais || '—'}</span></div>
                        <div>Acidité : <span className="font-semibold text-gray-100">{aciditePalais || '—'}</span></div>
                        {selectedCaractPrimaires.length > 0 && (
                            <div>Caract. : <span className="font-semibold text-gray-100">{selectedCaractPrimaires.slice(0, 2).join(', ')}{selectedCaractPrimaires.length > 2 ? '…' : ''}</span></div>
                        )}
                        {selectedSaveursPrimaires.length > 0 && (
                            <div>Saveurs : <span className="font-semibold text-gray-100">{selectedSaveursPrimaires.slice(0, 2).join(', ')}{selectedSaveursPrimaires.length > 2 ? '…' : ''}</span></div>
                        )}
                    </div>
                </div>
            </button>
        );
    };

    if (loading) return <div className="text-gray-200 text-sm">Chargement des énumérations...</div>;
    if (error) return <div className="text-red-400 text-sm">Erreur: {error}</div>;

    return (
        <div className="w-full">
            <div className="bg-gray-950/60 rounded-2xl border border-gray-800 shadow-[0_22px_60px_rgba(0,0,0,0.85)] p-3 sm:p-4 lg:p-6">
                <TabView
                    className={`custom-tabview ${isMobile ? 'mobile-degustation-tabs' : 'desktop-degustation-tabs'}`}
                    activeIndex={activeInnerIndex}
                    onTabChange={(e) => setActiveInnerIndex(e.index)}
                    panelContainerClassName={`
                        ${isMobile ? 'p-4 pt-5' : 'p-6 pt-6'}
                        bg-gray-950/60
                        min-h-[360px] overflow-auto
                    `}
                >
                    {/* ŒIL */}
                    <TabPanel
                        headerTemplate={legendTemplateOeil}
                        key="tab1"
                        headerClassName="flex align-items-center"
                    >
                        <div className="p-4 sm:p-5 mb-4">
                            <div className="flex flex-col items-center text-center gap-2 mb-3">
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-100 tracking-wide">
                                    Analyse visuelle
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-300 max-w-lg">
                                    Observez la limpidité, l&apos;intensité et la couleur pour apprécier l&apos;état du vin.
                                </p>
                            </div>

                            <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'}`}>
                                <div className="field">
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

                                <div className="field">
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

                                <div className="field">
                                    <label className={getLabelStyles()}>
                                        Couleur <span className="text-red-400">({typeCouleur})</span>
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

                                <div className={`field ${isMobile ? 'col-span-1' : 'col-span-1 sm:col-span-2 lg:col-span-3'}`}>
                                    <label className={getLabelStyles()}>Observations</label>
                                    <textarea
                                        name="Observations"
                                        placeholder="Exemple : viscosité, brillance, dépôt, bulles, caractère perlant..."
                                        rows={isMobile ? 4 : 3}
                                        className={`${getInputStyles()} ${!isEditing ? 'pointer-events-none opacity-50' : ''}`}
                                        onChange={(e) => setObservationVue(e.target.value)}
                                        value={observationVue}
                                        readOnly={!isEditing}
                                    />
                                </div>
                            </div>
                        </div>
                    </TabPanel>

                    {/* NEZ */}
                    <TabPanel
                        headerTemplate={legendTemplateNez}
                        key="tab2"
                        headerClassName="flex align-items-center"
                    >
                        <div className="p-4 sm:p-5 mb-4">
                            <div className="flex flex-col items-center text-center gap-2 mb-3">
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-100 tracking-wide">
                                    Analyse olfactive
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-300 max-w-lg">
                                    Évaluez l&apos;intensité du nez, ainsi que les arômes primaires, secondaires et tertiaires.
                                </p>
                            </div>

                            <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-2 gap-5'}`}>
                                <div className="field">
                                    <label className={getLabelStyles()}>Intensité du nez</label>
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

                                <div className="field">
                                    <label className={getLabelStyles()}>Arômes primaires</label>
                                    <CustomSelect
                                        options={aromesPrimairesOptions}
                                        value={
                                            aromesPrimairesOptions
                                                .flatMap(option => option.subOptions.filter(sub => sub.selected).map(sub => sub.label))
                                                .join(", ") || "Aucun arôme primaire sélectionné"
                                        }
                                        onChange={(selectedOption) =>
                                            isEditing && handleAromeChange(selectedOption, aromesPrimairesOptions, setAromesPrimairesOptions)
                                        }
                                        isNested={true}
                                        className={`${!isEditing ? "pointer-events-none opacity-50" : "w-full"}`}
                                    />
                                </div>

                                <div className="field">
                                    <label className={getLabelStyles()}>Arômes secondaires</label>
                                    <CustomSelect
                                        options={aromesSecondairesOptions}
                                        value={
                                            aromesSecondairesOptions
                                                .flatMap(option => option.subOptions.filter(sub => sub.selected).map(sub => sub.label))
                                                .join(", ") || "Aucun arôme secondaire sélectionné"
                                        }
                                        onChange={(selectedOption) => isEditing && handleAromeChange(selectedOption, aromesSecondairesOptions, setAromesSecondairesOptions)}
                                        isNested={true}
                                        className={`${getInputStyles()} ${!isEditing ? 'pointer-events-none opacity-50' : ''}`}
                                    />
                                </div>

                                <div className="field">
                                    <label className={getLabelStyles()}>Arômes tertiaires</label>
                                    <CustomSelect
                                        options={aromesTertiairesOptions}
                                        value={
                                            aromesTertiairesOptions
                                                .flatMap(option => option.subOptions.filter(sub => sub.selected).map(sub => sub.label))
                                                .join(", ") || "Aucun arôme tertiaire sélectionné"
                                        }
                                        onChange={(selectedOption) => isEditing && handleAromeChange(selectedOption, aromesTertiairesOptions, setAromesTertiairesOptions)}
                                        isNested={true}
                                        className={`${getInputStyles()} ${!isEditing ? 'pointer-events-none opacity-50' : ''}`}
                                    />
                                </div>
                            </div>
                        </div>
                    </TabPanel>

                    {/* PALAIS */}
                    <TabPanel
                        headerTemplate={legendTemplatePalais}
                        key="tab3"
                        headerClassName="flex align-items-center"
                    >
                        <div className="p-4 sm:p-5 mb-4">
                            <div className="flex flex-col items-center text-center gap-2 mb-3">
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-100 tracking-wide">
                                    Analyse gustative
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
                                    Analysez la structure en bouche : douceur, acidité, tannins, alcool, texture, finale et caractéristiques des saveurs.
                                </p>
                            </div>

                            <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'}`}>
                                <div className='w-full'>
                                    <label className={getLabelStyles()}>
                                        Douceur <span className="text-red-400">({vin.Type})</span>
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
                                    <div className="field" key={idx}>
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

                                <h1 className={`
                                    text-center font-semibold border-t border-gray-700 pt-3 mt-1
                                    text-gray-200
                                    ${isMobile ? 'col-span-1 text-sm' : 'col-span-1 sm:col-span-2 lg:col-span-3 text-sm'}
                                `}>
                                    Caractéristiques des saveurs
                                </h1>

                                <div className="field">
                                    <label className={getLabelStyles()}>Caractéristiques primaires</label>
                                    <CustomSelect
                                        options={caractPrimairesOptions}
                                        value={
                                            caractPrimairesOptions
                                                .flatMap(option => option.subOptions.filter(sub => sub.selected).map(sub => sub.label))
                                                .join(", ") || "Aucune caractéristique primaire"
                                        }
                                        onChange={(selectedOption) => isEditing && handleAromeChange(selectedOption, caractPrimairesOptions, setCaractPrimairesOptions)}
                                        isNested={true}
                                        className={`${getInputStyles()} ${!isEditing ? 'pointer-events-none opacity-50' : ''}`}
                                    />
                                </div>

                                <div className="field">
                                    <label className={getLabelStyles()}>Caractéristiques secondaires</label>
                                    <CustomSelect
                                        options={caractSecondairesOptions}
                                        value={
                                            caractSecondairesOptions
                                                .flatMap(option => option.subOptions.filter(sub => sub.selected).map(sub => sub.label))
                                                .join(", ") || "Aucune caractéristique secondaire"
                                        }
                                        onChange={(selectedOption) => isEditing && handleAromeChange(selectedOption, caractSecondairesOptions, setCaractSecondairesOptions)}
                                        isNested={true}
                                        className={`${getInputStyles()} ${!isEditing ? 'pointer-events-none opacity-50' : ''}`}
                                    />
                                </div>

                                <div className={`field ${isMobile ? 'col-span-1' : 'sm:col-span-2 lg:col-span-1'}`}>
                                    <label className={getLabelStyles()}>Caractéristiques tertiaires</label>
                                    <CustomSelect
                                        options={caractTertiairesOptions}
                                        value={
                                            caractTertiairesOptions
                                                .flatMap(option => option.subOptions.filter(sub => sub.selected).map(sub => sub.label))
                                                .join(", ") || "Aucune caractéristique tertiaire"
                                        }
                                        onChange={(selectedOption) => isEditing && handleAromeChange(selectedOption, caractTertiairesOptions, setCaractTertiairesOptions)}
                                        isNested={true}
                                        className={`${getInputStyles()} ${!isEditing ? 'pointer-events-none opacity-50' : ''}`}
                                    />
                                </div>

                                <label className={`
                                    block font-semibold mt-2 border-t border-gray-700 pt-3 text-gray-200
                                    ${isMobile ? 'col-span-1 text-xs' : 'col-span-1 sm:col-span-2 lg:col-span-3 text-xs'}
                                `}>
                                    Les saveurs primaires sont :
                                </label>

                                <div className={`
                                    field border-b pb-3 border-gray-700
                                    ${isMobile ? 'col-span-1' : 'col-span-1 sm:col-span-2 lg:col-span-3'}
                                `}>
                                    <div className={`
                                        grid
                                        ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4'}
                                    `}>
                                        {saveurPrimaire.map((category) => (
                                            <div key={category.id} className="border border-gray-700 rounded-lg p-3 bg-gray-900/60">
                                                <h3 className={`font-semibold mb-2 text-gray-200 ${isMobile ? 'text-xs' : 'text-sm'}`}>{category.label} :</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {category.options.map((option, optionIndex) => (
                                                        <label
                                                            key={optionIndex}
                                                            className={`
                                                                flex items-center space-x-2 px-3 py-2 rounded-md border cursor-pointer transition-all
                                                                ${saveursPrimairesPalais[category.id] === option
                                                                    ? 'bg-emerald-900/60 border-emerald-400'
                                                                    : 'bg-gray-900/40 border-gray-600 hover:bg-gray-800'}
                                                                ${!isEditing ? 'pointer-events-none opacity-50' : ''}
                                                            `}
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
                                                            <span className="text-gray-200 text-xs sm:text-sm">
                                                                {option}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className={`
                                    field mt-4
                                    ${isMobile ? 'col-span-1' : 'col-span-1 sm:col-span-2 lg:col-span-3'}
                                `}>
                                    <label className={getLabelStyles()}>Observations en bouche</label>
                                    <textarea
                                        name="Observations"
                                        placeholder="Exemple : sensations en bouche, astringence, amertume, équilibre, harmonie..."
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
                                    <div className="field" key={idx}>
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
                        </div>
                    </TabPanel>
                </TabView>
            </div>
        </div>
    );
};

export default VinDegustation;