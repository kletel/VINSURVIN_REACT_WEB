import { useState, useCallback } from 'react';
import config from '../config/config';
import authHeader from '../config/authHeader';

const useFetchVocabulaires = () => {
    const [vocabulaires, setVocabulaires] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchVocabulaires = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            console.log('DEBUG: Début de fetchVocabulaires()');
            const apiUrl = `${config.apiBaseUrl}/4DACTION/react_getVocabulaires`;
            console.log('DEBUG: URL utilisée:', apiUrl);

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: authHeader(),
            });

            console.log('DEBUG: Code de statut HTTP:', response.status);

            if (response.status === 401) {
                console.log('DEBUG: Erreur 401 - Non autorisé');
                throw new Error('Non autorisé');
            }

            if (!response.ok) {
                console.log('DEBUG: Code de statut non-200:', response.status);
                throw new Error('Erreur lors de la récupération des vocabulaires');
            }

            const data = await response.json();
            setVocabulaires(data);
        } catch (err) {
            console.error('DEBUG: Erreur générale:', err.message);
            setError(err.message);

            // Fallback avec données mockées pour les tests
            console.log('DEBUG: Chargement des données mockées');
            setVocabulaires(getMockVocabulaires());
        } finally {
            setLoading(false);
        }
    }, []);

    const getMockVocabulaires = () => {
        return [
            { Nom_Fr: "Acidité", Texte: "Sensation gustative procurée par les acides naturels du vin. Une acidité équilibrée apporte de la fraîcheur et de la vivacité au vin.", UUID_: "VOCAB1" },
            { Nom_Fr: "Tannins", Texte: "Composés phénoliques présents principalement dans les vins rouges, provenant de la peau et des pépins du raisin. Ils donnent une sensation d'astringence en bouche.", UUID_: "VOCAB2" },
            { Nom_Fr: "Millésime", Texte: "Année de récolte du raisin. Le millésime influence grandement le caractère d'un vin selon les conditions climatiques de l'année.", UUID_: "VOCAB3" },
            { Nom_Fr: "Assemblage", Texte: "Technique consistant à mélanger différents vins (cépages, terroirs, millésimes) pour créer un vin final équilibré et complexe.", UUID_: "VOCAB4" },
            { Nom_Fr: "Terroir", Texte: "Ensemble des facteurs naturels (sol, climat, exposition) qui influencent le caractère d'un vin et lui donnent sa spécificité.", UUID_: "VOCAB5" },
            { Nom_Fr: "Dégustation", Texte: "Art d'analyser un vin par l'examen visuel, olfactif et gustatif pour en apprécier les qualités et défauts.", UUID_: "VOCAB6" },
            { Nom_Fr: "Cépage", Texte: "Variété de vigne cultivée. Chaque cépage apporte ses caractéristiques propres au vin (arômes, couleur, structure).", UUID_: "VOCAB7" },
            { Nom_Fr: "Robe", Texte: "Aspect visuel du vin, sa couleur et sa brillance. La robe peut donner des indications sur l'âge et la qualité du vin.", UUID_: "VOCAB8" },
            { Nom_Fr: "Nez", Texte: "Ensemble des arômes perçus à l'olfaction. On distingue le premier nez (avant agitation) et le second nez (après agitation du verre).", UUID_: "VOCAB9" },
            { Nom_Fr: "Corps", Texte: "Sensation de densité et de volume du vin en bouche. Un vin peut être léger, médium ou corsé selon sa structure.", UUID_: "VOCAB10" },
            { Nom_Fr: "Finale", Texte: "Persistance des saveurs en bouche après avoir avalé ou recraché le vin. Une longue finale est généralement signe de qualité.", UUID_: "VOCAB11" },
            { Nom_Fr: "Élevage", Texte: "Période de maturation du vin en cuve ou en fût après la fermentation, permettant son développement aromatique et structural.", UUID_: "VOCAB12" },
            { Nom_Fr: "Vendanges", Texte: "Période de récolte du raisin, moment crucial qui détermine la qualité du futur vin. Peut être manuelle ou mécanique.", UUID_: "VOCAB13" },
            { Nom_Fr: "Macération", Texte: "Processus d'extraction des couleurs, arômes et tannins par contact prolongé du jus avec les parties solides du raisin.", UUID_: "VOCAB14" },
            { Nom_Fr: "Appellation", Texte: "Dénomination géographique protégée garantissant l'origine et le respect d'un cahier des charges précis pour la production du vin.", UUID_: "VOCAB15" }
        ];
    };

    return {
        vocabulaires,
        loading,
        error,
        fetchVocabulaires
    };
};

export default useFetchVocabulaires;
