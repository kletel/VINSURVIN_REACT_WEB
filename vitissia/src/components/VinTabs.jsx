import React, { useMemo, useEffect, useState, useContext, useRef } from 'react';
import useFetchEnums from '../hooks/useFetchEnums';
import { motion } from 'framer-motion';
import Select from 'react-select';
import { TabView, TabPanel } from 'primereact/tabview';
import '../styles/VinTabs.css';
import VinDegustation from '../components/VinDegustation';
import { ThemeContext } from '../context/ThemeContext';
import authHeader from '../config/authHeader';
import config from '../config/config';
import useFetchRegions from '../hooks/useFetchRegions';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import PlacesAutocomplete, { geocodeByAddress } from 'react-places-autocomplete';


const VinTabs = ({ vin, setVin, isEditing, handleInputChange }) => {
    const { enums, fetchEnums } = useFetchEnums();
    const { darkMode } = useContext(ThemeContext);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const toast = useRef(null);
    const UUIDuser = sessionStorage.getItem('uuid_user');
    const MotionDiv = motion.div;

    const [elevage, setElevage] = useState(vin?.Elevage || '');
    const [contenant, setContenant] = useState(vin?.Flacon || '');
    const [lieuAchat, setLieuAchat] = useState(vin?.Lieu_Achat || '');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showPlacementDialog, setShowPlacementDialog] = useState(false);

    const [addressQuery, setAddressQuery] = useState('');
    const [addressSuggestions, setAddressSuggestions] = useState([]);
    const [isAddressLoading, setIsAddressLoading] = useState(false);
    const [hasUserTypedAddress, setHasUserTypedAddress] = useState(false);

    const [emailError, setEmailError] = useState('');
    const [producerErrors, setProducerErrors] = useState({
        phone: '',
        email: '',
    });

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
    ];

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
    }, []);

    useEffect(() => {
        fetchEnums();
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
            backgroundColor: 'rgba(15,23,42,0.85)',
            borderColor: 'rgba(148,163,184,0.5)',
            borderRadius: isMobile ? '12px' : '10px',
            boxShadow: state.isFocused ? '0 0 0 1px rgba(255,255,255,0.4)' : 'none',
            fontSize: isMobile ? '14px' : '15px',
        }),
        singleValue: (baseStyles) => ({
            ...baseStyles,
            color: '#f9fafb',
        }),
        menu: (baseStyles) => ({
            ...baseStyles,
            backgroundColor: '#020617',
            borderRadius: isMobile ? '12px' : '10px',
            zIndex: 9999,
        }),
        option: (baseStyles, state) => ({
            ...baseStyles,
            backgroundColor: state.isFocused ? 'rgba(148,163,184,0.25)' : 'transparent',
            color: '#f9fafb',
            fontSize: isMobile ? '14px' : '15px',
        }),
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    });

    const getInputStyles = () =>
        `w-full ${isMobile ? 'p-3' : 'px-2 py-2'} bg-gray-900/70 text-white border border-white/20
         ${isMobile ? 'rounded-xl' : 'rounded-lg'} focus:outline-none focus:ring-2 focus:ring-white/60
         ${isMobile ? 'text-base' : 'text-sm'}`;

    const handleRegionValidation = async (regionIA, paysIA) => {
        const regionTrouvee = optionsRegions.find((region) =>
            region.label.toLowerCase().includes(regionIA.toLowerCase())
        );

        if (!regionTrouvee) {
            try {
                const newRegion = await ajouterRegionIA(paysIA, regionIA);

                await fetchRegions();

                const updatedOptionsRegions = regions.map((region) => ({
                    label: region.Nom_Fr,
                    value: region.Ref_Pays,
                }));

                const updatedRegion = updatedOptionsRegions.find((region) =>
                    region.label.toLowerCase().includes(regionIA.toLowerCase())
                );

                if (updatedRegion) {
                    setFilteredRegions([updatedRegion]);
                    setErrorRegion("");
                }
            } catch (error) {
                console.error(error)
            }
        }
    };

    const traiterAnalyseIA = (jsonAtraite) => {
        const keysExclues = [
            "nom", "region", "pays", "appellation", "millesime", "type_de_vin",
            "APOGEE", "taux_d_alcool", "prix_moyen", "cepages"
        ];

        const remarques = Object.entries(jsonAtraite)
            .filter(([key]) => !keysExclues.includes(key))
            .map(([key, value]) => {
                if (key === "producteur") {
                    return `producteur : ${jsonAtraite.domaine || "NC"}`;
                }
                return `${key.replace(/_/g, " ")} : ${value}`;
            })
            .join(", ");

        const updatedRemarques = remarques
            .replace(/région/g, "Région")
            .replace(/null/g, "NC")
            .replace(/cépages/g, "cépage(s)");

        const regionIA = jsonAtraite.région || jsonAtraite.region || "";
        const paysIA = jsonAtraite.pays || "";

        const regionNormalisee = regionIA === "Bordeaux" ? "Bordelais" : regionIA;

        handleRegionValidation(regionNormalisee, paysIA);

        const regionTrouvee = optionsRegions.find((region) =>
            region.label.toLowerCase().includes(regionNormalisee.toLowerCase())
        );
        if (regionTrouvee) {
            setFilteredRegions([regionTrouvee]);
            setErrorRegion("");
        } else {
            setErrorRegion(`Région non trouvée : ${regionNormalisee}`);
        }

        const couleurIA = jsonAtraite.couleur || "";
        const couleurTrouvee = optionCouleur.find((couleur) =>
            couleur.label.toLowerCase() === couleurIA.toLowerCase()
        );
        if (couleurTrouvee) {
            setErrorCouleur("");
        } else {
            setErrorCouleur(`Couleur non trouvée : ${couleurIA}`);
        }

        const typeIA = jsonAtraite.type_de_vin || jsonAtraite.type || "";
        const typeTrouve = typeIA.toLowerCase() === "vin tranquille"
            ? optionTypeVin.find((option) => option.label.toLowerCase() === "tranquille")
            : optionTypeVin.find((option) => option.label.toLowerCase() === typeIA.toLowerCase());

        setVin((prevVin) => ({
            ...prevVin,
            Association_Mets: jsonAtraite.degustation,
            Domaine: jsonAtraite.domaine || jsonAtraite.nom_domaine || "",
            Producteur: jsonAtraite.producteur?.nom || "",
            Nom: jsonAtraite.nom ?? "",
            Douceur: jsonAtraite.douceur ?? "",
            Sous_Region: jsonAtraite.sous_region || jsonAtraite.sous_région || "",
            Producteur_Adresse: jsonAtraite.producteur?.adresse || "",
            Région: regionTrouvee ? regionTrouvee.label : regionNormalisee,
            Couleur: couleurTrouvee ? couleurTrouvee.label : couleurIA,
            Pays: jsonAtraite.pays ?? "",
            Appellation: jsonAtraite.appellation ?? "",
            Millesime: jsonAtraite.millesime || jsonAtraite["millésime"] || "",
            Type: typeTrouve ? typeTrouve.label : typeIA,
            Apogee: jsonAtraite.APOGEE ? jsonAtraite.APOGEE.split("-")[0] : "",
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
                    const matchRange = prixStr.match(/(\d+(?:[\.,]\d+)?)\s*[-–]\s*(\d+(?:[\.,]\d+)?)/);
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
                    const matchRange = prixStr.match(/(\d+(?:[\.,]\d+)?)\s*[-–]\s*(\d+(?:[\.,]\d+)?)/);
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
                    const matchRange = prixStr.match(/(\d+(?:[\.,]\d+)?)\s*[-–]\s*(\d+(?:[\.,]\d+)?)/);
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
            RemarquesIA: updatedRemarques,
            Reste_en_Cave: 1,
        }));

    };

    const isValidEmail = (email) => {
        if (!email) return false;
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const producerInfos = useMemo(() => {
        const infos = vin?.Producteur_Infos || {};
        return {
            Nom: infos.Nom || '',
            Prenom: infos.Prenom || '',
            Entreprise: infos.Entreprise || '',
            Notes: infos.Notes || '',
            Adresse: {
                Ligne1: infos.Adresse?.Ligne1 || '',
                Ligne2: infos.Adresse?.Ligne2 || '',
                CodePostal: infos.Adresse?.CodePostal || '',
                Ville: infos.Adresse?.Ville || '',
                Pays: infos.Adresse?.Pays || '',
            },
            Contact: {
                Telephone: infos.Contact?.Telephone || '',
                Email: infos.Contact?.Email || '',
                SiteWeb: infos.Contact?.SiteWeb || '',
            },
        };
    }, [vin?.Producteur_Infos]);

    const updateProducerField = (field, value) => {
        setVin(prev => {
            const prevInfos = prev?.Producteur_Infos || {};
            const prevAdresse = prevInfos.Adresse || {};
            const prevContact = prevInfos.Contact || {};

            const nextInfos = {
                ...prevInfos,
                Adresse: { ...prevAdresse },
                Contact: { ...prevContact },
            };

            if (field.startsWith('Adresse.')) {
                const key = field.split('.')[1];
                nextInfos.Adresse[key] = value;
            } else if (field.startsWith('Contact.')) {
                const key = field.split('.')[1];
                nextInfos.Contact[key] = value;
            } else {
                nextInfos[field] = value;
            }

            return {
                ...prev,
                Producteur_Infos: nextInfos,
            };
        });
    };

    const handleProducerPhoneBlur = () => {
        const value = producerInfos.Contact.Telephone;

        if (value && !isValidPhoneNumber(value)) {
            setProducerErrors(prev => ({ ...prev, phone: 'Numéro invalide' }));
        } else {
            setProducerErrors(prev => ({ ...prev, phone: '' }));
        }
    };

    const handleProducerPhoneChange = (value) => {
        updateProducerField('Contact.Telephone', value || '');

        if (!value) {
            setProducerErrors(prev => ({ ...prev, phone: '' }));
            return;
        }

        if (isValidPhoneNumber(value)) {
            setProducerErrors(prev => ({ ...prev, phone: '' }));
        }
    };

    const reModifIA = async (retryCount = 0) => {
        try {
            setIsAnalyzing(true);
            const formData = new FormData();
            if (vin.base64_etiquette)
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
            traiterAnalyseIA(jsonAtraite);
            setShowPlacementDialog(true);
        } catch (error) {
            if (retryCount < 2) {
                await reModifIA(retryCount + 1);
            } else {
                setShowPlacementDialog(true);
            }
        } finally {
            setIsAnalyzing(false);
        }
    };

    const iaDetails = useMemo(() => {
        if (!vin?.RemarquesIA) return [];

        return vin.RemarquesIA.split(",")
            .map((raw) => {
                const trimmed = raw.trim();
                if (!trimmed) return null;

                const [labelPart, ...rest] = trimmed.split(" : ");
                const label = (labelPart || '').trim();
                const value = rest.join(" : ").trim();

                return {
                    label: label
                        ? label.charAt(0).toUpperCase() + label.slice(1)
                        : 'Information',
                    value: value || "NC",
                };
            })
            .filter(Boolean);
    }, [vin?.RemarquesIA]);

    const prevIsEditingRef = useRef(false);

useEffect(() => {
    // On vient de passer en mode édition
    if (isEditing && !prevIsEditingRef.current) {
        setAddressQuery(producerInfos.Adresse.Ligne1 || '');
        setHasUserTypedAddress(false); // aucune suggestion tant que l'utilisateur n'a pas tapé
    }

    prevIsEditingRef.current = isEditing;
}, [isEditing, producerInfos.Adresse.Ligne1]);


    useEffect(() => {
        if (!hasUserTypedAddress || !addressQuery || addressQuery.length < 3) {
            setAddressSuggestions([]);
            return;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(async () => {
            try {
                setIsAddressLoading(true);
                const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(addressQuery)}`;

                const response = await fetch(url, {
                    signal: controller.signal,
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'Vitissia/1.0 (contact@example.com)'
                    }
                });

                if (!response.ok) return;
                const results = await response.json();

                const suggestions = results.map(r => {
                    const addr = r.address || {};
                    return {
                        label: r.display_name,
                        ligne1: [addr.house_number, addr.road].filter(Boolean).join(' '),
                        codePostal: addr.postcode || '',
                        ville: addr.city || addr.town || addr.village || '',
                        pays: addr.country || '',
                    };
                });

                setAddressSuggestions(suggestions);
            } catch (e) {
                if (e.name !== 'AbortError') {
                    console.error('Erreur Nominatim', e);
                }
            } finally {
                setIsAddressLoading(false);
            }
        }, 400);

        return () => {
            clearTimeout(timeoutId);
            controller.abort();
        };
    }, [addressQuery, hasUserTypedAddress]);

    const handleAddressSuggestionClick = (s) => {
        updateProducerField('Adresse.Ligne1', s.ligne1 || '');
        updateProducerField('Adresse.CodePostal', s.codePostal || '');
        updateProducerField('Adresse.Ville', s.ville || '');
        updateProducerField('Adresse.Pays', s.pays || '');

        setAddressQuery(s.ligne1 || '');
        setAddressSuggestions([]);
        setHasUserTypedAddress(false);
    };
    const hasIADetails = iaDetails.length > 0;

    return (
        <div className="bg-transparent font-['Work_Sans',sans-serif] text-white">
            <TabView
                className={isMobile ? 'mobile-tabs' : 'desktop-tabs'}
                panelContainerClassName={`${isMobile ? 'p-4' : 'p-6'} min-h-[400px] overflow-auto bg-transparent`}
            >
                {/* TAB CAVE */}
                <TabPanel
                    header={
                        <div className="flex items-center gap-2">
                            <i className="pi pi-home text-rose-300" />
                            <span className={`font-semibold ${isMobile ? 'text-sm' : 'text-base'}`}>
                                Cave
                            </span>
                        </div>
                    }
                    headerClassName="flex align-items-center"
                >
                    <div className={`${isMobile ? 'space-y-4' : 'space-y-6'}`}>
                        {isMobile && (
                            <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                        <i className="pi pi-home text-white text-sm"></i>
                                    </div>
                                    <h3 className="text-lg font-bold text-white">
                                        Informations cave
                                    </h3>
                                </div>
                                <p className="text-sm text-white/70">
                                    Gérez les détails de stockage et d'achat
                                </p>
                            </div>
                        )}

                        <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6'}`}>
                            <div className={`mb-4 ${!isEditing ? 'pb-1 border-b border-white/10' : ''}`}>
                                <label className={`block text-sm font-semibold mb-1 ${isEditing ? 'text-white/70' : 'text-white/80'}`}>
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
                                    <p className="text-sm text-white/70">{vin?.Elevage || '-'}</p>
                                )}
                            </div>

                            <div className={`mb-4 ${!isEditing ? 'pb-1 border-b border-white/10' : ''}`}>
                                <label className={`block text-sm font-semibold mb-1 ${isEditing ? 'text-white/70' : 'text-white/80'}`}>
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
                                    <p className="text-sm text-white/70">{vin?.Flacon || '-'}</p>
                                )}
                            </div>

                            <div className={`mb-4 ${!isEditing ? 'pb-1 border-b border-white/10' : ''}`}>
                                <label className={`block text-sm font-semibold mb-1 ${isEditing ? 'text-white/70' : 'text-white/80'}`}>
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
                                    <p className="text-sm text-white/70">{vin?.Lieu_Achat || '-'}</p>
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
                                <div key={name} className={`mb-4 ${!isEditing ? 'pb-1 border-b border-white/10' : ''}`}>
                                    <label className={`block text-sm font-semibold mb-1 ${isEditing ? 'text-white/70' : 'text-white/80'}`}>
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
                                            className={`${getInputStyles()} ${readOnly ? 'bg-gray-800/80 cursor-not-allowed' : ''}`}
                                            placeholder={label}
                                        />
                                    ) : (
                                        <p className="text-sm text-white/70">
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

                {/* TAB DÉGUSTATION */}
                <TabPanel
                    header={
                        <div className="flex items-center gap-2">
                            <i className="pi pi-wine-glass text-rose-300" />
                            <span className={`font-semibold ${isMobile ? 'text-sm' : 'text-base'}`}>
                                Dégustation
                            </span>
                        </div>
                    }
                    headerClassName="flex align-items-center"
                >
                    <div className={`${isMobile ? 'space-y-4' : 'space-y-6'}`}>
                        <VinDegustation vin={vin} isEditing={isEditing} handleInputChange={handleInputChange} />
                    </div>
                </TabPanel>

                {/* TAB PRODUCTEUR */}
                <TabPanel
                    header={
                        <div className="flex items-center gap-2">
                            <i className="pi pi-user text-amber-300" />
                            <span className={`font-semibold ${isMobile ? 'text-sm' : 'text-base'}`}>
                                Producteur
                            </span>
                        </div>
                    }
                    headerClassName="flex align-items-center"
                >
                    <MotionDiv
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className={isMobile ? 'space-y-4' : 'space-y-6'}
                    >
                        {/* Carte résumé producteur */}
                        <MotionDiv
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.05 }}
                            className="relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-r from-white/5 via-white/10 to-white/5 px-4 py-4 md:px-6 md:py-5 shadow-[0_18px_45px_rgba(0,0,0,0.85)]"
                        >
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

                            <div className="flex items-center gap-4 md:gap-5 relative z-10">
                                <div className="
                    w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br
                    from-amber-400/90 via-rose-400/80 to-red-500/80
                    flex items-center justify-center shadow-[0_12px_30px_rgba(0,0,0,0.7)]
                ">
                                    <span className="text-lg md:text-xl font-bold text-slate-950">
                                        {(producerInfos.Prenom || producerInfos.Nom || vin?.Producteur || '?')
                                            .split(' ')
                                            .filter(Boolean)
                                            .slice(0, 2)
                                            .map(s => s[0])
                                            .join('')
                                            .toUpperCase()
                                        }
                                    </span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-xs md:text-[11px] uppercase tracking-[0.14em] text-white/60">
                                        Producteur
                                    </p>
                                    <p className="mt-1 text-base md:text-lg font-semibold text-white truncate">
                                        {producerInfos.Entreprise || vin?.Domaine || 'Producteur non renseigné'}
                                    </p>
                                    <p className="mt-0.5 text-xs md:text-sm text-white/70 truncate">
                                        {[producerInfos.Prenom, producerInfos.Nom].filter(Boolean).join(' ') || vin?.Producteur || 'Nom à compléter'}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-3 pl-[3.2rem] md:pl-[3.6rem]">
                                <p className="text-xs md:text-sm text-white/65 whitespace-pre-line leading-snug">
                                    {(() => {
                                        const l1 = producerInfos.Adresse.Ligne1;
                                        const l2 = producerInfos.Adresse.Ligne2;
                                        const cpVille = [producerInfos.Adresse.CodePostal, producerInfos.Adresse.Ville].filter(Boolean).join(' ');
                                        const pays = producerInfos.Adresse.Pays;
                                        const lines = [l1, l2, cpVille, pays].filter(Boolean);
                                        return lines.length
                                            ? lines.join('\n')
                                            : (vin?.Producteur_Adresse || "Adresse non renseignée");
                                    })()}
                                </p>
                            </div>
                        </MotionDiv>

                        <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-2 gap-4 md:gap-6'}`}>
                            <MotionDiv
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.1 }}
                                className="rounded-2xl border border-white/12 bg-slate-950/40 px-4 py-4 md:px-5 md:py-5 shadow-[0_14px_35px_rgba(0,0,0,0.85)]"
                            >
                                <div className="flex items-center justify-between mb-3 md:mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center">
                                            <i className="pi pi-id-card text-amber-300 text-sm" />
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.16em] text-white/60">Identité</p>
                                            <p className="text-sm text-white/80">Domaine & vigneron</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-white/65 mb-1">Prénom</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={producerInfos.Prenom}
                                                onChange={e => updateProducerField('Prenom', e.target.value)}
                                                placeholder="Jean"
                                                className={getInputStyles()}
                                            />
                                        ) : (
                                            <p className="text-sm text-white/75">
                                                {producerInfos.Prenom || <span className="text-white/40">Non renseigné</span>}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-white/65 mb-1">Nom</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={producerInfos.Nom}
                                                onChange={e => updateProducerField('Nom', e.target.value)}
                                                placeholder="Dupont"
                                                className={getInputStyles()}
                                            />
                                        ) : (
                                            <p className="text-sm text-white/75">
                                                {producerInfos.Nom || <span className="text-white/40">Non renseigné</span>}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-white/65 mb-1">Domaine / Entreprise</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={producerInfos.Entreprise}
                                                onChange={e => updateProducerField('Entreprise', e.target.value)}
                                                placeholder="Domaine de la Côte Rouge"
                                                className={getInputStyles()}
                                            />
                                        ) : (
                                            <p className="text-sm text-white/75">
                                                {producerInfos.Entreprise || <span className="text-white/40">Non renseigné</span>}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </MotionDiv>

                            {/* Bloc adresse */}
                            <MotionDiv
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.15 }}
                                className="rounded-2xl border border-white/12 bg-slate-950/40 px-4 py-4 md:px-5 md:py-5 shadow-[0_14px_35px_rgba(0,0,0,0.85)]"
                            >
                                <div className="flex items-center justify-between mb-3 md:mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                                            <i className="pi pi-map-marker text-emerald-300 text-sm" />
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.16em] text-white/60">Adresse</p>
                                            <p className="text-sm text-white/80">Localisation du domaine</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {/* Ligne 1 */}
                                    <div>
                                        <label className="block text-xs font-semibold text-white/65 mb-1">
                                            Adresse (ligne 1)
                                        </label>
                                        {isEditing ? (
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={addressQuery}
                                                    onChange={e => {
                                                        const val = e.target.value;
                                                        setHasUserTypedAddress(true);
                                                        setAddressQuery(val);
                                                        updateProducerField('Adresse.Ligne1', val);
                                                    }}
                                                    placeholder="12 rue des Vignes"
                                                    className={getInputStyles()}
                                                />

                                                {/* Suggestions */}
                                                {(addressSuggestions.length > 0 || isAddressLoading) && (
                                                    <div className="absolute z-20 mt-1 w-full max-h-56 overflow-auto rounded-xl bg-slate-900/95 border border-white/15 shadow-[0_14px_30px_rgba(0,0,0,0.9)]">
                                                        {isAddressLoading && (
                                                            <div className="px-3 py-2 text-xs text-white/60">
                                                                Recherche en cours...
                                                            </div>
                                                        )}
                                                        {addressSuggestions.map((s, idx) => (
                                                            <button
                                                                key={idx}
                                                                type="button"
                                                                onClick={() => handleAddressSuggestionClick(s)}
                                                                className="w-full text-left px-3 py-2 text-xs md:text-sm text-white/80 hover:bg-white/10 transition-colors"
                                                            >
                                                                {s.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-white/75">
                                                {producerInfos.Adresse.Ligne1 || (
                                                    <span className="text-white/40">Non renseigné</span>
                                                )}
                                            </p>
                                        )}
                                    </div>


                                    {/* Ligne 2 */}
                                    <div>
                                        <label className="block text-xs font-semibold text-white/65 mb-1">Complément (ligne 2)</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={producerInfos.Adresse.Ligne2}
                                                onChange={e => updateProducerField('Adresse.Ligne2', e.target.value)}
                                                placeholder="Bâtiment B, Escalier 2…"
                                                className={getInputStyles()}
                                            />
                                        ) : (
                                            <p className="text-sm text-white/75">
                                                {producerInfos.Adresse.Ligne2 || <span className="text-white/40">Non renseigné</span>}
                                            </p>
                                        )}
                                    </div>

                                    {/* Code postal + Ville */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-white/65 mb-1">Code postal</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={producerInfos.Adresse.CodePostal}
                                                    onChange={e => updateProducerField('Adresse.CodePostal', e.target.value)}
                                                    placeholder="33000"
                                                    className={getInputStyles()}
                                                />
                                            ) : (
                                                <p className="text-sm text-white/75">
                                                    {producerInfos.Adresse.CodePostal || <span className="text-white/40">NC</span>}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-white/65 mb-1">Ville</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={producerInfos.Adresse.Ville}
                                                    onChange={e => updateProducerField('Adresse.Ville', e.target.value)}
                                                    placeholder="Bordeaux"
                                                    className={getInputStyles()}
                                                />
                                            ) : (
                                                <p className="text-sm text-white/75">
                                                    {producerInfos.Adresse.Ville || <span className="text-white/40">NC</span>}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Pays */}
                                    <div>
                                        <label className="block text-xs font-semibold text-white/65 mb-1">Pays</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={producerInfos.Adresse.Pays}
                                                onChange={e => updateProducerField('Adresse.Pays', e.target.value)}
                                                placeholder="France"
                                                className={getInputStyles()}
                                            />
                                        ) : (
                                            <p className="text-sm text-white/75">
                                                {producerInfos.Adresse.Pays || <span className="text-white/40">NC</span>}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </MotionDiv>

                            {/* Bloc contact & notes (sur toute la largeur en mobile, moitié en desktop) */}
                            <MotionDiv
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.2 }}
                                className="md:col-span-2 rounded-2xl border border-white/12 bg-slate-950/40 px-4 py-4 md:px-5 md:py-5 shadow-[0_14px_35px_rgba(0,0,0,0.85)]"
                            >
                                <div className="flex items-center justify-between mb-3 md:mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-xl bg-sky-500/15 flex items-center justify-center">
                                            <i className="pi pi-at text-sky-300 text-sm" />
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.16em] text-white/60">Contact</p>
                                            <p className="text-sm text-white/80">Coordonnées & remarques</p>
                                        </div>
                                    </div>
                                </div>

                                <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-2 gap-4'}`}>
                                    {/* Téléphone */}
                                    <div>
                                        <label className="block text-xs font-semibold text-white/65 mb-1">
                                            Téléphone
                                        </label>
                                        {isEditing ? (
                                            <div className="space-y-1">
                                                <PhoneInput
                                                    international
                                                    defaultCountry="FR"
                                                    value={producerInfos.Contact.Telephone}
                                                    onChange={handleProducerPhoneChange}
                                                    onBlur={handleProducerPhoneBlur}
                                                    className={`${getInputStyles()} react-phone-input-custom`}
                                                />
                                                {producerErrors.phone && (
                                                    <p className="text-xs text-red-400 mt-1">
                                                        {producerErrors.phone}
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-white/75">
                                                {producerInfos.Contact.Telephone || (
                                                    <span className="text-white/40">Non renseigné</span>
                                                )}
                                            </p>
                                        )}
                                    </div>


                                    <div>
                                        <label className="block text-xs font-semibold text-white/65 mb-1">Email</label>
                                        {isEditing ? (
                                            <div className="space-y-1">
                                                <input
                                                    type="email"
                                                    value={producerInfos.Contact.Email}
                                                    onChange={e => {
                                                        const value = e.target.value;
                                                        updateProducerField('Contact.Email', value);

                                                        if (!value) {
                                                            setEmailError('');
                                                        } else if (!isValidEmail(value)) {
                                                            setEmailError('Format d’email invalide');
                                                        } else {
                                                            setEmailError('');
                                                        }
                                                    }}
                                                    onBlur={(e) => {
                                                        const value = e.target.value;
                                                        if (value && !isValidEmail(value)) {
                                                            setEmailError('Format d’email invalide');
                                                        }
                                                    }}
                                                    placeholder="contact@domainedurand.fr"
                                                    className={`${getInputStyles()} ${emailError ? 'border-red-400/70' : ''}`}
                                                />
                                                {emailError && (
                                                    <p className="text-xs text-red-300 mt-1">
                                                        {emailError}
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-white/75 break-all">
                                                {producerInfos.Contact.Email || <span className="text-white/40">Non renseigné</span>}
                                            </p>
                                        )}
                                    </div>

                                    {/* Site web */}
                                    <div className={isMobile ? '' : 'col-span-2'}>
                                        <label className="block text-xs font-semibold text-white/65 mb-1">Site web</label>
                                        {isEditing ? (
                                            <input
                                                type="url"
                                                value={producerInfos.Contact.SiteWeb}
                                                onChange={e => updateProducerField('Contact.SiteWeb', e.target.value)}
                                                placeholder="https://domainedurand.fr"
                                                className={getInputStyles()}
                                            />
                                        ) : (
                                            producerInfos.Contact.SiteWeb ? (
                                                <a
                                                    href={producerInfos.Contact.SiteWeb}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-sm text-sky-300 hover:text-sky-200 underline break-all"
                                                >
                                                    {producerInfos.Contact.SiteWeb}
                                                </a>
                                            ) : (
                                                <p className="text-sm text-white/75">
                                                    <span className="text-white/40">Non renseigné</span>
                                                </p>
                                            )
                                        )}
                                    </div>
                                </div>

                                {/* Notes / remarques producteur */}
                                <div className="mt-4">
                                    <label className="block text-xs font-semibold text-white/65 mb-1">
                                        Notes sur le producteur
                                    </label>
                                    {isEditing ? (
                                        <textarea
                                            rows={3}
                                            value={producerInfos.Notes}
                                            onChange={e => updateProducerField('Notes', e.target.value)}
                                            placeholder="Historique du domaine, philosophie, pratiques particulières…"
                                            className={`mt-1 ${getInputStyles()} resize-none`}
                                        />
                                    ) : (
                                        <p className="mt-1 text-sm text-white/75 whitespace-pre-line">
                                            {producerInfos.Notes || <span className="text-white/40">Aucune note enregistrée.</span>}
                                        </p>
                                    )}
                                </div>
                            </MotionDiv>
                        </div>
                    </MotionDiv>
                </TabPanel>

                {/* TAB RÉSULTAT IA */}
                <TabPanel
                    header={
                        <div className="flex items-center gap-2">
                            <i className="pi pi-microchip-ai text-sky-300" />
                            <span className={`font-semibold ${isMobile ? 'text-sm' : 'text-base'}`}>
                                Résultat IA
                            </span>
                        </div>
                    }
                    headerClassName="flex align-items-center"
                >
                    <div className={`${isMobile ? 'space-y-4' : 'space-y-6'}`}>
                        <div className="
                            bg-gray-900/80 border border-white/15
                            rounded-2xl p-4 md:p-6
                            shadow-[0_18px_45px_rgba(0,0,0,0.9)]
                        ">
                            {/* Header IA */}
                            <div className="flex items-center justify-between gap-3 mb-4">
                                <div>
                                    <h2 className={`font-semibold ${isMobile ? 'text-lg' : 'text-xl'} text-white`}>
                                        Analyse IA du vin
                                    </h2>
                                    <p className="text-xs md:text-sm text-white/60 mt-1">
                                        Synthèse des informations extraites automatiquement depuis l’étiquette.
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className="
                                        inline-flex items-center gap-1 px-3 py-1
                                        rounded-full text-[11px] md:text-xs
                                        bg-sky-500/10 border border-sky-400/40
                                        text-sky-100 uppercase tracking-wide
                                    ">
                                        <i className="pi pi-sparkles text-[11px]" />
                                        Analyse IA
                                    </span>
                                    {isEditing && (
                                        <button
                                            className="
                                                hidden sm:inline-flex items-center gap-2
                                                px-3 py-1.5 rounded-xl
                                                text-xs font-medium
                                                bg-white/10 border border-white/20
                                                text-white hover:bg-white/20
                                                transition-all duration-200
                                            "
                                            onClick={async () => {
                                                await reModifIA();
                                            }}
                                        >
                                            <i className="pi pi-refresh" />
                                            Re-générer
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Loader */}
                            {isAnalyzing && (
                                <div className="mt-6 flex flex-col items-center justify-center py-6">
                                    <div className="w-11 h-11 rounded-full border-2 border-white/20 border-t-white/80 animate-spin mb-3"></div>
                                    <p className="text-sm md:text-base text-white/80">
                                        Analyse en cours, veuillez patienter...
                                    </p>
                                </div>
                            )}

                            {!isAnalyzing && (
                                <>
                                    {/* Résumé clé */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                                        <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5">
                                            <p className="text-[11px] uppercase tracking-wide text-white/50">
                                                Couleur
                                            </p>
                                            <p className="mt-1 text-sm md:text-base font-medium text-white">
                                                {vin?.Couleur || 'NC'}
                                            </p>
                                        </div>
                                        <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5">
                                            <p className="text-[11px] uppercase tracking-wide text-white/50">
                                                Région
                                            </p>
                                            <p className="mt-1 text-sm md:text-base font-medium text-white">
                                                {vin?.Région || 'NC'}
                                            </p>
                                        </div>
                                        <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5">
                                            <p className="text-[11px] uppercase tracking-wide text-white/50">
                                                Cépage(s)
                                            </p>
                                            <p className="mt-1 text-sm md:text-base font-medium text-white line-clamp-2">
                                                {vin?.Cepage || 'NC'}
                                            </p>
                                        </div>
                                        <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5">
                                            <p className="text-[11px] uppercase tracking-wide text-white/50">
                                                Prix moyen estimé
                                            </p>
                                            <p className="mt-1 text-sm md:text-base font-medium text-white">
                                                {vin?.Valeur ? `${vin.Valeur.toFixed(2)} €` : 'NC'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Alertes éventuelles (couleur / région non trouvées) */}
                                    {(errorRegion || errorCouleur) && (
                                        <div className="
                                            mt-4 rounded-xl border border-amber-400/40
                                            bg-amber-500/10 px-3 py-3 text-xs md:text-sm text-amber-100
                                            space-y-1
                                        ">
                                            <div className="flex items-center gap-2 mb-1">
                                                <i className="pi pi-exclamation-triangle text-amber-200 text-sm" />
                                                <span className="font-semibold">Vérification recommandée</span>
                                            </div>
                                            {errorRegion && <p>- {errorRegion}</p>}
                                            {errorCouleur && <p>- {errorCouleur}</p>}
                                        </div>
                                    )}

                                    {/* Détails IA structurés */}
                                    <div className="mt-6">
                                        <p className="text-xs md:text-sm font-semibold text-white/60 mb-2 uppercase tracking-wide">
                                            Détails analysés
                                        </p>

                                        {!hasIADetails && (
                                            <div className="
                                                mt-2 rounded-xl border border-white/15 bg-white/5
                                                px-4 py-4 text-sm md:text-base text-white/70
                                            ">
                                                <p>
                                                    Aucune remarque détaillée n’a encore été générée par l’IA
                                                    pour ce vin.
                                                </p>
                                                {isEditing && (
                                                    <p className="mt-1 text-xs md:text-sm text-white/60">
                                                        Lancez une analyse pour obtenir une description enrichie.
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {hasIADetails && (
                                            <div className="grid gap-3 md:gap-4 md:grid-cols-2 mt-2">
                                                {iaDetails.map((item, index) => (
                                                    <div
                                                        key={`${item.label}-${index}`}
                                                        className="
                                                            bg-white/5 border border-white/10
                                                            rounded-xl px-3 py-2.5
                                                            hover:bg-white/8 transition-colors
                                                        "
                                                    >
                                                        <p className="text-[11px] md:text-[11px] uppercase tracking-wide text-white/55">
                                                            {item.label}
                                                        </p>
                                                        <p className="mt-1 text-sm md:text-sm text-white/90 leading-snug">
                                                            {item.value}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Bouton Re-Générer (version mobile / fallback) */}
                                    {isEditing && (
                                        <div className="mt-6 flex justify-center sm:justify-end">
                                            <button
                                                className="
                                                    inline-flex items-center gap-2
                                                    px-5 py-2.5 rounded-xl
                                                    bg-white/15 border border-white/25
                                                    text-sm font-semibold text-white
                                                    hover:bg-white/25 hover:border-white/35
                                                    shadow-[0_12px_30px_rgba(0,0,0,0.8)]
                                                    transition-all duration-200
                                                    transform hover:translate-y-[-1px] active:translate-y-[1px]
                                                "
                                                onClick={async () => {
                                                    await reModifIA();
                                                }}
                                            >
                                                <i className="pi pi-refresh text-sm" />
                                                Re-générer l’analyse
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </TabPanel>
            </TabView>
        </div>
    );
};

export default VinTabs;
