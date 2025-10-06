import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import useFetchCaves from '../hooks/useFetchCaves';
import { ProgressBar } from 'primereact/progressbar';
import { Rating } from 'primereact/rating';
import VinTabs from '../components/VinTabs';
import authHeader from '../config/authHeader';
import { FileUpload } from 'primereact/fileupload';
import config from '../config/config';
import { Toast } from 'primereact/toast'

const Vin = () => {
  /*****      Déclaration constantes    *******/
  const { UUID_ } = useParams();
  const { cave, error, loading, fetchCave, fetchCaves } = useFetchCaves();
  // Utiliser un état local pour gérer les modifications
  const [vin, setVin] = useState(null) // Initialisation avec les données récupérées
  const [initialVin, setInitialVin] = useState(cave);  // Pour stocker les valeurs initiales
  const [isEditing, setIsEditing] = useState(false); //ajout de l'etat, afin de savoir si mode edition
  const stepperRef = useRef(null);
  const toast = useRef(null)

  useEffect(() => {
    fetchCave(UUID_);
  }, [UUID_, fetchCave]);

  useEffect(() => {
    setVin(cave);
    setInitialVin(cave);  // Mettre à jour les valeurs initiales lorsque `cave` change
  }, [cave]);

  const handleToggleEdit = () => {
    setIsEditing(!isEditing);  // Basculer entre édition et lecture seule
  };

  // Fonction pour récupérer uniquement les champs modifiés
  const getModifiedFields = () => {
    const modifiedFields = {};
    Object.keys(vin).forEach((key) => {
      if (vin[key] !== initialVin[key]) {
        modifiedFields[key] = vin[key];  // Ajouter uniquement les champs modifiés
      }
    });

    return modifiedFields;
  };

  // Gérer les changements dans les champs
  /*const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVin((prevVin) => ({
      ...prevVin,
      [name]: value,  // Mettre à jour uniquement le champ modifié
    }));
  };*/
  const handleInputChange = (e, customName) => {
    if (customName) {
      // Cas où un composant personnalisé passe directement la valeur
      setVin((prevVin) => ({
        ...prevVin,
        [customName]: e, // Utiliser la valeur directement
      }));
    } else if (e && e.target) {
      // Cas standard pour les champs HTML
      const { name, value } = e.target;
      setVin((prevVin) => ({
        ...prevVin,
        [name]: value, // Mettre à jour uniquement le champ modifié
      }));
    } else {
      console.error("handleInputChange: événement non pris en charge", e);
    }
  };

  const customBase64Uploader = (event) => {
    const file = event.files[0];

    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);  // Convertit en Base64
      reader.onload = () => {
        //vin.base64_etiquette = reader.result;  // Met à jour le vin avec l'image
        const base64String = reader.result.split(',')[1]; // Enlève le préfixe
        //setImageBase64(base64String);  // Met à jour l'image
        setVin((prevVin) => ({
          ...prevVin,
          base64_etiquette: base64String, // Met à jour directement l’objet `vin`
        }));
      };
    }
  };
  // Envoi des modifications
  const handleSave = async () => {
    try {
      /*
      // Vérifier si la note doit être multipliée par 5 avant l'envoi
      const savedVin = { ...vin };
      if (savedVin.Note_sur_20 <= 5) {
        savedVin.Note_sur_20 = savedVin.Note_sur_20 * 5;
      }*/
      const modifiedVin = getModifiedFields();  // Obtenir uniquement les champs modifiés

      const modifiedVinJson = JSON.stringify(modifiedVin);

      // Vérifier si des modifications ont été faites
      if (Object.keys(modifiedVin).length === 0) {
        toast.current.show({ severity: 'Secondary', summary: 'Secondary', detail: "Aucune modification n'a été apportée.", life: 3000 });
        //alert("Aucune modification n'a été apportée.");
        return;
      };
      const uuid = vin.UUID_;
      const formData = new FormData();
      formData.append("UUID_", uuid);
      formData.append("champsModif", modifiedVinJson);
      const response = await fetch(`${config.apiBaseUrl}/4DACTION/react_putCave?UUID_=${uuid}`, {
        //const response = await fetch(`/4DACTION/react_putCave?UUID_=${uuid}`, {
        method: 'PUT',  // ou 'PATCH' selon l'API
        headers: authHeader(),
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde');
      }

      const updatedCave = await response.json();
      setVin(updatedCave);  // Mettre à jour vin avec la réponse du serveur
      setInitialVin(updatedCave);
      setIsEditing(false);  // Passer en mode lecture seule
      toast.current.show({ severity: 'success', summary: 'Success', detail: 'Modifications enregistrées avec succès', life: 3000 });
      //alert('Modifications enregistrées avec succès');
      fetchCave(uuid);  // Récupérer les dernières données du serveur
      fetchCaves();
    } catch (error) {
      toast.current.show({ severity: 'warn', summary: 'Warning', detail: "Erreur lors de la sauvegarde", life: 3000 });
      //alert('Erreur de sauvegarde: ' + error.message);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Chargement...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen">Erreur: {error}</div>;
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      <Toast ref={toast} />
      {vin ? (
        <>

          <div className="flex flex-col items-center gap-4 p-4 rounded-2xl shadow-lg bg-white w-full max-w-6xl">
            <div className="flex-col items-center justify-center">
              <img
                src={`data:image/jpeg;base64,${vin.base64_etiquette}`}
                alt="Cave Image"
                className="w-48 h-48 object-contain shadow-xl rounded-md items-center justify-center transition-transform duration-300 ease-in-out hover:scale-105"
              />
              {isEditing && (
                <div className="card flex flex-column items-center justify-center mt-4">
                  <FileUpload
                    name="demo[]"
                    mode='basic'
                    chooseLabel="Importer une image"
                    accept="image/*"
                    maxFileSize={1000000}
                    customUpload={true}
                    onSelect={customBase64Uploader}
                    style={{ alignItems: 'center', justifyContent: 'center' }}
                    emptyTemplate={<p className="m-0">Drag and drop ou importer un fichier.</p>}
                  />
                </div>
              )}
            </div>
            <div className="w-full">
              <div className="mb-4">
                <label className="block text-gray-700 font-bold text-sm md:text-base">Nom:</label>
                <input
                  type="text"
                  name="Nom"
                  value={vin.Nom}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  className="w-full p-1 md:p-2 border border-gray-300 rounded-md bg-gray-100 text-sm md:text-base"
                />
              </div>
              <div className="lex w-full grid grid-cols-2 sm:grid-cols-2 gap-4">
                <div >
                  <label className="block text-gray-700 font-bold text-sm md:text-base">Appellation:</label>
                  <input
                    type="text"
                    name="Appellation"
                    value={vin.Appellation}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    className="w-full p-1 md:p-2 border border-gray-300 rounded-md bg-gray-100 text-sm md:text-base"
                  />
                </div>
                <div >
                  <label className="block text-gray-700 font-bold text-sm md:text-base">Type:</label>
                  <input
                    type="text"
                    name="Type"
                    value={vin.Type}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    className="w-full p-1 md:p-2 border border-gray-300 rounded-md bg-gray-100 text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold text-sm md:text-base">Pays:</label>
                  <input
                    type="text"
                    name="Pays"
                    value={vin.Pays}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    className="w-full p-1 md:p-2 border border-gray-300 rounded-md bg-gray-100 text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold text-sm md:text-base">Région:</label>
                  <input
                    type="text"
                    name="Région"
                    value={vin.Région}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    className="w-full p-1 md:p-2 border border-gray-300 rounded-md bg-gray-100 text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold text-sm md:text-base">Millésime:</label>
                  <input
                    type="text"
                    name="Millesime"
                    value={vin.Millesime}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    className="w-full p-1 md:p-2 border border-gray-300 rounded-md bg-gray-100 text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold text-sm md:text-base">Valeur:</label>
                  <input
                    type="text"
                    name="Valeur_Euro"
                    value={vin.Valeur_Euro ? vin.Valeur_Euro.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) : 'N/A'}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    className="w-full p-1 md:p-2 border border-gray-300 rounded-md bg-gray-100 text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold text-sm md:text-base">Couleur:</label>
                  <input
                    type="text"
                    name="Couleur"
                    value={vin.Couleur}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    className="w-full p-1 md:p-2 border border-gray-300 rounded-md bg-gray-100 text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold text-sm md:text-base">Alcool:</label>
                  <input
                    type="text"
                    name="Alcool"
                    value={vin.Alcool}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    className="w-full p-1 md:p-2 border border-gray-300 rounded-md bg-gray-100 text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold text-sm md:text-base">Cépage:</label>
                  <input
                    type="text"
                    name="Cepage"
                    value={vin.Cepage}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    className="w-full p-1 md:p-2 border border-gray-300 rounded-md bg-gray-100 text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold text-sm md:text-base">Note:</label>
                  <Rating value={vin.Note_sur_20 > 5 ? vin.Note_sur_20 / 5 : vin.Note_sur_20}//value={vin.Note_sur_20 / 5}
                    name="Note_sur_20"
                    onChange={handleInputChange}
                    readOnly={!isEditing} cancel={false} />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold text-sm md:text-base">Reste en Cave:</label>
                  <ProgressBar value={vin.Reste_en_Cave} showValue={true} name="Reste_en_Cave" />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold text-sm md:text-base">Remarques:</label>
                <textarea
                  type="text"
                  name="Remarques"
                  value={vin.Remarques}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  className="w-full p-1 md:p-2 border border-gray-300 rounded-md bg-gray-100 text-sm md:text-base"
                />
              </div>
            </div>
          </div>
          {/* Boutons Modifier et Sauvegarder */}
          <div className="mt-4 bg-gray-100 p-4 w-full max-w-6xl flex justify-center">
            <button
              onClick={handleToggleEdit}
              className="bg-blue-500 text-white font-semibold px-4 py-2 rounded-md shadow-md hover:scale-105 hover:bg-blue-600 transition-all duration-300"
            >
              {isEditing ? 'Annuler' : 'Modifier'}
            </button>
            {isEditing && (
              <button
                onClick={handleSave}
                className="ml-3 px-6 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition-all duration-300 ease-in-out hover:scale-105 active:scale-95"
              >
                Sauvegarder
              </button>
            )}
          </div>
          <div className="mt-4 w-full max-w-6xl">
            <VinTabs vin={vin} isEditing={isEditing} handleInputChange={handleInputChange} />
          </div>


        </>
      ) : (
        <div className="p-4 text-center text-gray-500">Vin non trouvé</div>
      )}
    </div>
  );
};

export default Vin;