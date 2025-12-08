import React from 'react';
import { Dialog } from 'primereact/dialog';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function LoginRequiredModal({ visible, onLogin, onCancel }) {
    const navigate = useNavigate();

    return (
        <Dialog
            visible={visible}
            onHide={onCancel}
            modal
            dismissableMask
            style={{ width: '760px', maxWidth: '96vw' }}
            breakpoints={{ '960px': '95vw', '640px': '98vw' }}
            className="login-required-modal vitissia-dialog"
            contentClassName="vitissia-dialog-content"
            headerClassName="vitissia-dialog-header"
            header="" 
            appendTo={document.body}  
        >
            <motion.div
                className="
                    font-['Work_Sans',sans-serif]
                    grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden
                    rounded-b-2xl 
                    bg-gradient-to-br from-[#14070a] via-[#221013] to-[#2b1419]
                    ring-1 ring-white/10
                    shadow-[0_24px_60px_rgba(0,0,0,0.85)]
                    relative
                "
                initial={{ opacity: 0, scale: 0.94, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
            >
                {/* Glows décoratifs */}
                <div className="pointer-events-none absolute -top-32 -left-16 w-48 h-48 rounded-full bg-[#ff4b6a]/18 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-32 -right-16 w-52 h-52 rounded-full bg-[#b20e2a]/20 blur-3xl" />

                {/* Colonne gauche */}
                <div className="relative p-6 md:p-7 border-r border-white/5 md:border-r md:border-white/10">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="inline-flex items-center justify-center rounded-xl bg-white/5 px-2 py-1 ring-1 ring-white/15">
                            <img src="/vitissia_LOGO.png" alt="Vitissia" className="h-7 w-auto" />
                        </div>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-[#ffb5c3]">
                            Vitiss.IA
                        </span>
                    </div>

                    <h3 className="text-xl md:text-2xl font-bold text-white leading-snug">
                        Vitissia avec IA intégrée
                    </h3>
                    <p className="mt-2 text-sm text-gray-200/90">
                        Explorez le livre de cave, lisez toutes les fiches vins et laissez l’IA vous proposer
                        des recettes assorties. Connectez-vous pour gérer vos caves et ajouter vos bouteilles.
                    </p>

                    <ul className="mt-4 space-y-2 text-sm text-gray-100/90">
                        <li className="flex items-center gap-2">
                            <i className="pi pi-sparkles text-[#ff7a8b]" />
                            <span>Assistant IA pour guider vos choix</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <i className="pi pi-check-circle text-[#ff7a8b]" />
                            <span>Lire tous types de vins et compléter une fiche</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <i className="pi pi-check-circle text-[#ff7a8b]" />
                            <span>Générer des recettes adaptées à votre vin</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <i className="pi pi-check-circle text-[#ff7a8b]" />
                            <span>Suivre votre stock et vos favoris</span>
                        </li>
                    </ul>

                    <div className="mt-6 md:mt-8 relative">
                        <div className="rounded-xl overflow-hidden border border-white/15 bg-white/5 backdrop-blur-sm shadow-lg">
                            <img
                                src="/images/bg-verre.jpg"
                                alt="Illustration"
                                className="w-full h-40 object-cover"
                                loading="lazy"
                            />
                        </div>
                        <div className="absolute -bottom-3 -right-3 hidden md:block bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-[11px] text-gray-100 border border-white/15 shadow-md">
                            Accès complet après connexion
                        </div>
                    </div>
                </div>

                {/* Colonne droite */}
                <div className="relative p-6 md:p-7 border-l border-white/5 md:border-l md:border-white/10">
                    {/* overlay verre : PAS de radius en haut gauche */}
                    <div className="
                         pointer-events-none absolute inset-0
                        rounded-none md:rounded-br-2xl
                        bg-gradient-to-br from-white/5 via-white/0 to-black/30
                    " />

                    <div className="relative flex items-start justify-between">
                        <div>
                            <h4 className="text-lg font-semibold text-white">Connexion requise</h4>
                            <p className="mt-1 text-sm text-gray-200/90">
                                Cette section est réservée aux utilisateurs connectés.
                            </p>
                        </div>
                    </div>

                    <div className="relative mt-6 space-y-3">
                        <button
                            onClick={onLogin}
                            className="
                                w-full inline-flex items-center justify-center gap-2
                                rounded-xl
                                bg-gradient-to-r from-[#d41132] via-[#b20e2a] to-[#7f0b21]
                                hover:from-[#ff2852] hover:via-[#d41132] hover:to-[#8a0b23]
                                text-white py-2.5 font-semibold
                                shadow-md shadow-black/50
                                transition-all duration-200
                                active:scale-[0.97]
                            "
                        >
                            <i className="pi pi-sign-in" />
                            Se connecter
                        </button>

                        <button
                            onClick={onCancel}
                            className="
                                w-full inline-flex items-center justify-center gap-2
                                rounded-xl border border-white/20
                                text-gray-100 hover:bg-white/10
                                py-2.5 font-medium
                                transition-all duration-200
                            "
                        >
                            Continuer en visiteur
                        </button>

                        <div className="text-center">
                            <button
                                onClick={() => navigate('/inscription')}
                                className="
                                    text-sm
                                    text-[#ff7a8b] hover:text-[#ffc2ce]
                                    transition-colors
                                "
                            >
                                Créer un compte
                            </button>
                        </div>
                    </div>

                    <div className="relative mt-6 text-[12px] text-gray-300/85">
                        En vous connectant, vous acceptez nos conditions d’utilisation et notre politique de
                        confidentialité.
                    </div>
                </div>
            </motion.div>
        </Dialog>
    );
}
