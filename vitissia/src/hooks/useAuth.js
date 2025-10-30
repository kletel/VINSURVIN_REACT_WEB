import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import authHeader from '../config/authHeader';
import config from '../config/config';

// Helper: decode JWT payload (base64url + padding) et renvoie les claims
const decodeJwtClaims = (token) => {
    try {
        const parts = (token || '').split('.');
        if (parts.length < 2) return null;
        const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const padded = b64.padEnd(b64.length + (4 - (b64.length % 4 || 4)) % 4, '=');
        return JSON.parse(atob(padded));
    } catch {
        return null;
    }
};

const useAuth = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [UUIDuser, setUUIDuser] = useState(null);

    const login = async () => {
        setError('');
        try {
            //debugger;
            const formData = new FormData();
            const deviceUUID = localStorage.getItem("deviceUUID") || sessionStorage.getItem("deviceUUID");
            if (deviceUUID) formData.append("deviceUUID", deviceUUID);

            formData.append('email', email);
            formData.append('password', password);
            const response = await fetch(`${config.apiBaseUrl}/4DACTION/react_AuthLogin`, { //fetch(`/4DACTION/KST_AuthLogin`, { //
                method: 'POST',
                headers: authHeader(),
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await response.json();

            if (response.ok && data.accessToken) {
                const token = data.accessToken;
                console.log('📦 Token reçu:', token);
                sessionStorage.setItem('token', token);

                const uuid = data.uuid_user
                const nomComplet = data.nom_user
                if (uuid) {
                    setUUIDuser(uuid);
                    sessionStorage.setItem('uuid_user', uuid);
                }
                if (nomComplet) {
                    sessionStorage.setItem('nom_user', nomComplet);
                }
                console.log("uuid", uuid, "nomComplet", nomComplet)
                navigate('/dashboard');

            } else {
                setError(data.response || 'Authentication failed');
            }
        } catch (err) {
            console.error("Failed to fetch:", err);
            setError('Failed to login. Please try again.');
        }
    };

    const loginMobile = async (tokenTemp, token) => {
        debugger;
        console.log('🔐 Début loginMobile avec tokenTemp/uuidTemp:', tokenTemp, 'et token:', token);
        setError('');

        try {
            const formData = new FormData();
            formData.append('uuidTemp', tokenTemp);
            if (token) {
                formData.append('token', token);
            }
            const response = await fetch(`${config.apiBaseUrl}/4DACTION/react_verifLoginMobile`, {
                method: 'POST',
                headers: authHeader(),
                body: formData,
            });
            debugger;
            console.log('📥 Réponse reçue, status:', response.status, 'ok:', response.ok);

            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status}`);
            }

            const data = await response.json();
            console.log('📄 Données reçues:', data);

            if (data.entete === "succes") {
                sessionStorage.setItem('token', token);
                setUUIDuser(data.uuidUser);
                sessionStorage.setItem('uuid_user', data.uuidUser);
                sessionStorage.setItem('nom_user', data.nomUser);
                navigate('/dashboard');

            } else {
                setError(data.message || 'Authentication mobile failed');
            }
        } catch (err) {
            console.error("💥 Erreur lors de la connexion mobile:", err);
            setError('Failed to login with mobile token. Please try again.');
            throw err;
        }
    };

    const logout = async () => {
        try {
            const isAppHost =
                (sessionStorage.getItem('APP_HOST') === 'rn') ||
                (localStorage.getItem('APP_HOST') === 'rn') ||
                (typeof window !== 'undefined' && window.ReactNativeWebView);

            if (isAppHost) {
                const deviceUUID =
                    sessionStorage.getItem('deviceUUID') || localStorage.getItem('deviceUUID');
                const token =
                    sessionStorage.getItem('token') || localStorage.getItem('token');

                if (deviceUUID && token) {
                    const formData = new FormData();
                    formData.append('deviceUUID', deviceUUID);

                    await fetch(`${config.apiBaseUrl}/4DACTION/react_logoutDevice`, {
                        method: 'POST',
                        headers: { Authorization: token },
                        body: formData,
                    });
                }

                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(
                        JSON.stringify({ type: 'LOGOUT' })
                    );
                }
            }
        } catch (e) {
            console.warn('logoutDevice failed:', e);
        } finally {
            const keys = ['token', 'uuid_user', 'nom_user', 'APP_HOST'];
            keys.forEach(k => {
                try { sessionStorage.removeItem(k); } catch { }
                try { localStorage.removeItem(k); } catch { }
            });

            navigate('/login');
        }
    };
    const isLoggedIn = () => {
        return !!sessionStorage.getItem('token');
        //return !!sessionStorage.getItem('isLoggedIn');
    };

    const getUserInfo = async () => {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) return null;

            const response = await fetch(`${config.apiBaseUrl}/4DACTION/react_getUserInfo?UUID_=`, {
                method: 'GET',
                headers: authHeader(),
            });

            if (!response.ok) {
                throw new Error('Impossible de récupérer les infos utilisateur');
            }
            const userData = await response.json();
            return {
                Prenom: userData.Prenom,
                admin: userData.Admin,
                UUID: userData.UUID,
                Nom: userData.Nom,
                Email: userData.Email,
            };
        } catch (error) {
            console.error("Erreur lors de la récupération des infos utilisateur", error);
            return null;
        }
    };


    return {
        email,
        setEmail,
        password,
        setPassword,
        error,
        login,
        loginMobile,
        logout,
        isLoggedIn,
        getUserInfo,
        UUIDuser,
    };
};

export default useAuth;

export const handleTokenInvalidError = (error) => {
    if (error.message === 'token invalide') {
        sessionStorage.removeItem('token');
        window.location.reload();
    }
};