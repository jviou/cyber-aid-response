export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
}

export interface GlossaryCategory {
  id: string;
  title: string;
  terms: GlossaryTerm[];
}

export const glossaryData: GlossaryCategory[] = [
  {
    id: "vocabulary",
    title: "Vocabulaire de l'exercice",
    terms: [
      {
        id: "1.1",
        term: "L'exercice de crise cybersécurité",
        definition: "Consiste à simuler un scénario, c'est-à-dire un enchaînement d'événements fictifs proposant une mise en situation de crise réaliste mais non réelle. Il se déroule sur une durée limitée, dans un contexte imaginé pour l'occasion et repose sur l'organisation de gestion d'une crise en place au moment où il est joué. Pour favoriser l'adhésion et l'implication des joueurs, les événements fictifs simulés doivent s'inspirer d'événements plausibles."
      },
      {
        id: "1.2",
        term: "La cellule de crise",
        definition: "Signifie une organisation centrale et concentrée à partir de laquelle est organisée une gestion de crise pour faire face à une situation critique de toute nature."
      },
      {
        id: "1.3",
        term: "L'animateur",
        definition: "Anime l'exercice, en interagissant avec les joueurs par la simulation d'actions visant à entraîner et tester leurs réactions en situation de crise. Un animateur peut jouer plusieurs rôles différents."
      },
      {
        id: "1.4",
        term: "L'observateur",
        definition: "Chargé d'observer le fonctionnement de l'exercice et de prendre note des points positifs et des axes d'amélioration. Il n'intervient pas dans le déroulement de l'exercice. Idéalement formé (même brièvement) à la gestion de crise cyber en amont de l'exercice, il possède une bonne connaissance du fonctionnement de l'organisation."
      },
      {
        id: "1.5",
        term: "Le joueur",
        definition: "Participe à l'exercice en réagissant aux différents événements simulés. Il est issu des différents métiers de l'organisation qui seraient impliqués dans le dispositif de gestion de crise s'il s'agissait d'une situation réelle."
      },
      {
        id: "1.6",
        term: "Le scénario",
        definition: "Raconte l'histoire de l'exercice de manière littéraire, constitue une description de l'ensemble de la situation de crise qui touche l'organisation."
      },
      {
        id: "1.7",
        term: "Le chronogramme",
        definition: "Prend la forme d'un tableau qui, ligne par ligne, décrit tout le déroulement chronologique de l'exercice du début à la fin. Il précise également les modalités de transmission des « stimuli » (mail, appel téléphonique, SMS, etc.) et les réactions attendues des joueurs afin de définir et de cadrer les actions directement jouées par les joueurs et celles simulées par l'équipe d'animation."
      },
      {
        id: "1.8",
        term: "Le stimulus (au pluriel stimuli)",
        definition: "Information envoyée par la cellule d'animation et reçue par les joueurs. Un stimulus est une pièce du scénario utilisée pour orienter les actions des joueurs. Il prend principalement la forme d'un mail ou d'un appel téléphonique. L'ensemble des stimuli forme le chronogramme."
      },
      {
        id: "1.9",
        term: "Le point de situation",
        definition: "Prend généralement la forme d'une synthèse écrite visant à informer les parties prenantes et les décideurs sur l'état de compréhension d'un incident, de ses impacts et de l'avancée des opérations de remédiation."
      },
      {
        id: "1.10",
        term: "Le retour d'expérience (RETEX)",
        definition: "Temps collectif (tour de table) et/ou individuel (entretien) au cours duquel l'ensemble des participants s'exprime sur son expérience durant l'exercice."
      }
    ]
  },
  {
    id: "cybersecurity-basics",
    title: "Le bé a ba de la cybersécurité",
    terms: [
      {
        id: "2.1",
        term: "Le système d'information (SI)",
        definition: "Est un élément central d'une entreprise ou d'une organisation. Il permet aux différents acteurs de véhiculer des informations et de communiquer grâce à un ensemble de ressources matérielles, humaines et logicielles. Un SI permet de créer, collecter, stocker, traiter, modifier des informations sous divers formats."
      },
      {
        id: "2.2",
        term: "L'administrateur",
        definition: "Administre et assure le fonctionnement et l'exploitation d'un ou plusieurs éléments matériels ou logiciels (outils, réseaux, bases de données, messagerie, ...) de l'entreprise ou d'une organisation. Veille à la cohérence, à l'accessibilité et à la sécurité des informations."
      },
      {
        id: "2.3",
        term: "Les droits d'administration",
        definition: "Correspondent aux informations auxquelles l'administrateur peut accéder (droit d'accès à une ressource) et les tâches qu'il peut effectuer."
      },
      {
        id: "2.4",
        term: "Le PCA (Plan de Continuité d'Activité)",
        definition: "A pour objet de décliner la stratégie et l'ensemble des dispositions qui sont prévues pour garantir à une organisation la reprise et la continuité de ses activités à la suite d'un sinistre ou d'un événement perturbant gravement son fonctionnement normal. Il doit permettre à l'organisation de répondre à ses obligations externes (législatives ou réglementaires, contractuelles) ou internes (risque de perte de marché, survie de l'entreprise, image...) et de tenir ses objectifs."
      },
      {
        id: "2.5",
        term: "Le PRA (Plan de Reprise d'Activité)",
        definition: "Constitue l'ensemble des procédures documentées d'une organisation lui permettant de rétablir et de reprendre ses activités en s'appuyant sur des mesures temporaires adoptées pour répondre aux exigences métier habituelles après un incident."
      },
      {
        id: "2.6",
        term: "Le poste de travail",
        definition: "Est le terminal (ordinateur, tablette, etc.) d'accès au système d'information de l'organisation. Il permet à un utilisateur d'accéder aux ressources d'une organisation (applications, périphériques, réseaux) pour accomplir les tâches qui lui incombe."
      },
      {
        id: "2.7",
        term: "Le serveur",
        definition: "Désigne le rôle joué par un appareil matériel destiné à offrir des services à des clients en réseau Internet ou intranet."
      },
      {
        id: "2.8",
        term: "Le serveur de fichiers",
        definition: "Est un serveur utilisé pour le stockage et la gestion des fichiers et des dossiers utilisateurs qui sont généralement partagés dans des bases de données."
      },
      {
        id: "2.9",
        term: "Le chiffrement",
        definition: "Désigne la conversion des données depuis un format lisible dans un format codé. Les données chiffrées ne peuvent être lues ou traitées qu'après leur déchiffrement."
      },
      {
        id: "2.10",
        term: "EDR (Endpoint Detection and Response)",
        definition: "Désigne un logiciel permettant de détecter les menaces présentes sur un poste de travail ou sur un serveur. Plus évolué qu'un antivirus, l'EDR s'appuie sur des algorithmes d'intelligence artificielle lui donnant la faculté d'être auto apprenant et ainsi d'évoluer. L'EDR est un outil qui se place sur les terminaux et non au niveau réseau d'un SI. Il fait de l'analyse comportementale, et monitore les actions d'un terminal. Un EDR est caractérisé par ses capacités de détection, d'investigation et enfin de remédiation."
      },
      {
        id: "2.11",
        term: "Endiguement",
        definition: "Freiner l'attaquant au sein du système d'information, en introduisant de la friction dans son activité afin de donner du temps et de la visibilité aux défenseurs."
      },
      {
        id: "2.12",
        term: "Éviction",
        definition: "Éliminer durablement l'adversaire du cœur de confiance, depuis lequel le reste du système d'information est géré."
      },
      {
        id: "2.13",
        term: "Eradication",
        definition: "Nettoyer le système d'information de toute emprise, même mineure, de l'attaquant."
      },
      {
        id: "2.14",
        term: "Cloud",
        definition: "Le terme désigne les serveurs accessibles sur Internet, ainsi que les logiciels et bases de données qui fonctionnent sur ces serveurs."
      },
      {
        id: "2.15",
        term: "Serveur de messagerie",
        definition: "Un système chargé d'envoyer des courriels d'un client de messagerie à un autre."
      },
      {
        id: "2.16",
        term: "Serveur de téléphonie",
        definition: "Un système informatique qui gère les communications vocales sur un réseau."
      },
      {
        id: "2.17",
        term: "GTB",
        definition: "Les gestion technique de bâtiment (GTB) désigne des équipements techniques de chauffage, ventilation, éclairage, etc."
      }
    ]
  },
  {
    id: "cyber-threats",
    title: "Les menaces cybersécurité",
    terms: [
      {
        id: "3.1",
        term: "La menace cybersécurité",
        definition: "Est la cause potentielle d'un incident, qui pourrait entraîner des dommages sur un bien si cette menace se concrétisait. Les menaces de cybersécurité peuvent prendre plusieurs formes telle que le maliciel, le rançongiciel, l'ingénierie sociale ou le hameçonnage."
      },
      {
        id: "3.2",
        term: "Le rançongiciel (ou ransomware)",
        definition: "Contraction des mots « rançon » et « logiciel », un rançongiciel est par définition un programme malveillant dont le but est d'obtenir de la victime le paiement d'une rançon. Pour y parvenir, le rançongiciel empêche l'utilisateur d'accéder à ses données en les chiffrant, puis lui indique les instructions utiles au paiement de la rançon en échange de la restitution de ses données."
      },
      {
        id: "3.3",
        term: "Le maliciel (ou malware)",
        definition: "Est un type de logiciel malveillant dans lequel n'importe quel fichier ou programme peut être utilisé pour porter préjudice à l'utilisateur d'un ordinateur, que ce soit par un vers, un virus, un cheval de Troie ou un logiciel espion."
      },
      {
        id: "3.4",
        term: "L'ingénierie sociale",
        definition: "Est une méthode qui repose sur l'interaction humaine pour tromper l'utilisateur et contourner les procédures de sécurité afin d'accéder à des informations sensibles, généralement protégées."
      },
      {
        id: "3.5",
        term: "Le hameçonnage (ou phishing)",
        definition: "Est un technique de fraude sur Internet qui consiste à envoyer un message destiné à amener une personne à se connecter sur un site dans le but d'obtenir des renseignements confidentiels (mot de passe, informations bancaires...) afin d'usurper l'identité de la victime."
      }
    ]
  },
  {
    id: "cyber-actors",
    title: "Les acteurs de l'environnement cybersécurité",
    terms: [
      {
        id: "4.1",
        term: "Le RSSI (Responsable de la Sécurité des Systèmes d'Information)",
        definition: "Définit et développe la politique de sécurité de l'information de son entreprise. Il est garant de sa mise en œuvre et en assure le suivi. Il protège l'entreprise des risques potentiels liés aux cyberattaques. Il assure aussi des projets comme les politiques de sécurité internes au niveau des employés (changement de mot de passe tous les 6 mois etc.) par exemple. Le responsable de la sécurité des systèmes d'information doit également informer le personnel sur les questions et les normes de sécurité par la mise en œuvre d'outils (chartes numériques, guidelines de sécurité) ou d'activités de communication, etc."
      },
      {
        id: "4.2",
        term: "La CNIL (Commission Nationale de l'Informatique et des Libertés)",
        definition: "Est chargée de veiller à la protection des données personnelles contenues dans les fichiers et traitements informatiques ou papiers, aussi bien publics que privés. Ainsi, elle est chargée de veiller à ce que l'informatique soit au service du citoyen et qu'elle ne porte atteinte ni à l'identité humaine, ni aux droits de l'homme, ni à la vie privée, ni aux libertés individuelles ou publiques."
      },
      {
        id: "4.3",
        term: "Le CERT Santé",
        definition: "Accompagne et suit l'ensemble des établissements de santé et structures médico-sociales dans le traitement des incidents de sécurité. Il réalise également de la veille et de la sensibilisation sur la menace cybersécurité. Le CERT Santé réalise de la veille et de l'exposition sur Internet des systèmes d'information des structures de santé afin de les aider à réduire le risque d'attaque cyber. Le CERT Santé mène enfin des actions de prévention ciblées sur des menaces spécifiques et propose des services visant à améliorer la sécurité du système d'information (messagerie en particulier)."
      },
      {
        id: "4.4",
        term: "L'ANSSI (Agence nationale en matière de Sécurité et de défense des Systèmes d'Information)",
        definition: "A une mission de défense des systèmes d'information de l'État français en proposant des règles à appliquer pour la protection des systèmes d'information et en vérifiant l'application des mesures adoptées. L'ANSSI est aussi chargée d'une mission de conseil et de soutien aux administrations et aux opérateurs d'importance vitale."
      }
    ]
  }
];