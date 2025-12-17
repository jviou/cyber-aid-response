# Crisis Manager

Application de gestion de crise cybersécurité "Full Deployable".
Architecture monolithique autonome : Frontend (React) + Backend (Node.js) + Persistance JSON.

## 📋 Pré-requis

- **Docker** et **Docker Compose** installés sur la machine.
  - [Install Docker Desktop (Windows/Mac)](https://www.docker.com/products/docker-desktop/)
  - [Install Docker Engine (Linux)](https://docs.docker.com/engine/install/)

## 🚀 Installation & Démarrage

1. **Cloner le projet** :
   ```bash
   git clone <URL_DU_REPO>
   cd cyber-aid-response
   ```

2. **Démarrer l'application** :
   ```bash
   docker-compose up -d
   ```
   *L'image sera construite automatiquement au premier lancement.*

3. **Accéder à l'application** :
   Ouvrez [http://localhost:8080](http://localhost:8080) dans votre navigateur.

## 💾 Données & Persistance

Toutes les données sont stockées localement dans le dossier `./data` à la racine du projet.
Ce dossier est monté dans le conteneur (`/app/data`).

- **Emplacement** : `cyber-aid-response/data/`
- **Contenu** : `session-v2.json` (État complet de la session).
- **Sauvegarde** : Copiez simplement le dossier `data` ailleurs.
- **Restauration** : Remplacez le dossier `data` par une sauvegarde (conteneur arrêté).

## 🔄 Mise à jour

Pour récupérer la dernière version du code et redéployer :

```bash
git pull
docker-compose up -d --build
```

## 🛠 Configuration (Optionnel)

Vous pouvez configurer l'application via un fichier `.env` (voir `.env.example`) :

- `PORT` : Port d'écoute interne (Défaut 8080). Changez aussi `ports` dans `docker-compose.yml` si nécessaire.
- `NODE_ENV` : `production` par défaut.

## 🏗 Développement

Pour les développeurs souhaitant modifier le code :

```bash
npm install
npm run dev
```

---
*Généré automatiquement par CyberAid Deployment Helper*
