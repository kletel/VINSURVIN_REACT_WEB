import { useState, useCallback } from 'react';
import config from '../config/config';
import authHeader from '../config/authHeader';

const useFetchFavoris = () => {
    const [favoris, setFavoris] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const UUIDuser = sessionStorage.getItem('uuid_user');

    const fetchFavoris = useCallback(async () => {
        try {
            const response = await fetch(`${config.apiBaseUrl}/4DACTION/react_getCavesFavoris?UUID_=${UUIDuser}`, {
                method: 'GET',
                headers: authHeader()
            });

            if (!response.ok) {
                throw new Error('Une erreur est survenue lors de la récupération des favoris.');
            }

            const data = await response.json();
            setFavoris(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    return { favoris, fetchFavoris, error, loading };
};

export default useFetchFavoris;
