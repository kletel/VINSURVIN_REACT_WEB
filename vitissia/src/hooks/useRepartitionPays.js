import { useState, useCallback } from 'react';
import config from '../config/config';
import authHeader from '../config/authHeader';
import { handleTokenInvalidError } from './useAuth'; // Correction de l'importation

const useRepartitionPays = () => {
    const [repartition, setRepartition] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const UUIDuser = sessionStorage.getItem('uuid_user'); // Récupérer directement depuis sessionStorage

    const fetchRepartitionPays = useCallback(async () => {
        try {
            const response = await fetch(`${config.apiBaseUrl}/4DACTION/react_getRepartitionPays?UUID_=${UUIDuser}`, {
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
            setRepartition(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, []); // Dépendances vides pour éviter la recréation de la fonction

    return { repartition, error, loading, fetchRepartitionPays };
};

export default useRepartitionPays; // Vérifiez que l'exportation est correcte
