import React, { useEffect, useState, useRef, useMemo, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useFetchCaves from '../hooks/useFetchCaves';
import useFetchPays from '../hooks/useFetchPays';
import useFetchRegions from '../hooks/useFetchRegions';
import { Rating } from 'primereact/rating';
import ReactStars from 'react-rating-stars-component';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import config from '../config/config';
import authHeader from '../config/authHeader';
import VinTabs from '../components/VinTabs';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import imageCompression from "browser-image-compression";
import useFetchEnums from '../hooks/useFetchEnums';
import { Slider } from 'primereact/slider';
import { ThemeContext } from '../context/ThemeContext';
import { Dialog } from 'primereact/dialog'; // Importer Dialog
import Layout from '../components/Layout';

const Vin = () => {
  const { UUID_ } = useParams();
  const navigate = useNavigate();
  const { cave, error, loading, fetchCave, fetchCaves } = useFetchCaves();
  const { enums, fetchEnums } = useFetchEnums();
  const [vin, setVin] = useState(null);
  const [initialVin, setInitialVin] = useState(cave);
  const [isEditing, setIsEditing] = useState(false);
  const toast = useRef(null);
  const { lesPays, fetchLesPays } = useFetchPays();
  const { regions, fetchRegions } = useFetchRegions();
  const { darkMode } = useContext(ThemeContext);
  const [distinctCaves, setDistinctCaves] = useState([]); // État pour les valeurs distinctes des caves
  const [showAddCaveDialog, setShowAddCaveDialog] = useState(false); // État pour afficher le dialogue d'ajout de cave
  const [newCaveName, setNewCaveName] = useState(""); // État pour le nom de la nouvelle cave
  const [associationsMets, setAssociationsMets] = useState([]);
  const [loadingRecipeForMet, setLoadingRecipeForMet] = useState(null);
  // Ajout: suppression
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const confirmDelete = () => setShowDeleteDialog(true);
  const handleDelete = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/4DACTION/react_supprimerCave?UUID_=${UUID_}`, {
        method: 'GET',
        headers: authHeader(),
      });
      if (!response.ok) throw new Error('Erreur lors de la suppression');
      const data = await response.json();
      if (data.etat === 'succes') {
        toast.current?.show({ severity: 'success', summary: 'Supprimé', detail: 'Le vin a été supprimé.', life: 2500 });
        fetchCaves();
        navigate('/cave');
      } else {
        throw new Error('Echec API');
      }
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Erreur', detail: "Suppression impossible.", life: 3000 });
    } finally {
      setShowDeleteDialog(false);
    }
  };

  useEffect(() => {
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


  useEffect(() => {
    if (!lesPays || lesPays.length === 0) {
      fetchLesPays(); // Appeler uniquement si lesPays est vide
    }
  }, [lesPays, fetchLesPays]);
  useEffect(() => {
    if (!regions || regions.length === 0) {
      fetchRegions(); // Appeler uniquement si lesPays est vide
    }
  }, [regions, fetchRegions]);

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
    fetchCave(UUID_);
  }, [UUID_, fetchCave]);

  useEffect(() => {
    setVin(cave);
    setInitialVin(cave);
    // Appeler fetchDegustationVin après avoir récupéré les données du vin
    if (cave && cave.Nom) {
      fetchDegustationVin(cave);
    }
  }, [cave]);

  const fetchDegustationVin = async (vinData) => {
    try {
      const UUIDuser = sessionStorage.getItem('uuid_user');
      const params = new URLSearchParams({
        UUID_: UUID_,
        UUIDuser: UUIDuser,
        nomVin: vinData.Nom || ''
      });

      const response = await fetch(`${config.apiBaseUrl}/4DACTION/react_getDegustationVin?${params}`, {
        method: 'GET',
        headers: authHeader(),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data)) {
          setAssociationsMets(data);
        }
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des associations mets:', err);
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
      setVin((prevVin) => {
        const updatedVin = { ...prevVin, [customName]: e };
        if (customName === "Valeur" || customName === "Qte") {
          updatedVin.valeurCave = (updatedVin.Qte || 0) * (updatedVin.Valeur || 0);
        }
        return updatedVin;
      });
    } else if (e?.target) {
      const { name, value } = e.target;
      setVin((prevVin) => {
        const updatedVin = { ...prevVin, [name]: value };
        if (name === "Valeur" || name === "Qte") {
          updatedVin.valeurCave = (updatedVin.Qte || 0) * (updatedVin.Valeur || 0);
        }
        return updatedVin;
      });
    }
  };

  const getModifiedFields = () => {
    const modified = {};
    Object.keys(vin).forEach((key) => {
      if (vin[key] !== initialVin[key]) {
        modified[key] = vin[key];
      }
    });

    return modified;
  };

  const handleSave = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      toast.current?.show({ severity: 'warn', summary: 'Connexion requise', detail: 'Connectez-vous pour enregistrer des modifications.', life: 3000 });
      return;
    }
    const modifiedVin = getModifiedFields();
    /*if (Object.keys(modifiedVin).length === 0) {
      toast.current.show({ severity: 'info', summary: 'Info', detail: "Aucune modification.", life: 3000 });
      return;
    }*/
    try {
      const formData = new FormData();
      formData.append("UUID_", vin.UUID_);
      formData.append("champsModif", JSON.stringify(modifiedVin));
      // Ajouter le token pour 4D en paramètre supplémentaire
      formData.append('token', token);
      const response = await fetch(`${config.apiBaseUrl}/4DACTION/react_putCave?UUID_=${vin.UUID_}`, {
        method: 'PUT',
        headers: authHeader(),
        body: formData,
      });
      if (!response.ok) throw new Error('Erreur sauvegarde');
      const updated = await response.json();
      setVin(updated);
      setInitialVin(updated);
      setIsEditing(false);
      toast.current.show({ severity: 'success', summary: 'Succès', detail: 'Modifications enregistrées.', life: 3000 });
      fetchCave(vin.UUID_);
      fetchCaves();
    } catch {
      toast.current.show({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de la sauvegarde.', life: 3000 });
    }
  };

  const handleCancel = () => {
    setVin(initialVin); // Réinitialiser les valeurs de vin à leur état initial
    setIsEditing(false); // Désactiver le mode édition
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

  // Gestion de la liste des mets en interne
  const associationMetsList = useMemo(() => {
    if (vin?.Association_Mets) {
      return vin.Association_Mets.split(',').map(item => item.trim()).filter(item => item);
    }
    return [];
  }, [vin?.Association_Mets]);

  const handleMetClick = async (met) => {
    // Sauvegarder l'origine avant de naviguer
    sessionStorage.setItem('recetteOrigin', 'VIN_DETAIL');
    sessionStorage.setItem('vinDetailUUID', UUID_);
    sessionStorage.removeItem('metsVinsState'); // éviter collision

    setLoadingRecipeForMet(met.nomMet);
    try {
      const UUIDuser = sessionStorage.getItem('uuid_user');
      const formData = new FormData();
      formData.append("met", met.nomMet);
      formData.append("uuidUser", UUIDuser);
      formData.append("uuidAssociation", met.UUID_ || '');

      sessionStorage.setItem('vinName', vin.Nom);
      sessionStorage.setItem('metName', met.nomMet);
      sessionStorage.setItem('recetteUUID', met.UUID_Recette || '');
      navigate('/recette');
    } catch (err) {
      console.error('Erreur lors de la récupération de la recette:', err);
      toast.current.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Erreur lors de la récupération de la recette',
        life: 3000
      });
    } finally {
      setLoadingRecipeForMet(null);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen text-white">Chargement...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-400">Erreur: {error}</div>;

  // Fonction pour afficher la description selon la note
   const getNoteDescription = (value) => {
     if (value >= 18) return 'Exceptionnel';
     else if (value >= 14) return 'Excellent';
     else if (value >= 10) return 'Très bon';
     else if (value >= 6) return 'Bon';
     else if (value >= 2) return 'Acceptable';
     else if (value == 0) return 'Non noté';
     return 'Médiocre';
   };


  return (
    <Layout>
      <div className="">
        {/* <div className="w-full flex justify-end mb-4">
        <ThemeToggle />
      </div> */}
        <Toast ref={toast} />
        {vin && (
          <div>
            <div className='grid grid-cols-1 md:grid-cols-2 '>
              <div className='flex bg-gray-100 dark:bg-[#2b2b2b] justify-center items-center border-gray-400 md:border-r border-b md:border-b-0'>
                <img
                  src={`data:image/jpeg;base64,${vin.base64_etiquettecomplet}`}
                  alt="Cave"
                  className="dark:object-cover  w-96 h-118 object-contain transition-all duration-300 ease-in-out hover:scale-105 border-2 border-gray-400 rounded-lg shadow-md hover:shadow-lg cursor-pointer"
                /> {/*dark:w-full dark:h-full*/}
                {/* {isEditing && (
                <div className="mt-4">
                  <FileUpload
                    name="demo[]"
                    mode='basic'
                    chooseLabel="Importer une image"
                    accept="image/*"
                    maxFileSize={12000000}
                    customUpload={true}
                    onSelect={customBase64Uploader}
                    className="p-button-secondary"
                  />
                </div>
              )} */}
              </div>

              <div className='flex-auto bg-white dark:bg-[#1a1a1a] p-6'>
                {/* Actions: modifier / supprimer */}
                <div className="flex justify-end gap-2 mb-4">
                  {!isEditing && (
                    <>
                      {/* <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-green-200 border border-gray-700 text-gray-800 dark:hover:text-white text-sm hover:bg-green-100 dark:hover:bg-[#2b2b2b] transition"
                      >
                        Modifier
                      </button> */}
                      <button
                        onClick={confirmDelete}
                        className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
                      >
                        Supprimer
                      </button>
                    </>
                  )}
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    variant="standard"
                    name="Nom"
                    value={vin.Nom || ''}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    className="w-full bg-transparent dark:text-[#f0cd7b] border-b border-gray-300 focus:outline-none focus:border-blue-500 text-gray-800 placeholder-gray-400 py-1 text-2xl"
                  />
                ) : (
                  <h1 className="text-2xl font-medium text-gray-900 dark:text-[#f0cd7b] mb-2">{vin.Nom}</h1>
                )}
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <i className="pi pi-building text-gray-500 dark:text-gray-400" style={{ fontSize: '1rem' }}></i>
                    <input
                      type="text"
                      variant="standard"
                      name="Domaine"
                      value={vin.Domaine || ''}
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                      placeholder='Domaine'
                      className="w-full bg-transparent dark:text-[#f0cd7b] border-b border-gray-300 focus:outline-none focus:border-blue-500 text-gray-800 placeholder-gray-400 py-1 text-md font-medium mt-2"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <i className="pi pi-building text-gray-500 dark:text-gray-400" style={{ fontSize: '1rem' }}></i>
                    <p className="text-md font-medium text-gray-800 dark:text-[#f0cd7b] mt-2">
                      Domaine : {vin.Domaine}
                    </p>
                  </div>
                )}

                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  {vin.Appellation} · {vin.Millesime} · {vin.Type}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                  <div className={`mb-4 ${!isEditing ? 'pb-1 border-b ' : ''}`}> {/*md:border-b-2*/}
                    <label
                      className={`block text-sm font-semibold mb-1 ${isEditing
                        ? 'text-gray-600 dark:text-gray-400'
                        : 'text-gray-800 dark:text-gray-300'
                        }`}
                    >Pays :</label>
                    {isEditing ? (
                      <CreatableSelect
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
                          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                        }}
                        classNamePrefix="Pays"
                        value={vin?.Pays ? { label: vin.Pays, value: vin.Pays } : null}
                        isClearable={isClearable}
                        isSearchable={isSearchable}
                        name="Nom_Fr"
                        placeholder="Pays"
                        options={optionsPays}
                        onChange={handleCountryChange}
                        formatCreateLabel={(inputValue) => `Créer "${inputValue}"`}
                      />
                    ) : (
                      <p className="text-md text-gray-500 dark:text-gray-400">{vin.Pays || '-'}</p>
                    )}
                  </div>
                  <div className={`mb-4 ${!isEditing ? 'pb-1 border-b' : ''}`}>
                    <label
                      className={`block text-sm font-semibold mb-1 ${isEditing
                        ? 'text-gray-600 dark:text-gray-400'
                        : 'text-gray-800 dark:text-gray-300'
                        }`}
                    >Région :</label>
                    {isEditing ? (
                      <CreatableSelect
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
                          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                        }}
                        classNamePrefix="Région"
                        value={vin?.Région ? { label: vin.Région, value: vin.Région } : null}
                        isClearable={isClearable}
                        isSearchable={isSearchable}
                        name="Nom_Fr"
                        placeholder="Région"
                        options={filteredRegions}
                        onChange={(selectedOption) => handleInputChange(selectedOption?.label || '', 'Région')}
                        formatCreateLabel={(inputValue) => `Créer "${inputValue}"`}
                      />
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">{vin.Région || '-'}</p>
                    )}
                  </div>

                  <div className={`mb-4 ${!isEditing ? 'pb-1 border-b' : ''}`}>
                    <label
                      className={`block text-sm font-semibold mb-1 ${isEditing
                        ? 'text-gray-600 dark:text-gray-400'
                        : 'text-gray-800 dark:text-gray-300'
                        }`}
                    >Sous région :</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="Sous_Region"
                        value={vin.Sous_Region || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 bg-white dark:bg-[#2b2b2b] border border-gray-300 dark:border-[#444] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#888]"
                        placeholder="Sous région"
                      />
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">{vin.Sous_Region || '-'}</p>
                    )}
                  </div>

                  {[
                    ['Appellation', vin.Appellation],
                    ['Producteur', vin.Producteur],
                    ['Millesime', vin.Millesime],
                    ['Cépage', vin.Cepage],
                    ['Alcool', vin.Alcool],
                  ].map(([label, value], idx) => (
                    <div key={idx} className={`mb-4 ${!isEditing ? 'pb-1 border-b' : ''}`}>
                      <label
                        className={`block text-sm font-semibold mb-1 ${isEditing
                          ? 'text-gray-600 dark:text-gray-400'
                          : 'text-gray-800 dark:text-gray-300'
                          }`}
                      >
                        {label}
                      </label>

                      {isEditing ? (
                        <input
                          type="text"
                          name={label}
                          value={value || ''}
                          onChange={handleInputChange}
                          className="w-full p-2 bg-white dark:bg-[#2b2b2b] border border-gray-300 dark:border-[#444] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#888]"
                        />
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">{value || '-'}</p>
                      )}
                    </div>
                  ))}
                  <div className={`mb-4 ${!isEditing ? 'pb-1 border-b ' : ''}`}>
                    <label
                      className={`block text-sm font-semibold mb-1 ${isEditing
                        ? 'text-gray-600 dark:text-gray-400'
                        : 'text-gray-800 dark:text-gray-300'
                        }`}
                    >
                      Couleur
                    </label>
                    {isEditing ? (
                      <CreatableSelect
                        classNamePrefix="Couleur"
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
                          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                        }}
                        value={vin?.Couleur ? { label: vin.Couleur, value: vin.Couleur } : null}
                        isClearable={isClearable}
                        isSearchable={isSearchable}
                        placeholder="Couleur"
                        options={optionCouleur}
                        onChange={(selectedOption) => handleInputChange(selectedOption?.value || selectedOption?.label || '', 'Couleur')}
                        formatCreateLabel={(inputValue) => `Créer "${inputValue}"`}
                      />
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">{vin.Couleur || '-'}</p>
                    )}
                  </div>

                  <div className={`mb-4 ${!isEditing ? 'pb-1 border-b ' : ''}`}>
                    <label
                      className={`block text-sm font-semibold mb-1 ${isEditing
                        ? 'text-gray-600 dark:text-gray-400'
                        : 'text-gray-800 dark:text-gray-300'
                        }`}
                    >
                      Type
                    </label>
                    {isEditing ? (
                      <CreatableSelect
                        classNamePrefix="Type"
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
                          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                        }}
                        value={vin?.Type ? { label: vin.Type, value: vin.Type } : null}
                        isClearable={isClearable}
                        isSearchable={isSearchable}
                        placeholder="Type"
                        options={optionTypeVin}
                        onChange={(selectedOption) => handleInputChange(selectedOption?.value || selectedOption?.label || '', 'Type')}
                        formatCreateLabel={(inputValue) => `Créer "${inputValue}"`}
                      />
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">{vin.Type || '-'}</p>
                    )}
                  </div>



                  <div className={`mb-4 ${!isEditing ? 'pb-1 border-b ' : ''}`}>
                    <label
                      className={`block text-sm font-semibold mb-1 ${isEditing
                        ? 'text-gray-600 dark:text-gray-400'
                        : 'text-gray-800 dark:text-gray-300'
                        }`}
                    >
                      Valeur (€)
                    </label>
                    {isEditing ? (
                      <>
                        <input
                          type={isEditing ? 'number' : 'text'}
                          name="Valeur"
                          value={
                            !isEditing
                              ? vin.Valeur?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) || ''
                              : vin.Valeur || ''
                          }
                          onChange={handleInputChange}
                          readOnly={!isEditing}
                          className="w-full p-2 bg-white dark:bg-[#2b2b2b] border border-gray-300 dark:border-[#444] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#888]"
                        />
                      </>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">{vin.Valeur?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) || '-'}</p>
                    )}
                  </div>

                  <div className={`mb-4 ${!isEditing ? 'pb-1 border-b ' : ''}`}>
                    <label
                      className={`block text-sm font-semibold mb-1 ${isEditing
                        ? 'text-gray-600 dark:text-gray-400'
                        : 'text-gray-800 dark:text-gray-300'
                        }`}
                    >
                      Cave
                    </label>
                    {isEditing ? (
                      <>
                        <div className="flex items-center gap-2 w-full">
                          <Select
                            classNamePrefix="Cave"
                            styles={{
                              control: (baseStyles, state) => ({
                                ...baseStyles,
                                boxShadow: state.isFocused ? '0 0 0 1px grey' : 'none',
                                borderRadius: '0',
                                backgroundColor: darkMode ? '#2b2b2b' : 'white',
                                color: darkMode ? 'white' : 'black',
                                border: `1px solid ${darkMode ? '#444' : '#ccc'} !important`,
                              }),
                              singleValue: (baseStyles) => ({
                                ...baseStyles,
                                color: darkMode ? 'white' : 'black',
                              }),
                              menu: (baseStyles) => ({
                                ...baseStyles,
                                backgroundColor: darkMode ? '#2b2b2b' : 'white',
                              }),
                              option: (baseStyles, state) => ({
                                ...baseStyles,
                                backgroundColor: state.isFocused
                                  ? (darkMode ? '#444' : '#f0f0f0')
                                  : (darkMode ? '#2b2b2b' : 'white'),
                                color: darkMode ? 'white' : 'black',
                              }),
                            }}
                            value={distinctCaves.find((option) => option.value === vin?.Cave) || null}
                            isClearable={isClearable}
                            isSearchable={isSearchable}
                            name="Cave"
                            placeholder="Cave"
                            options={distinctCaves}
                            onChange={(selectedOption) => handleInputChange(selectedOption?.value || '', 'Cave')}
                          />
                          {/* <button
                            onClick={() => setShowAddCaveDialog(true)}
                            className="p-1 text-gray-500 bg-gray-200 rounded-full hover:bg-gray-300 hover:text-gray-700 transition-all duration-200"
                            title="Ajouter une cave"
                          >
                            +
                          </button> */}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">{vin.Cave || '-'}</p>
                    )}
                  </div>

                  {/* Étagère */}
                  <div className={`mb-4 ${!isEditing ? 'pb-1 border-b ' : ''}`}>
                    <label
                      className={`block text-sm font-semibold mb-1 ${isEditing
                        ? 'text-gray-600 dark:text-gray-400'
                        : 'text-gray-800 dark:text-gray-300'
                        }`}
                    >
                      Lieu de stockage
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="Etagere"
                        value={vin.Etagere || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 bg-white dark:bg-[#2b2b2b] border border-gray-300 dark:border-[#444] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#888] rounded"
                        placeholder="Étagère"
                      />
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">{vin.Etagere || '-'}</p>
                    )}
                  </div>






                  <div className={`mb-4 ${!isEditing ? 'pb-1 border-b ' : ''}`}>
                    {/* <label className="block text-gray-700 font-medium mb-2">Note</label> */}
                    <label
                      className={`block text-sm font-semibold mb-1 ${isEditing
                        ? 'text-gray-600 dark:text-gray-400'
                        : 'text-gray-800 dark:text-gray-300'
                        }`}
                    >Note</label>
                    {isEditing ? (
                      <>
                        <div className="flex items-center gap-4">
                          {/*<Slider
                            value={vin?.Note_sur_20 || 0}//value={vin.Note_sur_20}
                            onChange={(e) => isEditing && setVin({ ...vin, Note_sur_20: e.value })}
                            min={83} max={100} step={1} disabled={!isEditing} className="w-full"
                          />*/}

                          {/* <Rating value={vin?.Note_sur_20 || 0}//value={vin.Note_sur_20}
                            onChange={(e) => isEditing && setVin({ ...vin, Note_sur_20: e.value })}
                            cancel={false} />*/}
                          <ReactStars
                            count={5}
                            onChange={(newRating) =>
                              isEditing &&
                              setVin({ ...vin, Note_sur_20: newRating * 4 }) 
                            } size={24}
                            isHalf={true}
                            value={(vin.Note_sur_20 || 0)/4}
                            edit={isEditing}
                            emptyIcon={<i className="far fa-star" />}
                            halfIcon={<i className="fas fa-star-half-alt" />}
                            filledIcon={<i className="fas fa-star" />}
                            activeColor="#ffd700"
                          />
                          <span className="text-lg font-semibold w-12 text-center dark:text-white">{vin.Note_sur_20}/20</span>

                        </div>

                        <div className="text-sm text-gray-400 mt-1 italic">
                          {getNoteDescription(vin.Note_sur_20)}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">{vin.Note_sur_20 || '-'}/20 ({getNoteDescription(vin.Note_sur_20)})</p>
                    )}
                  </div>

                  {/* Section Association vin */}
                  {(associationsMets.length > 0 || associationMetsList.length > 0) && (
                    <div className={`mb-4 ${!isEditing ? 'pb-1 border-b' : ''}`}>
                      <label
                        className={`block text-sm font-semibold mb-1 ${isEditing
                          ? 'text-gray-600 dark:text-gray-400'
                          : 'text-gray-800 dark:text-gray-300'
                          }`}
                      >Association vin :</label>

                      {isEditing ? (
                        <>
                          {associationsMets.length > 0 && (
                            <div className="mb-2">
                              {/* <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Suggestions personnalisées :</p> */}
                              <div className="flex flex-wrap gap-1">
                                {associationsMets.map((met, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800"
                                  >
                                    {met.nomMet}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {/*
                          <textarea
                          name="Association_Mets"
                          value={vin.Association_Mets || ''}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full p-2 bg-white dark:bg-[#2b2b2b] border border-gray-300 dark:border-[#444] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#888]"
                          placeholder="Associations avec les mets..."
                        />*/}
                        </>

                      ) : (
                        <div>
                          {/* Affichage des mets de l'API */}
                          {associationsMets.length > 0 && (
                            <div className="mb-2">
                              {/* <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Suggestions personnalisées :</p> */}
                              <div className="flex flex-wrap gap-1">
                                {associationsMets.map((met, index) => (
                                  <button
                                    key={index}
                                    onClick={() => handleMetClick(met)}
                                    disabled={loadingRecipeForMet === met.nomMet}
                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs border transition-colors cursor-pointer ${loadingRecipeForMet === met.nomMet
                                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                                      : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800 hover:bg-green-200 dark:hover:bg-green-800/50'
                                      }`}
                                  >
                                    {loadingRecipeForMet === met.nomMet ? (
                                      <>
                                        <div className="animate-spin rounded-full h-3 w-3 border border-blue-600 border-t-transparent mr-1"></div>
                                        Chargement...
                                      </>
                                    ) : (
                                      met.nomMet
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Affichage des mets du champ Association_Mets
                          {associationMetsList.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Autres suggestions :</p>
                              <div className="flex flex-wrap gap-1">
                                {associationMetsList.map((mets, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                                  >
                                    {mets}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          //{/* Si aucune association /}
                          {associationsMets.length === 0 && associationMetsList.length === 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">Aucune association disponible</p>
                          )}*/}
                        </div>
                      )}
                    </div>
                  )}

                  <textarea
                    value={vin.Remarques}
                    name="Remarques"
                    disabled={!isEditing}
                    rows={4}
                    className="mb-4 w-full p-2 bg-white dark:bg-[#2b2b2b] border border-gray-300 dark:border-[#444] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#888] col-span-1 md:col-span-2"
                    placeholder="Description..."
                    onChange={handleInputChange}
                  />

                  <div className="flex items-center border border-gray-400 px-4 py-2 w-fit select-none dark:border-[#444]">
                    <button
                      // onClick={() => setVin({ ...vin, Qte: Math.max((vin.Qte || 0) - 1, 0) })}
                      onClick={() => {
                        const newQte = Math.max((vin.Qte || 0) - 1, 0);
                        handleInputChange(newQte, 'Qte');
                      }}
                      disabled={!isEditing}
                      className="text-xl font-light px-2 hover:text-blue-600 disabled:text-gray-300 dark:text-white"
                    > − </button>
                    <input
                      type="number"
                      min="0"
                      value={vin.Qte || 0}
                      onChange={(e) => {
                        const newQte = Math.max(parseInt(e.target.value || '0', 10), 0);
                        isEditing && handleInputChange(newQte, 'Qte');
                      }}
                      readOnly={!isEditing}
                      className="no-spinner mx-4 w-12 text-center bg-transparent text-md font-medium text-black focus:outline-none dark:text-white"
                    />
                    <button
                      //onClick={() => setVin({ ...vin, Qte: (vin.Qte || 0) + 1 })}
                      onClick={() => {
                        const newQte = (vin.Qte || 0) + 1;
                        handleInputChange(newQte, 'Qte');
                      }}
                      disabled={!isEditing}
                      className="text-xl font-light px-2 hover:text-blue-600 disabled:text-gray-300 dark:text-white"
                    > + </button>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-black text-white text-sm font-semibold hover:bg-gray-800 transition dark:text-black dark:hover:bg-[#ffde9b] dark:transition dark:bg-[#ffde9b] dark:text-black hover:scale-105 dark:hover:scale-100 transition-all duration-300"
                      >
                        Enregistrer
                      </button>
                      <button
                        onClick={handleCancel} // Appeler handleCancel lors du clic
                        className="px-6 py-2 border border-gray-700 text-gray-800 dark:text-white text-sm hover:bg-gray-100 dark:hover:bg-[#2b2b2b] transition"
                      >
                        Annuler
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-2 bg-green-200 border border-gray-700 text-gray-800 dark:hover:text-white text-sm hover:bg-green-100 dark:hover:bg-[#2b2b2b] transition"
                    >
                      Modifier
                    </button>
                  )}
                </div>

                {/* Dialog suppression */}
                <Dialog
                  visible={showDeleteDialog}
                  onHide={() => setShowDeleteDialog(false)}
                  header="Confirmation de suppression"
                  className="max-w-md"
                  footer={
                    <div className="flex gap-3 justify-end p-4">
                      <button
                        className="px-4 py-2 border rounded border-gray-300 text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowDeleteDialog(false)}
                      >
                        Annuler
                      </button>
                      <button
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        onClick={handleDelete}
                      >
                        Confirmer
                      </button>
                    </div>
                  }
                >
                  <div className="flex items-center gap-4 p-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                      <i className="pi pi-exclamation-triangle text-orange-600 dark:text-orange-400 text-xl"></i>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">Supprimer ce vin</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Cette action est irréversible.</p>
                    </div>
                  </div>
                </Dialog>

                {/* <div className="mt-4">
                  <FileUpload
                    name="demo[]"
                    mode='basic'
                    chooseLabel="Importer une image"
                    accept="image/*"
                    maxFileSize={12000000}
                    customUpload={true}
                    onSelect={customBase64Uploader}
                    className="p-button-secondary"
                  />
                </div> */}
              </div>
            </div>

            <div> {/*<div className="mt-4 w-full mx-auto dadrk:bg-[#1e1e1e] dark:bg-opacity-90 rounded-2xl dark:shadow-lg dark:text黑色 dark:border  dark:bg-[#2a2a2a] dark:text白色 ">*/}
              <VinTabs vin={vin} setVin={setVin} isEditing={isEditing} handleInputChange={handleInputChange} />
            </div>

            <Dialog
              visible={showAddCaveDialog}
              onHide={() => setShowAddCaveDialog(false)}
              header="Ajouter une nouvelle cave"
              footer={addCaveDialogFooter}
            >
              <input
                type="text"
                value={newCaveName}
                onChange={(e) => setNewCaveName(e.target.value)}
                placeholder="Nom de la cave"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </Dialog>
          </div>
        )
        }
      </div >
    </Layout>
  );

};



export default Vin;
