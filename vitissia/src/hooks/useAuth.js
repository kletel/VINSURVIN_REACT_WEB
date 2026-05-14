import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import authHeader from '../config/authHeader';
import config from '../config/config';
import { fetchAndStoreIsInternal } from "../utils/internalAccess";

const MANUAL_LOGOUT_FLAG = 'vitissia_manual_logout';
const SESSION_EXPIRED_EVENT = 'app-session-expired';
const LAST_ACTIVITY_KEY = 'vitissia_last_activity_at';
const TOKEN_REFRESH_WINDOW_MS = 2 * 60 * 1000;
const ACTIVITY_IDLE_LIMIT_MS = 30 * 60 * 1000;

const emitAuthChanged = () => {
    try {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('app-auth-changed'));
        }
    } catch { }
};

const emitSessionExpired = (reason = 'expired') => {
    try {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(
                new CustomEvent(SESSION_EXPIRED_EVENT, { detail: { reason } })
            );
        }
    } catch { }
};

const safeGet = (storage, key) => {
    try {
        return storage?.getItem?.(key) || '';
    } catch {
        return '';
    }
};

const safeSet = (storage, key, value) => {
    try {
        storage?.setItem?.(key, value);
    } catch { }
};

const safeRemove = (storage, key) => {
    try {
        storage?.removeItem?.(key);
    } catch { }
};

export const getStoredToken = () =>
    safeGet(sessionStorage, 'token') || safeGet(localStorage, 'token');

export const hasStoredToken = () => !!getStoredToken();

export const syncTokenToSession = () => {
    const token = getStoredToken();
    if (token && safeGet(sessionStorage, 'token') !== token) {
        safeSet(sessionStorage, 'token', token);
    }
    return token;
};

const setStoredToken = (token) => {
    if (!token) return;
    safeSet(sessionStorage, 'token', token);
    safeSet(localStorage, 'token', token);
};

const clearAuthStorage = () => {
    const uuid =
        safeGet(sessionStorage, 'uuid_user') || safeGet(localStorage, 'uuid_user');
    const keys = [
        'token',
        'uuid_user',
        'nom_user',
        'APP_HOST',
        'email_user',
        'isInternal',
        'SUBSCRIPTION',
        'vitissia_caves_cache',
        'distinctCaves',
        'caveListState',
        'caveScrollY',
    ];

    if (uuid) {
        keys.push(
            `vitissia_caves_cache_${uuid}`,
            `distinctCaves_${uuid}`,
            `caveListState_${uuid}`,
            `caveScrollY_${uuid}`
        );
    }

    keys.forEach((k) => {
        safeRemove(sessionStorage, k);
        safeRemove(localStorage, k);
    });
};

const isAppHostRuntime = () => {
    return (
        safeGet(sessionStorage, 'APP_HOST') === 'rn' ||
        safeGet(localStorage, 'APP_HOST') === 'rn' ||
        (typeof window !== 'undefined' && !!window.ReactNativeWebView)
    );
};

