import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  Target,
  ClipboardCheck,
  Briefcase,
  ShieldCheck,
  Info,
  CheckCircle2
} from "lucide-react";

const checklistSections = [
  {
    title: "Quand activer la cellule de crise ?",
    icon: AlertTriangle,
    accent: "text-red-500",
    items: [
      "Incident classé niveau 4 (gravité haute ou très haute).",
      "Impact majeur sur la disponibilité, l’intégrité ou la confidentialité du SI.",
      "Suspicion ou confirmation d’intrusion, ransomware ou fuite de données.",
      "L’équipe informatique estime que l’incident dépasse le traitement habituel des tickets.",
      "Le DSI, le RSSI ou un membre habilité déclenche formellement la cellule de crise."
    ]
  },
  {
    title: "Objectifs de la cellule",
    icon: Target,
    accent: "text-primary",
    items: [
      "Stabiliser rapidement la situation et protéger les patients et les données.",
      "Assurer une continuité minimale des services essentiels.",
      "Communiquer clairement, éviter la panique et les rumeurs.",
      "Documenter les décisions pour faciliter le retour d’expérience."
    ]
  },
  {
    title: "Check-list d’ouverture",
    subtitle: "Avant de démarrer la session",
    icon: ClipboardCheck,
    accent: "text-emerald-500",
    items: [
      "Vérifier que les membres clés sont présents ou représentés (Direction, DSI, RSSI, Technique, Soins, Prestataires).",
      "Rappeler le rôle de chacun en quelques mots (décision, technique, soins, communication, documentation).",
      "Confirmer le mode : CRISE réelle ou EXERCICE.",
      "Vérifier que la main courante sera tenue en continu (secrétariat / personne désignée).",
      "Rappeler que toute action sensible doit être validée (DSI / Direction)."
    ]
  },
  {
    title: "Salle & matériel à disposition",
    icon: Briefcase,
    accent: "text-amber-500",
    items: [
      "Salle de crise dédiée ou salle de réunion identifiée.",
      "PC portable dédié + accès à Crisis Manager.",
      "Téléphone / smartphone professionnel pour les appels critiques.",
      "Clés USB “Crise SI” avec fiches réflexes et procédures dégradées.",
      "Classeur papier par service (soins, rééducation, pharmacie, etc.).",
      "Imprimante locale disponible."
    ]
  },
  {
    title: "Règles de fonctionnement",
    icon: ShieldCheck,
    accent: "text-blue-500",
    items: [
      "Une personne parle à la fois, le DSI ou la Direction distribue la parole.",
      "Les décisions sont annoncées clairement et notées dans la main courante.",
      "Préserver les preuves : ne pas formater ni éteindre un poste infecté sans validation.",
      "Planifier des points d’avancement réguliers (ex : toutes les 30 minutes)."
    ]
  },
  {
    title: "Comment utiliser Crisis Manager ?",
    icon: Info,
    accent: "text-slate-500",
    items: [
      "Le Tableau de bord donne la vue d’ensemble de la session et de l’avancement des phases.",
      "L’onglet RIDA centralise les Informations, Décisions et Actions à chaque étape.",
      "L’onglet Communications historise les messages envoyés et les modèles prêts à l’emploi.",
      "L’onglet Ressources regroupe les fiches réflexes, procédures dégradées et numéros clés.",
      "Les Phases 1 à 4 guident la gestion de crise :",
      "Phase 1 : Mobiliser & Alerter",
      "Phase 2 : Maintenir la confiance",
      "Phase 3 : Relancer les services",
      "Phase 4 : Capitaliser et améliorer"
    ]
  }
];

export function IntroductionPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-wide text-primary font-semibold">
          Préparation
        </p>
        <h1 className="text-3xl font-bold mt-2">Introduction &amp; Check-list de départ</h1>
        <p className="text-muted-foreground mt-2 max-w-3xl">
          Utilisez cette page pour rappeler les conditions de déclenchement, les objectifs et la check-list
          d’ouverture avant d’entrer dans le vif de la gestion de crise.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {checklistSections.map((section) => (
          <Card key={section.title} className="border-border/60 bg-card/70 backdrop-blur">
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center ${section.accent}`}>
                  <section.icon className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-xl">{section.title}</CardTitle>
                  {section.subtitle && (
                    <p className="text-xs text-muted-foreground mt-1">{section.subtitle}</p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm leading-relaxed">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
