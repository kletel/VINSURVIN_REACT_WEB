import { useState, useCallback } from 'react';
import config from '../config/config';
import authHeader from '../config/authHeader';
import { handleTokenInvalidError } from '../hooks/useAuth';
import { data } from 'react-router-dom';
const useFetchCaves = () => {
  const [caves, setCaves] = useState([]);
  const [cave, setCave] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  //const { UUIDuser } = useAuth();
  const UUIDuser = sessionStorage.getItem('uuid_user'); // Récupérer directement depuis sessionStorage

  const fetchCaves = useCallback(async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/4DACTION/react_getCaves?UUID_=${UUIDuser}`, { //sessionStorage.getItem('uuid_user');
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
      setCaves(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []); // Dépendances vides pour éviter la recréation de la fonction

  const fetchCave = useCallback(async (uuid) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/4DACTION/react_getCave?UUID_=${uuid}`, {
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
      setCave(data);
      console.log('fetchCave', data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }

  }, []); // Dépendances vides pour éviter la recréation de la fonction

  return { caves, cave, error, loading, fetchCaves, fetchCave };
};

export default useFetchCaves;
