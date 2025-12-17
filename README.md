![CI](https://github.com/jviou/cyber-aid-response/actions/workflows/ci.yml/badge.svg?branch=master)

# Crisis Manager

Application de gestion de crise cybersécurité **full déployable**, pensée pour des environnements sensibles.

Architecture **monolithique autonome** :

* Frontend (React)
* Backend (Node.js)
* Persistance locale (JSON)

Aucune dépendance cloud ou service externe au runtime.

---

## 📋 Pré-requis

* **Docker** et **Docker Compose** installés sur la machine

  * Windows / macOS : Docker Desktop
  * Linux : Docker Engine + Docker Compose plugin

---

## 🚀 Installation & Démarrage

1. **Cloner le projet**

   ```bash
   git clone https://github.com/jviou/cyber-aid-response.git
   cd cyber-aid-response
   ```

2. **Démarrer l'application**

   ```bash
   docker compose up -d --build
   ```

   > L'image Docker est construite localement lors du premier lancement.

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
