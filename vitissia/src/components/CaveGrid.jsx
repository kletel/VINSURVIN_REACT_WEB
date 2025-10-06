import React from 'react';
import CaveCard from './CaveCard';

export default function CaveGrid({ items, isMobile, onToggleFavori, onDelete, formatRegionName }) {
  // Responsive grid: 1 col on mobile, 2 on small tablets, 3/4 on desktop
  // Tailwind grid utilities manage wrapping and spacing
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3 lg:gap-4 xl:gap-5">
      {items.map((vin) => (
        <CaveCard
          key={vin.UUID_}
          vin={vin}
          isMobile={isMobile}
          onToggleFavori={onToggleFavori}
          onDelete={onDelete}
          formatRegionName={formatRegionName}
        />
      ))}
    </div>
  );
}
