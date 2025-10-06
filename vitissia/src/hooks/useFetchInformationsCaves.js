import { useState, useCallback } from 'react';
import config from '../config/config';
import authHeader from '../config/authHeader';
import { handleTokenInvalidError } from '../hooks/useAuth';

const useFetchInformationsCaves = () => {
    const [informations, setInformations] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchInformationsCaves = useCallback(async () => {
        try {
            const response = await fetch(`${config.apiBaseUrl}/4DACTION/react_getInformationsCaves`, {
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
            setInformations(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    return { informations, error, loading, fetchInformationsCaves };
};

export default useFetchInformationsCaves;
