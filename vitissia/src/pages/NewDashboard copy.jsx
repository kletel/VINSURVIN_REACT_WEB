import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { IconCave, IconMet, IconVin, IconBook } from '../components/CustomIcons';
import useFetchCaves from '../hooks/useFetchCaves';
import useFetchAssociations from '../hooks/useFetchAssociations';
import useFetchVocabulaires from '../hooks/useFetchVocabulaires';

// Petit composant tuile inspiré de l'interface fournie (sans mode sombre ni animations)
function Tile({ title, subtitle, img, onOpen, extra, Icon }) {
	return (
		<div
			onClick={onOpen}
			onKeyDown={(e) => { if (e.key === 'Enter') onOpen(); }}
			role="button"
			tabIndex={0}
			className="group relative isolate overflow-hidden rounded-2xl shadow ring-1 ring-black/10 bg-white focus:outline-none text-left cursor-pointer"
		>
			<img
				src={img}
				alt={title}
				className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
			/>

			<div className="relative z-10 p-0 min-h-[220px]">
				<div className="m-5 rounded-xl bg-white/70 backdrop-blur-sm p-5 ring-1 ring-black/10">
					<div className="flex items-center gap-3">
						<span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/80 text-neutral-900 ring-1 ring-black/10">
							{Icon ? <Icon className="h-5 w-5" /> : null}
						</span>
						<h3 className="text-xl font-semibold tracking-tight text-neutral-900">{title}</h3>
					</div>
					<p className="mt-2 text-sm text-neutral-700">{subtitle}</p>
					{extra ? <div className="mt-3">{extra}</div> : null}
					<div className="mt-4 flex items-center gap-2 text-sm font-medium">
						<span className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium ring-1 ring-inset ring-black/10 bg-white/90 text-neutral-900">
							Ouvrir <i className="pi pi-chevron-right text-xs" />
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}

// Helper: index stable par jour (ne change pas au refresh)
function stableIndex(seedKey, len) {
  if (!len) return 0;
  const d = new Date();
  const seed = `${seedKey}-${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % len;
}

const NewDashboard = () => {
	const navigate = useNavigate();

	// Données dynamiques via APIs
	const { caves, fetchCaves } = useFetchCaves();
	const { associations, fetchAssociations } = useFetchAssociations();
	const { vocabulaires, fetchVocabulaires } = useFetchVocabulaires();

	useEffect(() => {
		fetchCaves();
		fetchAssociations();
		fetchVocabulaires();
	}, [fetchCaves, fetchAssociations, fetchVocabulaires]);

	// Stats caves depuis l'API
	const statsCave = useMemo(() => {
		if (!Array.isArray(caves) || caves.length === 0) return { bottles: 0, regions: 0, favoris: 0 };
		let bottles = 0;
		const regions = new Set();
		let favoris = 0;
		for (const v of caves) {
			const reste = parseFloat(v?.Reste);
			bottles += isNaN(reste) ? 1 : reste;
			const r = v?.['Région'] || v?.Region || v?.region;
			if (r) regions.add(r);
			if (v?.Favori === true || v?.favori === true) favoris++;
		}
		return { bottles, regions: regions.size, favoris };
	}, [caves]);

	// Listes uniques issues des associations
	const uniqueMets = useMemo(() => Array.from(new Set((associations || []).map(a => a?.Met).filter(Boolean))), [associations]);
	const uniqueVins = useMemo(() => Array.from(new Set((associations || []).map(a => a?.Vin).filter(Boolean))), [associations]);

	// Sélections du jour (stables pour la journée)
	const motJour = useMemo(() => {
		if (!Array.isArray(vocabulaires) || vocabulaires.length === 0) return '';
		const idx = stableIndex('mot', vocabulaires.length);
		const item = vocabulaires[idx];
		return item?.Nom_Fr || item?.Nom || '';
	}, [vocabulaires]);

	const metJour = useMemo(() => {
		if (uniqueMets.length === 0) return '';
		return uniqueMets[stableIndex('met', uniqueMets.length)] || '';
	}, [uniqueMets]);

	const vinJour = useMemo(() => {
		if (uniqueVins.length === 0) return '';
		return uniqueVins[stableIndex('vin', uniqueVins.length)] || '';
	}, [uniqueVins]);

	return (
		<Layout>
			<div className="max-w-6xl mx-auto p-4">
				<h1 className="text-2xl font-bold text-gray-900 mb-6">Tableau de bord</h1>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					<Tile
						Icon={IconCave}
						title="Mes caves"
						subtitle="Gérez et explorez toutes vos bouteilles"
						img="/cave-card.png"
						onOpen={() => navigate('/cave')}
						extra={
							<div className="flex flex-wrap items-center gap-2 text-xs">
								<span className="inline-flex items-center rounded-lg px-2.5 py-1 ring-1 ring-black/10 bg-white/70">Nombre bouteilles: {statsCave.bottles || '—'}</span>
								<span className="inline-flex items-center rounded-lg px-2.5 py-1 ring-1 ring-black/10 bg-white/70">Nombre régions: {statsCave.regions || '—'}</span>
								<span className="inline-flex items-center rounded-lg px-2.5 py-1 ring-1 ring-black/10 bg-white/70">Nombre Favoris: {statsCave.favoris || '—'}</span>
							</div>
						}
					/>

					<Tile
						Icon={IconMet}
						title="Rechercher un met"
						subtitle="Trouvez les vins adaptés à votre plat"
						img="/met-card.png"
						onOpen={() => navigate('/mets-vins')}
						extra={
							<div className="flex flex-wrap items-center gap-3">
								<div className="text-sm">Plat du jour: <strong>{metJour || '—'}</strong></div>
								<button
									onClick={(e) => {
										e.stopPropagation();
										try {
											sessionStorage.setItem('metName', metJour || '');
											sessionStorage.removeItem('recetteUUID');
											sessionStorage.removeItem('vinName');
										} catch (_) {}
										navigate('/recette');
									}}
									className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm ring-1 ring-inset ring-black/10 bg-white/70 hover:bg-white"
								>
									<i className="pi pi-external-link text-xs" /> Voir recette
								</button>
							</div>
						}
					/>

					<Tile
						Icon={IconVin}
						title="Rechercher un vin"
						subtitle="Découvrez les mets qui s’accordent au vin"
						img="/vin-card.png"
						onOpen={() => navigate('/vins-mets')}
						extra={<div className="text-sm">Vin du jour: <strong>{vinJour || '—'}</strong></div>}
					/>

					<Tile
						Icon={IconBook}
						title="Dictionnaire"
						subtitle="Termes, arômes et technique"
						img="/dico-card.png"
						onOpen={() => navigate('/dictionnaire')}
						extra={<div className="text-sm">Mot du jour: <strong>{motJour || '—'}</strong></div>}
					/>
				</div>

				{/* CTA bas de page */}
				<div className="mt-6">
					<button
						onClick={() => navigate('/creation-vin')}
						className="w-full inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-base font-medium ring-1 ring-inset ring-black/10 bg-white hover:bg-neutral-50"
					>
						<i className="pi pi-camera text-sm" /> Scannez un vin
					</button>
				</div>
			</div>
		</Layout>
	);
};

export default NewDashboard;
