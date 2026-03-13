import { useCallback } from 'react';
import { isRunningInRNWebView } from '../utils/rnBridge';
import { useSubscriptionStatus } from './useSubscriptionStatus';

const PRODUCTS = {
    MONTHLY: {
        id: 'com.vitissia.abonnement.mensuel',
        name: 'Abonnement Mensuel',
        price: '7,99 €',
        priceValue: 7.99,
        period: 'mois',
        description: 'Accès illimité à toutes les fonctionnalités du sommelier IA',
    },
    ANNUAL: {
        id: 'com.vitissia.abonnement.annuel',
        name: 'Abonnement Annuel',
        price: '59,99 €',
        priceValue: 59.99,
        period: 'an',
        description: 'Économisez 2 mois avec l\'abonnement annuel',
        savings: '35%',
    },
};

function postToNative(payload) {
    if (typeof window === 'undefined') return false;
    const bridge = window.ReactNativeWebView;
    if (!bridge || typeof bridge.postMessage !== 'function') return false;
    bridge.postMessage(JSON.stringify(payload));
    return true;
}

/**
 * Source unique de vérité abonnement côté web.
 * Repose sur useSubscriptionStatus (SUBSCRIPTION + fallback legacy + internal).
 */
export const useSubscription = () => {
    const sub = useSubscriptionStatus();
    const isInApp = isRunningInRNWebView();
    const isInReactNativeApp = useCallback(() => isRunningInRNWebView(), []);

    const isInternal = !!sub?.isInternal;
    const isPremium = !!sub?.isPremium;
    const hasPremiumAccess = isPremium || isInternal;

    const requirePremium = useCallback((onNotPremium) => {
        if (!hasPremiumAccess) {
            if (onNotPremium) onNotPremium();
            return false;
        }
        return true;
    }, [hasPremiumAccess]);

    const openSubscriptionScreen = useCallback(() => {
        return postToNative({ type: 'OPEN_SUBSCRIPTION_SCREEN' });
    }, []);

    const purchaseProduct = useCallback((productId) => {
        if (!productId) return false;
        return postToNative({
            type: 'PURCHASE_PRODUCT',
            productId,
        });
    }, []);

    const restorePurchases = useCallback(() => {
        return postToNative({ type: 'RESTORE_PURCHASES' });
    }, []);

    return {
        // État
        isPremium,
        isInternal,
        hasPremiumAccess,
        isExpired: !!sub?.isExpired,
        subscriptionStatus: sub?.subscriptionStatus || (hasPremiumAccess ? 'active' : 'unknown'),
        subscriptionInfo: sub?.subscriptionInfo || null,
        testMode: isInApp ? 'real' : 'web',
        isLoading: !!sub?.isHydrating,

        // Méthodes
        requirePremium,
        refreshSubscription: sub?.refreshSubscription || (() => { }),
        isInReactNativeApp,
        openSubscriptionScreen,
        purchaseProduct,
        restorePurchases,

        // Produits
        PRODUCTS,
    };
};

export default useSubscription;
