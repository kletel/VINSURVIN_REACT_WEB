import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function CaveCard({ vin, isMobile, onToggleFavori, onDelete, formatRegionName }) {
    const navigate = useNavigate();

    const formatCurrency = (value) =>
        (value || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });

    const truncate = (txt, n) =>
        txt && txt.length > n ? txt.slice(0, n - 1) + '…' : txt || '';

    const getWineRating = (noteSur100) => {
        const n = Number(noteSur100) || 0;
        let label = '';
        let stars = 0;

        if (n < 82) {
            label = 'Médiocre';
            stars = 0;
        } else if (n >= 84 && n <= 86) {
            label = 'Acceptable';
            stars = 1;
        } else if (n >= 87 && n <= 90) {
            label = 'Bon';
            stars = 1.5;
        } else if (n >= 91 && n <= 94) {
            label = 'Très bon';
            stars = 2;
        } else if (n >= 95 && n <= 99) {
            label = 'Excellent';
            stars = 2.5;
        } else {
            label = 'Exceptionnel';
            stars = 3;
        }

        return { score: n, label, stars };
    };

    // 🔸 Affichage des étoiles sur 3 (demi-étoiles comprises)
    const renderStars = (count) => {
        const totalStars = 3;
        const fullStars = Math.floor(count);
        const hasHalfStar = count % 1 !== 0;

        return (
            <div className="flex items-center gap-0.5">
                {Array.from({ length: totalStars }).map((_, i) => {
                    if (i < fullStars) {
                        return <i key={i} className="pi pi-star-fill text-amber-400 text-sm" />;
                    } else if (i === fullStars && hasHalfStar) {
                        return <i key={i} className="pi pi-star-half-fill text-amber-400 text-sm" />;
                    } else {
                        return (
                            <i
                                key={i}
                                className="pi pi-star text-gray-500 dark:text-gray-600 text-sm"
                            />
                        );
                    }
                })}
            </div>
        );
    };

    const rating = getWineRating(vin.Note_sur_20);

    const imgSrc = vin.base64_132etiquette
        ? `data:image/jpeg;base64,${vin.base64_132etiquette}`
        : '/images/default-avatar.jpg';

    // Couleur de la barre latérale selon la couleur du vin
    const barColorClass =
        vin.Couleur?.toLowerCase().includes('rouge')
            ? 'from-[#d41132] to-[#7f0b21]'
            : vin.Couleur?.toLowerCase().includes('blanc')
                ? 'from-[#f5d86b] to-[#f1b81b]'
                : vin.Couleur?.toLowerCase().includes('rosé') ||
                    vin.Couleur?.toLowerCase().includes('rose')
                    ? 'from-[#ff7a8b] to-[#f97393]'
                    : 'from-gray-400 to-gray-500';

    return (
        <div
            className="px-1 sm:px-2 py-1 font-['Work_Sans',sans-serif]"
            onClick={() => navigate(`/vin/${vin.UUID_}`)}
        >
            <motion.div
                whileHover={{ y: -3, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                transition={{ type: 'spring', stiffness: 240, damping: 18, mass: 0.6 }}
                className={`
                    relative h-full cursor-pointer group overflow-hidden
                    rounded-2xl border border-white/10
                    bg-gray-900/70
                    shadow-[0_10px_35px_rgba(0,0,0,0.7)]
                    hover:shadow-[0_16px_45px_rgba(0,0,0,0.85)]
                    transition-all duration-100
                    text-gray-50
                `}
            >
                {/* Halo au survol */}
                <div
                    className="
                        pointer-events-none absolute -inset-px
                        opacity-[0.45] group-hover:opacity-[0.85]
                        bg-[radial-gradient(circle_at_top,_rgba(255,122,139,0.18),_transparent_55%)]
                        transition-opacity duration-200
                    "
                />

                {/* Barre de couleur selon le type de vin */}
                <div
                    className={`
                        absolute top-0 left-0 w-1.5 h-full
                        bg-gradient-to-b ${barColorClass}
                        shadow-[0_0_18px_rgba(255,255,255,0.15)]
                    `}
                />

                {/* Contenu principal */}
                <div className="relative flex items-stretch p-4 gap-4 z-10">
                    {/* Texte */}
                    <div className="flex-1 min-w-0">
                        <h3
                            className={`
                                font-semibold tracking-tight
                                ${isMobile ? 'text-sm sm:text-base' : 'text-base sm:text-lg'}
                                text-gray-50
                                truncate
                            `}
                        >
                            {truncate(vin.Nom, isMobile ? 42 : 64)}
                        </h3>

                        <p
                            className={`
                                text-[11px] sm:text-xs mt-0.5
                                text-gray-300/90
                                truncate
                            `}
                        >
                            {vin.Millesime}
                            <span className="pl-2">
                                {truncate(vin.Producteur, isMobile ? 24 : 36)}
                            </span>
                        </p>

                        <div
                            className={`
                                mt-1 text-[11px] sm:text-xs
                                text-gray-300/80
                                truncate
                            `}
                        >
                            <span className="inline-flex items-center flex-wrap gap-x-3">
                                <span>
                                    {truncate(vin.Appellation, isMobile ? 22 : 36)}
                                </span>
                                {vin.Région && (
                                    <span>
                                        {truncate(
                                            formatRegionName
                                                ? formatRegionName(vin.Région)
                                                : vin.Région,
                                            isMobile ? 23 : 28
                                        )}
                                    </span>
                                )}
                                <span>{truncate(vin.Pays, 20)}</span>
                            </span>
                        </div>

                        {/* Tags / badges */}
                        <div className="mt-2 flex flex-wrap gap-1.5">
                            {/* 1. Couleur */}
                            {vin.Couleur && (
                                <span
                                    className="
                inline-flex items-center px-2 py-0.5 rounded-full
                text-[10px] font-medium
                bg-white/5 border border-white/10
                text-gray-100
                backdrop-blur-[2px]
            "
                                >
                                    {vin.Couleur}
                                </span>
                            )}

                            {/* 2. Type / tranquille */}
                            {vin.Type && (
                                <span
                                    className="
                inline-flex items-center px-2 py-0.5 rounded-full
                text-[10px] font-medium
                bg-[#0f172a]/60 border border-indigo-400/60
                text-indigo-100
                backdrop-blur-[2px]
            "
                                >
                                    {vin.Type}
                                </span>
                            )}

                            {/* 3. Bouteille (contenant) */}
                            {vin.Flacon && (
                                <span
                                    className="
                inline-flex items-center px-2 py-0.5 rounded-full
                text-[10px] font-medium
                bg-fuchsia-900/40 border border-fuchsia-400/60
                text-fuchsia-100
                max-w-full overflow-hidden
            "
                                >
                                    {truncate(vin.Flacon, isMobile ? 20 : 25)}
                                </span>
                            )}

                            {/* 4. Stock (étiquette dédiée) */}
                            {vin.Reste_en_Cave !== null && vin.Reste_en_Cave !== undefined && (
                                <span
                                    className="
                inline-flex items-center px-2 py-0.5 rounded-full
                text-[10px] font-medium
                bg-emerald-900/40 border border-emerald-400/70
                text-emerald-100
                backdrop-blur-[2px]
            "
                                >
                                    Stock: {vin.Reste_en_Cave === 0 ? '0' : vin.Reste_en_Cave}
                                </span>
                            )}

                            {/* 5. Cave principale / autre */}
                            {vin.Cave && (
                                <span
                                    className="
                inline-flex items-center px-2 py-0.5 rounded-full
                text-[10px] font-medium
                bg-[#020617]/70 border border-sky-500/40
                text-sky-100
                backdrop-blur-[2px]
                max-w-full overflow-hidden
            "
                                >
                                    {truncate(
                                        vin.Cave.toLowerCase().includes('principale')
                                            ? 'Cave principale'
                                            : vin.Cave,
                                        isMobile ? 18 : 26
                                    )}
                                </span>
                            )}

                            {/* 6. Lieu de stockage (étagère) */}
                            {vin.Etagere && (
                                <span
                                    className="
                inline-flex items-center px-2 py-0.5 rounded-full
                text-[10px] font-medium
                bg-gray-900/70 border border-gray-500/60
                text-gray-100
                max-w-full overflow-hidden
            "
                                >
                                    Lieu: {truncate(vin.Etagere, isMobile ? 18 : 26)}
                                </span>
                            )}
                        </div>

                    </div>

                    {/* Visuel + valeur */}
                    <div className="relative flex flex-col items-end gap-2 flex-shrink-0">
                        <motion.div
                            whileHover={{ scale: 1.03 }}
                            transition={{ duration: 0.25 }}
                            className="
                                relative overflow-hidden rounded-xl
                                border border-white/10
                                shadow-[0_8px_24px_rgba(0,0,0,0.6)]
                                bg-black/40
                            "
                        >
                            <img
                                src={imgSrc}
                                alt={vin.Nom}
                                className={`
                                    object-cover
                                    transition-transform duration-300 ease-out
                                    group-hover:scale-105
                                    ${isMobile ? 'w-24 h-24' : 'w-28 h-28 sm:w-32 sm:h-32'}
                                `}
                                loading="lazy"
                            />
                            <div
                                className="
                                    absolute bottom-1 right-1
                                    bg-black/70 border border-white/10
                                    backdrop-blur-md
                                    px-2 py-0.5 rounded
                                    text-[10px] sm:text-[11px] font-semibold
                                    text-emerald-200
                                    shadow-[0_0_15px_rgba(0,0,0,0.5)]
                                "
                            >
                                {formatCurrency(vin.Valeur || 0)}
                            </div>
                        </motion.div>

                        <div className="text-right">
                            <div
                                className={`
                                    font-medium
                                    text-gray-200
                                    ${isMobile ? 'text-[11px]' : 'text-xs sm:text-sm'}
                                `}
                            >
                                {formatCurrency(
                                    vin.valeurCave || vin.Valeur_Euro || 0
                                )}{' '}
                                <span className="text-[10px] text-gray-400">
                                    / stock
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer : note + actions */}
                <div
                    className="
                        relative z-10
                        border-t border-white/10
                        px-4 py-2
                        flex items-center justify-between
                        bg-black/35 backdrop-blur-sm
                    "
                >
                    <div className="flex items-center gap-2 text-gray-100">
                        {/* {renderStars(rating.stars)} */}
                        {vin.Note_sur_20 > 0 && (
                            <>
                                <span
                                    className={`
                                        text-[11px]
                                        ${rating?.stars >= 2.5
                                            ? 'text-emerald-300'
                                            : 'text-gray-200'
                                        }
                                    `}
                                >
                                    {rating?.label}
                                </span>

                                <span className="text-[10px] text-gray-400">
                                    ({vin.Note_sur_20}/100)
                                </span>
                            </>
                        )}
                    </div>

                    <div
                        className="flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Poubelle */}
                        <motion.button
                            whileTap={{ scale: 0.92 }}
                            className={`
                                ${isMobile ? 'w-8 h-8' : 'w-9 h-9'}
                                rounded-lg
                                border border-white/10
                                text-gray-300
                                bg-black/30
                                hover:bg-red-900/30 hover:border-red-400/60 hover:text-red-300
                                transition-all duration-200
                                flex items-center justify-center
                            `}
                            onClick={() => onDelete && onDelete(vin)}
                            title="Supprimer"
                        >
                            <svg
                                className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4
                                       a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                            </svg>
                        </motion.button>

                        {/* Coeur */}
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            className={`
                                ${isMobile ? 'w-8 h-8' : 'w-9 h-9'}
                                rounded-lg border
                                transition-all duration-200
                                flex items-center justify-center
                                ${vin.Coup_de_Coeur
                                    ? 'bg-[#3b0b15]/70 border-[#fb7185]/70 text-[#fb7185] shadow-[0_0_18px_rgba(248,113,113,0.4)]'
                                    : 'bg-black/30 border-white/12 text-gray-300 hover:bg-white/5 hover:text-rose-300 hover:border-rose-400/70'
                                }
                            `}
                            onClick={(e) =>
                                onToggleFavori &&
                                onToggleFavori(vin.UUID_, !vin.Coup_de_Coeur, e)
                            }
                            title={
                                vin.Coup_de_Coeur
                                    ? 'Retirer des favoris'
                                    : 'Ajouter aux favoris'
                            }
                        >
                            <svg
                                className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`}
                                fill={vin.Coup_de_Coeur ? 'currentColor' : 'none'}
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682
                                       a4.5 4.5 0 00-6.364-6.364L12 7.636
                                       l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                            </svg>
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
