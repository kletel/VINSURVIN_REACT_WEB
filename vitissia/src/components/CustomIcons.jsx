import React from 'react';

// Icônes SVG personnalisées — style cohérent, utilisables partout (currentColor)
// Chaque icône accepte className pour contrôler taille/couleur via Tailwind

export const IconCave = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {/* Corps de cave */}
    <rect x="8" y="10" width="48" height="44" rx="6" className="opacity-20" fill="currentColor" />
    <rect x="8" y="10" width="48" height="44" rx="6" />
    {/* Étagères */}
    <path d="M12 22h40M12 34h40M12 46h40" />
    {/* Bouteilles stylisées (cercles) */}
    <circle cx="20" cy="22" r="3" />
    <circle cx="32" cy="22" r="3" />
    <circle cx="44" cy="22" r="3" />
    <circle cx="20" cy="34" r="3" />
    <circle cx="32" cy="34" r="3" />
    <circle cx="44" cy="34" r="3" />
    <circle cx="20" cy="46" r="3" />
    <circle cx="32" cy="46" r="3" />
    <circle cx="44" cy="46" r="3" />
  </svg>
);

export const IconMet = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {/* Toque */}
    <path d="M16 28c0-7 6-12 16-12s16 5 16 12" className="opacity-20" fill="currentColor" />
    <path d="M16 28c0-7 6-12 16-12s16 5 16 12" />
    <path d="M20 28v12a4 4 0 0 0 4 4h16a4 4 0 0 0 4-4V28" />
    {/* Couvert croisé */}
    <path d="M18 50l10-10M28 50L18 40" />
    <path d="M46 50V36m0 0c2 0 4 2 4 4s-2 4-4 4-4-2-4-4 2-4 4-4Z" />
  </svg>
);

export const IconVin = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {/* Verre */}
    <path d="M20 10h24c0 10-6 18-12 18S20 20 20 10Z" className="opacity-20" fill="currentColor" />
    <path d="M20 10h24c0 10-6 18-12 18S20 20 20 10Z" />
    {/* Liquide */}
    <path d="M22 18c4 2 16 2 20 0" />
    {/* Pied */}
    <path d="M32 28v12M22 46h20" />
  </svg>
);

export const IconBook = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {/* Livre ouvert */}
    <path d="M10 16h18a8 8 0 0 1 8 8v24H18a8 8 0 0 0-8 8V16Z" className="opacity-20" fill="currentColor" />
    <path d="M10 16h18a8 8 0 0 1 8 8v24H18a8 8 0 0 0-8 8V16Z" />
    <path d="M54 16H36a8 8 0 0 0-8 8v24h18a8 8 0 0 1 8 8V16Z" className="opacity-10" fill="currentColor" />
    <path d="M54 16H36a8 8 0 0 0-8 8v24h18a8 8 0 0 1 8 8V16Z" />
    {/* Signet */}
    <path d="M28 16v14l4-2 4 2V16" />
  </svg>
);

export default { IconCave, IconMet, IconVin, IconBook };
