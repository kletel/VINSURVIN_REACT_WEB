import { useState, useCallback } from 'react';
import config from '../config/config';
import authHeader from '../config/authHeader';

const useFetchProducteurs = () => {
    const [producteurs, setProducteurs] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProducteurs = useCallback(async () => {
        try {
            const response = await fetch(`${config.apiBaseUrl}/4DACTION/react_getProducteurs`, {
                method: 'GET',
                headers: authHeader()
            });

            if (!response.ok) {
                throw new Error('Une erreur est survenue lors de la récupération des producteurs.');
            }

            const data = await response.json();
            setProducteurs(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    return { producteurs, fetchProducteurs, error, loading };
};

export default useFetchProducteurs;
