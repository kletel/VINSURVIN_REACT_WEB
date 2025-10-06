import { useState, useCallback } from 'react';
import config from '../config/config';
import authHeader from '../config/authHeader';
import { handleTokenInvalidError } from '../hooks/useAuth';

const useFetchPlats = () => {

    const [platsCarte, setPlatsCarte] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    const fetchPlats = useCallback(async (uuid) => {
        try {
            const response = await fetch(`${config.apiBaseUrl}/4DACTION/react_getPlatCarte?UUID_=${uuid}`, {
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
            setPlatsCarte(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, []); // Dépendances vides pour éviter la recréation de la fonction

    return { platsCarte, fetchPlats };
}

export default useFetchPlats;
