import { Phase } from "@/types/crisis";

// Pre-filled crisis phases based on PowerPoint content
export const defaultPhases: Phase[] = [
  {
    id: "P1",
    title: "PHASE 1",
    subtitle: "Alerter et endiguer - Mobiliser",
    notes: "",
    checklist: {
      strategic: [
        {
          id: "p1s1",
          text: "Mobiliser la cellule de crise",
          status: "todo"
        },
        {
          id: "p1s2",
          text: "Prise en compte de la fiche réflexe et 1ère action effectuée",
          status: "todo"
        },
        {
          id: "p1s3",
          text: "État des lieux",
          status: "todo"
        },
        {
          id: "p1s4",
          text: "Suivi des actions",
          status: "todo"
        }
      ],
      operational: [
        {
          id: "p1o1",
          text: "Prévenir prestataires sécurité",
          status: "todo"
        },
        {
          id: "p1o2",
          text: "Fiche réflexe CYBER",
          status: "todo"
        },
        {
          id: "p1o3",
          text: "Suivi des actions",
          status: "todo"
        }
      ]
    },
    injects: []
  },
  {
    id: "P2",
    title: "PHASE 2",
    subtitle: "Comprendre l'attaque - Maintenir la confiance",
    notes: "",
    checklist: {
      strategic: [
        {
          id: "p2s1",
          text: "Communication externe",
          status: "todo"
        },
        {
          id: "p2s2",
          text: "Arbitrage applicatifs métiers",
          status: "todo"
        },
        {
          id: "p2s3",
          text: "Mise en place du mode dégradé",
          status: "todo"
        }
      ],
      operational: [
        {
          id: "p2o1",
          text: "Identification de l'attaque",
          status: "todo"
        },
        {
          id: "p2o2",
          text: "Vérification des sauvegardes saines",
          status: "todo"
        },
        {
          id: "p2o3",
          text: "Solutions de contournement pour applications critiques",
          status: "todo"
        }
      ]
    },
    injects: []
  },
  {
    id: "P3",
    title: "PHASE 3",
    subtitle: "Durcir et surveiller - Relancer les activités",
    notes: "",
    checklist: {
      strategic: [
        {
          id: "p3s1",
          text: "Déclenchement du PRA",
          status: "todo"
        },
        {
          id: "p3s2",
          text: "Prioriser les applications et services critiques à relancer",
          status: "todo"
        },
        {
          id: "p3s3",
          text: "Validation de sortie de crise",
          status: "todo"
        }
      ],
      operational: [
        {
          id: "p3o1",
          text: "Activation du PRI",
          status: "todo"
        },
        {
          id: "p3o2",
          text: "Reconstruction de l'infra",
          status: "todo"
        },
        {
          id: "p3o3",
          text: "Évaluation des « dégâts »",
          status: "todo"
        },
        {
          id: "p3o4",
          text: "Test pour validation sortie de crise",
          status: "todo"
        }
      ]
    },
    injects: []
  },
  {
    id: "P4",
    title: "PHASE 4",
    subtitle: "Capitaliser - Tirer les leçons de la crise",
    notes: "",
    checklist: {
      strategic: [
        {
          id: "p4s1",
          text: "Communiquer sur la sortie de crise",
          status: "todo"
        },
        {
          id: "p4s2",
          text: "Plan d'action sur les tâches à mener",
          status: "todo"
        },
        {
          id: "p4s3",
          text: "Retour d'expérience",
          status: "todo"
        },
        {
          id: "p4s4",
          text: "Formation et sensibilisation utilisateur",
          status: "todo"
        }
      ],
      operational: []
    },
    injects: []
  }
];

// Communication templates
export const communicationTemplates = {
  "Interne": {
    subject: "Information incident cybersécurité - [NIVEAU]",
    template: `Chers collègues,

Nous vous informons qu'un incident de cybersécurité a été détecté sur nos systèmes informatiques.

**Statut actuel :** [À compléter]
**Actions en cours :** [À compléter]
**Mesures de précaution :** [À compléter]

La cellule de crise est mobilisée et travaille à la résolution de l'incident.

Cordialement,
L'équipe de gestion de crise`
  },
  "Direction": {
    subject: "Incident cybersécurité - Point de situation",
    template: `Mesdames, Messieurs les Directeurs,

Suite à la détection d'un incident de cybersécurité, voici le point de situation :

**Nature de l'incident :** [À compléter]
**Impact :** [À compléter]
**Actions entreprises :** [À compléter]
**Estimation de résolution :** [À compléter]

Nous restons à votre disposition pour tout complément d'information.`
  },
  "DPO": {
    subject: "Incident sécurité - Notification DPO",
    template: `Bonjour,

Nous vous notifions un incident de sécurité susceptible d'impacter des données personnelles.

**Description :** [À compléter]
**Données concernées :** [À compléter]
**Mesures prises :** [À compléter]

Merci de nous indiquer les actions à entreprendre au niveau RGPD.`
  },
  "ANSSI": {
    subject: "Déclaration incident - Article R2321-3",
    template: `Messieurs,

Conformément à l'article R2321-3, nous vous déclarons l'incident suivant :

**Type d'incident :** [À compléter]
**Horodatage :** [À compléter]
**Systèmes impactés :** [À compléter]
**Mesures prises :** [À compléter]

Nous restons à votre disposition pour tout complément.`
  }
};

// Default key contacts
export const defaultKeyContacts = [
  { name: "RSSI", role: "Responsable Sécurité", contact: "+33 X XX XX XX XX" },
  { name: "DSI", role: "Directeur Informatique", contact: "+33 X XX XX XX XX" },
  { name: "DPO", role: "Délégué Protection Données", contact: "+33 X XX XX XX XX" },
  { name: "Juridique", role: "Direction Juridique", contact: "+33 X XX XX XX XX" },
  { name: "Communication", role: "Direction Communication", contact: "+33 X XX XX XX XX" }
];

// Exercise objectives and rules
export const exerciseDefaults = {
  objectives: [
    "Tester les procédures de gestion de crise cyber",
    "Évaluer la coordination entre les équipes",
    "Valider les circuits de communication",
    "Identifier les axes d'amélioration"
  ],
  rules: [
    "Simulation - aucun système réel n'est affecté",
    "Respecter les horaires de l'exercice",
    "Documenter toutes les actions",
    "Participer activement aux débriefs"
  ]
};