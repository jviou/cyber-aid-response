![CI](https://github.com/jviou/cyber-aid-response/actions/workflows/ci.yml/badge.svg?branch=master)

# Crisis Manager

Application de gestion de crise cybersécurité **full déployable**, pensée pour des environnements sensibles.

Architecture **monolithique autonome** :
- Frontend (React)
- Backend (Node.js)
- Persistance locale (JSON)

Aucune dépendance cloud ou service externe au runtime.

---

## ✅ Recommandé : utiliser une *Release* GitHub

Pour un déploiement simple (sans Git) et des versions propres, utilisez les **Releases** :
- vous téléchargez un ZIP “officiel” (ex: `cyber-aid-response-v1.0.0.zip`)
- vous avez un numéro de version clair
- les mises à jour sont plus faciles à suivre

➡️ Sur le dépôt GitHub : onglet **Releases** → téléchargez **Source code (zip)** de la dernière version.

---

## 📋 Pré-requis

- **Docker** et **Docker Compose** installés sur la machine
  - Windows / macOS : Docker Desktop (https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe?utm_source=docker&utm_medium=webreferral&utm_campaign=dd-smartbutton&utm_location=module)
  - Linux : Docker Engine + Docker Compose plugin

> Astuce : `docker compose version` permet de vérifier que Compose est disponible.

---

## 🚀 Installation & Démarrage

Vous avez 2 méthodes : **(A) ZIP (recommandée si vous n’utilisez pas Git)** ou **(B) Git (pour équipes IT)**.

### A) Méthode simple : Télécharger le ZIP (Release ou Code)

**Option 1 (recommandée) : via une Release**
1. Aller dans **Releases**
2. Télécharger **Source code (zip)** de la dernière release
3. Extraire le ZIP

**Option 2 : via “Code → Download ZIP”**
- Possible aussi, mais vous récupérez l’état actuel (pas forcément une version “stable” taguée).

Ensuite :

1. Ouvrir un terminal **dans le dossier extrait**
   - Windows : clic droit dans le dossier → “Ouvrir dans le Terminal” / PowerShell
   - macOS/Linux : ouvrir un Terminal et `cd` dans le dossier
2. Démarrer l’application :
   ```bash
   docker compose up -d --build
   ```
3. Accéder à l’application :
   - http://localhost:8080

---

### B) Méthode IT : Cloner avec Git

1. Cloner le projet
   ```bash
   git clone https://github.com/jviou/cyber-aid-response.git
   cd cyber-aid-response
   ```

2. Démarrer l'application
   ```bash
   docker compose up -d --build
   ```

3. Accéder à l'application
   - http://localhost:8080

---

## 💾 Données & Persistance

Toutes les données sont stockées localement dans `./data` monté dans le conteneur.

- **Chemin hôte** : `cyber-aid-response/data/`
- **Chemin conteneur** : `/data`
- **Fichier principal** : `session-v2.json`

### Sauvegarde
1. Arrêter le conteneur
2. Copier le dossier `data/`

### Restauration
1. Remplacer le dossier `data/` par une sauvegarde existante
2. Relancer le conteneur

---

## 🔄 Mise à jour

### Si vous utilisez Git (méthode B)
```bash
git pull
docker compose up -d --build
```

### Si vous utilisez le ZIP (méthode A)
1. **Sauvegarder** `data/` (important)
2. Télécharger la nouvelle **Release** (Source code zip)
3. Extraire et remplacer les fichiers de l’application
4. Remettre votre dossier `data/` dans le nouveau dossier
5. Relancer :
   ```bash
   docker compose up -d --build
   ```

---

## 🛠 Configuration (optionnelle)

L'application peut être configurée via un fichier `.env` (voir `.env.example`).

Variables principales :
- `PORT` : Port d'écoute interne (défaut : 8080)
- `NODE_ENV` : `production` par défaut

> Si le port est modifié, adapter également la section `ports` du `docker-compose.yml`.

---

## 📴 Mode Offline / Air-Gap

Compatible **hors-ligne (air-gap)**.

### Conditions
- Docker et Docker Compose installés en amont

### Procédure
1. Télécharger une **Release (ZIP)** ou cloner le dépôt sur une machine connectée
2. Copier le dossier complet sur la machine cible (clé USB / réseau interne)
3. Lancer :
   ```bash
   docker compose up -d --build
   ```

Aucune connexion Internet n'est requise au runtime.

---

## 📦 Versioning

- Les versions stables sont publiées dans **Releases**
- Exemple : `v1.0.0`

---

*Projet conçu pour des contextes de gestion de crise, exercices cyber et environnements sensibles.*
