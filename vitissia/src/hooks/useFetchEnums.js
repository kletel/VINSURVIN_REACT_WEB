import { useState, useCallback } from 'react';
import config from '../config/config';
import authHeader from '../config/authHeader';

const useFetchEnums = () => {
  const [enums, setEnums] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchEnums = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/4DACTION/react_getEnums?Langue=FR`, {
        method: 'GET',
        headers: authHeader(),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des énumérations');
      }

      const data = await response.json();
      setEnums(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { enums, error, loading, fetchEnums };
};

export default useFetchEnums;
