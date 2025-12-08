import React, { useState, useContext, useEffect, useMemo } from 'react';
import { FileUpload } from 'primereact/fileupload';
import { Dialog } from 'primereact/dialog';
import CreatableSelect from 'react-select/creatable';
import VinTabs from './VinTabs';
import { ThemeContext } from '../context/ThemeContext';
import FancyNoteSlider from '../components/FancyNoteSlider';

const NouveauVinEtape2 = ({
    vin,
    handleInputChange,
    handleSave,
    customBase64UploaderSansIA,
    getNoteDescription,
    optionsPays,
    filteredRegions,
    optionCouleur,
    optionTypeVin,
    distinctCaves,
    defaultCountryValue,
    defaultRegionValue,
    handleCountryChange,
    errorRegion,
    errorCouleur,
    showAddCaveDialog,
    setShowAddCaveDialog,
    newCaveName,
    setNewCaveName,
    handleCaveChange,
    addCaveDialogFooter,
    onBack
}) => {
    const { darkMode } = useContext(ThemeContext);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isClearable] = useState(true);
    const [isSearchable] = useState(true);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Liste des mets suggérés
    const associationMetsList = useMemo(() => {
        if (vin?.Association_Mets) {
            return vin.Association_Mets.split(',')
                .map(item => item.trim())
                .filter(item => item);
        }
        return [];
    }, [vin?.Association_Mets]);

    // Cave principale par défaut
    const cavePrincipaleOption = useMemo(() => {
        if (!distinctCaves || distinctCaves.length === 0) return null;
        return distinctCaves.find(o => o.label && o.label.toLowerCase() === 'cave principale');
    }, [distinctCaves]);

    useEffect(() => {
        if (!vin?.Cave && cavePrincipaleOption) {
            handleCaveChange(cavePrincipaleOption.value);
        }
    }, [vin?.Cave, cavePrincipaleOption, handleCaveChange]);

    // Styles communs pour react-select (alignés sur la page Vin)
    const selectStyles = {
        control: (baseStyles, state) => ({
            ...baseStyles,
            minHeight: '48px',
            boxShadow: state.isFocused ? '0 0 0 1px rgba(255,255,255,0.35)' : 'none',
            borderRadius: 10,
            backgroundColor: 'rgba(15,23,42,0.8)', // bg-gray-900/80
            color: 'white',
            border: '1px solid rgba(255,255,255,0.2)',
        }),
        singleValue: (baseStyles) => ({
            ...baseStyles,
            color: 'white',
        }),
        menu: (baseStyles) => ({
            ...baseStyles,
            backgroundColor: '#020617', // slate-950
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.2)',
            zIndex: 9999,
        }),
        option: (baseStyles, state) => ({
            ...baseStyles,
            backgroundColor: state.isFocused ? 'rgba(148,163,184,0.25)' : 'transparent',
            color: 'white',
            fontSize: 13,
        }),
        placeholder: (baseStyles) => ({
            ...baseStyles,
            color: 'rgba(248,250,252,0.45)',
        }),
        menuPortal: (baseStyles) => ({
            ...baseStyles,
            zIndex: 9999,
        }),
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#8C2438] via-[#5A1020] to-[#3B0B15] font-['Work_Sans',sans-serif] text-white">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1a0207] via-[#3B0B15] to-[#1a0207] border-b border-white/10 shadow-[0_18px_30px_-18px_rgba(0,0,0,0.9)] px-4 py-6 md:py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center gap-4 mb-2 md:mb-4">
                        <button
                            onClick={onBack}
                            className="
                                w-11 h-11 md:w-12 md:h-12
                                bg-white/10 border border-white/20
                                rounded-2xl flex items-center justify-center
                                shadow-[0_14px_30px_rgba(0,0,0,0.9)]
                                hover:scale-105 active:scale-95
                                hover:bg-white/15
                                transition-all duration-300
                            "
                        >
                            <i className="pi pi-arrow-left text-white text-lg md:text-xl"></i>
                        </button>

                        <div className="
                            w-11 h-11 md:w-12 md:h-12
                            bg-white/15 border border-white/30
                            rounded-2xl flex items-center justify-center
                            shadow-[0_16px_40px_rgba(0,0,0,0.9)]
                        ">
                            <i className="pi pi-file-edit text-white text-lg md:text-xl"></i>
                        </div>

                        <div>
                            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white">
                                Détails du vin
                            </h1>
                            <p className="text-sm md:text-lg mt-1 md:mt-2 text-white/70">
                                Complétez ou modifiez les informations de votre vin
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto py-6 md:py-8">
                {isMobile ? (
                    // ----------- VERSION MOBILE -----------
                    <div className="mx-4 space-y-6">
                        {/* Image (mobile) */}
                        <div className="
                            bg-gray-900/70
                            border border-white/10
                            shadow-[0_24px_60px_rgba(0,0,0,0.9)]
                            rounded-2xl overflow-hidden
                            backdrop-blur
                            transform transition-all duration-300
                            hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(0,0,0,1)]
                        ">
                            <div className="p-5 sm:p-6 text-center">
                                {vin?.base64_etiquette ? (
                                    <div className="flex flex-col items-center">
                                        <img
                                            src={`data:image/jpeg;base64,${vin.base64_etiquette}`}
                                            alt="Étiquette"
                                            className="
                                                w-32 h-40 object-cover rounded-xl
                                                shadow-[0_18px_40px_rgba(0,0,0,0.9)]
                                                mx-auto mb-4
                                                transition-transform duration-300
                                                hover:scale-105
                                            "
                                        />
                                        <FileUpload
                                            name="demo[]"
                                            mode="basic"
                                            chooseLabel={vin?.base64_etiquette ? "Changer l'image" : "Ajouter une image"}
                                            accept="image/*"
                                            maxFileSize={90000000}
                                            customUpload={true}
                                            onSelect={customBase64UploaderSansIA}
                                            className="text-xs sm:text-sm !bg-transparent !border-0 !text-white/80"
                                        />
                                    </div>
                                ) : (
                                    <div className="text-white/40 mb-4 flex flex-col items-center">
                                        <i className="pi pi-image text-5xl mb-2"></i>
                                        <p className="text-sm">Aucune image importée</p>
                                        <FileUpload
                                            name="demo[]"
                                            mode="basic"
                                            chooseLabel="Ajouter une image"
                                            accept="image/*"
                                            maxFileSize={90000000}
                                            customUpload={true}
                                            onSelect={customBase64UploaderSansIA}
                                            className="mt-3 text-xs sm:text-sm !bg-transparent !border-0 !text-white/80"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Formulaire complet mobile */}
                        <div className="
                            bg-gray-900/70
                            border border-white/10
                            shadow-[0_24px_60px_rgba(0,0,0,0.9)]
                            rounded-2xl overflow-hidden
                            backdrop-blur
                            transform transition-all duration-300
                            hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(0,0,0,1)]
                        ">
                            <div className="p-5 sm:p-6">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-semibold tracking-wide mb-2 text-white/80">
                                            Nom du vin
                                        </label>
                                        <input
                                            type="text"
                                            name="Nom"
                                            value={vin?.Nom || ''}
                                            onChange={handleInputChange}
                                            className="
                                                w-full p-3 rounded-xl
                                                bg-gray-900/70 border border-white/20
                                                text-sm text-white
                                                placeholder:text-white/40
                                                focus:outline-none focus:ring-2 focus:ring-white/60 focus:border-white/60
                                                transition-all
                                            "
                                            placeholder="Nom du vin"
                                        />
                                        {vin?.Domaine && (
                                            <p className="text-xs font-medium text-white/70 mt-2">
                                                <span className="text-white/80">Domaine :</span> {vin.Domaine}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {/* PAYS */}
                                        <div>
                                            <label className="block text-xs font-semibold tracking-wide mb-2 text-white/80">
                                                Pays
                                            </label>
                                            <CreatableSelect
                                                styles={selectStyles}
                                                value={vin?.Pays ? { label: vin.Pays, value: vin.Pays } : null}
                                                options={optionsPays}
                                                onChange={handleCountryChange}
                                                placeholder="Pays"
                                                isSearchable
                                                isClearable
                                                formatCreateLabel={(inputValue) => `Créer "${inputValue}"`}
                                                menuPortalTarget={document.body}
                                                className="text-xs"
                                            />
                                        </div>

                                        {/* REGION */}
                                        <div>
                                            <label className="block text-xs font-semibold tracking-wide mb-2 text-white/80">
                                                Région
                                            </label>
                                            <CreatableSelect
                                                styles={selectStyles}
                                                value={vin?.Région ? { label: vin.Région, value: vin.Région } : null}
                                                options={filteredRegions}
                                                onChange={(selectedOption) =>
                                                    handleInputChange(selectedOption?.label || '', 'Région')
                                                }
                                                placeholder="Région"
                                                isSearchable
                                                isClearable
                                                formatCreateLabel={(inputValue) => `Créer "${inputValue}"`}
                                                menuPortalTarget={document.body}
                                                className="text-xs"
                                            />
                                            {errorRegion && (
                                                <p className="text-red-400 text-xs mt-1">{errorRegion}</p>
                                            )}
                                        </div>

                                        {/* Sous région */}
                                        <div>
                                            <label className="block text-xs font-semibold tracking-wide mb-2 text-white/80">
                                                Sous région
                                            </label>
                                            <input
                                                type="text"
                                                name="Sous_Region"
                                                value={vin?.Sous_Region || ''}
                                                onChange={handleInputChange}
                                                className="
                                                    w-full p-3 rounded-xl
                                                    bg-gray-900/70 border border-white/20
                                                    text-xs text-white
                                                    placeholder:text-white/40
                                                    focus:outline-none focus:ring-2 focus:ring-white/60 focus:border-white/60
                                                    transition-all
                                                "
                                                placeholder="Sous région"
                                            />
                                        </div>

                                        {/* Appellation */}
                                        <div>
                                            <label className="block text-xs font-semibold tracking-wide mb-2 text-white/80">
                                                Appellation
                                            </label>
                                            <input
                                                type="text"
                                                name="Appellation"
                                                value={vin?.Appellation || ''}
                                                onChange={handleInputChange}
                                                className="
                                                    w-full p-3 rounded-xl
                                                    bg-gray-900/70 border border-white/20
                                                    text-xs text-white
                                                    placeholder:text-white/40
                                                    focus:outline-none focus:ring-2 focus:ring-white/60 focus:border-white/60
                                                    transition-all
                                                "
                                                placeholder="Appellation"
                                            />
                                        </div>

                                        {/* Producteur */}
                                        <div>
                                            <label className="block text-xs font-semibold tracking-wide mb-2 text-white/80">
                                                Producteur
                                            </label>
                                            <input
                                                type="text"
                                                name="Producteur"
                                                value={vin?.Producteur || ''}
                                                onChange={handleInputChange}
                                                className="
                                                    w-full p-3 rounded-xl
                                                    bg-gray-900/70 border border-white/20
                                                    text-xs text-white
                                                    placeholder:text-white/40
                                                    focus:outline-none focus:ring-2 focus:ring-white/60 focus:border-white/60
                                                    transition-all
                                                "
                                                placeholder="Producteur"
                                            />
                                        </div>

                                        {/* Millésime */}
                                        <div>
                                            <label className="block text-xs font-semibold tracking-wide mb-2 text-white/80">
                                                Millésime
                                            </label>
                                            <input
                                                type="text"
                                                name="Millesime"
                                                value={vin?.Millesime || ''}
                                                onChange={handleInputChange}
                                                className="
                                                    w-full p-3 rounded-xl
                                                    bg-gray-900/70 border border-white/20
                                                    text-xs text-white
                                                    placeholder:text-white/40
                                                    focus:outline-none focus:ring-2 focus:ring-white/60 focus:border-white/60
                                                    transition-all
                                                "
                                                placeholder="Millésime"
                                            />
                                        </div>

                                        {/* Cépage */}
                                        <div>
                                            <label className="block text-xs font-semibold tracking-wide mb-2 text-white/80">
                                                Cépage(s)
                                            </label>
                                            <input
                                                type="text"
                                                name="Cepage"
                                                value={vin?.Cepage || ''}
                                                onChange={handleInputChange}
                                                className="
                                                    w-full p-3 rounded-xl
                                                    bg-gray-900/70 border border-white/20
                                                    text-xs text-white
                                                    placeholder:text-white/40
                                                    focus:outline-none focus:ring-2 focus:ring-white/60 focus:border-white/60
                                                    transition-all
                                                "
                                                placeholder="Cépage(s)"
                                            />
                                        </div>

                                        {/* Alcool */}
                                        <div>
                                            <label className="block text-xs font-semibold tracking-wide mb-2 text-white/80">
                                                Alcool (% vol.)
                                            </label>
                                            <input
                                                type="text"
                                                name="Alcool"
                                                value={vin?.Alcool || ''}
                                                onChange={handleInputChange}
                                                className="
                                                    w-full p-3 rounded-xl
                                                    bg-gray-900/70 border border-white/20
                                                    text-xs text-white
                                                    placeholder:text-white/40
                                                    focus:outline-none focus:ring-2 focus:ring-white/60 focus:border-white/60
                                                    transition-all
                                                "
                                                placeholder="Taux d'alcool"
                                            />
                                        </div>

                                        {/* Couleur */}
                                        <div>
                                            <label className="block text-xs font-semibold tracking-wide mb-2 text-white/80">
                                                Couleur
                                            </label>
                                            <CreatableSelect
                                                styles={selectStyles}
                                                classNamePrefix="Couleur"
                                                value={vin?.Couleur ? { label: vin.Couleur, value: vin.Couleur } : null}
                                                options={optionCouleur}
                                                onChange={(selectedOption) =>
                                                    handleInputChange(
                                                        selectedOption?.value || selectedOption?.label || '',
                                                        'Couleur'
                                                    )
                                                }
                                                placeholder="Couleur"
                                                isSearchable
                                                isClearable
                                                formatCreateLabel={(inputValue) => `Créer "${inputValue}"`}
                                                menuPortalTarget={document.body}
                                                className="text-xs"
                                            />
                                            {errorCouleur && (
                                                <p className="text-red-400 text-xs mt-1">{errorCouleur}</p>
                                            )}
                                        </div>

                                        {/* Type */}
                                        <div>
                                            <label className="block text-xs font-semibold tracking-wide mb-2 text-white/80">
                                                Type
                                            </label>
                                            <CreatableSelect
                                                styles={selectStyles}
                                                classNamePrefix="Type"
                                                value={vin?.Type ? { label: vin.Type, value: vin.Type } : null}
                                                options={optionTypeVin}
                                                onChange={(selectedOption) =>
                                                    handleInputChange(
                                                        selectedOption?.value || selectedOption?.label || '',
                                                        'Type'
                                                    )
                                                }
                                                placeholder="Type"
                                                isSearchable
                                                isClearable
                                                formatCreateLabel={(inputValue) => `Créer "${inputValue}"`}
                                                menuPortalTarget={document.body}
                                                className="text-xs"
                                            />
                                        </div>

                                        {/* Cave */}
                                        <div>
                                            <label className="block text-xs font-semibold tracking-wide mb-2 text-white/80">
                                                Cave
                                            </label>
                                            <CreatableSelect
                                                styles={selectStyles}
                                                classNamePrefix="Cave"
                                                value={
                                                    vin?.Cave
                                                        ? { label: vin.Cave, value: vin.Cave }
                                                        : cavePrincipaleOption || null
                                                }
                                                isClearable={isClearable}
                                                isSearchable={isSearchable}
                                                name="Cave"
                                                placeholder="Cave"
                                                options={distinctCaves}
                                                onChange={(selectedOption) =>
                                                    handleCaveChange(
                                                        selectedOption?.value || selectedOption?.label || ''
                                                    )
                                                }
                                                formatCreateLabel={(inputValue) => `Créer "${inputValue}"`}
                                                menuPortalTarget={document.body}
                                                className="text-xs"
                                            />
                                        </div>

                                        {/* Valeur */}
                                        <div>
                                            <label className="block text-xs font-semibold tracking-wide mb-2 text-white/80">
                                                Valeur (€)
                                            </label>
                                            <input
                                                type="number"
                                                name="Valeur"
                                                value={vin?.Valeur || ''}
                                                onChange={handleInputChange}
                                                className="
                                                    w-full p-3 rounded-xl
                                                    bg-gray-900/70 border border-white/20
                                                    text-xs text-white
                                                    placeholder:text-white/40
                                                    focus:outline-none focus:ring-2 focus:ring-white/60 focus:border-white/60
                                                    transition-all
                                                "
                                                placeholder="Valeur estimée"
                                            />
                                        </div>

                                        {/* Lieu stockage */}
                                        <div>
                                            <label className="block text-xs font-semibold tracking-wide mb-2 text-white/80">
                                                Lieu de stockage
                                            </label>
                                            <input
                                                type="text"
                                                name="Etagere"
                                                value={vin?.Etagere || ''}
                                                onChange={handleInputChange}
                                                className="
                                                    w-full p-3 rounded-xl
                                                    bg-gray-900/70 border border-white/20
                                                    text-xs text-white
                                                    placeholder:text-white/40
                                                    focus:outline-none focus:ring-2 focus:ring-white/60 focus:border-white/60
                                                    transition-all
                                                "
                                                placeholder="Étagère"
                                            />
                                        </div>
                                    </div>

                                    {/* Note Slider */}
                                    <div>
                                        <label className="block text-xs font-semibold tracking-wide mb-2 text-white/80">
                                            Note
                                            <span className="ml-2 text-sm font-bold text-white/90">
                                                {vin?.Note_sur_100 ?? 0} / 100
                                            </span>
                                        </label>
                                        <div className="px-1">
                                            <div className="flex items-center gap-4">
                                                <FancyNoteSlider
                                                    min={84}
                                                    max={100}
                                                    value={Number(vin?.Note_sur_100 ?? 84)}
                                                    onChange={(v) => handleInputChange(v, 'Note_sur_100')}
                                                />
                                            </div>
                                            <div className="mt-1 text-xs text-white/70 text-center font-medium">
                                                {getNoteDescription(Number(vin?.Note_sur_100 ?? 0))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Association vin */}
                                    {associationMetsList.length > 0 && (
                                        <div>
                                            <label className="block text-xs font-semibold tracking-wide mb-2 text-white/80">
                                                Association vin
                                            </label>
                                            <p className="text-xs font-medium text-white/70 mb-2">
                                                Suggestions de mets :
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {associationMetsList.map((mets, index) => (
                                                    <span
                                                        key={index}
                                                        className="
                                                            inline-flex items-center px-3 py-1 rounded-full text-[11px]
                                                            bg-white/5 border border-white/20
                                                            text-white/80
                                                        "
                                                    >
                                                        {mets}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Remarques */}
                                    <div>
                                        <label className="block text-xs font-semibold tracking-wide mb-2 text-white/80">
                                            Remarques
                                        </label>
                                        <textarea
                                            name="Remarques"
                                            value={vin?.Remarques || ''}
                                            onChange={handleInputChange}
                                            rows={3}
                                            className="
                                                w-full p-3 rounded-xl
                                                bg-gray-900/70 border border-white/20
                                                text-xs text-white
                                                placeholder:text-white/40
                                                focus:outline-none focus:ring-2 focus:ring-white/60 focus:border-white/60
                                                transition-all resize-none
                                            "
                                            placeholder="Remarques sur le vin..."
                                        />
                                    </div>

                                    {/* Quantité */}
                                    <div>
                                        <label className="block text-xs font-semibold tracking-wide mb-3 text-white/80">
                                            Quantité
                                        </label>
                                        <div className="flex items-center justify-center">
                                            <div className="
                                                flex items-center
                                                border border-white/25
                                                rounded-xl bg-gray-900/70
                                                shadow-[0_10px_25px_rgba(0,0,0,0.7)]
                                            ">
                                                <button
                                                    onClick={() => {
                                                        const newQte = Math.max((vin?.Qte || 0) - 1, 0);
                                                        handleInputChange(newQte, 'Qte');
                                                    }}
                                                    className="
                                                        px-5 py-3 text-xl font-bold
                                                        text-white/80 hover:text-white
                                                        hover:bg-white/5 rounded-l-xl
                                                        transition-all
                                                    "
                                                >
                                                    −
                                                </button>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={vin?.Qte || 0}
                                                    onChange={(e) => {
                                                        const newQte = Math.max(
                                                            parseInt(e.target.value || '0', 10),
                                                            0
                                                        );
                                                        handleInputChange(newQte, 'Qte');
                                                    }}
                                                    className="
                                                        w-16 text-center bg-transparent
                                                        text-2xl font-bold text-white
                                                        focus:outline-none py-3
                                                    "
                                                />
                                                <button
                                                    onClick={() => {
                                                        const newQte = (vin?.Qte || 0) + 1;
                                                        handleInputChange(newQte, 'Qte');
                                                    }}
                                                    className="
                                                        px-5 py-3 text-xl font-bold
                                                        text-white/80 hover:text-white
                                                        hover:bg-white/5 rounded-r-xl
                                                        transition-all
                                                    "
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <span className="ml-3 text-xs text-white/70">
                                                bouteille{(vin?.Qte || 0) > 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            onClick={handleSave}
                                            className="
                                                w-full py-3.5
                                                bg-white/20
                                                text-white font-semibold text-sm
                                                rounded-xl
                                                border border-white/30
                                                shadow-[0_20px_45px_rgba(0,0,0,0.95)]
                                                hover:bg-white/30
                                                hover:shadow-[0_26px_70px_rgba(0,0,0,1)]
                                                focus:outline-none focus:ring-2 focus:ring-white/60 focus:ring-offset-0
                                                transition-all duration-300
                                                transform hover:scale-[1.02] active:scale-[0.97]
                                                flex items-center justify-center gap-2
                                            "
                                        >
                                            <i className="pi pi-check"></i>
                                            Ajouter à ma cave
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* VinTabs mobile */}
                        {vin && (
                            <div className="
                                bg-gray-900/70
                                border border-white/10
                                rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.9)]
                                overflow-hidden backdrop-blur
                            ">
                                <div className="
                                    p-4 border-b border-white/10
                                    bg-gray-900/70 shadow-[0_24px_60px_rgba(0,0,0,0.95)] 
                                ">
                                    <div className="flex items-center gap-3">
                                        <div className="
                                            w-8 h-8 bg-white/15 border border-white/30
                                            rounded-xl flex items-center justify-center
                                        ">
                                            <i className="pi pi-cog text-white text-sm"></i>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-white">
                                                Informations détaillées
                                            </h3>
                                            <p className="text-[11px] text-white/70">
                                                Notes de dégustation et détails
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <VinTabs vin={vin} isEditing={true} handleInputChange={handleInputChange} />
                            </div>
                        )}
                    </div>
                ) : (
                    // ----------- VERSION DESKTOP -----------
                    <div className="
                        bg-gray-900/70
                        rounded-3xl
                        shadow-[0_26px_80px_rgba(0,0,0,0.95)]
                        border border-white/10
                        overflow-hidden
                        backdrop-blur
                        transform transition-all duration-300
                        hover:-translate-y-1 hover:shadow-[0_32px_100px_rgba(0,0,0,1)]
                    ">
                        <div className="grid grid-cols-1 md:grid-cols-2">
                            {/* Colonne image */}
                            <div className="
                                flex items-start justify-center
                                bg-gray-900/70
                                md:border-r border-white/10
                                border-b md:border-b-0 md:pt-10
                            ">
                                <div className="flex flex-col items-center justify-start p-6 md:pt-5">
                                    {vin?.base64_etiquette ? (
                                        <div className="flex flex-col items-center">
                                            <img
                                                src={`data:image/jpeg;base64,${vin.base64_etiquette}`}
                                                alt="Cave"
                                                className="
                                                    w-72 h-96 object-cover rounded-2xl
                                                    shadow-[0_26px_60px_rgba(0,0,0,1)]
                                                    mx-auto mb-6 md:mb-8
                                                    transition-transform duration-300
                                                    hover:scale-105
                                                "
                                            />
                                            <FileUpload
                                                name="demo[]"
                                                mode="basic"
                                                chooseLabel="Changer l'image"
                                                accept="image/*"
                                                maxFileSize={90000000}
                                                customUpload={true}
                                                onSelect={customBase64UploaderSansIA}
                                                className="p-button-outlined mx-auto w-full md:w-64 text-sm !text-white/80"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center text-white/40 mt-4">
                                            <i className="pi pi-image text-7xl mb-5"></i>
                                            <p className="text-base mb-4">Aucune image importée</p>
                                            <FileUpload
                                                name="demo[]"
                                                mode="basic"
                                                chooseLabel="Ajouter une image"
                                                accept="image/*"
                                                maxFileSize={90000000}
                                                customUpload={true}
                                                onSelect={customBase64UploaderSansIA}
                                                className="p-button-outlined mx-auto w-full md:w-64 text-sm !text-white/80"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Colonne formulaire desktop */}
                            <div className="flex-auto bg-gray-900/70 p-8">
                                <div className="mb-8">
                                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                        Votre vin
                                    </h2>
                                    <p className="text-sm md:text-base text-white/70">
                                        Complétez ou modifiez les détails
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    <div className="mb-6">
                                        <label className="block text-xs font-semibold tracking-wide text-white/80 mb-2">
                                            Nom
                                        </label>
                                        <input
                                            type="text"
                                            name="Nom"
                                            value={vin?.Nom || ''}
                                            onChange={handleInputChange}
                                            className="
                                                w-full bg-transparent
                                                border-b border-white/30
                                                focus:outline-none focus:border-white
                                                text-2xl md:text-3xl font-semibold
                                                text-white placeholder:text-white/40
                                                pb-2
                                                transition-all
                                            "
                                            placeholder="Nom du vin"
                                        />
                                        <div className="mt-4 space-y-1">
                                            <p className="text-sm md:text-base font-medium text-white/80">
                                                Domaine : <span className="text-white">{vin?.Domaine || 'N/A'}</span>
                                            </p>
                                            <p className="text-xs md:text-sm text-white/70">
                                                {vin?.Appellation || '—'} · {vin?.Millesime || '—'} · {vin?.Type || '—'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Pays */}
                                        <div>
                                            <label className="block text-xs font-semibold tracking-wide mb-2 text-white/80">
                                                Pays
                                            </label>
                                            <CreatableSelect
                                                styles={selectStyles}
                                                classNamePrefix="Pays"
                                                value={vin?.Pays ? { label: vin.Pays, value: vin.Pays } : null}
                                                options={optionsPays}
                                                onChange={handleCountryChange}
                                                placeholder="Pays"
                                                isSearchable
                                                isClearable
                                                formatCreateLabel={(inputValue) => `Créer "${inputValue}"`}
                                            />
                                        </div>

                                        {/* Région */}
                                        <div>
                                            <label className="block text-xs font-semibold tracking-wide mb-2 text-white/80">
                                                Région
                                            </label>
                                            <CreatableSelect
                                                styles={selectStyles}
                                                classNamePrefix="Région"
                                                value={vin?.Région ? { label: vin.Région, value: vin.Région } : null}
                                                options={filteredRegions}
                                                onChange={(selectedOption) =>
                                                    handleInputChange(selectedOption?.label || '', 'Région')
                                                }
                                                placeholder="Région"
                                                isSearchable
                                                isClearable
                                                formatCreateLabel={(inputValue) => `Créer "${inputValue}"`}
                                            />
                                            {errorRegion && (
                                                <p className="text-red-400 text-xs mt-1">{errorRegion}</p>
                                            )}
                                        </div>

                                        {/* Sous région */}
                                        <div>
                                            <label className="block text-xs font-semibold tracking-wide mb-2 text-white/80">
                                                Sous région
                                            </label>
                                            <input
                                                type="text"
                                                name="Sous_Region"
                                                value={vin?.Sous_Region || ''}
                                                onChange={handleInputChange}
                                                className="
                                                    w-full p-3 rounded-xl
                                                    bg-gray-900/70 border border-white/20
                                                    text-sm text-white
                                                    placeholder:text-white/40
                                                    focus:outline-none focus:ring-2 focus:ring-white/60 focus:border-white/60
                                                "
                                                placeholder="Sous région"
                                            />
                                        </div>

                                        {/* Appellation */}
                                        <div>
                                            <label className="block text-xs font-semibold tracking-wide mb-2 text-white/80">
                                                Appellation
                                            </label>
                                            <input
                                                type="text"
                                                name="Appellation"
                                                value={vin?.Appellation || ''}
                                                onChange={handleInputChange}
                                                className="
                                                    w-full p-3 rounded-xl
                                                    bg-gray-900/70 border border-white/20
                                                    text-sm text-white
                                                    placeholder:text-white/40
                                                    focus:outline-none focus:ring-2 focus:ring-white/60 focus:border-white/60
                                                "
                                                placeholder="Appellation"
                                            />
                                        </div>

                                        {/* Producteur */}
                                        <div>
                                            <label className="block text-xs font-semibold tracking-wide mb-2 text-white/80">
                                                Producteur
                                            </label>
                                            <input
                                                type="text"
                                                name="Producteur"
                                                value={vin?.Producteur || ''}
                                                onChange={handleInputChange}
                                                className="
                                                    w-full p-3 rounded-xl
                                                    bg-gray-900/70 border border-white/20
                                                    text-sm text-white
                                                    placeholder:text-white/40
                                                    focus:outline-none focus:ring-2 focus:ring-white/60 focus:border-white/60
                                                "
                                                placeholder="Producteur"
                                            />
                                        </div>

                                        {/* Millésime */}
                                        <div>
                                            <label className="block text-xs font-semibold tracking-wide mb-2 text-white/80">
                                                Millésime
                                            </label>
                                            <input
                                                type="text"
                                                name="Millesime"
                                                value={vin?.Millesime || ''}
                                                onChange={handleInputChange}
                                                className="
                                                    w-full p-3 rounded-xl
                                                    bg-gray-900/70 border border-white/20
                                                    text-sm text-white
                                                    placeholder:text-white/40
                                                    focus:outline-none focus:ring-2 focus:ring-white/60 focus:border-white/60
                                                "
                                                placeholder="Millésime"
                                            />
                                        </div>

                                        {/* Cépage */}
                                        <div>
                                            <label className="block text-xs font-semibold tracking-wide mb-2 text-white/80">
                                                Cépage(s)
                                            </label>
                                            <input
                                                type="text"
                                                name="Cepage"
                                                value={vin?.Cepage || ''}
                                                onChange={handleInputChange}
                                                className="
                                                    w-full p-3 rounded-xl
                                                    bg-gray-900/70 border border-white/20
                                                    text-sm text-white
                                                    placeholder:text-white/40
                                                    focus:outline-none focus:ring-2 focus:ring-white/60 focus:border-white/60
                                                "
                                                placeholder="Cépage(s)"
                                            />
                                        </div>

                                        {/* Alcool */}
                                        <div>
                                            <label className="block text-xs font-semibold tracking-wide mb-2 text-white/80">
                                                Alcool (% vol.)
                                            </label>
                                            <input
                                                type="text"
                                                name="Alcool"
                                                value={vin?.Alcool || ''}
                                                onChange={handleInputChange}
                                                className="
                                                    w-full p-3 rounded-xl
                                                    bg-gray-900/70 border border-white/20
                                                    text-sm text-white
                                                    placeholder:text-white/40
                                                    focus:outline-none focus:ring-2 focus:ring-white/60 focus:border-white/60
                                                "
                                                placeholder="Taux d'alcool"
                                            />
                                        </div>

                                        {/* Couleur */}
                                        <div>
                                            <label className="block text-xs font-semibold tracking-wide mb-2 text-white/80">
                                                Couleur
                                            </label>
                                            <CreatableSelect
                                                styles={selectStyles}
                                                classNamePrefix="Couleur"
                                                value={vin?.Couleur ? { label: vin.Couleur, value: vin.Couleur } : null}
                                                options={optionCouleur}
                                                onChange={(selectedOption) =>
                                                    handleInputChange(
                                                        selectedOption?.value || selectedOption?.label || '',
                                                        'Couleur'
                                                    )
                                                }
                                                placeholder="Couleur"
                                                isSearchable
                                                isClearable
                                                formatCreateLabel={(inputValue) => `Créer "${inputValue}"`}
                                            />
                                            {errorCouleur && (
                                                <p className="text-red-400 text-xs mt-1">{errorCouleur}</p>
                                            )}
                                        </div>

                                        {/* Type */}
                                        <div>
                                            <label className="block text-xs font-semibold tracking-wide mb-2 text-white/80">
                                                Type
                                            </label>
                                            <CreatableSelect
                                                styles={selectStyles}
                                                classNamePrefix="Type"
                                                value={vin?.Type ? { label: vin.Type, value: vin.Type } : null}
                                                options={optionTypeVin}
                                                onChange={(selectedOption) =>
                                                    handleInputChange(
                                                        selectedOption?.value || selectedOption?.label || '',
                                                        'Type'
                                                    )
                                                }
                                                placeholder="Type"
                                                isSearchable
                                                isClearable
                                                formatCreateLabel={(inputValue) => `Créer "${inputValue}"`}
                                            />
                                        </div>

                                        {/* Cave */}
                                        <div>
                                            <label className="block text-xs font-semibold tracking-wide mb-2 text-white/80">
                                                Cave
                                            </label>
                                            <CreatableSelect
                                                styles={selectStyles}
                                                classNamePrefix="Cave"
                                                value={
                                                    vin?.Cave
                                                        ? { label: vin.Cave, value: vin.Cave }
                                                        : cavePrincipaleOption || null
                                                }
                                                isClearable={isClearable}
                                                isSearchable={isSearchable}
                                                name="Cave"
                                                placeholder="Cave"
                                                options={distinctCaves}
                                                onChange={(selectedOption) =>
                                                    handleCaveChange(
                                                        selectedOption?.value || selectedOption?.label || ''
                                                    )
                                                }
                                                formatCreateLabel={(inputValue) => `Créer "${inputValue}"`}
                                            />
                                            <button
                                                onClick={() => setShowAddCaveDialog(true)}
                                                className="mt-2 text-[11px] text-white/70 hover:text-white hover:underline transition-colors"
                                            >
                                                + Ajouter une nouvelle cave
                                            </button>
                                        </div>

                                        {/* Valeur */}
                                        <div>
                                            <label className="block text-xs font-semibold tracking-wide mb-2 text-white/80">
                                                Valeur (€)
                                            </label>
                                            <input
                                                type="number"
                                                name="Valeur"
                                                value={vin?.Valeur || ''}
                                                onChange={handleInputChange}
                                                className="
                                                    w-full p-3 rounded-xl
                                                    bg-gray-900/70 border border-white/20
                                                    text-sm text-white
                                                    placeholder:text-white/40
                                                    focus:outline-none focus:ring-2 focus:ring-white/60 focus:border-white/60
                                                "
                                                placeholder="Valeur estimée"
                                            />
                                        </div>

                                        {/* Lieu de stockage */}
                                        <div>
                                            <label className="block text-xs font-semibold tracking-wide mb-2 text-white/80">
                                                Lieu de stockage
                                            </label>
                                            <input
                                                type="text"
                                                name="Etagere"
                                                value={vin?.Etagere || ''}
                                                onChange={handleInputChange}
                                                className="
                                                    w-full p-3 rounded-xl
                                                    bg-gray-900/70 border border-white/20
                                                    text-sm text-white
                                                    placeholder:text-white/40
                                                    focus:outline-none focus:ring-2 focus:ring-white/60 focus:border-white/60
                                                "
                                                placeholder="Étagère"
                                            />
                                        </div>
                                    </div>

                                    {/* Note Slider */}
                                    <div>
                                        <div className="flex items-center gap-4">
                                            <FancyNoteSlider
                                                min={84}
                                                max={100}
                                                value={Number(vin?.Note_sur_100 ?? 84)}
                                                onChange={(v) => handleInputChange(v, 'Note_sur_100')}
                                            />
                                            <span className="text-lg font-semibold w-14 text-center text-white/90">
                                                {vin?.Note_sur_100 ?? 0}
                                            </span>
                                        </div>
                                        <div className="text-xs md:text-sm text-white/70 mt-1 italic">
                                            {getNoteDescription(Number(vin?.Note_sur_100 ?? 0))}
                                        </div>
                                    </div>

                                    {/* Quantité */}
                                    <div>
                                        <label className="block text-xs font-semibold tracking-wide mb-2 text-white/80">
                                            Quantité
                                        </label>
                                        <div className="
                                            flex items-center
                                            border border-white/25
                                            rounded-xl px-4 py-2 w-fit
                                            bg-gray-900/70
                                            shadow-[0_10px_30px_rgba(0,0,0,0.8)]
                                        ">
                                            <button
                                                onClick={() => {
                                                    const newQte = Math.max((vin?.Qte || 0) - 1, 0);
                                                    handleInputChange(newQte, 'Qte');
                                                }}
                                                className="
                                                    text-xl font-light px-2
                                                    text-white/80 hover:text-white
                                                    transition-colors
                                                "
                                            >
                                                −
                                            </button>
                                            <input
                                                type="number"
                                                min="0"
                                                value={vin?.Qte || 0}
                                                onChange={(e) => {
                                                    const newQte = Math.max(
                                                        parseInt(e.target.value || '0', 10),
                                                        0
                                                    );
                                                    handleInputChange(newQte, 'Qte');
                                                }}
                                                className="
                                                    no-spinner mx-4 w-12 text-center
                                                    bg-transparent text-sm font-medium
                                                    text-white focus:outline-none
                                                "
                                            />
                                            <button
                                                onClick={() => {
                                                    const newQte = (vin?.Qte || 0) + 1;
                                                    handleInputChange(newQte, 'Qte');
                                                }}
                                                className="
                                                    text-xl font-light px-2
                                                    text-white/80 hover:text-white
                                                    transition-colors
                                                "
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    {/* Association vin */}
                                    {associationMetsList.length > 0 && (
                                        <div className="mb-2">
                                            <label className="block text-xs font-semibold tracking-wide mb-1 text-white/80">
                                                Association vin
                                            </label>
                                            <p className="text-xs text-white/70 mb-2">
                                                Suggestions de mets :
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {associationMetsList.map((mets, index) => (
                                                    <span
                                                        key={index}
                                                        className="
                                                            inline-flex items-center px-3 py-1 rounded-full text-xs
                                                            bg-white/5 border border-white/20
                                                            text-white/80
                                                        "
                                                    >
                                                        {mets}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Remarques */}
                                    <div>
                                        <label className="block text-xs font-semibold tracking-wide mb-2 text-white/80">
                                            Remarques
                                        </label>
                                        <textarea
                                            name="Remarques"
                                            value={vin?.Remarques || ''}
                                            onChange={handleInputChange}
                                            rows={5}
                                            className="
                                                w-full p-3 rounded-xl
                                                bg-gray-900/70 border border-white/20
                                                text-sm text-white
                                                placeholder:text-white/40
                                                focus:outline-none focus:ring-2 focus:ring-white/60 focus:border-white/60
                                                resize-vertical
                                            "
                                            placeholder="Remarques diverses"
                                        />
                                    </div>

                                    <div className="mt-4 pt-2 w-full flex justify-end">
                                        <button
                                            onClick={handleSave}
                                            className="
                                                px-6 py-2.5 rounded-xl text-sm font-semibold
                                                bg-white/20
                                                text-white
                                                border border-white/30
                                                shadow-[0_18px_45px_rgba(0,0,0,0.95)]
                                                hover:bg-white/30
                                                hover:shadow-[0_22px_70px_rgba(0,0,0,1)]
                                                transform hover:scale-[1.02] active:scale-[0.97]
                                                transition-all duration-300
                                                flex items-center gap-2
                                            "
                                        >
                                            <i className="pi pi-check" />
                                            Sauvegarder
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* VinTabs - desktop */}
            {!isMobile && vin && (
                <div className="max-w-7xl mx-auto px-4 pb-8">
                    <div className="
                        bg-gray-900/70
                        rounded-3xl shadow-[0_26px_80px_rgba(0,0,0,0.95)]
                        border border-white/10
                        overflow-hidden backdrop-blur
                    ">
                        <div className="
                            p-6 md:p-8
                            border-b border-white/10
                            bg-gray-900/70 border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.95)] 
                        ">
                            <div className="flex items-center gap-4">
                                <div className="
                                    w-10 h-10 md:w-12 md:h-12
                                    bg-white/15 border border-white/30
                                    rounded-2xl flex items-center justify-center
                                    shadow-[0_18px_45px_rgba(0,0,0,0.95)]
                                ">
                                    <i className="pi pi-cog text-white text-lg md:text-xl"></i>
                                </div>
                                <div>
                                    <h2 className="text-lg md:text-2xl font-bold text-white">
                                        Informations détaillées
                                    </h2>
                                    <p className="text-xs md:text-sm text-white/70 mt-1">
                                        Ajoutez des notes de dégustation et d'autres détails
                                    </p>
                                </div>
                            </div>
                        </div>
                        <VinTabs vin={vin} isEditing={true} handleInputChange={handleInputChange} />
                    </div>
                </div>
            )}

            {/* Dialog pour ajouter une cave */}
            <Dialog
                visible={showAddCaveDialog}
                onHide={() => setShowAddCaveDialog(false)}
                header="Ajouter une nouvelle cave"
                className="w-full max-w-md"
                footer={addCaveDialogFooter}
            >
                <div className="p-4 bg-gray-900/80 text-white">
                    <label className="block text-sm font-semibold mb-2 text-white/80">
                        Nom de la cave
                    </label>
                    <input
                        type="text"
                        value={newCaveName}
                        onChange={(e) => setNewCaveName(e.target.value)}
                        placeholder="Ma cave personnelle"
                        className="
                            w-full p-3 rounded-lg
                            bg-gray-900/70 border border-white/20
                            text-sm text-white
                            placeholder:text-white/40
                            focus:outline-none focus:ring-2 focus:ring-white/60 focus:border-white/60
                        "
                    />
                </div>
            </Dialog>
        </div>
    );
};

export default NouveauVinEtape2;