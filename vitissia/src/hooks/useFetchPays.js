import { useState, useCallback } from 'react';
import config from '../config/config';
import authHeader from '../config/authHeader';
import { handleTokenInvalidError } from '../hooks/useAuth';
const useFetchPays = () => {
  const [lesPays, setLesPays] = useState([]);
  const [pays, setPays] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLesPays = useCallback(async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/4DACTION/react_getLesPays`, {
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
      //setLesPays(data.sort((a, b) => a.localeCompare(b)));
      setLesPays(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []); // Dépendances vides pour éviter la recréation de la fonction

  const fetchPays = useCallback(async (uuid) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/4DACTION/react_getLePays?UUID_=${uuid}`, {
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
      setPays(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []); // Dépendances vides pour éviter la recréation de la fonction

  return { lesPays, pays, error, loading, fetchLesPays, fetchPays };
};

export default useFetchPays;
