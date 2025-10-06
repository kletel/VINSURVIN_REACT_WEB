import { useState, useCallback } from 'react';
import config from '../config/config';
import authHeader from '../config/authHeader';

const useFetchCepages = () => {
    const [cepages, setCepages] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchCepages = useCallback(async () => {
        try {
            const response = await fetch(`${config.apiBaseUrl}/4DACTION/react_getCepages`, {
                method: 'GET',
                headers: authHeader()
            });

            if (!response.ok) {
                throw new Error('Une erreur est survenue lors de la récupération des cépages.');
            }

            const data = await response.json();
            setCepages(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    return { cepages, fetchCepages, error, loading };
};

export default useFetchCepages;
