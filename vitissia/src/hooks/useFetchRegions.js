import { useState, useCallback } from 'react';
import config from '../config/config';
import authHeader from '../config/authHeader';
import { handleTokenInvalidError } from '../hooks/useAuth';

const useFetchRegions = () => {
  const [regions, setRegions] = useState([]);
  const [region, setRegion] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRegions = useCallback(async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/4DACTION/react_getRegions`, {
        method: 'GET',
        headers: authHeader()
      });

      if (response.status === 401) {
        handleTokenInvalidError();
      }
      if (!response.ok) {
        throw new Error('Une erreur est survenue');
      }

      const data = await response.json();
      setRegions(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []); // Dépendances vides pour éviter la recréation de la fonction

  const fetchRegion = useCallback(async (uuid) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/4DACTION/react_getRegion?UUID_=${uuid}`, {
        method: 'GET',
        headers: authHeader()
      });
      if (response.status === 401) {
        handleTokenInvalidError();
      }
      if (!response.ok) {
        throw new Error('Une erreur est survenue');
      }
      const data = await response.json();
      setRegion(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []); // Dépendances vides pour éviter la recréation de la fonction

  const ajouterRegionIA = useCallback(async (pays, region) => {
    try {
      const formData = new FormData();
      formData.append('nomPays', pays);
      formData.append('nomRegion', region);
      const response = await fetch(`${config.apiBaseUrl}/4DACTION/react_addRegionIA`, {
        method: 'POST',
        headers: authHeader(),
        body: formData,
      });

      if (response.status === 401) {
        handleTokenInvalidError();
      }
      if (!response.ok) {
        throw new Error('Une erreur est survenue lors de l\'ajout de la région');
      }

      const data = await response.json();
      return data; // Retourner la réponse si nécessaire
    } catch (error) {
      setError(error.message);
      throw error; // Relancer l'erreur pour la gestion externe
    }
  }, []); // Dépendances vides pour éviter la recréation de la fonction

  return { regions, region, error, loading, fetchRegions, fetchRegion, ajouterRegionIA };
};

export default useFetchRegions;
