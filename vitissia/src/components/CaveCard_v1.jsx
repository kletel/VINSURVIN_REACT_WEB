import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function CaveCard({ vin, isMobile, onToggleFavori, onDelete, formatRegionName }) {
  const navigate = useNavigate();

  const formatCurrency = (value) => (value || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });

  // Calcule la note en 5 étoiles + libellé (Exceptionnel, Excellent, Très bon, Bon, Acceptable)
  const getFiveStarRating = (note) => {
    const n = Number(note) || 0;
    if (n >= 95) return { stars: 5, label: 'Exceptionnel' };
    if (n >= 90) return { stars: 4, label: 'Excellent' };
    if (n >= 85) return { stars: 3, label: 'Très bon' };
    if (n >= 80) return { stars: 2, label: 'Bon' };
    return { stars: 1, label: 'Acceptable' };
  };

  const renderStars = (count) => (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <i key={i} className={`pi ${i < count ? 'pi-star-fill text-amber-500' : 'pi-star text-gray-300 dark:text-gray-500'} text-sm`} />
      ))}
    </div>
  );

  const rating = getFiveStarRating(vin.Note_sur_20);

  return (
    <div className="px-1 sm:px-2 py-1" onClick={() => navigate(`/vin/${vin.UUID_}`)}>
      <div className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden group hover:border-blue-300 dark:hover:border-blue-600 h-full">
        {/* Barre de couleur selon le type de vin */}
        <div
          className={`absolute top-0 left-0 w-1 h-full ${
            vin.Couleur?.toLowerCase().includes('rouge')
              ? 'bg-red-500'
              : vin.Couleur?.toLowerCase().includes('blanc')
              ? 'bg-yellow-400'
              : vin.Couleur?.toLowerCase().includes('rosé') || vin.Couleur?.toLowerCase().includes('rose')
              ? 'bg-pink-400'
              : 'bg-gray-400'
          }`}
        ></div>

        {/* Contenu principal */}
        <div className="flex items-stretch p-4 gap-4">
          {/* Bloc texte (gauche) */}
          <div className="flex-1 min-w-0">
            {/* En-tête: Nom + infos secondaires */}
            <div className="mb-2">
              <h3 className={`font-semibold text-gray-900 dark:text-gray-100 truncate ${isMobile ? 'text-base' : 'text-lg'}`}>
                {vin.Nom}
              </h3>
              <p className={`text-gray-500 dark:text-gray-400 truncate ${isMobile ? 'text-xs' : 'text-sm'} mt-0.5`}>
                {/* ex: Nice → ici: Millésime • Producteur */}
                • {vin.Millesime} • {vin.Producteur}
              </p>
            </div>

            {/* Ligne localisation / type / stock */}
            <div className={`text-gray-600 dark:text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'} space-y-1`}>
              <div className="truncate">
                <span className="inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                  {vin.Appellation}
                  {vin.Région && (
                    <>
                      <span className="mx-1">•</span>
                      {formatRegionName ? formatRegionName(vin.Région) : vin.Région}
                    </>
                  )}
                  <span className="mx-1">•</span>
                  {vin.Pays}
                </span>
              </div>
              <div className={`grid gap-x-4 gap-y-1 ${isMobile ? 'grid-cols-2' : 'grid-cols-3'}`}>
                <div className="truncate"><span className="font-medium text-gray-700 dark:text-gray-300">Type:</span> {vin.Type}</div>
                <div className="truncate"><span className="font-medium text-gray-700 dark:text-gray-300">Stock:</span> <span className={`font-medium ${vin.Reste_en_Cave > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{vin.Reste_en_Cave || 0}</span></div>
                {!isMobile && (
                  <div className="truncate"><span className="font-medium text-gray-700 dark:text-gray-300">Cave:</span> {vin.Cave}</div>
                )}
              </div>
              {!isMobile && (
                <div className="truncate"><span className="font-medium text-gray-700 dark:text-gray-300">Format:</span> {vin.Flacon}</div>
              )}
            </div>
          </div>

          {/* Image + prix (droite) */}
          <div className="flex flex-col items-end gap-3 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <img
                src={`data:image/jpeg;base64,${vin.base64_etiquette}`}
                alt={vin.Nom}
                className={`object-cover rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm group-hover:shadow-md transition-shadow duration-300 ${
                  isMobile ? 'w-16 h-20' : 'w-24 h-28'
                }`}
                loading="lazy"
              />
              {vin.Coup_de_Coeur && (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-sm">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </div>

            {/* Prix */}
            <div className="text-right">
              <div className={`font-bold text-gray-900 dark:text-gray-100 ${isMobile ? 'text-sm' : 'text-base'}`}>
                {formatCurrency(vin.valeurCave || vin.Valeur_Euro || 0)}/stock
              </div>
              <div className={`text-gray-500 dark:text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                {formatCurrency(vin.Valeur || 0)}/unité
              </div>
            </div>
          </div>
        </div>

        {/* Bas de carte: divider + rating + actions */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-between bg-white/60 dark:bg-gray-800/60">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            {renderStars(rating.stars)}
            <span className={`text-xs ${rating.stars >= 4 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-300'}`}>{rating.label}</span>
            <span className="text-xs text-gray-400">({vin.Note_sur_20 || 0})</span>
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
              className={`${isMobile ? 'w-8 h-8' : 'w-9 h-9'} rounded-lg border transition-all duration-200 flex items-center justify-center ${
                vin.Coup_de_Coeur
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
