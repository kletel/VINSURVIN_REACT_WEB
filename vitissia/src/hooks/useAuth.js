import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import authHeader from '../config/authHeader';
import config from '../config/config';
import { fetchAndStoreIsInternal } from "../utils/internalAccess";

const decodeJwtClaims = (token) => {
    try {
        const parts = (token || '').split('.');
        if (parts.length < 2) return null;
        const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const padded = b64.padEnd(
            b64.length + ((4 - (b64.length % 4 || 4)) % 4),
            '='
        );
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

    const [user, setUser] = useState(null);
    const [UUIDuser, setUUIDuser] = useState(null);

    const loadUserInfo = useCallback(async () => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            setUser(null);
            return null;
        }

        const UUIDuser = sessionStorage.getItem('uuid_user');

        try {
            let url = `${config.apiBaseUrl}/4DACTION/react_getUserInfo`;
            if (UUIDuser) {
                url += `?UUID_user=${encodeURIComponent(UUIDuser)}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: authHeader(),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    handleTokenInvalidError(new Error('token invalide'));
                }
                throw new Error('Impossible de récupérer les infos utilisateur');
            }

            const userData = await response.json();

            const mapped = {
                uuid: userData.UUID,
                firstName: userData.Prenom,
                lastName: userData.Nom,
                email: userData.Email,
                admin: userData.Admin,
                adresse: userData.Adresse,
                societe: userData.Societe,
                codePostal: userData.CodePostal,
                etat: userData.Etat,
                pays: userData.Pays,
                ville: userData.Ville,
                numLicence: userData.NumLicence,
                remarqueProfile: userData.RemarqueProfile,
                telephone:
                    userData.Telephone ||
                    userData.telephone ||
                    userData.Phone ||
                    userData.phone ||
                    '',
            };

            setUser(mapped);

            if (mapped.uuid) {
                setUUIDuser(mapped.uuid);
                sessionStorage.setItem('uuid_user', mapped.uuid);
            }

            if (mapped.firstName || mapped.lastName) {
                sessionStorage.setItem(
                    'nom_user',
                    `${mapped.firstName || ''} ${mapped.lastName || ''}`.trim()
                );
            }

            return mapped;
        } catch (err) {
            console.error(
                'Erreur lors de la récupération des infos utilisateur',
                err
            );
            setUser(null);
            return null;
        }
    }, []);

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        if (token) {
            loadUserInfo();
        }
    }, [loadUserInfo]);

    const login = async () => {
        setError('');
        try {
            const formData = new FormData();
            const deviceUUID = localStorage.getItem("deviceUUID") || sessionStorage.getItem("deviceUUID");
            if (deviceUUID) formData.append("deviceUUID", deviceUUID);

            formData.append('email', email);
            formData.append('password', password);
            const response = await fetch(`${config.apiBaseUrl}/4DACTION/react_AuthLogin`, {
                method: 'POST',
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

                sessionStorage.setItem("email_user", email);

                await fetchAndStoreIsInternal({
                    apiBaseUrl: config.apiBaseUrl,
                    email,
                });

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
                const mapped = await loadUserInfo();
                const emailToCheck = mapped?.email;
                if (emailToCheck) {
                    sessionStorage.setItem("email_user", emailToCheck);
                    await fetchAndStoreIsInternal({ apiBaseUrl: config.apiBaseUrl, email: emailToCheck });
                }


                await fetchAndStoreIsInternal({
                    apiBaseUrl: config.apiBaseUrl,
                    email: mapped.email,
                });

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
            const keys = ['token','uuid_user','nom_user','APP_HOST','email_user','isInternal','SUBSCRIPTION'];
            keys.forEach(k => {
                try { sessionStorage.removeItem(k); } catch { }
                try { localStorage.removeItem(k); } catch { }
            });

            navigate('/login');
        }
    };
    const isLoggedIn = () => {
        return !!sessionStorage.getItem('token');
    };

    const getUserInfo = async () => {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) return null;

            const uuidFromStorage = sessionStorage.getItem('uuid_user');

            let url = `${config.apiBaseUrl}/4DACTION/react_getUserInfo`;
            if (uuidFromStorage) {
                url += `?UUID_user=${encodeURIComponent(uuidFromStorage)}`;
            }

            const response = await fetch(url, {
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
                societe: userData.Societe,
                adresse: userData.Adresse1 ?? userData.Adresse,
                codePostal: userData.CodePostal,
                etat: userData.Etat,
                pays: userData.Pays,
                ville: userData.Ville,
                numLicence: userData.NumLicence,
                remarqueProfile: userData.RemarqueProfile,
                telephone: userData.Telephone,
            };
        } catch (error) {
            console.error("Erreur lors de la récupération des infos utilisateur", error);
            return null;
        }
    };

    const updateProfile = async (fields) => {
        const token = sessionStorage.getItem('token');
        const uuid = sessionStorage.getItem('uuid_user');

        if (!token || !uuid) {
            throw new Error('Non authentifié');
        }

        const champsModif = {};

        if (fields.firstName !== undefined) champsModif.Prenom = fields.firstName;
        if (fields.lastName !== undefined) champsModif.Nom = fields.lastName;
        if (fields.email !== undefined) champsModif.Email = fields.email;

        if (fields.societe !== undefined) champsModif.Societe = fields.societe;
        if (fields.adresse !== undefined) champsModif.Adresse = fields.adresse;
        if (fields.codePostal !== undefined) champsModif.CodePostal = fields.codePostal;
        if (fields.etat !== undefined) champsModif.Etat = fields.etat;
        if (fields.pays !== undefined) champsModif.Pays = fields.pays;
        if (fields.ville !== undefined) champsModif.Ville = fields.ville;
        if (fields.numLicence !== undefined) champsModif.NumLicence = fields.numLicence;
        if (fields.remarqueProfile !== undefined) champsModif.RemarqueProfile = fields.remarqueProfile;
        if (fields.telephone !== undefined) champsModif.Telephone = fields.telephone;

        const formData = new FormData();
        formData.append('UUID_user', uuid);
        formData.append('token', token);
        formData.append('champsModif', JSON.stringify(champsModif));

        const headers = authHeader();
        if (headers['Content-Type']) {
            delete headers['Content-Type'];
        }

        const response = await fetch(
            `${config.apiBaseUrl}/4DACTION/react_putUserProfil`,
            {
                method: 'PUT',
                headers,
                body: formData,
            }
        );

        if (!response.ok) {
            const txt = await response.text().catch(() => '');
            console.error('Erreur updateProfile', response.status, txt);
            throw new Error("Impossible de mettre à jour le profil");
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        const updatedUser = {
            uuid: data.UUID,
            firstName: data.Prenom,
            lastName: data.Nom,
            email: data.Email,
            admin: data.Admin,

            societe: data.Societe,
            adresse: data.Adresse,
            codePostal: data.CodePostal,
            etat: data.Etat,
            pays: data.Pays,
            ville: data.Ville,
            numLicence: data.NumLicence,
            remarqueProfile: data.RemarqueProfile,
            telephone: data.Telephone,
        };

        setUser(updatedUser);

        if (updatedUser.uuid) {
            sessionStorage.setItem('uuid_user', updatedUser.uuid);
        }
        if (updatedUser.firstName || updatedUser.lastName) {
            sessionStorage.setItem(
                'nom_user',
                `${updatedUser.firstName || ''} ${updatedUser.lastName || ''}`.trim()
            );
        }

        return updatedUser;
    };

    const deleteAccount = async () => {
        const token = sessionStorage.getItem('token');
        const uuid = sessionStorage.getItem('uuid_user');

        const formData = new FormData();
        formData.append('UUID_user', uuid);
        formData.append('token', token);

        const headers = authHeader();
        if (headers['Content-Type']) {
            delete headers['Content-Type'];
        }

        const response = await fetch(
            `${config.apiBaseUrl}/4DACTION/react_deleteAccount`,
            {
                method: 'PUT',
                headers,
                body: formData,
            }
        );

        if (!response.ok) {
            const txt = await response.text().catch(() => '');
            console.error('Erreur updateProfile', response.status, txt);
            throw new Error("Impossible de supprimer le profil");
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }
    }

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
        user,
        UUIDuser,
        updateProfile,
        deleteAccount,
    };
};


export default useAuth;

export const handleTokenInvalidError = (error) => {
    if (error.message === 'token invalide') {
        sessionStorage.removeItem('token');
        window.location.reload();
    }
};