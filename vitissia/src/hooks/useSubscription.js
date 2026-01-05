import { useState, useEffect, useCallback } from 'react';

/**
 * Hook pour gérer l'état d'abonnement dans l'application web
 *
 * Les données d'abonnement sont injectées par l'application mobile React Native
 * via localStorage/sessionStorage.
 *
 * @returns {Object} État et méthodes de l'abonnement
 */
export const useSubscription = () => {
    const [isPremium, setIsPremium] = useState(false);
    const [isExpired, setIsExpired] = useState(false);
    const [subscriptionStatus, setSubscriptionStatus] = useState('unknown');
    const [subscriptionInfo, setSubscriptionInfo] = useState(null);
    const [testMode, setTestMode] = useState('real');
    const [isLoading, setIsLoading] = useState(true);

    /**
     * Détecte si on est dans l'app React Native ou dans un navigateur web
     */
    const isInReactNativeApp = useCallback(() => {
        const appHost = sessionStorage.getItem('APP_HOST') || localStorage.getItem('APP_HOST');
        return appHost === 'rn' || !!window.ReactNativeWebView;
    }, []);

    /**
     * Lit les données d'abonnement depuis le storage
     */
    const checkSubscription = useCallback(() => {
        try {
            // Lire depuis sessionStorage (prioritaire) ou localStorage
            const premium = sessionStorage.getItem('isPremium') || localStorage.getItem('isPremium');
            const expired = sessionStorage.getItem('isExpired') || localStorage.getItem('isExpired');
            const status = sessionStorage.getItem('subscriptionStatus') || localStorage.getItem('subscriptionStatus');
            const infoStr = sessionStorage.getItem('subscriptionInfo') || localStorage.getItem('subscriptionInfo');
            const mode = sessionStorage.getItem('subscriptionTestMode') || localStorage.getItem('subscriptionTestMode');

            // Si on n'est pas dans l'app RN et qu'aucune donnée n'est présente,
            // on considère que l'utilisateur n'est pas abonné (par défaut)
            if (!isInReactNativeApp() && !premium && !status) {
                console.log('[useSubscription] Mode navigateur web détecté - non abonné par défaut');
                setIsPremium(false);
                setIsExpired(false);
                setSubscriptionStatus('notSubscribed');
                setTestMode('web');
                setIsLoading(false);
                return;
            }

            setIsPremium(premium === 'true');
            setIsExpired(expired === 'true');
            setSubscriptionStatus(status || 'unknown');
            setTestMode(mode || 'real');

            if (infoStr) {
                try {
                    setSubscriptionInfo(JSON.parse(infoStr));
                } catch (e) {
                    console.warn('[useSubscription] Erreur parsing subscriptionInfo:', e);
                    setSubscriptionInfo(null);
                }
            } else {
                setSubscriptionInfo(null);
            }

            setIsLoading(false);
        } catch (error) {
            console.error('[useSubscription] Erreur lors de la lecture:', error);
            setIsLoading(false);
        }
    }, [isInReactNativeApp]);

    /**
     * Vérifie si l'utilisateur a accès premium
     * @param {Function} onNotPremium - Callback appelée si non premium
     * @returns {boolean} true si premium, false sinon
     */
    const requirePremium = useCallback((onNotPremium) => {
        if (!isPremium) {
            if (onNotPremium) {
                onNotPremium();
            }
            return false;
        }
        return true;
    }, [isPremium]);

    /**
     * Envoie un message à l'app React Native pour ouvrir l'écran d'abonnement
     */
    const openSubscriptionScreen = useCallback(() => {
        if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'OPEN_SUBSCRIPTION_SCREEN'
            }));
        }
    }, []);

    /**
     * Demande à l'app React Native d'acheter un produit
     * @param {string} productId - ID du produit à acheter
     */
    const purchaseProduct = useCallback((productId) => {
        if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'PURCHASE_PRODUCT',
                productId: productId
            }));
        }
    }, []);

    /**
     * Demande à l'app React Native de restaurer les achats
     */
    const restorePurchases = useCallback(() => {
        if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'RESTORE_PURCHASES'
            }));
        }
    }, []);

    // Vérifier au montage
    useEffect(() => {
        checkSubscription();
    }, [checkSubscription]);

    // Écouter les changements de subscription
    useEffect(() => {
        const handleSubscriptionChange = () => {
            console.log('[useSubscription] Événement app-subscription-changed reçu');
            checkSubscription();
        };

        window.addEventListener('app-subscription-changed', handleSubscriptionChange);
        window.addEventListener('storage', handleSubscriptionChange);

        return () => {
            window.removeEventListener('app-subscription-changed', handleSubscriptionChange);
            window.removeEventListener('storage', handleSubscriptionChange);
        };
    }, [checkSubscription]);

    return {
        // État
        isPremium,
        isExpired,
        subscriptionStatus,
        subscriptionInfo,
        testMode,
        isLoading,

        // Méthodes
        requirePremium,
        refreshSubscription: checkSubscription,
        openSubscriptionScreen,
        purchaseProduct,
        restorePurchases,

        // Constantes des produits
        PRODUCTS: {
            MONTHLY: {
                id: 'com.vitissia.abonnement.mensuel',
                name: 'Abonnement Mensuel',
                price: '7,99 €',
                priceValue: 7.99,
                period: 'mois',
                description: 'Accès illimité à toutes les fonctionnalités du sommelier IA'
            },
            ANNUAL: {
                id: 'com.vitissia.abonnement.annuel',
                name: 'Abonnement Annuel',
                price: '59,99 €',
                priceValue: 59.99,
                period: 'an',
                description: 'Économisez 2 mois avec l\'abonnement annuel',
                savings: '35%'
            }
        }
    };
};

export default useSubscription;
