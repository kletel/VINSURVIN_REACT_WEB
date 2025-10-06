import { useState, useCallback } from 'react';
import config from '../config/config';
import authHeader from '../config/authHeader';
import { handleTokenInvalidError } from '../hooks/useAuth';

const useFetchAssociations = () => {
  const [associations, setAssociations] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAssociations = useCallback(async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/4DACTION/react_getAssociations`, {
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
      setAssociations(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { associations, error, loading, fetchAssociations };
};

export default useFetchAssociations;
