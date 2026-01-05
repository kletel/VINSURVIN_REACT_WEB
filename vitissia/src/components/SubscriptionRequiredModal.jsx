import React, { useState } from 'react';
import { useSubscription } from '../hooks/useSubscription';

/**
 * Modal affichée quand une fonctionnalité premium est requise
 *
 * Propose les deux offres d'abonnement:
 * - Mensuel: 7,99€/mois
 * - Annuel: 59,99€/an (économie de 35%)
 */
const SubscriptionRequiredModal = ({ isOpen, onClose, feature = "cette fonctionnalité" }) => {
    const { purchaseProduct, restorePurchases, PRODUCTS, isExpired } = useSubscription();
    const [selectedPlan, setSelectedPlan] = useState('annual');
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen) return null;

    const handlePurchase = async (productId) => {
        setIsProcessing(true);
        try {
            purchaseProduct(productId);
            // L'app native gérera la suite
        } catch (error) {
            console.error('[SubscriptionModal] Erreur achat:', error);
        } finally {
            // Le processing sera reset par le changement de subscription
            setTimeout(() => setIsProcessing(false), 3000);
        }
    };

    const handleRestore = async () => {
        setIsProcessing(true);
        try {
            restorePurchases();
        } catch (error) {
            console.error('[SubscriptionModal] Erreur restauration:', error);
        } finally {
            setTimeout(() => setIsProcessing(false), 3000);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg rounded-3xl overflow-hidden bg-gradient-to-br from-[#2b0b13] via-[#4f1022] to-[#7b1d33] border border-white/20 shadow-2xl">
                {/* Header avec icône */}
                <div className="relative px-6 pt-8 pb-4 text-center">
                    {/* Badge essai gratuit */}
                    {!isExpired && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-400 text-white text-sm font-bold mb-4 shadow-lg">
                            <span className="text-lg">🎁</span>
                            14 jours d'essai gratuit
                        </div>
                    )}
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {isExpired ? 'Votre abonnement a expiré' : 'Accès complet à Gabriel notre Sommelier I.A.'}
                    </h2>
                    <p className="text-rose-100/80 text-sm">
                        {isExpired
                            ? 'Renouvelez pour continuer à utiliser le sommelier IA'
                            : 'Essayez gratuitement, sans engagement'
                        }
                    </p>
                </div>

                {/* Avantages */}
                <div className="px-6 py-4">
                    <div className="bg-white/10 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-3 text-white">
                            <span className="text-green-400 text-lg">✓</span>
                            <span className="text-sm">Conseils IA pour accorder vins et plats</span>
                        </div>
                        <div className="flex items-center gap-3 text-white">
                            <span className="text-green-400 text-lg">✓</span>
                            <span className="text-sm">Analyse de cartes de vins au restaurant</span>
                        </div>
                        <div className="flex items-center gap-3 text-white">
                            <span className="text-green-400 text-lg">✓</span>
                            <span className="text-sm">Scan et analyse de rayons en magasin</span>
                        </div>
                        <div className="flex items-center gap-3 text-white">
                            <span className="text-green-400 text-lg">✓</span>
                            <span className="text-sm">Analyse et équilibrage de votre cave</span>
                        </div>
                    </div>
                </div>

                {/* Plans */}
                <div className="px-6 py-4 space-y-3">
                    {/* Plan Annuel (recommandé) */}
                    <button
                        onClick={() => setSelectedPlan('annual')}
                        className={`relative w-full p-4 rounded-2xl border-2 transition-all duration-300 ${selectedPlan === 'annual'
                                ? 'border-amber-400 bg-amber-400/10'
                                : 'border-white/20 bg-white/5 hover:border-white/40'
                            }`}
                    >
                        {/* Badge économie */}
                        <div className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 text-black text-xs font-bold">
                            Économisez 35%
                        </div>

                        <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedPlan === 'annual'
                                    ? 'border-amber-400 bg-amber-400'
                                    : 'border-white/40'
                                }`}>
                                {selectedPlan === 'annual' && (
                                    <span className="text-black text-xs">✓</span>
                                )}
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="text-white font-semibold">
                                    {PRODUCTS.ANNUAL.name}
                                </span>
                                {!isExpired && (
                                    <span className="text-emerald-400 text-xs">14 jours gratuits inclus</span>
                                )}
                            </div>
                            <span className="text-white font-bold ml-auto">
                                {PRODUCTS.ANNUAL.price} / {PRODUCTS.ANNUAL.period}
                            </span>
                        </div>
                    </button>

                    {/* Plan Mensuel */}
                    <button
                        onClick={() => setSelectedPlan('monthly')}
                        className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 ${selectedPlan === 'monthly'
                                ? 'border-amber-400 bg-amber-400/10'
                                : 'border-white/20 bg-white/5 hover:border-white/40'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedPlan === 'monthly'
                                    ? 'border-amber-400 bg-amber-400'
                                    : 'border-white/40'
                                }`}>
                                {selectedPlan === 'monthly' && (
                                    <span className="text-black text-xs">✓</span>
                                )}
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="text-white font-semibold">
                                    {PRODUCTS.MONTHLY.name}
                                </span>
                                {!isExpired && (
                                    <span className="text-emerald-400 text-xs">14 jours gratuits inclus</span>
                                )}
                            </div>
                            <span className="text-white font-bold ml-auto">
                                {PRODUCTS.MONTHLY.price} / {PRODUCTS.MONTHLY.period}
                            </span>
                        </div>
                    </button>
                </div>

                {/* Boutons d'action */}
                <div className="px-6 pb-6 pt-2 space-y-3">
                    <button
                        onClick={() => handlePurchase(
                            selectedPlan === 'annual'
                                ? PRODUCTS.ANNUAL.id
                                : PRODUCTS.MONTHLY.id
                        )}
                        disabled={isProcessing}
                        className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${isProcessing
                                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                : 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black hover:from-amber-500 hover:to-yellow-600 shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                            }`}
                    >
                        {isProcessing ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Traitement en cours...
                            </span>
                        ) : isExpired ? (
                            <>Renouveler mon abonnement</>
                        ) : (
                            <>Commencer mon essai de 14 jours gratuit</>
                        )}
                    </button>

                    <div className="flex items-center justify-center gap-4 text-sm">
                        <button
                            onClick={handleRestore}
                            disabled={isProcessing}
                            className="text-rose-100/70 hover:text-white underline transition-colors"
                        >
                            Restaurer mes achats
                        </button>
                        <span className="text-rose-100/30">•</span>
                        <button
                            onClick={onClose}
                            className="text-rose-100/70 hover:text-white transition-colors"
                        >
                            Plus tard
                        </button>
                    </div>

                    {/* Mentions légales */}
                    <p className="text-center text-rose-100/40 text-[10px] leading-tight mt-4">
                        {!isExpired && (
                            <>Essai gratuit de 14 jours, puis {selectedPlan === 'annual' ? PRODUCTS.ANNUAL.price + '/' + PRODUCTS.ANNUAL.period : PRODUCTS.MONTHLY.price + '/' + PRODUCTS.MONTHLY.period}. </>
                        )}
                        L'abonnement se renouvelle automatiquement sauf annulation 24h avant la fin de la période.
                        Annulez à tout moment dans les réglages de votre compte App Store ou Google Play.
                    </p>
                </div>

                {/* Bouton fermer */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all"
                >
                    ✕
                </button>
            </div>
        </div>
    );
};

export default SubscriptionRequiredModal;
