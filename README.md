![CI](https://github.com/jviou/cyber-aid-response/actions/workflows/ci.yml/badge.svg?branch=master)

# Crisis Manager

Application de gestion de crise cybersécurité **full déployable**, pensée pour des environnements sensibles.

Architecture **monolithique autonome** :
- Frontend (React)
- Backend (Node.js)
- Persistance locale (JSON)

Aucune dépendance cloud ou service externe au runtime.

---

## 📋 Pré-requis

- **Docker** et **Docker Compose** installés sur la machine
  - Windows / macOS : Docker Desktop
  - Linux : Docker Engine + Docker Compose plugin

> Astuce : la commande `docker compose version` permet de vérifier que Compose est bien disponible.

---

## 🚀 Installation & Démarrage

Vous avez 2 méthodes : **(A) ZIP (recommandée si vous n’utilisez pas Git)** ou **(B) Git (pour équipes IT)**.

### A) Méthode simple : Télécharger le ZIP (sans Git)

1. **Télécharger le projet**
   - Sur GitHub : bouton **Code** → **Download ZIP**
2. **Extraire** le ZIP (ex: `cyber-aid-response-master.zip`)
3. Ouvrir un terminal **dans le dossier extrait**
   - Windows : clic droit dans le dossier → “Ouvrir dans le Terminal” / PowerShell
   - macOS/Linux : ouvrir un Terminal et `cd` dans le dossier
4. **Démarrer l’application**
   ```bash
   docker compose up -d --build

3. **Accéder à l'application**

   * [http://localhost:8080](http://localhost:8080)

---

## 💾 Données & Persistance

Toutes les données sont stockées localement dans le dossier `./data` monté dans le conteneur.

* **Chemin hôte** : `cyber-aid-response/data/`
* **Chemin conteneur** : `/data`
* **Fichier principal** : `session-v2.json`

### Sauvegarde

* Arrêter le conteneur
* Copier le dossier `data`

### Restauration

* Remplacer le dossier `data` par une sauvegarde existante
* Relancer le conteneur

---

## 🔄 Mise à jour

Pour mettre à jour l'application :

```bash
git pull
docker compose up -d --build
```

---

## 🛠 Configuration (optionnelle)

L'application peut être configurée via un fichier `.env` (voir `.env.example`).

Variables principales :

* `PORT` : Port d'écoute interne (défaut : 8080)
* `NODE_ENV` : `production` par défaut

> Si le port est modifié, adapter également la section `ports` du `docker-compose.yml`.

---

## 📴 Mode Offline / Air-Gap

L'application est **compatible avec un déploiement hors-ligne (air-gap)**.

### Conditions

* Docker et Docker Compose doivent être installés en amont

### Procédure

1. Cloner ou télécharger le dépôt sur une machine connectée
2. Copier le dossier complet sur la machine cible (clé USB, réseau interne)
3. Lancer l'application :

   ```bash
   docker compose up -d --build
   ```

Aucune connexion Internet n'est requise au runtime.

---

## 📦 Versioning

Les versions stables sont taguées sur GitHub.

* Version actuelle : **v1.0.0**

---

*Projet conçu pour des contextes de gestion de crise, exercices cyber et environnements sensibles.*