const getOrCreateDeviceUUID = () => {
    let deviceUUID =
        safeGet(sessionStorage, 'deviceUUID') || safeGet(localStorage, 'deviceUUID');

    if (!deviceUUID) {
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
            deviceUUID = crypto.randomUUID();
        } else {
            deviceUUID = `web-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        }
    }

    safeSet(sessionStorage, 'deviceUUID', deviceUUID);
    safeSet(localStorage, 'deviceUUID', deviceUUID);
    return deviceUUID;
};

let refreshByDevicePromise = null;

const tryRefreshTokenByDeviceGlobal = async () => {
    if (refreshByDevicePromise) return refreshByDevicePromise;

    refreshByDevicePromise = (async () => {
        try {
            const deviceUUID = getOrCreateDeviceUUID();
            if (!deviceUUID) return false;

            const formData = new FormData();
            formData.append('deviceUUID', deviceUUID);

            const response = await fetch(`${config.apiBaseUrl}/4DACTION/react_autoLoginByDevice`, {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) return false;

            const data = await response.json().catch(() => null);
            const newToken = data?.accessToken || data?.token;
            if (!newToken) return false;

            setStoredToken(String(newToken));
            safeRemove(sessionStorage, MANUAL_LOGOUT_FLAG);
            safeRemove(localStorage, MANUAL_LOGOUT_FLAG);

            if (data?.uuid_user) {
                safeSet(sessionStorage, 'uuid_user', String(data.uuid_user));
                safeSet(localStorage, 'uuid_user', String(data.uuid_user));
            }
            if (data?.nom_user) {
                safeSet(sessionStorage, 'nom_user', String(data.nom_user));
                safeSet(localStorage, 'nom_user', String(data.nom_user));
            }
            return true;
        } catch {
            return false;
        } finally {
            refreshByDevicePromise = null;
        }
    })();

    return refreshByDevicePromise;
};

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
    const refreshInFlightRef = useRef(false);
    const lastRefreshTsRef = useRef(0);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const [user, setUser] = useState(null);
    const [UUIDuser, setUUIDuser] = useState(null);

    const loadUserInfo = useCallback(async () => {
        const token = syncTokenToSession();
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
                    await handleTokenInvalidError(new Error('token invalide'));
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
                localStorage.setItem('uuid_user', mapped.uuid);
            }

            if (mapped.firstName || mapped.lastName) {
                const fullName = `${mapped.firstName || ''} ${mapped.lastName || ''}`.trim();
                sessionStorage.setItem('nom_user', fullName);
                localStorage.setItem('nom_user', fullName);
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

    const fetchEmailFromToken = useCallback(async (token) => {
        if (!token) return null;

        const uuidFromStorage =
            sessionStorage.getItem('uuid_user') ||
            localStorage.getItem('uuid_user');

        let url = `${config.apiBaseUrl}/4DACTION/react_getUserInfo`;
        if (uuidFromStorage) {
            url += `?UUID_user=${encodeURIComponent(uuidFromStorage)}`;
        }

        const deviceUUID =
            sessionStorage.getItem('deviceUUID') ||
            localStorage.getItem('deviceUUID');

        const tryFetch = async (headers) => {
            try {
                const res = await fetch(url, { method: 'GET', headers });
                if (!res.ok) return null;
                const data = await res.json().catch(() => null);
                return data?.Email || data?.email || null;
            } catch {
                return null;
            }
        };

        // 1) Essai avec Bearer + deviceUUID (authHeader)
        let email = await tryFetch(authHeader());
        if (email) return email;

        // 2) Essai avec token brut + deviceUUID (fallback)
        const rawHeaders = { Authorization: token };
        if (deviceUUID) rawHeaders.deviceUUID = deviceUUID;
        email = await tryFetch(rawHeaders);
        return email;
    }, []);

    const markUserActivity = useCallback(() => {
        safeSet(localStorage, LAST_ACTIVITY_KEY, String(Date.now()));
    }, []);

    const tryRefreshTokenByDevice = useCallback(async () => {
        if (refreshInFlightRef.current) return false;

        const now = Date.now();
        if (now - lastRefreshTsRef.current < 20 * 1000) return false;
        lastRefreshTsRef.current = now;
        refreshInFlightRef.current = true;

        try {
            const refreshed = await tryRefreshTokenByDeviceGlobal();
            if (!refreshed) return false;

            const refreshedUuid = sessionStorage.getItem('uuid_user');
            if (refreshedUuid) {
                setUUIDuser(refreshedUuid);
            }

            markUserActivity();
            emitAuthChanged();
            return true;
        } catch {
            return false;
        } finally {
            refreshInFlightRef.current = false;
        }
    }, [markUserActivity]);

    const autoLoginFromStorage = useCallback(async () => {
        const hasManualLogoutFlag =
            sessionStorage.getItem(MANUAL_LOGOUT_FLAG) === '1' ||
            localStorage.getItem(MANUAL_LOGOUT_FLAG) === '1';
        if (hasManualLogoutFlag) {
            return false;
        }

        const token = syncTokenToSession();

        if (token) {
            let mapped = null;
            try {
                mapped = await loadUserInfo();
            } catch { }

            let emailToCheck = mapped?.email;
            if (!emailToCheck) {
                emailToCheck =
                    sessionStorage.getItem("email_user") ||
                    localStorage.getItem("email_user");
            }
            if (!emailToCheck) {
                const emailFromToken = await fetchEmailFromToken(token);
                if (emailFromToken) {
                    emailToCheck = emailFromToken;
                }
            }
            if (emailToCheck) {
                sessionStorage.setItem("email_user", emailToCheck);
                localStorage.setItem("email_user", emailToCheck);
                await fetchAndStoreIsInternal({
                    apiBaseUrl: config.apiBaseUrl,
                    email: emailToCheck,
                });
            }
            markUserActivity();
            return true;
        }
        return false;
    }, [loadUserInfo, fetchEmailFromToken, markUserActivity]);

    useEffect(() => {
        autoLoginFromStorage();
        const handler = () => autoLoginFromStorage();
        window.addEventListener("app-auth-changed", handler);
        return () => window.removeEventListener("app-auth-changed", handler);
    }, [autoLoginFromStorage]);

    useEffect(() => {
        const onActivity = () => markUserActivity();
        const events = ['click', 'keydown', 'touchstart', 'mousemove', 'scroll'];
        events.forEach((evt) => window.addEventListener(evt, onActivity, { passive: true }));
        markUserActivity();
        return () => events.forEach((evt) => window.removeEventListener(evt, onActivity));
    }, [markUserActivity]);

    useEffect(() => {
        const token = syncTokenToSession();
        if (token) {
            loadUserInfo();
        }
    }, [loadUserInfo]);

    useEffect(() => {
        const interval = window.setInterval(async () => {
            const token = syncTokenToSession();
            if (!token) return;

            const claims = decodeJwtClaims(token);
            const expMs =
                claims && typeof claims.exp === 'number'
                    ? claims.exp * 1000
                    : null;
            if (!expMs) return;

            const now = Date.now();
            const remaining = expMs - now;
            const lastActivity = Number(safeGet(localStorage, LAST_ACTIVITY_KEY) || 0);
            const hasRecentActivity = now - lastActivity <= ACTIVITY_IDLE_LIMIT_MS;
            const isAppHost = isAppHostRuntime();
            const canRefresh = isAppHost || hasRecentActivity;

            if (remaining <= 0) {
                if (canRefresh) {
                    const refreshed = await tryRefreshTokenByDevice();
                    if (refreshed) return;
                }
                if (isAppHost) {
                    return;
                }
                await handleTokenInvalidError(new Error('token invalide'), {
                    reason: 'expired',
                    showPopup: !isAppHost,
                });
                return;
            }

            if (remaining <= TOKEN_REFRESH_WINDOW_MS && canRefresh) {
                await tryRefreshTokenByDevice();
            }
        }, 30 * 1000);

        return () => window.clearInterval(interval);
    }, [tryRefreshTokenByDevice]);

    const login = async () => {
        setError('');
        try {
            const formData = new FormData();
            const deviceUUID = getOrCreateDeviceUUID();
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
                setStoredToken(token);
                sessionStorage.removeItem(MANUAL_LOGOUT_FLAG);
                localStorage.removeItem(MANUAL_LOGOUT_FLAG);

                sessionStorage.setItem("email_user", email);
                localStorage.setItem("email_user", email);

                await fetchAndStoreIsInternal({
                    apiBaseUrl: config.apiBaseUrl,
                    email,
                });

                const uuid = data.uuid_user
                const nomComplet = data.nom_user
                if (uuid) {
                    setUUIDuser(uuid);
                    sessionStorage.setItem('uuid_user', uuid);
                    localStorage.setItem('uuid_user', uuid);
                }
                if (nomComplet) {
                    sessionStorage.setItem('nom_user', nomComplet);
                    localStorage.setItem('nom_user', nomComplet);
                }
                console.log("uuid", uuid, "nomComplet", nomComplet)
                markUserActivity();
                emitAuthChanged();
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
            console.log('📥 Réponse reçue, status:', response.status, 'ok:', response.ok);

            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status}`);
            }

            const data = await response.json();
            console.log('📄 Données reçues:', data);

            if (data.entete === "succes") {
                const tokenToStore = token || data.accessToken;
                if (tokenToStore) setStoredToken(tokenToStore);
                sessionStorage.removeItem(MANUAL_LOGOUT_FLAG);
                localStorage.removeItem(MANUAL_LOGOUT_FLAG);
                setUUIDuser(data.uuidUser);
                sessionStorage.setItem('uuid_user', data.uuidUser);
                localStorage.setItem('uuid_user', data.uuidUser);
                sessionStorage.setItem('nom_user', data.nomUser);
                localStorage.setItem('nom_user', data.nomUser);
                const mapped = await loadUserInfo();
                const emailToCheck = mapped?.email;
                if (emailToCheck) {
                    sessionStorage.setItem("email_user", emailToCheck);
                    localStorage.setItem("email_user", emailToCheck);
                    await fetchAndStoreIsInternal({ apiBaseUrl: config.apiBaseUrl, email: emailToCheck });
                }

                markUserActivity();
                emitAuthChanged();
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
            clearAuthStorage();

            try { sessionStorage.setItem(MANUAL_LOGOUT_FLAG, '1'); } catch { }
            try { localStorage.setItem(MANUAL_LOGOUT_FLAG, '1'); } catch { }
            setUser(null);
            setUUIDuser(null);
            emitAuthChanged();

            navigate('/', { replace: true });
        }
    };
    const isLoggedIn = () => {
        return !!syncTokenToSession();
    };

    const getUserInfo = async () => {
        try {
            const token = syncTokenToSession();
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
        const token = syncTokenToSession();
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
            localStorage.setItem('uuid_user', updatedUser.uuid);
        }
        if (updatedUser.firstName || updatedUser.lastName) {
            const fullName = `${updatedUser.firstName || ''} ${updatedUser.lastName || ''}`.trim();
            sessionStorage.setItem('nom_user', fullName);
            localStorage.setItem('nom_user', fullName);
        }
        emitAuthChanged();

        return updatedUser;
    };

    const deleteAccount = async () => {
        const token = syncTokenToSession();
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

export const handleTokenInvalidError = async (error, options = {}) => {
    const message = error?.message;
    const hadToken = hasStoredToken();
    const shouldHandle =
        !error ||
        message === 'token invalide' ||
        message === '401' ||
        message === 'Unauthorized' ||
        options?.force === true;

    if (!shouldHandle) return;
    if (!hadToken && options?.force !== true) return;

    if (options?.force !== true && message !== 'token invalide') {
        const refreshed = await tryRefreshTokenByDeviceGlobal();
        if (refreshed) {
            emitAuthChanged();
            return;
        }
    }

    if (isAppHostRuntime() && options?.allowInAppHost !== true && options?.force !== true) {
        return;
    }

    const reason = options?.reason || (message === 'token invalide' ? 'invalid_token' : 'unauthorized');

    clearAuthStorage();
    emitAuthChanged();

    if (options?.showPopup !== false) {
        emitSessionExpired(reason);
    }
};
