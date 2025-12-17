export const PHASE_CONTENT: Record<string, { title: string; description: string; objectives: string[] }> = {
    P1: {
        title: "ALERTER, MOBILISER ET ENDIGUER",
        description: "La détection d’un incident cyber majeur rend nécessaire de mettre en place des mesures initiales de préservation, mais implique surtout de mobiliser la structure de gestion de crise de l’organisation pouvant rassembler à la fois une cellule stratégique et plusieurs cellules opérationnelles (RH, logistique, communication etc.).",
        objectives: [
            "Mobiliser et adapter le dispositif de crise aux enjeux et au rythme de la crise cyber",
            "Mettre en place les premières mesures d’endiguement et de continuité d’activité",
            "Alerter les réseaux de soutien"
        ]
    },
    P2: {
        title: "MAINTENIR LA CONFIANCE ET COMPRENDRE L'ATTAQUE",
        description: "Une fois le dispositif de crise activé et les équipes mobilisées, il s’agit de limiter au maximum les impacts immédiats du dysfonctionnement des SI sur l’activité de l’organisation. Pour y parvenir, les équipes de gestion de crise aspirent donc à :",
        objectives: [
            "Communiquer sur la situation pour rassurer les partenaires de confiance",
            "Comprendre le déroulé de l’attaque pour définir le périmètre de compromission cyber et métier"
        ]
    },
    P3: {
        title: "RELANCER LES ACTIVITÉS MÉTIERS ET DURCIR LES SYSTÈMES D’INFORMATION",
        description: "Les périmètres de compromission identifiés et les parties prenantes informées, les équipes de gestion de crise doivent agir pour revenir à une situation normale. Pour y parvenir, elles doivent réussir à :",
        objectives: [
            "Mettre en œuvre des actions de sécurisation et de durcissement pour permettre la reprise d’activité",
            "Adapter l’activité de l’organisation aux contraintes persistantes"
        ]
    },
    P4: {
        title: "TIRER LES LEÇONS DE LA CRISE ET CAPITALISER",
        description: "Les actions de remédiation et de reprise d’activité laissant entrevoir un retour à plus de stabilité, les équipes de gestion de crise doivent enfin envisager une sortie de crise. Pour atteindre ce dernier objectif, il est important qu’elles réussissent à :",
        objectives: [
            "Définir et organiser leur plan de sortie de crise",
            "Tirer parti de l’expérience de crise pour progresser"
        ]
    }
};
