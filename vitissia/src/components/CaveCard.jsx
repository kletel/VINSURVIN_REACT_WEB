import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function CaveCard({ vin, isMobile, onToggleFavori, onDelete, formatRegionName }) {
    const navigate = useNavigate();

    const formatCurrency = (value) => (value || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
    const truncate = (txt, n) => (txt && txt.length > n ? txt.slice(0, n - 1) + '…' : txt || '');

    const getWineRating = (noteSur100) => {
        const n = Number(noteSur100) || 0;
        let label = '';
        let stars = 0;

        if (n < 82) {
            label = 'Médiocre';
            stars = 0;
        } else if (n < 85) {
            label = 'Correct';
            stars = 1;
        } else if (n < 87) {
            label = 'Bon';
            stars = 1.5;
        } else if (n < 90) {
            label = 'Très bon';
            stars = 2;
        } else if (n < 93) {
            label = 'Excellent';
            stars = 2.5;
        } else if (n < 97) {
            label = 'Exceptionnel';
            stars = 2.8;
        } else {
            label = 'Grand Cru';
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
                        return <i key={i} className="pi pi-star-fill text-amber-500 text-sm" />;
                    } else if (i === fullStars && hasHalfStar) {
                        return <i key={i} className="pi pi-star-half-fill text-amber-500 text-sm" />;
                    } else {
                        return <i key={i} className="pi pi-star text-gray-400 dark:text-gray-600 text-sm" />;
                    }
                })}
            </div>
        );
    };


    const rating = getWineRating(vin.Note_sur_20);

    const imgSrc = vin.base64_132etiquette
        ? `data:image/jpeg;base64,${vin.base64_132etiquette}`
        : '/images/default-avatar.jpg';

    return (
        <div className="px-1 sm:px-2 py-1" onClick={() => navigate(`/vin/${vin.UUID_}`)}>
            <div className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden group hover:border-blue-300 dark:hover:border-blue-600 h-full">
                {/* Barre de couleur selon le type de vin */}
                <div
                    className={`absolute top-0 left-0 w-1 h-full ${vin.Couleur?.toLowerCase().includes('rouge')
                        ? 'bg-red-500'
                        : vin.Couleur?.toLowerCase().includes('blanc')
                            ? 'bg-yellow-400'
                            : vin.Couleur?.toLowerCase().includes('rosé') || vin.Couleur?.toLowerCase().includes('rose')
                                ? 'bg-pink-400'
                                : 'bg-gray-400'
                        }`}
                ></div>

                {/* Contenu principal réagencé */}
                <div className="flex items-stretch p-4 gap-4">
                    {/* Bloc texte (gauche) */}
                    <div className="flex-1 min-w-0">
                        {/* Titre */}
                        <h3 className={`font-semibold text-gray-900 dark:text-gray-100 ${isMobile ? 'text-base' : 'text-lg'} truncate`}>{truncate(vin.Nom, isMobile ? 42 : 64)}</h3>

                        {/* Sous-titre concis: Millésime • Producteur (raccourci) */}
                        <p className={`text-gray-500 dark:text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'} mt-0.5 truncate`}>
                            {vin.Millesime}
                            <span className='pl-2'> {truncate(vin.Producteur, isMobile ? 24 : 36)}</span>
                        </p>

                        {/* Localisation succincte */}
                        <div className={`text-gray-600 dark:text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'} mt-1 truncate`}>
                            <span className="inline-flex items-center flex-wrap">
                                <span className="mr-4">
                                    {truncate(vin.Appellation, isMobile ? 22 : 36)}
                                </span>
                                {vin.Région && (
                                    <span className="mr-4">
                                        {truncate(formatRegionName ? formatRegionName(vin.Région) : vin.Région, isMobile ? 23 : 28)}
                                    </span>
                                )}
                                <span className="mr-4">
                                    {truncate(vin.Pays, 20)}
                                </span>
                            </span>
                        </div>

                        {/* Badges compacts: Type, Stock, Cave, Contenant (aussi en mobile) */}
                        <div className="mt-2 flex flex-wrap gap-1.5">
                            {vin.Type && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                                    {truncate(vin.Type, 20)}
                                </span>
                            )}

                            {/* <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${vin.Reste_en_Cave > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                Stock: {vin.Reste_en_Cave || 0}
              </span>*/}

                            {vin.Cave && vin.Reste_en_Cave && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                    {truncate(vin.Cave, isMobile ? 16 : 24)}
                                    {vin?.Etagere && <span className='ml-1'>Étagere: {truncate(vin.Etagere, isMobile ? 16 : 24)}</span>}
                                    {<span className='ml-1'>Stock: {vin.Reste_en_Cave || 0}</span>}
                                </span>
                            )}

                            {vin.Flacon && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 max-w-full overflow-hidden">
                                    {truncate(vin.Flacon, isMobile ? 20 : 25)}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Image + prix (droite) */}
                    <div className="relative flex flex-col items-end gap-2 flex-shrink-0">
                        <div className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm">
                            <img
                                src={imgSrc}
                                alt={vin.Nom}
                                className={`object-cover transition-transform duration-300 ease-out group-hover:scale-105 ${isMobile ? 'w-24 h-24' : 'w-32 h-32'}`}
                                loading="lazy"
                            />
                            {vin.Coup_de_Coeur && (
                                <div className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-sm">
                                    {/*<div className="w-2 h-2 bg-white rounded-full"></div>*/}
                                    <div className=' pi pi-heart text-white'></div>
                                </div>
                            )}
                            {/* Badge prix sur l'image (unité) */}
                            <div className="absolute bottom-1 right-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur px-2 py-0.5 rounded text-[11px] font-semibold shadow">
                                {formatCurrency(vin.Valeur || 0)}
                            </div>
                        </div>
                        {/* Prix stock, discret */}
                        <div className="text-right">
                            <div className={`font-medium text-gray-700 dark:text-gray-300 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                                {formatCurrency(vin.valeurCave || vin.Valeur_Euro || 0)} / stock
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bas de carte: divider + rating + actions */}
                <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-between bg-white/60 dark:bg-gray-800/60">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        {renderStars(rating.stars)}
                        <span
                            className={`text-xs ${
                                rating.stars >= 2.5
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-gray-600 dark:text-gray-300'
                            }`}
                        >
                            {rating.label}
                        </span>

                        {vin.Note_sur_20 > 0 && (
                            <span className="text-xs text-gray-400">
                                ({vin.Note_sur_20}/100)
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {/* Poubelle */}
                        <button
                            className={`${isMobile ? 'w-8 h-8' : 'w-9 h-9'} rounded-lg border border-gray-200 text-gray-400 hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:border-gray-600 dark:text-gray-500 dark:hover:bg-red-900/20 dark:hover:border-red-800 dark:hover:text-red-400 transition-all duration-200 flex items-center justify-center`}
                            onClick={() => onDelete && onDelete(vin)}
                            title="Supprimer"
                        >
                            <svg className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                        {/* Coeur */}
                        <button
                            className={`${isMobile ? 'w-8 h-8' : 'w-9 h-9'} rounded-lg border transition-all duration-200 flex items-center justify-center ${vin.Coup_de_Coeur
                                ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                                : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-500'
                                }`}
                            onClick={(e) => onToggleFavori && onToggleFavori(vin.UUID_, !vin.Coup_de_Coeur, e)}
                            title={vin.Coup_de_Coeur ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                        >
                            <svg className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} fill={vin.Coup_de_Coeur ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
