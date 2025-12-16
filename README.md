# Crisis Manager - Application de Gestion de Crise

Une application web robuste pour la gestion de crise cybersécurité en temps réel, conçue pour être déployée localement de manière autonome.

## Fonctionnalités Clés
- **Monolithique & Autonome** : Frontend et Backend unifiés en un seul conteneur Docker.
- **Temps Réel** : Synchronisation instantanée entre tous les clients connectés (WebSocket).
- **Persistante** : Les données sont sauvegardées localement et survivent aux redémarrages.
- **Modes** : Basculez entre un mode "Exercice" et "Réel".
- **Robuste** : Gestion automatique des erreurs, validation des données et interface résiliente.

---

## 🚀 Installation & Déploiement

Cette application est conçue pour être "Full Deployable" sur n'importe quelle machine équipée de Docker.

### 1. Prérequis
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/Mac) ou Docker Engine (Linux).
- C'est tout.

### 2. Démarrer l'application
Ouvrez un terminal dans le dossier du projet et lancez :

```bash
docker-compose up -d --build
```

- L'application sera accessible à l'adresse : **http://localhost:8080**
- Le port `8080` est le seul port à ouvrir.

### 3. Mettre à jour / Redémarrer
Pour mettre à jour l'application ou forcer un redémarrage propre :

```bash
docker-compose down
docker-compose up -d --build
```

---

## 💾 Données & Sauvegarde

Vos données sont **persistantes**.
Elles sont stockées dans le dossier `./data` situé à la racine du projet (sur votre machine hôte).

- Le fichier principal est `session-v2.json`.
- Ce dossier est "monté" dans le conteneur Docker.
- **Vous pouvez copier ce dossier** pour sauvegarder vos crises ou transférer l'état sur une autre machine.

---

## 🛠 Dépannage

### L'application ne charge pas les dernières modifications ?
Si vous avez fait une mise à jour mais que l'interface semble ancienne, forcez le rafraîchissement du cache navigateur :
- **Windows/Linux** : `Ctrl + F5`
- **Mac** : `Cmd + Shift + R`

### Réinitialiser la session ("Repartir à zéro")
Vous pouvez réinitialiser la session directement depuis l'interface (Menu Session -> Réinitialiser Tout).
En cas de problème grave, vous pouvez aussi :
1. Arrêter le conteneur : `docker-compose down`
2. Supprimer le fichier `data/session-v2.json`.
3. Redémarrer : `docker-compose up -d`

---

## 🏗 Architecture Technique
- **Serveur** : Node.js (Express + Socket.io) servant à la fois l'API et les fichiers statiques.
- **Frontend** : React + Vite + TailwindCSS.
- **Build** : Multi-stage Docker build (optimisé pour la production).
