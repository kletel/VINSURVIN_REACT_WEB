import { useState, useCallback } from 'react';
import config from '../config/config';
import authHeader from '../config/authHeader';
import { handleTokenInvalidError } from '../hooks/useAuth';

const useFetchMillesimes = () => {
  const [millesimes, setMillesimes] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMillesimes = useCallback(async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/4DACTION/react_getMillesimes`, {
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
      setMillesimes(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []); // Dépendances vides pour éviter la recréation de la fonction

  return { millesimes, error, loading, fetchMillesimes };
};

export default useFetchMillesimes;
