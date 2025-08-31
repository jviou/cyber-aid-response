import { Phase, JournalEvent, ActionItem, Communication } from "@/types/crisis";

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

// Seed data for real mode
export const seedJournalEvents: JournalEvent[] = [
  {
    id: "journal-seed-1",
    category: "detection",
    title: "Incident détecté",
    details: "Signalement initial (SOC/helpdesk)",
    by: "Système",
    at: new Date(Date.now() - 60000 * 30).toISOString() // 30 min ago
  },
  {
    id: "journal-seed-2", 
    category: "communication",
    title: "Alerte cellule de crise",
    details: "Activation de la cellule, convocation des membres",
    by: "Incident Manager",
    at: new Date(Date.now() - 60000 * 25).toISOString() // 25 min ago
  },
  {
    id: "journal-seed-3",
    category: "action", 
    title: "Isolation machine impactée",
    details: "VLAN quarantaine appliqué",
    by: "IT Ops",
    at: new Date(Date.now() - 60000 * 20).toISOString() // 20 min ago
  },
  {
    id: "journal-seed-4",
    category: "decision",
    title: "Geler les transferts",
    details: "Blocage des flux sortants non essentiels 24h",
    by: "Direction",
    at: new Date(Date.now() - 60000 * 15).toISOString() // 15 min ago
  },
  {
    id: "journal-seed-5",
    category: "legal",
    title: "Pré-analyse RGPD", 
    details: "Données perso potentiellement impactées : à confirmer sous 24-48h",
    by: "DPO",
    at: new Date(Date.now() - 60000 * 10).toISOString() // 10 min ago
  },
  {
    id: "journal-seed-6",
    category: "communication",
    title: "Message interne",
    details: "Premier flash info aux collaborateurs", 
    by: "Com Interne",
    at: new Date(Date.now() - 60000 * 5).toISOString() // 5 min ago
  }
];

export const seedActions: ActionItem[] = [
  {
    id: "action-seed-1",
    title: "Isolation des systèmes compromis",
    description: "Isoler physiquement et logiquement les machines infectées",
    owner: "IT Ops",
    priority: "high",
    status: "doing",
    dueAt: new Date(Date.now() + 60000 * 60).toISOString(), // 1h from now
    createdAt: new Date(Date.now() - 60000 * 20).toISOString()
  },
  {
    id: "action-seed-2", 
    title: "Collecte des logs système",
    description: "Récupération des logs pour analyse forensique",
    owner: "RSSI",
    priority: "high",
    status: "todo",
    dueAt: new Date(Date.now() + 60000 * 30).toISOString(), // 30min from now
    createdAt: new Date(Date.now() - 60000 * 15).toISOString()
  },
  {
    id: "action-seed-3",
    title: "Préparation premier SITREP", 
    description: "Rédaction du rapport de situation initial",
    owner: "Incident Manager",
    priority: "medium",
    status: "todo", 
    dueAt: new Date(Date.now() + 60000 * 90).toISOString(), // 1h30 from now
    createdAt: new Date(Date.now() - 60000 * 10).toISOString()
  }
];

// Communication templates
export const communicationTemplates: Record<string, { title: string; audience: string; message: string }> = {
  "interne-flash": {
    title: "Flash info - Incident cybersécurité",
    audience: "Interne", 
    message: `Chers collègues,

Nous vous informons qu'un incident de cybersécurité a été détecté sur nos systèmes informatiques.

**Statut actuel :** [À compléter]
**Actions en cours :** [À compléter] 
**Mesures de précaution :** [À compléter]

La cellule de crise est mobilisée et travaille à la résolution de l'incident.

Cordialement,
L'équipe de gestion de crise`
  },
  "interne-update": {
    title: "Mise à jour - Point de situation",
    audience: "Interne",
    message: `Chers collègues,

Point de situation sur l'incident de cybersécurité en cours :

**Évolution :** [DÉTAIL]
**Systèmes impactés :** [SYSTÈMES] 
**Impact business :** [IMPACT]
**Actions entreprises :** [ACTIONS]

Nous vous tiendrons informés de l'évolution de la situation.

L'équipe de gestion de crise`
  },
  "direction": {
    title: "Point de situation - Direction",
    audience: "Direction",
    message: `Mesdames, Messieurs les Directeurs,

Suite à la détection d'un incident de cybersécurité, voici le point de situation :

**Nature de l'incident :** [DÉTAIL]
**Impact :** [IMPACT] 
**Actions entreprises :** [ACTIONS]
**Estimation de résolution :** [À évaluer]

Nous restons à votre disposition pour tout complément d'information.

L'équipe de gestion de crise`
  },
  "dpo": {
    title: "Notification DPO - Incident sécurité", 
    audience: "DPO",
    message: `Bonjour,

Nous vous notifions un incident de sécurité susceptible d'impacter des données personnelles.

**Description :** [DÉTAIL]
**Données concernées :** [À analyser]
**Mesures prises :** [ACTIONS]

Merci de nous indiquer les actions à entreprendre au niveau RGPD.

Cordialement,
L'équipe de gestion de crise`
  },
  "anssi": {
    title: "Déclaration incident ANSSI",
    audience: "ANSSI", 
    message: `Messieurs,

Conformément à l'article R2321-3, nous vous déclarons l'incident suivant :

**Type d'incident :** [DÉTAIL]
**Horodatage :** [À préciser]
**Systèmes impactés :** [SYSTÈMES]
**Mesures prises :** [ACTIONS]

Nous restons à votre disposition pour tout complément.

L'équipe de gestion de crise`
  },
  "cnil": {
    title: "Pré-notification CNIL",
    audience: "CNIL",
    message: `Messieurs-Dames,

Nous vous informons d'un incident de sécurité susceptible de constituer une violation de données personnelles :

**Nature de l'incident :** [DÉTAIL]
**Données potentiellement concernées :** [À analyser] 
**Nombre approximatif de personnes :** [À évaluer]
**Mesures prises :** [ACTIONS]

Analyse en cours, notification formelle à suivre si confirmé.

L'équipe de gestion de crise`
  },
  "partenaires": {
    title: "Communication partenaires",
    audience: "Partenaires",
    message: `Chers partenaires,

Nous vous informons d'un incident de cybersécurité pouvant impacter nos services communs :

**Services concernés :** [SYSTÈMES]
**Impact estimé :** [IMPACT] 
**Actions en cours :** [ACTIONS]
**Estimation de résolution :** [À évaluer]

Nous vous tiendrons informés de l'évolution.

Cordialement,
L'équipe de gestion de crise`
  }
};

// Default key contacts
export const defaultKeyContacts = [
  { name: "Jean Dupont", role: "RSSI", contact: "+33 6 12 34 56 78" },
  { name: "Marie Martin", role: "IT Ops", contact: "+33 6 23 45 67 89" },
  { name: "Pierre Durand", role: "DPO", contact: "+33 6 34 56 78 90" },
  { name: "Sophie Leblanc", role: "Direction", contact: "+33 6 45 67 89 01" }
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