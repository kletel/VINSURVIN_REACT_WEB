import React from "react";

export default function FooterLinks({
    privacyUrl = "https://vitissia.fr/app_vitissia_politique-de-confidentialite/",
    eulaUrl = "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/",
    className = "",
}) {
    return (
        <footer
            className={[
                "w-full bg-[#3B0B15] font-['Work_Sans',sans-serif] text-white",
                className,
            ].join(" ")}
        >
            <div className="mx-auto max-w-6xl px-4 py-4 md:py-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-white/70">
                        © {new Date().getFullYear()} Vitissia
                    </p>

                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                        <a
                            href={privacyUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-white/90 hover:text-white underline underline-offset-4"
                        >
                            Politique de confidentialité
                        </a>
                        <a
                            href={eulaUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-white/90 hover:text-white underline underline-offset-4"
                        >
                            Conditions d’utilisation (EULA)
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
