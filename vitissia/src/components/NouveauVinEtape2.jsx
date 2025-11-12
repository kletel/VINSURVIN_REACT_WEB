import React, { useState, useContext, useEffect, useMemo } from 'react';
import { FileUpload } from 'primereact/fileupload';
import { Slider } from 'primereact/slider';
import { Dialog } from 'primereact/dialog';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import VinTabs from './VinTabs';
import ReactStars from 'react-rating-stars-component';
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

    // Gestion de la liste des mets en interne
    const associationMetsList = useMemo(() => {
        if (vin?.Association_Mets) {
            return vin.Association_Mets.split(',').map(item => item.trim()).filter(item => item);
        }
        return [];
    }, [vin?.Association_Mets]);

    // Option par défaut pour Cave Principale si existante
    const cavePrincipaleOption = useMemo(() => {
        if (!distinctCaves || distinctCaves.length === 0) return null;
        return distinctCaves.find(o => o.label && o.label.toLowerCase() === 'cave principale');
    }, [distinctCaves]);

    // Appliquer automatiquement la cave principale si aucune cave sélectionnée
    useEffect(() => {
        if (!vin?.Cave && cavePrincipaleOption) {
            handleCaveChange(cavePrincipaleOption.value);
        }
    }, [vin?.Cave, cavePrincipaleOption, handleCaveChange]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center gap-4 mb-4">
                        <button
                            onClick={onBack}
                            className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center shadow-lg hover:from-gray-600 hover:to-gray-700 transition duration-300"
                        >
                            <i className="pi pi-arrow-left text-white text-xl"></i>
                        </button>
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <i className="pi pi-file-edit text-white text-xl"></i>
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                                Détails du vin
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 text-lg mt-2">
                                Complétez ou modifiez les informations de votre vin
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto py-8">
                {isMobile ? (
                    // Version Mobile avec tous les champs
                    <div className="mx-4 space-y-6">
                        {/* Image (mobile) */}
                        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                            <div className="p-6 text-center">
                                {vin?.base64_etiquette ? (
                                    <img
                                        src={`data:image/jpeg;base64,${vin.base64_etiquette}`}
                                        alt="Étiquette"
                                        className="w-32 h-40 object-cover rounded-xl shadow-lg mx-auto mb-4"
                                    />
                                ) : (
                                    <div className="text-gray-400 dark:text-gray-500 mb-4">
                                        <i className="pi pi-image text-5xl mb-2"></i>
                                        <p className="text-sm">Aucune image importée</p>
                                    </div>
                                )}
                                <FileUpload
                                    name="demo[]"
                                    mode="basic"
                                    chooseLabel={vin?.base64_etiquette ? "Changer l'image" : "Ajouter une image"}
                                    accept="image/*"
                                    maxFileSize={90000000}
                                    customUpload={true}
                                    onSelect={customBase64UploaderSansIA}
                                    className="text-sm"
                                />
                            </div>
                        </div>

                        {/* Formulaire complet mobile */}
                        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                            <div className="p-6">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold mb-3 text-gray-700 dark:text-gray-300">
                                            Nom du vin
                                        </label>
                                        <input
                                            type="text"
                                            name="Nom"
                                            value={vin?.Nom || ''}
                                            onChange={handleInputChange}
                                            className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium"
                                            placeholder="Nom du vin"
                                        />
                                        {vin?.Domaine && (
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-2">
                                                <span className="font-medium">Domaine:</span> {vin.Domaine}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                                                Pays
                                            </label>
                                            <CreatableSelect
                                                styles={{
                                                    control: (base, state) => ({
                                                        ...base,
                                                        minHeight: '48px',
                                                        backgroundColor: darkMode ? '#374151' : 'white',
                                                        borderColor: darkMode ? '#4b5563' : '#d1d5db',
                                                        borderRadius: '12px',
                                                        boxShadow: state.isFocused ? `0 0 0 2px ${darkMode ? '#3b82f6' : '#3b82f6'}` : 'none',
                                                    }),
                                                    singleValue: (base) => ({
                                                        ...base,
                                                        color: darkMode ? 'white' : 'black',
                                                    }),
                                                    menu: (base) => ({
                                                        ...base,
                                                        backgroundColor: darkMode ? '#374151' : 'white',
                                                        borderRadius: '12px',
                                                        zIndex: 9999,
                                                    }),
                                                    option: (base, state) => ({
                                                        ...base,
                                                        backgroundColor: state.isFocused ? (darkMode ? '#4b5563' : '#f3f4f6') : 'transparent',
                                                        color: darkMode ? 'white' : 'black',
                                                    }),
                                                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                                }}
                                                value={vin?.Pays ? { label: vin.Pays, value: vin.Pays } : null}
                                                options={optionsPays}
                                                onChange={handleCountryChange}
                                                placeholder="Pays"
                                                isSearchable
                                                isClearable
                                                formatCreateLabel={(inputValue) => `Créer "${inputValue}"`}
                                                menuPortalTarget={document.body}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                                                Région
                                            </label>
                                            <CreatableSelect
                                                styles={{
                                                    control: (base, state) => ({
                                                        ...base,
                                                        minHeight: '48px',
                                                        backgroundColor: darkMode ? '#374151' : 'white',
                                                        borderColor: darkMode ? '#4b5563' : '#d1d5db',
                                                        borderRadius: '12px',
                                                        boxShadow: state.isFocused ? `0 0 0 2px ${darkMode ? '#3b82f6' : '#3b82f6'}` : 'none',
                                                    }),
                                                    singleValue: (base) => ({
                                                        ...base,
                                                        color: darkMode ? 'white' : 'black',
                                                    }),
                                                    menu: (base) => ({
                                                        ...base,
                                                        backgroundColor: darkMode ? '#374151' : 'white',
                                                        borderRadius: '12px',
                                                        zIndex: 9999,
                                                    }),
                                                    option: (base, state) => ({
                                                        ...base,
                                                        backgroundColor: state.isFocused ? (darkMode ? '#4b5563' : '#f3f4f6') : 'transparent',
                                                        color: darkMode ? 'white' : 'black',
                                                    }),
                                                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                                }}
                                                value={vin?.Région ? { label: vin.Région, value: vin.Région } : null}
                                                options={filteredRegions}
                                                onChange={(selectedOption) => handleInputChange(selectedOption?.label || '', 'Région')}
                                                placeholder="Région"
                                                isSearchable
                                                isClearable
                                                formatCreateLabel={(inputValue) => `Créer "${inputValue}"`}
                                                menuPortalTarget={document.body}
                                            />
                                            {errorRegion && <p className="text-red-500 text-xs mt-1">{errorRegion}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                                                Sous région
                                            </label>
                                            <input
                                                type="text"
                                                name="Sous_Region"
                                                value={vin?.Sous_Region || ''}
                                                onChange={handleInputChange}
                                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Sous région"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                                                Appellation
                                            </label>
                                            <input
                                                type="text"
                                                name="Appellation"
                                                value={vin?.Appellation || ''}
                                                onChange={handleInputChange}
                                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Appellation"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                                                Producteur
                                            </label>
                                            <input
                                                type="text"
                                                name="Producteur"
                                                value={vin?.Producteur || ''}
                                                onChange={handleInputChange}
                                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Producteur"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                                                Millésime
                                            </label>
                                            <input
                                                type="text"
                                                name="Millesime"
                                                value={vin?.Millesime || ''}
                                                onChange={handleInputChange}
                                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Millésime"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                                                Cépage(s)
                                            </label>
                                            <input
                                                type="text"
                                                name="Cepage"
                                                value={vin?.Cepage || ''}
                                                onChange={handleInputChange}
                                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Cépage(s)"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                                                Alcool (% vol.)
                                            </label>
                                            <input
                                                type="text"
                                                name="Alcool"
                                                value={vin?.Alcool || ''}
                                                onChange={handleInputChange}
                                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Taux d'alcool"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                                                Couleur
                                            </label>
                                            <CreatableSelect
                                                styles={{
                                                    control: (base, state) => ({
                                                        ...base,
                                                        minHeight: '48px',
                                                        backgroundColor: darkMode ? '#374151' : 'white',
                                                        borderColor: darkMode ? '#4b5563' : '#d1d5db',
                                                        borderRadius: '12px',
                                                        boxShadow: state.isFocused ? `0 0 0 2px ${darkMode ? '#3b82f6' : '#3b82f6'}` : 'none',
                                                    }),
                                                    singleValue: (base) => ({
                                                        ...base,
                                                        color: darkMode ? 'white' : 'black',
                                                    }),
                                                    menu: (base) => ({
                                                        ...base,
                                                        backgroundColor: darkMode ? '#374151' : 'white',
                                                        borderRadius: '12px',
                                                        zIndex: 9999,
                                                    }),
                                                    option: (base, state) => ({
                                                        ...base,
                                                        backgroundColor: state.isFocused ? (darkMode ? '#4b5563' : '#f3f4f6') : 'transparent',
                                                        color: darkMode ? 'white' : 'black',
                                                    }),
                                                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                                }}
                                                value={vin?.Couleur ? { label: vin.Couleur, value: vin.Couleur } : null}
                                                options={optionCouleur}
                                                onChange={(selectedOption) => handleInputChange(selectedOption?.value || selectedOption?.label || '', 'Couleur')}
                                                placeholder="Couleur"
                                                isSearchable
                                                isClearable
                                                formatCreateLabel={(inputValue) => `Créer "${inputValue}"`}
                                                menuPortalTarget={document.body}
                                            />
                                            {errorCouleur && <p className="text-red-500 text-xs mt-1">{errorCouleur}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                                                Type
                                            </label>
                                            <CreatableSelect
                                                styles={{
                                                    control: (base, state) => ({
                                                        ...base,
                                                        minHeight: '48px',
                                                        backgroundColor: darkMode ? '#374151' : 'white',
                                                        borderColor: darkMode ? '#4b5563' : '#d1d5db',
                                                        borderRadius: '12px',
                                                        boxShadow: state.isFocused ? `0 0 0 2px ${darkMode ? '#3b82f6' : '#3b82f6'}` : 'none',
                                                    }),
                                                    singleValue: (base) => ({
                                                        ...base,
                                                        color: darkMode ? 'white' : 'black',
                                                    }),
                                                    menu: (base) => ({
                                                        ...base,
                                                        backgroundColor: darkMode ? '#374151' : 'white',
                                                        borderRadius: '12px',
                                                        zIndex: 9999,
                                                    }),
                                                    option: (base, state) => ({
                                                        ...base,
                                                        backgroundColor: state.isFocused ? (darkMode ? '#4b5563' : '#f3f4f6') : 'transparent',
                                                        color: darkMode ? 'white' : 'black',
                                                    }),
                                                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                                }}
                                                value={vin?.Type ? { label: vin.Type, value: vin.Type } : null}
                                                options={optionTypeVin}
                                                onChange={(selectedOption) => handleInputChange(selectedOption?.value || selectedOption?.label || '', 'Type')}
                                                placeholder="Type"
                                                isSearchable
                                                isClearable
                                                formatCreateLabel={(inputValue) => `Créer "${inputValue}"`}
                                                menuPortalTarget={document.body}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                                                Cave
                                            </label>
                                            <CreatableSelect
                                                styles={{
                                                    control: (base, state) => ({
                                                        ...base,
                                                        minHeight: '48px',
                                                        backgroundColor: darkMode ? '#374151' : 'white',
                                                        borderColor: darkMode ? '#4b5563' : '#d1d5db',
                                                        borderRadius: '12px',
                                                        boxShadow: state.isFocused ? `0 0 0 2px ${darkMode ? '#3b82f6' : '#3b82f6'}` : 'none',
                                                    }),
                                                    singleValue: (base) => ({
                                                        ...base,
                                                        color: darkMode ? 'white' : 'black',
                                                    }),
                                                    menu: (base) => ({
                                                        ...base,
                                                        backgroundColor: darkMode ? '#374151' : 'white',
                                                        borderRadius: '12px',
                                                        zIndex: 9999,
                                                    }),
                                                    option: (base, state) => ({
                                                        ...base,
                                                        backgroundColor: state.isFocused ? (darkMode ? '#4b5563' : '#f3f4f6') : 'transparent',
                                                        color: darkMode ? 'white' : 'black',
                                                    }),
                                                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                                }}
                                                value={vin?.Cave ? { label: vin.Cave, value: vin.Cave } : (cavePrincipaleOption || null)}
                                                isClearable={isClearable}
                                                isSearchable={isSearchable}
                                                name="Cave"
                                                placeholder="Cave"
                                                options={distinctCaves}
                                                onChange={(selectedOption) => handleCaveChange(selectedOption?.value || selectedOption?.label || '')}
                                                formatCreateLabel={(inputValue) => `Créer "${inputValue}"`}
                                                menuPortalTarget={document.body}
                                            />
                                            {/* <button
                        onClick={() => setShowAddCaveDialog(true)}
                        className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        + Ajouter une nouvelle cave
                      </button> */}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                                                Valeur (€)
                                            </label>
                                            <input
                                                type="number"
                                                name="Valeur"
                                                value={vin?.Valeur || ''}
                                                onChange={handleInputChange}
                                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Valeur estimée"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                                                Lieu de stockage
                                            </label>
                                            <input
                                                type="text"
                                                name="Etagere"
                                                value={vin?.Etagere || ''}
                                                onChange={handleInputChange}
                                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Étagère"
                                            />
                                        </div>
                                    </div>

                                    {/* Note Slider */}
                                    <div>
                                        <label className="block text-sm font-bold mb-3 text-gray-700 dark:text-gray-300">
                                            Note: <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{vin?.Note_sur_20 || 0}/100</span>
                                        </label>
                                        <div className="px-2">
                                            {/*<Slider
                        value={vin?.Note_sur_20 || 83}
                        onChange={(e) => handleInputChange({ name: "Note_sur_20", value: e.value })}
                        min={83}
                        max={100}
                        step={1}
                        className="w-full mb-2"
                      />*/}
                                            <div className="flex items-center gap-4">
                                                <FancyNoteSlider
                                                    min={84}
                                                    max={100}
                                                    value={Number(vin?.Note_sur_100 ?? 84)}
                                                    onChange={(v) => handleInputChange(v, 'Note_sur_100')}
                                                />
                                            </div>

                                            <span className="text-md font-semibold w-16 text-center dark:text-white">
                                                {vin?.Note_sur_100 ?? 0} / 100
                                            </span>

                                            <div className="text-sm text-gray-500 dark:text-gray-400 text-center font-medium">
                                                {getNoteDescription(Number(vin?.Note_sur_100 ?? 0))}
                                            </div>

                                        </div>


                                    </div>

                                    {/* Association vin */}
                                    {associationMetsList.length > 0 && (
                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                                                Association vin
                                            </label>
                                            <div className="mt-3">
                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Suggestions de mets :</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {associationMetsList.map((mets, index) => (
                                                        <span
                                                            key={index}
                                                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                                                        >
                                                            {mets}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Remarques */}
                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                                            Remarques
                                        </label>
                                        <textarea
                                            name="Remarques"
                                            value={vin?.Remarques || ''}
                                            onChange={handleInputChange}
                                            rows={3}
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                            placeholder="Remarques sur le vin..."
                                        />
                                    </div>

                                    {/* Quantity Control */}
                                    <div>
                                        <label className="block text-sm font-bold mb-3 text-gray-700 dark:text-gray-300">
                                            Quantité
                                        </label>
                                        <div className="flex items-center justify-center">
                                            <div className="flex items-center border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 shadow-sm">
                                                <button
                                                    onClick={() => {
                                                        const newQte = Math.max((vin?.Qte || 0) - 1, 0);
                                                        handleInputChange(newQte, 'Qte');
                                                    }}
                                                    className="px-6 py-4 text-2xl font-bold text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-l-xl transition duration-200"
                                                >
                                                    −
                                                </button>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={vin?.Qte || 0}
                                                    onChange={(e) => {
                                                        const newQte = Math.max(parseInt(e.target.value || '0', 10), 0);
                                                        handleInputChange(newQte, 'Qte');
                                                    }}
                                                    className="w-20 text-center bg-transparent text-2xl font-bold text-gray-900 dark:text-white focus:outline-none py-4"
                                                />
                                                <button
                                                    onClick={() => {
                                                        const newQte = (vin?.Qte || 0) + 1;
                                                        handleInputChange(newQte, 'Qte');
                                                    }}
                                                    className="px-6 py-4 text-2xl font-bold text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-r-xl transition duration-200"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <span className="ml-4 text-gray-600 dark:text-gray-400 font-medium">
                                                bouteille{(vin?.Qte || 0) > 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pt-6">
                                        <button
                                            onClick={handleSave}
                                            className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-lg rounded-xl hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 transition duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-xl flex items-center justify-center gap-2"
                                        >
                                            <i className="pi pi-check"></i>
                                            Ajouter à ma cave
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* VinTabs pour mobile */}
                        {vin && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                                <div className="p-4 border-b border-gray-200 dark:border-gray-600 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                                            <i className="pi pi-cog text-white text-sm"></i>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                                Informations détaillées
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
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
                    // Version Desktop (existing code)
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className='grid grid-cols-1 md:grid-cols-2'>
                            <div className='flex bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 items-start justify-center md:items-start md:justify-center border-gray-400 md:border-r border-b md:border-b-0 md:pt-10'>
                                <div className='flex flex-col items-center justify-start p-6 md:pt-5'>
                                    {vin?.base64_etiquette ? (
                                        <div>
                                            <img
                                                src={`data:image/jpeg;base64,${vin.base64_etiquette}`}
                                                alt="Cave"
                                                className="w-72 h-96 object-cover rounded-2xl shadow-2xl mx-auto mb-6 md:mb-8 hover:scale-105 transition-transform duration-300"
                                            />
                                            <FileUpload
                                                name="demo[]"
                                                mode='basic'
                                                chooseLabel="Changer l'image"
                                                accept="image/*"
                                                maxFileSize={90000000}
                                                customUpload={true}
                                                onSelect={customBase64UploaderSansIA}
                                                //agencer au centre
                                                className="p-button-outlined mx-auto w-full md:w-64 text-sm"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center text-gray-400 dark:text-gray-500 mt-4">
                                            <i className="pi pi-image text-8xl mb-6"></i>
                                            <p className="text-xl mb-4">Aucune image importée</p>
                                            <FileUpload
                                                name="demo[]"
                                                mode='basic'
                                                chooseLabel="Ajouter une image"
                                                accept="image/*"
                                                maxFileSize={90000000}
                                                customUpload={true}
                                                onSelect={customBase64UploaderSansIA}
                                                className="p-button-outlined mx-auto w-full md:w-64 text-sm"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className='flex-auto bg-white dark:bg-gray-800 p-8'>
                                <div className="mb-8">
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                                        Votre vin
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                                        Complétez ou modifiez les détails
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    <div className="mb-6">
                                        <label className="block text-gray-700 font-bold text-lg dark:text-gray-400 mb-3">Nom :</label>
                                        <input
                                            type="text"
                                            name="Nom"
                                            value={vin?.Nom || ''}
                                            onChange={handleInputChange}
                                            className="w-full bg-transparent dark:text-[#f0cd7b] border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 text-gray-800 placeholder-gray-400 py-2 text-3xl font-semibold"
                                            placeholder="Nom du vin"
                                        />
                                        <div className="mt-4">
                                            <p className="text-lg font-medium text-gray-800 dark:text-[#f0cd7b]">
                                                Domaine : {vin?.Domaine || 'N/A'}
                                            </p>
                                            <p className="text-gray-500 dark:text-gray-400">
                                                {vin?.Appellation} · {vin?.Millesime} · {vin?.Type}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                                                Pays
                                            </label>
                                            <CreatableSelect
                                                styles={{
                                                    control: (base, state) => ({
                                                        ...base,
                                                        minHeight: '52px',
                                                        backgroundColor: darkMode ? '#374151' : 'white',
                                                        borderColor: darkMode ? '#4b5563' : '#d1d5db',
                                                        borderRadius: '12px',
                                                        boxShadow: state.isFocused ? `0 0 0 2px ${darkMode ? '#3b82f6' : '#3b82f6'}` : 'none',
                                                    }),
                                                    singleValue: (base) => ({
                                                        ...base,
                                                        color: darkMode ? 'white' : 'black',
                                                    }),
                                                    menu: (base) => ({
                                                        ...base,
                                                        backgroundColor: darkMode ? '#374151' : 'white',
                                                        borderRadius: '12px',
                                                    }),
                                                    option: (base, state) => ({
                                                        ...base,
                                                        backgroundColor: state.isFocused ? (darkMode ? '#4b5563' : '#f3f4f6') : 'transparent',
                                                        color: darkMode ? 'white' : 'black',
                                                    }),
                                                }}
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

                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                                                Région
                                            </label>
                                            <CreatableSelect
                                                styles={{
                                                    control: (base, state) => ({
                                                        ...base,
                                                        minHeight: '52px',
                                                        backgroundColor: darkMode ? '#374151' : 'white',
                                                        borderColor: darkMode ? '#4b5563' : '#d1d5db',
                                                        borderRadius: '12px',
                                                        boxShadow: state.isFocused ? `0 0 0 2px ${darkMode ? '#3b82f6' : '#3b82f6'}` : 'none',
                                                    }),
                                                    singleValue: (base) => ({
                                                        ...base,
                                                        color: darkMode ? 'white' : 'black',
                                                    }),
                                                    menu: (base) => ({
                                                        ...base,
                                                        backgroundColor: darkMode ? '#374151' : 'white',
                                                        borderRadius: '12px',
                                                    }),
                                                    option: (base, state) => ({
                                                        ...base,
                                                        backgroundColor: state.isFocused ? (darkMode ? '#4b5563' : '#f3f4f6') : 'transparent',
                                                        color: darkMode ? 'white' : 'black',
                                                    }),
                                                }}
                                                classNamePrefix="Région"
                                                value={vin?.Région ? { label: vin.Région, value: vin.Région } : null}
                                                options={filteredRegions}
                                                onChange={(selectedOption) => handleInputChange(selectedOption?.label || '', 'Région')}
                                                placeholder="Région"
                                                isSearchable
                                                isClearable
                                                formatCreateLabel={(inputValue) => `Créer "${inputValue}"`}
                                            />
                                            {errorRegion && <p className="text-red-500 text-xs mt-1">{errorRegion}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                                                Sous région
                                            </label>
                                            <input
                                                type="text"
                                                name="Sous_Region"
                                                value={vin?.Sous_Region || ''}
                                                onChange={handleInputChange}
                                                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Sous région"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                                                Appellation
                                            </label>
                                            <input
                                                type="text"
                                                name="Appellation"
                                                value={vin?.Appellation || ''}
                                                onChange={handleInputChange}
                                                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Appellation"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                                                Producteur
                                            </label>
                                            <input
                                                type="text"
                                                name="Producteur"
                                                value={vin?.Producteur || ''}
                                                onChange={handleInputChange}
                                                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Producteur"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                                                Millésime
                                            </label>
                                            <input
                                                type="text"
                                                name="Millesime"
                                                value={vin?.Millesime || ''}
                                                onChange={handleInputChange}
                                                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Millésime"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                                                Cépage(s)
                                            </label>
                                            <input
                                                type="text"
                                                name="Cepage"
                                                value={vin?.Cepage || ''}
                                                onChange={handleInputChange}
                                                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Cépage(s)"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                                                Alcool (% vol.)
                                            </label>
                                            <input
                                                type="text"
                                                name="Alcool"
                                                value={vin?.Alcool || ''}
                                                onChange={handleInputChange}
                                                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Taux d'alcool"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                                                Couleur
                                            </label>
                                            <CreatableSelect
                                                styles={{
                                                    control: (base, state) => ({
                                                        ...base,
                                                        minHeight: '52px',
                                                        backgroundColor: darkMode ? '#374151' : 'white',
                                                        borderColor: darkMode ? '#4b5563' : '#d1d5db',
                                                        borderRadius: '12px',
                                                        boxShadow: state.isFocused ? `0 0 0 2px ${darkMode ? '#3b82f6' : '#3b82f6'}` : 'none',
                                                    }),
                                                    singleValue: (base) => ({
                                                        ...base,
                                                        color: darkMode ? 'white' : 'black',
                                                    }),
                                                    menu: (base) => ({
                                                        ...base,
                                                        backgroundColor: darkMode ? '#374151' : 'white',
                                                        borderRadius: '12px',
                                                    }),
                                                    option: (base, state) => ({
                                                        ...base,
                                                        backgroundColor: state.isFocused ? (darkMode ? '#4b5563' : '#f3f4f6') : 'transparent',
                                                        color: darkMode ? 'white' : 'black',
                                                    }),
                                                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                                }}
                                                classNamePrefix="Couleur"
                                                value={vin?.Couleur ? { label: vin.Couleur, value: vin.Couleur } : null}
                                                options={optionCouleur}
                                                onChange={(selectedOption) => handleInputChange(selectedOption?.value || selectedOption?.label || '', 'Couleur')}
                                                placeholder="Couleur"
                                                isSearchable
                                                isClearable
                                                formatCreateLabel={(inputValue) => `Créer "${inputValue}"`}
                                            />
                                            {errorCouleur && (
                                                <p className="text-red-500 text-sm mt-1">{errorCouleur}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                                                Type
                                            </label>
                                            <CreatableSelect
                                                styles={{
                                                    control: (base, state) => ({
                                                        ...base,
                                                        minHeight: '52px',
                                                        backgroundColor: darkMode ? '#374151' : 'white',
                                                        borderColor: darkMode ? '#4b5563' : '#d1d5db',
                                                        borderRadius: '12px',
                                                        boxShadow: state.isFocused ? `0 0 0 2px ${darkMode ? '#3b82f6' : '#3b82f6'}` : 'none',
                                                    }),
                                                    singleValue: (base) => ({
                                                        ...base,
                                                        color: darkMode ? 'white' : 'black',
                                                    }),
                                                    menu: (base) => ({
                                                        ...base,
                                                        backgroundColor: darkMode ? '#374151' : 'white',
                                                        borderRadius: '12px',
                                                    }),
                                                    option: (base, state) => ({
                                                        ...base,
                                                        backgroundColor: state.isFocused ? (darkMode ? '#4b5563' : '#f3f4f6') : 'transparent',
                                                        color: darkMode ? 'white' : 'black',
                                                    }),
                                                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                                }}
                                                classNamePrefix="Type"
                                                value={vin?.Type ? { label: vin.Type, value: vin.Type } : null}
                                                options={optionTypeVin}
                                                onChange={(selectedOption) => handleInputChange(selectedOption?.value || selectedOption?.label || '', 'Type')}
                                                placeholder="Type"
                                                isSearchable
                                                isClearable
                                                formatCreateLabel={(inputValue) => `Créer "${inputValue}"`}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                                                Cave
                                            </label>
                                            <CreatableSelect
                                                styles={{
                                                    control: (base, state) => ({
                                                        ...base,
                                                        minHeight: '52px',
                                                        backgroundColor: darkMode ? '#374151' : 'white',
                                                        borderColor: darkMode ? '#4b5563' : '#d1d5db',
                                                        borderRadius: '12px',
                                                        boxShadow: state.isFocused ? `0 0 0 2px ${darkMode ? '#3b82f6' : '#3b82f6'}` : 'none',
                                                    }),
                                                    singleValue: (base) => ({
                                                        ...base,
                                                        color: darkMode ? 'white' : 'black',
                                                    }),
                                                    menu: (base) => ({
                                                        ...base,
                                                        backgroundColor: darkMode ? '#374151' : 'white',
                                                        borderRadius: '12px',
                                                    }),
                                                    option: (base, state) => ({
                                                        ...base,
                                                        backgroundColor: state.isFocused ? (darkMode ? '#4b5563' : '#f3f4f6') : 'transparent',
                                                        color: darkMode ? 'white' : 'black',
                                                    }),
                                                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                                }}
                                                classNamePrefix="Cave"
                                                value={vin?.Cave ? { label: vin.Cave, value: vin.Cave } : (cavePrincipaleOption || null)}
                                                isClearable={isClearable}
                                                isSearchable={isSearchable}
                                                name="Cave"
                                                placeholder="Cave"
                                                options={distinctCaves}
                                                onChange={(selectedOption) => handleCaveChange(selectedOption?.value || selectedOption?.label || '')}
                                                formatCreateLabel={(inputValue) => `Créer "${inputValue}"`}
                                            />
                                            <button
                                                onClick={() => setShowAddCaveDialog(true)}
                                                className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                            >
                                                + Ajouter une nouvelle cave
                                            </button>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                                                Valeur (€)
                                            </label>
                                            <input
                                                type="number"
                                                name="Valeur"
                                                value={vin?.Valeur || ''}
                                                onChange={handleInputChange}
                                                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Valeur estimée"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                                                Lieu de stockage
                                            </label>
                                            <input
                                                type="text"
                                                name="Etagere"
                                                value={vin?.Etagere || ''}
                                                onChange={handleInputChange}
                                                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Étagère"
                                            />
                                        </div>
                                    </div>

                                    {/* Note Slider - Pleine largeur */}
                                    <div>
                                        <div className="flex items-center gap-4">
                                            <FancyNoteSlider
                                                min={84}
                                                max={100}
                                                value={Number(vin?.Note_sur_100 ?? 84)}
                                                onChange={(v) => handleInputChange(v, 'Note_sur_100')}
                                            />
                                            <span className="text-lg font-semibold w-12 text-center dark:text-white">{vin?.Note_sur_100}</span>
                                        </div>

                                        <div className="text-sm text-gray-400 mt-1 italic">
                                            {getNoteDescription(Number(vin?.Note_sur_100 ?? 0))}
                                        </div>
                                    </div>

                                    {/* Notes de dégustation - Pleine largeur
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                      Notes de dégustation
                    </label>
                    <textarea
                      name="Notes_degustation"
                      value={vin?.Notes_degustation || ''}
                      onChange={handleInputChange}
                      rows={6}
                      className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                      placeholder="Vos impressions de dégustation"
                    />
                  </div>
                  */}

                                    {/* Quantité - Pleine largeur */}
                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                                            Quantité
                                        </label>
                                        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2 w-fit bg-white dark:bg-gray-700">
                                            <button
                                                onClick={() => {
                                                    const newQte = Math.max((vin.Qte || 0) - 1, 0);
                                                    handleInputChange(newQte, 'Qte');
                                                }}
                                                className="text-xl font-light px-2 hover:text-blue-600 disabled:text-gray-300 dark:text-white"
                                            > − </button>
                                            <input
                                                type="number"
                                                min="0"
                                                value={vin?.Qte || 0}
                                                onChange={(e) => {
                                                    const newQte = Math.max(parseInt(e.target.value || '0', 10), 0);
                                                    handleInputChange(newQte, 'Qte');
                                                }}
                                                className="no-spinner mx-4 w-12 text-center bg-transparent text-md font-medium text-gray-900 dark:text-white focus:outline-none py-1"
                                            />
                                            <button
                                                onClick={() => {
                                                    const newQte = (vin.Qte || 0) + 1;
                                                    handleInputChange(newQte, 'Qte');
                                                }}
                                                className="text-xl font-light px-2 hover:text-blue-600 disabled:text-gray-300 dark:text-white"
                                            > + </button>
                                        </div>
                                    </div>
                                    {/* Association vin */}
                                    {associationMetsList.length > 0 && (
                                        <div className="mb-4">
                                            <label className="block text-sm font-semibold mb-1 text-gray-600 dark:text-gray-400">Association vin :</label>
                                            <div className="mt-2">
                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Suggestions de mets :</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {associationMetsList.map((mets, index) => (
                                                        <span
                                                            key={index}
                                                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                                                        >
                                                            {mets}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Remarques - Pleine largeur */}
                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                                            Remarques
                                        </label>
                                        <textarea
                                            name="Remarques"
                                            value={vin?.Remarques || ''}
                                            onChange={handleInputChange}
                                            rows={6}
                                            className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                                            placeholder="Remarques diverses"
                                        />
                                    </div>

                                    <div className="mt-4 p-4 w-full max-w-6xl flex justify-end">
                                        <button
                                            onClick={handleSave}
                                            className="px-6 py-2 bg-green-200 border border-gray-700 text-gray-800 dark:hover:text-white text-sm hover:bg-green-100 dark:hover:bg-[#2b2b2b] transition"
                                        >
                                            Sauvegarder
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* VinTabs - Show on desktop */}
            {
                !isMobile && vin && (
                    <div className="max-w-7xl mx-auto px-4 pb-8">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="p-8 border-b border-gray-200 dark:border-gray-600 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                                        <i className="pi pi-cog text-white text-xl"></i>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            Informations détaillées
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-400 text-lg mt-1">
                                            Ajoutez des notes de dégustation et d'autres détails
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <VinTabs vin={vin} isEditing={true} handleInputChange={handleInputChange} />
                        </div>
                    </div>
                )
            }

            {/* Dialog pour ajouter une cave */}
            <Dialog
                visible={showAddCaveDialog}
                onHide={() => setShowAddCaveDialog(false)}
                header="Ajouter une nouvelle cave"
                className="w-full max-w-md"
                footer={addCaveDialogFooter}
            >
                <div className="p-4">
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        Nom de la cave
                    </label>
                    <input
                        type="text"
                        value={newCaveName}
                        onChange={(e) => setNewCaveName(e.target.value)}
                        placeholder="Ma cave personnelle"
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </Dialog>
        </div >
    );
};

export default NouveauVinEtape2;