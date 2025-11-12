import React, { useEffect, useState, useRef, useMemo, useContext } from 'react';
import { Toast } from 'primereact/toast';
import { useNavigate } from 'react-router-dom';
import authHeader from '../config/authHeader';
import config from '../config/config';
import useFetchPays from '../hooks/useFetchPays';
import useFetchRegions from '../hooks/useFetchRegions';
import useFetchEnums from '../hooks/useFetchEnums';
import imageCompression from "browser-image-compression";
import { ThemeContext } from '../context/ThemeContext';
import NouveauVinEtape1 from '../components/NouveauVinEtape1';
import NouveauVinEtape2 from '../components/NouveauVinEtape2';
import { Dialog } from 'primereact/dialog';
import LoginRequiredModal from '../components/LoginRequiredModal';
import CreatableSelect from 'react-select/creatable';

const NouveauVin = () => {
  const [vin, setVin] = useState(null);
  const [initialVin, setInitialVin] = useState(null);
  const [distinctCaves, setDistinctCaves] = useState([]);
  const [showAddCaveDialog, setShowAddCaveDialog] = useState(false);
  const [newCaveName, setNewCaveName] = useState("");
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const UUIDuser = sessionStorage.getItem('uuid_user');
  const toast = useRef(null);
  const [errorRegion, setErrorRegion] = useState("");
  const [errorCouleur, setErrorCouleur] = useState("");
  const [currentStep, setCurrentStep] = useState(1); // 1 = Étape 1, 2 = Étape 2
  // Nouveau: choix placement (dégustation ou cave)
  const [showPlacementDialog, setShowPlacementDialog] = useState(false);
  const [placementMode, setPlacementMode] = useState(null); // 'degustation' | 'cave' | null
  const [tempCaveOption, setTempCaveOption] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Options de cave sans "Dégustation" (pour le choix "En cave")
  const caveOptionsNoDegustation = useMemo(() =>
    distinctCaves.filter(c => {
      const s = (c.label || c.value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      return s !== 'degustation';
    })
    , [distinctCaves]);

  const shouldAnalyze = useRef(false);
  const { darkMode } = useContext(ThemeContext);

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/4DACTION/react_createCave`)
      .then(response => response.json())
      .then(data => {
        const targetName = 'Cave principale';
        const storedCavesRaw = JSON.parse(localStorage.getItem("distinctCaves")) || [];
        let updatedStored = storedCavesRaw;
        if (!storedCavesRaw.some(c => (c || '').toLowerCase() === targetName.toLowerCase())) {
          updatedStored = [targetName, ...storedCavesRaw];
          localStorage.setItem('distinctCaves', JSON.stringify(updatedStored));
        }
        const cavesFormatted = updatedStored.map(c => ({ label: c, value: c }));
        setDistinctCaves(cavesFormatted);
        setVin({
          ...data,
          Flacon: data.Flacon || 'Bouteille 75 cl',
          Qte: 1,
          Reste_en_Cave: 1,
          Cave: data.Cave && data.Cave.trim() !== '' ? data.Cave : targetName
        });
        setInitialVin(data);
      })
      .catch(error => console.error('Erreur lors de la récupération du modèle:', error))
    // Charger les valeurs distinctes des caves
    console.log("caves distinctes :", distinctCaves);
    const storedCaves = JSON.parse(localStorage.getItem("distinctCaves")) || [];
    const cavesFormatted = storedCaves.map(c => ({ label: c, value: c }));
    setDistinctCaves(cavesFormatted);
  }, []);


  const handleCaveChange = (value) => {
    setVin((prevVin) => ({
      ...prevVin,
      Cave: value, // Mettre à jour la cave sélectionnée
    }));
  };

  const { lesPays, fetchLesPays } = useFetchPays();

  const { regions, fetchRegions, ajouterRegionIA } = useFetchRegions();


  useEffect(() => {
    if (!lesPays || lesPays.length === 0) {
      fetchLesPays(); // Appeler uniquement si lesPays est vide
    }
  }, [lesPays, fetchLesPays]);

  useEffect(() => {
    if (!regions || regions.length === 0) {
      fetchRegions(); // Appeler uniquement si regions est vide
    }

  }, [regions, fetchRegions]);


  const { enums, error, loading, fetchEnums } = useFetchEnums();
  useEffect(() => {
    fetchEnums(); // Appeler fetchEnums au montage du composant
  }, [fetchEnums]);
  const optionTypeVin = useMemo(() => {
    const typeVinEnum = enums.find((item) => item.titre === "Type de vin");
    return typeVinEnum?.Valeur_Enum?.Valeur.map((val) => ({
      label: val.Libelle,
      value: val.Libelle,
    })) || [];
  }, [enums]);

  const optionsPays = useMemo(() => lesPays.map((pays) => ({
    label: pays.Nom_Fr,
    value: pays.Ref_Pays,
  })), [lesPays]);

  const optionsRegions = useMemo(() => regions.map((region) => ({
    label: region.Nom_Fr,
    value: region.Ref_Pays,
  })), [regions]);

  const [filteredRegions, setFilteredRegions] = useState(optionsRegions);
  useEffect(() => {
    setFilteredRegions(optionsRegions);
  }, [optionsRegions]);

  const defaultCountry = "" //optionsPays.find((pays) => pays.label === "France");
  const defaultCountryValue = vin?.Pays
    ? optionsPays.find((pays) => pays.label === vin.Pays) // Trouver l'option correspondant à vin.Pays
    : defaultCountry;
  const defaultRegion = ""//optionsRegions.find((region) => region.label === "Bourgogne");
  const defaultRegionValue = vin?.Région
    ? optionsRegions.find((region) => region.label === vin.Région)
    : defaultRegion;

  const [isClearable, setIsClearable] = useState(true);
  const [isSearchable, setIsSearchable] = useState(true);

  const optionCouleur = [
    { label: 'Rouge', value: 'Rouge' },
    { label: 'Blanc', value: 'Blanc' },
    { label: 'Rosé', value: 'Rosé' },
  ]

  const handleCountryChange = (selectedOption) => {
    const selectedCountry = selectedOption?.value || ''; // Récupérer la valeur du pays sélectionné
    handleInputChange(selectedOption?.label || '', 'Pays'); // Mettre à jour le pays dans l'état `vin`

    // Filtrer les régions en fonction du pays sélectionné (seulement si c'est un pays des options)
    const matchingCountryOption = optionsPays.find(pays => pays.label === selectedOption?.label);
    if (matchingCountryOption) {
      const newFilteredRegions = optionsRegions.filter(
        (region) => region.value === matchingCountryOption.value
      );
      setFilteredRegions(newFilteredRegions);
    } else {
      // Si c'est un pays personnalisé, afficher toutes les régions
      setFilteredRegions(optionsRegions);
    }
  };

  useEffect(() => {
    if (vin?.Pays) {
      const selectedCountry = optionsPays.find((pays) => pays.label === vin.Pays)?.value || '';
      const newFilteredRegions = optionsRegions.filter(
        (region) => region.value === selectedCountry
      );
      // Ne mettez à jour que si les régions filtrées sont différentes
      if (JSON.stringify(filteredRegions) !== JSON.stringify(newFilteredRegions)) {
        setFilteredRegions(newFilteredRegions);
      }
    }
  }, [vin, optionsPays, optionsRegions, filteredRegions]);

  const handleInputChange = (e, customName) => {
    if (customName) {
      if (customName === 'Note_sur_100') {
        console.debug('[NOTE] set Note_sur_100 =', e, 'type=', typeof e);
      }
      setVin((prevVin) => {
        const updatedVin = { ...prevVin, [customName]: e };
        if (customName === "Valeur" || customName === "Reste_en_Cave" || customName === "Dont_Bue" || customName === "Qte") {
          updatedVin.Reste_en_Cave = (updatedVin.Qte || 0) - (updatedVin.Dont_Bue || 0);
          updatedVin.valeurCave = (updatedVin.Reste_en_Cave || 0) * (updatedVin.Valeur || 0);
        }
        return updatedVin;
      });
    } else if (e?.target) {
      const { name, value } = e.target;
      if (name === 'Note_sur_100') {
        console.debug('[NOTE] set Note_sur_100 =', value, 'type=', typeof value);
      }
      setVin((prevVin) => {
        const updatedVin = { ...prevVin, [name]: value };
        if (name === "Valeur" || name === "Reste_en_Cave" || name === "Dont_Bue" || name === "Qte") {
          updatedVin.Reste_en_Cave = (updatedVin.Qte || 0) - (updatedVin.Dont_Bue || 0);
          updatedVin.valeurCave = (updatedVin.Reste_en_Cave || 0) * (updatedVin.Valeur || 0);
        }
        return updatedVin;
      });
    } else if (e?.name) {
      if (e.name === 'Note_sur_100') {
        console.debug('[NOTE] set Note_sur_100 =', e.value, 'type=', typeof e.value);
      }
      setVin((prevVin) => {
        const updatedVin = { ...prevVin, [e.name]: e.value };
        if (e.name === "Valeur" || e.name === "Reste_en_Cave" || e.name === "Dont_Bue" || e.name === "Qte") {
          updatedVin.Reste_en_Cave = (updatedVin.Qte || 0) - (updatedVin.Dont_Bue || 0);
          updatedVin.valeurCave = (updatedVin.Reste_en_Cave || 0) * (updatedVin.Valeur || 0);
        }
        return updatedVin;
      });
    }
  };
  const getModifiedFields = () => {
    const modifiedFields = {};

    Object.keys(vin).forEach((key) => {
      if (vin[key] !== initialVin[key]) {
        modifiedFields[key] = vin[key];
      }
    });

    return modifiedFields;
  };
  const handleSave = async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        setShowLoginModal(true);
        return;
      }
      const modifiedVin = getModifiedFields();  
      
      if (modifiedVin.Note_sur_100 !== undefined) {
        modifiedVin.Note_sur_20 = Number(modifiedVin.Note_sur_100); 
      }
      const modifiedVinJson = JSON.stringify(modifiedVin);

      console.group('[SAVE] Payload envoyé à 4D');
      console.table(modifiedVin); // lisible
      console.log('Note_sur_100 =', modifiedVin.Note_sur_100, 'type=', typeof modifiedVin.Note_sur_100);
      console.groupEnd();


      const formData = new FormData();
      formData.append("champsModif", modifiedVinJson);
      formData.append("action", "creation");
      formData.append("UUIDuser", UUIDuser);
      // Ajouter le token pour 4D en paramètre supplémentaire
      formData.append('token', token);
      const response = await fetch(`${config.apiBaseUrl}/4DACTION/react_putCave`, {
        method: 'PUT',  // ou 'PATCH' selon l'API
        headers: authHeader(),
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde');
      }
      const updatedCave = await response.json();
      toast.current.show({ severity: 'success', summary: 'Succès', detail: 'Modifications enregistrées.', life: 3000 });
      setVin(updatedCave);
      setInitialVin(updatedCave);
      navigate(`/vin/${updatedCave.UUID_}`);
    } catch (error) {
      toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'Erreur lors de sauvegarde', life: 3000 });
    }
  };

  const customBase64Uploader = async (event) => {
    const file = event.files[0];
    if (file) {
      try {
        const sizeMB = file.size / 1024 / 1024;

        if (sizeMB <= 0.256) {
          // Si le fichier est déjà assez petit, on ne le compresse pas
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            const base64String = reader.result.split(",")[1];
            setVin((prevVin) => ({
              ...prevVin,
              base64_etiquette: base64String,
            }));
            shouldAnalyze.current = true;
          };
        } else {
          // Options de compression seulement si le fichier est trop volumineux
          const options = {
            maxSizeMB: 0.256,
            maxWidthOrHeight: 1024,
            useWebWorker: true,
          };
          const compressedFile = await imageCompression(file, options);
          const reader = new FileReader();
          reader.readAsDataURL(compressedFile);
          reader.onload = () => {
            const base64String = reader.result.split(",")[1];
            setVin((prevVin) => ({
              ...prevVin,
              base64_etiquette: base64String,
            }));
            shouldAnalyze.current = true;
          };
        }
      } catch (error) {
        console.error("Erreur lors du traitement de l'image :", error);
      }
    }
  };
  //test isAnalyzing
  useEffect(() => {
    if (vin?.base64_etiquette && shouldAnalyze.current) {
      AnalyseIA(); // Appeler AnalyseIA uniquement si le drapeau est activé
      shouldAnalyze.current = false; // Réinitialiser le drapeau après l'appel
    }
  }, [vin?.base64_etiquette]);

  const customBase64UploaderSansIA = async (event) => {
    const file = event.files[0];
    if (file) {
      try {
        const sizeMB = file.size / 1024 / 1024;

        if (sizeMB <= 0.256) {
          // Si le fichier est déjà assez petit, on ne le compresse pas
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            const base64String = reader.result.split(",")[1];
            setVin((prevVin) => ({ ...prevVin, base64_etiquette: base64String }));
          };
        } else {
          // Options de compression seulement si le fichier est trop volumineux
          const options = {
            maxSizeMB: 0.256,
            maxWidthOrHeight: 1024,
            useWebWorker: true,
          };
          const compressedFile = await imageCompression(file, options);
          const reader = new FileReader();
          reader.readAsDataURL(compressedFile);
          reader.onload = () => {
            const base64String = reader.result.split(",")[1];
            setVin((prevVin) => ({ ...prevVin, base64_etiquette: base64String }));
          };
        }
      } catch (error) {
        console.error("Erreur lors du traitement de l'image :", error);
      }
    }
  };

  const handleRegionValidation = async (regionIA, paysIA) => {
    const regionTrouvee = optionsRegions.find((region) =>
      region.label.toLowerCase().includes(regionIA.toLowerCase())
    );

    if (!regionTrouvee) {
      try {
        const newRegion = await ajouterRegionIA(paysIA, regionIA);
        toast.current.show({
          severity: 'success',
          summary: 'Succès',
          detail: `Région "${regionIA}" ajoutée avec succès.`,
          life: 3000,
        });
        await fetchRegions(); // Recharger les régions après l'ajout
        toast.current.show({
          severity: 'success',
          summary: 'Succès',
          detail: `Région "${regionIA}" ajoutée avec succès.`,
          life: 3000,
        });

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
        toast.current.show({
          severity: 'error',
          summary: 'Erreur',
          detail: `Impossible d'ajouter la région "${regionIA}".`,
          life: 3000,
        });
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

  const AnalyseIA = async (retryCount = 0) => {
    try {
      setIsAnalyzing(true);
      const formData = new FormData();
      formData.append("b64", vin.base64_etiquette);
      formData.append("uuidUser", UUIDuser);
      const response = await fetch(`${config.apiBaseUrl}/4DACTION/react_analyseIA`, {
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
          toast.current.show({ severity: 'warn', summary: 'Tentative échouée', detail: `Réponse vide, tentative ${retryCount + 2}...`, life: 3000 });
          await AnalyseIA(retryCount + 1);
          return;
        } else {
          throw new Error("Réponse vide après trois tentatives");
        }
      }
      console.log("jsonAtraite", jsonAtraite);
      traiterAnalyseIA(jsonAtraite);
      toast.current.show({ severity: 'success', summary: 'Succès', detail: 'Analyse réussie', life: 3000 });
      // Ancien: setCurrentStep(2)
      setShowPlacementDialog(true);
    } catch (error) {
      if (retryCount < 2) {
        toast.current.show({ severity: 'warn', summary: 'Tentative échouée', detail: `Erreur lors de la tentative ${retryCount + 1}, nouvelle tentative...`, life: 3000 });
        await AnalyseIA(retryCount + 1);
      } else {
        toast.current.show({ severity: 'error', summary: 'Erreur', detail: "Erreur lors de l'analyse après trois tentatives", life: 3000 });
        // En cas d'échec final, afficher quand même le choix de placement
        setShowPlacementDialog(true);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleManualMode = () => {
    // Ancien: setCurrentStep(2)
    setShowPlacementDialog(true);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const getNoteDescription = (value) => {
    const v = Number.isFinite(value) ? Math.max(0, Math.min(100, Math.round(value))) : 0;

    if (v === 0) return 'Non noté';
    if (v < 82) return 'Médiocre';
    if (v < 85) return 'Correct';
    if (v < 87) return 'Bon';
    if (v < 90) return 'Très bon';
    if (v < 93) return 'Excellent';
    if (v < 97) return 'Exceptionnel';
    return 'Grand Cru';
  };

  const addCaveDialogFooter = (
    <div>
      <button
        onClick={() => setShowAddCaveDialog(false)}
        className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition mr-2"
      >
        Annuler
      </button>
      <button
        onClick={() => {
          if (newCaveName.trim() !== "" && !distinctCaves.some(cave => cave.label === newCaveName)) {
            const updatedCaves = [...distinctCaves, { label: newCaveName, value: newCaveName }];
            setDistinctCaves(updatedCaves);
            localStorage.setItem("distinctCaves", JSON.stringify(updatedCaves.map(c => c.value))); // Stocker uniquement les valeurs
            setVin((prevVin) => ({ ...prevVin, Cave: newCaveName })); // Sélectionner la nouvelle cave
            setShowAddCaveDialog(false);
            setNewCaveName("");
          }
        }}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        Ajouter
      </button>
    </div>
  );


  // Pré-sélection de la cave principale dans le menu de placement
  useEffect(() => {
    if (showPlacementDialog) {
      const def = distinctCaves.find(c => (c.label || '').toLowerCase() === 'cave principale');
      setTempCaveOption(def || null);
      setPlacementMode(null);
    }
  }, [showPlacementDialog, distinctCaves]);

  // Handlers pour le choix de placement
  const handleChooseDegustation = () => {
    setVin(prev => {
      const qte = 0;
      const dontBue = prev?.Dont_Bue || 0;
      const valeur = prev?.Valeur || 0;
      const reste = (qte || 0) - (dontBue || 0);
      return { ...prev, Cave: 'Dégustation', Qte: qte, Reste_en_Cave: reste, valeurCave: (reste || 0) * valeur };
    });
    setShowPlacementDialog(false);
    setCurrentStep(2);
  };

  const handleChooseCave = () => {
    setPlacementMode('cave');
  };

  const handleConfirmCavePlacement = () => {
    const chosen = tempCaveOption;
    const fallback = distinctCaves.find(c => (c.label || '').toLowerCase() === 'cave principale') || null;
    const finalChoice = chosen || fallback;
    if (!finalChoice) {
      toast.current?.show({ severity: 'warn', summary: 'Choix manquant', detail: 'Sélectionnez une cave.', life: 2000 });
      return;
    }
    const value = finalChoice.value || finalChoice.label;
    setVin(prev => ({ ...prev, Cave: value }));
    // Ajouter à la liste si nouveau
    if (!distinctCaves.some(c => (c.label || '') === value)) {
      const updated = [...distinctCaves, { label: value, value }];
      setDistinctCaves(updated);
      localStorage.setItem('distinctCaves', JSON.stringify(updated.map(c => c.value)));
    }
    setShowPlacementDialog(false);
    setCurrentStep(2);
  };

  var bas64Vide = ""
  if (!vin) return <p>Chargement du formulaire...</p>;
  return (
    <div className="">
      <Toast ref={toast} />
      <LoginRequiredModal
        visible={showLoginModal}
        onLogin={() => { setShowLoginModal(false); navigate('/login'); }}
        onCancel={() => setShowLoginModal(false)}
      />
      {/* Dialog Choix placement */}
      <Dialog
        visible={showPlacementDialog}
        onHide={() => setShowPlacementDialog(false)}
        header="Choix dégustation ou dans une cave ?"
        className="w-full max-w-md"
        modal
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleChooseDegustation}
              className="p-4 rounded-xl border border-gray-200 hover:bg-red-50 text-red-600 dark:border-gray-600 dark:hover:bg-red-900/20 transition"
            >
              Dégustation
            </button>
            <button
              onClick={handleChooseCave}
              className="p-4 rounded-xl border border-gray-200 hover:bg-blue-50 text-blue-600 dark:border-gray-600 dark:hover:bg-blue-900/20 transition"
            >
              En cave
            </button>
          </div>

          {placementMode === 'cave' && (
            <div className="mt-2">
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Sélectionnez ou créer une cave</label>
              <CreatableSelect
                value={tempCaveOption}
                options={caveOptionsNoDegustation}
                onChange={(opt) => setTempCaveOption(opt ? { label: opt.label, value: opt.value || opt.label } : null)}
                placeholder="Choisir ou créer une cave"
                isClearable
                isSearchable
                formatCreateLabel={(inputValue) => `Créer "${inputValue}"`}
                menuPortalTarget={document.body}
                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
              />
              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={handleConfirmCavePlacement}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Valider
                </button>
              </div>
            </div>
          )}
        </div>
      </Dialog>
      {vin ? (
        <>
          {currentStep === 1 ? (
            <NouveauVinEtape1
              onAnalyzeComplete={() => setCurrentStep(2)}
              onManualMode={handleManualMode}
              customBase64Uploader={customBase64Uploader}
              isAnalyzing={isAnalyzing}
            />
          ) : (
            <NouveauVinEtape2
              vin={vin}
              handleInputChange={handleInputChange}
              handleSave={handleSave}
              customBase64UploaderSansIA={customBase64UploaderSansIA}
              getNoteDescription={getNoteDescription}
              optionsPays={optionsPays}
              filteredRegions={filteredRegions}
              optionCouleur={optionCouleur}
              optionTypeVin={optionTypeVin}
              distinctCaves={distinctCaves}
              defaultCountryValue={defaultCountryValue}
              defaultRegionValue={defaultRegionValue}
              handleCountryChange={handleCountryChange}
              errorRegion={errorRegion}
              errorCouleur={errorCouleur}
              showAddCaveDialog={showAddCaveDialog}
              setShowAddCaveDialog={setShowAddCaveDialog}
              newCaveName={newCaveName}
              setNewCaveName={setNewCaveName}
              handleCaveChange={handleCaveChange}
              addCaveDialogFooter={addCaveDialogFooter}
              onBack={handleBack}
            />
          )}
        </>
      ) : (
        <div className="p-4 text-center text-gray-500">Vin non trouvé</div>
      )
      }
    </div >
  );
};

export default NouveauVin;